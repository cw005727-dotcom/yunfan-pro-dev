# Manage Promotions

**Tags:** Manage,Promotions,EN
**Created:** 2021-05-20T12:11:17Z
**Last Updated:** 2026-01-15T15:47:15Z

---

## Manage promotions

Important:

Starting from 08/28, the maximum discount limit allowed changes from 70% to 80%.  
This change applies to all seller-configurable modalities: LIGHTNING, DOD, SELLER\_CAMPAIGN, DEAL, PRICE\_DISCOUNT  
.

With the **/seller-promotions** resource you can centralize all available promotion types such as **traditional campaigns** (DEAL), **co-funded campaigns** by Mercado Libre (MARKETPLACE CAMPAIGN), **individual discounts** (PRICE DISCOUNT), **flash deals** (LIGHTNING), **deal of the day** (DOD), **volume discount** (VOLUME), **pre-negotiated item discount** (PRE NEGOTIATED), **seller campaign** (SELLER\_CAMPAIGN), **automated co-funded campaigns** (SMART), **competitive pricing campaigns** (PRICE\_MATCHING), **Full stock clearance campaign** (UNHEALTHY\_STOCK) and **seller coupon campaigns** (SELLER\_COUPON\_CAMPAIGN). In addition to new offer types we make available.

## Promotion characteristics

Campaign name Campaign type Price definition Price suggestion MELI bonus Stock to participate Deadline Approval **Traditional** DEAL User defines No No No Yes Yes **Co-funded** MARKETPLACE CAMPAIGN User accepts No Yes No Yes No **Volume discount** VOLUME User accepts No Yes No Yes No **Deal of the day** DOD User defines Yes No Yes, informative No No **Flash deal** LIGHTNING User defines Yes No Yes, mandatory No No **Pre-negotiated item discount** PRE\_NEGOTIATED User agrees and accepts No Yes Yes Yes No **Seller campaign** SELLER CAMPAIGN User defines and accepts No No No Yes No **Automated co-funded campaign** SMART User accepts No Yes No Yes No **Competitive pricing campaign** PRICE\_MATCHING User accepts No Yes No Yes No **Full stock clearance campaign** UNHEALTHY\_STOCK User agrees and accepts No Yes Yes Yes No

## Availability by country

Site **Traditional campaigns**  
(DEAL) **Co-funded campaign**  
(MARKETPLACE CAMPAIGN) **Individual discount**  
(PRICE DISCOUNT) **Volume discount**  
(VOLUME) **Pre-negotiated item discount**  
(PRE\_NEGOTIATED) **Deal of the day**  
(DOD) **Flash deal**  
(LIGHTNING) **Automated co-funded campaign**  
(SMART) **Competitive pricing campaign**  
(PRICE\_MATCHING) **Full stock clearance campaign**  
(UNHEALTHY\_STOCK) **Seller campaign**  
(SELLER\_CAMPAIGN) **MLA, MLB, MLM, MCO, MLC, MLU, MPE** **MLV and MEC**

Note:

Seller coupon campaigns (SELLER\_COUPON\_CAMPAIGN) are available only for MLB.

## Seller promotions

