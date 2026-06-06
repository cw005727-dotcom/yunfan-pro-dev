# Manage questions & answers

**Tags:** Manage,questions,&,answers
**Created:** 2020-03-20T00:09:25Z
**Last Updated:** 2026-04-14T12:36:07Z

---

## Manage questions &amp; answers

Questions are the way buyers communicate with sellers on the Item details page before making a transaction. Handling interactions at this stage is decisive for making successful sales. This resource allows you to search, answer, and delete questions, as well as receive real-time notifications when new questions are posted.

Important: Model 6 Sellers — Restricted Access Model 6 403 Forbidden

**Sellers identified as Model 6** are blocked from accessing the Questions and Answers endpoints of this API. Any request made with an Model 6 seller identity will receive a **403 Forbidden** response.

Example 403 response body:

```javascript
{
  "message": "Forbidden",
  "error": "Forbidden",
  "status": 403,
  "cause": []
}
```

## Allowed methods

The following table summarizes the available methods for managing questions and answers:

Method Description GET /marketplace/questions/search Search questions by seller, item, or user. GET /marketplace/questions/{QUESTION\_ID} Returns a specific question by ID. POST /marketplace/answers Post an answer to a given question. DELETE /marketplace/questions/{QUESTION\_ID} Deletes a question.

## Search questions

Use this resource to retrieve questions from your listings. You can filter by seller, item, user, or status to find specific questions that need attention.

### Search by seller

Retrieve all questions received by a specific seller across all their listings.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/questions/search?seller_id=$SELLER_ID'
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/questions/search?seller_id=523130418'
```

Response:

```javascript
{
   "total": 80,
   "limit": 1,
   "questions": [
       {
           "id": 6789511129,
           "seller_id": 523130418,
           "text": "Ask from buyer",
           "text_translated": "Pregunta desde el comprador",
           "status": "ANSWERED",
           "item_id": "CBT910505150",
           "marketplace_item_id": "MLM755638064",
           "date_created": "2020-02-05T22:13:53.000-04:00",
           "hold": false,
           "deleted_from_listing": false,
           "answer": {
               "text": "Respuesta a question 6462231012",
               "text_translated": "answer to question 6462231012",
               "status": "ACTIVE",
               "date_created": "2020-02-05T22:27:23.052-04:00"
           },
           "from": {
               "id": 441782523
           },
           "site_id": "MLM"
       }
   ],
   "filters": {
       "limit": 1,
       "offset": 0,
       "is_admin": "false",
       "sorts": [],
       "caller": 523130418,
       "seller": 523130418
   },
   "available_filters": [
       {
           "id": "item",
           "name": "Item",
           "type": "text"
       },
       {
           "id": "from",
           "name": "From user id",
           "type": "number"
       },
       {
           "id": "totalDivisions",
           "name": "total divisions",
           "type": "number"
       },
       {
           "id": "division",
           "name": "Division",
           "type": "number"
       },
       {
           "id": "status",
           "name": "Status",
           "type": "text",
           "values": [
               "ANSWERED",
               "BANNED",
               "CLOSED_UNANSWERED",
               "DELETED",
               "DISABLED",
               "UNANSWERED",
               "UNDER_REVIEW"
           ]
       }
   ],
   "available_sorts": [
       "item_id",
       "from_id",
       "date_created",
       "seller_id"
   ]
}
```

### Response fields

- **total:** total number of questions found.
- **limit:** maximum number of questions returned per request.
- **questions:** array containing the question objects.
  
  - **id:** unique question identifier.
  - **seller\_id:** seller's user ID.
  - **text:** original question text from the buyer.
  - **text\_translated:** question text translated to the marketplace's language.
  - **status:** question status (see status values table below).
  - **item\_id:** CBT item ID related to the question.
  - **marketplace\_item\_id:** item ID in the destination marketplace (e.g., MLM for Mexico).
  - **date\_created:** date and time when the question was created.
  - **hold:** indicates if the question is on hold and cannot be answered yet.
  - **deleted\_from\_listing:** indicates if the question was deleted from the item listing.
  - **answer:** object containing the answer details (if answered).
    
    - **text:** answer text from the seller.
    - **text\_translated:** answer text translated to the buyer's language.
    - **status:** answer status (`ACTIVE` or `DISABLED`).
    - **date\_created:** date and time when the answer was created.
  - **from:** object containing buyer information.
    
    - **id:** buyer's user ID who made the question.
  - **site\_id:** site identifier where the question was made (e.g., MLM, MLA).
- **filters:** object containing the applied filters.
- **available\_filters:** array of filters available for the search.
- **available\_sorts:** array of fields available for sorting results.

### Question status values

Status Description **UNANSWERED** The question has not been answered yet. **ANSWERED** The question was answered. **CLOSED\_UNANSWERED** The item is closed and the question was never answered. **UNDER\_REVIEW** Both item and question are under review. **BANNED** The question was banned due to policy violations. **DELETED** The question was deleted. **DISABLED** The question was disabled.

### Available filters

- **item:** filter by item ID.
- **from:** filter by buyer's user ID.
- **status:** filter by question status.
- **totalDivisions:** total divisions for pagination.
- **division:** division number for pagination.

### Search by item

Retrieve all questions received on a specific item listing.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/questions/search?item=$ITEM_ID'
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/questions/search?item=CBT910505150'
```

