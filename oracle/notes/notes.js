(function () {
  var box = document.getElementById('nfilters'), lis = [].slice.call(document.querySelectorAll('#nlist li[data-type]')); if (!box || !lis.length) return;
  function opts(attr, sep) { var s = {}; lis.forEach(function (li) { (li.getAttribute(attr) || '').split(sep).forEach(function (v) { if (v) s[v] = 1; }); }); return Object.keys(s).sort(); }
  function field(id, label, el) { var d = document.createElement('div'), l = document.createElement('label'); l.htmlFor = id; l.textContent = label; el.id = id; d.appendChild(l); d.appendChild(el); box.appendChild(d); return el; }
  function select(id, label, values) { var s = document.createElement('select'), o = document.createElement('option'); o.value = ''; o.textContent = 'All'; s.appendChild(o); values.forEach(function (v) { o = document.createElement('option'); o.value = v; o.textContent = v; s.appendChild(o); }); return field(id, label, s); }
  var q = document.createElement('input'); q.type = 'search'; q.autocomplete = 'off'; field('nq', 'Search', q);
  var ty = select('ntype', 'Type', ['Findings', 'Corrections', 'Audits and snapshots']), ch = select('nchain', 'Chain', opts('data-chains', ',')), pr = select('nprot', 'Protocol', opts('data-protocols', '|')), mo = select('nmonth', 'Month', opts('data-month', ',').reverse());
  var out = document.getElementById('ncount'), ctl = [q, ty, ch, pr, mo], keys = ['q', 'type', 'chain', 'protocol', 'month'];
  var p = new URLSearchParams(location.search); ctl.forEach(function (c, i) { if (p.get(keys[i])) c.value = p.get(keys[i]); });
  function apply() {
    var t = q.value.trim().toLowerCase(), n = 0, any = ctl.some(function (c) { return c.value; });
    lis.forEach(function (li) {
      var ok = (!t || li.getAttribute('data-text').indexOf(t) >= 0) && (!ty.value || li.getAttribute('data-type') === ty.value) && (!ch.value || (',' + li.getAttribute('data-chains') + ',').indexOf(',' + ch.value + ',') >= 0) &&
               (!pr.value || ('|' + li.getAttribute('data-protocols') + '|').indexOf('|' + pr.value + '|') >= 0) && (!mo.value || li.getAttribute('data-month') === mo.value);
      li.hidden = !ok; if (ok) n++;
    });
    [].slice.call(document.querySelectorAll('[data-sec]')).forEach(function (s) { var v = s.querySelectorAll('li:not([hidden])').length; s.hidden = !v; if (s.tagName === 'DETAILS' && any) s.open = v > 0; });
    out.textContent = n + ' of ' + lis.length + ' notes';
    var u = new URLSearchParams(); ctl.forEach(function (c, i) { if (c.value) u.set(keys[i], c.value); }); history.replaceState(null, '', location.pathname + (u.toString() ? '?' + u : ''));
  }
  ctl.forEach(function (c) { c.addEventListener('input', apply); c.addEventListener('change', apply); }); apply();
})();
