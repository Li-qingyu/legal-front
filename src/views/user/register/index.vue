<template>
  <div class="login-container">
    <div class="login-left">
      <h2>法律咨询平台</h2>
      <p>专业的法律咨询服务，AI驱动的智能法律助手，为您提供便捷、专业的法律咨询体验。</p>
    </div>
    <div class="login-right">
      <div class="login-card">
        <div class="login-header">
          <h2 class="login-title">注册账号</h2>
          <p class="login-subtitle">创建新账号，开始您的法律咨询之旅</p>
        </div>
        
        <form @submit.prevent="register">
          <div class="form-group">
            <label class="form-label" for="username">用户名</label>
            <input 
              type="text" 
              id="username" 
              class="form-input" 
              placeholder="请输入用户名"
              v-model="registerForm.username"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label" for="email">邮箱</label>
            <input 
              type="email" 
              id="email" 
              class="form-input" 
              placeholder="请输入邮箱"
              v-model="registerForm.email"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label" for="phone">手机号</label>
            <input 
              type="tel" 
              id="phone" 
              class="form-input" 
              placeholder="请输入手机号"
              v-model="registerForm.phone"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label" for="password">密码</label>
            <input 
              type="password" 
              id="password" 
              class="form-input" 
              placeholder="请输入密码"
              v-model="registerForm.password"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label" for="confirmPassword">确认密码</label>
            <input 
              type="password" 
              id="confirmPassword" 
              class="form-input" 
              placeholder="请再次输入密码"
              v-model="registerForm.confirmPassword"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label" for="emailCode">邮箱验证码</label>
            <div class="code-input-container">
              <input 
                type="text" 
                id="emailCode" 
                class="form-input code-input" 
                placeholder="请输入邮箱验证码"
                v-model="registerForm.emailCode"
              >
              <button 
                type="button" 
                class="code-btn" 
                @click="sendEmailCode" 
                :disabled="countdown > 0"
              >
                {{ countdown > 0 ? `${countdown}s后重试` : '发送验证码' }}
              </button>
            </div>
          </div>
          
          <button type="submit" class="login-btn" @click="register">注册</button>
          
          <div class="login-footer">
            已有账号？ <router-link to="/login">立即登录</router-link>
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
import { registerApi, sendEmailCodeApi } from '@/api/login';

  let registerForm = ref({username:'', email:'', phone:'', password:'', confirmPassword:'', emailCode:''});
  let countdown = ref(0);
  let timer = null;
  const router=useRouter();
  
  // 发送邮箱验证码
  const sendEmailCode = async () => {
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!registerForm.value.email) {
      ElMessage.error('请输入邮箱');
      return;
    }
    if (!emailRegex.test(registerForm.value.email)) {
      ElMessage.error('请输入有效的邮箱地址');
      return;
    }
    
    try {
      // 调用发送验证码API
      const result = await sendEmailCodeApi(registerForm.value.email);
      if(result.code) {
        ElMessage.success('验证码已发送，请查收');
        // 开始倒计时
        startCountdown();
      } else {
        ElMessage.error(result.msg);
      }
    } catch (error) {
      ElMessage.error('发送验证码失败，请稍后重试');
    }
  };
  
  // 开始倒计时
  const startCountdown = () => {
    countdown.value = 180;
    timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
      }
    }, 1000);
  };
  
  // 注册方法
  const register= async()=>{ 
    // 表单验证
    if (!registerForm.value.username) {
      ElMessage.error('请输入用户名');
      return;
    }
    if (!registerForm.value.email) {
      ElMessage.error('请输入邮箱');
      return;
    }
    if (!registerForm.value.phone) {
      ElMessage.error('请输入手机号');
      return;
    }
    // 验证中国手机号码格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(registerForm.value.phone)) {
      ElMessage.error('请输入有效的中国手机号码');
      return;
    }
    if (!registerForm.value.password) {
      ElMessage.error('请输入密码');
      return;
    }
    if (registerForm.value.password !== registerForm.value.confirmPassword) {
      ElMessage.error('两次输入的密码不一致');
      return;
    }
    if (!registerForm.value.emailCode) {
      ElMessage.error('请输入邮箱验证码');
      return;
    }
    
    try {
      const result = await registerApi(registerForm.value);
      if(result.code){ 
        //注册成功
        ElMessage.success("注册成功，请登录");
        //跳转到登录页面
        router.push('/login');

      }else{ 
        //注册失败
        ElMessage.error(result.msg);
      }
    } catch (error) {
      ElMessage.error('注册失败，请稍后重试');
    }
  }

  const clear=()=>{ 
    registerForm.value={username:'', email:'', phone:'', password:'', confirmPassword:'', emailCode:''} ;
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

/* 验证码输入容器 */
.code-input-container {
  display: flex;
  gap: 10px;
}

.code-input {
  flex: 1;
}

.code-btn {
  padding: 0 20px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.code-btn:hover:not(:disabled) {
  background-color: #40a9ff;
}

.code-btn:disabled {
  background-color: #d9d9d9;
  cursor: not-allowed;
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