# Fulfillment

**Tags:** Full,Fulfillment
**Created:** 2022-09-01T11:05:20Z
**Last Updated:** 2026-02-19T11:19:55Z

---

# Mercado Envíos Full (fulfillment)

With this method, the seller's products are in our warehouses, and all logistics are handled by Mercado Libre. The shipment of the products to Mercado Libre's warehouses is done by the seller through the Seller Center (front), as well as the change of the logistics of a publication for fulfillment (inbounding). Through the APIs you can only consult the [fulfillment stock](https://developers.mercadolibre.com.ar/en_us/fulfillment-stock) and operations performed.

## Invoicing

[Mercado Libre's invoicing is available in MLB and MLC](https://developers.mercadolivre.com.br/pt_br/obtendo-nota-fiscal), and for this logistics the issuance of the invoicing is automatic with our invoicing tool. You can obtain the invoices issued by Mercado Libre's invoicing system via API.

## Fulfillment stock

Important:

This resource is available in Argentina, Brazil, Mexico, Chile and Colombia where there is fulfillment.

Now you can check the current stock of the items managed by fulfillment, as well as the operations and movements that modify it.

## Get the inventory\_id

To query the stock and the operations of the item in fulfillment, you must first get the inventory\_id which is the code that identifies the item when it is in fulfillment. For this, consult the inventory\_id through the /items resource.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/$ITEM_ID
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLB1557246024
```

Response:

```javascript
{
  "id": "MLB1557246024",
  "site_id": "MLB",
  "title": "Kit Capa Chuva Test 228",
  "subtitle": null,
  "seller_id": 384324657,
  "category_id": "MLB22675",
  "official_store_id": null,
  "price": 87,
  "base_price": 87,
  "original_price": null,
  "inventory_id": "LCQI05831",
  "currency_id": "BRL",
  "initial_quantity": 50,
  "available_quantity": 50,
  "sold_quantity": 0,
  "sale_terms": []
}
```

Note:

When the item has variations, it will have an id of inventory\_id per variation.

## Check the seller's stock

Also, you can check the total stock of a seller in all Fulfillment warehouses and know the status of the unavailable parts.

Note:

Remember that we only have the information corresponding to the last 12 months, considering the current day of the consultation.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/inventories/$INVENTORY_ID/stock/fulfillment
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/inventories/LCQI05831/stock/fulfillment
```

Response:

```javascript
{
    "inventory_id": "LCQI05831",
    "total": 20,
    "available_quantity": 5,
    "not_available_quantity": 15,
    "not_available_detail":[
        {
            "status": "damage",
            "quantity": 2
        },
        {
            "status": "lost",
            "quantity": 1
        },
        {
            "status": "noFiscalCoverage"
            "quantity": 5
        },
        {
            "status": "withdrawal",
            "quantity": 5
        },
        {
            "status": "internal_process",
            "quantity": 1
        },
        {
            "status": "transfer",
            "quantity": 1
        }
    ],
    "external_references": [
        {
        "type": "item",
        "id": "MLB1557246024",
        "variation_id": 4742223403
      }
   ]
}
```

### Response fields

**total**: is the sum of the available\_quantity and not\_available\_quantity fields.  
**available\_quantity**: quantity of items available for sale.  
**not\_available\_quantity**: total items that are not available for sale.  
**not\_available\_detail**: detail of the status of the items that are not available.

- **damaged**: total of damaged items (includes damaged seller, meli and carrier).
- **lost**: total items that were lost and not found.
- **withdrawal**: total items reserved for pick up.
- **internal\_process**: total of items reserved by quality processes of the warehouse.
- **transfer**: total reserved to be transferred deposit.
- **noFiscalCoverage**: total items that are not for sale because they do not have tax coverage.
- **not\_supported**: all items entered are unidentifiable or unprocessable.

**external\_references**: information on the relationship of the seller product with the marketplace publication, and an identification of the type.  
**type**: type of relationship between publication and stored stock.  
**id**: identifier of the item related to the seller product.  
**variation\_id**: identifier of the variation associated with the seller product.

### Errors

Response with error:

```javascript
{
    "status": 403,
    "error": "forbidden",
    "message": "User 281349747 cannot access to seller_product ESZJ28231",
    "cause": []
}
```

### Possible errors

Status Mensaje Error Descripción 404 Seller product not found with id: ESZJ28232 seller\_product\_not\_found The requested seller product cannot be found 400 The field seller\_product\_id has an invalid value validation\_error Invalid parameter 403 The caller is not authorized to access this resource forbidden The caller is not authorized to access the resource 401 No autorizado unauthorized The caller is not authenticated on the platform 429 Too many request too\_many\_request The user has exceeded the number of requests allowed per minute 500 Internal server error internal\_error Internal error to get the information

## Receive notifications of fulfillment stock

[Set up your app with notifications from Mercado Livre](https://developers.mercadolibre.com.ar/en_us/products-receive-notifications#Subscribe-to-notifications) and you can choose the fbm stock operations option to subscribe to fulfillment stock.

## Consult operations

You can then get the list of stock operations for a particular seller\_product\_id.

### Parameters

**seller\_product\_id**: comma separated list of identifiers.  
**seller\_id**: seller identifier.  
**date\_from**: search start date. If you don't define it in the GET, by default it is 15 days.  
**date\_to**: search end date. If you don't define it in the GET, by default it is the current date.  
**type**: type of operation (inbound\_reception, sale\_confirmation, others).  
**external\_references**

- **external\_references.shipment\_id**: identifier of the shipment to the buyer.

**limit**: number of records to return per “page” of results.  
**sort**: field identifier and search order.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/stock/fulfillment/operations/search?seller_id=$SELLER_ID&inventory_id=$INVENTORY_ID&date_from=$aaammdd&date_to=$aaammdd
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/stock/fulfillment/operations/search?seller_id=384324657&inventory_id=DEHW09303&date_from=2020-06-01&date_to=2020-06-30
```

Example with filters:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/stock/fulfillment/operations/search?seller_id=384741716&inventory_id=NFWV18668&caller.id=384741716&date_from=2020-06-29&date_to=2020-07-28&type=SALE_CONFIRMATION&external_references.shipment_id=1111
```

Response:

```javascript
{
    "paging": {
        "total": 4,
        "scroll": ""
    },
    "results": [
        {
            "id": 306811273,
            "seller_id": 384324657,
            "inventory_id": "DEHW09303",
            "date_created": "2020-06-18T18:43:26Z",
            "type": "STOCK_AUDIT",
            "detail": {
                "available_quantity": -5,
                "not_available_quantity": 5,
                "not_available_detail": [
                    {
                        "status": "lost",
                        "quantity": 5
                    }
                ]
            },
            "result": {
                "total": 100,
                "available_quantity": 95,
                "not_available_quantity": 5,
                "not_available_detail": [
                    {
                        "status": "lost",
                        "quantity": 5
                    }
                ]
            },
            "external_references": []
        },
        {
            "id": 306745917,
            "seller_id": 384324657,
            "seller_product_id": "DEHW09303",
            "date_created": "2020-06-18T18:15:13Z",
            "type": "SALE_CANCELATION",
            "detail": {
                "available_quantity": 10,
                "not_available_detail": []
            },
            "result": {
                "total": 100,
                "available_quantity": 100,
                "not_available_quantity": 0,
                "not_available_detail": []
            },
            "external_references": [
                {
                    "type": "shipment_id",
                    "value": "28312959315"
                }
            ]
        },
        {
            "id": 306718974,
            "seller_id": 384324657,
            "seller_product_id": "DEHW09303",
            "date_created": "2020-06-18T18:02:33Z",
            "type": "SALE_CONFIRMATION",
            "detail": {
                "available_quantity": -10,
                "not_available_detail": []
            },
            "result": {
                "total": 90,
                "available_quantity": 90,
                "not_available_quantity": 0,
                "not_available_detail": []
            },
            "external_references": [
                {
                    "type": "shipment_id",
                    "value": "28312961122"
                }
            ]
        },
        {
            "id": 306705012,
            "seller_id": 384324657,
            "seller_product_id": "DEHW09303",
            "date_created": "2020-06-18T17:55:42Z",
            "type": "INBOUND_RECEPTION",
            "detail": {
                "available_quantity": 100,
                "not_available_detail": []
            },
            "result": {
                "total": 100,
                "available_quantity": 100,
                "not_available_quantity": 0,
                "not_available_detail": []
            },
            "external_references": [
                {
                    "type": "inbound_id",
                    "value": "0001"
                }
            ]
        }
    ],

    "filters": [],
    "available_filters": [],
    "available_sort": [],
    "sort": [],
    "available_sorts": []
}
```

Note:

The query date returns until day -1. In this case, it returns operations from 06/29 to 07/27, that is, it does not include the 28th.

### Response fields

**Paging**

- **limit**: number of records to return per “page” of results. By default it will be 1000
- **scroll**: scroll id from which the search continues. When it returns scroll = null means that it has no more records on the next page. The scroll rules are:
  
  \- In the result you get a scroll\_id field that expires in 5 minutes.  
  \- You must add the same scroll\_id to the query of the field obtained previously.  
  \- If you don´t use the limit parameter, it will return 1000 operations of the total by default. You can add a maximum limit of 1000.  
  \- To continue getting the next pages of results, just do the same GET to the request until you reach the end of the list.
  
  **results**: list of operations found.
  
  - **id**: identifier of the stock operation
  - **seller\_id**: identifier of the seller who owns the seller product
  - **seller\_product\_id**: product identifier in the warehouse
  - **date\_created**: creation date of the operation (type date UTC)
  - **type**: type of operation executed (income, sale, sale canceled, etc.)
  
  **result**: stock status
  
  - **available\_quantity**: quantity of products available for sale.
  - **not\_available\_quantity**: total of products that are not available.
  - **not\_available\_detail**: detail of the status of the different unavailable units.
  
  **status**: item status not available.  
  **quantity**: number of items in the assigned state.  
  **external\_references**: references to the entities that generate the operation.
  
  - **type**: type of external reference, they can be:
  - **shipment\_id**: identifier of the shipment to the buyer.
  
  ## Types of operations
  
  These types of operations reflect the interactions of the different flows in the stored units.
  
  ### Inbound
  
  **inbound\_reception** **Ingreso de stock**: The inbound process makes units available for sale at the end of the income stream. They can have:  
  Entry of units that arrived damaged.  
  Entry of units without tax coverage (only for Brazil).  
  **fiscal\_coverage\_ajustment**: adjustment of fiscal coverage (only for Brazil).
  
  ### Outbound
  
  **sale\_confirmation**: confirms the reservation of units for sale.  
  **sale\_cancelation**: cancel the reservation of units for sale.  
  **sale\_delivery\_cancelation**  
  **Venta no entregada**: it was not possible to deliver to the buyer and returns to the deposit.  
  **sale\_return**: sales return by buyer.
  
  ### Withdrawal
  
  This is the seller's withdrawal request.
  
  **withdrawal\_reservation**: reserve units for a stock picked.  
  **withdrawal\_cancelation**: total or partial cancellation of withdrawal reservation, the reservation of units for a stock picked is canceled.  
  **withdrawal\_delivery**: the seller physically pick up the reserved units.  
  **withdrawal\_discarded**: stock removal requested by the seller.
  
  ### Transfer
  
  It is about the internal management of the stock by Mercado Libre, not the seller.
  
  **transfer\_reservation**: units are reserved for a multi-warehouse transfer or pick up.  
  **transfer\_ajustment**: after inspecting the units, the quality status is determined and restocked as available or damaged.  
  **transfer\_delivery**: enter the units in transfer.
  
  ### Quarantine
  
  It's about internal management over quality control.
  
  **quarantine\_reservation**: They reserve units by the quality area for inspection.  
  **quarantine\_restock**: After inspecting the units, determine the quality status and restock as available or damaged.  
  **lost\_refund**: permanent cancellation of lost units (refunded).  
  **disposed\_tained** lagged because the product is contaminated.  
  **disposed\_expired** lagged because the product is expired.
  
  ### Removal QA
  
  This is an internally driven retreat.
  
  **removal\_reservation**: after inspecting the units, the quality status is determined and they are retired.  
  **removal\_completion**: units with poor quality status are eliminated.  
  **stranded\_disposal\_removal**: stock removal due to lack of rotation.
  
  ### Stock adjustments
  
  **ajustement**: internal stock adjustments generated by the operation.  
  **identification\_problem\_remove**: when a product was entered with an incorrect SKU. When performing the re-identification, it is canceled.  
  **identification\_problem\_add**: when a product was entered with an incorrect SKU. When performing the reidentification, it is unsubscribed, and stock of the new SKU is added.
  
  Example with available filters:
  
  ```javascript
  "available_filters": [
          {
              "id": "inventory_id",
              "name": "inventory id"
          },
          {
              "id": "date_from",
              "name": "Date created from"
          }
  ]
  ```
  
  Example with selected filters:
  
  ```javascript
  "filters": {
          {
             "id": "inventory_id",
              "name": "inventory id"
              "values": [
                    "ESZJ28231"
              ]
          }
  ]
  ```
  
  ### Possible errors:
  
  Response with error:
  
  ```javascript
  {
      "status": 403,
      "message": "User 281349747 cannot access to seller_product ESZJ28231",
      "error": "forbidden",
      "cause": []
  }
  ```
  
  ### Errors examples
  
  Status Mensaje Error Descripción 400 The field ‘seller\_id’ is required validation\_error The seller\_id parameter is not found 400 The field ‘type’ has an invalid value validation\_error Invalid parameter 400 The limit param must be greater than 0 validation\_error The limit parameter of the call must be greater than 0 400 Date range can’t be greater than “60” days validation\_error The date range exceeds the limit allowed by days 400 The field date\_from and date\_to are required validation\_error The date\_from and date\_to fields are required 400 The field date\_from and date\_to are required validation\_error The date\_from field cannot be bigger than or equal to the date\_to field 403 Access denied for user 30265782 forbidden The caller is not authorized to access the resource 401 No autorizado unauthorized 500 Internal server error internal\_error Internal error
  
  Know more about [Full](https://vendedores.mercadolibre.com.ar/nota/guia-para-tus-envios-a-full/).