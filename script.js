(() => {
  const root = document.documentElement;
  root.classList.remove("no-js");
  const body = document.body;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  document.getElementById("year").textContent = new Date().getFullYear();

  // ---------- Injected FX layers ----------
  body.insertAdjacentHTML(
    "beforeend",
    `<div class="grain" aria-hidden="true"></div>
     <div class="progress" aria-hidden="true"></div>
     <div class="cursor" aria-hidden="true"></div>
     <div class="cursor-ring" aria-hidden="true"><span>View</span></div>
     <div class="preview" aria-hidden="true"><div class="preview-inner"><small></small><b></b></div></div>`
  );
  const hero = $(".hero");
  hero.insertAdjacentHTML("afterbegin", '<div class="hero-glow" aria-hidden="true"></div>');
  $(".timeline").insertAdjacentHTML("afterbegin", '<div class="timeline-fill" aria-hidden="true"></div>');

  // ---------- Split hero title into masked lines / words ----------
  const title = $(".hero-title");
  title.classList.remove("reveal");
  title.innerHTML = title.innerHTML
    .split(/<br\s*\/?>/i)
    .map((line) => {
      const tmp = document.createElement("div");
      tmp.innerHTML = line.trim();
      const words = [];
      tmp.childNodes.forEach((n) => {
        if (n.nodeType === 3) n.textContent.split(/\s+/).filter(Boolean).forEach((w) => words.push(w));
        else words.push(n.outerHTML);
      });
      return `<span class="line">${words.map((w) => `<span class="word">${w}</span>`).join(" ")}</span>`;
    })
    .join("");
  $$(".word", title).forEach((w, i) => (w.style.transitionDelay = `${i * 70}ms`));

  // ---------- Reveal + counters ----------
  function startObservers() {
    const io = new IntersectionObserver(
      (entries) => {
        entries.filter((e) => e.isIntersecting).forEach((e, i) => {
          if (!e.target.style.transitionDelay) e.target.style.transitionDelay = `${Math.min(i * 90, 450)}ms`;
          e.target.classList.add("in");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    $$(".reveal:not(.in), .job").forEach((el) => io.observe(el));

    const cio = new IntersectionObserver(
      (entries) => {
        entries.filter((e) => e.isIntersecting).forEach((e) => {
          countUp(e.target);
          cio.unobserve(e.target);
        });
      },
      { threshold: 0.6 }
    );
    $$(".figures dt").forEach((el) => cio.observe(el));
  }

  function countUp(el) {
    const raw = el.textContent;
    const m = raw.match(/[\d.]+/);
    if (!m || reduced) return;
    const target = parseFloat(m[0]);
    const decimals = (m[0].split(".")[1] || "").length;
    const t0 = performance.now(), dur = 1600;
    const step = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = raw.replace(m[0], (target * (1 - Math.pow(1 - p, 4))).toFixed(decimals));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ---------- Intro loader ----------
  const loader = $(".loader");
  const startSite = () => {
    body.classList.remove("loading");
    requestAnimationFrame(() => {
      title.classList.add("in");
      $$(".hero .reveal, .hero .portrait").forEach((el, i) => {
        el.style.transitionDelay = `${300 + i * 90}ms`;
        el.classList.add("in");
      });
      startObservers();
    });
  };
  const hideLoader = () => { if (loader) loader.style.display = "none"; };

  if (reduced || !loader || sessionStorage.getItem("seen-loader")) {
    hideLoader();
    startSite();
  } else {
    const count = $(".loader-count"), bar = $(".loader-bar");
    const t0 = performance.now(), dur = 1700;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      count.textContent = Math.round(e * 100);
      bar.style.width = e * 100 + "%";
      if (p < 1) return requestAnimationFrame(tick);
      sessionStorage.setItem("seen-loader", "1");
      loader.classList.add("done");
      setTimeout(startSite, 250);
      setTimeout(hideLoader, 1400);
    };
    requestAnimationFrame(tick);
  }

  // ---------- Mobile nav ----------
  const toggle = $(".nav-toggle"), links = $("#nav-links");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    links.classList.toggle("open", !open);
  });
  $$("a", links).forEach((a) =>
    a.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      links.classList.remove("open");
    })
  );

  // ---------- Live Luxembourg clock ----------
  const clock = $("#clock");
  const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Luxembourg" });
  const updateClock = () => (clock.textContent = `Luxembourg ${fmt.format(new Date())}`);
  updateClock();
  setInterval(updateClock, 30000);

  if (reduced) return;

  // ---------- Pointer effects ----------
  const mouse = { x: innerWidth / 2, y: innerHeight / 3 };
  const ring = { ...mouse }, previewPos = { ...mouse }, trail = { ...mouse };
  const cursor = $(".cursor"), cursorRing = $(".cursor-ring");
  const preview = $(".preview"), previewInner = $(".preview-inner"), glow = $(".hero-glow");

  if (finePointer) {
    body.classList.add("has-cursor");
    addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    document.addEventListener("mouseleave", () => body.classList.remove("has-cursor"));
    document.addEventListener("mouseenter", () => body.classList.add("has-cursor"));

    $$("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => body.classList.add("cursor-link"));
      el.addEventListener("mouseleave", () => body.classList.remove("cursor-link"));
    });

    // Floating project preview
    $$(".row").forEach((row) => {
      row.addEventListener("mouseenter", () => {
        body.classList.add("cursor-view");
        previewInner.style.background = `linear-gradient(135deg, ${row.dataset.color}, #f3efe6)`;
        $("b", previewInner).textContent = $("h3", row).textContent;
        $("small", previewInner).textContent = $(".row-kind", row).textContent;
        preview.classList.add("show");
      });
      row.addEventListener("mouseleave", () => {
        body.classList.remove("cursor-view");
        preview.classList.remove("show");
      });
    });

    // Magnetic links
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.25}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`;
      });
      el.addEventListener("pointerleave", () => (el.style.translate = "0 0"));
    });
  }

  // ---------- Per-frame loop (cursor, scroll, marquee, parallax) ----------
  const progress = $(".progress");
  const marquee = $(".marquee-track");
  const portraitImg = $(".portrait img");
  const timeline = $(".timeline"), fill = $(".timeline-fill");
  let marqueeX = 0, lastScroll = scrollY, velocity = 0;

  const frame = () => {
    const sy = scrollY;

    if (finePointer) {
      cursor.style.transform = `translate(${mouse.x}px, ${mouse.y}px)`;
      ring.x = lerp(ring.x, mouse.x, 0.16);
      ring.y = lerp(ring.y, mouse.y, 0.16);
      cursorRing.style.transform = `translate(${ring.x}px, ${ring.y}px)`;

      previewPos.x = lerp(previewPos.x, mouse.x, 0.1);
      previewPos.y = lerp(previewPos.y, mouse.y, 0.1);
      trail.x = lerp(trail.x, mouse.x, 0.25);
      preview.style.left = previewPos.x + 60 + "px";
      preview.style.top = previewPos.y + "px";
      previewInner.style.transform = `rotate(${clamp((mouse.x - trail.x) * 0.5, -12, 12)}deg)`;

      glow.style.transform = `translate(${mouse.x}px, ${mouse.y + sy - hero.offsetTop}px) translate(-50%, -50%)`;
    }

    velocity = lerp(velocity, sy - lastScroll, 0.1);
    lastScroll = sy;
    const max = root.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? sy / max : 0})`;

    // Marquee drifts constantly and speeds up / skews with scroll velocity
    const half = marquee.scrollWidth / 2;
    marqueeX -= 0.6 + Math.abs(velocity) * 0.5;
    if (-marqueeX >= half) marqueeX += half;
    marquee.style.transform = `translateX(${marqueeX}px) skewX(${clamp(-velocity * 0.4, -10, 10)}deg)`;

    if (portraitImg) portraitImg.style.translate = `0 ${-sy * 0.08}px`;

    const r = timeline.getBoundingClientRect();
    fill.style.transform = `scaleY(${clamp((innerHeight * 0.6 - r.top) / r.height, 0, 1)})`;

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
})();
