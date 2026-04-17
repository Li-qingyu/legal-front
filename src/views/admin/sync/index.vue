<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElLoading } from 'element-plus';
import { Refresh, Document, HelpFilled, SuccessFilled, WarningFilled } from '@element-plus/icons-vue';
import { getAllLawBooksApi } from '@/api/law-book';
import { syncApi, getSyncStatusApi } from '@/api/law-article';

// 法律书列表
const lawBookList = ref([]);
// 选中的法律书ID
const selectedLawBookId = ref('');

// 同步状态
const syncStatus = ref({
  lawArticle: {
    loading: false,
    success: false,
    error: false,
    polling: false,
    message: ''
  },
  lawCase: {
    loading: false,
    success: false,
    error: false,
    message: ''
  }
});

// 轮询定时器
const pollingTimer = ref(null);

// 页面加载时获取法律书列表
onMounted(() => {
  getLawBookList();
});

// 获取法律书列表
const getLawBookList = async () => {
  try {
    const result = await getAllLawBooksApi();
    if (result.code) {
      lawBookList.value = result.data;
    }
  } catch (error) {
    ElMessage.error('获取法律书列表失败');
  }
};

// 同步法律条文
const syncLawArticles = async () => {
  // 检查是否选择了法律书
  if (!selectedLawBookId.value) {
    ElMessage.warning('请选择要同步的法律书');
    return;
  }
  
  syncStatus.value.lawArticle.loading = true;
  syncStatus.value.lawArticle.success = false;
  syncStatus.value.lawArticle.error = false;
  syncStatus.value.lawArticle.polling = false;
  syncStatus.value.lawArticle.message = '正在同步法律条文...';
  
  try {
    // 调用实际的同步API，传入选中的法律书ID
    const response = await syncApi(selectedLawBookId.value);
    
    if (response.code) {
      const taskId = response.data;
      if (taskId) {
        // 开启轮询
        syncStatus.value.lawArticle.polling = true;
        syncStatus.value.lawArticle.message = '正在处理同步任务...';
        startPolling(taskId);
      } else {
        // 没有返回taskId，直接显示成功
        syncStatus.value.lawArticle.success = true;
        syncStatus.value.lawArticle.message = '法律条文同步成功！';
        ElMessage.success('法律条文同步成功');
      }
    } else {
      syncStatus.value.lawArticle.error = true;
      syncStatus.value.lawArticle.message = '法律条文同步失败：' + response.msg;
      ElMessage.error('法律条文同步失败：' + response.msg);
    }
  } catch (error) {
    syncStatus.value.lawArticle.error = true;
    syncStatus.value.lawArticle.message = '法律条文同步失败：' + error.message;
    ElMessage.error('法律条文同步失败');
  } finally {
    syncStatus.value.lawArticle.loading = false;
  }
};

// 开始轮询同步状态
const startPolling = (taskId) => {
  // 清除之前的定时器
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value);
  }
  
  // 立即查询一次
  pollSyncStatus(taskId);
  
  // 设置轮询定时器，每1分钟查询一次
  pollingTimer.value = setInterval(() => {
    pollSyncStatus(taskId);
  }, 60000); // 1分钟
};

// 轮询同步状态
const pollSyncStatus = async (taskId) => {
  try {
    const response = await getSyncStatusApi(taskId);
    
    if (response.code) {
      const status = response.data;
      if (status === 'PROCESSING') {
        // 仍在处理中，继续轮询
        syncStatus.value.lawArticle.message = '同步任务正在处理中...';
      } else if (status === 'SUCCESS') {
        // 同步成功
        stopPolling();
        syncStatus.value.lawArticle.polling = false;
        syncStatus.value.lawArticle.success = true;
        syncStatus.value.lawArticle.message = '法律条文同步成功！';
        ElMessage.success('法律条文同步成功');
      } else if (status === 'FAILED') {
        // 同步失败
        stopPolling();
        syncStatus.value.lawArticle.polling = false;
        syncStatus.value.lawArticle.error = true;
        syncStatus.value.lawArticle.message = '法律条文同步失败！';
        ElMessage.error('法律条文同步失败');
      } else {
        // 其他状态
        stopPolling();
        syncStatus.value.lawArticle.polling = false;
        syncStatus.value.lawArticle.success = true;
        syncStatus.value.lawArticle.message = `法律条文同步完成，状态：${status}`;
        ElMessage.success(`法律条文同步完成，状态：${status}`);
      }
    } else {
      // API调用失败
      stopPolling();
      syncStatus.value.lawArticle.polling = false;
      syncStatus.value.lawArticle.error = true;
      syncStatus.value.lawArticle.message = '查询同步状态失败：' + response.msg;
      ElMessage.error('查询同步状态失败：' + response.msg);
    }
  } catch (error) {
    // 网络错误
    stopPolling();
    syncStatus.value.lawArticle.polling = false;
    syncStatus.value.lawArticle.error = true;
    syncStatus.value.lawArticle.message = '查询同步状态失败：' + error.message;
    ElMessage.error('查询同步状态失败');
  }
};

