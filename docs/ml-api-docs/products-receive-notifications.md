# Notifications

**Tags:** Receive,Notifications
**Created:** 2018-06-27T12:01:32Z
**Last Updated:** 2025-09-16T17:12:20Z

---

## Receive notifications

Some events occur on MercadoLibre's side and notifications are the only way to become aware of them. Receiving notifications enables you to have a real-time feed of the changes that occur on the different resources of our API. For example, if you listed an item that was then paused, if someone asked a question, if they bought an item, or even if they paid it and/or requested shipment. An efficient way with no need to continuously query our API!

## Subscribe to notifications

If you want to start receiving notifications you need to login and [access to My Applications](http://applications.mercadolibre.com/), where you created your application at first, edit details and specific the topics that you will receive. If you haven't created your app yet, you can do it now.

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/255588216874-Captura-de-Tela-2022-05-02-a-s-16.16.11.png)

**Notifications Callback URL** : configure the public URL of your domain where you want to receive notifications for the different topics. For example: “http://myshoes-app.com/callbacks”.

**Topics**: select among different topics to receive their notifications.

Nota:

\- Topics created\_orders, payments and messaging are not user for real state, vehicles and services.  
\- Notifications have UTC time zone.

## Available topics

**items**: to get notified of any changes on an item you have published.

**questions**: to get notified of all questions asked or answered.

**payments**: to get notified when a payment is created on an order, or when its status changes.

**messages**: the topic will inform the subscriber of new messages created with his/her user\_id as receiver.

**orders\_v2**: you will receive notifications after the creation and changes to any of confirmed sales (recommended).

**shipments**: you will receive notifications after the creation and shipping changes to your confirmed sales.

**orders feedback**: you will receive notifications from the creation and changes made in feedbacks of your confirmed sales.

**quotations**: you will receive notifications related to listing quotations (applicable to real estate integration only in Mercado Libre Chile)

