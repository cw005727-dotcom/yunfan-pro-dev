# Billing Reports by Orders and Packs

**Tags:** Billing,Reports,by,Orders,and,Packs
**Created:** 2026-02-23T19:58:12Z
**Last Updated:** 2026-05-15T14:54:31Z

---

## Billing Reports by Orders and Packs

This endpoint allows you to obtain billing reports filtered by orders and packs.

### Endpoint:

```javascript

curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' 
https://api.mercadolibre.com/billing/integration/group/ML/order/details?order_ids=$ORDER_ID&seller_id=$SELLER_ID
```

### Query Parameters:

- seller\_id: Marketplace users ID.
- order\_ids: Allows searching by one or multiple order IDs.
- pack\_id: Allows searching by a pack ID.
- sort\_by:
  
  - Possible values: ID and DATE;
  - Default value: ID
- order\_by: Allows sorting the search.
  
  - Possible values: ASC, DESC;
  - Default value: ASC

**Reminder:**

- There are 2 types of users in Global Selling: Global user - is the that has the login to Global Selling and also the grants (get access token) to operate on marketplaces users. Per account, you can have a global user and one or more marketplaces users. Marketplace user - each marketplace user corresponds to each local operation and logistic type set: Mexico Remote, Mexico Fulfillment, Brazil Remote, Chile Fulfillment, Chile Remote and Colombia Remote. The operations for each marketplace user can be managed using the global user's access token. As integrator you can operate over all these accounts with just one access token. The operations for each marketplace user can be managed using the global user's access token.

### Example:

```javascript

curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' 
https://api.mercadolibre.com/billing/integration/group/ML/order/details?order_ids=1234567899876&seller_id=12345678
```

### Response:

```javascript

{
    "offset": 0,
    "limit": 150,
    "total": 1,
    "last_id": 0,
    "results": [
        {
            "order_id": 1234567899876,
            "payment_info": [
                {
                    "payment_id": 99999999999,
                    "date_approved": "2026-01-14T18:41:47",
                    "date_created": "2026-01-14T18:41:47",
                    "money_release_date": "2026-01-17T17:08:19",
                    "money_release_days": 28,
                    "money_release_status": "released",
                    "payer_id": 12345678,
                    "payment_method_id": "account_money",
                    "payment_type_id": "account_money",
                    "status": "approved",
                    "status_details": null,
                    "base_amount": 450.49,
                    "base_amount_usd": 25.19,
                    "tax_details": [
                        {
                            "from": "collector",
                            "to": "9999999991",
                            "original_amount": 72.08,
                            "original_amount_usd": 4.03,
                            "refunded_amount": 0,
                            "refunded_amount_usd": 0,
                            "mov_detail": "tax_withholding",
                            "mov_financial_entity": "iva",
                            "tax_id": null,
                            "tax_status": "applied"
                        },
                        {
                            "from": "collector",
                            "to": "9999999992",
                            "original_amount": 90.1,
                            "original_amount_usd": 5.04,
                            "refunded_amount": 0,
                            "refunded_amount_usd": 0,
                            "mov_detail": "tax_withholding",
                            "mov_financial_entity": "isr",
                            "tax_id": null,
                            "tax_status": "applied"
                        }
                    ]
                }
            ],
            "sale_fee": null,
            "details": [
                {
                    "charge_info": {
                        "legal_document_number": "0011A03800000",
                        "legal_document_status": "PROCESSED",
                        "legal_document_status_description": "Processed",
                        "creation_date_time": "2026-01-14T12:42:28",
                        "detail_id": 5555566666,
                        "transaction_detail": "Service fee",
                        "debited_from_operation": "YES",
                        "debited_from_operation_description": "Yes",
                        "status": null,
                        "status_description": null,
                        "charge_bonified_id": null,
                        "detail_amount": 0.53,
                        "detail_type": "CHARGE",
                        "detail_sub_type": "CVMPI"
                    },
                    "discount_info": {
                        "charge_amount_without_discount": 0.53,
                        "discount_amount": 0.0,
                        "discount_reason": null,
                        "rebate": null
                    },
                    "sales_info": [
                        {
                            "order_id": 1234567899876,
                            "operation_id": 99999999999,
                            "sale_date_time": "2026-01-14T14:41:46",
                            "sales_channel": "Mercado Libre",
                            "payer_nickname": "NICKNAME",
                            "state_name": "Nuevo León",
                            "transaction_amount": 522.57,
                            "transaction_amount_usd": 29.21
                        }
                    ],
                    "shipping_info": {
                        "shipping_id": "5555566666",
                        "pack_id": "2000011040970000",
                        "receiver_shipping_cost": 0
                    },
                    "items_info": [
                        {
                            "item_id": "MLM920316309",
                            "item_kit_id": null,
                            "item_title": "Tenis De Seguridad Industrial Zapatos Impermeables Hombre",
                            "item_type": "gold_special",
                            "item_category": "Industrias y Oficinas > Seguridad Laboral > Protección Personal > Calzado Industrial",
                            "inventory_id": null,
                            "item_amount": 1,
                            "item_price": 522.57,
                            "item_price_usd": 29.21,
                            "order_id": 1234567899876
                        }
                    ],
                    "document_info": {
                        "document_id": 5555566666
                    },
                    "marketplace_info": {
                        "marketplace": "CORE"
                    },
                    "currency_info": {
                        "currency_id": "USD"
                    }
                }
            ]
        }
    ]
}
```

