# Items & Searches

**Tags:** Items,&,Searches
**Created:** 2018-06-27T12:01:32Z
**Last Updated:** 2025-04-04T08:11:11Z

---

## Items &amp; search

## Summary of available resources

Resource Description Replace by /sites/$SITE\_ID/search?nickname=$NICKNAME Get items from the listings by nickname. There isn\`t replacement /sites/$SITE\_ID/search?seller\_id=$SELLER\_ID Can list items by seller. https://api.mercadolibre.com/users/{User\_id}/items/search /sites/$SITE\_ID/search?seller\_id=$SELLER\_ID&amp;category=$CATEGORY\_ID Get items from listings by seller in a specific category https://api.mercadolibre.com/users/{User\_id}/items/search /users/$USER\_ID/items/search Can list all a seller account´s items. Remains the same /items?ids=$ITEM\_ID1,$ITEM\_ID2 Multiget with multiple numbers of items. Remains the same /users?ids=$USER\_ID1,$USER\_ID2 Multiget with multiple numbers of users. Our recomendation it using the individual access token /items?ids=$ITEM\_ID1,$ITEM\_ID2&amp;attributes=$ATTRIBUTE1,$ATTRIBUTE2,$ATTRIBUTE3 Multiget with multiple numbers of items selecting only the fields of interest. Remains the same /users/$USER\_ID/items/search?search\_type=scan Allows to get more than 1000 items corresponding to a user. Remains the same

## Value in available\_quantity fields

In the public resources of Items and Searches, the information of the "available\_quantity" fields will be referential with the following values:

### available\_quantity

Real data Reference RANGO\_1\_50 1 RANGO\_51\_100 50 RANGO\_101\_150 100 RANGO\_151\_200 150 RANGO\_201\_250 200 RANGO\_251\_500 250 RANGO\_501\_5000 500 RANGO\_5001\_50000 5000 RANGO\_50001\_99999 50000

## Search items by seller

Depending on the type of resource you use, you will obtain the following data:  
Public resource: **/sites/{site\_id}/search?** You can get the results of active items directly from the Mercado Libre listings. Private resource: **/users/{user\_id}/items/search** You can obtain a list of the items published by a specific seller from your account.

### Get items from the listings by seller

This search conforms to the rules of the platform listings. The results will always be of active items.

### By seller ID

If you already know the seller's ID, just do the following:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/sites/$SITE_ID/search?seller_id=$SELLER_ID
```

### By nickname

When you do not know the seller\_id of a user but the nickname, you can try the following search:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/sites/$SITE_ID/search?nickname=$NICKNAME
```

You can also apply different filters and systems.

Into **/sites/{site\_id}/search?** are "available\_sorts" and "available\_filters" fields when you add a parameter.

**How filter?** For example, to filter items with free shipping, you will find the "shipping" ID available among the "available\_filters" and within it the value with "free" ID.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/sites/$SITE_ID/search?seller_id=$SELLER_ID&shipping_cost=free
```

**How order?** In this case, you must add “sort” with the available ID of the order you want to apply, for example: “price\_asc”.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/sites/$SITE_ID/search?seller_id=$SELLER_ID&sort=price_asc
```

**Note**: By default the search in the listings already comes with a defined order of relevance.

### By seller ID to a specific category

Using the following example you can search within a specific category.  
With the next call you can check the publications of specific categories.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/sites/$SITE_ID/search?seller_id=$SELLER_ID&category=$CATEGORY_ID
```

## Items with loss of exposure

Important:

Currently, this functionality is available in Mexico and Chile, and as of December 21, 2020 it will be available in Brazil.

