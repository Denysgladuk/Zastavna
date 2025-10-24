// assets/js/article.js - Тимчасова версія з вбудованими даними

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

async function loadArticle() {
  // Отримуємо ID новини з URL
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = parseInt(urlParams.get('id'));
  
  if (!articleId) {
    showError('Новину не знайдено');
    return;
  }
  
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
    
    const article = data.news.find(item => item.id === articleId);
    
    if (!article) {
      showError('Новину не знайдено');
      return;
    }
    
    // Оновлюємо заголовок сторінки
    document.title = `${article.title} — Заставнівська лікарня`;
    
    // Відображаємо дату
    const date = new Date(article.date).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    document.getElementById('article-title').textContent = article.title;
    document.getElementById('article-date').textContent = date;
    
    // Відображаємо зображення, якщо воно є
    if (article.image) {
      const imgElement = document.getElementById('article-image');
      imgElement.src = article.image;
      imgElement.alt = article.title;
      imgElement.classList.remove('hidden');
      // Додаємо обробник помилки для зображення
      imgElement.onerror = function() {
        this.style.display = 'none';
      };
    }
    
    // Відображаємо контент з форматуванням
    const contentElement = document.getElementById('article-content');
    contentElement.innerHTML = formatArticleContent(article.content);
    
  } catch (error) {
    console.error('Помилка завантаження новини:', error);
    showError('Не вдалося завантажити новину');
  }
}

function formatArticleContent(content) {
  // Розбиваємо текст на абзаци та додаємо форматування
  return content
    .split('\n\n')
    .map(paragraph => `<p class="text-gray-700 leading-relaxed mb-4">${paragraph.trim()}</p>`)
    .join('');
}

function showError(message) {
  document.getElementById('article-title').textContent = 'Помилка';
  document.getElementById('article-date').textContent = '';
  document.getElementById('article-content').innerHTML = `
    <div class="bg-red-50 border border-red-200 rounded-lg p-6">
      <p class="text-red-600">${message}</p>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', loadArticle);