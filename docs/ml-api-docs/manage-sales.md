# Sales

**Tags:** Manage,sales
**Created:** 2018-06-27T12:01:32Z
**Last Updated:** 2026-02-18T17:40:47Z

---

## Sales

An order is a request a customer places on a listed item with the intention to purchase it under a series of conditions choosed throughout the checkout flow. These conditions are detailed on the order that will be replicated for the buyer and the seller accounts as well. On the order you'll find a lot of information to fill out about your product and you'll be able to reserve and/or subtract stock. Learn more about **the flow to manage simple and cart orders, payments and shipments**.

## Receive an order

Once a new order is created on your user, you can check its details by making a request to the order resource. We recommend you subscribe to [orders\_feedback](https://developers.mercadolibre.com.ar/en_us/products-receive-notifications#Available-topics) the new topic to receive updates on feedbacks.  
Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/$ORDER_ID
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/2000003508419013 
```

Response:

```javascript
{
    "id": 2000003508419013,
    "status": "paid",
    "status_detail": null,
    "date_created": "2013-05-27T10:01:50.000-04:00",
    "date_closed": "2013-05-27T10:04:07.000-04:00",
    "order_items": [{
     "item": {
       "id": "MLB12345678",
       "title": "Samsung Galaxy",
       "variation_id": null,
       "variation_attributes": []
     },
     "quantity": 1,
     "unit_price": 499,
     "currency_id": "BRL"
    }],
    "total_amount": 499,
    "currency_id": "BRL",
    "buyer": {
     "id": "123456789",    
    },
    "seller": {
     "id": "123456789",
    },
    "payments": [{
     "id": "596707837",
     "transaction_amount": 499,
     "currency_id": "BRL",
     "status": "approved",
     "date_created": null,
     "date_last_modified": null
    }],
    "feedback": {
     "purchase": null,
     "sale": null
    },
    "context": {
     "channel": "marketplace",
     "site": "MLB",
     "flows": [
     000]
  },
    "shipping": {
     "id": 20676482441
    },
    "tags": [
     "paid",
     "not_delivered"
    ]
}
```

Notas:

\- To get the feedback details, make request to the [/feedbacks/$feedback\_id](https://developers.mercadolibre.com.ar/en_us/feedback-on-sale?nocache=true#Consult-feedback) resource with the ID from the order.s - You can also consume the information from the feedbacks using the resource [/orders/$order\_id/feedback](https://developers.mercadolibre.com.ar/en_us/feedback-on-sale#feedback).  
\- You can get the seller information by consulting [the user API](https://developers.mercadolibre.com.ar/en_us/services-manage-users) using access\_token.

### Response fields:

**id**: unique order identifier.  
**date\_created**: order creation date.  
**date\_closed**: order confirmation date. It is set when an order status changes for the first time to confirmed / paid and the item is subtracted from the stock.  
**expiration\_date**: this is the deadline for the user to qualify since, after that date, the feedback is made visible, payments are released (if any), and charges are created.  
**status**: order status. See [possible values]().  
**status\_detail**: status detail.  
**code**: status code.  
**description**: status description.  
**buyer**: buyer's information.  
**seller**: seller's information.  
**order\_items**: order item listings.

- **item**: specific listing.
- **quantity**: quantity of items purchased.
- **sale\_fee**: sales commission.
- **unit\_price**: price per item.
- **gross\_price**: The `gross_price` attribute is a field that represents the original amount the customer would have paid for all units of the item without discounts. This field makes it possible to clearly visualize the impact of the discounts applied to each order.

**payments**: order-related payments.  
**feedback**: ID feedback information.  
**context**: detail of the characteristics of the creation of an order.

- **channel**: current sales channels for the item. possible values: proximity | mp-channel | marketplace.
- **site**: ID of the site where the purchase originated (MLA, MLB, MLM, etc).
- **flows**: is a list of characteristics of the origin of the purchase. Possible values cbt | subscription | reservation | reservation | catalog, contract | supermarket | 3x\_campaign | high\_concurrency | lite.
  
  **shipping**: ID shipping for this order.  
  **total\_amount**: total invoice amount.  
  **currency\_id**: currency ID.  
  **tags**: list of seller selected tags, such as delivered, paid.  
  **taxes**: amount with the sum of taxes to be paid from the order.  
  **cancel\_detail**. detail of the cancellation of the order in which it is found.
  
  - **group**: logical grouping of cancellation (mediations, fiscal, buyer, fraud, item, shipment, delivery, seller, internal).
  - **code**: cancellation cause code.
  - **description**: description of the cause of cancellation.
  - **requested\_by**: who requests the cancellation (buyer, seller, Mercado Libre).
  - **date**: cancellation date.
  
  **Note:** The field `gross_price` is available in the `order_items` object of each order and represents the total gross price considering the quantity of units.
  
  #### How is it calculated?
  
  The `gross_price` is calculated using the following formula:
  
  ```javascript
  gross_price = (unit_price + discounts.full) × quantity
  ```
  
  #### Formula components
  
  Field Type Description `unit_price` Number Unit price of the item **after** applying discounts. `discounts.full` Number Unit discount applied to the item (always expressed per unit). `quantity` Number Quantity of units of the item in the order. `gross_price` Number Original total amount without discounts for all units of the item.
  
  #### Important characteristics
  
  - **No discounts:** When there are no discounts applied, the `gross_price` matches the total paid (`unit_price × quantity`).
  - **Currency:** The `gross_price` is expressed in the same currency as the `unit_price` (defined in the `currency_id` field).
  - **Calculation per item:** Each item in `order_items` has its own `gross_price` value.
  
  #### Example response with gross\_price
  
  Call:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/$ORDER_ID
  ```
  
  Response:
  
  ```javascript
  {
    "id": 2000003456789012,
    "status": "paid",
    "status_detail": null,
    "date_created": "2026-01-05T10:30:00.000-03:00",
    "date_closed": "2026-01-05T10:32:15.000-03:00",
    "order_items": [
      {
        "item": {
          "id": "MLM823798303",
          "title": "Versace Pour Homme 100ml Edt Spray"
        },
        "quantity": 2,
        "unit_price": 440.00,
        "discounts": [
          {
            "amounts": {
              "full": 341.00,
              "seller": 341.00
            }
          }
        ],
        "gross_price": 1562.00,
        "currency_id": "MXN"
      }
    ],
    "total_amount": 880.00,
    "currency_id": "MXN",
    "buyer": {
      "id": 123456789
    },
    "seller": {
      "id": 987654321
    },
    "payments": [
      {
        "id": 12345678901,
        "transaction_amount": 880.00,
        "currency_id": "MXN",
        "status": "approved",
        "date_created": "2026-01-05T10:31:00.000-03:00",
        "date_last_modified": "2026-01-05T10:32:00.000-03:00"
      }
    ],
    "shipping": {
      "id": 43210987654321
    },
    "tags": [
      "paid",
      "not_delivered"
    ]
  }
  ```
  
  #### Breakdown of the calculation in the example
  
  **Step-by-step calculation:**
  
  ```javascript
  // Example data
  unit_price = 440.00        // Unit price WITH discount applied
  discounts.full = 341.00    // Unit discount
  quantity = 2               // Quantity of units
  
  // Formula application
  gross_price = (unit_price + discounts.full) × quantity
  gross_price = (440.00 + 341.00) × 2
  gross_price = 781.00 × 2
  gross_price = 1562.00      // Total gross price without discounts
  ```
  
  #### Considerations
  
  - The `gross_price` field may not be present in old orders created before the implementation of this attribute.
  - When there are no discounts applied (`discounts.full = 0`), the `gross_price` value will be equal to `unit_price × quantity`.
  - The `gross_price` is expressed in the same currency indicated in the item's `currency_id` field.
  - The `discounts.seller` field indicates the portion of the discount assumed by the seller, useful for co-funded campaigns.
  
  Notes:
  
  \- Remember that charges are calculated at the time of payment accreditation, that is, when the order becomes visible to the seller and not when the order is created.  
  \- As it happens every time the information of an order is updated, if we discover a fraudulent purchase, we will place the **fraud\_risk\_detected** tag to the order and send you a notification with the topic "orders" and said order ID.  
  To get more shipping information, you have to request to /shipments/shipping.id resource with the id obteined in the order. For more information, learn our [Shipments guide]().  
  For ME1, Custom or delivery orders to be agreed, we make the contact telephone number available in the buyer's data whenever this information is in the account. Example:
  
  "phone": - {  
  "area\_code": "11",  
  "number": "12345678",  
  "extension": null,  
  },  
  \-The "context" node brings information on purchase generation mode/flow and can be used for selector analysis.
  
  ## Fraud alerts (stop shipping)
  
  After the payment approval, and due to the relationship with banks and cards, we may receive an alert that the order is a fraud and to avoid a financial expense, you shouldn´t send the merchandise to the buyer.  
  In this case, **or order is marked with the tag "fraud\_risk\_detected"** and we send a notification with the topic "orders\_v2" with the ID of this order.  
  Once identified, the order must be canceled. Case the seller has already been sent products, it will be necessary to check or send it through the Mercado Libre or Mercado Pago sites.
  
  ## Total\_amount\_with\_shipping calculation
  
  With the response that you get in the **GET /orders/:id** request and the request to **GET /shipments/:shipping\_id** resource, both with the header **x-format-new: true**, you have to do the next calculation:
  
  **total\_amount\_with\_shipping** = total\_amount + taxes.amount + lead\_time.cost
  
  \*With the same item currency.
  
  The **total\_amount** and **taxes.amount** are obtained by the **/orders** resource, and the **lead\_time.cost** resource is obtained from the **/shipments**.
  
  Important:
  
  In case **taxes.currency\_id** is different from **items.currency\_id** we must obtain the conversion ratio.
  
  Request:
  
  ```javascript
  curl -X GET  https://api.mercadolibre.com/currency_conversions/search?from=$CURRENCY_ID&to=$CURRENCY_ID
  ```
  
  Example:
  
  ```javascript
  curl -X GET  https://api.mercadolibre.com/currency_conversions/search?from=ARS&to=BRL
  ```
  
  Response:
  
  ```javascript
  {
    "ratio": 0.0704988
  }
  ```
  
  ## What will happen to a sale based on its delivery?
  
  **Without Mercado Envíos**: The seller will be notified by e-mail or phone.
  
  - If the item has already been delivered and there is evidence of that, the seller is covered in the event of a chargeback. This means that the sales money will not be deducted.
  - If the item has not been delivered yet, the seller should refund the money.
  - Learn how to make a refund via API in [Refunds and cancellations](https://www.mercadopago.com.ar/developers/en/guides/manage-account/cancellations-and-refunds/).
  - For more information, we suggest reading the documentation of [“Seller Protection Program Requirements”](https://www.mercadopago.com.ar/ayuda/requisitos-programa-proteccion-vendedor_294).
  
  **With Mercado Envíos**: If the label has not been printed yet, the sale will be cancelled and a notification will be sent to the seller. Otherwise, if the item has already been shipped, Mercado Libre will notify the shipping company to return the item.
  
  ## Search orders
  
  You can use the /search functionality of the /orders resource to make searches with filters. Note that /search does not perform any action if it is not followed by a filter.
  
  You will be able to see those orders canceled manually, that is, with status **manually\_cancelled** and those that have an item removed, using the search as buyer. If you search as a seller, you will continue to filter such (canceled) orders.
  
  Request:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/search?buyer=$BUYER_ID
  ```
  
  Example:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/search?buyer=89660613&q=2032217210
  ```
  
  Response:
  
  ```javascript
  {
      "query": "2032217210",
      "results": [
          {
              "seller": {
                  "phone": {
                      "number": "11971427863",
                      "extension": "",
                      "area_code": null,
                      "verified": false
                  },
                  "alternative_phone": {
                      "number": "",
                      "extension": "",
                      "area_code": ""
                  },
                  "nickname": "VENDASDKMB",
                  "last_name": "Cheracomo",
                  "id": 239432672,
                  "first_name": "Demétrio",
              },
              "payments": [
                  {
                      "reason": "Kit Com 03 Adesivo Spray 3m 75 Cola Silk Sublimação 300g",
                      "status_code": null,
                      "total_paid_amount": 129.95,
                      "operation_type": "regular_payment",
                      "transaction_amount": 129.95,
                      "date_approved": "2019-05-22T03:51:07.000-04:00",
                      "collector": {
                          "id": 239432672
                      },
                      "coupon_id": null,
                      "installments": 1,
                      "authorization_code": "008877",
                      "taxes_amount": 0,
                      "id": 4792155710,
                      "date_last_modified": "2019-05-22T03:51:07.000-04:00",
                      "coupon_amount": 0,
                      "available_actions": [
                          "refund"
                      ],
                      "shipping_cost": 0,
                      "installment_amount": 129.95,
                      "date_created": "2019-05-22T03:51:05.000-04:00",
                      "activation_uri": null,
                      "overpaid_amount": 0,
                      "card_id": 203453778,
                      "status_detail": "accredited",
                      "issuer_id": "24",
                      "payment_method_id": "master",
                      "payment_type": "credit_card",
                      "deferred_period": null,
                      "atm_transfer_reference": {
                          "transaction_id": "135292",
                          "company_id": null
                      },
                      "site_id": "MLB",
                      "payer_id": 89660613,
                      "marketplace_fee": 14.290000000000001,
                      "order_id": 2000003508419013,
                      "currency_id": "BRL",
                      "status": "approved",
                      "transaction_order_id": null
                  }
              ],
              "fulfilled": true,
              "buying_mode": "buy_equals_pay",
              "taxes": {
                  "amount": null,
                  "currency_id": null
              },
              "order_request": {
                  "change": null,
                  "return": null
              },
              "feedback": {
                  "sale": null,
                  "purchase": null
              },
              "shipping": {
                  "id": 27968238880
              },
              "date_closed": "2019-05-22T03:51:07.000-04:00",
              "id": 2032217210,
              "manufacturing_ending_date": null,
              "hidden_for_seller": false,
              "order_items": [
                  {
                      "item": {
                          "seller_custom_field": null,
                          "condition": "new",
                          "category_id": "MLB33383",
                          "variation_id": null,
                          "variation_attributes": [],
                          "seller_sku": null,
                          "warranty": "Garantia de 1 ano fabricante",
                          "id": "MLB1054990648",
                          "title": "Kit Com 03 Adesivo Spray 3m 75 Cola Silk Sublimação 300g"
                      },
                      "quantity": 1,
                      "differential_pricing_id": null,
                      "sale_fee": 14.29,
                      "listing_type_id": "gold_special",
                      "base_currency_id": null,
                      "unit_price": 129.95,
                      "base_exchange_rate": null,
                      "currency_id": "BRL",
                      "manufacturing_days": null
                  }
              ],
              "date_last_updated": "2020-02-14T02:55:49.811Z",
              "last_updated": "2019-05-28T15:16:04.000-04:00",
              "comments": null,
              "pack_id": null,
              "shipping_cost": 0,
              "date_created": "2019-05-22T03:51:05.000-04:00",
              "application_id": "7092",
              "pickup_id": null,
              "status_detail": null,
              "tags": [
                  "delivered",
                  "paid"
              ],
              "buyer": {        
                  "id": 89660613,       
              },
              "total_amount": 129.95,
              "paid_amount": 129.95,
              "mediations": [],
              "currency_id": "BRL",
              "status": "paid"
          }
      ],
      "sort": {
          "id": "date_asc",
          "name": "Date ascending"
      },
      "available_sorts": [
          {
              "id": "date_desc",
              "name": "Date descending"
          }
      ],
      "filters": [],
      "paging": {
          "total": 1,
          "offset": 0,
          "limit": 50
      },
      "display": "complete"
  }
  ```
  
  ## Products information in orders
  
  This request shows all the information of the products that are in the same order:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/$order_id/product
  ```
  
  Response:
  
  ```javascript
  {
  	"attributes": [
      		{
          		"name": "IMEI",
          	"value": "111",
          		"id": 1
      	},
      		{
          		"name": "IMEI",
          	"value": "222",
          		"id": 2
      	},
      		{
          		"name": "entry_date",
          	"value": "01/01/2001",
          		"id": 3
      	}
  	]
  }
  ```
  
  Note:
  
  To view orders within a shopping cart it is necessary to use the [/packs](/en_us/shopping-cart-order-handling) resource. Note that the /orders resource can include many products of the same publication in terms of quantities.
  
  ## Get discounts applied to a sale
  
  Use the /discounts resource to review the details of all the discounts that have impacted a sale. Remember that discounts can come from a campaign (promotion), a coupon or cashback, and that a sale can have more than one discount applied.  
  Remember that orders created up to 12 months ago are currently saved, and if you search as a seller, canceled orders will be filtered out.
  
  Request:
  
  ```javascript
  curl -X GET -H ‘Authorization: Bearer $ACCESS_TOKEN’ https://api.mercadolibre.com/orders/$ORDER_ID/discounts
  ```
  
  Example:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/2000003508419013/discounts
  ```
  
  Response:
  
  ```javascript
  {
      "details": [
          {
              "type": "coupon",
              "coupon": {
                  "id": 569290732
              },
              "supplier": {
                  "meli_campaign": "P-MLA4944001"
              },
              "items": [
                  {
                      "quantity": 1,
                      "amounts": {
                          "total": 446.7,
                          "seller": 0
                      },
                      "id": "MLA922971037"
                  }
              ]
          },
          {
              "type": "discount",
              "supplier": {
                  "offer_id": "MLA922971037-abc123",
                  "funding_mode": "sale_fee"
              },
              "items": [
                  {
                      "quantity": 1,
                      "amounts": {
                          "total": 446.7,
                          "seller": 0
                      },
                      "id": "MLA922971037"
                  }
              ]
          },
          {
              "type": "cashback",
              "items": [
                  {
                      "element_id": 1,
                      "quantity": 1,
                      "id": "MLB1881365644",
                      "amounts": {
                          "total": 5.4,
                          "seller": 0
                      }
                  }
              ],
              "supplier": {
                  "campaign_id": "10116144"
              },
              "cashback": {
                  "id": "2251800174114906"
              },
              "counter_currency": {
                  "currency_id": "MCN",
                  "value": 15.6784541
              }
          }
      ]
  }
  ```
  
  ### Response fields
  
  Each discount can have the following fields within the details attribute, depending on the type:
  
  - **coupon.id**: Coupon identifier.
  - **supplier**: Campaign provider.
  
  <!--THE END-->
  
  - - meli\_campaign: Discount campaign associated with the coupon.
    - offer\_id: Offer identifier, useful for retrieving the campaign name.
    - funding\_mode: Type of promotion obtained by the IPA. For example, sale\_fee.
  
  <!--THE END-->
  
  - **items**: Items to which the coupon applies.
  
  <!--THE END-->
  
  - - id: Item identifier.
    - quantity: Quantity of items affected by the discount.
    - amounts: Coupon values.
  
  <!--THE END-->
  
  - - - total: Portion of the discount associated with the item (p * q).
      - seller: Portion of the discount for the seller (p * q).
  
  Note:
  
  - Keep in mind that the /orders/$id/discounts resource only includes discounts applied to the price (excluding additional charges and subsequent refunds), coupons, and cashbacks.
  
  ## Filter
  
  To filter your orders with status "paid" accounts with the following filters:
  
  **item**: tittle ID  
  **tags**: it can be some status separated by ','  
  **tags.not**: it can be some status separated by ','  
  **q**: it is a field that allows you to search by:
  
  - order id
  - item id
  - item title
  - nickname of the counterpart
  
  **order.status**: it can be some status separated by ','  
  **order.date\_last\_updated.from**  
  **order.date\_last\_updated.to**  
  **order.date\_created.from**  
  **order.date\_created.to**  
  **order.date\_closed.from**  
  **order.date\_closed.to**  
  **mediations.stage**: it can be some status separated by ','  
  **mediations.status**: it can be some status separated by ','  
  **feedback.status**: it can be some status separated by ','  
  **feedback.sale.rating**: it can be some status separated by ','  
  **feedback.sale.fulfilled**  
  **feedback.purchase.rating**: it can be some status separated by ','  
  **feedback.purchase.fulfilled**
  
  Note:
  
  The “q” filter does not consider the first\_name, last\_name and email values ​​when searching for an orden.
  
  Example:
  
  ```javascript
  curl  -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/search?seller=seller_id&order.status=paid
  ```
  
  If you want to filter your orders by date, you should do the following:
  
  ```javascript
  curl  -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/search?seller=$SELLER_ID&order.date_created.from=2015-07-01T00:00:00.000-00:00&order.date_created.to=2015-07-31T00:00:00.000-00:00
  ```
  
  Note:
  
  To filter by date you only need the hour. Information about minutes, seconds and milliseconds is removed.
  
  ## Sort
  
  In this case, you should add “sort” to the available sort ID that you wish to apply, for example: “date\_desc”.
  
  ```javascript
  curl  -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/search?seller={seller_id}&order.status=paid&sort=date_desc
  ```
  
  Note:
  
  By default, it sorts by date\_asc. The sorting date is:  
  \- Sellers por date\_closed.  
  \- Buyers por date\_created.
  
  ## Order status
  
  Order statuses are the following:  
  **confirmed** Initial status of an order, even if it is still unpaid.  
  **payment\_required** Order payment should be confirmed to display user information.  
  **payment\_in\_process** There is an order-related payment, but it has not been credited yet.  
  **partially\_paid** The order have a credited associated payment, but it is not enough.  
  **paid** The order-related payment is credited, but it is not enough.  
  **cancelled** For some reason, the order was not fulfilled.*  
  **invalid** The order was invalidated as it came from a malicious buyer.
  
  Notes:
  
  An order may be canceled due to the following reasons:  
  \- Payment approval was required to subtract stock, but, during the approval process period, the item was paused/terminated due to stockout; so, the payment is returned to the buyer.  
  \- Payment was required, but, as it was not paid within a specific period, it was automatically canceled.  
  \- After making a transaction, for some reason the seller is banned from the site.  
  \- If for some reason the seller rates the transaction as non-completed, the order takes the "status = confirmed." If there is an approved payment, it will be automatically returned. Bear in mind that an order that has not been completed by the seller at front will appear as "Cancelled" and with api "status: confirmed".
  
  ## Error code reference
  
  Error Error message Description Possible solution **order\_not\_found** Order not found. $order\_id incorrect. The order cannot be found, check if the order\_id is correct. [More information](https://developers.mercadolibre.com.ar/en_us/manage-sales?nocache=true#getOrder). **empty\_order\_id** Order ID can not be empty. $order\_id is null. The parameter order\_id cannot be null, check the URL used. More information **invalid\_order\_id** Invalid order ID. $order\_id incorrect. The parameter order\_id must be a integer number. For search your orders see this topic. **not\_identified\_user** Can not identify the user. Do not exist a Token. Send a token. **not\_owned\_order** The user has not access to the order. $seller or $buyer incorrect. To see one order, your access\_token must be generated from seller or buyer. **caller.id.invalid** caller.id does not match buyer nor seller. $seller or $buyer incorrect. To see one order, you must be use one ID from seller or buyer. **feedback\_not\_found** The feedback does not exist. Reply error. Check if feedback exist for give a reply. **invalid\_fulfilled** ‘fulfilled’ parameter must be true or false. Error on give feedback. Check the parameter $fulfilled this must be boolean (remove quotation marks) and check if the parameter $reason is not null in case of $fulfilled: false. **reply\_time\_expired** Reply time expired. There is a 14 days period to reply a feedback. Error on give reply on feedback. The reply can be sent in 14 days past the feedback date. **reply\_already\_exists** Reply already exists for the feedback. Error on give reply on feedback. The feedback supports only one reply.
  
  ## HTTP response code references
  
  Orders may return the code http 206 when it has not been possible to obtain any data. Keep in mind that in most cases the information you receive will be enough for you to continue working.  
  In the response header X-Content-Missing you will have the name of the fields without information, which can be "buyer", "feedback", "mediations", "seller" and / or "shipping".
  
  Request::
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/$ORDER_ID
  ```
  
  Response:
  
  ```javascript
  
  < HTTP/1.1 206 Partial Content> X-Content-Missing: buyer, feedback
  
  {
    "id": 768570754,
    "status": "paid",
    "status_detail": null,
    "date_created": "2013-05-27T10:01:50.000-04:00",
    "date_closed": "2013-05-27T10:04:07.000-04:00",
    "order_items": - [
  	- {
    	"item": - {
      	"id": "MLB12345678",
    	  "title": "Samsung Galaxy",
      	"variation_id": null,
      	"variation_attributes": [
      	],
    	},
    	"quantity": 1,
    	"unit_price": 499,
    	"currency_id": "BRL",
  	},
    ],
    "total_amount": 499,
    "currency_id": "BRL",
    "buyer": - { },
    },
    "seller": - {
  	"id": "123456789",
    },
    "payments": - [
  	- {
    	"id": "596707837",
    	"transaction_amount": 499,
    	"currency_id": "BRL",
    	"status": "approved",
    	"date_created": null,
    	"date_last_modified": null,
  	},
    ],
    "feedback": - { },
    "shipping": - {
  	"id": 20676482441
  	
    },
    "tags": - [
  	"paid",
  	"not_delivered",
    ],
  }
  ```
  
  **Next:** [Messaging after sale](https://developers.mercadolibre.com.ar/en_us/messaging-after-sale/).