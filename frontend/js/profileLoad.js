// ======= ФУНКЦИИ УТИЛИТЫ =======
function showAlert(message) {
  alert(message);
}

function handleError(err) {
  console.error("Ошибка сети или сервера:", err);
  showAlert("Ошибка сети или сервера");
}

// ======= ПРОВЕРКА И ОБНОВЛЕНИЕ JWT ТОКЕНОВ =======
async function getValidAccessToken() {
  let access = localStorage.getItem('access_token');
  const refresh = localStorage.getItem('refresh_token');

  if (!access && !refresh) {
    return null; // токенов нет
  }

  try {
    // Проверяем доступность текущего access токена
    const testRes = await fetch('http://127.0.0.1:8000/api/profile/me/', {
      headers: { 'Authorization': `Bearer ${access}` }
    });

    if (testRes.status === 401 && refresh) {
      // access недействителен — обновляем через refresh
      const refreshRes = await fetch('http://127.0.0.1:8000/auth/jwt/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });

      if (!refreshRes.ok) {
        return null;
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

// ======= ЗАГРУЗКА ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ =======
async function loadUserProfile() {
  const token = await getValidAccessToken();
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/api/profile/me/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok && data) {
      const user = data;

      // ======= ЗАПОЛНЯЕМ ФОРМУ =======
      document.querySelector('input[name="city"]').value = user.locations || '';
      document.querySelector('input[name="email"]').value = user.email || '';
      document.querySelector('input[name="telegram"]').value = user.telegram_id || '';
      document.querySelector('input[name="profession"]').value = user.profession || '';
      document.querySelector('input[name="experience"]').value = user.expirience || '';
      document.querySelector('input[name="interests"]').value = user.inerests || '';
      document.querySelector('textarea[name="about"]').value = user.bio || '';
      document.querySelector('select[name="sex"]').value = user.gender || '';

      // ======= НАВЫКИ =======
      const skillsInput = document.querySelector('input[name="skills"]');
      const skillsContainer = document.getElementById('profile-skills');

      // Обработка разных форматов (список или строка)
      let skills = [];
      if (Array.isArray(user.skills)) {
        skills = user.skills;
      } else if (typeof user.skills === 'string') {
        skills = user.skills.split(',').map(s => s.trim());
      }

      // Поле ввода (редактирование)
      if (skillsInput) {
        skillsInput.value = skills.join(', ');
      }

      // Визуальное отображение навыков в блоке профиля
      if (skillsContainer) {
        skillsContainer.innerHTML = ''; // очищаем старые элементы
        if (skills.length > 0) {
          skills.forEach(skill => {
            const span = document.createElement('span');
            span.textContent = skill;
            skillsContainer.appendChild(span);
          });
        } else {
          const empty = document.createElement('span');
          empty.textContent = 'Навыки не указаны';
          empty.style.opacity = '0.7';
          skillsContainer.appendChild(empty);
        }
      }

      // ======= ОСНОВНАЯ ИНФОРМАЦИЯ =======
      document.querySelector('.profile-name').textContent = user.username || 'Имя пользователя';
      document.querySelector('.profile-status').textContent = user.goals || 'Нет статуса';

      // ======= ФОТО ПОЛЬЗОВАТЕЛЯ =======
      const photoElement = document.querySelector('.profile-photo');
      if (photoElement) {
        if (user.photo) {
          const isFullUrl = user.photo.startsWith('http');
          photoElement.src = isFullUrl ? user.photo : `http://127.0.0.1:8000${user.photo}`;
        } else {
          photoElement.src = 'img/profile.jpg';
        }
      }

    } else {
      console.error("Профиль не найден или пуст:", data);
      showAlert("Не удалось загрузить профиль пользователя");
    }
  } catch (err) {
    handleError(err);
  }
}

// ======= ИНИЦИАЛИЗАЦИЯ =======
document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
});

// ======= ПРОСМОТР ВЫБРАННОГО ФОТО =======
const photoInput = document.getElementById('photoInput');
const profilePhoto = document.getElementById('profilePhoto');

if (photoInput && profilePhoto) {
  photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        profilePhoto.src = e.target.result; // превью выбранного файла
      };
      reader.readAsDataURL(file);
    }
  });
}