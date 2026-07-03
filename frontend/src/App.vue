<template>
  <div id="app-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>

<style>
:root {
  --primary: #1a365d;
  --primary-light: #2a4a7f;
  --primary-bg: #f0f4f8;
  --card-bg: #ffffff;
  --text-primary: #1a365d;
  --text-secondary: #4a5568;
  --text-muted: #a0aec0;
  --border-color: #e2e8f0;
  --success: #48bb78;
  --warning: #ecc94b;
  --danger: #f56565;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app, #app-container {
  height: 100%;
  width: 100%;
  font-family: 'Inter', 'Helvetica Neue', Helvetica, 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  background: var(--primary-bg);
  color: var(--text-primary);
}

/* Element Plus overrides */
.el-card {
  border: 1px solid var(--border-color) !important;
  border-radius: 12px !important;
}
.el-card__header {
  border-bottom: 1px solid var(--border-color) !important;
  padding: 16px 20px !important;
  font-weight: 600;
}
.el-table {
  border-radius: 8px;
}
.el-button--primary {
  --el-button-bg-color: var(--primary);
  --el-button-border-color: var(--primary);
  --el-button-hover-bg-color: var(--primary-light);
  --el-button-hover-border-color: var(--primary-light);
}
</style>
