# Authority Levels v0.4: a request for comments

Status: draft for comments, version 0.4 of 14 November 2026. It corrects an earlier draft, which I did not publish, after a separate review of that draft, which gave 18 findings (3 on figures, 10 on criteria and edge cases, 5 on form); all 18 are applied here, except one difference between the R-1 code and its grid file, reported in edge case 7. Every file that a reading of this page rests on is listed in section 9 with its hashes, so that a reader can replay each reading from this page alone. Nothing here is final.

I propose a small scale that says how much stands between a role in a protocol and the people who hold it. It has six levels, 0 to 5, and it is applied to three roles separately: the right to change the code, the right to suspend, and the right to change the price oracle. Each level has one criterion that a reader can measure on chain, and one command that replays the measurement. Where a reading is impossible, the result is a typed word, never a level.

I do not use this page to compare protocols with each other, and I do not publish a single number for a protocol. The example at the end shows why: one protocol reads 5, 2 and 5 on its three roles, and an average would hide the 2.

## 1. What is mine and what is not

The six levels, their criteria and the reading rules are taken from a measurement I ran on 29 October 2026 (called R-1 below) on the token roles of the assets that Aave V3 on Ethereum lists as collateral. R-1 adapts the levels of the Aave Technical Asset Listing Framework, adopted on Snapshot on 13 July 2026. Its grid file and its script are hashed before any read, and a read refuses to start if the hashes differ (both files are in section 9).

R-1 is incomplete for this page, and I say where:

- R-1 reads the roles of tokens: proxy admin, owner, pauser, minter, blacklister. It stops at tokens: the contracts that run a protocol, such as the pool, its configurator or its price oracle, are outside it.
- Neither R-1 nor the study behind it reads anything about a price oracle. For the oracle role I added no criterion. I only name the gate to read (section 2), apply the same six levels to whoever holds that gate, and list what the reading leaves out (section 8).
- The three roles, the rule that a role takes the level of its weakest holder, and the commands in section 4 are my draft. R-1 applies the weakest-holder rule to a whole asset; applying it to one role is a choice I make here and ask you to challenge.
- Where this page and the R-1 code differ, the page follows the code, and says so. One difference with the grid file of R-1 is reported in edge case 7; I have not changed any hashed file.

As an inspiration for the shape of the page I read the public page on the rollup decentralisation framework that l2beat.com redirects to, now served on https://ethbeat.org/ (read at 07:19Z on 14 November). It says the framework was introduced in June 2023, that the idea was proposed on Ethereum Magicians in November 2022 and made precise by the L2BEAT team, and that it speaks of maturity in terms of decentralisation, not of security. I borrow the idea of a short scale with written criteria and nothing more: the names, the levels and the subject (rollups there, roles of any protocol here) are different.

## 2. The three roles

- CODE: who can change the logic that users call. The gate is the upgrade entry point: the proxy admin, or the owner of the contract that points the protocol to its implementation. R-1 reads both with the getter `owner()` and the proxy admin slots.
- SUSPEND: who can pause the protocol. The gate is the pause function and every role or owner that may call it. R-1 reads `pauser()` and the AccessControl holders.
- ORACLE: who can change the price source the protocol reads. this page defines this role as the right to replace the oracle contract itself. Changing the source of one asset inside an oracle is not specified on this page (section 8).

For each role the page names the gate, finds the holders at a dated block, classifies each holder with the table in section 3, and the role takes the lowest level among its classified holders. When another holder is NOT_READ or UNCLASSIFIED, the role is written "at most N", with that holder listed beside it: the level is then an upper bound, never a certain value. R-1 itself prints N with a tag and no NOT_READ mark (edge case 5); this page reads that output as "at most N". A holder that cannot be classified does not disappear (section 5).

## 3. The levels

