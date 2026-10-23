/* Halaman menu: filter, pencarian, keranjang. */
(function () {
  "use strict";

  var SORE = window.SORE || {};
  var grid = document.getElementById("menuGrid");
  if (!grid) return;

  var filtersEl = document.getElementById("filters");
  var searchInput = document.getElementById("menuSearch");
  var resultLine = document.getElementById("resultLine");
  var drawer = document.getElementById("cartDrawer");
  var backdrop = document.getElementById("drawerBackdrop");
  var drawerItems = document.getElementById("drawerItems");
  var drawerFoot = document.getElementById("drawerFoot");
  var drawerSubtotal = document.getElementById("drawerSubtotal");
  var drawerMeta = document.getElementById("drawerMeta");
  var sticky = document.getElementById("stickyCart");
  var scCount = document.getElementById("scCount");
  var scTotal = document.getElementById("scTotal");
  var lastTrigger = null;

  var params = new URLSearchParams(window.location.search);
  var state = {
    category: params.get("kategori") || "semua",
    query: ""
  };

  function categoryLabel(id) {
    var found = (SORE.CATEGORIES || []).filter(function (c) { return c.id === id; })[0];
    return found ? found.label : "Semua";
  }

  function renderFilters() {
    if (!filtersEl) return;
    filtersEl.innerHTML = (SORE.CATEGORIES || []).map(function (cat) {
      var active = cat.id === state.category;
      return '<button type="button" class="filter-btn" data-filter="' + cat.id + '" aria-pressed="' + active + '">' + SORE.escapeHtml(cat.label) + "</button>";
    }).join("");
  }

  function itemMarkup(item) {
    var tag = item.tag ? '<span class="item-tag">' + SORE.escapeHtml(item.tag) + "</span>" : "";
    return (
      '<article class="item-card" data-id="' + item.id + '">' +
        '<div class="item-media">' +
          '<img src="' + item.img + '" alt="' + SORE.escapeHtml(item.nama) + '" width="800" height="1000" loading="lazy" decoding="async">' +
          tag +
        "</div>" +
        '<div class="item-body">' +
          '<div class="item-top">' +
            '<h3 class="item-name">' + SORE.escapeHtml(item.nama) + "</h3>" +
            '<span class="item-price">' + SORE.formatRp(item.harga) + "</span>" +
          "</div>" +
          '<p class="item-desc">' + SORE.escapeHtml(item.deskripsi) + "</p>" +
          '<div class="item-bottom">' +
            '<span class="item-cat">' + SORE.escapeHtml(categoryLabel(item.kategori)) + "</span>" +
            '<button class="add-btn" type="button" data-add="' + item.id + '" aria-label="Tambah ' + SORE.escapeHtml(item.nama) + ' ke keranjang">' +
              '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>' +
            "</button>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function visibleItems() {
    var q = state.query.trim().toLowerCase();
    return (SORE.MENU || []).filter(function (item) {
      var inCategory = state.category === "semua" || item.kategori === state.category;
      if (!inCategory) return false;
      if (!q) return true;
      return (item.nama + " " + item.deskripsi).toLowerCase().indexOf(q) !== -1;
    });
  }

  function renderMenu() {
    var items = visibleItems();
    if (resultLine) {
      resultLine.innerHTML = "<span>" + items.length + " item · " + SORE.escapeHtml(categoryLabel(state.category)) + "</span><span>Harga sudah termasuk pajak</span>";
    }
    if (!items.length) {
      grid.innerHTML =
        '<div class="menu-empty">' +
          '<svg width="46" height="46" viewBox="0 0 46 46" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="20" cy="20" r="11"/><path d="M28 28l8 8M16 20h8M20 16v8"/></svg>' +
          "<h3>Tidak ada yang cocok</h3>" +
          "<p>Coba kata lain, atau lihat semua menu.</p>" +
          '<button class="btn btn--ghost" type="button" data-reset-menu>Lihat semua menu</button>' +
        "</div>";
      return;
    }
    grid.innerHTML = items.map(itemMarkup).join("");
  }

  function renderFiltersState() {
    SORE.$$("[data-filter]", filtersEl).forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-filter") === state.category ? "true" : "false");
    });
  }

  function setCategory(id) {
    state.category = id;
    renderFiltersState();
    renderMenu();
    var url = new URL(window.location.href);
    if (id === "semua") url.searchParams.delete("kategori");
    else url.searchParams.set("kategori", id);
    window.history.replaceState({}, "", url);
  }

  /* ---------- keranjang ---------- */

  function renderDrawer() {
    var rows = SORE.cart.detailed();
    var meja = SORE.getMeja();
    var count = SORE.cart.count();

    if (drawerMeta) {
      drawerMeta.textContent = (meja ? "Meja " + meja : "Meja belum dipilih") + " · " + count + " item";
    }

    if (!rows.length) {
      if (drawerItems) {
        drawerItems.innerHTML =
          '<div class="cart-empty">' +
            '<svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M14 18h24l-2.4 24H16.4L14 18Z"/><path d="M20 18v-3a6 6 0 0 1 12 0v3"/><path d="M21 27c2.2-1.4 3.2.8 5 0s3-1.6 5 0"/></svg>' +
            "<h3>Keranjang masih kosong</h3>" +
            "<p>Pilih kopi atau makanan dulu, lalu kembali ke sini.</p>" +
            '<button class="btn btn--ghost" type="button" data-close-cart>Lihat menu</button>' +
          "</div>";
      }
      if (drawerFoot) drawerFoot.hidden = true;
    } else {
      if (drawerItems) {
        drawerItems.innerHTML = rows.map(function (row) {
          var item = row.item;
          return (
            '<div class="cart-line" data-id="' + item.id + '">' +
              '<img src="' + item.img + '" alt="" width="64" height="80" loading="lazy" decoding="async">' +
              "<div>" +
                '<div class="cart-line-name">' + SORE.escapeHtml(item.nama) + "</div>" +
                '<div class="cart-line-price">' + SORE.formatRp(item.harga) + " / item</div>" +
              "</div>" +
              '<div class="cart-line-right">' +
                '<div class="qty">' +
                  '<button type="button" data-cart-minus="' + item.id + '" aria-label="Kurangi ' + SORE.escapeHtml(item.nama) + '">−</button>' +
                  "<span>" + row.qty + "</span>" +
                  '<button type="button" data-cart-plus="' + item.id + '" aria-label="Tambah ' + SORE.escapeHtml(item.nama) + '">+</button>' +
                "</div>" +
                '<button class="cart-remove" type="button" data-cart-remove="' + item.id + '">Hapus</button>' +
              "</div>" +
            "</div>"
          );
        }).join("");
      }
      if (drawerFoot) drawerFoot.hidden = false;
      if (drawerSubtotal) drawerSubtotal.textContent = SORE.formatRp(SORE.cart.subtotal());
    }

    if (sticky) {
      sticky.classList.toggle("is-visible", count > 0);
      sticky.setAttribute("aria-hidden", count > 0 ? "false" : "true");
      document.body.classList.toggle("has-sticky-cart", count > 0);
    }
    if (scCount) {
      scCount.textContent = count + " item" + (meja ? " · Meja " + meja : "");
    }
    if (scTotal) scTotal.textContent = SORE.formatRp(SORE.cart.subtotal());
  }

  function openDrawer(trigger) {
    if (!drawer) return;
    SORE.hideToast();
    lastTrigger = trigger || document.activeElement;
    renderDrawer();
    drawer.classList.add("is-open");
    if (backdrop) backdrop.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    var closeBtn = drawer.querySelector("[data-close-cart]");
    if (closeBtn) window.setTimeout(function () { closeBtn.focus(); }, 40);
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    if (backdrop) backdrop.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
  }

  function trapFocus(event) {
    if (!drawer || !drawer.classList.contains("is-open") || event.key !== "Tab") return;
    var focusable = SORE.$$('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])', drawer)
      .filter(function (el) { return el.offsetParent !== null; });
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ---------- event ---------- */

  if (filtersEl) {
    filtersEl.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-filter]");
      if (btn) setCategory(btn.getAttribute("data-filter"));
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      state.query = searchInput.value;
      renderMenu();
    });
  }

  grid.addEventListener("click", function (event) {
    if (event.target.closest("[data-reset-menu]")) {
      state.category = "semua";
      state.query = "";
      if (searchInput) searchInput.value = "";
      renderFiltersState();
      renderMenu();
      return;
    }
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
    }
  });

  if (drawer) {
    drawer.addEventListener("click", function (event) {
      if (event.target.closest("[data-close-cart]")) {
        closeDrawer();
        return;
      }
      if (event.target.closest("[data-cart-remove]")) {
        SORE.cart.remove(event.target.closest("[data-cart-remove]").getAttribute("data-cart-remove"));
        return;
      }
      var minus = event.target.closest("[data-cart-minus]");
      if (minus) {
        var id = minus.getAttribute("data-cart-minus");
        SORE.cart.set(id, (SORE.cart.read()[id] || 0) - 1);
        return;
      }
      var plus = event.target.closest("[data-cart-plus]");
      if (plus) {
        var idPlus = plus.getAttribute("data-cart-plus");
        SORE.cart.set(idPlus, (SORE.cart.read()[idPlus] || 0) + 1);
      }
    });
  }

  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && drawer && drawer.classList.contains("is-open")) {
      closeDrawer();
      return;
    }
    trapFocus(event);
  });

  document.addEventListener("sore:cart", renderDrawer);
  document.addEventListener("sore:table", renderDrawer);

  var headerCart = document.querySelector(".cart-link");
  if (headerCart) {
    headerCart.addEventListener("click", function (event) {
      event.preventDefault();
      openDrawer(headerCart);
    });
  }

  document.addEventListener("click", function (event) {
    if (event.target.closest("[data-open-cart]")) {
      openDrawer(event.target.closest("[data-open-cart]"));
    }
  });

  /* ---------- start ---------- */

  if (!["semua", "kopi", "non-kopi", "makanan", "camilan"].includes(state.category)) {
    state.category = "semua";
  }
  renderFilters();
  renderFiltersState();
  renderMenu();
  renderDrawer();
})();
