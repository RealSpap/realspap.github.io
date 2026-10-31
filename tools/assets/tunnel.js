/* Gabarit commun : fonctions partagées des trois outils. Aucune dépendance, aucun réseau. window.Tunnel */
(function () {
  "use strict";
  var T = {};
  T.reduced = function () {
    return location.hash.indexOf("still") > 0 || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  };
  T.toast = function (msg) {
    var e = document.getElementById("xp-toast");
    if (!e) { e = document.createElement("div"); e.id = "xp-toast"; e.className = "xp-toast"; e.setAttribute("role", "status"); document.body.appendChild(e); }
    e.textContent = msg; e.className = "xp-toast on";
    setTimeout(function () { e.className = "xp-toast"; }, 1800);
  };
  T.copy = function (text, ok) {
    try { navigator.clipboard.writeText(text).then(function () { T.toast(ok || "Copied"); }, function () { T.toast(text); }); } catch (x) { T.toast(text); }
  };
  /* l'état d'un résultat vit après le # : un navigateur ne l'envoie jamais à un serveur */
  T.state = {
    read: function () {
      var o = {}; location.hash.replace(/^#/, "").split("&").forEach(function (p) { if (!p) return; var i = p.indexOf("="); if (i < 0) o[p] = true; else try { o[decodeURIComponent(p.slice(0, i))] = decodeURIComponent(p.slice(i + 1)); } catch (e) { /* fragment mal formé : ignoré */ } });
      return o;
    },
    link: function (o) {
      return location.href.split("#")[0] + "#" + Object.keys(o).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(o[k]); }).join("&");
    }
  };
  /* lignes d'avancement : lines = textes ; rend la main à done() quand toutes sont affichées */
  T.steps = function (box, lines, done) {
    box.style.display = "block"; box.innerHTML = "";
    lines.forEach(function (l, i) {
      var d = document.createElement("div"); d.textContent = l; box.appendChild(d);
      setTimeout(function () { d.className = "in"; }, T.reduced() ? 0 : i * 450);
    });
    setTimeout(done, T.reduced() ? 0 : lines.length * 450 + 200);
  };
  T.reveal = function (resultEl, scrollEl) {
    resultEl.style.display = "block";
    (scrollEl || resultEl).scrollIntoView({ behavior: T.reduced() ? "auto" : "smooth", block: "start" });
  };
  /* image de partage 1200 x 630 dessinée sur l'appareil : jamais de score, jamais l'adresse d'un tiers.
     o = {kicker, lines:[2 phrases], accentLine, meta:[2 lignes], footer, filename} ; renvoie le dataURL (utile aux tests) */
  T.shareImage = function (o, noDownload) {
    var c = document.createElement("canvas"); c.width = 1200; c.height = 630; var g = c.getContext("2d");
    var dark = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
    var th = document.documentElement.getAttribute("data-theme"); if (th) dark = th === "dark";
    var bg = dark ? "#14130f" : "#f6f4ef", tx = dark ? "#f3efe3" : "#1c1a16", mu = dark ? "#b3ac9c" : "#57534a", ac = dark ? "#e0b878" : "#8a5f22";
    g.fillStyle = bg; g.fillRect(0, 0, 1200, 630); g.fillStyle = ac; g.fillRect(0, 0, 12, 630);
    g.fillStyle = mu; g.font = "28px system-ui,sans-serif"; g.fillText(String(o.kicker || "").toUpperCase(), 70, 90);
    var lines = o.lines || [];
    g.font = "700 58px Georgia,serif";
    if (o.title) { /* titre libre : coupé en 3 lignes au plus, à 1060 px */
      var words = String(o.title).split(" "), cur = "", acc = [];
      words.forEach(function (w) { var test = cur ? cur + " " + w : w; if (g.measureText(test).width > 1060 && cur) { acc.push(cur); cur = w; } else cur = test; });
      if (cur) acc.push(cur); lines = acc.slice(0, 3); if (acc.length > 3) lines[2] = lines[2].replace(/\s*\S*$/, "") + "\u2026";
    }
    g.fillStyle = tx; lines.slice(0, 3).forEach(function (l, i) { g.fillText(l, 70, 190 + i * 72); });
    if (o.accentLine) { g.fillStyle = ac; g.font = "34px ui-monospace,Menlo,monospace"; g.fillText(o.accentLine, 70, 400); }
    g.fillStyle = mu; g.font = "26px ui-monospace,Menlo,monospace"; (o.meta || []).slice(0, 2).forEach(function (l, i) { g.fillText(l, 70, 470 + i * 42); });
    g.font = "24px system-ui,sans-serif"; g.fillText(o.footer || "", 70, 580);
    var url = c.toDataURL("image/png");
    if (!noDownload) { var a = document.createElement("a"); a.download = o.filename || "result.png"; a.href = url; a.click(); T.toast("Image saved"); }
    return url;
  };
  window.Tunnel = T;
})();
