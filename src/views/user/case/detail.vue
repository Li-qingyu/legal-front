<template>
  <div class="case-detail-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="page-header-container">
        <h1 class="page-title">案例详情</h1>
      </div>
    </div>

    <!-- 案例详情内容 -->
    <div class="case-detail-section">
      <div class="case-detail-container">
        <!-- 案例基本信息 -->
        <div class="case-header">
          <h2 class="case-title">{{ caseDetail.title }}</h2>
          <div class="case-meta">
            <span><i class="el-icon-time"></i> 发布时间：{{ caseDetail.publishTime }}</span>
            <span><i class="el-icon-document"></i> 案例类型：{{ caseDetail.type }}</span>
          </div>
          <div class="case-tags" v-if="caseDetail.tags">
            <el-tag size="small" v-for="tag in caseDetail.tags.split(',')" :key="tag" effect="plain">{{ tag }}</el-tag>
          </div>
          <div class="case-cover" v-if="caseDetail.cover">
            <img :src="caseDetail.cover" alt="案例封面" class="cover-image">
          </div>
        </div>

        <!-- 案情简介 -->
        <div class="case-section">
          <h3 class="section-title">案情简介</h3>
          <div class="section-content">
            <p v-for="(paragraph, index) in caseDetail.content.split('\n')" :key="index" class="content-paragraph">
              {{ paragraph }}
            </p>
          </div>
        </div>

        <!-- 处理结果 -->
        <div class="case-section">
          <h3 class="section-title">处理结果</h3>
          <div class="section-content">
            <p v-for="(paragraph, index) in caseDetail.judgment.split('\n')" :key="index" class="content-paragraph">
              {{ paragraph }}
            </p>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="case-actions">
          <el-button @click="goBack">返回列表</el-button>
          <el-button :type="caseDetail.isCollected ? 'warning' : 'primary'" @click="collectCase">
            <i :class="caseDetail.isCollected ? 'el-icon-star-on' : 'el-icon-star-off'"></i> {{ caseDetail.isCollected ? '已收藏' : '收藏案例' }}
          </el-button>
          <el-button type="info" @click="consultAI">
            <i class="el-icon-chat-line-square"></i> 咨询AI助手
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute, useRouter } from 'vue-router';
import { queryInfoApiForUser } from '@/api/case';
import { collectCaseApi, cancelCollectionApi } from '@/api/collection';

const route = useRoute();
const router = useRouter();

// 案例详情数据
const caseDetail = ref({
  id: 0,
  title: '',
  content: '',
  judgment: '',
  publishTime: '',
  type: '',
  tags: '',
  cover: '',
  isCollected: false
});

// 初始化数据
onMounted(async () => {
  const caseId = route.params.id;
  await loadCaseDetail(caseId);
});

// 加载案例详情
async function loadCaseDetail(id) {
  try {
    // 调用API获取案例详情
    const response = await queryInfoApiForUser(id);
    if (response.code) {
      const data = response.data;
      // 处理cover字段，移除多余的空格和反引号
      let cover = data.cover || '';
      if (cover) {
        cover = cover.trim().replace(/^`|`$/g, '');
      }
      
      // 从本地存储获取收藏的案例
      const savedCollection = localStorage.getItem('collectedCases');
      const collectedCaseIds = savedCollection ? JSON.parse(savedCollection).map(c => c.id) : [];
      
      caseDetail.value = {
        id: data.id,
        title: data.title,
        content: data.content,
        judgment: data.judgment || '暂无判决结果',
        publishTime: data.publishTime ? data.publishTime.split('T')[0] : new Date().toISOString().split('T')[0],
        type: data.type || '',
        tags: data.tags || '',
        cover: cover,
        isCollected: collectedCaseIds.includes(data.id)
      };
    } else {
      ElMessage.error('加载案例详情失败：' + (response.msg || '未知错误'));
    }
  } catch (err) {
    console.error('加载案例详情失败:', err);
    ElMessage.error('加载案例详情失败，请稍后重试');
  }
}

// 返回列表页
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
    // 检查是否从收藏页面跳转过来
    const from = route.query.from;
    if (from === 'collection') {
      router.push('/user/collection');
    } else {
      router.push('/user/case');
    }
  }
}

// 收藏案例
async function collectCase() {
  try {
    if (caseDetail.value.isCollected) {
      // 取消收藏
      await cancelCollectionApi(caseDetail.value.id);
      caseDetail.value.isCollected = false;
      ElMessage.success('取消收藏成功');
    } else {
      // 收藏
      await collectCaseApi(caseDetail.value.id);
      caseDetail.value.isCollected = true;
      ElMessage.success('收藏成功');
    }
    
    // 更新本地存储
    const savedCollection = localStorage.getItem('collectedCases');
    let allCollectedCases = savedCollection ? JSON.parse(savedCollection) : [];
    
    if (caseDetail.value.isCollected) {
      // 添加到收藏
      if (!allCollectedCases.some(c => c.id === caseDetail.value.id)) {
        allCollectedCases.push(caseDetail.value);
      }
    } else {
      // 从收藏中移除
      allCollectedCases = allCollectedCases.filter(c => c.id !== caseDetail.value.id);
    }
    
    // 保存回本地存储
    localStorage.setItem('collectedCases', JSON.stringify(allCollectedCases));
  } catch (err) {
    console.error('收藏操作失败:', err);
    ElMessage.error('收藏操作失败，请稍后重试');
  }
}

// 咨询AI助手
function consultAI() {
  router.push('/user/ai');
}
</script>

<style scoped>
.case-detail-page {
  min-height: 600px;
}

/* 页面标题 */
.page-header {
  background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://yujinyu-ai.oss-cn-beijing.aliyuncs.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20260330192224_342_64.jpg');
  background-size: cover;
  background-position: center;
  color: white;
  padding: 40px 0;
  margin-bottom: 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.page-header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title::before {
  content: '📚';
  font-size: 24px;
}

/* 案例详情内容 */
.case-detail-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.case-detail-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.case-detail-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, #1e3c72, #2a5298);
}

/* 案例头部信息 */
.case-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.case-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  line-height: 1.4;
}

.case-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

.case-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.case-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
}

.case-cover {
  margin-top: 20px;
  text-align: center;
}

.cover-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* 案例内容部分 */
.case-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.case-section:last-child {
  border-bottom: none;
  margin-bottom: 40px;
  padding-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  position: relative;
  padding-left: 20px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: linear-gradient(to bottom, #1e3c72, #2a5298);
  border-radius: 2px;
}

.section-content {
  color: #333;
  line-height: 1.6;
}

.content-paragraph {
  margin-bottom: 15px;
  text-align: justify;
}

.focus-points {
  list-style: none;
  padding: 0;
  margin: 0;
}

.focus-point {
  margin-bottom: 10px;
  padding-left: 20px;
  position: relative;
}

.focus-point::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #1e3c72;
  font-weight: bold;
}

/* 法律条文 */
.law-content {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.law-item {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.law-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.law-title {
  font-size: 16px;
  font-weight: bold;
  color: #1e3c72;
  margin-bottom: 10px;
}

.law-content {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.no-data {
  color: #999;
  text-align: center;
  padding: 20px;
  font-style: italic;
}

/* 操作按钮 */
.case-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #f0f0f0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .case-detail-container {
    padding: 20px;
  }

  .case-title {
    font-size: 20px;
  }

  .case-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .case-actions {
    flex-direction: column;
  }

  .case-actions .el-button {
    width: 100%;
  }
}
</style>