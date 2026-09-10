/**
 * DAVport - GUI server for the `webdav` library.
 *
 * A small, dependency-free HTTP server that:
 *   - serves the static frontend from ./public
 *   - exposes a JSON API for the remote (WebDAV) and local (filesystem) panes
 *   - runs a transfer queue with progress events pushed over Server-Sent Events
 *
 * It only ever binds to 127.0.0.1: it is a desktop-style tool, not a web service.
 */
import http from "node:http";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { fetch as baseFetch } from "@buttercup/fetch";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_ENTRY = path.resolve(__dirname, "../dist/node/index.js");

if (!fs.existsSync(DIST_ENTRY)) {
    console.error("A biblioteca ainda não foi compilada. Execute `npm run build:node` primeiro.");
    process.exit(1);
}

const { createClient, getPatcher } = await import(`file://${DIST_ENTRY.replace(/\\/g, "/")}`);

const HOST = "127.0.0.1";
const PORT = Number(process.env.WEBDAV_GUI_PORT || 8765);
const PUBLIC_DIR = path.join(__dirname, "public");
const CONFIG_DIR = path.join(os.homedir(), ".webdav-client-gui");
const SITES_FILE = path.join(CONFIG_DIR, "sites.json");
const MAX_LOG = 600;
const CONCURRENCY = 2;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const state = {
    client: null,
    site: null, // { url, username, authType }
    queue: [], // transfer items
    processing: false,
    log: [],
    nextId: 1
};

const sseClients = new Set();

function broadcast(event) {
    const payload = `data: ${JSON.stringify(event)}\n\n`;
    for (const res of sseClients) {
        res.write(payload);
    }
}

function log(level, text) {
    const entry = { level, text, ts: Date.now() };
    state.log.push(entry);
    if (state.log.length > MAX_LOG) state.log.splice(0, state.log.length - MAX_LOG);
    broadcast({ type: "log", entry });
}

function publicQueue() {
    return state.queue.map(item => ({
        id: item.id,
        direction: item.direction,
        local: item.local,
        remote: item.remote,
        size: item.size,
        loaded: item.loaded,
        status: item.status,
        error: item.error || null,
        startedAt: item.startedAt || null,
        finishedAt: item.finishedAt || null
    }));
}

function broadcastQueue() {
    broadcast({ type: "queue", queue: publicQueue(), processing: state.processing });
}

function connectionState() {
    return {
        connected: Boolean(state.client),
        site: state.site
            ? { url: state.site.url, username: state.site.username, authType: state.site.authType }
            : null
    };
}

// Log every HTTP exchange the library performs (FileZilla-style Command/Response lines).
getPatcher().patch("fetch", async (url, opts = {}) => {
    const method = opts.method || "GET";
    let shown = url;
    try {
        const u = new URL(url);
        shown = decodeURIComponent(u.pathname) + u.search;
    } catch (_) {}
    log("command", `${method} ${shown}`);
    const response = await baseFetch(url, opts);
    // Every response is logged as a response; failing operations add their own "error" line.
    log("response", `${response.status} ${response.statusText || ""}`.trim());
    return response;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

class HttpError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

function requireClient() {
    if (!state.client) throw new HttpError(409, "Não conectado a nenhum servidor.");
    return state.client;
}

function posixJoin(...parts) {
    const joined = parts.filter(Boolean).join("/").replace(/\/+/g, "/");
    return joined.startsWith("/") ? joined : `/${joined}`;
}

function posixDirname(p) {
    const trimmed = p.replace(/\/+$/, "");
    const idx = trimmed.lastIndexOf("/");
    if (idx <= 0) return "/";
    return trimmed.slice(0, idx);
}

function posixBasename(p) {
    return p.replace(/\/+$/, "").split("/").pop();
}

function errorMessage(err) {
    if (!err) return "Erro desconhecido";
    if (err instanceof HttpError) return err.message;
    if (err.status) return `${err.message} (HTTP ${err.status})`;
    return err.message || String(err);
}

async function readJSON(req) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    if (!chunks.length) return {};
    try {
        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch (_) {
        throw new HttpError(400, "Corpo JSON inválido");
    }
}

function sendJSON(res, status, body) {
    const data = JSON.stringify(body);
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    });
    res.end(data);
}

