# Price discount

**Tags:** promotions,Price Discount,Discount,Price
**Created:** 2021-06-11T10:49:29Z
**Last Updated:** 2026-02-03T17:58:41Z

---

## Price discount

Sellers who want to apply a specific discount to their items can use the following resources to create, remove, and query discounts.

### Requirements

To offer this discount, the following conditions must be met:

- Seller must have a green reputation.
- Seller must have at least 1 product sale.
- Item status must be **active**.
- Item condition must be **new**.
- Item listing type cannot be **free**.

## Offer discount for an item

Use this resource to apply a price discount to a specific item.

Note:

To offer a discount, you must send **prices** in the request body, not percentages. Use **deal\_price** instead of **discount\_percent** and **top\_deal\_price** instead of **top\_discount\_percent**.

Request:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
-d '{
    "deal_price": $DEAL_PRICE,
    "top_deal_price": $TOP_DEAL_PRICE,
    "start_date": "$START_DATE",
    "finish_date": "$FINISH_DATE",
    "promotion_type": "PRICE_DISCOUNT"
}' \
'https://api.mercadolibre.com/marketplace/seller-promotions/items/$ITEM_ID?user_id=$USER_ID' \
--header 'version: v2' \
--header 'X-Client-Id: $CLIENT_ID' \
--header 'X-Caller-Id: $CALLER_ID'
```

Example:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
-d '{
    "deal_price": 20,
    "top_deal_price": 15,
    "start_date": "2025-12-09T00:00:00",
    "finish_date": "2025-12-16T23:59:59",
    "promotion_type": "PRICE_DISCOUNT"
}' \
'https://api.mercadolibre.com/marketplace/seller-promotions/items/MLM3782207298?user_id=2487485082' \
--header 'version: v2' \
--header 'X-Client-Id: 1317417907' \
--header 'X-Caller-Id: 1317417907'
```

Response:

```javascript
{
    "price": 20,
    "original_price": 39.29,
    "currency_id": "USD",
    "offer_id": "OFFER-MLM3782207298-11795706698"
}
```

### Parameters

- **deal\_price:** discounted price for all buyers.
- **top\_deal\_price:** discounted price for loyalty program members (Mercado Puntos level 3 to 6). *(optional)*
- **start\_date:** discount start date in local format.
- **finish\_date:** discount end date in local format.
- **promotion\_type:** must be `PRICE_DISCOUNT`.

### Response fields

- **price:** the discounted price applied to the item.
- **original\_price:** the original price of the item before the discount.
- **currency\_id:** currency code (e.g., USD, MXN).
- **offer\_id:** unique identifier for the created offer.

### Considerations

- Discounts can be segmented by setting a general price for all buyers and a special price for loyalty members (Mercado Puntos level 3 to 6).
- For discounts up to 35%, the general discount must be at least 5% higher than the loyalty member discount. For discounts above 35%, the difference must be at least 10%.
- The maximum discount allowed is 80%, and the minimum discount must be at least 5%.
- If the item price increases, all discounts will be automatically removed.
- The maximum duration for a PRICE\_DISCOUNT promotion is 14 days.
- If the item is already participating in a DEAL when the discount starts, the PRICE\_DISCOUNT will not be applied until the DEAL ends.
- The **start\_date** and **finish\_date** parameters only consider the date, not the time. By default, discounts start at 00:00:00 on the start date and end at 23:59:59 on the finish date.

Note:

For testing purposes, the test user must have a green reputation and the item must have at least 1 sale at the current price.

### Item status

The table below shows the possible item statuses when applying a price discount:

Status Description **pending** Scheduled discount, not yet active. **started** Item with active discount. **finished** Discount has ended. **sync\_requested** Discount activation in progress. **restore\_requested** Discount removal in progress.

## Delete a price discount

Use this resource to remove a price discount from an item.

Request:

```javascript
curl -X DELETE -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/items/$ITEM_ID?promotion_type=PRICE_DISCOUNT&user_id=$USER_ID' \
--header 'version: v2' \
--header 'X-Client-Id: $CLIENT_ID' \
--header 'X-Caller-Id: $CALLER_ID'
```

Example:

```javascript
curl -X DELETE -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/seller-promotions/items/MLM3782207298?promotion_type=PRICE_DISCOUNT&user_id=2487485082' \
--header 'version: v2' \
--header 'X-Client-Id: 1317417907' \
--header 'X-Caller-Id: 1317417907'
```

Response: **HTTP 200 OK** (empty body)

Note:

When removing a PRICE\_DISCOUNT, all discount tiers will be removed. You cannot remove discounts by buyer level individually.

## Errors

The following errors may occur when offering discounts:

### Discount percentage out of range

```javascript
{
    "key": "buyer_discount_not_in_range",
    "message": "buyers_discount_percentage parameter must be in range (5, 80)"
}
```

```javascript
{
    "key": "best_buyer_discount_not_in_range",
    "message": "buyers_discount_percentage parameter must be in range (5, 80)"
}
```

**Cause:** The discount percentage is outside the allowed range (5% to 80%).

### Insufficient discount difference between tiers

```javascript
{
    "key": "discount_below_10_percent_difference",
    "message": "The best buyer discount difference cannot be below 10% when buyers discount is above 35%"
}
```

```javascript
{
    "key": "discount_below_5_percent_difference",
    "message": "The discount difference cannot be below 5%"
}
```

**Cause:** The difference between general and loyalty member discounts does not meet the minimum requirements.

### Price credibility error

```javascript
{
    "key": "error_credibility_price",
    "message": "The price is not credible."
}
```

**Cause:** The discount results in a price that the system considers not credible. A higher original price or smaller discount may be required.

**Next:** [Volume Discount](https://global-selling.mercadolibre.com/devsite/volume-discount-campaigns-gs)