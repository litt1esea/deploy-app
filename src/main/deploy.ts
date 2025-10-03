/*
 * @Author: yanghailong 
 * @Date: 2025-09-12 14:26:26 
 * @Last Modified by: yanghailong
 * @Last Modified time: 2025-09-12 15:08:29
 */

// import compressing from 'compressing'
import { createReadStream, createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { createGzip } from 'zlib'
import { create } from 'archiver'
import { exec } from 'child_process'
import { NodeSSH } from 'node-ssh'
import fs from 'fs'
import path from 'path'
// import dayjs from 'dayjs'
import { randomUUID } from 'crypto'
import { findEnv, saveDB, loadDB } from './model/db'
import dayjs from 'dayjs'

function log(...args) {
    let t = '[' + new Date().toLocaleString() + ']'
    console.log.call(console, t, ...args)
}


const fileCachePath = `/workspace/__filecache`

class DeployTask {
    config: any
    args: any
    taskId: string
    ssh: NodeSSH
    isRunning: boolean
    _completeFuncs: any[]
    st: string
    et: string | null
    status: string

    constructor(config: any, args: any) {
        this.config = config || {}
        this.args = args
        this.taskId = randomUUID()
        this.ssh = new NodeSSH()
        this.isRunning = false

        this._completeFuncs = []
        this.st = dayjs().format('YYYY-MM-DD HH:mm:ss')
        this.et = null
        this.status = 'unstart'
    }

    toJSON() {
        return {
            config: this.config,
            taskId: this.taskId,
            isRunning: this.isRunning,
            status: this.status,
            st: this.st,
            et: this.et,
        }
    }

    get tag() {
        return `[${this.config.appName}][${this.config.envName}]`
    }

    onComplele(fn) {
        if (typeof fn === 'function') {
            this._completeFuncs.push(fn)
        }
    }

    runCompleteCallback(bool=false) {
        this._completeFuncs.forEach(fn => {
            fn(bool)
        })
    }

    // 保存状态到db
    updateStatus(callback) {
        const db = loadDB()
        const appObj = db.appList.find(app => app.appId === this.args.appId)
        const env = appObj.envList.find(env => env.envId === this.args.envId)
        callback && callback(db, env)
        saveDB(db)
    }

    async run() {
        const { config, ssh } = this
        console.log('------->', config)
        let name = `${this.tag}部署用时`
        console.time(name)
        this.isRunning = true

        try {
            // await updatePkgJson(env)            
            await this.build()
            await this.compress()
            await this.connect()
            await this.upload()
            await this.cleanRemote()
            await this.uncompress()
            await this.cleanLocal()
        } catch (error) {
            console.error(error)
            log('-------------22-----------')
            this.status = 'failed'
        } finally {
            ssh.dispose()
            this.isRunning = false
            log('-------------11-----------')

            this.updateStatus((db, env) => {
                env.isBuilding = false
                env.lastDeploy = dayjs().format('YYYY-MM-DD HH:mm:ss')
                this.et = env.lastDeploy
            })

            this.runCompleteCallback()
        }
        console.timeEnd(name)
    }


    /**
     * 打包文件
     * @returns 
     */

    build() {
        log('开始打包')
        this.status = 'building'
        const { config } = this
        return new Promise((resolve, reject) => {
            // 定义要切换到的路径  
            const projectPath = config.appWorkDir;

            // 定义打包命令  
            const packageCommand = config.buildScript;

            // 切换到项目路径并执行打包命令  
            exec(`cd ${projectPath} && ${packageCommand}`, (error, stdout, stderr) => {
                if (error) {
                    log('打包失败')
                    reject(new Error(`执行错误: ${error.message}`))
                } else {
                    resolve(void 0)
                    log('打包完成')
                }

                console.log(`输出：${stdout}`)
                console.error(`错误输出：${stderr}`)
            })
        })
    }


    /**
     * 将打包后的文件压缩
     */
    async compress() {
        this.status = 'compressing'
        const { config } = this
        let source = path.join(config.appWorkDir, 'dist')
        let fileDest = path.join(config.appWorkDir, config.uploadFile)
        
        return new Promise((resolve, reject) => {
            const output = createWriteStream(fileDest)
            const archive = create('zip', { zlib: { level: 9 } })
            
            output.on('close', () => {
                log('压缩完成')
                resolve(void 0)
            })
            
            archive.on('error', (err) => {
                reject(err)
            })
            
            archive.pipe(output)
            archive.directory(source, false)
            archive.finalize()
        })
    }


    /**
     * 连接ssh
     */
    async connect() {
        this.status = 'connecting'
        const { config, ssh } = this
        await ssh.connect({
            host: config.host,
            username: config.username,
            password: config.password,
            privateKeyPath: config.privateKeyPath
        })
    }


    /**
     * 清除远程文件
     */
    async cleanRemote() {
        this.status = 'cleaningRemote'
        const { config, ssh } = this

        if (!config.uploadDir) {
            throw new Error('不能为空目录')
        }
        if (config.uploadDir == '/') {
            throw new Error('不能为根目录')
        }
        await ssh.execCommand(`rm -rf *`, {
            cwd: config.uploadDir,
        })
        log('旧文件删除成功')
    }



    /**
     * 上传文件
     */
    async upload() {
        this.status = 'uploading'
        const { config, ssh } = this
        // console.log(`${(new Date).toLocaleString()} 连接成功， 开始上传`)
        // log('开始上传')
        // let filePath = path.join(config.appWorkDir, config.uploadFile)
        // let remotePath = path.join(config.uploadDir, config.uploadFile)
        // await ssh.putFile(filePath, remotePath)
        // log('上传成功')

        log('开始上传config', config)
        let filePath = path.join(config.appWorkDir, config.uploadFile)
        let remotePath = path.join(fileCachePath, config.uploadFile)
        await ssh.execCommand(`mkdir -p ${fileCachePath}`)
        await ssh.putFile(filePath, remotePath)
        log('上传成功')
    }



    /**
     * 解压文件
     */
    async uncompress() {
        this.status = 'uncompressing'
        const { config, ssh } = this

        // await ssh.execCommand(`unzip -o ${config.uploadFile}`, {
        //     cwd: config.uploadDir,
        // })
        // await ssh.execCommand(`mv dist/* ./`, {
        //     cwd: config.uploadDir,
        // })
        // await ssh.execCommand(`rm -f ${config.uploadFile}`, {
        //     cwd: config.uploadDir,
        // })
        // await ssh.execCommand(`rmdir dist`, {
        //     cwd: config.uploadDir,
        // })


        await ssh.execCommand(`unzip -o ${config.uploadFile}`, {
            cwd: fileCachePath,
        })
        await ssh.execCommand(`mv dist/* ${config.uploadDir}`, {
            cwd: fileCachePath,
        })
        await ssh.execCommand(`rm -rf ${fileCachePath}`)
    }

    /**
     * 清除旧文件
     */
    async cleanLocal() {
        this.status = 'cleaningLocal'
        const { config } = this
        let filePath = path.join(config.appWorkDir, config.uploadFile)
        try {
            fs.rmSync(filePath)
        } catch (error) {
            console.error(error)
        }
        this.status = 'completed'
    }

}


class DeployTaskManager {
    deployTasks: DeployTask[]
    constructor() {
        this.deployTasks = []
    }
    addTask(task: DeployTask) {
        if (task instanceof DeployTask) {
            task.run()
            task.updateStatus((db, env) => {
                env.isBuilding = true
            })
            task.onComplele(() => {
                this.removeTask(task)
                addToHistory(task)
            })
            this.deployTasks.push(task)
            return task
        }
    }



    removeTask(task: DeployTask) {
        this.deployTasks = this.deployTasks.filter(deployTask => deployTask !== task)
    }

    toJSON() {
        return this.deployTasks.map(deployTask => deployTask.toJSON())
    }

    // // 保存状态到db
    // updateStatus(task, callback) {
    //     if (task instanceof DeployTask) {
    //         const db = loadDB()
    //         const appObj = db.appList.find(app => app.appId === task.args.appId)
    //         const env = appObj.envList.find(env => env.envId === task.args.envId)
    //         callback && callback(db, env)
    //         saveDB(db)
    //     }
    // }
}


const deployTaskManager = new DeployTaskManager()


function addToHistory(task: DeployTask) {
    const db = loadDB()
    db.history.push(task.toJSON())
    saveDB(db)
}

function deploy(config, { appId, envId }) {
    const db = loadDB()

    const envList = db.appList.find(app => app.appId === appId)?.envList ?? []
    const appIsBuilding = envList.some(env => env.isBuilding)

    if (appIsBuilding) {
        return false
    }
   
    return deployTaskManager.addTask(new DeployTask(config, { appId, envId }))
}

function getTasks() {
    return deployTaskManager.toJSON()
}

export {
    deploy,
    getTasks,
}