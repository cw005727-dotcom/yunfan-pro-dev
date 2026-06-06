# Packs

**Tags:** packs,pack,orders,order,cart
**Created:** 2020-02-06T13:17:03Z
**Last Updated:** 2025-03-11T23:29:29Z

---

# Packs management

**Important:**

Currently, the functionality is available for sellers in Argentina, Brazil, Mexico, Chile, Colombia, Uruguay, Peru, and Ecuador.

## Entities relationship

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/182929664521-Captura-de-pantalla-2024-08-20-a-la-s--1.12.02-p.-m..png)

The diagram illustrates how the key components are interrelated within a pack:

- **Pack:** It becomes a mandatory component in all purchases, as all orders will be associated with a pack\_id.
  
  - **Relationship with Order:** There is a **1 to N** relationship between a pack and one or more orders. This means that a pack can contain multiple orders, which reflects situations where several orders are grouped into a single pack.
  - **Relationship with Shipping:** There is a **0 to 1** relationship, which suggests that a pack may or may not be linked to a shipping process. This case is common, especially in sales of not\_specified items, where a shipment\_id is not always required.
  - **Relationship with Payments:** There is a **1 to N** relationship between an order and one or more payments. This implies that an order may require multiple payments, such as in the case of installment payments or when an order is associated with various different transactions.
  - **Relationship with Discounts:** There is an **N to N** relationship between payments and discounts. This implies that a single payment can now be linked to multiple discounts.

This diagram provides a clear view of the flow of packs, orders, shipping, and payments, highlighting the flexibility and possible variations in each component.

Note:

- Gradually, throughout 2024, all orders will be linked to a pack\_id.
- According to the entity relationship, the following flow is recommended:
  
  - First, consult the /packs endpoint to get an initial overview of linked orders.
  - Then, use the /orders endpoint to access specific details about the orders in that cart.
  - If you need detailed payment information, use the endpoint https://api.mercadopago.com/v1/payments/{id}, which provides the necessary data and is documented on the [Mercado Pago](https://www.mercadopago.com.ar/developers/es/reference/payments/_payments_id/get) developer site.
- Remember that when adding extended warranty for not\_specified items, an exception will be generated. This item will be considered additional, creating a new pack\_id, although no shipment\_id will be assigned.

Learn more about:

