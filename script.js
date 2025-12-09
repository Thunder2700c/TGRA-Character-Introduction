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

    // ===== AUTO-SCALE LONG NAMES =====
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

    // ===== SPLIT TEXT INTO LETTERS =====
    nameHeadings.forEach((heading) => {
        const split = new SplitText(heading, { type: "chars" });
        split.chars.forEach((char) => {
            char.classList.add("letter");
        });
    });

    const defaultLetters = nameElements[0].querySelectorAll(".letter");

    // ===== INITIAL STATES =====
    gsap.set(defaultLetters, { 
        yPercent: 0,
        opacity: 1,
        force3D: true 
    });

    nameElements.forEach((name, index) => {
        if (index > 0) {
            const letters = name.querySelectorAll(".letter");
            gsap.set(letters, { 
                yPercent: 120,
                opacity: 0,
                force3D: true 
            });
        }
    });

    // ===== TRACK CURRENT STATE =====
    let currentNameLetters = defaultLetters;
    let currentActiveImage = null;  // Track which image is active (for mobile)

    // ===== DETECT DEVICE TYPE =====
    function isTouchDevice() {
        return ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    }

    // ===== ANIMATION FUNCTIONS (Reusable) =====
    
    // Show a specific name
    function showName(letters, img) {
        if (currentNameLetters === letters) return;

        // Exit current text
        gsap.to(currentNameLetters, {
            yPercent: -120,
            opacity: 0,
            duration: 0.5,
            stagger: { each: 0.02, from: "center" },
            ease: "power4.out",
            force3D: true
        });

        // Enter new text
        gsap.fromTo(letters, 
            { yPercent: 120, opacity: 0 },
            {
                yPercent: 0,
                opacity: 1,
                duration: 0.5,
                stagger: { each: 0.02, from: "center" },
                ease: "power4.out",
                force3D: true
            }
        );

        // Enlarge image
        if (img) {
            // First, reset all other images
            gsap.to(profileImages, {
                width: 70,
                height: 70,
                duration: 0.3,
                ease: "power4.out"
            });

            // Then enlarge the active one
            gsap.to(img, {
                width: 140,
                height: 140,
                duration: 0.5,
                ease: "power4.out"
            });
        }

        currentNameLetters = letters;
        currentActiveImage = img;
    }

    // Reset to default "The Squad"
    function resetToDefault() {
        if (currentNameLetters === defaultLetters) return;

        // Exit current text
        gsap.to(currentNameLetters, {
            yPercent: 120,
            opacity: 0,
            duration: 0.5,
            stagger: { each: 0.02, from: "center" },
            ease: "power4.out",
            force3D: true
        });

        // Enter default text
        gsap.fromTo(defaultLetters,
            { yPercent: -120, opacity: 0 },
            {
                yPercent: 0,
                opacity: 1,
                duration: 0.5,
                stagger: { each: 0.02, from: "center" },
                ease: "power4.out",
                force3D: true
            }
        );

        // Reset all images
        gsap.to(profileImages, {
            width: 70,
            height: 70,
            duration: 0.5,
            ease: "power4.out"
        });

        currentNameLetters = defaultLetters;
        currentActiveImage = null;
    }

    // Shrink single image (for desktop mouseleave)
    function shrinkImage(img) {
        gsap.to(img, {
            width: 70,
            height: 70,
            duration: 0.5,
            ease: "power4.out"
        });
    }

    // ===== DESKTOP INTERACTIONS (Mouse) =====
    if (window.innerWidth >= 900 && !isTouchDevice()) {
        
        profileImages.forEach((img, index) => {
            const correspondingName = nameElements[index + 1];
            const letters = correspondingName.querySelectorAll(".letter");

            img.addEventListener("mouseenter", () => {
                showName(letters, img);
            });

            img.addEventListener("mouseleave", () => {
                shrinkImage(img);
            });
        });

        profileImagesContainer.addEventListener("mouseleave", () => {
            resetToDefault();
        });
    }

    // ===== MOBILE INTERACTIONS (Touch/Click) =====
    if (window.innerWidth < 900 || isTouchDevice()) {
        
        profileImages.forEach((img, index) => {
            const correspondingName = nameElements[index + 1];
            const letters = correspondingName.querySelectorAll(".letter");

            // Use 'click' which works for both touch and mouse
            img.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent bubbling to document

                // If tapping the same image, toggle off (reset)
                if (currentActiveImage === img) {
                    resetToDefault();
                } else {
                    // Show this name
                    showName(letters, img);
                }
            });
        });

        // Tap anywhere outside images to reset
        document.addEventListener("click", (e) => {
            // Check if click is outside the profile images
            const isClickInsideImages = profileImagesContainer.contains(e.target);
            
            if (!isClickInsideImages && currentActiveImage !== null) {
                resetToDefault();
            }
        });

        // Also handle tap on the section background
        document.querySelector("section.team").addEventListener("click", (e) => {
            // Only reset if clicking directly on section (not on images)
            if (e.target.classList.contains("team") || 
                e.target.closest(".profile-names")) {
                resetToDefault();
            }
        });
    }

    // ===== HANDLE BOTH DESKTOP AND TOUCH ON SAME DEVICE =====
    // (For laptops with touchscreens)
    if (window.innerWidth >= 900 && isTouchDevice()) {
        
        profileImages.forEach((img, index) => {
            const correspondingName = nameElements[index + 1];
            const letters = correspondingName.querySelectorAll(".letter");

            // Touch events
            img.addEventListener("touchstart", (e) => {
                e.preventDefault();
                
                if (currentActiveImage === img) {
                    resetToDefault();
                } else {
                    showName(letters, img);
                }
            });

            // Mouse events still work
            img.addEventListener("mouseenter", () => {
                showName(letters, img);
            });

            img.addEventListener("mouseleave", () => {
                shrinkImage(img);
            });
        });

        profileImagesContainer.addEventListener("mouseleave", () => {
            resetToDefault();
        });

        // Touch outside to reset
        document.addEventListener("touchstart", (e) => {
            const isInsideImages = profileImagesContainer.contains(e.target);
            if (!isInsideImages && currentActiveImage !== null) {
                resetToDefault();
            }
        });
    }
});
