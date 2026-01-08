(function () {
  "use strict";

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

  function initEmailJsContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!window.emailjs) {
        alert("Email service is not loaded yet. Please refresh and try again.");
        return;
      }

      var publicKey = form.getAttribute("data-emailjs-public-key") || "";
      var serviceId = form.getAttribute("data-emailjs-service-id") || "";
      var templateId = form.getAttribute("data-emailjs-template-id") || "";

      if (!publicKey || !serviceId || !templateId) {
        alert(
          "EmailJS is not configured. Add your PUBLIC KEY, SERVICE ID, and TEMPLATE ID in the contact form."
        );
        return;
      }

      try {
        if (typeof window.emailjs.init === "function") {
          // EmailJS browser SDK v4 supports init({ publicKey })
          try {
            window.emailjs.init({ publicKey: publicKey });
          } catch (err) {
            // Fallback for older signature
            window.emailjs.init(publicKey);
          }
        }
      } catch (err) {
        // continue; sendForm may still work if already initialized
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

      window.emailjs
        .sendForm(serviceId, templateId, form)
        .then(function () {
          alert("Message sent successfully. We will contact you soon.");
          form.reset();
        })
        .catch(function () {
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

  initEmailJsContactForm();

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
