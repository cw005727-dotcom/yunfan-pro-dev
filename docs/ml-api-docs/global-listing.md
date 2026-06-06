# Publish items

**Tags:** Global,Listing,items,global items,list items
**Created:** 2024-10-10T23:47:03Z
**Last Updated:** 2026-05-20T18:04:15Z

---

## Publish items

In Global Selling API listings must be created in English and can be made available in multiple MercadoLibre marketplaces such as Mexico (MLM), Brazil (MLB), Chile (MLC), and Colombia (MCO), depending on the seller's preferences. Once an item is listed for a specific marketplace, it becomes visible to buyers who browse the site. This document provides guidance on how to list products effectively.  
Listings in each MercadoLibre marketplace represent the physical item owned by the seller. Listings must be created in English, with prices set in US dollars (USD).

## Get available marketplace sites to publish

To list the items in the marketplaces, we need to know which assets we have for our user. So, make the following GET request with the user id:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/users/$USER_ID
```

This resource presents the user and all the marketplaces that our user has configured:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/users/2560656533
```

Response:

```javascript
{
    "user_id": 2560656533,
    "site_id": "CBT",
    "marketplaces": [
        {
            "user_id": 2560656535,
            "site_id": "MLM",
            "logistic_type": "remote"
        },
        {
            "user_id": 2565546850,
            "site_id": "MLB",
            "logistic_type": "remote"
        },
        {
            "user_id": 2565546852,
            "site_id": "MLC",
            "logistic_type": "remote"
        },
        {
            "user_id": 2565546854,
            "site_id": "MCO",
            "logistic_type": "remote"
        }
    ]
}
```

So, at the moment of listing, you only have to see the site\_id and logistic\_type fields to determine the marketplace where the publication will be available.

### Response fields

**user\_id**: Global CBT user identifier.  
**site\_id**: Always "CBT" for the parent user.  
**marketplaces**: List of marketplace configurations.  
**marketplaces.user\_id**: Marketplace-specific user ID.  
**marketplaces.site\_id**: Marketplace identifier (MLB, MLM, MLC, MCO).  
**marketplaces.logistic\_type**: Logistics type for the marketplace.

## Get listing limit

