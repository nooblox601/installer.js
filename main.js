const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const https = require("https");

function createWindow() {
  const win = new BrowserWindow({
    width: 480,
    height: 520,
    resizable: false,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, "icon.png")
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();
});

// ======================================================
// IPC para instalar arquivos e atualizar progresso
// ======================================================
ipcMain.handle("install-files", async (event) => {
  const payloadDir = path.join(__dirname, "payload");
  const installDir = path.join(app.getPath("desktop"), "INSTALLER_JS_APP");

  if (!fs.existsSync(installDir)) fs.mkdirSync(installDir, { recursive: true });

  const files = fs.readdirSync(payloadDir);
  let count = 0;

  for (const file of files) {
    const src = path.join(payloadDir, file);
    const dest = path.join(installDir, file);
    fs.copyFileSync(src, dest);
    count++;
    event.sender.send("progress", Math.round((count / files.length) * 100));
    await new Promise(res => setTimeout(res, 150)); // simula progresso
  }

  return installDir;
});

// ======================================================
// OPCIONAL: baixar arquivo do GitHub
// ======================================================
ipcMain.handle("download-github", async (event, url, filename) => {
  const installDir = path.join(app.getPath("desktop"), "INSTALLER_JS_APP");
  const dest = path.join(installDir, filename);

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve(dest);
      });
    }).on("error", (err) => reject(err));
  });
});
