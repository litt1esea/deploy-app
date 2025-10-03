import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import router from './router'
import { loadDB, saveDB, findEnv } from "./model/db"
import { getTasks } from './deploy'
import { addEnvironment, buildEnvironment, configEnvironment, getEnvByEnvId } from './model/dao'
const server = express()

server.use(cors())
server.use(bodyParser.json())

server.listen(1599, () => {
  console.log(`http server start http://localhost:1599`)
})



server.post('/api/requestData', async (req, res) => {
  const requestOption = req.body

  console.log('requestOption: ', requestOption)
  const result = await router.route(requestOption)
  res.json(result)
})



server.get('/api/app', (req, res) => {
  const db = loadDB()
  res.json(db)
})


server.get('/api/tasks', async (req, res) => {
  const tasks = await getTasks()
  res.json(tasks)
})


server.get('/api/env/:envId', (req, res) => {
  const envId = req.params.envId
  const env = getEnvByEnvId({ envId })

  res.json(env)
})


server.post('/api/env', (req, res) => {
  const payload = req.body
  const env = addEnvironment(payload.appId, payload.envData)
  res.json(env)
})


server.put('/api/env/:envId', (req, res) => {
  const envId = req.params.envId
  const payload = req.body

  const env = {
    ...payload,
    envId: envId
  }

  console.log('env: ', env);
  
  const r = configEnvironment(env)
  // const env = findEnv(payload.appId, envId)
  // if (env) {
  //   Object.assign(env, payload.envData)
  //   saveDB()
  // }
  res.json(r)
})




server.post('/api/build', async (req, res) => {
  const payload = req.body
  const r = await buildEnvironment(payload)
  res.json(r)
})
