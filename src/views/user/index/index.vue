<template>
  <div class="app">
    <!-- 顶部导航栏 -->
    <el-header height="60px" class="navbar">
      <div class="navbar-container">
        <router-link to="/user" class="logo">法律咨询平台</router-link>
        <div class="search-container">
          <el-input
            v-model="searchQuery"
            placeholder="搜索法律问题..."
            class="search-input"
            prefix-icon="el-icon-search"
          />
          <el-button type="info" class="search-btn" @click="handleSearch">搜索</el-button>
        </div>
        <div class="nav-links">
          <router-link to="/user" v-slot="{ isExactActive }" :class="['nav-link', { 'router-link-active': isExactActive }]">首页</router-link>
          <router-link to="/user/case" class="nav-link">法律案例</router-link>
          <router-link to="/user/law" class="nav-link">法典</router-link>
          <router-link to="/user/ai" class="nav-link">AI法律咨询</router-link>
          <router-link to="/user/collection" class="nav-link">案例收藏</router-link>
          <router-link to="/user/profile" class="nav-link">个人中心</router-link>
          <router-link v-if="userRole === 1" to="/admin" class="nav-link">管理端</router-link>
          <el-button type="text" class="logout-btn" @click="handleLogout">
            <i class="el-icon-switch-button"></i> 退出登录
          </el-button>
        </div>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 子路由内容 -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
      
      <!-- 首页内容，仅在访问 /user 时显示 -->
      <template v-if="$route.path === '/user'">
        <!-- 轮播图 -->
        <el-carousel 
          :interval="5000" 
          type="card" 
          height="500px" 
          class="carousel"
          indicator-position="outside"
        >
          <el-carousel-item v-for="(item, index) in carouselData" :key="index">
            <div class="carousel-content" :style="{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${item.imageUrl ? item.imageUrl.trim().replace(/`/g, '') : ''})` }">
              <h1 class="carousel-title">{{ item.title }}</h1>
              <p class="carousel-subtitle">{{ item.subTitle || item.subtitle }}</p>
              <router-link :to="getCarouselLink(item.buttonText)">
                <el-button type="warning" size="large" class="carousel-btn">{{ item.buttonText }}</el-button>
              </router-link>
            </div>
          </el-carousel-item>
          <!-- 默认轮播图，当API未返回数据时显示 -->
          <el-carousel-item v-if="carouselData.length === 0">
            <div class="carousel-content" :style="{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=legal%20advice%20background&image_size=landscape_16_9')` }">
              <h1 class="carousel-title">专业法律咨询服务</h1>
              <p class="carousel-subtitle">AI驱动的智能法律助手，为您提供专业、便捷的法律咨询</p>
              <router-link to="/user/case">
                <el-button type="warning" size="large" class="carousel-btn">了解更多</el-button>
              </router-link>
            </div>
          </el-carousel-item>
        </el-carousel>

        <!-- 法律案例 -->
        <section class="content-section">
          <h2 class="section-title">
            <i class="fa fa-file-text-o"></i> 热门法律案例
          </h2>
          <div class="case-grid">
            <div class="case-card" v-for="(caseItem, index) in cases.slice(0, 6)" :key="index">
              <div class="case-icon">
                <i class="fa fa-balance-scale"></i>
              </div>
              <h3 class="case-title">{{ caseItem.title }}</h3>
              <p class="case-summary">{{ caseItem.content }}</p>
              <div class="case-meta">
                <span><i class="fa fa-clock-o"></i> {{ caseItem.publishTime }}</span>
              </div>
              <div class="case-actions">
                <el-button size="small" type="text" @click="viewCaseDetail(caseItem.id)">查看详情</el-button>
              </div>
            </div>
          </div>
          <div class="case-more">
            <router-link to="/user/case" class="more-link">
              <el-button type="primary" plain>查看更多案例</el-button>
            </router-link>
          </div>
        </section>

        <!-- 法律内容 -->
        <section class="content-section law-content">
          <h2 class="section-title">
            <i class="fa fa-book"></i> 法典
          </h2>
          <div class="law-list">
            <div class="law-item" v-for="(law, index) in laws" :key="index" @click="viewLawDetail(law.id)">
              <div class="law-item-header">
                <h3 class="law-item-title">{{ law.articleTitle || law.name }}</h3>
                <el-tag :type="isLawEffective(law.effectiveDate) ? 'success' : 'info'" size="small">
                  {{ isLawEffective(law.effectiveDate) ? '生效' : '未生效' }}
                </el-tag>
              </div>
              <p class="law-item-meta">
                <i class="fa fa-calendar"></i> 发布时间：{{ law.publishDate }} | 
                <i class="fa fa-check-circle"></i> 生效时间：{{ law.effectiveDate }}
              </p>
            </div>
          </div>
        </section>

        <!-- AI咨询助手 -->
        <section class="ai-assistant">
          <div class="ai-container">
            <div class="ai-content">
              <div class="ai-info">
                <h2 class="ai-title">
                  <i class="fa fa-robot"></i> AI法律助手
                </h2>
                <p class="ai-description">
                  我们的AI法律助手基于Spring AI框架，结合阿里云百炼平台的Qwen模型，
                  能够查询数据库中的相关法律案例和法律知识，为您提供专业、准确的法律回答。
                </p>
                <router-link to="/user/ai">
                  <el-button type="warning" size="large" class="ai-btn">
                    <i class="el-icon-position"></i> 开始咨询
                  </el-button>
                </router-link>
              </div>
              <div class="ai-image">
                <img
                  src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20legal%20assistant%20robot&image_size=square"
                  alt="AI法律助手"
                  class="ai-image-img"
                />
              </div>
            </div>
          </div>
        </section>
      </template>
    </main>

    <!-- 底部信息栏 -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-column">
          <h3><i class="el-icon-office-building"></i> 关于我们</h3>
          <p>我们是一家专业的法律咨询平台，致力于为用户提供便捷、专业的法律服务，
          利用AI技术提高法律咨询的效率和可访问性。</p>
        </div>
        <div class="footer-column">
          <h3><i class="el-icon-phone-outline"></i> 联系方式</h3>
          <ul>
            <li><i class="el-icon-phone"></i> 电话：888-888-8888</li>
            <li><i class="el-icon-message"></i> 邮箱：contact@law-platform.com</li>
            <li><i class="el-icon-location"></i> 地址：湖北省武汉市江夏区</li>
          </ul>
        </div>
        <div class="footer-column">
          <h3><i class="el-icon-link"></i> 快速链接</h3>
          <ul>
            <li><router-link to="/user">首页</router-link></li>
            <li><router-link to="/user/case">法律案例</router-link></li>
            <li><router-link to="/user/law">法典</router-link></li>
            <li><router-link to="/user/ai">AI法律咨询</router-link></li>
            <li><router-link to="/user/collection">案例收藏</router-link></li>
            <li><router-link to="/user/profile">个人中心</router-link></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 法律咨询平台 版权所有 | 京ICP备12345678号</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getCarouselApi, getHotCasesApi, getLawsApi, searchLawContentApi } from '@/api/home';
