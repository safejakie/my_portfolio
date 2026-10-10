// Scripts du portfolio : menu, animations au scroll et formulaire de contact

document.addEventListener('DOMContentLoaded', () => {

  // barre de navigation : fond au scroll et lien de la section visible
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');

  const updateNavbar = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    // on garde la dernière section dont le haut est passé sous la barre
    let current = '';
    sections.forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  };

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // menu mobile
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    const closeMenu = () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
      mobileMenu.classList.toggle('open', open);
      mobileMenu.setAttribute('aria-hidden', !open);
      // on bloque le scroll de la page quand le menu est ouvert
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // le menu se ferme dès qu'on clique sur un lien
    mobileMenu.querySelectorAll('.mobile-link, .btn').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }

  // les éléments apparaissent quand ils entrent dans l'écran
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');

        // petit décalage entre les cartes projets pour qu'elles n'arrivent pas toutes d'un coup
        entry.target.parentElement
          .querySelectorAll('.project-card.reveal')
          .forEach((card, i) => {
            card.style.transitionDelay = (i * 0.08) + 's';
          });

        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // défilement doux vers les ancres, en tenant compte de la hauteur de la barre
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navbarHeight = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // bouton pour remonter en haut de la page
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // légère inclinaison des cartes projets au survol (souris uniquement, écran large)
  if (window.matchMedia('(pointer:fine) and (min-width:769px)').matches) {
    document.querySelectorAll('.project-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r  = card.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        card.style.transform = `translateY(-10px) perspective(900px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  // formulaire de contact : envoi avec Web3Forms
  const form      = document.getElementById('form');
  const submitBtn = document.getElementById('submitBtn');
  const btnText   = document.getElementById('btnText');

  if (form && submitBtn) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      btnText.textContent = 'Envoi en cours...';
      submitBtn.disabled = true;

      try {
        const res  = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body:   formData,
        });
        const data = await res.json();

        if (res.ok && data.success) {
          showToast('Message envoyé ! Je vous réponds sous 24h.', 'success');
          form.reset();
        } else {
          showToast('Erreur : ' + (data.message || 'réessayez plus tard.'), 'error');
        }
      } catch {
        showToast('Problème de réseau, vérifiez votre connexion.', 'error');
      } finally {
        // on remet le bouton dans son état normal, que l'envoi ait marché ou non
        btnText.textContent = 'Envoyer le message';
        submitBtn.disabled  = false;
      }
    });
  }

  // petite notification en bas de l'écran
  function showToast(message, type = 'success') {
    const ok = type === 'success';
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.setAttribute('role', 'status');

    Object.assign(toast.style, {
      position:     'fixed',
      bottom:       '32px',
      left:         '50%',
      transform:    'translateX(-50%) translateY(20px)',
      opacity:      '0',
      padding:      '14px 28px',
      borderRadius: '999px',
      background:   ok ? '#ecfdf3' : '#fef2f2',
      border:       '1px solid ' + (ok ? '#86d4a4' : '#f0a5a5'),
      color:        ok ? '#166534' : '#991b1b',
      fontFamily:   'inherit',
      fontWeight:   '600',
      fontSize:     '.92rem',
      zIndex:       '9999',
      transition:   'all .4s ease',
      boxShadow:    '0 8px 24px rgba(60,32,45,.15)',
    });
    document.body.appendChild(toast);

    // apparition
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity   = '1';
    });

    // disparition au bout de 4 secondes
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      toast.style.opacity   = '0';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

});