<template>
  <div class="app">
    <!-- 顶部导航栏 -->
    <el-header height="60px" class="navbar">
      <div class="navbar-container">
        <router-link to="/" class="logo">法律咨询平台</router-link>
        <div class="search-container">
          <el-input
            v-model="searchQuery"
            placeholder="搜索法律问题..."
            class="search-input"
            prefix-icon="el-icon-search"
          />
          <el-button type="primary" class="search-btn">搜索</el-button>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/case" class="nav-link">法律案例</router-link>
          <router-link to="/ai" class="nav-link">AI法律咨询</router-link>
          <router-link to="/collection" class="nav-link">案例收藏</router-link>
          <router-link to="/login" class="nav-link">退出登录</router-link>
        </div>
      </div>
    </el-header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 轮播图 -->
      <el-carousel :interval="5000" type="card" height="400px" class="carousel">
        <el-carousel-item>
          <div class="carousel-content">
            <h1 class="carousel-title">专业法律咨询服务</h1>
            <p class="carousel-subtitle">AI驱动的智能法律助手，为您提供专业、便捷的法律咨询</p>
            <el-button type="primary" size="large" class="carousel-btn">立即咨询</el-button>
          </div>
        </el-carousel-item>
      </el-carousel>

      <!-- 法律案例 -->
      <section class="content-section">
        <h2 class="section-title">热门法律案例</h2>
        <el-row :gutter="20" class="case-grid">
          <el-col :xs="24" :sm="12" :md="8" v-for="(caseItem, index) in cases" :key="index">
            <el-card shadow="hover" class="case-card">
              <template #header>
                <div class="case-title">{{ caseItem.title }}</div>
              </template>
              <div class="case-summary">{{ caseItem.summary }}</div>
              <div class="case-meta">
                <span>发布时间：{{ caseItem.date }}</span>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </section>

      <!-- 法律内容 -->
      <section class="content-section law-content">
        <h2 class="section-title">法律条文</h2>
        <el-card shadow="hover" class="law-list">
          <el-list>
            <el-list-item v-for="(law, index) in laws" :key="index" class="law-item">
              <div class="law-item-content">
                <h3 class="law-item-title">{{ law.title }}</h3>
                <p class="law-item-meta">发布时间：{{ law.publishDate }} | 生效时间：{{ law.effectiveDate }}</p>
              </div>
            </el-list-item>
          </el-list>
        </el-card>
      </section>

      <!-- AI咨询助手 -->
      <section class="ai-assistant">
        <div class="ai-container">
          <el-row :gutter="40" class="ai-content">
            <el-col :xs="24" :md="12" class="ai-info">
              <h2 class="ai-title">AI法律助手</h2>
              <p class="ai-description">
                我们的AI法律助手基于Spring AI框架，结合阿里云百炼平台的Qwen模型，
                能够查询数据库中的相关法律案例和法律知识，为您提供专业、准确的法律回答。
              </p>
              <el-button type="primary" size="large" class="ai-btn">开始咨询</el-button>
            </el-col>
            <el-col :xs="24" :md="12" class="ai-image">
              <el-image
                src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20legal%20assistant%20robot&image_size=square"
                fit="cover"
                class="ai-image-img"
              />
            </el-col>
          </el-row>
        </div>
      </section>
    </main>

    <!-- 底部信息栏 -->
    <el-footer class="footer">
      <div class="footer-container">
        <el-row :gutter="40">
          <el-col :xs="24" :md="8" class="footer-column">
            <h3>关于我们</h3>
            <p>我们是一家专业的法律咨询平台，致力于为用户提供便捷、专业的法律服务，
            利用AI技术提高法律咨询的效率和可访问性。</p>
          </el-col>
          <el-col :xs="24" :md="8" class="footer-column">
            <h3>联系方式</h3>
            <ul>
              <li>电话：400-123-4567</li>
              <li>邮箱：contact@law-platform.com</li>
              <li>地址：北京市朝阳区建国路88号</li>
            </ul>
          </el-col>
          <el-col :xs="24" :md="8" class="footer-column">
            <h3>快速链接</h3>
            <ul>
              <li><router-link to="/">首页</router-link></li>
              <li><router-link to="/case">法律案例</router-link></li>
              <li><router-link to="/ai">AI法律咨询</router-link></li>
              <li><router-link to="/collection">案例收藏</router-link></li>
            </ul>
          </el-col>
        </el-row>
        <div class="footer-bottom">
          <p>© 2026 法律咨询平台 版权所有 | 京ICP备12345678号</p>
        </div>
      </div>
    </el-footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const activeIndex = ref('/');