Get the limit quantity of listings available per each marketplace user for a particular global user.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' 
https://api.mercadolibre.com/marketplace/users/cap
```

Response:

```javascript
[
    {
        "user_id": 2565546854,
        "site_id": "MCO",
        "logistic_type": "remote",
        "quota": 1000,
        "total_items": 1,
        "total_ups": 0,
        "level_information": 0
    },
    {
        "user_id": 2565546852,
        "site_id": "MLC",
        "logistic_type": "remote",
        "quota": 1000,
        "total_items": 0,
        "total_ups": 0,
        "level_information": 0
    },
    {
        "user_id": 2560656535,
        "site_id": "MLM",
        "logistic_type": "remote",
        "quota": 1000,
        "total_items": 1,
        "total_ups": 0,
        "level_information": 0
    },
    {
        "user_id": 2565546850,
        "site_id": "MLB",
        "logistic_type": "remote",
        "quota": 1000,
        "total_items": 1,
        "total_ups": 0,
        "level_information": 0
    }
]
```

### Response fields

**user\_id**: Marketplace-specific user ID.  
**site\_id**: Marketplace identifier.  
**logistic\_type**: Logistics type for the marketplace.  
**quota**: Maximum number of active listings the seller can have for each marketplace.  
**total\_items**: Active listings quantity that the seller has for this site.  
**total\_ups**: \[Pending description].  
**level\_information**: \[Pending description].

Note:

A **quota** value of `0` indicates **unlimited listings** for that marketplace. This means the seller has no active restriction on the number of items they can publish. A numeric value greater than `0` represents the actual listing cap.

## Publish item

Before publish item, you have to know that all listings must be created in english and priced in US dollars (USD). Some fields are mandatory when creating a listing, while others can be optional or manually added later. To maximize your chances of making a sale, ensure that this information is as accurate and clear as possible. The listing quota per site is 10.000 request per day.

### Mandatory attributes

Important:

The **condition** field has been replaced by the "ITEM\_CONDITION" attribute.

**sites\_to\_sell**: configuration for each marketplace where you want to list the item. Check [listings types by site and exposures](https://global-selling.mercadolibre.com/devsite/listing-types-and-exposures).

- **site\_id:** specifies the country where the product will be listed.
- **logistic\_type:** defines the shipping logistics, such as remote or fulfillment.
- **price**: allows you to set a different price for each marketplace. If no price is specified, the global item price will be applied by default. Prices must be provided in US Dollars. If you not specified price for each marketplace, the price of all the marketplace items will be the same as the global item. See more about [Pricing Reference](https://global-selling.mercadolibre.com/devsite/pricing-reference) and [how manage prices automations](https://global-selling.mercadolibre.com/devsite/manage-automations).
- **listing\_type\_id**: lets you choose the listing type between Classic "gold\_special" and Premium "gold\_pro" for each marketplace, depending on what is permitted by the country and the category. Default value: Premium.
- **title**: title in the local language you wish to have.

**title**: it should be in english. Remember include the title in local language to avoid automatic translations. Avoid mentioning stock quantities in the title is not allowed, doing so may result in your listing being moderated. Follow these recommendations:

- **structure**: create the title using the format Product + Brand + Product Key Specifications that help identify the product.
- **formatting:** separate words with spaces, and avoid using punctuation or symbols. Be sure to check for any spelling errors.
- **length:** the maximum length of the title is determined by the category of the product ("max\_title\_length").
- **avoid extra information**: do not include details about other services like returns, free shipping, or installment payments in the title.

**catalog\_listing**: Available values: true or false. Only for logistic fulfillment, [identify an eligible publication for catalogue](https://global-selling.mercadolibre.com/devsite/catalog-eligibility-gs).

**description**: providing detailed information in your product descriptions will significantly increase your chances of making a sale and help you avoid answering repetitive questions.  
**currency\_id**: always in US dollars. Available value: USD.  
**available\_quantity**: this attribute defines the stock, that's the number of products available for selling on this item. The maximum value is defined by the chosen listing type.  
**attributes**: some attributes are defined by the product category, we recommend you to review the [attributes documentation](https://global-selling.mercadolibre.com/devsite/atributtes-global-selling) to learn about category attributes and supported values. Check attributes with the tag new\_required as [Product identifiers](https://global-selling.mercadolibre.com/devsite/product-identifiers-gs) and another like the package's attributes: length, width, height, weight are mandatory.

**variations**: if your listing has variations, the available quantity must be specified in each variation. Learn more about [Variations](https://global-selling.mercadolibre.com/devsite/variations-global-selling).

**pictures**: nice pictures can make an item more appealing and give buyers a better idea of the item's appearance. We provide two options. We recommend to follow the instructions on the pictures documentation. See more how [validate and upload pictures](https://global-selling.mercadolibre.com/devsite/pictures#Validate-and-upload-pictures).

**category\_id**: sellers must define a category in Mercado Libre site. This attribute is mandatory and only accepts pre-established ids. Read to [get a category suggestion](https://global-selling.mercadolibre.com/devsite/category-predictor#Get-a-predicton).  
**seller\_sku**: help your sellers to identify, locate and internally track a product. We only take into account the information loaded in the SELLER\_SKU attribute. Learn more about variations considerations.

**sale\_terms**: define the warranty of the listed product:

- **warranty type**: represents the forms that warranty can take. For example, seller or factory warranty, etc.
- **warranty time**: represents the time that warranty will be in force.

Note:

Pictures can be provided in two formats: **With ID** (use when pictures have been previously uploaded): `{"id": "701198-CBT79185512197_092024"}` or **With source URL** (use to upload pictures directly): `{"source": "https://http2.mlstatic.com/..."}`

Example:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Content-Type: application/json' https://api.mercadolibre.com/global/items -d
{
    "sites_to_sell": [
        {
            "site_id": "MLB",
            "logistic_type": "remote",
            "title": "Bola De Futebol Reflexiva Que Brilha"
        },
        {
            "site_id": "MLC",
            "logistic_type": "remote",
            "title": "Bola de fútbol reflectante que brilla"
        }
    ],
    "currency_id": "USD",
    "catalog_listing": false,
    "category_id": "CBT1287",
    "sale_terms": [
        {
            "id": "WARRANTY_TYPE",
            "name": "Warranty type",
            "value_id": "2230279",
            "value_name": "Factory warranty"
        },
        {
            "id": "WARRANTY_TIME",
            "name": "Warranty time",
            "value_name": "90 days"
        }
    ],
    "attributes": [
        {
            "id": "BRAND",
            "name": "Brand",
            "value_id": "276243",
            "value_name": "Generic"
        },
        {
            "id": "COLOR",
            "name": "Color",
            "value_id": "3801470",
            "value_name": "Multicolor"
        },
        {
            "id": "GTIN",
            "name": "Universal product code",
            "value_name": "8429412807090"
        },
        {
            "id": "ITEM_CONDITION",
            "name": "Item condition",
            "value_id": "2230284",
            "value_name": "New"
        },
        {
            "id": "MODEL",
            "name": "Model",
            "value_id": "15341587",
            "value_name": "Soccer balls"
        },
        {
            "id": "PACKAGE_HEIGHT",
            "name": "Package height",
            "value_name": "30 cm"
        },
        {
            "id": "PACKAGE_LENGTH",
            "name": "Package length",
            "value_name": "30 cm"
        },
        {
            "id": "PACKAGE_WEIGHT",
            "name": "Package weight",
            "value_name": "1 kg"
        },
        {
            "id": "PACKAGE_WIDTH",
            "name": "Package width",
            "value_name": "30 cm"
        },
        {
            "id": "SELLER_SKU",
            "name": "SKU",
            "value_name": "SC-1520"
        }
    ],
    "title": "Test Items Reflective Glow-in-the-Dark Soccer Ball",
    "description": {
        "plain_text": "Bring your game to life, day or night, with our Reflective Soccer Ball! Designed with a special reflective surface, this ball shines brightly under direct light or flash, making it perfect for nighttime play, photo shoots, or just standing out on the field."
    },
    "price": 65.99,
    "available_quantity": 40,
    "pictures": [
        {
            "source": "https://http2.mlstatic.com/D_647917-CBT52638413527_112022-O.jpg"
        }
    ]
}
```

