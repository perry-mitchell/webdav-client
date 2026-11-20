/* DAVport - frontend. Plain ES module, no build step. */

// ---------------------------------------------------------------- utilities
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const nf = new Intl.NumberFormat("pt-BR");

const api = {
    async req(method, url, body) {
        const init = { method, headers: {} };
        if (body !== undefined) {
            init.headers["Content-Type"] = "application/json";
            init.body = JSON.stringify(body);
        }
        const res = await fetch(url, init);
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || res.statusText);
        return json;
    },
    get: url => api.req("GET", url),
    post: (url, body = {}) => api.req("POST", url, body),
    put: (url, body = {}) => api.req("PUT", url, body)
};

const store = {
    get(key, fallback) {
        try {
            const raw = localStorage.getItem(`davport.${key}`);
            return raw === null ? fallback : JSON.parse(raw);
        } catch (_) {
            return fallback;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(`davport.${key}`, JSON.stringify(value));
        } catch (_) {}
    }
};

function esc(s) {
    return String(s ?? "").replace(
        /[&<>"']/g,
        c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
    );
}

function fmtSize(bytes) {
    if (bytes === null || bytes === undefined) return "";
    if (bytes < 1024) return `${nf.format(bytes)} B`;
    const units = ["KB", "MB", "GB", "TB"];
    let v = bytes;
    let i = -1;
    do {
        v /= 1024;
        i += 1;
    } while (v >= 1024 && i < units.length - 1);
    return `${v.toLocaleString("pt-BR", { maximumFractionDigits: v < 10 ? 2 : 1 })} ${units[i]}`;
}

function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function fileType(entry) {
    if (entry.type === "directory") return "Pasta de arquivos";
    const m = /\.([^.]+)$/.exec(entry.name);
    return m ? `Arquivo ${m[1].toUpperCase()}` : "Arquivo";
}

function plural(n, one, many) {
    return `${nf.format(n)} ${n === 1 ? one : many}`;
}

function posixJoin(dir, name) {
    const base = dir.replace(/\/+$/, "");
    return `${base}/${name}`.replace(/\/+/g, "/") || "/";
}

function icon(id, cls = "") {
    return `<svg class="${cls}"><use href="#${id}"/></svg>`;
}

let toastTimer = null;
function toast(message, kind = "error") {
    let el = $(".toast");
    if (!el) {
        el = document.createElement("div");
        el.className = "toast";
        document.body.appendChild(el);
    }
    el.className = `toast ${kind}`;
    el.textContent = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.remove(), 5000);
}

// ---------------------------------------------------------------- app state
const app = {
    connected: false,
    site: null,
    platform: "win32",
    sep: "\\",
    home: "",
    queue: [],
    processing: false,
    lastConn: null,
    activePane: "local",
    tab: "queued",
    queueSel: new Set(),
    speed: new Map() // id -> { t, loaded, bps }
};

// ---------------------------------------------------------------- dialogs
function promptDialog({ title, label, value = "", text = "", okLabel = "OK", withInput = true }) {
    const dlg = $("#dlg-prompt");
    $("#prompt-title").textContent = title;
    $("#prompt-label").textContent = label || "";
    $("#prompt-label").classList.toggle("hidden", !withInput);
    const input = $("#prompt-input");
    input.classList.toggle("hidden", !withInput);
    input.value = value;
    $("#prompt-text").textContent = text;
    $("#prompt-ok").textContent = okLabel;
    return new Promise(resolve => {
        const onClose = () => {
            dlg.removeEventListener("close", onClose);
            resolve(dlg.returnValue === "ok" ? (withInput ? input.value : true) : null);
        };
        dlg.addEventListener("close", onClose);
        dlg.returnValue = "cancel";
        dlg.showModal();
        if (withInput) {
            input.focus();
            const dot = value.lastIndexOf(".");
            input.setSelectionRange(0, dot > 0 ? dot : value.length);
        }
    });
}

const confirmDialog = (title, text, okLabel = "Excluir") =>
    promptDialog({ title, text, okLabel, withInput: false }).then(Boolean);

// ---------------------------------------------------------------- message log
const logBody = $("#log-body");
const LEVEL_LABEL = {
    status: "Status:",
    command: "Comando:",
    response: "Resposta:",
    error: "Erro:"
};

function appendLog(entry) {
    const atBottom = logBody.scrollHeight - logBody.scrollTop - logBody.clientHeight < 30;
    const line = document.createElement("div");
    line.className = `log-line ${entry.level}`;
    line.innerHTML = `<span class="lv">${LEVEL_LABEL[entry.level] || entry.level}</span><span class="tx">${esc(entry.text)}</span>`;
    logBody.appendChild(line);
    while (logBody.childElementCount > 600) logBody.firstElementChild.remove();
    if (atBottom) logBody.scrollTop = logBody.scrollHeight;
}

// ---------------------------------------------------------------- panes
class Pane {
    constructor(kind) {
        this.kind = kind;
        this.el = $(`#pane-${kind}`);
        this.listEl = $(`#${kind}-list`);
        this.tbody = this.listEl.querySelector("tbody");
        this.emptyEl = this.listEl.querySelector(".list-empty");
        this.treeEl = $(`#${kind}-tree`);
        this.pathInput = $(`#${kind}-path`);
        this.statusEl = $(`#${kind}-status`);
        this.path = null;
        this.parent = null;
        this.entries = [];
        this.selected = new Set();
        this.anchor = null;
        this.sort = { key: "name", dir: 1 };
        this.treeRoots = [];
        this.selectedTreeNode = null;
        this.bind();
    }

    get isRemote() {
        return this.kind === "remote";
    }

    get other() {
        return this.isRemote ? panes.local : panes.remote;
    }

    join(dir, name) {
        if (this.isRemote) return posixJoin(dir, name);
        return dir.endsWith(app.sep) ? dir + name : dir + app.sep + name;
    }

    samePath(a, b) {
        if (this.isRemote || app.platform !== "win32") return a === b;
        return a.toLowerCase() === b.toLowerCase();
    }

    isAncestor(ancestor, target) {
        let a = ancestor;
        let t = target;
        if (!this.isRemote && app.platform === "win32") {
            a = a.toLowerCase();
            t = t.toLowerCase();
        }
        if (a === t) return true;
        const sep = this.isRemote ? "/" : app.sep;
        const base = a.endsWith(sep) ? a : a + sep;
        return t.startsWith(base);
    }

    // ---- loading / rendering
    async load(path, { silent = false } = {}) {
        if (this.isRemote && !app.connected) return;
        const url = this.isRemote
            ? `/api/remote/list?path=${encodeURIComponent(path || "/")}`
            : `/api/local/list?path=${encodeURIComponent(path || "")}`;
        try {
            const data = await api.get(url);
            this.path = data.path;
            this.parent = data.parent;
            this.entries = data.entries;
            this.selected.clear();
            this.anchor = null;
            this.pathInput.value = data.path;
            this.render();
            if (!this.isRemote) store.set("localPath", data.path);
            this.revealInTree(data.path);
        } catch (err) {
            if (!silent) toast(err.message);
            this.pathInput.value = this.path || "";
        }
    }

    async refresh() {
        if (this.path) {
            const keep = new Set(this.selected);
            await this.load(this.path);
            this.selected = new Set([...keep].filter(p => this.entries.some(e => e.path === p)));
            this.renderSelection();
        }
    }

