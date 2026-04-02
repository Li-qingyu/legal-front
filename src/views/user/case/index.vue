<template>
  <div class="case-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="page-header-container">
        <h1 class="page-title">法律案例</h1>
        <p class="page-subtitle">浏览最新、热门的法律案例，了解法律知识</p>
      </div>
    </div>

    <!-- 案例筛选 -->
    <div class="filter-section">
      <div class="filter-container">
        <el-form :inline="true" class="filter-form">
          <el-form-item label="案例标题">
            <el-input v-model="searchQuery" placeholder="搜索法律案例..." />
          </el-form-item>
          <el-form-item label="法律类型">
            <el-select v-model="filterForm.type" placeholder="请选择法律类型">
              <el-option label="全部" value="" />
              <el-option v-for="type in typeList" :key="type.id" :label="type.name" :value="type.name" />
            </el-select>
          </el-form-item>
          <el-form-item label="标签">
            <el-input v-model="filterForm.tag" placeholder="按标签搜索..." />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter">搜索</el-button>
            <el-button @click="resetFilter">清空</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 案例列表 -->
    <div class="case-section">
      <div class="case-container">
        <div class="case-grid">
          <div class="case-card" v-for="caseItem in cases" :key="caseItem.id">
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
              <el-button size="small" type="text" @click="collectCase(caseItem.id)">
                <i :class="caseItem.isCollected ? 'el-icon-star-on' : 'el-icon-star-off'"></i> {{ caseItem.isCollected ? '已收藏' : '收藏' }}
              </el-button>
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

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { ElMessage, FormInstance } from 'element-plus';
import { queryPageApiForUser } from '@/api/case';
import { queryAllApi1 } from '@/api/type';
import { collectCaseApi, cancelCollectionApi } from '@/api/collection';
import { useRouter } from 'vue-router';

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

const searchQuery = ref('');

// 法律类型列表
const typeList = ref([]);

// 筛选表单
const filterForm = ref({
  type: '',
  tag: '',
  dateRange: []
});

// 分页
const currentPage = ref(1);
const pageSize = ref(9);
const total = ref(100);

// 案例数据
const cases = ref<Case[]>([]);
const router = useRouter();

// 修改密码相关
const changePasswordDialogVisible = ref(false);
const changePasswordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});
const changePasswordFormRef = ref<FormInstance | null>(null);

// 修改密码表单验证规则
const changePasswordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度至少8位', trigger: 'blur' },
    { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, message: '密码必须包含字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== changePasswordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 初始化数据
onMounted(async () => {
  await loadTypeList();
  await loadCaseData();
});

// 监听筛选条件变化
watch(
  () => [filterForm.value.type, filterForm.value.tag, filterForm.value.dateRange, searchQuery.value],
  async () => {
    currentPage.value = 1; // 重置页码
    await loadCaseData();
  },
  { deep: true }
);

// 加载法律类型列表
async function loadTypeList() {
  try {
    const response = await queryAllApi1();
    if (response && response.data) {
      typeList.value = response.data;
    }
    console.log('加载法律类型列表成功:', typeList.value);
  } catch (err) {
    console.error('加载法律类型列表失败:', err);
    ElMessage.error('加载法律类型列表失败，请稍后重试');
  }
}

// 加载案例数据
async function loadCaseData() {
  try {
    // 调用API获取案例数据
    const typeId = filterForm.value.type ? typeList.value.find(type => type.name === filterForm.value.type)?.id : '';
    const response = await queryPageApiForUser(
      searchQuery.value, // name
      typeId, // typeId
      filterForm.value.tag, // tag
      currentPage.value,
      pageSize.value
    );
    
    // 处理API返回的数据结构
    if (response && response.data) {
      cases.value = response.data.records || [];
      total.value = response.data.total || 0;
      
      // 从本地存储获取收藏的案例
      const savedCollection = localStorage.getItem('collectedCases');
      const collectedCaseIds = savedCollection ? JSON.parse(savedCollection).map((c: Case) => c.id) : [];
      
      // 为每个案例添加isCollected属性
      cases.value.forEach(caseItem => {
        caseItem.isCollected = collectedCaseIds.includes(caseItem.id);
        // 从typeName设置type字段
        caseItem.type = caseItem.typeName;
      });
    }
    console.log('加载案例数据成功:', cases.value);
  } catch (err) {
    console.error('加载案例数据失败:', err);
    ElMessage.error('加载案例数据失败，请稍后重试');
  }
}

// 搜索
async function handleSearch() {
  currentPage.value = 1; // 搜索时重置页码
  await loadCaseData();
}

// 筛选
async function handleFilter() {
  currentPage.value = 1; // 筛选时重置页码
  await loadCaseData();
}

// 重置筛选
function resetFilter() {
  filterForm.value = {
    type: '',
    tag: '',
    dateRange: []
  };
  searchQuery.value = '';
  currentPage.value = 1;
  loadCaseData();
}

// 查看案例详情
function viewCaseDetail(id) {
  console.log('查看案例详情:', id);
  router.push(`/user/case/${id}`);
}

// 收藏案例
async function collectCase(id) {
  const caseItem = cases.value.find(item => item.id === id);
  if (caseItem) {
    try {
      if (caseItem.isCollected) {
        // 取消收藏
        await cancelCollectionApi(id);
        caseItem.isCollected = false;
        ElMessage.success('取消收藏成功');
      } else {
        // 收藏
        await collectCaseApi(id);
        caseItem.isCollected = true;
        ElMessage.success('收藏成功');
      }
      
      // 更新本地存储
      const savedCollection = localStorage.getItem('collectedCases');
      let allCollectedCases = savedCollection ? JSON.parse(savedCollection) : [];
      
      if (caseItem.isCollected) {
        // 添加到收藏
        if (!allCollectedCases.some(c => c.id === caseItem.id)) {
          allCollectedCases.push(caseItem);
        }
      } else {
        // 从收藏中移除
        allCollectedCases = allCollectedCases.filter(c => c.id !== caseItem.id);
      }
      
      // 保存回本地存储
      localStorage.setItem('collectedCases', JSON.stringify(allCollectedCases));
    } catch (err) {
      console.error('收藏操作失败:', err);
      ElMessage.error('收藏操作失败，请稍后重试');
    }
  }
  console.log('收藏案例:', id);
}

// 分页处理
function handleSizeChange(size) {
  pageSize.value = size;
  loadCaseData();
}

function handleCurrentChange(current) {
  currentPage.value = current;
  loadCaseData();
}

// 打开修改密码对话框
function openChangePasswordDialog() {
  changePasswordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  changePasswordDialogVisible.value = true;
}

// 处理修改密码
function handleChangePassword() {
  if (changePasswordFormRef.value) {
    changePasswordFormRef.value.validate((valid) => {
      if (valid) {
        // 这里可以添加修改密码的逻辑，比如调用后端API
        console.log('修改密码:', changePasswordForm.value);
        
        // 模拟修改密码成功
        setTimeout(() => {
          ElMessage.success('密码修改成功');
          changePasswordDialogVisible.value = false;
        }, 1000);
      }
    });
  }
}

// 退出登录
function handleLogout() {
  localStorage.removeItem('loginUser');
  ElMessage.success('退出登录成功');
  setTimeout(() => {
    window.location.href = '/login';
  }, 1000);
  console.log('退出登录');
}
</script>

<style scoped>
.case-page {
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
  .filter-form {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

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
}
</style>







