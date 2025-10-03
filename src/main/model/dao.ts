import { AppEntity } from "./AppEntity"
import { AppEnv } from "./AppEnv"
import { deploy } from "../deploy"
import { loadDB, saveDB, findEnv } from "./db"


export function addApplication(data) {
  const db = loadDB()
  const appInfo = new AppEntity(data.appName, data.appWorkDir)
  db.appList.push(appInfo)

  saveDB(db)

  return appInfo
}


export function removeApplication(appId) {
  const db = loadDB()
  db.appList = db.appList.filter(app => app.appId !== appId)
  saveDB(db)

  return appId
}


export function addEnvironment(appId, envData) {
  const db = loadDB()
  const appObj = db.appList.find(app => app.appId === appId)

  if (!appObj.envList) {
    appObj.envList = []
  }

  let env = new AppEnv(envData)
  appObj.envList.push(env)

  saveDB(db)

  return env
}

export function removeEnvironment({ appId, envId }) {
  const db = loadDB()
  const appObj = db.appList.find(app => app.appId === appId)

  appObj.envList = appObj.envList.filter(env => env.envId !== envId)


  saveDB(db)

  return envId
}

export function configEnvironment({ appId, envId, envData }) {
  const db = loadDB()
  const appObj = db.appList.find(app => app.appId === appId)
  const envIndex = appObj.envList.findIndex(env => env.envId === envId)

  appObj.envList[envIndex] = new AppEnv(envData)

  saveDB(db)

  return envId
}





export async function buildEnvironment({ appId, envId }) {
  const db = loadDB()
  const appObj = db.appList.find(app => app.appId === appId)
  const env = appObj.envList.find(env => env.envId === envId)

  const buildConfig = {
    appName: appObj.appName,
    appWorkDir: appObj.appWorkDir,
    uploadFile: 'dist.zip',
    ...env
  }

  try {
    const task = deploy(buildConfig, { appId, envId })
    if (task) {
      return task.toJSON()
    }
    return task
  }
  catch (error) {
    console.warn(error)
    // env.isBuilding = false
    // saveDB(db)
    return {}
  }
}


export function getAppList() {
  const db = loadDB()
  return db.appList
}



export function deployAll(envName = 'dev') {
  const db = loadDB()
  const tasks = []

  db.appList.map(appObj => {
    appObj.envList.map(env => {
      if (env.envName === envName) {
        const config = {
          appName: appObj.appName,
          appWorkDir: appObj.appWorkDir,
          uploadFile: 'dist.zip',
          ...env
        }
        const args = {
          appId: appObj.appId,
          envId: env.envId
        }
        tasks.push(deploy(config, args))
      }

    })
  })

  return tasks
}


export function getHistory() {
  const db = loadDB()
  return db.history
}


export function clearHistory() {
  const db = loadDB()
  db.history = []
  saveDB(db)
}


export function getEnvByEnvId({envId}) {
  const db = loadDB()
  console.log(envId);
  
  for (const app of db.appList) {
    for (const env of app.envList) {
      if (env.envId === envId) {
        return env
      }
    }
  }
}