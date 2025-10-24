(async function(){
  const box = document.getElementById('home-news');
  if (!box) return;
  try {
    const res = await fetch('news.json', {cache: 'no-store'});
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const news = (await res.json()).sort((a,b)=> new Date(b.date) - new Date(a.date)).slice(0,3);
    box.innerHTML = news.map(n => `
      <article class="bg-white rounded-xl shadow p-5">
        <h3 class="text-xl font-semibold text-gray-900">${n.title}</h3>
        <p class="text-sm text-gray-500 mb-2">${new Date(n.date).toLocaleDateString('uk-UA')}</p>
        <p class="text-gray-700">${n.summary || ''}</p>
        <a href="news/article.html?id=${encodeURIComponent(n.id)}" class="inline-block mt-3 text-blue-700 hover:underline font-semibold">Читати більше →</a>
      </article>
    `).join('');
  } catch (e) {
    box.innerHTML = '<p class="text-gray-600">Поки немає новин.</p>';
  }
})();
