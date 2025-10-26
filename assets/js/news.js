async function loadNewsList() {
  const newsContainer = document.getElementById("news-list");
  try {
    const res = await fetch("/api/news");
    if (!res.ok) throw new Error("HTTP " + res.status);

    const news = await res.json();
    if (!news.length) {
      newsContainer.innerHTML =
        '<p class="text-gray-600 text-center py-8">Новин поки немає</p>';
      return;
    }

    // 🟢 сортування за created_at (а не date)
    news.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    newsContainer.innerHTML = news
      .map((item) => {
        const date = item.created_at
          ? new Date(item.created_at).toLocaleDateString("uk-UA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "Без дати";

        // 🖼️ fallback-зображення
        const imageUrl =
          item.image && item.image.trim() !== ""
            ? item.image
            : "../assets/img/news/default.jpg";

        // 🧾 короткий опис без HTML-тегів
        const cleanText = item.content
          ? item.content.replace(/<[^>]+>/g, "")
          : "";
        const excerpt =
          item.excerpt ||
          (cleanText.length > 150
            ? cleanText.substring(0, 150) + "..."
            : cleanText);

        return `
        <article class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row">
          <div class="md:w-64 w-full h-48 overflow-hidden flex-shrink-0">
            <img src="${imageUrl}" alt="${item.title}" class="w-full h-full object-cover" onerror="this.src='../assets/img/news/default.jpg'">
          </div>
          <div class="p-6 flex-1 flex flex-col">
            <div class="text-sm text-blue-600 mb-2">${date}</div>
            <h2 class="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-700">
              <a href="article.html?id=${item.id}" class="hover:underline">${item.title}</a>
            </h2>
            <p class="text-gray-600 mb-4 flex-1">${excerpt}</p>
            <a href="article.html?id=${item.id}" class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mt-auto">
              Читати далі
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </a>
          </div>
        </article>
      `;
      })
      .join("");
  } catch (error) {
    console.error("Помилка завантаження новин:", error);
    newsContainer.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p class="text-red-600">Не вдалося завантажити новини. Спробуйте пізніше.</p>
      </div>`;
  }
}

document.addEventListener("DOMContentLoaded", loadNewsList);
