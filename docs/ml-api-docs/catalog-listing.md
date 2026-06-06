# Catalog listing

**Tags:** Catalog listing
**Created:** 2020-10-05T10:55:53Z
**Last Updated:** 2026-01-02T14:50:25Z

---

## Catalog listing

There are different ways to publish in the catalog:

- Publish directly.
- Publish through an optin via a traditional item.
- Automatic item creation (auto-optin)

## Publishing directly in catalog

It is not necessary to have a marketplace listing to publish in catalog; direct publishing can be performed. To do this, you must use the **catalog\_product\_id** of a catalog product that is in active status or an inactive product enabled for meeting quality standards (Product Standards).

Note:

Currently, the possibility of publishing with inactive IDs is limited to the Autoparts domain.

Important:

\- The catalog product datasheet detail is provided for by Mercado Libre. Therefore, the seller is responsible for confirming that the product to be created matches the specific characteristics (datasheet) of the **catalog\_product\_id**.  
\- If there is a difference between what the user bought and the associated product, it is possible that this will generate a complaint and/or cancellation that will impact negatively on your reputation and as a consequence the inability to publish in catalog, eventually leading to account suspension.

When executing the POST you must send the following values for the catalog publication to be created:  
\- **catalog\_product\_id**: this value must be confirmed with the search/product feature.  
\- **catalog\_listing true**: you must send the value in true to generate the catalog item.

Request:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items
```

Short example of a direct catalog creation:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -d
'{
    "site_id": "MLA",
    "title": "Item de test no ofertar",
    "category_id": "MLA1055",
    "price": 10000000,
    "currency_id": "ARS",
    "available_quantity": 1,
    "buying_mode": "buy_it_now",
    "listing_type_id": "gold_special",
    "pictures": [],
    "attributes": [
        {
            "id": "CARRIER",
            "name": "Compañía telefónica",
            "value_id": "298335",
            "value_name": "Liberado",
            "value_struct": null,
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Otros"
        },
        {
            "id": "ITEM_CONDITION",
            "name": "Condición del ítem",
            "value_id": "2230284",
            "value_name": "Nuevo",
            "value_struct": null,
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Otros"
        }
    ],
    "catalog_product_id": "MLA6005934",
    "catalog_listing": true
}'
https://api.mercadolibre.com/items
```

Response:

