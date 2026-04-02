<script setup>
import { ref, onMounted } from 'vue';
import { getCaseCountApi, getTypeCountApi, getArticleCountApi, getUserCountApi, getTrendDataApi } from "@/api/work-space";

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

const recentActivities = ref([
  { type: 'case', title: '新增法律案例：劳动合同纠纷案例', time: '10分钟前', icon: '📚' },
  { type: 'user', title: '新用户注册：张三', time: '30分钟前', icon: '👤' },
  { type: 'update', title: '更新法律条文：民法典第123条', time: '1小时前', icon: '📝' },
  { type: 'collection', title: '用户收藏案例：交通事故责任认定', time: '2小时前', icon: '⭐' }
]);

onMounted(() => {
  loadStats();
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
          :key="index" 
          class="activity-item"
        >
          <div class="activity-icon">{{ activity.icon }}</div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-time">{{ activity.time }}</div>
          </div>
          <div class="activity-indicator"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
}

/* 欢迎横幅 */
.welcome-banner {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #3584e4 100%);
  border-radius: 20px;
  padding: 48px 56px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(30, 60, 114, 0.3);
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.welcome-banner::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -5%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
  border-radius: 50%;
}

.banner-content {
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.welcome-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 16px 0;
  font-weight: 400;
  letter-spacing: 0.5px;
}

.welcome-desc {
  font-size: 14px;
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
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 120px;
  height: 120px;
  top: 20%;
  right: 15%;
  animation-delay: 0s;
}

.circle-2 {
  width: 80px;
  height: 80px;
  top: 60%;
  right: 25%;
  animation-delay: 2s;
}

.circle-3 {
  width: 60px;
  height: 60px;
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
    transform: translateY(-20px) scale(1.1);
    opacity: 0.5;
  }
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 28px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(30, 60, 114, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 48px;
  margin-bottom: 16px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.stat-content {
  position: relative;
  z-index: 1;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.stat-count {
  font-size: 36px;
  font-weight: 700;
  color: #1e3c72;
  margin-bottom: 8px;
  line-height: 1;
}

.stat-trend {
  font-size: 13px;
  font-weight: 600;
  color: #52c41a;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.stat-trend::before {
  content: '↑';
}

.stat-decoration {
  position: absolute;
  bottom: -20px;
  right: -20px;
  width: 100px;
  height: 100px;
  background: var(--card-gradient);
  border-radius: 50%;
  opacity: 0.05;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-decoration {
  opacity: 0.1;
  transform: scale(1.2);
}

/* 快捷操作区域 */
.quick-actions-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e3c72;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 28px;
  background: linear-gradient(180deg, #d4af37, #1e3c72);
  border-radius: 2px;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.quick-action-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  padding: 32px 24px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: var(--action-color);
}

.quick-action-card:hover::before {
  transform: scaleX(1);
}

.action-icon {
  font-size: 40px;
  transition: transform 0.3s ease;
}

.quick-action-card:hover .action-icon {
  transform: scale(1.2);
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e3c72;
  text-align: center;
}

.action-arrow {
  font-size: 24px;
  color: var(--action-color);
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.quick-action-card:hover .action-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* 最近活动区域 */
.recent-activities-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(30, 60, 114, 0.08);
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(30, 60, 114, 0.05);
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
  background: linear-gradient(180deg, #d4af37, #1e3c72);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.activity-item:hover {
  transform: translateX(8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: rgba(30, 60, 114, 0.15);
}

.activity-item:hover::before {
  transform: scaleY(1);
}

.activity-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e3c72;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 13px;
  color: #999;
}

.activity-indicator {
  width: 8px;
  height: 8px;
  background: #d4af37;
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(212, 175, 55, 0.6);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .welcome-banner {
    padding: 36px 40px;
  }
  
  .welcome-title {
    font-size: 32px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 0 16px;
  }
  
  .welcome-banner {
    padding: 28px 24px;
  }
  
  .welcome-title {
    font-size: 28px;
  }
  
  .welcome-subtitle {
    font-size: 14px;
  }
  
  .welcome-desc {
    font-size: 13px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-count {
    font-size: 32px;
  }
  
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .quick-action-card {
    padding: 24px 16px;
  }
  
  .action-icon {
    font-size: 32px;
  }
  
  .action-title {
    font-size: 14px;
  }
  
  .recent-activities-section {
    padding: 20px;
  }
  
  .activity-item {
    padding: 16px;
    gap: 12px;
  }
  
  .activity-icon {
    font-size: 28px;
  }
  
  .section-title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .activity-indicator {
    position: absolute;
    top: 16px;
    right: 16px;
  }
}
</style>