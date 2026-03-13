<script setup>
</script>

<template>
  <div class="hero-container">
    <div class="hero-content">
      <h1>专注优质法律服务</h1>
      <p>携手中国权威法律专家打造的法律服务平台</p>
      <p>and in hand with China's authoritative legal experts to create a legal service platform.</p>
    </div>
  </div>
</template>

<style scoped>
.hero-container {
  width: 100%;
  height: 100vh;
  background-image: url('@/assets/index2.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.hero-content {
  text-align: center;
  color: white;
  padding: 20px;
  max-width: 800px;
  background-color: rgba(0, 0, 0, 0.3); /* 半透明黑色遮罩，增强文字可读性 */
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.hero-content p {
  font-size: 1.2rem;
  margin: 0.5rem 0;
}
</style>