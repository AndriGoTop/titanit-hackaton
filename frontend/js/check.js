// Проверка авторизации пользователя
export async function checkAuth() {
  const token = localStorage.getItem('access_token');

  if (!token) {
    // Нет токена → переходим на страницу входа
    window.location.href = '/auth.html';
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/api/profile/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const user = await response.json();
      console.log("Пользователь авторизован:", user);
      return user;
    } else if (response.status === 401) {
      // Попробуем обновить токен
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return await checkAuth(); // Повторяем проверку
      } else {
        logoutUser();
      }
    } else {
      logoutUser();
    }
  } catch (error) {
    console.error("Ошибка проверки авторизации:", error);
    logoutUser();
  }
}

// Обновление токена
export async function refreshAccessToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return false;

  try {
    const response = await fetch('http://127.0.0.1:8000/auth/jwt/refresh/', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ refresh })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      console.log("Access токен обновлён");
      return true;
    } else {
      console.warn("Refresh токен недействителен");
      return false;
    }
  } catch (err) {
    console.error("Ошибка при обновлении токена:", err);
    return false;
  }
}

// Выход пользователя
export function logoutUser() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/auth.html';
}
