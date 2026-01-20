/**
 * 路由配置
 *
 * 定义应用的所有路由
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useDesignerStore } from '@/stores/pinia';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'designer',
    component: () => import('../views/Designer.vue'),
    meta: {
      title: '报表设计器',
    },
  },
  {
    path: '/preview/:id?',
    name: 'preview',
    component: () => import('../views/PreviewView.vue'),
    meta: {
      title: '预览报表',
    },
    // 路由守卫：检查设计是否存在
    beforeEnter: (to) => {
      const designerStore = useDesignerStore();

      // 如果提供了 ID，检查是否与当前设计匹配
      if (to.params.id) {
        const targetId = to.params.id as string;

        // 检查是否匹配当前设计，或者是否可以从本地存储加载
        if (designerStore.currentDesign.id !== targetId) {
          // 尝试从本地存储加载匹配的设计
          const STORAGE_KEY = 'report_designer_current';
          const saved = localStorage.getItem(STORAGE_KEY);

          if (saved) {
            try {
              const design = JSON.parse(saved);
              if (design.id === targetId) {
                // 找到匹配的设计，加载它
                designerStore.loadDesign(design);
                return true;
              }
            } catch (e) {
              // 加载设计失败
            }
          }

          // 没有找到匹配的设计，重定向到设计器
          return { name: 'designer', query: { error: 'design_not_found' } };
        }
      }

      return true;
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
