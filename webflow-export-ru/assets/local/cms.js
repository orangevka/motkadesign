// Inline-CMS: подстановка текста из content.json поверх размеченных блоков.
(function () {
  var CONTENT_URL = "/cms-data/content.json";

  function applyOverrides(data) {
    if (!data) return;
    document.querySelectorAll("[data-cms]").forEach(function (el) {
      var key = el.getAttribute("data-cms");
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        el.textContent = data[key];
      }
    });
  }

  fetch(CONTENT_URL, { cache: "no-store" })
    .then(function (r) {
      return r.ok ? r.json() : {};
    })
    .then(applyOverrides)
    .catch(function () {
      /* нет файла — остаётся HTML */
    });
})();
