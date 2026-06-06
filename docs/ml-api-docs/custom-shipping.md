# Custom shipping

**Tags:** Custom,shipping
**Created:** 2018-06-27T12:01:32Z
**Last Updated:** 2022-12-28T09:45:33Z

---

## Custom shipping

When a buyer chooses shipping preferences and gives his shipping address a shipment is created and associated to the order. A new order feed will be received when the shipment is created and later, if the tracking is informed, each time the package changes its status until it’s delivered.

## Get shipment details

You can find some basic information about the shipments on the order, but is better if you work with the shipments resource to get all the details. To do this you need to know the shipment\_id.

### I don’t know the shipment\_id

You can get it from the order, within the basic shipment information.

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/$ORDER_ID
```

Response:

```javascript
{
  "id": 123456789,
  "status": "paid",
  "status_detail": null,
  "date_created": "2012-12-18T09:35:07.000-04:00",
  "date_closed": "2012-12-18T09:35:07.000-04:00",
  "order_items":  [
  {
    "item":  {
      "id": "MLB446311775",
      "title": "Capa Couro Flip Original Samsung Galaxy S3 Siii  Branca",
      "variation_id": null,
      "variation_attributes": [
      ],
    },
    "quantity": 1,
    "unit_price": 99.98,
    "currency_id": "BRL",
  },
  ],
  "total_amount": 99.98,
  "currency_id": "BRL",
  "buyer":  {
  "id": "123456565",
  "nickname": "BUYER NICKNAME",
  "email": "email@buyer.com",
  "phone":  {
    "area_code": "11",
    "number": "55565656",
    "extension": null,
  },
  "first_name": "Name",
  "last_name": "Last Name",
  "billing_info": - {
    "doc_type": "CPF",
    "doc_number": "123456789",
  },
  },
  "seller":  {
  "id": "123456",
  "nickname": "SELLER NICKNAME",
  "email": "email@seller.com",
  "phone": - {
    "area_code": null,
    "number": "011 4444 1234",
    "extension": null,
  },
  "first_name": "Name.",
  "last_name": "Last Name LTDA.",
  },
  "payments":  [
  - {
    "id": "459656119",
    "transaction_amount": 99.98,
    "currency_id": "BRL",
    "status": "approved",
    "date_created": null,
    "date_last_modified": null,
  },
  ],
  "feedback":  {
  "purchase": null,
  "sale": null,
  },
  "shipping":  {
  "id": 20176304039,
  "status": "pending",
  "date_created": "2012-12-18T09:37:35.000-04:00",
  "receiver_address":  {
    "id": 123456789,
    "address_line": "Rua Júlio Sérgio de Castro 262 0  ",
    "zip_code": "223232",
    "city": - {
      "id": "BR-SP-44",
      "name": "São Paulo",
    },
    "state":  {
      "id": "BR-SP",
      "name": "São Paulo",
    },
    "country": - {
      "id": "BR",
      "name": "Brasil",
    },
    "latitude": null,
    "longitude": null,
    "comment": null,
  },
  "currency_id": "BRL",
  "cost": 5.9,
  },
  "tags":  [
  "paid",
  "not_delivered",
  ],
}
```

To get the complete details of a shipment (status detail, date created, shipping options such as shipping speed and more) just make a mixed call between orders and shipments like this: Call:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/$ORDER_ID/shipments
```

### I already know the shipment\_id

