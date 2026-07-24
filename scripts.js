document.addEventListener('DOMContentLoaded', () => {

  /*  1. CURSEUR GLOW  */
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && window.matchMedia('(pointer:fine)').matches) {
    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top  = e.clientY + 'px';
    });
  }

  /*  2. NAVBAR SCROLL ET LIEN ACTIVE  */
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');

  const updateNavbar = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    let current = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  };

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar(); // run once on load

  /* 3. MOBILE HAMBURGER */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    const toggleMenu = () => {
      const open = hamburger.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', open);
      mobileMenu.classList.toggle('open', open);
      mobileMenu.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
    };

    hamburger.addEventListener('click', toggleMenu);

    mobileMenu.querySelectorAll('.mobile-link, .btn').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /*  4. REVEAL ON SCROLL  */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Stagger sibling cards
          const siblings = entry.target.parentElement.querySelectorAll('.project-card.reveal');
          siblings.forEach((card, i) => {
            card.style.transitionDelay = (i * 0.08) + 's';
          });
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /*  5. BARS DE COMPÉTENCES  */
  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          skillObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );
  document.querySelectorAll('.skills-grid').forEach((el) => skillObserver.observe(el));

  /*  6. SCROLL SMOOTH POUR LES LIENS D'ANCRE  */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /*  7. BOUTON DE RETOUR EN HAUT DE LA PAGE  */
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /*  8. CARTE DE PROJET */
  if (window.matchMedia('(pointer:fine) and (min-width:769px)').matches) {
    document.querySelectorAll('.project-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r   = card.getBoundingClientRect();
        const cx  = r.left + r.width  / 2;
        const cy  = r.top  + r.height / 2;
        const dx  = (e.clientX - cx) / (r.width  / 2);
        const dy  = (e.clientY - cy) / (r.height / 2);
        card.style.transform = `translateY(-10px) perspective(900px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg)`;
      });
      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  /*  9. CONTACT FORM (Web3Forms)  */
  const form      = document.getElementById('form');
  const submitBtn = document.getElementById('submitBtn');
  const btnText   = document.getElementById('btnText');

  if (form && submitBtn) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);

      btnText.textContent = 'Envoi en cours…';
      submitBtn.disabled = true;

      try {
        const res  = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body:   formData,
        });
        const data = await res.json();

        if (res.ok && data.success) {
          showToast('✅ Message envoyé ! Je vous réponds sous 24h.', 'success');
          form.reset();
        } else {
          showToast('❌ Erreur : ' + (data.message || 'Réessayez plus tard.'), 'error');
        }
      } catch {
        showToast('❌ Problème réseau. Vérifiez votre connexion.', 'error');
      } finally {
        btnText.textContent = 'Envoyer le message';
        submitBtn.disabled  = false;
      }
    });
  }

  /* NOTIFICATION  */
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
      position:     'fixed',
      bottom:       '32px',
      left:         '50%',
      transform:    'translateX(-50%) translateY(20px)',
      padding:      '14px 28px',
      borderRadius: '999px',
      background:   type === 'success' ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)',
      border:       `1px solid ${type === 'success' ? 'rgba(34,197,94,.4)' : 'rgba(239,68,68,.4)'}`,
      color:        type === 'success' ? '#4ade80' : '#f87171',
      fontFamily:   'inherit',
      fontWeight:   '600',
      fontSize:     '.92rem',
      backdropFilter: 'blur(16px)',
      zIndex:       '9999',
      transition:   'all .4s ease',
      boxShadow:    '0 8px 32px rgba(0,0,0,.3)',
    });
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity   = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      toast.style.opacity   = '0';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

}); 