    clear(message) {
        this.path = null;
        this.parent = null;
        this.entries = [];
        this.selected.clear();
        this.pathInput.value = "";
        this.tbody.innerHTML = "";
        this.emptyEl.textContent = message;
        this.emptyEl.classList.remove("hidden");
        this.statusEl.textContent = "";
        this.treeEl.innerHTML = "";
        this.treeRoots = [];
    }

    sortedEntries() {
        const { key, dir } = this.sort;
        const collator = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" });
        return [...this.entries].sort((a, b) => {
            if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
            let r = 0;
            if (key === "name") r = collator.compare(a.name, b.name);
            else if (key === "size") r = (a.size || 0) - (b.size || 0);
            else if (key === "type")
                r = collator.compare(fileType(a), fileType(b)) || collator.compare(a.name, b.name);
            else if (key === "mtime") r = (a.mtime || "").localeCompare(b.mtime || "");
            if (r === 0) r = collator.compare(a.name, b.name);
            return r * dir;
        });
    }

    render() {
        const rows = [];
        if (this.parent !== null && this.parent !== undefined) {
            rows.push(
                `<tr class="updir" data-updir="1" draggable="false"><td class="name">${icon("i-folder")}<span>..</span></td><td class="num"></td><td></td><td></td></tr>`
            );
        }
        for (const e of this.sortedEntries()) {
            const sel = this.selected.has(e.path) ? " selected" : "";
            const unreadable = e.unreadable ? " unreadable" : "";
            rows.push(
                `<tr data-path="${esc(e.path)}" class="${e.type}${sel}${unreadable}" draggable="true">` +
                    `<td class="name">${icon(e.type === "directory" ? "i-folder" : "i-file")}<span title="${esc(e.name)}">${esc(e.name)}</span></td>` +
                    `<td class="num">${e.type === "directory" ? "" : fmtSize(e.size)}</td>` +
                    `<td>${fileType(e)}</td>` +
                    `<td>${fmtDate(e.mtime)}</td></tr>`
            );
        }
        this.tbody.innerHTML = rows.join("");
        this.emptyEl.textContent = "Diretório vazio";
        this.emptyEl.classList.toggle("hidden", this.entries.length > 0);
        this.renderStatus();
        this.renderSortHeader();
    }

    renderSortHeader() {
        for (const th of this.listEl.querySelectorAll("th[data-sort]")) {
            const active = th.dataset.sort === this.sort.key;
            th.classList.toggle("sorted", active);
            th.classList.toggle("desc", active && this.sort.dir < 0);
            th.classList.toggle("asc", active && this.sort.dir > 0);
        }
    }

    renderSelection() {
        for (const tr of this.tbody.querySelectorAll("tr[data-path]")) {
            tr.classList.toggle("selected", this.selected.has(tr.dataset.path));
        }
        this.renderStatus();
    }

    renderStatus() {
        const count = list => {
            let files = 0;
            let dirs = 0;
            let bytes = 0;
            for (const e of list) {
                if (e.type === "directory") dirs += 1;
                else {
                    files += 1;
                    bytes += e.size || 0;
                }
            }
            return { files, dirs, bytes };
        };
        const parts = [];
        if (this.selected.size) {
            const c = count(this.selectedEntries());
            const bits = [];
            if (c.files) bits.push(plural(c.files, "arquivo", "arquivos"));
            if (c.dirs) bits.push(plural(c.dirs, "diretório", "diretórios"));
            parts.push(`Selecionado: ${bits.join(" e ")}.`);
            if (c.files) parts.push(`Tamanho total: ${fmtSize(c.bytes)}`);
        } else {
            const c = count(this.entries);
            const bits = [];
            if (c.files) bits.push(plural(c.files, "arquivo", "arquivos"));
            if (c.dirs) bits.push(plural(c.dirs, "diretório", "diretórios"));
            parts.push(bits.length ? `${bits.join(" e ")}.` : "Diretório vazio.");
            if (c.files) parts.push(`Tamanho total: ${fmtSize(c.bytes)}`);
        }
        this.statusEl.textContent = parts.join(" ");
    }

    // ---- selection
    selectedEntries() {
        return this.entries.filter(e => this.selected.has(e.path));
    }

    entryByPath(p) {
        return this.entries.find(e => e.path === p);
    }

    visibleRows() {
        return Array.from(this.tbody.querySelectorAll("tr[data-path]"));
    }

    selectRow(tr, ev) {
        const path = tr.dataset.path;
        if (ev && ev.shiftKey && this.anchor) {
            const rows = this.visibleRows().map(r => r.dataset.path);
            const a = rows.indexOf(this.anchor);
            const b = rows.indexOf(path);
            if (a >= 0 && b >= 0) {
                if (!ev.ctrlKey) this.selected.clear();
                for (let i = Math.min(a, b); i <= Math.max(a, b); i += 1)
                    this.selected.add(rows[i]);
            }
        } else if (ev && (ev.ctrlKey || ev.metaKey)) {
            if (this.selected.has(path)) this.selected.delete(path);
            else this.selected.add(path);
            this.anchor = path;
        } else {
            this.selected.clear();
            this.selected.add(path);
            this.anchor = path;
        }
        this.renderSelection();
    }

    selectAll() {
        for (const e of this.entries) this.selected.add(e.path);
        this.renderSelection();
    }

    moveCursor(delta, ev) {
        const rows = this.visibleRows();
        if (!rows.length) return;
        let idx = rows.findIndex(r => r.dataset.path === this.anchor);
        idx = Math.max(0, Math.min(rows.length - 1, idx + delta));
        const tr = rows[idx];
        if (ev.shiftKey) {
            this.selected.add(tr.dataset.path);
            this.anchor = tr.dataset.path;
            this.renderSelection();
        } else {
            this.selectRow(tr, null);
        }
        tr.scrollIntoView({ block: "nearest" });
    }

    // ---- actions
    async open(entry) {
        if (entry.type === "directory") await this.load(entry.path);
        else await transfer(this, [entry], true);
    }

    async up() {
        if (this.parent) await this.load(this.parent);
        else if (!this.isRemote) this.loadRootsView();
    }

    async loadRootsView() {
        // Show the drive list as a pseudo-directory (Windows only has no single root).
        if (app.platform !== "win32") return;
        const { roots } = await api.get("/api/local/roots");
        this.path = "";
        this.parent = null;
        this.entries = roots
            .filter(r => r.kind === "drive")
            .map(r => ({ name: r.path, path: r.path, type: "directory", size: 0, mtime: null }));
        this.selected.clear();
        this.pathInput.value = "Este computador";
        this.render();
    }

    async mkdir(enter = false) {
        if (!this.path) return;
        const name = await promptDialog({
            title: "Criar diretório",
            label: "Digite o nome do novo diretório:",
            value: "Nova pasta"
        });
        if (!name) return;
        const full = this.join(this.path, name);
        try {
            await api.post(this.isRemote ? "/api/remote/mkdir" : "/api/local/mkdir", {
                path: full
            });
            await (enter ? this.load(full) : this.refresh());
            this.revealInTree(this.path, true);
        } catch (err) {
            toast(err.message);
        }
    }

