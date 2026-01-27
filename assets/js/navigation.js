// Підсвітка активного пункту меню на основі поточного шляху
(function() {
  const SECTION_KEYS = ['about', 'services', 'doctors', 'patients', 'news'];

  const highlightLink = (link) => {
    link.classList.add('text-blue-700', 'font-semibold');
  };

  const normalisePath = (path) => {
    if (!path || path === '/') return '/index.html';
    const cleaned = path.replace(/\+/g, '/').replace(/\/+/g, '/');
    return cleaned.endsWith('/') ? `${cleaned}index.html` : cleaned;
  };

  const resolveUrl = (href) => {
    try {
      return new URL(href, window.location.href).pathname;
    } catch (_) {
      return href || '';
    }
  };

  const detectSection = (path) => {
    return (
      SECTION_KEYS.find((section) =>
        path.includes(`/${section}/`) || path.endsWith(`/${section}.html`)
      ) || ''
    );
  };

  try {
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    if (navLinks.length === 0) return;

    const currentPath = normalisePath(window.location.pathname || '');
    const currentSection = detectSection(currentPath);
    const currentFile = currentPath.split('/').pop();

    let highlighted = false;

    // Спочатку перевіряємо за секцією
    if (currentSection) {
      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;
        const linkPath = normalisePath(resolveUrl(href));
        const linkSection = detectSection(linkPath);
        if (linkSection && linkSection === currentSection) {
          highlightLink(link);
          highlighted = true;
        }
      });
    }

    // Якщо не знайдено за секцією, шукаємо точний збіг
    if (!highlighted) {
      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;
        const linkPath = normalisePath(resolveUrl(href));
        const linkFile = linkPath.split('/').pop();
        if (linkFile === currentFile && linkPath === currentPath) {
          highlightLink(link);
        }
      });
    }
  } catch (error) {
    console.error('Navigation highlight error:', error);
  }
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
})();