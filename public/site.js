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

  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var website = form.querySelector('input[name="website"]');
      if (website && String(website.value || "").trim()) {
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
        from_name: (form.querySelector('[name="from_name"]') || {}).value || "",
        from_email:
          (form.querySelector('[name="from_email"]') || {}).value || "",
        phone: (form.querySelector('[name="phone"]') || {}).value || "",
        message: (form.querySelector('[name="message"]') || {}).value || "",
      };

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res
            .json()
            .catch(function () {
              return {};
            })
            .then(function (data) {
              if (!res.ok) {
                var msg =
                  (data && (data.error || data.message)) || "Request failed";
                var extra =
                  data && data.missing && data.missing.length
                    ? " Missing: " + data.missing.join(", ")
                    : "";
                var err = new Error(msg + extra);
                err.status = res.status;
                throw err;
              }
              return data;
            });
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