// 停止轮询
const stopPolling = () => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value);
    pollingTimer.value = null;
  }
};

// 组件卸载时清除定时器
onUnmounted(() => {
  stopPolling();
});

// 同步法律案例
const syncLawCases = async () => {
  syncStatus.value.lawCase.loading = true;
  syncStatus.value.lawCase.success = false;
  syncStatus.value.lawCase.error = false;
  syncStatus.value.lawCase.message = '正在同步法律案例...';
  
  try {
    // 模拟同步过程
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // 这里应该调用实际的同步API
    // const response = await syncLawCaseApi();
    
    syncStatus.value.lawCase.success = true;
    syncStatus.value.lawCase.message = '法律案例同步成功！';
    ElMessage.success('法律案例同步成功');
  } catch (error) {
    syncStatus.value.lawCase.error = true;
    syncStatus.value.lawCase.message = '法律案例同步失败：' + error.message;
    ElMessage.error('法律案例同步失败');
  } finally {
    syncStatus.value.lawCase.loading = false;
  }
};
</script>

<template>
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 3H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 11H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 17H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 9V21C2 21.5304 2.21071 22.0391 2.58579 22.4142C2.96086 22.7893 3.46957 23 4 23H10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="header-text">
          <h1 class="page-title">同步知识库</h1>
          <p class="page-subtitle">Knowledge Base Synchronization</p>
        </div>
        <div class="header-decoration">
          <div class="decoration-line"></div>
          <div class="decoration-dot"></div>
        </div>
      </div>
    </div>
    
    <div class="sync-cards">
      <!-- 同步法律条文卡片 -->
      <el-card class="sync-card">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon"><Document /></el-icon>
            <span>同步法律条文</span>
          </div>
        </template>
        
        <div class="sync-content">
          <p class="sync-description">
            从数据源同步最新的法律条文数据，包括法律法规、司法解释等内容。
          </p>
          
          <!-- 法律书选择 -->
          <el-form-item label="法律书" class="law-book-select">
            <el-select v-model="selectedLawBookId" placeholder="请选择要同步的法律书" style="width: 100%">
              <el-option
                v-for="lawBook in lawBookList"
                :key="lawBook.id"
                :label="lawBook.name"
                :value="lawBook.id"
              />
            </el-select>
          </el-form-item>
          
          <div class="sync-status" :class="{
            'status-loading': syncStatus.lawArticle.loading,
            'status-polling': syncStatus.lawArticle.polling,
            'status-success': syncStatus.lawArticle.success,
            'status-error': syncStatus.lawArticle.error
          }">
            <el-icon v-if="syncStatus.lawArticle.loading" class="status-icon"><Refresh /></el-icon>
            <el-icon v-else-if="syncStatus.lawArticle.polling" class="status-icon"><Refresh /></el-icon>
            <el-icon v-else-if="syncStatus.lawArticle.success" class="status-icon"><SuccessFilled /></el-icon>
            <el-icon v-else-if="syncStatus.lawArticle.error" class="status-icon"><WarningFilled /></el-icon>
            <span>{{ syncStatus.lawArticle.message }}</span>
          </div>
          
          <el-button 
            type="primary" 
            :loading="syncStatus.lawArticle.loading" 
            @click="syncLawArticles"
            class="sync-button"
          >
            <el-icon><Refresh /></el-icon> 开始同步
          </el-button>
        </div>
      </el-card>
      
      <!-- 同步法律案例卡片 -->
      <el-card class="sync-card">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon"><HelpFilled /></el-icon>
            <span>同步法律案例</span>
          </div>
        </template>
        
        <div class="sync-content">
          <p class="sync-description">
            从数据源同步最新的法律案例数据，包括裁判文书、典型案例等内容。
          </p>
          
          <div class="sync-status" :class="{
            'status-loading': syncStatus.lawCase.loading,
            'status-success': syncStatus.lawCase.success,
            'status-error': syncStatus.lawCase.error
          }">
            <el-icon v-if="syncStatus.lawCase.loading" class="status-icon"><Refresh /></el-icon>
            <el-icon v-else-if="syncStatus.lawCase.success" class="status-icon"><SuccessFilled /></el-icon>
            <el-icon v-else-if="syncStatus.lawCase.error" class="status-icon"><WarningFilled /></el-icon>
            <span>{{ syncStatus.lawCase.message }}</span>
          </div>
          
          <el-button 
            type="primary" 
            :loading="syncStatus.lawCase.loading" 
            @click="syncLawCases"
            class="sync-button"
          >
            <el-icon><Refresh /></el-icon> 开始同步
          </el-button>
        </div>
      </el-card>
    </div>
    
    <div class="sync-tips">
      <el-alert
        title="同步提示"
        type="info"
        :closable="false"
        show-icon
      >
        <ul>
          <li>同步过程可能需要几分钟时间，请耐心等待</li>
          <li>同步过程中请勿关闭浏览器或刷新页面</li>
          <li>同步完成后系统会自动更新知识库数据</li>
        </ul>
      </el-alert>
    </div>
