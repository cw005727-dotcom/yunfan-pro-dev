# Promotions / Pricing

**Tags:** Promotions,/,Pricing
**Created:** 2026-05-05T13:36:04Z
**Last Updated:** 2026-05-05T13:36:34Z

---

[FAQs](https://developers.mercadolibre.com/en_us/faq-frequently-asked-questions) › Promotions / Pricing

## Promotions / Pricing

Why can percentages or values returned by the campaigns API or price\_to\_win differ from what the site front-end displays?

The front-end may apply real-time decorations or presentation recalculations, while the API returns values as they are in the engine at the time of the query; this can cause discrepancies between the two.

Recommendation

Use API data for programmatic decisions and consider that the front-end may adjust values for display purposes; validate with real examples if you need exact correspondence.

If an offer appears as "candidate" in the API but is active on the front-end, what could be happening?

Some campaigns and processes are asynchronous; an offer may remain as candidate in the API until activation is complete, while the front-end may display the published state due to display rules or recent processing.

Recommendation

Check start\_date/end\_date and campaign status; consider that certain types of campaigns require final processing to appear as started in the API.

price\_to\_win indicates we "won" but the front-end shows another featured seller; what causes the difference?

The price\_to\_win engine evaluates conditions at the moment of the query, while the front-end may apply recalculations based on geolocation, Full/SameDay availability, or time windows that change the featured seller; so the status may differ between API and front-end.

Recommendation

Review zone configuration and logistics parameters; consider that front-end display may incorporate additional real-time rules.