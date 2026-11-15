(function () { var t = document.querySelectorAll('time[data-utc]'); function ago(s) { var d = Math.max(0, (Date.now() - Date.parse(s)) / 60000); return d < 90 ? Math.round(d) + ' minutes ago' : d < 2880 ? Math.round(d / 60) + ' hours ago' : Math.round(d / 1440) + ' days ago'; }
  [].forEach.call(t, function (e) { var s = e.getAttribute('data-utc'); if (!isNaN(Date.parse(s))) e.textContent = ago(s); }); })();
(function () { var el = document.getElementById('live'); if (!el || !window.fetch) return;
  function ago(ms) { var h = ms / 3600000; return h < 1.5 ? 'about an hour' : h < 48 ? Math.round(h) + ' hours' : Math.round(h / 24) + ' days'; }
  fetch('https://raw.githubusercontent.com/RealSpap/authority-risk-oracle-showcase/watch-data/status.json', { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('status ' + r.status); return r.json(); }).then(function (s) {
    var t = Date.parse(s.run_utc); if (isNaN(t)) throw new Error('no run_utc');
    var out = 'Read just now: state ' + String(s.state || 'unknown') + ', last run ' + String(s.run_utc) + ' (' + ago(Date.now() - t) + ' ago)';
    if (typeof s.hours_since_previous_run === 'number') out += ', started ' + s.hours_since_previous_run + ' hours after the run before';
    if (typeof s.runs_7d === 'number') out += ', ' + s.runs_7d + ' runs in the last 7 days';
    el.textContent = out + '. The tables below are the snapshot of the build. Source:';
  }).catch(function () { el.textContent = 'Could not be read just now. The tables below are the snapshot of the build. Read it in'; }); })();