import { useRouter } from 'vue-router';

const activeIndex = ref('/');
const searchQuery = ref('');
const router = useRouter();
const userRole = ref('');

// 检查用户角色
onMounted(async () => {
  await loadHomeData();
  checkUserRole();
});

// 检查用户角色
function checkUserRole() {
  const loginUser = JSON.parse(localStorage.getItem('loginUser'));
  if (loginUser && loginUser.role) {
    userRole.value = loginUser.role;
  }
}

// 跳转到管理端
function goToAdmin() {
  router.push('/admin');
}

// 跳转到个人中心
function goToProfile() {
  router.push('/user/profile');
}

// 数据状态
const carouselData = ref([]);
const cases = ref([]);
const laws = ref([]);
const loading = ref(false);
const error = ref('');

// 初始化数据
onMounted(async () => {
  await loadHomeData();
});

// 加载首页数据
async function loadHomeData() {
  loading.value = true;
  error.value = '';
  
  try {
    // 获取轮播图数据
    const carouselResponse = await getCarouselApi();
    carouselData.value = carouselResponse.data || [];
    
    // 获取热门案例
    const casesResponse = await getHotCasesApi(1, 6);
    cases.value = casesResponse.data?.records || [];
    
    // 获取法律条文
    const lawsResponse = await getLawsApi();
    laws.value = lawsResponse.data?.records || [];
  } catch (err) {
    error.value = '数据加载失败，请刷新页面重试';
    console.error('加载首页数据失败:', err);
  } finally {
    loading.value = false;
  }
}

