import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

import App from './App.vue';
import router from './router';
import { useDesignerStore } from './stores/pinia';

const app = createApp(App);

// 创建 Pinia 实例
const pinia = createPinia();
app.use(pinia);

// 使用路由
app.use(router);

// 初始化设计器 store
const designerStore = useDesignerStore();
designerStore.initDesigner();

// 注册 Element Plus
app.use(ElementPlus, {
  locale: zhCn,
});

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount('#app');