```javascript
{
    "id": "MLA811894603",
    "site_id": "MLA",
    "title": "Apple iPhone iPhone 3g 8 Gb Negro 128 Mb Ram",
    "subtitle": null,
    "seller_id": 464161506,
    "category_id": "MLA1055",
    "official_store_id": null,
    "price": 10000000,
    "base_price": 10000000,
    "original_price": null,
    "inventory_id": null,
    "currency_id": "ARS",
    "initial_quantity": 1,
    "available_quantity": 1,
    "sold_quantity": 0,
    "sale_terms": [],
    "buying_mode": "buy_it_now",
    "listing_type_id": "gold_special",
    "start_time": "2019-08-29T14:49:42.945Z",
    "historical_start_time": "2019-08-29T14:49:42.945Z",
    "stop_time": "2039-08-24T04:00:00.000Z",
    "end_time": "2039-08-24T04:00:00.000Z",
    "expiration_time": "2019-11-17T14:49:42.987Z",
    "condition": "new",
    "permalink": "http://articulo.mercadolibre.com.ar/MLA-811894603-apple-iphone-iphone-3g-8-gb-negro-128-mb-ram-_JM",
    "pictures": [
        {
            "id": "675782-MLA31138875214_062019",
            "url": "http://mla-s1-p.mlstatic.com/675782-MLA31138875214_062019-O.jpg",
            "secure_url": "https://mla-s1-p.mlstatic.com/675782-MLA31138875214_062019-O.jpg",
            "size": "249x500",
            "max_size": "598x1200",
            "quality": ""
        },
        {
            "id": "915001-MLA31138546867_062019",
            "url": "http://mla-s2-p.mlstatic.com/915001-MLA31138546867_062019-O.jpg",
            "secure_url": "https://mla-s2-p.mlstatic.com/915001-MLA31138546867_062019-O.jpg",
            "size": "250x500",
            "max_size": "600x1200",
            "quality": ""
        },
        {
            "id": "881441-MLA31138332972_062019",
            "url": "http://mla-s2-p.mlstatic.com/881441-MLA31138332972_062019-O.jpg",
            "secure_url": "https://mla-s2-p.mlstatic.com/881441-MLA31138332972_062019-O.jpg",
            "size": "243x500",
            "max_size": "585x1200",
            "quality": ""
        },
        {
            "id": "804666-MLA31139286536_062019",
            "url": "http://mla-s1-p.mlstatic.com/804666-MLA31139286536_062019-O.jpg",
            "secure_url": "https://mla-s1-p.mlstatic.com/804666-MLA31139286536_062019-O.jpg",
            "size": "405x500",
            "max_size": "836x1030",
            "quality": ""
        }
    ],
    "video_id": null,
    "descriptions": [
        {
            "id": "MLA811894603-2265773390"
        }
    ],
    "accepts_mercadopago": true,
    "non_mercado_pago_payment_methods": [],
    "shipping": {
        "mode": "not_specified",
        "local_pick_up": false,
        "free_shipping": false,
        "methods": [],
        "dimensions": null,
        "tags": [],
        "logistic_type": "not_specified",
        "store_pick_up": false
    },
    "international_delivery_mode": "none",
    "seller_address": {
        "id": 1061221617,
        "comment": "",
        "address_line": "Test Address 123",
        "zip_code": "1414",
        "city": {
            "id": "",
            "name": "Palermo"
        },
        "state": {
            "id": "AR-C",
            "name": "Capital Federal"
        },
        "country": {
            "id": "AR",
            "name": "Argentina"
        },
        "latitude": 38.11569,
        "longitude": 13.3614868,
        "search_location": {
            "neighborhood": {
                "id": "TUxBQlBBTDI1MTVa",
                "name": "Palermo"
            },
            "city": {
                "id": "TUxBQ0NBUGZlZG1sYQ",
                "name": "Capital Federal"
            },
            "state": {
                "id": "TUxBUENBUGw3M2E1",
                "name": "Capital Federal"
            }
        }
    },
    "seller_contact": null,
    "location": {},
    "geolocation": {
        "latitude": 38.11569,
        "longitude": 13.3614868
    },
    "coverage_areas": [],
    "attributes": [
        {
            "id": "CARRIER",
            "name": "Compañía telefónica",
            "value_id": "298335",
            "value_name": "Liberado",
            "value_struct": null,
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Otros"
        },
        {
            "id": "ITEM_CONDITION",
            "name": "Condición del ítem",
            "value_id": "2230284",
            "value_name": "Nuevo",
            "value_struct": null,
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Otros"
        },
        {
            "id": "BRAND",
            "name": "Marca",
            "value_id": "9344",
            "value_name": "Apple",
            "value_struct": null,
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Otros"
        },
        {
            "id": "LINE",
            "name": "Línea",
            "value_id": "58993",
            "value_name": "iPhone",
            "value_struct": null,
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Otros"
        },
        {
            "id": "MODEL",
            "name": "Modelo",
            "value_id": "14605",
            "value_name": "iPhone 3G",
            "value_struct": null,
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Otros"
        },
        {
            "id": "IS_DUAL_SIM",
            "name": "Es Dual SIM",
            "value_id": "242084",
            "value_name": "No",
            "value_struct": null,
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Otros"
        },
        {
            "id": "COLOR",
            "name": "Color",
            "value_id": "52049",
            "value_name": "Negro",
            "value_struct": null,
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Otros"
        },
        {
            "id": "INTERNAL_MEMORY",
            "name": "Memoria interna",
            "value_id": "59566",
            "value_name": "8 GB",
            "value_struct": {
                "number": 8,
                "unit": "GB"
            },
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Otros"
        },
        {
            "id": "RAM",
            "name": "Memoria RAM",
            "value_id": "366239",
            "value_name": "128 MB",
            "value_struct": {
                "number": 128,
                "unit": "MB"
            },
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Otros"
        },
        {
            "id": "MAIN_COLOR",
            "name": "Color principal",
            "value_id": "2450295",
            "value_name": "Negro",
            "value_struct": null,
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Otros"
        },
        {
            "id": "OPERATING_SYSTEM_NAME",
            "name": "Nombre del sistema operativo",
            "value_id": "7404961",
            "value_name": "iOS",
            "value_struct": null,
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Otros"
        },
        {
            "id": "WITH_IMEI",
            "name": "Con IMEI",
            "value_id": "242085",
            "value_name": "Sí",
            "value_struct": null,
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Otros"
        }
    ],
    "warnings": [],
    "listing_source": "",
    "variations": [],
    "thumbnail": "http://mla-s1-p.mlstatic.com/675782-MLA31138875214_062019-I.jpg",
    "secure_thumbnail": "https://mla-s1-p.mlstatic.com/675782-MLA31138875214_062019-I.jpg",
    "status": "active",
    "sub_status": [],
    "tags": [
        "immediate_payment",
        "test_item"
    ],
    "warranty": null,
    "catalog_product_id": "MLA6005934",
    "domain_id": "MLA-CELLPHONES",
    "seller_custom_field": null,
    "parent_item_id": null,
    "differential_pricing": null,
    "deal_ids": [],
    "automatic_relist": false,
    "date_created": "2019-08-29T14:49:43.099Z",
    "last_updated": "2019-08-29T14:49:43.099Z",
    "total_listing_fee": null,
    "health": null,
    "catalog_listing": true,
    "item_relations": []
}
```

