import eventBus from "../../../common/event-bus"
import Alert from './Alert.vue'

import { createVNode, render } from 'vue'

export function alert(params: any) {
    return new Promise((resolve, reject) => {
        // 渲染组件
        render(createVNode(Alert, params, null), document.body)
        params.__alertPromiseId = `alertPromiseId_${Math.random()}`
        // 
        eventBus.once(params.__alertPromiseId, (result) => resolve(result))
        eventBus.emit('alert', params)
    })
}
