<template>
  <el-button type="primary" color="var(--primary)" :icon="Back" @click="goBack" round>返回</el-button>


  <el-card class="form-container" shadow="hover">

    <div>
      环境： {{ envId }}----
      {{ appId }}
    </div>

    <el-form label-position="top" style="margin-top: 16px;" :disabled="loading">

      <el-form-item label="环境名称">
        <el-input v-model="formData.envName"></el-input>
      </el-form-item>

      <el-form-item label="服务器地址">
        <el-input v-model="formData.host"></el-input>
      </el-form-item>

      <el-form-item label="服务器用户名">
        <el-input v-model="formData.username"></el-input>
      </el-form-item>

      <el-form-item label="服务器密码">
        <el-input v-model="formData.password" type="password" placeholder="Please input password" show-password />

      </el-form-item>

      <el-form-item label="私钥（有私钥时无需密码）">
        <el-input v-model="formData.privateKeyPath">
          <template #append>
            <el-button type="primary" @click="onCheckFile">选择</el-button>
          </template>

        </el-input>
      </el-form-item>

      <!-- 服务器部署文件夹 -->
      <el-form-item label="服务器部署文件夹">
        <el-input v-model="formData.uploadDir"></el-input>
      </el-form-item>

      <!-- 构建脚本 -->
      <el-form-item label="构建脚本">
        <el-input v-model="formData.buildScript"></el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <div style="display: flex; justify-content: flex-end;">
        <el-button @click="copy" round :disabled="loading">复制</el-button>
        <el-button @click="onPaste" round style="margin-right: auto;" :disabled="loading">粘贴</el-button>
        <el-button @click="goBack" round :disabled="loading">取消</el-button>
        <el-button type="primary" round @click="onConfirm" :loading="loading">确定</el-button>
      </div>
    </template>
  </el-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { Back, Hide, View } from '@element-plus/icons-vue'
import { get_json, post_json, put_json } from '@/common/request'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'



const props = defineProps({

})

const route = useRoute()
const router = useRouter()

const { envId, appId } = route.query


const formData = reactive({
  "envName": "",
  "host": "",
  "username": "",
  "password": "",
  "uploadDir": "",
  "buildScript": "",
  "privateKeyPath": "",
  "lastDeploy": "",
})


function copy() {
  navigator.clipboard.writeText(JSON.stringify(formData))
}

async function onPaste() {
  const text = await navigator.clipboard.readText()
  // formData = JSON.parse(text)
  Object.assign(formData, JSON.parse(text))
}

function goBack() {
  window.history.back()
}

async function getEnv() {
  if (!envId) {
    return
  }
  const env = await get_json(`/env/${envId}`)
  Object.assign(formData, env)
}


function onCheckFile() {
  window.electronApi.selectPrivateKey()
  console.log("onCheckFile");
}



function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}


const loading = ref(false)
async function onConfirm() {
  const postData = {
    envData: formData,
    appId: appId
  }


  loading.value = true

  if (!envId) {
    await post_json('/env', postData)
    await sleep(1000)
    ElMessage.success('新增成功')

  } else {
    await put_json(`/env/${envId}`, postData)
    await sleep(1000)
    ElMessage.success('保存成功')
  }

  loading.value = false


  router.back()


}


getEnv()


</script>
<style scoped>
.form-container {
  min-width: 500px;
  max-width: 640px;
  margin: auto;
  background: #fff;
  padding: 24px;
}
</style>