    async rename() {
        const [entry] = this.selectedEntries();
        if (!entry) return;
        const name = await promptDialog({
            title: "Renomear",
            label: "Novo nome:",
            value: entry.name
        });
        if (!name || name === entry.name) return;
        try {
            await api.post(this.isRemote ? "/api/remote/rename" : "/api/local/rename", {
                from: entry.path,
                to: this.join(this.path, name)
            });
            await this.refresh();
        } catch (err) {
            toast(err.message);
        }
    }

    async remove() {
        const entries = this.selectedEntries();
        if (!entries.length) return;
        const where = this.isRemote ? "do servidor" : "do disco local";
        const text =
            entries.length === 1
                ? `"${entries[0].name}" será excluído ${where}. Esta ação não pode ser desfeita.`
                : `${entries.length} itens serão excluídos ${where}. Esta ação não pode ser desfeita.`;
        if (!(await confirmDialog("Confirmar exclusão", text))) return;
        try {
            await api.post(this.isRemote ? "/api/remote/delete" : "/api/local/delete", {
                paths: entries.map(e => e.path)
            });
        } catch (err) {
            toast(err.message);
        }
        await this.refresh();
        this.revealInTree(this.path, true);
    }

    async openWithOS() {
        const [entry] = this.selectedEntries();
        if (!entry || this.isRemote) return;
        await api.post("/api/local/open", { path: entry.path }).catch(err => toast(err.message));
    }

    copyURL() {
        const [entry] = this.selectedEntries();
        if (!app.site) return;
        const target = entry ? entry.path : this.path;
        const url =
            app.site.url.replace(/\/+$/, "") + target.split("/").map(encodeURIComponent).join("/");
        navigator.clipboard
            .writeText(url)
            .then(() => toast("URL copiada para a área de transferência.", "info"));
    }

    contextItems() {
        const sel = this.selectedEntries();
        const one = sel.length === 1;
        const any = sel.length > 0;
        const connected = app.connected;
        const items = [];
        if (this.isRemote) {
            items.push({
                label: "Baixar",
                strong: true,
                icon: "i-download",
                enabled: any,
                action: () => transfer(this, sel, true)
            });
            items.push({
                label: "Adicionar arquivos à fila",
                enabled: any,
                action: () => transfer(this, sel, false)
            });
        } else {
            items.push({
                label: "Enviar",
                strong: true,
                icon: "i-upload",
                enabled: any && connected,
                action: () => transfer(this, sel, true)
            });
            items.push({
                label: "Adicionar arquivos à fila",
                enabled: any && connected,
                action: () => transfer(this, sel, false)
            });
            items.push({ label: "Abrir", enabled: one, action: () => this.openWithOS() });
        }
        items.push({ sep: true });
        items.push({
            label: "Criar diretório",
            icon: "i-mkdir",
            enabled: Boolean(this.path),
            action: () => this.mkdir(false)
        });
        items.push({
            label: "Criar diretório e entrar nele",
            enabled: Boolean(this.path),
            action: () => this.mkdir(true)
        });
        items.push({
            label: "Atualizar",
            icon: "i-refresh",
            sc: "F5",
            action: () => this.refresh()
        });
        items.push({ sep: true });
        items.push({ label: "Excluir", enabled: any, sc: "Del", action: () => this.remove() });
        items.push({ label: "Renomear", enabled: one, sc: "F2", action: () => this.rename() });
        if (this.isRemote) {
            items.push({ sep: true });
            items.push({
                label: "Copiar URL para a área de transferência",
                enabled: connected,
                action: () => this.copyURL()
            });
        }
        return items;
    }

    // ---- tree
    async loadTree() {
        this.treeEl.innerHTML = "";
        this.treeRoots = [];
        if (this.isRemote) {
            if (!app.connected) return;
            this.treeRoots = [
                {
                    name: app.site ? new URL(app.site.url).host : "/",
                    path: "/",
                    icon: "i-drive",
                    children: null,
                    expanded: false
                }
            ];
        } else {
            const { roots } = await api.get("/api/local/roots");
            this.treeRoots = roots.map(r => ({
                name: r.name,
                path: r.path,
                icon: r.kind === "drive" ? "i-drive" : r.kind === "home" ? "i-home" : "i-folder",
                children: null,
                expanded: false
            }));
        }
        const ul = document.createElement("ul");
        for (const node of this.treeRoots) ul.appendChild(this.buildNode(node));
        this.treeEl.appendChild(ul);
    }

    buildNode(node) {
        const li = document.createElement("li");
        li.className = "collapsed";
        const row = document.createElement("div");
        row.className = "node";
        row.innerHTML = `<span class="tw">${icon("i-chev")}</span>${icon(node.icon || "i-folder")}<span class="label">${esc(node.name)}</span>`;
        row.title = node.path;
        row.addEventListener("click", ev => {
            if (ev.target.closest(".tw")) this.toggleNode(node);
            else {
                this.load(node.path);
                if (!node.expanded) this.toggleNode(node);
            }
            this.setActive();
        });
        row.addEventListener("dblclick", () => this.toggleNode(node));
        row.addEventListener("contextmenu", ev => {
            ev.preventDefault();
            this.load(node.path).then(() =>
                showContextMenu(ev.clientX, ev.clientY, this.contextItems())
            );
        });
        node.el = li;
        node.row = row;
        li.appendChild(row);
        const ul = document.createElement("ul");
        li.appendChild(ul);
        node.ul = ul;
        return li;
    }

    async toggleNode(node) {
        if (node.expanded) {
            node.expanded = false;
            node.el.classList.add("collapsed");
            node.row.classList.remove("expanded");
            return;
        }
        await this.expandNode(node);
    }

    async expandNode(node) {
        if (!node.children) {
            node.row.classList.add("loading");
            try {
                const url = this.isRemote
                    ? `/api/remote/list?path=${encodeURIComponent(node.path)}`
                    : `/api/local/list?path=${encodeURIComponent(node.path)}`;
                const data = await api.get(url);
                const collator = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" });
                node.children = data.entries
                    .filter(e => e.type === "directory")
                    .sort((a, b) => collator.compare(a.name, b.name))
                    .map(e => ({ name: e.name, path: e.path, children: null, expanded: false }));
                node.ul.innerHTML = "";
                for (const child of node.children) node.ul.appendChild(this.buildNode(child));
                if (!node.children.length) node.row.classList.add("leaf");
            } catch (err) {
                node.children = [];
                node.row.classList.add("leaf");
            } finally {
                node.row.classList.remove("loading");
            }
        }
        node.expanded = true;
        node.el.classList.remove("collapsed");
        node.row.classList.add("expanded");
    }

    async revealInTree(path, forceReload = false) {
        if (!path || !this.treeRoots.length) return;
        let best = null;
        for (const r of this.treeRoots) {
            if (this.isAncestor(r.path, path) && (!best || r.path.length > best.path.length))
                best = r;
        }
        if (!best) return;
        let node = best;
        while (!this.samePath(node.path, path)) {
            if (forceReload) node.children = null;
            await this.expandNode(node);
            const next = (node.children || []).find(c => this.isAncestor(c.path, path));
            if (!next) break;
            node = next;
        }
        if (forceReload && this.samePath(node.path, path)) {
            node.children = null;
            if (node.expanded) await this.expandNode(node);
        }
        if (this.selectedTreeNode && this.selectedTreeNode.row)
            this.selectedTreeNode.row.classList.remove("selected");
        this.selectedTreeNode = node;
        node.row.classList.add("selected");
        node.row.scrollIntoView({ block: "nearest" });
    }

