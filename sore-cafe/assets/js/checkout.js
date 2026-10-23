/* Checkout: data pemesan, ringkasan, QRIS dinamis. */
(function () {
  "use strict";

  var SORE = window.SORE || {};
  var grid = document.getElementById("checkoutGrid");
  var empty = document.getElementById("checkoutEmpty");
  var form = document.getElementById("checkoutForm");
  if (!grid || !form) return;

  var orderLines = document.getElementById("orderLines");
  var subtotalEl = document.getElementById("summarySubtotal");
  var totalEl = document.getElementById("summaryTotal");
  var totalInline = document.getElementById("summaryTotalInline");
  var payBtn = document.getElementById("payBtn");
  var nameInput = document.getElementById("nama");
  var tableInput = document.getElementById("meja");
  var notesInput = document.getElementById("catatan");
  var nameField = document.getElementById("fieldNama");
  var tableField = document.getElementById("fieldMeja");
  var sumName = document.querySelector("[data-sum-name]");
  var sumMeja = document.querySelector("[data-sum-meja]");
  var sumTipe = document.querySelector("[data-sum-tipe]");
  var nameError = document.getElementById("errorNama");
  var tableError = document.getElementById("errorMeja");

  var dialog = document.getElementById("payDialog");
  var qrFrame = document.getElementById("qrFrame");
  var payAmount = document.getElementById("payAmount");
  var payFor = document.getElementById("payFor");
  var payOrder = document.getElementById("payOrder");
  var countdownEl = document.getElementById("payCountdown");
  var simulateBtn = document.getElementById("paySimulate");
  var regenerateBtn = document.getElementById("payRegenerate");
  var closeBtn = document.getElementById("payClose");
  var cancelBtn = document.getElementById("payCancel");

  var pending = null;
  var timer = null;
  var expiresAt = 0;

  function selectedType() {
    var checked = form.querySelector('input[name="tipe"]:checked');
    return checked ? checked.value : "dine-in";
  }

  function typeLabel(value) {
    return value === "takeaway" ? "Dibungkus" : "Makan di tempat";
  }

  function rows() {
    return SORE.cart.detailed();
  }

  function orderCode() {
    return "SR-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 4).toUpperCase();
  }

  function syncTotals() {
    var total = SORE.cart.subtotal();
    if (subtotalEl) subtotalEl.textContent = SORE.formatRp(total);
    if (totalEl) totalEl.textContent = SORE.formatRp(total);
    if (totalInline) totalInline.textContent = SORE.formatRp(total);
    if (payBtn) payBtn.textContent = "Bayar " + SORE.formatRp(total);
    if (sumName) sumName.textContent = nameInput.value.trim() || "Belum diisi";
    if (sumMeja) {
      sumMeja.textContent = tableInput.value ? "Meja " + tableInput.value : "Belum dipilih";
    }
    if (sumTipe) {
      sumTipe.textContent = typeLabel(selectedType());
      if (tableInput.value && selectedType() === "dine-in") {
        sumTipe.textContent += " · diantar ke meja";
      }
    }
  }

  function renderItems() {
    var list = rows();
    if (!list.length) {
      grid.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }
    grid.hidden = false;
    if (empty) empty.hidden = true;

    orderLines.innerHTML = list.map(function (row) {
      var item = row.item;
      return (
        '<div class="order-line" data-id="' + item.id + '">' +
          '<img src="' + item.img + '" alt="" width="56" height="70" loading="lazy" decoding="async">' +
          "<div>" +
            '<div class="order-line-name">' + SORE.escapeHtml(item.nama) + "</div>" +
            '<div class="order-line-price">' + SORE.formatRp(item.harga) + " / item</div>" +
          "</div>" +
          '<div class="order-line-right">' +
            '<div class="qty">' +
              '<button type="button" data-cart-minus="' + item.id + '" aria-label="Kurangi ' + SORE.escapeHtml(item.nama) + '">−</button>' +
              "<span>" + row.qty + "</span>" +
              '<button type="button" data-cart-plus="' + item.id + '" aria-label="Tambah ' + SORE.escapeHtml(item.nama) + '">+</button>' +
            "</div>" +
            '<span class="order-line-total">' + SORE.formatRp(row.line) + "</span>" +
            '<button class="cart-remove" type="button" data-cart-remove="' + item.id + '">Hapus</button>' +
          "</div>" +
        "</div>"
      );
    }).join("");

    syncTotals();
  }

  function setError(field, el, message) {
    if (!field || !el) return;
    if (message) {
      field.classList.add("has-error");
      el.textContent = message;
      field.querySelector(".input").setAttribute("aria-invalid", "true");
    } else {
      field.classList.remove("has-error");
      el.textContent = "";
      field.querySelector(".input").removeAttribute("aria-invalid");
    }
  }

  function validate() {
    var ok = true;
    var nama = nameInput.value.trim();
    var meja = parseInt(tableInput.value, 10);

    if (nama.length < 2) {
      setError(nameField, nameError, "Isi nama supaya pesanan tidak tertukar.");
      ok = false;
    } else {
      setError(nameField, nameError, "");
    }

    if (!(meja >= 1 && meja <= 30)) {
      setError(tableField, tableError, "Nomor meja 1 sampai 30.");
      ok = false;
    } else {
      setError(tableField, tableError, "");
      SORE.setMeja(meja);
    }

    if (!ok) {
      var firstInvalid = form.querySelector(".field.has-error .input");
      if (firstInvalid) firstInvalid.focus();
      return false;
    }
    if (!rows().length) {
      SORE.toast("Keranjang kosong.");
      return false;
    }
    return true;
  }

  function updateRadioStyles() {
    SORE.$$(".radio-card", form).forEach(function (card) {
      var input = card.querySelector("input");
      card.classList.toggle("is-checked", !!(input && input.checked));
    });
  }

  /* ---------- pembayaran ---------- */

  function buildPending() {
    var total = SORE.cart.subtotal();
    var kode = orderCode();
    var payload = SORE.qris.build({ amount: total, orderId: kode });
    if (!SORE.qris.validate(payload)) {
      SORE.toast("QRIS gagal dibuat. Coba lagi.");
      return null;
    }
    return {
      kode: kode,
      amount: total,
      payload: payload,
      items: rows().map(function (row) {
        return {
          id: row.item.id,
          nama: row.item.nama,
          harga: row.item.harga,
          qty: row.qty,
          img: row.item.img
        };
      }),
      nama: nameInput.value.trim(),
      meja: parseInt(tableInput.value, 10),
      tipe: selectedType(),
      catatan: notesInput.value.trim()
    };
  }

  function startCountdown() {
    expiresAt = Date.now() + 15 * 60 * 1000;
    window.clearInterval(timer);
    updateCountdown();
    timer = window.setInterval(updateCountdown, 1000);
  }

  function updateCountdown() {
    if (!pending) return;
    var left = Math.max(0, expiresAt - Date.now());
    var totalSeconds = Math.floor(left / 1000);
    var mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    var ss = String(totalSeconds % 60).padStart(2, "0");
    if (countdownEl) countdownEl.textContent = mm + ":" + ss + " tersisa";
    var expired = totalSeconds <= 0;
    if (countdownEl) countdownEl.classList.toggle("is-expired", expired);
    if (simulateBtn) simulateBtn.disabled = expired;
    if (regenerateBtn) regenerateBtn.hidden = !expired;
    if (expired) window.clearInterval(timer);
  }

  function openPayment() {
    if (!validate()) return;
    pending = buildPending();
    if (!pending) return;

    SORE.qris.render(qrFrame, pending.payload, { cellSize: 6, margin: 24, label: "QRIS SORE" });
    if (payAmount) payAmount.textContent = SORE.formatRp(pending.amount);
    if (payFor) {
      payFor.innerHTML = "Meja <b>" + pending.meja + "</b> · atas nama <b>" + SORE.escapeHtml(pending.nama) + "</b>";
    }
    if (payOrder) payOrder.textContent = "Kode " + pending.kode;
    if (simulateBtn) simulateBtn.disabled = false;
    if (regenerateBtn) regenerateBtn.hidden = true;

    startCountdown();
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    }
    if (dialog) dialog.scrollTop = 0;
    if (closeBtn) window.setTimeout(function () { closeBtn.focus(); }, 60);
  }

  function closePayment() {
    window.clearInterval(timer);
    if (dialog && dialog.open) dialog.close();
  }

  function finishPayment() {
    if (!pending || Date.now() > expiresAt) return;

    var order = {
      kode: pending.kode,
      waktu: new Date().toISOString(),
      meja: pending.meja,
      nama: pending.nama,
      tipe: pending.tipe,
      catatan: pending.catatan,
      items: pending.items,
      subtotal: pending.amount,
      total: pending.amount,
      status: "diterima"
    };

    var orders = [];
    try {
      orders = JSON.parse(window.localStorage.getItem("sore.orders.v1") || "[]");
      if (!Array.isArray(orders)) orders = [];
    } catch (err) {
      orders = [];
    }
    orders.unshift(order);
    orders = orders.slice(0, 25);

    try {
      window.localStorage.setItem("sore.orders.v1", JSON.stringify(orders));
      window.localStorage.setItem("sore.nama", pending.nama);
      window.localStorage.setItem("sore.meja", String(pending.meja));
    } catch (err) {
      /* penyimpanan penuh atau diblokir */
    }

    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    SORE.cart.clear();
    window.location.href = "status.html?order=" + encodeURIComponent(pending.kode);
  }

  /* ---------- event ---------- */

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    openPayment();
  });

  form.addEventListener("click", function (event) {
    var minus = event.target.closest("[data-cart-minus]");
    if (minus) {
      var idMinus = minus.getAttribute("data-cart-minus");
      SORE.cart.set(idMinus, (SORE.cart.read()[idMinus] || 0) - 1);
      return;
    }
    var plus = event.target.closest("[data-cart-plus]");
    if (plus) {
      var idPlus = plus.getAttribute("data-cart-plus");
      SORE.cart.set(idPlus, (SORE.cart.read()[idPlus] || 0) + 1);
      return;
    }
    var remove = event.target.closest("[data-cart-remove]");
    if (remove) SORE.cart.remove(remove.getAttribute("data-cart-remove"));
  });

  form.addEventListener("input", function (event) {
    if (event.target === nameInput) {
      setError(nameField, nameError, "");
      syncTotals();
    }
    if (event.target === tableInput) {
      setError(tableField, tableError, "");
      var n = parseInt(tableInput.value, 10);
      if (n >= 1 && n <= 30) SORE.setMeja(n);
      syncTotals();
    }
  });

  form.addEventListener("change", function (event) {
    if (event.target.name === "tipe") {
      updateRadioStyles();
      syncTotals();
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closePayment);
  if (cancelBtn) cancelBtn.addEventListener("click", closePayment);
  if (simulateBtn) simulateBtn.addEventListener("click", finishPayment);

  if (regenerateBtn) {
    regenerateBtn.addEventListener("click", function () {
      if (!pending) return;
      pending = buildPending();
      if (!pending) return;
      SORE.qris.render(qrFrame, pending.payload, { cellSize: 6, margin: 24, label: "QRIS SORE" });
      if (payOrder) payOrder.textContent = "Kode " + pending.kode;
      if (simulateBtn) simulateBtn.disabled = false;
      regenerateBtn.hidden = true;
      startCountdown();
    });
  }

  if (dialog) {
    dialog.addEventListener("close", function () {
      window.clearInterval(timer);
    });
  }

  document.addEventListener("sore:cart", renderItems);

  /* ---------- start ---------- */

  var mejaAwal = SORE.getMeja();
  if (mejaAwal) tableInput.value = String(mejaAwal);
  try {
    var savedName = window.localStorage.getItem("sore.nama");
    if (savedName && !nameInput.value) nameInput.value = savedName;
  } catch (err) { /* noop */ }

  updateRadioStyles();
  renderItems();
  syncTotals();
})();
