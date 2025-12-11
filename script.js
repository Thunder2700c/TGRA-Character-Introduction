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

    // Split text into letters
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

    let currentNameLetters = defaultLetters;
    let currentActiveImage = null;

    // ===== DETECT DEVICE =====
    function isTouchDevice() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    }

    // ===== ANIMATION FUNCTIONS =====

    function showName(letters, img) {
        if (currentNameLetters === letters) return;

        // Current text: EXIT UP
        gsap.to(currentNameLetters, {
            yPercent: -120,
            opacity: 0,
            duration: 0.5,
            stagger: { each: 0.02, from: "center" },
            ease: "power4.out",
            overwrite: true,
            force3D: true
        });

        // New text: ENTER FROM BELOW
        gsap.fromTo(letters, 
            {
                yPercent: 120,
                opacity: 0
            },
            {
                yPercent: 0,
                opacity: 1,
                duration: 0.5,
                stagger: { each: 0.02, from: "center" },
                ease: "power4.out",
                overwrite: true,
                force3D: true
            }
        );

        // Enlarge image
        if (img) {
            // Reset all images first
            gsap.to(profileImages, {
                width: 70,
                height: 70,
                duration: 0.3,
                ease: "power4.out",
                overwrite: true
            });

            // Enlarge active image
            gsap.to(img, {
                width: 140,
                height: 140,
                duration: 0.5,
                ease: "power4.out",
                overwrite: true
            });
        }

        currentNameLetters = letters;
        currentActiveImage = img;
    }

    function resetToDefault() {
        if (currentNameLetters === defaultLetters) return;

        // Current name: EXIT DOWN
        gsap.to(currentNameLetters, {
            yPercent: 120,
            opacity: 0,
            duration: 0.5,
            stagger: { each: 0.02, from: "center" },
            ease: "power4.out",
            overwrite: true,
            force3D: true
        });

        // Default: ENTER FROM ABOVE
        gsap.fromTo(defaultLetters,
            {
                yPercent: -120,
                opacity: 0
            },
            {
                yPercent: 0,
                opacity: 1,
                duration: 0.5,
                stagger: { each: 0.02, from: "center" },
                ease: "power4.out",
                overwrite: true,
                force3D: true
            }
        );

        // Reset all images
        gsap.to(profileImages, {
            width: 70,
            height: 70,
            duration: 0.5,
            ease: "power4.out",
            overwrite: true
        });

        currentNameLetters = defaultLetters;
        currentActiveImage = null;
    }

    function shrinkImage(img) {
        gsap.to(img, {
            width: 70,
            height: 70,
            duration: 0.5,
            ease: "power4.out",
            overwrite: true
        });
    }

    // ===== DESKTOP (Mouse Hover) =====
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

    // ===== MOBILE (Touch/Tap) =====
    if (window.innerWidth < 900 || isTouchDevice()) {
        
        profileImages.forEach((img, index) => {
            const correspondingName = nameElements[index + 1];
            const letters = correspondingName.querySelectorAll(".letter");

            img.addEventListener("click", (e) => {
                e.stopPropagation();
                
                // Tap same image = reset
                if (currentActiveImage === img) {
                    resetToDefault();
                } else {
                    showName(letters, img);
                }
            });
        });

        // Tap outside = reset
        document.addEventListener("click", (e) => {
            if (!profileImagesContainer.contains(e.target) && currentActiveImage) {
                resetToDefault();
            }
        });
    }

    // ===== HYBRID DEVICES (Laptop with touchscreen) =====
    if (window.innerWidth >= 900 && isTouchDevice()) {
        
        profileImages.forEach((img, index) => {
            const correspondingName = nameElements[index + 1];
            const letters = correspondingName.querySelectorAll(".letter");

            // Touch support
            img.addEventListener("touchstart", (e) => {
                e.preventDefault();
                
                if (currentActiveImage === img) {
                    resetToDefault();
                } else {
                    showName(letters, img);
                }
            });

            // Mouse still works
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

        // Touch outside = reset
        document.addEventListener("touchstart", (e) => {
            if (!profileImagesContainer.contains(e.target) && currentActiveImage) {
                resetToDefault();
            }
        });
    }
});
