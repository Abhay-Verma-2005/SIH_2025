// JavaScript for animations
document.addEventListener('DOMContentLoaded', function() {
    const fadeInElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of the item must be visible to trigger the animation
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // When the element is intersecting with the viewport
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stop observing the element once the animation is triggered
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe each element with the .fade-in class
    fadeInElements.forEach(el => {
        observer.observe(el);
    });
});