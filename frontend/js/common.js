// Сохраняем токены
export function saveTokens(access, refresh) {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

// Показываем уведомления
export function showAlert(message) {
  alert(message);
}

// Обрабатываем сетевые ошибки
export function handleError(err) {
  console.error("Ошибка сети или сервера:", err);
  showAlert("Ошибка сети или сервера");
}
