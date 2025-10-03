import { readFileSync, writeFileSync } from 'fs'
import path from "path"

const dbFilePath = path.join(process.cwd(), 'database/db.json')
export function loadDB() {
    try {
        const dbText = readFileSync(dbFilePath, 'utf-8')
        const dbObj = JSON.parse(dbText)
        return dbObj
    } catch (error) {
        console.warn(error)
        const dbObj = {
            appList: [],
            history: []
        }
        saveDB(dbObj)
        return dbObj
    }
}

export function saveDB(dbObj) {
    try {
        writeFileSync(dbFilePath, JSON.stringify(dbObj, null, 2))
    } catch (error) {
        console.warn(error)
    }
}

export function findEnv(appId, envId) {
    const db = loadDB()
    const appObj = db.appList.find(app => app.appId === appId)
    const env = appObj.envList.find(env => env.envId === envId)
    return env
}
