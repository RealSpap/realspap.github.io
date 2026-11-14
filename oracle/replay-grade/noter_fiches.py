#!/usr/bin/env python3
"""Replay Grade v0.1 : note mécanique des pages /oracle/p/*.html (13/11/2026). Aucune requête réseau : lit une copie du site.
    python3 noter_fiches.py DOSSIER_SITE [--json]
Pour chaque fiche : commande (un appel curl/cast dans un bloc de code), bloc nommé (autre que "latest"), résultat attendu (une phrase qui dit quoi lire dans la réponse), réseau lu avec son chainId écrit.
A = les quatre ; B = pas A, avec une commande ; C = pas B, avec une source citée (lien externe) ou un bloc nommé sans commande ; D = rien. Une page illisible : « UNREAD », jamais une note."""
import glob, html, json, os, re, sys, collections
CMD = re.compile(r"<(?:code|pre)[^>]*>[^<]*(?:curl |cast |python3 )")
SCORE_BLOCK = re.compile(r'"params":\[\{[^}]*"data":"0xd47875d0[0-9a-fA-F]*"[^}]*\},"0x[0-9a-fA-F]+"\]')   # the call of getScore(address) at a named block
LATEST = re.compile(r'"(latest|pending|safe|finalized)"')
BLOCK_PARAM = re.compile(r'"params":\[\{[^}]*\},"0x[0-9a-fA-F]+"\]|--block \d+')
EXPECT = re.compile(r"(?:word|value|returns?|answer|result|prints?)[^.]{0,80}(?:is|=|equals|ends)|the \d(?:st|nd|rd|th) 32-byte word", re.I)
CHAINID = re.compile(r"chain ?id[^.]{0,20}\d+|eth_chainId", re.I)
EXTLINK = re.compile(r'href="https?://(?!realspap\.github\.io)[^"]+"')
def grade(h, score_only=False):
    t = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style)[^>]*>.*?</\1>", "", h, flags=re.S))))
    cmd = bool(CMD.search(h)); blk = bool((SCORE_BLOCK if score_only else BLOCK_PARAM).search(html.unescape(h)))   # the pages write the quotes as &quot;: the block is searched in the unescaped text
    exp = bool(EXPECT.search(t)); src = bool(EXTLINK.search(h))
    # contract pages: a chain ID counts only when the page reads it (an eth_chainId call); a "chain id N" in the text may name another network (one page names the chain ID of the Ethereum root of Aave governance, not the network of its own read)
    cid = bool(re.search(r"eth_chainId", html.unescape(h))) if score_only else bool(CHAINID.search(t))
    g = "A" if (cmd and blk and exp and cid) else "B" if cmd else "C" if (src or blk) else "D"
    return g, dict(command=cmd, named_block=blk, expected=exp, chain_id=cid, source=src)
def main(argv):
    if not argv: print(__doc__); return 2
    rows = []
    pat = ("oracle", "**", "index.html") if "--pages" in argv else ("oracle", "p", "*.html")
    files = sorted(glob.glob(os.path.join(argv[0], *pat), recursive=True))
    files = [f for f in files if not f.endswith(os.path.join("oracle", "p", "index.html")) and (("--pages" in argv and os.sep + "p" + os.sep not in f.split("oracle" + os.sep, 1)[1].join(["", ""]) ) or "--pages" not in argv)]
    for f in files:
        try: h = open(f, encoding="utf-8").read()
        except OSError: rows.append((os.path.relpath(f, argv[0]), "UNREAD", {})); continue
        g, d = grade(h, score_only="--pages" not in argv); rows.append((os.path.relpath(f, argv[0]) if "--pages" in argv else os.path.basename(f), g, d))
    c = collections.Counter(g for _, g, _ in rows)
    if "--json" in argv: print(json.dumps([dict(page=p, grade=g, **d) for p, g, d in rows], indent=1))
    else:
        print("pages", len(rows), dict(sorted(c.items())))
        for k in ("command", "named_block", "expected", "chain_id", "source"): print("  %-12s %d / %d" % (k, sum(1 for _, _, d in rows if d.get(k)), len(rows)))
        by = collections.Counter((p.split("-")[0], g) for p, g, _ in rows); print("par reseau et note:", dict(sorted(by.items())))
    return 0
if __name__ == "__main__": sys.exit(main(sys.argv[1:]))
