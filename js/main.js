/* ==========================================================
   MAIN JAVASCRIPT: PORTFOLIO IT DEVELOPER & DJ
   Interactive UI, Typewriter, Filters, Animations, Form
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Typewriter Effect ---
  const typewriterElement = document.getElementById('typewriter');
  const phrases = [
    "Sinh viên năm 3 Khoa CNTT - Đại học Đại Nam (DNU).",
    "DJ Vchun - Chuyên dòng nhạc Vinahouse & Houselak cực cháy.",
    "Lập trình viên Frontend (HTML5, CSS3, JavaScript ES6+).",
    "Nhận show biểu diễn tại Hà Nội, Thái Bình & quanh miền Bắc.",
    "Tác giả chuỗi mixtape 'Người Việt Gốc Bánh Cáy' trên SoundCloud."
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 70;

  function typeEffect() {
    if (!typewriterElement) return;

    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      typewriterElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 35;
    } else {
      typewriterElement.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 75;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      typingSpeed = 2000; // Pause at end of sentence
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typingSpeed = 400; // Pause before new sentence
    }

    setTimeout(typeEffect, typingSpeed);
  }

  typeEffect();

  // --- 2. Theme / Vibe Switcher (Dev Mode vs DJ Mode) ---
  const themeToggleBtn = document.getElementById('themeToggle');
  const body = document.body;
  const toggleIcon = themeToggleBtn ? themeToggleBtn.querySelector('.toggle-icon i') : null;
  const toggleText = themeToggleBtn ? themeToggleBtn.querySelector('.toggle-text') : null;

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      if (body.classList.contains('theme-dev')) {
        // Switch to DJ Mode
        body.classList.remove('theme-dev');
        body.classList.add('theme-dj');
        document.documentElement.setAttribute('data-theme', 'dj');
        if (toggleIcon) toggleIcon.className = 'fa-solid fa-music';
        if (toggleText) toggleText.textContent = 'DJ Vibe';
      } else {
        // Switch to Dev Mode
        body.classList.remove('theme-dj');
        body.classList.add('theme-dev');
        document.documentElement.setAttribute('data-theme', 'dev');
        if (toggleIcon) toggleIcon.className = 'fa-solid fa-code';
        if (toggleText) toggleText.textContent = 'Dev Mode';
      }
    });
  }

  // --- 3. Sticky Navbar & Active Section Highlighting ---
  const header = document.getElementById('header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    // Header background blur on scroll
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // ScrollSpy active link
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });

  // --- 4. Mobile Navigation Menu Toggle ---
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const icon = mobileMenuBtn.querySelector('i');
      if (navMenu.classList.contains('open')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });

    // Close mobile menu when clicking any nav item
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      });
    });
  }

  // --- 5. Animated Number Counters on Scroll ---
  const statNumbers = document.querySelectorAll('.stat-num');
  let statsStarted = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsStarted) {
        statsStarted = true;
        statNumbers.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const duration = 1500;
          const step = Math.ceil(target / (duration / 25));

          let count = 0;
          const updateCounter = () => {
            count += step;
            if (count < target) {
              counter.innerText = count;
              setTimeout(updateCounter, 25);
            } else {
              counter.innerText = target;
            }
          };
          updateCounter();
        });
      }
    });
  }, { threshold: 0.4 });

  const statsSection = document.querySelector('.stats-bar');
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // --- 6. Skill Bars Animation on Scroll ---
  const progressBars = document.querySelectorAll('.skills-section .progress');
  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        progressBars.forEach(bar => {
          const customWidth = bar.style.getPropertyValue('--width');
          bar.style.width = customWidth;
        });
      }
    });
  }, { threshold: 0.3 });

  const skillsSection = document.getElementById('skills');
  if (skillsSection) {
    skillsObserver.observe(skillsSection);
  }

  // --- 7. Portfolio Projects & Mixtapes Filter ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.9)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // --- 8. Contact Form Handling ---
  const contactForm = document.getElementById('contactForm');
  const formToast = document.getElementById('formToast');
  const submitBtn = document.getElementById('submitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!contactForm.checkValidity()) return;

      // Loading state on button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Đang gửi...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
      }

      // Simulate network request
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Gửi Tin Nhắn</span> <i class="fa-solid fa-paper-plane"></i>`;
        }

        // Show toast notification
        if (formToast) {
          formToast.classList.add('show');
          contactForm.reset();

          setTimeout(() => {
            formToast.classList.remove('show');
          }, 5000);
        }
      }, 1000);
    });
  }

  // ==========================================================
  // --- 9. Custom Neon Glowing Cursor ---
  // ==========================================================
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');

  if (cursorDot && cursorRing && window.innerWidth > 768) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth lerp for ring follower
    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover scale effect on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, input, select, textarea, .project-card, .soundcloud-card, .about-card, .avatar-box');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
    });
  }

  // ==========================================================
  // --- 10. Sonic Shockwave Click Ripple ---
  // ==========================================================
  window.addEventListener('click', (e) => {
    // Avoid spamming on sliders
    if (e.target.tagName === 'INPUT') return;

    const ripple = document.createElement('div');
    ripple.className = 'sonic-ripple';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    document.body.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });

  // ==========================================================
  // --- 11. Interactive Cyber Particle Canvas Background ---
  // ==========================================================
  const particleCanvas = document.getElementById('particlesCanvas');
  if (particleCanvas) {
    const ctx = particleCanvas.getContext('2d');
    let width = particleCanvas.width = window.innerWidth;
    let height = particleCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = particleCanvas.width = window.innerWidth;
      height = particleCanvas.height = window.innerHeight;
    });

    const particles = [];
    const numParticles = Math.min(Math.floor(width / 22), 55);

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1
      });
    }

    let mouseP = { x: -1000, y: -1000 };
    window.addEventListener('mousemove', (e) => {
      mouseP.x = e.clientX;
      mouseP.y = e.clientY;
    });

    function drawParticles() {
      ctx.clearRect(0, 0, width, height);

      const isDev = document.body.classList.contains('theme-dev');
      const particleColor = isDev ? 'rgba(6, 182, 212, 0.6)' : 'rgba(217, 70, 239, 0.6)';
      const lineColor = isDev ? 'rgba(6, 182, 212, ' : 'rgba(217, 70, 239, ';

      // Update & Draw Particles
      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse repulsion
        const dx = mouseP.x - p.x;
        const dy = mouseP.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          p.x -= (dx / dist) * 2;
          p.y -= (dy / dist) * 2;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();

        // Connect nearby particles
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const alpha = 0.22 * (1 - dist2 / 120);
            ctx.strokeStyle = `${lineColor}${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  // ==========================================================
  // --- 12. 3D Card Tilt Effect ---
  // ==========================================================
  const tiltableCards = document.querySelectorAll('.about-card, .project-card, .soundcloud-card, .avatar-box, .contact-card');
  
  if (window.innerWidth > 992) {
    tiltableCards.forEach(card => {
      card.classList.add('tilt-card');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  // ==========================================================
  // --- 13. Smooth Scroll Reveal Animation ---
  // ==========================================================
  const revealElements = document.querySelectorAll('.section-header, .about-card, .soundcloud-card, .project-card, .stat-item, .timeline-item, .contact-card');
  
  revealElements.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => revealObserver.observe(el));

  // ==========================================================
  // --- 14. Cinematic Welcome Screen Logic ---
  // ==========================================================
  const welcomeScreen = document.getElementById('welcomeScreen');
  const enterSiteBtn = document.getElementById('enterSiteBtn');
  const welcomeProgressFill = document.getElementById('welcomeProgressFill');
  const welcomeStatusText = document.getElementById('welcomeStatusText');

  if (welcomeScreen && enterSiteBtn) {
    let progress = 0;
    const loadInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 7) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(loadInterval);
        if (welcomeStatusText) {
          welcomeStatusText.innerHTML = `Sẵn sàng quẩy cùng DJ Vchun! <span>100%</span>`;
        }
      } else if (progress > 55 && welcomeStatusText) {
        welcomeStatusText.innerHTML = `Đang kết nối beat Vinahouse & Houselak... <span>${progress}%</span>`;
      } else if (welcomeStatusText) {
        welcomeStatusText.innerHTML = `Đang tải hệ thống âm thanh & code... <span>${progress}%</span>`;
      }

      if (welcomeProgressFill) {
        welcomeProgressFill.style.width = `${progress}%`;
      }
    }, 45);

    // Audio SFX on entering website
    function playWelcomeSound() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Futuristic cyber riser & sub drop
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } catch (err) {
        // AudioContext may be restricted by browser policy
      }
    }

    function dismissWelcomeScreen() {
      playWelcomeSound();
      welcomeScreen.classList.add('hide-welcome');

      setTimeout(() => {
        welcomeScreen.style.display = 'none';
      }, 850);
    }

    enterSiteBtn.addEventListener('click', dismissWelcomeScreen);
  }

});
