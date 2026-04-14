<template>
  <div class="law-detail-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="page-header-container">
        <h1 class="page-title">{{ lawArticle.articleTitle }}</h1>
        <p class="page-subtitle">法律条文详情</p>
      </div>
    </div>

    <!-- 法律条文详情 -->
    <div class="law-detail-section">
      <div class="law-detail-container">
        <div class="law-detail-card">
          <div class="law-detail-header">
            <div class="law-status" :class="{ 'status-active': isEffective }">
              {{ isEffective ? '生效' : '未生效' }}
            </div>
          </div>
          
          <div class="law-detail-content">
            <p>{{ lawArticle.content }}</p>
          </div>
          
          <div class="law-detail-meta">
            <div class="meta-item">
              <span class="meta-label">发布时间：</span>
              <span class="meta-value">{{ lawArticle.publishDate }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">生效时间：</span>
              <span class="meta-value">{{ lawArticle.effectiveDate }}</span>
            </div>
            <div class="meta-item" v-if="lawArticle.remark">
              <span class="meta-label">备注：</span>
              <span class="meta-value">{{ lawArticle.remark }}</span>
            </div>
          </div>
          
          <div class="law-detail-actions">
            <el-button type="primary" @click="goBack">返回列表</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { queryInfoApi as queryLawArticleInfoApi } from '@/api/law-article';
import { useRouter, useRoute } from 'vue-router';

// 路由参数
const route = useRoute();
const router = useRouter();

// 法律条文ID
const lawArticleId = computed(() => route.params.id);

// 法律条文信息
const lawArticle = ref({
  articleTitle: '',
  content: '',
  publishDate: '',
  effectiveDate: '',
  lawBookId: '',
  bookTitle: '',
  articleOrder: 0,
  remark: ''
});



// 判断是否生效
const isEffective = computed(() => {
  if (!lawArticle.value.effectiveDate) return false;
  const effectiveDate = new Date(lawArticle.value.effectiveDate);
  const currentDate = new Date();
  return effectiveDate <= currentDate;
});

// 初始化数据
onMounted(async () => {
  await loadLawArticleInfo();
});

// 加载法律条文信息
async function loadLawArticleInfo() {
  try {
    const response = await queryLawArticleInfoApi(lawArticleId.value);
    if (response && response.data) {
      lawArticle.value = response.data;
    }
    console.log('加载法律条文信息成功:', lawArticle.value);
  } catch (err) {
    console.error('加载法律条文信息失败:', err);
    ElMessage.error('加载法律条文信息失败，请稍后重试');
  }
}



// 返回列表
function goBack() {
  // 检查是否从搜索页面跳转过来
  const fromSearch = route.query.fromSearch;
  if (fromSearch === 'true') {
    router.push({
      path: '/user/search',
      query: {
        keyword: route.query.keyword,
        page: route.query.page,
        pageSize: route.query.pageSize
      }
    });
  } else {
    router.back();
  }
}
</script>

<style scoped>
.law-detail-page {
  padding: 20px;
  min-height: 600px;
}

/* 页面标题 */
.page-header {
  background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://yujinyu-ai.oss-cn-beijing.aliyuncs.com/%E6%B3%95%E5%85%B8.png');
  background-size: cover;
  background-position: center;
  color: white;
  padding: 60px 0;
  margin-bottom: 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.page-header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title::before {
  content: '📜';
  font-size: 28px;
}

.page-subtitle {
  font-size: 18px;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

/* 法律条文详情 */
.law-detail-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.law-detail-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  padding: 30px;
  position: relative;
  overflow: hidden;
}

.law-detail-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, #1e3c72, #2a5298);
}

.law-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}



.law-status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  background-color: #f5f5f5;
  color: #666;
}

.law-status.status-active {
  background-color: #f6ffed;
  color: #52c41a;
  border: 1px solid #b7eb8f;
}

.law-detail-content {
  margin-bottom: 30px;
  line-height: 1.8;
  font-size: 16px;
  color: #333;
}

.law-detail-content p {
  margin: 0;
  text-indent: 2em;
}

.law-detail-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.meta-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.meta-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
  min-width: 80px;
  flex-shrink: 0;
}

.meta-value {
  font-size: 14px;
  color: #333;
  flex: 1;
  line-height: 1.5;
}

.law-detail-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }

  .page-subtitle {
    font-size: 16px;
  }

  .law-detail-card {
    padding: 20px;
  }

  .law-detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .law-status {
    align-self: flex-start;
  }

  .law-detail-content {
    font-size: 14px;
  }
}
</style>