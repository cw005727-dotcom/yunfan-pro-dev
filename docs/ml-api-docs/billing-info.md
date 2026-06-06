# Billing info

**Tags:** Billing,info
**Created:** 2026-05-05T13:35:06Z
**Last Updated:** 2026-05-05T13:35:06Z

---

[FAQs](https://developers.mercadolibre.com/en_us/faq-frequently-asked-questions) › Billing info

## Billing info

Is the /orders/{order\_id}/billing\_info endpoint still available to get buyer tax data?

The legacy endpoint has been deprecated; the recommended approach is now to use the new flow: get billing\_info.id from /orders and then query /orders/billing-info/{site\_id}/{billing\_info\_id}. During migration, parallel operation is being maintained for a limited time, so integrations must be adapted to use the new endpoint.

Recommendation

Migrate integrations to get billing\_info.id from the order and query the new endpoint /orders/billing-info/{site\_id}/{billing\_info\_id}.

Why do some billing\_info queries return missing fields like doc\_type or doc\_number?

On certain sites or for certain buyers, the API may not return address or identification fields due to local rules (for example, in Peru the returned billing\_info may not include zip\_code or complete fields). Additionally, when the tax document is being processed (PROCESSING), some fields may remain null until final authorization.

Recommendation

Design logic that tolerates null fields and check the tax document status before relying on data such as doc\_type or doc\_number.

Where can I reliably get the details of taxes applied to an order?

For a breakdown of taxes and discounts applied, consult the billing endpoints (by period) and the /orders/{order\_id}/discounts endpoint (depending on the region). In some flows the breakdown must be calculated by combining values from listing\_prices and shipments/costs; there is not always a single field that returns the total bonuses/discounts.

Recommendation

Use the billing endpoints by period and combine listing\_prices with shipments/costs to get a complete breakdown when no single field exists.

What is the current flow to get buyer tax data (billing info)?

Extract billing\_info.id from /orders (buyer.billing\_info.id) and then query /orders/billing-info/{site\_id}/{billing\_info\_id}. The legacy endpoint has been deprecated and must be migrated to the new resource.

Recommendation

Update integrations to get billing\_info via the new endpoint and avoid relying on the legacy resource.

Why do tax\_status or other fields sometimes appear null in billing responses?

When the tax document is still being processed (PROCESSING) or pending tax authorization, certain fields such as tax\_status or identification fields may remain null until the invoice is processed/authorized. On some sites (e.g. Peru), local rules mean that zip\_code or other fields are not returned.

Recommendation

Handle intermediate states in your logic and re-query when the tax document changes status.

After uploading an invoice, why does invoice\_pending appear and the invoice is not found via API?

There may be a delay in the processing and ingestion of the invoice and in external tax authorization; additionally, submissions with incorrect Content-Type or XML with an invalid signature are rejected, leaving the status as pending while the file is being processed or corrected.

Recommendation

Send the authorized XML with Content-Type=application/xml and verify the digital signature; wait for the ingestion time and review error logs if the status does not change.

The old /orders/{order\_id}/billing\_info endpoint returns 404; what is the alternative and how do I migrate?

The legacy resource has been deprecated. The alternative is to get billing\_info.id from the order (/orders =&gt; buyer.billing\_info.id) and then query /orders/billing-info/{site\_id}/{billing\_info\_id}. Migration involves adjusting queries to use billing\_info\_id instead of the previous direct endpoint.

Recommendation

Update the integration to read billing\_info.id from the order and use the new endpoint; verify the migration in test environments.