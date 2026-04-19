<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { queryInfoApi, updateApi } from '@/api/user';
import { getRecentActivitiesApi } from '@/api/work-space';
import { User, Lock, Bell, Edit, Key, Check, Warning, Calendar, Clock, List }
  from '@element-plus/icons-vue';

const userInfo = ref({
  id: '',
  username: '',
  email: '',
  phone: '',
  status: '1'
});

const recentActivities = ref([]);

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
  loadRecentActivities();
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

const loadRecentActivities = async () => {
  try {
    const response = await getRecentActivitiesApi();
    recentActivities.value = response.data || [];
  } catch (error) {
    console.error('获取最近活动失败:', error);
  }
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

<template>
  <div class="profile-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="header-text">
            <h1 class="page-title">个人中心</h1>
            <p class="page-subtitle">Personal Center</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="profile-card">
      <div class="card-header">
        <div class="header-left">
          <el-icon class="header-icon"><User /></el-icon>
          <h2 class="header-title">基本信息</h2>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="openEditDialog">
            <el-icon><Edit /></el-icon>
            修改信息
          </el-button>
        </div>
      </div>
      <div class="card-content">
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">用户名</div>
            <div class="info-value">{{ userInfo.username }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">邮箱</div>
            <div class="info-value">{{ userInfo.email }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">手机号</div>
            <div class="info-value">{{ userInfo.phone }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">状态</div>
            <div class="info-value">
              <el-tag :type="userInfo.status == 1 ? 'success' : 'danger'" size="small">
                {{ userInfo.status == 1 ? '正常' : '已禁用' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 密码管理 -->
    <div class="profile-card">
      <div class="card-header">
        <div class="header-left">
          <el-icon class="header-icon"><Lock /></el-icon>
          <h2 class="header-title">密码管理</h2>
        </div>
        <div class="header-right">
          <el-button type="warning" @click="openChangePasswordDialog">
            <el-icon><Key /></el-icon>
            修改密码
          </el-button>
        </div>
      </div>
      <div class="card-content">
        <div class="password-security">
          <div class="security-item">
            <el-icon class="security-icon"><Check /></el-icon>
            <div class="security-text">
              <div class="security-title">定期修改密码</div>
              <div class="security-desc">建议每90天修改一次密码</div>
            </div>
          </div>
          <div class="security-item">
            <el-icon class="security-icon"><Check /></el-icon>
            <div class="security-text">
              <div class="security-title">使用强密码</div>
              <div class="security-desc">包含字母、数字和特殊字符</div>
            </div>
          </div>
          <div class="security-item">
            <el-icon class="security-icon"><Check /></el-icon>
            <div class="security-text">
              <div class="security-title">保护账号安全</div>
              <div class="security-desc">不要与他人共享账号信息</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="profile-card">
      <div class="card-header">
        <div class="header-left">
          <el-icon class="header-icon"><Bell /></el-icon>
          <h2 class="header-title">最近活动</h2>
        </div>
      </div>
      <div class="card-content">
        <div v-if="recentActivities.length === 0" class="empty-activities">
          <el-empty description="暂无活动记录" />
        </div>
        <div v-else class="activity-list">
          <div v-for="item in recentActivities" :key="item.id" class="activity-item">
            <div class="activity-header">
              <div class="activity-type">{{ item.type }}</div>
              <div class="activity-time">
                <el-icon class="time-icon"><Clock /></el-icon>
                {{ formatTime(item.time) }}
              </div>
            </div>
            <div class="activity-content">
              <el-icon class="content-icon"><List /></el-icon>
              <span>{{ item.title }}</span>
              <span class="activity-target">{{ item.userName }}</span>
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

<style scoped>
/* 页面变量 */
:root {
  --bg-primary: #F7F5F0;
  --bg-secondary: #FFFFFF;
  --accent: #C9A962;
  --accent-light: #E8D5A3;
  --accent-dark: #A68B4B;
  --text-primary: #1A1A1A;
  --text-secondary: #4A4A4A;
  --text-muted: #7A7A7A;
  --border: #E0DCD4;
  --card-shadow: 0 2px 12px rgba(45, 59, 53, 0.08);
  --card-shadow-hover: 0 8px 24px rgba(45, 59, 53, 0.12);
  --sidebar-bg: #1E3A2F;
}

/* 页面容器 */
.profile-container {
  padding: 20px;
  background-color: var(--bg-primary);
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  background: linear-gradient(135deg, #1E3A2F 0%, #2A4A3F 100%);
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 24px;
  box-shadow: 
    0 4px 6px rgba(30, 58, 47, 0.05),
    0 10px 20px rgba(30, 58, 47, 0.1),
    0 20px 40px rgba(30, 58, 47, 0.15);
  border: 1px solid rgba(201, 169, 98, 0.2);
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.page-header::before {
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

.page-header::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(201, 169, 98, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  transition: all 0.5s ease;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #C9A962, #E8D5A3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sidebar-bg);
  flex-shrink: 0;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.3);
}

.header-icon svg {
  width: 28px;
  height: 28px;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0 0 6px 0;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 255, 255, 0.3);
  font-family: 'Cormorant Garamond', Georgia, serif;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 500;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.4);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 卡片样式 */
.profile-card {
  background: var(--bg-secondary);
  border-radius: 14px;
  border: 1px solid rgba(224, 220, 212, 0.8);
  box-shadow: 
    0 2px 4px rgba(45, 59, 53, 0.04),
    0 6px 12px rgba(45, 59, 53, 0.06),
    0 16px 28px rgba(45, 59, 53, 0.08);
  margin-bottom: 24px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.profile-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  border-radius: 14px 14px 0 0;
}

.profile-card:hover {
  box-shadow: 
    0 4px 8px rgba(45, 59, 53, 0.06),
    0 12px 24px rgba(45, 59, 53, 0.1),
    0 24px 48px rgba(45, 59, 53, 0.12);
  transform: translateY(-3px);
  border-color: rgba(201, 169, 98, 0.3);
}

/* 卡片头部 */
.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-primary);
}

.card-header .header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.card-header .header-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--accent), var(--accent-light));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sidebar-bg);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(201, 169, 98, 0.3);
}

.card-header .header-icon svg {
  width: 20px;
  height: 20px;
}

.card-header .header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  font-family: 'Cormorant Garamond', Georgia, serif;
  letter-spacing: 0.5px;
}

