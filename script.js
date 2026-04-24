document.addEventListener("DOMContentLoaded", function() {
  
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

  // --- 2. BANNER PRINCIPAL (COM BOLINHAS E BOTÕES) ---
  const slides = document.querySelectorAll('.tm-slide');
  const dotsContainer = document.querySelector('.tm-slider-dots');
  const nextBtn = document.querySelector('.tm-next');
  const prevBtn = document.querySelector('.tm-prev');
  
  if (slides.length > 0) {
    let current = 0;
    let timer;

    // Criar as bolinhas dinamicamente se o container existir
    if (dotsContainer) {
      dotsContainer.innerHTML = ''; // Limpa antes de criar
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
  }

  // --- 3. CARROSSEL DE LANÇAMENTOS (AUTO-SCROLL INFINITO E SETAS) ---
  const carousel = document.querySelector(".tm-carousel-container");
  if (carousel) {
    const originalCards = Array.from(carousel.children);

    // 1. Clona os cards para o final e para o início (Cria a ilusão de infinito)
    originalCards.forEach(card => {
      carousel.appendChild(card.cloneNode(true));
    });
    // Inverte a ordem para prepender e manter a sequência correta
    originalCards.slice().reverse().forEach(card => {
      carousel.prepend(card.cloneNode(true));
    });

    // 2. Ajusta o scroll inicial para o primeiro item REAL (que agora está no meio da lista)
    setTimeout(() => {
      carousel.style.scrollBehavior = "auto"; // Desliga a animação de rolagem temporariamente
      // O primeiro card real agora está na posição `originalCards.length`
      const firstRealCard = carousel.children[originalCards.length];
      
      // Calcula a posição para centralizar ele na tela
      const centerPos = firstRealCard.offsetLeft - (carousel.clientWidth / 2) + (firstRealCard.clientWidth / 2);
      carousel.scrollLeft = centerPos;
      
      carousel.style.scrollBehavior = "smooth"; // Liga a animação de volta
    }, 100);

    // 3. Função do Teletransporte Invisível
    let scrollTimer;
    carousel.addEventListener("scroll", () => {
      clearTimeout(scrollTimer);
      
      // Aguarda 150ms depois que a pessoa parou de rolar para fazer o cálculo
      scrollTimer = setTimeout(() => {
        // Calcula a largura exata de um bloco inteiro de produtos originais
        const jumpDistance = carousel.children[originalCards.length].offsetLeft - carousel.children[0].offsetLeft;
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;

        // Se rolou tudo pra esquerda, joga pro bloco do meio silenciosamente
        if (carousel.scrollLeft <= 10) {
          carousel.style.scrollBehavior = "auto";
          carousel.scrollLeft += jumpDistance;
          carousel.style.scrollBehavior = "smooth";
        }
        // Se rolou tudo pra direita, joga pro bloco do meio silenciosamente
        else if (carousel.scrollLeft >= maxScroll - 10) {
          carousel.style.scrollBehavior = "auto";
          carousel.scrollLeft -= jumpDistance;
          carousel.style.scrollBehavior = "smooth";
        }
      }, 150); 
    });

    // 4. Calcula quanto rolar por vez (1 card + espaço)
    function getScrollAmount() {
      const cardWidth = carousel.children[0].clientWidth;
      const gap = parseInt(window.getComputedStyle(carousel).gap) || 0;
      return cardWidth + gap;
    }

    // 5. Auto-play Contínuo
    let isAutoPlay = true;
    setInterval(() => {
      if (isAutoPlay) {
        carousel.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
      }
    }, 3000);

    // Pausa o auto-play se o usuário encostar o dedo na tela (para não brigar com ele)
    carousel.addEventListener("touchstart", () => isAutoPlay = false, {passive: true});
    carousel.addEventListener("touchend", () => {
      setTimeout(() => isAutoPlay = true, 4000); // Volta a rodar 4s depois de soltar
    });

    // 6. Ativa as setas laterais do Computador
    const leftArrow = document.querySelector(".tm-arrow.left");
    const rightArrow = document.querySelector(".tm-arrow.right");

    if (leftArrow) {
      leftArrow.addEventListener("click", () => {
        carousel.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        isAutoPlay = false; // Pausa o automático
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

// --- FILTRO DE PRODUTOS REVISADO (VERSÃO FINAL) ---
(function() {
  const linksFiltro = document.querySelectorAll('[data-filter]');
  const cardsProdutos = document.querySelectorAll('.tm-plp-card');

  console.log("Filtro inicializado. Links encontrados:", linksFiltro.length); // Verifique no F12 se aparece

  linksFiltro.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const categoriaAlvo = this.getAttribute('data-filter');
      
      console.log("Filtrando por:", categoriaAlvo);

      cardsProdutos.forEach(card => {
        const categoriaCard = card.getAttribute('data-category');
        
        if (categoriaAlvo === 'all' || categoriaCard === categoriaAlvo) {
          card.style.setProperty('display', 'flex', 'important');
        } else {
          card.style.setProperty('display', 'none', 'important');
        }
      });

      // Feedback visual (Estilo Toolmix)
      linksFiltro.forEach(l => l.style.color = '#575756');
      this.style.color = '#F26522';
    });
  });
})();

  // --- 4. CARROSSEL MOSAICO MOBILE ---
  const mosaicoSlider = document.getElementById('tm-cards-mobile');
  if (mosaicoSlider) {
    const mosaicoSlides = mosaicoSlider.querySelectorAll('.tm-card-slide');
    const mosaicoDotsContainer = document.getElementById('tm-cards-dots');
    let mosaicoCurrent = 0;

    // Cria as bolinhas do mosaico
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
  }
  // --- 5. REPOSICIONAR MINIATURAS DA PÁGINA DE PRODUTO (MOBILE) ---
  if (window.innerWidth <= 768) {
    // Busca a imagem principal (ou carrossel) e a caixa de miniaturas
    const imagemPrincipal = document.querySelector('.pdp-carrossel') || document.querySelector('.pdp-imagem-produto');
    const miniaturas = document.querySelector('.pdp-miniaturas');
    
    if (imagemPrincipal && miniaturas) {
      // Move as miniaturas fisicamente no HTML para logo após a imagem principal
      imagemPrincipal.parentNode.insertBefore(miniaturas, imagemPrincipal.nextSibling);
      
      // Ajusta o espaçamento para alinhar com o design
      miniaturas.style.marginTop = "15px";
      miniaturas.style.marginBottom = "30px";
    }
  }
});