Response:

```javascript
{
    "item_id": "CBT2796239245",
    "seller_id": 2560656533,
    "site_id": "CBT",
    "parent_user_product_id": "CBTU3667934350",
    "site_items": [
        {
            "item_id": "MLB6020770144",
            "seller_id": 2565546850,
            "site_id": "MLB",
            "logistic_type": "remote"
        },
        {
            "item_id": "MLC1780459445",
            "seller_id": 2565546852,
            "site_id": "MLC",
            "logistic_type": "remote"
        }
    ]
}
```

## Publish item with variations

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Content-Type: application/json' https://api.mercadolibre.com/global/items -d
{
    "sites_to_sell": [
        {
            "site_id": "MLB",
            "logistic_type": "remote",
            "title": "Item teste Bola De Futebol Reflexiva Que Brilha"
        },
        {
            "site_id": "MLC",
            "logistic_type": "remote",
            "title": "Test item Bola de fútbol reflectante que brilla"
        }
    ],
    "currency_id": "USD",
    "catalog_listing": false,
    "category_id": "CBT1287",
    "sale_terms": [
        {
            "id": "WARRANTY_TYPE",
            "name": "Warranty type",
            "value_id": "2230279",
            "value_name": "Factory warranty"
        },
        {
            "id": "WARRANTY_TIME",
            "name": "Warranty time",
            "value_name": "90 days"
        }
    ],
    "attributes": [
        {
            "id": "BRAND",
            "name": "Brand",
            "value_id": "276243",
            "value_name": "Generic"
        },
        {
            "id": "ITEM_CONDITION",
            "name": "Item condition",
            "value_id": "2230284",
            "value_name": "New"
        },
        {
            "id": "MODEL",
            "name": "Model",
            "value_id": "15341587",
            "value_name": "Soccer balls"
        }
    ],
    "title": "Test Items Reflective Glow-in-the-Dark Soccer Ball",
    "description": {
        "plain_text": "Bring your game to life, day or night, with our Reflective Soccer Ball! Designed with a special reflective surface, this ball shines brightly under direct light or flash, making it perfect for nighttime play, photo shoots, or just standing out on the field."
    },
    "pictures": [
        {
            "source": "https://http2.mlstatic.com/D_647917-CBT52638413527_112022-O.jpg"
        },
        {
            "source": "https://http2.mlstatic.com/D_831581-MLU74344637844_022024-O.jpg"
        }
    ],
    "variations": [
        {
            "attribute_combinations": [
                {
                    "id": "COLOR",
                    "name": "Color",
                    "value_id": "3801470",
                    "value_name": "Multicolor"
                }
            ],
            "available_quantity": 40,
            "price": 65.99,
            "picture_ids": [
                "https://http2.mlstatic.com/D_647917-CBT52638413527_112022-O.jpg"
            ],
            "attributes": [
                {
                    "id": "PACKAGE_HEIGHT",
                    "name": "Package height",
                    "value_name": "30 cm"
                },
                {
                    "id": "PACKAGE_LENGTH",
                    "name": "Package length",
                    "value_name": "30 cm"
                },
                {
                    "id": "PACKAGE_WEIGHT",
                    "name": "Package weight",
                    "value_name": "900 g"
                },
                {
                    "id": "PACKAGE_WIDTH",
                    "name": "Package width",
                    "value_name": "30 cm"
                },
                {
                    "id": "SELLER_SKU",
                    "name": "SKU",
                    "value_name": "SC-1520"
                },
                {
                    "id": "GTIN",
                    "name": "Universal product code",
                    "value_name": "8429412807090"
                }
            ]
        },
        {
            "attribute_combinations": [
                {
                    "id": "COLOR",
                    "name": "Color",
                    "value_id": "32278799",
                    "value_name": "laranja-neon-escuro"
                }
            ],
            "available_quantity": 40,
            "price": 65.99,
            "picture_ids": [
                "https://http2.mlstatic.com/D_831581-MLU74344637844_022024-O.jpg"
            ],
            "attributes": [
                {
                    "id": "PACKAGE_HEIGHT",
                    "name": "Package height",
                    "value_name": "30 cm"
                },
                {
                    "id": "PACKAGE_LENGTH",
                    "name": "Package length",
                    "value_name": "30 cm"
                },
                {
                    "id": "PACKAGE_WEIGHT",
                    "name": "Package weight",
                    "value_name": "910 g"
                },
                {
                    "id": "PACKAGE_WIDTH",
                    "name": "Package width",
                    "value_name": "30 cm"
                },
                {
                    "id": "SELLER_SKU",
                    "name": "SKU",
                    "value_name": "70079889"
                },
                {
                    "id": "GTIN",
                    "name": "Universal product code",
                    "value_name": "3583787891193"
                }
            ]
        }
    ]
}
```

Response:

```javascript
{
    "item_id": "CBT3163635698",
    "seller_id": 2560656533,
    "site_id": "CBT",
    "site_items": [
        {
            "item_id": "MLB6029101692",
            "seller_id": 2565546850,
            "site_id": "MLB",
            "logistic_type": "remote"
        },
        {
            "item_id": "MLC1781579917",
            "seller_id": 2565546852,
            "site_id": "MLC",
            "logistic_type": "remote"
        }
    ]
}
```

## Get items

Get detail of global and marketplace items with the same endpoint.

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/items/CBT2796239245
```

