gsap.registerPlugin(SplitText);

gsap.config({
    force3D: true,
    nullTargetWarn: false
});

document.addEventListener("DOMContentLoaded", () => {
    const profileImagesContainer = document.querySelector(".profile-images");
    const profileImages = document.querySelectorAll(".profile-images .img");
    const nameElements = document.querySelectorAll(".profile-names .name");
    const nameHeadings = document.querySelectorAll(".profile-names .name h1");

    // Auto-scale
    function scaleTextToFit() {
        const containerWidth = window.innerWidth * 0.95;
        nameHeadings.forEach((heading) => {
            heading.style.transform = "scale(1)";
            const textWidth = heading.scrollWidth;
            if (textWidth > containerWidth) {
                const scale = containerWidth / textWidth;
                heading.style.transform = `scale(${scale})`;
            }
        });
    }
    
    scaleTextToFit();
    window.addEventListener("resize", scaleTextToFit);

    // Split text
    nameHeadings.forEach((heading) => {
        const split = new SplitText(heading, { type: "chars" });
        split.chars.forEach((char) => {
            char.classList.add("letter");
        });
    });

    const defaultLetters = nameElements[0].querySelectorAll(".letter");

    // Initial states
    gsap.set(defaultLetters, { yPercent: 0, opacity: 1 });

    nameElements.forEach((name, index) => {
        if (index > 0) {
            const letters = name.querySelectorAll(".letter");
            gsap.set(letters, { yPercent: 100, opacity: 0 });
        }
    });

    let currentNameLetters = defaultLetters;
    let currentActiveImage = null;
    let isAnimating = false;  // ⬅️ Prevent spam clicking

    function isTouchDevice() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    }

    // ===== SMOOTH ANIMATION FUNCTIONS =====
    
    function showName(letters, img) {
        if (currentNameLetters === letters || isAnimating) return;
        
        isAnimating = true;

        // Create a timeline for synchronized animation
        const tl = gsap.timeline({
            onComplete: () => { isAnimating = false; }
        });

        // Exit current - SMOOTH fade up
        tl.to(currentNameLetters, {
            yPercent: -80,      // ⬅️ Less distance = smoother
            opacity: 0,
            duration: 0.4,      // ⬅️ Slightly faster
            stagger: {
                each: 0.015,    // ⬅️ Faster stagger
                from: "center"
            },
            ease: "power2.inOut"  // ⬅️ Smoother easing
        }, 0);

        // Enter new - starts slightly before exit finishes
        tl.fromTo(letters, 
            { yPercent: 80, opacity: 0 },  // ⬅️ Less distance
            {
                yPercent: 0,
                opacity: 1,
                duration: 0.5,
                stagger: {
                    each: 0.02,
                    from: "center"
                },
                ease: "power2.out"  // ⬅️ Smooth landing
            }, 
            0.15  // ⬅️ Overlap animations
        );

        // Image animation - with subtle scale
        if (img) {
            gsap.to(profileImages, {
                width: 70,
                height: 70,
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
            });

            gsap.to(img, {
                width: 130,      // ⬅️ Slightly smaller max
                height: 130,
                scale: 1.05,     // ⬅️ Add subtle scale
                duration: 0.4,
                ease: "back.out(1.2)"  // ⬅️ Slight bounce
            });
        }

        currentNameLetters = letters;
        currentActiveImage = img;
    }

    function resetToDefault() {
        if (currentNameLetters === defaultLetters || isAnimating) return;
        
        isAnimating = true;

        const tl = gsap.timeline({
            onComplete: () => { isAnimating = false; }
        });

        // Exit down
        tl.to(currentNameLetters, {
            yPercent: 80,
            opacity: 0,
            duration: 0.4,
            stagger: { each: 0.015, from: "center" },
            ease: "power2.inOut"
        }, 0);

        // Enter default
        tl.fromTo(defaultLetters,
            { yPercent: -80, opacity: 0 },
            {
                yPercent: 0,
                opacity: 1,
                duration: 0.5,
                stagger: { each: 0.02, from: "center" },
                ease: "power2.out"
            }, 
            0.15
        );

        // Reset images
        tl.to(profileImages, {
            width: 70,
            height: 70,
            scale: 1,
            duration: 0.4,
            ease: "power2.out"
        }, 0);

        currentNameLetters = defaultLetters;
        currentActiveImage = null;
    }

    // Desktop
    if (window.innerWidth >= 900 && !isTouchDevice()) {
        profileImages.forEach((img, index) => {
            const correspondingName = nameElements[index + 1];
            const letters = correspondingName.querySelectorAll(".letter");

            img.addEventListener("mouseenter", () => showName(letters, img));
            img.addEventListener("mouseleave", () => {
                gsap.to(img, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });

        profileImagesContainer.addEventListener("mouseleave", resetToDefault);
    }

    // Mobile
    if (window.innerWidth < 900 || isTouchDevice()) {
        profileImages.forEach((img, index) => {
            const correspondingName = nameElements[index + 1];
            const letters = correspondingName.querySelectorAll(".letter");

            img.addEventListener("click", (e) => {
                e.stopPropagation();
                if (currentActiveImage === img) {
                    resetToDefault();
                } else {
                    showName(letters, img);
                }
            });
        });

        document.addEventListener("click", (e) => {
            if (!profileImagesContainer.contains(e.target) && currentActiveImage) {
                resetToDefault();
            }
        });
    }
});