const searchQuery = ref('');

const cases = [
  {
    title: '劳动合同纠纷案例',
    summary: '王某与某公司因劳动合同解除产生纠纷，最终通过法律途径维护了自身权益。',
    date: '2026-03-01'
  },
  {
    title: '房产继承纠纷案例',
    summary: '李某与兄弟姐妹因房产继承问题产生争议，通过调解达成一致意见。',
    date: '2026-02-28'
  },
  {
    title: '交通事故赔偿案例',
    summary: '张某因交通事故受伤，通过法律途径获得了合理的赔偿。',
    date: '2026-02-25'
  }
];

const laws = [
  {
    title: '中华人民共和国民法典',
    publishDate: '2020-05-28',
    effectiveDate: '2021-01-01'
  },
  {
    title: '中华人民共和国刑法',
    publishDate: '2020-12-26',
    effectiveDate: '2021-03-01'
  },
  {
    title: '中华人民共和国劳动合同法',
    publishDate: '2012-12-28',
    effectiveDate: '2013-07-01'
  },
  {
    title: '中华人民共和国婚姻法',
    publishDate: '2001-04-28',
    effectiveDate: '2001-04-28'
  }
];
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.navbar-container {
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  width: 100%;
  margin: 0 auto;
  justify-content: center;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
  text-decoration: none;
  white-space: nowrap;
  position: absolute;
  left: 20px;
}

.search-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 1 400px;
}

.search-input {
  width: 300px;
  margin-right: 8px;
}

.search-btn {
  padding: 0 16px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
  position: absolute;
  right: 20px;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-size: 14px;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #1890ff;
}

.nav-link.router-link-active {
  color: #1890ff;
  font-weight: 500;
}

.main-content {
  margin-top: 60px;
  flex: 1;
}

.carousel {
  height: 400px;
  background-color: #f0f2f5;
}

.carousel-content {
  text-align: center;
  padding: 80px 0;
}

.carousel-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.carousel-subtitle {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.content-section {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  position: relative;
  padding-bottom: 10px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: #1890ff;
}

.case-grid {
  margin-top: 20px;
}

.case-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.case-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.case-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.case-summary {
  font-size: 14px;
  color: #666;
  margin: 10px 0;
  line-height: 1.5;
}

.case-meta {
  font-size: 12px;
  color: #999;
  margin-top: 10px;
}

.law-content {
  margin-top: 60px;
}

.law-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 15px 0;
  transition: background-color 0.3s;
}

.law-item:hover {
  background-color: #f5f5f5;
}

.law-item:last-child {
  border-bottom: none;
}

.law-item-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.law-item-meta {
  font-size: 12px;
  color: #999;
}

.ai-assistant {
  margin-top: 60px;
  background-color: #f0f2f5;
  padding: 40px 0;
}

.ai-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.ai-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ai-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.ai-description {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
  line-height: 1.6;
}

.ai-image-img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.footer {
  background-color: #333;
  color: #fff;
  padding: 40px 0;
  margin-top: 60px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-column h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #fff;
}

.footer-column p,
.footer-column li {
  font-size: 14px;
  line-height: 1.6;
  color: #ccc;
}

.footer-column ul {
  list-style: none;
  padding: 0;
}

.footer-column li {
  margin-bottom: 10px;
}

.footer-column a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-column a:hover {
  color: #1890ff;
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #444;
  font-size: 12px;
  color: #999;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    height: auto;
    padding: 10px 20px;
  }

  .nav-menu {
    margin-top: 10px;
    width: 100%;
  }

  .search-input {
    margin-top: 10px;
    width: 100%;
  }

  .carousel {
    height: 300px;
  }

  .carousel-title {
    font-size: 24px;
  }

  .carousel-subtitle {
    font-size: 16px;
  }

  .ai-content {
    flex-direction: column;
  }

  .ai-image {
    margin-top: 20px;
  }
}
</style>