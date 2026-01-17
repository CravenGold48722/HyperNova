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

  // Open about:blank
  const popup = window.open("about:blank", "_blank");
  if (!popup) {
    alert("Window blocked. Please allow popups for this site.");
    return;
  }

  // IMMEDIATELY replace current tab
  // This is the earliest moment possible
  location.replace("https://classroom.google.com/");

  //  Now populate the blank page (popup survives)
  const doc = popup.document;
  doc.open();
  doc.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="referrer" content="strict-origin">
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
