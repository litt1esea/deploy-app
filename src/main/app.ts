import { app, BrowserWindow, ipcMain, Menu, dialog } from "electron"
import path from 'path'
// import { fileURLToPath } from 'url'
import router from './router'
import './http-server'
// const getDirName = () => {
//   if (process.env.ENV_NOW == 'dev') {
//     const __filename = fileURLToPath(import.meta.url)
//     const dirname = path.dirname(__filename)
//     return dirname
//   } else {
//     return __dirname
//   }
// }


const log = (...args: any[]) => {
  console.log(`[${(new Date).toLocaleString()}]`, ...args)
}

log("electron start", process.env.ENV_NOW)

// app.setAsDefaultProtocolClient('electron')

let url: string
if (process.env.ENV_NOW == 'dev') {
  url = `http://localhost:${process.env.WEB_PORT}/`
} else if (process.env.ENV_NOW == 'prod') {
  url = `file://${path.join(__dirname, 'index.html')}`
}


let mainWindow




app.on("ready", () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // sandbox: false,
    }
  });
  mainWindow.loadURL(url)
  mainWindow.webContents.openDevTools()
  log(`electron load ${url}`)



  ///////////////////////////////////

  ipcMain.handle('system:exit', () => {
    app.quit()
  })

  let menu = Menu.buildFromTemplate([
    {
      label: '文件',
      submenu: [
        {
          label: '打开文件',
          click() {
            console.log('open folder');
          }
        },
        {
          label: '关闭文件夹'
        },
        {
          type: 'separator'
        },
        {
          label: '最小化',
          role: 'minimize',
        },
        {
          label: '关于',
          role: 'about'
        },
      ]
    },
    {
      label: '编辑',
      toolTip: '常规编辑',
      submenu: [
        {
          label: '复制',
          role: 'copy'
        },
        {
          label: '剪切',
          role: 'cut'
        },
        {
          label: '粘贴',
          role: 'paste'
        }
      ]
    },
    {
      label: '选项',
      submenu: [
        {
          label: '选项1',
          type: 'checkbox',
          checked: true,
        },
        {
          label: '选项2',
          type: 'checkbox',
        },
        {
          label: '选项3',
          type: 'checkbox',
        },
        {

          type: 'separator',
        },
        {
          label: '选项1',
          type: 'radio'
        },
        {
          label: '选项2',
          type: 'radio'
        },
        {
          label: '子菜单',
          type: 'submenu',
          role: 'windowMenu',
        },
        {
          label: '其他',
          type: 'submenu',
          submenu: [
            // { label: '子菜单1', icon: './img/sys_cpu.png', accelerator: 'ctrl + o', click() { console.log(1); } },
            { label: '子菜单2' }
          ]
        }
      ]
    }
  ])

  Menu.setApplicationMenu(menu)

  handler()
})





function handler() {


  ipcMain.handle('api:requestData', async (_, requestOption) => await router.route(requestOption))

  ipcMain.handle('system:selectWorkDir', async () => {
    return await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
  })

  ipcMain.handle('system:selectPrivateKey', async () => {
    return await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Private Key', extensions: ['pem'] }]
    })
  })
}