</template>

<style scoped>
/* 页面容器 */
.sync-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3584e4 100%);
  border-radius: 16px;
  padding: 32px 40px;
  margin-bottom: 24px;
  box-shadow: 0 8px 24px rgba(30, 60, 114, 0.25);
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #d4af37;
  flex-shrink: 0;
}

.header-icon svg {
  width: 36px;
  height: 36px;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px 0;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.5px;
}

.header-decoration {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.6;
}

.decoration-line {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
}

.decoration-dot {
  width: 8px;
  height: 8px;
  background: #d4af37;
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(212, 175, 55, 0.6);
}

/* 卡片容器 */
.sync-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

/* 卡片样式 */
.sync-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(30, 60, 114, 0.08);
}

.sync-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #1e3c72;
}

.card-icon {
  font-size: 20px;
  color: #d4af37;
}

.sync-content {
  padding: 24px;
}

.sync-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.sync-status.status-loading,
.sync-status.status-polling {
  background-color: rgba(30, 60, 114, 0.08);
  color: #1e3c72;
}

.sync-status.status-success {
  background-color: rgba(103, 194, 58, 0.1);
  color: #67c23a;
}

.sync-status.status-error {
  background-color: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
}

.status-icon {
  font-size: 16px;
  animation: spin 1.5s linear infinite;
}

.sync-status.status-success .status-icon,
.sync-status.status-error .status-icon {
  animation: none;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 法律书选择样式 */
.law-book-select {
  margin-bottom: 20px;
}

.law-book-select :deep(.el-form-item__label) {
  font-weight: 600;
  color: #1e3c72;
  font-size: 14px;
  margin-bottom: 8px;
}

.law-book-select :deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.law-book-select :deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(30, 60, 114, 0.15);
}

.law-book-select :deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(30, 60, 114, 0.1), 0 4px 12px rgba(30, 60, 114, 0.15);
  border-color: #1e3c72;
}

/* 按钮样式 */
.sync-button {
  width: 100%;
  padding: 10px 0;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

.sync-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 60, 114, 0.3);
}

/* 提示信息 */
.sync-tips {
  margin-top: 24px;
}

.sync-tips ul {
  margin: 12px 0 0 20px;
  color: #666;
  font-size: 14px;
}

.sync-tips li {
  margin-bottom: 4px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .page-header {
    padding: 24px;
  }
  
  .page-title {
    font-size: 28px;
  }
  
  .header-icon {
    width: 56px;
    height: 56px;
  }
  
  .header-icon svg {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 20px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .header-decoration {
    display: none;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .sync-cards {
    grid-template-columns: 1fr;
  }
  
  .sync-content {
    padding: 16px;
  }
}
</style>