Response:

```javascript
{
    "id": "CBT2796239245",
    "site_id": "CBT",
    "date_created": "2025-12-08T19:35:10.712Z",
    "title": "Test Items Reflective Glow-in-the-dark Soccer Ball",
    "descriptions": [],
    "attributes": [
        {
            "id": "BRAND",
            "name": "Brand",
            "value_id": "276243",
            "value_name": "Genérica",
            "value_struct": null,
            "values": [
                {
                    "id": "276243",
                    "name": "Genérica",
                    "struct": null
                }
            ]
        },
        {
            "id": "COLOR",
            "name": "Color",
            "value_id": "3801470",
            "value_name": "Multicolor",
            "value_struct": null,
            "values": [
                {
                    "id": "3801470",
                    "name": "Multicolor",
                    "struct": null
                }
            ]
        },
        {
            "id": "GTIN",
            "name": "Universal product code",
            "value_id": "",
            "value_name": "8429412807090",
            "value_struct": null,
            "values": [
                {
                    "id": "",
                    "name": "8429412807090",
                    "struct": null
                }
            ]
        },
        {
            "id": "ITEM_CONDITION",
            "name": "Item condition",
            "value_id": "2230284",
            "value_name": "New",
            "value_struct": null,
            "values": [
                {
                    "id": "2230284",
                    "name": "New",
                    "struct": null
                }
            ]
        },
        {
            "id": "MODEL",
            "name": "Model",
            "value_id": "15341587",
            "value_name": "Soccer balls",
            "value_struct": null,
            "values": [
                {
                    "id": "15341587",
                    "name": "Soccer balls",
                    "struct": null
                }
            ]
        },
        {
            "id": "PACKAGE_HEIGHT",
            "name": "Package height",
            "value_id": "",
            "value_name": "30 cm",
            "value_struct": {
                "number": 30,
                "unit": "cm"
            },
            "values": [
                {
                    "id": "",
                    "name": "30 cm",
                    "struct": {
                        "number": 30,
                        "unit": "cm"
                    }
                }
            ]
        },
        {
            "id": "PACKAGE_LENGTH",
            "name": "Package length",
            "value_id": "",
            "value_name": "30 cm",
            "value_struct": {
                "number": 30,
                "unit": "cm"
            },
            "values": [
                {
                    "id": "",
                    "name": "30 cm",
                    "struct": {
                        "number": 30,
                        "unit": "cm"
                    }
                }
            ]
        },
        {
            "id": "PACKAGE_WEIGHT",
            "name": "Package weight",
            "value_id": "",
            "value_name": "1000 g",
            "value_struct": {
                "number": 1000,
                "unit": "g"
            },
            "values": [
                {
                    "id": "",
                    "name": "1000 g",
                    "struct": {
                        "number": 1000,
                        "unit": "g"
                    }
                }
            ]
        },
        {
            "id": "PACKAGE_WIDTH",
            "name": "Package width",
            "value_id": "",
            "value_name": "30 cm",
            "value_struct": {
                "number": 30,
                "unit": "cm"
            },
            "values": [
                {
                    "id": "",
                    "name": "30 cm",
                    "struct": {
                        "number": 30,
                        "unit": "cm"
                    }
                }
            ]
        },
        {
            "id": "SELLER_SKU",
            "name": "SKU",
            "value_id": "",
            "value_name": "SC-1520",
            "value_struct": null,
            "values": [
                {
                    "id": "",
                    "name": "SC-1520",
                    "struct": null
                }
            ]
        }
    ],
    "listing_type_id": "gold_pro",
    "permalink": "",
    "shipping": {
        "mode": "not_specified",
        "free_shipping": false,
        "logistic_type": "not_specified",
        "dimensions": "",
        "tags": []
    },
    "status": "active",
    "sub_status": [],
    "tags": [
        "kvs_primary",
        "test_item",
        "immediate_payment"
    ],
    "warranty": "Factory warranty: 90 days",
    "catalog_product_id": null,
    "domain_id": "CBT-FOOTBALL_BALLS",
    "international_delivery_mode": "none",
    "inventory_id": "",
    "category_id": "CBT1287",
    "official_store_id": null,
    "sale_terms": [
        {
            "id": "WARRANTY_TYPE",
            "name": "Warranty type",
            "value_id": "2230279",
            "value_name": "Factory warranty",
            "value_struct": {
                "number": 0,
                "unit": ""
            },
            "values": [
                {
                    "id": "2230279",
                    "name": "Factory warranty",
                    "struct": {
                        "number": 0,
                        "unit": ""
                    }
                }
            ]
        },
        {
            "id": "WARRANTY_TIME",
            "name": "Warranty time",
            "value_id": null,
            "value_name": "90 days",
            "value_struct": {
                "number": 90,
                "unit": "days"
            },
            "values": [
                {
                    "id": null,
                    "name": "90 days",
                    "struct": {
                        "number": 90,
                        "unit": "days"
                    }
                }
            ]
        }
    ],
    "sold_quantity": 0,
    "available_quantity": 40,
    "last_updated": "2025-12-08T19:35:10.712Z",
    "seller_id": 2560656533,
    "price": 65.99,
    "original_price": 0,
    "currency_id": "USD",
    "base_exchange_rate": 0,
    "user_logistic_type": "",
    "owner_id": 0,
    "cbt_item_id": "",
    "variations": [],
    "item_relations": [],
    "marketplace_items": [
        {
            "item_id": "MLB6020770144",
            "user_id": 2565546850,
            "site_id": "MLB",
            "date_created": "2025-12-08T19:35:11Z",
            "parent_id": "CBT2796239245",
            "parent_user_id": 2560656533
        },
        {
            "item_id": "MLC1780459445",
            "user_id": 2565546852,
            "site_id": "MLC",
            "date_created": "2025-12-08T19:35:11Z",
            "parent_id": "CBT2796239245",
            "parent_user_id": 2560656533
        }
    ],
    "pictures": [
        {
            "id": "638774-CBT100765020115_122025",
            "url": "http://http2.mlstatic.com/D_638774-CBT100765020115_122025-O.jpg",
            "secure_url": "https://http2.mlstatic.com/D_638774-CBT100765020115_122025-O.jpg",
            "size": "500x500",
            "max_size": "500x500",
            "quality": ""
        }
    ],
    "thumbnail": "http://http2.mlstatic.com/D_638774-CBT100765020115_122025-I.jpg",
    "secure_thumbnail": "https://http2.mlstatic.com/D_638774-CBT100765020115_122025-I.jpg",
    "thumbnail_id": "638774-CBT100765020115_122025",
    "buying_mode": "buy_it_now",
    "accepts_mercadopago": true,
    "initial_quantity": 40,
    "seller_address": {
        "address_line": "shennandadao road futian District 1122",
        "zip_code": "518033",
        "city": {
            "id": "Q04tR0RTaGVuemhlbg",
            "name": "Shenzhen"
        },
        "state": {
            "id": "CN-GD",
            "name": "Guangdong"
        },
        "country": {
            "id": "CN",
            "name": "China"
        },
        "id": 1494268299
    }
}
```

