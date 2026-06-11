# CLAUDE.md

## Graphify (Primary Navigation)

Graph auto-loads at session start via hook. Use it — don't re-derive what the graph already knows.

**ALWAYS use graphify when:**
- Exploring unfamiliar code or asked "where is X"
- Any cross-file question ("how does X relate to Y")
- Before reading source files you haven't seen this session
- Before running grep/find on the codebase
- Starting any multi-file task

**Commands:**
```bash
graphify query "<question>"          # find nodes by concept
graphify path "<A>" "<B>"            # trace relationship between two things
graphify explain "<concept>"         # explain a node in context
graphify update .                    # refresh graph after code changes (no API cost)
```

**Files:**
- `graphify-out/GRAPH_REPORT.md` — god nodes, communities, surprising connections
- `graphify-out/wiki/index.md` — if exists, navigate it instead of reading raw files

Run `graphify update .` after modifying code to keep graph current.

---

## Coding Guidelines

### 1. Think Before Coding

State assumptions explicitly. If multiple interpretations exist, present them — don't pick silently. If simpler approach exists, say so. If something is unclear, stop and ask.

### 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked
- No abstractions for single-use code
- No "flexibility" that wasn't requested
- No error handling for impossible scenarios

If you write 200 lines and it could be 50, rewrite it.

### 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

- Don't "improve" adjacent code, comments, or formatting
- Don't refactor things that aren't broken
- Match existing style even if you'd do it differently
- If you notice unrelated dead code, mention it — don't delete it
- Remove imports/variables/functions YOUR changes made unused; leave pre-existing dead code alone

Every changed line should trace directly to the request.

### 4. Goal-Driven Execution

Transform tasks into verifiable goals before starting:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```
