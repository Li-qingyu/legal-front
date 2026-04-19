<script setup>
import { ref, onMounted, computed } from 'vue';
import { getCaseCountApi, getTypeCountApi, getArticleCountApi, getUserCountApi, getTrendDataApi, getRecentActivitiesApi } from "@/api/work-space";
import { Document, Collection, Reading, User, ArrowRight, TrendCharts, Clock } from '@element-plus/icons-vue';

const stats = ref([
  { 
    title: '法律案例', 
    count: 0, 
    icon: Document,
    color: '#48BB78',
    bgColor: 'rgba(72, 187, 120, 0.12)',
    trend: '+12.5%',
    trendUp: true
  },
  { 
    title: '法律类型', 
    count: 0, 
    icon: Collection,
    color: '#4299E1',
    bgColor: 'rgba(66, 153, 225, 0.12)',
    trend: '+5.2%',
    trendUp: true
  },
  { 
    title: '法律条文', 
    count: 0, 
    icon: Reading,
    color: '#C9A962',
    bgColor: 'rgba(201, 169, 98, 0.15)',
    trend: '+8.3%',
    trendUp: true
  },
  { 
    title: '用户总数', 
    count: 0, 
    icon: User,
    color: '#E53E3E',
    bgColor: 'rgba(229, 62, 62, 0.12)',
    trend: '+15.8%',
    trendUp: true
  }
]);

const quickActions = ref([
  { title: '新增案例', icon: '📚', path: '/admin/case', color: '#48BB78', desc: '添加法律案例' },
  { title: '管理类型', icon: '⚖️', path: '/admin/type', color: '#4299E1', desc: '维护法律分类' },
  { title: '法律条文', icon: '📜', path: '/admin/law-article', color: '#C9A962', desc: '编辑法规内容' },
  { title: '用户管理', icon: '👥', path: '/admin/user', color: '#E53E3E', desc: '管理平台用户' }
]);

const recentActivities = ref([]);

// 当前日期
const currentDate = computed(() => {
  const date = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  return date.toLocaleDateString('zh-CN', options);
});

onMounted(() => {
  loadStats();
  loadRecentActivities();
});

