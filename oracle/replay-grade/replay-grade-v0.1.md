# Replay Grade v0.1: a request for comments

Version 0.1, draft of 2026-11-13, revised on 2026-11-14 after a review of the page and of its table (the changes are listed in the last section). Status: request for comments. Nothing here is final, nothing has been sent to anyone, and the criteria below will change if the comments are good.

## What this grades

Many projects now publish who can change a smart contract: a key, a multisig, a vote, a delay. Each publication makes claims such as "this contract is controlled by a 3 of 5 multisig" or "the delay is 48 hours". The question here is narrow: **what does the page itself let a reader replay?** It does not ask whether the claim is true, whether the project is safe, or whether the score is right. A claim can get the best grade and be wrong; a claim can get the worst grade and be right. The grade only says how much work a stranger needs before they can find out.

One grade per claim, never one per product. A page with ten claims has ten grades. There is no ranking between projects and no average.

## The four elements

A claim is graded on four elements, each checked on the page where the claim is made:

1. **Command.** A complete command or request a reader can paste and run: the tool and its arguments, with the address and the endpoint. A method name alone (`eth_getStorageAt`) is not a command. A script of a repository counts as a command when the claim names the script and its arguments and the script itself carries the address and the endpoint; the claim then needs the commit the script was run at as its named point of reading, and without it the claim has no named point.
2. **Named point of reading.** For chain state, the block number or the slot. The word `latest` is not a named point. For a web file or an API that has no block, the UTC time of the read, to the minute. For a repository file, a commit hash. For a read of the chain, a time of day is not a named point, whatever the method. A claim whose subject is a commit (the pinned commit is the last one that changed a file) names that commit, which is then also its named point of reading.
3. **Expected result.** What the command should print or return, written on the page, so a reader can tell a match from a difference. A value that moves (a timestamp, a live score) is expected to be written as moving, with the field to compare.
4. **Network.** For a chain read, the network name and its identifier written on the page: the chain ID for an EVM chain, the genesis hash or the cluster for Solana.

## The four grades

- **A**: all four elements.
- **B**: not A, and a command.
- **C**: not B, and either a source a reader can open (a link, a file path, a transaction, an address with the call to make) or a named point of reading, with no command.
- **D**: nothing to replay.

A claim that is about no chain (a count of files, a result of a script on a repository) is graded on the same four elements, with the commit as its point of reading and the network element not applicable; it can reach A.

## Edge cases

- **Unreadable is a type, never a grade.** If the page or a link cannot be opened when the claim is graded, the result is `UNREAD`, with its cause (`link dead`, `RPC refused`, `file moved`). It is not graded C or D by default, and it is not counted as a zero.
- **A replay that gives a different result keeps its grade.** The grade measures what the page permits. A difference is reported next to it as a flag (`replay differs`), with the date.
- **A dated claim whose value moved is a stale result, a claim in the present tense is a difference.** A claim written with its date ("8 alerts firing at build time") is read as dated: if the value moved, the flag is `expected result stale`. A claim in the present tense ("Open alerts (8)") whose value moved is `replay differs`.
- **A stale expected result is a flag, not a downgrade.** If the page says what the result was on a past date and says the value moved since, the grade is the one the elements give. If the page does not say it moved, the flag is `expected result stale`.
- **A claim with several parts is split.** "The authority is X and it has no code" has two parts and gets two grades if only one part has a command. The split is written in the table of whoever grades, as two lines, never left to the reader: a claim whose parts differ in what a reader can replay is two lines.
- **Slogans, disclaimers, licences and promises are not claims.** They are listed in the table of whoever grades, by kind and count, so that nothing is hidden by calling it a slogan.
- **A link to a page that holds the command is a source, not a command.** The command has to be on the page of the claim, or the claim must name the exact file and line that holds it. The result is a C until the command is moved.
- **Time-dependent commands.** A result that depends on the current time (an age limit, a staleness check) is expected to say which time the example was run at.

## How to apply it in five steps

1. Copy one claim, with its page and line.
2. Look for the four elements on that page.
3. Write the grade and, for each missing element, the one line that would add it.
4. If you can, run the command and note `matches` or `replay differs`, with the time.
5. Publish the table with the claims you could not grade, typed `UNREAD`, and the reason.

## What I grade first: my own pages

I have graded my own claims first, in public, with the ones that fall to C and D. The table is [`own-grades-v0.1.md`](own-grades-v0.1.md), next to this page, and also [as a web page](own-grades.html). Summary, read at 09:50Z, on 14 November: the README of the showcase repository at commit `a6eb1da` and a local copy of the site pages at commit `ebec56c`:

- README: 47 claims graded, 1 at A, 15 at B, 18 at C, 13 at D, and 10 passages left out as not being claims (the slogan of the banner, badges, disclaimers, licences, link lists), each listed. Eleven of the 15 at B are scripts of the repository that count as commands under the rule of element 1.
- The 202 contract pages of the site (counted one by one by a script, [`noter_fiches.py`](noter_fiches.py)): 176 at B (a command and an expected result; 84 name the block of the build and 92 use `latest`; none writes the chain ID of the read), 26 at C (Solana: the page points to a method and holds no command).
- No page of mine reaches A for a chain read yet. In the README, the one A is the read of a web file: a command that prints a refusal, with the time of the run and the network of the label written.

Three examples from my own pages:

- **A.** The strict gate on one label: the command is written, the printed line is written, the read is dated to the minute (21:45 on 12 November, in UTC), and the label names its network and chain ID.
- **B.** A contract page: it holds a `curl` call and says which word of the answer to compare, and it says honestly that the node cannot replay the block of the build. It names the block of the build but writes no chain ID.
- **D.** The sentence of my README that says the score reads exposure and does not predict who gets hit: it describes what the score means, so there is nothing to run.

## Versioning and comments

This is version 0.1. Any change of a criterion becomes version 0.2 with a dated change list, and old grades keep the version they were given under. I would like comments on five open points: whether a UTC time is an acceptable point of reading for a web file, whether `latest` should ever count, whether the chain ID should be required when the endpoint address already implies it, whether a claim split in parts should be graded by its weakest part, and whether a script of a repository that carries its own address and endpoint should count as a command. Comments and corrections are welcome by an issue on the showcase repository or by writing to contact@realspap.com. Co-authors are welcome on the criteria; a grade of another project is never published here without that project having been told first and having had seven days to answer.

## Changes of 2026-11-14

A review of this page and of its table found points to correct; those about the criteria and the table are applied here, and the grades of the table were computed again.

- A script of a repository counts as a command under a written rule, and then needs the commit as its named point (element 1).
- A named point of reading alone no longer makes a B: B needs a command; a named point alone, like a source alone, is a C. Two lines of the table fall from B to C (R10 and R17).
- A time of day is not a named point for a read of the chain (element 2); a claim whose subject is a commit names that commit.
- The split of a claim in parts is applied: R11 and R14 are each two lines now (R39 and R40 are their parts that a command replays).
- The table is complete: the slogan of the banner is excluded and listed, and seven sentences that were neither graded nor excluded are graded (R41 to R47).
- A dated claim and a present-tense claim are told apart for a changed value (`expected result stale` or `replay differs`).
- The page grader reads the quotes of the pages written as `&quot;`: 84 of the 202 contract pages name the block of the build in their score call, not none as the first version said. The grades of the 202 pages do not change (176 at B, 26 at C).
- The grades of five lines were corrected after a second reading of the README: R08 (no stale flag, the page says the value moved), R10, R18 (the label is linked), R24 (the network is asked for) and R35 (the expected key is written).
