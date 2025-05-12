import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Conversations from '../views/Conversations.vue';
import Chat from "../views/Chat.vue";

const routes = [
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/conversations', component: Conversations, meta: { requiresAuth: true } },
    { path: '/conversations/:id', component: Chat, meta: { requiresAuth: true } }, // Dynamic route for conversation
    { path: '/', redirect: '/login' },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    if (to.meta.requiresAuth && !token) {
        next('/login');
    } else {
        next();
    }
});

export default router;