# Best Practices for Consuming Billing Reports APIs

**Tags:** Best,Practices,for,Consuming,Billing,Reports,APIs
**Created:** 2026-02-04T13:59:12Z
**Last Updated:** 2026-02-04T14:00:09Z

---

## Best Practices for Consuming Billing Reports APIs

This is the summary of available resources for integrating billing reports from Mercado Libre and Mercado Pago.

## General Information

**Functionality:** Allows you to access billing reports, associated documents (invoices and credit notes), and the summary of charges and bonuses for sellers.

**Required Global Parameter:** All endpoints require the `group` parameter to specify the billing group: **ML** (Mercado Libre) or **MP** (Mercado Pago). If not specified, information from both groups will be returned.

## Resource Purpose

**Billing Reports** resources are **strictly intended for Post-Sale operations** and have the sole purpose of **fiscal reconciliation and billing report generation**.

These endpoints **should not be used as a primary data source** for sales management, real-time order tracking, or any other operational purpose. For these needs, use the appropriate resources listed in the "Alternative Resources" section.

## Endpoint List

### [1. Get Billing Periods](https://developers.mercadolibre.com/en_us/billing-reports#get-period)

```javascript
GET /billing/integration/monthly/periods
```

Retrieves billing period information. By default, returns the last 6, with a maximum of 12 through pagination.

- **Required parameter:** `document_type` (Values: `Bill` or `Credit_note`)
- **Optional parameters:** `offset`, `limit`

### [2. Get Documents for a Period](https://developers.mercadolibre.com/en_us/billing-reports#get-documents)

```javascript
GET /billing/integration/periods/key/{key}/documents
```

Allows you to get the list of invoices and credit notes for a specific period, identified by its `{key}` (first day of the month, e.g.: `2024-01-01`).

- **Optional parameters:** `document_id`, `document_type` (BILL, CREDIT\_NOTE), `offset`, `limit`

### [3. Billing Summary](https://developers.mercadolibre.com/en_us/billing-reports#billing-summary)

```javascript
GET /billing/integration/periods/key/{key}/summary/details
```

Provides the summary of charges, bonuses, and taxes applied to the seller for a specific period.

**Usage Restriction:** It is not recommended to use this endpoint in massive batch processing. Its use should be sequential, and a daily query per user is recommended, since the information is static during the day.

### 4. Get Billing Details

#### [Mercado Libre](https://developers.mercadolibre.com/en_us/reconciliations#mercado-libre)

```javascript
GET /billing/integration/periods/key/{KEY}/group/ML/details
```

Retrieves the complete detail of sales charges, bonuses, and shipping information associated with Mercado Libre sales for a specific period.

- **Required parameter:** `document_type` (Values: `BILL` or `CREDIT_NOTE`)
- **Optional parameters:** `limit`, `from_id`, `sort_by`, `order_by`, `date_sort`, `detail_type`, `detail_sub_types`, `marketplace_type`, `order_ids`, `item_ids`, `document_ids`, `detail_ids`

#### [Mercado Pago](https://developers.mercadolibre.com/en_us/reconciliations#mercado-pago)

```javascript
GET /billing/integration/periods/key/{KEY}/group/MP/details
```

Retrieves the detail of charges and movements from the Mercado Pago account, including payment method information, branches, and external references.

- **Required parameter:** `document_type` (Values: `BILL` or `CREDIT_NOTE`)
- **Optional parameters:** `limit`, `from_id`, `sort_by`, `order_by`, `detail_type`

## General Reconciliation

To perform an effective reconciliation, the proposed steps are as follows:

1. **Query billing periods** to view available periods and the status of each one.
2. **Query the billing summary**, based on the billing period obtained in step 1.
3. **Query the period details report**, based on the billing period obtained in step 1.

**Reconciliation objective:** The charges shown in the invoice and billing summary must match the sum of charges of the same type shown in the billing detail, for the same billing period.

#### Example - Billing summary:

