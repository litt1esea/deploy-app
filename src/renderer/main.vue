<template>

  <router-view />

  <el-button @click="exit" style="margin-top: 16px" type="primary" color="var(--primary)" round>退出</el-button>
</template>

<script setup lang="ts">
import { alert } from './components/Alert'

async function exit() {
  const ok = await alert({
    info: '确定要退出吗?'
  })
  if (ok) {
    window.electronApi.exit()
  }
}
</script>
<style></style>