<template>
  <el-button type="primary" round :icon="Plus" @click="onAddApplication">添加应用</el-button>
  <ApplicationList />
</template>

<script setup>
import ApplicationList from '../../components/ApplicationList/index.vue'
import { Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
function onAddApplication() {
  router.push('/add-application')
}

</script>