    setActive() {
        app.activePane = this.kind;
        panes.local.el.classList.toggle("active", this.kind === "local");
        panes.remote.el.classList.toggle("active", this.kind === "remote");
    }

    // ---- events
    bind() {
        this.listEl.addEventListener("mousedown", () => this.setActive());
        this.treeEl.addEventListener("mousedown", () => this.setActive());

        this.tbody.addEventListener("click", ev => {
            const tr = ev.target.closest("tr");
            if (!tr) return;
            if (tr.dataset.updir) {
                this.selected.clear();
                this.renderSelection();
                return;
            }
            this.selectRow(tr, ev);
        });
        this.listEl.addEventListener("click", ev => {
            if (ev.target === this.listEl || ev.target.tagName === "TABLE") {
                this.selected.clear();
                this.renderSelection();
            }
        });
        this.tbody.addEventListener("dblclick", ev => {
            const tr = ev.target.closest("tr");
            if (!tr) return;
            if (tr.dataset.updir) return this.up();
            const entry = this.entryByPath(tr.dataset.path);
            if (entry) this.open(entry);
        });
        this.listEl.addEventListener("contextmenu", ev => {
            ev.preventDefault();
            const tr = ev.target.closest("tr[data-path]");
            if (tr && !this.selected.has(tr.dataset.path)) this.selectRow(tr, null);
            this.setActive();
            showContextMenu(ev.clientX, ev.clientY, this.contextItems());
        });
        this.listEl.addEventListener("keydown", ev => {
            const k = ev.key;
            if (k === "Enter") {
                const [entry] = this.selectedEntries();
                if (entry) this.open(entry);
            } else if (k === "Backspace") this.up();
            else if (k === "Delete") this.remove();
            else if (k === "F2") this.rename();
            else if (k === "ArrowDown") this.moveCursor(1, ev);
            else if (k === "ArrowUp") this.moveCursor(-1, ev);
            else if (k === "a" && (ev.ctrlKey || ev.metaKey)) this.selectAll();
            else return;
            ev.preventDefault();
        });
        for (const th of this.listEl.querySelectorAll("th[data-sort]")) {
            th.addEventListener("click", () => {
                const key = th.dataset.sort;
                if (this.sort.key === key) this.sort.dir *= -1;
                else this.sort = { key, dir: 1 };
                this.render();
            });
        }
        this.pathInput.addEventListener("keydown", ev => {
            if (ev.key === "Enter") {
                ev.preventDefault();
                this.load(this.pathInput.value.trim());
            }
        });
        this.el.querySelector('[data-pane-action="up"]').addEventListener("click", () => this.up());

        // Drag & drop between panes
        this.tbody.addEventListener("dragstart", ev => {
            const tr = ev.target.closest("tr[data-path]");
            if (!tr) return ev.preventDefault();
            if (!this.selected.has(tr.dataset.path)) this.selectRow(tr, null);
            ev.dataTransfer.effectAllowed = "copy";
            ev.dataTransfer.setData(
                "text/plain",
                JSON.stringify({ pane: this.kind, paths: [...this.selected] })
            );
        });
        this.listEl.addEventListener("dragover", ev => {
            const data = dragSource();
            if (!data || data.pane === this.kind) return;
            ev.preventDefault();
            ev.dataTransfer.dropEffect = "copy";
            this.listEl.classList.add("dragover");
            for (const r of this.tbody.querySelectorAll(".dragover-target"))
                r.classList.remove("dragover-target");
            const tr = ev.target.closest("tr");
            if (tr && (tr.classList.contains("directory") || tr.dataset.updir))
                tr.classList.add("dragover-target");
        });
        this.listEl.addEventListener("dragleave", ev => {
            if (!this.listEl.contains(ev.relatedTarget)) this.listEl.classList.remove("dragover");
        });
        this.listEl.addEventListener("drop", ev => {
            ev.preventDefault();
            this.listEl.classList.remove("dragover");
            for (const r of this.tbody.querySelectorAll(".dragover-target"))
                r.classList.remove("dragover-target");
            let data;
            try {
                data = JSON.parse(ev.dataTransfer.getData("text/plain"));
            } catch (_) {
                return;
            }
            if (!data || data.pane === this.kind) return;
            const source = panes[data.pane];
            const entries = data.paths.map(p => source.entryByPath(p)).filter(Boolean);
            const tr = ev.target.closest("tr");
            let targetDir = this.path;
            if (tr && tr.dataset.updir) targetDir = this.parent;
            else if (tr && tr.classList.contains("directory")) targetDir = tr.dataset.path;
            transfer(source, entries, true, targetDir);
            dragState.data = null;
        });
    }
}

const dragState = { data: null };
document.addEventListener("dragstart", ev => {
    try {
        dragState.data = JSON.parse(ev.dataTransfer.getData("text/plain"));
    } catch (_) {
        dragState.data = null;
    }
});
document.addEventListener("dragend", () => {
    dragState.data = null;
});
const dragSource = () => dragState.data;

const panes = { local: new Pane("local"), remote: new Pane("remote") };

// ---------------------------------------------------------------- transfers
async function transfer(fromPane, entries, processNow, targetDir) {
    if (!entries.length) return;
    if (!app.connected) return toast("Conecte-se a um servidor antes de transferir arquivos.");
    const dest = fromPane.other;
    const dir = targetDir || dest.path;
    if (!dir)
        return toast(
            fromPane.isRemote
                ? "Selecione um diretório local de destino."
                : "Selecione um diretório remoto de destino."
        );
    const items = fromPane.isRemote
        ? entries.map(e => ({
              direction: "download",
              type: e.type,
              remote: e.path,
              size: e.size,
              localDir: dir
          }))
        : entries.map(e => ({ direction: "upload", local: e.path, remoteDir: dir }));
    try {
        await api.post("/api/queue/add", { items, process: processNow });
        if (!app.el.classList.contains("no-queue") && processNow) setTab("queued");
    } catch (err) {
        toast(err.message);
    }
}

// ---------------------------------------------------------------- queue UI
const queueBody = $("#queue-body");
const queueTbody = queueBody.querySelector("tbody");

function setTab(tab) {
    app.tab = tab;
    for (const b of $$(".tab")) b.classList.toggle("active", b.dataset.tab === tab);
    renderQueue();
}

function queueStatusCell(item) {
    if (item.status === "active") {
        const pct = item.size ? Math.min(100, (item.loaded / item.size) * 100) : 0;
        const sp = app.speed.get(item.id);
        const speed = sp && sp.bps ? `${fmtSize(sp.bps)}/s` : "";
        return `<div class="progress"><div class="bar"><i style="width:${pct.toFixed(1)}%"></i></div><span class="pct">${pct.toFixed(0)}%</span><span class="spd">${speed}</span></div>`;
    }
    if (item.status === "done") return `<span class="st-done">${icon("i-check")}Concluído</span>`;
    if (item.status === "failed")
        return `<span class="st-failed" title="${esc(item.error || "")}">${icon("i-warn")}${esc(item.error || "Falha")}</span>`;
    return `<span class="st-queued">Na fila</span>`;
}