## Optin from a traditional publication

After validating that your existing publication is eligible for catalog, getting the **catalog\_product\_id** enabled by the product search feature and verifying that the data sheet corresponds exactly to what you are publishing, you should create the catalog publication (by optin) with a POST to **/items/catalog\_listings**.

## Variations

For catalog products, we do not allow the creation of variations because they are already associated with a specific value, for example: Apple iPad Air From 10.9 Wi-fi 256gb Rose Gold (4th Generation) where the color rose gold would be a variation of a marketplace publication.  
So if your original publication had variations, you will have a marketplace publication for each of them. The relevant information from your variations, such as the color of the item, will not be lost, as it will be reflected in the attributes of the catalog product.  
If your marketplace publication contains variations, you should make a POST for each one by sending the **variation\_id** field in the body of the POST.

Example about a marketplace publication with variations:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/catalog_listings
{
   "item_id": "MLM1477978125",
   "variation_id": 174997747229,
   "catalog_product_id": "MLM15996654"

}
```

Example about a marketplace publication without variations:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/catalog_listings
{
   "item_id": "MLM1477978125",
   "catalog_product_id": "MLM15996654"

}
```

Short example of the response creating a catalog product:

```javascript
{
    "id": "MLM1477990462",
    "site_id": "MLM",
    "title": "Huawei Y6p Dual Sim 64 Gb Emerald Green 3 Gb Ram",
    "subtitle": null,
    "seller_id": 1008002397,
    "category_id": "MLM1055",
    "official_store_id": null,
    "price": 9999,
    "base_price": 9999,
    "original_price": null,
    "inventory_id": null,
    "currency_id": "MXN",
    "initial_quantity": 2,
    "available_quantity": 2,
    "sold_quantity": 0,
    "sale_terms": [
        {
            "id": "WARRANTY_TYPE",
            "name": "Tipo de garantía",
            "value_id": "2230280",
            "value_name": "Garantía del vendedor",
            "value_struct": null,
            "values": [
                {
                    "id": "2230280",
                    "name": "Garantía del vendedor",
                    "struct": null
                }
            ]
        },
        {
            "id": "WARRANTY_TIME",
            "name": "Tiempo de garantía",
            "value_id": null,
            "value_name": "3 meses",
            "value_struct": {
                "number": 3,
                "unit": "meses"
            },
            "values": [
                {
                    "id": null,
                    "name": "3 meses",
                    "struct": {
                        "number": 3,
                        "unit": "meses"
                    }
                }
            ]
        }
    ],
    "buying_mode": "buy_it_now",
    "listing_type_id": "gold_special",
    "start_time": "2022-08-10T16:28:40.141Z",
    "stop_time": "2042-08-05T04:00:00.000Z",
    "end_time": "2042-08-05T04:00:00.000Z",
    "expiration_time": "2022-10-29T16:28:40.255Z",
    "condition": "new",
    "permalink": "http://articulo.mercadolibre.com.mx/MLM-1477990462-huawei-y6p-dual-sim-64-gb-emerald-green-3-gb-ram-_JM",
    "pictures": [
        ...
    ],
    "video_id": null,
    "descriptions": [],
    "accepts_mercadopago": true,
    "non_mercado_pago_payment_methods": [],
    "shipping": {
        "mode": "me2",
        "local_pick_up": false,
        "free_shipping": true,
        "methods": [],
        "dimensions": null,
        "tags": [
            "mandatory_free_shipping"
        ],
        "logistic_type": "drop_off",
        "store_pick_up": false
    },
    "international_delivery_mode": "none",
    "seller_address": {
        ...
    },
    "seller_contact": null,
    "location": {},
    "geolocation": {
        "latitude": 20.7846638,
        "longitude": -103.4679048
    },
    "coverage_areas": [],
    "attributes": [ ... ],
    "warnings": [
      ...
    ],
    "listing_source": "",
    "variations": [],
    "thumbnail_id": "753526-MLA49391002480_032022",
    "thumbnail": "http://mlm-s1-p.mlstatic.com/753526-MLA49391002480_032022-I.jpg",
    "secure_thumbnail": "https://mlm-s1-p.mlstatic.com/753526-MLA49391002480_032022-I.jpg",
    "status": "active",
    "sub_status": [],
    "tags": [
        "cart_eligible",
        "immediate_payment",
        "test_item"
    ],
    "warranty": "Garantía del vendedor: 3 meses",
    "catalog_product_id": "MLM15996654",
    "domain_id": "MLM-CELLPHONES",
    "seller_custom_field": null,
    "parent_item_id": null,
    "differential_pricing": null,
    "deal_ids": [],
    "automatic_relist": false,
    "date_created": "2022-08-10T16:28:40.371Z",
    "last_updated": "2022-08-10T16:28:40.419Z",
    "health": null,
    "catalog_listing": true,
    "item_relations": [
        {
            "id": "MLM1477978125",
            "variation_id": 174997747229,
            "stock_relation": 1
        }
    ],
    "channels": [
        "marketplace"
    ]
}
```

