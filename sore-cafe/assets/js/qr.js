/* Generator kartu QR meja untuk staf. */
(function () {
  "use strict";

  var SORE = window.SORE || {};
  var form = document.getElementById("qrForm");
  if (!form) return;

  var input = document.getElementById("qrMeja");
  var error = document.getElementById("qrError");
  var cardNumber = document.getElementById("cardNumber");
  var cardQr = document.getElementById("cardQr");
  var previewUrl = document.getElementById("previewUrl");
  var downloadBtn = document.getElementById("downloadQr");
  var printBtn = document.getElementById("printBtn");
  var copyBtn = document.getElementById("copyLink");

  var current = { meja: 0, url: "" };

  function pad(n) {
    return ("0" + n).slice(-2);
  }

  function menuUrl(meja) {
    var base = window.location.href.split("?")[0].split("#")[0];
    return base.replace(/qr\.html$/, "menu.html") + "?meja=" + meja;
  }

  function generate(meja, options) {
    var n = parseInt(meja, 10);
    if (!(n >= 1 && n <= 30)) {
      if (error) {
        error.textContent = "Nomor meja 1 sampai 30.";
        error.classList.add("is-visible");
      }
      if (input) input.setAttribute("aria-invalid", "true");
      return;
    }

    if (error) error.classList.remove("is-visible");
    if (input) input.removeAttribute("aria-invalid");

    current.meja = n;
    current.url = menuUrl(n);

    if (cardNumber) cardNumber.textContent = pad(n);
    if (previewUrl) {
      previewUrl.textContent = current.url.replace(/^[a-z]+:\/\/[^/]+\//i, "");
    }

    SORE.qris.render(cardQr, current.url, {
      cellSize: 8,
      margin: 32,
      level: "M",
      label: "Menu SORE meja " + n
    });

    if (options && options.focus) {
      var card = document.getElementById("printCard");
      if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    generate(input ? input.value : 1, { focus: true });
  });

  if (input) {
    input.addEventListener("input", function () {
      var n = parseInt(input.value, 10);
      if (n >= 1 && n <= 30) generate(n);
    });
    input.addEventListener("blur", function () {
      var n = parseInt(input.value, 10);
      if (!(n >= 1 && n <= 30)) generate(current.meja || 1);
      else generate(n);
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      if (!current.url) return;
      var svg = SORE.qris.svg(current.url, {
        cellSize: 12,
        margin: 48,
        label: "Menu SORE meja " + current.meja
      });
      if (!svg) {
        SORE.toast("QR belum siap.");
        return;
      }
      var blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + svg], {
        type: "image/svg+xml;charset=utf-8"
      });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "sore-meja-" + pad(current.meja) + ".svg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
      SORE.toast("QR meja " + current.meja + " diunduh.");
    });
  }

  if (printBtn) {
    printBtn.addEventListener("click", function () {
      window.print();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      if (!current.url) return;
      function fallback() {
        var temp = document.createElement("textarea");
        temp.value = current.url;
        temp.setAttribute("readonly", "");
        temp.style.position = "fixed";
        temp.style.opacity = "0";
        document.body.appendChild(temp);
        temp.select();
        try {
          document.execCommand("copy");
          SORE.toast("Tautan disalin.");
        } catch (err) {
          SORE.toast("Salin manual: " + current.url);
        }
        temp.remove();
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(current.url).then(function () {
          SORE.toast("Tautan disalin.");
        }).catch(fallback);
      } else {
        fallback();
      }
    });
  }

  var start = SORE.getMeja() || 1;
  if (input) input.value = String(start);
  generate(start);
})();