function renderQueue() {
    const visible = app.queue.filter(i =>
        app.tab === "queued" ? i.status === "queued" || i.status === "active" : i.status === app.tab
    );
    queueTbody.innerHTML = visible
        .map(item => {
            const host = app.site ? new URL(app.site.url).host : "";
            const sel = app.queueSel.has(item.id) ? " selected" : "";
            return (
                `<tr data-id="${item.id}" class="${sel}">` +
                `<td title="${esc(item.local)}">${esc(item.local)}</td>` +
                `<td class="dir ${item.direction}">${icon(item.direction === "download" ? "i-download" : "i-upload")}</td>` +
                `<td title="${esc(host)}${esc(item.remote)}">${esc(item.remote)}</td>` +
                `<td class="num">${fmtSize(item.size)}</td>` +
                `<td class="status">${queueStatusCell(item)}</td></tr>`
            );
        })
        .join("");
    $("#queue-empty").classList.toggle("hidden", visible.length > 0);
    $("#queue-empty").textContent =
        app.tab === "queued"
            ? "Fila vazia"
            : app.tab === "failed"
              ? "Nenhuma transferência com falha"
              : "Nenhuma transferência concluída";
    const counts = { queued: 0, failed: 0, done: 0 };
    for (const i of app.queue) {
        if (i.status === "queued" || i.status === "active") counts.queued += 1;
        else counts[i.status] += 1;
    }
    $("#count-queued").textContent = `(${counts.queued})`;
    $("#count-failed").textContent = `(${counts.failed})`;
    $("#count-done").textContent = `(${counts.done})`;
    const pending = app.queue.filter(i => i.status === "queued" || i.status === "active");
    const bytes = pending.reduce((s, i) => s + Math.max(0, (i.size || 0) - (i.loaded || 0)), 0);
    $("#sb-queue").textContent = pending.length
        ? `Fila: ${plural(pending.length, "arquivo", "arquivos")} (${fmtSize(bytes)})`
        : "Fila: vazia";
    $("#toolbar [data-action='process']").disabled = !pending.length || app.processing;
    $("#toolbar [data-action='stop']").disabled = !app.processing;
}

function updateProgress(items) {
    const now = performance.now();
    let total = 0;
    for (const p of items) {
        const item = app.queue.find(q => q.id === p.id);
        if (!item) continue;
        item.loaded = p.loaded;
        item.size = p.size;
        const prev = app.speed.get(p.id);
        let bps = prev ? prev.bps : 0;
        if (prev && now - prev.t > 300) {
            const inst = ((p.loaded - prev.loaded) / (now - prev.t)) * 1000;
            bps = prev.bps ? prev.bps * 0.6 + inst * 0.4 : inst;
            app.speed.set(p.id, { t: now, loaded: p.loaded, bps });
        } else if (!prev) app.speed.set(p.id, { t: now, loaded: p.loaded, bps: 0 });
        total += bps;
        const tr = queueTbody.querySelector(`tr[data-id="${p.id}"]`);
        if (tr) tr.querySelector(".status").innerHTML = queueStatusCell(item);
    }
    $("#sb-speed").textContent = total > 0 ? `${fmtSize(total)}/s` : "";
}

function applyQueue(queue, processing) {
    const wasProcessing = app.processing;
    app.queue = queue;
    app.processing = processing;
    for (const id of [...app.speed.keys()])
        if (!queue.some(q => q.id === id && q.status === "active")) app.speed.delete(id);
    renderQueue();
    if (!processing) $("#sb-speed").textContent = "";
    if (wasProcessing && !processing) {
        panes.local.refresh();
        if (app.connected) panes.remote.refresh();
    }
}

queueTbody.addEventListener("click", ev => {
    const tr = ev.target.closest("tr[data-id]");
    if (!tr) return;
    const id = Number(tr.dataset.id);
    if (ev.ctrlKey || ev.metaKey) {
        if (app.queueSel.has(id)) app.queueSel.delete(id);
        else app.queueSel.add(id);
    } else {
        app.queueSel.clear();
        app.queueSel.add(id);
    }
    renderQueue();
});
queueBody.addEventListener("contextmenu", ev => {
    ev.preventDefault();
    const tr = ev.target.closest("tr[data-id]");
    if (tr && !app.queueSel.has(Number(tr.dataset.id))) {
        app.queueSel.clear();
        app.queueSel.add(Number(tr.dataset.id));
        renderQueue();
    }
    showContextMenu(ev.clientX, ev.clientY, [
        {
            label: "Processar fila",
            strong: true,
            icon: "i-play",
            enabled: !app.processing,
            action: () => doAction("process")
        },
        {
            label: "Cancelar transferências",
            icon: "i-stop",
            enabled: app.processing,
            action: () => doAction("stop")
        },
        { sep: true },
        {
            label: "Remover selecionados",
            enabled: app.queueSel.size > 0,
            action: () => api.post("/api/queue/remove", { ids: [...app.queueSel] })
        },
        { label: "Repetir transferências com falha", action: () => doAction("retry") },
        { label: "Limpar esta aba", action: () => doAction("clear-tab") },
        {
            label: "Limpar tudo",
            action: () => api.post("/api/queue/clear", { statuses: ["queued", "done", "failed"] })
        }
    ]);
});
queueBody.addEventListener("keydown", ev => {
    if (ev.key === "Delete" && app.queueSel.size) {
        api.post("/api/queue/remove", { ids: [...app.queueSel] });
        app.queueSel.clear();
    }
});
for (const b of $$(".tab")) b.addEventListener("click", () => setTab(b.dataset.tab));
for (const b of $$(".tabs [data-action]"))
    b.addEventListener("click", () => doAction(b.dataset.action));

// ---------------------------------------------------------------- connection
async function connect(params, { remember = true } = {}) {
    const btn = $("#qc-connect");
    btn.disabled = true;
    btn.textContent = "Conectando…";
    try {
        const result = await api.post("/api/connect", params);
        app.connected = true;
        app.site = result.site;
        app.lastConn = params;
        updateConnectionUI();
        panes.remote.path = "/";
        panes.remote.parent = null;
        panes.remote.entries = result.root.entries;
        panes.remote.pathInput.value = "/";
        panes.remote.render();
        await panes.remote.loadTree();
        panes.remote.revealInTree("/");
        if (params.remoteDir && params.remoteDir !== "/") panes.remote.load(params.remoteDir);
        if (params.localDir) panes.local.load(params.localDir);
        if (remember) rememberQuickConnect(params);
        loadQuota();
        return true;
    } catch (err) {
        toast(err.message);
        return false;
    } finally {
        btn.disabled = false;
        btn.textContent = "Conexão rápida";
    }
}

async function disconnect() {
    if (!app.connected) return;
    await api.post("/api/disconnect").catch(() => {});
    app.connected = false;
    app.site = null;
    updateConnectionUI();
}

function updateConnectionUI() {
    const conn = $("#sb-conn");
    conn.classList.toggle("on", app.connected);
    conn.innerHTML = app.connected
        ? `<i class="dot"></i> ${esc(new URL(app.site.url).host)}${app.site.username ? ` · ${esc(app.site.username)}` : ""}`
        : `<i class="dot"></i> Desconectado`;
    panes.remote.pathInput.disabled = !app.connected;
    $("#toolbar [data-action='disconnect']").disabled = !app.connected;
    $("#toolbar [data-action='reconnect']").disabled = app.connected || !app.lastConn;
    if (!app.connected) {
        panes.remote.clear("Não conectado a nenhum servidor");
        $("#sb-quota").textContent = "";
    }
}

