// ===== IMPORTS (TEM QUE SER NO TOPO) =====
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ===== FUNÇÃO PARA ACHAR O INNO SETUP =====
function findISCC() {
  const paths = [
    "C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe",
    "C:\\Program Files\\Inno Setup 6\\ISCC.exe"
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      return `"${p}"`;
    }
  }

  throw new Error("❌ Inno Setup não encontrado. Instale o Inno Setup 6.");
}

// ===== CONFIG =====
const outDir = path.join(__dirname, "build");
const tempIss = path.join(__dirname, "wizard_runtime.iss");

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

// ===== SCRIPT INNO (GERADO) =====
const iss = `
[Setup]
AppName=INSTALLER.JS
AppVersion=1.0.0
DefaultDirName={pf}\\INSTALLER.JS
OutputDir=${outDir.replace(/\\/g, "\\\\")}
OutputBaseFilename=Installer
WizardStyle=modern
Compression=lzma
SolidCompression=yes
`;

// ===== ESCREVE .ISS TEMPORÁRIO =====
fs.writeFileSync(tempIss, iss);

// ===== COMPILA =====
const isccPath = findISCC();
console.log("🧙‍♂️ Gerando installer com wizard...");
execSync(`${isccPath} "${tempIss}"`, { stdio: "inherit" });

// ===== LIMPA =====
fs.unlinkSync(tempIss);

console.log("✅ Installer gerado com sucesso!");

