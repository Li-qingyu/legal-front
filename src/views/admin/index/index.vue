<script setup>
import { ref, onMounted } from 'vue';
import { getCaseCountApi, getTypeCountApi, getArticleCountApi, getUserCountApi, getTrendDataApi, getRecentActivitiesApi } from "@/api/work-space";

const stats = ref([
  { 
    title: '法律案例', 
    count: 0, 
    icon: '📚', 
    color: '#1e3c72',
    gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    trend: '+12.5%',
    trendUp: true
  },
  { 
    title: '法律类型', 
    count: 0, 
    icon: '⚖️', 
    color: '#d4af37',
    gradient: 'linear-gradient(135deg, #d4af37 0%, #f0c419 100%)',
    trend: '+5.2%',
    trendUp: true
  },
  { 
    title: '法律条文', 
    count: 0, 
    icon: '📜', 
    color: '#52c41a',
    gradient: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
    trend: '+8.3%',
    trendUp: true
  },
  { 
    title: '用户总数', 
    count: 0, 
    icon: '👥', 
    color: '#ff4d4f',
    gradient: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
    trend: '+15.8%',
    trendUp: true
  }
]);

const quickActions = ref([
  { title: '新增案例', icon: '➕', path: '/admin/case', color: '#1e3c72' },
  { title: '管理类型', icon: '⚖️', path: '/admin/type', color: '#d4af37' },
  { title: '法律条文', icon: '📜', path: '/admin/law-article', color: '#52c41a' },
  { title: '用户管理', icon: '👥', path: '/admin/user', color: '#ff4d4f' }
]);

const recentActivities = ref([]);

onMounted(() => {
  loadStats();
  loadRecentActivities();
});

const loadStats = async () => {
  try {
    // 获取数量统计数据
    const caseResponse = await getCaseCountApi();
    stats.value[0].count = caseResponse.data || 0;

    const typeResponse = await getTypeCountApi();
    stats.value[1].count = typeResponse.data || 0;

    const articleResponse = await getArticleCountApi();
    stats.value[2].count = articleResponse.data || 0;

    const userResponse = await getUserCountApi();
    stats.value[3].count = userResponse.data || 0;

    // 获取增长趋势数据
    const trendResponse = await getTrendDataApi();
    const trendData = trendResponse.data;
    
    if (trendData) {
      // 更新案例增长趋势
      if (trendData.cases) {
        const caseTrend = parseFloat(trendData.cases.trend).toFixed(2);
        stats.value[0].trend = `${parseFloat(caseTrend) > 0 ? '+' : ''}${caseTrend}%`;
        stats.value[0].trendUp = parseFloat(trendData.cases.trend) > 0;
      }
      
      // 更新类型增长趋势
      if (trendData.types) {
        const typeTrend = parseFloat(trendData.types.trend).toFixed(2);
        stats.value[1].trend = `${parseFloat(typeTrend) > 0 ? '+' : ''}${typeTrend}%`;
        stats.value[1].trendUp = parseFloat(trendData.types.trend) > 0;
      }
      
      // 更新条文增长趋势
      if (trendData.articles) {
        const articleTrend = parseFloat(trendData.articles.trend).toFixed(2);
        stats.value[2].trend = `${parseFloat(articleTrend) > 0 ? '+' : ''}${articleTrend}%`;
        stats.value[2].trendUp = parseFloat(trendData.articles.trend) > 0;
      }
      
      // 更新用户增长趋势
      if (trendData.users) {
        const userTrend = parseFloat(trendData.users.trend).toFixed(2);
        stats.value[3].trend = `${parseFloat(userTrend) > 0 ? '+' : ''}${userTrend}%`;
        stats.value[3].trendUp = parseFloat(trendData.users.trend) > 0;
      }
    }
  } catch (error) {
    console.error('加载统计数据失败:', error);
  }
};

const loadRecentActivities = async () => {
  try {
    const response = await getRecentActivitiesApi();
    recentActivities.value = response.data || [];
  } catch (error) {
    console.error('加载最近活动失败:', error);
  }
};

// 根据活动类型获取对应的图标
const getActivityIcon = (type) => {
  const iconMap = {
    // 案例相关
    'case_add': '📚',
    'case_update': '�',
    'case_delete': '🗑️',
    // 法律条文相关
    'law_add': '📜',
    'law_update': '📝',
    'law_delete': '🗑️',
    // 用户相关
    'user_add': '�',
    'user_update': '👤',
    'user_delete': '�️',
    'user_register': '👥',
    // 法律类型相关
    'type_add': '⚖️',
    'type_update': '📝',
    'type_delete': '🗑️',
    // 法律书籍相关
    'book_add': '📖',
    'book_update': '📝',
    'book_delete': '🗑️'
  };
  return iconMap[type] || '📋';
};

