# Mirrors the browser runner: stdin fed to input(), echoes shown but not part of
# __output__, tests get __output__ (printed text) and __code__ (source).
import sys, io, json, os, tempfile, contextlib
spec = json.load(open(sys.argv[1]))
code, tests, stdin = spec["code"], spec.get("tests") or "", spec.get("stdin") or []
lines = list(stdin)
printed = io.StringIO()   # what Python printed (incl. input prompts)
shown = []                # printed + echoed input, like the console
def fake_input(prompt=""):
    printed.write(prompt)
    if not lines: raise EOFError("EOF when reading a line")
    v = lines.pop(0); shown.append(v); return v
os.chdir(tempfile.mkdtemp())
g = {"__name__": "__main__", "input": fake_input}
ok, err = True, ""
try:
    with contextlib.redirect_stdout(printed):
        exec(compile(code, "<exec>", "exec"), g)
    if tests:
        g["__output__"] = printed.getvalue(); g["__code__"] = code
        with contextlib.redirect_stdout(io.StringIO()):
            exec(compile(tests, "<tests>", "exec"), g)
except Exception as e:
    ok, err = False, f"{type(e).__name__}: {e}"
console = printed.getvalue() + "\n".join(shown)
missing = [x for x in spec.get("expectOutput") or [] if x not in console]
print(json.dumps({"ok": ok and not missing, "err": err, "missing": missing}))
