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

  var SESSION_URL = "/cms/session.php";
  var SAVE_URL = "/cms/save.php";
  var dirty = {}; // key -> value

  function enableEditing(csrf) {
    injectToolbar(csrf);
    document.querySelectorAll("[data-cms]").forEach(function (el) {
      el.classList.add("cms-editing");
      el.setAttribute("contenteditable", "plaintext-only");
      el.addEventListener("input", function () {
        dirty[el.getAttribute("data-cms")] = el.textContent;
        el.classList.add("cms-dirty");
      });
    });
  }

  function injectToolbar(csrf) {
    var bar = document.createElement("div");
    bar.className = "cms-toolbar";
    bar.innerHTML =
      '<span class="cms-status">режим правки</span>' +
      '<button class="cms-save">Сохранить</button>' +
      '<button class="cms-logout">Выйти</button>';
    document.body.appendChild(bar);
    var status = bar.querySelector(".cms-status");
    bar.querySelector(".cms-logout").onclick = function () {
      window.location.href = "/cms/logout.php";
    };
    bar.querySelector(".cms-save").onclick = function () {
      var keys = Object.keys(dirty);
      if (!keys.length) {
        status.textContent = "нет изменений";
        return;
      }
      status.textContent = "сохраняю…";
      Promise.all(
        keys.map(function (key) {
          return fetch(SAVE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-CMS-CSRF": csrf },
            body: JSON.stringify({ key: key, value: dirty[key] }),
          }).then(function (r) {
            return r.json();
          });
        })
      )
        .then(function (results) {
          var ok = results.every(function (x) {
            return x && x.ok;
          });
          status.textContent = ok ? "сохранено ✓" : "ошибка";
          if (ok) {
            dirty = {};
            document
              .querySelectorAll("[data-cms].cms-dirty")
              .forEach(function (el) {
                el.classList.remove("cms-dirty");
              });
          }
        })
        .catch(function () {
          status.textContent = "ошибка сети";
        });
    };
  }

  fetch(SESSION_URL, { cache: "no-store" })
    .then(function (r) {
      return r.json();
    })
    .then(function (s) {
      if (s && s.auth) enableEditing(s.csrf);
    })
    .catch(function () {
      /* не залогинен — обычный режим */
    });
})();
