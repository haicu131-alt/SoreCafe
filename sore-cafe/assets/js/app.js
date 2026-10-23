/* SORE — utilitas bersama, keranjang, meja, navigasi. */
(function () {
  "use strict";

  var SORE = (window.SORE = window.SORE || {});
  var CART_KEY = "sore.cart.v1";
  var TABLE_KEY = "sore.meja";

  SORE.$ = function (sel, root) { return (root || document).querySelector(sel); };
  SORE.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  SORE.escapeHtml = function (value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  SORE.formatRp = function (value) {
    var n = Math.max(0, Math.round(Number(value) || 0));
    return "Rp" + n.toLocaleString("id-ID");
  };

  SORE.getMenuItem = function (id) {
    var menu = SORE.MENU || [];
    for (var i = 0; i < menu.length; i++) {
      if (menu[i].id === id) return menu[i];
    }
    return null;
  };

  function safeRead(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  /* ---------- meja ---------- */

  SORE.getMeja = function () {
    var params = new URLSearchParams(window.location.search);
    var fromUrl = parseInt(params.get("meja"), 10);
    if (fromUrl >= 1 && fromUrl <= 30) {
      safeWrite(TABLE_KEY, fromUrl);
      return fromUrl;
    }
    var stored = parseInt(safeRead(TABLE_KEY, 0), 10);
    return stored >= 1 && stored <= 30 ? stored : null;
  };

  SORE.setMeja = function (n) {
    var num = parseInt(n, 10);
    if (num >= 1 && num <= 30) {
      safeWrite(TABLE_KEY, num);
      renderTable();
      document.dispatchEvent(new CustomEvent("sore:table", { detail: { meja: num } }));
      return true;
    }
    return false;
  };

  function renderTable() {
    var meja = SORE.getMeja();

    SORE.$$("[data-meja-chip]").forEach(function (el) {
      var num = el.querySelector("[data-meja-num]");
      if (meja) {
        if (num) num.textContent = String(meja);
        el.hidden = false;
      } else {
        el.hidden = true;
      }
    });

    var note = document.querySelector("[data-hero-table]");
    if (note) {
      var value = note.querySelector("[data-tn-value]");
      var small = note.querySelector("[data-tn-small]");
      var label = note.querySelector(".tn-label");
      if (meja) {
        if (label) label.textContent = "Meja kamu";
        if (value) value.textContent = "Meja " + meja;
        if (small) small.textContent = "Pesanan diantar ke meja ini";
        note.setAttribute("href", "menu.html?meja=" + meja);
      } else {
        if (label) label.textContent = "Pesan dari meja";
        if (value) value.textContent = "Pilih meja";
        if (small) small.textContent = "Scan QR di meja atau masukkan nomornya";
        note.setAttribute("href", "menu.html");
      }
    }
  }

  /* ---------- keranjang ---------- */

  function normaliseCart(raw) {
    var clean = {};
    if (!raw || typeof raw !== "object") return clean;
    Object.keys(raw).forEach(function (id) {
      var qty = parseInt(raw[id], 10);
      if (SORE.getMenuItem(id) && qty > 0) clean[id] = Math.min(qty, 20);
    });
    return clean;
  }

  var cart = normaliseCart(safeRead(CART_KEY, {}));

  function persist() {
    safeWrite(CART_KEY, cart);
    syncIndicators();
    document.dispatchEvent(new CustomEvent("sore:cart", { detail: { cart: cart } }));
  }

  function count() {
    return Object.keys(cart).reduce(function (sum, id) { return sum + cart[id]; }, 0);
  }

  function subtotal() {
    return Object.keys(cart).reduce(function (sum, id) {
      var item = SORE.getMenuItem(id);
      return sum + (item ? item.harga * cart[id] : 0);
    }, 0);
  }

  function detailed() {
    return Object.keys(cart).map(function (id) {
      var item = SORE.getMenuItem(id);
      return { item: item, qty: cart[id], line: item ? item.harga * cart[id] : 0 };
    }).filter(function (row) { return row.item; });
  }

  SORE.cart = {
    read: function () { return Object.assign({}, cart); },
    detailed: detailed,
    count: count,
    subtotal: subtotal,
    add: function (id, qty) {
      if (!SORE.getMenuItem(id)) return;
      var n = Math.max(1, parseInt(qty, 10) || 1);
      cart[id] = Math.min((cart[id] || 0) + n, 20);
      persist();
    },
    set: function (id, qty) {
      var n = parseInt(qty, 10);
      if (!SORE.getMenuItem(id)) return;
      if (n <= 0) delete cart[id];
      else cart[id] = Math.min(n, 20);
      persist();
    },
    remove: function (id) {
      delete cart[id];
      persist();
    },
    clear: function () {
      cart = {};
      persist();
    }
  };

  function syncIndicators() {
    var total = count();
    SORE.$$("[data-cart-count]").forEach(function (el) {
      el.textContent = String(total);
    });
    SORE.$$("[data-cart-label]").forEach(function (el) {
      el.textContent = total === 0 ? "Keranjang" : "Keranjang, " + total + " item";
    });
  }

  /* ---------- toast ---------- */

  var toastEl = null;
  var toastTimer = null;

  SORE.toast = function (message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2400);
  };

  SORE.hideToast = function () {
    window.clearTimeout(toastTimer);
    if (toastEl) toastEl.classList.remove("is-visible");
  };

  /* ---------- navigasi ---------- */

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("siteNav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Tutup navigasi" : "Buka navigasi");
      nav.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      setOpen(false);
    });
  }

  /* ---------- tambah ke keranjang ---------- */

  function initAdd() {
    document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-add]");
      if (!btn) return;
      var item = SORE.getMenuItem(btn.getAttribute("data-add"));
      if (!item) return;
      SORE.cart.add(item.id, 1);
      SORE.toast(item.nama + " masuk keranjang");
    });
  }

  function init() {
    renderTable();
    syncIndicators();
    initNav();
    initAdd();

    window.addEventListener("storage", function (event) {
      if (event.key === CART_KEY) {
        cart = normaliseCart(safeRead(CART_KEY, {}));
        syncIndicators();
        document.dispatchEvent(new CustomEvent("sore:cart", { detail: { cart: cart } }));
      }
    });

    document.addEventListener("sore:cart", syncIndicators);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
