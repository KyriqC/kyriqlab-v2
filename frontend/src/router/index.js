import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from '../services/auth'

import Home from '../pages/Home.vue'
import PostDetail from '../pages/PostDetail.vue'
import Notepad from '../pages/Notepad.vue'
import SongLibrary from '../pages/SongLibrary.vue'
import SongDetail from '../pages/SongDetail.vue'
import LyricBlitz from '../pages/LyricBlitz.vue'
import EmpathyLayout from '../pages/empathy/EmpathyLayout.vue'
import EmpathyHome from '../pages/empathy/EmpathyHome.vue'
import SurveyView from '../pages/empathy/SurveyView.vue'
import ZeroDegrees from '../pages/empathy/ZeroDegrees.vue'

import Login from '../pages/Login.vue'
import Admin from '../pages/Admin.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },

    // Blog routes
    { path: '/notepad', component: Notepad },
    { path: '/blog', redirect: '/notepad' },
    { path: '/posts/:slug', component: PostDetail },

    // Song routes
    { path: '/song-library', component: SongLibrary },
    { path: '/songs', redirect: '/song-library' },
    { path: '/songs/:id', component: SongDetail },
    { path: '/lyric-blitz', component: LyricBlitz },
    { path: '/game', redirect: '/lyric-blitz' },


    // Empathy
{
  path: '/empathy',
  component: EmpathyLayout,
  children: [
    { path: '', component: EmpathyHome },                 // /empathy
    { path: 'survey/:type', component: SurveyView },      // /empathy/survey/adult|child
    { path: 'zero', component: ZeroDegrees },             // /empathy/zero
  ],
},

{ path: '/empathy-eq', redirect: '/empathy' },

    // Auth
    { path: '/login', component: Login },
    { path: '/admin', component: Admin, meta: { requiresAuth: true } },
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return { path: '/login', query: { next: to.fullPath } }
  }
})

export default router
