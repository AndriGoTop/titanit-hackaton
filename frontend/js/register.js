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
  // Получаем форму регистрации
  const registerForm = document.getElementById('registerForm');

  if (!registerForm) return;

  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const fio = document.getElementById('fio').value.trim();
    const nickname = document.getElementById('nickname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const password_repeat = document.getElementById('password_repeat').value;

    // Проверка совпадения паролей
    if (password !== password_repeat) {
      alert("Пароли не совпадают!");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: nickname, // используем nickname как username
          email: email,
          password: password,
          password_confirm: password_repeat,
        })
      });
      const data = await response.json();
      if (response.ok) {
        // Сохраняем JWT в localStorage
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        alert("Регистрация успешна! JWT сохранён.");
        // Перенаправление на страницу после регистрации
        window.location.href = '/auth.html';
      } else {
        alert("Ошибка регистрации: " + JSON.stringify(data));
      }
    } catch (err) {
      console.error("Ошибка сети или сервера:", err);
      alert("Ошибка сети или сервера");
    }
  });

  // ======== Авторизация ========
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      try {
        const response = await fetch('http://127.0.0.1:8000/auth/jwt/create/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            password: password
          })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);

          alert("Вход выполнен успешно!");
          window.location.href = '/profile.html';
        } else {
          alert("Ошибка авторизации: " + JSON.stringify(data));
        }
      } catch (err) {
        console.error("Ошибка сети или сервера:", err);
        alert("Ошибка сети или сервера");
      }
    });
  }
});
