// Підсвітка активного пункту меню на основі поточного шляху
(function() {
  try {
    const path = location.pathname.replace(/\/+/g,'/');
    const file = path.endsWith('/') ? 'index.html' : path.split('/').pop();
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.endsWith(file)) {
        link.classList.add('text-blue-700','font-semibold');
      }
    });
  } catch(e) {}
})();
