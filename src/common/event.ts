import events from 'events'
import { ipcRenderer, ipcMain, webContents } from "electron"

class Eventer {
    private instance;
    emit(eventName, eventArgs) {
        this.instance.emit(eventName, eventArgs);
        if (ipcMain) {
            webContents.getAllWebContents().forEach((wc) => {
                wc.send("__eventPipe", { eventName, eventArgs });
            });
        }
        if (ipcRenderer) {
            ipcRenderer.invoke("__eventPipe", { eventName, eventArgs });
        }
    }
    on(eventName, callBack) {
        this.instance.on(eventName, callBack);
    }
    initEventPipe() {
        if (ipcRenderer) {
            ipcRenderer.on("__eventPipe", (e, { eventName, eventArgs }) => {
                this.instance.emit(eventName, eventArgs);
            });
        }
        if (ipcMain) {
            ipcMain.handle("__eventPipe", (e, { eventName, eventArgs }) => {
                this.instance.emit(eventName, eventArgs);
                webContents.getAllWebContents().forEach((wc) => {
                    if (wc.id != e.sender.id) {
                        wc.send("__eventPipe", { eventName, eventArgs });
                    }
                });
            });
        }
    }
    constructor() {
        this.instance = new events.EventEmitter();
        this.instance.setMaxListeners(Infinity);
        this.initEventPipe();
    }
}
export const eventer = new Eventer();