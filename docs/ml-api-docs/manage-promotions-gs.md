# Manage promotions

## The /seller-promotions resource centralize all types available promotions: Sales events, Regular deal, Deal of the day and Lightning deal.

**Tags:** promotions
**Created:** 2021-06-11T07:37:13Z
**Last Updated:** 2026-02-06T11:51:08Z

---

## Manage Promotions

Important:

The net\_proceeds object has been added to provide greater clarity on the seller's earnings in a promotion. This object will be found in the responses of the following resource: GET /promotions/$PROMOTION\_ID/items.

This object indicates the estimated net amount that the seller will receive for an item within a specific promotion. This field will only be present if the final price of the item (price) is greater than zero.

Use the /seller-promotions resource to centralize all types of available promotions: [Sales events](https://global-selling.mercadolibre.com/devsite/deals-gs) (DEAL), [Regular deal](https://global-selling.mercadolibre.com/devsite/price-discount) (PRICE\_DISCOUNT), [Deal of the day](https://global-selling.mercadolibre.com/devsite/Deal-of-day-gs) (DOD), [Lightning deal](https://global-selling.mercadolibre.com/devsite/Lightning-Deal-gs) (LIGHTNING), [Co-funded campaigns](https://global-selling.mercadolibre.com/devsite/cofunded-campaigns) (MARKETPLACE CAMPAIGN), [Pre-negotiated discount per item](https://global-selling.mercadolibre.com/devsite/pre-negotiated-discount-per-item-gs) (PRE\_NEGOTIATED) and [Seller Campaign](https://global-selling.mercadolibre.com/devsite/seller-campaign) (SELLER\_CAMPAIGN). This is apart from the new types of deals that we will make available.

## Promotion Characteristics

Campaign type Name Price definition Price suggestion Bonus MELI Stock to participate Deadline Approval **Sales events** DEAL User defines No No No Yes Yes **Co-funded campaigns** MARKETPLACE CAMPAIGN User accepts No Yes No Yes No **Deals of the day** DOD User accepts Yes No Yes, informative No No **Lightning deals** LIGHTNING User defines Yes No Yes, required No No **Pre-negotiated discount per item** PRE\_NEGOTIATED User agrees and accepts No Yes No Yes No **Seller Campaign** SELLER\_CAMPAIGN User defines Yes No No Yes (14 days max) No **Price Discount** PRICE\_DISCOUNT User defines No No No Yes (14 days max) No

## Sales promotions for the seller

A user can have more than one as well as different types of invitations.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/users/$USER_ID' \
--header 'version: v2'
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/users/1317418851' \
--header 'version: v2'
```

Response:

```javascript
{
  "results": [
      {
          "id": "C-MLM201059",
          "type": "SELLER_CAMPAIGN",
          "status": "started",
          "start_date": "2024-01-10T06:00:00Z",
          "finish_date": "2024-01-21T05:59:59Z",
          "name": "test campana del seller 1317418851",
          "sub_type": "FLEXIBLE_PERCENTAGE"
      }
  ],
  "paging": {
      "offset": 0,
      "limit": 50,
      "total": 1,
      "searchAfter": ""
  }
}
```

### Response fields

- **id**: promotion ID code.
- **type**: promotion type (DEAL, MARKETPLACE\_CAMPAIGN, DOD, LIGHTNING, VOLUME, SELLER\_CAMPAIGN, PRICE\_DISCOUNT, PRE\_NEGOTIATED, SMART).
- **status**: pending, started or finished.
- **start\_date**: promotion start date.
- **finish\_date**: promotion finish date.
- **deadline\_date**: maximum term to add promotional items.
- **name**: promotion name.
- **sub\_type**: (only for SELLER\_CAMPAIGN) campaign sub-type. Value: FLEXIBLE\_PERCENTAGE.
- **benefits**: promotion benefit configuration.

## Consult candidate items

The /seller-promotions/candidates resource allows you to identify the items invited to participate in a promotion. Whenever an item obtains the status of "candidate" in a promotion a notification is sent with the candidate\_id, with this resource it is possible to identify the item, the promotion and the status.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/promotions/candidates/$CANDIDATE_ID' \
--header 'version: v2'
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/promotions/candidate/CANDIDATE-MLM2199514002-70027957276/1317418851' \
--header 'version: v2'
```

Response:

```javascript
{
  "id": "CANDIDATE-MLM2199514002-70027957276",
  "item_id": "MLM2199514002",
  "promotion_id": "P-MLM2027003",
  "type": "UNHEALTHY_STOCK",
  "status": {
      "id": "candidate"
  }
}
```

### Response fields

- **id**: candidate identification code.
- **item\_id:** item associated with the candidate.
- **promotion\_id**: promotion ID.
- **type**: promotion type (DEAL, MARKETPLACE\_CAMPAIGN, DOD, LIGHTNING, VOLUME, PRICE\_DISCOUNT, PRE\_NEGOTIATED).
- **status**: status of the candidate.

Note:

The candidate id is obtained through the notification of the "public candidate" topic.

## Check offers

The /seller-promotions/offers resource allows you to identify changes in the offer of an item. All changes are sent by notifications with the offer\_id, making it possible to identify the item, the promotion, and the status.

Request:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET \
'https://api.mercadolibre.com/marketplace/seller-promotions/promotions/offer/$OFFER_ID/$USER_ID' \
--header 'version: v2'
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://internal-api.mercadolibre.com/marketplace/seller-promotions/promotions/offer/OFFER-MLM1873971357-10078845289/1280008696' \
--header 'version: v2'
```

Response:

```javascript
{
  "id": "OFFER-MLM1873971357-10078845289",
  "item_id": "MLM1873971357",
  "promotion_id": "P-MLM13551180",
  "type": "UNHEALTHY_STOCK",
  "status": {
      "id": "started"
  }
}
```

### Response fields

- **id**: identification code of the offer.
- **item\_id**: item associated with the offer.
- **promotion\_id**: promotion ID.
- **type**: type of promotion (DEAL, MARKETPLACE\_CAMPAIGN, DOD, LIGHTNING, VOLUME, PRICE\_DISCOUNT, PRE\_NEGOTIATED).
- **status**: status of the offer (programmed, active, and inactive).

Note:

You get the ID of the offer through a notification in the [public offers topic](/en_us/products-receive-notifications?#public-offers).

## Promotion Details

Perform the following query to access the specific details of traditional campaigns, co-funded campaigns, and volume discounts.

Request:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET \
'https://api.mercadolibre.com/marketplace/seller-promotions/promotions/$PROMOTION_ID?promotion_type=$PROMOTION_TYPE&user_id=$USER_ID' \
--header 'version: v2'
```

Example:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET \
'https://api.mercadolibre.com/marketplace/seller-promotions/promotions/C-MLM201059?promotion_type=SELLER_CAMPAIGN&user_id=1317418851' \
--header 'version: v2'
```

Response:

```javascript
{
  "id": "C-MLM201059",
  "type": "SELLER_CAMPAIGN",
  "status": "started",
  "start_date": "2024-01-10T06:00:00Z",
  "finish_date": "2024-01-21T05:59:59Z",
  "name": "test campana del seller 1317418851",
  "sub_type": "FLEXIBLE_PERCENTAGE"
}
```

## Check Promotion Items

Perform the query below to check the items included in a given promotion:

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/promotions/$PROMOTION_ID/items?status=$STATUS&promotion_type=$PROMOTION_TYPE&user_id=$USER_ID' \
--header 'version: v2'
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/promotions/C-MLM201059/items?status=candidate&promotion_type=SELLER_CAMPAIGN&user_id=1317418851' \
--header 'version: v2'
```

Response:

```javascript
{
    "results": [
        {
            "id": "MLM2199514002",
            "status": "candidate",
            "price": 70,
            "original_price": 0,
            "currency_id": "USD",
            "start_date": "2024-01-10T00:00:00",
            "end_date": "2024-01-20T23:59:59",
            "net_proceeds": {
                "amount": 20.68,
                "currency": "USD"
            }
        },
        {
            "id": "MLM2184798066",
            "status": "candidate",
            "price": 30,
            "original_price": 0,
            "currency_id": "USD",
            "start_date": "2024-01-10T00:00:00",
            "end_date": "2024-01-20T23:59:59",
            "net_proceeds": {
                "amount": 20.68,
                "currency": "USD"
            }
        }
    ],
    "paging": {
        "offset": 0,
        "limit": 50,
        "total": 2,
        "searchAfter": ""
    }
}
```

### Response fields

- **results**: list of items in the promotion.
- **results\[].id**: item ID.
- **results\[].status**: item status in the promotion (candidate, pending, started, finished).
- **results\[].price**: item price with the promotion applied. For candidate items = 0. For started items = actual promotional price.
- **results\[].original\_price**: item's original price (without promotion).
- **results\[].currency\_id**: currency code (e.g., USD, MXN).
- **results\[].start\_date**: promotion start date for this item.
- **results\[].end\_date**: promotion end date for this item.
- **results\[].net\_proceeds**: estimated net amount the seller will receive.
- **results\[].net\_proceeds.amount**: net amount value.
- **results\[].net\_proceeds.currency**: currency code.

## Check Item Promotions

Here you can obtain all the promotions that the item has and the status of the promotions at the moment of the consult.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/items/$ITEM_ID?user_id=$USER_ID'
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/items/MLM2184616078?user_id=1317418851' \
--header 'version: v2'
```

Response:

```javascript
[
  {
      "id": "P-MLM13795204",
      "type": "DEAL",
      "status": "started",
      "start_date": "2024-01-26T12:00:00-06:00",
      "finish_date": "2024-02-16T00:00:00-06:00",
      "deadline_date": "2024-02-16T06:00:00Z",
      "name": "bosch campaña"
  },
  {
      "id": "",
      "type": "DOD",
      "status": "candidate",
      "start_date": "2024-02-16T21:00:00",
      "finish_date": "2024-02-17T20:59:59"
  },
  {
      "id": "P-MLM13773008",
      "type": "PRE_NEGOTIATED",
      "status": "started",
      "start_date": "",
      "finish_date": "",
      "name": "Commercial Shared Discounts",
      "offers": [
          {
              "id": "CANDIDATE-MLM2184616078-70509424939",
              "original_price": 130,
              "new_price": 100,
              "status": "candidate",
              "start_date": "2024-02-02T06:00:00Z",
              "end_date": "2024-02-29T05:59:59Z",
              "benefits": {
                  "type": "REBATE",
                  "meli_percent": 15.4,
                  "seller_percent": 7.7
              }
          }
      ]
  },
  {
      "id": "P-MLM13819020",
      "type": "MARKETPLACE_CAMPAIGN",
      "status": "started",
      "start_date": "2024-02-02T20:00:00Z",
      "finish_date": "2024-03-01T20:00:00Z",
      "deadline_date": "2024-03-01T20:00:00Z",
      "name": "Ofertas sugeridas",
      "benefits": {
          "type": "REBATE",
          "meli_percent": 0,
          "seller_percent": 0
      }
  },
  {
      "id": "P-MLM13821030",
      "type": "SMART",
      "status": "started",
      "start_date": "",
      "finish_date": "",
      "name": "Gánale a la competencia con un aporte de Mercado Libre",
      "offers": [
          {
              "id": "CANDIDATE-MLM2184616078-70509425185",
              "original_price": 130,
              "new_price": 100,
              "status": "candidate",
              "start_date": "2024-02-02T20:00:00Z",
              "end_date": "2024-03-01T20:00:00Z",
              "benefits": {
                  "type": "REBATE",
                  "meli_percent": 0,
                  "seller_percent": 23.1
              }
          }
      ]
  },
  {
      "id": "",
      "type": "PRICE_DISCOUNT",
      "status": "candidate",
      "start_date": "",
      "finish_date": ""
  },
  {
      "id": "P-MLM13757022",
      "type": "DEAL",
      "status": "started",
      "start_date": "2024-01-29T00:00:00-06:00",
      "finish_date": "2024-02-12T00:00:00-06:00",
      "deadline_date": "2024-02-11T06:00:00Z",
      "name": "Ano nuevo chino"
  }
]
```

## Filters

You can apply filters by **item or status**.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/promotions/$PROMOTION_ID/items?user_id=$USER_ID&status=started&item_id=$ITEM_ID' \
--header 'version: v2'
```

Example of filter by **item**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/promotions/P-MLM13773008/items?user_id=1317418851&item_id=MLM2184616078' \
--header 'version: v2'
```

Response:

```javascript
{
    "results": [
        {
            "id": "MLM2184616078",
            "status": "candidate",
            "price": 130,
            "original_price": 0,
            "currency_id": "USD",
            "offer_id": "CANDIDATE-MLM2184616078-70509424939",
            "meli_percentage": 15.4,
            "seller_percentage": 7.7,
            "start_date": "2024-02-02T06:00:00Z",
            "end_date": "2024-02-29T05:59:59Z"
        }
    ],
    "paging": {
        "offset": 0,
        "limit": 50,
        "total": 1,
        "searchAfter": ""
    }
}
```

Example of filter by **status** started:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/promotions/P-MLM13773008/items?user_id=1317418851&status=started' \
--header 'version: v2'
```

Response:

```javascript
{
    "results": [
        {
            "id": "MLM2184694464",
            "status": "started",
            "price": 80,
            "original_price": 100,
            "currency_id": "USD",
            "offer_id": "OFFER-MLM2184694464-10194835657",
            "meli_percentage": 20,
            "start_date": "2024-02-02T06:00:00Z",
            "end_date": "2024-02-29T05:59:59Z"
        }
    ],
    "paging": {
        "offset": 0,
        "limit": 50,
        "total": 1,
        "searchAfter": ""
    }
}
```

## Pagination

To perform pagination you must use the searchAfter parameter. This parameter you will find at the end of the response.

Note:

The maximum allowed value in the "limit" parameter is 50 items. If you don't use it, 50 items of the total will be returned by default.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/promotions/$PROMOTION_ID/items?user_id=$USER_ID&limit=$LIMIT' \
--header 'version: v2'
```

- **user\_id**: seller\_id (local marketplace)
- **caller-id**: caller\_id
- **client-id**: client\_id

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/promotions/C-MLM199082/items?user_id=1317418851&limit=2' \
--header 'version: v2'
```

Response:

```javascript
{
  "results": [
      {
          "id": "MLM2760672650",
          "status": "candidate",
          "price": 35,
          "original_price": 0,
          "currency_id": "USD",
          "start_date": "2024-01-05T00:00:00",
          "end_date": "2024-01-11T23:59:59"
      },
      {
          "id": "MLM2199514002",
          "status": "candidate",
          "price": 70,
          "original_price": 0,
          "currency_id": "USD",
          "start_date": "2024-01-05T00:00:00",
          "end_date": "2024-01-11T23:59:59"
      }
  ],
  "paging": {
      "offset": 0,
      "limit": 2,
      "total": 19,
      "searchAfter": "a179f4702c65ce28484f26cf4fbcb0cbecb05b2ba75aaaebba697cb2511fa7e285ee29cdb1746ea07ae29c53297e9578d505220836a09368fccc8ab15528c305d6a26faafe57114a5fbd049291c306a7c33c76fa222e828e38621b473d25a353b21985fd2cafb1434217a33b7f148b9ffe3f96bef8b7d7dc61c2dc7e308dd87f"
  }
}
```

At the bottom of this response you find the searchAfter and you will include it on the following request in order to get the next items.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/promotions/$PROMOTION_ID/items?user_id=$USER_ID&limit=$LIMIT&search_after=$SEARCH_AFTER' \
--header 'version: v2'
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/promotions/C-MLM199082/items?user_id=1317418851&limit=2&search_after=a179f4702c65ce28484f26cf4fbcb0cbecb05b2ba75aaaebba697cb2511fa7e285ee29cdb1746ea07ae29c53297e9578d505220836a09368fccc8ab15528c305d6a26faafe57114a5fbd049291c306a7c33c76fa222e828e38621b473d25a353b21985fd2cafb1434217a33b7f148b9ffe3f96bef8b7d7dc61c2dc7e308dd87f' \
--header 'version: v2'
```

Response:

```javascript
{
  "results": [
      {
          "id": "MLM2184798066",
          "status": "candidate",
          "price": 30,
          "original_price": 0,
          "currency_id": "USD",
          "start_date": "2024-01-05T00:00:00",
          "end_date": "2024-01-11T23:59:59"
      },
      {
          "id": "MLM2184785146",
          "status": "candidate",
          "price": 17,
          "original_price": 20,
          "currency_id": "USD",
          "start_date": "2024-01-05T00:00:00",
          "end_date": "2024-01-11T23:59:59"
      }
  ],
  "paging": {
      "offset": 0,
      "limit": 2,
      "total": 19,
      "searchAfter": "1166a0e70e56d7f048f0665cedb9a45b1dcd0a7e47af62931fb51dab12f50954635e8e620cd3ce944333b3dc71c9fc207cf6ad42adb0a941fe3e3355c4025e3749e30d2322df0d23910a24bfa21c9987e513ad738bb2223e9510739dfad80dd66acb1ec14721e25e1c1c73ea9881aa742d20dbcc9789c272200fc000b072c3d8"
  }
}
```

### Considerations

- Search\_after will be returned on all pages except the last page.
- The only way to advance the response (paginate) is through the use of this parameter.
- When iterating the results, each request will return the search\_after that should be used in the next call.
- Always use the search\_after that was provided by the request response, since it can change and expire (they have a TTL of 5 minutes).
- Backward paging is not possible.

## Participate in a Promotion

You can participate in different types of promotions and even offer an item price discount by:

- Specifying items for a traditional campaign.
- Specifying items for a co-funded campaign.
- Accepting a pre-negotiated discount per Item.
- Specifying items for a deal of the day.
- Specifying items for a lightning deal.
- Offering a price discount for an item.
- Indicating items for a seller's campaign.
- Indicating items for a Smart campaign.

## Modify Items

You can modify items included in a deal by:

- Changing items in a traditional campaign.
- Changing items in a co-funded campaign.

Note:

To edit price discounts (PRICE\_DISCOUNT), deals of the day (DOD) and lightning deals (LIGHTNING) delete the promotion and apply it again.

## Massive delete of offers

You can massively delete all the offers that are in the item.

Note:

This massive delete does not apply to campaign offers of the DOD and LIGHTNING types. For these offers, it is necessary to continue deleting one campaign at a time.

Request:

```javascript
curl -X DELETE -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/items/massive/$ITEM_ID?user_id=$USER_ID'
```

Example:

```javascript
curl -X DELETE -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'version: v2' \
'https://api.mercadolibre.com/marketplace/seller-promotions/items/massive/MLM1991842995?user_id=1317418851'
```

Response:

```javascript
{
   "successful_ids": [
       {
           "offer_id": "OFFER-MLM1991842995-10467980671",
           "error": null
       },
       {
           "offer_id": "OFFER-MLM1991842995-10467983049",
           "error": null
       },
       {
           "offer_id": "OFFER-MLM1991842995-10467981085",
           "error": null
       }
   ],
   "errors": []
}
```

In cases where the item has campaigns that cannot be deleted in bulk, the call will receive an HTTP 200 response, but the response will contain error messages.

Example where no offer can be deleted:

```javascript
{
   "successful_ids": [],
   "errors": [
       {
           "offer_id": "OFFER-MLM1991842995-10000081416",
           "error": "The offer of type DOD not allowed for delete."
       },
       {
           "offer_id": "OFFER-MLM1991842995-10000081828",
           "error": "The offer could not be deleted. Try again."
       }
   ]
}
```

Example where offers were successfully removed and errors also occurred:

```javascript
{
   "successful_ids": [
       {
           "offer_id": "OFFER-MLM1991842995-10467980671",
           "error": null
       },
       {
           "offer_id": "OFFER-MLM1991842995-10467983049",
           "error": null
       }
   ],
   "errors": [
       {
           "offer_id": "OFFER-MLM1991842995-10000081418",
           "error": "The offer of type DOD not allowed for delete."
       },
       {
           "offer_id": "OFFER-MLM1991842995-10000081419",
           "error": "The offer could not be deleted. Try again."
       }
   ]
}
```

### Possible errors.

**423\_ENTITY\_LOCKED**: The request could not be processed because the item is temporarily blocked from making requests. The request can be attempted again after a few seconds

**400\_BAD\_REQUEST**: When the item format is invalid.

## Opt Out Items from promotions

You can change the items included in a given deal by:

- Deleting items in a traditional campaign.
- Deleting items in a co-funded campaign.
- Deleting a pre-negotiated discount per item.
- Deleting items in a deal of the day.
- Deleting items in a lightning deal.
- Deleting a price discount for an item.

**Next**: [Deals](https://global-selling.mercadolibre.com/devsite/deals-gs)