const loadStats = async () => {
  try {
    const caseResponse = await getCaseCountApi();
    stats.value[0].count = caseResponse.data || 0;

    const typeResponse = await getTypeCountApi();
    stats.value[1].count = typeResponse.data || 0;

    const articleResponse = await getArticleCountApi();
    stats.value[2].count = articleResponse.data || 0;

    const userResponse = await getUserCountApi();
    stats.value[3].count = userResponse.data || 0;

    const trendResponse = await getTrendDataApi();
    const trendData = trendResponse.data;
    
    if (trendData) {
      if (trendData.cases) {
        const caseTrend = parseFloat(trendData.cases.trend).toFixed(2);
        stats.value[0].trend = `${parseFloat(caseTrend) > 0 ? '+' : ''}${caseTrend}%`;
        stats.value[0].trendUp = parseFloat(trendData.cases.trend) > 0;
      }
      if (trendData.types) {
        const typeTrend = parseFloat(trendData.types.trend).toFixed(2);
        stats.value[1].trend = `${parseFloat(typeTrend) > 0 ? '+' : ''}${typeTrend}%`;
        stats.value[1].trendUp = parseFloat(trendData.types.trend) > 0;
      }
      if (trendData.articles) {
        const articleTrend = parseFloat(trendData.articles.trend).toFixed(2);
        stats.value[2].trend = `${parseFloat(articleTrend) > 0 ? '+' : ''}${articleTrend}%`;
        stats.value[2].trendUp = parseFloat(trendData.articles.trend) > 0;
      }
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

const getActivityIcon = (type) => {
  const iconMap = {
    'case_add': '📚',
    'case_update': '📝',
    'case_delete': '🗑️',
    'law_add': '📜',
    'law_update': '📝',
    'law_delete': '🗑️',
    'user_add': '👤',
    'user_update': '👤',
    'user_delete': '🗑️',
    'user_register': '👥',
    'type_add': '⚖️',
    'type_update': '📝',
    'type_delete': '🗑️',
    'book_add': '📖',
    'book_update': '📝',
    'book_delete': '🗑️'
  };
  return iconMap[type] || '📋';
};

const getActivityDotColor = (type) => {
  if (type.includes('add') || type.includes('register')) return 'green';
  if (type.includes('update')) return 'gold';
  if (type.includes('delete')) return 'red';
  return 'blue';
};

const formatTime = (timeString) => {
  const date = new Date(timeString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString('zh-CN');
};
</script>

<template>
  <div class="workspace-container">
    <!-- 页面标题区 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-text">工作台</span>
          <span class="title-wave">👋</span>
        </h1>
        <p class="page-desc">
          <span class="greeting">欢迎回来，管理员</span>
          <span class="date-separator">·</span>
          <span class="date">{{ currentDate }}</span>
        </p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div 
        v-for="(stat, index) in stats" 
        :key="index" 
        class="stat-card"
        :style="{ animationDelay: `${index * 0.12}s` }"
      >
        <div class="stat-shine"></div>
        <div class="stat-icon" :style="{ background: stat.bgColor, color: stat.color }">
          <el-icon class="icon-bounce"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-value">
          <span class="count-number" :data-target="stat.count">{{ stat.count }}</span>
        </div>
        <div class="stat-label">{{ stat.title }}</div>
        <div class="stat-trend" :class="{ up: stat.trendUp, down: !stat.trendUp }">
          <el-icon class="trend-icon" v-if="stat.trendUp"><TrendCharts /></el-icon>
          <el-icon class="trend-icon" v-else><TrendCharts style="transform: rotate(180deg)" /></el-icon>
          <span>{{ stat.trend }} 较上月</span>
        </div>
      </div>
    </div>

    <!-- 两栏布局：快捷操作 + 最近活动 -->
    <div class="dashboard-grid" style="animation-delay: 0.5s;">
      <!-- 快捷操作 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">快捷操作</h3>
        </div>
        <div class="card-body">
          <div class="quick-actions-list">
            <router-link 
              v-for="(action, index) in quickActions" 
              :key="index" 
              :to="action.path" 
              class="quick-action-item"
              :style="{ '--action-color': action.color, animationDelay: `${0.6 + index * 0.08}s` }"
            >
              <div class="action-icon-wrap" :style="{ background: action.color + '15', color: action.color }">
                <span class="action-emoji">{{ action.icon }}</span>
              </div>
              <div class="action-info">
                <div class="action-title">{{ action.title }}</div>
                <div class="action-desc">{{ action.desc }}</div>
              </div>
              <el-icon class="action-arrow"><ArrowRight /></el-icon>
            </router-link>
          </div>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">最近活动</h3>
        </div>
        <div class="card-body">
          <div class="timeline" v-if="recentActivities.length > 0">
            <div 
              v-for="(activity, index) in recentActivities.slice(0, 6)" 
              :key="activity.id || index" 
              class="timeline-item"
              :style="{ animationDelay: `${0.8 + index * 0.1}s` }"
            >
              <div class="timeline-dot pulse" :class="getActivityDotColor(activity.type)"></div>
              <div class="timeline-content">
                <div class="timeline-title">{{ activity.title }}</div>
                <div class="timeline-meta">
                  <span class="timeline-user">{{ activity.userName }}</span>
                  <span class="timeline-time">
                    <el-icon><Clock /></el-icon>
                    {{ formatTime(activity.time) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">📋</div>
            <div class="empty-text">暂无最近活动</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 工作区容器 */
.workspace-container {
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面标题 */
.page-header {
  margin-bottom: 28px;
  animation: slideDown 0.6s ease forwards;
}

.page-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 28px;
  font-weight: 600;
  color: #2D3B35;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-text {
  animation: fadeInLeft 0.5s ease forwards;
}

.title-wave {
  display: inline-block;
  animation: wave 2s ease-in-out infinite;
  transform-origin: 70% 70%;
}

.page-desc {
  font-size: 14px;
  color: #6B7B75;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: fadeIn 0.6s ease 0.2s forwards;
  opacity: 0;
}

.greeting {
  animation: fadeIn 0.5s ease 0.3s forwards;
  opacity: 0;
}

.date-separator {
  color: #C9A962;
  animation: pulse 2s ease-in-out infinite;
}

.date {
  animation: fadeIn 0.5s ease 0.4s forwards;
  opacity: 0;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: #FFFFFF;
  border-radius: 14px;
  padding: 24px;
  border: 1px solid #E5E0D8;
  box-shadow: 0 2px 12px rgba(45, 59, 53, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
}

.stat-card:hover {
  box-shadow: 0 12px 32px rgba(45, 59, 53, 0.15);
  transform: translateY(-6px) scale(1.02);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #C9A962, #E8D5A3);
}

.stat-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  transition: left 0.7s;
}

.stat-card:hover .stat-shine {
  left: 100%;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(-5deg);
}

.icon-bounce {
  animation: iconFloat 3s ease-in-out infinite;
}

.stat-card:hover .icon-bounce {
  animation: iconBounce 0.5s ease;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #2D3B35;
  margin-bottom: 4px;
  font-family: 'Inter', sans-serif;
}

.count-number {
  display: inline-block;
  animation: countIn 0.8s ease forwards;
}

.stat-label {
  font-size: 13px;
  color: #6B7B75;
  margin-bottom: 12px;
  transition: color 0.3s ease;
}

.stat-card:hover .stat-label {
  color: #2D3B35;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.trend-icon {
  animation: trendPulse 2s ease-in-out infinite;
}

.stat-trend.up {
  color: #48BB78;
}

.stat-trend.down {
  color: #E53E3E;
}

.stat-trend .el-icon {
  font-size: 14px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 16px;
}

.stat-icon .el-icon {
  font-size: 24px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #2D3B35;
  margin-bottom: 4px;
  font-family: 'Inter', sans-serif;
}

.stat-label {
  font-size: 13px;
  color: #6B7B75;
  margin-bottom: 12px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.stat-trend.up {
  color: #48BB78;
}

.stat-trend.down {
  color: #E53E3E;
}

.stat-trend .el-icon {
  font-size: 14px;
}

/* 两栏布局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
}

/* 卡片样式 */
.card {
  background: #FFFFFF;
  border-radius: 14px;
  border: 1px solid #E5E0D8;
  box-shadow: 0 2px 12px rgba(45, 59, 53, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(45, 59, 53, 0.12);
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #E5E0D8;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 18px;
  font-weight: 600;
  color: #2D3B35;
  position: relative;
}

.card-title::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #C9A962, #E8D5A3);
  transition: width 0.4s ease;
}

.card:hover .card-title::after {
  width: 100%;
}

.card-body {
  padding: 20px 24px;
}

/* 卡片样式 */
.card {
  background: #FFFFFF;
  border-radius: 14px;
  border: 1px solid #E5E0D8;
  box-shadow: 0 2px 12px rgba(45, 59, 53, 0.08);
  overflow: hidden;
}

.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #E5E0D8;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 18px;
  font-weight: 600;
  color: #2D3B35;
}

.card-body {
  padding: 20px 24px;
}

/* 快捷操作列表 */
.quick-actions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-action-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #F7F5F0;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  animation: slideInRight 0.5s ease forwards;
  opacity: 0;
  transform: translateX(-20px);
}

.quick-action-item:hover {
  background: #FFFFFF;
  border-color: var(--action-color);
  box-shadow: 0 8px 24px rgba(45, 59, 53, 0.12);
  transform: translateX(8px) scale(1.02);
}

.action-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.quick-action-item:hover .action-icon-wrap {
  transform: scale(1.15) rotate(10deg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-emoji {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.quick-action-item:hover .action-emoji {
  animation: wiggle 0.5s ease;
}

.action-info {
  flex: 1;
}

.action-title {
  font-size: 14px;
  font-weight: 600;
  color: #2D3B35;
  margin-bottom: 2px;
  transition: color 0.3s ease;
}

.quick-action-item:hover .action-title {
  color: var(--action-color);
}

.action-desc {
  font-size: 12px;
  color: #9CA8A3;
  transition: color 0.3s ease;
}

.quick-action-item:hover .action-desc {
  color: #6B7B75;
}

.action-arrow {
  font-size: 16px;
  color: #9CA8A3;
  transition: all 0.3s ease;
}

.quick-action-item:hover .action-arrow {
  color: var(--action-color);
  transform: translateX(8px);
  animation: arrowBounce 0.8s ease infinite;
}

/* 时间轴 */
.timeline {
  position: relative;
  padding-left: 24px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: linear-gradient(180deg, #E5E0D8 0%, #C9A962 50%, #E5E0D8 100%);
  background-size: 100% 200%;
  animation: gradientFlow 3s ease infinite;
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;
  animation: fadeInLeft 0.5s ease forwards;
  opacity: 0;
  transform: translateX(-10px);
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item:hover .timeline-content {
  transform: translateX(8px);
}

.timeline-dot {
  position: absolute;
  left: -24px;
  top: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 3px solid #FFFFFF;
  box-shadow: 0 0 0 1px #E5E0D8;
  transition: all 0.3s ease;
}

.timeline-item:hover .timeline-dot {
  transform: scale(1.3);
  box-shadow: 0 0 0 2px currentColor;
}

.timeline-dot.pulse {
  animation: dotPulse 2s ease-in-out infinite;
}

.timeline-dot.green { background: #48BB78; }
.timeline-dot.gold { background: #C9A962; }
.timeline-dot.blue { background: #4299E1; }
.timeline-dot.red { background: #E53E3E; }

.timeline-content {
  padding-left: 8px;
  transition: transform 0.3s ease;
}

.timeline-title {
  font-size: 14px;
  font-weight: 500;
  color: #2D3B35;
  margin-bottom: 4px;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.timeline-item:hover .timeline-title {
  color: #1E3A2F;
}

.timeline-content {
  padding-left: 8px;
}

.timeline-title {
  font-size: 14px;
  font-weight: 500;
  color: #2D3B35;
  margin-bottom: 4px;
  line-height: 1.4;
}

.timeline-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #9CA8A3;
}

.timeline-user {
  background: #F7F5F0;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.timeline-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.timeline-time .el-icon {
  font-size: 12px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9CA8A3;
  animation: fadeIn 0.5s ease forwards;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
  animation: iconFloat 3s ease-in-out infinite;
}

.empty-text {
  font-size: 14px;
}

/* 动画 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(0deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes iconBounce {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.2) rotate(-10deg); }
  50% { transform: scale(0.9) rotate(5deg); }
  75% { transform: scale(1.1) rotate(-5deg); }
}

@keyframes countIn {
  from { 
    opacity: 0; 
    transform: translateY(10px) scale(0.8); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

@keyframes trendPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  50% { transform: rotate(10deg); }
  75% { transform: rotate(-5deg); }
}

@keyframes arrowBounce {
  0%, 100% { transform: translateX(8px); }
  50% { transform: translateX(12px); }
}

@keyframes dotPulse {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(201, 169, 98, 0.4);
  }
  50% { 
    box-shadow: 0 0 0 6px rgba(201, 169, 98, 0);
  }
}

@keyframes gradientFlow {
  0% { background-position: 0% 0%; }
  50% { background-position: 0% 100%; }
  100% { background-position: 0% 0%; }
}

/* 响应式 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .card-body {
    padding: 16px;
  }
}
</style>