Remember that a user can have more than one invitation and of different types.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/seller-promotions/users/$USER_ID?app_version=v2
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/seller-promotions/users/1356551933?app_version=v2
```

Response:

```javascript
{
  "results": [
    {
      "id": "P-MLB1806015",
      "type": "MARKETPLACE_CAMPAIGN",
      "status": "started",
      "start_date": "2023-04-20T02:00:00Z",
      "finish_date": "2023-08-01T02:00:00Z",
      "deadline_date": "2023-08-01T01:00:00Z",
      "name": "Campanha de teste v2",
      "benefits": {
        "type": "REBATE",
        "meli_percent": 5,
        "seller_percent": 25
      }
    },
    {
      "id": "P-MLB1806017",
      "type": "VOLUME",
      "status": "started",
      "start_date": "2023-04-20T03:00:00Z",
      "finish_date": "2023-08-01T02:00:00Z",
      "deadline_date": "2023-08-01T01:00:00Z",
      "name": "Leva 3 paga 2",
      "benefits": {
        "type": "VOLUME",
        "meli_percent": 9.9999,
        "seller_percent": 23.3331,
        "name": "3x2",
        "buy_quantity": 3,
        "pay_quantity": 2,
        "item_discount_percent": 33.333
      }
    },
    {
      "id": "P-MLB1806019",
      "type": "DEAL",
      "status": "started",
      "start_date": "2023-04-20T03:00:00Z",
      "finish_date": "2023-08-01T02:00:00Z",
      "deadline_date": "2023-08-01T01:00:00Z",
      "name": "deals de teste v2"
    },
    {
      "id": "P-MLB1809008",
      "type": "DEAL",
      "status": "started",
      "start_date": "2023-04-21T21:00:00Z",
      "finish_date": "2023-08-01T02:00:00Z",
      "deadline_date": "2023-08-01T01:00:00Z",
      "name": "Deals de test v2"
    },
    {
      "id": "P-MLB1809009",
      "type": "DEAL",
      "status": "started",
      "start_date": "2023-04-21T23:00:00Z",
      "finish_date": "2023-08-01T02:00:00Z",
      "deadline_date": "2023-08-01T01:00:00Z",
      "name": "campanha de teste"
    }
  ],
  "paging": {
    "offset": 0,
    "limit": 50,
    "total": 5
  }
}
```

### Response fields

**id**: offer identification code.  
**type**: offer type (DEAL, MARKETPLACE\_CAMPAIGN, DOD, LIGHTNING, VOLUME, PRICE DISCOUNT, PRE\_NEGOTIATED, SELLER\_CAMPAIGN, SMART, PRICE\_MATCHING, UNHEALTHY\_STOCK and SELLER\_COUPON\_CAMPAIGN).  
**status**: [Status](#Status)  
**start\_date**: offer start date.  
**finish\_date**: offer end date.  
**deadline\_date**: maximum deadline to accept the invitation.  
**name**: promotion name.  
**deadline\_date**: maximum deadline to add items to the promotion.  
**benefits**: promotion benefits configuration.

## Query candidate items

The **/seller-promotions/candidates** resource allows you to identify items invited to participate in a promotion. Whenever an item obtains the **candidate** status in a promotion, a notification is sent with the **candidate\_id**. With this resource, you can identify the item, the promotion, and the status.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN'  https://api.mercadolibre.com/seller-promotions/candidates/$CANDIDATE_ID?app_version=v2
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN'  https://api.mercadolibre.com/seller-promotions/candidates/CANDIDATE- MLB1254949426-803130663?app_version=v2
```

Response:

```javascript
{
  "id": "CANDIDATE-MLB1254949426-803130663",
  "item_id": "MLB1254949426",
  "promotion_id": "P-MLB4629001",
  "type": "MARKETPLACE_CAMPAIGN",
  "status": {
    "id": "candidate"
  }
}
```

**Response fields**

**id**: candidate identification code.

**item\_id**: item associated with the candidate.

**promotion\_id**: promotion id.

**type**: promotion type (DEAL, MARKETPLACE\_CAMPAIGN, DOD, LIGHTNING, VOLUME, PRICE DISCOUNT, PRE\_NEGOTIATED, SELLER\_CAMPAIGN, SMART, PRICE\_MATCHING, UNHEALTHY\_STOCK and SELLER\_COUPON\_CAMPAIGN).

**status**: candidate status.

Note:

The candidate id is obtained through the **public candidate** topic notification.

## Query offers