```javascript
"charges": [
  {
    "label": "Advertising campaigns - Product Ads",
    "amount": 48600,
    "type": "PADS",
    "groupId": 24
  },
  {
    "label": "Mercado Envios charge",
    "amount": 11195255.36,
    "type": "CXD",
    "groupId": 24
  },
  {
    "label": "Sales charge",
    "amount": 131285530.48,
    "type": "CV",
    "groupId": 28
  }
]
```

#### Example - Billing detail:

```javascript
"results": [
  {
    "charge_info": {
      "legal_document_number": "0011A11111111",
      "legal_document_status": "PROCESSED",
      "legal_document_status_description": "Processed",
      "creation_date_time": "2023-11-19T00:00:30",
      "detail_id": 12345678,
      "transaction_detail": "Sales charge",
      "debited_from_operation": "YES",
      "debited_from_operation_description": "Yes",
      "status": null,
      "status_description": null,
      "charge_bonified_id": null,
      "detail_amount": 615.95,
      "detail_type": "CHARGE",
      "detail_sub_type": "CV"
    }
  }
]
```

**Reconciliation Rule:** In the billing detail endpoint, the sum of `detail_amount` for the same `detail_sub_type` must equal the `amount` for the same `type` in the Billing Summary endpoint. For reconciliation tasks, it is suggested to use the `detail_sub_types` filter.

## Endpoint Query Frequency

The recommended query frequency depends on the **Billing Period status**:

Period Status Behavior Recommended Frequency **Open** The summary and billing detail vary daily as charges are generated. At different times of the day. For example: once at the beginning of the day and once at the end. **Closed** The summary and billing detail do not change. There may be exceptions: refunds due to sales cancellations and PDF generation (each site has a number of business days to make the PDF available after closing). Once a day. After having all fiscal documents in detail, you can make only periodic queries to validate if any bonus has affected the period total.

- **Billing periods:** Can change status (e.g., from open to closed). Recommended frequency: **once per day**.
- **Documents:** Are created once the period closes. Each site has business days of tolerance to make the PDF available. Recommended frequency: **once per day**, with the improvement of making these queries at the beginning of the period and disregarding at the final part.

## How to Paginate Correctly (Key to Avoiding Duplicates)

To handle large volumes of data and ensure that records are not repeated between calls, you should use **ID-based pagination (`from_id`)** instead of just offsets (`offset`).

#### Essential Parameters

Parameter Description Values `limit` Number of records per page Minimum: 1, Maximum: 1000, Default: 150 `from_id` The ID from which to search Default: 0 `sort_by` Sorting property `ID` or `DATE`. **ID is recommended** for pagination. `order_by` Sort direction `ASC` or `DESC`

#### Recommended Strategy

1. **First page:** Send `limit=1000` and `from_id=0`.
2. **Following pages:** Get the `last_id` field value from the previous JSON response and send it in the `from_id` parameter of the new request.
3. **Repeat:** Continue until the response returns no more results.

```javascript
// First page
GET .../details?limit=1000&from_id=0&sort_by=ID&order_by=ASC

// Second page (use the last_id from the previous response)
GET .../details?limit=1000&from_id={last_id}&sort_by=ID&order_by=ASC

// Continue until there are no more results...
```

**Avoid using `offset`** if you have more than 10,000 records, since this parameter has a maximum limit of 10,000. The `from_id` method is the only one that guarantees complete integrity in extensive listings.

## Recommended Consumption Strategy

### 1. Avoid Massive Batch Processing

Do not make massive parallel requests (batch) to obtain billing information. Billing endpoints **were not designed for high-frequency consumption**. Store the results and paginate using `from_id`.

INCORRECT

Multiple batch calls:

```javascript
for seller in all_sellers:
    for order in seller.orders:
        GET /billing/integration/group/ML/order/details?order_ids={order}
```

CORRECT

One call per seller, once a day:

```javascript
GET /billing/integration/periods/key/{key}/group/ML/details?limit=1000&from_id=0
```

### 2. Implement Local Cache

Since data is updated according to the period status, it is **highly recommended** to implement a caching strategy:

- Store queried data in your database
- Define an update policy based on period status (open/closed)
- Before making a new request, check if you already have the updated data

### 3. Don't Use /monthly/periods in Batch

