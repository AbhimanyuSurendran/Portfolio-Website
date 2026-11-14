/* =====================================================================
   GLASS UI — shared micro-interactions for every page.

   This file only ADDS visual behaviour. It never changes page content
   and never replaces the existing inline scripts (theme toggle, mobile
   menu, project cards, certificate modal, tech-stack game ...).

   Sections:
     1. Active nav link + sliding indicator
     2. Header "scrolled" state
     3. Scroll reveal animations
     4. Pointer spotlight / tilt on glass cards
        4b. Creative background layer, cursor light, scroll progress
     5. Smooth page transitions
     6. Keyboard access for clickable non-button elements
     7. Mobile menu: close with Escape
     8. Broken image placeholder
   ===================================================================== */

(function () {
    "use strict";

    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    /* ---------- 1. Active nav link + sliding indicator ---------------- */

    function currentPageName() {
        var name = window.location.pathname.split("/").pop();
        return name === "" ? "index.html" : name;
    }

    function markActiveLinks() {
        var page = currentPageName();
        document.querySelectorAll(".navbar a, .nav-links a").forEach(function (link) {
            if (link.getAttribute("href") === page) {
                link.classList.add("is-active");
                link.setAttribute("aria-current", "page");
            }
        });
    }

    // A glass pill that slides to whichever link is hovered, and rests on
    // the active page's link otherwise.
    function setupNavIndicator() {
        var navbar = document.querySelector(".nav-desktop .navbar");
        if (!navbar) return;

        var indicator = document.createElement("span");
        indicator.className = "nav-indicator";
        indicator.setAttribute("aria-hidden", "true");
        navbar.appendChild(indicator);

        function moveTo(link) {
            if (!link) {
                indicator.style.opacity = "0";
                return;
            }
            // Measure against the navbar itself (each <li> is positioned,
            // so link.offsetLeft alone would always be 0).
            var left = link.getBoundingClientRect().left - navbar.getBoundingClientRect().left;
            indicator.style.width = link.offsetWidth + "px";
            indicator.style.transform = "translateX(" + left + "px)";
            indicator.style.opacity = "1";
        }

        var activeLink = navbar.querySelector("a.is-active");

        // First placement happens instantly (no slide-in from the left edge).
        indicator.style.transition = "none";
        moveTo(activeLink);
        void indicator.offsetWidth; // apply the position before re-enabling transitions
        indicator.style.transition = "";

        navbar.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("mouseenter", function () { moveTo(link); });
            link.addEventListener("focus", function () { moveTo(link); });
            link.addEventListener("blur", function () { moveTo(activeLink); });
        });
        navbar.addEventListener("mouseleave", function () { moveTo(activeLink); });

        // Web fonts change link widths after first paint, and the page's
        // load event can be held up for seconds (e.g. the map iframe), so
        // re-measure as soon as fonts are ready and whenever the bar resizes.
        function remeasure() { moveTo(activeLink); }
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
        if ("ResizeObserver" in window) new ResizeObserver(remeasure).observe(navbar);
        window.addEventListener("resize", remeasure);
    }

    /* ---------- 2. Header "scrolled" state ------------------------------- */

    function setupHeaderScrollState() {
        var header = document.querySelector("header");
        if (!header) return;

        function update() {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        }
        update();
        window.addEventListener("scroll", update, { passive: true });
    }

    /* ---------- 3. Scroll reveal ----------------------------------------- */

    // Elements that fade/slide in when scrolled into view, across all pages.
    // Selectors that don't exist on a page are simply ignored.
    var REVEAL_SELECTORS = [
        ".top-projects-container",
        ".card-container > .card",
        ".description",
        ".top-skill-sets",
        ".skill-item",
        ".frontend",
        ".backend",
        "#techStackGame",
        ".research-paper",
        ".resume-profile",
        ".main-profile > div:not(.progress-container)",
        ".main-profile > h1.title",
        ".education",
        ".footer-top-items",
        ".footer-bottom > div"
    ];

    var REVEAL_DURATION_MS = 900;
    var MAX_STAGGER_STEPS = 6;

    function setupScrollReveal() {
        if (prefersReducedMotion || !("IntersectionObserver" in window)) return;

        var elements = document.querySelectorAll(REVEAL_SELECTORS.join(","));
        if (!elements.length) return;

        var pending = new Set();

        function reveal(el) {
            if (!pending.has(el)) return;
            pending.delete(el);
            observer.unobserve(el);
            el.classList.add("is-visible");

            // Remove the helper classes once the animation is done so
            // they can't fight with hover transforms afterwards.
            var delayMs = parseFloat(el.style.getPropertyValue("--reveal-delay")) * 1000 || 0;
            setTimeout(function () {
                el.classList.remove("reveal", "is-visible");
                el.style.removeProperty("--reveal-delay");
            }, delayMs + REVEAL_DURATION_MS);
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) reveal(entry.target);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

        // Catch-up pass: a fast scroll (scrollbar drag, End key, quick flick
        // inside a scroll panel) can jump past an element in one frame, so
        // the observer never sees it intersect. When scrolling settles,
        // reveal everything that is already above the bottom of the screen.
        var catchUpTimer = null;
        function revealPassedElements() {
            pending.forEach(function (el) {
                if (el.getBoundingClientRect().top < window.innerHeight) reveal(el);
            });
            if (pending.size === 0) {
                document.removeEventListener("scroll", scheduleCatchUp, true);
            }
        }
        function scheduleCatchUp() {
            clearTimeout(catchUpTimer);
            catchUpTimer = setTimeout(revealPassedElements, 120);
        }
        // capture:true also catches scrolling inside panels (about, certificates).
        document.addEventListener("scroll", scheduleCatchUp, { capture: true, passive: true });

        elements.forEach(function (el) {
            // Stagger siblings of the same kind (e.g. cards in a grid).
            // Compared by tag + first class, which .reveal never changes.
            var siblings = Array.prototype.filter.call(el.parentElement.children, function (child) {
                return child.tagName === el.tagName && child.classList[0] === el.classList[0];
            });
            var index = siblings.indexOf(el) % MAX_STAGGER_STEPS;
            el.style.setProperty("--reveal-delay", (index * 0.07) + "s");

            el.classList.add("reveal");
            pending.add(el);
            observer.observe(el);
        });
    }

    /* ---------- 4. Pointer spotlight / tilt -------------------------------- */

    // .glass-card uses --mx/--my for its light spotlight.
    // Elements matching TILT_SELECTOR lean slightly toward the pointer.
    var MAX_TILT_DEG = 6;
    var TILT_SELECTOR = "[data-tilt], .skill-item, .image-grid img.show, .footer-top-items, .education";

    function setupPointerEffects() {
        if (!hasFinePointer) return;

        var tilted = null; // element currently tilted, so it can be reset

        function resetTilt() {
            if (tilted) tilted.style.transform = "";
            tilted = null;
        }

        document.addEventListener("pointermove", function (event) {
            var target = event.target;
            if (!target.closest) return;

            var card = target.closest(".glass-card");
            if (card) {
                var cardRect = card.getBoundingClientRect();
                card.style.setProperty("--mx", (event.clientX - cardRect.left) + "px");
                card.style.setProperty("--my", (event.clientY - cardRect.top) + "px");
            }

            var tiltEl = prefersReducedMotion ? null : target.closest(TILT_SELECTOR);
            if (tiltEl !== tilted) resetTilt();
            if (!tiltEl) return;

            var rect = tiltEl.getBoundingClientRect();
            var rotateY = (((event.clientX - rect.left) / rect.width) - 0.5) * 2 * MAX_TILT_DEG;
            var rotateX = (((event.clientY - rect.top) / rect.height) - 0.5) * -2 * MAX_TILT_DEG;
            tiltEl.style.transform =
                "perspective(900px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg) translateY(-4px)";
            tilted = tiltEl;
        }, { passive: true });

        document.documentElement.addEventListener("pointerleave", resetTilt);
    }

    /* ---------- 4b. Creative background layer ------------------------------ */

    // Decorative shapes for creative.css: liquid blobs, glass orbs and a
    // grid floor. Purely visual (aria-hidden, no content).
    function createDecor() {
        var decor = document.createElement("div");
        decor.className = "glass-decor";
        decor.setAttribute("aria-hidden", "true");
        decor.innerHTML =
            '<span class="decor-grid"></span>' +
            '<span class="decor-blob b1"></span>' +
            '<span class="decor-blob b2"></span>' +
            '<span class="decor-blob b3"></span>' +
            '<span class="decor-orb o1"></span>' +
            '<span class="decor-orb o2"></span>' +
            '<span class="decor-orb o3"></span>';
        document.body.insertBefore(decor, document.body.firstChild);
        return decor;
    }

    // Parallax (shapes drift with the pointer) + a soft light that follows
    // the cursor behind the frosted panels. Updates are batched per frame.
    function setupCreativeLayer() {
        var decor = createDecor();
        if (prefersReducedMotion || !hasFinePointer) return;

        var light = document.createElement("div");
        light.className = "cursor-light";
        light.setAttribute("aria-hidden", "true");
        document.body.insertBefore(light, decor.nextSibling);

        var pointerX = 0;
        var pointerY = 0;
        var frameRequested = false;

        function applyPointer() {
            frameRequested = false;
            light.style.transform = "translate3d(" + pointerX + "px," + pointerY + "px,0)";
            decor.style.setProperty("--px", ((pointerX / window.innerWidth) * 2 - 1).toFixed(3));
            decor.style.setProperty("--py", ((pointerY / window.innerHeight) * 2 - 1).toFixed(3));
        }

        document.addEventListener("pointermove", function (event) {
            pointerX = event.clientX;
            pointerY = event.clientY;
            light.classList.add("is-on");
            if (!frameRequested) {
                frameRequested = true;
                requestAnimationFrame(applyPointer);
            }
        }, { passive: true });

        document.documentElement.addEventListener("pointerleave", function () {
            light.classList.remove("is-on");
        });
    }

    // Thin iridescent line at the very top showing page scroll progress.
    function setupPageProgress() {
        var bar = document.createElement("div");
        bar.className = "page-progress";
        bar.setAttribute("aria-hidden", "true");
        document.body.appendChild(bar);

        function update() {
            var max = document.documentElement.scrollHeight - window.innerHeight;
            var progress = max > 0 ? window.scrollY / max : 0;
            bar.style.transform = "scaleX(" + progress.toFixed(4) + ")";
        }
        update();
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
    }

    /* ---------- 5. Page transitions ---------------------------------------- */

    // Fade the page out before following a link to another page of this
    // site. New tabs, downloads, anchors and modifier-clicks are untouched.
    function setupPageTransitions() {
        if (prefersReducedMotion) return;

        document.addEventListener("click", function (event) {
            var link = event.target.closest && event.target.closest("a[href]");
            if (!link) return;
            if (event.defaultPrevented || event.button !== 0) return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (link.target && link.target !== "_self") return;
            if (link.hasAttribute("download")) return;

            var href = link.getAttribute("href");
            var isInternalPage = /^[\w\-./]+\.html$/i.test(href);
            if (!isInternalPage) return;

            event.preventDefault();
            document.body.classList.add("is-leaving");
            setTimeout(function () {
                window.location.href = href;
            }, 260);
        });

        // Coming back with the browser's back button can restore the page
        // from cache with .is-leaving still set; clear it.
        window.addEventListener("pageshow", function () {
            document.body.classList.remove("is-leaving");
        });
    }

    /* ---------- 6. Keyboard access ----------------------------------------- */

    // Project cards and certificate images are clicked with the mouse.
    // Make them reachable with Tab and activatable with Enter / Space.
    function setupKeyboardActivation() {
        var clickables = document.querySelectorAll(".card[data-title], .image-grid img[onclick]");
        clickables.forEach(function (el) {
            el.setAttribute("tabindex", "0");
            el.setAttribute("role", "button");
            el.addEventListener("keydown", function (event) {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    el.click();
                }
            });
        });
    }

    /* ---------- 7. Mobile menu: Escape closes it --------------------------- */

    function setupMenuEscape() {
        var overlay = document.getElementById("nav-overlay");
        var closeBtn = document.getElementById("close-btn");
        if (!overlay || !closeBtn) return;

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && overlay.classList.contains("visible")) {
                closeBtn.click();
            }
        });
    }

    /* ---------- 8. Broken image placeholder -------------------------------- */

    // Some images point at files that don't exist yet. Show a soft glass
    // gradient tile instead of the browser's broken-image icon.
    var PLACEHOLDER_SRC = "data:image/svg+xml," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
        '<defs><radialGradient id="a" cx="30%" cy="30%" r="70%"><stop offset="0" stop-color="#5b7cff" stop-opacity=".55"/><stop offset="1" stop-color="#5b7cff" stop-opacity="0"/></radialGradient>' +
        '<radialGradient id="b" cx="75%" cy="75%" r="70%"><stop offset="0" stop-color="#9b6bff" stop-opacity=".5"/><stop offset="1" stop-color="#9b6bff" stop-opacity="0"/></radialGradient></defs>' +
        '<rect width="400" height="300" fill="#141a33"/><rect width="400" height="300" fill="url(#a)"/><rect width="400" height="300" fill="url(#b)"/></svg>'
    );

    function setupImageFallbacks() {
        function useFallback(img) {
            // Guard against an endless loop if the placeholder itself fails.
            if (img.src === PLACEHOLDER_SRC) return;
            img.src = PLACEHOLDER_SRC;
        }

        document.querySelectorAll("img").forEach(function (img) {
            // The listener stays attached, so an <img> that is reused with
            // a new src later (projects detail panel) is covered too.
            img.addEventListener("error", function () {
                if (img.getAttribute("src")) useFallback(img);
            });

            // An img whose src is a folder (ends in "/") can never load.
            var src = img.getAttribute("src") || "";
            if (src.endsWith("/") || src.endsWith("\\")) {
                useFallback(img);
                return;
            }

            // Eager images may have failed before this script ran.
            // (Lazy images that haven't started loading are skipped.)
            var failedAlready = img.loading !== "lazy" && img.complete && img.naturalWidth === 0 && src !== "";
            if (failedAlready) useFallback(img);
        });
    }

    /* ---------- Start ------------------------------------------------------- */

    function init() {
        markActiveLinks();
        setupNavIndicator();
        setupHeaderScrollState();
        setupScrollReveal();
        setupPointerEffects();
        setupCreativeLayer();
        setupPageProgress();
        setupPageTransitions();
        setupKeyboardActivation();
        setupMenuEscape();
        setupImageFallbacks();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