If you have the id already just call the shipments resources:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/shipments/$SHIPMENT_ID
```

Example:

```javascript
{
  "id": 12345678,
  "status": "active",
  "status_history":  {
  "date_shipped": null,
  "date_delivered": null,
  },
  "date_created": "2011-09-07T13:29:42.000-04:00",
  "last_updated": "2011-09-07T13:30:29.000-04:00",
  "tracking_number": null,
  "tracking_method_id":182,
  "tracking_method": null,
  "sender_id": "99580221",
  "receiver_id": "8408542",
  "sender_address":  {
  "id": "53742741",
  "address_line": "Rua X",
  "comment": null,
  "zip_code": "01154020",
  "city":  {
    "id": "null",
    "name": "Sao Paulo",
  },
  "state":  {
    "id": "BR-SP",
    "name": "Sao Paulo",
  },
    "country":  {
    "id": "BR",
    "name": "Brasil",
  },
  "types":  [
      "default_selling_address",
  ],
  "latitude": null,
  "longitude": null,
  },
  "receiver_address":  {
  "id": "12181995",
  "address_line": "Estrada Geral Cachoeira de Fátima 77777",
  "comment": null,
  "zip_code": "88990000",
  "city":  {
    "id": "null",
    "name": "Praia Grande",
  },
  "state":  {
    "id": "BR-SC",
    "name": "Santa Catarina",
  },
  "country":  {
    "id": "BR",
    "name": "Brasil",
  },
  "types":  [
    "default_buying_address",
  ],
  "latitude": null,
  "longitude": null,
  },
  "shipping_items":  [
  {
    "id": "MLB402220356",
    "description": "Celular Apple Iphone 4 16gb Libre De Fábrica ",
    "quantity": 49,
    "dimensions": “15x15x25,500”,
  },
  ],
  "shipping_option":  {
  "id": 18309457,
  "name": "Express",
  "currency_id": "BRL",
  "cost": 1,
  "speed":{
    "shipping": 48,
    "handling": 24
  },
  "comments": "other info shipping",
  }
```

## Offering custom shipping on your products

All you’ll have to do is make a POST with the JSON to the Item’s API. The JSON must include the ‘costs’ for the custom shipping mode with the parameters **description** and **cost** specified.

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -d
JSON
{
  "title": "Anteojos Ray Ban Wayfare",
  "category_id": "MLA3636",
  "price": 10,
  "currency_id": "ARS",
  "available_quantity": 1,
  "buying_mode": "buy_it_now",
  "listing_type_id": "bronze",
  "condition": "new",
  "description": "Item:,  Ray-Ban WAYFARER Gloss Black RB2140 901  Model: RB2140. Size: 50mm. Name: WAYFARER. Color: Gloss Black. Includes Ray-Ban Carrying Case and Cleaning Cloth. New in Box",
  "video_id": "YOUTUBE_ID_HERE",
  "warranty": "12 months by Ray Ban",
  "pictures": [
      {
          "source": "http://upload.wikimedia.org/wikipedia/commons/f/fd/Ray_Ban_Original_Wayfarer.jpg"
      }
  ],
  "shipping": {
      "mode": "custom",
      "local_pick_up": false,
      "free_shipping": false,
      "methods": [],
      "costs": [
          {
              "description": "TEST1",
              "cost": "70"
          },
          {
              "description": "TEST2 ",
              "cost": "80"
          }
      ]
  }
}
https://api.mercadolibre.com/items
```

Once created a item wiht custom shipping and configured shipping cost table will be see in shipping options.

Call:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/$ITEM_ID/shipping_options/?zip_code=XXX
```

Note:

For countries where Mercado Envios is active only is possible offer free\_shipping custom in categories that do not accept ME.

## Adding custom shipping on a listing

You can also add **custom shipping** mode on an item with **not\_specified** shipping method. It’s very simple. Make a **PUT** to the Item’s API including the **Item\_ID** and send a JSON similar to the one below.

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -H "Accept: application/json" -d
JSON
{
"shipping": {
  "mode": "custom",
  "methods": [],
  "costs": [
      {
          "description": "TEST1",
          "cost": "70"
      },
      {
          "description": "TEST2 ",
          "cost": "80"
      }
  ]
}
}

https://api.mercadolibre.com/items/{item_id}
```

This mode also accepts a tracking\_number, but the code wont be monitored by us.

## Add tracking number

Before including the tracking number you need to know the shipment\_id. You can find it by making a call to orders resource like this: Call:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -H "Accept: application/json" -d‘{
  "tracking_number": "TR1234567891",
  "status": "shipped"
}’ https://api.mercadolibre.com/shipments/:shipment_id
```

## Considerations

- Official Stores and Mercado Líderes of MercadoLibre México can’t add custom shipping on their items with higher cost $549. [More information](../../en_us/nueva-opcion-de-free-shipping-para-mlm).
- [This guide will give you more information of available shipping modes under specific parameters](../../en_us/ship-products).
- To learn how to publish with free shipping custom check [this tutorial](../../en_us/free-shipping).

## Product delivery (only available for Mexico, Brasil, Argentina, Chile and Colombia)

With the following resource, you can inform buyers of their product delivery status when using Mercado Envío. Begin to use it under the following scenarios:

### Scenario 1

When the order has a Custom Shipping created and the status is “pending”:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -H "Accept: application/json" -d 
JSON
{
    "speed": 120,
    "status": "shipped",
    "tracking_number": 000000001234,
    "receiver_id": 12345678
}
https://api.mercadolibre.com/shipments/{shipping_id}
```

Notes:

\- The speed field represents the hours it will take for the product to be delivered.  
\- The promised delivery date will be the number of hours indicated in the “speed” field, as from the day this value is set.  
\- The tracking\_number field is mandatory for the API, but no for any sale list and/or description.

### Scenario 2

When the order has a Custom Shipping created and the status is “shipped”:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -H "Accept: application/json" -d 
JSON
{
    "speed": 120,
    "receiver_id": 12345678
}
https://api.mercadolibre.com/shipments/{shipping_id}
```

Note:

In this case, only the delivery promise is updated, so no tracking\_number is required by the API.

### Scenario 3

In case it is necessary to inform that it was already delivered:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -H "Accept: application/json" -d 
JSON
{
  "fulfilled": true,
  "rating": positive
}
https://api.mercadolibre.com/orders/{orderId}/feedback
```

### Scenario 4

When it is necessary to cancel a sale:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -H "Accept: application/json" -d 
JSON
{
  "fulfilled": false,
  "rating": neutral
}
https://api.mercadolibre.com/orders/{orderId}/feedback
```

Note:

When canceling the sale through the feedback, the buyer will receive his/her payment back.