| Level | Criterion, read at the dated block | Command |
|---|---|---|
| 0 | The holder is one key: an address with no contract code, or whose code begins with the EIP-7702 delegation prefix 0xef0100. A delay in front of it does not raise it (edge case 4). | C1 |
| 1 | The holder is a multisig with threshold s and n owners, and s is at most n/2. | C2 |
| 2 | Multisig with s above n/2, and no timelock between the multisig and the gate. A timelock whose delay is 0 counts as no timelock (edge case 5). | C2 |
| 3 | Multisig with s above n/2 behind a timelock whose delay is above 0 and below 172800 seconds (48 hours). | C3, then C2 on each proposer |
| 4 | Same as level 3 with a delay of 172800 seconds or more. | C3, then C2 on each proposer |
| 5 | On-chain governance: a Governor whose `votingPeriod()` is non-zero, or a DSChief (`hat()`), placed behind a timelock as proposer, as admin or as restricted executor, or as the admin, owner or authority of a `delay()` timelock; or one of the two Aave Executors listed below whose `owner()` is the Aave PayloadsController. No delay is required for level 5 (edge case 6 and question 4). | C4 |

The two Aave Executors that R-1 knows are 0x5300a1a15135ea4dc7ad5a167152c01efc9b192a (Aave's level 1 Executor) and 0x17dd33ed0e3dd2a80e37489b8a63063161be6957 (Aave's level 2 Executor), both on Ethereum mainnet (chain id 1). The PayloadsController is 0xdabad81af85554e9ae636395611c58f7ec1aaec5 on Ethereum mainnet (chain id 1). A third Executor would not be recognised: R-1 holds these two addresses in its code.

Levels 0 and 1 are the weak configurations in the Aave framework. The thresholds are not set by that framework; they are R-1's choices, and they are among the things I ask you to challenge.

## 4. Replay commands

Every command carries the dated block and is run on two nodes. Setup, for Ethereum mainnet (chain id 1) and the block 26408863 written in hexadecimal:

- `NODE=https://mainnet.gateway.tenderly.co` and then again with `NODE=https://eth-mainnet.public.blastapi.io`
- `BLOCK=0x192f79f`
- `HOLDER=` the address under test

C1 (level 0), result `0x` means no code:

- `curl -s -X POST $NODE -H 'content-type: application/json' --data '{"jsonrpc":"2.0","id":1,"method":"eth_getCode","params":["'$HOLDER'","'$BLOCK'"]}'`

C2 (levels 1 and 2), run with `DATA=0xe75235b8` for `getThreshold()`, which returns s, and with `DATA=0xa0e67e2b` for `getOwners()`, whose second 32-byte word is n:

- `curl -s -X POST $NODE -H 'content-type: application/json' --data '{"jsonrpc":"2.0","id":1,"method":"eth_call","params":[{"to":"'$HOLDER'","data":"'$DATA'"},"'$BLOCK'"]}'`

C3 (levels 3 and 4), same command as C2, with `DATA=0xf27a0c92` for `getMinDelay()` on an OpenZeppelin TimelockController, or `DATA=0x6a42b8f8` for `delay()` on a Compound or DSPause timelock. The result is in seconds; compare it with 172800, which is 0x2a300. A delay of 0 means no timelock. Who is behind the timelock:

- OpenZeppelin timelock, the holders of the proposer, admin and executor roles come from the `RoleGranted` logs, on one node only because the other public nodes refuse wide ranges (Ethereum mainnet, chain id 1): `curl -s -X POST https://mainnet.gateway.tenderly.co -H 'content-type: application/json' --data '{"jsonrpc":"2.0","id":1,"method":"eth_getLogs","params":[{"address":"'$HOLDER'","fromBlock":"0x0","toBlock":"'$BLOCK'","topics":["0x2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d"]}]}'`. Each holder is then checked with `hasRole` (`DATA=0x91d14854`, then the role id and the holder padded to 32 bytes each), and each proposer with C2.
- Compound or DSPause timelock: the controllers that act through the delay are `admin()` (`DATA=0xf851a440`), `owner()` (`DATA=0x8da5cb5b`) and `authority()` (`DATA=0xbf7e214f`).

C4 (level 5), same command as C2, with `DATA=0x8da5cb5b` for `owner()` on an Aave Executor (the result must be the PayloadsController), `DATA=0x02a251a3` for `votingPeriod()` on a Governor (the result must be non-zero), or `DATA=0xfe95a5ce` for `hat()` on a DSChief.

