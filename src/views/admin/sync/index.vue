<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElLoading } from 'element-plus';
import { Refresh, Document, HelpFilled, SuccessFilled, WarningFilled } from '@element-plus/icons-vue';
import { getAllLawBooksApi } from '@/api/law-book';
import { syncApi, getSyncStatusApi } from '@/api/law-article';
import { batchSyncApi, queryTaskStatusApi } from '@/api/case';

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
    polling: false,
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
  syncStatus.value.lawCase.polling = false;
  syncStatus.value.lawCase.message = '正在同步法律案例...';
  
  try {
    // 调用实际的同步API
    const response = await batchSyncApi();
    
    if (response.code) {
      const taskId = response.data;
      if (taskId) {
        // 开启轮询
        syncStatus.value.lawCase.polling = true;
        syncStatus.value.lawCase.message = '正在处理同步任务...';
        startCasePolling(taskId);
      } else {
        // 没有返回taskId，直接显示成功
        syncStatus.value.lawCase.success = true;
        syncStatus.value.lawCase.message = '法律案例同步成功！';
        ElMessage.success('法律案例同步成功');
      }
    } else {
      syncStatus.value.lawCase.error = true;
      syncStatus.value.lawCase.message = '法律案例同步失败：' + response.msg;
      ElMessage.error('法律案例同步失败：' + response.msg);
    }
  } catch (error) {
    syncStatus.value.lawCase.error = true;
    syncStatus.value.lawCase.message = '法律案例同步失败：' + error.message;
    ElMessage.error('法律案例同步失败');
  } finally {
    syncStatus.value.lawCase.loading = false;
  }
};

// 开始轮询法律案例同步状态
const startCasePolling = (taskId) => {
  // 清除之前的定时器
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value);
  }
  
  // 立即查询一次
  pollCaseSyncStatus(taskId);
  
  // 设置轮询定时器，每1分钟查询一次
  pollingTimer.value = setInterval(() => {
    pollCaseSyncStatus(taskId);
  }, 60000); // 1分钟
};

// 轮询法律案例同步状态
const pollCaseSyncStatus = async (taskId) => {
  try {
    const response = await queryTaskStatusApi(taskId);
    
    if (response.code) {
      const status = response.data;
      if (status === 'PROCESSING') {
        // 仍在处理中，继续轮询
        syncStatus.value.lawCase.message = '同步任务正在处理中...';
      } else if (status === 'SUCCESS') {
        // 同步成功
        stopPolling();
        syncStatus.value.lawCase.polling = false;
        syncStatus.value.lawCase.success = true;
        syncStatus.value.lawCase.message = '法律案例同步成功！';
        ElMessage.success('法律案例同步成功');
      } else if (status === 'FAILED') {
        // 同步失败
        stopPolling();
        syncStatus.value.lawCase.polling = false;
        syncStatus.value.lawCase.error = true;
        syncStatus.value.lawCase.message = '法律案例同步失败！';
        ElMessage.error('法律案例同步失败');
      } else {
        // 其他状态
        stopPolling();
        syncStatus.value.lawCase.polling = false;
        syncStatus.value.lawCase.success = true;
        syncStatus.value.lawCase.message = `法律案例同步完成，状态：${status}`;
        ElMessage.success(`法律案例同步完成，状态：${status}`);
      }
    } else {
      // API调用失败
      stopPolling();
      syncStatus.value.lawCase.polling = false;
      syncStatus.value.lawCase.error = true;
      syncStatus.value.lawCase.message = '查询同步状态失败：' + response.msg;
      ElMessage.error('查询同步状态失败：' + response.msg);
    }
  } catch (error) {
    // 网络错误
    stopPolling();
    syncStatus.value.lawCase.polling = false;
    syncStatus.value.lawCase.error = true;
    syncStatus.value.lawCase.message = '查询同步状态失败：' + error.message;
    ElMessage.error('查询同步状态失败');
  }
};
</script>

