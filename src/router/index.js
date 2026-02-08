import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import LoginView from '@/views/LoginView.vue'
import PicsView from '@/views/PicsView.vue'
import FavoritosView from '@/views/FavoritosView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: PicsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/home',
      component: PicsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/favoritos',
      component: FavoritosView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { hideForAuth: true }
    }
  ],
})

const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      auth,
      (user) => {
        removeListener();
        resolve(user);
      },
      reject
    );
  });
};


router.beforeEach(async (to, from, next) => {
  const user = await getCurrentUser();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const hideForAuth = to.matched.some(record => record.meta.requiresAuth === false || record.meta.hideForAuth);

  if (requiresAuth && !user) {
    next({ name: 'login' });
  }
  else if (hideForAuth && user) {
    next({ name: 'home' });
  }
  else {
    next();
  }
});

export default router
