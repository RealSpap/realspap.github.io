/* Check your Safe, part 1 (signers): the reading logic of the former page, plus the five-moment page around it.
   The block "Part 1 logic" below is the former page's code (decodeAddressArray, isExecutionError, the endpoint loop, findMatches),
   with one change: the block tag and the call data are parameters instead of the literals 'latest' and SELECTOR.
   outils/safe_equivalence.mjs runs the former script and this one on the same recorded answers and compares what each shows.
   The address you type goes only to the public Ethereum nodes listed in RPC_ENDPOINTS, and only after a click. */
(function (root) {
'use strict';

/* Embedded reference dataset (replaced at build time by the former page's dataset, unchanged). */
var FLAGGED_DATA = {"flagged_addresses": [{"address": "0x8f02b4a44Eacd9b8eE7739aa0BA58833DD45d002", "display_name": "This owner is a signer shared by Morpho Blue and Angle Protocol", "protocols": ["Morpho Blue", "Angle Protocol"], "confidence": "Confirmed: this exact address was checked against the protocols' own public signer disclosures; the named mapping is not published here", "one_line_context": "Owner of both Morpho Blue's governance Safe (8 Superchain chains) and Angle Protocol's Guardian Safe (Optimism, Base, Celo): eleven Superchain Safe deployments plus both protocols' Ethereum mainnet Safes, and Morpho Blue's DAO Safe on Arbitrum."}, {"address": "0x9A73D57BB1fB280C5672A13f655675De25F13b70", "display_name": "This owner is a signer shared by Compound III and Resolv", "protocols": ["Compound III", "Resolv"], "confidence": "Pseudonymous: the address recurs across protocols but no primary source ties it to its holder", "one_line_context": "Owner of Compound III's Pause Guardian Safe, which the README lists on nine chains (threshold 5-of-9), and of Resolv's Token Owner Safes: at least 12 Safe deployments on 10 chains across the two protocols, read on 2026-10-14. Two protocols with no institutional relationship."}, {"address": "0xb291232F480F41c75802C4a60F1D2AC03404Afef", "display_name": "This owner is a signer shared by seven of Aave's own Safes", "protocols": ["Aave"], "confidence": "Pseudonymous: no primary source ties this address to its holder", "one_line_context": "Confirmed on Aave's core Protocol Guardian Safe on four chains (Optimism, Base, Soneium, Celo) plus a separate cluster controlling four of Aave's Ink and Celo role-specific Safes (AFC, Budget Incentive, Ahab, Alc): seven Safe formations across five chains, all within Aave alone (a single-protocol concentration, not a cross-protocol one). The address is itself a 1-of-3 Safe (read on 2026-10-01)."}]};

/* ------------------------------------------------------------------ Part 1 logic (former page) */

/* getOwners() has no arguments, so the call data is just the 4-byte selector. */
var SELECTOR = '0xa0e67e2b';
var SELECTOR_THRESHOLD = '0xe75235b8';   /* getThreshold() */
var SELECTOR_VERSION = '0xffa1ad74';     /* VERSION() */

var RPC_ENDPOINTS = [
  'https://ethereum-rpc.publicnode.com',
  'https://eth.drpc.org',
  'https://1rpc.io/eth'
];

var ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

function decodeAddressArray(hexData) {
  var data = hexData.indexOf('0x') === 0 ? hexData.slice(2) : hexData;
  if (data.length < 128) {
    throw new Error('return data too short to be an address[]');
  }
  var offsetWord = data.slice(0, 64);
  var offset = parseInt(offsetWord, 16) * 2;
  if (!(offset >= 0) || offset + 64 > data.length) {
    throw new Error('invalid array offset in return data');
  }
  var lengthWord = data.slice(offset, offset + 64);
  var length = parseInt(lengthWord, 16);
  if (!(length >= 0) || length > 10000) {
    throw new Error('invalid array length in return data');
  }
  var pos = offset + 64;
  var owners = [];
  for (var i = 0; i < length; i++) {
    var word = data.slice(pos, pos + 64);
    if (word.length < 64) {
      throw new Error('return data truncated before end of array');
    }
    owners.push('0x' + word.slice(24));
    pos += 64;
  }
  return owners;
}

/* A failed execution is a real answer; anything else is an endpoint problem. */
function isExecutionError(err) {
  if (!err) return false;
  if (err.code === 3) return true;
  return /revert|invalid opcode|out of gas|stack underflow|stack overflow|invalid jump/i.test(String(err.message || ''));
}

var VERSION_RE = /^\d+\.\d+\.\d+(\+L2)?$/;   /* the version is free text on chain: only a version number is ever shown */
var lastEndpoint = null;   /* the node that answered the latest successful call (shown in the result) */

/* Tries each RPC endpoint in order. Stops at the first one that actually answers (data or a revert).
   Advances to the next endpoint on any other failure, including a JSON-RPC error such as a rate limit. */
function ethCall(address, data, tag) {
  var payload = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_call',
    params: [{ to: address, data: data }, tag]
  });

  var i = 0;
  var lastNetworkError = null;

  function tryNext() {
    if (i >= RPC_ENDPOINTS.length) {
      var msg = 'No RPC endpoint responded';
      if (lastNetworkError) {
        msg += ': ' + lastNetworkError.message;
      }
      return Promise.reject(new Error(msg));
    }
    var endpoint = RPC_ENDPOINTS[i];
    i++;
    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload
    }).then(function (resp) {
      if (!resp.ok) {
        lastNetworkError = new Error(endpoint + ' returned HTTP ' + resp.status);
        return tryNext();
      }
      return resp.json().then(function (json) {
        if (json && json.error) {
          if (isExecutionError(json.error)) {
            lastEndpoint = endpoint;
            return { status: 'revert', message: json.error.message || 'execution reverted' };
          }
          lastNetworkError = new Error(endpoint + ': ' + (json.error.message || ('JSON-RPC error ' + json.error.code)));
          return tryNext();
        }
        if (!json || typeof json.result !== 'string' || !/^0x[0-9a-fA-F]*$/.test(json.result)) {
          lastNetworkError = new Error(endpoint + ': malformed response');
          return tryNext();
        }
        if (json.result === '0x') {
          lastEndpoint = endpoint;
          return { status: 'revert', message: 'empty result' };
        }
        lastEndpoint = endpoint;
        return { status: 'ok', data: json.result };
      }, function () {
        lastNetworkError = new Error(endpoint + ': unparseable response');
        return tryNext();
      });
    }, function (err) {
      lastNetworkError = err;
      return tryNext();
    });
  }

  return tryNext();
}