Whole example in one command. Get the four files marked R-1 in section 9 (the grid, the script, the driver and the hash file) with the commands given there, and run it from the folder that holds them. It checks the grid and script hashes before it reads, it creates the output folder, and it writes under the output prefix you give:

- Ethereum mainnet (chain id 1): `ACL_MANAGER=0xc2aacf6553d20d1e9d78e365aaba8032af9c85b0 python3 -I -B exemple_niveaux_13_11.py 26408863 HASHES-AVANT-13-11.txt sortie/my-replay`

The address in that command is the ACLManager of the example, on Ethereum mainnet (chain id 1). The driver imports the R-1 script unchanged and only replaces the list of contracts it reads. Its output names the roles by the leading 4 bytes of their id: 0x5c915140 is EMERGENCY_ADMIN and 0x12ad05bd is POOL_ADMIN.

## 5. Typed results that are never a level

A result that is not a level has a name, and it is never turned into 0, into 5, or into "the lowest" or "the highest".

- `NOT_READ`: a read failed or the nodes disagree. This covers an API error, a rate limit, a timeout, a node dropped after 30 errors, and a different value on the two nodes.
- `UNCLASSIFIED`: the reads cannot derive the mechanism: an Aragon `kernel()`, a registry, a controller that cannot be read, an unknown multisig, a chain of controllers deeper than 5 steps. It is not a 0 and not a 5.
- `NO_ROLE_READ`: no standard getter returned a holder. This is an absence of reading, never an absence of power.

## 6. Edge cases, written before the next reading

1. Two nodes give two different values: that read is `NOT_READ`. There is no third node and no fallback value. The block hash is compared on the two nodes at the start of the pass (a difference stops it) and again at the end (a difference makes the whole result invalid).
2. Three tries per call and per node at most. A node that reaches 30 errors is dropped and its later reads are `NOT_READ` without a call.
3. An empty `eth_call` result is never a value. For a getter it means the contract does not serve that function, and a revert on both nodes is counted the same way. For a read that had to decide (`hasRole`, `getOwners` on a contract already recognised as a multisig) it is `NOT_READ`. One gap of the R-1 code belongs here: on the minter and ward lists of a token, a revert removes the candidate without writing `NOT_READ` (the reads of `wards` and `isMinter`), and removing a weak holder can raise a level. That is a defect of the code, listed for the next R-1, not a rule.
4. A one-key holder behind a timelock keeps level 0, and a minority multisig behind a timelock keeps level 1: the delay does not raise them. One exception comes from case 5: if the executors of that timelock are restricted and the weakest of them is a Governor, a proposer that is one key counts at level 5, which is what the R-1 code gives.
5. A timelock with several proposers takes the lowest level among its proposers and admins. If its executors are restricted, a proposer counts at the higher of its own level and the level of the weakest executor, because both are needed to act. An open executor adds no constraint. If the `hasRole` read of a role holder found in the logs is `NOT_READ`, the timelock is `UNCLASSIFIED`. If another read about one proposer fails (its code, a probe), that proposer is left out of the minimum, and the timelock is written "at most N" with the unclassified part noted. Precisely, R-1 prints N with the tag "[en partie non classe]" in the detail and does not mark the line `NOT_READ`: this page reads that output as "at most N". A timelock whose delay is 0 gives a multisig behind it level 2, not 3.
6. Delays do not add up: a controller behind several timelocks in series takes, at each step, the higher of its level and the level of that delay, so two timelocks of 24 hours in series give level 3, not 4. A Governor behind a timelock whose delay is 0 still reads level 5 in the R-1 code. I report it as it is and ask in question 4 whether it should.
7. A Governor or a DSChief alone, with no timelock in front, is outside the grid: `UNCLASSIFIED`, never 5. An Aave Executor counts as 5 only if its owner read at the block is the PayloadsController. If the owner is anything else, the R-1 code does not write `UNCLASSIFIED`: it follows the owner as it follows any unknown contract, and an owner that is a plain key gives level 0. The grid file of R-1 says `UNCLASSIFIED` for that case, so the code and the grid file differ. I have not changed either, because both are hashed; I propose that the next R-1 writes `UNCLASSIFIED` in that case.
8. The address 0x0 is a renounced or empty role, not a holder.
9. A contract that is nothing known is followed through its own controllers (`owner()`, `admin()`) for at most 5 steps. A loop or a longer chain is `UNCLASSIFIED`.
10. Every multisig is read again without cache at the dated block and at the finalized head. A difference from the classification makes the result invalid. A threshold that changed after the dated block is flagged.
11. Four witnesses are read before and after on each node (a known non-multisig returns an empty result for `getThreshold()`, a random address has no facilitator role on the GHO token, the Aave Executor owner is the PayloadsController, both nodes give the same block hash). A witness that fails before stops the pass; one that fails after makes the result invalid.
12. A holder that never announced itself by an event is not seen by the log reading. That is a stated limit, not a `NOT_READ`.
13. Safe modules execute without signatures. R-1 reads the module list of a Safe but the level ignores it: a Safe with 3 of 5 owners and a module stays at level 2. Today it is a limit of the grid, not a criterion.
14. A level describes what the chain shows at the block. Off-chain keys, off-chain agreements and a compromise are outside it.

