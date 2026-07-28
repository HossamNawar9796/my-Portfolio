/**
 * SENIOR PORTFOLIO - CORE LOGIC
 * Architecture: Modular Vanilla JS
 * No external dependencies.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initCustomCursor();
    initScrollAnimations();
    initScrollSpy();
    initMobileMenu();
    initCounters();
    initTestimonialSlider();
});

/* ==========================================
   1. THEME SWITCHER (Dark/Light)
   ========================================== */
function initTheme() {
    const themeBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    
    // Check LocalStorage or System Preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        htmlElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
    }

    themeBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Prevent flickering with a smooth transition class if needed
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

/* ==========================================
   2. CUSTOM CURSOR
   ========================================== */
function initCustomCursor() {
    // Disable on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant cursor
        cursor.style.left = `${mouseX}px`;
        cursor.style.top = `${mouseY}px`;
    });

    // Smooth follower using requestAnimationFrame
    function animateFollower() {
        // Ease the follower towards the mouse
        followerX += (mouseX - followerX) * 0.15;
        followerY += (mouseY - followerY) * 0.15;
        
        follower.style.left = `${followerX}px`;
        follower.style.top = `${followerY}px`;
        
        requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Hover effects on interactables
    const interactables = document.querySelectorAll('a, button, .hover-tilt');
    interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
            follower.style.width = '50px';
            follower.style.height = '50px';
            follower.style.backgroundColor = 'rgba(0, 194, 255, 0.1)';
        });
        el.addEventListener('mouseleave', () => {
            follower.style.width = '30px';
            follower.style.height = '30px';
            follower.style.backgroundColor = 'transparent';
        });
    });
}

/* ==========================================
   3. SCROLL REVEAL ANIMATIONS
   ========================================== */
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    const progressFills = document.querySelectorAll('.progress-fill');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // If it's the skills section, animate bars
                if (entry.target.id === 'about' || entry.target.querySelector('.skill-bar')) {
                    progressFills.forEach(bar => {
                        bar.style.width = bar.getAttribute('style').match(/--width:\s*([^;]+)/)[1];
                    });
                }
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    reveals.forEach(reveal => revealObserver.observe(reveal));
}

/* ==========================================
   4. SCROLL SPY (Active Nav Link)
   ========================================== */
function initScrollSpy() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.5 // Trigger when section is 50% visible
    });

    sections.forEach(sec => spyObserver.observe(sec));
}

/* ==========================================
   5. MOBILE MENU TOGGLE
   ========================================== */
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const navLinks = document.querySelectorAll('.nav-link');

    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        // Animate hamburger to X
        const spans = menuBtn.querySelectorAll('span');
        if (sidebar.classList.contains('open')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
                const spans = menuBtn.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    });
}

/* ==========================================
   6. ANIMATED COUNTERS
   ========================================== */
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // Lower is slower

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +counter.innerText;
                    const inc = target / speed;

                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 20);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCount();
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
}

/* ==========================================
   7. SIMPLE AUTO-SLIDER (Feedbacks)
   ========================================== */
function initTestimonialSlider() {
    const track = document.getElementById('testimonial-slider');
    if (!track) return;
    
    // Basic auto scroll logic for wide cards
    // In a real environment with more cards, we'd clone nodes for infinite scroll.
    // Here we just alternate transform to show the idea.
    let isToggled = false;
    
    setInterval(() => {
        if(window.innerWidth > 768) {
             // On desktop if there's enough room, we might not need sliding depending on card count.
             // But let's assume we slide left.
             track.style.transform = isToggled ? 'translateX(0)' : 'translateX(calc(-50% - 1rem))';
             isToggled = !isToggled;
        } else {
             // On mobile, card is 100% width
             track.style.transform = isToggled ? 'translateX(0)' : 'translateX(calc(-100% - 2rem))';
             isToggled = !isToggled;
        }
    }, 5000); // Swap every 5 seconds
}