function ethCallGetOwners(address, tag) {
  return ethCall(address, SELECTOR, tag || 'latest');
}

function findMatches(owners) {
  var matches = [];
  for (var i = 0; i < owners.length; i++) {
    var ownerLower = owners[i].toLowerCase();
    for (var j = 0; j < FLAGGED_DATA.flagged_addresses.length; j++) {
      var entry = FLAGGED_DATA.flagged_addresses[j];
      if (entry.address.toLowerCase() === ownerLower) {
        matches.push({ owner: owners[i], entry: entry });
      }
    }
  }
  return matches;
}

/* ------------------------------------------------------------------ new readings (block, threshold, version), same endpoints */

/* Any other JSON-RPC method (block number, block header): the same endpoint order, a JSON-RPC error moves on to the next node. */
function rpc(method, params) {
  var payload = JSON.stringify({ jsonrpc: '2.0', id: 1, method: method, params: params });
  var i = 0, last = null;
  function tryNext() {
    if (i >= RPC_ENDPOINTS.length) return Promise.reject(new Error('No RPC endpoint responded' + (last ? ': ' + last.message : '')));
    var endpoint = RPC_ENDPOINTS[i]; i++;
    return fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload }).then(function (resp) {
      if (!resp.ok) { last = new Error(endpoint + ' returned HTTP ' + resp.status); return tryNext(); }
      return resp.json().then(function (json) {
        if (!json || json.error || json.result === undefined || json.result === null) { last = new Error(endpoint + ': no result'); return tryNext(); }
        lastEndpoint = endpoint;
        return json.result;
      }, function () { last = new Error(endpoint + ': unparseable response'); return tryNext(); });
    }, function (err) { last = err; return tryNext(); });
  }
  return tryNext();
}

