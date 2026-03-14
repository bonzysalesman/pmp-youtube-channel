/**
 * PMP Mastery Framework - Premium Interactions
 * Handles scroll-reveals, glassmorphic navbar states, and micro-interactions.
 */

document.addEventListener('DOMContentLoaded', function () {
    // 1. Reveal on Scroll (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal-on-scroll');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 2. Navbar Glassmorphism & Shadow Toggle
    const navbar = document.getElementById('main-nav');

    function handleScroll() {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('nav-scrolled');
            } else {
                navbar.classList.remove('nav-scrolled');
            }
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // 3. Staggered Delay for Children
    const staggeredContainers = document.querySelectorAll('.stagger-reveal');
    staggeredContainers.forEach(container => {
        const children = container.children;
        Array.from(children).forEach((child, index) => {
            child.style.transitionDelay = `${index * 0.1}s`;
            child.classList.add('reveal-on-scroll');
            revealObserver.observe(child);
        });
    });

    // 4. Curriculum Phase Switcher
    const phaseButtons = document.querySelectorAll('.phase-trigger');
    const phaseColumns = document.querySelectorAll('.curriculum-column');

    phaseButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const targetPhase = this.getAttribute('data-phase');

            // Update buttons
            phaseButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Update columns
            phaseColumns.forEach(div => {
                if (div.getAttribute('data-phase') === targetPhase) {
                    div.style.display = 'flex';
                    // Re-trigger reveal for new content or ensure visibility
                    div.classList.add('is-visible');
                    div.style.opacity = '1';
                    div.style.transform = 'translateY(0)';
                } else {
                    div.style.display = 'none';
                }
            });
        });
    });

    // Initial state for switcher (ensure first column is visible)
    if (phaseColumns.length > 0) {
        phaseColumns.forEach((col, idx) => {
            if (idx === 0) {
                col.style.display = 'flex';
                col.classList.add('is-visible');
            } else {
                col.style.display = 'none';
            }
        });
    }
});
