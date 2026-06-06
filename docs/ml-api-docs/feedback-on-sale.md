# Feedback on sale

**Tags:** Feedback,on,sale
**Created:** 2018-06-27T12:01:32Z
**Last Updated:** 2023-10-02T12:58:24Z

---

## Feedback on sale

Once a sale (or purchase) is fulfilled, the Seller may leave his/her feedback on the transaction and qualify the counterparty.  
When the transaction is qualified as fulfilled, "custom" and "me1" shipments show that the product has been already delivered; therefore, bear in mind that this process should be started only if you are sure that the product has been delivered to the buyer. This way when the seller qualifies, a message will be sent to the buyer asking him/her about the sale and requesting confirmation of such sale product delivery.  
Currently, this action is valid only for tracking shipment delivered statuses, that is, it has no impact on the involved Seller's reputation; it should be always applied to change status to delivered in sales without Mercado Envíos, moving these sales to the completed lists.

## Resource description

Attribute Description **fulfilled** True or False. Indicates whether the order was completed or not.Required. **message** A string under 160 chars. Required. **rating** Possible values are ‘negative’, ‘neutral’ in case ‘fulfilled’: ‘false’ or positive in case ‘fulfilled’: ‘true’. Required. **reason** Mandatory field in case ‘fulfilled’: ‘false’. **restock\_item** Only for sellers, when ‘fulfilled’: ‘false’. When ‘restock\_item’: ‘true’ means the order was not completed so the item should be restocked. The only restriction for restocking is that the status of the item cannot be ‘closed’.

## Accepted values to send as "reason"

Sellers' available reasons are:

- OUT\_OF\_STOCK: Out of stock
- BUYER\_NOT\_ENOUGH\_MONEY: Seller does not answer
- BUYER\_REGRETS: Buyer does not have enough money
- SELLER\_REGRETS: Buyer regrets transaction
- BUYER\_DID\_NOT\_ANSWER: Buyer does not answer
- THEY\_NOT\_HONORING\_POLICIES: Buyer is not honoring the policies
- OTHER\_MY\_RESPONSIBILITY: It is my own responsibility (other reason)
- OTHER\_THEIR\_RESPONSIBILITY: It is the counterparty's responsibility (other reason)
- DUBIOUS\_BUYER: Buyer is not reliable
- HIGH\_ML\_COMISSION: Very high sales commission
- HIGH\_TAXES: Very high taxes
- SELLER\_HOLIDAY: No operations due to vacations
- UNFRIENDLY\_SHIPMENT\_POLICY: Buyer does not accept shipment policy
- UNAVAILABLE\_PRODUCT: Product is not available
- SELLER\_ADDRESS\_WITHDRAWAL: Buyer chooses to pick up product in person
- WRONG\_RECEIVER\_ADDRESS: Wrong delivery address
- HIGH\_SHIPMENT\_COST: Very high shipment costs
- WRONG\_SHIPMENT\_COST: Wrongly estimated shipment cost
- UNPRINTED\_LABEL: Unable to print label
- UNWITHDRAWN\_PRODUCT\_BY\_DELIVER\_COMPANY: Shipping company failed to pick up product for delivery
- DENIED\_PACKAGE: Shipping company failed to accept package due to size or weight
- UNABLE\_TO\_READ\_LABEL: Shipping company cannot read label
- MANUFACTURING\_PRODUCT\_NOT\_FINISHED: Unfinished manufactured product
- SHIPMENT\_PROBLEM\_OTHER: Other shipment problems
- DELIVERY\_COMPANY\_PROBLEM\_OTHER: Shipping company had other problems

Buyers' available reasons are:

- OUT\_OF\_STOCK: Out of stock
- BUYER\_PAID\_BUT\_DID\_NOT\_RECEIVE: Buyer made payment but did not receive product
- OTHER\_MY\_RESPONSIBILITY: It is my own responsibility (other reason)
- BUYER\_REGRETS: Buyer regrets transaction
- HIGH\_SHIPMENT\_COST: High shipment cost
- SELLER\_DID\_NOT\_ANSWER: Seller does not answer
- THEY\_NOT\_HONORING\_POLICIES: Buyer does not answer
- OTHER\_THEIR\_RESPONSIBILITY: Seller is not honoring the policies
- DESCRIPTION\_DIDNT\_MATCH\_ARTICLE: The description does not match item

## Posting feedback

You can reply to feedback you received from your trading partners to explain your reasons or to give additional information by doing a POST to the API, including feedback\_id, as follows:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Content-Type: application/json' -d
'{
  "fulfilled": false,
  "rating": "neutral",
  "message": "Operation not completed",
  "reason": "OUT_OF_STOCK",
  "restock_item": false,
}'
https://api.mercadolibre.com/orders/$ORDER_ID/feedback
```

Notes:

\- The seller cannot make a "not fulfilled" feedback once the order expired.  
**Status**: 400  
**Error**: not\_fulfilled\_feedback\_in\_order\_expired.  
**Error message**: You can't submit a not fulfilled feedback after order has expired.  
\- It's not allowed to create feedback more than once, when you make that POST again you will receive a 400 error.

## Responding to feedback

You can respond to feedback received from your trading partners to explain your reasons or offer additional information with a POST request, including the feedback\_id, as described below:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Content-Type: application/json' -d'{
"reply":"Muchas gracias por la buena predisposición"
}'
https://api.mercadolibre.com/feedback/$FEEDBACK_ID/reply
```

