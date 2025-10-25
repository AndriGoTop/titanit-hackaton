// пример: подставляем данные с сервера
const serverData = {
  name: "Голубенко Андрей Алексеевич",
  skills: ["Back-end", "DevOps", "Linux", "Коммуникативные навыки"],
  quote: "Самое сложное — сделать первый шаг к цели",
  status: "Ищу команду для проекта"
};

document.getElementById('profile-name').textContent = serverData.name;
document.getElementById('profile-quote').textContent = serverData.quote;
document.getElementById('profile-status').textContent = serverData.status;

const skillsContainer = document.getElementById('profile-skills');
skillsContainer.innerHTML = '';
serverData.skills.forEach(skill => {
  const span = document.createElement('span');
  span.textContent = skill;
  skillsContainer.appendChild(span);
});