Request:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/items/MLB6020770144
```

Response:

```javascript
{
    "id": "MLB6020770144",
    "site_id": "MLB",
    "date_created": "2025-12-08T19:35:10.715Z",
    "title": "Bola De Futebol Reflexiva Que Brilha",
    "descriptions": [],
    "attributes": [
        {
            "id": "BRAND",
            "name": "Marca",
            "value_id": "276243",
            "value_name": "Genérica",
            "value_struct": null,
            "values": [
                {
                    "id": "276243",
                    "name": "Genérica",
                    "struct": null
                }
            ]
        },
        {
            "id": "ITEM_CONDITION",
            "name": "Condição do item",
            "value_id": "2230284",
            "value_name": "Novo",
            "value_struct": null,
            "values": [
                {
                    "id": "2230284",
                    "name": "Novo",
                    "struct": null
                }
            ]
        },
        {
            "id": "SELLER_SKU",
            "name": "SKU",
            "value_id": "",
            "value_name": "SC-1520",
            "value_struct": null,
            "values": [
                {
                    "id": "",
                    "name": "SC-1520",
                    "struct": null
                }
            ]
        }
    ],
    "listing_type_id": "gold_pro",
    "permalink": "https://produto.mercadolivre.com.br/MLB-6020770144-bola-de-futebol-reflexiva-que-brilha-_JM",
    "shipping": {
        "mode": "me2",
        "free_shipping": true,
        "logistic_type": "drop_off",
        "dimensions": "",
        "tags": [
            "mandatory_free_shipping"
        ]
    },
    "status": "active",
    "sub_status": [],
    "tags": [
        "standard_price_by_channel",
        "test_item",
        "kvs_primary",
        "cbt_item",
        "cbt_ids",
        "net_proceeds_prices",
        "immediate_payment",
        "cart_eligible"
    ],
    "warranty": "Garantia de fábrica: 90 dias",
    "catalog_product_id": null,
    "domain_id": "MLB-FOOTBALL_BALLS",
    "international_delivery_mode": "DDP",
    "inventory_id": "",
    "category_id": "MLB6852",
    "official_store_id": null,
    "sale_terms": [
        {
            "id": "WARRANTY_TYPE",
            "name": "Tipo de garantia",
            "value_id": "2230279",
            "value_name": "Garantia de fábrica",
            "value_struct": {
                "number": 0,
                "unit": ""
            },
            "values": [
                {
                    "id": "2230279",
                    "name": "Garantia de fábrica",
                    "struct": {
                        "number": 0,
                        "unit": ""
                    }
                }
            ]
        },
        {
            "id": "GLOBAL_PRICE",
            "name": "Preço global",
            "value_id": null,
            "value_name": "65.99 USD",
            "value_struct": {
                "number": 65.99,
                "unit": "USD"
            },
            "values": [
                {
                    "id": null,
                    "name": "65.99 USD",
                    "struct": {
                        "number": 65.99,
                        "unit": "USD"
                    }
                }
            ]
        }
    ],
    "sold_quantity": 0,
    "available_quantity": 40,
    "last_updated": "2025-12-08T19:35:13.696Z",
    "seller_id": 2565546850,
    "price": 65.99,
    "original_price": 0,
    "currency_id": "USD",
    "net_proceeds": {
        "amount": 38.62,
        "additional_concepts": [
            {
                "id": "shipping_cost",
                "amount": 16.48
            },
            {
                "id": "sale_fee",
                "amount": 10.89
            }
        ],
        "currency_id": "USD"
    },
    "base_exchange_rate": 0,
    "user_logistic_type": "remote",
    "owner_id": 2560656533,
    "cbt_item_id": "CBT2796239245",
    "variations": [],
    "item_relations": []
}
```

## Publish item with Net Proceeds

**Net Proceeds** is a new pricing feature created to facilitate the experience of CBT sellers on Mercado Libre. With this functionality, it will be possible to directly inform the net amount (net proceeds) you wish to receive from the sale of your products, without having to worry about sales commission fees and logistics costs.

In publishing items without Net Proceeds, the seller needed to manually enter the listing price, assuming the calculation of sales commissions and shipping costs to guarantee the expected margin. With Net Proceeds, this changes — the seller only informs the desired net amount, and Mercado Libre automatically calculates the listing price by adding applicable fees and shipping costs.

Using Net Proceeds brings a series of advantages for CBT sellers. By allowing the seller to define only the net amount they wish to receive, the process becomes simpler, eliminating the need to calculate specific charges for each country. Additionally, this approach ensures greater consistency in received amounts, reducing manual calculation errors.

### How does it work?

**The Pricing Flow**

The Net Proceeds model was developed to **protect your net profit margin (Net Proceeds)**, ensuring that the value you define as your earning is always maintained. To achieve this, the **public price** (the final value displayed to the buyer) becomes a variable that is **automatically adjusted** by our system. This adjustment occurs whenever there are fluctuations in **variable costs** (such as shipping costs, commissions, or fees), ensuring that:

**Public Price = Your Fixed Net Proceeds + Fluctuating Variable Costs**

In this way, if a variable cost increases or decreases, the value of your **Net Proceeds does not change**, only updating the **public price**. If you wish to change your profit, simply edit the Net Proceeds value directly.

### Practical example:

- **Publishing flow with Net Proceeds:** the seller informs "net\_proceeds": 13, and the system automatically calculates the listing price (USD 13 + USD 3 + USD 4 = USD 20).

With this new logic, the focus shifts from the listing price to the net proceeds, optimizing item publication and ensuring greater transparency about the amounts actually received.

### Publishing with Net Proceeds

Net Proceeds can be configured in different ways when publishing an item. Below, we present the available options so you can choose the one that best fits your integration.

**Important:**

When using the **"net\_proceeds"** field, it is not necessary to include the "price" field, as the system will automatically calculate the listing price based on applicable fees and shipping costs.

### Compatibility Rules by Logistic Type

To ensure the correct creation of items on the target sites, follow the compatibility rules by logistic type:

**Logistic Types**

Logistic Type Supports Net Proceeds? Mandatory Field System Behavior **Remote (IDS)** Yes net\_proceeds The system automatically calculates the listing price based on fees and shipping. **Fulfillment (FBM)** No price The final Listing Price must be provided. The use of the "net\_proceeds" field will cause a validation error.

### Configuration by Sites to Sell

In this modality, the **"net\_proceeds"** field must be included within each object of the **"sites\_to\_sell"** list, indicating the net amount the seller wishes to receive in each marketplace (identified by "site\_id"). This approach allows defining specific values per country when publishing the item.

Request:

```javascript
curl --location 'https://api.mercadolibre.com/global/items' \
--header 'Authorization: Bearer $ACCESS_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
  "sites_to_sell": [
    {
      "site_id": "MLB",
      "logistic_type": "remote",
      "title": "Bola De Futebol Reflexiva Que Brilha",
      "net_proceeds": 50
    },
    {
      "site_id": "MLC",
      "logistic_type": "remote",
      "title": "Bola de fútbol reflectante que brilla",
       "net_proceeds": 40
    }
  ],
  "currency_id": "USD",
  "catalog_listing": false,
  "category_id": "CBT1287",
  "sale_terms": [
    {
      "id": "WARRANTY_TYPE",
      "name": "Warranty type",
      "value_id": "2230279",
      "value_name": "Factory warranty"
    },
    {
      "id": "WARRANTY_TIME",
      "name": "Warranty time",
      "value_name": "90 days"
    }
  ],
  "attributes": [
    {
      "id": "BRAND",
      "name": "Brand",
      "value_id": "276243",
      "value_name": "Generic"
    },
    {
      "id": "COLOR",
      "name": "Color",
      "value_id": "3801470",
      "value_name": "Multicolor"
    },
    {
      "id": "GTIN",
      "name": "Universal product code",
      "value_name": "7891234567895"
    },
    {
      "id": "ITEM_CONDITION",
      "name": "Item condition",
      "value_id": "2230284",
      "value_name": "New"
    },
    {
      "id": "MODEL",
      "name": "Model",
      "value_id": "15341587",
      "value_name": "Soccer balls"
    },
    {
      "id": "PACKAGE_HEIGHT",
      "name": "Package height",
      "value_name": "30 cm"
    },
    {
      "id": "PACKAGE_LENGTH",
      "name": "Package length",
      "value_name": "30 cm"
    },
    {
      "id": "PACKAGE_WEIGHT",
      "name": "Package weight",
      "value_name": "1 kg"
    },
    {
      "id": "PACKAGE_WIDTH",
      "name": "Package width",
      "value_name": "30 cm"
    },
    {
      "id": "SELLER_SKU",
      "name": "SKU",
      "value_name": "SC-1520"
    }
  ],
  "title": "Test Items Reflective Glow-in-the-Dark Soccer Ball",
  "available_quantity": 10,
  "description": {
    "plain_text": "Bring your game to life, day or night, with our Reflective Soccer Ball! Designed with a special reflective surface, this ball shines brightly under direct light or flash, making it perfect for nighttime play, photo shoots, or just standing out on the field."
  },
  "pictures": [
    {
      "source": "https://http2.mlstatic.com/D_647917.jpg"
    }
  ]
}'
```

Response:

```javascript
{
    "item_id": "CBT2546610318",
    "seller_id": 1684500000,
    "site_id": "CBT",
    "site_items": [
        {
            "item_id": "MLC2994461456",
            "seller_id": 1686730000,
            "site_id": "MLC",
            "logistic_type": "remote"
        },
        {
            "item_id": "MLB5523633278",
            "seller_id": 1684510000,
            "site_id": "MLB",
            "logistic_type": "remote"
        }
    ]
}
```

### Configuration by Sites to Sell - item with variations

Request:

```javascript
curl --location 'https://api.mercadolibre.com/global/items' \
--header 'Authorization: Bearer $ACCESS_TOKEN' \
--header 'Content-Type: application/json' \
--data '{
    "sites_to_sell": [
        {
            "site_id": "MLB",
            "logistic_type": "remote",
            "title": "Item teste Bola De Futebol Reflexiva Que Brilha 2",
            "net_proceeds": 90
        },
        {
            "site_id": "MLC",
            "logistic_type": "remote",
            "title": "Test item Bola de fútbol reflectante que brilla 2",
             "net_proceeds": 75
        }
    ],
    "currency_id": "USD",
    "catalog_listing": false,
    "category_id": "CBT1287",
    "sale_terms": [
        {
            "id": "WARRANTY_TYPE",
            "name": "Warranty type",
            "value_id": "2230279",
            "value_name": "Factory warranty"
        },
        {
            "id": "WARRANTY_TIME",
            "name": "Warranty time",
            "value_name": "90 days"
        }
    ],
    "attributes": [
        {
            "id": "BRAND",
            "name": "Brand",
            "value_id": "276243",
            "value_name": "Generic"
        },
        {
            "id": "ITEM_CONDITION",
            "name": "Item condition",
            "value_id": "2230284",
            "value_name": "New"
        },
        {
            "id": "MODEL",
            "name": "Model",
            "value_id": "15341587",
            "value_name": "Soccer balls"
        }
    ],
    "title": "Test Items Reflective Glow-in-the-Dark Soccer Ball 2",
    "description": {
        "plain_text": "Bring your game to life, day or night, with our Reflective Soccer Ball! Designed with a special reflective surface, this ball shines brightly under direct light or flash, making it perfect for nighttime play, photo shoots, or just standing out on the field."
    },
    "pictures": [
        {
            "source": "https://http2.mlstatic.com/D_647917-CBT52638413527_112022-O.jpg"
        },
        {
            "source": "https://http2.mlstatic.com/D_831581-MLU74344637844_022024-O.jpg"
        }
    ],
    "variations": [
        {
            "attribute_combinations": [
                {
                    "id": "COLOR",
                    "name": "Color",
                    "value_id": "3801470",
                    "value_name": "Multicolor"
                }
            ],
            "available_quantity": 15,
            "picture_ids": [
                "https://http2.mlstatic.com/D_647917-CBT52638413527_112022-O.jpg"
            ],
            "attributes": [
                {
                    "id": "PACKAGE_HEIGHT",
                    "name": "Package height",
                    "value_name": "30 cm"
                },
                {
                    "id": "PACKAGE_LENGTH",
                    "name": "Package length",
                    "value_name": "30 cm"
                },
                {
                    "id": "PACKAGE_WEIGHT",
                    "name": "Package weight",
                    "value_name": "900 g"
                },
                {
                    "id": "PACKAGE_WIDTH",
                    "name": "Package width",
                    "value_name": "30 cm"
                },
                {
                    "id": "SELLER_SKU",
                    "name": "SKU",
                    "value_name": "SC-1520"
                },
                {
                    "id": "GTIN",
                    "name": "Universal product code",
                    "value_name": "8429412807090"
                }
            ]
        },
        {
            "attribute_combinations": [
                {
                    "id": "COLOR",
                    "name": "Color",
                    "value_id": "32278799",
                    "value_name": "laranja-neon-escuro"
                }
            ],
            "available_quantity": 15,
            "picture_ids": [
                "https://http2.mlstatic.com/D_831581-MLU74344637844_022024-O.jpg"
            ],
            "attributes": [
                {
                    "id": "PACKAGE_HEIGHT",
                    "name": "Package height",
                    "value_name": "30 cm"
                },
                {
                    "id": "PACKAGE_LENGTH",
                    "name": "Package length",
                    "value_name": "30 cm"
                },
                {
                    "id": "PACKAGE_WEIGHT",
                    "name": "Package weight",
                    "value_name": "910 g"
                },
                {
                    "id": "PACKAGE_WIDTH",
                    "name": "Package width",
                    "value_name": "30 cm"
                },
                {
                    "id": "SELLER_SKU",
                    "name": "SKU",
                    "value_name": "70079889"
                },
                {
                    "id": "GTIN",
                    "name": "Universal product code",
                    "value_name": "3583787891193"
                }
            ]
        }
    ]
}'
```

Response:

```javascript
{
    "item_id": "CBT2585116826",
    "seller_id": 1684508097,
    "site_id": "CBT",
    "site_items": [
        {
            "item_id": "MLB5557550000",
            "seller_id": 1684512222,
            "site_id": "MLB",
            "logistic_type": "remote"
        },
        {
            "item_id": "MLC3023561111",
            "seller_id": 1686733333,
            "site_id": "MLC",
            "logistic_type": "remote"
        }
    ]
}
```

When net\_proceeds is properly configured, performing a **GET** request to the **/marketplace/items** endpoint will return a response that includes the **net\_proceeds\_prices** tag. This tag indicates that the item contains information related to the breakdown of the net amount the seller receives after a sale.

The net amount is detailed within the **net\_proceeds** node, which includes:

- The **amount** field: the total net value the seller will receive from the sale of the item.
- The **additional\_concepts** list: a breakdown of deductions applied to the item's price. Each object in this list represents an associated cost, such as:
  
  - **shipping\_cost**: the shipping cost assumed by the seller.
  - **sale\_fee**: the commission charged by the platform on the sale.

These values provide greater clarity on how the item's final price (Listing price) is broken down into costs and net proceeds, enabling more accurate financial analysis, strategic pricing decisions, and transaction transparency.

Example of Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'x-format-new: true' https://api.mercadolibre.com/marketplace/items/MCO2996325000
```