async function loadQuota() {
    try {
        const { quota } = await api.get("/api/remote/quota");
        if (quota && typeof quota.used === "number") {
            const avail =
                typeof quota.available === "number"
                    ? ` de ${fmtSize(quota.used + quota.available)}`
                    : quota.available === "unlimited"
                      ? " (ilimitado)"
                      : "";
            $("#sb-quota").textContent = `Cota: ${fmtSize(quota.used)} usados${avail}`;
        }
    } catch (_) {}
}

function rememberQuickConnect(params) {
    const history = store.get("qcHistory", []).filter(h => h.url !== params.url);
    history.unshift({ url: params.url, username: params.username || "", port: params.port || "" });
    store.set("qcHistory", history.slice(0, 10));
    renderQuickHistory();
}

function renderQuickHistory() {
    const list = $("#qc-history");
    list.innerHTML = store
        .get("qcHistory", [])
        .map(
            h =>
                `<option value="${esc(h.url)}">${esc(h.username ? `${h.username}@` : "")}${esc(h.url)}</option>`
        )
        .join("");
}

$("#quickconnect").addEventListener("submit", ev => {
    ev.preventDefault();
    const url = $("#qc-host").value.trim();
    if (!url) return $("#qc-host").focus();
    const params = {
        url,
        username: $("#qc-user").value,
        password: $("#qc-pass").value,
        port: $("#qc-port").value || "",
        authType: "auto"
    };
    connect(params);
});
$("#qc-host").addEventListener("change", () => {
    const h = store.get("qcHistory", []).find(x => x.url === $("#qc-host").value.trim());
    if (h) {
        $("#qc-user").value = h.username;
        $("#qc-port").value = h.port;
    }
});

// ---------------------------------------------------------------- site manager
const sitesUI = {
    sites: [],
    index: -1,
    dlg: $("#dlg-sites"),
    list: $("#sites-list"),
    form: $("#sites-form"),
    async open() {
        try {
            this.sites = (await api.get("/api/sites")).sites;
        } catch (err) {
            toast(err.message);
            this.sites = [];
        }
        this.index = this.sites.length ? 0 : -1;
        this.renderList();
        this.dlg.showModal();
    },
    renderList() {
        this.list.innerHTML = this.sites
            .map(
                (s, i) =>
                    `<li data-i="${i}" class="${i === this.index ? "selected" : ""}">${icon("i-drive")}<span>${esc(s.name || s.url || "(sem nome)")}</span></li>`
            )
            .join("");
        this.fillForm();
    },
    fillForm() {
        const s = this.sites[this.index];
        this.form.classList.toggle("disabled", !s);
        for (const input of this.form.querySelectorAll("[name]"))
            input.value = s ? s[input.name] || "" : "";
    },
    readForm() {
        const s = this.sites[this.index];
        if (!s) return;
        for (const input of this.form.querySelectorAll("[name]")) s[input.name] = input.value;
        const li = this.list.querySelector(`li[data-i="${this.index}"] span`);
        if (li) li.textContent = s.name || s.url || "(sem nome)";
    },
    async save(silent = false) {
        this.readForm();
        try {
            await api.put("/api/sites", { sites: this.sites });
            if (!silent) toast("Sites salvos.", "info");
        } catch (err) {
            toast(err.message);
        }
    },
    params(s) {
        return {
            url: s.url,
            username: s.username,
            password: s.password,
            port: s.port,
            authType: s.authType || "auto",
            token: s.token,
            remoteDir: s.remoteDir,
            localDir: s.localDir
        };
    }
};
sitesUI.list.addEventListener("click", ev => {
    const li = ev.target.closest("li[data-i]");
    if (!li) return;
    sitesUI.readForm();
    sitesUI.index = Number(li.dataset.i);
    sitesUI.renderList();
});
sitesUI.form.addEventListener("input", () => sitesUI.readForm());
sitesUI.dlg.addEventListener("click", async ev => {
    const btn = ev.target.closest("[data-sites]");
    if (!btn) return;
    const act = btn.dataset.sites;
    if (act === "new") {
        sitesUI.readForm();
        sitesUI.sites.push({
            name: "Novo site",
            url: "",
            authType: "auto",
            username: "",
            password: "",
            port: "",
            token: "",
            remoteDir: "/",
            localDir: "",
            notes: ""
        });
        sitesUI.index = sitesUI.sites.length - 1;
        sitesUI.renderList();
        sitesUI.form.querySelector("[name=name]").select();
    } else if (act === "dup") {
        const s = sitesUI.sites[sitesUI.index];
        if (!s) return;
        sitesUI.readForm();
        sitesUI.sites.splice(sitesUI.index + 1, 0, { ...s, name: `${s.name} (cópia)` });
        sitesUI.index += 1;
        sitesUI.renderList();
    } else if (act === "del") {
        if (sitesUI.index < 0) return;
        sitesUI.sites.splice(sitesUI.index, 1);
        sitesUI.index = Math.min(sitesUI.index, sitesUI.sites.length - 1);
        sitesUI.renderList();
        sitesUI.save(true);
    } else if (act === "save") {
        sitesUI.save();
    } else if (act === "close") {
        sitesUI.dlg.close();
    } else if (act === "connect") {
        const s = sitesUI.sites[sitesUI.index];
        if (!s || !s.url) return toast("Informe o endereço do servidor.");
        await sitesUI.save(true);
        sitesUI.dlg.close();
        $("#qc-host").value = s.url;
        $("#qc-user").value = s.username || "";
        $("#qc-port").value = s.port || "";
        connect(sitesUI.params(s));
    }
});

// ---------------------------------------------------------------- bookmarks
function bookmarks() {
    return store.get("bookmarks", []);
}
async function addBookmark() {
    if (!panes.remote.path && !panes.local.path) return;
    const name = await promptDialog({
        title: "Adicionar favorito",
        label: "Nome do favorito:",
        value: panes.remote.path
            ? `${app.site ? new URL(app.site.url).host : ""} ${panes.remote.path}`
            : panes.local.path,
        text: `Local: ${panes.local.path || "-"}\nRemoto: ${panes.remote.path || "-"}`
    });
    if (!name) return;
    const list = bookmarks();
    list.push({ name, local: panes.local.path || "", remote: panes.remote.path || "" });
    store.set("bookmarks", list);
}
async function manageBookmarks() {
    const list = bookmarks();
    if (!list.length) return toast("Nenhum favorito cadastrado.", "info");
    const ok = await confirmDialog(
        "Favoritos",
        `Remover todos os ${list.length} favoritos?`,
        "Remover"
    );
    if (ok) store.set("bookmarks", []);
}

