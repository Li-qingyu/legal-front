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
                <el-menu-item index="/admin/user"><el-icon><UserFilled /></el-icon>用户管理</el-menu-item>
                <el-menu-item index="/admin/type"><el-icon><HelpFilled /></el-icon>法律类型管理</el-menu-item>
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
.header {
  background-image: linear-gradient(to right, #00547d, #007fa4, #00aaa0, #00d072, #a8eb12);
}

.title {
  color: white;
  font-size: 40px;
  font-family: 楷体;
  line-height: 60px;
  font-weight: bolder;
}

.right_tool{
  float: right;
  line-height: 60px;
}

a {
  color: white;
  text-decoration: none;
}

.aside {
  width: 220px;
  border-right: 1px solid #ccc;
  height: 730px;
}
</style>
