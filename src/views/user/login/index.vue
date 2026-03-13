<template>
  <div class="login-container">
    <div class="login-left">
      <h2>法律咨询平台</h2>
      <p>专业的法律咨询服务，AI驱动的智能法律助手，为您提供便捷、专业的法律咨询体验。</p>
    </div>
    <div class="login-right">
      <div class="login-card">
        <div class="login-header">
          <h2 class="login-title">登录账号</h2>
          <p class="login-subtitle">欢迎回来，请登录您的账号</p>
        </div>
        
        <form @submit.prevent="login">
          <div class="form-group">
            <label class="form-label" for="username">用户名/邮箱</label>
            <input 
              type="text" 
              id="username" 
              class="form-input" 
              placeholder="请输入用户名或邮箱"
              v-model="loginForm.username"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label" for="password">密码</label>
            <input 
              type="password" 
              id="password" 
              class="form-input" 
              placeholder="请输入密码"
              v-model="loginForm.password"
            >
          </div>
          
          <button type="submit" class="login-btn" @click="login">登录</button>
          
          <div class="login-footer">
            还没有账号？ <router-link to="/register">立即注册</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { loginApi } from '@/api/login';

  let loginForm = ref({username:'', password:''})
  const router=useRouter();
  const login= async()=>{ 
    try {
      const result = await loginApi(loginForm.value);
      if(result.code){ 
        //登录成功
        ElMessage.success("登录成功");
        //存储当前员工登录信息
        localStorage.setItem('loginUser',JSON.stringify(result.data));
        //跳转页面
        router.push('/user');

      }else{ 
        //登录失败
        ElMessage.error(result.msg);
      }
    } catch (error) {
      ElMessage.error('登录失败，请稍后重试');
    }
  }

  const clear=()=>{ 
    loginForm.value={username:'', password:''} ;
  }
</script>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 40px;
  text-align: center;
}

.login-left h2 {
  font-size: 32px;
  margin-bottom: 20px;
  font-weight: bold;
}

.login-left p {
  font-size: 16px;
  max-width: 400px;
  margin-bottom: 40px;
}

.login-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #f5f5f5;
}

.login-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-header {
  margin-bottom: 30px;
}

.login-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.login-btn:hover {
  background-color: #40a9ff;
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
}

.login-footer a {
  color: #1890ff;
  text-decoration: none;
  transition: color 0.3s;
}

.login-footer a:hover {
  color: #40a9ff;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-left {
    padding: 30px;
    flex: none;
    height: 200px;
  }

  .login-left h2 {
    font-size: 24px;
  }

  .login-right {
    padding: 20px;
    flex: 1;
  }

  .login-card {
    padding: 30px;
  }
}

@media (max-width: 480px) {
  .login-left {
    height: 150px;
    padding: 20px;
  }

  .login-left h2 {
    font-size: 20px;
  }

  .login-card {
    padding: 20px;
  }

  .login-title {
    font-size: 20px;
  }
}
</style>