# Shipments

## Learn more about the shipment resource, how to print labels, get shipment details like status shipment and more buyer information. Also, can inform the tracking to users.

**Tags:** Manage shipments,migration,me,me2,full
**Created:** 2020-03-26T02:05:34Z
**Last Updated:** 2026-02-19T20:25:13Z

---

## Ship products

The Mercado Libre's shipping department handles all the information about how a product goes from one seller to user. In this guide, you can learn more about the shipment resource, how to print labels, get shipment details like status shipment and more buyer information about address. Also you can inform the tracking to users.

## Shipment detail

With this resource you will get shipment details like the status shipment and more buyer information about address name (street, numer, zip code, state, country, etc.). Make a request to the GET method to implement it, it is mandatory to use in the header "x-format-new = true":

Note:

The "receiver\_address" field now is equivalent to "destination.shipping\_address" field. The data returned in the "receiver\_phone" field is obfuscated in the responses from this endpoint.

Request:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'x-format-new: true' -X GET https://api.mercadolibre.com/marketplace/shipments/$SHIPMENT_ID
```

Example:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'x-format-new: true' -X GET https://api.mercadolibre.com/marketplace/shipments/40531399184
```

Response:

```javascript
{
   "id": 40531399184,
   "order_id": 2000013668125782,
   "status": "ready_to_ship",
   "substatus": "printed",
   "declared_value": 15.1,
   "currency_id": "USD",
   "date_created": "2021-04-21T18:07:25.000-04:00",
   "last_updated": "2021-04-26T18:24:06.000-04:00",
   "tracking_number": "MMXQP014735497E",
   "tracking_method": "CBT MA",
   "origin": {
       "sender_id": 526127536,
       "shipping_address": {
           "address_id": 1087531691,
           "address_line": "XXXXXXX",
           "street_name": "XXXXXXX",
           "street_number": "XXXXXXX",
           "comment": null,
           "zip_code": "XXXXXXX",
           "city": {
               "id": "TUxNQ0NVQTMwNDU",
               "name": "Cuautitlan Izcalli"
           },
           "state": {
               "id": "MX-MEX",
               "name": "Estado De México"
           },
           "country": {
               "id": "MX",
               "name": "Mexico"
           },
           "neighborhood": {
               "id": null,
               "name": "Cuautitlan Izcalli"
           },
           "municipality": {
               "id": null,
               "name": null
           },
           "agency": {
               "agency_id": null,
               "carrier_id": null,
               "description": null,
               "open_hours": null,
               "phone": null,
               "type": null
           },
           "types": [
               "billing",
               "default_selling_address",
               "shipping"
           ],
           "latitude": 0,
           "longitude": 0,
           "geolocation_type": "APPROXIMATE",
           "geolocation_last_updated": "2020-02-12T13:50:08Z",
           "geolocation_source": "google-maps",
           "delivery_preference": ""
       },
       "type": "selling_address"
   },
   "destination": {
       "type": "buying_address",
       "receiver_id": 650079057,
       "receiver_name": "Mara asas",
       "receiver_phone": "XXXXXXX",
       "comments": "",
       "shipping_address": {
           "address_id": 1132588531,
           "address_line": "lalalalala 12312",
           "street_name": "lalalalala",
           "street_number": "12312",
           "comment": "Referencia: asdasd",
           "zip_code": "01030",
           "city": {
               "id": "TUxNQ0FMVjY3MDg",
               "name": "Alvaro Obregón"
           },
           "state": {
               "id": "MX-DIF",
               "name": "Distrito Federal"
           },
           "country": {
               "id": "MX",
               "name": "Mexico"
           },
           "neighborhood": {
               "id": null,
               "name": "Axotla"
           },
           "municipality": {
               "id": null,
               "name": null
           },
           "agency": {
               "agency_id": null,
               "carrier_id": null,
               "description": null,
               "open_hours": null,
               "phone": null,
               "type": null
           },
           "types": [
               "default_buying_address"
           ],
           "latitude": 19.355034,
           "longitude": -99.174821,
           "geolocation_type": "ROOFTOP",
           "geolocation_last_updated": "2020-09-23T20:17:30Z",
           "geolocation_source": "google-maps",
           "delivery_preference": "business"
       },
       "receiver_identification": {
           "number": "",
           "type": ""
       }
   },
   "dimensions": {
       "height": 3,
       "length": 45,
       "weight": 345,
       "width": 33
   },
   "external_reference": null,
   "lead_time": {
       "option_id": 721103001,
       "shipping_method": {
           "id": 501645,
           "type": "standard",
           "name": "Envío internacional",
           "deliver_to": "address"
       },
       "currency_id": "USD",
       "cost": 0,
       "list_cost": 0,
       "cost_type": "free",
       "service_id": 721,
       "estimated_delivery_time": {
           "type": "known_frame",
           "date": "2021-05-13T00:00:00.000-05:00",
           "unit": "hour",
           "offset": {
               "date": "2021-05-20T00:00:00.000-05:00",
               "shipping": 120
           },
           "time_frame": {
               "from": "",
               "to": ""
           },
           "pay_before": "2021-04-22T00:00:00.000-05:00",
           "shipping": 312,
           "handling": 72,
           "schedule": null
       }
   },
   "source": {
       "site_id": "MLM"
   },
   "logistic": {
       "mode": "me2",
       "type": "drop_off",
       "direction": "forward"
   },
   "tags": [
       "test_shipment"
   ],
   "sender_id": 0
}
```