// ---------------------------------------------------------------- menus
const menuModel = [
    {
        label: "Arquivo",
        items: () => [
            { label: "Gerenciador de Sites…", icon: "i-sites", sc: "Ctrl+S", action: "sites" },
            { label: "Conexão rápida", action: () => $("#qc-host").focus() },
            { sep: true },
            {
                label: "Desconectar",
                icon: "i-unplug",
                enabled: app.connected,
                action: "disconnect"
            },
            {
                label: "Reconectar",
                icon: "i-plug",
                enabled: !app.connected && Boolean(app.lastConn),
                action: "reconnect"
            },
            { sep: true },
            { label: "Sair", action: () => disconnect().then(() => window.close()) }
        ]
    },
    {
        label: "Editar",
        items: () => [
            {
                label: "Selecionar tudo",
                sc: "Ctrl+A",
                action: () => panes[app.activePane].selectAll()
            },
            {
                label: "Limpar seleção",
                action: () => {
                    panes[app.activePane].selected.clear();
                    panes[app.activePane].renderSelection();
                }
            },
            { sep: true },
            { label: "Limpar log de mensagens", action: () => (logBody.innerHTML = "") },
            {
                label: "Limpar histórico de conexão rápida",
                action: () => {
                    store.set("qcHistory", []);
                    renderQuickHistory();
                }
            }
        ]
    },
    {
        label: "Visualizar",
        items: () => [
            { label: "Atualizar", icon: "i-refresh", sc: "F5", action: "refresh" },
            { sep: true },
            {
                label: "Log de mensagens",
                check: !app.el.classList.contains("no-log"),
                action: "toggle-log"
            },
            {
                label: "Árvore de diretórios local",
                check: !panes.local.el.classList.contains("no-tree"),
                action: "toggle-local-tree"
            },
            {
                label: "Árvore de diretórios remota",
                check: !panes.remote.el.classList.contains("no-tree"),
                action: "toggle-remote-tree"
            },
            {
                label: "Fila de transferências",
                check: !app.el.classList.contains("no-queue"),
                action: "toggle-queue"
            },
            { sep: true },
            {
                label: "Tema escuro",
                check: document.documentElement.dataset.theme === "dark",
                action: "theme"
            }
        ]
    },
    {
        label: "Transferência",
        items: () => [
            {
                label: "Processar fila",
                icon: "i-play",
                sc: "Ctrl+P",
                enabled: !app.processing,
                action: "process"
            },
            {
                label: "Cancelar transferências",
                icon: "i-stop",
                enabled: app.processing,
                action: "stop"
            },
            { sep: true },
            { label: "Repetir transferências com falha", action: "retry" },
            {
                label: "Limpar transferências concluídas",
                action: () => api.post("/api/queue/clear", { statuses: ["done"] })
            },
            {
                label: "Limpar toda a fila",
                action: () =>
                    api.post("/api/queue/clear", { statuses: ["queued", "done", "failed"] })
            }
        ]
    },
    {
        label: "Servidor",
        items: () => [
            {
                label: "Criar diretório remoto",
                icon: "i-mkdir",
                enabled: app.connected,
                action: () => panes.remote.mkdir(false)
            },
            {
                label: "Atualizar diretório remoto",
                icon: "i-refresh",
                enabled: app.connected,
                action: () => panes.remote.refresh()
            },
            {
                label: "Copiar URL do diretório atual",
                enabled: app.connected,
                action: () => {
                    panes.remote.selected.clear();
                    panes.remote.copyURL();
                }
            },
            { sep: true },
            {
                label: "Consultar cota de disco",
                enabled: app.connected,
                action: () =>
                    loadQuota().then(() =>
                        toast(
                            $("#sb-quota").textContent || "O servidor não informou a cota.",
                            "info"
                        )
                    )
            },
            { sep: true },
            { label: "Desconectar", icon: "i-unplug", enabled: app.connected, action: "disconnect" }
        ]
    },
    {
        label: "Favoritos",
        items: () => [
            { label: "Adicionar favorito…", action: addBookmark },
            { label: "Remover todos os favoritos", action: manageBookmarks },
            ...(bookmarks().length ? [{ sep: true }] : []),
            ...bookmarks().map(b => ({
                label: b.name,
                icon: "i-folder",
                action: () => {
                    if (b.local) panes.local.load(b.local);
                    if (b.remote && app.connected) panes.remote.load(b.remote);
                }
            }))
        ]
    },
    {
        label: "Ajuda",
        items: () => [
            {
                label: "Documentação da biblioteca webdav",
                action: () =>
                    window.open("https://github.com/perry-mitchell/webdav-client#readme", "_blank")
            },
            { sep: true },
            { label: "Sobre o DAVport", action: () => $("#dlg-about").showModal() }
        ]
    }
];

function renderMenuItems(ul, items, onPick) {
    ul.innerHTML = items
        .map((it, i) => {
            if (it.sep) return `<li class="sep"></li>`;
            const dis = it.enabled === false ? " disabled" : "";
            const check = it.check ? `<span class="check">${icon("i-check")}</span>` : "";
            const ic = it.icon && !it.check ? icon(it.icon) : "";
            const label = it.strong ? `<strong>${esc(it.label)}</strong>` : esc(it.label);
            const sc = it.sc ? `<span class="sc">${esc(it.sc)}</span>` : "";
            return `<li data-i="${i}" class="${dis}">${check}${ic}${label}${sc}</li>`;
        })
        .join("");
    ul.onclick = ev => {
        const li = ev.target.closest("li[data-i]");
        if (!li) return;
        onPick(items[Number(li.dataset.i)]);
    };
}

const menubar = $("#menubar");
menubar.innerHTML = menuModel
    .map(
        (m, i) =>
            `<div class="menu" data-i="${i}"><button type="button">${esc(m.label)}</button><ul class="menu-list"></ul></div>`
    )
    .join("");
let menuOpen = null;
function openMenu(div) {
    closeMenus();
    const model = menuModel[Number(div.dataset.i)];
    renderMenuItems(div.querySelector("ul"), model.items(), it => {
        closeMenus();
        runAction(it.action);
    });
    div.classList.add("open");
    menuOpen = div;
}
function closeMenus() {
    if (menuOpen) menuOpen.classList.remove("open");
    menuOpen = null;
}
for (const div of menubar.querySelectorAll(".menu")) {
    div.querySelector("button").addEventListener("click", ev => {
        ev.stopPropagation();
        if (menuOpen === div) closeMenus();
        else openMenu(div);
    });
    div.querySelector("button").addEventListener("mouseenter", () => {
        if (menuOpen && menuOpen !== div) openMenu(div);
    });
}
document.addEventListener("click", () => {
    closeMenus();
    hideContextMenu();
});
document.addEventListener("keydown", ev => {
    if (ev.key === "Escape") {
        closeMenus();
        hideContextMenu();
    }
});

const ctx = $("#ctxmenu");
function showContextMenu(x, y, items) {
    renderMenuItems(ctx, items, it => {
        hideContextMenu();
        runAction(it.action);
    });
    ctx.classList.remove("hidden");
    const rect = ctx.getBoundingClientRect();
    ctx.style.left = `${Math.min(x, window.innerWidth - rect.width - 4)}px`;
    ctx.style.top = `${Math.min(y, window.innerHeight - rect.height - 4)}px`;
}
function hideContextMenu() {
    ctx.classList.add("hidden");
}
ctx.addEventListener("click", ev => ev.stopPropagation());
ctx.addEventListener("contextmenu", ev => ev.preventDefault());

// ---------------------------------------------------------------- actions
function runAction(action) {
    if (typeof action === "function") return action();
    if (typeof action === "string") return doAction(action);
}

function toggleClass(el, cls, storeKey) {
    el.classList.toggle(cls);
    store.set(storeKey, el.classList.contains(cls));
    syncToggleButtons();
}

function syncToggleButtons() {
    $("#toolbar [data-action='toggle-log']").classList.toggle(
        "on",
        !app.el.classList.contains("no-log")
    );
    $("#toolbar [data-action='toggle-queue']").classList.toggle(
        "on",
        !app.el.classList.contains("no-queue")
    );
    $("#toolbar [data-action='toggle-local-tree']").classList.toggle(
        "on",
        !panes.local.el.classList.contains("no-tree")
    );
    $("#toolbar [data-action='toggle-remote-tree']").classList.toggle(
        "on",
        !panes.remote.el.classList.contains("no-tree")
    );
}

