document.addEventListener("DOMContentLoaded", function() {
  
  // ── HELPER GLOBAL DE SWIPE TOUCH ────────────────────────────────────────────
  function addSwipe(el, onLeft, onRight, threshold) {
    threshold = threshold || 50;
    var startX = 0, startY = 0, locked = false;
    el.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      locked = false;
    }, { passive: true });
    el.addEventListener('touchmove', function(e) {
      if (locked) return;
      var dx = e.touches[0].clientX - startX;
      var dy = e.touches[0].clientY - startY;
      // Se o movimento é mais vertical que horizontal, ignora (scroll de página)
      if (Math.abs(dy) > Math.abs(dx)) locked = true;
    }, { passive: true });
    el.addEventListener('touchend', function(e) {
      if (locked) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > threshold) {
        dx < 0 ? onLeft() : onRight();
      }
    }, { passive: true });
  }

  // --- 1. MENU LATERAL (MOBILE) ---
  const btnMenu = document.getElementById('btn-menu');
  const btnClose = document.getElementById('btn-close-menu');
  const sidebar = document.getElementById('sidebar-menu');
  const overlay = document.getElementById('menu-overlay');

  function toggleMenu() {
    if (sidebar && overlay) {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
      document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'auto';
    }
  }

  if (btnMenu && btnClose && overlay) {
    btnMenu.addEventListener('click', toggleMenu);
    btnClose.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
  }

  // --- 2. BANNER PRINCIPAL (COM BOLINHAS, BOTÕES E SWIPE) ---
  const slides = document.querySelectorAll('.tm-slide');
  const dotsContainer = document.querySelector('.tm-slider-dots');
  const nextBtn = document.querySelector('.tm-next');
  const prevBtn = document.querySelector('.tm-prev');
  
  if (slides.length > 0) {
    let current = 0;
    let timer;

    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
          showSlide(i);
          startAuto();
        });
        dotsContainer.appendChild(dot);
      });
    }

    function showSlide(index) {
      slides[current].classList.remove('active');
      const dots = dotsContainer ? dotsContainer.querySelectorAll('button') : [];
      if (dots[current]) dots[current].classList.remove('active');
      
      current = (index + slides.length) % slides.length;
      
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    }

    function startAuto() {
      clearInterval(timer);
      timer = setInterval(() => showSlide(current + 1), 5000);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { showSlide(current + 1); startAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { showSlide(current - 1); startAuto(); });

    showSlide(0);
    startAuto();

    // Swipe touch no banner principal
    const sliderEl = document.getElementById('tm-slider');
    if (sliderEl) {
      addSwipe(
        sliderEl,
        function() { showSlide(current + 1); startAuto(); },  // swipe esquerda → próximo
        function() { showSlide(current - 1); startAuto(); }   // swipe direita → anterior
      );
    }
  }

  // --- 3. CARROSSEL DE LANÇAMENTOS (AUTO-SCROLL INFINITO, SETAS E SWIPE) ---
  const carousel = document.querySelector(".tm-carousel-container");
  if (carousel) {
    const originalCards = Array.from(carousel.children);

    originalCards.forEach(card => {
      carousel.appendChild(card.cloneNode(true));
    });
    originalCards.slice().reverse().forEach(card => {
      carousel.prepend(card.cloneNode(true));
    });

    setTimeout(() => {
      carousel.style.scrollBehavior = "auto";
      const firstRealCard = carousel.children[originalCards.length];
      const centerPos = firstRealCard.offsetLeft - (carousel.clientWidth / 2) + (firstRealCard.clientWidth / 2);
      carousel.scrollLeft = centerPos;
      carousel.style.scrollBehavior = "smooth";
    }, 100);

    let scrollTimer;
    carousel.addEventListener("scroll", () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const jumpDistance = carousel.children[originalCards.length].offsetLeft - carousel.children[0].offsetLeft;
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        if (carousel.scrollLeft <= 10) {
          carousel.style.scrollBehavior = "auto";
          carousel.scrollLeft += jumpDistance;
          carousel.style.scrollBehavior = "smooth";
        } else if (carousel.scrollLeft >= maxScroll - 10) {
          carousel.style.scrollBehavior = "auto";
          carousel.scrollLeft -= jumpDistance;
          carousel.style.scrollBehavior = "smooth";
        }
      }, 150); 
    });

    function getScrollAmount() {
      const cardWidth = carousel.children[0].clientWidth;
      const gap = parseInt(window.getComputedStyle(carousel).gap) || 0;
      return cardWidth + gap;
    }

    let isAutoPlay = true;
    setInterval(() => {
      if (isAutoPlay) {
        carousel.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
      }
    }, 3000);

    // Swipe touch no carrossel de lançamentos
    addSwipe(
      carousel,
      function() { carousel.scrollBy({ left: getScrollAmount(), behavior: 'smooth' }); isAutoPlay = false; setTimeout(function(){ isAutoPlay = true; }, 4000); },
      function() { carousel.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' }); isAutoPlay = false; setTimeout(function(){ isAutoPlay = true; }, 4000); }
    );

    carousel.addEventListener("touchstart", () => isAutoPlay = false, {passive: true});
    carousel.addEventListener("touchend", () => {
      setTimeout(() => isAutoPlay = true, 4000);
    });

    const leftArrow = document.querySelector(".tm-arrow.left");
    const rightArrow = document.querySelector(".tm-arrow.right");

    if (leftArrow) {
      leftArrow.addEventListener("click", () => {
        carousel.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        isAutoPlay = false;
        setTimeout(() => isAutoPlay = true, 5000);
      });
    }
    if (rightArrow) {
      rightArrow.addEventListener("click", () => {
        carousel.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        isAutoPlay = false;
        setTimeout(() => isAutoPlay = true, 5000);
      });
    }
  }

  // --- FILTRO DE PRODUTOS ---
  (function() {
    const linksFiltro = document.querySelectorAll('[data-filter]');
    const cardsProdutos = document.querySelectorAll('.tm-plp-card');

    linksFiltro.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const categoriaAlvo = this.getAttribute('data-filter');

        cardsProdutos.forEach(card => {
          const categoriaCard = card.getAttribute('data-category');
          if (categoriaAlvo === 'all' || categoriaCard === categoriaAlvo) {
            card.style.setProperty('display', 'flex', 'important');
          } else {
            card.style.setProperty('display', 'none', 'important');
          }
        });

        linksFiltro.forEach(l => l.style.color = '#575756');
        this.style.color = '#F26522';
      });
    });
  })();

  // --- 4. CARROSSEL MOSAICO MOBILE (COM SWIPE) ---
  const mosaicoSlider = document.getElementById('tm-cards-mobile');
  if (mosaicoSlider) {
    const mosaicoSlides = mosaicoSlider.querySelectorAll('.tm-card-slide');
    const mosaicoDotsContainer = document.getElementById('tm-cards-dots');
    let mosaicoCurrent = 0;

    if (mosaicoDotsContainer) {
      mosaicoSlides.forEach((_, i) => {
        const dot = document.createElement('button');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => moverMosaico(i));
        mosaicoDotsContainer.appendChild(dot);
      });
    }

    function moverMosaico(index) {
      mosaicoSlides[mosaicoCurrent].classList.remove('active');
      const dots = mosaicoDotsContainer ? mosaicoDotsContainer.querySelectorAll('button') : [];
      if (dots[mosaicoCurrent]) dots[mosaicoCurrent].classList.remove('active');

      mosaicoCurrent = (index + mosaicoSlides.length) % mosaicoSlides.length;

      mosaicoSlides[mosaicoCurrent].classList.add('active');
      if (dots[mosaicoCurrent]) dots[mosaicoCurrent].classList.add('active');
    }

    setInterval(() => moverMosaico(mosaicoCurrent + 1), 3500);

    // Swipe touch no mosaico
    addSwipe(
      mosaicoSlider,
      function() { moverMosaico(mosaicoCurrent + 1); },
      function() { moverMosaico(mosaicoCurrent - 1); }
    );
  }

  // --- 5. REPOSICIONAR MINIATURAS DA PÁGINA DE PRODUTO (MOBILE) ---
  if (window.innerWidth <= 768) {
    const imagemPrincipal = document.querySelector('.pdp-carrossel') || document.querySelector('.pdp-imagem-produto');
    const miniaturas = document.querySelector('.pdp-miniaturas');
    
    if (imagemPrincipal && miniaturas) {
      imagemPrincipal.parentNode.insertBefore(miniaturas, imagemPrincipal.nextSibling);
      miniaturas.style.marginTop = "15px";
      miniaturas.style.marginBottom = "30px";
    }
  }

  // --- 6. SWIPE NAS FOTOS DO PRODUTO (PDP) ---
  (function() {
    var carrosselEl = document.querySelector('.pdp2-img-principal .pdp-carrossel-janela') ||
                      document.querySelector('.pdp2-img-principal');
    var setaEsq = document.querySelector('.pdp-carrossel-seta-esquerda');
    var setaDir = document.querySelector('.pdp-carrossel-seta-direita');

    if (carrosselEl && setaEsq && setaDir) {
      addSwipe(
        carrosselEl,
        function() { setaDir.click(); },  // swipe esquerda → próxima foto
        function() { setaEsq.click(); }   // swipe direita → foto anterior
      );
    }
  })();

});
