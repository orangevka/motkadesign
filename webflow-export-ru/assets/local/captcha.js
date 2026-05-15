const CAPTCHA_KEY = "ysc1_22TLb7Bci7BaUtLi9j6ziwte9LNKqI0HgEr9n360e82b2c21";
const CAPTCHA_SCRIPT_URL =
  "https://smartcaptcha.yandexcloud.net/captcha.js?render=onload&onload=onCaptchaLoadedFunction";

let loadStarted = false;
let ready = false;
const widgetIds = new WeakMap();

export function lazyLoad() {
  if (loadStarted) return;
  loadStarted = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = CAPTCHA_SCRIPT_URL;
  document.body.appendChild(script);
}

globalThis.onCaptchaLoadedFunction = function () {
  if (!globalThis.smartCaptcha) {
    return;
  }

  const forms = document.querySelectorAll("form");
  for (const form of forms) {
    const container = form.appendChild(document.createElement("div"));
    const widgetId = globalThis.smartCaptcha.render(container, {
      sitekey: CAPTCHA_KEY,
      hl: "ru",
      invisible: true,
      hideShield: true,
    });
    widgetIds.set(form, widgetId);
  }

  ready = true;
};

export function isReady() {
  return ready;
}

export function execute(form) {
  const widgetId = widgetIds.get(form);
  if (!ready || widgetId === undefined) {
    return Promise.reject(new Error("Captcha not ready"));
  }

  return new Promise(function (resolve, reject) {
    const unsubs = [];
    let settled = false;

    function settle(fn, arg) {
      if (settled) return;
      settled = true;
      unsubs.forEach(function (u) { u(); });
      fn(arg);
    }

    unsubs.push(globalThis.smartCaptcha.subscribe(widgetId, "success", function () {
      settle(resolve);
    }));
    unsubs.push(globalThis.smartCaptcha.subscribe(widgetId, "network-error", function () {
      settle(reject, new Error("Captcha network error"));
    }));
    unsubs.push(globalThis.smartCaptcha.subscribe(widgetId, "javascript-error", function (err) {
      settle(reject, new Error("Captcha JS error: " + err.message));
    }));
    unsubs.push(globalThis.smartCaptcha.subscribe(widgetId, "token-expired", function () {
      settle(reject, new Error("Captcha token expired"));
    }));

    globalThis.smartCaptcha.execute(widgetId);
  });
}

export function reset(form) {
  const widgetId = widgetIds.get(form);
  if (widgetId !== undefined) {
    globalThis.smartCaptcha.reset(widgetId);
  }
}
