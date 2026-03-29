<template>
  <div class="login-container">
    <div class="login-left">
      <div class="left-content">
        <div class="logo-container">
          <div class="logo-icon">⚖️</div>
          <h2>法律咨询平台</h2>
        </div>
        <p class="tagline">专业的法律咨询服务，AI驱动的智能法律助手，为您提供便捷、专业的法律咨询体验。</p>
        <div class="features">
          <div class="feature-item">
            <div class="feature-icon">🤖</div>
            <span>AI法律助手</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📚</div>
            <span>法律知识库</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <span>快速响应</span>
          </div>
        </div>
      </div>
    </div>
    <div class="login-right">
      <div class="login-card">
        <div class="login-header">
          <h2 class="login-title">创建账号</h2>
          <p class="login-subtitle">注册新账号，开始您的法律咨询之旅</p>
        </div>
        
        <form @submit.prevent="register">
          <div class="form-group">
            <label class="form-label" for="username">用户名</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input 
                type="text" 
                id="username" 
                class="form-input" 
                placeholder="请输入用户名"
                v-model="registerForm.username"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="email">邮箱</label>
            <div class="input-wrapper">
              <span class="input-icon">📧</span>
              <input 
                type="email" 
                id="email" 
                class="form-input" 
                placeholder="请输入邮箱"
                v-model="registerForm.email"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="phone">手机号</label>
            <div class="input-wrapper">
              <span class="input-icon">📱</span>
              <input 
                type="tel" 
                id="phone" 
                class="form-input" 
                placeholder="请输入手机号"
                v-model="registerForm.phone"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="password">密码</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input 
                type="password" 
                id="password" 
                class="form-input" 
                placeholder="请输入密码"
                v-model="registerForm.password"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="confirmPassword">确认密码</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input 
                type="password" 
                id="confirmPassword" 
                class="form-input" 
                placeholder="请再次输入密码"
                v-model="registerForm.confirmPassword"
              >
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label" for="emailCode">邮箱验证码</label>
            <div class="code-input-container">
              <div class="input-wrapper code-input-wrapper">
                <span class="input-icon">📧</span>
                <input 
                  type="text" 
                  id="emailCode" 
                  class="form-input code-input" 
                  placeholder="请输入邮箱验证码"
                  v-model="registerForm.emailCode"
                >
              </div>
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
          
          <div class="form-options">
            <label class="checkbox-container">
              <input type="checkbox" class="form-checkbox" v-model="agreeTerms">
              <span class="checkmark"></span>
              我已阅读并同意 <a href="#" class="terms-link">用户协议</a> 和 <a href="#" class="terms-link">隐私政策</a>
            </label>
          </div>
          
          <button type="submit" class="login-btn" @click="register" :disabled="!agreeTerms">
            <span class="btn-text">注册</span>
            <span class="btn-icon">→</span>
          </button>
          
          <div class="login-footer">
            已有账号？ <router-link to="/login" class="login-link">立即登录</router-link>
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
  let agreeTerms = ref(false);
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
/* CSS Variables */
:root {
  --primary-color: #1890ff;
  --primary-hover: #40a9ff;
  --secondary-color: #096dd9;
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-light: #999999;
  --background-light: #f5f7fa;
  --background-white: #ffffff;
  --border-color: #e8e8e8;
  --success-color: #52c41a;
  --error-color: #ff4d4f;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.16);
  --border-radius: 12px;
  --border-radius-sm: 8px;
  --transition: all 0.3s ease;
}

/* Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  display: flex;
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow: hidden;
  background: url('https://yujinyu-ai.oss-cn-beijing.aliyuncs.com/5712e6616a226c045a0064ead2f6b15e.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* Left Section */
.login-left {
  flex: 1;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('https://yujinyu-ai.oss-cn-beijing.aliyuncs.com/5712e6616a226c045a0064ead2f6b15e.jpg');
  background-size: cover;
  background-position: center;
  opacity: 0.3;
  animation: moveBackground 25s linear infinite;
  z-index: -1;
}

@keyframes moveBackground {
  0% { transform: translate(0, 0); }
  100% { transform: translate(60px, 60px); }
}

.left-content {
  position: relative;
  z-index: 1;
  max-width: 500px;
  text-align: center;
  animation: fadeInLeft 1s ease-out;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  gap: 15px;
}

.logo-icon {
  font-size: 48px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.logo-container h2 {
  font-size: 36px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
}

.tagline {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 40px;
  opacity: 0.9;
}

.features {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 40px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  animation: fadeInUp 0.8s ease-out;
}

.feature-item:nth-child(1) { animation-delay: 0.2s; }
.feature-item:nth-child(2) { animation-delay: 0.4s; }
.feature-item:nth-child(3) { animation-delay: 0.6s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.feature-item span {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
}

/* Right Section */
.login-right {
  flex: 1;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.login-right::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: url('https://yujinyu-ai.oss-cn-beijing.aliyuncs.com/5712e6616a226c045a0064ead2f6b15e.jpg');
  background-size: cover;
  background-position: center;
  opacity: 0.3;
  animation: moveBackground 25s linear infinite;
  z-index: -1;
}

.login-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 1;
  animation: fadeInRight 1s ease-out;
  transition: all 0.3s ease;
  overflow-y: auto;
  max-height: 90vh;
}

.login-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-5px);
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.login-header {
  margin-bottom: 30px;
  text-align: center;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #333333;
  margin-bottom: 10px;
  letter-spacing: -0.5px;
}

