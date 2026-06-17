# Scripts

## Demo seeding (use this)

```bash
npx ts-node scripts/seed_complete_presentation.ts
```

Populates creator, brand, and admin accounts with full demo data. See [docs/SETUP.md](../docs/SETUP.md).

## Archive

One-off and superseded scripts are in [`archive/`](archive/). Do not use for normal setup:

- `seed_presentation.ts` — older partial seed
- `seed_demo_accounts.js` — one-off audit fix
- `update_contract.ts`, `update_contracts_v2.ts` — manual contract updates
- `check_schema.ts`, `test_campaign.ts` — debug snippets
