import { IAppEnv } from "./IAppEnv"

export interface IAppEntity {
    appName: string
    appWorkDir: string
    envList: IAppEnv[]
    appId: string
}