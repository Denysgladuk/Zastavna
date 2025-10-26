(async function () {
  const box = document.getElementById("home-news");
  if (!box) return;

  try {
    const res = await fetch("/api/news");
    if (!res.ok) throw new Error("HTTP " + res.status);

    const news = (await res.json()).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    const latest = news.slice(0, 3);

    box.innerHTML = latest
      .map((n) => {
        const date = n.created_at
          ? new Date(n.created_at).toLocaleDateString("uk-UA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "Без дати";

        const cleanText = n.content ? n.content.replace(/<[^>]+>/g, "") : "";
        const excerpt =
          n.excerpt ||
          (cleanText.length > 120
            ? cleanText.substring(0, 120) + "..."
            : cleanText);

        const image =
          n.image && n.image.trim() !== ""
            ? `<img src="${n.image}" alt="${n.title}" class="w-full h-40 object-cover rounded mb-3" onerror="this.style.display='none'">`
            : "";

        return `
          <article class="bg-white rounded-xl shadow p-5 hover:shadow-lg transition">
            ${image}
            <h3 class="text-xl font-semibold text-gray-900 mb-1">${n.title}</h3>
            <p class="text-sm text-gray-500 mb-2">${date}</p>
            <p class="text-gray-700">${excerpt}</p>
            <a href="news/article.html?id=${encodeURIComponent(
              n.id
            )}" class="inline-block mt-3 text-blue-700 hover:underline font-semibold">Читати більше →</a>
          </article>`;
      })
      .join("");
  } catch (e) {
    console.error("Помилка завантаження новин:", e);
    box.innerHTML =
      "<p class='text-gray-600 text-center py-6'>Поки немає новин.</p>";
  }
})();
