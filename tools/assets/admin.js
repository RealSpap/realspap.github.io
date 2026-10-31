/* Admin key checker : code de la page (modèle). La valeur marquée en majuscules entre doubles pourcents plus bas est écrite par outils/admin_construire.py, jamais à la main.
   Deux couches : AdminCore (lecture de la chaîne, sans DOM, testée sous Node avec un fetch simulé) et l'interface (seulement si document existe).
   Aucune requête réseau à l'ouverture de la page, ni avec un état dans le # : une lecture ne part qu'au clic. */
(function (root) {
  "use strict";

  /* ===== AdminCore : aucune dépendance au DOM ===== */
  var RPCS = [
    { host: "ethereum-rpc.publicnode.com", url: "https://ethereum-rpc.publicnode.com" },
    { host: "eth.drpc.org", url: "https://eth.drpc.org" },
    { host: "1rpc.io", url: "https://1rpc.io/eth" }
  ];
  var BLOCK_MARGIN = 3; // lecture 3 blocs derrière la tête : les trois nœuds publics s'accordent
  var OWNER_CODE_CAP = 20; // une Safe à seuil 1 : on lit le code de ses propriétaires, 20 au plus
  var SEL = { owner: "0x8da5cb5b", admin: "0xf851a440", getOwners: "0xa0e67e2b", getThreshold: "0xe75235b8" };
  var SIG = { "0x8da5cb5b": "owner()(address)", "0xf851a440": "admin()(address)", "0xa0e67e2b": "getOwners()(address[])", "0xe75235b8": "getThreshold()(uint256)" };
  var SLOTS = {
    eip1967Admin: "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103",
    eip1967Impl: "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
    eip1967Beacon: "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50",
    zosAdmin: "0x10d6a54a4754c8869d6886b5f5d7fbfa5b4522237ea5c60d11bc4e7a1ff9390b",
    zosImpl: "0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3"
  };
  var RANK = { eoa: 6, safe0: 6, safe1: 5, other: 3, safeN: 1 };
  var IS_SAFE = { safe0: 1, safe1: 1, safeN: 1 };

  function isValidAddress(s) { return typeof s === "string" && /^0x[0-9a-fA-F]{40}$/.test(s); }
  function isZeroAddress(a) { return typeof a === "string" && /^0x0{40}$/i.test(a); }
  function isDelegatedEoaCode(code) { return /^0xef0100[0-9a-fA-F]{40}$/.test(code); }
  /* Seul un revert du contrat est une réponse : code 3 ou « execution reverted ». Une limite de débit, un manque de gaz du nœud, un délai : pas une réponse. */
  function isExecutionError(err) {
    if (!err) return false;
    if (err.code === 3) return true;
    return /execution reverted|invalid opcode/i.test(String(err.message || ""));
  }
  function decodeAddress(hex) {
    if (!hex) return null; var h = hex.replace(/^0x/, ""); if (h.length < 64) return null;
    var w = h.slice(0, 64); if (!/^0{24}[0-9a-fA-F]{40}$/.test(w)) return null; return "0x" + w.slice(24);
  }
  function decodeUint(hex) {
    if (!hex) return null; var h = hex.replace(/^0x/, ""); if (h.length < 64) return null;
    try { return BigInt("0x" + h.slice(0, 64)); } catch (e) { return null; }
  }
  function decodeAddressArray(hex) {
    if (!hex) return null; var h = hex.replace(/^0x/, ""); if (h.length < 128) return null;
    var s = parseInt(h.slice(0, 64), 16) * 2; if (!(s >= 0) || s + 64 > h.length) return null;
    var n = parseInt(h.slice(s, s + 64), 16); if (!(n >= 0) || s + 64 + n * 64 > h.length) return null;
    var out = []; for (var i = 0; i < n; i++) { var st = s + 64 + i * 64; out.push("0x" + h.slice(st + 24, st + 64)); } return out;
  }

  function create(fetchFn) {
    function rpcOnce(url, method, params) {
      var ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
      var timer = ctl ? setTimeout(function () { ctl.abort(); }, 9000) : null;
      var opts = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: method, params: params }) };
      if (ctl) opts.signal = ctl.signal;
      return fetchFn(url, opts).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      }).finally(function () { if (timer) clearTimeout(timer); });
    }

    /* Un nœud n'est utilisé pour une lecture au bloc B que s'il a lui-même atteint B (sinon il répondrait « 0x » à tort). */
    function ensureNode(st, node) {
      if (st.block === null || st.okNodes[node.url]) return Promise.resolve();
      return rpcOnce(node.url, "eth_blockNumber", []).then(function (j) {
        var h = j && typeof j.result === "string" ? parseInt(j.result, 16) : NaN;
        if (!(h >= st.block)) throw new Error("has not reached block " + st.block);
        st.okNodes[node.url] = true;
      });
    }

    /* Un état par lecture : bloc, nœuds utilisés, journal des appels (« le refaire » en est tiré). expect : "hex" | "object". */
    function rpc(st, method, params, expect) {
      var i = 0, lastErr = null;
      function attempt() {
        if (i >= RPCS.length) return Promise.reject(new Error("every public RPC endpoint failed (last: " + (lastErr ? lastErr.message : "no answer") + ")"));
        var node = RPCS[i]; i += 1;
        return ensureNode(st, node).then(function () { return rpcOnce(node.url, method, params); }).then(function (json) {
          if (json && json.error) {
            if (isExecutionError(json.error)) { note(node); return { reverted: true, result: null, node: node.url }; }
            lastErr = new Error(node.host + ": " + (json.error.message || ("JSON-RPC error " + json.error.code))); return attempt();
          }
          var ok = json && ((expect === "object" && json.result && typeof json.result === "object") || (expect !== "object" && typeof json.result === "string" && /^0x[0-9a-fA-F]*$/.test(json.result)));
          if (!ok) { lastErr = new Error(node.host + ": malformed response"); return attempt(); }
          note(node); return { reverted: false, result: json.result, node: node.url };
        }, function (e) { lastErr = new Error(node.host + ": " + (e && e.message ? e.message : "unreachable")); return attempt(); });
      }
      function note(node) { if (st.used.indexOf(node.url) === -1) st.used.push(node.url); }
      return attempt();
    }

    function ethCall(st, to, selector) {
      return rpc(st, "eth_call", [{ to: to, data: selector }, st.tag], "hex").then(function (r) {
        st.log.push({ kind: "call", to: to, data: selector, reverted: r.reverted, result: r.result, node: r.node });
        return (r.reverted || r.result === "0x") ? null : r.result;
      });
    }
    function getCode(st, addr) {
      return rpc(st, "eth_getCode", [addr, st.tag], "hex").then(function (r) {
        if (r.reverted) throw new Error("eth_getCode returned an execution error");
        st.log.push({ kind: "code", to: addr, result: r.result, node: r.node });
        return r.result;
      });
    }
    function slotAddress(st, addr, slot) {
      return rpc(st, "eth_getStorageAt", [addr, slot, st.tag], "hex").then(function (r) {
        var h = (r.result || "").replace(/^0x/, "");
        if (r.reverted || h.length !== 64) throw new Error("eth_getStorageAt returned an unexpected value");
        var a = "0x" + h.slice(24); st.log.push({ kind: "slot", to: addr, slot: slot, result: r.result, node: r.node });
        return isZeroAddress(a) ? null : a;
      });
    }

    /* Combien de propriétaires d'une Safe sont des contrats (un compte seul, ou un compte à délégation 7702, n'en est pas un). */
    function contractOwners(st, owners) {
      var list = owners.slice(0, OWNER_CODE_CAP);
      return Promise.all(list.map(function (o) { return getCode(st, o); })).then(function (codes) {
        return codes.filter(function (c) { return c !== "0x" && !isDelegatedEoaCode(c); }).length;
      });
    }

    function classifyKey(st, addr, depth) {
      return getCode(st, addr).then(function (code) {
        if (code === "0x") return { category: "eoa", address: addr };
        if (isDelegatedEoaCode(code)) return { category: "eoa", address: addr, delegated: true };
        return Promise.all([ethCall(st, addr, SEL.getOwners), ethCall(st, addr, SEL.getThreshold)]).then(function (r) {
          var owners = decodeAddressArray(r[0]), threshold = decodeUint(r[1]);
          if (owners && threshold !== null) {
            var k = { category: threshold === 0n ? "safe0" : (threshold === 1n ? "safe1" : "safeN"), address: addr, threshold: threshold.toString(), owners: owners };
            if (k.category !== "safe1") return k;
            return contractOwners(st, owners).then(function (n) { k.contractOwners = n; k.ownersCapped = owners.length > OWNER_CODE_CAP; return k; });
          }
          if (depth > 0) return { category: "other", address: addr };
          return ethCall(st, addr, SEL.owner).then(function (od) {
            var inner = decodeAddress(od);
            if (!inner || isZeroAddress(inner) || inner.toLowerCase() === addr.toLowerCase()) return { category: "other", address: addr };
            return classifyKey(st, inner, depth + 1).then(function (k) {
              return { category: k.category, address: addr, inner: k.address, threshold: k.threshold, owners: k.owners, contractOwners: k.contractOwners, ownersCapped: k.ownersCapped };
            });
          });
        });
      });
    }

    /* Lit au bloc (tête - BLOCK_MARGIN), fixé une fois pour toute la lecture. */
    function classify(address) {
      var st = { used: [], log: [], tag: null, block: null, time: null, okNodes: {} };
      return rpc(st, "eth_blockNumber", [], "hex").then(function (r) {
        var head = parseInt(r.result, 16);
        if (!(head > BLOCK_MARGIN)) throw new Error("unexpected block number");
        st.okNodes[st.used[0]] = true; /* le nœud qui a donné la tête a atteint le bloc */
        st.block = head - BLOCK_MARGIN; st.tag = "0x" + st.block.toString(16);
        return rpc(st, "eth_getBlockByNumber", [st.tag, false], "object").then(function (b) {
          var t = b.result && b.result.timestamp ? parseInt(b.result.timestamp, 16) : null; st.time = t > 0 ? t : null;
        }, function () { st.time = null; });
      }).then(function () { return getCode(st, address); }).then(function (code) {
        function done(res) { res.block = st.block; res.time = st.time; res.used = st.used.slice(); res.log = st.log; return res; }
        if (code === "0x" || isDelegatedEoaCode(code)) return done({ category: "notcontract", keys: [], implementation: null, delegated: code !== "0x" });
        return Promise.all([
          ethCall(st, address, SEL.owner), ethCall(st, address, SEL.admin),
          slotAddress(st, address, SLOTS.eip1967Admin), slotAddress(st, address, SLOTS.zosAdmin),
          slotAddress(st, address, SLOTS.eip1967Beacon), slotAddress(st, address, SLOTS.eip1967Impl), slotAddress(st, address, SLOTS.zosImpl)
        ]).then(function (r) {
          var ownerAddr = decodeAddress(r[0]), adminAddr = decodeAddress(r[1]);
          var explicitZero = isZeroAddress(ownerAddr) || isZeroAddress(adminAddr);
          var found = [];
          function add(role, a) {
            if (!a || isZeroAddress(a)) return;
            for (var j = 0; j < found.length; j++) if (found[j].address.toLowerCase() === a.toLowerCase()) { found[j].roles.push(role); return; }
            found.push({ address: a, roles: [role] });
          }
          add("owner()", ownerAddr); add("admin()", adminAddr);
          add("Upgrade admin (EIP-1967 admin slot)", r[2]); add("Upgrade admin (legacy ZeppelinOS admin slot)", r[3]); add("Upgrade beacon (EIP-1967 beacon slot)", r[4]);
          var implementation = r[5] || r[6] || null;
          return Promise.all(found.map(function (f) { return classifyKey(st, f.address, 0); })).then(function (keys) {
            keys.forEach(function (k, i) { k.roles = found[i].roles; });
            if (!keys.length && !explicitZero) {
              /* aucun getter : l'adresse saisie est peut-être elle-même une Safe */
              return classifyKey(st, address, 1).then(function (k) {
                if (IS_SAFE[k.category]) { k.roles = ["the address you read"]; return done({ category: k.category, keys: [k], implementation: implementation, inputIsSafe: true }); }
                return done({ category: "unknown", keys: [], implementation: implementation });
              });
            }
            var category;
            if (!keys.length) category = "renounced";
            else category = keys.reduce(function (w, k) { return RANK[k.category] > RANK[w] ? k.category : w; }, keys[0].category);
            return done({ category: category, keys: keys, implementation: implementation });
          });
        });
      });
    }
    return { classify: classify };
  }

  /* ===== Textes : un fait, pas un verdict ; jamais de gravité ni de couleur d'alerte ===== */
  var LABEL = {
    notcontract: "Not a contract on Ethereum mainnet",
    renounced: "owner() or admin() returns the zero address",
    unknown: "No admin getter found",
    eoa: "A single account",
    safe0: "A Safe that was never set up (threshold 0)",
    safe1: "A Safe where one signature is enough",
    safeN: "A Safe where several keys must sign",
    other: "Another contract, not classified"
  };
  var MEANING = {
    notcontract: "There is no contract code at this address on Ethereum mainnet. It is a plain wallet, a mistyped address, or a contract that exists only on another chain. This page reads Ethereum mainnet only, so it says nothing about keys here.",
    renounced: "owner() or admin() returns the zero address, and no proxy admin or beacon is stored in the standard slots. No admin key was found through these paths.",
    unknown: "The contract has code, but neither owner() nor admin() returned an address, and no proxy admin or beacon is stored in the standard slots. It may use role-based access control, an immutable proxy admin, or have no admin at all. This page cannot tell which.",
    eoa: "At least one key found is an account without contract code. One private key is enough to call that admin function. This is a fact about how the control is set up, not about whether the key is safe or has ever been used.",
    safe0: "At least one key found is a Safe whose threshold is 0, which means it was never set up. What that implies needs a look by hand.",
    safe1: "The key with the lowest threshold is a Safe with a threshold of 1: any one of its owners can execute a transaction alone.",
    safeN: "Every key found is a Safe with a threshold of 2 or more: several owner keys must sign an admin action. The Safe says nothing about who the owners are, or whether they are independent of each other.",
    other: "At least one key found is a contract that is not a Safe (for example a timelock or a governance contract), and following owner() one step did not classify it further. It needs a look by hand."
  };
  function shortAddr(a) { return a ? a.slice(0, 6) + "…" + a.slice(-4) : ""; }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }
  function hasUpgradeSlot(res) {
    return !!res.implementation || res.keys.some(function (k) { return k.roles && k.roles.some(function (r) { return /^Upgrade/.test(r); }); });
  }
  /* La clé la plus faible parmi celles de la catégorie retenue : seuil le plus bas rapporté au nombre de propriétaires. */
  function pick(res) {
    var c = res.category, ks = res.keys.filter(function (x) { return x.category === c; });
    if (IS_SAFE[c]) ks.sort(function (a, b) { return (Number(a.threshold) / a.owners.length) - (Number(b.threshold) / b.owners.length) || Number(a.threshold) - Number(b.threshold); });
    return ks[0];
  }
  function sentence(res) {
    var c = res.category, k;
    if (IS_SAFE[c]) {
      k = pick(res); var who = res.inputIsSafe ? "This address is itself a Safe" : "The admin key is a Safe", n = k.owners.length;
      if (c === "safeN") return who + ": " + k.threshold + " of " + plural(n, "owner", "owners") + " must sign.";
      if (c === "safe1") return who + " of " + plural(n, "owner", "owners") + " where one signature is enough.";
      return who + " that was never set up.";
    }
    if (c === "eoa") return "The admin key is a single account.";
    if (c === "other") return "The admin key is a contract this page cannot classify further.";
    if (c === "renounced") return "owner() or admin() returns the zero address.";
    if (c === "unknown") return "No admin getter was found on this contract.";
    return res.delegated ? "This address is a wallet with an EIP-7702 delegation, not a contract." : "This address is not a contract on Ethereum mainnet.";
  }
  function meaning(res) {
    var t = MEANING[res.category];
    if (res.category === "safe1") {
      var k = pick(res);
      if (k.contractOwners > 0) t += " " + plural(k.contractOwners, "owner is a contract", "owners are contracts") + ": their own signers were not read.";
    }
    if (res.category !== "notcontract" && res.category !== "unknown" && !hasUpgradeSlot(res)) t += " No proxy upgrade slot was found, so this page does not say whether these keys can change the contract's code itself.";
    return t;
  }
  /* Ce que la lecture n'a pas pu couvrir : construit depuis la structure du résultat et la liste fixe des limites de la méthode, jamais inventé. */
  function unreadList(res) {
    var u = [];
    if (res.category === "notcontract") { u.push("A contract at this address on another chain (this page reads Ethereum mainnet only)."); return u; }
    if (res.category === "unknown") u.push("Who holds any role, if the contract uses role-based access control (AccessControl).");
    if (res.category === "other") u.push("What the contract behind the admin key does, and who controls it after one owner() step.");
    if (res.implementation) u.push("The code behind the proxy implementation (" + shortAddr(res.implementation) + "): its own admin functions were not read.");
    if (!hasUpgradeSlot(res)) u.push("Whether these keys can change the contract's code: no proxy upgrade slot was found.");
    res.keys.forEach(function (k) {
      if (k.category === "safe1" && k.contractOwners > 0) u.push("The signers behind " + plural(k.contractOwners, "owner contract", "owner contracts") + " of a Safe with a threshold of 1.");
      if (k.ownersCapped) u.push("The code of Safe owners beyond the first " + OWNER_CODE_CAP + ".");
    });
    u.push("Role-based access control (AccessControl): holders of roles that are not owner() or admin().");
    u.push("Proxy admins that are fixed in the code and not stored in the standard slots.");
    u.push("Any timelock delay: this page reads none.");
    u.push("Safe modules and guards, and who the people behind any key are.");
    if (res.keys.some(function (k) { return IS_SAFE[k.category]; })) u.push("Whether a contract that answers getOwners() and getThreshold() is the genuine Safe code: it is read as a Safe.");
    return u;
  }
  /* Commandes Foundry : une par lecture du journal (aucune écrite à la main), au bloc de la lecture, au nœud qui a répondu. */
  function commandsFor(address, res) {
    var url = (res.used && res.used[0]) || RPCS[0].url, L = ["cast block " + res.block + " --rpc-url " + url], seen = {};
    (res.log || []).forEach(function (e) {
      var blk = " --block " + res.block + " --rpc-url " + (e.node || url);
      var line = e.kind === "code" ? "cast code " + e.to + blk : e.kind === "slot" ? "cast storage " + e.to + " " + e.slot + blk : "cast call " + e.to + ' "' + SIG[e.data] + '"' + blk;
      if (!seen[line]) { seen[line] = 1; L.push(line); }
    });
    return L;
  }
  function safeToOpen(res) {
    for (var i = 0; i < res.keys.length; i++) { var k = res.keys[i]; if (IS_SAFE[k.category]) return k.inner || k.address; }
    return null;
  }
  function imageText(res) {
    var c = res.category;
    if (c === "notcontract") return res.delegated ? ["A wallet with an", "EIP-7702 delegation."] : ["Not a contract on", "Ethereum mainnet."];
    var k = IS_SAFE[c] ? pick(res) : null;
    if (c === "safeN") return ["Admin key: a Safe,", k.threshold + " of " + k.owners.length + " must sign."];
    if (c === "safe1") return ["Admin key: a Safe where", "one signature is enough."];
    if (c === "safe0") return ["Admin key: a Safe", "never set up."];
    if (c === "eoa") return ["Admin key:", "a single account."];
    if (c === "other") return ["Admin key: a contract,", "not classified."];
    if (c === "renounced") return ["owner() or admin() is", "the zero address."];
    return ["No admin getter", "found on this contract."];
  }

  var EXAMPLES = [{"address": "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb", "label": "A contract whose owner is a Safe", "attendu": "safeN"}, {"address": "0x1F98431c8aD98523631AE4a59f267346ea31F984", "label": "A contract owned through another contract", "attendu": "other"}, {"address": "0x000000000000000000000000000000000000dEaD", "label": "An address that is not a contract", "attendu": "notcontract"}];

  var Core = { create: create, isValidAddress: isValidAddress, sentence: sentence, meaning: meaning, unreadList: unreadList, commandsFor: commandsFor, safeToOpen: safeToOpen, pick: pick,
               hasUpgradeSlot: hasUpgradeSlot, imageText: imageText, LABEL: LABEL, MEANING: MEANING, RPCS: RPCS, EXAMPLES: EXAMPLES, BLOCK_MARGIN: BLOCK_MARGIN, OWNER_CODE_CAP: OWNER_CODE_CAP, shortAddr: shortAddr };
  root.AdminCore = Core;
  if (typeof module === "object" && module.exports) module.exports = Core;
  if (typeof document === "undefined") return;

  /* ===== Interface : rien ne part sur le réseau avant le clic ===== */
  var T = root.Tunnel;
  var $ = function (id) { return document.getElementById(id); };
  var core = create(function (u, o) { return root.fetch(u, o); });
  var input = $("x-addr"), btn = $("x-read"), err = $("x-err"), prog = $("x-progress"), resultEl = $("result");
  var last = null, lastAddr = null, busy = false;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined && text !== null) e.textContent = text; return e; }
  function fmtTime(t) {
    if (!t) return "time not read";
    var d = new Date(t * 1000), p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getUTCFullYear() + "-" + p(d.getUTCMonth() + 1) + "-" + p(d.getUTCDate()) + " " + p(d.getUTCHours()) + ":" + p(d.getUTCMinutes()) + " UTC";
  }
  function setSteps(n) {
    var li = document.querySelectorAll("#x-steps li");
    for (var i = 0; i < li.length; i++) li[i].className = i === n ? "on" : "";
  }
  function showError(msg, bring) {
    err.hidden = false; err.textContent = msg;
    if (!bring) return;
    /* adresse refusée : le message vient dans la vue et reçoit le focus. Défilement instantané : pas d'animation, donc rien à régler pour prefers-reduced-motion (le défilement lissé ne s'est pas exécuté dans le navigateur de test) */
    err.setAttribute("tabindex", "-1");
    err.scrollIntoView({ block: "center", behavior: "auto" });
    err.focus({ preventScroll: true });
  }
  function keyLabel(k) {
    var what = k.category === "eoa" ? "single account" : IS_SAFE[k.category] ? "Safe " + k.threshold + " of " + k.owners.length : "contract";
    return k.roles.join(" + ") + " → " + what + (k.delegated ? " (EIP-7702 delegation)" : "");
  }

  function render(address, res) {
    last = res; lastAddr = address;
    $("x-verdict").textContent = sentence(res);
    $("x-meta").textContent = "Ethereum mainnet · block " + res.block.toLocaleString("en-US") + " · " + fmtTime(res.time);
    var list = $("x-keys"); list.textContent = "";
    var li0 = el("li"); li0.appendChild(el("span", null, address)); li0.appendChild(el("span", "xp-tag none", "address you read")); list.appendChild(li0);
    if (res.implementation) { var li1 = el("li"); li1.appendChild(el("span", null, res.implementation)); li1.appendChild(el("span", "xp-tag none", "proxy implementation")); list.appendChild(li1); }
    res.keys.forEach(function (k) {
      if (res.inputIsSafe) return;
      var li = el("li"); li.appendChild(el("span", null, k.address)); li.appendChild(el("span", "xp-tag", keyLabel(k))); list.appendChild(li);
      if (k.inner) { var lj = el("li"); lj.appendChild(el("span", null, k.inner)); lj.appendChild(el("span", "xp-tag", "owner of that contract")); list.appendChild(lj); }
    });
    if (res.inputIsSafe) { var ls = el("li"); ls.appendChild(el("span", null, "Read through getOwners() and getThreshold()")); ls.appendChild(el("span", "xp-tag", keyLabel(res.keys[0]))); list.appendChild(ls); }
    if (!res.keys.length && res.category !== "notcontract") { var lk = el("li"); lk.appendChild(el("span", null, "No key found through owner(), admin() or the standard proxy slots")); list.appendChild(lk); }
    $("x-means").textContent = meaning(res);
    var ul = $("x-unread"); ul.textContent = ""; unreadList(res).forEach(function (t) { ul.appendChild(el("li", null, t)); });
    $("x-cmd").textContent = commandsFor(address, res).join("\n");
    $("x-nodes").textContent = res.used.map(function (u) { return u.replace(/^https:\/\//, ""); }).join(", ");
    var safe = safeToOpen(res), card = $("x-next-safe");
    if (safe) { card.hidden = false; card.href = "/tools/check-your-safe.html#safe=" + safe + "&chain=1"; } else card.hidden = true;
    $("x-next-another").hidden = false;
  }

  function run(address) {
    if (busy) return;
    /* aucun résidu d'une lecture précédente : ni résultat, ni lien, ni image, ni carte « See who signs », même si la nouvelle adresse est refusée */
    resultEl.style.display = "none"; last = null; lastAddr = null; $("x-next-safe").hidden = true;
    err.hidden = true; err.textContent = "";
    if (!isValidAddress(address)) { showError("Enter a contract address: 0x followed by 40 hexadecimal characters.", true); return; }
    busy = true; btn.disabled = true; resultEl.style.display = "none"; $("x-shared").hidden = true; setSteps(1);
    var lines = ["Asking a public Ethereum node for the latest block…", "Reading owner(), admin() and the proxy slots at one fixed block…", "Looking at each key it finds (account, Safe, other contract)…"];
    var done = false, pending = null;
    function finish() {
      if (!done || !pending) return;
      var p = pending; pending = null; busy = false; btn.disabled = false;
      if (p.error) { setSteps(1); showError("Could not read: a public node returned an error, did not answer, or had not reached the block, so no result is shown. Try again in a moment. (" + p.error + ")"); prog.style.display = "none"; return; }
      render(address, p.res); setSteps(2); prog.style.display = "none"; T.reveal(resultEl, $("x-verdict"));
    }
    T.steps(prog, lines, function () { done = true; finish(); });
    core.classify(address).then(function (res) { pending = { res: res }; finish(); }, function (e) { pending = { error: e && e.message ? e.message : "unknown error" }; finish(); });
  }

  /* le lien ne garde que l'adresse : ni requête (?utm=…), ni autre état */
  function currentLink() { return location.origin + location.pathname + "#contract=" + encodeURIComponent(lastAddr); }
  function applyState(initial) {
    var s = {}; try { s = T.state.read(); } catch (e) { s = {}; }
    var q = ""; if (initial) { try { q = new URLSearchParams(location.search).get("address") || ""; } catch (e) { q = ""; } }   /* ?address=0x… : pré-remplissage seulement, aucune lecture avant un clic */
    var given = s.contract && isValidAddress(String(s.contract).trim()) ? String(s.contract).trim() : (isValidAddress(q.trim()) ? q.trim() : "");
    if (given) {
      input.value = given; last = null; lastAddr = null; $("x-next-safe").hidden = true;
      $("x-shared").hidden = false; /* rien n'est lu : il faut un clic */
      resultEl.style.display = "none"; setSteps(0);
    }
  }

  btn.addEventListener("click", function () { run(input.value.trim()); });
  input.addEventListener("keydown", function (e) { if (e.key === "Enter") run(input.value.trim()); });
  var chips = document.querySelectorAll("[data-example]");
  for (var ci = 0; ci < chips.length; ci++) chips[ci].addEventListener("click", function (e) {
    var i = Number(e.currentTarget.getAttribute("data-example")); if (busy) return; input.value = EXAMPLES[i].address; run(EXAMPLES[i].address);
  });
  $("x-copy").addEventListener("click", function () { if (lastAddr) T.copy(currentLink(), "Link copied"); });
  $("x-image").addEventListener("click", function () {
    if (!last) return;
    T.shareImage({ kicker: "Admin key checker", title: imageText(last).join(" "), accentLine: "block " + last.block.toLocaleString("en-US"),
      meta: ["Ethereum mainnet · " + fmtTime(last.time), "Facts read from a public node. No score."], footer: "realspap.github.io/tools", filename: "admin-key-reading.png" });
  });
  $("x-cmd-copy").addEventListener("click", function () { T.copy($("x-cmd").textContent, "Commands copied"); });
  $("x-again").addEventListener("click", function (e) { e.preventDefault(); input.value = ""; resultEl.style.display = "none"; setSteps(0); $("x-shared").hidden = true; err.hidden = true; input.focus(); window.scrollTo(0, 0); });
  var again2 = $("x-next-another"); if (again2) again2.addEventListener("click", function (e) { e.preventDefault(); $("x-again").click(); });
  applyState(true);
  window.addEventListener("hashchange", function () { applyState(false); });
})(typeof window !== "undefined" ? window : globalThis);
