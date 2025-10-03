import { createApp } from 'vue'

import router from './router'

// element-plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'



// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'



// Components
import App from './main.vue'
import './style/index.css'



const vuetify = createVuetify({
  components,
  directives,
})

console.log('start')


const app = createApp(App)

app.use(router)
app.use(ElementPlus)
app.use(vuetify)
app.mount('#app')

