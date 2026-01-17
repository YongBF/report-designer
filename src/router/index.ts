/**
 * 路由配置
 *
 * 定义应用的所有路由
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

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
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
