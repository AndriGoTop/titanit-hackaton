// auth-guard.js
import { checkAuth } from './check.js';

export async function requireAuth() {
  const user = await checkAuth();
  if (!user) {
    // ❌ Нет токена — отправляем на страницу входа
    window.location.href = '/auth.html';
  }
}