### Response Parameters

- offset: Starting position of the results.
- limit: Maximum number of results per page.
- total: Total number of results found.
- last\_id: Identifier of the last returned result (used for pagination).
- order\_id: Sale identifier.
- payment\_info: Payment information.
  
  - payment\_id: Payment identifier.
  - date\_approved: Approval date.
  - date\_created: Creation date.
  - money\_release\_date: Payment release date.
  - money\_release\_days: Days until payment release.
  - money\_release\_status: Payment release status.
  - payer\_id: Customer identifier.
  - payment\_method\_id: Payment method.
  - payment\_type\_id: Payment method type.
  - status: Payment status.
  - status\_details: Payment status details.
  - base\_amount: Taxable base amount in local currency. Available for both CBT and non-CBT users.
  - base\_amount\_usd: Taxable base amount in USD. **Only returned for CBT (Cross-Border Trade) users.**
  - tax\_details: Tax details.
    
    - from: Origin of the tax movement.
    - to: Destination identifier of the tax movement.
    - original\_amount: Tax withholding amount in local currency.
    - original\_amount\_usd: Tax withholding amount in USD. **Only returned for CBT (Cross-Border Trade) users.**
    - refunded\_amount: Tax refund amount in local currency.
    - refunded\_amount\_usd: Tax refund amount in USD. **Only returned for CBT (Cross-Border Trade) users.**
    - mov\_detail: Tax movement type.
    - mov\_financial\_entity: Financial entity associated with the tax.
    - tax\_id: Tax identifier (may be null).
    - tax\_status: Tax application status.
- sale\_fee: Sale fee information (Exclusive to Brazil). May be null if not applicable.
  
  - gross: Charge amount without discount.
  - net: Charge amount.
  - rebate: Discount amount for participation in a commercial campaign.
  - discount: Discount amount.
  - discount\_reason: Discount reason.
- details: Charge details.
  
  - charge\_info: Charge information.
    
    - legal\_document\_number: Legal document number.
    - legal\_document\_status: Legal document processing status.
    - legal\_document\_status\_description: Human-readable description of the document status.
    - creation\_date\_time: Charge creation date and time.
    - detail\_id: Charge detail identifier.
    - transaction\_detail: Description of the charge type.
    - debited\_from\_operation: Whether the charge was debited from the operation.
    - debited\_from\_operation\_description: Human-readable description.
    - status: Charge status.
    - status\_description: Charge status description.
    - charge\_bonified\_id: Bonified charge identifier (if applicable).
    - detail\_amount: Charge amount in the currency specified by currency\_info.
    - detail\_type: Charge type.
    - detail\_sub\_type: Charge subtype.
  - discount\_info: Discount information.
    
    - charge\_amount\_without\_discount: Charge amount before discounts, in the currency specified by currency\_info.
    - discount\_amount: Discount amount, in the currency specified by currency\_info.
    - discount\_reason: Discount reason.
    - rebate: Rebate amount (if applicable).
  - sales\_info: Sale information.
    
    - order\_id: Sale identifier.
    - operation\_id: Operation identifier.
    - sale\_date\_time: Sale date and time.
    - sales\_channel: Sales channel.
    - payer\_nickname: Buyer nickname.
    - state\_name: Buyer's state/province.
    - transaction\_amount: Transaction amount in local currency.
    - transaction\_amount\_usd: Transaction amount in USD. **Only returned for CBT (Cross-Border Trade) users.**
  - shipping\_info: Shipping information.
    
    - shipping\_id: Shipment identifier.
    - pack\_id: Pack identifier (if applicable).
    - receiver\_shipping\_cost: Shipping cost charged to the buyer.
  - items\_info: Listing information.
    
    - item\_id: Item identifier.
    - item\_kit\_id: Kit identifier (if the item belongs to a kit).
    - item\_title: Item title.
    - item\_type: Item listing type.
    - item\_category: Item category path.
    - inventory\_id: Inventory identifier.
    - item\_amount: Quantity of items sold.
    - item\_price: Item price in local currency.
    - item\_price\_usd: Item price in USD. **Only returned for CBT (Cross-Border Trade) users.**
    - order\_id: Sale identifier.
  - document\_info: Document information.
    
    - document\_id: Document identifier.
  - marketplace\_info: Marketplace information.
    
    - marketplace: Marketplace where the charge originated.
  - currency\_info: Currency information.
    
    - currency\_id: Currency used for charge\_info and discount\_info amounts.

### Errors:

If seller\_id is present, the API validates that caller is the parent merchant of the specified seller. If the hierarchical relationship is invalid, returns 403 FORBIDDEN\_ERROR.

```javascript

{
    "timestamp": "2026-05-13T16:59:53.63749247Z",
    "status": 403,
    "type": "FORBIDDEN_ERROR",
    "message": "Access denied: seller 1263524162 does not belong to merchant 1263491745 hierarchy",
    "path": "/group/ML/order/details"
}
```