### Parameters

**shipment\_id**: unique shipment identifier.

### Most important response fields

**mode**: This is a set of shipping methods available. They have different shipping times and costs. Possible values are:

- **me1 (Mercado Envios mode 1)**: This method allows sellers to use their own shipping infrastructure of choice, but provides not tracking integration and requires the sellers to provide the tracking number of each individual shipping.
- **me2 (Mercado Envios mode 2)**: This method provides the seller a prepaid label and tracking number code with a predefined carrier. Seller does not have to worry with choosing a carrier and handling the tracking number. The shipping company chosen by Mercado Libre.

**logistic\_type**: Represents the type of shipment operation.  
If the carrier offers service for more than one operation, this attribute can help you know if you have to collect at a Hub (Fulfillment) or if the shipment will be dispatched at a branch (Drop Off).  
**tracking\_number**: The tracking number allows buyers to know the status of the packages and the estimated delivery time.

**status**:

- **pending**: shipment created
- **handling**: the payment for this shipment was processed
- **ready\_to\_ship**: authorization code from carrier received
- **shipped**: shipment in transit
- **delivered**: shipment delivered
- **not\_delivered**: shipment was not delivered
- **cancelled**: shipment was cancelled

**Additional response fields**:

- **order\_id**: The associated order identifier.
- **dimensions**: Object containing package dimensions (height, length, weight, width).
- **external\_reference**: External reference identifier for the shipment.
- **source.site\_id**: The site where the shipment originated (e.g., MLM, MLB).
- **logistic.mode**: Shipping mode (me1 or me2).
- **logistic.type**: Logistic type (fulfillment, drop\_off, cross\_docking, default).
- **logistic.direction**: Shipment direction (forward or return).
- **tags**: Array of tags associated with the shipment (e.g., test\_shipment).
- **destination.receiver\_identification**: Object containing receiver's identification number and type.
- **destination.shipping\_address.delivery\_preference**: Delivery preference (residential or business).

## Shipment cost

