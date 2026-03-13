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

            <el-sub-menu index="/manage">
              <template #title>
                <el-icon><Menu /></el-icon>管理菜单
              </template>
                <el-menu-item index="/admin/case"><el-icon><HelpFilled /></el-icon>法律案例管理</el-menu-item>
                <el-menu-item index="/admin/type"><el-icon><HelpFilled /></el-icon>法律类型管理</el-menu-item>
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
  background-color: #f5f7fa;
}

/* Header 样式 */
.header {
  background: linear-gradient(135deg, #1a5fb4 0%, #3584e4 50%, #62a0ea 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 100;
}

.title {
  color: white;
  font-size: 28px;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  line-height: 60px;
  font-weight: 600;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.right_tool {
  float: right;
  line-height: 60px;
}

.right_tool a {
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.right_tool a:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* 左侧菜单样式 */
.aside {
  width: 220px;
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  min-height: calc(100vh - 60px);
}

.aside :deep(.el-menu) {
  border-right: none;
  padding: 10px 0;
}

.aside :deep(.el-menu-item),
.aside :deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  margin: 4px 10px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.aside :deep(.el-menu-item:hover),
.aside :deep(.el-sub-menu__title:hover) {
  background-color: #ecf5ff;
  color: #409eff;
}

.aside :deep(.el-menu-item.is-active) {
  background-color: #409eff;
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
}

.aside :deep(.el-icon) {
  margin-right: 8px;
  font-size: 18px;
}

/* 主内容区域 */
:deep(.el-main) {
  padding: 0;
  background-color: #f5f7fa;
}
</style>
