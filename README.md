# Replatformer Migration Incentive · E2E Prototype

Interactive quicksite showing the full Squarespace-to-Shopify replatformer funnel, starting from the acquisition moment (email, Facebook ad, Google search) all the way through admin onboarding.

**Deployed URL**: [replatformer-migration-incentive-quincyadamo.quick.shopify.io](https://replatformer-migration-incentive-quincyadamo.quick.shopify.io) *(once deployed)*

## Purpose

Most existing prototypes ([Nick v8](https://replatformer-v8.quick.shopify.io), [Jonathan's tech flow](https://replatformer.quick.shopify.io)) start at the Shopify signup page. This one fills the gap Zindzi flagged at Growth SLT OH: **what does the acquisition funnel actually look like?** Demonstrates three realistic entry points and hands the merchant off through a single unified funnel.

## Flow

```
Entry selector  (index.html)
  ├─ Outbound email        (email.html)   Gmail-styled personalized email
  ├─ Facebook / Meta ad    (social.html)  Sponsored post in FB feed
  └─ Google search ad      (sem.html)     SERP with Shopify sponsored result

  ↓  all three land on:

Landing          (landing.html)   Squarespace-specific brochure page + URL input
Cloning          (cloning.html)   Animated scraping steps + SQ questions
Preview          (preview.html)   Before/after compare (Squarespace vs Horizon)
Auth             (auth.html)      Signup gate (offer locked in on the right)
Admin            (admin.html)     Bento + migration checklist + Sidekick
```

Example merchant throughout: **Firehouse Foods** (real exemplar from Jonathan's LLM pipeline, [firehousefoodz.com](https://www.firehousefoodz.com/)). Small Boise salsa-macha brand, 4 SKUs, farmers-market-to-online story. Representative of the simple-catalog segment this project targets first.

## Messaging

Squarespace-specific positioning on every surface. Core offer:

- **$10/mo Basic your first year** (vs $27/mo Squarespace Commerce)
- **1-click migration** (products, images, brand, SEO redirects)
- **3-month $1 paid trial** layered on top
- **1% GMV Rewards** on Shopify Payments sales, capped at $15K

## Local development

Preview locally with hot reload:

```bash
cd quicksites/replatformer-migration-incentive-quincyadamo
quick serve
```

Opens at `http://localhost:3000`. Edit any `.html` file, refresh to see changes.

## Deploy

```bash
cd quicksites/replatformer-migration-incentive-quincyadamo
quick deploy . replatformer-migration-incentive-quincyadamo
```

First deploy creates the site, subsequent deploys prompt for overwrite confirmation. Ships to `https://replatformer-migration-incentive-quincyadamo.quick.shopify.io`.

## File layout

```
.
├── index.html        Entry selector
├── email.html        Gmail inbox + opened email
├── social.html       Facebook feed with sponsored post
├── sem.html          Google SERP with Shopify ad
├── landing.html      Shopify brochure page (URL input)
├── cloning.html      Animated scraping + SQ
├── preview.html      Before/after store comparison
├── auth.html         Signup form + offer summary
├── admin.html        Shopify admin with Sidekick + bento + checklist
├── assets/
│   ├── styles.css    All styling (single file, no framework)
│   └── script.js     Flow chrome + cloning animation + SQ interactions
└── README.md
```

## Design decisions

- **Static HTML / CSS / JS, no framework.** First quicksite, keeping it vibe-codeable and zero-dependency. Each page stands alone.
- **Multi-page, not SPA.** Lets you deep-link any step in demos ("look at the `preview.html` compare screen").
- **Persistent prototype chrome.** Dark top bar on every Shopify-owned page shows where in the flow the viewer is. Click "Restart" to jump back to entry selector.
- **Entry surfaces have no prototype chrome.** So Gmail, Facebook, and Google look real, not mocked.
- **Real merchant exemplar** (Firehouse Foods) throughout. Every number, SKU, and integration reference stays consistent end-to-end so the demo feels coherent.

## What to iterate on next

- [ ] Hook a second merchant persona (e.g. [Chicana Foods](https://www.chicanafoods.com/)) and let the entry selector toggle between them
- [ ] Add a fourth entry surface: Instagram (given Zindzi's casual-seller angle)
- [ ] Wire the cloning page's SQ answers into the admin checklist (currently decorative)
- [ ] Screenshot-based before/after instead of CSS mockups (would make the wow moment more real)
- [ ] Add a "back to entry selector" link on the auth/admin pages so demos can loop cleanly
- [ ] Variant selector on preview page (currently links to "try another variant" are dead)
- [ ] Actual ad analytics counterfactual ("x merchants who saw this ad claimed their store")

## Related work

| Artifact | Link |
|----------|------|
| Project brief | [replatformer_migration_incentive_brief.md](../../incentives/replatformer_migration_incentive/replatformer_migration_incentive_brief.md) |
| Catherine's pitch page | [replatformer-migration-incentive.quick.shopify.io](https://replatformer-migration-incentive.quick.shopify.io/) |
| Nick's brochure flow v8 | [replatformer-v8.quick.shopify.io](https://replatformer-v8.quick.shopify.io) |
| Nick's admin-playground rebuild | [nn-replatformer.quick.shopify.io/replatform](https://nn-replatformer.quick.shopify.io/replatform) |
| Jonathan's technical slides | [replatformer.quick.shopify.io](https://replatformer.quick.shopify.io/) |
| Jonathan's LLM pipeline | [shopify-playground/replatformer](https://github.com/shopify-playground/replatformer) |
| Project Slack | [#proj-replatformer-migration-incentive](https://shopify.enterprise.slack.com/archives/C0AL8KK84B0) |
