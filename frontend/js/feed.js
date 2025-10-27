document.addEventListener('DOMContentLoaded', async () => {
  const cardsContainer = document.getElementById('cards-container');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const searchInput = document.querySelector('.search-input');

  let currentPage = 1;
  let currentSearch = '';
  let currentUserId = null;

  // ======= Вспомогательные функции =======
  function showAlert(message) {
    alert(message);
  }

  function handleError(err) {
    console.error(err);
    showAlert("Произошла ошибка при работе с сервером");
  }

  async function getValidAccessToken() {
    let access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    if (!access && !refresh) return null;

    try {
      const testRes = await fetch('http://127.0.0.1:8000/api/profile/me/', {
        headers: { 'Authorization': `Bearer ${access}` }
      });

      if (testRes.status === 401 && refresh) {
        const refreshRes = await fetch('http://127.0.0.1:8000/auth/jwt/refresh/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh })
        });

        if (!refreshRes.ok) return null;
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

  async function fetchWithToken(url, options = {}) {
    const token = await getValidAccessToken();
    if (!token) return null;
    if (!options.headers) options.headers = {};
    options.headers['Authorization'] = `Bearer ${token}`;
    options.headers['Content-Type'] = 'application/json';

    const response = await fetch(url, options);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Ошибка запроса');
    }
    return await response.json();
  }

  // ======= Получение текущего пользователя =======
  async function loadCurrentUserProfile() {
    try {
      const data = await fetchWithToken('http://127.0.0.1:8000/api/profile/me/');
      if (!data || data.length === 0) throw new Error("Профиль не найден");

      const user = data;
      currentUserId = user.id;

      // ======= Блок профиля =======
      const userPhoto = document.getElementById('user-photo');
      const userName = document.getElementById('user-name');
      const userProfession = document.getElementById('user-profession');
      const userCity = document.getElementById('user-city');
      const userStatus = document.getElementById('user-status');

      if (userPhoto) userPhoto.src = user.photo || 'img/profile.jpg';
      if (userName) userName.textContent = user.fio || user.username || 'Пользователь';
      if (userProfession) userProfession.textContent = user.profession || 'Не указано';
      if (userCity) userCity.textContent = user.locations || '-';
      if (userStatus) userStatus.textContent = user.goals || 'Нет статуса';

      return user.id;
    } catch (err) {
      handleError(err);
      return null;
    }
  }

  // ======= Загрузка summary =======
  async function loadSummary() {
    try {
      const data = await fetchWithToken('http://127.0.0.1:8000/api/users/?type=summary');
      document.getElementById('avg-age').textContent = data.avg_age || '-';
      document.getElementById('top-profession').textContent = data.popular_professions[0] || '-';
      document.getElementById('top-city').textContent = data.top_city || '-';
    } catch (err) {
      console.error('Ошибка загрузки summary:', err);
    }
  }

  // ======= Загрузка рекомендаций =======
  async function loadRecommendations(userId) {
    try {
      const data = await fetchWithToken(`http://127.0.0.1:8000/api/match/${userId}/`);
      renderUserCards(data.recommendations);
    } catch (err) {
      handleError(err);
    }
  }

  // ======= Загрузка пользователей (поиск) =======
  async function loadUsers(reset = false) {
    if (reset) currentPage = 1;
    const url = new URL('http://127.0.0.1:8000/api/users/');
    url.searchParams.append('type', 'search');
    url.searchParams.append('search', currentSearch);
    url.searchParams.append('page', currentPage);

    try {
      const data = await fetchWithToken(url.toString());
      if (reset) cardsContainer.innerHTML = '';
      renderUserCards(data.results);
      currentPage++;
    } catch (err) {
      handleError(err);
    }
  }

  // ======= Рендер карточек пользователей =======
  function renderUserCards(users) {
    users.forEach(user => {
      const card = document.createElement('a');
      card.href = `user.html?id=${user.id}`;
      card.classList.add('user-card-link');
      card.innerHTML = `
        <div class="user-card" style="background-image: url('${user.photo || 'img/default.jpg'}')">
          <div class="card-overlay">
            <span class="card-profession">${user.profession || 'Не указано'}</span>
          </div>
          <div class="card-info">
            <p class="card-name">${user.name || user.user?.username || 'Пользователь'}, ${user.age || '-'}</p>
            <p class="card-city">${user.location || '-'}</p>
            <p class="card-skills">${user.skills || user.inerests || '-'}</p>
          </div>
        </div>
      `;
      cardsContainer.appendChild(card);
    });
  }

  // ======= Инициализация =======
  const userId = await loadCurrentUserProfile();
  if (!userId) {
    showAlert("Не найден ID текущего пользователя");
    return;
  }

  loadSummary();
  loadRecommendations(userId);

  // ======= Кнопка "Показать ещё" =======
  loadMoreBtn.addEventListener('click', () => loadUsers());

  // ======= Поиск =======
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      currentSearch = searchInput.value.trim();
      loadUsers(true);
    }
  });
});