function openWithOS(target) {
    let child;
    if (process.platform === "win32") {
        child = spawn("cmd", ["/c", "start", "", target], { detached: true, stdio: "ignore" });
    } else if (process.platform === "darwin") {
        child = spawn("open", [target], { detached: true, stdio: "ignore" });
    } else {
        child = spawn("xdg-open", [target], { detached: true, stdio: "ignore" });
    }
    child.on("error", () => {});
    child.unref();
}

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/x-icon"
};

async function serveStatic(res, pathname) {
    let file = pathname === "/" ? "/index.html" : pathname;
    file = path.normalize(file).replace(/^(\.\.[/\\])+/, "");
    const full = path.join(PUBLIC_DIR, file);
    if (!full.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        return res.end();
    }
    try {
        const data = await fsp.readFile(full);
        res.writeHead(200, {
            "Content-Type": MIME[path.extname(full)] || "application/octet-stream",
            "Cache-Control": "no-cache"
        });
        res.end(data);
    } catch (_) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
    }
}

// ---------------------------------------------------------------------------
// Sites (Site Manager storage)
// ---------------------------------------------------------------------------

async function loadSites() {
    try {
        const raw = await fsp.readFile(SITES_FILE, "utf8");
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
        return [];
    }
}

async function saveSites(sites) {
    await fsp.mkdir(CONFIG_DIR, { recursive: true });
    await fsp.writeFile(SITES_FILE, JSON.stringify(sites, null, 2), "utf8");
}

// ---------------------------------------------------------------------------
// Local filesystem pane
// ---------------------------------------------------------------------------

async function localRoots() {
    const roots = [];
    if (process.platform === "win32") {
        for (let i = 65; i <= 90; i += 1) {
            const drive = `${String.fromCharCode(i)}:\\`;
            try {
                await fsp.access(drive);
                roots.push({ name: drive, path: drive, kind: "drive" });
            } catch (_) {}
        }
    } else {
        roots.push({ name: "/", path: "/", kind: "drive" });
    }
    const home = os.homedir();
    roots.push({ name: "Pasta pessoal", path: home, kind: "home" });
    for (const sub of ["Desktop", "Documents", "Downloads", "Documentos"]) {
        const p = path.join(home, sub);
        try {
            const st = await fsp.stat(p);
            if (st.isDirectory()) roots.push({ name: sub, path: p, kind: "folder" });
        } catch (_) {}
    }
    return roots;
}

async function localList(dir) {
    const target = dir ? path.resolve(dir) : os.homedir();
    const st = await fsp.stat(target).catch(() => null);
    if (!st || !st.isDirectory()) throw new HttpError(404, `Diretório não encontrado: ${target}`);
    const dirents = await fsp.readdir(target, { withFileTypes: true });
    const entries = [];
    for (const d of dirents) {
        const full = path.join(target, d.name);
        try {
            const s = await fsp.stat(full);
            entries.push({
                name: d.name,
                path: full,
                type: s.isDirectory() ? "directory" : "file",
                size: s.isDirectory() ? 0 : s.size,
                mtime: s.mtime.toISOString()
            });
        } catch (_) {
            // Unreadable entry (permissions, broken link) - show it without details.
            entries.push({
                name: d.name,
                path: full,
                type: d.isDirectory() ? "directory" : "file",
                size: 0,
                mtime: null,
                unreadable: true
            });
        }
    }
    const parent = path.dirname(target);
    return { path: target, parent: parent === target ? null : parent, entries };
}

async function localWalk(dir, base) {
    const out = [];
    const dirents = await fsp.readdir(dir, { withFileTypes: true });
    for (const d of dirents) {
        const full = path.join(dir, d.name);
        const rel = path.relative(base, full).split(path.sep).join("/");
        if (d.isDirectory()) {
            out.push({ type: "directory", path: full, rel });
            out.push(...(await localWalk(full, base)));
        } else if (d.isFile()) {
            const s = await fsp.stat(full);
            out.push({ type: "file", path: full, rel, size: s.size });
        }
    }
    return out;
}

// ---------------------------------------------------------------------------
// Remote pane
// ---------------------------------------------------------------------------

function mapRemote(stat) {
    return {
        name: stat.basename,
        path: stat.filename,
        type: stat.type,
        size: stat.type === "directory" ? 0 : stat.size,
        mtime: stat.lastmod ? new Date(stat.lastmod).toISOString() : null,
        mime: stat.mime || null,
        etag: stat.etag || null
    };
}