Considerations:

- In the marketplace product/publication information you will find the array **item\_relations** which will have the information of the relationship created between the **item\_id** of the publication, with its respective variation and the **item\_id** of the catalog product created from it.
- If the request to create a catalog product is sent without variations, but the publication has variations, the response will be an error:

```javascript
{
   "message": "Validation error",
   "error": "validation_error",
   "status": 400,
   "cause": [
       {
           "department": "items",
           "cause_id": 216,
           "type": "error",
           "code": "item.variations.invalid",
           "references": [
               "variation_id"
           ],
           "message": "Item MLM1477978125 doesn't have a variation with id null"
       }
   ]
}
```

- The **catalog\_product\_id** field is required in POST for marketplace publications, with or without variations:

```javascript
{
   "message": "Validation error",
   "error": "validation_error",
   "status": 400,
   "cause": [
       {
           "department": "items",
           "cause_id": 369,
           "type": "error",
           "code": "body.required_fields",
           "references": [
               "body.invalid"
           ],
           "message": "The payload is missing the following properties: [catalog_product_id]"
       }
   ]
}
```

- If the marketplace publication does not have the corresponding **catalog\_product\_id** field, the response will be an error:

```javascript
{
   "message": "Validation error",
   "error": "validation_error",
   "status": 400,
   "cause": [
       {
           "department": "items",
           "cause_id": 389,
           "type": "error",
           "code": "item.catalog_listing.not_eligible",
           "references": [
               "item.catalog_listing"
           ],
           "message": "Item cannot be catalog listing"
       } 
   ]
}
```

## Sales conditions sync

The synchronization of sales conditions such as: price, delivery, inventory, warranty, SKU, GTIN (PIs), legal attributes, campaigns (now-5, etc.), and listing\_type of marketplace publications associated with a catalog product will be automatic and under the following conditions:

\- **The seller will not be able to delete the synchronization** (opt-out).  
\- **New publications** will be synchronized from the beginning.  
\- **Existing publications** associated with a catalog product are synchronized when the seller changes any of the sales conditions of the original publication.  
\- **The sync will start when the first change is made**, meaning that if the merchant first modifies the catalog publication, we will automatically update the marketplace publication and vice versa.

