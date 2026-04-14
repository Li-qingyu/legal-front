<template>
  <div class="search-results">
    <div class="content-section">
      <h2 class="section-title">
        <i class="fa fa-search"></i> 搜索结果
      </h2>
      
      <div class="search-info">
        <p>搜索关键词: <strong>{{ keyword }}</strong></p>
        <p>共找到 <strong>{{ total }}</strong> 条结果</p>
      </div>
      
      <div v-if="loading" class="loading-container">
        <el-spinner size="large" />
        <p>正在搜索中...</p>
      </div>
      
      <div v-else-if="error" class="error-container">
        <el-alert
          :title="error"
          type="error"
          show-icon
        />
      </div>
      
      <div v-else-if="records.length === 0" class="empty-container">
        <el-empty
          description="未找到相关内容"
        />
      </div>
      
      <div v-else class="results-list">
        <div 
          v-for="(item, index) in records" 
          :key="item.id"
          class="result-card"
        >
          <div class="result-header">
            <h3 class="result-title">{{ item.title }}</h3>
            <el-tag :type="item.type === 'case' ? 'info' : 'success'">
              {{ item.type === 'case' ? '案例' : '法典' }}
            </el-tag>
          </div>
          <p class="result-content">{{ item.content }}</p>
          <div class="result-meta">
            <span><i class="fa fa-clock-o"></i> {{ item.createTime }}</span>
          </div>
          <div class="result-actions">
            <el-button 
              size="small" 
              type="text" 
              @click="viewDetail(item)"
            >
              查看详情
            </el-button>
          </div>
        </div>
      </div>
      
      <div v-if="records.length > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { searchLawContentApi } from '@/api/home';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// 搜索参数
const keyword = ref('');
const type = ref('all');
const page = ref(1);
const pageSize = ref(10);

// 搜索结果
const records = ref([]);
const total = ref(0);
const loading = ref(false);
const error = ref('');

// 从路由参数中获取搜索关键词
onMounted(() => {
  const searchKeyword = route.query.keyword;
  if (searchKeyword) {
    keyword.value = searchKeyword;
    performSearch();
  }
});

// 执行搜索
async function performSearch() {
  if (!keyword.value) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }
  
  loading.value = true;
  error.value = '';
  
  try {
    const response = await searchLawContentApi(keyword.value, type.value, page.value, pageSize.value);
    records.value = response.data?.records || [];
    total.value = response.data?.total || 0;
  } catch (err) {
    error.value = '搜索失败，请重试';
    console.error('搜索失败:', err);
  } finally {
    loading.value = false;
  }
}

// 处理分页大小变化
function handleSizeChange(size) {
  pageSize.value = size;
  page.value = 1;
  performSearch();
}

// 处理页码变化
function handleCurrentChange(current) {
  page.value = current;
  performSearch();
}

// 查看详情
function viewDetail(item) {
  if (item.type === 'case') {
    router.push({
      path: `/user/case/${item.id}`,
      query: {
        fromSearch: 'true',
        keyword: keyword.value,
        page: page.value,
        pageSize: pageSize.value
      }
    });
  } else if (item.type === 'code') {
    // 跳转到法律条文详情页
    router.push({
      path: `/user/law/detail/${item.id}`,
      query: {
        fromSearch: 'true',
        keyword: keyword.value,
        page: page.value,
        pageSize: pageSize.value
      }
    });
  }
}
</script>

<style scoped>
.search-results {
  padding: 40px 0;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.search-info {
  background: #F8FAFC;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  border: 1px solid #E2E8F0;
  max-width: 100%;
}

.search-info p {
  margin: 8px 0;
  color: #475569;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

.error-container {
  margin: 40px 0;
}

.empty-container {
  padding: 80px 0;
}

.results-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-top: 30px;
  max-width: 100%;
}

.result-card {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  padding: 30px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid #E2E8F0;
}

.result-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, #1E3A8A, #1E40AF);
}

.result-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.12);
  border-color: #CBD5E1;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.result-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  color: #1E3A8A;
  line-height: 1.4;
  font-family: 'EB Garamond', serif;
  flex: 1;
  margin-right: 16px;
}

.result-header .el-tag {
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.result-header .el-tag--info {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3B82F6;
  color: #2563EB;
}

.result-header .el-tag--success {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10B981;
  color: #059669;
}

.result-content {
  font-size: 15px;
  color: #64748B;
  margin-bottom: 20px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-meta {
  font-size: 13px;
  color: #94A3B8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.result-actions {
  display: flex;
  justify-content: flex-end;
}

.result-actions .el-button {
  color: #1E3A8A;
  border-color: #1E3A8A;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.result-actions .el-button:hover {
  background: #1E3A8A;
  color: white;
}

.pagination-container {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .search-results {
    padding: 40px 20px;
  }
  
  .results-list {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 25px;
  }
}

@media (max-width: 768px) {
  .search-results {
    padding: 20px;
  }
  
  .results-list {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .result-card {
    padding: 24px;
  }
}

@media (max-width: 480px) {
  .search-results {
    padding: 20px 16px;
  }
  
  .search-info {
    padding: 16px;
  }
  
  .result-card {
    padding: 20px;
  }
  
  .result-title {
    font-size: 18px;
  }
}
</style>