async function remoteList(dir) {
    const client = requireClient();
    const target = dir && dir !== "" ? dir : "/";
    const contents = await client.getDirectoryContents(target);
    return {
        path: target,
        parent: target === "/" ? null : posixDirname(target),
        entries: contents.map(mapRemote)
    };
}

// ---------------------------------------------------------------------------
// Transfer queue
// ---------------------------------------------------------------------------

function addQueueItem(direction, local, remote, size) {
    const item = {
        id: state.nextId++,
        direction, // "download" | "upload"
        local,
        remote,
        size: size || 0,
        loaded: 0,
        status: "queued",
        error: null,
        abort: null
    };
    state.queue.push(item);
    return item;
}

/**
 * Expand a set of selections into concrete file transfers. Directories are
 * walked (locally via fs, remotely via a deep PROPFIND) and mirrored on the
 * other side; empty directories are created immediately.
 */
async function enqueue(items) {
    const client = requireClient();
    const ensuredRemote = new Set();
    let added = 0;
    for (const sel of items) {
        if (sel.direction === "download") {
            if (sel.type === "directory") {
                const rootName = posixBasename(sel.remote);
                const localRoot = path.join(sel.localDir, rootName);
                await fsp.mkdir(localRoot, { recursive: true });
                log("status", `Listando diretório remoto ${sel.remote} recursivamente…`);
                const children = await client.getDirectoryContents(sel.remote, { deep: true });
                for (const child of children) {
                    const rel = child.filename.slice(sel.remote.length).replace(/^\/+/, "");
                    const localPath = path.join(localRoot, ...rel.split("/"));
                    if (child.type === "directory") {
                        await fsp.mkdir(localPath, { recursive: true });
                    } else {
                        addQueueItem("download", localPath, child.filename, child.size);
                        added += 1;
                    }
                }
            } else {
                const localPath = path.join(sel.localDir, posixBasename(sel.remote));
                addQueueItem("download", localPath, sel.remote, sel.size);
                added += 1;
            }
        } else if (sel.direction === "upload") {
            const st = await fsp.stat(sel.local);
            if (st.isDirectory()) {
                const rootName = path.basename(sel.local);
                const remoteRoot = posixJoin(sel.remoteDir, rootName);
                if (!ensuredRemote.has(remoteRoot)) {
                    await client.createDirectory(remoteRoot, { recursive: true });
                    ensuredRemote.add(remoteRoot);
                }
                const walked = await localWalk(sel.local, sel.local);
                for (const entry of walked) {
                    const remotePath = posixJoin(remoteRoot, entry.rel);
                    if (entry.type === "directory") {
                        if (!ensuredRemote.has(remotePath)) {
                            await client.createDirectory(remotePath, { recursive: true });
                            ensuredRemote.add(remotePath);
                        }
                    } else {
                        addQueueItem("upload", entry.path, remotePath, entry.size);
                        added += 1;
                    }
                }
            } else {
                const remotePath = posixJoin(sel.remoteDir, path.basename(sel.local));
                addQueueItem("upload", sel.local, remotePath, st.size);
                added += 1;
            }
        }
    }
    broadcastQueue();
    return added;
}

let progressTimer = null;
function scheduleProgress() {
    if (progressTimer) return;
    progressTimer = setTimeout(() => {
        progressTimer = null;
        const active = state.queue.filter(i => i.status === "active");
        if (active.length) {
            broadcast({
                type: "progress",
                items: active.map(i => ({ id: i.id, loaded: i.loaded, size: i.size }))
            });
        }
    }, 150);
}

async function runDownload(item, client) {
    await fsp.mkdir(path.dirname(item.local), { recursive: true });
    const controller = new AbortController();
    item.abort = controller;
    await new Promise((resolve, reject) => {
        const rs = client.createReadStream(item.remote, {
            signal: controller.signal,
            callback: response => {
                // Fill in the size when the caller did not know it (progress bar needs a total).
                const len = Number(response.headers.get("content-length"));
                if (len > 0 && !item.size) item.size = len;
            }
        });
        const ws = fs.createWriteStream(item.local);
        rs.on("data", chunk => {
            item.loaded += chunk.length;
            scheduleProgress();
        });
        rs.on("error", err => {
            ws.destroy();
            reject(err);
        });
        ws.on("error", reject);
        ws.on("finish", resolve);
        rs.pipe(ws);
    });
}