<template>
    <!-- 顶部标题 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
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
        </div>
        <div class="header-right">
          <div class="header-decoration">
            <div class="decoration-line"></div>
            <div class="decoration-dot"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="sync-cards">
      <!-- 同步法律条文卡片 -->
      <div class="sync-card">
        <div class="card-header">
          <el-icon class="card-icon"><Document /></el-icon>
          <span>同步法律条文</span>
        </div>
        
        <div class="sync-content">
          <p class="sync-description">
            从数据源同步最新的法律条文数据，包括法律法规、司法解释等内容。
          </p>
          
          <!-- 法律书选择 -->
          <div class="law-book-select">
            <label class="section-label">法律书</label>
            <el-select v-model="selectedLawBookId" placeholder="请选择要同步的法律书" style="width: 100%">
              <el-option
                v-for="lawBook in lawBookList"
                :key="lawBook.id"
                :label="lawBook.name"
                :value="lawBook.id"
              />
            </el-select>
          </div>
          
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
      </div>
      
      <!-- 同步法律案例卡片 -->
      <div class="sync-card">
        <div class="card-header">
          <el-icon class="card-icon"><HelpFilled /></el-icon>
          <span>同步法律案例</span>
        </div>
        
        <div class="sync-content">
          <p class="sync-description">
            从数据源同步最新的法律案例数据，包括裁判文书、典型案例等内容。
          </p>
          
          <div class="sync-status" :class="{
            'status-loading': syncStatus.lawCase.loading,
            'status-polling': syncStatus.lawCase.polling,
            'status-success': syncStatus.lawCase.success,
            'status-error': syncStatus.lawCase.error
          }">
            <el-icon v-if="syncStatus.lawCase.loading" class="status-icon"><Refresh /></el-icon>
            <el-icon v-else-if="syncStatus.lawCase.polling" class="status-icon"><Refresh /></el-icon>
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
      </div>
    </div>
    
    <div class="sync-tips">
      <div class="tips-card">
        <div class="tips-header">
          <el-icon class="tips-icon"><HelpFilled /></el-icon>
          <h3 class="tips-title">同步提示</h3>
        </div>
        <div class="tips-content">
          <ul>
            <li>同步过程可能需要几分钟时间，请耐心等待</li>
            <li>同步过程中请勿关闭浏览器或刷新页面</li>
            <li>同步完成后系统会自动更新知识库数据</li>
          </ul>
        </div>
      </div>
    </div>
</template>

<style scoped>
/* 页面变量 */
:root {
  --bg-primary: #F7F5F0;
  --bg-secondary: #FFFFFF;
  --accent: #C9A962;
  --accent-light: #E8D5A3;
  --accent-dark: #A68B4B;
  --text-primary: #1A1A1A;
  --text-secondary: #4A4A4A;
  --text-muted: #7A7A7A;
  --border: #E0DCD4;
  --card-shadow: 0 2px 12px rgba(45, 59, 53, 0.08);
  --card-shadow-hover: 0 8px 24px rgba(45, 59, 53, 0.12);
  --sidebar-bg: #1E3A2F;
}

/* 页面容器 */
.sync-container {
  padding: 20px;
  background-color: var(--bg-primary);
  min-height: 100vh;
}

/* 页面头部样式 - 悬浮卡片效果 */
.page-header {
  background: linear-gradient(135deg, #1E3A2F 0%, #2A4A3F 100%) !important;
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 24px;
  box-shadow: 
    0 4px 6px rgba(30, 58, 47, 0.05),
    0 10px 20px rgba(30, 58, 47, 0.1),
    0 20px 40px rgba(30, 58, 47, 0.15);
  border: 1px solid rgba(201, 169, 98, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}

.page-header:hover {
  box-shadow: 
    0 6px 12px rgba(30, 58, 47, 0.08),
    0 16px 32px rgba(30, 58, 47, 0.15),
    0 30px 60px rgba(30, 58, 47, 0.2);
  transform: translateY(-4px);
  border-color: rgba(201, 169, 98, 0.35);
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}

.page-header::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(201, 169, 98, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  transition: all 0.5s ease;
}

.page-header:hover::after {
  transform: scale(1.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #C9A962, #E8D5A3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sidebar-bg);
  flex-shrink: 0;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.3);
}

.header-icon:hover {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 0 6px 16px rgba(201, 169, 98, 0.4);
}

.header-icon svg {
  width: 28px;
  height: 28px;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 6px 0;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 255, 255, 0.3);
  font-family: 'Cormorant Garamond', Georgia, serif;
  line-height: 1.2;
  transition: all 0.3s ease;
}

.page-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 500;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.4);
  line-height: 1.3;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.header-right {
  display: flex;
  gap: 16px;
  align-items: center;
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
  background: var(--bg-secondary);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 
    0 2px 4px rgba(45, 59, 53, 0.04),
    0 6px 12px rgba(45, 59, 53, 0.06),
    0 16px 28px rgba(45, 59, 53, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(224, 220, 212, 0.8);
  position: relative;
}

.sync-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  border-radius: 14px 14px 0 0;
}

