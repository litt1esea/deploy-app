export interface IAppEnv {
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
}