Response:

```javascript
{
    "id": "MCO2996325000",
    "site_id": "MCO",
    "date_created": "2025-08-07T13:59:11.965Z",
    "title": "Test Item Bola De Fútbol",
    "price": 112.92,
    "currency_id": "USD",
    "net_proceeds": {
        "amount": 75,
        "additional_concepts": [
            {
                "id": "shipping_cost",
                "amount": 13.64
            },
            {
                "id": "sale_fee",
                "amount": 24.28
            }
        ],
        "currency_id": "USD"
    },
    "tags": [
        "net_proceeds_prices",
        "cbt_item"
    ]
}
```

## Validations

Our goal is to improve the quality of our sellers' listings. For this reason [you have a flow that validates consistencies](https://global-selling.mercadolibre.com/devsite/validations-cbt).

## Activate in another marketplace

Recommendation:

Use the [multi-marketplace tool](https://global-selling.mercadolibre.com/devsite/multi-marketplace-tool?nocache=true) for remote logistics. It simplifies your sellers' experience by analyzing listing performance and recommending other marketplaces for publishing. Also, you can activate and deactivate automatic listings.

If you have an existing listing in one (or more) of our marketplaces, you can publish the same product in other marketplaces that you did not consider before, using the information of the existing listing. For example, if you have a listing in Brazil (MLB) and you want to sell the same product in Mexico (MLM), you can make the following request with the existing global listing, specifying the new marketplaces where you want to sell.

Remember that you can set a different price in each marketplace, you can specify this information with the field "price" under the "sites\_to\_sell " field. If no price is sent, the product will use the price set on the global listing.

Also, you can create the listing with a different listing type (available for MLB, MLC and MCO), specify this information under "sites\_to\_sell" with the field "listing\_type\_id".

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Content-Type: application/json' https://api.mercadolibre.com/global/items/CBT2796239245 -d
{
    "sites_to_sell": [
        {
            "site_id": "MCO",
            "logistic_type": "remote",
            "listing_type_id": "gold_pro",
            "price": 70
        }
    ]
}
```

Response:

```javascript
{
    "item_id": "CBT2796239245",
    "seller_id": 2560656533,
    "site_id": "CBT",
    "parent_user_product_id": "CBTU3667934350",
    "site_items": [
        {
            "item_id": "MCO3380520068",
            "seller_id": 2565546854,
            "site_id": "MCO",
            "logistic_type": "remote"
        }
    ]
}
```

## Delete items

In order to delete marketplace items, the item to delete must be in a paused or closed state and then make the same PUT:

Example:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/global/items/CBT946690995 -d 
{
   "site_id": "MLM",
   "logistic_type": "remote",
   "deleted": true
}
```

Response:

```javascript
{
    "status": 200,
    "message": "OK"
}
```

Note:

Once the marketplace items are deleted, the global item (CBTXXXXXXX) will be deleted by the automatic processes from Mercado Libre. This action cannot be done through our APIs.

## Guide to modify items

To modify items, please refer to our complete documentation: [Update items](https://global-selling.mercadolibre.com/devsite/sync-and-modify-listings-gs).