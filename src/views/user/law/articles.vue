<template>
  <div class="law-articles-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="page-header-container">
        <h1 class="page-title">{{ lawBookName }}</h1>
        <p class="page-subtitle">浏览和查询法律条文，了解法律法规</p>
      </div>
    </div>

    <!-- 法律条文筛选 -->
    <div class="filter-section">
      <div class="filter-container">
        <el-form :inline="true" class="filter-form">
          <el-form-item label="条文标题">
            <el-input v-model="searchQuery" placeholder="搜索法律条文..." />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetFilter">清空</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 法律条文列表 -->
    <div class="law-section">
      <div class="law-container">
        <div class="law-grid">
          <div class="law-card" v-for="article in lawArticles" :key="article.id">
            <div class="law-icon">
              <i class="el-icon-document"></i>
            </div>
            <div class="law-card-header">
              <h3 class="law-title">{{ article.articleTitle }}</h3>
              <el-tag size="small" :type="isArticleEffective(article.effectiveDate) ? 'success' : 'info'">
                {{ isArticleEffective(article.effectiveDate) ? '生效' : '未生效' }}
              </el-tag>
            </div>
            <p class="law-content">{{ article.content }}</p>
            <div class="law-meta">
              <span><i class="el-icon-date"></i> 发布时间：{{ article.publishDate }}</span>
              <span><i class="el-icon-success"></i> 生效时间：{{ article.effectiveDate }}</span>
            </div>
            <div class="law-actions">
              <el-button size="small" type="text" @click="viewLawDetail(article.id)">查看详情</el-button>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-container">
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

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { queryPageApi } from '@/api/law-article';
import { queryInfoApi as queryLawBookInfoApi } from '@/api/law-book';
import { useRouter, useRoute } from 'vue-router';

// 路由参数
const route = useRoute();
const router = useRouter();

// 法律书ID
const lawBookId = computed(() => route.params.id);

// 法律书名称
const lawBookName = ref('');

// 搜索关键词
const searchQuery = ref('');

// 分页
const currentPage = ref(1);
const pageSize = ref(9);
const total = ref(0);

// 法律条文数据
const lawArticles = ref([]);

// 初始化数据
onMounted(async () => {
  await loadLawBookInfo();
  await loadLawArticles();
});

// 加载法律书信息
async function loadLawBookInfo() {
  try {
    const response = await queryLawBookInfoApi(lawBookId.value);
    if (response && response.data) {
      lawBookName.value = response.data.name;
    }
    console.log('加载法律书信息成功:', lawBookName.value);
  } catch (err) {
    console.error('加载法律书信息失败:', err);
    ElMessage.error('加载法律书信息失败，请稍后重试');
  }
}

// 加载法律条文数据
async function loadLawArticles() {
  try {
    const response = await queryPageApi(
      lawBookId.value,
      searchQuery.value,
      currentPage.value,
      pageSize.value
    );
    
    if (response && response.data) {
      lawArticles.value = response.data.records || [];
      total.value = response.data.total || 0;
    }
    console.log('加载法律条文数据成功:', lawArticles.value);
  } catch (err) {
    console.error('加载法律条文数据失败:', err);
    ElMessage.error('加载法律条文数据失败，请稍后重试');
  }
}

// 搜索
async function handleSearch() {
  currentPage.value = 1; // 搜索时重置页码
  await loadLawArticles();
}

// 重置筛选
function resetFilter() {
  searchQuery.value = '';
  currentPage.value = 1;
  loadLawArticles();
}

// 查看法律条文详情
function viewLawDetail(id) {
  console.log('查看法律条文详情:', id);
  router.push(`/user/law/detail/${id}`);
}

// 判断法律条文是否生效
function isArticleEffective(effectiveDate) {
  if (!effectiveDate) return false;
  const date = new Date(effectiveDate);
  const currentDate = new Date();
  return date <= currentDate;
}

// 分页处理
function handleSizeChange(size) {
  pageSize.value = size;
  loadLawArticles();
}

function handleCurrentChange(current) {
  currentPage.value = current;
  loadLawArticles();
}
</script>

<style scoped>
.law-articles-page {
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

/* 筛选区域 */
.filter-section {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  margin: 0 auto 30px;
  max-width: 1200px;
  padding: 0 20px;
  position: relative;
  overflow: hidden;
}

.filter-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, #1e3c72, #2a5298);
}

.filter-container {
  padding: 25px 0;
}

.filter-form {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

/* 法律条文列表 */
.law-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.law-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.law-card {
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

.law-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, #1e3c72, #2a5298);
}

.law-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
}

.law-icon {
  font-size: 28px;
  color: #1e3c72;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.law-icon i {
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.law-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  width: 100%;
}

.law-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  flex: 1;
  margin-right: 10px;
}

.law-card-header .el-tag {
  align-self: flex-start;
}

.law-content {
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

.law-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 15px;
  flex: 0 0 auto;
}

.law-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.law-actions {
  display: flex;
  justify-content: flex-end;
  flex: 0 0 auto;
  margin-top: auto;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.law-actions .el-button {
  transition: all 0.3s ease;
}

.law-actions .el-button:hover {
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
  .filter-form {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .law-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .page-title {
    font-size: 28px;
  }

  .page-subtitle {
    font-size: 16px;
  }

  .law-card {
    padding: 20px;
  }
}
</style>