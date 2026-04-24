const version = new URL(import.meta.url).searchParams.get("_") || "";
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
