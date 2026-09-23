const SHRINK_AT = 50; 
const NAV_SMALL_HEIGHT = 58;
const SCROLL_DURATION = 700;

const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navLinks = Array.from(document.querySelectorAll('.navbar__link'));
const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href')));


function updateNavbarSize() {
  navbar.classList.toggle('navbar--small', window.scrollY > SHRINK_AT);
}

function setActiveLink(index) {
  navLinks.forEach((link, i) => {
    const active = i === index;
    link.classList.toggle('is-active', active);
    if (active) {
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function updatePositionIndicator() {
  const scrollBottom = window.scrollY + window.innerHeight;
  const pageHeight = document.documentElement.scrollHeight;

  if (scrollBottom >= pageHeight - 2) {
    setActiveLink(sections.length - 1);
    return;
  }

  const navBottom = navbar.getBoundingClientRect().bottom;
  let current = 0;
  sections.forEach((section, i) => {
    if (section.getBoundingClientRect().top <= navBottom + 2) {
      current = i;
    }
  });
  setActiveLink(current);
}

function onScroll() {
  updateNavbarSize();
  updatePositionIndicator();
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', updatePositionIndicator);
navbar.addEventListener('transitionend', updatePositionIndicator);


function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothScrollTo(targetY) {
  const startY = window.scrollY;
  const maxY = document.documentElement.scrollHeight - window.innerHeight;
  const endY = Math.max(0, Math.min(targetY, maxY));
  const distance = endY - startY;
  let startTime = null;

  function step(timestamp) {
    if (startTime === null) {
      startTime = timestamp;
    }
    const progress = Math.min((timestamp - startTime) / SCROLL_DURATION, 1);
    window.scrollTo(0, startY + distance * easeInOutCubic(progress));
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }

  window.requestAnimationFrame(step);
}

function scrollToSection(section) {
  const offset = section.offsetTop > SHRINK_AT ? NAV_SMALL_HEIGHT : 0;
  smoothScrollTo(section.offsetTop - offset);
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) {
      return;
    }
    event.preventDefault();
    closeMobileMenu();
    scrollToSection(target);
  });
});


function closeMobileMenu() {
  navbar.classList.remove('navbar--open');
  navToggle.setAttribute('aria-expanded', 'false');
}

navToggle.addEventListener('click', () => {
  const open = navbar.classList.toggle('navbar--open');
  navToggle.setAttribute('aria-expanded', String(open));
});


function initCarousel(root) {
  const track = root.querySelector('.carousel__track');
  const slides = Array.from(root.querySelectorAll('.carousel__slide'));
  const dotsContainer = root.querySelector('.carousel__dots');
  let index = 0;

  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'carousel__dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
    return dot;
  });

  function goTo(newIndex) {
    // Wrap around at both ends
    index = (newIndex + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    slides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== index)));
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === index);
      dot.setAttribute('aria-selected', String(i === index));
    });
  }

  root.querySelector('.carousel__arrow--prev').addEventListener('click', () => goTo(index - 1));
  root.querySelector('.carousel__arrow--next').addEventListener('click', () => goTo(index + 1));
  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      goTo(index - 1);
    } else if (event.key === 'ArrowRight') {
      goTo(index + 1);
    }
  });

  goTo(0);
}

initCarousel(document.getElementById('carousel'));


let openModal = null;
let lastTrigger = null;

function showModal(modal, trigger) {
  openModal = modal;
  lastTrigger = trigger;
  modal.hidden = false;
  document.body.classList.add('no-scroll');
  modal.querySelector('.modal__close').focus();
}

function hideModal() {
  if (!openModal) {
    return;
  }
  openModal.hidden = true;
  openModal = null;
  document.body.classList.remove('no-scroll');
  if (lastTrigger) {
    lastTrigger.focus();
  }
}

document.querySelectorAll('[data-modal]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    showModal(document.getElementById(trigger.dataset.modal), trigger);
  });
});

document.querySelectorAll('.modal [data-close]').forEach((el) => {
  el.addEventListener('click', hideModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    hideModal();
  }
});

onScroll();
