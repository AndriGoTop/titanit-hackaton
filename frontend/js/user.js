import { requireAuth } from './guard.js';
document.addEventListener('DOMContentLoaded', async () => {
    await requireAuth();
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');

    if (!userId) {
        console.error('❌ ID пользователя не указан в URL');
        return;
    }

    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!accessToken) {
        alert('Вы не авторизованы');
        window.location.href = '/login.html';
        return;
    }

    async function fetchProfile(id, token) {
        return await fetch(`http://127.0.0.1:8000/api/profile/${userId}/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    }

    try {
        let response = await fetchProfile(userId, accessToken);
        console.log(response);

        // Если access устарел — обновляем через refresh
        if (response.status === 401 && refreshToken) {
            const refreshRes = await fetch('http://127.0.0.1:8000/auth/jwt/refresh/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ refresh: refreshToken })
            });

            if (!refreshRes.ok) throw new Error('Не удалось обновить токен');
            const refreshData = await refreshRes.json();
            localStorage.setItem('access_token', refreshData.access);

            // повторный запрос с новым токеном
            response = await fetchProfile(userId, refreshData.access);
        }

        if (!response.ok) throw new Error('Ошибка загрузки профиля');

        const data = await response.json();
        console.log('Профиль пользователя:', data);

        // === Заполнение данных на странице ===

        // Фото
        const profilePhoto = document.querySelector('.profile-photo');
        if (profilePhoto) profilePhoto.src = data.photo || 'img/default.jpg';

        // Основная информация
        document.getElementById('profile-name').textContent = data.username || 'Пользователь';
        document.getElementById('profile-quote').textContent = data.goals || 'Цель не указана';
        document.querySelector('.city').textContent = data.locations || 'Город не указан';
        document.getElementById('sex').textContent = data.gender || 'Не указан';
        document.getElementById('age').textContent = data.bithday ? getAge(data.bithday) : '—';

        const skillsInput = document.querySelector('input[name="skills"]');
        const skillsContainer = document.getElementById('profile-skills');
        // Обработка разных форматов (список или строка)
        let skills = [];
        if (Array.isArray(data.skills)) {
            skills = data.skills;
        } else if (typeof data.skills === 'string') {
            skills = data.skills.split(',').map(s => s.trim());
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
        // === Опыт работы ===
        const exp = parseInt(data.expirience) || 0;
        const experienceElem = document.getElementById('user-experience');
        const expTxtElem = document.querySelector('.user-experience__txt');

        if (experienceElem && expTxtElem) {
            experienceElem.textContent = exp;
            expTxtElem.textContent = getYearsWord(exp);
        }

        // === Остальные поля ===
        document.getElementById('user-about').textContent = data.bio || 'Описание отсутствует';
        document.getElementById('user-email').textContent = data.email || '—';
        document.getElementById('user-telegram').textContent = data.telegram_id || '—';

        // === Интересы ===
        const interestsContainer = document.getElementById('user-interests');
        interestsContainer.innerHTML = '';
        if (data.inerests) {
            const interests = data.inerests.split(',').map(i => i.trim());
            interests.forEach(interest => {
                const span = document.createElement('span');
                span.className = 'interest';
                span.textContent = interest;
                interestsContainer.appendChild(span);
            });
        }

        // Навигация: имя в шапке
        const navActive = document.querySelector('.nav-btn.active');
        if (navActive) navActive.textContent = data.username || 'Пользователь';

    } catch (err) {
        console.error('❌ Ошибка при загрузке профиля:', err);
        alert('Не удалось загрузить профиль');
    }
});

// === Функция расчёта возраста ===
function getAge(birthDate) {
    const birth = new Date(birthDate);
    const diff = Date.now() - birth.getTime();
    const age = new Date(diff);
    return Math.abs(age.getUTCFullYear() - 1970);
}

// === Функция выбора слова "год" / "года" / "лет" ===
function getYearsWord(number) {
    const lastDigit = number % 10;
    const lastTwo = number % 100;

    if (lastTwo >= 11 && lastTwo <= 19) return 'лет';
    if (lastDigit === 1) return 'год';
    if (lastDigit >= 2 && lastDigit <= 4) return 'года';
    return 'лет';
}