async function doAction(name) {
    switch (name) {
        case "sites":
            return sitesUI.open();
        case "toggle-log":
            return toggleClass(app.el, "no-log", "noLog");
        case "toggle-queue":
            return toggleClass(app.el, "no-queue", "noQueue");
        case "toggle-local-tree":
            return toggleClass(panes.local.el, "no-tree", "noLocalTree");
        case "toggle-remote-tree":
            return toggleClass(panes.remote.el, "no-tree", "noRemoteTree");
        case "refresh":
            panes.local.refresh();
            if (app.connected) panes.remote.refresh();
            return;
        case "process":
            return api.post("/api/queue/process").catch(err => toast(err.message));
        case "stop":
            return api.post("/api/queue/stop").catch(err => toast(err.message));
        case "retry":
            return api.post("/api/queue/retry").catch(err => toast(err.message));
        case "clear-tab":
            return api
                .post("/api/queue/clear", {
                    statuses: app.tab === "queued" ? ["queued"] : [app.tab]
                })
                .catch(err => toast(err.message));
        case "disconnect":
            return disconnect();
        case "reconnect":
            if (app.lastConn) return connect(app.lastConn, { remember: false });
            return toast("Nenhuma conexão anterior para reconectar.", "info");
        case "theme": {
            const dark = document.documentElement.dataset.theme !== "dark";
            document.documentElement.dataset.theme = dark ? "dark" : "light";
            store.set("theme", dark ? "dark" : "light");
            return;
        }
        default:
            return undefined;
    }
}

$("#toolbar").addEventListener("click", ev => {
    const btn = ev.target.closest("button[data-action]");
    if (btn) doAction(btn.dataset.action);
});

document.addEventListener("keydown", ev => {
    const inField =
        ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName) ||
        document.querySelector("dialog[open]");
    if (ev.key === "F5") {
        ev.preventDefault();
        doAction("refresh");
    } else if (ev.ctrlKey && ev.key.toLowerCase() === "s") {
        ev.preventDefault();
        doAction("sites");
    } else if (ev.ctrlKey && ev.key.toLowerCase() === "p") {
        ev.preventDefault();
        doAction("process");
    } else if (!inField && ev.altKey && ev.key === "1") {
        panes.local.listEl.focus();
    } else if (!inField && ev.altKey && ev.key === "2") {
        panes.remote.listEl.focus();
    }
});

// ---------------------------------------------------------------- splitters
const root = document.documentElement;
function setupSplitters() {
    const saved = store.get("layout", {});
    for (const [k, v] of Object.entries(saved)) root.style.setProperty(k, v);
    const config = {
        log: { prop: "--log-h", axis: "y", sign: 1, min: 40, max: 500 },
        queue: { prop: "--queue-h", axis: "y", sign: -1, min: 60, max: 500 },
        "local-tree": { prop: "--local-tree-h", axis: "y", sign: 1, min: 40, max: 600 },
        "remote-tree": { prop: "--remote-tree-h", axis: "y", sign: 1, min: 40, max: 600 },
        panes: { prop: "--panes-left", axis: "x", sign: 1, min: 220, max: null }
    };
    for (const sp of $$(".splitter[data-resize]")) {
        const cfg = config[sp.dataset.resize];
        sp.addEventListener("mousedown", ev => {
            ev.preventDefault();
            const start = cfg.axis === "y" ? ev.clientY : ev.clientX;
            const target = cfg.axis === "y" ? sp.previousElementSibling : panes.local.el;
            const startSize =
                cfg.axis === "y"
                    ? target.getBoundingClientRect().height
                    : target.getBoundingClientRect().width;
            sp.classList.add("dragging");
            document.body.classList.add("resizing");
            document.body.style.cursor = cfg.axis === "y" ? "row-resize" : "col-resize";
            const move = e => {
                const cur = cfg.axis === "y" ? e.clientY : e.clientX;
                let size = startSize + (cur - start) * cfg.sign;
                const max = cfg.max || $("#panes").getBoundingClientRect().width - 220;
                size = Math.max(cfg.min, Math.min(max, size));
                root.style.setProperty(cfg.prop, `${size}px`);
            };
            const stop = () => {
                document.removeEventListener("mousemove", move);
                document.removeEventListener("mouseup", stop);
                sp.classList.remove("dragging");
                document.body.classList.remove("resizing");
                document.body.style.cursor = "";
                const layout = store.get("layout", {});
                layout[cfg.prop] = root.style.getPropertyValue(cfg.prop);
                store.set("layout", layout);
            };
            document.addEventListener("mousemove", move);
            document.addEventListener("mouseup", stop);
        });
    }
}

// ---------------------------------------------------------------- events (SSE)
function connectEvents() {
    const es = new EventSource("/api/events");
    es.onmessage = ev => {
        let msg;
        try {
            msg = JSON.parse(ev.data);
        } catch (_) {
            return;
        }
        switch (msg.type) {
            case "hello":
                applyQueue(msg.queue, msg.processing);
                break;
            case "log":
                appendLog(msg.entry);
                break;
            case "queue":
                applyQueue(msg.queue, msg.processing);
                break;
            case "progress":
                updateProgress(msg.items);
                break;
            case "state":
                if (msg.connected !== app.connected) {
                    app.connected = msg.connected;
                    app.site = msg.site;
                    updateConnectionUI();
                }
                break;
            default:
                break;
        }
    };
    es.onerror = () =>
        appendLog({
            level: "error",
            text: "Conexão com o servidor local perdida. Tentando reconectar…"
        });
}

// ---------------------------------------------------------------- boot
app.el = $("#app");

async function boot() {
    const theme = store.get("theme", null);
    if (theme) document.documentElement.dataset.theme = theme;
    if (store.get("noLog", false)) app.el.classList.add("no-log");
    if (store.get("noQueue", false)) app.el.classList.add("no-queue");
    if (store.get("noLocalTree", false)) panes.local.el.classList.add("no-tree");
    if (store.get("noRemoteTree", false)) panes.remote.el.classList.add("no-tree");
    syncToggleButtons();
    setupSplitters();
    renderQuickHistory();
    panes.local.setActive();

    let state;
    try {
        state = await api.get("/api/state");
    } catch (err) {
        appendLog({
            level: "error",
            text: `Não foi possível falar com o servidor local: ${err.message}`
        });
        return;
    }
    app.platform = state.platform;
    app.sep = state.sep;
    app.home = state.home;
    app.connected = state.connected;
    app.site = state.site;
    $("#sites-file-hint").textContent =
        `${state.home}${state.sep}.webdav-client-gui${state.sep}sites.json`;
    for (const entry of state.log) appendLog(entry);
    if (!state.log.length)
        appendLog({
            level: "status",
            text: "DAVport pronto. Use a conexão rápida ou o Gerenciador de Sites para conectar a um servidor WebDAV."
        });
    applyQueue(state.queue, state.processing);
    updateConnectionUI();
    connectEvents();

    await panes.local.loadTree();
    await panes.local.load(store.get("localPath", state.home), { silent: true });
    if (!panes.local.path) await panes.local.load(state.home);

    if (app.connected) {
        await panes.remote.loadTree();
        await panes.remote.load("/");
    }
}

boot();