// 搜索
async function handleSearch() {
  if (!searchQuery.value) return;
  
  loading.value = true;
  
  try {
    const response = await searchLawContentApi(searchQuery.value);
    // 处理搜索结果
    console.log('搜索结果:', response.data);
    // 可以根据需要跳转到搜索结果页面或在当前页面显示结果
  } catch (err) {
    error.value = '搜索失败，请重试';
    console.error('搜索失败:', err);
  } finally {
    loading.value = false;
  }
}

// 查看案例详情
function viewCaseDetail(id) {
  console.log('查看案例详情:', id);
  router.push(`/user/case/${id}`);
}

// 查看法律条文详情
function viewLawDetail(id) {
  console.log('查看法律条文详情:', id);
  router.push(`/user/law/articles/${id}`);
}

// 根据按钮文本获取轮播图链接
function getCarouselLink(buttonText) {
  switch (buttonText) {
    case '立即查询':
    case '立即咨询':
      return '/user/ai';
    case '开始查看':
      return '/user/law';
    case '了解更多':
      return '/user/case';
    default:
      return '/user/case';
  }
}

// 判断法律条文是否生效
function isLawEffective(effectiveDate) {
  if (!effectiveDate) return false;
  const date = new Date(effectiveDate);
  const currentDate = new Date();
  return date <= currentDate;
}

// 退出登录
function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '退出登录', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 清除本地存储中的用户信息
      localStorage.removeItem('loginUser');
      // 显示退出登录成功的提示
      ElMessage.success('退出登录成功');
      
      // 跳转到登录页面
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
      
      console.log('退出登录');
    })
    .catch(() => {
      // 取消退出
      console.log('取消退出登录');
    });
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap');

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F8FAFC;
  font-family: 'Lato', sans-serif;
}

/* 导航栏 */
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 70px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  flex-wrap: nowrap;
  overflow: hidden;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #1E3A8A;
  text-decoration: none;
  white-space: nowrap;
  font-family: 'EB Garamond', serif;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo::before {
  content: '⚖️';
  font-size: 28px;
}

.search-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 auto;
  margin: 0 30px;
  min-width: 200px;
  max-width: 400px;
}

.search-input {
  width: 100%;
  margin-right: 0;
  border-radius: 8px 0 0 8px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.search-input:focus {
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
  border-color: #1E3A8A;
}

.search-btn {
  padding: 0 20px;
  border-radius: 0 8px 8px 0;
  margin-left: -1px;
  flex-shrink: 0;
  background: #1E3A8A;
  border-color: #1E3A8A;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: #1E40AF;
  border-color: #1E40AF;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
}

.nav-link {
  text-decoration: none;
  color: #475569;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 12px;
  vertical-align: middle;
  position: relative;
}

.nav-link:hover {
  color: #1E3A8A;
}

.nav-link.router-link-active {
  color: #1E3A8A;
  font-weight: 600;
}

.nav-link.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: #B45309;
  border-radius: 2px;
}

