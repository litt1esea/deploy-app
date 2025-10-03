import { build } from "vite"
import path from 'path'
import vue from '@vitejs/plugin-vue'
import esbuild from 'esbuild'
import os from 'os'
import fs_ext from 'fs-extra';

import env from './env.mjs'
import { mkdir, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { getPackageJSON } from "../common/index.mjs"
import { build as elecBuild } from "electron-builder"





/**
 * 打包渲染进程
 */
async function buildRender() {

    const options = {
        root: process.cwd(),
        build: {
            enableEsbuild: true,
            minify: true,
            outDir: path.join(process.cwd(), 'release/bundled')
        },

        base: './',
        plugins: [vue()],
    }


    await build(options)
}



/**
 * 获取环境变量
 * @returns 
 */
function getEnvScript() {

    let script = "";
    for (let v in env) {
        script += `process.env.${v}='${env[v]}';`;
    }
    script += 'process.env.RES_DIR = process.resourcesPath';
    return script;
}



/**
 * 生成package.json和node_modules目录
 */
function buildModule() {
    // let pkgJSONPath = path.join(process.cwd(), 'package.json')
    let localPkgJSON = getPackageJSON()
    let electronConfig = localPkgJSON.devDependencies.electron.replace('^', '')
    // 
    delete localPkgJSON.scripts
    delete localPkgJSON.devDependencies


    localPkgJSON.type = "commonjs",
        localPkgJSON.main = 'entry.js'
    localPkgJSON.devDependencies = {
        electron: electronConfig,
    }


    try {

        writeFileSync(
            path.join(process.cwd(), 'release/bundled/package.json'),
            JSON.stringify(localPkgJSON, null, 2)
        )

        mkdirSync(path.join(process.cwd(), 'release/bundled/node_modules'))
    } catch (error) {
        console.warn(error)
    }
}


/**
 * 制作安装包
 */
async function buildInstaller() {
    const options = {
        config: {
            directories: {
                output: path.join(process.cwd(), "release"),
                app: path.join(process.cwd(), "release/bundled"),
            },
            files: ["**/*"],
            extends: null,
            productName: "todo",
            // appId: "com.yourComp.yourProduct",
            asar: false,
            // extraResources: require("../common/extraResources.js"),
            // win: require("../common/winConfig.js"),
            // mac: require("../common/macConfig.js"),
            // nsis: require("../common/nsisConfig.js"),
            publish: [{ provider: "generic", url: "" }],
        },
        project: process.cwd(),
    };

    return await elecBuild(options)
}


// 打包主进程
async function buildMain() {
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
        format: "cjs",
        sourcemap: true,
        external: ["electron"],
        banner: {
            js: `
              const { createRequire } = require('module');
              const { fileURLToPath } = require('url');
              const { dirname } = require('path');
              const require = createRequire(import.meta.url);
              const __filename = fileURLToPath(import.meta.url);
              const __dirname = dirname(__filename);
            `
        }
    })

    // 主进程写入环境变量
    let envScript = getEnvScript()
    // console.log('envScript', envScript)
    let js = `${envScript}${os.EOL}${readFileSync(outfile)}`
    writeFileSync(outfile, js)

}



async function buildPreload() {
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
}


async function copyDB() {
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
}

// 开始打包
async function start() {
    await copyDB()
    await buildRender()
    buildPreload()
    buildModule()
    buildMain()
    await buildInstaller()
}




start()