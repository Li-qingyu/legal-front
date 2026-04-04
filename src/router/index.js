import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

// 修复：更新LoginView的导入路径
import LoginView from '@/views/user/login/index.vue'
import RegisterView from '@/views/user/register/index.vue'
import UserIndexView from '@/views/user/index/index.vue'
import CaseView from '@/views/admin/case/index.vue'
import TypeView from '@/views/admin/type/index.vue'
import UserView from '@/views/admin/user/index.vue'
import LawArticleView from '@/views/admin/law-article/index.vue'
import LawBookView from '@/views/admin/law-book/index.vue'
import LayoutView from '@/views/admin/layout/index.vue'
import IndexView from '@/views/admin/index/index.vue'
import UserCaseView from '@/views/user/case/index.vue'
import UserLawView from '@/views/user/law/index.vue'
import UserAiView from '@/views/user/ai/index.vue'
import UserCollectionView from '@/views/user/collection/index.vue'
import UserProfileView from '@/views/user/profile/index.vue'


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
      component: UserIndexView,
      meta: { requiresAuth: true, role: 0 }, // 普通用户
      children: [
        { path: 'case', name: 'userCase', component: UserCaseView },
        { path: 'case/:id', name: 'userCaseDetail', component: () => import('@/views/user/case/detail.vue') },
        { path: 'law', name: 'userLaw', component: UserLawView },
        { path: 'law/articles/:id', name: 'userLawArticles', component: () => import('@/views/user/law/articles.vue') },
        { path: 'law/detail/:id', name: 'userLawDetail', component: () => import('@/views/user/law/detail.vue') },
        { path: 'ai', name: 'userAi', component: UserAiView},
        { path: 'collection', name: 'userCollection', component: UserCollectionView},
        { path: 'profile', name: 'userProfile', component: UserProfileView}
      ]
    },
    {
      path: '/admin',
      name: 'layout',
      component: LayoutView,
      meta: { requiresAuth: true, role: 1 }, // 管理员
      redirect: '/admin/index',
      children: [
        { path: 'index', name: 'index', component: IndexView },
        { path: 'case', name: 'case', component: CaseView },
        { path: 'user', name: 'user', component: UserView },
        { path: 'type', name: 'type', component: TypeView },
        { path: 'law-article', name: 'law-article', component: LawArticleView },
        { path: 'law-book', name: 'law-book', component: LawBookView },
      ]
    },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/register', name: 'register', component: RegisterView }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // 获取登录用户信息
    const loginUser = localStorage.getItem('loginUser')
    
    if (!loginUser) {
      // 未登录，跳转到登录页
      ElMessage.error('请先登录')
      next('/login')
      return
    }
    
    try {
      const userInfo = JSON.parse(loginUser)
      const userRole = userInfo.role
      
      // 检查角色权限
      if (to.meta.role === 1 && userRole !== 1) {
        // 普通用户访问管理员页面，跳转到用户首页
        ElMessage.error('权限不足')
        next('/user')
        return
      } else if (to.meta.role === 0 && userRole === 1) {
        // 管理员访问用户页面，允许通过
        next()
        return
      }
      
      // 权限验证通过
      next()
    } catch (error) {
      // 解析用户信息失败，跳转到登录页
      ElMessage.error('登录信息错误，请重新登录')
      localStorage.removeItem('loginUser')
      next('/login')
    }
  } else {
    // 不需要认证的页面，直接通过
    next()
  }
})

export default router