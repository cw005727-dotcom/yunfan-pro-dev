# Global Selling item create/update (/global/items)

**Tags:** Global,Selling,item,create/update,(/global/items)
**Created:** 2026-05-06T12:12:37Z
**Last Updated:** 2026-05-06T12:12:37Z

---

[FAQs CBT](https://global-selling.mercadolibre.com/devsite/frequently-asked-questions-cross-border-trade) › Global Selling item create/update (/global/items)

## Global Selling item create/update (/global/items)

When publishing with POST /global/items, why do I get an error if pictures and variations are at the root of the JSON?

The correct request structure requires pictures and variations to be placed inside each object in sites\_to\_sell. If those fields are sent at the root level, the request does not match the expected schema and the publication fails. Move those fields into the corresponding site object under sites\_to\_sell.

Recommendation

Model your payload with a per-site structure and validate it before sending: each sites\_to\_sell entry should be independently "publishable" with its own pictures/variations where applicable.

Why do my items created via API become active at the CBT level but do not replicate to local marketplaces?

For CBT accounts, replication to local marketplaces requires using the Global Selling flow and endpoints (such as /global/items) and following the activation process for the target marketplaces. Publishing with the local flow (/items) does not match the Global Selling model and can prevent the expected replication.

Recommendation

Ensure your integration detects CBT vs local sellers and routes publication calls to the correct endpoint. Avoid mixing /items and /global/items for the same catalog strategy.

Can I update title and description of a Global Selling item via API? Which endpoint should I use?

Yes. Global Selling supports updating multiple fields in a single PUT request to the item resource, as long as those fields are editable in that context. You do not need to split updates into multiple requests per field.

Recommendation

Batch compatible edits together to reduce write volume and rate-limit exposure. If a field is restricted, isolate it into a separate request so other allowed fields can still be updated.

I created an item without variations, sent available\_quantity, but it ends up as 0. Why?

If you use SIZE\_GRID\_ID, available quantity must be provided inside variations (along with SIZE\_GRID\_ROW\_ID) rather than at the root item level. In that setup, root-level available\_quantity does not apply and may be ignored, resulting in 0.

Recommendation

When size grids are involved, always treat the listing as variation-driven inventory even if you conceptually think of it as "single SKU." Validate that quantity is present at the variation level.

What does "Shipping configuration is not valid for item" mean when creating a Global User Product or an item with logistic\_type=fulfillment?

For logistic\_type=fulfillment listings, Mercado Libre manages shipping configuration automatically. If your request includes explicit shipping configuration, it can invalidate the publication. The fix is to omit shipping configuration fields from the payload for fulfillment items.

Recommendation

Maintain separate payload templates per logistic\_type. For fulfillment, keep shipping minimal and let the platform compute shipping rules.

Why do I get "Attribute SELLER\_SKU has too many values (2). Maximum values allowed is 1" when publishing?

This happens when duplicate values are sent for SELLER\_SKU. Each variation must have exactly one value for that attribute. Remove duplicates and ensure a single SELLER\_SKU value per variation.

Recommendation

Add a pre-submit validator that enforces uniqueness and cardinality rules for critical attributes like SELLER\_SKU, GTIN, and variation-defining attributes.

How can I publish only to specific countries when using /global/items?

There are no country-specific CBT endpoints. You publish through /global/items and control the publishing scope using sites\_to\_sell, including only the site\_id values where you want the listing to be available.

Recommendation

Treat sites\_to\_sell as your source of truth for rollout control. Build tooling to generate it from a configuration list rather than hardcoding it in code.