.card-header .header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 卡片内容 */
.card-content {
  padding: 24px;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.info-item:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.15);
  transform: translateY(-2px);
}

.info-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.info-value {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 密码安全 */
.password-security {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.security-item:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.15);
}

.security-icon {
  font-size: 24px;
  color: #48BB78;
  margin-top: 2px;
  flex-shrink: 0;
}

.security-text {
  flex: 1;
}

.security-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.security-desc {
  font-size: 13px;
  color: var(--text-muted);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 最近活动 */
.empty-activities {
  padding: 60px 20px;
  text-align: center;
  background: var(--bg-primary);
  border-radius: 12px;
  border: 1px dashed var(--border);
  margin: 20px 0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-item {
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid var(--accent);
  box-shadow: 0 2px 8px rgba(45, 59, 53, 0.06);
  position: relative;
  z-index: 1;
}

.activity-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.activity-item:hover {
  border-color: var(--accent);
  box-shadow: 0 8px 24px rgba(201, 169, 98, 0.15);
  transform: translateX(8px) translateY(-2px);
  background: var(--bg-secondary);
}

.activity-item:hover::before {
  transform: scaleX(1);
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  position: relative;
  z-index: 1;
}

.activity-type {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-dark);
  background: rgba(201, 169, 98, 0.15);
  padding: 6px 16px;
  border-radius: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  transition: all 0.3s ease;
}

.activity-item:hover .activity-type {
  background: var(--accent);
  color: white;
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.3);
}

.activity-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg-primary);
  padding: 4px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  transition: all 0.3s ease;
}

.activity-item:hover .activity-time {
  border-color: var(--accent);
  color: var(--accent-dark);
  background: white;
  box-shadow: 0 2px 8px rgba(201, 169, 98, 0.2);
}

.time-icon {
  font-size: 14px;
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.activity-item:hover .time-icon {
  color: var(--accent-dark);
}

.activity-item:hover .activity-content span {
  color: var(--text-primary);
  font-weight: 500;
}

.activity-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  z-index: 1;
  padding-left: 8px;
  border-left: 2px solid var(--bg-primary);
  transition: all 0.3s ease;
}

.activity-item:hover .activity-content {
  border-left-color: var(--accent);
}

.content-icon {
  font-size: 20px;
  color: var(--accent-dark);
  margin-top: 2px;
  flex-shrink: 0;
  background: rgba(201, 169, 98, 0.1);
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.activity-item:hover .content-icon {
  background: var(--accent);
  color: white;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.3);
}

