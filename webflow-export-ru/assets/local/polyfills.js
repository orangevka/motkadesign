/* Webflow dropdown polyfill — работает без Webflow JS */
document.addEventListener("DOMContentLoaded", function () {
  var dropdowns = document.querySelectorAll(".w-dropdown");
  if (!dropdowns.length) return;

  function openDropdown(dropdown) {
    dropdown.classList.add("w--open");
    var list = dropdown.querySelector(".w-dropdown-list");
    if (list) list.classList.add("w--open");
  }

  function closeDropdown(dropdown) {
    dropdown.classList.remove("w--open");
    var list = dropdown.querySelector(".w-dropdown-list");
    if (list) list.classList.remove("w--open");
  }

  function closeAll() {
    dropdowns.forEach(closeDropdown);
  }

  dropdowns.forEach(function (dropdown) {
    var toggle = dropdown.querySelector(".w-dropdown-toggle");
    var isHover = dropdown.getAttribute("data-hover") === "true";
    var delay = parseInt(dropdown.getAttribute("data-delay") || "0", 10);
    var timer;

    if (isHover) {
      dropdown.addEventListener("mouseenter", function () {
        clearTimeout(timer);
        openDropdown(dropdown);
      });
      dropdown.addEventListener("mouseleave", function () {
        timer = setTimeout(function () {
          closeDropdown(dropdown);
        }, delay || 150);
      });
    } else {
      if (toggle) {
        toggle.addEventListener("click", function (e) {
          e.stopPropagation();
          var isOpen = dropdown.classList.contains("w--open");
          closeAll();
          if (!isOpen) openDropdown(dropdown);
        });
      }
    }
  });

  /* Закрыть при клике вне */
  document.addEventListener("click", closeAll);

  /* Текущий год в футере */
  document.querySelectorAll(".this-year").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
});
