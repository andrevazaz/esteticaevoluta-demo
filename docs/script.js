// Utility functions
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
};

// Carousel functionality
let currentSlideIndex = 0;
const totalSlides = 5;
let autoSlideInterval;

const getCardWidth = () => {
    // Calcola dinamicamente la larghezza in base al viewport
    const cardElement = document.querySelector('.cert-card');
    if (!cardElement) return 370; // fallback
    
    const computedStyle = window.getComputedStyle(cardElement);
    const cardWidth = cardElement.offsetWidth;
    const marginRight = parseInt(computedStyle.marginRight) || 0;
    const gap = window.innerWidth <= 480 ? 30 : 50; // gap dal CSS
    
    return cardWidth + gap;
};

const updateCarousel = () => {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    const cardWidth = getCardWidth();
    const containerWidth = track.parentElement.offsetWidth;
    const cardElementWidth = document.querySelector('.cert-card')?.offsetWidth || 320;
    const centerOffset = (containerWidth - cardElementWidth) / 2;
    
    track.style.transform = `translateX(${-(currentSlideIndex * cardWidth) + centerOffset}px)`;
    
    // Update active states
    document.querySelectorAll('.cert-card').forEach((card, i) => {
        card.classList.toggle('active', i === currentSlideIndex);
    });
    
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentSlideIndex);
    });
};

const goToSlide = (direction) => {
    if (typeof direction === 'number') {
        currentSlideIndex = direction;
    } else {
        currentSlideIndex = direction === 'next' 
            ? (currentSlideIndex + 1) % totalSlides
            : (currentSlideIndex - 1 + totalSlides) % totalSlides;
    }
    updateCarousel();
    toggleAutoSlide('restart');
};

const toggleAutoSlide = (action = 'start') => {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
    if (action === 'start' || action === 'restart') {
        autoSlideInterval = setInterval(() => goToSlide('next'), 4000);
    }
};

const createDots = () => {
    const dotsContainer = document.getElementById('carouselDots');
    if (!dotsContainer) return;
    
    // Pulisce eventuali dots esistenti
    dotsContainer.innerHTML = '';
    
    for(let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('span');
        dot.className = i === 0 ? 'dot active' : 'dot';
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
    }
};

// Animation functions
const isElementInViewport = (el) => {
    const rect = el.getBoundingClientRect();
    const threshold = window.innerHeight * 0.1; // 10% threshold for better mobile experience
    return rect.top <= (window.innerHeight - threshold) && rect.bottom >= threshold;
};

const handleScrollAnimations = () => {
    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
        if (isElementInViewport(el)) {
            el.classList.add('visible');
        }
    });
};

// Smooth scrolling with offset for sticky header
const initSmoothScrolling = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
};

// Service cards hover effect - ottimizzato per touch devices
const initServiceCards = () => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    document.querySelectorAll('.service-card').forEach(card => {
        if (!isTouchDevice) {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        } else {
            // Per dispositivi touch, usa un tap effect più leggero
            card.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            card.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        }
    });
};

// Button ripple effect ottimizzato
const initButtonEffects = () => {
    document.querySelectorAll('.btn-primary').forEach(button => {
        button.addEventListener('click', function(e) {
            // Previeni multipli ripple effects
            const existingRipple = this.querySelector('.ripple-effect');
            if (existingRipple) existingRipple.remove();
            
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            Object.assign(ripple.style, {
                position: 'absolute',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.3)',
                transform: 'scale(0)',
                animation: 'ripple 0.6s linear',
                left: `${x}px`,
                top: `${y}px`,
                width: `${size}px`,
                height: `${size}px`,
                pointerEvents: 'none'
            });
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
};

// Ottimizzazione delle performance per il carousel
const optimizeCarouselPerformance = () => {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    // Usa transform3d per l'accelerazione hardware
    track.style.backfaceVisibility = 'hidden';
    track.style.perspective = '1000px';
    
    // Preload delle immagini se presenti
    document.querySelectorAll('.cert-card img').forEach(img => {
        if (img.loading !== 'lazy') {
            img.loading = 'eager';
        }
    });
};

// Gestione dell'orientamento per dispositivi mobili
const handleOrientationChange = () => {
    setTimeout(() => {
        updateCarousel();
        handleScrollAnimations();
    }, 100); // Piccolo delay per permettere il reflow del layout
};

// CSS Animation per il ripple effect
const addRippleAnimation = () => {
    if (!document.getElementById('ripple-keyframes')) {
        const style = document.createElement('style');
        style.id = 'ripple-keyframes';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
};

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    createDots();
    updateCarousel();
    optimizeCarouselPerformance();
    toggleAutoSlide();
    addRippleAnimation();
    
    // Pause auto-slide on hover/touch
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => toggleAutoSlide('stop'));
        carouselContainer.addEventListener('mouseleave', () => toggleAutoSlide('start'));
        
        // Touch events per mobile
        carouselContainer.addEventListener('touchstart', () => toggleAutoSlide('stop'));
        carouselContainer.addEventListener('touchend', () => {
            setTimeout(() => toggleAutoSlide('start'), 3000); // Riavvia dopo 3 secondi
        });
    }
    
    initSmoothScrolling();
    initServiceCards();
    initButtonEffects();
    handleScrollAnimations();
});

// Event listeners with improved debouncing
window.addEventListener('load', handleScrollAnimations);
window.addEventListener('scroll', debounce(handleScrollAnimations, 10), { passive: true });
window.addEventListener('resize', debounce(() => {
    handleScrollAnimations();
    updateCarousel();
}, 150));

// Gestione cambio orientamento per mobile
window.addEventListener('orientationchange', debounce(handleOrientationChange, 200));

// Intersection Observer per performance migliori sulle animazioni
if ('IntersectionObserver' in window) {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -10% 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);
    
    // Osserva tutti gli elementi fade-in dopo il caricamento
    window.addEventListener('load', () => {
        document.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    });
}

// Navbar responsive toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links'); // Select by class

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Chiudi menu al click su link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}