The **/seller-promotions/offers** resource allows you to identify changes in an item's offer. All changes are sent through notifications with the **offer\_id**. You can identify the item, the promotion, and the status.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/seller-promotions/offers/$OFFERS_ID?app_version=v2
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/seller-promotions/offers/OFFER-MLB1970246686-42701792?app_version=v2
```

Response:

```javascript
{
  "id": "OFFER-MLB1970246686-42701792",
  "item_id": "MLB1970246686",
  "promotion_id": "P-MLB3329001",
  "type": "DEAL",
  "status": {
    "id": "ACTIVE"
  }
}
```

### Response fields

**id**: offer identification code.  
**item\_id**: item associated with the offer.  
**promotion\_id**: promotion id.  
**type**: promotion type (DEAL, MARKETPLACE\_CAMPAIGN, DOD, LIGHTNING, VOLUME, PRICE DISCOUNT, PRE\_NEGOTIATED, SELLER\_CAMPAIGN, SMART, PRICE\_MATCHING, UNHEALTHY\_STOCK and SELLER\_COUPON\_CAMPAIGN).  
**status**: offer status. (programmed, active, and inactive).

Note:

The offer id is obtained through a notification from the [public offers](/en_us/products-receive-notifications?#public-offers) topic.

## Query promotion details

Make the following query to access the particular details of a traditional campaign, co-funded campaign, and volume discounts.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/seller-promotions/promotions/$PROMOTION_ID?promotion_type=$PROMOTION_TYPE&app_version=v2
```

For more information, access the documentation for each campaign.

## Status

Below you can find the possible statuses that different promotion types can have:

- [Traditional campaign statuses](https://developers.mercadolibre.com.ar/en_us/deals?#Statuses)
- [Co-funded campaign status](https://developers.mercadolibre.com.ar/en_us/co-funded-campaigns?#Statuses)
- [Quantity discount campaign status](https://developers.mercadolibre.com.ar/en_us/quantity-discount-campaigns#Statuses)
- [Pre-negotiated item discount and Full stock clearance campaign status](https://developers.mercadolibre.com.ar/en_us/pre-negotiated-item-discount#Campaign-statuses)
- [Automated co-funded campaign and competitive pricing campaigns status](https://developers.mercadolibre.com.ar/en_us/smart-price-matching-campaigns#Statuses)
- [Seller coupons](https://developers.mercadolibre.com.ar/en_us/seller-coupons)

## Query promotion items

Note:

This query returns the item status in the campaign.

To find out which items are part of a specific offer, you can make the following query:

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/seller-promotions/promotions/$PROMOTIONS_ID/items?promotion_type=PROMOTIONS_TYPE&app_version=v2
```

Additionally, you can query items from a campaign:

- [Traditional](https://developers.mercadolibre.com.ar/en_us/deals#Query-items-in-a-traditional-campaign)
- [Co-funded](https://developers.mercadolibre.com.ar/en_us/co-funded-campaigns#Query-items-in-a-co-funded-campaign)
- [Quantity discount](https://developers.mercadolibre.com.ar/en_us/quantity-discount-campaigns)
- [Pre-negotiated item discount and Full stock clearance campaign](https://developers.mercadolibre.com.ar/en_us/pre-negotiated-item-discount)
- [Deal of the day](https://developers.mercadolibre.com.ar/en_us/deal-of-the-day#Query-items-in-a-deal-of-the-day)
- [Flash deal](https://developers.mercadolibre.com.ar/en_us/flash-deals#Query-items-in-a-flash-deal)
- [Seller campaign](https://developers.mercadolibre.com.ar/en_us/seller-campaigns?nocache=true)
- [Automated co-funded and competitive pricing campaigns](https://developers.mercadolibre.com.ar/en_us/smart-price-matching-campaigns)
- [Seller coupons](https://developers.mercadolibre.com.ar/en_us/seller-coupons)

## Filters

You can apply filters by item\_id, status, and status\_item:

- **item\_id:** Allows filtering by a specific item.
- **status:** Allows filtering by offer status: **started**, **pending**, or **candidate**.
- **status\_item:** Allows filtering by the status of items that are part of the campaign, which can be **active** or **paused**.

Note:

When the status\_item filter is sent, only items corresponding to the queried status are returned: "active" or "paused". If this parameter is not included, the query returns only items active on Mercado Libre by default.  
If a value other than "active" or "paused" is sent, a **400 - Bad Request** will be returned.  
.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/seller-promotions/promotions/$PROMOTION_ID/items?promotion_type=$PROMOTION_TYPE&status=$STATUS&item_id=$ITEM_ID&app_version=v2
```

Filter by item\_id example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/seller-promotions/promotions/MLA1111/items?promotion_type=DEAL&item_id=MLA604400000&app_version=v2
```

Response:

```javascript
{
  "results": [
    {
      "id": "MLA604400000",
      "status": "started",
      "price": 23968,
      "original_price": 28549
    }
  ],
  "paging": {}
}
```

Filter by status example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' /seller-promotions/promotions/MLA1111/items?promotion_type=DEAL&status=started&app_version=v2
```

Response:

```javascript
{
  "results": [
    {
      "id": "MLA639970000",
      "status": "started",
      "price": 4037,
      "original_price": 4427
    },
    {
      "id": "MLA639973333",
      "status": "started",
      "price": 6007,
      "original_price": 6587
    }
  ],
  "paging": []
}
```

Filter by status\_item example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' /seller-promotions/promotions/MLA1111/items?promotion_type=DEAL&status_item=active&app_version=v2
```

Response:

```javascript
{
  "results": [
    {
      "id": "MLA639970000",
      "status": "started",
      "price": 4037,
      "original_price": 4427
    },
    {
      "id": "MLA639973333",
      "status": "started",
      "price": 6007,
      "original_price": 6587
    }
  ],
  "paging": []
}
```

## Pagination

Important:

\- The query param to send this value **is now called search\_after** and no longer searchAfter. However, searchAfter will continue to be accepted for a while.  
\- **The search\_after value is unified** to only use distinct values, eliminating ambiguity.

To paginate, you must use the search\_after parameter.  
In the GET response, we return the searchAfter parameter, which will be used to traverse the results. To do this, you must retrieve that ID and make the following request with the query param search\_after={search\_after}. This ID is a string, so you must accept the string and use it in your subsequent calls.

Note:

If you don't use the limit parameter, 50 items from the total will be returned by default. You can add a maximum limit of 50.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' 'https://api.mercadolibre.com/seller-promotions/promotions/$PROMOTIONS_ID/items?promotion_type=$PROMOTION_TYPE&app_version=v2&limit=50&search_after={$SEARCH_AFTER}'
```

Pagination example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' 'https://api.mercadolibre.com/seller-promotions/promotions/P-MLB13451002MLB9377/items?promotion_type=DEAL&app_version=v2&limit=50&search_after=d3e3fb02371ca8e49ceb3e998c4a1b8da189235497375e55d3027c7dacf5a4ef0175b2aaca4f4a0fdf31299947d82ba661037482172ba7f9cfb1b0250d3134aa71c889367aa7c1401e4c3ff5bd70ee14337dfaa18c99bbe5e52dc3a2c1b55b195131903ecbc60a1c639e01dbecf11b15126d4b38cdb6122182acde2eca1b1a42'
```

Response:

```javascript
{
  "results": [
    {
      "id": "MLB2674512266",
      "status": "candidate",
      "price": 0,
      "original_price": 0
    },
    {
      "id": "MLB2674506199",
      "status": "candidate",
      "price": 0,
      "original_price": 0
    },
    {
      "id": "MLB2674506138",
      "status": "candidate",
      "price": 0,
      "original_price": 0
    },
    {
      "id": "MLB2674505931",
      "status": "candidate",
      "price": 0,
      "original_price": 0
    },
    {
      "id": "MLB2674505924",
      "status": "candidate",
      "price": 0,
      "original_price": 0
    }
  ],
  "paging": {
    "searchAfter": "d3e3fb02371ca8e49ceb3e998c4a1b8da189235497375e55d3027c7dacf5a4ef0175b2aaca4f4a0fdf31299947d82ba661037482172ba7f9cfb1b0250d3134aa71c889367aa7c1401e4c3ff5bd70ee14337dfaa18c99bbe5e52dc3a2c1b55b195131903ecbc60a1c639e01dbecf11b15126d4b38cdb6122182acde2eca3b5b55",
    "limit": 50,
    "total": 14424
  }
}
```

### Considerations

- search\_after will be returned on all pages except the last one.
- The only way to advance through the response (paginate) is by using this parameter.
- When iterating through results, each call will return the search\_after that should be used in the next call.
- You should always use the search\_after provided by the response of the request, as it can change and expire (they have a TTL of 5 minutes).
- Backward pagination is not possible.

## How to participate

You can participate in different types of promotions and even offer an individual discount for items:

- [Adding items to a traditional campaign](/en_us/deals?#Add-items-to-a-traditional-campaign).
- [Adding items to a co-funded campaign](/en_us/co-funded-campaigns?#Add-items-to-a-co-funded-campaign).
- [Adding items to a volume discount campaign](/en_us/volume-discount-campaigns#Add-items-to-a-volume-discount-campaign).
- [Accepting pre-negotiated item discount](/en_us/pre-negotiated-item-discount#Accept-pre-negotiated-item-discount).
- [Adding items to a deal of the day](/en_us/deal-of-the-day#Add-items-to-a-deal-of-the-day).
- [Adding items to a flash deal](en_us/flash-deals#Add-items-to-a-flash-deal).
- [Offering an individual discount for an item](/en_us/individual-discount%20#Offer-a-discount-for-an-item).
- [Adding items to a seller campaign.](/en_us/seller-campaigns?nocache=true)
- [Adding items to a smart campaign.](/en_us/smart-campaigns?nocache=true)

## Query item promotions

This resource returns all promotions associated with an item. The response indicates the item's participation status in each promotion and the corresponding price at the time of the query. It does not include general promotion information.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/seller-promotions/items/$ITEM_ID?app_version=v2
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/seller-promotions/items/MLB3538191898?app_version=v2
```

Response:

```javascript
{
  "id": "C-MLB13967",
  "type": "SELLER_COUPON_CAMPAIGN",
  "sub_type": "FIXED_PERCENTAGE",
  "fixed_percentage": 15,
  "status": "candidate",
  "price": 0,
  "original_price": 20,
  "start_date": "2025-09-03T00:00:00",
  "finish_date": "2025-09-09T23:59:59",
  "name": "Test"
}
{
  "id": "C-MLB139959",
  "type": "SELLER_COUPON_CAMPAIGN",
  "sub_type": "FIXED_AMOUNT",
  "fixed_amount": 10,
  "status": "started",
  "price": 0,
  "original_price": 20,
  "start_date": "2025-09-03T00:00:00",
  "finish_date": "2025-09-09T23:59:59",
  "name": "Esportivo"
}
{
  "id": "P-MLB4912006",
  "type": "PRICE_MATCHING_MELI_ALL",
  "ref_id": "OFFER-MLB4141870813-10000236971",
  "status": "started",
  "price": 18.2,
  "meli_percentage": 9,
  "seller_percentage": 0,
  "original_price": 20,
  "name": "test_Livre"
}
{
  "id": "P-MLB5108026",
  "type": "SMART",
  "ref_id": "CANDIDATE-MLB5457079540-70000147624",
  "status": "candidate",
  "price": 82.67,
  "meli_percentage": 4.6,
  "seller_percentage": 12.7,
  "original_price": 100,
  "name": "Promo test "
}
{
  "type": "PRICE_DISCOUNT",
  "status": "candidate",
  "price": 0,
  "original_price": 20,
  "name": "",
  "min_discounted_price": 6,
  "max_discounted_price": 19,
  "suggested_discounted_price": 18
}
{
  "type": "PRICE_DISCOUNT",
  "status": "started",
  "price": 14,
  "original_price": 20,
  "start_date": "2025-09-09T00:00:00",
  "finish_date": "2025-09-10T23:59:59",
  "name": ""
}
{
  "id": "C-MLB13962",
  "type": "SELLER_CAMPAIGN",
  "sub_type": "FLEXIBLE_PERCENTAGE",
  "status": "candidate",
  "price": 0,
  "original_price": 20,
  "start_date": "2025-09-02T00:00:00",
  "finish_date": "2025-09-08T23:59:59",
  "name": "desc por porc",
  "min_discounted_price": 6,
  "max_discounted_price": 19,
  "suggested_discounted_price": 18
}
{
  "id": "C-MLB14160",
  "type": "SELLER_CAMPAIGN",
  "sub_type": "FLEXIBLE_PERCENTAGE",
  "status": "started",
  "price": 14,
  "original_price": 20,
  "start_date": "2025-09-09T00:00:00",
  "finish_date": "2025-09-15T23:59:59",
  "name": "seller campaign"
},
{
  "id": "LGH-MLB1000",
  "type": "LIGHTNING",
  "ref_id": "CANDIDATE-MLB4141935865-70000146658",
  "status": "candidate",
  "price": 0,
  "original_price": 18.99,
  "min_discounted_price": 5.7,
  "max_discounted_price": 18.04,
  "suggested_discounted_price": 17.1,
  "stock": {
    "min": 1,
    "max": 2
  }
},
{
  "id": "LGH-MLB1000",
  "type": "LIGHTNING",
  "ref_id": "OFFER-MLB4141870813-10000237588",
  "status": "pending",
  "price": 12.9,
  "original_price": 20,
  "stock": {
    "remaining_stock": 1
  }
},
{
  "id": "DOD-MLB1000",
  "type": "DOD",
  "ref_id": "CANDIDATE-MLB4141935865-70000146656",
  "status": "candidate",
  "price": 10.99,
  "original_price": 18.99,
  "min_discounted_price": 5.7,
  "max_discounted_price": 18.04,
  "suggested_discounted_price": 17.1,
  "stock": {
    "min": 1,
    "max": 2
  }
},
{
  "id": "DOD-MLB1000",
  "type": "DOD",
  "ref_id": "OFFER-MLB4141870813-10000237589",
  "status": "pending",
  "price": 12.9,
  "original_price": 20,
  "stock": {}
}
{
  "id": "P-MLB5106026",
  "type": "DEAL",
  "status": "started",
  "price": 13.26,
  "original_price": 18.99,
  "start_date": "2025-07-30T16:00:00-03:00",
  "finish_date": "2025-10-04T23:00:00-03:00",
  "name": "Test_nuevo "
},
{
  "id": "P-MLB5106026",
  "type": "DEAL",
  "status": "candidate",
  "price": 0,
  "original_price": 18.99,
  "start_date": "2025-07-30T16:00:00-03:00",
  "finish_date": "2025-10-04T23:00:00-03:00",
  "name": "Test Tier 1 - nuevo ",
  "min_discounted_price": 5.7,
  "max_discounted_price": 18.04,
  "suggested_discounted_price": 17.1
},
{
  "id": "P-MLB4914006",
  "type": "MARKETPLACE_CAMPAIGN",
  "status": "candidate",
  "price": 80,
  "meli_percentage": 4,
  "seller_percentage": 16,
  "original_price": 100,
  "start_date": "2025-07-10T18:00:00Z",
  "finish_date": "2025-09-27T02:00:00Z",
  "name": "Test_refresh "
},
{
  "id": "P-MLB4914006",
  "type": "MARKETPLACE_CAMPAIGN",
  "status": "started",
  "price": 80,
  "meli_percentage": 4,
  "seller_percentage": 16,
  "original_price": 100,
  "start_date": "2025-07-10T18:00:00Z",
  "finish_date": "2025-09-27T02:00:00Z",
  "name": "Test_refresh "
},
{
  "id": "P-MLU4942004",
  "type": "PRE_NEGOTIATED",
  "ref_id": "CANDIDATE-MLU760878674-70000115453",
  "status": "candidate",
  "price": 4338,
  "meli_percentage": 4.2,
  "seller_percentage": 4.2,
  "original_price": 4738,
  "name": "prene_test"
},
{
  "id": "P-MLB5128002",
  "type": "BANK",
  "ref_id": "OFFER-MLB4141935865-10000237044",
  "sub_type": "COFINANCED",
  "status": "started",
  "meli_percentage": 6,
  "seller_percentage": 8,
  "original_price": 18.99,
  "start_date": "2025-09-04T11:54:50Z",
  "finish_date": "2025-10-05T02:00:00Z",
  "name": "Desconto no Pix",
  "payment_method": "PIX"
},
{
  "id": "P-MLB5128002",
  "type": "BANK",
  "ref_id": "CANDIDATE-MLB4141921895-70000146801",
  "sub_type": "COFINANCED",
  "status": "candidate",
  "meli_percentage": 6,
  "seller_percentage": 8,
  "original_price": 239.78,
  "start_date": "2025-08-01T14:00:00Z",
  "finish_date": "2025-10-05T02:00:00Z",
  "name": "Desconto no Pix",
  "payment_method": "PIX"
}
```

### Response fields:

**id**: Promotion identifier

**status**: Specific item status in the promotion:

- **candidate**: The item is eligible and can participate in the promotion
- **started**: The item is actively participating in the promotion
- **pending**: The item was opted in but the offer has not yet started

**original\_price**: item price without discount.

**min\_discounted\_price**: Minimum price allowed in the promotion. Reflects the maximum possible discount for the item.

**max\_discounted\_price**: Maximum price at which the item can be offered in the promotion, ensuring credible discounts.

**suggested\_discounted\_price**: Suggested price for an attractive offer, based on the item's history and context. It can be null if no suggestion is available.

#### **By promotion**

**Deal**

**top\_deal\_price**: Exclusive price available only for featured buyers (Mercado Puntos levels 3 and 6). This field only appears if the item is active in the campaign and the seller configured it when joining.

**Marketplace campaign**

**ref\_id**: offer or candidate id (present only when status is started).

**meli\_percentage**: Discount percentage contributed by Mercado Libre.

**seller\_percentage**: Discount percentage contributed by the seller.

**price**: item price in the campaign

**Seller campaign**

**sub\_type**: FLEXIBLE\_PERCENTAGE.

**price**: item price in the campaign

**Volume**

**buy\_quantity/pay\_quantity\_discount\_percentage**: completed according to the promo subtype.

**allow\_combination**: allows item combination.

**sub\_type**: can be BNGM - BNSP - SPONTH.

**Deal of the day and Flash deal**

**stock**: Information about the minimum and maximum stock required for the item to join as a candidate in the promotion.

**Coupons**

**fixed\_percentage**: Discount percentage offered (only for FIXED\_PERCENTAGE subtype).

**sub\_type**: Campaign subtype. Indicates if the coupon is fixed amount (FIXED\_AMOUNT) or percentage (FIXED\_PERCENTAGE).

**fixed\_amount**: Fixed discount amount granted (only for FIXED\_AMOUNT subtype).

## Modify items

You can modify items that are participating in a specific offer:

- [Modifying items in a traditional campaign](/en_us/deals?#Modify-items).
- [Modifying items in a co-funded campaign](en_us/co-funded-campaigns?#Modify-items).
- [Modifying items in a volume discount campaign](/en_us/volume-discount-campaigns#Modify-items).

Note:

To edit individual discounts (PRICE DISCOUNT), deals of the day (DOD), and flash deals (LIGHTNING), you must delete the promotion and apply it again.

## Bulk delete offers

You can bulk delete all offers that are on the item.

Note:

This bulk delete does not apply to DOD and LIGHTNING campaign type offers. For these offers, you need to continue deleting one campaign at a time.

```javascript
curl -X DELETE -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/seller-promotions/items/$ITEM_ID?app_version=v2
```

Example:

```javascript
curl -X DELETE -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/seller-promotions/items/MLA1399846831?app_version=v2
```

Response:

```javascript
{
  "successful_ids": [
    {
      "offer_id": "OFFER-MLA1399846831-10000081416",
      "error": null
    },
    {
      "offer_id": "OFFER-MLA1399846831-10000081567",
      "error": null
    }
  ],
  "errors": []
}
```

In cases where the item has campaigns that cannot be bulk deleted, the call will have an HTTP 200 response, but the response will contain error messages.

Example where no offer can be deleted:

```javascript
{
  "successful_ids": [],
  "errors": [
    {
      "offer_id": "OFFER-MLA1399846831-10000081416",
      "error": "The offer of type DOD not allowed for delete."
    },
    {
      "offer_id": "OFFER-MLA1399846831-10000081828",
      "error": "The offer could not be deleted. Try again."
    }
  ]
}
```

Example where offers were successfully deleted and errors also occurred:

```javascript
{
  "successful_ids": [
    {
      "offer_id": "OFFER-MLA1399846831-10000081416",
      "error": null
    },
    {
      "offer_id": "OFFER-MLA1399846831-10000081417",
      "error": null
    }
  ],
  "errors": [
    {
      "offer_id": "OFFER-MLA1399846831-10000081418",
      "error": "The offer of type DOD not allowed for delete."
    },
    {
      "offer_id": "OFFER-MLA1399846831-10000081419",
      "error": "The offer could not be deleted. Try again."
    }
  ]
}
```

### Possible errors

**423\_ENTITY\_LOCKED**: The request could not be processed because the item is temporarily locked for making requests. The request can be retried after a few seconds.

**400\_BAD\_REQUEST**: When the item format is invalid.

## Delete items

You can delete items that are participating in a specific offer:

- [Deleting items in a traditional campaign](/en_us/deals?#Delete-items).
- [Deleting items in a co-funded campaign](/en_us/co-funded-campaigns?#Delete-items).
- [Deleting items in a volume discount campaign](/en_us/volume-discount-campaigns#Delete-items).
- [Deleting pre-negotiated item discount](/en_us/pre-negotiated-item-discount#Delete-items).
- [Deleting items in a deal of the day](/en_us/deal-of-the-day#Delete-items).
- [Deleting items in a flash deal](/en_us/flash-deals#Delete-items).
- [Deleting individual discount from an item](/en_us/individual-discount?#Delete-individual-discount-from-an-item).

## Exclusion list management for Automatic Campaigns

With this resource you can manage the automatic exclusion list for promotions on Mercado Libre. If you want to prevent certain **sellers** or **products** from participating in campaigns automatically, this guide will show you how to do it.

### Query by Seller

You can check if a seller is excluded from automatic participation in promotions.

**Request:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' 
'https://api.mercadolibre.com/seller-promotions/exclusion-list/seller?app_version=v2'
```

**Response:**

```javascript
{
  "excluded": "not_excluded"
}
```

**Parameters:**

- **excluded**: Indicates if the seller is excluded.
  
  - **"not\_excluded"**: Not excluded.
  - **"excluded"**: Is excluded.

### Manage sellers from the Exclusion List

You can add or remove a seller from the exclusion list to control their participation in automatic promotions.

**Important:** Mercado Libre will not create automatic participation offers for excluded sellers.

**Request:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN'
    'https://api.mercadolibre.com/seller-promotions/exclusion-list/seller?app_version=v2'
    --data '{
    "exclusion_status": "true" 
    }'
```

**Parameters:**

- **exclusion\_status**: defines the action to perform.
  
  - **"true"**: Exclude the seller.
  - **"false"**: Remove from exclusion.

### Query by items

You can check if an item is excluded from automatic participation in promotions.

**Request:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' 
    'https://api.mercadolibre.com/seller-promotions/exclusion-list/seller/{item_id}?app_version=v2'
```

**Response:**

```javascript
{
  "excluded": "excluded"
}
```

**Parameters:**

- **excluded**: Indicates if the seller is excluded.
  
  - **"excluded"**: Is excluded.
  - **"not\_excluded"**: Not excluded.

### Manage items from the Exclusion List

You can add or remove an item from the exclusion list to prevent or allow its participation in automatic promotions.

**Important:** Mercado Libre will not create automatic participation offers for excluded items.

**Request:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN'
   https://api.mercadolibre.com/seller-promotions/exclusion-list/item?app_version=v2
--data '{
    "item_id": "12345678",
    "exclusion_status": "false"
}'
```

**Parameters:**

- **item\_id**: ID of the product to modify.
- **exclusion**: Defines the action to perform.
  
  - **"true"**: Exclude the item.
  - **"false"**: Remove from exclusion.

## Assign test campaigns

To run tests with test campaigns, send us your user and item data in the following **Form:**.

- [Form](https://docs.google.com/forms/d/e/1FAIpQLSenA_USmZQb8deHLrjhO_Rx1oOqfsj--Rhv-f_L1SebEJRBjA/viewform)

Remember that both users and items must be test ones.

Note:

You must add the **version=test** parameter within the calls to interact with test promotions.

**Next post**: [Co-funded campaigns](/en_us/co-funded-campaigns)