Note:

Changes to both marketplace and catalog publications will be notified via the item feed.

## Correction of item synchronization

There are cases where traditional items can lose synchronization with their catalog item, even though they still have the "item\_relation" field connected. To help you resolve these potential errors, we provide two resources:

### Item synchronization query

You can check if your items are synchronized with their catalog item using the following query:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/public/buybox/sync/$ITEM_ID
```

The possible responses are as follows:

Synchronized

```javascript
HEADER x-public:True
    {
   "item_id": "MLA1318233236",
   "status": "SYNC",
   "timestamp": null,
   "relations": [
       "MLA1281648753"
   ]
}
```

Not synchronized

```javascript
HEADER x-public:True
    {
   "item_id": "MLA1361070453",
   "status": "UNSYNC",
   "timestamp": 1678116777461,
   "relations": [
       "MLA1361334302"
   ]
}
```

### Item synchronization

If you find that an active item is not synchronized and wish to correct it, you can do so through the following request, sending only the "item\_id" you wish to synchronize in the request body:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/public/buybox/sync
```

Body:

```javascript
HEADER: x-public:True
{
   "id": "MLA1361070453"
}
```

The server will respond with a status code of 200 in case of success or 422/500 in case of an error.

## Automatic item creation (Auto Optin)

Mercado Livre will review the marketplace publications, and if it complies with all the requirements to make an effective optin, it will be done automatically. Consider that **the original publication will be updated with the attributes, variations.attributes or variations.attribute\_combinations** of the catalog product it was associated with so that both related publications are consistent.  
Below you can see a **catalog product** with automatic optin. Recognize listings that have been automatically created with the **catalog\_boost** tag. This tag is unique in catalog listings created by Mercado Libre.

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLM1881484643
```

Short response:

```javascript
{
   "id": "MLM1881484643",
    "site_id": "MLM",
    "title": "Multifuncional Hp Smart Tank 670 Tinta Continua Color Wi-fi Blanco/gris",
    "category_id": "MLM1676",
    "price": 599999,
    "base_price": 599999,
    "original_price": null,
    "currency_id": "MXN",
    "initial_quantity": 1,
    "available_quantity": 1,
    "sold_quantity": 0,
   "tags": [
        "catalog_boost",
        "good_quality_thumbnail",
        "test_item",
        "immediate_payment",
        "cart_eligible"
    ],
    "warranty": "Sin garantía",
    "catalog_product_id": "MLM19441504",
    "domain_id": "MLM-PRINTERS",
    "parent_item_id": null,
    "differential_pricing": null,
    "deal_ids": [],
    "automatic_relist": false,
    "date_created": "2023-04-20T19:49:35.106Z",
    "last_updated": "2023-04-20T19:58:31.478Z",
    "health": null,
    "catalog_listing": true,
    "channels": [
        "marketplace"
    ]
}
```

You can search by seller to identify publications that are tagged with the catalog\_boost tag using the following feature:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/$SELLER_ID/items/search?status=active&tags=catalog_boost
```

We recommend using this feature for the purpose of informing sellers which of their listings were automatically created by Mercado Libre.

## Automatically created publications (Auto Optin)

Important:

As of May 17, 2023 this feature will be active again.

Mercado Livre will review the marketplace publications, and if it complies with all the requirements to make an effective optin, it will be done automatically. Consider that **the original publication will be updated with the attributes, variations.attributes or variations.attribute\_combinations** of the catalog product it was associated with so that both related publications are consistent.

