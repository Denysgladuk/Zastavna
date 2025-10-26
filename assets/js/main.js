document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const openIcon = document.getElementById('menu-open-icon');
  const closeIcon = document.getElementById('menu-close-icon');

  function toggleMobileMenu() {
    const isClosed = mobileMenu.classList.toggle('-translate-x-full');
    const isOpen = !isClosed;
    openIcon.classList.toggle('hidden', isOpen);
    closeIcon.classList.toggle('hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
  if (menuBtn) menuBtn.addEventListener('click', toggleMobileMenu);

  document.querySelectorAll('#mobile-menu a').forEach(a => {
    a.addEventListener('click', () => {
      if (!document.getElementById('menu-close-icon').classList.contains('hidden')) toggleMobileMenu();
    });
  });
});
console.log("✅ main.js loaded");