<script setup>
import { Avatar, HelpFilled, Histogram, InfoFilled, Menu, Promotion, Tools, SwitchButton, UserFilled, Refresh, Bell, Search, Setting, ArrowRight } from '@element-plus/icons-vue';
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';

const name = ref('')
const router = useRouter()
const route = useRoute()

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 子菜单展开状态
const isManageMenuOpen = ref(true)

onMounted(() => {
  const loginUser = JSON.parse(localStorage.getItem('loginUser'));
  if (loginUser && loginUser.name) {
    name.value = loginUser.name;
  }
})

const logout = () => {
  ElMessageBox.confirm('是否退出登录', '提示',
    { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning', }
  ).then(async () => {
    ElMessage.success('退出成功');
    localStorage.removeItem('loginUser');
    router.push('/login');
  }).catch(() => {
    ElMessage.info('您已取消退出')
  })
}

// 切换管理菜单
const toggleManageMenu = () => {
  isManageMenuOpen.value = !isManageMenuOpen.value
}

// 导航到用户端
const goToUser = () => {
  window.open('/user', '_blank')
}
</script>

<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <!-- Logo区域 -->
      <div class="logo">
        <div class="logo-icon">⚖</div>
        <div class="logo-text-wrap">
          <div class="logo-text">LegalHub</div>
          <div class="logo-sub">法律咨询平台</div>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-section">
        <div class="nav-label">工作台</div>
        <router-link to="/admin/index" class="nav-item" :class="{ active: activeMenu === '/admin/index' }">
          <el-icon class="nav-icon"><Promotion /></el-icon>
          <span>工作台首页</span>
        </router-link>

        <div class="nav-label">管理菜单</div>
        
        <!-- 管理菜单组 -->
        <div class="nav-group">
          <div class="nav-item has-submenu" :class="{ active: isManageMenuOpen }" @click="toggleManageMenu">
            <el-icon class="nav-icon"><Menu /></el-icon>
            <span>内容管理</span>
            <el-icon class="submenu-arrow" :class="{ rotated: isManageMenuOpen }"><ArrowRight /></el-icon>
          </div>
          <div class="submenu" :class="{ expanded: isManageMenuOpen }">
            <router-link to="/admin/case" class="submenu-item" :class="{ active: activeMenu === '/admin/case' }">
              <el-icon><HelpFilled /></el-icon>
              <span>法律案例管理</span>
            </router-link>
            <router-link to="/admin/type" class="submenu-item" :class="{ active: activeMenu === '/admin/type' }">
              <el-icon><HelpFilled /></el-icon>
              <span>法律类型管理</span>
            </router-link>
            <router-link to="/admin/law-book" class="submenu-item" :class="{ active: activeMenu === '/admin/law-book' }">
              <el-icon><InfoFilled /></el-icon>
              <span>法律书管理</span>
            </router-link>
            <router-link to="/admin/law-article" class="submenu-item" :class="{ active: activeMenu === '/admin/law-article' }">
              <el-icon><InfoFilled /></el-icon>
              <span>法律条文管理</span>
            </router-link>
            <router-link to="/admin/sync" class="submenu-item" :class="{ active: activeMenu === '/admin/sync' }">
              <el-icon><Refresh /></el-icon>
              <span>同步知识库</span>
            </router-link>
            <router-link to="/admin/user" class="submenu-item" :class="{ active: activeMenu === '/admin/user' }">
              <el-icon><UserFilled /></el-icon>
              <span>用户管理</span>
            </router-link>
          </div>
        </div>

        <div class="nav-label">快捷入口</div>
        <a href="#" class="nav-item" @click.prevent="goToUser">
          <el-icon class="nav-icon"><Avatar /></el-icon>
          <span>用户端</span>
          <span class="nav-badge">→</span>
        </a>
      </nav>

      <!-- 用户信息卡片 -->
      <div class="sidebar-footer">
        <div class="user-card" @click="logout">
          <div class="user-avatar">
            {{ name ? name.charAt(0) : '管' }}
          </div>
          <div class="user-info">
            <div class="user-name">{{ name || '管理员' }}</div>
            <div class="user-role">平台管理员</div>
          </div>
          <el-icon class="logout-icon"><SwitchButton /></el-icon>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main">
      <!-- 顶部栏 -->
      <header class="header">
        <div class="header-left">
          <div class="breadcrumb">
            <span>法律咨询平台管理端</span>
          </div>
        </div>
        <div class="header-right">
          <button class="header-btn">
            <el-icon><Bell /></el-icon>
            <span class="badge">4</span>
          </button>
          <button class="header-btn">
            <el-icon><Setting /></el-icon>
          </button>
        </div>
      </header>

      <!-- 页面内容 -->
      <div class="content">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* CSS变量 - 参考UI设计文件的配色 */
:root {
  --bg-primary: #F7F5F0;
  --bg-secondary: #FFFFFF;
  --bg-sidebar: #1E3A2F;
  --accent: #C9A962;
  --accent-light: #E8D5A3;
  --accent-dark: #A68B4B;
  --text-primary: #2D3B35;
  --text-secondary: #6B7B75;
  --text-light: #FFFFFF;
  --text-muted: #9CA8A3;
  --border: #E5E0D8;
  --card-shadow: 0 2px 12px rgba(45, 59, 53, 0.08);
}

/* 整体布局 */
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #F7F5F0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 侧边栏 */
.sidebar {
  width: 260px;
  background: #1E3A2F;
  color: #FFFFFF;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.sidebar::before {
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

/* Logo区域 */
.logo {
  padding: 28px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  z-index: 1;
}

.logo-icon {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #C9A962, #E8D5A3);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.3);
}

.logo-text {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #FFFFFF;
}

.logo-sub {
  font-size: 11px;
  opacity: 0.6;
  font-weight: 400;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}

/* 导航区域 */
.nav-section {
  padding: 20px 0;
  flex: 1;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

.nav-section::-webkit-scrollbar {
  width: 4px;
}

.nav-section::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
}

.nav-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.4);
  padding: 8px 24px;
  margin-top: 12px;
}

