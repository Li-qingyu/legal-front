<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="header-content">
        <div class="user-info">
          <div class="welcome-message">
            <i class="el-icon-sunny"></i> 欢迎回来
          </div>
          <h2 class="username">{{ userInfo.username || '用户' }}</h2>
          <p class="user-status">{{ userInfo.status == 1 ? '正常' : '已禁用' }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <i class="el-icon-document"></i>
              <span>法律案例</span>
            </div>
            <div class="stat-item">
              <i class="el-icon-notebook-1"></i>
              <span>法典查询</span>
            </div>
            <div class="stat-item">
              <i class="el-icon-chat-dot-round"></i>
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
          <i class="el-icon-info"></i> 基本信息
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
            <i class="el-icon-edit"></i> 修改信息
          </el-button>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="info-section password-management">
        <h3 class="section-title">
          <i class="el-icon-lock"></i> 密码管理
        </h3>
        <div class="password-card">
          <div class="password-security-status">
            <div class="security-item">
              <i class="el-icon-check-circle security-icon"></i>
              <span>定期修改密码</span>
            </div>
            <div class="security-item">
              <i class="el-icon-check-circle security-icon"></i>
              <span>使用强密码</span>
            </div>
            <div class="security-item">
              <i class="el-icon-check-circle security-icon"></i>
              <span>保护账号安全</span>
            </div>
          </div>
          <div class="password-tip">
            <p>定期修改密码可以保护您的账户安全</p>
            <p>密码建议包含字母、数字和特殊字符，长度至少8位</p>
          </div>
          <div class="password-action">
            <el-button type="warning" size="large" @click="openChangePasswordDialog">
              <i class="el-icon-key"></i> 修改密码
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="info-section">
        <h3 class="section-title">
          <i class="el-icon-star-on"></i> 案例收藏
        </h3>
        <div class="collection-card">
          <p class="collection-tip">查看和管理您收藏的法律案例</p>
          <el-button type="success" @click="goToCollection">
            <i class="el-icon-star-on"></i> 查看收藏
          </el-button>
        </div>
      </div>
    </div>

    <div class="profile-content">
      <div class="info-section">
        <h3 class="section-title">
          <i class="el-icon-chat-dot-round"></i> AI对话历史
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
.profile-container {
  min-height: calc(100vh - 60px);
  margin-top: 60px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
}

.profile-header {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3584e4 100%);
  border-radius: 16px;
  padding: 30px 40px;
  margin-bottom: 30px;
  box-shadow: 0 8px 24px rgba(30, 60, 114, 0.25);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.profile-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
  border-radius: 50%;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  position: relative;
  z-index: 1;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.welcome-message {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  animation: fadeIn 1s ease-in-out;
}

.welcome-message i {
  font-size: 16px;
  color: #d4af37;
  animation: pulse 2s infinite;
}

.username {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.8s ease-out;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-status {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  animation: slideIn 0.8s ease-out 0.2s both;
}

.user-stats {
  display: flex;
  gap: 15px;
  margin-top: 8px;
  animation: slideIn 0.8s ease-out 0.4s both;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  min-width: 80px;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-item i {
  font-size: 18px;
  color: #d4af37;
}

.stat-item span {
  font-size: 11px;
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
  gap: 8px;
  opacity: 0.6;
  margin-left: 30px;
}

.decoration-line {
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #d4af37, transparent);
}

.decoration-dot {
  width: 8px;
  height: 8px;
  background: #d4af37;
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(212, 175, 55, 0.6);
}

.profile-content {
  max-width: 1200px;
  margin: 0 auto 30px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

.info-section,
.password-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1e3c72;
  margin: 0 0 25px 0;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  font-size: 22px;
}

.info-card {
  margin-bottom: 25px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  width: 100px;
  font-weight: 600;
  color: #666666;
  font-size: 14px;
}

.info-value {
  flex: 1;
  color: #333333;
  font-size: 15px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.collection-card,
.history-card {
  text-align: center;
  padding: 20px;
}

.password-management {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid rgba(250, 173, 20, 0.2);
}

.password-card {
  text-align: center;
  padding: 30px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.password-security-status {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(250, 173, 20, 0.05);
  border-radius: 8px;
  border-left: 4px solid #faad14;
}

.security-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.security-icon {
  font-size: 24px;
  color: #52c41a;
  margin-bottom: 5px;
}

.security-item span {
  font-size: 14px;
  color: #666666;
  font-weight: 500;
}

.password-tip {
  color: #666666;
  font-size: 14px;
  margin-bottom: 30px;
  line-height: 1.6;
}

.password-tip p {
  margin: 8px 0;
}

.password-action {
  margin-top: 20px;
}

.collection-tip {
  color: #999999;
  font-size: 14px;
  margin-bottom: 20px;
  line-height: 1.6;
}

.history-list {
  text-align: left;
}

.history-item {
  padding: 15px;
  border-bottom: 1px solid #f5f5f5;
  margin-bottom: 15px;
}

.history-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.history-question,
.history-answer {
  margin-bottom: 10px;
  line-height: 1.5;
}

.history-label {
  font-weight: 600;
  color: #1e3c72;
  margin-right: 8px;
}

.history-content {
  color: #333333;
  font-size: 14px;
}

.history-time {
  font-size: 12px;
  color: #999999;
  text-align: right;
  margin-top: 10px;
}

.el-button {
  border-radius: 8px;
  font-weight: 500;
  padding: 12px 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-button--primary {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
}

.el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 60, 114, 0.3);
}

.el-button--warning {
  background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
}

.el-button--warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(250, 173, 20, 0.3);
}

.el-button--success {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.el-button--success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(82, 196, 26, 0.3);
}

.el-button--danger {
  background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
}

.el-button--danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 77, 79, 0.3);
}

:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 24px 32px;
  margin: 0;
  border-bottom: none;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  color: #ffffff;
  font-size: 18px;
  letter-spacing: 0.5px;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #ffffff;
  font-size: 20px;
  transition: all 0.3s ease;
}

:deep(.el-dialog__headerbtn .el-dialog__close:hover) {
  color: #d4af37;
  transform: rotate(90deg);
}

:deep(.el-dialog__body) {
  padding: 32px;
  background-color: #fafafa;
}

:deep(.el-dialog__footer) {
  padding: 20px 32px;
  border-top: 1px solid rgba(30, 60, 114, 0.1);
  background-color: #ffffff;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #1e3c72;
  font-size: 14px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(30, 60, 114, 0.15);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(30, 60, 114, 0.1), 0 4px 12px rgba(30, 60, 114, 0.15);
  border-color: #1e3c72;
}

:deep(.el-tag--success) {
  background: linear-gradient(135deg, #e6f7e6 0%, #f0f9f0 100%);
  border-color: rgba(82, 196, 26, 0.2);
  color: #52c41a;
}

:deep(.el-tag--danger) {
  background: linear-gradient(135deg, #fff1f0 0%, #fff7f6 100%);
  border-color: rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

@media (max-width: 992px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
  
  .profile-header {
    padding: 30px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .header-decoration {
    display: none;
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: 20px 10px;
  }
  
  .profile-header {
    padding: 25px;
  }
  
  .username {
    font-size: 24px;
  }
  
  .info-section,
  .password-section {
    padding: 20px;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .history-item {
    padding: 12px;
  }
  
  .history-content {
    font-size: 13px;
  }
}
</style>