# Replay Grade v0.1: my own grades

Version 0.1 of the criteria, draft of 2026-11-13, revised on 2026-11-14 (the list of changes is the last section of [`replay-grade-v0.1.md`](replay-grade-v0.1.md)). Read at 09:50Z, on 14 November: the README at that commit was fetched at that time, and the site pages are a local copy of the site at `ebec56c`. One grade per claim; the grade says what the page lets a reader replay, not whether the claim is true. The grade of each line is computed from its five columns, not written by hand.

Read from the README of the showcase repository at commit `a6eb1da` (line numbers are those of that file) and, for the site, from a local copy of the pages published by the site repository at commit `ebec56c`. Columns: **cmd** a complete command is on the page; **pt** a named point of reading; **ex** an expected result is written; **net** the network and its identifier are written (`n/a` when the claim reads no chain); **src** a source a reader can open.

## 1. The README, claim by claim

| # | Line | Claim | Command | cmd | pt | ex | net | src | Grade | Flag | To reach the next grade |
|---|---|---|---|---|---|---|---|---|---|---|---|
| R01 | 21, 51-56 | A contract can read the score on-chain with `getScore(address)` | `cast call ORACLE "getScore(address)(...)" TARGET --rpc-url RPC` | yes | no | yes | yes | yes | **B** |  | name the block (`--block N`) instead of a date |
| R02 | 21 | 55 incident write-ups read, 7 about who controls a contract, 2 flagged | `python3 scripts/prove.py` (line 31) | yes | no | yes | n/a | yes | **B** | script command with no commit named (rule of the page: the script carries its own addresses and endpoints) | name the commit the output was produced at |
| R03 | 23 | Command 1 needs no key, only public RPCs, and takes about ten seconds | `python3 scripts/prove.py` | yes | no | yes | n/a | yes | **B** | script command with no commit named (rule of the page: the script carries its own addresses and endpoints); the printed run says 3 s, the text says about ten seconds | write one number, with the date of the run |
| R04 | 35 | 63 + 39 + 13 + 13 + 14 + 9 + 9 + 16 targets on 8 oracles equal the Watch | `python3 scripts/prove.py` | yes | no | yes | no | yes | **B** | script command with no commit named (rule of the page: the script carries its own addresses and endpoints) | name the block of each oracle and the chain ID of each |
| R05 | 36 | 176 targets: six sub-scores, push date and methodology hash identical on the chain and in the Watch | `python3 scripts/prove.py` | yes | no | yes | no | yes | **B** | script command with no commit named (rule of the page: the script carries its own addresses and endpoints) | name the blocks, write the chain IDs |
| R06 | 37 | Solana devnet: 26 accounts, scores and hash identical to the Watch's | `python3 scripts/prove.py` | yes | no | yes | yes | yes | **B** | script command with no commit named (rule of the page: the script carries its own addresses and endpoints) | name the slot |
| R07 | 38 | 8 EVM oracles: hash, target count and push date equal the CHANGELOG | `python3 scripts/prove.py` | yes | no | yes | no | yes | **B** | script command with no commit named (rule of the page: the script carries its own addresses and endpoints) | name the blocks, write the chain IDs |
| R08 | 39 | `getScore` of the example contract is 80, 100, 75, 100, 80, 85 | `python3 scripts/prove.py` | yes | no | yes | yes | yes | **B** | the page says at line 56 that the fifth value moved to 40 on 27 October: no stale flag, the printed run is of an older state; script command with no commit named (rule of the page: the script carries its own addresses and endpoints) | replace the printed run by a current one, with the block |
| R09 | 42 | Authority Facts v0.1: 202 JSON twins of the site conform | `python3 scripts/prove.py` | yes | no | yes | n/a | yes | **B** | script command with no commit named (rule of the page: the script carries its own addresses and endpoints) | name the commit and the site version read |
| R10 | 46 | Oracle on Robinhood Chain testnet (chain ID 46630), target on Robinhood Chain mainnet (chain ID 4663), checked with `eth_chainId` on 13 November (10:59, in UTC) | none written (method name only) | no | no | yes | yes | yes | **C** | a time of day (10:59 UTC) is not a named point for a read of the chain: the block is asked for | add `cast chain-id --rpc-url RPC` once for each network |
| R11 | 56 | The fifth value was 80 on 22 October and changed with the push of 27 October, method 2026.10.4 (the history) | none | no | no | yes | no | yes | **C** | the other part of the claim of line 56 is R39 | cite the CHANGELOG entry and a `cast call` at a block before and after the push |
| R39 | 56 | The fifth value of `getScore` is 40 now (read with the `cast call` of lines 51-54) | `cast call ORACLE "getScore(address)(...)" TARGET --rpc-url RPC` (lines 51-54) | yes | no | yes | yes | yes | **B** | part of the claim of line 56 that the command replays (rule of the page: a claim whose parts differ is two lines) | name the block (`--block N`) |
| R12 | 59 | A contract can score 100 and still carry the lowest trust status of `watch/trust.json` | none | no | no | no | no | yes | **C** |  | add the command that reads `trust.json` for one contract and the expected status |
| R13 | 59 | None of the three commands reads the status yet | none (the commands are on the page) | no | no | no | no | yes | **C** |  | add a line that shows each command's output has no status field |
| R14 | 61 | `l1CappedComposite` is 57 for the Uniswap v3 factory; it is in `api/scores.json`, not on the chain | none | no | no | no | no | yes | **C** | the other part of the claim of line 61 is R40 | add the `curl` of `api/scores.json` and the field to compare |
| R40 | 61 | The composite of the Uniswap v3 factory on the chain is 85 | `cast call ORACLE "getScore(address)(...)" TARGET --rpc-url RPC` (lines 51-54) | yes | no | yes | yes | yes | **B** | part of the claim of line 61 that the command replays (the sixth value) | name the block (`--block N`) |
| R15 | 63 | The strict gate is 46 lines and the simple gate is 18 lines | none | no | no | no | n/a | yes | **C** |  | add `wc -l` for the two files, with the commit |
| R41 | 63 | The simple gate checks neither the age of the push nor the number of keys | none (the file `integrations/authority_facts_gate.py` is named) | no | no | no | n/a | yes | **C** |  | add the command line of the simple gate on a label older than 72 hours and the line it prints |
| R16 | 66-73 | The strict gate refuses the label of the Uniswap v3 factory with `keys to move not read, and you asked for them` (exit code 1), run on 12 November (21:45, in UTC) | `python3 integrations/authority_facts_gate_strict.py LABEL_URL --max-age-hours 72 --strict` | yes | yes | yes | yes | yes | **A** |  | already A |
| R17 | 73 | The simple gate prints `ok: Robinhood Chain 85 (strong), 48 h to react` on the same label (exit code 0) | described, not written with its arguments | no | yes | yes | yes | yes | **C** | a named point and an expected result, but no command | write the command line |
| R42 | 73 | Without `--strict`, the same command with only `--max-age-hours 72` prints `the last push is older than 72.0 hours` (run on 12 November, at 21:45 in UTC) | described, not written with its arguments | no | yes | yes | yes | yes | **C** | a named point and an expected result, but no command | write the command line, with the label address |
| R18 | 73 | The label was built on 22 October from a push of 19 October; the oracle was pushed again on 10 November | none | no | no | no | no | yes | **C** | the label is linked on the page (lines 66 and 88) and carries the push date | cite the CHANGELOG entry and the label fields `last_pushed` |
| R19 | 75 | The Solana devnet oracle program is upgradeable and its upgrade authority is a given account | `curl ... getAccountInfo ... | python3 -c ...` (line 78) | yes | no | yes | yes | yes | **B** | read time given in the README (21:48 on 12 November, in UTC), no slot | write the slot of the response |
| R20 | 75 | That authority account is a plain account with no code | none | no | no | no | no | no | **D** |  | add `getAccountInfo` on the authority account and the expected owner and size |
| R21 | 75 | The same account is admin and updater in the registry of the program: one signature can push scores and replace the program | none | no | no | no | no | no | **D** |  | name the registry account and add the call that decodes it |
| R22 | 75 | The devnet genesis hash is written, and the program does not exist on Solana mainnet-beta | none | no | no | no | no | no | **D** |  | add `getGenesisHash` and the `getAccountInfo` on mainnet-beta with the expected null |
| R23 | 81 | The eight EVM oracles are not upgradeable; one plain key holds their admin and updater roles per chain (see `docs/LIMITS.md`, section "The oracle's own composite, by chain") | none | no | no | no | no | yes | **C** |  | add the `cast call` for the owner of one oracle, per chain |
| R24 | 87 | 202 contracts on 9 oracles (8 EVM testnets and Solana devnet) | `python3 scripts/prove.py` | yes | no | yes | no | yes | **B** | script command with no commit named (rule of the page: the script carries its own addresses and endpoints); the claim is about chains, so the network is asked for | name the blocks, write the chain IDs |
| R25 | 87 | Zcash is separate, 6 targets attested by on-chain commitments | none | no | no | no | no | no | **D** |  | link the attestation and the command that reads it |
| R26 | 87 | Each record names the network of its targets (see `watch/API.md`) | none | no | no | no | no | yes | **C** |  | add the `curl` of one `scores/*.json` file and the field to read |
| R27 | 87 | The dashboard shows the money behind the contracts where one was read, and the delay before a change applies | none (a link) | no | no | no | no | yes | **C** |  | name a contract and give the value the page should show |
| R28 | 88 | One contract's label says who can move it, how many keys, how long others have to react | none (a link) | no | no | no | no | yes | **C** |  | add the `curl` of the JSON twin and the fields to read |
| R29 | 89 | `scripts/brief.py morpho-blue` gives a one-page brief | `python3 scripts/brief.py morpho-blue` | yes | no | no | n/a | yes | **B** | no output shown | show the first lines of the output |
| R43 | 89 | An agent can use it through the local MCP server | none | no | no | no | n/a | no | **D** |  | link the server file and give the command that starts it |
| R30 | 89 | One Atom feed per protocol | none | no | no | no | no | no | **D** |  | link one feed and say what its first entry should hold |
| R31 | 89 | The pinned commit of the action is the last commit that changed it | none | no | yes | no | n/a | yes | **C** | the commit named on the page is the subject of the claim, so also its point of reading (rule of the page); no command | add `git log -1 -- action.yml` |
| R32 | 97 | Submitted to Colosseum's Crypto World's Fair on 12 October 2026 | none (a link) | no | no | no | n/a | yes | **C** |  | link the submission page itself |
| R33 | 102 | The dated transactions of the oracles do not depend on git (table in `docs/HISTORY.md`) | none | no | no | no | no | yes | **C** |  | add one `cast tx` and the expected block |
| R44 | 102 | Every commit up to 6 October 2026 is a snapshot or carries a round time | none | no | no | no | n/a | no | **D** | a statement about the history of the repository | add `git log` with the dates of the first commits |
| R45 | 102 | The Watch keeps a hash-chained event log since 10 October 2026 | none (the file is not linked in that sentence) | no | no | no | no | no | **D** |  | link `events.jsonl` and say what its first line holds |
| R46 | 102 | The Watch signs its manifests since 11 October 2026 | none | no | no | no | no | no | **D** |  | link one signed manifest and the command that checks the signature |
| R34 | 102 | The methodology hash is tied to the scoring code for every push after 30 September 2026 | none | no | no | no | n/a | no | **D** | in tension with the CHANGELOG of 13 November, which says none of the nine hashes can yet be recomputed from this repository | cite `scripts/lib/methodology.py` and which pushes it recomputes |
| R35 | 118 | The signing key of the Watch is the same in `watch/API.md`, in `scripts/audit_public.py` and on the provenance page | `python3 scripts/audit_public.py` (checks a run) | yes | no | yes | n/a | yes | **B** | script command with no commit named (rule of the page: the script carries its own addresses and endpoints); the expected key is written at line 118 | show the line the script prints when the key matches |
| R36 | 21 | A DeFi contract that can be upgraded or reconfigured has someone who can do it | none | no | no | no | n/a | no | **D** | a premise, nothing to replay | none: keep as a premise or cut |
| R37 | 21, 97 | The score reads exposure, how much one compromise can do; it does not predict who gets hit | none | no | no | no | n/a | no | **D** | a statement of what the score means | cite the back-test line of command 1 (R02) next to it |
| R47 | 21 | Live on testnets today | none | no | no | no | no | no | **D** |  | link the Watch page that lists the oracles and their networks |
| R38 | 27 | The script reads the chain with its own code, separate from the Watch's | none (the file is named) | no | no | no | n/a | yes | **C** |  | add the list of files each reader imports |

