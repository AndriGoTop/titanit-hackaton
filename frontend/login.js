// Сохраняем токены
function saveTokens(access, refresh) {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

// Показываем уведомления
function showAlert(message) {
  alert(message);
}

// Обрабатываем сетевые ошибки
function handleError(err) {
  console.error("Ошибка сети или сервера:", err);
  showAlert("Ошибка сети или сервера");
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://127.0.0.1:8000/auth/jwt/create/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password })
            });

            const data = await response.json();

            if (response.ok) {
                saveTokens(data.access, data.refresh);
                showAlert("Вход выполнен успешно!");
                window.location.href = '/profile.html';
            } else {
                showAlert("Ошибка авторизации: " + JSON.stringify(data));
            }
        } catch (err) {
            handleError(err);
        }
    });
});
