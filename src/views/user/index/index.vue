<template>
  <div class="app">
    <!-- 顶部导航栏 -->
    <el-header height="60px" class="navbar">
      <div class="navbar-container">
        <router-link to="/" class="logo">法律咨询平台</router-link>
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
          <div class="user-menu">
            <el-dropdown trigger="hover">
              <span class="user-menu-trigger">
                个人中心
                <i class="el-icon-arrow-down el-icon--right"></i>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="openChangePasswordDialog">修改密码</el-dropdown-item>
                  <el-dropdown-item v-if="userRole === 1" @click="goToAdmin">管理端</el-dropdown-item>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <!-- 修改密码对话框 -->
          <el-dialog
            v-model="changePasswordDialogVisible"
            title="修改密码"
            width="400px"
          >
            <el-form :model="changePasswordForm" label-width="80px" :rules="changePasswordRules" ref="changePasswordFormRef">
              <el-form-item label="旧密码" prop="oldPassword">
                <el-input v-model="changePasswordForm.oldPassword" type="password" placeholder="请输入旧密码" show-password />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input 
                  v-model="changePasswordForm.newPassword" 
                  type="password" 
                  placeholder="请输入新密码" 
                  show-password 
                />
                <div class="password-tip">密码长度至少8位，包含字母和数字</div>
              </el-form-item>
              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input 
                  v-model="changePasswordForm.confirmPassword" 
                  type="password" 
                  placeholder="请确认新密码" 
                  show-password 
                />
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="changePasswordDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleChangePassword">确定</el-button>
              </span>
            </template>
          </el-dialog>
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
            <i class="el-icon-document"></i> 热门法律案例
          </h2>
          <div class="case-grid">
            <div class="case-card" v-for="(caseItem, index) in cases.slice(0, 6)" :key="index">
              <div class="case-icon">
                <i class="el-icon-collection-tag"></i>
              </div>
              <h3 class="case-title">{{ caseItem.title }}</h3>
              <p class="case-summary">{{ caseItem.content }}</p>
              <div class="case-meta">
                <span><i class="el-icon-time"></i> {{ caseItem.publishTime }}</span>
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
            <i class="el-icon-notebook-1"></i> 法律条文
          </h2>
          <div class="law-list">
            <div class="law-item" v-for="(law, index) in laws" :key="index">
              <div class="law-item-header">
                <h3 class="law-item-title">{{ law.name }}</h3>
                <el-tag type="success" size="small">生效</el-tag>
              </div>
              <p class="law-item-meta">
                <i class="el-icon-date"></i> 发布时间：{{ law.publishDate }} | 
                <i class="el-icon-success"></i> 生效时间：{{ law.effectiveDate }}
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
                  <i class="el-icon-chat-line-square"></i> AI法律助手
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
import { ElMessage } from 'element-plus';
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

// 数据状态
const carouselData = ref([]);
const cases = ref([]);
const laws = ref([]);
const loading = ref(false);
const error = ref('');

// 修改密码相关
const changePasswordDialogVisible = ref(false);
const changePasswordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});
const changePasswordFormRef = ref(null);

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
        // 实际项目中需要根据后端API进行处理
        setTimeout(() => {
          // 显示成功消息
          ElMessage.success('密码修改成功');
          changePasswordDialogVisible.value = false;
        }, 1000);
      } else {
        // 表单验证失败
        return false;
      }
    });
  }
}