With the following filter, you will be able to recognize those items that are losing or could lose exposure due to claims or cancellations. You can use:  
**unhealthy**: to identify items that are already losing exposure.  
**warning**: for those who could lose it and that it is still possible to recover.  
**healthy**: for items that were not impacted.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/$SELLER_ID/items/search?reputation_health_gauge=unhealthy
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/123456789/items/search?reputation_health_gauge=unhealthy
```

Response:

```javascript
{
   "seller_id":"123456789",
   "query":null,
   "paging":{
      "limit":50,
      "offset":0,
      "total":1
   },
   "results":[
      "MLA844702264"
   ],
   "orders":[
      {
         "id":"stop_time_asc",
         "name":"Order by stop time ascending"
      }
   ],
   "available_orders":[
      {
         "id":"stop_time_asc",
         "name":"Order by stop time ascending"
      },
      {
         "id":"stop_time_desc",
         "name":"Order by stop time descending"
      },
      {
         "id":"start_time_asc",
         "name":"Order by start time ascending"
      },
      {
         "id":"start_time_desc",
         "name":"Order by start time descending"
      },
      {
         "id":"available_quantity_asc",
         "name":"Order by available quantity ascending"
      },
      {
         "id":"available_quantity_desc",
         "name":"Order by available quantity descending"
      },
      {
         "id":"price_asc",
         "name":"Order by price ascending"
      },
      {
         "id":"price_desc",
         "name":"Order by price descending"
      },
      {
         "id":"last_updated_desc",
         "name":"Order by lastUpdated descending"
      },
      {
         "id":"last_updated_asc",
         "name":"Order by last updated ascending"
      },
      {
         "id":{
            "id":"inventory_id_asc",
            "field":"inventory_id",
            "missing":"_last",
            "order":"asc"
         },
         "name":"Order by inventory id ascending"
      }
   ]
}
```

## Get items from a seller account

We no longer display the block corresponding to the **filters** and **available\_filters** fields to improve response times. If you require this information, send the parameter **include\_filters=true** in the search.

### By user\_id

If you already know the user\_id, just do the following:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/$USER_ID/items/search
```

### By SKU

- Seller\_custom\_field: if the item contains a SKU in the “seller\_custom\_field” field, you can try as follows:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/$USER_ID/items/search?sku=$SELLER_CUSTOM_FIELD
 
```

- Seller\_sku: If the item contains a SKU in the “SELLER\_SKU” field /attribute, you can try like this:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/$USER_ID/items/search?seller_sku=$SELLER_SKU
```

### By status

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/$USER_ID/items/search?status=active
```

### With/without product identifier

Using the parameters:  
\- **missing\_product\_identifiers=true** get items that not have a Product Identifier loaded or submitting. Thus, you identify which listings you can improve by complying with one of the [most important quality requirements](/en_us/listings-quality).  
\- **missing\_product\_identifiers=false** you get the list of listings with PIs uploaded or sending.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/$USER_ID/items/search?missing_product_identifiers=true
```

## Filter and sort the results of the seller's items

Inside the resource /users/{user\_id}/items/search? there are the "available\_orders" and "available\_filters" fields.

**How order?** In this case, you must add “orders” with the available ID of the order you want to apply, for example: “start\_time\_desc”.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/$USER_ID/items/search?orders=start_time_desc
```

**Note**: By default it already comes with a stop\_time\_asc order applied.  
**How filter?** For example, to filter items with listing\_type "gold\_pro" you will find the "listing\_type\_id" available among the "available\_filters" and within it the value with "gold\_pro" ID.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/$USER_ID/items/search?listing_type_id=gold_pro
```

Note:

The use of our item search resource from a seller does not replace the use of item notifications. This is always to have the most consistent and up-to-date integration about the publication data of the vendors that work with your application.

## Multiget

Use the Multiget function to improve the interaction with the resources of items and users, and thus be able to access with a single call to a maximum of 20 results. Keep in mind that the response using multiget will be returned in verb format, which means that in addition to the json with the information, we will respond with a code that will indicate if the query was successful or not for each of the searches.

Request to /items:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items?ids=$ITEM_ID1,$ITEM_ID2
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items?ids=MLA599260060,MLA594239600
```

Response:

```javascript
[
     {
      "code": 200,
      "body": {

                "id": "MLA599260060",
                "site_id": "MLA",
                "title": "Item De Test - Por Favor No Ofertar",
                "subtitle": null,
                "seller_id": 303888594,
                "category_id": "MLA401685",
                "official_store_id": null,
                "price": 130,
                "base_price": 130,
                "original_price": null,
                "currency_id": "ARS",
                "initial_quantity": 1,
                "available_quantity": 1,
                "sale_terms": [],
                [...]
                "automatic_relist": false,
                "date_created": "2018-02-26T18:15:05.000Z",
                "last_updated": "2018-03-29T04:14:39.000Z",
                "health": null
              }
    },
    {
          "code": 200,
           "body": {

                "id": "MLA594239600",
                "site_id": "MLA",
                "title": "Item De Test - Por Favor No Ofertar",
                "subtitle": null,
                "seller_id": 303888594,
                "category_id": "MLA401685",
                "official_store_id": null,
                "price": 120,
                "base_price": 120,
                "original_price": null,
                "currency_id": "ARS",
                "initial_quantity": 1,
                "available_quantity": 1,
                "sale_terms": [],
                [...]
                "automatic_relist": false,
                "date_created": "2018-02-26T18:15:05.000Z",
                "last_updated": "2018-03-29T04:14:39.000Z",
                "health": null
              }
    }
]
```

Request to /users:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users?ids=$USER_ID1,$USER_ID2
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users?ids=401114259,287440999
```

