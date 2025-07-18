function toggleMode() {
    const elements = document.querySelectorAll(`
      body,
      .header .nav.scrolled,
      .slide-1,
      .slide-2,
      .slide-3,
      .slide-4,
      .slide-open,
      .main,
      .event,
      .about,
      .text-box,
      .crew,
      .crew h1,
      .navbar,
      .nav-item,
      .hero-container,
      .christmas-theme
    `);
  
    const isLightMode = document.body.classList.contains('light-mode');
  
    elements.forEach(el => {
      el.classList.toggle('light-mode');
      el.classList.toggle('dark-mode');
    });
  
    // Update button text
    const modeBtn = document.querySelector('.secondary-btn');
    modeBtn.textContent = isLightMode ? 'Light Mode' : 'Dark Mode';
  
    // Save theme
    localStorage.setItem('theme', isLightMode ? 'dark' : 'light');
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    // Set dark mode as default if no theme is saved in localStorage
    const savedMode = localStorage.getItem('theme') || 'dark';
  
    const elements = document.querySelectorAll(`
      body,
      .header .nav.scrolled,
      .slide-1,
      .slide-2,
      .slide-3,
      .slide-4,
      .slide-open,
      .main,
      .event,
      .about,
      .text-box,
      .crew,
      .crew h1,
      .navbar,
      .nav-item,
      .hero-container,
      .christmas-theme
    `);
  
    elements.forEach(el => {
      el.classList.add(savedMode + '-mode');
    });
  
    // Set correct button text on load
    const modeBtn = document.querySelector('.secondary-btn');
    if (modeBtn) {
      modeBtn.textContent = savedMode === 'light' ? 'Dark Mode' : 'Light Mode';
    }
  });
  