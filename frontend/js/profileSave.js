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
    options.headers['Content-Type'] = 'application/json';

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
      const response = await fetchWithToken('http://127.0.0.1:8000/api/profile/');
      const data = await response.json();

      if (response.ok && data.results && data.results.length > 0) {
        const user = data.results[0];

        // Заполнение формы
        form.city.value = user.locations || '';
        form.email.value = user.user?.email || '';
        form.telegram.value = user.telegram_id || '';
        form.profession.value = user.profession || '';
        form.experience.value = user.expirience != null ? user.expirience : '';
        form.interests.value = user.inerests || '';
        form.about.value = user.bio || '';
        form.birthdate.value = user.bithday || '';

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

    const profileData = {
      locations: form.city.value.trim() || null,
      telegram_id: form.telegram.value.trim() || null,
      profession: form.profession.value.trim() || null,
      expirience: form.experience.value ? parseInt(form.experience.value) : null,
      inerests: form.interests.value.trim() || null,
      bio: form.about.value.trim() || null,
      bithday: form.birthdate.value || null,
      gender: form.gender.value || null,
    };

    try {
      const response = await fetchWithToken(`http://127.0.0.1:8000/api/profile/${profileId}/`, {
        method: 'PATCH',
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = window.location.href;

      } else {
        showAlert('Ошибка сохранения: ' + JSON.stringify(data));
      }
    } catch (err) {
      handleError(err);
    }
  });
});