## 7. One example, read again on 14 November

Protocol: Aave V3 on Ethereum mainnet (chain id 1), the PoolAddressesProvider 0x2f39d218133afab8f2b819b1066c7e434ad94e9e. The public Watch lists it among its targets: at 07:37Z on 14 November the Watch file for the Ethereum testnet oracle holds 39 targets including this one, with target network Ethereum mainnet and chain id 1, and the file of the last run counts 202 targets on 9 oracles (`watch-cible-suivie-14-11.txt`, which names the two files read on raw.githubusercontent.com; the Watch rewrites them at every run, so a reader who opens them later finds other counts). The Pool it serves is 0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2 on Ethereum mainnet (chain id 1).

Network and block, read at 07:36Z on 14 November on both nodes (`lectures-complementaires-26408863.txt`): `eth_chainId` answers 1 on each. The dated block is 26408863 on Ethereum mainnet (chain id 1), hash 0x9ea205233ff153b92fb6bf1870b2eebd66fadb3c4c84b683b1e71dfc2ffce636, block time 21:54:11Z on 13 November, the same hash on both nodes (Tenderly and Blast) before and after the pass; the hash and the block time are written in `exemple-provider-aave-26408863.json`.

The pass of the unchanged R-1 script ran from 22:14:52Z to 22:18:30Z on 13 November (the `execution` field of its JSON), and the grid and script hashes were written before that read (`HASHES-AVANT-13-11.txt`). It produced 26 lines, 0 `NOT_READ`, 0 invalid, all witnesses passing on both nodes. Ten lines are `UNCLASSIFIED`, and none of them is one of the rows below. The same command was run again on 14 November with a new output prefix: see the replay line at the end of this section.

| Role | Gate read at the block | Holders | Network | Level |
|---|---|---|---|---|
| CODE | `owner()` of the PoolAddressesProvider, which controls the pool implementation | Aave Executor 0x5300a1a15135ea4dc7ad5a167152c01efc9b192a, whose owner is the PayloadsController 0xdabad81af85554e9ae636395611c58f7ec1aaec5 | Ethereum mainnet, chain id 1 | 5 |
| SUSPEND | the EMERGENCY_ADMIN role or the POOL_ADMIN role of the ACLManager, either can call the pause functions | EMERGENCY_ADMIN: Safe 0x2cfe3ec4d5a6811f4b8067f0de7e47dfa938aa30, threshold 4 of 7 owners, no timelock (level 2). POOL_ADMIN: the Aave Executor 0x5300a1a15135ea4dc7ad5a167152c01efc9b192a (level 5) | Ethereum mainnet, chain id 1 | 2 |
| ORACLE | `owner()` of the PoolAddressesProvider, which guards the replacement of the oracle | Aave Executor 0x5300a1a15135ea4dc7ad5a167152c01efc9b192a, same reading as CODE | Ethereum mainnet, chain id 1 | 5 |

