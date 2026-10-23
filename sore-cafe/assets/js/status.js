/* Halaman status pesanan (demo, dihitung dari waktu pesanan). */
(function () {
  "use strict";

  var SORE = window.SORE || {};
  var content = document.getElementById("statusContent");
  var empty = document.getElementById("statusEmpty");
  if (!content || !empty) return;

  var params = new URLSearchParams(window.location.search);
  var code = params.get("order");

  function readOrder() {
    if (!code) return null;
    try {
      var list = JSON.parse(window.localStorage.getItem("sore.orders.v1") || "[]");
      if (!Array.isArray(list)) return null;
      return list.filter(function (o) { return o && o.kode === code; })[0] || null;
    } catch (err) {
      return null;
    }
  }

  var order = readOrder();
  if (!order) {
    content.hidden = true;
    empty.hidden = false;
    var link = empty.querySelector("[data-menu-link]");
    if (link) {
      var meja = SORE.getMeja();
      if (meja) link.href = "menu.html?meja=" + meja;
    }
    return;
  }

  var heroTitle = document.getElementById("statusTitle");
  var pill = document.getElementById("statusPill");
  var heroMeta = document.getElementById("statusHeroMeta");
  var timeline = document.getElementById("timeline");
  var itemsEl = document.getElementById("statusItems");
  var totalEl = document.getElementById("statusTotal");
  var metaCode = document.getElementById("metaCode");
  var metaMeja = document.getElementById("metaMeja");
  var metaNama = document.getElementById("metaNama");
  var metaTipe = document.getElementById("metaTipe");
  var metaWaktu = document.getElementById("metaWaktu");
  var noteEl = document.getElementById("statusCatatan");
  var noteWrap = document.getElementById("statusCatatanWrap");
  var again = document.getElementById("againLink");

  var PHASES = [
    {
      key: "diterima",
      title: "Pesanan diterima.",
      pill: "Diterima",
      desc: "Pesanan masuk ke dapur. Kami mulai dari minuman, lalu makanan.",
      stepDesc: "Kode pesanan tercatat dan diteruskan ke bar."
    },
    {
      key: "disiapkan",
      title: "Sedang disiapkan.",
      pill: "Disiapkan",
      desc: "Bar dan dapur jalan bersamaan. Biasanya selesai dalam 8 sampai 12 menit.",
      stepDesc: "Minuman diseduh, makanan dimasak sesuai urutan pesanan."
    },
    {
      key: "siap",
      title: "Siap diantar.",
      pill: "Siap",
      desc: "Semua item sudah di tray. Kami antar ke meja, atau panggil namamu kalau dibungkus.",
      stepDesc: "Pesanan siap. Kalau lebih dari lima menit belum datang, panggil barista."
    }
  ];

  function phaseIndex(waktu) {
    var minutes = (Date.now() - new Date(waktu).getTime()) / 60000;
    if (minutes < 2) return 0;
    if (minutes < 8) return 1;
    return 2;
  }

  function timeText(date) {
    try {
      return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(date).replace(":", ".");
    } catch (err) {
      return "--.--";
    }
  }

  function fullDate(date) {
    try {
      return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date);
    } catch (err) {
      return "";
    }
  }

  function typeLabel(value) {
    return value === "takeaway" ? "Dibungkus" : "Makan di tempat";
  }

  function render() {
    var phase = phaseIndex(order.waktu);
    var info = PHASES[phase];
    var created = new Date(order.waktu);
    var stepTimes = [
      new Date(created.getTime()),
      new Date(created.getTime() + 2 * 60000),
      new Date(created.getTime() + 8 * 60000)
    ];

    if (heroTitle) heroTitle.textContent = info.title;
    if (pill) {
      pill.textContent = info.pill;
      pill.classList.toggle("is-ready", phase === 2);
    }
    if (heroMeta) {
      heroMeta.innerHTML =
        "Meja <b>" + order.meja + "</b> <span class=\"dot\">·</span> atas nama <b>" +
        SORE.escapeHtml(order.nama) + "</b> <span class=\"dot\">·</span> <b>" +
        SORE.escapeHtml(order.kode) + "</b>";
    }

    if (timeline) {
      timeline.innerHTML = PHASES.map(function (step, index) {
        var status = index < phase ? "done" : index === phase ? "current" : "next";
        var time;
        if (status === "done") time = "Selesai " + timeText(stepTimes[index]);
        else if (status === "current") time = phase === 0 ? "Baru saja" : "Berjalan sekarang";
        else time = "Menunggu";
        return (
          '<li class="tl-step is-' + status + '">' +
            '<span class="tl-dot" aria-hidden="true"></span>' +
            "<div>" +
              '<h2 class="tl-title">' + SORE.escapeHtml(step.title.replace(".", "")) + "</h2>" +
              '<span class="tl-time">' + time + "</span>" +
              '<p class="tl-desc">' + SORE.escapeHtml(step.stepDesc) + "</p>" +
            "</div>" +
          "</li>"
        );
      }).join("");
    }

    if (metaCode) metaCode.textContent = order.kode;
    if (metaMeja) metaMeja.textContent = "Meja " + order.meja;
    if (metaNama) metaNama.textContent = order.nama;
    if (metaTipe) metaTipe.textContent = typeLabel(order.tipe);
    if (metaWaktu) metaWaktu.textContent = fullDate(created) + ", " + timeText(created);

    if (itemsEl) {
      itemsEl.innerHTML = (order.items || []).map(function (item) {
        return (
          "<li>" +
            '<span class="sl-name">' + item.qty + "× " + SORE.escapeHtml(item.nama) + "</span>" +
            '<span class="sl-price">' + SORE.formatRp(item.harga * item.qty) + "</span>" +
          "</li>"
        );
      }).join("");
    }

    if (totalEl) totalEl.textContent = SORE.formatRp(order.total);
    if (noteEl && noteWrap) {
      if (order.catatan) {
        noteEl.textContent = order.catatan;
        noteWrap.hidden = false;
      } else {
        noteWrap.hidden = true;
      }
    }
    if (again) again.href = "menu.html?meja=" + order.meja;
    else if (empty) {
      var menuLink = empty.querySelector("[data-menu-link]");
      if (menuLink) menuLink.href = "menu.html?meja=" + order.meja;
    }
  }

  render();
  window.setInterval(render, 20000);

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) render();
  });
})();
