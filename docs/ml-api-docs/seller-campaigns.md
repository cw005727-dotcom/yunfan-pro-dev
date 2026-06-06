# Seller campaigns

**Tags:** Sellers,Campaign,Campaigns,Promotion,Promotions
**Created:** 2023-05-04T11:36:51Z
**Last Updated:** 2026-01-15T16:32:52Z

---

## Seller campaigns

Important note:

Starting July 2025, the "FIXED\_PERCENTAGE" promotion sub-type will no longer be available.

Sellers can create their own campaigns and manage them through integration.

Key considerations:

- The maximum duration for this type of campaign is 14 days.
- The new status filter is now available to filter campaign items using the status\_item query param, which accepts "active" or "paused" values.

To offer this discount you need:

- Have green reputation.
- The item must have active status.
- Condition must be new.
- The item exposure cannot be free.

## Create campaign

To create a seller campaign, make the following call:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/seller-promotions/promotions?app_version=v2
  {
    "promotion_type": "SELLER_CAMPAIGN",
    "name": "test campana del seller",
    "sub_type": "FLEXIBLE_PERCENTAGE",
    "start_date": "2023-07-17T00:00:00",
    "finish_date": "2023-07-20T00:00:00"
 }
 

```

Response:

```javascript
{
   "id": "C-MLB360923",
   "type": "SELLER_CAMPAIGN",
   "sub_type": "FLEXIBLE_PERCENTAGE",
   "status": "pending",
   "start_date": "2023-07-17T00:00:00",
   "finish_date": "2023-07-20T23:59:59",
   "name": "test campana del seller"
}

```

### Request fields

**promotion\_type:** type of campaign to create, currently only **SELLER\_CAMPAIGN** is allowed.  
**name:** campaign name.  
**sub\_type:** the allowed value is FLEXIBLE\_PERCENTAGE.  
**start\_date**: campaign start date **in local format**. The beginning of the day will always be taken as the start time.  
**finish\_date:** campaign end date **in local format**. The end of the day will always be taken as the end time.

## Update campaign

All fields can be modified, but **only the fields you want to modify should be sent**. The only required field is **promotion\_type**, which must always be present.

Example:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/seller-promotions/promotions/$PROMOTION_ID?app_version=v2
  {
    "promotion_type": "SELLER_CAMPAIGN",
    "name": "new name 10",
    "sub_type": "FLEXIBLE_PERCENTAGE",
       "start_date": "2023-07-18T00:00:00",
    "finish_date": "2023-07-19T00:00:00"
 }
```

Response:

```javascript
{
   "id": "C-MLB360923",
   "type": "SELLER_CAMPAIGN",
   "sub_type": "FLEXIBLE_PERCENTAGE",
   "status": "pending",
   "start_date": "2023-07-18T00:00:00",
   "finish_date": "2023-07-19T23:59:59",
   "name": "new name 10"
}
```

## Delete campaign

To delete a seller campaign you must make this call:

```javascript
curl -X DELETE -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/seller-promotions/promotions/$PROMOTION_ID?promotion_type=SELLER_CAMPAIGN&app_version=v2
```

Example:

```javascript
curl -X DELETE -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/seller-promotions/promotions/C-MLB360923?promotion_type=SELLER_CAMPAIGN&app_version=v2
```

**Response: Status 200 OK**

## Query campaign details

To get the campaign details, make the following query:

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/seller-promotions/promotions/C-MLB302?promotion_type=SELLER_CAMPAIGN&app_version=v2
```

Response:

```javascript
{
  "id": "C-MLB302",
  "type": "SELLER_CAMPAIGN",
  "sub_type": "FLEXIBLE_PERCENTAGE",
  "status": "started",
  "start_date": "2023-04-27T15:04:00Z",
  "finish_date": "2023-05-05T03:00:00Z",
  "name": "camp del seller tahi 2"
}
```

### Response fields

- **id**: campaign identifier.
- **type**: campaign type (SELLER\_CAMPAIGN).
- **sub\_type**: FLEXIBLE\_PERCENTAGE.
- **status**: campaign status.
- **start\_date**: campaign start date.
- **finish\_date**: campaign end date.
- **name**: campaign name.

## Statuses

These are the different statuses that a seller campaign can go through.

Status Description **pending** Approved promotion, but not yet started. **started** Active promotion. **finished** Finished promotion.

## Query items in a campaign

To find out which items are part of a seller campaign, you can make the following query:

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' 'https://api.mercadolibre.com/seller-promotions/promotions/C-MLB300/items?promotion_type=SELLER_CAMPAIGN&app_version=v2'
```

Response:

```javascript
{
  "results": [
      {
          "id": "MLB3538191898",
          "status": "candidate",
          "price": 0,
          "original_price": 5000,
          "start_date": "2023-04-27T12:03:00",
          "end_date": "2023-05-05T00:00:00",
          "sub_type": "FLEXIBLE_PERCENTAGE"
      }
  ],
  "paging": {
      "offset": 0,
      "limit": 50,
      "total": 1
  }
}
```

