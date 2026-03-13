import { createRouter, createWebHistory } from 'vue-router'

// 修复：更新LoginView的导入路径
import LoginView from '@/views/user/login/index.vue'
import UserIndexView from '@/views/user/index/index.vue'
import CaseView from '@/views/admin/case/index.vue'
import TypeView from '@/views/admin/type/index.vue'
import UserView from '@/views/admin/user/index.vue'
import LayoutView from '@/views/admin/layout/index.vue'
import IndexView from '@/views/admin/index/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/user',
      name: 'userIndex',
      component: UserIndexView
    },
    {
      path: '/admin',
      name: 'layout',
      component: LayoutView,
      redirect: '/admin/index',
      children: [
        { path: 'index', name: 'index', component: IndexView },
        { path: 'case', name: 'case', component: CaseView },
        { path: 'user', name: 'user', component: UserView },
        { path: 'type', name: 'type', component: TypeView },
      ]
    },
    { path: '/login', name: 'login', component: LoginView }
  ]
})

export default router