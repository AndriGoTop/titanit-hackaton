const profileData = {
  name: "Голубенко Андрей Алексеевич",
  profession: "Back-end Developer",
  city: "Ростов-на-Дону",
  status: "Ищу команду для проекта",
  photo: "img/profile.jpg"
};

document.getElementById('user-name').textContent = profileData.name;
document.getElementById('user-profession').textContent = profileData.profession;
document.getElementById('user-city').textContent = profileData.city;
document.getElementById('user-status').textContent = profileData.status;
document.getElementById('user-photo').src = profileData.photo;

// Заглушка с данными с сервера
const usersData = [
  { name: "Мария Иванова", age: 24, city: "Москва", skills: "Figma, UI/UX, Adobe XD", profession: "UX Designer", photo: "img/person1.jpg" },
  { name: "Иван Петров", age: 28, city: "Санкт-Петербург", skills: "React, JS, CSS", profession: "Front-end", photo: "img/person2.jpg" },
  { name: "Ольга Смирнова", age: 26, city: "Москва", skills: "Python, Django, SQL", profession: "Back-end", photo: "img/person3.jpg" }
];

const cardsContainer = document.getElementById('cards-container');
cardsContainer.innerHTML = ""; // очищаем контейнер

usersData.forEach(user => {
  const card = document.createElement('a');
  card.href = "user.html";
  card.innerHTML = `
    <div class="user-card" style="background-image: url('${user.photo}')">
      <div class="card-overlay">
        <span class="card-profession">${user.profession}</span>
      </div>
      <div class="card-info">
        <p class="card-name">${user.name}, ${user.age}</p>
        <p class="card-city">${user.city}</p>
        <p class="card-skills">${user.skills}</p>
      </div>
    </div>
  `;
  cardsContainer.appendChild(card);
});


const loadMoreBtn = document.getElementById('load-more-btn');
loadMoreBtn.addEventListener('click', () => {
  console.log("Нажата кнопка 'Показать ещё'");
  // Можно добавить подгрузку новых пользователей с сервера или имитацию
});


const allUsers = [
  { name: "Мария Иванова", age: 24, city: "Москва", skills: "Figma, UI/UX, Adobe XD", profession: "UX Designer", photo: "img/person1.jpg" },
  { name: "Иван Петров", age: 28, city: "Санкт-Петербург", skills: "React, JS, CSS", profession: "Front-end", photo: "img/person2.jpg" },
  { name: "Ольга Смирнова", age: 26, city: "Москва", skills: "Python, Django, SQL", profession: "Back-end", photo: "img/person3.jpg" },
  { name: "Алексей Смирнов", age: 30, city: "Казань", skills: "Node.js, Express", profession: "Back-end", photo: "img/person4.jpg" },
  { name: "Екатерина Лебедева", age: 22, city: "Москва", skills: "Figma, UI/UX", profession: "UX Designer", photo: "img/person5.jpg" }
];

const cardsContainer = document.getElementById('cards-container');

let usersLoaded = 0; // сколько пользователей уже показано
const usersPerPage = 3; // сколько показываем за раз

function loadUsers() {
  const nextUsers = allUsers.slice(usersLoaded, usersLoaded + usersPerPage);
  
  nextUsers.forEach(user => {
    const card = document.createElement('a');
    card.href = "user.html";
    card.innerHTML = `
      <div class="user-card" style="background-image: url('${user.photo}')">
        <div class="card-overlay">
          <span class="card-profession">${user.profession}</span>
        </div>
        <div class="card-info">
          <p class="card-name">${user.name}, ${user.age}</p>
          <p class="card-city">${user.city}</p>
          <p class="card-skills">${user.skills}</p>
        </div>
      </div>
    `;
    cardsContainer.appendChild(card);
  });

  usersLoaded += nextUsers.length;

  // Если все пользователи показаны, прячем кнопку
  if (usersLoaded >= allUsers.length) {
    document.getElementById('load-more-btn').style.display = 'none';
  }
}

// Начальная загрузка
loadUsers();

// Подгрузка при клике
document.getElementById('load-more-btn').addEventListener('click', loadUsers);