The `/billing/integration/monthly/periods` endpoint returns information that **rarely changes**. The period key is always the **first day of the month** (e.g.: `2024-01-01`). You don't need to query `/monthly/periods` repeatedly. Build the key directly using the first day of the desired month: `YYYY-MM-01`.

## Alternative Resources for Operational Needs

Need Recommended Resource Real-time order data [GET /orders](https://developers.mercadolibre.com/en_us/manage-sales) Identify orders in packs [GET /packs](https://developers.mercadolibre.com/en_us/pack-management) Shipping cost [GET /shipments](https://developers.mercadolibre.com/en_us/manage-shipments) Applied discounts [GET /orders/{id}/discounts](https://developers.mercadolibre.com/en_us/manage-sales#Get-applied-discounts) Item sale price [GET /items/{item\_id}/sale\_price](https://developers.mercadolibre.com/en_us/prices-api#Get-item-prices)

## Where to Get Each Information

Required Information Endpoint Note [Billing periods](https://developers.mercadolibre.com/en_us/billing-reports#get-period) `/billing/integration/monthly/periods` Query **once** to get history. Keys follow the pattern `YYYY-MM-01` [Documents (invoices/credit notes)](https://developers.mercadolibre.com/en_us/billing-reports#get-documents) `/billing/integration/periods/key/{key}/documents` Filter by `group` (ML/MP) and `document_type` [Billing summary](https://developers.mercadolibre.com/en_us/billing-reports#billing-summary) `/billing/integration/periods/key/{key}/summary/details` **Do not use in batch**. Sequential consumption, once a day [ML reconciliation details](https://developers.mercadolibre.com/en_us/reconciliations#mercado-libre) `/billing/integration/periods/key/{key}/group/ML/details` Use pagination with `limit` and `from_id`. Requires `document_type` [MP reconciliation details](https://developers.mercadolibre.com/en_us/reconciliations#mercado-pago) `/billing/integration/periods/key/{key}/group/MP/details` Use pagination with `limit` and `from_id`. Requires `document_type` [Details by Order/Pack](https://developers.mercadolibre.com/en_us/reconciliations#billing-report-by-orders-and-packs) `/billing/integration/group/ML/order/details` **Only query orders you haven't processed yet** [Payment reports](https://developers.mercadolibre.com/en_us/payments) `/billing/integration/periods/key/{key}/group/ML/payment/details` Details of paid invoices [Legal document download](https://developers.mercadolibre.com/en_us/download-legal-document) `/billing/integration/legal_document/{file_id}` Get the `file_id` from `/documents` [Report download (CSV/XLSX)](https://developers.mercadolibre.com/en_us/download-legal-document#reconciliation-report-download) `/billing/integration/reports/{file_id}` Requires prior creation via POST [Perceptions (Argentina)](https://developers.mercadolibre.com/en_us/perceptions) `/billing/integration/periods/key/{key}/perceptions/summary` Exclusive for MLA

## Endpoints with High 429 Error Incidence

The following endpoints are the most affected by improper use:

Endpoint Common Cause of the Problem `/billing/integration/group/ML/order/details` Repetitive queries by order\_id or pack\_id already processed `/billing/integration/monthly/periods` Unnecessary batch calls or excessive polling

## Error Handling

Code Type Recommended Action 206 Partial Content Some data is incomplete. Wait and try again later (next update cycle). 429 Too Many Requests **Preventive IP blocking.** Review your implementation: reduce call frequency, implement cache, and avoid massive batch processing.

## Best Practices Summary

- Use these resources **only for fiscal reconciliation** - not as an operational data source
- Always specify the `group` parameter (ML or MP) to optimize queries
- Adjust query frequency according to **period status** (open or closed)
- **Cache** all queried information
- Use **`from_id`-based pagination** - avoid `offset` for more than 10,000 records
- Build the period key directly (`YYYY-MM-01`) instead of repeatedly querying `/monthly/periods`
- **Avoid massive batch** and high-frequency parallel calls
- **Don't query the same order/pack** more than once
- For reconciliation, use the `detail_sub_types` filter and validate that the sum of `detail_amount` matches the `amount` from the summary