.activity-content span {
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.5;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.activity-target {
  color: var(--accent-dark);
  font-weight: 600;
  margin-left: 12px;
  padding: 2px 8px;
  background: rgba(201, 169, 98, 0.1);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.activity-item:hover .activity-target {
  background: var(--accent);
  color: white;
}

/* 活动项动画 */
.activity-item {
  animation: activitySlideIn 0.5s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

.activity-item:nth-child(1) { animation-delay: 0.1s; }
.activity-item:nth-child(2) { animation-delay: 0.2s; }
.activity-item:nth-child(3) { animation-delay: 0.3s; }
.activity-item:nth-child(4) { animation-delay: 0.4s; }
.activity-item:nth-child(5) { animation-delay: 0.5s; }

@keyframes activitySlideIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 按钮样式 */
.el-button {
  border-radius: 8px;
  font-weight: 600;
  padding: 10px 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  font-size: 14px;
  position: relative;
  overflow: hidden;
  z-index: 1;
  line-height: 1.4;
  min-width: 80px;
  text-align: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.el-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.6s ease;
  z-index: -1;
}

.el-button:hover::before {
  left: 100%;
}

.el-button--primary {
  background: linear-gradient(135deg, #C9A962, #E8D5A3);
  color: var(--sidebar-bg);
  box-shadow: 0 4px 12px rgba(201, 169, 98, 0.3);
  font-weight: 600;
  text-shadow: none;
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 8px;
}

.el-button--primary:hover {
  background: linear-gradient(135deg, #E8D5A3, #C9A962);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(201, 169, 98, 0.4);
  text-shadow: none;
}

.el-button--warning {
  background: linear-gradient(135deg, #ED8936, #DD6B20);
  color: white;
  box-shadow: 0 4px 12px rgba(237, 137, 54, 0.3);
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 8px;
}

.el-button--warning:hover {
  background: linear-gradient(135deg, #F6AD55, #ED8936);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(237, 137, 54, 0.4);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 
    0 24px 48px rgba(45, 59, 53, 0.2),
    0 8px 20px rgba(45, 59, 53, 0.1),
    0 4px 12px rgba(45, 59, 53, 0.08);
  max-width: 640px;
  animation: dialogFadeIn 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  transform-origin: center top;
  border: 1px solid rgba(201, 169, 98, 0.2);
}

@keyframes dialogFadeIn {
  0% {
    opacity: 0;
    transform: scale(0.92) translateY(-30px);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0);
  }
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #1E3A2F, #2D4A3F);
  padding: 24px 28px;
  margin: 0;
  border-bottom: none;
  position: relative;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.1);
}

:deep(.el-dialog__header::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(201, 169, 98, 0.1), transparent);
  pointer-events: none;
}

:deep(.el-dialog__header::after) {
  content: '';
  position: absolute;
  top: -50%;
  right: -5%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(201, 169, 98, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  transition: all 0.5s ease;
}

:deep(.el-dialog__title) {
  font-weight: 700;
  color: #ffffff;
  font-size: 20px;
  font-family: 'Cormorant Garamond', Georgia, serif;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.2);
  padding: 8px 16px;
  border-radius: 8px;
  display: inline-block;
}

:deep(.el-dialog__headerbtn) {
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-dialog__headerbtn:hover) {
  background: rgba(201, 169, 98, 0.2);
  transform: scale(1.05);
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

:deep(.el-dialog__headerbtn .el-dialog__close:hover) {
  color: #C9A962;
  transform: rotate(90deg) scale(1.15);
}

:deep(.el-dialog__body) {
  padding: 32px;
  background-color: var(--bg-primary);
  animation: bodyFadeIn 0.4s ease 0.1s forwards;
  opacity: 0;
}

@keyframes bodyFadeIn {
  0% {
    opacity: 0;
    transform: translateY(15px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.el-dialog__footer) {
  padding: 24px 28px;
  border-top: 1px solid var(--border);
  background-color: var(--bg-secondary);
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  border-radius: 0 0 20px 20px;
  animation: footerSlideIn 0.4s ease 0.2s forwards;
  opacity: 0;
}

@keyframes footerSlideIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.el-overlay) {
  animation: overlayFadeIn 0.25s ease forwards;
}

@keyframes overlayFadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* 表单样式 */
:deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(45, 59, 53, 0.06);
  transition: all 0.2s ease;
  border: 1px solid var(--border);
  background: var(--bg-secondary) !important;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(45, 59, 53, 0.1);
  border-color: var(--accent-light);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(201, 169, 98, 0.15);
  border-color: var(--accent);
}

.password-tip {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 标签样式 */
:deep(.el-tag--success) {
  background: rgba(72, 187, 120, 0.1);
  border-color: rgba(72, 187, 120, 0.2);
  color: #2F855A;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
}

:deep(.el-tag--danger) {
  background: rgba(229, 62, 62, 0.1);
  border-color: rgba(229, 62, 62, 0.2);
  color: #C53030;
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .page-header {
    padding: 24px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .header-icon {
    width: 48px;
    height: 48px;
  }
  
  .header-icon svg {
    width: 24px;
    height: 24px;
  }
  
  .info-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: 16px;
  }
  
  .page-header {
    padding: 20px;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .header-left {
    flex-direction: column;
    text-align: center;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .card-header .header-right {
    width: 100%;
    justify-content: flex-end;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .card-content {
    padding: 20px;
  }
  
  :deep(.el-dialog) {
    margin: 20px;
    width: auto !important;
  }
  
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}
</style>