Total: 47 claims graded: 1 at A, 15 at B, 18 at C, 13 at D.

Excluded as not being claims, 10 passages: the slogan in the banner (line 7), the badges (lines 10 to 18), the disclaimer "Not an audit, not investment advice" (line 21), the stated purpose "so a lending market, a DAO or a wallet does not have to trust anyone's website" (line 21), the "Does not prove" line of command 1 (line 43), the two lists of links (lines 93 and 95), the licence sentence (line 97), the licence table (lines 104 to 116) and the attribution sentence (line 116).

## 2. The pages of the site: the ceiling of each page

A page can only give the grade its elements allow, and the table does not grade each of its claims. The **ceiling** below is the best grade any claim on the page could reach with what the page holds, found by a script that looks for a command in a code block, a block parameter other than `latest`, a sentence naming what to read in the answer, a written chain ID and an outside link ([`noter_fiches.py`](noter_fiches.py)). It is an upper bound: most claims of a page grade lower.

| Page | Ceiling | cmd | named block | expected | chain ID | source |
|---|---|---|---|---|---|---|
| `/oracle/api/` | B | yes | no | yes | no | yes |
| `/oracle/backtest/` | C | no | no | no | no | yes |
| `/oracle/changelog/` | B | yes | no | yes | yes | yes |
| `/oracle/compare/` | C | no | no | yes | no | yes |
| `/oracle/` | B | yes | no | yes | no | yes |
| `/oracle/methodology/` | B | yes | no | yes | no | yes |
| `/oracle/provenance/` | B | yes | no | no | no | yes |
| `/oracle/research/aave-levels/` | B | yes | yes | no | no | yes |
| `/oracle/research/chains/arbitrum/` | B | yes | no | no | no | no |
| `/oracle/research/chains/base/` | B | yes | yes | yes | no | no |
| `/oracle/research/chains/ethereum-l1/` | B | yes | yes | yes | no | no |
| `/oracle/research/chains/hyperliquid/` | B | yes | no | no | no | no |
| `/oracle/research/chains/` | D | no | no | no | no | no |
| `/oracle/research/chains/robinhood-chain/` | B | yes | no | yes | no | no |
| `/oracle/research/chains/solana/` | B | yes | no | yes | no | no |
| `/oracle/research/chains/tempo/` | B | yes | yes | yes | no | no |
| `/oracle/research/chains/zcash/` | B | yes | no | yes | no | no |
| `/oracle/research/` | C | no | no | no | no | yes |
| `/oracle/research/lido-bnb-bridges/` | B | yes | no | yes | no | yes |
| `/oracle/roles/` | B | yes | yes | yes | no | no |
| `/oracle/security/` | C | no | no | no | no | yes |
| `/oracle/verify/` | B | yes | no | yes | no | yes |
| `/oracle/watch/` | C | no | no | no | no | yes |