.logout-btn {
  color: #475569;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0 12px;
  margin: 0;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  line-height: 1;
  vertical-align: middle;
  gap: 4px;
}

.logout-btn:hover {
  color: #1E3A8A;
  background: transparent;
}

.main-content {
  margin-top: 70px;
  flex: 1;
}

/* 轮播图 */
.carousel {
  height: 500px;
  background-color: #f0f2f5;
  overflow: hidden;
}

.carousel-content {
  text-align: center;
  padding: 80px 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  position: relative;
}

.carousel-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6));
  z-index: 1;
}

.carousel-content > * {
  position: relative;
  z-index: 2;
}

.carousel-title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 24px;
  color: white;
  font-family: 'EB Garamond', serif;
  line-height: 1.2;
  max-width: 800px;
}

.carousel-subtitle {
  font-size: 20px;
  color: rgba(255,255,255,0.9);
  margin-bottom: 40px;
  max-width: 600px;
  line-height: 1.5;
}

.carousel-btn {
  background: #B45309 !important;
  border-color: #B45309 !important;
  color: white !important;
  padding: 12px 32px !important;
  border-radius: 8px !important;
  font-size: 18px !important;
  font-weight: 600 !important;
  transition: all 0.3s ease !important;
}

.carousel-btn:hover {
  background: #92400E !important;
  border-color: #92400E !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 12px rgba(180, 83, 9, 0.3) !important;
}

/* 内容区域 */
.content-section {
  max-width: 1200px;
  margin: 60px auto;
  padding: 0 20px;
}

.section-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 30px;
  position: relative;
  padding-bottom: 12px;
  color: #1E3A8A;
  font-family: 'EB Garamond', serif;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100px;
  height: 4px;
  background: #B45309;
  border-radius: 2px;
}

/* 案例卡片 */
.case-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.case-card {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  padding: 30px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid #E2E8F0;
}

.case-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, #1E3A8A, #1E40AF);
}

.case-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0,0,0,0.12);
  border-color: #CBD5E1;
}

