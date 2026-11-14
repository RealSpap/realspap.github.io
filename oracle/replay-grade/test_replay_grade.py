#!/usr/bin/env python3
"""Tests de Replay Grade v0.1 (13/11/2026). Aucun réseau.   python3 test_replay_grade.py"""
import importlib.util, os, re, unittest
HERE = os.path.dirname(os.path.abspath(__file__))
def load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, name + ".py")); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
T = load("construire_table"); N = load("noter_fiches")
class TestGrades(unittest.TestCase):
    def test_the_four_grades_follow_the_written_criteria(self):
        g = T.grade
        self.assertEqual(g(1, 1, 1, 1, 1), "A"); self.assertEqual(g(1, 1, 1, None, 0), "A")      # network n/a does not block A
        self.assertEqual(g(1, 0, 1, 1, 1), "B"); self.assertEqual(g(1, 1, 1, 0, 1), "B")          # B needs a command
        self.assertEqual(g(0, 1, 1, 1, 1), "C")                                                   # a named point alone is a C, not a B (review of 14 November)
        self.assertEqual(g(0, 0, 1, 1, 1), "C"); self.assertEqual(g(0, 0, 0, 0, 0), "D")
    def test_a_slogan_with_a_source_is_a_c_never_a_b(self):
        self.assertEqual(T.grade(0, 0, 0, None, 1), "C")
    def test_a_named_point_alone_never_makes_a_b(self):
        for r in T.ROWS:
            cmd, pt = r[4][0], r[4][1]
            if not cmd: self.assertIn(T.grade(*r[4]), ("C", "D"), r[0])
    def test_the_split_claims_are_two_lines_and_the_added_sentences_are_graded(self):
        ids = [r[0] for r in T.ROWS]
        for want in ("R11", "R39", "R14", "R40", "R41", "R42", "R43", "R44", "R45", "R46", "R47"): self.assertIn(want, ids)
        self.assertIn("10 passages", T.NOTES); self.assertIn("slogan", T.NOTES)
    def test_every_row_has_a_unique_id_and_a_next_step(self):
        ids = [r[0] for r in T.ROWS]; self.assertEqual(len(ids), len(set(ids)))
        for r in T.ROWS:
            if T.grade(*r[4]) != "A": self.assertTrue(r[6].strip(), r[0])
    def test_the_summary_of_the_page_equals_the_computed_total(self):
        import collections
        c = collections.Counter(T.grade(*r[4]) for r in T.ROWS)
        page = open(os.path.join(HERE, "replay-grade-v0.1.md"), encoding="utf-8").read()
        want = "README: %d claims graded, %d at A, %d at B, %d at C, %d at D" % (len(T.ROWS), c["A"], c["B"], c["C"], c["D"])
        self.assertIn(want, page)
class TestFicheGrader(unittest.TestCase):
    CMD = '<pre>curl -s -X POST https://rpc.example/rpc -d \'{"method":"eth_call","params":[{"to":"0xabc"},"latest"]}\'</pre> The 6th 32-byte word of the answer is the composite score.'
    def test_latest_is_not_a_named_block(self):
        self.assertEqual(N.grade("<p>" + self.CMD + " chain ID 46630</p>")[0], "B")   # a command without a named block is a B
    def test_a_named_block_with_the_chain_id_and_the_expected_word_is_an_a(self):
        h = '<pre>curl -s -X POST https://rpc.example/rpc -d \'{"method":"eth_call","params":[{"to":"0xabc"},"0x10"]}\'</pre> The 6th 32-byte word of the answer is the composite score. chain ID 46630'
        self.assertEqual(N.grade(h)[0], "A")
    def test_the_quotes_written_as_entities_do_not_hide_a_named_block(self):
        h = '<pre>curl -s -X POST https://rpc.example/rpc -d \'{&quot;method&quot;:&quot;eth_call&quot;,&quot;params&quot;:[{&quot;to&quot;:&quot;0xabc&quot;,&quot;data&quot;:&quot;0xd47875d0&quot;},&quot;0x10&quot;]}\'</pre> The 6th 32-byte word of the answer is the composite score.'
        g, d = N.grade(h, score_only=True); self.assertTrue(d["named_block"]); self.assertEqual(g, "B")   # a named block but no chain ID read: not A
    def test_a_named_block_of_another_call_is_not_the_block_of_the_score(self):
        h = '<pre>curl -s -d \'{"params":[{"to":"0xabc","data":"0x8da5cb5b"},"0x10"]}\'</pre> The word of the answer is the owner. <a href="https://example.org/x">src</a>'
        self.assertTrue(N.grade(h)[1]["named_block"]); self.assertFalse(N.grade(h, score_only=True)[1]["named_block"])
    def test_a_chain_id_in_the_text_of_a_contract_page_counts_only_if_the_page_reads_it(self):
        h = '<pre>curl -s -d \'{"params":[{"to":"0xabc","data":"0xd47875d0"},"0x10"]}\'</pre> The word of the answer is the score. The governance root is on chain id 1.'
        self.assertFalse(N.grade(h, score_only=True)[1]["chain_id"]); self.assertTrue(N.grade(h)[1]["chain_id"])
        self.assertTrue(N.grade(h.replace("0xd47875d0", "0xd47875d0") + " <code>eth_chainId</code>", score_only=True)[1]["chain_id"])
    def test_a_link_without_a_command_is_a_c_and_nothing_is_a_d(self):
        self.assertEqual(N.grade('<p>see <a href="https://example.org/x">this</a></p>')[0], "C"); self.assertEqual(N.grade("<p>trust me</p>")[0], "D")
if __name__ == "__main__": unittest.main()
