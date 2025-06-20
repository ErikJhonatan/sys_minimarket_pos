# Regression cases

Prepared for this change. **Not executed.** Tests, manual checks, lint and builds require explicit user authorization. Use isolated fixtures; never run destructive cases against production.

| Case | Input or setup | Expected outcome |
| --- | --- | --- |
| Totals | Price=0.1 quantity=3, price=0.2 quantity=1 | Subtotal=0.50; tax=0.05 |
| Stock | Requested quantity exceeds stock or product no longer exists | Submission rejected |
| Duplicates | Double click payment while network request remains pending | Only one POST /orders with all items |
| API failure | Order endpoint rejects or disconnects | Cart remains available; submission guard releases; no success navigation |
| Cleanup | Navigate away with active alert/navigation timers | Timers cleared |

Automated cases are prepared in `tests/regression.test.mjs`. After authorization, run `node --test tests/regression.test.mjs`. They have not been executed.