.case-icon {
  font-size: 28px;
  color: #1E3A8A;
  margin-bottom: 20px;
  width: 56px;
  height: 56px;
  background: rgba(30, 58, 138, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.case-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #1E3A8A;
  line-height: 1.4;
  font-family: 'EB Garamond', serif;
}

.case-summary {
  font-size: 15px;
  color: #64748B;
  margin-bottom: 20px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.case-meta {
  font-size: 13px;
  color: #94A3B8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.case-actions {
  display: flex;
  justify-content: flex-end;
}

.case-actions .el-button {
  color: #1E3A8A;
  border-color: #1E3A8A;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.case-actions .el-button:hover {
  background: #1E3A8A;
  color: white;
}

.case-more {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.more-link .el-button {
  background: transparent;
  border-color: #1E3A8A;
  color: #1E3A8A;
  border-radius: 8px;
  padding: 10px 32px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.more-link .el-button:hover {
  background: #1E3A8A;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
}

.law-content {
  margin-top: 80px;
}

/* 法律条文 */
.law-list {
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  overflow: hidden;
  border: 1px solid #E2E8F0;
}

.law-item {
  padding: 24px 30px;
  border-bottom: 1px solid #F1F5F9;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.law-item:hover {
  background-color: #F8FAFC;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  border-left: 4px solid #1E3A8A;
}

.law-item:last-child {
  border-bottom: none;
}

.law-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.law-item-title {
  font-size: 18px;
  font-weight: bold;
  color: #1E3A8A;
  margin: 0;
  font-family: 'EB Garamond', serif;
  flex: 1;
  margin-right: 16px;
}

.law-item-header .el-tag {
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
}

.law-item-header .el-tag--success {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10B981;
  color: #059669;
}

.law-item-header .el-tag--info {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3B82F6;
  color: #2563EB;
}

.law-item-meta {
  font-size: 14px;
  color: #94A3B8;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.law-item-meta i {
  margin-right: 6px;
}

/* AI助手 */
.ai-assistant {
  margin-top: 80px;
  background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%);
  padding: 80px 0;
  color: white;
  position: relative;
  overflow: hidden;
}

.ai-assistant::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');
  z-index: 1;
}

.ai-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.ai-content {
  display: flex;
  align-items: center;
  gap: 60px;
}

.ai-info {
  flex: 1;
}

.ai-title {
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 24px;
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'EB Garamond', serif;
}

.ai-description {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  line-height: 1.7;
  max-width: 600px;
}

.ai-btn {
  background: #B45309 !important;
  color: white !important;
  border: none !important;
  padding: 14px 36px !important;
  border-radius: 8px !important;
  font-size: 18px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 12px rgba(180, 83, 9, 0.3) !important;
}

.ai-btn:hover {
  background: #92400E !important;
  transform: translateY(-3px) !important;
  box-shadow: 0 8px 20px rgba(180, 83, 9, 0.4) !important;
}

.ai-image {
  flex: 1;
  text-align: center;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

.ai-image-img {
  max-width: 100%;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  border: 4px solid rgba(255,255,255,0.2);
}

/* 页脚 */
.footer {
  background: #0F172A;
  color: #fff;
  padding: 60px 0 30px;
  margin-top: 80px;
  position: relative;
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to right, #1E3A8A, #B45309);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
}

.footer-column h3 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'EB Garamond', serif;
  position: relative;
  padding-bottom: 12px;
}

.footer-column h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: #B45309;
  border-radius: 2px;
}

.footer-column p,
.footer-column li {
  font-size: 15px;
  line-height: 1.8;
  color: #94A3B8;
}

.footer-column ul {
  list-style: none;
  padding: 0;
}

.footer-column li {
  margin-bottom: 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.footer-column li i {
  margin-top: 4px;
  color: #B45309;
}

.footer-column a {
  color: #94A3B8;
  text-decoration: none;
  transition: all 0.3s ease;
  display: block;
}

.footer-column a:hover {
  color: #B45309;
  transform: translateX(5px);
}

.footer-bottom {
  text-align: center;
  padding-top: 40px;
  margin-top: 40px;
  border-top: 1px solid #1E293B;
  font-size: 14px;
  color: #64748B;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 20px;
  padding-right: 20px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .ai-content {
    gap: 40px;
  }
  
  .carousel-title {
    font-size: 40px;
  }
  
  .case-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 25px;
  }
}

@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    height: auto;
    padding: 15px 20px;
    gap: 15px;
  }

  .search-container {
    margin: 0;
    width: 100%;
    flex: 1 1 100%;
  }

  .search-input {
    width: 100%;
  }

  .nav-links {
    margin-top: 10px;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
  }

  .nav-link {
    margin: 5px 0;
  }

  .carousel {
    height: 400px;
  }

  .carousel-title {
    font-size: 32px;
  }

  .carousel-subtitle {
    font-size: 16px;
  }

  .ai-content {
    flex-direction: column;
    text-align: center;
  }

  .ai-image {
    margin-top: 40px;
  }

  .case-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .content-section {
    margin: 40px auto;
  }

  .law-content {
    margin-top: 60px;
  }

  .ai-assistant {
    margin-top: 60px;
    padding: 60px 0;
  }

  .footer-container {
    grid-template-columns: 1fr;
    gap: 30px;
  }

  .section-title {
    font-size: 28px;
  }

  .ai-title {
    font-size: 32px;
  }
}

@media (max-width: 480px) {
  .carousel {
    height: 350px;
  }
  
  .carousel-title {
    font-size: 28px;
  }
  
  .case-card {
    padding: 24px;
  }
  
  .law-item {
    padding: 20px 24px;
  }
  
  .ai-assistant {
    padding: 40px 0;
  }
  
  .footer {
    padding: 40px 0 20px;
  }
}
</style>