document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.profile-form');
  if (!form) return;

  // ======== Вспомогательные функции ========
  function saveTokens(access, refresh) {
    localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
  }

  function showAlert(message) {
    alert(message);
  }

  function handleError(err) {
    console.error("Ошибка сети или сервера:", err);
    showAlert("Ошибка сети или сервера");
  }

  // ======== Универсальный fetch с токеном и обновлением ========
  async function fetchWithToken(url, options = {}) {
    let token = localStorage.getItem('access_token');
    if (!options.headers) options.headers = {};
    options.headers['Authorization'] = `Bearer ${token}`;

    if (!(options.body instanceof FormData)) {
      options.headers['Content-Type'] = 'application/json';
    }
    let response = await fetch(url, options);

    if (response.status === 401) { // токен недействителен
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) throw new Error('Нет refresh токена');

      const refreshResp = await fetch('http://127.0.0.1:8000/auth/jwt/refresh/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({refresh})
      });

      if (!refreshResp.ok) throw new Error('Не удалось обновить токен');

      const refreshData = await refreshResp.json();
      saveTokens(refreshData.access);
      options.headers['Authorization'] = `Bearer ${refreshData.access}`;

      response = await fetch(url, options);
    }

    return response;
  }

  // ======== Загрузка профиля ========
  async function loadProfile() {
    try {
      const response = await fetchWithToken('http://127.0.0.1:8000/api/profile/me/');
      const data = await response.json();

      if (response.ok && data) {
        const user = data;

        // Заполнение формы
        form.city.value = user.locations || '';
        form.email.value = user.user?.email || '';
        form.telegram.value = user.telegram_id || '';
        form.profession.value = user.profession || '';
        form.experience.value = user.expirience != null ? user.expirience : '';
        form.interests.value = user.inerests || '';
        form.about.value = user.bio || '';
        form.birthdate.value = user.bithday || '';
        form.skills.value = Array.isArray(user.skills) ? user.skills.join(', ') : (user.skills || '');
        // Сохраняем id профиля
        form.dataset.profileId = user.id;
      } else {
        showAlert('Профиль не найден или пуст');
      }
    } catch (err) {
      handleError(err);
    }
  }

  loadProfile();

  // ======== Сохранение изменений ========
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const profileId = form.dataset.profileId;
    if (!profileId) {
      showAlert('Профиль не найден!');
      return;
    }

    const formData = new FormData();
    formData.append('locations', form.city.value.trim() || '');
    formData.append('telegram_id', form.telegram.value.trim() || '');
    formData.append('profession', form.profession.value.trim() || '');
    formData.append('expirience', form.experience.value ? parseInt(form.experience.value) : '');
    formData.append('inerests', form.interests.value.trim() || '');
    formData.append('bio', form.about.value.trim() || '');
    formData.append('bithday', form.birthdate.value || '');
    formData.append('gender', form.sex.value || '');
    formData.append('skills', form.skills.value.trim() || '');

    const photoInput = document.getElementById('photoInput');
    const profilePhoto = document.getElementById('profilePhoto');
    // ======== Добавляем фото, если выбран ========
    if (photoInput.files[0]) {
      formData.append('photo', photoInput.files[0]);
    }

    try {
      const response = await fetchWithToken(`http://127.0.0.1:8000/api/profile/me/`, {
        method: 'PATCH',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
          showAlert('Профиль обновлён');
          if (data.photo) {
            profilePhoto.src = (data.photo.startsWith('http') ? data.photo : `http://127.0.0.1:8000${data.photo}`) + '?t=' + new Date().getTime();
          }
      } else {
        showAlert('Ошибка сохранения: ' + JSON.stringify(data));
      }
    } catch (err) {
      handleError(err);
    }
  });
});
