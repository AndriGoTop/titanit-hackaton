<script>
  const form = document.querySelector('form'); // у тебя только одна форма на странице

  form.addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = {
      fio: document.getElementById('fio').value,
      nickname: document.getElementById('nickname').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      password_repeat: document.getElementById('password_repeat').value,
      remember: document.getElementById('remember').checked
    };

    console.log('Данные для бэка:', formData);
  });
</script>
