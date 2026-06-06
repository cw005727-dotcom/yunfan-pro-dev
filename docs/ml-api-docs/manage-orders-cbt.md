# Orders

## Here, we detail the order management. The Global Selling orders correspond to each local marketplace (México, Brasil and Chile) and sellers manage these orders in a unified way.

**Tags:** Manage,sales,orders,order,filters orders
**Created:** 2020-02-21T16:04:05Z
**Last Updated:** 2026-02-18T17:38:21Z

---

## Manage orders

An order is a request made by a customer on a listed item that intends to buy under a series of conditions to be selected in the online checkout flow. These conditions are detailed in the order that will be replicated for buyer and seller accounts. You will find information about the product to fill out there. The Global Selling orders correspond to each local marketplace (México, Brasil and Chile) and sellers manage these orders in a unified way. Next, we detail the order management flow.

## Receive notifications

Some events happen on Global Selling's side and notifications are the only way to become aware of them. Receiving notifications enables you to have a real-time feed of the changes that occur on the different resources of our API. Learn more about [notifications](https://global-selling.mercadolibre.com/devsite/receive-notifications#marketplace-orders).

## Summary

This examples will help you manage orders.

Resource Description Example **/marketplace/orders/search** Search all orders from a seller. [GET](#modal1)

[Go back](#close) [X](#close "Close")

### Search the orders by seller

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/orders/search
```

### Response

```javascript
{
  "query": "",
  "results": [{
    "id": 2315686468,
    "buyer": {
      "id": 441782523
    },
    "config": {
      "items": [{
        "id": "MLM755638064"
      }]
    },
    "orders": [{
      "id": 2315686468,
      "items": null,
      "feedback": {
        "purchase": null,
        "sale": null
      },
      "payments": [{
        "id": 5882999015
      }],
      "mediations": [],
      "seller": {
        "id": 523132944
      }
    }],
    "shipment": {
      "id": 28242306889,
      "payments": []
    }
  }],
  "sort": {
    "id": "date_asc",
    "name": "Date ascending"
  },
  "available_sorts": [{
    "id": "date_desc",
    "name": "Date descending"
  }],
  "filters": [],
  "paging": {
    "total": 1,
    "limit": 50,
    "scroll_id": "YXNzb3J0ZWQtbWVkaXVtLXpldGEtdGVtcA==:ZHMtYXNzb3J0ZWQtbWVkaXVtLXpldGEtMDE=:DXF1ZXJ5QW5kRmV0Y2gBAAAAAHxnEgwWZG1TRzNfNklSaE9VTUZYeGhfc1dFdw=="
  }
}
```

[Learn more.](https://global-selling.mercadolibre.com/devsite/manage-sales-global-selling)

**/marketplace/orders/search?seller=$SELLER\_ID** Search one order from a seller. [GET](#modal2)

[Go back](#close) [X](#close "Close")

### Search order by seller

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' http://api.mercadolibre.com/marketplace/orders/search?seller.id=523133081
```

### Response

```javascript

        "seller_custom_field": null,
        "variation_attributes": [],
        "category_id": "MLA3530",

    }]
  }]
}
```

[Learn more.](https://global-selling.mercadolibre.com/devsite/manage-sales-global-selling)

**/sites/$SITE\_ID/payment\_methods** Returns the payment methods provided by Mercado Pago. [GET](#modal4)

[Go back](#close) [X](#close "Close")

### Returns data for a payment

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' http://api.mercadolibre.com/sites/MLM/payment_methods
```

### Response

```javascript
[
    {
        "id": "visa",
        "name": "Visa",
        "payment_type_id": "credit_card",
        "thumbnail": "http://img.mlstatic.com/org-img/MP3/API/logos/visa.gif",
        "secure_thumbnail": "https://www.mercadopago.com/org-img/MP3/API/logos/visa.gif"
    },
    {
        "id": "amex",
        "name": "American Express",
        "payment_type_id": "credit_card",
        "thumbnail": "http://img.mlstatic.com/org-img/MP3/API/logos/amex.gif",
        "secure_thumbnail": "https://www.mercadopago.com/org-img/MP3/API/logos/amex.gif"
    },
    {
        "id": "master",
        "name": "Mastercard",
        "payment_type_id": "credit_card",
        "thumbnail": "http://img.mlstatic.com/org-img/MP3/API/logos/master.gif",
        "secure_thumbnail": "https://www.mercadopago.com/org-img/MP3/API/logos/master.gif"
    },
    {
        "id": "debmaster",
        "name": "Mastercard Débito",
        "payment_type_id": "debit_card",
        "thumbnail": "http://img.mlstatic.com/org-img/MP3/API/logos/debmaster.gif",
        "secure_thumbnail": "https://www.mercadopago.com/org-img/MP3/API/logos/debmaster.gif"
    },
    {
        "id": "debvisa",
        "name": "Visa Débito",
        "payment_type_id": "debit_card",
        "thumbnail": "http://img.mlstatic.com/org-img/MP3/API/logos/debvisa.gif",
        "secure_thumbnail": "https://www.mercadopago.com/org-img/MP3/API/logos/debvisa.gif"
    },
    {
        "id": "mercadopagocard",
        "name": "Tarjeta MercadoPago",
        "payment_type_id": "prepaid_card",
        "thumbnail": "http://img.mlstatic.com/org-img/MP3/API/logos/mercadopagocard.gif",
        "secure_thumbnail": "https://www.mercadopago.com/org-img/MP3/API/logos/mercadopagocard.gif"
    },
    {
        "id": "serfin",
        "name": "Santander",
        "payment_type_id": "atm",
        "thumbnail": "http://img.mlstatic.com/org-img/MP3/API/logos/2016.gif",
        "secure_thumbnail": "https://www.mercadopago.com/org-img/MP3/API/logos/2016.gif"
    },
    {
        "id": "oxxo",
        "name": "OXXO",
        "payment_type_id": "ticket",
        "thumbnail": "http://img.mlstatic.com/org-img/MP3/API/logos/2017.gif",
        "secure_thumbnail": "https://www.mercadopago.com/org-img/MP3/API/logos/2017.gif"
    },
    {
        "id": "account_money",
        "name": "Dinero en mi cuenta de MercadoPago",
        "payment_type_id": "account_money",
        "thumbnail": "http://img.mlstatic.com/org-img/MP3/API/logos/2018.gif",
        "secure_thumbnail": "https://www.mercadopago.com/org-img/MP3/API/logos/2018.gif"
    },
    {
        "id": "bancomer",
        "name": "BBVA Bancomer",
        "payment_type_id": "atm",
        "thumbnail": "http://img.mlstatic.com/org-img/MP3/API/logos/2014.gif",
        "secure_thumbnail": "https://www.mercadopago.com/org-img/MP3/API/logos/2014.gif"
    },
    {
        "id": "banamex",
        "name": "Citibanamex",
        "payment_type_id": "atm",
        "thumbnail": "http://img.mlstatic.com/org-img/MP3/API/logos/2015.gif",
        "secure_thumbnail": "https://www.mercadopago.com/org-img/MP3/API/logos/2015.gif"
    },
    {
        "id": "consumer_credits",
        "name": "Mercado Crédito",
        "payment_type_id": "digital_currency",
        "thumbnail": "http://img.mlstatic.com/org-img/MP3/API/logos/consumer_credits.gif",
        "secure_thumbnail": "http://img.mlstatic.com/org-img/MP3/API/logos/consumer_credits.gif"
    }
]
```

[Learn more.](https://global-selling.mercadolibre.com/devsite/set-categories-for-your-products-global-selling)

**/sites/$SITE\_ID/payment\_methods/$id** Returns the detail of the specific payment method. [GET](#modal5)

[Go back](#close) [X](#close "Close")

### Get payment method

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' http://api.mercadolibre.com/sites/MLM/payment_methods/visa
```

### Response

```javascript
{
  "name": "Visa",
  "id": "visa",
  "payment_type_id": "credit_card",
  "card_issuer": {},
  "site_id": "MLM",
  "secure_thumbnail": "https://www.mercadopago.com/org-img/MP3/API/logos/visa.gif",
  "thumbnail": "http://img.mlstatic.com/org-img/MP3/API/logos/visa.gif",
  "labels": [],
  "total_financial_cost": null,
  "min_accreditation_days": 0,
  "max_accreditation_days": 2,
  "payer_costs": [],
  "deferred_capture": "supported",
  "exceptions_by_card_issuer": [],
  "card_configuration": []
}
```

**/marketplace/orders/$ORDER\_ID/invoice** Get the "proforma" invoice to be used for customs declarations. [GET](#modal6)

[Go back](#close) [X](#close "Close")

### Get an order invoice

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' http://api.mercadolibre.com/marketplace/orders/2315686468/invoice
```

### Response: Get the "proforma" invoice to be used for customs declarations.

[Learn more.](https://global-selling.mercadolibre.com/devsite/manage-sales-global-selling)

## Order status

Order statuses are the following:

Status Description **payment\_required** Order payment should be confirmed to display user information. **payment\_in\_process** There is an order-related payment, but it has not been credited yet. **partially\_paid** The order have a credited associated payment, but it is not enough. **paid** The order-related payment is credited. **cancelled** For some reason, the order was not fulfilled.* **invalid** The order was invalidated as it came from a malicious buyer.

Note:

An order may be canceled due to the following reasons:  
\- Payment approval was required to subtract stock, but, during the approval process period, the item was paused/terminated due to stockout; so, the payment is returned to the buyer.  
\- Payment was required, but, as it was not paid within a specific period, it was automatically canceled.  
\- After making a transaction, for some reason the seller is banned from the site.

## Search orders

You can use the /search functionality of the /orders resource to make searches with filters. Note that /search does not perform any action if it is not followed by a filter.

To consume this resource, make a call with GET method as shown in the following curl:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/orders/search
```

Note:

This request has a limit 100 request per minute.

Example:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/orders/search
```

Cart order response:

```javascript
{
            "id": 2000000580342535, -> Don't use it. Use the orders node id.
            "buyer": {
                "id": 116038996
            },
            "config": {
                "items": [
                    {
                        "id": "MLM759344664"
                    }
                ]
            },
            "orders": [
                {
                    "id": 2497671750, -> This is the order id you have to use.
                    "items": null,
                    "feedback": {
                        "purchase": null,
                        "sale": null
                    },
                    "payments": [
                        {
                            "id": 7032122688
                        }
                    ],
                    "mediations": [],
                    "seller": {
                        "id": 514048142
                    }
                }
            ],
            "shipment": {
                "id": 28504764933,
                "payments": []
            }
        }
```

Individual order response:

```javascript
{
            "id": 2483140131,
            "buyer": {
                "id": 441782523
            },
            "config": {
                "items": [
                    {
                        "id": "MLM781272686"
                    }
                ]
            },
            "orders": [
                {
                    "id": 2483140131, -> this is the order id.
                    "items": null,
                    "feedback": {
                        "purchase": null,
                        "sale": null
                    },
                    "payments": [
                        {
                            "id": 6903805442
                        }
                    ],
                    "mediations": [
                        {
                            "id": 5022947125
                        }
                    ],
                    "seller": {
                        "id": 523132944
                    }
                }
            ],
            "shipment": {
                "id": 30041416576,
                "payments": []
            }
        }
```

Note:

Use the order ID´s from the orders node.

### Parameters

Parameter Description **sort** Shows field you can use to sort results. **order** Shows order direction you need to organize results with. **limit** The limit of results requested, it has a maximum of 1000. **offset** Using the offset attribute, you can move the lower limit of the result block.

## Search orders with filters

Search orders using limit filter resource allows to restrict results. You should make a call using GET method like this:

Request:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET  https://api.mercadolibre.com/marketplace/orders/search?buyer=$BUYER_ID&limit=$LIMIT
```

Example:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/orders/search?buyer=441782523&limit=50
```

Response:

```javascript
{
   "query":"",
   "results":[
      {
         "id":2194210960,
         "buyer":{
            "id":441782523
         },
         "config":{
            "items":[
               {
                  "id":"MLM733232983"
               }
            ]
         },
         "orders":[
            {
               "id":2194210960,
               "items":null,
               "feedback":{
                  "purchase":null,
                  "sale":null
               },
               "payments":[
                  {
                     "id":5384783409
                  }
               ],
               "mediations":[
                  {
                     "id":1041550651
                  }
               ]
            }
         ],
         "shipment":{
            "id":28140042692,
            "payments":[

            ]
         }
      },
      {
         "id":2194336280,
         "buyer":{
            "id":441782523
         },
         "config":{
            "items":[
               {
                  "id":"MLM733232983"
               }
            ]
         },
         "orders":[
            {
               "id":2194336280,
               "items":null,
               "feedback":{
                  "purchase":null,
                  "sale":null
               },
               "payments":[
                  {
                     "id":5384748271
                  }
               ],
               "mediations":[
                  {
                     "id":5007508763
                  }
               ]
            }
         ],
         "shipment":{
            "id":28139907607,
            "payments":[

            ]
         }
      }
   ],
   "sort":{
      "id":"date_asc",
      "name":"Date ascending"
   },
   "available_sorts":[
      {
         "id":"date_desc",
         "name":"Date descending"
      }
   ],
   "filters":[],
   "paging":{
      "total":2,
      "limit":50
   }
}
```

### Parameters

Parameter Description **buyer** To search orders by certain buyer. **seller.id** To search orders by certain seller. **order.status** To search orders by certain status (paid, cancelled, payment\_required, paid). **site** To search orders of country shown in site (MLM, MLB, MLC). **limit** To reduce page size changing number of results to show in each page. If not stated, 50 results will be brought -maximum allowed value. **offset** Using the offset attribute, you can move the lower limit of the result block. **date\_created.from** To search from a certain order creation date. **date\_created.to** To search for orders created up to a certain date. **last\_updated.from** To search from a certain order update date. **last\_updated.to** To search for orders updated up to a certain date. **date\_closed.from** To search from a certain closing date. **date\_closed.to** To search for orders closed until a certain date. **mediations.stage** It can be some status separated by ','.

### Available date formats

- yyyy-MM (eg 1997-07)
- yyyy-MM-dd (eg 1997-07-16)
- yyyy-MM-ddThh (eg 1997-07-16T19)
- yyyy-MM-ddThh:mm (eg 1997-07-16T19:20)
- yyyy-MM-ddThh:mm:ss (eg 1997-07-16T19:20:30)
- yyyy-MM-ddThh:mm:ss.ms (eg 1997-07-16T19:20:30.45)
- yyyy-MM-ddThh:mm:ss.ms-TZD (eg 1997-07-16T19:20:30.45-01:00)
  
  **yyyy** = four-digit year  
  **MM** = two-digit month (01=January, etc.)  
  **dd** = two-digit day of month (01 through 31)  
  **hh** = two digits of hour (00 through 23) (am/pm NOT allowed)  
  **mm** = two digits of minute (00 through 59)  
  **ss** = two digits of second (00 through 59)  
  **ms** = one or more digits representing a decimal fraction of a second  
  **TZD** = time zone designator (hh:mm)  
  **T** = Time separator between date and time, must be a T letter

### Available sorts

Search orders can receive parameters with which you can sort the search results by dates. The available sorts parameters are:

Sort Description **date\_asc** Date ascending **date\_desc** Date descending **updated\_asc** Last updated ascending **updated\_desc** Last updated descending **closed\_asc** Date close ascending **closed\_desc** Date close descending

### Errors

HTTP Code Error Message **403** forbidden Invalid caller.id **403** forbidden Can not identify the user **404** not\_found Resource not found **500** internal\_server\_error Oops! Something went wrong... **401** not\_found invalid\_token **400** bad\_request Malformed access\_token: TOKEN\_NOT\_VALID **400** bad\_request Param not valid **451** unavailable.for.legal.reasons The requested user is not available due to legal reasons

## Get an order

Important:

We will no longer provide personal seller and buyer data in the GET response of Orders with Mercado Envíos 2, as it is possible [check the /users endpoint](https://global-selling.mercadolibre.com/devsite/manage-users-global-selling#user-private-information).

For implementation, make a request with GET method as shown below:

Request:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/orders/$ORDER_ID
```

### Parameters

Parameter Description **ORDER\_ID** Unique order identifier.

Example:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/orders/2000003508419013
```

Response:

```javascript
{
    "id": 2000003508419013,
    "date_created": "2020-01-31T18:03:35.000-04:00",
    "date_closed": "2020-01-31T18:03:36.000-04:00",
    "last_updated": "2020-01-31T18:03:36.000-04:00",
    "manufacturing_ending_date": null,
    "feedback": {
        "sale": null,
        "purchase": null
    },
    "mediations": [],
    "comments": null,
    "pack_id": null,
    "pickup_id": null,
    "order_request": {
        "return": null,
        "change": null
    },
    "fulfilled": null,
    "paid_amount": 15.1,
    "coupon": {
        "id": null,
        "amount": 0
    },
    "expiration_date": "2020-05-10T18:03:36.000-04:00",
    "order_items": [
        {
            "item": {
                "id": "MLM754639529",
                "title": "Elemento De Prueba - Para Pruebas De Carga",
                "category_id": "MLM71792",
                "variation_id": null,
                "seller_custom_field": null,
                "variation_attributes": [],
                "condition": "new",
                "seller_sku": null,
                "parent_item_id": "CBT910504819"
            },
            "quantity": 1,
            "unit_price": 15.1,
            "currency_id": "USD",
            "manufacturing_days": null,
            "sale_fee": 2.64,
            "base_exchange_rate": 19.25
        }
    ],
    "currency_id": "USD",
    "payments": [
        {
            "id": 5855860136,
            "order_id": 2000003508419013,
            "payer_id": 441782523,
            "collector": {
                "id": 481240836
            },
            "card_id": 8738685222,
            "site_id": "MLM",
            "reason": "Elemento De Prueba - Para Pruebas De Carga",
            "payment_method_id": "amex",
            "currency_id": "USD",
            "installments": 1,
            "issuer_id": "157",
            "atm_transfer_reference": {
                "company_id": null,
                "transaction_id": "1234567"
            },
            "coupon_id": null,
            "activation_uri": null,
            "operation_type": "regular_payment",
            "payment_type": "credit_card",
            "available_actions": [
                "refund"
            ],
            "status": "approved",
            "status_code": null,
            "status_detail": "accredited",
            "transaction_amount": 15.1,
            "taxes_amount": 0,
            "shipping_cost": 0,
            "coupon_amount": 0,
            "overpaid_amount": 0,
            "total_paid_amount": 15.1,
            "installment_amount": 15.1,
            "deferred_period": null,
            "date_approved": "2020-01-31T18:03:36.000-04:00",
            "authorization_code": "1234567",
            "transaction_order_id": null,
            "date_created": "2020-01-31T18:03:36.000-04:00",
            "date_last_modified": "2020-01-31T18:03:36.000-04:00"
        }
    ],
    "shipping": {
        "id": 28237306862
    },
    "status": "paid",
    "status_detail": {
        "code": "",
        "description": null
    },
    "buyer": {
        "id": 441782523,
        "nickname": "TESTY0DT2NRL",
        "last_name": "Test",
        "first_name": "Test"
    },
    "seller": {
        "id": 481240836
    },
    "taxes": {
        "amount": 0,
        "currency_id": "USD"
    },
    "context": {
       "channel": "marketplace",
       "site": "MLM",
       "flows": [
           "cbt"
       ],
       "application": "purchases-api"
   }
}
```

We remove the data of buyer's billing info from the order. Please, check this data by doing a [GET to /orders/order\_id/billing\_info](https://global-selling.mercadolibre.com/devsite/gs-billing-data).

Orders have a lot of attributes. Below you will see a description of the most important fields:

### Response fields

Field Description **id** Unique order identifier. **date\_created** Order creation date. **date\_closed** Order confirmation date. It is set when an order status changes for the first time to confirmed / paid and the item is subtracted from the stock. **expiration\_date** This is the deadline for the user to qualify since, after that date, the feedback is made visible, payments are released (if any), and charges are created. **status** Order status. See [possible values](#Order-status). **currency\_id** You need to define a currency. You need to use USD. This one is also a mandatory attribute. **status\_detail** Status detail. **code** Status code. **description** Status description. **buyer** Buyer's information. **seller** Seller's information. **order\_items** Order item listings. **payments** Order-related payments. **feedback** Order-related feedback information. **shipping** Shipping configuration for this order. **total\_amount** Total invoice amount. **tags** List of seller selected tags, such as delivered, paid. **taxes** Amount with the sum of taxes to be paid from the order. **gross\_price** Attribute is a field that represents the original amount the customer would have paid for all units of the item without discounts.  
This field makes it possible to clearly visualize the impact of the discounts applied to each order.

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

### Errors

HTTP Code Error Message **403** forbidden Invalid caller.id **403** forbidden Can not identify the user. **404** not\_found Resource not found. **500** internal\_server\_error Oops! Something went wrong... **401** not\_found invalid\_token **400** bad\_request Malformed access\_token: TOKEN\_NOT\_VALID **400** bad\_request Param not valid **451** unavailable.for.legal.reasons The requested user is not available due to legal reasons

As soon as you [receive an orders notification](https://global-selling.mercadolibre.com/devsite/receive-notifications#orders), with the order ID you get the information making a request to the /marketplace/orders resource ([get an order](#Get-an-order-detail)). Then, with the shipping ID you can identify the logistics (logistic\_type and mode) by consulting the /marketplace/shipments resource ([get shippment details](https://global-selling.mercadolibre.com/devsite/manage-shipments#Receive-a-shipment)). With this information, you will know what steps you should take next depending on each [shipping method](https://global-selling.mercadolibre.com/devsite/manage-shipments?nocache=true#Shipping-methods).

\*The error 404 can occur when trying to query a pack\_id with the orders resource. Please [review how to Manage Cart Orders](https://global-selling.mercadolibre.com/devsite/packs).

## Fraud alerts (stop shipping)

After the payment approval, and due to the relationship with banks and cards, we may receive an alert that the order is a fraud and to avoid a financial expense, you shouldn´t send the merchandise to the buyer.  
In this case, **or order is marked with the tag "fraud\_risk\_detected"** and we send a notification with the topic "orders\_v2" with the ID of this order.  
Once identified, the order must be canceled. Case the seller has already been sent products, it will be necessary to check or send it through the Mercado Libre or Mercado Pago sites.

## Invoice

Get the "proforma" invoice to be used for customs declarations.

Request:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/orders/$ORDER_ID/invoice
```

Example:

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/DevSite/324278889017-invoice-global-selling-example.png)

## Add product information

Important:

Providing the IMEI number is now mandatory for cell phone purchases in the Colombian market. Please update your application accordingly.

Due to regulations in the Colombian market, it will be mandatory to include the IMEI number (IMEI stands for International Mobile Equipment Identity. It is a unique 15-digit number assigned to every mobile phone and smartphone.) on the label when buyers from this market purchase mobile phones. For this purpose, items associated with the category ID MCO1055 are considered cell phone purchases. To comply with this requirement, we have made available a writing resource on the label that allows for the inclusion of the IMEI number of the mobile phone being shipped in the package. For implementation, make a request with POST method as shown below:

Request:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
-d '{
   "name": "IMEI",
 "value": "1234567890ABCDE"
 }'
https://api.mercadolibre.com/marketplace/orders/$ORDER_ID/attributes
```

Example:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
-d '{
   "name": "IMEI",
 "value": "1H24HD121H24HD1"
 }'
https://api.mercadolibre.com/marketplace/orders/2000003508419223/attributes
```

Response: Status Code 201

```javascript
{
   "status": "success"
 }
```

### Errors

HTTP Code Error Message **400** Invalid order We can only update product from category \[MCO1055] **400** Invalid request IMEI must be 15 digits long. **400** Invalid request Must specify valid attribute name.

**Next**: [Shipments](https://global-selling.mercadolibre.com/devsite/manage-shipments).