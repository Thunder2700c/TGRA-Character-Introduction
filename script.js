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
    // Default: visible at center
    gsap.set(defaultLetters, { 
        yPercent: 0,
        opacity: 1,
        force3D: true 
    });

    // Others: hidden below AND invisible
    nameElements.forEach((name, index) => {
        if (index > 0) {
            const letters = name.querySelectorAll(".letter");
            gsap.set(letters, { 
                yPercent: 120,  // ⬅️ Further down (120% instead of 100%)
                opacity: 0,     // ⬅️ Also invisible
                force3D: true 
            });
        }
    });

    let currentNameLetters = defaultLetters;

    if (window.innerWidth >= 900) {
        
        profileImages.forEach((img, index) => {
            const correspondingName = nameElements[index + 1];
            const letters = correspondingName.querySelectorAll(".letter");

            img.addEventListener("mouseenter", () => {
                if (currentNameLetters === letters) return;

                // ===== CURRENT TEXT: EXIT UP =====
                gsap.to(currentNameLetters, {
                    yPercent: -120,  // ⬅️ Go FURTHER up (-120%)
                    opacity: 0,      // ⬅️ Fade out
                    duration: 0.5,
                    stagger: { each: 0.02, from: "center" },
                    ease: "power4.out",
                    force3D: true
                });

                // ===== NEW TEXT: ENTER FROM BELOW =====
                gsap.fromTo(letters, 
                    {
                        yPercent: 120,  // Start further down
                        opacity: 0      // Start invisible
                    },
                    {
                        yPercent: 0,    // End at center
                        opacity: 1,     // Fade in
                        duration: 0.5,
                        stagger: { each: 0.02, from: "center" },
                        ease: "power4.out",
                        force3D: true
                    }
                );

                // Enlarge image
                gsap.to(img, {
                    width: 140,
                    height: 140,
                    duration: 0.5,
                    ease: "power4.out"
                });

                currentNameLetters = letters;
            });

            img.addEventListener("mouseleave", () => {
                gsap.to(img, {
                    width: 70,
                    height: 70,
                    duration: 0.5,
                    ease: "power4.out"
                });
            });
        });

        // ===== RESET ON CONTAINER LEAVE =====
        profileImagesContainer.addEventListener("mouseleave", () => {
            if (currentNameLetters !== defaultLetters) {
                
                // Current name: EXIT DOWN
                gsap.to(currentNameLetters, {
                    yPercent: 120,   // ⬅️ Go further down
                    opacity: 0,      // ⬅️ Fade out
                    duration: 0.5,
                    stagger: { each: 0.02, from: "center" },
                    ease: "power4.out",
                    force3D: true
                });

                // Default: ENTER FROM ABOVE
                gsap.fromTo(defaultLetters,
                    {
                        yPercent: -120,  // Start above
                        opacity: 0       // Start invisible
                    },
                    {
                        yPercent: 0,     // End at center
                        opacity: 1,      // Fade in
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
            }
        });
    }
});