## Item statuses

In the following table you can find the possible statuses that items can have within this type of campaign.

Status Description **candidate** Candidate item to participate in the promotion. **pending** Item with approved and scheduled promotion. **started** Item active in the campaign. **finished** Item removed from the campaign

## Add items to a campaign

Once you have been invited to participate in a seller campaign, you can indicate which products you want to include in it.

Example:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
  -d '{
    "promotion_id":"C-MLB302",
    "promotion_type":"SELLER_CAMPAIGN",
    "deal_price": 3500,
    "top_deal_price": 3000
  }'
  https://api.mercadolibre.com/seller-promotions/items/MLB3538191898?app_version=v2
```

Response:

```javascript
{
    "price": 3500,
    "original_price": 5000
 }
```

### Parameters

- **promotion\_id**: promotion identification.
- **promotion\_type**: promotion type (SELLER\_CAMPAIGN).
- **deal\_price** item price in the promotion.
- **top\_deal\_price** item price for top buyers, with Mercado Puntos level 3 to 6 (this price is optional)

## Modify items

In this type of campaign you can only modify items that belong to campaigns with sub\_type FLEXIBLE\_PERCENTAGE.  
To modify items, perform the following operation.  
Example:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' \
  -d '{
    "promotion_id":"C-MLB302",
    "promotion_type":"SELLER_CAMPAIGN",
    "deal_price": 3300,
    "top_deal_price": 3000,
      "remove_loyalty": true  
  }'
  https://api.mercadolibre.com/seller-promotions/items/MLB3538191898?app_version=v2
```

Response:

```javascript
{
  "price": 3300,
  "original_price": 5000
}
```

### Considerations

If the offer is **active**:

- - - If it has a loyalty discount loaded, that discount can no longer be removed.  
      Error message: **"Top\_deal\_price can't be removed when the seller campaign has already started"**.
    - If it was created without the loyalty discount, it cannot be added later.  
      Error message: **"Top\_deal\_price can't be set when the seller campaign has already started"** .
    - Prices can only improve.  
      Error message: **"New deal\_price must be lower than current deal\_price" / "New top\_deal\_price must be lower than current top\_deal\_price"**.

If the offer is **pending**:

- - The deal\_price and top\_deal\_price can be modified for a higher or lower discount.
  - The loyalty discount can be added or removed.

If you want to remove the loyalty discount, send "remove\_loyalty": true. In all other cases (you don't want to remove it, you want to add it, you want to modify it, or you don't want to act on that price), the field is sent as **false** or not sent at all.

In the body, only the fields you want to change are sent.

**Example**. Modification of top\_deal\_price:

```javascript
{
    "top_deal_price": 1000.33,
    "promotion_id": "C-MLA123",
    "promotion_type": "SELLER_CAMPAIGN"
}
```

**Example**. Modification of deal\_price and removal of top\_deal\_price:

```javascript
{
    "deal_price": 700,
    "promotion_id": "C-MLA123",
    "promotion_type": "SELLER_CAMPAIGN",
    "remove_loyalty": true
}
```

Response:

```javascript
{
    "price": 950,
    "original_price": 1000
}
```

## Delete

Request:

```javascript
curl -X DELETE -H 'Authorization: Bearer $ACCESS_TOKEN' 'https://api.mercadolibre.com/seller-promotions/items/$ITEM_ID?promotion_type=$PROMOTION_TYPE&promotion_id=$PROMOTION&app_version=v2'
```

Example:

```javascript
curl -X DELETE -H 'https://api.mercadolibre.com/seller-promotions/items/MLB3538191898?promotion_type=SELLER_CAMPAIGN&promotion_id=C-MLB302
```

Response: **Status 200 OK**

## Validation error: 400 bad request

Error message Description The name already exists.  
A seller campaign with the same name already exists. Invalid sub\_type When the sub\_type of a SELLER\_CAMPAIGN is neither FLEXIBLE\_PERCENTAGE nor FIXED\_PERCENTAGE. The percentage is greater than allowed. the maximum percentage allowed is 70.000000 The maximum allowed percentage is 80%. If, for example, fixed\_percentage: 71 is sent, this error will be returned. The percentage is less than allowed. the minimum percentage allowed is 10.000000 The percentage is below the allowed. Invalid promotion type When the promotion\_type is invalid. Start and finish dates must be in local format When the sent dates are not in local format (as in the example) or are not sent. Start\_date cannot be earlier than today Start\_date cannot be earlier than today. Finish\_date cannot be earlier than startdate Finish\_date cannot be earlier than start\_date. Maximum period cannot exceed the allowed When the distance between start and finish date is greater than allowed. Maximum period can not exceed the allowed When you want to update some date (or both), and the new period between them exceeds the allowed. The start\_date field cannot be modified for the current promotion status The start date of a promotion in started status cannot be changed.