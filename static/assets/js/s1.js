/* =========================
   ABOUT:BLANK CLOAK (SAFE)
   ========================= */

(function AB_CLOAK() {
  if (window.__abExecuted) return;
  window.__abExecuted = true;

  let inFrame = false;
  try {
    inFrame = window.self !== window.top;
  } catch {
    inFrame = true;
  }

  const isFirefox = typeof InstallTrigger !== "undefined";
  if (inFrame || isFirefox) return;

  const popup = window.open("about:blank#", "_blank");
  if (!popup) {
    alert("Window blocked. Please allow popups for this site.");
    return;
  }
  location.replace("https://classroom.google.com/");
  const doc = popup.document;
  doc.open();
  doc.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="referrer" content="strict-origin">
  <script src="/assets/mathematics/config.js"></script>
  <script src="/assets/mathematics/bundle.js"></script>
  <title>Clever | Portal</title>
</head>
<body></body>
</html>`);
  doc.close();

  const iframe = doc.createElement("iframe");
  iframe.src = location.href;

  Object.assign(iframe.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    border: "none",
    outline: "none"
  });

  const link = doc.createElement("link");
  link.rel = "icon";
  link.href = "/assets/media/favicon/clever.png";

  doc.head.appendChild(link);
  doc.body.appendChild(iframe);
})();

/* =========================
   SETTINGS / UI LOGIC
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  /* Ads */
  const adTypeElement = document.getElementById("adType");
  if (adTypeElement) {
    adTypeElement.addEventListener("change", () => {
      localStorage.setItem("ads", "off");
    });
    adTypeElement.value = "off";
    localStorage.setItem("ads", "off");
  }

  /* Persistent icon/name */
  const iconEl = document.getElementById("icon");
  const nameEl = document.getElementById("name");
  if (iconEl) iconEl.value = localStorage.getItem("CustomIcon") || "";
  if (nameEl) nameEl.value = localStorage.getItem("CustomName") || "";

  if (localStorage.getItem("ab") === "true") {
    const sw = document.getElementById("ab-settings-switch");
    if (sw) sw.checked = true;
  }
});

/* =========================
   DYNAMIC MODE
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  const pChangeElement = document.getElementById("pChange");
  if (!pChangeElement) return;

  function pChange(val) {
    if (val === "uv") {
      localStorage.setItem("uv", "true");
      localStorage.setItem("dy", "false");
    } else {
      localStorage.setItem("uv", "false");
      localStorage.setItem("dy", "true");
    }
  }

  pChangeElement.addEventListener("change", e => pChange(e.target.value));

  if (localStorage.getItem("uv") === "true") pChangeElement.value = "uv";
  else pChangeElement.value = "dy";
});

/* =========================
   KEY / LINK SETTINGS
   ========================= */

let eventKey = localStorage.getItem("eventKey") || "`";
let eventKeyRaw = localStorage.getItem("eventKeyRaw") || "`";
let pLink = localStorage.getItem("pLink") || "https://classroom.google.com/";

document.addEventListener("DOMContentLoaded", () => {
  const ek = document.getElementById("eventKeyInput");
  const li = document.getElementById("linkInput");
  if (ek) ek.value = eventKeyRaw;
  if (li) li.value = pLink;
});

document.addEventListener("DOMContentLoaded", () => {
  const ek = document.getElementById("eventKeyInput");
  if (ek) {
    ek.addEventListener("input", () => {
      eventKey = ek.value.split(",");
    });
  }

  const li = document.getElementById("linkInput");
  if (li) {
    li.addEventListener("input", () => {
      pLink = li.value;
    });
  }
});

function saveEventKey() {
  localStorage.setItem("eventKey", JSON.stringify(eventKey));
  localStorage.setItem("eventKeyRaw", eventKeyRaw);
  localStorage.setItem("pLink", pLink);
  location.reload();
}

/* =========================
   DROPDOWN / ICON / NAME
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("dropdown");
  if (!dropdown) return;

  const opts = Array.from(dropdown.options).sort((a, b) =>
    a.text.localeCompare(b.text)
  );
  dropdown.innerHTML = "";
  opts.forEach(o => dropdown.appendChild(o));

  const selected = localStorage.getItem("selectedOption") || "Default";
  dropdown.value = selected;
  updateHeadSection(selected);
});

function handleDropdownChange(sel) {
  localStorage.removeItem("CustomName");
  localStorage.removeItem("CustomIcon");
  localStorage.setItem("selectedOption", sel.value);
  updateHeadSection(sel.value);
  redirectToMainDomain();
}

function updateHeadSection() {
  const icon = document.getElementById("tab-favicon");
  const title = document.getElementById("t");
  const cn = localStorage.getItem("CustomName");
  const ci = localStorage.getItem("CustomIcon");
  if (cn && ci && icon && title) {
    title.textContent = cn;
    icon.href = ci;
  }
}

function CustomIcon() {
  const el = document.getElementById("icon");
  if (el) localStorage.setItem("CustomIcon", el.value);
}
function CustomName() {
  const el = document.getElementById("name");
  if (el) localStorage.setItem("CustomName", el.value);
}
function ResetCustomCloak() {
  localStorage.removeItem("CustomName");
  localStorage.removeItem("CustomIcon");
}

/* =========================
   BACKGROUND
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  const save = document.getElementById("save-button");
  const reset = document.getElementById("reset-button");
  const input = document.getElementById("background-input");

  if (save && input) {
    save.addEventListener("click", () => {
      if (input.value.trim()) {
        localStorage.setItem("backgroundImage", input.value);
        document.body.style.backgroundImage = `url('${input.value}')`;
        input.value = "";
      }
    });
  }

  if (reset) {
    reset.addEventListener("click", () => {
      localStorage.removeItem("backgroundImage");
      location.reload();
    });
  }
});

/* =========================
   PARTICLES
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  const sw = document.getElementById("2");
  if (!sw) return;

  sw.checked = localStorage.getItem("particles") === "true";
  sw.addEventListener("change", () => {
    localStorage.setItem("particles", sw.checked ? "true" : "false");
  });
});

/* =========================
   AUTO AB FOR SETTINGS
   ========================= */

if (
  location.pathname.endsWith("/c") ||
  location.pathname.endsWith("/settings.html")
) {
  (function () {
    let inFrame = false;
    try {
      inFrame = window.self !== window.top;
    } catch {
      inFrame = true;
    }
    if (!inFrame) AB_CLOAK;
  })();
}

/* =========================
   SEARCH ENGINE
   ========================= */

function EngineChange(dropdown) {
  const engines = {
    Google: "https://www.google.com/search?q=",
    Bing: "https://www.bing.com/search?q=",
    DuckDuckGo: "https://duckduckgo.com/?q=",
    Qwant: "https://www.qwant.com/?q=",
    Startpage: "https://www.startpage.com/search?q=",
    SearchEncrypt: "https://www.searchencrypt.com/search/?q=",
    Ecosia: "https://www.ecosia.org/search?q="
  };
  localStorage.setItem("engine", engines[dropdown.value]);
  localStorage.setItem("enginename", dropdown.value);
}

function SaveEngine() {
  const el = document.getElementById("engine-form");
  if (el && el.value.trim()) {
    localStorage.setItem("engine", el.value);
    localStorage.setItem("enginename", "Custom");
  }
}

/* =========================
   UTIL
   ========================= */

function getRandomURL() {
  return "https://classroom.google.com/";
}
function randRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