- [How do I use the extended warranty?](https://www.mercadolibre.com.ar/ayuda/20515)
- [How do I extend a product's warranty?](https://www.mercadolibre.com.ar/ayuda/como-extender-la-proteccion-de-un-producto_4388)
- [How do I cancel the extended warranty?](https://www.mercadolibre.com.ar/ayuda/20516)

## Consult pack orders

Represents a purchase package, it can have one or several orders from the same or different sellers.

This endpoint allows you to consult information about the orders of a pack.

**Request:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/packs/$PACK_ID
```

**Example:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/packs/2000006181551917
```

**Response:**

```javascript
{
    "shipment": {
        "id": 43729529445
    },
    "orders": [
        {
            "id": 2000009047722568
        },
        {
            "id": 2000009047707726
        }
    ],
    "id": 2000006181551917,
    "status": "released",
    "status_detail": null,
    "buyer": {
        "id": 1944693439
    },
    "date_created": "2024-08-15T17:38:30.000-0400",
    "last_updated": "2024-08-15T17:42:52.000-0400"
}
```

**Response parameters:**

- **shipment.id:** Unique identifier of the shipment.
- **orders.id:** Unique identifiers of the orders associated with a pack.
- **id:** Unique identifier of the pack.
- **status:** Current status of the pack. It may take the following values:
  
  - **Released:** the orders and shipment are paid.
  - **Error:** Something failed in the process and could be recovered.
  - **Pending\_cancel:** an unrecoverable error occurred.
  - **Cancelled:** the orders and shipment are canceled.
- **status\_detail:** Provides additional details about the pack's status, such as the reasons for a cancellation or any other specific issue affecting the shipment (in this case, null indicates there are no additional details).
- **buyer.id:** Unique identifier of the buyer associated with the pack.
- **date\_created:** Date and time the pack was created.
- **last\_updated:** Date and time of the last update of the pack.

**Response status codes:**

Code Message Description Possible Solution 200 - OK - Successful query. - 403 - forbidden Can not identify the user Cannot identify the user. Validate access token. 403 - forbidden The user has not access to the order The caller is not authorized to access the resource. Validate access token. 404 - not\_found Order do not exists The pack does not exist. Validate the pack\_id.

Note:

- You will only be able to see or read the orders from sellers that are using your integration or system. This means that if a query returns only one order, it could be because the other orders are not associated with sellers using your system.

## Consult orders

An order represents the purchase of an item-variation in the marketplace. The order is always for a single item, but there can be multiple units of the same item.

This endpoint allows you to retrieve details about a specific order.

**Request:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/$ORDER_ID
```

**Example:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/2000008779458474
```

**Response:**

```javascript

    {
        "id": 2000009713473608,
        "date_created": "2024-11-01T09:34:59.000-04:00",
        "last_updated": "2024-11-01T09:37:20.000-04:00",
        "date_closed": "2024-11-01T09:35:43.000-04:00",
        "pack_id": 2000006556183755,
        "fulfilled": null,
        "buying_mode": "buy_equals_pay",
        "shipping_cost": 0.0,
        "mediations": [],
        "total_amount": 125.92,
        "paid_amount": 125.92,
        "order_items": [
            {
                "item": {
                    "id": "MLB3737188005",
                    "title": "Espa\u00e7ador E Nivelador Para Piso 1,5 Mm 500p\u00e7s Eco Cortag Cor Vermelho",
                    "category_id": "MLB188658",
                    "variation_id": null,
                    "seller_custom_field": null,
                    "variation_attributes": [],
                    "warranty": "Garantia de f\u00e1brica: 3 meses",
                    "condition": "new",
                    "seller_sku": "ESPA\u00c7ADOR NIVELADOR ECO C/500 P\u00c7S CORTAG-2",
                    "global_price": null,
                    "net_weight": null,
                    "user_product_id": "MLBU1458960576",
                    "release_date": null
                },
                "quantity": 2,
                "requested_quantity": {
                    "measure": "unit",
                    "value": 2
                },
                "picked_quantity": null,
                "unit_price": 62.96,
                "full_unit_price": 72.37,
                "currency_id": "BRL",
                "manufacturing_days": null,
                "sale_fee": 11.07,
                "listing_type_id": "gold_special",
                "base_exchange_rate": null,
                "base_currency_id": null,
                "element_id": 1,
                "stock": [
                    {
                      "store_id": "54936888", // Nuevos atributos de Stock Distribuido y Multi Origen
                      "network_node_id": "163942": "54936888", // Nuevos atributos de Stock Distribuido y Multi Origen
    
                    }
               ],
            }
        ],
    
        "currency_id": "BRL",
        "payments": [
            {
                "id": 91776699099,
                "order_id": 2000009713473608,
                "payer_id": 6427433,
                "collector": {
                    "id": 779432305
                },
                "card_id": null,
                "reason": "Espa\u00e7ador E Nivelador Para Piso 1,5 Mm 500p\u00e7s Eco Cortag Cor Vermelho",
                "site_id": "MLB",
                "payment_method_id": "account_money",
                "currency_id": "BRL",
                "installments": 1,
                "issuer_id": "2007",
                "atm_transfer_reference": {
                    "transaction_id": null,
                    "company_id": null
                },
                "activation_uri": null,
                "operation_type": "regular_payment",
                "payment_type": "account_money",
                "available_actions": [
                    "refund"
                ],
                "status": "approved",
                "status_code": null,
                "status_detail": "accredited",
                "transaction_amount": 125.92,
                "transaction_amount_refunded": 0.0,
                "taxes_amount": 0.0,
                "shipping_cost": 0.0,
                "overpaid_amount": 0.0,
                "total_paid_amount": 125.92,
                "installment_amount": null,
                "deferred_period": null,
                "date_approved": "2024-11-01T09:35:42.000-04:00",
                "transaction_order_id": null,
                "date_created": "2024-11-01T09:35:42.000-04:00",
                "date_last_modified": "2024-11-01T09:37:12.000-04:00",
                "marketplace_fee": 22.14,
                "reference_id": null,
                "authorization_code": null
            }
        ],
        "shipping": {
            "id": 44028792542
        },
        "status": "paid",
        "status_detail": null,
        "tags": [
            "pack_order",
            "order_has_discount",
            "catalog",
            "paid",
            "not_delivered"
        ],
        "feedback": {
            "seller": null,
            "buyer": null
        },
        "context": {
            "channel": "marketplace",
            "site": "MLB",
            "flows": [
                "catalog"
            ],
        },
        "seller": {
            "id": 779432305,
            "user_type": null,
            "tags": [],
            "status": null,
            "buy_restrictions": []
        },
        "buyer": {
            "id": 6427433,
            "user_type": null,
            "tags": [],
            "status": null,
            "buy_restrictions": []
        },
        "taxes": {
            "amount": null,
            "currency_id": null,
            "id": null
        },
        "cancel_detail": null,
        "manufacturing_ending_date": null,
        "order_request": {
            "change": null,
            "return": null
        }
    }    
    
```

**Response parameters:**

- **id:** Unique identifier of the order.
- **date\_created:** Date and time when the order was created.
- **last\_updated:** Date and time of the last update of the order.
- **date\_closed:** Date and time when the order was closed.
- **pack\_id:** Identifier of the pack to which the order belongs, if associated with a pack.
- **fulfilled:** Indicates if the order has been fulfilled or completed (boolean value).
- **buying\_mode:** Purchase mode used, in this case, "buy\_equals\_pay" (buy equals pay).
- **shipping\_cost:** Shipping cost associated with the order. It can be null if it is part of a pack\_id. Otherwise, it will show the shipping cost the buyer paid for their order.
- **mediations:** Array of mediations associated with the order (can be empty).
- **total\_amount:** Total amount of the order.
- **paid\_amount:** Amount paid for the order.
- **order\_items:** Array containing details of the products included in the order, such as title, quantity, unit price, etc.
  
  - **order\_items.stock.store\_id:** Identifies the store or specific physical location where an item’s stock is stored.
  - **order\_items.stock.network\_node\_id:** Represents the seller’s node or the specific physical location from where an item originates.
- **currency\_id:** Identifier of the currency used in the transaction.
- **payments:** Array of payments associated with the order, including details such as payment method, transaction amount, payment status, etc.
- **shipping:** Information about the shipment, including the shipping id.
- **status:** Current status of the order (e.g., "paid").
- **status\_detail:** Additional details about the order status (can be null).
- **tags:** Array of tags associated with the order.
  
  - **pack\_order:** The order belongs to a pack.
  - **not\_delivered:** The order was not delivered.
  - **not\_paid:** The order has not been paid.
  - **high\_concurrency:** Indicates that the order is for a high-demand item (e.g., during flash sales).
  - **catalog:** Order created for an item listed by catalog.
  - **unfulfilled:** Order that has not been fulfilled.
  - **test\_order:** Test order (both parties must be test users).
- **feedback:** Represents ratings from the counterparts in a sale.
  
  - **buyer:** Feedback ID of the buyer.
  - **seller:** Feedback ID of the seller.
- **context:** Contextual information about the order, including channel and country.
- **seller:** Information about the seller, including “id,” user type, and purchase restrictions.
- **buyer:** Information about the buyer, including “id,” nickname, first name, last name, user type, and purchase restrictions.
- **taxes:** Information on taxes applied to the order, including amount and currency (can be null).
- **cancel\_detail:** Details about the order cancellation (can be null).
- **manufacturing\_ending\_date:** Manufacturing end date, if applicable (can be null).
- **order\_request:** Information about exchange or return requests associated with the order (can be null).

**Response status codes:**

Code Message Description Possible Solution 200 - OK - Successful request. - 403 - forbidden Can not identify the user User cannot be identified. Validate access token. 403 - forbidden The user has no access to the order Caller is not authorized to access the resource. Validate access token. 404 - not\_found Order does not exist The order does not exist. Validate the order\_id.

**Considerations**

- Sometimes, it may happen that, even if there is an order, the shipment takes time to be created. In such cases, the shipping ID will be null until the shipment is created, and you will receive a notification once it is generated.
- The tags delivered/not delivered will no longer be added automatically. If you need these tags to be present, the integrator must perform a PUT with the corresponding tag.
- Orders in paid status will be canceled if the payment is refunded. When this happens, you will receive a notification to stay updated on the order's status change.
- Although the order will continue to display the seller\_custom\_field, the information shown in this field will follow certain criteria to select SKU information, such as:
  
  - seller\_sku of variation attributes
  - seller\_custom\_field of variation
  - seller\_sku of item attributes
  - seller\_custom\_field of item
- If the order is not associated with a pack and the transaction is in the “agree with the seller” mode, you will no longer receive a “to be agreed” status, but the shipping ID will come as null. This will indicate that you should contact the buyer to coordinate the shipping method.

Note:

- It is important to note that when using the /orders endpoint, information related to coupons or discounts should not be queried in the discount information in the payments node. It is recommended to use specific endpoints for discounts and promotions to obtain complete and accurate details about coupons and discounts applied to an order, such as:
  
  - /orders/$ORDER\_ID/discounts
  - https://api.mercadopago.com/v1/payments/{id}

## I have the product

This endpoint allows the seller to mark the stock availability or "I have the product", allowing them to dispatch the product when it's ready.

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/184101345291-WhatsApp-Image-2024-08-06-at-23.43.55.jpeg)

**Request:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/shipments/$SHIPMENT_ID/process/ready_to_ship
```

**Example:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/shipments/43664723386/process/ready_to_ship
```

**Response:**

```javascript
{                                                                                                              
    "status": 200                                                                                              
}
```

**Response Status Codes:**

Code Message Description Possible Solution 200 - OK - Successful query. - 403 - forbidden At least one policy returned UNAUTHORIZED The caller is not authorized to access the resource. Validate access token. 404 - not\_found Not found shipment with id. shipment\_id not found. Validate shipment\_id.

**Considerations:**

- Keep in mind that this functionality can only be used for ME2 orders.
- Consider that it is enabled in countries that have the functionality of manufacturing\_time and ME2.