.login-subtitle {
  font-size: 16px;
  color: #666666;
  line-height: 1.4;
}

/* Form Styles */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.input-wrapper:focus-within {
  background: rgba(255, 255, 255, 0.9);
  border-color: #1890ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.2);
  transform: translateY(-2px);
}

.input-icon {
  position: absolute;
  left: 15px;
  font-size: 16px;
  color: var(--text-light);
  transition: var(--transition);
}

.input-wrapper:focus-within .input-icon {
  color: var(--primary-color);
}

.form-input {
  width: 100%;
  padding: 15px 15px 15px 45px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  color: #333333;
  transition: all 0.3s ease;
  background: transparent;
}

.form-input:focus {
  outline: none;
}

.form-input::placeholder {
  color: #999999;
  font-size: 14px;
}

/* 验证码输入容器 */
.code-input-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.code-input-wrapper {
  flex: 1;
}

.code-input {
  width: 100%;
}

.code-btn {
  padding: 0 20px;
  height: 50px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
}

.code-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.4);
  background: linear-gradient(135deg, #40a9ff, #1890ff);
}

.code-btn:disabled {
  background-color: #e8e8e8;
  color: #999999;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.code-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: var(--transition);
}

.code-btn:hover:not(:disabled)::before {
  left: 100%;
}

/* Form Options */
.form-options {
  margin-bottom: 30px;
  font-size: 14px;
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  color: #666666;
  transition: all 0.3s ease;
  line-height: 1.4;
}

.checkbox-container:hover {
  color: #333333;
}

.form-checkbox {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 18px;
  width: 18px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;
  margin-top: 2px;
  flex-shrink: 0;
}

.checkbox-container:hover .checkmark {
  border-color: #1890ff;
}

.form-checkbox:checked ~ .checkmark {
  background-color: #1890ff;
  border-color: #1890ff;
}

.checkmark:after {
  content: '';
  position: absolute;
  display: none;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.form-checkbox:checked ~ .checkmark:after {
  display: block;
}

.terms-link {
  color: var(--primary-color);
  text-decoration: none;
  transition: var(--transition);
  font-weight: 500;
}

.terms-link:hover {
  color: var(--primary-hover);
  text-decoration: underline;
}

/* Login Button */
.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #1890ff, #096dd9);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.4);
  background: linear-gradient(135deg, #40a9ff, #1890ff);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  background-color: #e8e8e8;
  color: #999999;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.3s ease;
}

.login-btn:hover:not(:disabled)::before {
  left: 100%;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.btn-icon {
  font-size: 18px;
  position: relative;
  z-index: 1;
  transition: var(--transition);
}

.login-btn:hover:not(:disabled) .btn-icon {
  transform: translateX(5px);
}

/* Login Footer */
.login-footer {
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.login-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: var(--transition);
  position: relative;
}

.login-link:hover {
  color: var(--primary-hover);
}

.login-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
  transform: scaleX(0);
  transition: var(--transition);
  transform-origin: right;
}

.login-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

/* Responsive Design */
@media (max-width: 992px) {
  .login-container {
    flex-direction: column;
  }

  .login-left {
    flex: none;
    height: 40vh;
    padding: 30px;
  }

  .logo-container h2 {
    font-size: 28px;
  }

  .tagline {
    font-size: 16px;
  }

  .features {
    gap: 20px;
  }

  .login-right {
    flex: 1;
    padding: 30px;
  }

  .login-card {
    padding: 30px;
  }
}

@media (max-width: 576px) {
  .login-left {
    height: 30vh;
    padding: 20px;
  }

  .logo-container {
    gap: 10px;
  }

  .logo-icon {
    font-size: 32px;
  }

  .logo-container h2 {
    font-size: 24px;
  }

  .tagline {
    font-size: 14px;
    margin-bottom: 20px;
  }

  .features {
    gap: 15px;
    margin-top: 20px;
  }

  .feature-icon {
    font-size: 24px;
  }

  .feature-item span {
    font-size: 12px;
  }

  .login-right {
    padding: 20px;
  }

  .login-card {
    padding: 25px 20px;
  }

  .login-title {
    font-size: 24px;
  }

  .login-subtitle {
    font-size: 14px;
  }

  .form-group {
    margin-bottom: 18px;
  }

  .form-input {
    padding: 12px 12px 12px 40px;
    font-size: 14px;
  }

  .input-icon {
    left: 12px;
    font-size: 14px;
  }

  .code-btn {
    padding: 0 16px;
    height: 44px;
    font-size: 12px;
  }

  .login-btn {
    padding: 14px;
    font-size: 14px;
  }

  .checkbox-container {
    font-size: 12px;
  }
}
</style>