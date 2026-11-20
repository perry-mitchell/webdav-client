# DAVport

Interface gráfica para a biblioteca `webdav`, na linha dos clientes de transferência clássicos (dois painéis, log de mensagens, fila de transferências e gerenciador de sites), mas com identidade visual própria.

![DAVport](../webdav.jpg)

## Como executar

```shell
npm install
npm run gui          # compila a biblioteca e abre http://127.0.0.1:8765 no navegador
npm run gui:demo     # o mesmo, mais um servidor WebDAV de testes em http://127.0.0.1:45000/webdav/server
npm run gui:start    # só sobe a interface (quando a lib já está compilada em dist/node)
```

Credenciais do servidor de demonstração: usuário `webdav-user`, senha `pa$$w0rd!`.

Variáveis de ambiente:

| Variável             | Efeito                                              |
|----------------------|-----------------------------------------------------|
| `WEBDAV_GUI_PORT`    | Porta do servidor local (padrão `8765`).            |
| `WEBDAV_GUI_NO_OPEN` | `1` para não abrir o navegador automaticamente.     |

O servidor escuta **somente** em `127.0.0.1`. Ele acessa o disco local com as permissões do usuário que o executou, então não o exponha na rede.

## O que tem na tela

- **Barra de menus** (Arquivo, Editar, Visualizar, Transferência, Servidor, Favoritos, Ajuda) e **barra de ferramentas** com os alternadores de log, árvores e fila.
- **Conexão rápida**: servidor, usuário, senha e porta. O histórico dos últimos servidores fica no navegador.
- **Log de mensagens** com todas as requisições HTTP feitas pela biblioteca (`Comando:` / `Resposta:`), além de mensagens de status e erros.
- **Site local** e **Site remoto**: caminho editável, árvore de diretórios (carregada sob demanda) e lista de arquivos com ordenação por coluna.
- **Fila de transferências** com abas *Arquivos na fila*, *Transferências com falha* e *Transferências bem-sucedidas*, barra de progresso e velocidade.
- **Barra de status** com o servidor conectado, cota de disco (quando o servidor informa) e o resumo da fila.
- **Gerenciador de Sites** (`Ctrl+S`): sites salvos em `~/.webdav-client-gui/sites.json`, com tipo de autenticação (automática, Basic, Digest, token ou anônima) e diretórios padrão.
- Tema claro/escuro, divisórias arrastáveis e layout lembrado entre sessões.

## Atalhos e gestos

| Ação                                        | Como                                                        |
|---------------------------------------------|-------------------------------------------------------------|
| Entrar em um diretório / transferir arquivo | Duplo clique (ou `Enter`)                                   |
| Transferir para o outro painel              | Arrastar e soltar entre os painéis (solte sobre uma pasta para enviar para dentro dela) |
| Adicionar à fila sem transferir             | Botão direito → *Adicionar arquivos à fila*                 |
| Diretório pai                               | `Backspace` ou a seta ao lado do caminho                    |
| Renomear / Excluir / Atualizar              | `F2` / `Delete` / `F5`                                      |
| Selecionar tudo                             | `Ctrl+A`                                                    |
| Processar fila                              | `Ctrl+P`                                                    |
| Focar painel local / remoto                 | `Alt+1` / `Alt+2`                                           |

## Arquitetura

```
gui/
├── server.mjs        servidor HTTP local (sem dependências extras)
└── public/
    ├── index.html    estrutura da janela
    ├── style.css     tema (variáveis CSS, claro e escuro)
    └── app.js        painéis, árvore, fila, menus, gerenciador de sites
```

O `server.mjs` importa `dist/node/index.js` e usa o `createClient` da biblioteca para tudo que é remoto: `getDirectoryContents`, `createDirectory`, `deleteFile`, `moveFile`, `getQuota`, `getDAVCompliance`, `createReadStream` (download) e `putFileContents` com stream (upload). O log de comandos vem de um patch no `fetch` via `getPatcher()`, então toda requisição da biblioteca aparece na tela.

Diretórios são expandidos antes de entrar na fila (localmente com `fs`, remotamente com `PROPFIND` de profundidade infinita), e a fila roda com duas transferências simultâneas. Progresso, log e estado da fila chegam ao navegador por Server-Sent Events em `/api/events`.

### API local

| Método e rota                    | Função                                              |
|----------------------------------|-----------------------------------------------------|
| `GET  /api/state`                | Estado inicial (conexão, fila, log, plataforma)     |
| `POST /api/connect`              | `{ url, username, password, port, authType, token }`|
| `POST /api/disconnect`           | Encerra a sessão                                    |
| `GET  /api/remote/list?path=`    | Lista um diretório remoto                           |
| `POST /api/remote/mkdir|delete|rename` | Operações remotas                             |
| `GET  /api/remote/quota`         | Cota de disco                                       |
| `GET  /api/local/roots`          | Unidades e pastas iniciais                          |
| `GET  /api/local/list?path=`     | Lista um diretório local                            |
| `POST /api/local/mkdir|delete|rename|open` | Operações locais                          |
| `GET/PUT /api/sites`             | Gerenciador de sites                                |
| `POST /api/queue/add`            | `{ items: [...], process: true }`                   |
| `POST /api/queue/process|stop|remove|clear|retry` | Controle da fila                 |
| `GET  /api/events`               | Fluxo SSE de log, fila e progresso                  |

## Limitações conhecidas

- Sem edição de arquivos remotos in-place e sem comparação de diretórios.
- Arrastar arquivos do Explorer direto para a janela não funciona no navegador (o caminho local não é exposto); use o painel local.
- Uma conexão por vez, como uma única aba.