Response:

```javascript
[
  {
    "code": 200,
    "body": {

      "id": 401114259,
      "nickname": "user_test234",
      "registration_date": "2019-02-05T10:38:03.000-04:00",
      "country_id": "BR",
      "address": {
        "city": null,
        "state": null
      },
      "user_type": "normal",
      "tags": [
        "normal"
      ],
      "logo": null,
      "points": 0,
      "site_id": "MLB",
      "permalink": "http://perfil.mercadolivre.com.br/user_test234",
      "seller_reputation": {
        "level_id": null,
        "power_seller_status": null,
        "transactions": {
          "canceled": 0,
          "completed": 0,
          "period": "historic",
          "ratings": {
            "negative": 0,
            "neutral": 0,
            "positive": 0
          },
          "total": 0
        }
      },
      "buyer_reputation": {
        "tags": [
        ]
      },
      "status": {
        "site_status": "guest"
      }
    }
  },
  {
    "code": 200,
    "body": {
      "id": 287440999,
      "nickname": "user_test111",
      "registration_date": "2019-03-06T00:16:08.000-04:00",
      "country_id": "MX",
      "address": {
        "city": null,
        "state": null
      },
      "user_type": "normal",
      "tags": [
        "normal"
      ],
      "logo": null,
      "points": 0,
      "site_id": "MLM",
      "permalink": "http://perfil.mercadolibre.com.mx/user_test111",
      "seller_reputation": {
        "level_id": null,
        "power_seller_status": null,
        "transactions": {
          "canceled": 0,
          "completed": 0,
          "period": "historic",
          "ratings": {
            "negative": 0,
            "neutral": 0,
            "positive": 0
          },
          "total": 0
        }
      },
      "buyer_reputation": {
        "tags": [
        ]
      },
      "status": {
        "site_status": "active"
      }
    }
  }
]
```

## Fields selection

Another alternative that you can implement in the GET to items is the selection of fields to receive only those that are necessary.

In order to define the fields you want to receive, you must add the attributes parameter as shown in the example. Learn more about how to work with Attributes in the [documentation](https://developers.mercadolibre.com.ar/en_us/attributes).

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items?ids=$ITEM_ID1,$ITEM_ID2&attributes=$ATTRIBUTE1,$ATTRIBUTE2,$ATTRIBUTE3
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items?ids=MLA599260060,MLA594239600&attributes=id,price,category_id,title
```

Response:

```javascript
[
     {
          "code": 200,
           "body": {

    "id": "MLA599260060",
    "title": "Item De Test - Por Favor No Ofertar",
    "category_id": "MLA401685",
    "price": 130
              }
        }

 {
          "code": 200,
           "body": {

    "id": "MLA594239600",
    "title": "Item De Test - Por Favor No Ofertar",
    "category_id": "MLA401685",
    "official_store_id": null,
    "price": 120,
              }
        }

]
```

## Search above 1000 records

To search more than 1000 records of Items, Questions and Answers in the same way **users/$USER\_ID/items/search** or **/questions/search** you should:

1. Send the parameter **search\_type=scan** to the query and release the offset. For example:
   
   To consult more than 1000 items:
   
   ```javascript
   curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/$USER_ID/items/search?search_type=scan
   ```
   
   To consult more than 1000 questions about an item:
   
   ```javascript
   curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/questions/search?search_type=scan&item=$ITEM_ID
   ```
2. In the result you will get a scroll\_id field that expires in 5 minutes:
   
   ```javascript
   "scroll_id": "YXBpY29yZS1pdGVtcw==:ZHMtYXBpY29yZS1pdGVtcy0wMQ==:DXF1ZXJ5QW5kRmV0Y2gBAAAAABIu7AgWMXl6anF3SU5SMVNaQXFxTkZubHBqQQ=="
   ```
3. To obtain scroll\_id results, you must update the parameter with each call. Use the same scroll\_id for all request:
   
   ```javascript
   curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/$USER_ID/items/search?search_type=scan&scroll_id=YXBpY29yZS1pdGVtcw==:ZHMtYXBpY29yZS1pdGVtcy0wMQ==:DXF1ZXJ5QW5kRmV0Y2gBAAAAABIu7AgWMXl6anF3SU5SMVNaQXFxTkZubHBqQQ==
   ```
   
   This way, you will get results from 1,000.
4. To continue obtaining the next pages of results, simply do the same GET to the request until you reach the end of the list. When you reach the end you will receive null.

Note:

If you do not use the limit parameter, 50 items of the total will be returned by default. You can add a maximum limit of 100.