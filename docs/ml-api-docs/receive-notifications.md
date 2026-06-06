# Receive notifications

**Tags:** Receive notifications,notifications,Subscribe to notifications,Feed historial,feed
**Created:** 2020-05-31T12:51:22Z
**Last Updated:** 2026-05-12T21:44:24Z

---

## Receive notifications

Some events occur on Global Selling’s side and notifications are the only way to become aware of them. Receiving notifications enables you to have a real-time feed of the changes that occur on the different resources of our API. For example, if you listed an item that was then paused, if someone asked a question, if they bought an item, or even if they paid it and/or requested shipment. An efficient way with no need to continuously query our API!

## Notification Settings

#### Callback URL:

Specifies the public URL where the system will send notifications via HTTP POST. This URL must be accessible and configured to receive data from the selected topics. Example: http://myapp.com/notifications.

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/169613233711-WhatsApp-Image-2025-01-21-at-18.09.33.jpeg)

## Subscribe to notifications

If you want to start receiving notifications you need to go to [our application manager](https://global-selling.mercadolibre.com/devcenter/), where you first created your app, and edit the details and specify the topics you will listen to.

Note:

\- If you haven’t created your App yet, [go to the creating your app section](https://global-selling.mercadolibre.com/devcenter/).  
\- Notifications have UTC time zone.

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/166339572542-Captura-de-pantalla-2025-02-28-a-la-s--3.32.43-p.-m..png)

**Notifications Callback URL** : configure the public URL of your domain where you want to receive notifications for the different topics. For example: “http://myshoes-app.com/callbacks”.

**Topics**: select among different topics to receive their notifications.

## Available topics

**items**: notified of any changes on a parent item you have published.

**marketplace items**: notified of any changes to any of your marketplace items.

**marketplace orders**: notified of your recently created sales orders.

**marketplace questions**: notified of all questions asked or answered.

**marketplace messages**: will inform the subscriber of new messages created with his/her user\_id as receiver.

**marketplace shipments**: you will receive notifications after the creation and shipping changes to your confirmed sales.

**marketplace claims**: you will receive notifications related to sales claims ([work with claims](https://global-selling.mercadolibre.com/devsite/working-with-claims-global-selling)).

**marketplace fbm stock**: you will receive notifications related to stock of fulfillment.

**marketplace shipments**: will receive notifications after the creation and shipping changes to your confirmed sales.

**marketplace item competition**: will be notified when competing catalog listings change status. Both from competitor to winner and vice versa.

**marketplace CBT items Uptin**: will be notified when your items have been migrated, consult a resource and see what happened to your items..

**public offers**: you will receive notifications when an offer on an item is created or changes status.

**public candidates**: you will receive notifications each time an item is invited to participate in a promotion.

Note:

You should [use the /price\_to\_win resource](https://global-selling.mercadolibre.com/devsite/catalog-competition-gs#conditions-price-winning-item) to check the item's condition and take the necessary actions to win the product page.

## Events trigger notifications

Any change to any topic of the JSON will trigger the relevant notifications. You should always see the notifications and immediately query the relevant resource to check whether there is a change with its application. These changes may come from other sources, such as action via [Global Selling](https://global-selling.mercadolibre.com/)

## Important considerations

Important:

Update your integration to return an HTTP 200 within 500 milliseconds of receiving the notification and prevent us from disabling your notification topics. Otherwise, you will have to subscribe to the topics again.

- We will send a POST in the URL; so, your application should confirm -as soon as possible- if the HTTP 200 status code was received. Otherwise, the message will be considered “not sent” and new attempts will be made.
- The messages will be sent at exponential intervals, and delivery attempts will be made at a 1-hour interval. After this period, messages that were not accepted will be excluded.
- Taking into account that you may get a large number of notifications, it is advisable to work with rows, in which the server should immediately confirm notification receipt (HTTP 200) and query the topic in the API to avoid new notification attempts and duplicated notifications.
- Bear in mind that some events are not visible for integrators that trigger notifications.

## Get the details

After receiving a notification of one topic, you’ll need to make a GET to the resource to get the details and then, if you stored the previous JSON, compare both.

### items

Notification response:

```javascript
{
   "_id": "5da8a1b24be30a49eb66c52a",
   "resource": "/items/CBT123456789",
   "user_id": 123456789,
   "topic": "items",
   "application_id": 2069392825111111,
   "attempts": 1,
   "sent": "2020-01-09T13:44:33.006Z",
   "received": "2020-01-09T13:44:32.984Z"
}
```

This information will help you make a GET to the items resource:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/items/$ITEM_ID
```

### marketplace items

Notification response:

```javascript
{
   "_id": "5da8a1b24be30a49eb66c52a",
   "resource": "/marketplace/items/MLM686791111",
   "user_id": 123456789,
   "topic": "marketplace_items",
   "application_id": 2069392825111111,
   "attempts": 1,
   "sent": "2019-10-09T13:44:33.006Z",
   "received": "2019-10-09T13:44:32.984Z"
}
```

This information will help you make a GET to the items resource:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/items/$ITEM_ID
```

### marketplace orders

Notification response:

```javascript
{
   "_id": "5da8a1b24be30a49eb66c52a",
   "resource": "/marketplace/orders/1499111111",
   "user_id": 123456789,
   "topic": "marketplace_orders",
   "application_id": 2069392825111111,
   "attempts": 1,
   "sent": "2019-10-09T13:58:23.347Z",
   "received": "2019-10-09T13:58:23.329Z"
}
```

This information will help you make a GET to the orders resource:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/orders/$ORDER_ID
```

### marketplace orders on site

Notification response:

```javascript

{
   "_id": "5da8a1b24be30a49eb66c52a",
   "resource": "/marketplace/orders/1499111111",
   "user_id": 123456789,
   "topic": "marketplace_orders_on_site",
   "application_id": 2069392825111111,
   "attempts": 1,
   "sent": "2019-10-09T13:58:23.347Z",
   "received": "2019-10-09T13:58:23.329Z"
}

```

This topic ONLY APPLIES to On-Site Integration. This information will help you perform a GET request for on-site orders

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/orders/$ORDER_ID
```

### marketplace questions

Notification response:

```javascript
{
   "_id": "5da8a1b24be30a49eb66c52a",
   "resource": "/marketplace/questions/5036111111",
   "user_id": "123456789",
   "topic": "marketplace_questions",
   "application_id": 2069392825111111,
   "attempts": 1,
   "sent": "2017-10-09T13:51:05.464Z",
   "received": "2017-10-09T13:51:05.438Z"
}
```

This information will help you make a GET to the questions resource:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/questions/$QUESTION_ID
```

### marketplace messages

Notification response:

```javascript
{
  "_id": "5da8a1b24be30a49eb66c52a",
  "resource": "/marketplace/messages/3f6da1e35ac84f70a24af7360d24c7bc",
  "user_id": "268897726",
  "topic": "marketplace_messages",
  "application_id": 2219612378080430,
  "attempts": 1,
  "sent": "2020-03-17T12:59:44.164Z",
  "received": "2020-03-17T12:59:44.131Z"
 }
```

This information will help you make a GET to the messages resource:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/messages/$RESOURCE
```

### marketplace shipments

Notification response:

```javascript
{
  "_id": "5da8a1b24be30a49eb66c52a",
  "resource":"/marketplace/shipments/1041417027",
  "user_id":"465432224",
  "topic":"marketplace_shipments",
  "application_id":5503910054141466,
  "attempts":1,
  "sent":"2020-01-01T17:46:24.606Z",
  "received":"2020-01-29T17:46:24.616Z"
}
```

This information will help you make a GET to the orders resource:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/shipments/$RESOURCE
```

### marketplace claims

Notification response:

```javascript
{
  "_id": "5da8a1b24be30a49eb66c52a",
  "resource":"/marketplace/claims/1041417027",
  "user_id":"465432224",
  "topic":"marketplace_claims",
  "application_id":5503910054141466,
  "attempts":1,
  "sent":"2019-10-29T17:46:24.606Z",
  "received":"2019-10-29T17:46:24.616Z"
}
```

This information will help you make a GET to the orders resource::

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/claims/$RESOURCE
```

### marketplace fbm stock

Notification response:

```javascript
{
  "_id": "5da8a1b24be30a49eb66c52a",
  "resource":"/marketplace/stock/fulfillment/operations/9876",
  "user_id":"465432224",
  "topic":"marketplace_fbm_stock"
}
```

This information will help you make a GET to the fulfillment stock resource:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/$RESOURCE
```

### marketplace item competition

Important:

This topic is available in Mexico.

Notification response:

```javascript
{
  "_id": "5da8a1b24be30a49eb66c52a",
  "resource":"/items/ITEM_ID/price_to_win",
  "user_id":"123456789",
}
```

This information will help you make a GET to [the /price\_to\_win resource](https://global-selling.mercadolibre.com/devsite/catalog-competition-gs#conditions-price-winning-item):

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/$RESOURCE
```

### marketplace pricing suggestion

Notification response:

```javascript
{
  "resource": "/marketplace/benchmarks/items/$ITEM_ID/details",
  "user_id": 318494000,
  "topic": "price_suggestion",
  "application_id": 22299753060000,
  "attempts": 1,
   "sent": "2024-05-09T13:44:33.006Z",
   "received": "2024-05-09T13:44:32.984Z"
}
```

This information will help you make a GET to [the pricing suggestion resource](https://global-selling.mercadolibre.com/devsite/pricing-manager):

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/marketplace/benchmarks/items/$ITEM_ID/details
```

### marketplace CBT Items Uptin

Notification response:

```javascript
{
    "resource": "/marketplace/items/CBT3011339467/migration_live_listing",
    "user_id": 318494000,
  "topic": "marketplace_cbt_item_uptin",
  "application_id": 22299753060000,
  "attempts": 1,
   "sent": "2024-05-09T13:44:33.006Z",
   "received": "2024-05-09T13:44:32.984Z",
    "actions": [
        "migration"
    ]
}
```

This information will help you make a GET to [the Uptin migration resource](https://global-selling.mercadolibre.com/devsite/en_us/user-products-cbt/uptin-migration):

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/$RESOURCE
```

### marketplace item competition

Important:

This topic is available in Mexico.

Notification response:

```javascript
{
  "_id": "5da8a1b24be30a49eb66c52a",
  "resource":"/items/ITEM_ID/price_to_win",
  "user_id":"123456789",
}
```

This information will help you make a GET to [the /price\_to\_win resource](https://global-selling.mercadolibre.com/devsite/catalog-competition-gs#conditions-price-winning-item):

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/$RESOURCE
```

### public offers

Notification:

```javascript
{
  "_id": "5da8a1b24be30a49eb66c52a",
  "topic": "public_offers",
  "resource": "/seller-promotions/promotions/offer/OFFER-MLM1234567-00001/123456",
  "user_id": 2222222,
  "application_id": 5111111111111,
  "attempts": 1,
  "recieved": "2022-01-20T17:13:53.617074685Z",
  "sent": "2022-01-20T19:22:31.579985295Z"
}
```

With this information you can perform a GET to the /seller-promotions/offers resource:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/seller-promotions/promotions/offer/$OFFER_ID/$USER_ID
```

### public candidates

Notification:

```javascript
{
  "_id": "5da8a1b24be30a49eb66c52a",
  "topic": "public_candidates",
  "resource": "/seller-promotions/promotions/candidate/CANDIDATE-MLM1234567-00001/123456",
  "user_id": 2222222,
  "application_id": 5111111111111,
  "attempts": 1,
  "recieved": "2021-12-23T17:13:53.617074685Z",
  "sent": "2021-12-23T19:22:31.579985295Z"
}
```

With this information you can perform a GET on the /seller-promotions/candidates resource:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN'  https://api.mercadolibre.com/marketplace/seller-promotions/promotions/candidate/$CANDIDATE_ID/&USER_ID
```

## Test your notifications

You can validate if you are receiving notices in your integration importing [the following link in Postman](https://www.getpostman.com/collections/0f92a0f9cc779e7f2a3f). If your URL works well, you will be receiving code 200 status ok as an answer as shown in the following image.

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/DevSite/316381038721-notification-gs.jpg)

## Feed historial

From these dates, you should check the history of lost notifications for these topics by making a GET to the following endpoint:  
If you are using some type of filter in your application, from Mercado Libre we will generate notifications with the following IP addresses:  
\- **54.88.218.97**  
\- **18,215,140,160**  
\- **18,213,114,129**  
\- **18.206.34.84**

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/missed_feeds?app_id=$APP_ID
```

Exemplo:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/missed_feeds?app_id=3486171129139063
```

Response:

```javascript
{
   "messages": [
       {
           "_id": "/marketplace/messages/5da8a1b24be30a49eb66c52a",
           "resource": "a35cf79864a845ca9a3bf6aee59bb4d7",
           "user_id": "465432224",
           "topic": "marketplace_messages",
           "application_id": 3486171129139063,
           "attempts": 5,
           "sent": "2019-10-17T17:15:30.279Z",
           "received": "2019-10-17T17:15:30.259Z",
           "request": {
               "url": "https://YOUR_URL",
               "headers": {
                   "accept": "application/json",
                   "content-type": "application/json",
                   "content-length": 207
               },
               "data": "{\"resource\":\"/marketplace/messages/a35cf79864a845ca9a3bf6aee59bb4d7\",\"user_id\":\"465432224\",\"topic\":\"marketplace_messages\",\"application_id\":3486171129139063,\"attempts\":1,\"sent\":\"2019-10-17T17:15:30.279Z\",\"received\":\"2019-10-17T17:15:30.259Z\"}"
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
           "_id": "/items/CBT123456789",
           "resource": "/items/CBT123456789",
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
               "data": "{\"resource\":\"/items/CBT123456789\",\"user_id\":468424240,\"topic\":\"items\",\"application_id\":3486171129139063,\"attempts\":1,\"sent\":\"2019-10-17T14:47:06.414Z\",\"received\":\"2019-10-17T14:47:06.375Z\"}"
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

Request:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/missed_feeds?app_id=$APP_ID&topic=$TOPIC
```

Example:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/myfeeds?app_id=3486171129139063&topic=items
```

Note:

Bear in mind that 10 notices will be displayed by default, but you can use LIMIT and OFFSET to change the number that you want to receive, as shown below:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/myfeeds?app_id=$APP_ID&offset=1&limit=5
```