/* 导航项 */
.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 24px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 14px;
  font-weight: 450;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  position: relative;
  cursor: pointer;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #FFFFFF;
}

.nav-item.active {
  background: rgba(201, 169, 98, 0.15);
  color: #E8D5A3;
  border-left-color: #C9A962;
}

.nav-icon {
  font-size: 18px;
  width: 20px;
  text-align: center;
}

.nav-badge {
  margin-left: auto;
  background: #C9A962;
  color: #1E3A2F;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
}

/* 子菜单 */
.nav-group {
  position: relative;
}

.has-submenu {
  justify-content: flex-start;
}

.submenu-arrow {
  margin-left: auto;
  font-size: 14px;
  transition: transform 0.3s ease;
  color: rgba(255, 255, 255, 0.5);
}

.submenu-arrow.rotated {
  transform: rotate(90deg);
}

.submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: rgba(0, 0, 0, 0.15);
}

.submenu.expanded {
  max-height: 400px;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 24px 11px 52px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 13px;
  font-weight: 400;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.submenu-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.9);
}

.submenu-item.active {
  background: rgba(201, 169, 98, 0.1);
  color: #E8D5A3;
  border-left-color: #C9A962;
}

.submenu-item .el-icon {
  font-size: 14px;
}

/* 侧边栏底部 - 用户卡片 */
.sidebar-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  z-index: 1;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-card:hover {
  background: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: linear-gradient(135deg, #C9A962, #A68B4B);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: #FFFFFF;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 2px;
  color: #FFFFFF;
}

.user-role {
  font-size: 11px;
  opacity: 0.6;
  color: rgba(255, 255, 255, 0.7);
}

.logout-icon {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.2s ease;
}

.user-card:hover .logout-icon {
  color: #E8D5A3;
}

/* 主内容区 */
.main {
  flex: 1;
  margin-left: 260px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部栏 */
.header {
  background: #FFFFFF;
  padding: 0 32px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #E5E0D8;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #2D3B35;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 搜索框 */
.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #F7F5F0;
  border: 1px solid #E5E0D8;
  border-radius: 8px;
  padding: 8px 14px;
  width: 260px;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: #C9A962;
  box-shadow: 0 0 0 3px rgba(201, 169, 98, 0.1);
}

.search-box input {
  border: none;
  background: none;
  outline: none;
  font-size: 13px;
  width: 100%;
  color: #2D3B35;
}

.search-box input::placeholder {
  color: #9CA8A3;
}

.search-box .el-icon {
  font-size: 16px;
  color: #9CA8A3;
}

/* 头部按钮 */
.header-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #E5E0D8;
  background: #FFFFFF;
  color: #6B7B75;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.header-btn:hover {
  border-color: #C9A962;
  color: #A68B4B;
}

.header-btn .badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  background: #E53E3E;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 28px 32px;
  background: #F7F5F0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .sidebar {
    width: 220px;
  }
  
  .main {
    margin-left: 220px;
  }
  
  .search-box {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .main {
    margin-left: 0;
  }
  
  .header {
    padding: 0 16px;
  }
  
  .search-box {
    display: none;
  }
  
  .content {
    padding: 16px;
  }
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.content > * {
  animation: fadeIn 0.4s ease forwards;
}
</style>
