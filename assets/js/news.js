// assets/js/news.js - Тимчасова версія з вбудованими даними

// Вбудовані дані (тимчасово, поки не запустите локальний сервер)
const NEWS_DATA = {
  "news": [
    {
      "id": 1,
      "title": "Нове обладнання для УЗД-діагностики",
      "date": "2025-01-15",
      "excerpt": "Лікарня отримала сучасний апарат ультразвукової діагностики експертного класу",
      "content": "Заставнівська лікарня отримала нове обладнання для ультразвукової діагностики експертного класу. Це дозволить значно покращити якість обстежень та діагностики.\n\nНовий апарат оснащений найсучаснішими технологіями, що дає змогу проводити дослідження з високою точністю. Пацієнти зможуть отримати якісну діагностику без потреби їхати до обласного центру.\n\nОбладнання вже введено в експлуатацію та доступне для всіх пацієнтів лікарні.",
      "image": "../assets/img/news/uzd-equipment.jpg"
    },
    {
      "id": 2,
      "title": "Графік роботи у святкові дні",
      "date": "2025-01-10",
      "excerpt": "Повідомляємо про графік роботи лікарні під час святкових днів",
      "content": "Шановні пацієнти! Повідомляємо вам про графік роботи нашої лікарні під час святкових днів.\n\nСтаціонар працює цілодобово у звичайному режимі.\n\nПоліклініка:\n- 24-25 січня: вихідні дні\n- 26 січня: робочий день з 9:00 до 14:00\n- З 27 січня: звичайний графік роботи\n\nУ разі екстреної необхідності звертайтеся до приймального відділення.",
      "image": "../assets/img/news/schedule.jpg"
    },
    {
      "id": 3,
      "title": "День відкритих дверей для майбутніх мам",
      "date": "2025-01-05",
      "excerpt": "Запрошуємо вагітних жінок на день відкритих дверей у пологове відділення",
      "content": "Запрошуємо майбутніх мам відвідати наше пологове відділення, познайомитися з персоналом та умовами перебування.\n\nПід час заходу ви зможете:\n- Оглянути палати та пологові зали\n- Поспілкуватися з акушерами-гінекологами\n- Дізнатися про програми підготовки до пологів\n- Отримати відповіді на всі питання\n\nЗахід відбудеться 25 січня о 14:00.\n\nРеєстрація за телефоном: +38 (03737) 0-00-03",
      "image": "../assets/img/news/open-day.jpg"
    },
    {
      "id": 4,
      "title": "Вакцинація від грипу: розпочато кампанію",
      "date": "2024-12-20",
      "excerpt": "У лікарні розпочато щеплення від грипу. Запрошуємо всіх бажаючих",
      "content": "Розпочато щорічну кампанію вакцинації від грипу. Щеплення можна отримати в поліклініці з понеділка по п'ятницю з 8:00 до 15:00.\n\nОсобливо рекомендуємо вакцинуватися:\n- Людям похилого віку\n- Особам з хронічними захворюваннями\n- Медичним працівникам\n- Вагітним жінкам\n\nПри собі мати паспорт та медичну картку.\n\nВакцинація безкоштовна для всіх категорій громадян.",
      "image": "../assets/img/news/vaccination.jpg"
    }
  ]
};

async function loadNewsList() {
  const newsContainer = document.getElementById('news-list');
  
  try {
    // Спробувати завантажити з файлу
    let data;
    try {
      const response = await fetch('../assets/data/news.json');
      if (response.ok) {
        data = await response.json();
      } else {
        throw new Error('Файл не знайдено');
      }
    } catch (fetchError) {
      // Якщо fetch не працює (локальний файл), використати вбудовані дані
      console.warn('Використовуються вбудовані дані. Для завантаження з JSON запустіть локальний сервер.');
      data = NEWS_DATA;
    }
    
    const news = data.news || [];
    
    if (news.length === 0) {
      newsContainer.innerHTML = '<p class="text-gray-600 text-center py-8">Новин поки немає</p>';
      return;
    }
    
    // Сортуємо новини за датою (найновіші спочатку)
    news.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    newsContainer.innerHTML = news.map(item => {
      const date = new Date(item.date).toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const imageUrl = item.image || '../assets/img/news/default.jpg';
      const excerpt = item.excerpt || item.content.substring(0, 150) + '...';
      
      return `
        <article class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row">
          <img src="${imageUrl}" alt="${item.title}" class="w-full md:w-64 h-48 object-cover" onerror="this.src='../assets/img/news/default.jpg'">
          <div class="p-6 flex-1">
            <div class="text-sm text-blue-600 mb-2">${date}</div>
            <h2 class="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-700">
              <a href="article.html?id=${item.id}">${item.title}</a>
            </h2>
            <p class="text-gray-600 mb-4">${excerpt}</p>
            <a href="article.html?id=${item.id}" class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
              Читати далі
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>
        </article>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Помилка завантаження новин:', error);
    newsContainer.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-600">Не вдалося завантажити новини. Спробуйте пізніше.</p>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', loadNewsList);