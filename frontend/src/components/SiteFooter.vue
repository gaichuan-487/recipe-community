<script setup>
const year = new Date().getFullYear();
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <RouterLink class="brand brand--footer" to="/" aria-label="食光记首页">
          <span class="brand-mark"><span>食</span></span>
          <span class="brand-word">
            食光记
            <small>SHIGUANG KITCHEN</small>
          </span>
        </RouterLink>
        <p>记录一饭一蔬，也记录认真生活的每一个瞬间。</p>
      </div>
      <div class="footer-links" aria-label="页脚导航">
        <RouterLink to="/recipes">发现菜谱</RouterLink>
        <RouterLink to="/hot">热门排行</RouterLink>
        <RouterLink to="/publish">发布菜谱</RouterLink>
        <RouterLink to="/me">个人中心</RouterLink>
      </div>
      <div class="footer-note">
        <span class="footer-seal">好好吃饭</span>
        <p>© {{ year }} 食光记 · 美食菜谱分享社区</p>
        <p class="footer-en">Made for people who cook with love.</p>
      </div>
    </div>
  </footer>
</template>