Response:

```javascript
{
   "total": 80,
   "limit": 1,
   "questions": [
       {
           "id": 6789511129,
           "seller_id": 523130418,
           "text": "Ask from buyer",
           "text_translated": "Pregunta desde el comprador",
           "status": "ANSWERED",
           "item_id": "CBT910505150",
           "marketplace_item_id": "MLM755638064",
           "date_created": "2020-02-05T22:13:53.000-04:00",
           "hold": false,
           "deleted_from_listing": false,
           "answer": {
               "text": "Respuesta a question 6462231012",
               "text_translated": "answer to question 6462231012",
               "status": "ACTIVE",
               "date_created": "2020-02-05T22:27:23.052-04:00"
           },
           "from": {
               "id": 441782523
           },
           "site_id": "MLM"
       }
   ],
   "filters": {
       "limit": 1,
       "offset": 0,
       "is_admin": "false",
       "sorts": [],
       "caller": 523130418,
       "seller": 523130418
   },
   "available_filters": [
       {
           "id": "item",
           "name": "Item",
           "type": "text"
       },
       {
           "id": "from",
           "name": "From user id",
           "type": "number"
       },
       {
           "id": "totalDivisions",
           "name": "total divisions",
           "type": "number"
       },
       {
           "id": "division",
           "name": "Division",
           "type": "number"
       },
       {
           "id": "status",
           "name": "Status",
           "type": "text",
           "values": [
               "ANSWERED",
               "BANNED",
               "CLOSED_UNANSWERED",
               "DELETED",
               "DISABLED",
               "UNANSWERED",
               "UNDER_REVIEW"
           ]
       }
   ],
   "available_sorts": [
       "item_id",
       "from_id",
       "date_created",
       "seller_id"
   ]
}
```

### Response fields

Same structure as "Search by seller" response.

### Search by user on item