async function runUpload(item, client) {
    const st = await fsp.stat(item.local);
    item.size = st.size;
    const controller = new AbortController();
    item.abort = controller;
    const rs = fs.createReadStream(item.local);
    rs.on("data", chunk => {
        item.loaded += chunk.length;
        scheduleProgress();
    });
    await client.putFileContents(item.remote, rs, {
        contentLength: st.size,
        overwrite: true,
        signal: controller.signal
    });
}

function wasAborted(item) {
    return Boolean(item.abort && item.abort.signal.aborted);
}

async function transferWorker() {
    for (;;) {
        if (!state.processing) return;
        const item = state.queue.find(q => q.status === "queued");
        if (!item) return;
        const client = state.client;
        if (!client) {
            item.status = "failed";
            item.error = "Desconectado";
            continue;
        }
        item.status = "active";
        item.loaded = 0;
        item.error = null;
        item.startedAt = Date.now();
        broadcastQueue();
        const isDownload = item.direction === "download";
        log(
            "status",
            `${isDownload ? "Baixando" : "Enviando"} ${isDownload ? item.remote : item.local}`
        );
        try {
            if (isDownload) await runDownload(item, client);
            else await runUpload(item, client);
            item.status = "done";
            item.loaded = item.size;
            item.finishedAt = Date.now();
            log("status", `Transferência concluída: ${isDownload ? item.local : item.remote}`);
        } catch (err) {
            item.status = "failed";
            item.error = wasAborted(item) ? "Cancelado" : errorMessage(err);
            item.finishedAt = Date.now();
            log("error", `Falha na transferência: ${item.error}`);
        } finally {
            item.abort = null;
        }
        broadcastQueue();
    }
}

async function processQueue() {
    if (state.processing) return;
    state.processing = true;
    broadcastQueue();
    const workers = [];
    for (let i = 0; i < CONCURRENCY; i += 1) workers.push(transferWorker());
    await Promise.all(workers);
    state.processing = false;
    broadcastQueue();
}

function stopQueue() {
    state.processing = false;
    for (const item of state.queue) {
        if (item.status === "active" && item.abort) item.abort.abort();
    }
}

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------

