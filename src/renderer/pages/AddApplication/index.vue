<template>
    <el-button type="primary" color="var(--primary)" :icon="Back" @click="goBack" round>返回</el-button>



    <el-card class="form-container" shadow="hover">
        <el-form label-position="top" style="margin-top: 16px;">
            <el-form-item>
                <el-input v-model="formData.appName" placeholder="请输入应用名称" />
            </el-form-item>

            <el-form-item>
                <el-input v-model="formData.appWorkDir" placeholder="请输入应用工作目录">
                    <template #append>
                        <el-button type="primary" @click="onSelectWorkDir" round>选择</el-button>
                    </template>
                </el-input>
            </el-form-item>
        </el-form>

        <div style="text-align: right;">
            <el-button type="primary" @click="onConfirm" round>确定</el-button>
        </div>
    </el-card>
</template>


<script setup>
import { Back } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { post_json } from '@/common/request'
const router = useRouter()

function goBack() {
    router.back()
}


const formData = ref({
    appName: '',
    appWorkDir: '',
})


async function onConfirm() {
    try {
        await post_json('/add-app', formData.value)
        router.back()
    } catch (error) {
        console.log('error', error);
    }

}

async function onSelectWorkDir() {
    const workDir = await window.electronApi.selectWorkDir()

    console.log('workDir', workDir);

    if (workDir.canceled) {
        return
    }

    if (workDir.filePaths.length > 0) {
        formData.value.appWorkDir = workDir.filePaths[0]
    }

    // formData.value.appWorkDir = workDir.filePaths[0]
}


</script>



<style scoped>
.form-container {
    margin-top: 16px;
    padding: 32px;
    min-width: 500px;
    max-width: 640px;
    margin: auto;
    background: #fff;
}
</style>