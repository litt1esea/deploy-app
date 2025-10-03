<template>
  <div class="env-list">
    <div class="env-item" v-for="env in envList" :key="env.envId">

      <div>
        <el-tag>{{ env.envName }}</el-tag>
        <el-text style="margin-left: 8px;">最后部署时间</el-text>
        <el-text size="small" style="margin-left: 8px;">{{ env.lastDeploy || '--' }}</el-text>
      </div>
      <div>
        <el-button plain size="small" color="var(--primary)" type="primary" @click="editEnv(env.envId)"
          round  :disabled="env.isBuilding">配置</el-button>
        <el-button plain size="small" color="var(--success)" type="success" @click="deployEnv(env.envId)"
          round :loading="env.isBuilding">{{ env.isBuilding ? '部署中': '部署' }}</el-button>
        <el-button plain size="small" color="var(--danger)" type="danger" @click="deleteEnv(env.envId)"
          round :disabled="env.isBuilding">删除</el-button>
      </div>

    </div>
  </div>
</template>




<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { post_json } from '@/common/request'


const router = useRouter()

const props = defineProps({
  envList: {
    type: Array,
    default: () => []
  },
  appId: {
    type: String,
  }
})




function editEnv(envId) {
  router.push({
    name: 'EnvEdit',
    query: {
      appId: props.appId,
      envId: envId
    }
  })
}



async  function deployEnv(envId) {
  console.log(envId)

  const r = await post_json('/build', {
    appId: props.appId,
    envId
  })

  console.log('r: ', r);

  
}



function deleteEnv(id) {
  console.log(id)
}


</script>




<style scoped>
.env-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.env-item {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-radius: 8px;
  justify-content: space-between;
  background: var(--el-fill-color-light);
  min-width: 540px;
}
</style>