function decodeUint(hex) {
  var d = hex.indexOf('0x') === 0 ? hex.slice(2) : hex;
  if (d.length < 64) throw new Error('short uint');
  return parseInt(d.slice(0, 64), 16);
}

function decodeString(hex) {
  var d = hex.indexOf('0x') === 0 ? hex.slice(2) : hex;
  var off = parseInt(d.slice(0, 64), 16) * 2, len = parseInt(d.slice(off, off + 64), 16);
  var body = d.slice(off + 64, off + 64 + len * 2), out = '';
  if (!(len > 0 && len < 64) || body.length < len * 2) throw new Error('bad string');
  for (var i = 0; i < body.length; i += 2) out += String.fromCharCode(parseInt(body.slice(i, i + 2), 16));
  return out;
}

/* One reading, pinned to a block. blockNum null = the latest block, read first so owners and threshold come from the same block.
   Resolves {kind:'notsafe'|'ok', block, owners, threshold, version, time, endpoint, matches}; rejects when no node answers. */
function checkSafe(address, blockNum, onStage) {
  var stage = onStage || function () {};
  var pin = blockNum ? Promise.resolve(blockNum) : rpc('eth_blockNumber', []).then(function (h) { return parseInt(h, 16); });
  return pin.then(function (n) {
    var tag = '0x' + n.toString(16);
    stage('block', { block: n, endpoint: blockNum ? null : lastEndpoint });
    return ethCallGetOwners(address, tag).then(function (o) {
      if (o.status === 'revert') return { kind: 'notsafe', block: n };
      var owners;
      try { owners = decodeAddressArray(o.data); } catch (e) { return { kind: 'notsafe', block: n }; }
      var endpoint = lastEndpoint;
      stage('owners', { block: n, endpoint: endpoint, owners: owners.length });
      var soft = function (p) { return p.then(function (x) { return x; }, function () { return null; }); };
      return Promise.all([
        soft(ethCall(address, SELECTOR_THRESHOLD, tag).then(function (r) { return r.status === 'ok' ? decodeUint(r.data) : null; })),
        soft(ethCall(address, SELECTOR_VERSION, tag).then(function (r) { var v = r.status === 'ok' ? decodeString(r.data) : null; return v && VERSION_RE.test(v) ? v : null; })),
        soft(rpc('eth_getBlockByNumber', [tag, false]).then(function (b) { return parseInt(b.timestamp, 16); }))
      ]).then(function (v) {
        return { kind: 'ok', block: n, owners: owners, threshold: (v[0] >= 1 && v[0] <= owners.length) ? v[0] : null, version: v[1], time: v[2], endpoint: endpoint, matches: findMatches(owners) };
      });
    });
  });
}

var core = {
  FLAGGED_DATA: FLAGGED_DATA, RPC_ENDPOINTS: RPC_ENDPOINTS, ADDRESS_RE: ADDRESS_RE,
  decodeAddressArray: decodeAddressArray, isExecutionError: isExecutionError, ethCall: ethCall, ethCallGetOwners: ethCallGetOwners,
  findMatches: findMatches, rpc: rpc, decodeUint: decodeUint, decodeString: decodeString, checkSafe: checkSafe
};
if (typeof document === 'undefined') { root.SafeCore = core; return; }

/* ------------------------------------------------------------------ the page */

var T = root.Tunnel;
var EXAMPLE = '0xd6889f307be1b83bb355d5da7d4478fb0d2af547';   /* Resolv's Ethereum Safe, listed in the research README (4-of-6 on 14 Oct 2026) */
var README_HEAD = 'cd823c1';   /* replaced at build time by the pinned head of the research repository */
var SHARE_NAMES = false;   /* the share image never names a protocol until the owner of the site decides it should */
var $ = function (id) { return document.getElementById(id); };
var form = $('form'), input = $('address-input'), go = $('check-btn'), exampleNote = $('example-note'), progress = $('progress');
var formError = $('form-error'), pinNote = $('pin-note'), result = $('result');
var last = null;           /* the reading on screen */
var pinned = null;         /* block number carried by a shared link */
var pinnedFor = null;      /* the address that link carried: the block is dropped as soon as another address is typed */
var busy = false;

