# Items & Searches

**Tags:** Searches,items,search
**Created:** 2020-05-08T00:21:50Z
**Last Updated:** 2026-01-15T19:58:55Z

---

## Items &amp; Searches

The Items &amp; Searches API allows you to retrieve item information (listing) and search for items within your seller account. For Global Selling (CBT) integrations, use the authenticated endpoints to access your listings across all marketplaces.

## Summary of available resources

Resource Description Example **/marketplace/users/(User\_id)/items/search?q=$TEXT\_TO\_SEARCH** Get items by a search query. [GET](#modal1)

[Go back.](#close) [X](#close "Close")

### Get items by a search query.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/$USER_ID/items/search?q=$TEXT_TO_SEARCH
```

### Response

```javascript
{
    "seller_id": "2560656533",
    "results": [
        "CBT2518294370"
    ],
    "paging": {
        "limit": 50,
        "offset": 0,
        "total": 1
    }
}
```

**/marketplace/users/(User\_id)/items/search?category\_id=$CATEGORY\_ID** Get items listed in a category. [GET](#modal2)

[Go back.](#close) [X](#close "Close")

### Get items listed in a category.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/$USER_ID/items/search?category_id=$CATEGORY_ID
```

### Response

```javascript
{
    "seller_id": "2560656533",
    "results": [
        "CBT2518294370"
    ],
    "paging": {
        "limit": 50,
        "offset": 0,
        "total": 1
    }
}
```

**/sites/$SITE\_ID/search?nickname=$NICKNAME** Get items from the listings by nickname. [GET](#modal3)

[Go back.](#close) [X](#close "Close")

### Get items from the listings by nickname.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/sites/$SITE_ID/search?nickname=$NICKNAME
```

### Response

```javascript
{
    "results": [
        {
            "id": "MLM12345678"
        }
    ]
}
```

**/marketplace/users/(User\_id)/items/search** Can list items by seller. [GET](#modal4)

[Go back.](#close) [X](#close "Close")

### Can list items by seller.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/2560656533/items/search
```

### Response

```javascript
{
    "seller_id": "2560656533",
    "results": [
        "CBT2518294370",
        "CBT2777715207"
    ],
    "paging": {
        "limit": 50,
        "offset": 0,
        "total": 2
    }
}
```

**/items?ids=$ITEM\_ID1,$ITEM\_ID2** Multiget with multiple numbers of items. **Only for global listings.** [GET](#modal5)

[Go back.](#close) [X](#close "Close")

### Multiget with multiple numbers of items.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items?ids=CBT2518294370
```

### Response

```javascript
[
    {
        "code": 200,
        "body": {
            "id": "CBT2518294370",
            "site_id": "CBT",
            "title": "Game Test Play Toy",
            "price": 83
        }
    }
]
```

**/users?ids=$USER\_ID1,$USER\_ID2** Multiget with multiple numbers of users. [GET](#modal6)

[Go back.](#close) [X](#close "Close")

### Multiget with multiple numbers of users.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users?ids=2560656533
```

### Response

```javascript
[
    {
        "code": 200,
        "body": {
            "id": 2560656533,
            "nickname": "TESTUSER667696975",
            "site_id": "CBT"
        }
    }
]
```

**/items?ids=$ITEM\_ID1,$ITEM\_ID2&amp;attributes=$ATTRIBUTE1...** Multiget of items selecting only the fields of interest. **Only for global listings.** [GET](#modal7)

[Go back.](#close) [X](#close "Close")

### Multiget selecting fields.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items?ids=CBT2518294370&attributes=id,title,price,category_id
```

### Response

```javascript
[
    {
        "code": 200,
        "body": {
            "id": "CBT2518294370",
            "title": "Game Test Play Toy",
            "category_id": "CBT11625",
            "price": 83
        }
    }
]
```

**/marketplace/users/$USER\_ID/items/search?search\_type=scan** To get more than 1000 records. [GET](#modal8)

[Go back.](#close) [X](#close "Close")

### Search mode above 1000 records.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/$USER_ID/items/search?search_type=scan
```

### Response

```javascript
{
    "scroll_id": "eyJpZCI6IkNCVDI3Nzc3MTUyMDciLCJ...",
    "seller_id": "2560656533",
    "results": ["CBT2518294370"],
    "paging": {
        "limit": 50,
        "total": 2
    }
}
```

**/items/$ITEM\_ID/marketplace\_items** To get the mapping between an item on the global site and the marketplace items. [GET](#modal9)

[Go back.](#close) [X](#close "Close")

### Get the items mappings.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/CBT2518294370/marketplace_items
```

### Response

```javascript
{
    "item_id": "CBT2518294370",
    "marketplace_items": [
        {
            "item_id": "MLM2374731499",
            "site_id": "MLM"
        }
    ]
}
```

## Values in sold\_quantity and available\_quantity fields

In the public resources of Items and Searches, the information of the "sold\_quantity" and "available\_quantity" fields will be referential with the following values:

### sold\_quantity

Real data Reference 11 22 33 44 55 RANGO\_6\_255 RANGO\_26\_5025 RANGO\_51\_10050 RANGO\_101\_150100 RANGO\_151\_200150 RANGO\_201\_250200 RANGO 251 500250 RANGO\_501\_5000500 RANGO\_5001\_500005000 RANGO\_50001\_50000050000

### available\_quantity

Real data Reference RANGO\_1\_501 RANGO\_51\_10050 RANGO\_101\_150100 RANGO\_151\_200150 RANGO 201 \_250200 RANGO\_251\_500250 RANGO\_501\_5000500 RANGO\_5001\_500005000 RANGO\_50001\_9999950000

## Get user listings

Retrieve all listings from your seller account. This is the recommended method for CBT integrations.

### Call

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/$USER_ID/items/search
```

### Example

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/2560656533/items/search
```

### Response

```javascript
{
  "seller_id": "2560656533",
  "results": [
    "CBT2518294370",
    "CBT2777715207"
  ],
  "paging": {
    "limit": 50,
    "offset": 0,
    "total": 2
  }
}
```

## Search with status filter

Listings linked to a user can be filtered by status type, both Global Listings (CBT) and Site Listings.

### Required Parameters

- **user\_id:** The user ID (merchant) for whom the search will be performed.
- **offset and limit:** Parameters used to paginate results. Optional fields, defaults are 0 and 50.
- **status:** The listing status to filter by (a list), such as: status=pending, active, paused, deleted (inactive).
- **search\_type:** The type of search to perform (e.g., search, scan). Optional field, defaults to search.

Note:

Inactive listings have a sub\_status "deleted," which can be used to filter listings with inactive status (only for site listings).

**User Structure in Global Selling (CBT)**  
In Mercado Libre's Global Selling model, there is a user hierarchy for handling cross-border operations:

• **Merchant ID (Global User):** The "Parent" user. It has site\_id: "CBT." It is the owner of the authentication and generates the main access\_token. It manages local users.  
• **Seller ID (Marketplace User):** These are the "Child" users belonging to specific site\_ids (e.g., MLM, MLB). Associated with a logistics type, they publish items and receive orders.

Both appear in the "user\_id" field.

**Relationship Endpoint**  
To programmatically obtain this structure, consult the mapping endpoint using the Global User ID:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/$MERCHANT_ID
```

```javascript
{
  "user_id": 471826944,
  "site_id": "CBT",
  "marketplaces": [
    {
      "user_id": 471828584,
      "site_id": "MLM",
      "logistic_type": "remote"
    },
    {
      "user_id": 471830260,
      "site_id": "MLB",
      "logistic_type": "remote"
    },
    {
      "user_id": 538932857,
      "site_id": "MLC",
      "logistic_type": "fulfillment"
    }
  ]
}
```

## Global Listings (CBT) by status

To consult Global Listings, it is necessary to use the parent user\_id (merchant).

#### Call

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/{merchant_id}/items/search?status=paused
```

#### Example

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/1684344969/items/search?status=paused
```

## Site Listings by status

To consult specific marketplace listings, it is necessary to use the child user\_id (seller\_id).

#### Call (MLM listings)

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/625822648/items/search?status=active
```

Note:

Listings can be searched using different filters, such as category\_id, status, and text.

## By SKU

- **Seller\_custom\_field:** If the item contains a SKU in the "seller\_custom\_field" field, you can try as follows:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/$USER_ID/items/search?sku=$SELLER_CUSTOM_FIELD
```

- **Seller\_sku:** If the item contains a SKU in the "SELLER\_SKU" field, you can try like this:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/$USER_ID/items/search?seller_sku=$SELLER_SKU
```

## With/without product identifier

Using the parameters:

- **missing\_product\_identifiers=true:** get items that do not have a Product Identifier loaded or submitted.
- **missing\_product\_identifiers=false:** get the list of listings with PIs uploaded or sending.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/$USER_ID/items/search?missing_product_identifiers=true
```

## Items with loss of exposure

Important:

This functionality is available for listings selling in Mexico (MLM), Chile (MLC), and Brazil (MLB).

Identify listings losing exposure due to claims or cancellations:

- **unhealthy:** listings already losing exposure.
- **warning:** listings that could lose exposure.
- **healthy:** listings not impacted.

### Parameters

Parameter Type Description reputation\_health\_gaugeStringFilter items by health status. Values: unhealthy, warning, healthy.

## Filter and sort the results of the seller's listings

Inside the resource /users/(user\_id)/items/search? there are the "available\_orders" and "available\_filters" fields.

Note:

The /marketplace/users/{USER\_ID}/items/search resource does not show the 'filters' blocks by default. To see them, add the parameter **include\_filters=true**.

**How to order?** Add "orders" with the available ID, for example: "start\_time\_desc."

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/$USER_ID/items/search?orders=start_time_desc
```

Note:

By default, it already comes with a stop\_time\_asc order applied.

**How to filter?** For example, to filter listings with listing\_type "gold\_pro":

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/$USER_ID/items/search?listing_type_id=gold_pro
```

## Filter by free shipping

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/$USER_ID/items/search?labels=with_free_shipping
```

Note:

Search resources do not replace the use of item notifications. This ensures consistent and up-to-date integration.

## Errors

Code Type Message Solution 400 bad\_request handler error, bad request no site\_id provided Verify site\_id is valid. 404 not\_found Item not found Verify item ID format.