Retrieve all questions made by a specific user on a particular item. Useful for tracking a buyer's inquiry history.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/questions/search?item=$ITEM_ID&from=$CUST_ID'
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/questions/search?item=CBT910505150&from=466076859'
```

Response:

```javascript
{
   "total": 3,
   "limit": 1,
   "questions": [
       {
           "id": 6802857141,
           "seller_id": 523130418,
           "text": "Test Message to Reply",
           "text_translated": "Mensaje de Prueba para responder",
           "status": "ANSWERED",
           "item_id": "CBT910505150",
           "marketplace_item_id": "MLM755638064",
           "date_created": "2020-02-13T10:40:14.000-04:00",
           "hold": false,
           "deleted_from_listing": false,
           "answer": {
               "text": "It is a new test message",
               "text_translated": "Es un nuevo mensaje de prueba",
               "status": "ACTIVE",
               "date_created": "2020-02-13T10:40:58.589-04:00"
           },
           "from": {
               "id": 441782523
           },
           "site_id": "MLM"
       }
   ],
   "filters": {
       "limit": 1,
       "offset": 0,
       "is_admin": "false",
       "sorts": [],
       "caller": 466076859,
       "seller": 0
   },
   "available_filters": [
       {
           "id": "seller",
           "name": "Seller id",
           "type": "number"
       },
       {
           "id": "item",
           "name": "Item",
           "type": "text"
       },
       {
           "id": "from",
           "name": "From user id",
           "type": "number"
       },
       {
           "id": "totalDivisions",
           "name": "total divisions",
           "type": "number"
       },
       {
           "id": "division",
           "name": "Division",
           "type": "number"
       },
       {
           "id": "status",
           "name": "Status",
           "type": "text",
           "values": [
               "ANSWERED",
               "BANNED",
               "CLOSED_UNANSWERED",
               "DELETED",
               "DISABLED",
               "UNANSWERED",
               "UNDER_REVIEW"
           ]
       }
   ],
   "available_sorts": [
       "item_id",
       "from_id",
       "date_created",
       "seller_id"
   ]
}
```

### Response fields

Same structure as "Search by seller" response.

Note:

The offset maximum number is 1000.

## Order results

Use sorting parameters to order the search results by specific fields. This helps organize questions chronologically or by other criteria.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/questions/search?seller_id=$SELLER_ID&sort_fields=$SORT_FIELDS&sort_types=$SORT_TYPE'
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/questions/search?seller_id=523130418&sort_fields=item_id,date_created&sort_types=ASC'
```

### Parameters

Parameter Description **sort\_fields** Fields to sort by. Accepts: **item\_id**, **seller\_id**, **from\_id**, **date\_created**. Multiple fields separated by comma. **sort\_types** Sort direction: **ASC** (ascending) or **DESC** (descending).

## Get question by ID

Retrieve detailed information about a specific question using its unique identifier. Useful for getting the full context of a question before answering.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/questions/$QUESTION_ID'
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/questions/6891108811'
```

Response:

```javascript
{
   "id": 6891108811,
   "seller_id": 523130418,
   "text": "Test Question 2",
   "text_translated": "Pregunta de prueba 2",
   "status": "ANSWERED",
   "item_id": "CBT911087484",
   "marketplace_item_id": "MLM763996017",
   "date_created": "2020-03-17T22:33:32.000-04:00",
   "hold": false,
   "deleted_from_listing": false,
   "answer": {
       "text": "answer from seller 5",
       "text_translated": "respuesta del vendedor 5",
       "status": "ACTIVE",
       "date_created": "2020-03-18T17:42:36.138-04:00"
   },
   "from": {
       "id": 441782523
   },
   "site_id": "MLM"
}
```

### Response fields

- **id:** unique question identifier.
- **seller\_id:** seller's user ID.
- **text:** original question text from the buyer.
- **text\_translated:** question text translated to the marketplace's language.
- **status:** question status (**UNANSWERED**, **ANSWERED**, **CLOSED\_UNANSWERED**, **UNDER\_REVIEW**, **BANNED**, **DELETED**, **DISABLED**).
- **item\_id:** CBT item ID related to the question.
- **marketplace\_item\_id:** item ID in the destination marketplace (e.g., MLM for Mexico).
- **date\_created:** date and time when the question was created.
- **hold:** indicates if the question is on hold and cannot be answered yet.
- **deleted\_from\_listing:** indicates if the question was deleted from the item listing.
- **answer:** object containing the answer details (if answered).
  
  - **text:** answer text from the seller.
  - **text\_translated:** answer text translated to the buyer's language.
  - **status:** answer status (**ACTIVE** or **DISABLED**).
  - **date\_created:** date and time when the answer was created.
- **from:** object containing buyer information.
  
  - **id:** buyer's user ID who made the question.
- **site\_id:** site identifier where the question was made (e.g., MLM, MLA).

## Answer questions

Use this resource to post an answer to a buyer's question. When you have a large amount of items listed on Mercado Libre, you'll receive many questions. We recommend developing a semi-automatic answering system where answers are suggested based on frequent keywords.

First, search for unanswered questions on your items:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/questions/search?item_id=$ITEM_ID&status=UNANSWERED'
```

Then, answer a question using the POST method:

Request:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
-H 'Content-Type: application/json' \
'https://api.mercadolibre.com/marketplace/answers' \
-d '{
  "question_id": $QUESTION_ID,
  "text": "$ANSWER_TEXT",
  "text_translated": "$TRANSLATED_ANSWER"
}'
```

Example:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
-H 'Content-Type: application/json' \
'https://api.mercadolibre.com/marketplace/answers' \
-d '{
  "question_id": 3957150025,
  "text": "Test answer...",
  "text_translated": "Translated answer..."
}'
```

Response:

```javascript
{
   "id": 6894368802,
   "seller_id": 523130418,
   "text": "Hello, I like the product, do home deliveries?",
   "status": "ANSWERED",
   "item_id": "CBT911112427",
   "date_created": "2020-03-20T09:15:01.000-04:00",
   "hold": false,
   "deleted_from_listing": false,
   "answer": {
       "text": "This is the answer from the seller",
       "status": "ACTIVE",
       "date_created": "2020-11-24T15:27:07.321-04:00",
       "text_translated": "Esta es la respuesta del vendedor"
   }
}
```

### Request body parameters

Parameter Type Required Description **question\_id** Integer Yes The ID of the question to answer. **text** String Yes The answer text (maximum 2000 characters). `text_translated` String No The translated answer text for the buyer's language.

### Response fields

- **id:** unique question identifier.
- **seller\_id:** seller's user ID.
- **text:** original question text.
- **status:** updated question status (now **ANSWERED**).
- **item\_id:** CBT item ID related to the question.
- **date\_created:** date when the question was created.
- **hold:** indicates if the question is on hold.
- **deleted\_from\_listing:** indicates if the question was deleted from the listing.
- **answer:** object containing the answer details.
  
  - **text:** answer text from the seller.
  - **status:** answer status (**ACTIVE**).
  - **date\_created:** date when the answer was created.
  - **text\_translated:** translated answer text.

Note:

To answer questions, the maximum number of characters is 2000.

## Delete questions

Use this resource to remove a question from your item listing. Only the seller can delete questions made on their items using the DELETE method with the question ID.

Request:

```javascript
curl -X DELETE -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/questions/$QUESTION_ID'
```

Example:

```javascript
curl -X DELETE -H 'Authorization: Bearer $ACCESS_TOKEN' \
'https://api.mercadolibre.com/marketplace/questions/6988272427'
```

Response:

```javascript
[
    "Question deleted."
]
```

### Response fields

- Returns an array with a confirmation message indicating the question was successfully deleted.

## Receive notifications

Subscribe to real-time notifications to be aware when new questions are posted on your items. This allows your application to respond promptly to buyer inquiries.

### Configure notifications

To receive question notifications:

1. Go to the [Application Manager](https://global-selling.mercadolibre.com/devcenter) and edit your application's Notifications Settings.
2. Configure a **Callback URL**: the public URL where you want to receive notifications (e.g., **https://backend.example.com/notifications**).
3. Select the **questions** topic to subscribe to question events.

### Notification payload

Mercado Libre sends notifications via POST request to your callback URL with the following structure:

```javascript
{
  "user_id": 1234,
  "resource": "/marketplace/questions/139876",
  "topic": "marketplace_questions",
  "received": "2011-10-19T16:38:34.425Z",
  "sent": "2011-10-19T16:40:34.425Z"
}
```

### Notification fields

- **user\_id:** the seller's user ID related to the notification.
- **resource:** the API resource path to retrieve the updated question.
- **topic:** the notification topic (**marketplace\_questions**).
- **received:** timestamp when the event was received by Mercado Libre.
- **sent:** timestamp when the notification was sent to your callback URL.

Note:

After receiving a notification, you must send an acknowledgment (HTTP 200 OK) to Mercado Libre to stop receiving repeated notifications. Check our [Notifications documentation](https://global-selling.mercadolibre.com/devsite/receive-notifications) for more details.

## Error codes

The following table lists the specific errors you may encounter when working with the Questions API:

Error Code Message Description Solution **invalid\_question** The question is invalid. Cannot answer the question because the ID is invalid or the question doesn't exist. Verify that **question\_id** is a valid integer. Use **/marketplace/questions/search** to find valid question IDs. **invalid\_post\_body** Invalid JSON. Valid attributes are: {0}. The request body contains invalid or malformed JSON data. Ensure the request body includes valid JSON with required parameters: **question\_id and text.**