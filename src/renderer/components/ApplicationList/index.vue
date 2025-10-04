<template>
  <div class="application-list">
    <div class="app-list">
      <el-card shadow="hover" class="app-card" v-for="app in appList" :key="app.id" >

        <template #header>
          <div class="app-name">
            <span>{{ app.appName }}</span>
            <el-button type="primary" link :icon="Edit" @click="onEditApp(app.appId)" >编辑</el-button>
            <el-button type="primary" link :icon="Delete" @click="onDeleteApp(app.appId)" >删除</el-button>
          </div>
        </template>



        <div class="">文件目录：<span class="app-work-dir">{{ app.appWorkDir }}</span></div>
        <EnvList :envList="app.envList" :appId="app.appId" />

        <el-button type="primary" link :icon="Plus" @click="onAddEnv(app.appId)"
          style="margin-top: 16px;">添加环境</el-button>
      </el-card>
    </div>
    <div class="task-list">

      <div>当前任务
        <span style="color: var(--primary); font-weight: bold;">{{ taskList.length }}</span>

        <el-button link type="primary" @click="showHistory">历史任务</el-button>
      </div>
      <el-card shadow="hover" v-for="task in taskList" :key="task.id">
        <!-- {{ task }} -->

        <div>
          <div class="task-name">
            <span>{{ task.config.appName }}</span>
            <el-tag>{{ task.config.envName }}</el-tag>
          </div>
          <div>
            <span>部署用时: </span>
            <span>{{ calcTime(task.st) }}</span>
          </div>
          <div>
            <span>状态: </span>
            <span>{{ task.status }}</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>


  <el-drawer v-model="historyDialog" title="历史记录" size="60%">
    <el-scrollbar>
      <el-table :data="history">
        <el-table-column prop="config.appName" label="应用名称"></el-table-column>
        <el-table-column prop="config.envName" label="环境名称">
          <template #default="{ row }">
            <el-tag>{{ row.config.envName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="st" label="部署时间"></el-table-column>
        <el-table-column prop="duration" label="用时">
          <template #default="{ row }">
            {{ calcTime(row.st, row.et) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status == 'failed' ? 'danger' : 'success'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-scrollbar>
  </el-drawer>


</template>



<script setup>
import { onUnmounted, ref } from 'vue'
import { Plus, Edit, Delete, } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { get_json, delete_json } from '@/common/request'
import EnvList from '../EnvList/index.vue'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const appList = ref([])
const taskList = ref([])
const history = ref([])


let appTimer
async function updateAppList() {
  const data = await get_json('/app')
  console.log(data);

  appList.value = data.appList
  history.value = data.history


  appTimer = setTimeout(() => {
    updateAppList()
  }, 1000)
}

let taskTimer
async function updateTaskList() {
  const data = await get_json('/tasks')
  console.log('tasks', data);
  taskList.value = data
  taskTimer = setTimeout(() => {
    updateTaskList()
  }, 1000)
}

onUnmounted(() => {
  clearTimeout(taskTimer)
  clearTimeout(appTimer)
})


updateAppList()
updateTaskList()




function onAddEnv(appId) {
  router.push({
    name: 'EnvEdit',
    query: {
      appId
    }
  })
}


function onEditApp(appId) {
  router.push({
    name: 'AppEdit',
    params: {
      appId
    }
  })
}

async function onDeleteApp(appId) {
  console.log('onDeleteApp', appId);


  const ok = await ElMessageBox.confirm('确定删除该应用吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  if (!ok) {
    return
  }


  const r = await delete_json('/app', { appId })
  console.log('r', r);
  
  // delete_json('/app', { appId })
  updateAppList()
}



function calcTime(time, endTime) {
  if (!time) {
    return
  }

  if (!endTime) {
    endTime = new Date()
  }

  return msToTime(new Date(endTime) - new Date(time))

}


function msToTime(duration) {
  var milliseconds = Math.floor((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds
}


const historyDialog = ref(false)



function showHistory() {
  historyDialog.value = true

}


</script>




<style scoped>
.application-list {
  display: flex;
}

.app-list {
  flex: 1;
}

.app-card {
  margin-top: 8px;
}

.task-list {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
}

.task-name {
  display: flex;
  justify-content: space-between;
}

.app-work-dir {
  color: var(--success);
}

.card-item {
  display: flex;
  gap: 8px;
  /* margin-top: 8px; */
}

.card-name {
  color: #666;
}

.card-value {
  color: var(--black);
}
</style>