// 格式化时间
const formatTime = (timeString) => {
  const date = new Date(timeString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
};
</script>

<template>
  <div class="dashboard-container">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <h1 class="welcome-title">欢迎回来，管理员</h1>
        <p class="welcome-subtitle">Welcome back, Administrator</p>
        <p class="welcome-desc">今天是 {{ new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) }}</p>
      </div>
      <div class="banner-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div 
        v-for="(stat, index) in stats" 
        :key="index" 
        class="stat-card"
        :style="{ '--card-gradient': stat.gradient }"
      >
        <div class="stat-icon">{{ stat.icon }}</div>
        <div class="stat-content">
          <div class="stat-title">{{ stat.title }}</div>
          <div class="stat-count">{{ stat.count }}</div>
          <div class="stat-trend" :class="{ 'trend-up': stat.trendUp }">
            {{ stat.trend }}
          </div>
        </div>
        <div class="stat-decoration"></div>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="quick-actions-section">
      <h2 class="section-title">快捷操作</h2>
      <div class="quick-actions-grid">
        <router-link 
          v-for="(action, index) in quickActions" 
          :key="index" 
          :to="action.path" 
          class="quick-action-card"
          :style="{ '--action-color': action.color }"
        >
          <div class="action-icon">{{ action.icon }}</div>
          <div class="action-title">{{ action.title }}</div>
          <div class="action-arrow">→</div>
        </router-link>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activities-section">
      <h2 class="section-title">最近活动</h2>
      <div class="activities-list">
        <div 
          v-for="(activity, index) in recentActivities" 
          :key="activity.id || index" 
          class="activity-item"
        >
          <div class="activity-icon">{{ getActivityIcon(activity.type) }}</div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-meta">
              <span class="activity-user">{{ activity.userName }}</span>
              <span class="activity-time">{{ formatTime(activity.time) }}</span>
            </div>
          </div>
          <div class="activity-indicator"></div>
        </div>
        <div v-if="recentActivities.length === 0" class="no-activities">
          <p>暂无最近活动</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&family=Lato:wght@300;400;700&display=swap');

.dashboard-container {
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Lato', sans-serif;
}

/* 欢迎横幅 */
.welcome-banner {
  background: linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%);
  border-radius: 16px;
  padding: 56px 64px;
  margin-bottom: 40px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 16px 48px rgba(30, 58, 138, 0.3);
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(180, 83, 9, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.welcome-banner::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');
  z-index: 1;
}

.banner-content {
  position: relative;
  z-index: 2;
}

.welcome-title {
  font-size: 42px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px 0;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-family: 'EB Garamond', serif;
}

.welcome-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 20px 0;
  font-weight: 400;
  letter-spacing: 0.5px;
}

.welcome-desc {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-weight: 300;
}

.banner-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 140px;
  height: 140px;
  top: 20%;
  right: 15%;
  animation-delay: 0s;
}

.circle-2 {
  width: 100px;
  height: 100px;
  top: 60%;
  right: 25%;
  animation-delay: 2s;
}

.circle-3 {
  width: 80px;
  height: 80px;
  top: 40%;
  right: 35%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-25px) scale(1.1);
    opacity: 0.5;
  }
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.stat-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid #E2E8F0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--card-gradient);
}

.stat-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  border-color: #CBD5E1;
}

.stat-icon {
  font-size: 56px;
  margin-bottom: 20px;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.1));
}

.stat-content {
  position: relative;
  z-index: 1;
}

