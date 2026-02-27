// Muxammedali
(() => {
  const doc = document;

  const navLinks = Array.from(
    doc.querySelectorAll('.nav__link[data-nav-target]')
  );

  const setActiveNav = targetId => {
    if (!targetId || !navLinks.length) {
      return;
    }

    navLinks.forEach(link => {
      const isActive = link.dataset.navTarget === targetId;
      link.classList.toggle('active', isActive);
    });
  };

  const smoothLinks = doc.querySelectorAll('a[href^="#"]:not([href="#"])');
  smoothLinks.forEach(link => {
    link.addEventListener('click', event => {
      const targetId = link.getAttribute('href').slice(1);
      const target = targetId ? doc.getElementById(targetId) : null;

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (link.classList.contains('nav__link')) {
        setActiveNav(targetId);
      }

      if (window.history && 'replaceState' in window.history) {
        window.history.replaceState(null, '', `#${targetId}`);
      }
    });
  });

  const sections = navLinks
    .map(link => doc.getElementById(link.dataset.navTarget))
    .filter(section => section !== null);

  if (sections.length) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setActiveNav(entry.target.id);
            }
          });
        },
        {
          threshold: 0.55,
          rootMargin: '-15% 0px -35% 0px',
        }
      );

      sections.forEach(section => observer.observe(section));
    } else {
      const collectOffsets = () =>
        sections.map(section => ({
          id: section.id,
          top: section.getBoundingClientRect().top + window.scrollY,
        }));

      let offsets = collectOffsets();

      window.addEventListener('resize', () => {
        offsets = collectOffsets();
      });

      window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY + window.innerHeight * 0.25;
        let activeId = offsets[0].id;

        offsets.forEach(section => {
          if (scrollPosition >= section.top) {
            activeId = section.id;
          }
        });

        setActiveNav(activeId);
      });
    }

    const defaultSection = sections[0]?.id || navLinks[0]?.dataset.navTarget;
    if (defaultSection) {
      setActiveNav(defaultSection);
    }
  }

  const form = doc.getElementById('contact-form');
  const messageEl = doc.getElementById('form-message');

  if (messageEl) {
    messageEl.hidden = true;
  }

  const showMessage = (text, state) => {
    if (!messageEl) {
      return;
    }

    messageEl.textContent = text;
    messageEl.dataset.state = state;
    messageEl.hidden = false;
  };

  const markFieldValidity = (field, isValid) => {
    if (!field || !('setAttribute' in field)) {
      return;
    }

    field.setAttribute('aria-invalid', isValid ? 'false' : 'true');
  };

  if (form) {
    const requiredFields = ['firstName', 'lastName', 'email', 'message'];
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener('submit', event => {
      event.preventDefault();

      const invalidFields = [];

      requiredFields.forEach(name => {
        const field = form.elements.namedItem(name);
        const value =
          field && 'value' in field ? String(field.value).trim() : '';
        let isValid = value.length > 0;

        if (name === 'email' && isValid) {
          isValid = emailPattern.test(value);
        }

        markFieldValidity(field, isValid);

        if (!isValid && field instanceof HTMLElement) {
          invalidFields.push(field);
        }
      });

      if (invalidFields.length) {
        showMessage(
          'Please fill in the highlighted fields correctly before sending.',
          'error'
        );
        invalidFields[0].focus();
        return;
      }

      showMessage(
        'Thanks! Your request has been received. We will contact you shortly.',
        'success'
      );

      form.reset();
      requiredFields.forEach(name => {
        const field = form.elements.namedItem(name);
        markFieldValidity(field, true);
      });
    });
  }

  const yearEl = doc.getElementById('copyright-year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
// Muxammedali 2025 year