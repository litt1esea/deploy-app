// src/preload/index.ts
var { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronApi", {
  exit: () => ipcRenderer.invoke("system:exit"),
  requestData: async (...args) => await ipcRenderer.invoke("api:requestData", ...args),
  selectWorkDir: async () => await ipcRenderer.invoke("system:selectWorkDir"),
  selectPrivateKey: async () => await ipcRenderer.invoke("system:selectPrivateKey")
});
//# sourceMappingURL=preload.js.map
