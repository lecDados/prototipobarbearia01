<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Project architecture

- Each menu module has its own route sharing the AppShell component (menu + header), so pages are linkable and SEO-distinct.
- The management chat is a single-session, local intent assistant; it reads the demo metrics and gates chat-based mutations behind Pro messaging.
- Dashboard alone opts into the shared header highlight area; BarberNews preserves its dark animated frame but contains social links and typed management shortcuts, not news content.
- Online queue: public clients use SECURITY DEFINER RPCs (fila_publica/entrar_fila/sair_fila) and a data-free public broadcast topic 'fila-<slug>' so anon never reads the fila table directly.
- Public wait countdowns use a browser-persisted estimate keyed to the customer ID, queue prefix and service duration; restored customer identities must be validated by the private entry token, because shared queue links are not customer credentials.
- The barber queue lives under the authenticated layout and uses bearer-authenticated server functions with owner-scoped RLS, so the persisted account session replaces PINs without making management public.
- Keep the customer queue route non-nested (`fila_.$codigo`) relative to the barber panel, so public customer pages never inherit the management shell or its home navigation.
- Dashboard owns the combined wallet view; keep /carteira as a redirect so existing links remain valid.
- Financial totals and chat financial replies derive from the same browser-persisted ledger, with same-window events and cross-tab storage listeners; demo financial figures must not be mixed with recorded transactions.
- Dashboard indicator slides share the account and inventory records with their pages and use the financial ledger for wallet values, preventing divergent summaries.

<!-- AGENT-MEMORY:BEGIN -->
- Provision a missing barber queue using the authenticated user's RLS client with conflict-safe owner insertion; never claim another account's queue, so remixed and newly signed-in accounts can open their own panel safely.
<!-- AGENT-MEMORY:END -->