function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
function short(a) { return a.slice(0, 10) + '…' + a.slice(-4); }
function num(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function utc(sec) {
  var d = new Date(sec * 1000), p = function (x) { return x < 10 ? '0' + x : '' + x; };
  var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()];
  return d.getUTCDate() + ' ' + m + ' ' + d.getUTCFullYear() + ' ' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ' UTC';
}
function host(u) { return u.replace(/^https:\/\//, '').replace(/\/.*$/, ''); }

function showError(msg, extra) {
  formError.hidden = false; formError.textContent = msg;
  if (extra) formError.appendChild(extra);
  /* the error must be seen and announced: scroll it into view (no animation when motion is reduced), then give it the focus */
  formError.setAttribute('tabindex', '-1');
  formError.scrollIntoView({ behavior: T.reduced() ? 'auto' : 'smooth', block: 'center' });
  formError.focus({ preventScroll: true });
}
function clearError() { formError.hidden = true; formError.textContent = ''; }
function addLine(text) {
  var d = el('div', '', text); progress.appendChild(d);
  requestAnimationFrame(function () { d.className = 'in'; });
}
function setBusy(b) { busy = b; go.disabled = b; go.textContent = b ? 'Checking…' : 'Check'; }
function setPin(n) {
  pinned = n || null;
  pinNote.hidden = !pinned;
  pinNote.textContent = '';
  if (pinned) {
    pinNote.appendChild(document.createTextNode('This link carries block ' + num(pinned) + ': Check reads the Safe as it was at that block, so you can see the same result. Public nodes often refuse old blocks, so this can fail. '));
    var b = el('button', 'xp-linkbtn', 'Read the latest block instead');
    b.type = 'button'; b.onclick = function () { setPin(null); T.toast('Latest block'); };
    pinNote.appendChild(b);
  }
}

/* the sentence that goes first: only counts and the documented list, never a verdict */
function sentence(r) {
  var n = r.owners.length, t = r.threshold;
  if (n === 0) return 'This contract returned no owner.';
  var head = (n === 1 ? '1 owner' : n + ' owners') + (t === null ? '.' : ', ' + t + ' must sign.');
  var cross = r.matches.filter(function (m) { return m.entry.protocols.length >= 2; });
  var one = r.matches.filter(function (m) { return m.entry.protocols.length < 2; });
  var who = n === 1 ? 'That owner is' : null, tail;
  if (!r.matches.length) tail = n === 1 ? ' That owner is not among the 3 signer addresses documented in this research.' : ' None of them is among the 3 signer addresses documented in this research.';
  else if (cross.length) tail = ' ' + (who || (cross.length === 1 ? 'One of them is' : cross.length + ' of them are')) + ' documented in this research on 2 protocols.' + (one.length ? ' ' + one.length + ' more is documented on 1 protocol.' : '');
  else tail = ' ' + (who || (one.length === 1 ? 'One of them is' : one.length + ' of them are')) + ' documented in this research on 1 protocol.';
  return head + tail;
}

function render(r) {
  last = r;
  $('t3').textContent = sentence(r);
  var when = r.time ? ', ' + utc(r.time) : '';
  $('meta').textContent = 'Safe ' + short(r.safe) + ' · Ethereum mainnet' + (r.version ? ' · Safe v' + r.version : '') + ' · read at block ' + num(r.block) + when + '. Owner list answered by ' + host(r.endpoint || RPC_ENDPOINTS[0]) + '.';
  var ul = $('owners'); ul.textContent = '';
  r.owners.forEach(function (o) {
    var m = r.matches.filter(function (x) { return x.owner.toLowerCase() === o.toLowerCase(); })[0];
    var li = el('li', m ? 'hit' : '');
    li.appendChild(el('span', '', o));
    var tag = el('span', 'xp-tag' + (m ? '' : ' none'), m ? 'documented in this research on ' + m.entry.protocols.length + (m.entry.protocols.length === 1 ? ' protocol: ' : ' protocols: ') + m.entry.protocols.join(', ') : 'not in the documented list');
    li.appendChild(tag);
    if (m) li.appendChild(el('span', 'x-safe-conf', m.entry.confidence));
    ul.appendChild(li);
  });
  /* what this means: the role the research records, then a fact about who can sign */
  var mean = $('means'); mean.textContent = '';
  var itself = FLAGGED_DATA.flagged_addresses.filter(function (x) { return x.address.toLowerCase() === r.safe.toLowerCase(); })[0];
  if (itself) mean.appendChild(el('p', '', 'The address you entered is itself one of the 3 documented signer addresses. The owners listed above are this address\'s own owners.'));
  if (r.matches.length) {
    r.matches.forEach(function (m) { mean.appendChild(el('p', '', short(m.owner) + ': ' + m.entry.one_line_context)); });
    mean.appendChild(el('p', '', 'That is a fact about who can sign. It is not a verdict on anyone, and it does not say that any protocol is weak or that anything went wrong. The research records the confidence of each address, shown on its line.'));
  } else {
    mean.appendChild(el('p', '', 'No owner of this Safe is among the 3 documented signer addresses. That says only that, about 3 addresses: it does not say the Safe is sound or unsound.'));
  }
  /* what I could not read */
  var un = $('unread'); un.textContent = '';
  ['Other chains: a Safe at the same address elsewhere can have other owners.',
   'Modules and guards on this Safe.',
   'Who holds each key.',
   'Any signer outside the 3 documented addresses: “not in the list” says nothing more.'].forEach(function (t) { un.appendChild(el('li', '', t)); });
  if (r.threshold === null) un.insertBefore(el('li', '', 'The threshold: not shown (the node returned no valid value).'), un.firstChild);
  /* redo it: the latest block (public nodes refuse old state); the exact block needs an archive node */
  $('cmd').textContent = 'cast call ' + r.safe + ' "getOwners()(address[])" --rpc-url ' + RPC_ENDPOINTS[0] +
    '\ncast call ' + r.safe + ' "getThreshold()(uint256)" --rpc-url ' + RPC_ENDPOINTS[0];
}

/* the share image: the counts, the block and its date, the address of the Safe you read and the list commit; never an owner, never a score, no protocol name unless SHARE_NAMES */
function shareData() {
  var r = last, n = r.owners.length;
  var cross = r.matches.filter(function (m) { return m.entry.protocols.length >= 2; });
  var l1 = (n === 1 ? '1 owner' : n + ' owners') + (r.threshold !== null ? ', ' + r.threshold + ' must sign.' : '.');
  var one = r.matches.filter(function (m) { return m.entry.protocols.length < 2; });
  var l2 = !r.matches.length ? 'None is among the 3 documented signers.' :
    (cross.length ? (cross.length === 1 ? 'One is documented on 2 protocols.' : cross.length + ' are documented on 2 protocols.') + (one.length ? ' ' + one.length + ' more on 1 protocol.' : '')
      : (one.length === 1 ? 'One is documented on 1 protocol.' : one.length + ' are documented on 1 protocol.'));
  var names = SHARE_NAMES ? cross.map(function (m) { return m.entry.protocols.join(' \u00b7 '); }).join('  /  ') : '';
  return {
    kicker: 'Check your Safe', title: l1 + ' ' + l2, accentLine: SHARE_NAMES ? names : 'Redo: cast call getOwners() \u00b7 list ' + README_HEAD,
    meta: ['Safe ' + r.safe, 'Ethereum mainnet \u00b7 block ' + num(r.block) + (r.time ? ' \u00b7 ' + utc(r.time) : '')],
    footer: '',
    filename: 'check-your-safe-block-' + r.block + '.png'
  };
}

function clearResult() {
  /* the former page cleared its result before anything else (an invalid address included): a stale result must never sit under a new answer or error */
  result.style.display = 'none'; last = null; $('live').textContent = '';
  progress.textContent = ''; progress.style.display = 'none';
  ['t3', 'meta', 'owners', 'means', 'unread', 'cmd'].forEach(function (i) { $(i).textContent = ''; });
}

function run(address) {
  if (busy) return;
  clearError(); clearResult();
  var raw = String(address || '').trim();
  if (!ADDRESS_RE.test(raw)) { showError('That does not look like an Ethereum address. Expected 0x followed by 40 hex characters.'); return; }
  setBusy(true);
  progress.textContent = ''; progress.style.display = 'block';
  addLine('asking a public Ethereum node for the owner list …');
  checkSafe(raw, pinned, function (what, d) {
    if (what === 'block') addLine(d.endpoint ? 'connected to ' + host(d.endpoint) + ' · block ' + num(d.block) : 'reading at block ' + num(d.block) + ' (from the link)');
    if (what === 'owners') addLine(d.owners + (d.owners === 1 ? ' owner' : ' owners') + ' read · comparing with the 3 documented signer addresses …');
  }).then(function (r) {
    if (r.kind === 'notsafe') {
      var doc = FLAGGED_DATA.flagged_addresses.some(function (x) { return x.address.toLowerCase() === raw.toLowerCase(); });
      showError((doc ? 'This address is itself one of the 3 signer addresses documented in this research; it is not a Safe on Ethereum mainnet. ' : '') + (pinned ? 'Read at block ' + num(pinned) + ' (from the link): the Safe may not exist yet at that block. ' : '') + "Couldn't read this as a Gnosis Safe on Ethereum mainnet. Either this address has no Safe on Ethereum mainnet (a plain wallet, another contract, or a Safe deployed only on another chain such as Base, Optimism or Arbitrum, which this tool does not read), or it's running a version whose getOwners() call doesn't match what this tool expects.");
      return;
    }
    r.safe = raw;
    render(r);
    T.reveal(result, $('read'));
    $('live').textContent = sentence(r);
    setBusy(false);
    $('t3').focus({ preventScroll: true });
  }, function () {
    var b = null;
    if (pinned) { b = el('button', 'xp-linkbtn', 'Read the latest block instead'); b.type = 'button'; b.onclick = function () { setPin(null); run(input.value); }; }
    showError('Could not verify: every public RPC endpoint returned an error (for example a rate limit, or a block too old for a node to serve) or did not answer, so no result is shown. This does not mean the address is or is not a Safe. Retry in a moment. ', b);
  }).then(function () { if (busy) { setBusy(false); if (!formError.hidden) { formError.setAttribute('tabindex', '-1'); formError.focus(); } } });
}

form.addEventListener('submit', function (e) { e.preventDefault(); run(input.value); });
/* the field starts with the example (Resolv's Safe): one click on Check reads it. The note stays only while the field holds it. */
function syncNote() { exampleNote.hidden = input.value.trim().toLowerCase() !== EXAMPLE; }
input.addEventListener('input', function () { syncNote(); if (pinned && input.value.trim().toLowerCase() !== pinnedFor) setPin(null); });
$('copy').addEventListener('click', function () {
  if (!last) return;
  T.copy(T.state.link({ safe: last.safe, chain: 1, block: last.block }), 'Link copied');
});
$('img').addEventListener('click', function () { if (last) T.shareImage(shareData()); });
$('copycmd').addEventListener('click', function () { T.copy($('cmd').textContent, 'Commands copied'); });
$('again').addEventListener('click', function () {
  result.style.display = 'none'; progress.style.display = 'none'; progress.textContent = '';
  input.value = ''; syncNote(); setPin(null); last = null; input.focus();
  document.getElementById('hook').scrollIntoView({ behavior: T.reduced() ? 'auto' : 'smooth', block: 'start' });
});
var useSafe = $('use-safe');
if (useSafe) useSafe.addEventListener('click', function () {
  if (!last) return;
  var f = document.getElementById('safe-address'); if (f) f.value = last.safe;
  var t = document.getElementById('tx-title'); if (t) setTimeout(function () { t.focus({ preventScroll: true }); }, 0);
});

/* an address in the link fills the field and nothing more: no request leaves before a click */
function fromLink(atLoad) {
  var s = T.state.read();
  var q = atLoad ? new URLSearchParams(location.search).get('address') : null;   /* the former page's link form: read once, at load, pre-fill only */
  var a = s.safe || q;
  if (a && ADDRESS_RE.test(String(a).trim())) {
    input.value = String(a).trim(); pinnedFor = input.value.toLowerCase();
    var b = parseInt(s.block, 10); setPin(b > 0 ? b : null);
  }
}
fromLink(true); syncNote();
window.addEventListener('hashchange', function () { fromLink(false); syncNote(); });
root.SafeCheck = { shareData: shareData, last: function () { return last; }, core: core, run: run };
})(typeof window !== 'undefined' ? window : globalThis);
