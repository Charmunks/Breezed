import fs from "fs";
import path from "path";
import os from "os";

const configDir = path.join(os.homedir(), ".breezed");
const configPath = path.join(configDir, "config.json");

const defaultConfig = {
  apiUrl: "https://api.breezed.dev"
};

function ensureConfigDir() {
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}

function loadConfig() {
  ensureConfigDir();
  if (!fs.existsSync(configPath)) {
    return { ...defaultConfig };
  }
  try {
    const data = fs.readFileSync(configPath, "utf-8");
    return { ...defaultConfig, ...JSON.parse(data) };
  } catch {
    return { ...defaultConfig };
  }
}

function saveConfig(config) {
  ensureConfigDir();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function getApiUrl() {
  return loadConfig().apiUrl;
}

function setApiUrl(url) {
  const config = loadConfig();
  config.apiUrl = url;
  saveConfig(config);
}

function getAuth() {
  return loadConfig().auth || null;
}

function setAuth(token) {
  const config = loadConfig();
  config.auth = token;
  saveConfig(config);
}

export { loadConfig, saveConfig, getApiUrl, setApiUrl, getAuth, setAuth, defaultConfig };
