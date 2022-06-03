import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../views/user/users.vue'
import Rights from '../views/power/rights.vue'
import Roles from '../views/power/roles.vue'
import Cate from '../views/goods/Cate.vue'
Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    redirect:'/login'
  },
  {
    path:'/login',
    name:'login',
    component:Login
  },
  {
    path:'/home',
    name:'home',
    component:Home,
    redirect:'/welcome',
    children:[
      { path:'/welcome',name:'welcome',component:Welcome},
      { path:'/users',name:'users',component:Users},
      { path:'/rights',name:'rights',component:Rights},
      { path:'/roles',name:'roles',component:Roles},
      { path:'/categories',name:'categories',component:Cate}
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to,from,next)=>{
  if(to.path === '/login') return next()
    const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
    next()
})

export default router