Get the shipment costs to be paid by the user. In addition, view the savings for shipping more than one product in the same box (once this feature is enabled) with the "save" parameter, if applicable.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'x-format-new: true' https://api.mercadolibre.com/marketplace/shipments/$SHIPMENT_ID/costs
```

Response:

```javascript
{
  "gross_amount": 508.14,
  "currency_id": "USD",
  "receiver": {
      "user_id": 12345,
      "cost": 0,
      "compensation": 0,
      "save": 0,
      "discounts": [
          {
              "rate": 1,
              "type": "ratio",
              "promoted_amount": 254.07
          }
      ],
      "cost_details": [],
      "compensations": []
  },
  "senders": [
      {
          "user_id": 456789,
          "cost": 177.85,
          "compensations":[
            {
              "amount":173.27,
              "reason":"incorrect_dimensions",
              "comment":"Incorrect package dimensions"
            }
          ],
          "save": 76.22,
          "discounts": [
              {
                  "rate": 0.3,
                  "type": "mandatory",
                  "promoted_amount": 76.22
              }
          ],
      "compensation": 0
      }
  ]
}
```

### Response fields

**gross\_amount**: total cost of the shipment without any discount.  
**discounts**: represents a list that can be empty if there is no discount, and if not, it can have one or more associated discounts.  
**senders**: is a list adapted to future versions of the Shopping Cart where a single shipment may contain products from different sellers.  
**cost**: final shipping cost that corresponds to each user.  
**amount**: valor de compensación.  
**reason**: razón de compensación.  
**comment**: comentarios adicionales sobre la compensación.  
**currency\_id**: local currency value.

## Item´s shipping cost

Get the shipping cost of the marketplace items with the request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/$USER_ID/shipping_options/cost
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/items/MLM1234567890/shipping_options/cost
```

Response:

```javascript
{
    "shipping_fee": 19.96,
    "currency_id": "USD",
    "site_id": "MLM",
    "billable_weight": {
        "value": 1000,
        "unit": "g"
    },
    "free_shipping": false
}
```

### Response fields

**shipping\_fee**: final shipping cost.  
**billable\_weight**: weight used to calculate shipping cost.  
**free\_shipping**: possible values are true or false depending on whether the item has free shipping.

Note:

\- Remember that to use the ITEM\_ID, it must have been previously created and be active.  
\- Please review business information at [FAQ China](https://global-selling.mercadolibre.com/help/38409?matt_tool=0&matt_word=460c0923-06ff-4423-8971-476e74a8cf7c_1.0.0_COMPONENT-1_CBT_2025-01-02_sendgrid_default&matt_track=email_click) &amp; [FAQ USA](https://global-selling.mercadolibre.com/help/38410?matt_tool=0&matt_word=1a6624da-44e5-45b8-a121-8ad2af8da22a_1.0.0_COMPONENT-1_CBT_2025-01-02_sendgrid_default&matt_track=email_click).

## Shipping methods

**Remote Partnered Carrier**: Mercado Libre generates [the shipping label](https://global-selling.mercadolibre.com/devsite/manage-shipments#Print-Shipping-label) and exposes the tracking id (shipping status "ready\_to\_ship"). After that, seller needs to print label and deliver the package to the Carrier.  
**Remote seller own logistic**: seller needs to generate shipping label and set tracking information through Mercado Libre API.  
Next you can identify the differents logistic types, also known the actions to do by the seller, and consider the steps ahead. The seller have to download the shipping label when the status shipment is "handling".

- **Fulfillment by Mercado Libre (FBM)**: Mercado Libre takes care of shipping the order, there is no action needed from the seller. The shipping status are automatically transitioned by Mercado Libre. There is no action required from the seller.  
  **How to identifier**:  
  "mode": "me2"  
  "logistic\_type": "fulfillment"
- **Remote partnered carrier (i.e: Wish, MailAméricas)**: the shipping status **"ready\_to\_ship"** means the shipping label is generated and able to be downloaded. Then the seller deliver the package to the carrier and finally Mercado Libre update the status (from ready\_to\_ship to shipped). See more information about [Updates on label content for international shipments in Mexico](https://global-selling.mercadolibre.com/help/25080).  
  **How to identifier**:  
  "mode": "me2"  
  "logistic\_type": "drop\_off"  
  "logistic\_type": "cross\_docking" (only for MLM)
- **Remote seller own logistic**: with the shipping status **"handling"**, seller needs to [set tracking information](https://global-selling.mercadolibre.com/devsite/manage-shipments?#Inform-the-tracking) and then the shipment is updated to "shipped" status.  
  **How to identifier**:  
  "mode": "me1"  
  "logistic\_type": "default"

### Errors

HTTP Code Error Message 403 forbidden Invalid caller.id 403 forbidden Can not identify the user 404 not\_found\_shipping\_id Not found shipping with id: $SHIPMENT\_ID 500 internal\_server\_error Oops! Something went wrong... 401 not\_found invalid\_token 400 bad\_request {"message":"Malformed access\_token: TOKEN\_NOT\_VALID","error":"bad\_request","status":400,"cause":\[]} 400 bad\_request Param not valid

## Print shipping label

Important:

Coming soon, providing the IMEI number will be mandatory for cell phone purchases in the Colombian market. Please update your application accordingly with the functionality ["Add product information"](https://global-selling.mercadolibre.com/devsite/en_us/manage-orders-cbt/manage-orders-cbt#Add-product-information). .

A label is a file to use when delivering the product. It was already paid by the buyer when the purchase flow ended. Once the buyer paid for the order, the seller must print the label. In order to obtain a label, the status of the shipments must be ready\_to\_ship. That means the payment was processed and the label is available to the seller. The resource to obtain a tag receives a shipping ID and an access token and returns the tag in PDF format.

Request:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/shipments/$SHIPMENT_ID/labels
```

Example:

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/DevSite/325027046077-label-2.png)

### Errors

HTTP Code Error Message 403 forbidden Invalid caller.id 403 forbidden Can not identify the user 404 not\_found Resource not found 404 Error\_Shipment Mandatory information is missing: IMEI 400 SHPLAB0218 INVALID\_SHIPMENT\_FF\_PUBLIC - Labels cannot be generated for Fulfillment shipments through public API 500 internal\_server\_error Oops! Something went wrong... 401 not\_found invalid\_token 400 bad\_request {"message":"Malformed access\_token: TOKEN\_NOT\_VALID","error":"bad\_request","status":400,"cause":\[]} 400 bad\_request Invalid shipment id 401 not\_found invalid\_token 401 unauthorized\_scopes Unauthorized shipments: 28140669939: Shipment status is 'delivered'

## Inform the tracking

Important:

This API is available only for remote seller with own logistic (custom shipping).

This endpoint allows you to report the tracking of a shipment, which must be entered by parameter. It is important that sellers provide the tracking number so that buyers can know the status of packages and the estimated delivery time. At this stage, we include the tracking number and the order status is updated for dispatch.

Request:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X POST https://api.mercadolibre.com/marketplace/shipments/$SHIPMENT_ID/tracking 
  -d '{
    "tracking_id": "String",
    "tracking_url": "http://carrier.com",
    "carrier": "name carrier"
}'
```

Example:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X POST https://api.mercadolibre.com/marketplace/shipments/28262122315/tracking 
  -d '{
    "tracking_id": "String",
    "tracking_url": "http://carrier.com",
    "carrier": "name carrier"
}'
```

Response:

```javascript
{
    "status": "success"
}
```

### Parameters

**id**: is the number of the shipment to modify.  
**access\_token**:It is the token that must be generated with the provided credentials and the application generated by the seller or the integrator.

**Fields**

**tracking\_id**: tracking number provided by the carrier.  
**tracking\_url**: carrier tracking website.  
**carrier**: carrier name.

### Errors

HTTP Code Error Message 406 not\_acceptable Shipment configuration is not valid - This error occurs when the shipment is not configured for custom tracking (me1/default). Tracking can only be informed for shipments with mode "me1" and logistic\_type "default". 400 bad\_request error when trying to parse request body 404 not\_found\_shipping\_id Not found shipping with id: $SHIPMENT\_ID

## Inform Status

Report status of a shipment on route, when you inform the tracking number.

Request:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X POST https://api.mercadolibre.com/marketplace/shipments/$SHIPMENT_ID/tracking/status
  -d '{
    "tracking_id": "String",
    "status": "String"
}'
```

### Inform Delivered

Report shipment has been delivered to the buyer. A product has been delivered to the buyer, so you must make a change in the status of the shipment to "delivered". This status is final and irreversible.

Example DELIVERED:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X POST https://api.mercadolibre.com/marketplace/shipments/28262122315/tracking/status
  -d '{
    "tracking_id": "TKR123",
    "status": "delivered"
}'
```

Response:

```javascript
{
    "status": "success"
}
```

### Inform Not Delivered

Report shipment has been NOT delivered to the buyer. The status "not\_delivered" is a final and irreversible state. It should only be used when there are no more delivery attempts. To mark the purchase as not delivered, you must report the status as "not\_delivered"

Example NOT\_DELIVERED:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X POST https://api.mercadolibre.com/marketplace/shipments/28262122315/tracking/status
  -d '{
    "tracking_id": "TKR123",
    "status": "not_delivered"
}'
```

Response:

```javascript
{
    "status": "success"
}
```

### Errors

HTTP Code Error Message 406 not\_acceptable Shipment configuration is not valid - This error occurs when the shipment is not configured for custom tracking (me1/default). 403 forbidden Invalid caller.id 403 forbidden Can not identify the user 404 not\_found\_shipping\_id Not found shipping with id 500 internal\_server\_error Oops! Something went wrong... 401 not\_found invalid\_token 400 bad\_request {"message":"Malformed access\_token: TOKEN\_NOT\_VALID","error":"bad\_request","status":400,"cause":\[]} 400 bad\_request Param not valid

## Get shipment items

The /marketplace/shipments/$SHIPMENT\_ID/items resourse returns the items associated to a shipment. If the ítem has variations, like clothing size or colour, you can see which ones correspond to the order within the shipment. As we enable shipments with more than one item, the list will have each of them.

Note:

Each seller only see our products.

Request:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/shipments/$SHIPMENT_ID/items
```

Example:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/shipments/12234123/items
```

Response:

```javascript
[
    {
        "item_id": "MLB14385311",
        "variation_id": null,
        "description": "Test item",
        "quantity": 1,
        "manufacturing_time": null,
        "dimensions": {
            "height": 10,
            "width": 10,
            "length": 10,
            "weight": 318
        },
        "order_id": "123123123",
        "sender_id": 123123123
    }
]
```

## Get lead time

The /marketplace/shipments/$SHIPMENT\_ID/lead\_time returns information related to the delivery times of a shipment and type of service, adding the dispatch and delivery deadlines. Although the shipment base resource already provides information to make these estimates, here you can view it in more detail, which will help to provide a better user experience.

Request:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/shipments/$SHIPMENT_ID/lead_time
```

Example:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/shipments/12234123/lead_time
```

Response:

```javascript
{
  "option_id": 7214410001,
  "shipping_method": {
    "id": 501645,
    "name": "Envío internacional",
    "type": "standard",
    "deliver_to": "address"
  },
  "currency_id": "USD",
  "cost": 4.03,
  "list_cost": 4.03,
  "cost_type": "free",
  "service_id": 731,
  "delivery_type": "estimated",
  "estimated_schedule_limit": {
    "date": null
  },
  "buffering": {
    "date": null
  },
  "estimated_delivery_time": {
    "type": "known_frame",
    "date": "2020-11-06T00:00:00.000-05:00",
    "unit": "hour",
    "offset": {
      "date": "2020-11-23T00:00:00.000-05:00",
      "shipping": 240
    },
    "time_frame": {
      "from": null,
      "to": null
    },
    "pay_before": "2020-09-29T00:00:00.000-05:00",
    "shipping": 624,
    "handling": 48,
    "schedule": null
  },
  "estimated_delivery_limit": {
    "date": "2020-12-09T00:00:00.000-05:00",
  },
  "estimated_delivery_final": {
    "date": "2021-03-19T00:00:00.000-05:00",
  },
  "estimated_delivery_extended": {
    "date": "2020-11-30T00:00:00.000-05:00",
  },
  "delay": [
    "handling_delayed"
  ]
}
```

The cost\_type field can be "free", "charged" or "partially\_free".

### Response fields (estimated times)

**estimated\_delivery\_extended**: second delivery promise, in case the original is not fulfilled.  
**estimated\_delivery\_limit**: deadline for the buyer to cancel the purchase and request a refund, as long as the shipment has not yet arrived.  
**estimated\_delivery\_final**: final date as the deadline for the shipment to arrive and the final status that can be delivered is determined or, in case of a claim, not\_delivered.

## Get status history

The /marketplace/shipments/$SHIPMENT\_ID/history resource return the status and substatus history associated to shipment cycle.

Request:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/shipments/$SHIPMENT_ID/history
```

Example:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/shipments/12234123/history
```

Response:

```javascript
[
  {
    "status": "ready_to_ship",
    "substatus": "printed",
    "date": "2016-12-30T12:32:35.000Z"
  },
  {
    "status": "handling",
    "substatus": "waiting_for_label_generation",
    "date": "2016-12-30T12:32:35.000Z"
  }
]
```

## Get carrier information

The /marketplace/shipments/$SHIPMENT\_ID/carrier return the carrier information like name carrier and the URL.

Request:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/shipments/$SHIPMENT_ID/carrier
```

Example:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/shipments/12234123/carrier
```

Response:

```javascript
{
  "url": "tracking URL",
  "name": "Carrier Name"
}
```

## Create additional shipping packages (Shipment Split)

Important:

This feature is only available for ME2 with drop-off or cross-docking. Not available for Fulfillment (FBM).

If you have a problem when grouping different products in the same package (either because they are in different warehouses, or are fragile, or do not fit in the same box, etc.) you can use the feature that allows you to generate additional packages in order to ship all products.

### Considerations

At the body you have to have all items. At the sumup of all subpacks you need to have all the orders and the amount of items on each of them.

The **shipment** must have an order quantity greater than 2 or if there is only one order, the package must contain more than one item.

The **order\_id** represents the order that contains the product that must be separated from the original package.

The **new shipment** will be created with the order corresponding to the section order\_id and will trigger the corresponding notifications.

The quantity of items in the new packages must be equal to the quantity of items in the original package.

The same shipment can **only be** split into two boxes at a time and it cannot be split multiple times.

### Possible values in the "reason" field

**FRAGILE**: fragile products.  
**ANOTHER\_WAREHOUSE**: another warehouses.  
**IRREGULAR\_SHAPE**: irregular shape.  
**OTHER\_MOTIVE**: other motive.  
**DIMENSIONS\_EXCEEDED**: dimensions exceeded.

Request:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'x-format-new: true' https://api.mercadolibre.com/marketplace/shipments/$SHIPMENT_ID/split
```

```javascript
{
    "reason": "IRREGULAR_SHAPE",
    "packs": [
        {
            "orders": [
                {
                    "id": "2000000000000002",
                    "quantity": 1
                }
            ]
        },
        {
            "orders": [
                {
                    "id": "2000000000000002",
                    "quantity": 1
                }
            ]
        }
    ]
}
```

### Response

The successful response will be just a "200 - OK" with an empty return.

```javascript
{}
```

## How to Identify Split Orders

After the split was requested and generated (with a successful "200 - OK" response), you may want to check split order details.

### 1. Getting a notification of a new split order

Once split is generated, a notification is received ([how to configure notifications](https://global-selling.mercadolibre.com/devsite/receive-notifications)) including **order\_id**. Please make sure you have checked "Marketplace orders" box in Topics, since is needed to receive the notification.

### 2. Consulting order details

In order to obtain the complete order details (including pack\_id), make an API call using GET and **order\_id** received in the notification.

Call:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/orders/$ORDER_ID
```

Request example:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/orders/2000012494387040
```

Response example:

```javascript
{
  "id": 2000012494387040,
  "pack_id": 2000008691345363,
  "order_items": [...],
  "shipping": { "id": 45263494304 },
  ...
}
```

Important:

Keep the "pack\_id" value, will be used in next step.

### 3. Consulting pack details

Once you have the **pack\_id**, use the API to search for pack details.

Call:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/orders/pack/$PACK_ID
```

Request example:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/orders/pack/2000008691345363
```

Response Example (Child Pack - Result of Split):

```javascript
{
  "id": 2000008691345363,
  "status": "to_be_shipped",
  "status_detail": null,
  "family_pack_id": 2000008674781009,
  "orders": [...],
  ...
}
```

Important:

If the family\_pack\_id field is filled, this means this is a split (child) pack, originated from the pack with the family\_pack\_id value.

### 4. Check if the Pack Was Split

If you query the original (parent) pack and check its split status, you will receive following result:

Call:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/orders/pack/$FAMILY_PACK_ID
```

Request Example:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/orders/pack/2000008674781009
```

Response Example (Original/Parent Pack, Split):

```javascript
{
  "id": 2000008674781009,
  "status": "cancelled",
  "status_detail": "splitted",
  "family_pack_id": null,
  "orders": [...],
  ...
}
```

- **"status\_detail": "splitted"** → Indicates this pack was divided into other child packs.
- **"family\_pack\_id": null** → This is the original pack (it is not the child of any other pack).

### 5. How to Identify the Entire Relationship Between Packs in the Split

- If you start from a split (child) pack, the **family\_pack\_id** field points to the parent (original) pack.
- If you start from the original split pack, you'll see its status is **"splitted"**. The new (child) packs must be found by looking for other orders where the **family\_pack\_id** matches the parent pack's id.

### 6. How to Know if the Split Was Executed (Control by shipment\_id)

After requesting the split using the **shipment\_id**, check the related original pack.

If the response of the original pack contains:

- **"status\_detail": "splitted"**
- And the field **"shipment.id"** matches the initial **shipment\_id**

Then, the split was successfully performed for that shipment.

Verification Example:

```javascript
{
  "id": 2000008674781009,
  "status": "cancelled",
  "status_detail": "splitted",
  "shipment": { "id": 45255234865 }
  ...
}
```

If the **shipment.id** matches the original shipment and the status is **splitted**, the split was done.

Note:

Though /shipments API is used, splitting an order affects /orders API.

### Errors

When managing a split, you may encounter the following errors. It is crucial that you understand the cause of each and know how to correct them, in order to efficiently handle the situation. Here is the information you need to identify and resolve these issues.

**Body is invalid:**

```javascript
{
    "message": "Invalid body",
    "error": "bad_request",
    "status": 400,
    "cause": []
}
```

**The shipment does not belong to the seller that requests the split:**

```javascript
{
    "message": "The shipment 4397100000 does not belong to merchant: 1350000000",
    "error": "forbidden",
    "status": 403,
    "cause": []
}
```

**Total items quantity does not match with original shipment:**

```javascript
{
    "message": "Order quantity mismatch. The total items quantity in the new packs should match the original shipment total quantity.",
    "error": "SPLIT_ERROR_400",
    "status": 400,
    "cause": null
}
```

**Body has invalid reason data:**

```javascript
{
    "message": "Invalid body",
    "error": "bad_request",
    "status": 400,
    "cause": [
        "/reason: value must be one of \"FRAGILE\", \"ANOTHER_WAREHOUSE\", \"IRREGULAR_SHAPE\", \"DIMENSIONS_EXCEEDED\", \"OTHER_MOTIVE\""
    ]
}
```

**Invalid shipment id:**

```javascript
{
    "message": "Invalid shipment id",
    "error": "bad_request",
    "status": 400,
    "cause": [
        "shipment not found"
    ]
}
```

**Shipment already shipped:**

```javascript
{
    "message": "Shipment can't be splitted at this point. Invalid status.",
    "error": "SPLIT_ERROR_422",
    "status": 422,
    "cause": null
}
```

**Package into more than two new packages:**

```javascript
{
    "message": "Invalid body",
    "error": "bad_request",
    "status": 400,
    "cause": [
        "/packs: you must specify exactly 2 packs"
    ]
}
```

**Shipment cannot be split:**

```javascript
{
    "message": "The shipment $SHIPMENT_ID cannot be split",
    "error": "bad_request",
    "status": 400,
    "cause": []
}
```

## Working Days Management

The Working Days API allows sellers to manage which holiday dates they will work or not work. This helps optimize shipping scheduling by indicating seller availability during holiday periods.

**Key concepts:**

- Sellers can only modify the `checked` status (work/don't work) for holiday dates.
- There's a 4-day advance window to make changes.
- Dates and descriptions are read-only (provided by the system).
- Once a date is closed, it cannot be modified.

## Get Working Days

Retrieves all holiday dates with their current work status for a specific seller.

**Request:**

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' \
-H 'Accept: application/json' \
-X GET https://api.mercadolibre.com/marketplace/sellers/$SELLER_ID/working_days
```

**Response:**

```javascript
{
  "dates": [
    {
      "closed": false,
      "finalized": true,
      "enabled": true,
      "checked": true,
      "description": "Rosh Hashanah",
      "date": "2025-09-23"
    },
    {
      "closed": false,
      "finalized": true,
      "enabled": true,
      "checked": false,
      "description": "Yom Kippur",
      "date": "2025-10-01"
    }
  ]
}
```

## Update Working Days

Updates the work status for holiday dates. Only the `checked` field can be modified.

**Request:**

```javascript
curl -X PUT \
-H 'Authorization: Bearer $ACCESS_TOKEN' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
'https://api.mercadolibre.com/marketplace/sellers/{$SELLER_ID}/working_days' \
-d '{
  "site_id": "MX",
  "dates": [
    {
      "date": "2025-09-23",
      "description": "Rosh Hashanah",
      "checked": true
    },
    {
      "date": "2025-10-01",
      "description": "Yom Kippur",
      "checked": false
    }
  ]
}'
```

**Response:**

```javascript
{
  "message": "all working days were saved"
}
```

## Field Descriptions

Field Type Description `site_id` string Site identifier (required for updates) `date` string Holiday date in `YYYY-MM-DD` format (read-only) `description` string Holiday name/description (read-only) `checked` boolean Whether seller will work on this date (modifiable) `closed` boolean Whether the date can still be modified (read-only) `finalized` boolean Internal status flag (read-only) `enabled` boolean Whether the date is active (read-only)

## Business Rules

- **4-day advance rule:** Changes must be made at least 4 days before the holiday date.
- **Closed dates:** When `closed` is `true`, the `checked` status cannot be modified.
- **Read-only fields:** Only `checked` can be updated; `date` and `description` come from the system.
- **Site requirement:** `site_id` must be provided in `PUT` requests.

## Errores

HTTP Code Error Message 400 `bad_request` `seller_id` must be a valid integer 400 `bad_request` `site_id` cannot be empty 400 `bad_request` at least one date must be provided 400 `bad_request` `date` at index X cannot be empty 400 `bad_request` `description` at index X cannot be empty 400 `unauthorized` fail to check user identity 403 `forbidden` access denied: seller does not belong to authenticated merchant

**Next**: [Compensations](https://global-selling.mercadolibre.com/devsite/compensations).