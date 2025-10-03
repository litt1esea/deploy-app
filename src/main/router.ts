import { getTasks } from './deploy'
import { addApplication, addEnvironment, getAppList, removeApplication, removeEnvironment, configEnvironment, buildEnvironment, deployAll, getHistory, clearHistory, getEnvByEnvId } from './model/dao'




class Router {
    routes: any[]
    constructor() {
        this.routes = []
    }

    register(routeConfig) {
        this.routes.push(routeConfig)
    }

    async route(requestOption) {
        let { path, method, payload } = requestOption
        for (const route of this.routes) {
            if (route.path === path && route.method === method) {
                return await route.callback(payload)
            }
        }
        return {}
    }
}


const router = new Router()

router.register({
    path: '/app-list',
    method: 'get',
    callback: getAppList
})


router.register({
    path: '/add-app',
    method: 'post',
    callback: addApplication
})

router.register({
    path: '/remove-app',
    method: 'post',
    callback: removeApplication
})

router.register({
    path: '/add-env',
    method: 'post',
    callback: (payload) => {
        payload = JSON.parse(payload)
        return addEnvironment(payload.appId, payload.envData)
    }
})
router.register({
    path: '/config-env',
    method: 'post',
    callback: (payload) => {
        payload = JSON.parse(payload)
        return configEnvironment(payload)
    }
})

router.register({
    path: '/build-env',
    method: 'post',
    callback: buildEnvironment
})


router.register({
    path: '/remove-env',
    method: 'get',
    callback: removeEnvironment
})

router.register({
    path: '/tasks',
    method: 'get',
    callback: getTasks
})
router.register({
    path: '/deploy-all',
    method: 'post',
    callback: deployAll
})

router.register({
    path: '/history',
    method: 'get',
    callback: getHistory
})

router.register({
    path: '/clear-history',
    method: 'post',
    callback: clearHistory
})


router.register({
    path: '/env',
    method: 'get',
    callback: getEnvByEnvId
})


export default router