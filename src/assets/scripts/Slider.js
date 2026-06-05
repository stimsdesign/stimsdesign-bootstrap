class SliderComponent extends HTMLElement {
    constructor() {
        super();
        this.track = null;
        this.slides = [];
        this.allSlides = [];
        this.isContinuous = false;
        this.isAutoplay = false;
        this.headers = [];
        this.bullets = [];
        this.leftArrow = null;
        this.rightArrow = null;
        this.currentIndex = 0;
        this.originalCount = 0;
        this.autoPlayTimer = null;
        this.autoPlayInterval = 5000;
        this.isTransitioning = false;
        this.isPaused = false;
    }

    connectedCallback() {
        this.init();
    }

    init() {
        this.track = this.querySelector(".track");
        this.slides = Array.from(this.querySelectorAll(".slide"));
        this.isAutoplay = this.classList.contains("autoplay");
        this.headers = Array.from(this.querySelectorAll(".slide-headers > *"));
        this.bullets = Array.from(this.querySelectorAll(".pagination-bullet"));
        this.leftArrow = this.querySelector(".arrow-left");
        this.rightArrow = this.querySelector(".arrow-right");
        this.currentIndex = 0;
        this.originalCount = this.slides.length;

        if (!this.slides.length) return;

        if (this.isContinuous && this.track) {
            this.setupContinuous();
        }

        this.bindEvents();
        this.update(false);
        if (this.isAutoplay) {
            this.startAutoPlay();
        }
    }

    setupContinuous() {
        if (!this.track) return;
        this.originalCount = this.slides.length;
        if (this.originalCount === 0) return;

        // Find which slide was marked 'active' in the HTML
        const initialActiveIndex = this.slides.findIndex((s) =>
            s.classList.contains("active"),
        );
        const activeIndexOffset =
            initialActiveIndex !== -1 ? initialActiveIndex : 0;

        // Set logical index on original slides for identification
        this.slides.forEach(
            (s, i) => (s.dataset.logicalIndex = i.toString()),
        );

        // Clone first 2 and last 2 slides for infinite loop coverage (peeks)
        const firstClones = this.slides
            .slice(0, 2)
            .map((s) => s.cloneNode(true));
        const lastClones = this.slides
            .slice(-2)
            .map((s) => s.cloneNode(true));

        firstClones.forEach((clone) => {
            clone.classList.remove("active");
            clone.classList.add("clone");
            this.track.appendChild(clone);
        });
        lastClones.reverse().forEach((clone) => {
            clone.classList.remove("active");
            clone.classList.add("clone");
            this.track.insertBefore(clone, this.track.firstChild);
        });

        // Update slides array to include clones and set starting index
        this.allSlides = Array.from(this.track.querySelectorAll(".slide"));

        // Sync currentIndex with the active slide:
        // (number of clones at start) + (index of the active slide)
        this.currentIndex = 2 + activeIndexOffset;
    }

    update(animate = true) {
        if (this.isContinuous && this.track) {
            if (!animate) this.classList.add("no-transition");
            else this.classList.remove("no-transition");

            // Update the CSS variable used for TranslateX
            this.track.style.setProperty(
                "--current-index",
                this.currentIndex.toString(),
            );

            const logicalIndex =
                (this.currentIndex - 2 + this.originalCount) %
                this.originalCount;

            this.allSlides.forEach((s) => {
                const sLogic = parseInt(s.dataset.logicalIndex || "0");
                s.classList.toggle("active", sLogic === logicalIndex);
            });

            if (!animate) {
                // Force reflow
                this.offsetHeight;
                this.classList.remove("no-transition");
            }

            if (this.bullets.length) {
                this.bullets.forEach((b, i) =>
                    b.classList.toggle("active", i === logicalIndex),
                );
            }
            if (this.headers.length) {
                this.headers.forEach((h, i) =>
                    h.classList.toggle("active", i === logicalIndex),
                );
            }

            if (!animate) {
                this.track.offsetHeight; // force reflow
            }
        } else {
            // Standard Slider Logic
            this.slides.forEach((s, i) =>
                s.classList.toggle("active", i === this.currentIndex),
            );
            if (this.bullets.length)
                this.bullets.forEach((b, i) =>
                    b.classList.toggle("active", i === this.currentIndex),
                );
            if (this.headers.length)
                this.headers.forEach((h, i) =>
                    h.classList.toggle("active", i === this.currentIndex),
                );
        }
    }

    next() {
        if (this.isTransitioning) return;

        if (this.isContinuous && this.track) {
            this.isTransitioning = true;
            this.currentIndex++;
            this.update(true);

            this.track.addEventListener(
                "transitionend",
                () => {
                    this.isTransitioning = false;
                    if (this.currentIndex >= this.originalCount + 2) {
                        this.currentIndex = 2;
                        this.update(false);
                    }
                },
                { once: true },
            );
        } else {
            this.goTo(this.currentIndex + 1);
        }
    }

    prev() {
        if (this.isTransitioning) return;

        if (this.isContinuous && this.track) {
            this.isTransitioning = true;
            this.currentIndex--;
            this.update(true);

            this.track.addEventListener(
                "transitionend",
                () => {
                    this.isTransitioning = false;
                    if (this.currentIndex < 2) {
                        this.currentIndex = this.originalCount + 1;
                        this.update(false);
                    }
                },
                { once: true },
            );
        } else {
            this.goTo(this.currentIndex - 1);
        }
    }

    goTo(index) {
        if (this.isTransitioning) return;

        if (this.isContinuous) {
            this.currentIndex = index + 2;
            this.update(true);
        } else {
            this.currentIndex =
                (index + this.slides.length) % this.slides.length;
            this.update();
        }
    }

    bindEvents() {
        if (this.rightArrow)
            this.rightArrow.addEventListener("click", () => {
                this.stopAutoPlay();
                this.next();
                this.startAutoPlay();
            });
        if (this.leftArrow)
            this.leftArrow.addEventListener("click", () => {
                this.stopAutoPlay();
                this.prev();
                this.startAutoPlay();
            });
        if (this.bullets.length) {
            this.bullets.forEach((b, i) =>
                b.addEventListener("click", () => {
                    this.stopAutoPlay();
                    this.goTo(i);
                }),
            );
        }
        if (this.headers.length) {
            this.headers.forEach((h, i) =>
                h.addEventListener("click", () => {
                    this.stopAutoPlay();
                    this.goTo(i);
                }),
            );
        }

        // Swipe events
        this.addEventListener("swipeLeft", () => {
            this.stopAutoPlay();
            this.next();
        });
        this.addEventListener("swipeRight", () => {
            this.stopAutoPlay();
            this.prev();
        });

        // Pause on hover
        this.addEventListener("mouseenter", () => {
            this.isPaused = true;
            this.stopAutoPlay();
        });

        this.addEventListener("mouseleave", () => {
            this.isPaused = false;
            this.startAutoPlay();
        });
    }

    startAutoPlay() {
        if (!this.isAutoplay || this.autoPlayTimer || this.isPaused) return;
        this.autoPlayTimer = setInterval(
            () => this.next(),
            this.autoPlayInterval,
        );
    }

    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    disconnectedCallback() {
        this.stopAutoPlay();
    }
}

customElements.define("slider-component", SliderComponent);