## Get a sale feedback

Nota:

Sellers can access sales feedbacks that are up to 5 (five) years old.

With the following GET request to /orders/$order\_id/feedback resource you can check the feedbacks made on sales and in the response you will also get the feedback\_id:

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/$ORDER_ID/feedback
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/825103323/feedback
```

Respuesta:

```javascript
{
	"sale": {
		"reason": null,
		"item": {
			"price": 275.48,
			"id": "MLB1179412386",
			"title": "Capa Térmica Para Piscina Thermocap Preta 7,5x3 Metros",
			"currency_id": "BRL"
		},
		"role": "seller",
		"extended_feedback": [],
		"date_created": "2020-09-25T16:33:29.000-04:00",
		"fulfilled": true,
		"rating": "positive",
		"visibility_date": "2020-09-29T18:39:35.000-04:00",
		"restock_item": false,
		"message": null,
		"has_seller_refunded_money": null,
		"site_id": "MLB",
		"modified": false,
		"from": {
			"nickname": "OLIST",
			"id": 219324699,
			"status": "active",
			"points": 702811
		},
		"id": 5040068160032,
		"to": {
			"nickname": "OLAD3975325",
			"id": 230788845,
			"status": "active",
			"points": 22
		},
		"reply": null,
		"order_id": 4025473265,
		"app_id": "1505",
		"status": "active"
	},
	"purchase": {
		"reason": null,
		"item": {
			"price": 275.48,
			"id": "MLB1179412386",
			"title": "Capa Térmica Para Piscina Thermocap Preta 7,5x3 Metros",
			"currency_id": "BRL"
		},
		"role": "buyer",
		"extended_feedback": [],
		"date_created": "2020-09-29T18:39:36.000-04:00",
		"fulfilled": true,
		"rating": "positive",
		"visibility_date": "2020-09-29T18:39:35.000-04:00",
		"message": "Produto chegou no prazo!",
		"has_seller_refunded_money": null,
		"site_id": "MLB",
		"modified": false,
		"from": {
			"nickname": "OLAD3975325",
			"id": 230788845,
			"status": "active",
			"points": 22
		},
		"id": 5040068164512,
		"to": {
			"nickname": "OLIST",
			"id": 219324699,
			"status": "active",
			"points": 702811
		},
		"reply": null,
		"order_id": 4025473265,
		"app_id": "1505",
		"status": "active"
	}
}
```

There is one pair of feedback\_id for each transaction: sale and purchase. In this test example,“id”: 5040068160032 is the feedback\_id for the sale-side , while “id”: 5040068164512 corresponds to purchase-side.

Notas:

In the case of shipments without Mercado Envíos (or Customized Shipping), it is essential to have the sales feedback for a successful closure. This is the confirmation that the buyer has received their product and is satisfied with the transaction. To validate that sales feedback has been received properly, it is important to verify certain attributes, such as:

"role": "buyer",  
"extended\_feedback": \[],  
"date\_created": "2020-09-29T18:39:36.000-04:00",  
"fulfilled": true,  
"rating": "positive",  
"visibility\_date": "2020-09-29T18:39:35.000-04:00",  
"message": "Produto chegou no prazo!",  
"has\_seller\_refunded\_money": null,  
"site\_id": "MLB"

It's important to highlight that once the sales feedback has been received and it has been confirmed that the transaction has been successfully completed, the payment is released to the seller. This is a crucial step to ensure reliability and efficiency in all transactions conducted through Mercado Libre.

## Consult feedback

You can also make a GET request to get the details of a feedbacks using the ID of the feedback obtained in orders.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN'https://api.mercadolibre.com/feedback/$FEEDBACK_ID
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/feedback/9041207884458
```

Resposta:

```javascript
{
	"adult_content": false,
	"reason": null,
	"item": {
		"price": 275.48,
		"id": "MLB1179412386",
		"title": "Capa Térmica Para Piscina Thermocap Preta 7,5x3 Metros",
		"currency_id": "BRL"
	},
	"role": "seller",
	"extended_feedback": [],
	"date_created": "2020-09-25T16:33:29.000-04:00",
	"fulfilled": true,
	"rating": "positive",
	"visibility_date": "2020-09-29T18:39:35.000-04:00",
	"restock_item": false,
	"message": null,
	"has_seller_refunded_money": null,
	"site_id": "MLB",
	"modified": false,
	"from": {
		"nickname": "OLIST",
		"id": 219324699,
		"status": "active",
		"points": 702831
	},
	"id": 9041207884458,
	"to": {
		"nickname": "OLAD3975325",
		"id": 230788845,
		"status": "active",
		"points": 22
	},
	"reply": null,
	"order_id": 4025473265,
	"status": "active"
}
}
```

## Changing feedback

You have already learned how to GET the other party’s feedback\_id just by doing a POST to the API as follows:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Content-Type: application/json' -d '{
  "fulfilled": true,
  "rating": "positive",
  "message": "It’s ok.",
}'
https://api.mercadolibre.com/feedback/$FEEDBACK_ID
```

**Next topic:** [Searches &amp; advanced features.](../../en_us/products-analitics-benchmarking/)