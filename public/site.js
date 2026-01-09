(function () {
  "use strict";

  function initSimpleIcons() {
    var nodes = Array.prototype.slice.call(
      document.querySelectorAll("[data-si]")
    );
    if (!nodes.length) return;

    var cache = initSimpleIcons._cache;
    if (!cache) {
      cache = new Map();
      initSimpleIcons._cache = cache;
    }

    function getIconSvg(slug) {
      if (!slug) return Promise.reject(new Error("Missing slug"));
      if (cache.has(slug)) return cache.get(slug);

      var url =
        "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/" +
        encodeURIComponent(String(slug)) +
        ".svg";

      var p = fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error("Icon fetch failed: " + slug);
          return res.text();
        })
        .then(function (svgText) {
          return svgText;
        });

      cache.set(slug, p);
      return p;
    }

    nodes.forEach(function (host) {
      var slug = host.getAttribute("data-si");
      var color = host.getAttribute("data-color");
      var label = host.getAttribute("data-label") || "";

      if (color) host.style.color = color;

      getIconSvg(slug)
        .then(function (svgText) {
          var template = document.createElement("template");
          template.innerHTML = svgText.trim();
          var svg = template.content.querySelector("svg");
          if (!svg) return;

          svg.setAttribute("aria-hidden", "true");
          svg.setAttribute("focusable", "false");
          if (label) svg.setAttribute("aria-label", label);
          svg.classList.add("h-full", "w-full");

          host.textContent = "";
          host.appendChild(svg);
        })
        .catch(function () {
          // If CDN fails, keep existing content (or empty) without breaking the UI.
        });
    });
  }

  var mobileMenuBtn = document.getElementById("mobileMenuBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", function () {
      var isOpen = !mobileMenu.classList.contains("hidden");
      mobileMenu.classList.toggle("hidden");
      mobileMenuBtn.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    function encodeForm(data) {
      return Object.keys(data)
        .map(function (key) {
          return (
            encodeURIComponent(key) +
            "=" +
            encodeURIComponent(String(data[key]))
          );
        })
        .join("&");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var botField = form.querySelector('input[name="bot-field"]');
      if (botField && String(botField.value || "").trim()) {
        // Honeypot filled => treat as spam.
        form.reset();
        alert("Message sent successfully. We will contact you soon.");
        return;
      }

      var submitBtn = form.querySelector(
        'button[type="submit"], input[type="submit"]'
      );

      var prevText = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("opacity-70", "cursor-not-allowed");
        submitBtn.textContent = "Sending...";
      }

      var payload = {
        "form-name": form.getAttribute("name") || "contact",
        "bot-field": "",
        from_name: (form.querySelector('[name="from_name"]') || {}).value || "",
        from_email:
          (form.querySelector('[name="from_email"]') || {}).value || "",
        phone: (form.querySelector('[name="phone"]') || {}).value || "",
        message: (form.querySelector('[name="message"]') || {}).value || "",
      };

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForm(payload),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("Request failed");
          return res.text();
        })
        .then(function () {
          alert("Message sent successfully. We will contact you soon.");
          form.reset();
        })
        .catch(function (err) {
          if (
            window &&
            window.console &&
            typeof window.console.error === "function"
          ) {
            window.console.error("Contact form error:", err);
          }
          alert(
            "Failed to send message. Please try again later or contact us by phone/email."
          );
        })
        .finally(function () {
          if (!submitBtn) return;
          submitBtn.disabled = false;
          submitBtn.classList.remove("opacity-70", "cursor-not-allowed");
          submitBtn.textContent = prevText || "Submit";
        });
    });
  }

  initContactForm();

  initSimpleIcons();

  var targets = Array.prototype.slice.call(
    document.querySelectorAll("[data-reveal]")
  );
  targets.forEach(function (el) {
    el.classList.add("reveal");
  });

  if (targets.length === 0) return;
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    targets.forEach(function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  targets.forEach(function (el) {
    io.observe(el);
  });
})();