const routes = {
    "GET /api/state": async () => ({
        ...connectionState(),
        queue: publicQueue(),
        processing: state.processing,
        log: state.log,
        platform: process.platform,
        home: os.homedir(),
        sep: path.sep
    }),

    "POST /api/connect": async body => {
        const { url, username, password, authType, token } = body;
        if (!url) throw new HttpError(400, "Informe o endereço do servidor.");
        let fullURL = url.trim();
        if (!/^https?:\/\//i.test(fullURL)) fullURL = `https://${fullURL}`;
        if (body.port) {
            const u = new URL(fullURL);
            u.port = String(body.port);
            fullURL = u.toString();
        }
        const options = {};
        if (authType && authType !== "auto") options.authType = authType;
        else if (username || password) options.authType = "auto";
        if (username) options.username = username;
        if (password) options.password = password;
        if (token) options.token = { access_token: token, token_type: "Bearer" };
        log("status", `Conectando a ${fullURL}…`);
        const client = createClient(fullURL, options);
        try {
            const root = await client.getDirectoryContents("/");
            state.client = client;
            state.site = {
                url: fullURL,
                username: username || "",
                authType: options.authType || "none"
            };
            log("status", "Conectado. Listando diretório raiz…");
            log("status", "Listagem de diretório concluída.");
            broadcast({ type: "state", ...connectionState() });
            let compliance = null;
            try {
                compliance = await client.getDAVCompliance("/");
                if (compliance && compliance.server)
                    log("status", `Servidor: ${compliance.server}`);
            } catch (_) {}
            return {
                ...connectionState(),
                root: { path: "/", parent: null, entries: root.map(mapRemote) },
                compliance
            };
        } catch (err) {
            log("error", `Não foi possível conectar: ${errorMessage(err)}`);
            throw new HttpError(502, errorMessage(err));
        }
    },

    "POST /api/disconnect": async () => {
        stopQueue();
        state.client = null;
        state.site = null;
        log("status", "Desconectado do servidor.");
        broadcast({ type: "state", ...connectionState() });
        return connectionState();
    },

    "GET /api/remote/list": async (_body, query) => {
        const result = await remoteList(query.get("path") || "/");
        log("status", `Listagem de ${result.path} concluída.`);
        return result;
    },

    "GET /api/remote/quota": async () => {
        const client = requireClient();
        const quota = await client.getQuota();
        return { quota };
    },

    "POST /api/remote/mkdir": async body => {
        const client = requireClient();
        await client.createDirectory(body.path);
        log("status", `Diretório criado: ${body.path}`);
        return { ok: true };
    },

    "POST /api/remote/delete": async body => {
        const client = requireClient();
        for (const p of body.paths || []) {
            await client.deleteFile(p);
            log("status", `Removido: ${p}`);
        }
        return { ok: true };
    },

    "POST /api/remote/rename": async body => {
        const client = requireClient();
        await client.moveFile(body.from, body.to);
        log("status", `Renomeado ${body.from} → ${body.to}`);
        return { ok: true };
    },

    "GET /api/local/roots": async () => ({ roots: await localRoots() }),

    "GET /api/local/list": async (_body, query) => localList(query.get("path") || ""),

    "POST /api/local/mkdir": async body => {
        await fsp.mkdir(body.path, { recursive: false });
        return { ok: true };
    },

    "POST /api/local/delete": async body => {
        for (const p of body.paths || []) {
            await fsp.rm(p, { recursive: true, force: false });
        }
        return { ok: true };
    },

    "POST /api/local/rename": async body => {
        await fsp.rename(body.from, body.to);
        return { ok: true };
    },

    "POST /api/local/open": async body => {
        openWithOS(body.path);
        return { ok: true };
    },

    "GET /api/sites": async () => ({ sites: await loadSites() }),

    "PUT /api/sites": async body => {
        await saveSites(Array.isArray(body.sites) ? body.sites : []);
        return { ok: true };
    },

    "POST /api/queue/add": async body => {
        const added = await enqueue(body.items || []);
        log("status", `${added} arquivo(s) adicionado(s) à fila.`);
        if (body.process) processQueue();
        return { added, queue: publicQueue() };
    },

    "POST /api/queue/process": async () => {
        processQueue();
        return { ok: true };
    },

    "POST /api/queue/stop": async () => {
        stopQueue();
        return { ok: true };
    },

    "POST /api/queue/remove": async body => {
        const ids = new Set(body.ids || []);
        state.queue = state.queue.filter(item => {
            if (!ids.has(item.id)) return true;
            if (item.status === "active" && item.abort) item.abort.abort();
            return false;
        });
        broadcastQueue();
        return { ok: true };
    },

    "POST /api/queue/clear": async body => {
        const statuses = new Set(body.statuses || ["done", "failed", "queued"]);
        state.queue = state.queue.filter(item => !statuses.has(item.status));
        broadcastQueue();
        return { ok: true };
    },

    "POST /api/queue/retry": async () => {
        for (const item of state.queue) {
            if (item.status === "failed") {
                item.status = "queued";
                item.loaded = 0;
                item.error = null;
            }
        }
        broadcastQueue();
        processQueue();
        return { ok: true };
    }
};

function handleEvents(req, res) {
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
    });
    const hello = {
        type: "hello",
        ...connectionState(),
        queue: publicQueue(),
        processing: state.processing
    };
    res.write(`data: ${JSON.stringify(hello)}\n\n`);
    sseClients.add(res);
    const ping = setInterval(() => res.write(": ping\n\n"), 25000);
    req.on("close", () => {
        clearInterval(ping);
        sseClients.delete(res);
    });
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/api/events") return handleEvents(req, res);
    if (url.pathname.startsWith("/api/")) {
        const key = `${req.method} ${url.pathname}`;
        const handler = routes[key];
        if (!handler) return sendJSON(res, 404, { error: "Rota não encontrada" });
        try {
            const body = req.method === "GET" ? {} : await readJSON(req);
            const result = await handler(body, url.searchParams);
            sendJSON(res, 200, result);
        } catch (err) {
            const status = err instanceof HttpError ? err.status : 500;
            if (!(err instanceof HttpError)) log("error", errorMessage(err));
            sendJSON(res, status, { error: errorMessage(err) });
        }
        return;
    }
    return serveStatic(res, url.pathname);
});

server.listen(PORT, HOST, () => {
    const address = `http://${HOST}:${PORT}`;
    console.log(`DAVport disponível em ${address}`);
    if (process.env.WEBDAV_GUI_NO_OPEN !== "1") openWithOS(address);
});
