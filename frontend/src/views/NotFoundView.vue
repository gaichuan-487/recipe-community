<template>
  <section class="status-page">
    <div class="status-page__card">
      <span class="status-page__mark">404</span>
      <p class="eyebrow">PAGE NOT FOUND</p>
      <h1>这里没有开火</h1>
      <p>这个页面不存在。也许是地址写错了，回厨房重新找找看吧。</p>
      <div class="status-page__actions">
        <RouterLink class="btn btn--primary" to="/">回到首页</RouterLink>
        <RouterLink class="btn btn--soft" to="/recipes">看看菜谱</RouterLink>
      </div>
    </div>
  </section>
</template>