.sync-card:hover {
  box-shadow: 
    0 4px 8px rgba(45, 59, 53, 0.06),
    0 12px 24px rgba(45, 59, 53, 0.1),
    0 24px 48px rgba(45, 59, 53, 0.12);
  transform: translateY(-3px);
  border-color: rgba(201, 169, 98, 0.3);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-primary);
  font-family: 'Cormorant Garamond', Georgia, serif;
  letter-spacing: 0.5px;
}

.card-icon {
  font-size: 20px;
  color: var(--accent-dark);
  background: rgba(201, 169, 98, 0.15);
  padding: 6px;
  border-radius: 6px;
}

.sync-content {
  padding: 24px;
}

.sync-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
  line-height: 1.5;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.sync-status.status-loading,
.sync-status.status-polling {
  background-color: rgba(201, 169, 98, 0.1);
  color: var(--accent-dark);
  border: 1px solid rgba(201, 169, 98, 0.2);
}

.sync-status.status-success {
  background-color: rgba(72, 187, 120, 0.12);
  color: #2F855A;
  border: 1px solid rgba(72, 187, 120, 0.2);
}

.sync-status.status-error {
  background-color: rgba(229, 62, 62, 0.12);
  color: #C53030;
  border: 1px solid rgba(229, 62, 62, 0.2);
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

.law-book-select .section-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 80px;
  flex-shrink: 0;
  white-space: nowrap;
  line-height: 1.4;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 8px;
  display: block;
}

.law-book-select :deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(45, 59, 53, 0.06);
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--bg-primary) !important;
}

.law-book-select :deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(45, 59, 53, 0.1);
  border-color: var(--accent-light);
}

.law-book-select :deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(201, 169, 98, 0.15);
  border-color: var(--accent);
}

.law-book-select :deep(.el-select .el-input__inner) {
  color: var(--text-primary);
  font-size: 14px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 按钮样式 */
.sync-button {
  width: 100%;
  padding: 10px 0;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.3);
  background: linear-gradient(135deg, #C9A962, #E8D5A3);
  color: var(--sidebar-bg);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.sync-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.6s ease;
  z-index: -1;
}

.sync-button:hover::before {
  left: 100%;
}

.sync-button:hover {
  background: linear-gradient(135deg, #E8D5A3, #C9A962);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(201, 169, 98, 0.4);
}

/* 提示信息 */
.sync-tips {
  margin-top: 24px;
}

.tips-card {
  background: var(--bg-secondary);
  border-radius: 14px;
  border: 1px solid rgba(224, 220, 212, 0.8);
  box-shadow: 
    0 2px 4px rgba(45, 59, 53, 0.04),
    0 6px 12px rgba(45, 59, 53, 0.06),
    0 16px 28px rgba(45, 59, 53, 0.08);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.tips-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  border-radius: 14px 14px 0 0;
}

.tips-card:hover {
  box-shadow: 
    0 4px 8px rgba(45, 59, 53, 0.06),
    0 12px 24px rgba(45, 59, 53, 0.1),
    0 24px 48px rgba(45, 59, 53, 0.12);
  transform: translateY(-3px);
  border-color: rgba(201, 169, 98, 0.3);
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-primary);
}

.tips-icon {
  font-size: 20px;
  color: var(--accent-dark);
  background: rgba(201, 169, 98, 0.15);
  padding: 6px;
  border-radius: 6px;
}

.tips-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  font-family: 'Cormorant Garamond', Georgia, serif;
  letter-spacing: 0.5px;
}

.tips-content {
  padding: 24px;
}

.tips-content ul {
  margin: 0;
  padding-left: 20px;
  color: var(--text-secondary);
  font-size: 14px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.tips-content li {
  margin-bottom: 8px;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .page-header {
    padding: 24px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .header-icon {
    width: 48px;
    height: 48px;
  }
  
  .header-icon svg {
    width: 24px;
    height: 24px;
  }
  
  .sync-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 20px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .header-left {
    flex-direction: column;
    text-align: center;
  }
  
  .header-decoration {
    display: none;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .sync-content {
    padding: 16px;
  }
  
  .tips-content {
    padding: 16px;
  }
}
</style>