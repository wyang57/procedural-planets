// Single reusable burger/nav toggle script
(function () {
  function initBurger(scope = document) {
    const header = scope.querySelector('.top-bar');
    if (!header) return;

    const burger = header.querySelector('.burger');
    const nav = header.querySelector('.nav-links');

    if (!burger || !nav) {
      console.warn('Burger or nav not found', { burger, nav });
      return;
    }

    // Remove any duplicate listeners by cloning (fresh start)
    const freshBurger = burger.cloneNode(true);
    burger.parentNode.replaceChild(freshBurger, burger);

    freshBurger.addEventListener('click', (e) => {
      e.stopPropagation();
      nav.classList.toggle('hidden');
      const expanded = freshBurger.getAttribute('aria-expanded') === 'true';
      freshBurger.setAttribute('aria-expanded', (!expanded).toString());
    });

    // Close nav when clicking on a link
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.add('hidden');
        freshBurger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        nav.classList.add('hidden');
        freshBurger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Run as soon as DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initBurger());
  } else {
    initBurger();
  }
})();
