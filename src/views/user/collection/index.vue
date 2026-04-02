<template>
  <div class="collection-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="page-header-container">
        <h1 class="page-title">案例收藏</h1>
        <p class="page-subtitle">查看您收藏的法律案例</p>
      </div>
    </div>

    <!-- 收藏案例列表 -->
    <div class="case-section">
      <div class="case-container">
        <div v-if="collectedCases.length === 0" class="empty-collection">
          <div class="empty-icon">
            <i class="el-icon-collection-tag"></i>
          </div>
          <h3>暂无收藏案例</h3>
          <p>您还没有收藏任何案例，去浏览并收藏感兴趣的案例吧</p>
          <el-button type="primary" @click="goToCaseList">去浏览案例</el-button>
        </div>
        <div v-else class="case-grid">
          <div class="case-card" v-for="caseItem in collectedCases" :key="caseItem.id">
            <!-- 案例图片 -->
            <div class="case-image">
              <img :src="caseItem.cover.trim()" :alt="caseItem.title" />
            </div>
            <div class="case-icon">
              <i class="el-icon-collection-tag"></i>
            </div>
            <h3 class="case-title">{{ caseItem.title }}</h3>
            <p class="case-summary">{{ caseItem.content }}</p>
            <div class="case-meta">
              <span><i class="el-icon-time"></i> {{ caseItem.publishTime }}</span>
              <span><i class="el-icon-document"></i> {{ caseItem.type }}</span>
            </div>
            <div class="case-tags" v-if="caseItem.tags">
              <el-tag size="small" v-for="tag in caseItem.tags.split(',')" :key="tag" effect="plain">{{ tag }}</el-tag>
            </div>
            <div class="case-actions">
              <el-button size="small" type="text" @click="viewCaseDetail(caseItem.id)">查看详情</el-button>
              <el-button size="small" type="text" @click="removeFromCollection(caseItem.id)">
                <i class="el-icon-star-on"></i> 取消收藏
              </el-button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="collectedCases.length > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[3, 9, 27, 54, 81, 243]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { getCollectionListApi, cancelCollectionApi } from '@/api/collection';

// 案例类型定义
interface Case {
  id: number;
  title: string;
  content: string;
  publishTime: string;
  type: string;
  typeName: string;
  typeId: number;
  tags: string;
  cover: string;
  status: number;
  isCollected?: boolean;
}

// 分页
const currentPage = ref(1);
const pageSize = ref(9);
const total = ref(0);

// 案例数据
const collectedCases = ref<Case[]>([]);
const router = useRouter();

// 初始化数据
onMounted(async () => {
  await loadCollectedCases();
});

// 加载收藏的案例数据
async function loadCollectedCases() {
  try {
    // 调用API获取收藏列表
    const response = await getCollectionListApi();
    if (response && response.data) {
      const allCollectedCases = response.data || [];
      total.value = allCollectedCases.length;
      
      // 分页处理
      const startIndex = (currentPage.value - 1) * pageSize.value;
      const endIndex = startIndex + pageSize.value;
      collectedCases.value = allCollectedCases.slice(startIndex, endIndex);
      
      // 保存到本地存储，用于其他页面的收藏状态显示
      localStorage.setItem('collectedCases', JSON.stringify(allCollectedCases));
    } else {
      collectedCases.value = [];
      total.value = 0;
    }
    console.log('加载收藏案例数据成功:', collectedCases.value);
  } catch (err) {
    console.error('加载收藏案例数据失败:', err);
    ElMessage.error('加载收藏案例数据失败，请稍后重试');
    
    // 失败时从本地存储获取数据
    const savedCollection = localStorage.getItem('collectedCases');
    if (savedCollection) {
      const allCollectedCases = JSON.parse(savedCollection);
      total.value = allCollectedCases.length;
      
      // 分页处理
      const startIndex = (currentPage.value - 1) * pageSize.value;
      const endIndex = startIndex + pageSize.value;
      collectedCases.value = allCollectedCases.slice(startIndex, endIndex);
    }
  }
}

// 查看案例详情
function viewCaseDetail(id) {
  console.log('查看案例详情:', id);
  router.push(`/user/case/${id}?from=collection`);
}

// 从收藏中移除
async function removeFromCollection(id) {
  try {
    // 调用API取消收藏
    await cancelCollectionApi(id);
    
    // 重新加载数据
    await loadCollectedCases();
    ElMessage.success('取消收藏成功');
  } catch (err) {
    console.error('取消收藏失败:', err);
    ElMessage.error('取消收藏失败，请稍后重试');
    
    // 失败时从本地存储删除
    const savedCollection = localStorage.getItem('collectedCases');
    if (savedCollection) {
      let allCollectedCases = JSON.parse(savedCollection);
      // 过滤掉要移除的案例
      allCollectedCases = allCollectedCases.filter((caseItem: Case) => caseItem.id !== id);
      // 保存回本地存储
      localStorage.setItem('collectedCases', JSON.stringify(allCollectedCases));
      // 重新加载数据
      loadCollectedCases();
    }
  }
}

// 跳转到案例列表页面
function goToCaseList() {
  router.push('/user/case');
}

// 分页处理
function handleSizeChange(size) {
  pageSize.value = size;
  loadCollectedCases();
}

function handleCurrentChange(current) {
  currentPage.value = current;
  loadCollectedCases();
}
</script>

<style scoped>
.collection-page {
  padding: 20px;
  min-height: 600px;
}

/* 页面标题 */
.page-header {
  background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://yujinyu-ai.oss-cn-beijing.aliyuncs.com/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20260330192224_342_64.jpg');
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
  content: '📚';
  font-size: 28px;
}

.page-subtitle {
  font-size: 18px;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

/* 空收藏状态 */
.empty-collection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  color: #e0e0e0;
  margin-bottom: 20px;
}

.empty-collection h3 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.empty-collection p {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
  max-width: 400px;
}

/* 案例列表 */
.case-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.case-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.case-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  padding: 25px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.case-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, #1e3c72, #2a5298);
}

.case-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
}

.case-image {
  width: 100%;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
  background-color: #f5f7fa;
}

.case-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.case-card:hover .case-image img {
  transform: scale(1.05);
}

.case-icon {
  font-size: 28px;
  color: #1e3c72;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.case-icon i {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.case-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
  padding: 10px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.case-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
  line-height: 1.4;
  flex: 0 0 auto;
}

.case-summary {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1 1 auto;
  min-height: 72px;
}

.case-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex: 0 0 auto;
}

.case-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.case-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex: 0 0 auto;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.case-actions .el-button {
  transition: all 0.3s ease;
}

.case-actions .el-button:hover {
  color: #1e3c72;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding: 20px 0;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.el-pagination.is-background .el-pager li:not(.disabled):hover {
  color: #1e3c72;
}

.el-pagination.is-background .el-pager li.active {
  background-color: #1e3c72;
  color: #fff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .case-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .page-title {
    font-size: 28px;
  }

  .page-subtitle {
    font-size: 16px;
  }

  .case-card {
    padding: 20px;
  }

  .empty-collection {
    padding: 60px 15px;
  }
}
</style>