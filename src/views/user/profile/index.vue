<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="header-content">
        <div class="user-info">
          <div class="welcome-message">
            <i class="fa fa-sun-o"></i> 欢迎回来
          </div>
          <h2 class="username">{{ userInfo.username || '用户' }}</h2>
          <p class="user-status">{{ userInfo.status == 1 ? '正常' : '已禁用' }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <i class="fa fa-file-text-o"></i>
              <span>法律案例</span>
            </div>
            <div class="stat-item">
              <i class="fa fa-book"></i>
              <span>法典查询</span>
            </div>
            <div class="stat-item">
              <i class="fa fa-robot"></i>
              <span>AI咨询</span>
            </div>
          </div>
        </div>
        <div class="header-decoration">
          <div class="decoration-line"></div>
          <div class="decoration-dot"></div>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="info-section">
        <h3 class="section-title">
          <i class="fa fa-user-circle"></i> 基本信息
        </h3>
        <div class="info-card">
          <div class="info-item">
            <label class="info-label">用户名</label>
            <div class="info-value">{{ userInfo.username }}</div>
          </div>
          <div class="info-item">
            <label class="info-label">邮箱</label>
            <div class="info-value">{{ userInfo.email }}</div>
          </div>
          <div class="info-item">
            <label class="info-label">手机号</label>
            <div class="info-value">{{ userInfo.phone }}</div>
          </div>
          <div class="info-item">
            <label class="info-label">状态</label>
            <div class="info-value">
              <el-tag :type="userInfo.status == 1 ? 'success' : 'danger'" size="small">
                {{ userInfo.status == 1 ? '正常' : '已禁用' }}
              </el-tag>
            </div>
          </div>
        </div>
        <div class="action-buttons">
          <el-button type="primary" @click="openEditDialog">
            <i class="fa fa-pencil"></i> 修改信息
          </el-button>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="info-section password-management">
        <h3 class="section-title">
          <i class="fa fa-lock"></i> 密码管理
        </h3>
        <div class="password-card">
          <div class="password-security-status">
            <div class="security-item">
              <i class="fa fa-check-circle security-icon"></i>
              <span>定期修改密码</span>
            </div>
            <div class="security-item">
              <i class="fa fa-check-circle security-icon"></i>
              <span>使用强密码</span>
            </div>
            <div class="security-item">
              <i class="fa fa-check-circle security-icon"></i>
              <span>保护账号安全</span>
            </div>
          </div>
          <div class="password-tip">
            <p>定期修改密码可以保护您的账户安全</p>
            <p>密码建议包含字母、数字和特殊字符，长度至少8位</p>
          </div>
          <div class="password-action">
            <el-button type="warning" size="large" @click="openChangePasswordDialog">
              <i class="fa fa-key"></i> 修改密码
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="info-section">
        <h3 class="section-title">
          <i class="fa fa-star"></i> 案例收藏
        </h3>
        <div class="collection-card">
          <p class="collection-tip">查看和管理您收藏的法律案例</p>
          <el-button type="success" @click="goToCollection">
            <i class="fa fa-star"></i> 查看收藏
          </el-button>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="info-section">
        <h3 class="section-title">
          <i class="fa fa-comments"></i> AI对话历史
        </h3>
        <div class="history-card">
          <el-empty v-if="consultationHistory.length === 0" description="暂无对话历史" />
          <div v-else class="history-list">
            <div v-for="item in consultationHistory" :key="item.id" class="history-item">
              <div class="history-question">
                <span class="history-label">问题：</span>
                <span class="history-content">{{ item.question }}</span>
              </div>
              <div class="history-answer">
                <span class="history-label">回答：</span>
                <span class="history-content">{{ item.answer }}</span>
              </div>
              <div class="history-time">{{ formatTime(item.create_time) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改信息对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="修改个人信息"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="80px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
          <div class="password-tip">密码长度至少8位，包含字母和数字</div>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请确认新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleChangePassword">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { queryInfoApi, updateApi } from '@/api/user';

const router = useRouter();
const userInfo = ref({
  id: '',
  username: '',
  email: '',
  phone: '',
  status: '1'
});

const consultationHistory = ref([]);

const editDialogVisible = ref(false);
const editForm = ref({
  id: '',
  username: '',
  email: '',
  phone: ''
});

const editFormRef = ref(null);
const editRules = {
  username: [
    { required: true, message: '用户名为必填项', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度为2-20个字', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '邮箱为必填项', trigger: 'blur' },
    { type: 'email', message: '请输入合法的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '手机号为必填项', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/g, message: '请输入合法的手机号', trigger: 'blur' }
  ]
};

const passwordDialogVisible = ref(false);
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const passwordFormRef = ref(null);
const passwordRules = {
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
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

onMounted(() => {
  loadUserInfo();
  loadConsultationHistory();
});

const loadUserInfo = async () => {
  try {
    const loginUser = JSON.parse(localStorage.getItem('loginUser'));
    if (loginUser && loginUser.id) {
      const result = await queryInfoApi(loginUser.id);
      if (result.code) {
        userInfo.value = result.data;
      } else {
        ElMessage.error(result.msg || '获取用户信息失败');
      }
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败');
    console.error('获取用户信息失败:', error);
  }
};

const loadConsultationHistory = async () => {
  try {
    const loginUser = JSON.parse(localStorage.getItem('loginUser'));
    if (loginUser && loginUser.id) {
      // 这里应该调用后端API获取AI对话历史
      // 暂时使用模拟数据
      consultationHistory.value = [
        {
          id: 1,
          user_id: loginUser.id,
          question: '什么是劳动合同法？',
          answer: '劳动合同法是调整用人单位与劳动者之间劳动关系的法律规范的总称。',
          create_time: new Date().toISOString()
        },
        {
          id: 2,
          user_id: loginUser.id,
          question: '如何申请劳动仲裁？',
          answer: '申请劳动仲裁需要准备相关证据，向劳动仲裁委员会提交申请。',
          create_time: new Date().toISOString()
        }
      ];
    }
  } catch (error) {
    console.error('获取对话历史失败:', error);
  }
};

const goToCollection = () => {
  router.push('/user/collection');
};

const formatTime = (time) => {
  if (!time) return '';
  const date = new Date(time);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const openEditDialog = () => {
  editForm.value = {
    id: userInfo.value.id,
    username: userInfo.value.username,
    email: userInfo.value.email,
    phone: userInfo.value.phone
  };
  editDialogVisible.value = true;
};

const handleEdit = () => {
  if (editFormRef.value) {
    editFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const result = await updateApi(editForm.value);
          if (result.code) {
            ElMessage.success('修改成功');
            editDialogVisible.value = false;
            await loadUserInfo();
          } else {
            ElMessage.error(result.msg || '修改失败');
          }
        } catch (error) {
          ElMessage.error('修改失败');
          console.error('修改失败:', error);
        }
      } else {
        return false;
      }
    });
  }
};

const openChangePasswordDialog = () => {
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  passwordDialogVisible.value = true;
};

const handleChangePassword = () => {
  if (passwordFormRef.value) {
    passwordFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const result = await updateApi({
            id: userInfo.value.id,
            oldPassword: passwordForm.value.oldPassword,
            newPassword: passwordForm.value.newPassword
          });
          if (result.code) {
            ElMessage.success('密码修改成功');
            passwordDialogVisible.value = false;
          } else {
            ElMessage.error(result.msg || '修改失败');
          }
        } catch (error) {
          ElMessage.error('修改失败');
          console.error('修改失败:', error);
        }
      } else {
        return false;
      }
    });
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap');

.profile-container {
  min-height: calc(100vh - 70px);
  margin-top: 70px;
  background: #F8FAFC;
  padding: 40px 20px;
  font-family: 'Lato', sans-serif;
}

/* 头部区域 */
.profile-header {
  background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 12px 32px rgba(30, 58, 138, 0.25);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.profile-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(180, 83, 9, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.profile-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');
  z-index: 1;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  position: relative;
  z-index: 2;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.welcome-message {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  animation: fadeIn 1s ease-in-out;
}

.welcome-message i {
  font-size: 18px;
  color: #B45309;
  animation: pulse 2s infinite;
}

.username {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.8s ease-out;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'EB Garamond', serif;
}

.user-status {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  animation: slideIn 0.8s ease-out 0.2s both;
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-stats {
  display: flex;
  gap: 20px;
  margin-top: 12px;
  animation: slideIn 0.8s ease-out 0.4s both;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  min-width: 100px;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.stat-item i {
  font-size: 20px;
  color: #B45309;
}

.stat-item span {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  text-align: center;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.header-decoration {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  opacity: 0.6;
  margin-left: 40px;
}

.decoration-line {
  width: 100px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #B45309, transparent);
}

.decoration-dot {
  width: 10px;
  height: 10px;
  background: #B45309;
  border-radius: 50%;
  box-shadow: 0 0 16px rgba(180, 83, 9, 0.6);
  animation: pulse 2s infinite;
}

/* 内容区域 */
.profile-content {
  max-width: 1200px;
  margin: 0 auto 40px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

.info-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 36px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid #E2E8F0;
  transition: all 0.3s ease;
}

.info-section:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1E3A8A;
  margin: 0 0 30px 0;
  padding-bottom: 16px;
  border-bottom: 3px solid #B45309;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'EB Garamond', serif;
}

.section-title i {
  font-size: 24px;
  color: #B45309;
}

.info-card {
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #F1F5F9;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: #F8FAFC;
  padding-left: 12px;
  border-left: 4px solid #1E3A8A;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  width: 120px;
  font-weight: 600;
  color: #64748B;
  font-size: 15px;
}

.info-value {
  flex: 1;
  color: #1E293B;
  font-size: 16px;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #F1F5F9;
}

.collection-card,
.history-card {
  text-align: center;
  padding: 30px;
  background: #F8FAFC;
  border-radius: 12px;
  border: 1px solid #E2E8F0;
}

/* 密码管理 */
.password-management {
  background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);
  border: 2px solid rgba(180, 83, 9, 0.1);
}

.password-card {
  text-align: center;
  padding: 36px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid #E2E8F0;
}

.password-security-status {
  display: flex;
  justify-content: space-around;
  margin-bottom: 36px;
  padding: 24px;
  background: rgba(180, 83, 9, 0.05);
  border-radius: 12px;
  border-left: 4px solid #B45309;
}

.security-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex: 1;
  transition: all 0.3s ease;
  padding: 12px;
  border-radius: 8px;
}

.security-item:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-2px);
}

.security-icon {
  font-size: 28px;
  color: #10B981;
  margin-bottom: 8px;
}

.security-item span {
  font-size: 14px;
  color: #64748B;
  font-weight: 500;
  text-align: center;
}

.password-tip {
  color: #64748B;
  font-size: 15px;
  margin-bottom: 36px;
  line-height: 1.6;
  background: #F1F5F9;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #3B82F6;
}

.password-tip p {
  margin: 10px 0;
}

.password-action {
  margin-top: 24px;
}

.collection-tip {
  color: #94A3B8;
  font-size: 15px;
  margin-bottom: 24px;
  line-height: 1.6;
}

/* 历史记录 */
.history-list {
  text-align: left;
}

.history-item {
  padding: 20px;
  border-bottom: 1px solid #F1F5F9;
  margin-bottom: 20px;
  background: #F8FAFC;
  border-radius: 12px;
  transition: all 0.3s ease;
  border-left: 4px solid #1E3A8A;
}

.history-item:hover {
  transform: translateX(8px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.history-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.history-question,
.history-answer {
  margin-bottom: 12px;
  line-height: 1.6;
}

.history-label {
  font-weight: 600;
  color: #1E3A8A;
  margin-right: 10px;
  font-size: 14px;
}

.history-content {
  color: #334155;
  font-size: 15px;
  line-height: 1.6;
}

.history-time {
  font-size: 13px;
  color: #94A3B8;
  text-align: right;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #E2E8F0;
}

/* 按钮样式 */
.el-button {
  border-radius: 8px;
  font-weight: 600;
  padding: 12px 28px;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 15px;
}

.el-button--primary {
  background: #1E3A8A;
  border-color: #1E3A8A;
}

.el-button--primary:hover {
  background: #1E40AF;
  border-color: #1E40AF;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(30, 58, 138, 0.3);
}

.el-button--warning {
  background: #B45309;
  border-color: #B45309;
  color: white;
}

.el-button--warning:hover {
  background: #92400E;
  border-color: #92400E;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(180, 83, 9, 0.3);
}

.el-button--success {
  background: #10B981;
  border-color: #10B981;
  color: white;
}

.el-button--success:hover {
  background: #059669;
  border-color: #059669;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
}

.el-button--danger {
  background: #EF4444;
  border-color: #EF4444;
  color: white;
}

.el-button--danger:hover {
  background: #DC2626;
  border-color: #DC2626;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%);
  padding: 24px 32px;
  margin: 0;
  border-bottom: none;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  color: #ffffff;
  font-size: 18px;
  letter-spacing: 0.5px;
  font-family: 'EB Garamond', serif;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #ffffff;
  font-size: 20px;
  transition: all 0.3s ease;
}

:deep(.el-dialog__headerbtn .el-dialog__close:hover) {
  color: #B45309;
  transform: rotate(90deg);
}

:deep(.el-dialog__body) {
  padding: 32px;
  background-color: #F8FAFC;
}

:deep(.el-dialog__footer) {
  padding: 24px 32px;
  border-top: 1px solid rgba(30, 58, 138, 0.1);
  background-color: #ffffff;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #1E3A8A;
  font-size: 14px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #E2E8F0;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.15);
  border-color: #CBD5E1;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1), 0 4px 12px rgba(30, 58, 138, 0.15);
  border-color: #1E3A8A;
}

:deep(.el-tag--success) {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
  color: #059669;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
}

:deep(.el-tag--danger) {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: #DC2626;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
  
  .profile-header {
    padding: 36px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .header-decoration {
    display: none;
  }
  
  .user-stats {
    justify-content: center;
    margin-top: 20px;
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: 24px 12px;
  }
  
  .profile-header {
    padding: 28px;
  }
  
  .username {
    font-size: 28px;
  }
  
  .info-section {
    padding: 24px;
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 16px 0;
  }
  
  .info-label {
    width: 100%;
    font-size: 14px;
  }
  
  .info-value {
    font-size: 15px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
  
  .password-security-status {
    flex-direction: column;
    gap: 16px;
  }
  
  .history-item {
    padding: 16px;
  }
  
  .history-content {
    font-size: 14px;
  }
  
  :deep(.el-dialog__body) {
    padding: 24px;
  }
  
  :deep(.el-dialog__footer) {
    padding: 20px 24px;
  }
}

@media (max-width: 480px) {
  .profile-header {
    padding: 24px;
  }
  
  .username {
    font-size: 24px;
  }
  
  .stat-item {
    min-width: 80px;
    padding: 12px 16px;
  }
  
  .info-section {
    padding: 20px;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .password-card {
    padding: 24px;
  }
  
  .collection-card,
  .history-card {
    padding: 20px;
  }
}
</style>