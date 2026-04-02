<script setup>
import { Avatar, HelpFilled, Histogram, InfoFilled, Menu, Promotion, Tools, SwitchButton, UserFilled } from '@element-plus/icons-vue';
import { ref ,onMounted} from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
const name=ref('')
const router=useRouter();

onMounted(() => {
  const loginUser=JSON.parse(localStorage.getItem('loginUser'));  
  if(loginUser&&loginUser.name){
    name.value=loginUser.name;
  }
})
const logout=()=>{ 
   //弹出确认框
  ElMessageBox.confirm('是否退出登录','提示',
    {confirmButtonText: '确认',cancelButtonText: '取消',type: 'warning',}
  ).then(async() => {
    ElMessage.success('退出成功');
    localStorage.removeItem('loginUser');
    router.push('/login');
  }).catch(() => {
    ElMessage.info('您已取消退出')
  })
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <!-- Header 区域 -->
      <el-header class="header">
        <span class="title">法律咨询平台管理端</span>
        <span class="right_tool">
          <a href="javascrpit:;" @click="logout">
            <el-icon><SwitchButton /></el-icon> 退出登录 【{{name}}】
          </a>
        </span>
      </el-header>
      
      <el-container>
        <!-- 左侧菜单 -->
        <el-aside width="200px" class="aside">
          <el-menu router>
            <el-menu-item index="/admin/index">
              <el-icon><Promotion /></el-icon>首页
            </el-menu-item>

            <el-menu-item index="/user">
              <el-icon><UserFilled /></el-icon>用户端
            </el-menu-item>

            <el-sub-menu index="/manage">
              <template #title>
                <el-icon><Menu /></el-icon>管理菜单
              </template>
                <el-menu-item index="/admin/case"><el-icon><HelpFilled /></el-icon>法律案例管理</el-menu-item>
                <el-menu-item index="/admin/type"><el-icon><HelpFilled /></el-icon>法律类型管理</el-menu-item>
                <el-menu-item index="/admin/law-book"><el-icon><InfoFilled /></el-icon>法律书管理</el-menu-item>
                <el-menu-item index="/admin/law-article"><el-icon><InfoFilled /></el-icon>法律条文管理</el-menu-item>
                <el-menu-item index="/admin/user"><el-icon><UserFilled /></el-icon>用户管理</el-menu-item>

            </el-sub-menu>
          
          </el-menu>
        </el-aside>
        
        <el-main>
          <router-view></router-view>
        </el-main>
        
      </el-container>
      
    </el-container>
  </div>
</template>

<style scoped>
/* 整体布局 */
.common-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

/* Header 样式 */
.header {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3584e4 100%);
  box-shadow: 0 4px 20px rgba(30, 60, 114, 0.25);
  position: relative;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  overflow: hidden;
}

.header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -5%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.header::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: 10%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
  border-radius: 50%;
}

.title {
  color: white;
  font-size: 32px;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  line-height: 60px;
  font-weight: 700;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title::before {
  content: '⚖️';
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.right_tool {
  position: relative;
  z-index: 1;
  line-height: 60px;
}

.right_tool a {
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 25px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.right_tool a:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.right_tool .el-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.right_tool a:hover .el-icon {
  transform: rotate(180deg);
}

/* 左侧菜单样式 */
.aside {
  width: 240px;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  box-shadow: 4px 0 16px rgba(0, 0, 0, 0.08);
  min-height: calc(100vh - 60px);
  border-right: 1px solid rgba(30, 60, 114, 0.08);
  position: relative;
  overflow: hidden;
}

.aside::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #1e3c72, #d4af37, #1e3c72);
}

.aside :deep(.el-menu) {
  border-right: none;
  padding: 20px 12px;
  background: transparent;
}

.aside :deep(.el-menu-item),
.aside :deep(.el-sub-menu__title) {
  height: 52px;
  line-height: 52px;
  margin: 6px 8px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  font-size: 15px;
  color: #1e3c72;
  position: relative;
  overflow: hidden;
}

.aside :deep(.el-menu-item::before),
.aside :deep(.el-sub-menu__title::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #d4af37, #1e3c72);
  border-radius: 0 4px 4px 0;
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.aside :deep(.el-menu-item:hover),
.aside :deep(.el-sub-menu__title:hover) {
  background: linear-gradient(135deg, rgba(30, 60, 114, 0.08) 0%, rgba(42, 82, 152, 0.08) 100%);
  color: #1e3c72;
  transform: translateX(4px);
}

.aside :deep(.el-menu-item:hover::before),
.aside :deep(.el-sub-menu__title:hover::before) {
  transform: scaleY(1);
}

.aside :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(30, 60, 114, 0.3);
  transform: translateX(4px);
}

.aside :deep(.el-menu-item.is-active::before) {
  transform: scaleY(1);
  background: linear-gradient(180deg, #d4af37, #f0c419);
}

.aside :deep(.el-sub-menu .el-menu-item) {
  padding-left: 48px !important;
  margin: 4px 8px;
  height: 48px;
  line-height: 48px;
  font-size: 14px;
}

.aside :deep(.el-sub-menu .el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(30, 60, 114, 0.15) 0%, rgba(42, 82, 152, 0.15) 100%);
  color: #1e3c72;
  box-shadow: 0 2px 8px rgba(30, 60, 114, 0.15);
}

.aside :deep(.el-icon) {
  margin-right: 10px;
  font-size: 18px;
  transition: transform 0.3s ease;
}

.aside :deep(.el-menu-item:hover .el-icon),
.aside :deep(.el-sub-menu__title:hover .el-icon) {
  transform: scale(1.1);
}

.aside :deep(.el-sub-menu__icon-arrow) {
  transition: transform 0.3s ease;
}

.aside :deep(.el-sub-menu.is-opened > .el-sub-menu__title .el-sub-menu__icon-arrow) {
  transform: rotate(180deg);
}

/* 主内容区域 */
:deep(.el-main) {
  padding: 24px;
  background: transparent;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header {
    padding: 0 24px;
  }
  
  .title {
    font-size: 28px;
  }
  
  .aside {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  
  .title {
    font-size: 24px;
    letter-spacing: 1px;
  }
  
  .title::before {
    font-size: 24px;
  }
  
  .right_tool a {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  .aside {
    width: 180px;
  }
  
  .aside :deep(.el-menu-item),
  .aside :deep(.el-sub-menu__title) {
    height: 48px;
    line-height: 48px;
    font-size: 14px;
  }
  
  .aside :deep(.el-icon) {
    font-size: 16px;
  }
}
</style>
