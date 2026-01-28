document.addEventListener('headerLoaded', () => {
  const menuBtn = document.getElementById('menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const openIcon = document.getElementById('menu-open-icon');
  const closeIcon = document.getElementById('menu-close-icon');

  if (!menuBtn) return;

  function toggleMobileMenu() {
    const isClosed = mobileMenu.classList.toggle('-translate-x-full');
    const isOpen = !isClosed;
    openIcon.classList.toggle('hidden', isOpen);
    closeIcon.classList.toggle('hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  menuBtn.addEventListener('click', toggleMobileMenu);

  if (mobileMenu) {
    const dropdownBtns = mobileMenu.querySelectorAll('.mobile-dropdown-btn');
    
    dropdownBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const submenu = btn.parentElement.nextElementSibling;
        const arrow = btn.querySelector('svg');
        
        if (submenu) {
          submenu.classList.toggle('hidden');
          arrow.classList.toggle('rotate-180');
        }
      });
    });

    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (!mobileMenu.classList.contains('-translate-x-full')) {
          toggleMobileMenu();
        }
      });
    });
  }
});