// 查看案例详情
function viewCaseDetail(id) {
  console.log('查看案例详情:', id);
  router.push(`/user/case/${id}`);
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

// 退出登录
function handleLogout() {
  // 清除本地存储中的用户信息
  localStorage.removeItem('loginUser');
  
  // 显示退出登录成功的提示
  ElMessage.success('退出登录成功');
  
  // 跳转到登录页面
  // 由于项目中可能还没有集成router，暂时使用window.location.href
  setTimeout(() => {
    window.location.href = '/login';
  }, 1000);
  
  console.log('退出登录');
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.navbar {
  background: linear-gradient(to right, #2c3e50, #34495e);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  text-decoration: none;
  white-space: nowrap;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.search-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 1 400px;
  margin: 0 20px;
}

.search-input {
  width: 300px;
  margin-right: 0;
  border-radius: 4px 0 0 4px;
}

.search-btn {
  padding: 0 16px;
  border-radius: 0 4px 4px 0;
  margin-left: -1px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 30px;
}

.nav-link {
  text-decoration: none;
  color: #fff;
  font-size: 16px;
  transition: color 0.3s;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.nav-link:hover {
  color: #3498db;
}

.nav-link.router-link-active {
  color: #3498db;
  font-weight: 500;
}

.nav-link.router-link-exact-active {
  color: #3498db;
  font-weight: 500;
}

.user-menu {
  position: relative;
}

.user-menu-trigger {
  display: inline-block;
  padding: 0 10px;
  height: 60px;
  line-height: 60px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.3s;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.user-menu-trigger:hover {
  color: #3498db;
}

.password-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  line-height: 1.4;
}

.main-content {
  margin-top: 60px;
  flex: 1;
}

.carousel {
  height: 400px;
  background-color: #f0f2f5;
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
}

.carousel-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
  color: white;
}

.carousel-subtitle {
  font-size: 18px;
  color: white;
  margin-bottom: 30px;
}

.content-section {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  position: relative;
  padding-bottom: 10px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 80px;
  height: 4px;
  background: linear-gradient(to right, #1e3c72, #2a5298);
  border-radius: 2px;
}

.case-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.case-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  padding: 25px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
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

.case-icon {
  font-size: 24px;
  color: #1e3c72;
  margin-bottom: 15px;
}

.case-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  color: #333;
  line-height: 1.4;
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
}

.case-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.case-actions {
  display: flex;
  justify-content: flex-end;
}

.case-more {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.more-link {
  text-decoration: none;
}

.law-content {
  margin-top: 60px;
}

.law-list {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  overflow: hidden;
}

.law-item {
  padding: 20px 25px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s;
}

.law-item:hover {
  background-color: #f9f9f9;
}

.law-item:last-child {
  border-bottom: none;
}

.law-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.law-item-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.law-item-meta {
  font-size: 13px;
  color: #999;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-assistant {
  margin-top: 60px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  padding: 60px 0;
  color: white;
}

.ai-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.ai-content {
  display: flex;
  align-items: center;
  gap: 40px;
}

.ai-info {
  flex: 1;
}

.ai-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 20px;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-description {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
  line-height: 1.7;
}

.ai-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 15px 30px;
  border-radius: 30px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s;
}

.ai-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
  border: 2px solid rgba(255,255,255,0.5);
}

.ai-image {
  flex: 1;
  text-align: center;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}

.ai-image-img {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.footer {
  background: linear-gradient(to right, #2c3e50, #34495e);
  color: #fff;
  padding: 50px 0 20px;
  margin-top: 60px;
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
  margin-bottom: 20px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-column p,
.footer-column li {
  font-size: 14px;
  line-height: 1.7;
  color: #ccc;
}

.footer-column ul {
  list-style: none;
  padding: 0;
}

.footer-column li {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-column a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s;
  display: block;
}

.footer-column a:hover {
  color: #1890ff;
}

.footer-bottom {
  text-align: center;
  padding-top: 30px;
  margin-top: 30px;
  border-top: 1px solid #444;
  font-size: 13px;
  color: #999;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 20px;
  padding-right: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    height: auto;
    padding: 15px 20px;
  }

  .search-container {
    margin: 15px 0;
    width: 100%;
    flex: 1 1 100%;
  }

  .search-input {
    width: 100%;
  }

  .nav-links {
    margin-top: 15px;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
  }

  .nav-link {
    margin: 5px 0;
  }

  .carousel {
    height: 350px;
  }

  .carousel-title {
    font-size: 28px;
  }

  .carousel-subtitle {
    font-size: 16px;
  }

  .ai-content {
    flex-direction: column;
    text-align: center;
  }

  .ai-image {
    margin-top: 30px;
  }

  .case-grid {
    grid-template-columns: 1fr;
  }

  .footer-container {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}
</style>