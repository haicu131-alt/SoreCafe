/* QRIS dinamis (EMVCo) + render QR.
   Catatan: merchant di bawah adalah placeholder demo.
   Transaksi nyata memerlukan merchant ID dari acquirer/PJSP. */
(function () {
  "use strict";

  var SORE = (window.SORE = window.SORE || {});

  var MERCHANT = {
    pan: "936000000000000000",
    id: "SORE-DEMO-01",
    nama: "SORE DEMO",
    kota: "BANDUNG",
    kodePos: "40123",
    mcc: "5812"
  };

  function tlv(id, value) {
    var text = String(value);
    if (text.length > 99) throw new Error("TLV terlalu panjang: " + id);
    return id + ("0" + text.length).slice(-2) + text;
  }

  function crc16(text) {
    var crc = 0xffff;
    for (var i = 0; i < text.length; i++) {
      crc ^= text.charCodeAt(i) << 8;
      for (var bit = 0; bit < 8; bit++) {
        crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) : crc << 1;
        crc &= 0xffff;
      }
    }
    return ("000" + crc.toString(16).toUpperCase()).slice(-4);
  }

  function parseTlv(payload) {
    var out = {};
    var i = 0;
    while (i < payload.length) {
      if (i + 4 > payload.length) break;
      var id = payload.slice(i, i + 2);
      var len = parseInt(payload.slice(i + 2, i + 4), 10);
      if (!isFinite(len)) break;
      var value = payload.slice(i + 4, i + 4 + len);
      out[id] = value;
      i += 4 + len;
    }
    return out;
  }

  function buildQris(options) {
    var amount = Math.round(Number(options.amount));
    var orderId = String(options.orderId || "SORE").toUpperCase().slice(0, 25);
    if (!isFinite(amount) || amount <= 0) throw new Error("Nominal QRIS tidak valid");

    var account =
      tlv("00", "ID.CO.QRIS.WWW") +
      tlv("01", MERCHANT.pan) +
      tlv("02", MERCHANT.id) +
      tlv("03", "UMI");

    var payload =
      tlv("00", "01") +
      tlv("01", "12") +
      tlv("26", account) +
      tlv("52", MERCHANT.mcc) +
      tlv("53", "360") +
      tlv("54", String(amount)) +
      tlv("58", "ID") +
      tlv("59", MERCHANT.nama) +
      tlv("60", MERCHANT.kota) +
      tlv("61", MERCHANT.kodePos) +
      tlv("62", tlv("01", orderId)) +
      "6304";

    return payload + crc16(payload);
  }

  function validateQris(payload) {
    if (typeof payload !== "string" || payload.length < 30) return false;
    if (payload.slice(-8, -4) !== "6304") return false;
    var expected = crc16(payload.slice(0, -4));
    if (payload.slice(-4).toUpperCase() !== expected) return false;
    var tags = parseTlv(payload);
    if (!tags["54"] || !tags["26"] || !tags["63"]) return false;
    var account = parseTlv(tags["26"]);
    if (account["00"] !== "ID.CO.QRIS.WWW") return false;
    return true;
  }

  function makeQr(text, level) {
    if (typeof window.qrcode !== "function") return null;
    try {
      var auto = window.qrcode(0, level || "M");
      auto.addData(text);
      auto.make();
      return auto;
    } catch (err) {
      /* jatuh ke versi manual */
    }
    for (var type = 1; type <= 40; type++) {
      try {
        var qr = window.qrcode(type, level || "M");
        qr.addData(text);
        qr.make();
        return qr;
      } catch (err) {
        /* coba versi berikutnya */
      }
    }
    return null;
  }

  function qrSvg(text, options) {
    var opts = options || {};
    var qr = makeQr(text, opts.level || "M");
    if (!qr) return "";
    var cell = opts.cellSize || 6;
    var margin = typeof opts.margin === "number" ? opts.margin : cell * 4;
    return qr.createSvgTag({
      cellSize: cell,
      margin: margin,
      scalable: true,
      alt: { text: opts.label || "Kode QR" }
    });
  }

  function renderQr(target, text, options) {
    if (!target) return false;
    var markup = qrSvg(text, options);
    if (!markup) {
      target.innerHTML = '<p style="font-size:11px;color:#a64b2a;text-align:center">QR gagal dibuat.</p>';
      return false;
    }
    target.innerHTML = markup;
    return true;
  }

  SORE.qris = {
    merchant: MERCHANT,
    build: buildQris,
    validate: validateQris,
    parse: parseTlv,
    crc16: crc16,
    makeQr: makeQr,
    svg: qrSvg,
    render: renderQr
  };
})();
