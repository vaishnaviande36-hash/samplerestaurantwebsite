// ==========================================================================
// WISPHOT (విస్ఫోట) - Interactive Logic & Application State
// Top-tier Creative Agency Styled Vanilla JS
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // ------------------------------------------------------------------------
  // 1. Navigation & Scroll Effects
  // ------------------------------------------------------------------------
  const header = document.querySelector('header');
  const navLinks = document.querySelectorAll('.nav-link');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Active link highlighting on scroll
    let current = '';
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.pageYOffset >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.parentElement.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.parentElement.classList.add('active');
      }
    });
  });

  // Mobile Menu Toggle
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const mainNav = document.getElementById('main-nav');
  
  menuToggleBtn.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    const isOpened = mainNav.classList.contains('open');
    menuToggleBtn.innerHTML = isOpened 
      ? '<i class="fa-solid fa-xmark"></i>' 
      : '<i class="fa-solid fa-bars-staggered"></i>';
  });

  // Close mobile nav when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggleBtn.innerHTML = '<i class="fa-solid fa-bars-staggered"></i>';
    });
  });

  // ------------------------------------------------------------------------
  // 2. Local Cart State & Handlers
  // ------------------------------------------------------------------------
  let cart = [];
  let cartType = 'delivery'; // 'delivery' or 'takeaway'

  const cartDrawer = document.getElementById('cart-drawer');
  const openCartBtn = document.getElementById('open-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartBadge = document.getElementById('cart-badge-count');
  
  const cartEmptyState = document.getElementById('cart-empty-state');
  const cartItemsContainer = document.getElementById('cart-items-container');
  const cartFooterBox = document.getElementById('cart-footer-box');
  
  const subtotalEl = document.getElementById('cart-subtotal');
  const gstEl = document.getElementById('cart-gst');
  const totalEl = document.getElementById('cart-total');
  
  const checkoutBtn = document.getElementById('checkout-btn');
  const cartOptBtns = document.querySelectorAll('.cart-opt-btn');

  // Toggle Cart Drawer
  function openCart() {
    cartDrawer.classList.add('open');
  }
  
  function closeCart() {
    cartDrawer.classList.remove('open');
  }

  openCartBtn.addEventListener('click', openCart);
  closeCartBtn.addEventListener('click', closeCart);
  
  // Close drawer if clicking outside
  document.addEventListener('click', (e) => {
    if (!cartDrawer.contains(e.target) && 
        !openCartBtn.contains(e.target) && 
        !e.target.closest('.add-to-cart-btn') &&
        cartDrawer.classList.contains('open')) {
      closeCart();
    }
  });

  // Switch Delivery/Takeaway
  cartOptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cartOptBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cartType = btn.getAttribute('data-type');
    });
  });

  // Add Item to Cart
  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const card = button.closest('.menu-card');
      const id = button.getAttribute('data-id');
      const name = button.getAttribute('data-name');
      const price = parseInt(button.getAttribute('data-price'));
      const img = button.getAttribute('data-img');
      
      // Fetch selections if they exist
      const proteinChoice = card.querySelector('.item-protein-choice');
      const parathaChoice = card.querySelector('.item-paratha-choice');
      
      let finalId = id;
      let customizations = null;
      
      if (proteinChoice || parathaChoice) {
        customizations = {};
        let idParts = [id];
        
        if (proteinChoice) {
          customizations.protein = proteinChoice.value;
          idParts.push(proteinChoice.value.toLowerCase().replace(/\s+/g, '-'));
        }
        if (parathaChoice) {
          customizations.paratha = parathaChoice.value;
          idParts.push(parathaChoice.value.toLowerCase().replace(/\s+/g, '-'));
        }
        finalId = idParts.join('-');
      }
      
      addToCart(finalId, name, price, img, customizations);
      
      // Visual feedback on button
      const icon = button.querySelector('i');
      icon.className = 'fa-solid fa-check';
      setTimeout(() => {
        icon.className = 'fa-solid fa-plus';
      }, 1000);
      
      // Auto open cart drawer
      setTimeout(openCart, 300);
    });
  });

  function addToCart(id, name, price, img, customizations = null) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id, name, price, img, quantity: 1, customizations });
    }
    updateCartUI();
  }

  function updateQty(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
      item.quantity += change;
      if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
      }
    }
    updateCartUI();
  }

  function removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
  }

  function updateCartUI() {
    // 1. Badge count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    if (totalItems > 0) {
      cartBadge.classList.add('has-items');
    } else {
      cartBadge.classList.remove('has-items');
    }

    // 2. Empty/Populated State Toggle
    if (cart.length === 0) {
      cartEmptyState.style.display = 'flex';
      cartItemsContainer.style.display = 'none';
      cartFooterBox.style.display = 'none';
    } else {
      cartEmptyState.style.display = 'none';
      cartItemsContainer.style.display = 'block';
      cartFooterBox.style.display = 'block';
      
      // Inject items
      cartItemsContainer.innerHTML = cart.map(item => {
        const customText = item.customizations 
          ? Object.values(item.customizations).filter(Boolean).join(' | ') 
          : '';
        return `
          <div class="cart-item">
            <img src="${item.img}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
              <h4>${item.name}</h4>
              ${customText ? `<span class="cart-item-options">${customText}</span>` : ''}
              <p>₹${item.price}</p>
            </div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="adjustQty('${item.id}', -1)"><i class="fa-solid fa-minus"></i></button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="adjustQty('${item.id}', 1)"><i class="fa-solid fa-plus"></i></button>
            </div>
            <i class="fa-solid fa-trash-can remove-item-btn" onclick="deleteItem('${item.id}')"></i>
          </div>
        `;
      }).join('');
    }

    // 3. Totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + gst;
    
    subtotalEl.textContent = `₹${subtotal}`;
    gstEl.textContent = `₹${gst}`;
    totalEl.textContent = `₹${total}`;
  }

  // Global references for inline HTML onclick calls
  window.adjustQty = (id, change) => updateQty(id, change);
  window.deleteItem = (id) => removeItem(id);

  // Checkout Trigger
  checkoutBtn.addEventListener('click', () => {
    const totalAmount = totalEl.textContent;
    const itemsSummary = cart.map(item => {
      const custText = item.customizations 
        ? ` (${Object.values(item.customizations).filter(Boolean).join(', ')})`
        : '';
      return `- ${item.quantity}x ${item.name}${custText}`;
    }).join('\n');
    
    alert(`🎉 Order Placed Successfully!\n\nOrder Type: ${cartType.toUpperCase()}\n\nItems Ordered:\n${itemsSummary}\n\nTotal Bill: ${totalAmount}\n\nThank you for choosing Wisphot (విస్ఫోట). Your hot wraps are on the way!`);
    cart = [];
    updateCartUI();
    closeCart();
  });

  // ------------------------------------------------------------------------
  // 3. Menu Filtering
  // ------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuGroups = document.querySelectorAll('.menu-group');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Set active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-filter');
      
      menuGroups.forEach(group => {
        // Fade out
        group.style.opacity = '0';
        group.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
          if (filter === 'all' || group.getAttribute('data-category') === filter) {
            group.style.display = 'block';
            // Fade back in
            setTimeout(() => {
              group.style.opacity = '1';
              group.style.transform = 'translateY(0)';
            }, 50);
          } else {
            group.style.display = 'none';
          }
        }, 300);
      });
    });
  });

  // ------------------------------------------------------------------------
  // 4. Modal Table Booking Logic
  // ------------------------------------------------------------------------
  const bookingModal = document.getElementById('booking-modal-overlay');
  const openModalBtns = [
    document.getElementById('nav-book-btn'),
    document.getElementById('cta-book-btn')
  ];
  const closeModalBtn = document.getElementById('close-modal-btn');
  const bookingForm = document.getElementById('booking-form');
  const formContainer = document.getElementById('booking-form-container');
  const successState = document.getElementById('booking-success-state');

  // Set today's date as min value for booking date picker
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  function openModal() {
    bookingModal.classList.add('open');
    formContainer.style.display = 'block';
    successState.style.display = 'none';
    bookingForm.reset();
    
    // Clear error classes
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('error');
    });
  }

  function closeModal() {
    bookingModal.classList.remove('open');
  }

  openModalBtns.forEach(btn => {
    if (btn) btn.addEventListener('click', openModal);
  });
  
  closeModalBtn.addEventListener('click', closeModal);
  
  bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) closeModal();
  });

  // Booking Form Submission & Validation
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isValid = true;
    
    // Validate Name
    const nameInput = document.getElementById('booking-name');
    if (!nameInput.value.trim()) {
      showError(nameInput);
      isValid = false;
    } else {
      clearError(nameInput);
    }
    
    // Validate Phone (10 digits)
    const phoneInput = document.getElementById('booking-phone');
    const phoneRegex = /^[6-9]\d{9}$/; // Indian phone validation starting with 6-9
    if (!phoneRegex.test(phoneInput.value.trim())) {
      showError(phoneInput);
      isValid = false;
    } else {
      clearError(phoneInput);
    }
    
    // Validate Date
    if (!dateInput.value) {
      showError(dateInput);
      isValid = false;
    } else {
      clearError(dateInput);
    }
    
    // Validate Time
    const timeSelect = document.getElementById('booking-time');
    if (!timeSelect.value) {
      showError(timeSelect);
      isValid = false;
    } else {
      clearError(timeSelect);
    }
    
    if (isValid) {
      // Simulate API submit
      formContainer.style.display = 'none';
      successState.style.display = 'flex';
    }
  });

  function showError(input) {
    const group = input.closest('.form-group');
    group.classList.add('error');
  }

  function clearError(input) {
    const group = input.closest('.form-group');
    group.classList.remove('error');
  }

  // Interactive booking triggers from Hero/Footer order clicks
  const heroOrderBtn = document.getElementById('hero-order-btn');
  const ctaOrderBtn = document.getElementById('cta-order-btn');
  
  const scrollMenuAndOpenCart = () => {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
    setTimeout(openCart, 800);
  };
  
  if (heroOrderBtn) heroOrderBtn.addEventListener('click', scrollMenuAndOpenCart);
  if (ctaOrderBtn) ctaOrderBtn.addEventListener('click', scrollMenuAndOpenCart);

  // ------------------------------------------------------------------------
  // 5. Testimonial Slider / Carousel
  // ------------------------------------------------------------------------
  const slider = document.getElementById('reviews-slider');
  const dots = document.querySelectorAll('.carousel-dot');
  let currentSlide = 0;
  let slideInterval;

  function goToSlide(index) {
    currentSlide = index;
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(slideInterval);
      const index = parseInt(dot.getAttribute('data-index'));
      goToSlide(index);
      startAutoSlide();
    });
  });

  function startAutoSlide() {
    slideInterval = setInterval(() => {
      let next = (currentSlide + 1) % dots.length;
      goToSlide(next);
    }, 5000);
  }

  startAutoSlide();

  // ------------------------------------------------------------------------
  // 6. FAQ Accordion Interactivity
  // ------------------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other items
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-answer').style.maxHeight = null;
      });
      
      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ------------------------------------------------------------------------
  // 7. Scroll Reveal Effects using Intersection Observer
  // ------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -20px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });
});