.stat-title {
  font-size: 16px;
  color: #64748B;
  margin-bottom: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.stat-count {
  font-size: 42px;
  font-weight: 700;
  color: #1E3A8A;
  margin-bottom: 12px;
  line-height: 1;
  font-family: 'EB Garamond', serif;
}

.stat-trend {
  font-size: 14px;
  font-weight: 600;
  color: #10B981;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 20px;
}

.stat-trend::before {
  content: '↑';
  font-size: 12px;
}

.stat-trend:not(.trend-up) {
  color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
}

.stat-trend:not(.trend-up)::before {
  content: '↓';
}

.stat-decoration {
  position: absolute;
  bottom: -20px;
  right: -20px;
  width: 120px;
  height: 120px;
  background: var(--card-gradient);
  border-radius: 50%;
  opacity: 0.05;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-decoration {
  opacity: 0.1;
  transform: scale(1.3);
}

/* 快捷操作区域 */
.quick-actions-section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 28px;
  font-weight: 700;
  color: #1E3A8A;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: 'EB Garamond', serif;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 32px;
  background: #B45309;
  border-radius: 2px;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}

.quick-action-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 40px 28px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.quick-action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--action-color);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.quick-action-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  border-color: var(--action-color);
}

.quick-action-card:hover::before {
  transform: scaleX(1);
}

.action-icon {
  font-size: 48px;
  transition: transform 0.3s ease;
}

.quick-action-card:hover .action-icon {
  transform: scale(1.3) rotate(5deg);
}

.action-title {
  font-size: 18px;
  font-weight: 600;
  color: #1E3A8A;
  text-align: center;
  font-family: 'EB Garamond', serif;
}

.action-arrow {
  font-size: 28px;
  color: var(--action-color);
  opacity: 0;
  transform: translateX(-15px);
  transition: all 0.3s ease;
}

.quick-action-card:hover .action-arrow {
  opacity: 1;
  transform: translateX(0) scale(1.2);
}

/* 最近活动区域 */
.recent-activities-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid #E2E8F0;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px;
  background: #F8FAFC;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #E2E8F0;
  position: relative;
  overflow: hidden;
}

.activity-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #B45309;
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.activity-item:hover {
  transform: translateX(12px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  border-color: #CBD5E1;
  background: #ffffff;
}

.activity-item:hover::before {
  transform: scaleY(1);
}

.activity-icon {
  font-size: 36px;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F1F5F9;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.activity-item:hover .activity-icon {
  background: #E2E8F0;
  transform: scale(1.1);
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 16px;
  font-weight: 600;
  color: #1E3A8A;
  margin-bottom: 8px;
  line-height: 1.4;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.activity-user {
  font-size: 14px;
  color: #64748B;
  font-weight: 500;
  background: #E2E8F0;
  padding: 4px 12px;
  border-radius: 16px;
}

.activity-time {
  font-size: 14px;
  color: #94A3B8;
  font-weight: 500;
}

.activity-indicator {
  width: 10px;
  height: 10px;
  background: #B45309;
  border-radius: 50%;
  box-shadow: 0 0 16px rgba(180, 83, 9, 0.6);
  flex-shrink: 0;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.no-activities {
  text-align: center;
  padding: 60px 20px;
  color: #94A3B8;
  font-size: 16px;
  background: #F8FAFC;
  border-radius: 12px;
  margin-top: 20px;
  border: 2px dashed #E2E8F0;
}

.no-activities::before {
  content: '📋';
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .welcome-banner {
    padding: 48px 48px;
  }
  
  .welcome-title {
    font-size: 36px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
  }
  
  .stat-card {
    padding: 28px;
  }
  
  .stat-count {
    font-size: 36px;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 0 20px;
  }
  
  .welcome-banner {
    padding: 36px 32px;
    margin-bottom: 32px;
  }
  
  .welcome-title {
    font-size: 32px;
  }
  
  .welcome-subtitle {
    font-size: 16px;
  }
  
  .welcome-desc {
    font-size: 14px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 32px;
  }
  
  .stat-card {
    padding: 24px;
  }
  
  .stat-count {
    font-size: 32px;
  }
  
  .quick-actions-section {
    margin-bottom: 32px;
  }
  
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .quick-action-card {
    padding: 32px 20px;
  }
  
  .action-icon {
    font-size: 40px;
  }
  
  .action-title {
    font-size: 16px;
  }
  
  .recent-activities-section {
    padding: 32px;
  }
  
  .activity-item {
    padding: 20px;
    gap: 16px;
  }
  
  .activity-icon {
    font-size: 32px;
    width: 50px;
    height: 50px;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .activity-title {
    font-size: 15px;
  }
  
  .activity-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .welcome-banner {
    padding: 28px 24px;
  }
  
  .welcome-title {
    font-size: 28px;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .activity-indicator {
    position: absolute;
    top: 20px;
    right: 20px;
  }
  
  .recent-activities-section {
    padding: 24px;
  }
  
  .no-activities {
    padding: 40px 16px;
  }
}
</style>