The role of SUSPEND takes the lowest of its two holders, 2. The EMERGENCY_ADMIN role was granted to four addresses in the logs of the ACLManager; only the Safe above holds it at the block, the other three return no role on both nodes (`lectures-complementaires-26408863.txt`, read at 07:37Z, which also prints n = 7 and s = 4 for this Safe and n = 11 and s = 2 for the Safe of the table below). The Safe threshold was read again without cache at the dated block and at the finalized head 26408902: 4 of 7, same owners.

The CODE and ORACLE rows share one holder because both go through the owner of the PoolAddressesProvider (`getPriceOracle()` returns 0x54586be62e3c3580375ae3723c145253060ca0c2 and `getPoolConfigurator()` returns 0x64b761d848206f447fe2dd461b0c635ec39ebb27 at the block, on Ethereum mainnet, chain id 1, same on both nodes, read at 07:36Z on 14 November).

What stands behind level 5, read at 07:36Z on 14 November on both nodes: the PayloadsController, for access level 1, names the Executor 0x5300a1a15135ea4dc7ad5a167152c01efc9b192a with a delay of 86400 seconds (24 hours), and for access level 2 the Executor 0x17dd33ed0e3dd2a80e37489b8a63063161be6957 with a delay of 604800 seconds (7 days), on Ethereum mainnet (chain id 1). The Executor that holds CODE, ORACLE and POOL_ADMIN therefore sits behind 24 hours, which is below the 48 hours that separates levels 3 and 4. Level 5 ignores this delay (question 4). The PayloadsController names 0x9aee0b04504cef83a65ac3f0e838d0593bcb2bc7 as its message originator, on Ethereum mainnet (chain id 1); on that contract `getVotingConfig(1)` returns the five values 86400, 259200, 320000, 80000 and 80000, and `getVotingConfig(2)` returns 86400, 864000, 1040000, 1040000 and 200000, the same on both nodes (read at 07:37Z). I list the numbers; this page does not use them in any criterion.

Gate witnesses. Read at 22:19:47Z on 13 November (the header of `temoins-portes-26408863.txt` gives that time), then the pause part read again at 07:36Z on 14 November (`temoins-portes-26408863.txt`, `lectures-complementaires-26408863.txt`), on both nodes, with the same result on each. I simulated the privileged call with `eth_call` from the holder and from a random address, at the dated block. No transaction was sent.

- SUSPEND, `setPoolPause(true)` and `setPoolPause(true, 0)` on the PoolConfigurator: the Safe's call succeeds in simulation, and so does the Executor's, which holds POOL_ADMIN (`hasRole` returns 1 for POOL_ADMIN on the Executor and 0 on the Safe; 1 for EMERGENCY_ADMIN on the Safe and 0 on the Executor). The stranger's call reverts.
- ORACLE, `setPriceOracle` with the current oracle: the Executor's call succeeds in simulation, the stranger's call reverts with the ownership message.
- CODE, `setPoolImpl` with the current implementation: the stranger's call stops at the ownership check with its message; the Executor's call reverts with an empty reason, which differs from the stranger's message. So for CODE the witness shows where the gate is, and it does not show a successful upgrade.

A simulation shows the gate. It does not show that the holder would do harm, and it does not show what the PayloadsController and the governance behind it require before the Executor acts.

The commands of section 4 were also run on both nodes at the same block, read at 07:37Z on 14 November (`commandes-niveaux-26408863.txt`), and gave the same result on each:

| Command | Address | Network | Result |
|---|---|---|---|
| C1 | 0x807a96288a1a408dbc13de2b1d087d10356395d2 | Ethereum mainnet, chain id 1 | `0x`, no code |
| C2 | 0xad67ba2795770c8e0b70e2896c0f81f9d313fd44 | Ethereum mainnet, chain id 1 | s is 2, n is 11 |
| C2 | 0x2cfe3ec4d5a6811f4b8067f0de7e47dfa938aa30 | Ethereum mainnet, chain id 1 | s is 4, n is 7 |
| C3 | 0x055e84e7fe8955e2781010b866f10ef6e1e77e59 | Ethereum mainnet, chain id 1 | 86400 seconds |
| C3 | 0xfe89cc7abb2c4183683ab71653c4cdc9b02d44b7 | Ethereum mainnet, chain id 1 | 172800 seconds |
| C3 with `delay()` | 0x1a9c8182c09f50c8318d769245bea52c32be35bc | Ethereum mainnet, chain id 1 | 172800 seconds |
| C4 | 0x5300a1a15135ea4dc7ad5a167152c01efc9b192a | Ethereum mainnet, chain id 1 | owner is 0xdabad81af85554e9ae636395611c58f7ec1aaec5 |
| C4 | 0x323a76393544d5ecca80cd6ef2a560c6a395b7e3 | Ethereum mainnet, chain id 1 | voting period 45818 |
| C4 with `hat()` | 0x0a3f6849f78076aefadf113f5bed87720274ddc0 | Ethereum mainnet, chain id 1 | returns 0x900c952c676595ddb392fa6349ad5f0674a67eeb |

The logs command of section 4, run on the timelock of the 172800-second C3 row, returns 6 `RoleGranted` logs from block 0 to the dated block on Tenderly (`lectures-complementaires-26408863.txt`); the `hasRole` results for the four EMERGENCY_ADMIN grantees are in the same file. The addresses of the C1 row, of the Safe with 2 of 11, of the three C3 rows, of the Governor row and of the DSChief row were taken from the 29 October study. That table only checks that each command runs and returns the value the criterion needs; it gives no level to those holders, and it is not a reading of the roles they guard.

The same command was run again from 07:21Z to 07:24Z on 14 November under a new output prefix (`exemple-provider-aave-26408863-rejeu-14-11.json`), with the grid and script hashes checked before the read: the same 26 lines, line for line, 0 `NOT_READ`, 0 invalid, the same block hash on both nodes (start and end times are in the `execution` field of its JSON). Its content hash differs from the one of 13 November because the finalized head read for the Safe refresh is later.

## 8. Limits and open questions

- The example covers three gates of one protocol. The levels 0, 1, 3 and 4 are shown only by the command check above, not by a role of the example.
- Level 5 for an Aave Executor rests on the shape rule of edge case 7. The delay of 24 hours and the five voting values of the governance that feeds the PayloadsController are read in section 7; what they should mean for level 5 is not decided by this page (question 4).
- The ORACLE role stops at the replacement of the oracle contract. How one asset's price source is changed inside the oracle is not specified on this page, and no reading rule exists for it in R-1 or in the study.
- The role level uses the weakest holder. A role guarded by several holders of which only one is needed is correctly at the lowest level; a role that needs several holders together is not modelled.
- The logs are read on one node, so a holder that never emitted an event is not seen.
- The pass of the R-1 script also prints one aggregated level for the ACLManager as an asset. This page does not use it, because it mixes roles that differ.

Questions I would like answered:

1. Is the weakest holder the right level for a role, or should a role be given as a list of levels?
2. Is 48 hours the right boundary between levels 3 and 4, and should a delay raise a one-key holder at all (edge case 4)?
3. For a restricted executor, is the higher of the two levels (edge case 5) the right reading?
4. Should level 5 require a delay, given that the Executor of the example sits behind 24 hours, and should a Governor behind a timelock of 0 seconds read 5 (edge case 6)?
5. Which gate should define ORACLE: the replacement of the oracle contract, the change of an asset's source, or both?
6. Is there a reading that would give a different level for the example, and with which command?

## 9. The files behind this page

Each file is a plain text file in the folder `docs/authority-levels/` of the public repository https://github.com/RealSpap/authority-risk-oracle-showcase. The hashes below are those of the files as published, so that a changed file shows. The grid, the script and the driver have their comments and the names of their output fields in French.

