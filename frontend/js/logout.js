document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.querySelector('.logout-btn');

  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async () => {
    const refresh = localStorage.getItem('refresh_token');

    try {
      if (refresh) {
        await fetch('http://127.0.0.1:8000/auth/jwt/logout/', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ refresh })
        });
      }
    } catch (err) {
      console.error('Ошибка при logout:', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/index.html';
    }
  });
});
