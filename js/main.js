if (document.querySelector('.the-navbar')) {
    
    const toggleBtn = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    const iconOpen = document.getElementById('menu-icon-open');
    const iconClose = document.getElementById('menu-icon-close');

    toggleBtn.addEventListener('click', () => {
        menu.classList.toggle('hidden');
        iconOpen.classList.toggle('hidden');
        iconClose.classList.toggle('hidden');
    });

    // Optional: Close menu when a mobile link is clicked
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
        menu.classList.add('hidden');
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
        });
    });
}

// Hero Animation
if (document.querySelector('.the-hero')) {
    
    const quotes = [
        "Believe in yourself and all that you are. - Christian D. Larson",
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
      ];
  
      const quoteElement = document.getElementById("quote-text");
      let quoteIndex = 0;
  
      function updateQuote() {
        quoteElement.style.opacity = 0;
        setTimeout(() => {
          quoteElement.textContent = quotes[quoteIndex];
          quoteElement.style.opacity = 1;
          quoteIndex = (quoteIndex + 1) % quotes.length;
        }, 400);
      }
  
      setInterval(updateQuote, 3000);
      updateQuote(); // Initial call

}