**invoices**: you will receive notifications related to invoices (sales receipts) generated via Mercado Libre automatic billing applicable if [working with Mercado Envíos Full](https://developers.mercadolivre.com.br/pt_br/api-fiscal-faturamento-de-venda) biller only. It is available only in Brazil

**claims**: you will receive notifications related to sales claims ([work with claims](https://developers.mercadolibre.com.ar/en_us/working-with-claims)).

**item competition**: You will receive notifications when competing catalog posts change status. Both from competitor to winner and vice versa.

**public candidates**: you will receive notifications each time an item is invited to participate in a promotion.

**public offers**: you will receive notifications when an offer on an item is created or changes status.

**flex-handshakes**: You will receive notifications when packages are transferred between carriers and when it is scanned for the first time (when shipped is marked).

**stock\_locations**: You will receive notifications when the [**stock\_locations**](https://developers.mercadolibre.com.ar/en_us/full-and-flex-coexistence?nocache=true#Modify-the-item-stock) of the **user\_product** are modified, either by increasing or decreasing the quantity field.

Note:

You should use the /price\_to\_win resource to check the item's condition and take the necessary actions to win the product page.

**catalog\_suggestions**: You will receive notifications about the status changes of product suggestions for our catalog - Brand Central.

**leads credits**: you will receive notifications related to approved or rejected credits in Mercado Libre (applies to [vehicles](https://developers.mercadolibre.com.ar/en_us/credits-pre-approved-vehicles), and [real estate](https://developers.mercadolibre.com.ar/en_us/credits-pre-approved)).

**stock fulfillment**: you will receive notifications with the detail of a particular operation executed on the stock that the seller has stored in the FBM warehouses.

**best price eligible**: you will receive notifications when a new promotion is created, the amount of the target price is modified and when an item that is competing is no longer the winner of the special highlight in the catalog.

**items\_prices**: you will receive notifications of the item\_id each time the price is created, updated or deleted.

**user products families**: You will receive notifications when they are modified [**families**](https://developers.mercadolibre.com.ar/en_us/price-per-variation#Flows-that-are-not-impacted-by-this-development) of **user\_product**, by modifying attributes that impact this.

## What events trigger notifications?

Bear in mind that any change to any topic of the Json will trigger the relevant notifications. You should always see the notifications and immediately query the relevant resource to check whether there is a change with its application. These changes may come from other sources, such as action via front, Seller Central, or other applications, etc.

## Important Considerations

Importante:

Update your integration to return an HTTP 200 within 500 milliseconds of receiving the notification and prevent us from deactivating the topics of your notifications. Otherwise, you will have to [subscribe again to the topics](https://developers.mercadolibre.com.ar/en_us/products-receive-notifications#Subscribe-to-notifications).

- We will send a POST to the callback URL and your application must confirm the correct reception using an HTTP 200. Otherwise, the message will be considered as "not received" and there will be a new attempt to send it.
- The messages will be sent and the sending attempts will be made within a 1 hour interval. After this period, messages that were not accepted will be excluded.
- You may get a large number of notifications, it is advisable to work with rows, in which the server should immediately confirm notification receipt (HTTP 200) and query the topic in the API to avoid new notification attempts and duplicated notifications.
- Some events are not visible for integrators that trigger notifications.

## Get the details

After receiving a notification of one topic, you’ll need to make a GET to the resource to get the details and then, if you stored the previous Json, compare both.

### items

Notification response:

```javascript
{
"_id":"f9f08571-1f65-4c46-9e0a-c0f43faas1557e",      
"resource": "/items/MLA686791111",
   "user_id": 123456789,
   "topic": "items",
   "application_id": 2069392825111111,
   "attempts": 1,
   "sent": "2017-10-09T13:44:33.006Z",
   "received": "2017-10-09T13:44:32.984Z"
}
```

This information will help you make a GET to the items resource:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/$ITEM_ID
```

### orders

Notification response:

```javascript
{
  "_id":"f9f08571-1f65-4c46-9e0a-c0f43faas1557e",   
 "resource": "/orders/1499111111",
   "user_id": 123456789,
   "topic": "orders",
   "application_id": 2069392825111111,
   "attempts": 1,
   "sent": "2017-10-09T13:58:23.347Z",
   "received": "2017-10-09T13:58:23.329Z"
}
```

This information will help you make a GET to the orders resource:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/$ORDER_ID
```

### questions

Notification response:

```javascript
{
"_id":"f9f08571-1f65-4c46-9e0a-c0f43faas1557e",      
"resource": "/questions/5036111111",
   "user_id": "123456789",
   "topic": "questions",
   "application_id": 2069392825111111,
   "attempts": 1,
   "sent": "2017-10-09T13:51:05.464Z",
   "received": "2017-10-09T13:51:05.438Z"
}
```

This information will help you make a GET to the questions resource:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/questions/$QUESTION_ID
```

### payments

Notification response:

```javascript
{
"_id":"f9f08571-1f65-4c46-9e0a-c0f43faas1557e",      
"resource": "/collections/3043111111",
   "user_id": 123456789,
   "topic": "payments",
   "application_id": 2069392825111111,
   "attempts": 1,
   "sent": "2017-10-09T13:58:22.081Z",
   "received": "2017-10-09T13:58:22.061Z"
}
```

This information will help you make a GET to the questions resource:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/$RESOURCE
```

### Messages:

Model Structure with Subtopics

[**created:**](https://developers.mercadolibre.com.ar/es_ar/mensajeria-post-venta) You will receive notifications of new messages that are generated, with the corresponding user\_id (Buyer or Seller) as the recipient.

[**read:**](https://developers.mercadolibre.com.ar/es_ar/mensajes-pendientes#Mensajes-pendientes-de-leer) you will receive notifications of message readings.

Notification response:

```javascript

{
  "id": ""5e2827f2-99b7-474e-b68b-6a86e934cc7e",
  "resource": "3f6da1e35ac84f70a24af7360d24c7bc",
  "user_id": 123456789,
  "topic": "messages",
  "actions": ["created"], or  ["read"]
  "application_id": 89745685555,
  "attempts": 1,
  "sent": "2017-10-09T13:44:33.006Z",
  "received": "2017-10-09T13:44:32.984Z"
}
```

This information will help you make a GET to the messages resource:

```javascript

curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/messages/$RESOURCE
```

### orders\_v2

Notification response:

```javascript
{
  "_id":"f9f08571-1f65-4c46-9e0a-c0f43faas1557e",   
  "resource":"/orders/2195160686",
  "user_id": 468424240,
  "topic":"orders_v2",
  "application_id": 5503910054141466,
  "attempts":1,
  "sent":"2019-10-30T16:19:20.129Z",
  "received":"2019-10-30T16:19:20.106Z"
}
```

This information will help you make a GET to the messages resource:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/$ORDER_ID
```

### quotations

Notification response:

```javascript
{
    "_id":"f9f08571-1f65-4c46-9e0a-c0f43faas1557e",   
    "resource":"/quotations/5013267",
    "user_id": 484630370,
    "topic":"quotations",
    "application_id": 5503910054141466,
    "attempts":1,
    "sent":"2019-10-30T14:04:14.584Z",
    "received":"2019-10-30T14:04:14.553Z"
}
```

Note:

Notifications regarding quotes are only available for Mercado Libre Chile.

This information will help you make a GET to the orders resource:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/quotations/$QUOTATION_ID?caller.type=seller
```

Where caller.type is to identify who is the generator of the action. It can be a seller or a user. Generally, for launch applications it will be that of the seller.

### invoices

Notification response:

```javascript
{
    "_id":"f9f08571-1f65-4c46-9e0a-c0f43faas1557e",   
    "resource": "/users/123456789/invoices/$INVOICE_ID",
    "user_id": 123456789,
    "topic": "invoices",
    "application_id": 5503910054141466,
    "attempts": 1,
    "sent": "2018-03-21T20:51:11.906Z",
    "received": "2018-03-21T20:51:11.884Z"
}
```

This information will help you make a GET to the /invoices resource:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/$RESOURCE
```

### claims

Notification response:

```javascript
{
  "_id":"f9f08571-1f65-4c46-9e0a-c0f43faas1557e",   
  "resource":"/v1/claims/1041417027",
  "user_id":"465432224",
  "topic":"claims",
  "application_id":5503910054141466,
  "attempts":1,
  "sent":"2019-10-29T17:46:24.606Z",
  "received":"2019-10-29T17:46:24.616Z"
}
```

This information will help you make a GET to the /claims resource:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/$RESOURCE
```

### item competition

Important:

This topic is available in Argentina, Brazil and Mexico.

Notification:

```javascript
{
  "_id":"f9f08571-1f65-4c46-9e0a-c0f43faas1557e",   
  "resource":"/items/ITEM_ID/price_to_win",
  "user_id":"123456789",
  "topic":"catalog_item_competition_status",
  "application_id":4806348059754779,
  "attempts":1,
  "sent":"2020-03-03T18:57:54.824Z",
  "received":"2020-03-03T18:57:54.819Z"
}
```

This information will help you make a GET to the [/price\_to\_win resource](https://developers.mercadolibre.com.ar/en_us/get-to-know-how-to-adapt-your-development-to-catalogue?nocache=true#Competing-to-win-the-sales).

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/$ITEM_ID/price_to_win
```

### catalog suggestions

Notification:

```javascript
{

  "topic": "catalog_suggestions",
  "_id":"f9f08571-1f65-4c46-9e0a-c0f43faas1557e",   
  "resource": "/catalog_suggestions/MLA123456",
  "user_id": 123456,
  "application_id": 5775857146034005,
  "attempts": 1,
  "recieved": "2021-12-05T17:13:53.617074685Z",
  "sent": "2021-12-05T19:22:31.579985295Z"
}
```

With this information, you can make a GET to the /catalog\_suggestion resource:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/catalog_suggestions/$SUGGESTION_ID
in
```

### Leads credits

Notification:

```javascript
{
  "_id": "15b0e685-65be-40b6-8d23-alkdjf6465a4f",
  "topic": "leads-credits",
  "resource": "/vis/loan/66e93589-2d10-11ed-ae7f-0aa30fafa621",
  "user_id": 123456789,
  "application_id": 874563217565897,
  "sent": "2022-09-13T21:03:24.581Z",
  "attempts": 2,
  "received": "2022-09-13T21:02:22.735Z"
}
```

With this information, you will be able to perform a GET to the resource of /vis/loans:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/vis/loans/$CREDIT_ID?seller_id=$SELLER_ID

in
```

### stock fulfillment

Important:

This topic is available in Argentina, Brazil, Mexico, Chile and Colombia where there is fulfillment.

Notification:

```javascript
{
   "_id":"f9f08571-1f65-4c46-9e0a-c0f43faas1557e",   
   "resource":"/stock/fulfillment/operations/9876",
   "user_id":1234,
   "topic":"fbm_stock_operations",
   "application_id":12341234,
   "attempts":1,
   "sent":"2017-10-09T13:58:23.347Z",
   "received":"2017-10-09T13:58:23.329Z"
}
```

With this information, you can make a GET to the /stock/fulfillment/operations resource:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/$RESOURCE
```

### items\_prices

Notification:

```javascript
{
   "_id":"f9f08571-1f65-4c46-9e0a-c0f43faas1557e",
   "resource": "/items/MLA686791111",
   "user_id": 123456789,
   "topic": "items",
   "application_id": 2069392825111111,
   "attempts": 1,
   "sent": "2023-02-06T13:44:33.006Z",
   "received": "2023-02-06T13:44:32.984Z"
}
```

With this information, you can make a GET to the /prices resource:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/$ITEM_ID/prices
```

### public candidates

Notification:

```javascript
{
  "topic": "public_candidates",
  "_id":"f9f08571-1f65-4c46-9e0a-c0f43faas1557e",   
  "resource": "/seller-promotions/candidates/CANDIDATE-MLA1111111111-11111111",
  "user_id": 2222222,
  "application_id": 5111111111111,
  "attempts": 1,
  "recieved": "2021-12-23T17:13:53.617074685Z",
  "sent": "2021-12-23T19:22:31.579985295Z"
}
```

With this information you can perform a GET on the /seller-promotions/candidates resource:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN'  https://api.mercadolibre.com/seller-promotions/candidates/$CANDIDATE_ID
```

### public offers

Notification:

```javascript
{
  "topic": "public_offers",
  "_id":"f9f08571-1f65-4c46-9e0a-c0f43faas1557e",   
  "resource": "/seller-promotions/offers/1234567",
  "user_id": 2222222,
  "application_id": 5111111111111,
  "attempts": 1,
  "recieved": "2022-01-20T17:13:53.617074685Z",
  "sent": "2022-01-20T19:22:31.579985295Z"
}
```

With this information you can perform a GET to the next resource:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/flex/sites/$SITE_ID/shipments/$SHIPMENT_ID/assignment/v1
```

### flex carriers

Notification:

```javascript
{
"_id": "495cac10-8496-45f8-a6f5-8bff0a948597",
"topic": "flex-handshakes",
"resource": "/flex/sites/MLA/shipments/407323124706/assignment/v1",
"user_id": 123456789,
"application_id": 213123389095511,
"sent": "2022-09-13T21:06:13.632Z",
"attempts": 4,
"received": "2022-09-13T20:59:13.911Z"
}
```

Request:

With this information you can perform a GET to the next resource:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/flex/sites/$SITE_ID/shipments/$SHIPMENT_ID/assignment/v1
```

### stock\_locations

Notification:

```javascript
{
"_id": "495cac10-8496-45f8-a6f5-8bff0a948597",
"topic": "stock-location",
"resource": "/user-products/$USER_PRODUCT_ID/stock",
"user_id": 123456789,
"application_id": 213123389095511,
"sent": "2022-09-13T21:06:13.632Z",
"attempts": 4,
"received": "2022-09-13T20:59:13.911Z"
}
```

Request:

With this information you can perform a GET to [the User product ID resource](https://developers.mercadolibre.com.ar/en_us/full-and-flex-coexistence?nocache=true#Obtaining-the-stock-of-an-item).

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/user-products/$USER_PRODUCT_ID/stock
```

### user products families

Notification:

```javascript
{
"_id": "2e4f6253-ebcc-421d-9d0b-97f80290ac5d",
"topic": "user-products-families",
"resource": "/sites/$SITE_ID/user-products-families/$FAMILY_ID",
"user_id": 123456789,
"application_id": 213123389095511,
"sent": "2024-07-11T18:43:50.793Z",
"attempts": 1,
"received": "2024-07-11T18:43:50.699Z"
}
```

Request:

With this information you can perform a GET to the resource [consult a family's user products](https://developers.mercadolibre.com.ar/en_us/price-per-variation).

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/sites/$SITE_ID/user-products-families/$FAMILY_ID
```

## Test your notifications

You can validate if you are receiving notices in your integration importing the following [link in Postman](https://www.getpostman.com/collections/0f92a0f9cc779e7f2a3f). If your URL works well, you will be receiving code 200 status ok as an answer as shown in the following image.

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/s3/notificacion.png)

## Feed historical

Check the history of lost notifications for these topics by making a GET to the following endpoint:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/missed_feeds?app_id=$APP_ID
```

Note:

The response will contain information on the notifications that after the eighth retry (1 hour), have not received a http code 200, that is, we will consider the notification as lost.

If you are using some type of filter in your application, from Mercado Libre we will generate notifications with the following IP addresses:  
\- 54.88.218.97  
\- 18.215.140.160  
\- 18.213.114.129  
\- 18.206.34.84

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/missed_feeds?app_id=3486171129139063
```

Response:

```javascript
{
   "messages": [
       {
           "_id": "5da8a1b24be30a49eb66c52a",
           "resource": "a35cf79864a845ca9a3bf6aee59bb4d7",
           "user_id": "465432224",
           "topic": "messages",
           "application_id": 3486171129139063,
           "attempts": 1,
           "sent": "2019-10-17T17:15:30.279Z",
           "received": "2019-10-17T17:15:30.259Z",
           "request": {
               "url": "https://YOUR_URL",
               "headers": {
                   "accept": "application/json",
                   "content-type": "application/json",
                   "content-length": 207
               },
               "data": "{\"resource\":\"a35cf79864a845ca9a3bf6aee59bb4d7\",\"user_id\":\"465432224\",\"topic\":\"messages\",\"application_id\":3486171129139063,\"attempts\":1,\"sent\":\"2019-10-17T17:15:30.279Z\",\"received\":\"2019-10-17T17:15:30.259Z\"}"
           },
           "response": {
               "req_time": 260,
               "http_code": 400,
               "body": "[object Object]",
               "headers": {
                   "date": "Thu, 17 Oct 2019 17:15:30 GMT",
                   "content-length": "141",
                   "content-type": "text/plain; charset=utf-8",
                   "connection": "close"
               }
           }
       },
       {
           "_id": "5da87eea5b35b865994cfd7d",
           "resource": "/items/MLA820048955",
           "user_id": 468424240,
           "topic": "items",
           "application_id": 3486171129139063,
           "attempts": 1,
           "sent": "2019-10-17T14:47:06.414Z",
           "received": "2019-10-17T14:47:06.375Z",
           "request": {
               "url": "https://YOUR_URL",
               "headers": {
                   "accept": "application/json",
                   "content-type": "application/json",
                   "content-length": 189
               },
               "data": "{\"resource\":\"/items/MLA820048955\",\"user_id\":468424240,\"topic\":\"items\",\"application_id\":3486171129139063,\"attempts\":1,\"sent\":\"2019-10-17T14:47:06.414Z\",\"received\":\"2019-10-17T14:47:06.375Z\"}"
           },
           "response": {
               "req_time": 498,
               "http_code": 200,
               "body": "[object Object]",
               "headers": {
                   "content-type": "application/json; charset=utf-8",
                   "date": "Thu, 17 Oct 2019 14:47:06 GMT",
                   "content-length": "190",
                   "connection": "close"
               }
           }
       }

}
```

### Resource fields

**resource**: full resource, with topic by which the notification was generated.

**user\_id**: user who generated it.

**topic**: reference issue of the notification.

**request**: query made to the URL of notifications, along with their respective url, header and data.

**response**: response from the server receiving the notification.

**http\_code**: HTTP code returned by that server, so that it does not retry, you must send a 200.

### Filter by topic

There is the possibility of filtering by topic, it is very useful for when you have a large number of notifications.

Call:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/missed_feeds?app_id=$APP_ID&topic=$TOPIC
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/missed_feeds?app_id=3486171129139063&topic=payments
```

Note:

Bear in mind that 10 notices will be displayed by default, but you can use LIMIT and OFFSET to change the number that you want to receive, as shown below:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/missed_feeds?app_id=$APP_ID&offset=1&limit=5
```