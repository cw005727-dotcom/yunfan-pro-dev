# CBT images: category limits and counting across variations

**Tags:** CBT,images:,category,limits,and,counting,across,variations
**Created:** 2026-05-06T12:17:22Z
**Last Updated:** 2026-05-06T12:17:22Z

---

[FAQs CBT](https://global-selling.mercadolibre.com/devsite/frequently-asked-questions-cross-border-trade) › CBT images: category limits and counting across variations

## CBT images: category limits and counting across variations

Why do I get "Items in category … cannot exceed X pictures" even though I upload fewer images in pictures?

Images can also be counted from variations. If you set images in the main pictures array and also in variations, the effective total may exceed the category limit. Configure images only where needed and avoid duplicating them across root and variations.

Recommendation

Implement a "total effective images" counter before publishing: sum root pictures plus all variation picture entries, and enforce the strictest category maximum.

What should I do if a category image limit is reduced and my listing becomes incompatible?

Category limits can be strict and if your listing exceeds the new maximum, you must adjust the publication to comply (for example, reduce the main gallery). For products with many variants, you may need to split the product into multiple listings.

Recommendation

Periodically validate active listings against current category constraints and alert when they drift out of compliance, so you can proactively adjust before updates start failing.

When updating variations by sending only one variation, why do I get an image limit error even though I did not change pictures?

If an incomplete variations update implicitly removes other variations, the system recalculates constraints and you can end up exceeding limits under the new computed structure. Follow the documented variations update method to avoid implicit deletions.

Recommendation

Treat variation updates as full replacements: always read the current variations, modify in-memory, and PUT the complete variations array back.