The 152 research notes under `/oracle/notes/`: ceiling 85 at B, 66 at C, 1 at D.

## 3. The contract pages

The 202 contract pages (`/oracle/p/`) are graded one by one by the same script, for their one claim, the score of the contract, which the page lets a reader re-read: 176 at B, 26 at C. None reaches A, because none of them reads or writes its chain ID. The 176 at B hold a `curl` call and an expected result; 84 of them name the block of the build (and say honestly that a public node cannot replay it) and 92 use `latest`, and none writes a chain ID. The 26 at C are the Solana pages: they point to a method and hold no command. The script reads the quotes of the pages as `&quot;` (the version of 13 November missed them).

## 4. Where the grade is lowest, and the cheapest fix

- Every chain read of the README is a B at best because the printed result names no block. One sentence per command (the block, from `cast block-number`, and `--block N`) turns the B of R01, R06, R19, R39 and R40 into A, since their network is already written; R04, R05, R07 and R24 also need the chain IDs.
- Eleven of the fifteen B are `python3 scripts/prove.py` or another script of the repository: the page counts a script that carries its own addresses and endpoints as a command, and then asks for the commit it was run at; naming that commit alone takes R02, R03 and R09 to A, because they read no chain.
- The statements about the Solana oracle program (R20 to R22) and about Zcash and the Atom feeds (R25, R30) are D: they hold a fact and no way to check it. Each needs one command and its expected output.
- R34 says the methodology hash is tied to the scoring code; the CHANGELOG says none of the nine hashes can yet be recomputed from the repository. That line should be corrected or the code published.
- The 202 contract pages: replace `latest` by a block the public node can replay, or say on the page which block the value was read at, and write the chain ID. That moves 176 pages from B to A.
