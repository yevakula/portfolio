/**
 * Portfolio Site - Minimal JavaScript
 * Only handles mobile menu toggle
 */

(function() {
  'use strict';

  // Header shadow on scroll
  const header = document.querySelector('.header');
  
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 10) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    });
  }


  // Mobile menu toggle
  const burger = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');

  if (burger && nav) {
    burger.addEventListener('click', function() {
      const isExpanded = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', !isExpanded);
      nav.classList.toggle('is-open');
    });

    // Close menu when clicking on a link
    nav.querySelectorAll('.header__link').forEach(function(link) {
      link.addEventListener('click', function() {
        burger.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!nav.contains(e.target) && !burger.contains(e.target) && nav.classList.contains('is-open')) {
        burger.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  // Smooth scroll for anchor links (fallback for browsers without CSS scroll-behavior)
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Process section toggle (mobile only)
  const processCards = document.querySelector('.process__cards');
  const processToggle = document.querySelector('.process__toggle');

  if (processCards && processToggle) {
    processToggle.addEventListener('click', function() {
      const isCollapsed = processCards.classList.contains('is-collapsed');
      
      if (isCollapsed) {
        processCards.classList.remove('is-collapsed');
        processToggle.setAttribute('aria-expanded', 'true');
      } else {
        processCards.classList.add('is-collapsed');
        processToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Before/After Slider
  document.querySelectorAll('.ba-slider').forEach(function(slider) {
    var range = slider.querySelector('.ba-slider__range');
    var labelBefore = slider.querySelector('.ba-slider__label--before');
    var labelAfter = slider.querySelector('.ba-slider__label--after');

    function updateLabels(value) {
      if (labelBefore) labelBefore.style.opacity = value <= 5 ? '0' : '1';
      if (labelAfter) labelAfter.style.opacity = value >= 95 ? '0' : '1';
    }

    if (range) {
      updateLabels(Number(range.value));
      range.addEventListener('input', function() {
        var v = Number(this.value);
        slider.style.setProperty('--position', v + '%');
        updateLabels(v);
      });
    }
  });

  // Image Modal with Zoom and Pan
  const imageModal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImg');
  const modalContent = document.querySelector('.image-modal__content');
  const closeBtn = document.querySelector('.image-modal__close');
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const prevBtn = document.getElementById('modalPrev');
  const nextBtn = document.getElementById('modalNext');

  if (imageModal && modalImg) {
    const zoomLevels = [1, 1.5, 2, 2.5, 3];
    let currentZoomIndex = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let translateX = 0;
    let translateY = 0;

    // Get all clickable images on the page
    const clickableImages = Array.from(document.querySelectorAll('.case-flow-image, .case-image-frame__img'));
    let currentImageIndex = 0;

    // Calculate max dimensions for fixed modal size
    let maxWidth = 0;
    let maxHeight = 0;
    let dimensionsCalculated = false;

    function calculateMaxDimensions() {
      const totalImages = clickableImages.length;
      if (totalImages === 0) return;

      let loadedCount = 0;

      function checkAllLoaded() {
        if (loadedCount === totalImages && !dimensionsCalculated) {
          dimensionsCalculated = true;
          applyFixedSize();
        }
      }

      clickableImages.forEach(function(img) {
        if (img.complete && img.naturalWidth) {
          if (img.naturalWidth > maxWidth) maxWidth = img.naturalWidth;
          if (img.naturalHeight > maxHeight) maxHeight = img.naturalHeight;
          loadedCount++;
          checkAllLoaded();
        } else {
          img.addEventListener('load', function() {
            if (img.naturalWidth > maxWidth) maxWidth = img.naturalWidth;
            if (img.naturalHeight > maxHeight) maxHeight = img.naturalHeight;
            loadedCount++;
            checkAllLoaded();
          });
        }
      });
    }

    function applyFixedSize() {
      if (modalContent && maxWidth > 0 && maxHeight > 0) {
        // Limit to viewport constraints
        const maxViewportWidth = window.innerWidth * 0.9;
        const maxViewportHeight = window.innerHeight * 0.8;
        
        // Calculate scale to fit within viewport while maintaining aspect ratio
        const scaleX = maxViewportWidth / maxWidth;
        const scaleY = maxViewportHeight / maxHeight;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
        
        const finalWidth = Math.round(maxWidth * scale);
        const finalHeight = Math.round(maxHeight * scale);
        
        modalContent.style.width = finalWidth + 'px';
        modalContent.style.height = finalHeight + 'px';
      }
    }

    // Recalculate on window resize
    window.addEventListener('resize', function() {
      if (dimensionsCalculated) {
        applyFixedSize();
      }
    });

    calculateMaxDimensions();

    // Open modal when clicking on an image
    clickableImages.forEach(function(img, index) {
      img.addEventListener('click', function() {
        currentImageIndex = index;
        showImage(currentImageIndex);
        openModal();
      });
    });

    function showImage(index) {
      const img = clickableImages[index];
      if (img) {
        modalImg.src = img.src;
        modalImg.alt = img.alt || '';
        resetZoom();
      }
    }

    function openModal() {
      imageModal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      imageModal.classList.remove('is-open');
      document.body.style.overflow = '';
      resetZoom();
    }

    function resetZoom() {
      currentZoomIndex = 0;
      translateX = 0;
      translateY = 0;
      updateZoom();
    }

    function updateZoom() {
      const scale = zoomLevels[currentZoomIndex];
      modalImg.style.transform = 'scale(' + scale + ') translate(' + (translateX / scale) + 'px, ' + (translateY / scale) + 'px)';
      
      if (scale > 1) {
        modalImg.classList.add('is-zoomed');
      } else {
        modalImg.classList.remove('is-zoomed');
        translateX = 0;
        translateY = 0;
      }

      // Update button states
      if (zoomInBtn) zoomInBtn.disabled = currentZoomIndex >= zoomLevels.length - 1;
      if (zoomOutBtn) zoomOutBtn.disabled = currentZoomIndex <= 0;
    }

    // Navigation functions
    function showPrevImage() {
      currentImageIndex--;
      if (currentImageIndex < 0) {
        currentImageIndex = clickableImages.length - 1;
      }
      showImage(currentImageIndex);
    }

    function showNextImage() {
      currentImageIndex++;
      if (currentImageIndex >= clickableImages.length) {
        currentImageIndex = 0;
      }
      showImage(currentImageIndex);
    }

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    // Navigation buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', showPrevImage);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', showNextImage);
    }

    // Zoom buttons
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', function() {
        if (currentZoomIndex < zoomLevels.length - 1) {
          currentZoomIndex++;
          updateZoom();
        }
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', function() {
        if (currentZoomIndex > 0) {
          currentZoomIndex--;
          updateZoom();
        }
      });
    }

    // Pan functionality
    modalImg.addEventListener('mousedown', function(e) {
      if (zoomLevels[currentZoomIndex] > 1) {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        modalImg.classList.add('is-dragging');
        e.preventDefault();
      }
    });

    document.addEventListener('mousemove', function(e) {
      if (isDragging) {
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateZoom();
      }
    });

    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        modalImg.classList.remove('is-dragging');
      }
    });

    // Touch support for mobile
    modalImg.addEventListener('touchstart', function(e) {
      if (zoomLevels[currentZoomIndex] > 1 && e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
        modalImg.classList.add('is-dragging');
      }
    });

    document.addEventListener('touchmove', function(e) {
      if (isDragging && e.touches.length === 1) {
        translateX = e.touches[0].clientX - startX;
        translateY = e.touches[0].clientY - startY;
        updateZoom();
      }
    });

    document.addEventListener('touchend', function() {
      if (isDragging) {
        isDragging = false;
        modalImg.classList.remove('is-dragging');
      }
    });

    // Close on background click
    imageModal.addEventListener('click', function(e) {
      if (e.target === imageModal) {
        closeModal();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (!imageModal.classList.contains('is-open')) return;

      switch (e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          showPrevImage();
          break;
        case 'ArrowRight':
          showNextImage();
          break;
        case '+':
        case '=':
          if (currentZoomIndex < zoomLevels.length - 1) {
            currentZoomIndex++;
            updateZoom();
          }
          break;
        case '-':
          if (currentZoomIndex > 0) {
            currentZoomIndex--;
            updateZoom();
          }
          break;
      }
    });
  }
})();
