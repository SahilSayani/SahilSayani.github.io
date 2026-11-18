document.documentElement.classList.remove("no-js");

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Seamless marquee: duplicate the track contents once
const track = document.querySelector(".marquee-track");
if (track) {
  track.innerHTML += track.innerHTML;
  [...track.children].slice(track.children.length / 2).forEach((el) => el.setAttribute("aria-hidden", "true"));
}

// Mobile nav
const toggle = document.querySelector(".nav-toggle");
const links = document.getElementById("nav-links");
toggle?.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!open));
  links.classList.toggle("open", !open);
});
links?.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", "false");
    links.classList.remove("open");
  })
);

// Reveal on scroll, staggered within each batch
const io = new IntersectionObserver(
  (entries) => {
    entries
      .filter((e) => e.isIntersecting)
      .forEach((e, i) => {
        e.target.style.transitionDelay = `${Math.min(i * 70, 350)}ms`;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
