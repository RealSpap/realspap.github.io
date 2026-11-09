/* Postmortems : fonctions pures (aucun DOM, aucun réseau), testées sous Node pour les 72 incidents. Chargée avant postmortems.js. */
(function (root, factory) {
  var L = factory();
  if (typeof module === "object" && module.exports) module.exports = L; else root.PMLib = L;
})(this, function () {
  "use strict";
  var REPO = "https://github.com/RealSpap/onchain-postmortems";

  function amount(inc) { return "$" + (inc.dollarLoss.match(/[0-9][0-9,]*/) || ["0"])[0]; }
  function lossWords(inc) {
    return (inc.floor ? "at least " : (inc.approximate ? "about " : "")) + amount(inc);
  }
  /* phrase du résultat : le † (montant repris d'une source) reste visible */
  function verdict(inc) {
    return inc.protocol + " lost " + lossWords(inc) + (inc.sourced ? " (†, figure sourced)" : "") + " on " + inc.chain + ".";
  }
  function replayable(inc) { return !!inc.replay; }

  function replayText(inc, meta) {
    if (!replayable(inc)) return "No live replay for this entry: according to Cronos’s report, the chain was rolled back past the attack. Its README explains what could be read instead.";
    var lines = ["git clone " + REPO, "git -C onchain-postmortems checkout " + meta.commit];
    if (inc.pip && inc.pip.length) lines.push("pip install " + inc.pip.join(" "));
    lines.push("python3 onchain-postmortems/" + inc.slug + "/" + inc.replay);
    if (inc.result) lines.push("# the historical figures should match onchain-postmortems/" + inc.slug + "/" + inc.result);
    return lines.join("\n");
  }

  function cantRead(inc, meta) {
    var out = [];
    if (!replayable(inc)) out.push("The chain was rolled back past this attack (Cronos’s report), so it could not be rebuilt from chain data: the reading rests on the reports.");
    if (inc.floor) out.push("The loss is a lower bound: the writeup says the real figure may be higher.");
    if (inc.approximate) out.push("The loss is an approximation recomputed from chain data, priced at a stated moment.");
    if (inc.sourced) out.push("The loss figure comes from the protocol, the press or DefiLlama. It was not recomputed here.");
    if (!inc.addresses.length) out.push("No full 0x attacker address is established in the writeup, so this incident cannot be matched by address.");
    out.push("Nothing is live: this page does not re-read the chain. It shows the repository’s reading, read on " + meta.read + " at commit " + meta.commit + ".");
    out.push("Anything the writeup left undecided stays undecided here.");
    return out;
  }

  /* d'où vient chaque adresse affichée : le README, ou seulement le script de l'incident et sa sortie */
  function addressSource(inc, i) {
    return inc.addrInReadme && inc.addrInReadme[i] ? "tied to the attack by the writeup" : "tied to the attack by the entry’s script and its output (not spelled out in the README)";
  }

  function means(inc) {
    return (replayable(inc) ? "A rebuilt account of how this happened, taken from the chain." : "An account of how this happened, taken from the reports, because the chain could not be rebuilt.") +
      " It is not a judgment of the team, and it does not say your protocol is exposed to the same thing: that is what the Admin key checker and your own review are for.";
  }

  /* d'où vient le montant d'une ligne de classement : jamais un jugement, seulement la source et la nature du chiffre */
  function sourceLabel(inc) {
    return (inc.sourced ? "figure from the protocol, press or DefiLlama, not recomputed" : "recomputed from chain data") + (inc.floor ? ", a lower bound" : (inc.approximate ? ", approximate" : ""));
  }
  function leaderMeta(inc) { return inc.chain + " \u00b7 " + inc.date + " \u00b7 " + sourceLabel(inc); }

  function pinnedLink(inc, meta) { return inc.sourceLink.replace("/tree/main/", "/tree/" + meta.commit + "/"); }

  /* image de partage : aucun nom de protocole, aucune adresse, aucun score, aucun mot de gravité (décision en attente de RealSpap pour le nom) */
  function imageSpec(inc, meta) {
    return {
      kicker: "Onchain postmortems",
      title: "An on-chain exploit: " + lossWords(inc) + " lost" + (inc.sourced ? " (sourced figure)" : "") + ".",
      accentLine: inc.category + " · " + inc.date,
      meta: [replayable(inc) ? "The incident is rebuilt from chain data. Anyone can redo it." : "Read from the reports, not rebuilt from the chain.", "Read " + meta.read + " · commit " + meta.commit],
      footer: "realspap.github.io/tools/onchain-postmortems-checker.html",
      filename: "postmortem-" + inc.date.slice(0, 10) + "-" + inc.category.toLowerCase().replace(/[^a-z]+/g, "-") + ".png"
    };
  }

  return { amount: amount, lossWords: lossWords, verdict: verdict, replayable: replayable, replayText: replayText, cantRead: cantRead, addressSource: addressSource, pinnedLink: pinnedLink, means: means, sourceLabel: sourceLabel, leaderMeta: leaderMeta, imageSpec: imageSpec };
});
