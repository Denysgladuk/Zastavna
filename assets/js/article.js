async function loadArticle() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = parseInt(urlParams.get("id"));
  if (!articleId) return showError("Новину не знайдено");

  try {
    const res = await fetch(`/api/news/${articleId}`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const article = await res.json();

    document.title = `${article.title} — Заставнівська лікарня`;

    const date = article.created_at
      ? new Date(article.created_at).toLocaleDateString("uk-UA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "Без дати";

    document.getElementById("article-title").textContent = article.title;
    document.getElementById("article-date").textContent = date;

    const img = document.getElementById("article-image");
    if (article.image && article.image.trim() !== "") {
      img.src = article.image;
      img.alt = article.title;
      img.classList.remove("hidden");
    } else {
      img.classList.add("hidden");
    }

    const contentEl = document.getElementById("article-content");
    contentEl.innerHTML = article.content || "<p>Без тексту</p>";
  } catch (e) {
    console.error(e);
    showError("Не вдалося завантажити новину");
  }
}

function showError(msg) {
  document.getElementById("article-content").innerHTML = `
    <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <p class="text-red-600">${msg}</p>
    </div>`;
}

document.addEventListener("DOMContentLoaded", loadArticle);