Below you can see a **catalog product** with automatic optin. Recognize listings that have been automatically created with the **catalog\_boost** tag. This tag is unique in catalog listings created by Mercado Libre.

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLM1881484643
```

Short response:

```javascript
{
   "id": "MLM1881484643",
    "site_id": "MLM",
    "title": "Multifuncional Hp Smart Tank 670 Tinta Continua Color Wi-fi Blanco/gris",
    "category_id": "MLM1676",
    "price": 599999,
    "base_price": 599999,
    "original_price": null,
    "currency_id": "MXN",
    "initial_quantity": 1,
    "available_quantity": 1,
    "sold_quantity": 0,
   "tags": [
        "catalog_boost",
        "good_quality_thumbnail",
        "test_item",
        "immediate_payment",
        "cart_eligible"
    ],
    "warranty": "Sin garantía",
    "catalog_product_id": "MLM19441504",
    "domain_id": "MLM-PRINTERS",
    "parent_item_id": null,
    "differential_pricing": null,
    "deal_ids": [],
    "automatic_relist": false,
    "date_created": "2023-04-20T19:49:35.106Z",
    "last_updated": "2023-04-20T19:58:31.478Z",
    "health": null,
    "catalog_listing": true,
    "channels": [
        "marketplace"
    ]
}
```

You can search by seller to identify publications that are tagged with the **catalog\_boost** tag using the following feature:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/$SELLER_ID/items/search?status=active&tags=catalog_boost
```

We recommend using this feature for the purpose of informing sellers which of their listings were automatically created by Mercado Libre.

## Error messages

When performing catalog publications, you may get error messages in response, which we detail below with their respective solutions:

**Code\_id** **Reason** **code\_name** **code\_message** **Solution** 4400 **catalog\_product\_id** or GTIN required (we detect product based on PKs) **body.required\_fileds** Missing **catalog\_product\_id** or GTIN. It’s required at least one of them. Send **catalog\_product\_id** or GTIN 4402 No active product found based on **catalog\_product\_id** **item.catalog\_product\_id** The product **$product\_id** is not active Submit an active **catalog\_product\_id** or correct GTIN 417 **catalog\_product\_id** does not match the **category\_id** **item.catalog\_product\_id** The product **$product\_id** does not belong to the **catalog\_domain** of the category **$category\_id**. Submit a correct **catalog\_product\_id** 418 The catalog\_product\_id is incorrect because it does not match the related parent\_id or children\_id information. **item.catalog\_product\_id** Variation **catalog\_product\_id $variation\_product\_id** is not a child of item **catalog\_product\_id $item\_product\_id**. Send a catalog\_product\_id at item level and variation corresponding to the related parent\_id. 4310 We detected that, in the past, the seller tried to list this product infringing our intellectual property policies, which is why they won't be able to offer it again. **seller.optin.fake** Seller Optin is forbidden for seller \[Seller\_id] and parent product \[product\_id] The seller cannot offer this product again.

## Automatically deleted publications - OPTOUT

Important:

As of October 26, 2023, this flow will be activated.

Mercado Libre will automatically start to modify the value of the **"status"** or **"catalog\_listing"** attribute of the items currently published in the catalog, in cases where it is necessary to remove a product from the current database, either because of inconsistencies in its specification, because it is fraudulent or because it is a denounced item and has legal restrictions on its sales. In order not to eliminate the sales history and not to affect the reputation of the items, two flows will be followed:

- **Situation 1:**  
  In cases where the seller has both types of publications for the same product (traditional and catalog), **the catalog item will go to "closed" status, while the traditional item will remain active**.
- **Cenário 2:**  
  When the seller only has the item in the catalog, **that item, which has the "catalog\_listing" field set to "true", will change to "catalog\_listing" set to "false"**. In this way, the seller will still be able to sell it as a traditional item.

In both situations, [resource and will receive notifications about them.](https://developers.mercadolibre.com.ar/en_us/list-products#Item-fields)

[](https://developers.mercadolibre.com.ar/en_us/list-products#Item-fields)

## [Delete publications](https://developers.mercadolibre.com.ar/en_us/list-products#Item-fields)

[](https://developers.mercadolibre.com.ar/en_us/list-products#Item-fields)

[You can](https://developers.mercadolibre.com.ar/en_us/list-products#Item-fields) [pause/delete the catalog publications](https://developers.mercadolibre.com.ar/en_us/products-sync-listings#Delete-listing), making the respective PUT to the /items/$ITEM\_ID api where the ITEM\_ID that is referenced is the id of the catalog publication.

By **pausing/deleting** the marketplace publication that is opted in, you are not pausing/deleting the catalog publication, on the contrary, the catalog publication will remain active and independent and you will be able to continue managing it, until through the items API you change the status to paused or closed.

**Next**: [Required listings](/en_us/catalog-required-listings)