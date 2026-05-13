const version = new URL(import.meta.url).searchParams.get("_") || "";

// Ссылка «Портфолио» внутри w-dropdown-toggle: stopPropagation чтобы клик не перехватывался Webflow
document.querySelectorAll('.w-dropdown-toggle a[href]:not([href="#"])').forEach(a => {
  a.addEventListener('click', e => { e.stopPropagation(); });
});

// Планшет: клик по клювику (.tab-drop) открывает/закрывает выпадашку
// capture:true — перехватываем ДО любых Webflow-обработчиков
document.querySelectorAll('.dropdown-toggle-2.tab-drop').forEach(toggle => {
  toggle.addEventListener('click', e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
    const dropdown = toggle.closest('.w-dropdown');
    const list = dropdown.querySelector('.w-dropdown-list');
    const isOpen = dropdown.classList.contains('w--open');
    document.querySelectorAll('.w-dropdown.w--open').forEach(d => {
      d.classList.remove('w--open');
      d.querySelector('.w-dropdown-list')?.classList.remove('w--open');
    });
    if (!isOpen) {
      dropdown.classList.add('w--open');
      list.classList.add('w--open');
    }
  }, true); // capture phase
});
document.addEventListener('click', e => {
  if (!e.target.closest('.w-dropdown')) {
    document.querySelectorAll('.w-dropdown.w--open').forEach(d => {
      d.classList.remove('w--open');
      d.querySelector('.w-dropdown-list')?.classList.remove('w--open');
    });
  }
});

// Fixed CTA button: показывать только когда nav полностью ушёл за верхний край
const navBar = document.querySelector('.mtk-header-category');
const fixedBtn = document.querySelector('.buttom-design-wrapper');
if (navBar && fixedBtn) {
  function syncFixedBtn() {
    const gone = navBar.getBoundingClientRect().bottom <= 0;
    if (gone) {
      fixedBtn.classList.add('active');
    } else {
      fixedBtn.classList.remove('active');
    }
  }
  window.addEventListener('scroll', syncFixedBtn, { passive: true });
  syncFixedBtn();
}

// Popup open/close (IX2 не управляет попапом на страницах кроме services)
const popup = document.querySelector('.form-wrapper.popup');
if (popup) {
    popup.style.display = 'none';
    document.querySelectorAll('.order-des').forEach(btn => {
        btn.addEventListener('click', e => { e.preventDefault(); popup.style.display = 'flex'; });
    });
    const closeBtn = popup.querySelector('.close-button');
    if (closeBtn) closeBtn.addEventListener('click', () => { popup.style.display = 'none'; });
    popup.addEventListener('click', e => { if (e.target === popup) popup.style.display = 'none'; });
}

const captcha = await import(`./captcha.js?_=${version}`);

// Lazy-load captcha script on first interaction with a form
document.body.addEventListener("focusin", function (e) {
  if (e.target.closest("form")) captcha.lazyLoad();
});

// Block all form submissions immediately
document.body.addEventListener("submit", function (e) {
  e.preventDefault();
  const form = e.target;
  if (!captcha.isReady()) {
    alert("Капча ещё не загрузилась, попробуйте ещё раз");
    return;
  }

  const btn = form.querySelector('[type="submit"]');
  const originalLabel = btn.value;
  const waitLabel = btn.dataset.wait || "Отправляем...";
  const formContainer = form.closest(".motka-form");
  const doneElement = formContainer.querySelector(".motka-form-done");
  const failElement = formContainer.querySelector(".motka-form-fail");

  // Update UI immediately
  btn.disabled = true;
  btn.value = waitLabel;
  failElement.style.display = "none";

  captcha.execute(form)
    .then(function () {
      return postFormData(form);
    })
    .then(function () {
      form.style.display = "none";
      doneElement.style.display = "block";
    })
    .catch(function (error) {
      console.error("Form submission failed:", error);
      failElement.style.display = "block";
    })
    .finally(function () {
      btn.disabled = false;
      btn.value = originalLabel;
      captcha.reset(form);
    });
});

async function postFormData(form) {
  const data = new FormData(form);
  data.append("FormName", form.dataset.name || "unknown");
  data.append("PageUrl", window.location.href);

  const response = await fetch("/scripts/form-submit", {
    method: "POST",
    body: data,
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
}
