import esbuild from 'esbuild'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { spawn } from 'child_process'
import * as electron from 'electron'
import os from 'os'
import fs_ext from 'fs-extra';

import env from './env.mjs'
import { readFileSync, writeFileSync, copyFileSync } from 'fs'


const dev = {
  server: null,
  serverPort: 1600,
  electronProcess: null,


  async createServer() {
    let options = {
      configFile: false,
      root: process.cwd(),
      server: {
        port: this.serverPort
      },
      plugins: [vue()],
      resolve: {
        alias: {
          '@': path.join(process.cwd(), 'src'),
        }
      }
    }


    this.server = await createServer(options)
    await this.server.listen()
  },

  async start() {
    await this.createServer()
    await this.copyDB()

    await this.buildMain()
    this.buildPreload()
    this.createElectronProcess()
  },


  async copyDB() {
    const dbFilePath = path.join(process.cwd(), "database")
    const dbReleaseFilePath = path.join(process.cwd(), "release/bundled/database")
    // copyFileSync(dbFilePath, path.join(process.cwd(), "release/bundled/database"))
    try {
      // 复制文件夹（自动递归）
      await fs_ext.copy(dbFilePath, dbReleaseFilePath);
      console.log('DB文件夹复制完成！');
    } catch (error) {
      console.error('复制失败:', error);
    }
  },

  async buildMain() {
    let entryFilePath = path.join(process.cwd(), "src/main/app.ts")
    // let preloadFilePath = path.join(process.cwd(), "src/preload/index.ts")

    let outfile = path.join(process.cwd(), "release/bundled/entry.js")
    // let outPreloadFile = path.join(process.cwd(), "release/bundled/preload/index.js")

    esbuild.buildSync({
      entryPoints: [entryFilePath],
      // outfile,
      outfile: outfile,
      // outdir: path.join(process.cwd(), "release/bundled"),
      minify: false,
      bundle: true,
      platform: "node",
      format: 'esm',
      sourcemap: true,
      external: ["electron"],
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      banner: {
        js: `
          import { createRequire } from 'module';
          import { fileURLToPath } from 'url';
          import { dirname } from 'path';
          const require = createRequire(import.meta.url);
          const __filename = fileURLToPath(import.meta.url);
          const __dirname = dirname(__filename);
        `
      }
    })

    // 主进程写入环境变量
    let envScript = this.getEnvScript()
    // console.log('envScript', envScript)
    let js = `${envScript}${os.EOL}${readFileSync(outfile)}`
    writeFileSync(outfile, js)

  },


  async buildPreload() {
    let preloadFilePath = path.join(process.cwd(), "src/preload/index.ts")
    let outPreloadFile = path.join(process.cwd(), "release/bundled/preload.js")

    esbuild.buildSync({
      entryPoints: [preloadFilePath],
      outfile: outPreloadFile,
      minify: false,
      bundle: true,
      platform: "node",
      format: "cjs",
      sourcemap: true,
      external: ["electron"],
    })
  },


  getEnvScript() {
    const new_env = {
      ...env,
      WEB_PORT: this.serverPort,
      RES_DIR: path.join(process.cwd(), "resource/release")
    }

    let script = ''
    for (const k of Object.keys(new_env)) {
      script += `process.env.${k} = '${new_env[k]}';`
    }
    return script
  },

  /**
   * 启动 electron
   */
  createElectronProcess() {
    this.electronProcess = spawn(electron.default, ['release/bundled/entry.js'], { cwd: process.cwd() })
    this.electronProcess.on('close', () => {
      this.server.close()
      process.exit()
    })
    this.electronProcess.stdout.on('data', (data) => {
      data = data.toString()
      console.log(data)
    })
  }


}



dev.start()