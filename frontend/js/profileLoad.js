// ======= Функции утилиты =======
function showAlert(message) {
  alert(message);
}

function handleError(err) {
  console.error("Ошибка сети или сервера:", err);
  showAlert("Ошибка сети или сервера");
}

// Получаем валидный access token, обновляем если нужно
async function getValidAccessToken() {
  let access = localStorage.getItem('access_token');
  const refresh = localStorage.getItem('refresh_token');

  if (!access && !refresh) {
    return null; // токенов нет
  }

  try {
    // Проверяем доступность текущего токена
    const testRes = await fetch('http://127.0.0.1:8000/api/profile/', {
      headers: { 'Authorization': `Bearer ${access}` }
    });

    if (testRes.status === 401 && refresh) {
      // Токен недействителен — обновляем через refresh
      const refreshRes = await fetch('http://127.0.0.1:8000/auth/jwt/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });

      if (!refreshRes.ok) {
        return null; // не удалось обновить
      }

      const refreshData = await refreshRes.json();
      access = refreshData.access;
      localStorage.setItem('access_token', access);
    }

    return access;
  } catch (err) {
    handleError(err);
    return null;
  }
}

// ======= Загрузка профиля =======
async function loadUserProfile() {
  const token = await getValidAccessToken();
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

try {
  const response = await fetch('http://127.0.0.1:8000/api/profile/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (response.ok && data.results && data.results.length > 0) {
    const user = data.results[0];

    // ======= Заполняем форму =======
    document.querySelector('input[name="city"]').value = user.locations || '';
    document.querySelector('input[name="email"]').value = user.email || '';
    document.querySelector('input[name="telegram"]').value = user.telegram_id || '';
    document.querySelector('input[name="profession"]').value = user.profession || '';
    document.querySelector('input[name="experience"]').value = user.expirience || '';
    document.querySelector('input[name="interests"]').value = user.inerests || '';
    document.querySelector('textarea[name="about"]').value = user.bio || '';
    document.querySelector('select[name="sex"]').value = user.gender || '';

    // ======= Заполняем блок профиля =======
    document.querySelector('.profile-name').textContent = user.username || 'Имя пользователя';
    document.querySelector('.profile-status').textContent = user.goals || 'Нет статуса';

    // ======= Отображаем фото пользователя =======
    const photoElement = document.querySelector('.profile-photo');
    if (photoElement) {
      if (user.photo) {
        // Если API возвращает относительный путь — добавляем домен
        const isFullUrl = user.photo.startsWith('http');
        photoElement.src = isFullUrl ? user.photo : `http://127.0.0.1:8000${user.photo}`;
      } else {
        // Если фото нет — подставляем стандартное изображение
        photoElement.src = 'img/profile.jpg';
      }
    }

  } else {
    console.error("Профиль не найден или пуст:", data);
  }
} catch (err) {
  handleError(err);
}
}


// ======= Инициализация =======
document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
});
