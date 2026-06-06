# Catalog listing

**Tags:** Catalog,listing
**Created:** 2021-02-03T12:02:33Z
**Last Updated:** 2023-11-24T07:59:17Z

---

## Catalog listing

## List from an existing publication (optin)

At first, we recommend you validate that [your existing publication is eligible for catalog](https://global-selling.mercadolibre.com/devsite/catalog-eligibility-gs#Eligibility-of-an-existing-publication-with-associated-catalog-product-id), then get the **active catalog\_product\_id** from children product, using [the product search resource](https://global-selling.mercadolibre.com/devsite/products-search-gs#Search-products) and checking correspond it exactly to product that you will list, you will be able to create the catalog listing with a POST to **/items/catalog\_listings** successfully.

## Variations

In the domains where there is currently a catalog, their publications don´t allow variations because they are already associated with a specific product. So if your original listing had variations, you will have a catalog listing for each one.  
The relevant information of your variations, such as the color of the item, will not be lost but will be reflected in the attributes of the catalog product. In the future, there may be domains where the product never fully specifies what is being sold, for example in clothing to size, and it is possible that variations are allowed. We will notify you when that happens.

If your existing item contains variations, you must make a POST for each one of them by sending the variation\_id field in the body of the POST.

Example of an item with variations:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN'  https://api.mercadolibre.com/items/catalog_listings
{
  "item_id":"CBT1234",
  "variation_id": 4321,
  "catalog_product_id":"CBT9876"
}
```

Example on an item without variations:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/catalog_listings
{
  "item_id":"CBT1234",
  "catalog_product_id":"CBT9876"
}
```

Short example of response to the creation of an item:

Response:

```javascript
{
   "id": "CBT994524823",
   "site_id": "CBT",
   "title": "Samsung Galaxy S10+ - Black Prism - 128 Gb - 8 Gb",
   "subtitle": null,
   "seller_id": 694878795,
   "category_id": "CBT1055",
   "official_store_id": null,
   "price": 15.1,
   "base_price": 15.1,
   "original_price": null,
   "inventory_id": null,
   "currency_id": "USD",
   "initial_quantity": 100,
   "available_quantity": 100,
   "sold_quantity": 0,
   "sale_terms": [],
   "buying_mode": "buy_it_now",
   "listing_type_id": "gold_pro",
   "start_time": "2021-02-03T18:26:50.859Z",
   "stop_time": "2041-01-29T04:00:00.000Z",
   "end_time": "2041-01-29T04:00:00.000Z",
   "expiration_time": "2021-04-24T18:26:50.989Z",
   "condition": "new",
   "permalink": "",
   "pictures": [],
   "video_id": null,
   "descriptions": [],
   "accepts_mercadopago": true,
   "non_mercado_pago_payment_methods": [],
   "shipping": {
       "mode": "not_specified",
       "local_pick_up": false,
       "free_shipping": false,
       "methods": [],
       "dimensions": "9x19x19,500",
       "tags": [],
       "logistic_type": "not_specified",
       "store_pick_up": false
   },
   "international_delivery_mode": "none",
   "seller_address": {},
   "seller_contact": null,
   "location": {},
   "geolocation": {
       "latitude": "",
       "longitude": ""
   },
   "coverage_areas": [],
   "attributes": [],
   "warnings": [],
   "listing_source": "",
   "variations": [],
   "thumbnail_id": "998561-MLA43684142816_102020",
   "thumbnail": "http://cbt-s2-p.mlstatic.com/998561-MLA43684142816_102020-I.jpg",
   "secure_thumbnail": "https://cbt-s2-p.mlstatic.com/998561-MLA43684142816_102020-I.jpg",
   "status": "active",
   "sub_status": [],
   "tags": [],
   "warranty": "Factory warranty: 90 days",
   "catalog_product_id": "CBT14186099",
   "domain_id": "CBT-CELLPHONES",
   "seller_custom_field": null,
   "parent_item_id": null,
   "differential_pricing": null,
   "deal_ids": [],
   "automatic_relist": false,
   "date_created": "2021-02-03T18:26:52.183Z",
   "last_updated": "2021-02-03T18:26:52.183Z",
   "health": null,
   "catalog_listing": true,
   "item_relations": [
       {
           "id": "CBT979951434",
           "variation_id": null,
           "stock_relation": 1
       }
   ]
}
```

Also, remember:

- If the item is sent without variations when it does, the response will be a 400 error.
- The catalog\_product\_id field is required in the POST for items with or without variations.

### Considerations

Within the information of the marketplace product/publication you can find the array **item\_relations** which will have the information of the relationship created between the item\_id of the publication, with its respective variation, and the item\_id of the catalog product created from it.

If the request to create a catalog product is sent without variations but the marketplace publication does have them, the response will be an error:

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

The **catalog\_product\_id** field is required in the POST for marketplace publications, with or without variations.

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

If the marketplace publication is not productized, that is, it does not have the corresponding **catalog\_product\_id** field, the response will be an error:

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

## Synchronization of sale conditions

The synchronization of the sales conditions (such as price, logistics, stock, SKUs and PIs) of the marketplace publications associated with a catalog product will be automatic and with the following conditions:

**The seller will not be able to remove the synchronization** (opt-out).

**New listings will be synced from the start**.

**Existing listings** associated with a catalog product are synchronized when the seller modifies any of the conditions of sale of the original publication.

The synchronization will be from the first change, that is, if the seller modifies the catalog publication first, we will automatically update the marketplace publication, and vice versa.

Note:

Changes to both marketplace posts and catalog posts will be notified through [the feed of items notifications](https://global-selling.mercadolibre.com/devsite/receive-notifications#Subscribe-to-notifications).

## Publish directly in catalog

It is not necessary to have a marketplace publication to publish in the catalog, direct publications can be made, for this you must use the **catalog\_product\_id** of an active catalog product.

By means of a [GET to the /products/search API](https://global-selling.mercadolibre.com/devsite/products-search-gs) with the filter **status:active** you get the suggestion of products in the catalog where you can publish.

Important:

\- The detail of the technical sheet of the catalog product is provided by Mercado Libre. Therefore, the seller is responsible for confirming that the product to be created matches the specific characteristics (technical sheet) of the "catalog\_product\_id".  
\- In the event that there is a difference between what the user buys and the associated product, it is possible that claims and/or cancellations will be generated that will have a negative impact on their reputation and as a consequence of this the disqualification from publishing in the catalog, eventually leading to account suspension.

When sending POST you must send the following values so that the catalog publication is created:

**catalog\_product\_id**: This value must be confirmed with the search/product API.

**catalog\_listing**: It is required to send the value to true to generate the catalog item.

Only after successfully creating a global catalog item, you are able to create new marketplace catalogs items as usual using [create marketplace items](https://global-selling.mercadolibre.com/devsite/marketplace-items#Marketplace-items) resource.

Request:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items
```

Example:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' 
-d '{
   "site_id": "CBT",
   "title": "TEST ITEM",
   "category_id": "CBT1055",
   "price": 20,
   "currency_id": "USD",
   "available_quantity": 10,
   "sale_terms": [
       {
           "id": "WARRANTY_TIME",
           "name": "Warranty time",
           "value_id": null,
           "value_name": "4 months",
           "value_struct": {
               "number": 4,
               "unit": "months"
           },
           "values": [
               {
                   "id": null,
                   "name": "4 months",
                   "struct": {
                       "number": 4,
                       "unit": "months"
                   }
               }
           ]
       },
       {
           "id": "WARRANTY_TYPE",
           "name": "Warranty type",
           "value_id": "2230280",
           "value_name": "Seller warranty",
           "value_struct": null,
           "values": [
               {
                   "id": "2230280",
                   "name": "Seller warranty",
                   "struct": null
               }
           ]
       }
   ],
   "listing_type_id": "gold_pro",
   "attributes": [
       {
           "id": "GTIN",
           "name": "Universal product code",
           "value_id": null,
           "value_name": "753575951221"
       },
       {
           "id": "PACKAGE_HEIGHT",
           "name": "Package height",
           "value_id": null,
           "value_name": "8 mm"
       },
       {
           "id": "PACKAGE_LENGTH",
           "name": "Package length",
           "value_id": null,
           "value_name": "8 mm"
       },
       {
           "id": "PACKAGE_WEIGHT",
           "name": "Package weight",
           "value_id": null,
           "value_name": "2 g"
       },
       {
           "id": "PACKAGE_WIDTH",
           "name": "Package width",
           "value_id": null,
           "value_name": "8 mm"
       },
       {
           "id": "CARRIER",
           "name": "Carrier",
           "value_id": "298335",
           "value_name": "Unlocked"
       },
       {
           "id": "ITEM_CONDITION",
           "name": "Item condition",
           "value_id": "2230284",
           "value_name": "New"
       }
   ],
   "catalog_product_id": "CBT10025567",
   "catalog_listing": true
}'
```

Response:

```javascript
{
    "id": "CBT1520880341",
    "site_id": "CBT",
    "title": "Samsung Galaxy J4 - Black - 32 Gb - 2 Gb",
    "subtitle": null,
    "seller_id": 1172489030,
    "category_id": "CBT1055",
    "official_store_id": null,
    "price": 20,
    "base_price": 20,
    "original_price": null,
    "inventory_id": null,
    "currency_id": "USD",
    "initial_quantity": 10,
    "available_quantity": 10,
    "sold_quantity": 0,
    "sale_terms": [...],
    "buying_mode": "buy_it_now",
    "listing_type_id": "gold_pro",
    "start_time": "2022-09-07T16:59:22.829Z",
    "stop_time": "2042-09-02T04:00:00.000Z",
    "end_time": "2042-09-02T04:00:00.000Z",
    "expiration_time": "2022-11-26T16:59:22.912Z",
    "condition": "new",
    "permalink": "",
    "pictures": [...],
    "video_id": null,
    "descriptions": [],
    "accepts_mercadopago": true,
    "non_mercado_pago_payment_methods": [],
    "shipping": {
        ...
    },
    "international_delivery_mode": "none",
    "seller_address": {
        ...
    },
    "seller_contact": null,
    "location": {},
    "geolocation": {
        ...
    },
    "coverage_areas": [],
    "attributes": [{
            "id": "GTIN",
            "name": "Universal product code",
            "value_id": null,
            "value_name": "753575951221",
            "value_struct": null,
            "values": [{
                "id": null,
                "name": "753575951221",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "CARRIER",
            "name": "Carrier",
            "value_id": "298335",
            "value_name": "Unlocked",
            "value_struct": null,
            "values": [{
                "id": "298335",
                "name": "Unlocked",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "ITEM_CONDITION",
            "name": "Item condition",
            "value_id": "2230284",
            "value_name": "New",
            "value_struct": null,
            "values": [{
                "id": "2230284",
                "name": "New",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "BRAND",
            "name": "Brand",
            "value_id": "206",
            "value_name": "Samsung",
            "value_struct": null,
            "values": [{
                "id": "206",
                "name": "Samsung",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "LINE",
            "name": "Line",
            "value_id": "195973",
            "value_name": "Galaxy J",
            "value_struct": null,
            "values": [{
                "id": "195973",
                "name": "Galaxy J",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "MODEL",
            "name": "Model",
            "value_id": "75860",
            "value_name": "J4",
            "value_struct": null,
            "values": [{
                "id": "75860",
                "name": "J4",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "IS_DUAL_SIM",
            "name": "Is Dual SIM",
            "value_id": "242084",
            "value_name": "No",
            "value_struct": null,
            "values": [{
                "id": "242084",
                "name": "No",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "COLOR",
            "name": "Color",
            "value_id": "52049",
            "value_name": "Black",
            "value_struct": null,
            "values": [{
                "id": "52049",
                "name": "Black",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "INTERNAL_MEMORY",
            "name": "Internal memory",
            "value_id": "59725",
            "value_name": "32 GB",
            "value_struct": {
                "number": 32,
                "unit": "GB"
            },
            "values": [{
                "id": "59725",
                "name": "32 GB",
                "struct": {
                    "number": 32,
                    "unit": "GB"
                }
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "RAM",
            "name": "RAM memory",
            "value_id": "445970",
            "value_name": "2 GB",
            "value_struct": {
                "number": 2,
                "unit": "GB"
            },
            "values": [{
                "id": "445970",
                "name": "2 GB",
                "struct": {
                    "number": 2,
                    "unit": "GB"
                }
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "MAIN_COLOR",
            "name": "Main color",
            "value_id": "2450295",
            "value_name": "Black",
            "value_struct": null,
            "values": [{
                "id": "2450295",
                "name": "Black",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "OPERATING_SYSTEM_NAME",
            "name": "OS name",
            "value_id": "7403813",
            "value_name": "Android",
            "value_struct": null,
            "values": [{
                "id": "7403813",
                "name": "Android",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "OS_ORIGINAL_VERSION",
            "name": "OS original version",
            "value_id": "7206959",
            "value_name": "8.0 Oreo",
            "value_struct": null,
            "values": [{
                "id": "7206959",
                "name": "8.0 Oreo",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "OS_LAST_COMPATIBLE_VERSION",
            "name": "OS last compatible version",
            "value_id": "9123308",
            "value_name": "10",
            "value_struct": null,
            "values": [{
                "id": "9123308",
                "name": "10",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "DISPLAY_SIZE",
            "name": "Display size",
            "value_id": "4428482",
            "value_name": "5.5 \"",
            "value_struct": {
                "number": 5.5,
                "unit": "\""
            },
            "values": [{
                "id": "4428482",
                "name": "5.5 \"",
                "struct": {
                    "number": 5.5,
                    "unit": "\""
                }
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "DISPLAY_RESOLUTION",
            "name": "Display resolution",
            "value_id": "7199688",
            "value_name": "720 px x 1280 px",
            "value_struct": null,
            "values": [{
                "id": "7199688",
                "name": "720 px x 1280 px",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "MAIN_REAR_CAMERA_RESOLUTION",
            "name": "Main rear camera resolution",
            "value_id": "7206960",
            "value_name": "13 Mpx",
            "value_struct": {
                "number": 13,
                "unit": "Mpx"
            },
            "values": [{
                "id": "7206960",
                "name": "13 Mpx",
                "struct": {
                    "number": 13,
                    "unit": "Mpx"
                }
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "REAR_CAMERA_RECORDING_RESOLUTION",
            "name": "Rear camera recording resolution",
            "value_id": "7199621",
            "value_name": "1920 px x 1080 px",
            "value_struct": null,
            "values": [{
                "id": "7199621",
                "name": "1920 px x 1080 px",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "MAIN_FRONT_CAMERA_RESOLUTION",
            "name": "Main front camera resolution",
            "value_id": "7199627",
            "value_name": "5 Mpx",
            "value_struct": {
                "number": 5,
                "unit": "Mpx"
            },
            "values": [{
                "id": "7199627",
                "name": "5 Mpx",
                "struct": {
                    "number": 5,
                    "unit": "Mpx"
                }
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "BATTERY_CAPACITY",
            "name": "Battery capacity",
            "value_id": "98435",
            "value_name": "3000 mAh",
            "value_struct": {
                "number": 3000,
                "unit": "mAh"
            },
            "values": [{
                "id": "98435",
                "name": "3000 mAh",
                "struct": {
                    "number": 3000,
                    "unit": "mAh"
                }
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_FINGERPRINT_READER",
            "name": "With fingerprint reader",
            "value_id": "242084",
            "value_name": "No",
            "value_struct": null,
            "values": [{
                "id": "242084",
                "name": "No",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_FACIAL_RECOGNITION",
            "name": "With facial recognition",
            "value_id": "242084",
            "value_name": "No",
            "value_struct": null,
            "values": [{
                "id": "242084",
                "name": "No",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "SIM_CARD_SLOTS_NUMBER",
            "name": "SIM card slots number",
            "value_id": "2087812",
            "value_name": "1",
            "value_struct": null,
            "values": [{
                "id": "2087812",
                "name": "1",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "COMPATIBLE_SIM_CARD_SIZES",
            "name": "Compatible SIM card sizes",
            "value_id": "80451",
            "value_name": "Micro-SIM",
            "value_struct": null,
            "values": [{
                "id": "80451",
                "name": "Micro-SIM",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_ESIM",
            "name": "With eSIM",
            "value_id": "242084",
            "value_name": "No",
            "value_struct": null,
            "values": [{
                "id": "242084",
                "name": "No",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "OS_PERSONALIZATION_ORIGINAL_SHELL",
            "name": "OS personalization original shell",
            "value_id": "9819072",
            "value_name": "One UI 2.0",
            "value_struct": null,
            "values": [{
                "id": "9819072",
                "name": "One UI 2.0",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "RELEASE_YEAR",
            "name": "Release year",
            "value_id": "2289621",
            "value_name": "2018",
            "value_struct": null,
            "values": [{
                "id": "2289621",
                "name": "2018",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WEIGHT",
            "name": "Weight",
            "value_id": "462001",
            "value_name": "175 g",
            "value_struct": {
                "number": 175,
                "unit": "g"
            },
            "values": [{
                "id": "462001",
                "name": "175 g",
                "struct": {
                    "number": 175,
                    "unit": "g"
                }
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "HEIGHT",
            "name": "Height",
            "value_id": "6850487",
            "value_name": "151.7 mm",
            "value_struct": {
                "number": 151.7,
                "unit": "mm"
            },
            "values": [{
                "id": "6850487",
                "name": "151.7 mm",
                "struct": {
                    "number": 151.7,
                    "unit": "mm"
                }
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WIDTH",
            "name": "Width",
            "value_id": "6907321",
            "value_name": "77.2 mm",
            "value_struct": {
                "number": 77.2,
                "unit": "mm"
            },
            "values": [{
                "id": "6907321",
                "name": "77.2 mm",
                "struct": {
                    "number": 77.2,
                    "unit": "mm"
                }
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "DEPTH",
            "name": "Depth",
            "value_id": "6885904",
            "value_name": "8.1 mm",
            "value_struct": {
                "number": 8.1,
                "unit": "mm"
            },
            "values": [{
                "id": "6885904",
                "name": "8.1 mm",
                "struct": {
                    "number": 8.1,
                    "unit": "mm"
                }
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "DISPLAY_TECHNOLOGY",
            "name": "Display technology",
            "value_id": "80493",
            "value_name": "Super AMOLED",
            "value_struct": null,
            "values": [{
                "id": "80493",
                "name": "Super AMOLED",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "DISPLAY_PIXELS_PER_INCH",
            "name": "Display pixels per inch",
            "value_id": "7180686",
            "value_name": "267 ppi",
            "value_struct": {
                "number": 267,
                "unit": "ppi"
            },
            "values": [{
                "id": "7180686",
                "name": "267 ppi",
                "struct": {
                    "number": 267,
                    "unit": "ppi"
                }
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_TOUCHSCREEN_DISPLAY",
            "name": "With touchscreen display",
            "value_id": "242085",
            "value_name": "Yes",
            "value_struct": null,
            "values": [{
                "id": "242085",
                "name": "Yes",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_PHYSICAL_QWERTY_KEYBOARD",
            "name": "With physical QWERTY keyboard",
            "value_id": "242084",
            "value_name": "No",
            "value_struct": null,
            "values": [{
                "id": "242084",
                "name": "No",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_CAMERA",
            "name": "With camera",
            "value_id": "242085",
            "value_name": "Yes",
            "value_struct": null,
            "values": [{
                "id": "242085",
                "name": "Yes",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "REAR_CAMERAS_NUMBER",
            "name": "Rear cameras number",
            "value_id": "7477198",
            "value_name": "1",
            "value_struct": null,
            "values": [{
                "id": "7477198",
                "name": "1",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "REAR_CAMERA_APERTURE",
            "name": "Rear camera aperture",
            "value_id": "7441410",
            "value_name": "f 1.9",
            "value_struct": null,
            "values": [{
                "id": "7441410",
                "name": "f 1.9",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "FRONT_CAMERAS_NUMBER",
            "name": "Front cameras number",
            "value_id": "7477216",
            "value_name": "1",
            "value_struct": null,
            "values": [{
                "id": "7477216",
                "name": "1",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "FRONT_CAMERA_RECORDING_RESOLUTION",
            "name": "Front camera recording resolution",
            "value_id": "7180687",
            "value_name": "1280 px x 720 px",
            "value_struct": null,
            "values": [{
                "id": "7180687",
                "name": "1280 px x 720 px",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "FRONT_CAMERA_APERTURE",
            "name": "Front camera aperture",
            "value_id": "7408595",
            "value_name": "f 2.2",
            "value_struct": null,
            "values": [{
                "id": "7408595",
                "name": "f 2.2",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_FRONT_CAMERA_FLASH",
            "name": "With front camera flash",
            "value_id": "242085",
            "value_name": "Yes",
            "value_struct": null,
            "values": [{
                "id": "242085",
                "name": "Yes",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "MOBILE_NETWORK",
            "name": "Network",
            "value_id": "367876",
            "value_name": "4G/LTE",
            "value_struct": null,
            "values": [{
                "id": "367876",
                "name": "4G/LTE",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "MEMORY_CARD_TYPES",
            "name": "Memory card types",
            "value_id": "7199655",
            "value_name": "Micro-SD",
            "value_struct": null,
            "values": [{
                "id": "7199655",
                "name": "Micro-SD",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "MEMORY_CARD_MAX_CAPACITY",
            "name": "Memory card max capacity",
            "value_id": "2087792",
            "value_name": "256 GB",
            "value_struct": {
                "number": 256,
                "unit": "GB"
            },
            "values": [{
                "id": "2087792",
                "name": "256 GB",
                "struct": {
                    "number": 256,
                    "unit": "GB"
                }
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "PROCESSOR_MODEL",
            "name": "Processor model",
            "value_id": "6907322",
            "value_name": "Exynos 7570",
            "value_struct": null,
            "values": [{
                "id": "6907322",
                "name": "Exynos 7570",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "CPU_MODELS",
            "name": "CPU models",
            "value_id": "7657686",
            "value_name": "4x1.4 GHz Cortex-A53",
            "value_struct": null,
            "values": [{
                "id": "7657686",
                "name": "4x1.4 GHz Cortex-A53",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "PROCESSOR_CORES_NUMBER",
            "name": "Processor cores number",
            "value_id": "7206949",
            "value_name": "4",
            "value_struct": null,
            "values": [{
                "id": "7206949",
                "name": "4",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "PROCESSOR_SPEED",
            "name": "Processor speed",
            "value_id": "1151166",
            "value_name": "1.4 GHz",
            "value_struct": {
                "number": 1.4,
                "unit": "GHz"
            },
            "values": [{
                "id": "1151166",
                "name": "1.4 GHz",
                "struct": {
                    "number": 1.4,
                    "unit": "GHz"
                }
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "GPU_MODEL",
            "name": "GPU model",
            "value_id": "7498683",
            "value_name": "Mali-T720 MP2",
            "value_struct": null,
            "values": [{
                "id": "7498683",
                "name": "Mali-T720 MP2",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_USB_CONNECTOR",
            "name": "With USB connector",
            "value_id": "242085",
            "value_name": "Yes",
            "value_struct": null,
            "values": [{
                "id": "242085",
                "name": "Yes",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_WIFI",
            "name": "With Wi-Fi",
            "value_id": "242085",
            "value_name": "Yes",
            "value_struct": null,
            "values": [{
                "id": "242085",
                "name": "Yes",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_GPS",
            "name": "With GPS",
            "value_id": "242085",
            "value_name": "Yes",
            "value_struct": null,
            "values": [{
                "id": "242085",
                "name": "Yes",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_BLUETOOTH",
            "name": "With Bluetooth",
            "value_id": "242085",
            "value_name": "Yes",
            "value_struct": null,
            "values": [{
                "id": "242085",
                "name": "Yes",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_MINI_HDMI",
            "name": "With mini HDMI",
            "value_id": "242084",
            "value_name": "No",
            "value_struct": null,
            "values": [{
                "id": "242084",
                "name": "No",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_RADIO",
            "name": "With radio",
            "value_id": "242085",
            "value_name": "Yes",
            "value_struct": null,
            "values": [{
                "id": "242085",
                "name": "Yes",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_TV_TUNER",
            "name": "With TV tuner",
            "value_id": "242084",
            "value_name": "No",
            "value_struct": null,
            "values": [{
                "id": "242084",
                "name": "No",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_ACCELEROMETER",
            "name": "With accelerometer",
            "value_id": "242085",
            "value_name": "Yes",
            "value_struct": null,
            "values": [{
                "id": "242085",
                "name": "Yes",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_PROXIMITY_SENSOR",
            "name": "With proximity sensor",
            "value_id": "242085",
            "value_name": "Yes",
            "value_struct": null,
            "values": [{
                "id": "242085",
                "name": "Yes",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_GYROSCOPE",
            "name": "With gyroscope",
            "value_id": "242084",
            "value_name": "No",
            "value_struct": null,
            "values": [{
                "id": "242084",
                "name": "No",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "IS_SPLASH_RESISTANT",
            "name": "Is splash resistant",
            "value_id": "242084",
            "value_name": "No",
            "value_struct": null,
            "values": [{
                "id": "242084",
                "name": "No",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "IS_WATERPROOF",
            "name": "Is waterproof",
            "value_id": "242084",
            "value_name": "No",
            "value_struct": null,
            "values": [{
                "id": "242084",
                "name": "No",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "BATTERY_TYPE",
            "name": "Battery type",
            "value_id": "95013",
            "value_name": "Lithium-ion",
            "value_struct": null,
            "values": [{
                "id": "95013",
                "name": "Lithium-ion",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_REMOVABLE_BATTERY",
            "name": "With removable battery",
            "value_id": "242085",
            "value_name": "Yes",
            "value_struct": null,
            "values": [{
                "id": "242085",
                "name": "Yes",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "TALK_TIME",
            "name": "Talk time",
            "value_id": "2087877",
            "value_name": "20 h",
            "value_struct": {
                "number": 20,
                "unit": "h"
            },
            "values": [{
                "id": "2087877",
                "name": "20 h",
                "struct": {
                    "number": 20,
                    "unit": "h"
                }
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        },
        {
            "id": "WITH_IMEI",
            "name": "With IMEI",
            "value_id": "242085",
            "value_name": "Yes",
            "value_struct": null,
            "values": [{
                "id": "242085",
                "name": "Yes",
                "struct": null
            }],
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Others"
        }
    ],
    "warnings": [],
    "listing_source": "",
    "variations": [],
    "thumbnail_id": "716522-MLA44156251781_112020",
    "thumbnail": "http://cbt-s2-p.mlstatic.com/716522-MLA44156251781_112020-I.jpg",
    "secure_thumbnail": "https://cbt-s2-p.mlstatic.com/716522-MLA44156251781_112020-I.jpg",
    "status": "active",
    "sub_status": [],
    "tags": [
        "immediate_payment",
        "test_item"
    ],
    "warranty": "Seller warranty: 4 months",
    "catalog_product_id": "CBT10025567",
    "domain_id": "CBT-CELLPHONES",
    "seller_custom_field": null,
    "parent_item_id": null,
    "differential_pricing": null,
    "deal_ids": [],
    "automatic_relist": false,
    "date_created": "2022-09-07T16:59:23.028Z",
    "last_updated": "2022-09-07T16:59:23.028Z",
    "health": null,
    "catalog_listing": true,
    "item_relations": [],
    "channels": [
        "marketplace"
    ]
}
```

## Errors

Code Reason Name Message Solution 7714 Product Identifier \[GTIN] with values \[34567890] corresponds to product \[JVC SI24R] (The GTIN entered is from another domain) item.attribute.product\_identifier.invalid\_by\_product\_catalog Product Identifier \[GTIN] with values \[34567890] corresponds to product \[JVC SI24R] Enter valid GTIN 147 The attributes \[GTIN] are required for category CBT1055 and channel marketplace. Check the attribute is present in the attributes list or in all variation's attributes\_combination or attributes. (Missing GTIN attribute in request) item.attributes.missing\_required The attributes \[GTIN] are required for category CBT1055 and channel marketplace. Check the attribute is present in the attributes list or in all variation's attributes\_combination or attributes. Add the GTIN attribute 377 Invalid catalog\_product\_id: null (Missing the catalog\_product\_id field) catalog\_product\_id.invalid Invalid catalog\_product\_id: null Add the catalog\_product\_id field 101 invalid property type: \[catalog\_product\_id] expected String but was Integer value: 7979516 (Invalid format of the field body.invalid\_field\_types invalid property type: \[catalog\_product\_id] expected String but was Integer value: 7979516 Review the value in the field

## Delete publications

You can [pause/delete catalog publications](https://global-selling.mercadolibre.com/devsite/list-products-global-selling#Product-status) by performing a PUT to the /items/$ITEM\_ID api where the ITEM\_ID referenced is the id of the catalog publication.

When you **pause/delete** the marketplace publication with optin to catalog, you are not pausing/deleting the catalog publication. The catalog publication will remain active and independent and you will be able to continue managing it, until it changes its status to paused or closed through the items API..

Also, you can see [more information about Catalog Listings (Seller Learning Center)](https://sellers.mercadolibre.com/news/guide-on-your-catalog-listings/).

**Next**: [Listing required](https://global-selling.mercadolibre.com/devsite/listing-required).