| File | What it is | Bytes | sha256 | md5 |
|---|---|---|---|---|
| `GRILLE.md` | R-1: the grid, in French | 8590 | `d07ff360b2a408824bd0ed605abe468794c4b51d5f91ab155dd22499dce44896` | `6e4db51e80bd38148d045badc3e01bb9` |
| `mesure_aave_niveaux.py` | R-1: the script, comments in French | 51424 | `9be99f4c8313f0f5007217fa08998a7c6caefe63d777728f9dc6d228efcf77fd` | `e828a5b0e0473b866493210538586a76` |
| `exemple_niveaux_13_11.py` | R-1: the driver of the example | 1620 | `e7a7148545d30067ad060ec8e58212f73f68f8f207418b708e6ad50a88b66507` | `a5191d0fa63dd2ef1ba79f1495b022c7` |
| `HASHES-AVANT-13-11.txt` | R-1: the grid and script hashes, written before the read of 13 November | 316 | `78be031b0807a7bbb43f5ae12f971fd6cc6a0d2b4a66bd72aadd6aa20c0d6b07` | `00c3c7058bc9581bf34913b7c6ecf9ea` |
| `exemple-provider-aave-26408863.json` | output of the pass of 13 November (22:14:52Z to 22:18:30Z), block 26408863 on Ethereum mainnet (chain id 1) | 17385 | `3be50b5b06bf7bc559976cebd72098bde2953000fa541d23e8c57a8bd98ea850` | `ea4aa96adbeb64fa5b8b63007c4553cb` |
| `exemple-provider-aave-26408863-rejeu-14-11.json` | output of the same command run again on 14 November (07:21Z to 07:24Z) | 17386 | `89aa51377eb1c3585657464ff3b29030376063971c1db0fca420cdae9eabc9a3` | `01a748ba89991133d0be9321da8759ed` |
| `lectures-complementaires-26408863.txt` | readings of 14 November, 07:36Z to 07:37Z: network, block, roles, thresholds, delays, governance values | 11392 | `984ef256266e0747894f7152eb26cbb9724e4735ab41b7d4b82c8e1763a99bbc` | `27db32e2484356f7db3a891ec3fe5503` |
| `temoins-portes-26408863.txt` | gate witnesses: simulated privileged calls, read at 22:19:47Z on 13 November | 1261 | `7a5dbc6468ff27133f4b6ab351bca1cd3b9df5328673394167fceb8b7e17b047` | `3e1cccca0e49545d3d6f97fde4873a06` |
| `commandes-niveaux-26408863.txt` | the commands of section 4 run on both nodes, 14 November 07:37Z | 3306 | `2ab4e99ea31d28fca1a760d393749ec133762cb962a0f186ff28cd107048823c` | `413fe8d582ec3975add15ae596237681` |
| `watch-cible-suivie-14-11.txt` | the two Watch files read on 14 November at 07:37Z | 471 | `e5c1ecb5a2d0fde8eff028395b4be6914b0d45683882298981339be81ebc8faa` | `f29a70462dc1dc489223f7b121f1dabf` |

The grid and script hashes in `HASHES-AVANT-13-11.txt` are the sha256 of `GRILLE.md` and `mesure_aave_niveaux.py` above; the script refuses to start if the files on disk differ from them. The script needs Python 3 and its standard library, no key and no account; it reads Ethereum mainnet (chain id 1) on two public nodes.

To replay the whole example:

- `git clone --depth 1 https://github.com/RealSpap/authority-risk-oracle-showcase`
- `cd authority-risk-oracle-showcase/docs/authority-levels`
- `shasum -a 256 GRILLE.md mesure_aave_niveaux.py` must print the two sha256 of the table above
- then the command of section 4, which writes `sortie/my-replay.json` and `sortie/my-replay.md` in that folder

The 26 lines of the result are in the `lignes` field of the JSON; compare them with the same field of `exemple-provider-aave-26408863.json`. The content hash of the whole file may differ, because the finalized head read for the Safe refresh is later. I ran the command on 14 November in a folder that held only the four R-1 files, and it gave the same 26 lines as `exemple-provider-aave-26408863.json`, with 0 `NOT_READ` and 0 invalid, on the same block hash on both nodes.

The files named in this page are described, with their hashes, in section 9. Comments are welcome at contact@realspap.com, with the command and the block so that I can replay yours. If a reading here is wrong, I will withdraw it and say so in the next version.
