import { randomUUID } from 'crypto'
import { IAppEnv } from './IAppEnv'

class AppEnv implements IAppEnv {

    envName: string
    host: string
    username: string
    password: string
    uploadDir: string
    buildScript: string
    privateKeyPath: string
    lastDeploy: any
    isBuilding: boolean
    envId: string

    constructor(data: any) {
        this.envName = data.envName
        this.host = data.host
        this.username = data.username
        this.password = data.password
        this.uploadDir = data.uploadDir
        this.buildScript = data.buildScript
        this.privateKeyPath = data.privateKeyPath
        this.lastDeploy = null
        this.isBuilding = false
        this.envId = randomUUID()
    }

}
export {
    AppEnv
}