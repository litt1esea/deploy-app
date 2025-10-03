import { randomUUID } from 'crypto'
import { IAppEntity } from "./IAppEntity"
import { IAppEnv } from "./IAppEnv"

class AppEntity implements IAppEntity {
    
    appName: string
    appWorkDir: string
    envList: IAppEnv[]
    appId: string
    
    constructor(appName: string, appWorkDir: string) {
        this.appName = appName
        this.appWorkDir = appWorkDir
        this.envList = []
        this.appId = randomUUID()
    }
}

export {
    AppEntity
}