# Manage questions & answers

**Tags:** Manage,questions,&,answers
**Created:** 2020-05-28T23:21:22Z
**Last Updated:** 2026-01-15T17:03:44Z

---

## Manage questions and answers

Questions are the way buyers can communicate with sellers on the Item Details page before making a transaction, and therefore the way you handle interaction at this stage will be decisive for a successful sale.

## Search questions

Important:

We return empty text in questions and answers with status: "BANNED".  
**Use the api\_version=4 parameter** to get the new JSON structure.

There are several ways to search for questions.

## Questions received by a seller

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/questions/search?seller_id=$SELLER_ID&api_version=4
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/questions/search?seller_id=419059118&api_version=4
```

Response:

```javascript
 
{
   "total": 36,
   "limit": 2,
   "questions": [
       {
           "date_created": "2021-02-16T14:50:27.938-04:00",
           "item_id": "MLA903218023",
           "seller_id": 189394110,
           "status": "ANSWERED",
           "text": "Question text.",
           "id": 11764931832,
           "deleted_from_listing": false,
           "hold": false,
           "suspected_spam": false,
           "answer": {
               "text": "",
               "status": "BANNED",
               "date_created": "2021-02-16T14:52:13.580-04:00"
           },
           "from": {
               "id": 162981404
           }
       },
       {
           "date_created": "2021-02-16T14:47:58.950-04:00",
           "item_id": "MLA903218023",
           "seller_id": 189394110,
           "status": "BANNED",
           "text": "",
           "id": 11764926522,
           "deleted_from_listing": false,
           "hold": false,
           "suspected_spam": false,
           "answer": null,
           "from": {
               "id": 162981404
           }
       }
   ],
....
}
```

Note:

Keep in mind that unanswered questions older than 7 months will be deleted.

## Questions received about an item

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/questions/search?item=$ITEM_ID&api_version=4
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/questions/search?item=MLB1623490410&api_version=4
```

Response:

```javascript
{
    "total": 1,
    "limit": 50,
    "questions": [
        {
            "date_created": "2020-08-20T13:22:01.600-04:00",
            "item_id": "MLB1623490410",
            "seller_id": 419059118,
            "status": "UNANSWERED",
            "text": "Hi, I'm interested in Test Item, please contact me. Thanks!",
            "id": 11436370259,
            "deleted_from_listing": false,
            "hold": false,
            "answer": null,
            "from": {
                "id": 419067349
            }
        }
    ],
    "filters": {
        "limit": 50,
        "offset": 0,
        "api_version": "4",
        "is_admin": false,
        "sorts": [],
        "caller": 419059118,
        "item": "MLB1623490410"
    },
    "available_filters": [
        {
            "id": "from",
            "name": "From user id",
            "type": "number"
        },
        {
            "id": "seller",
            "name": "Seller id",
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

### How to sort?

To sort the results you can add the following query params:

**sort\_fields**: allows sorting search results by one or more specific fields. Accepts the fields item\_id, seller\_id, from\_id and date\_created separated by commas.  
Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/questions/search?seller_id=$SELLER_ID&sort_fields=item_id,date_created&api_version=4
```

**sort\_types**: allows setting whether the sorting of fields set in sort\_fields will be ASC or DESC.  
Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/questions/search?seller_id=$SELLER_ID&sort_fields=item_id,date_created&sort_types=ASC&api_version=4
```

## Questions asked by a user about an item

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/questions/search?item=$ITEM_ID&from=$CUST_ID&api_version=4
```

## Questions by ID

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/questions/$QUESTION_ID?api_version=4
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/questions/11751825075?api_version=4
```

Response:

```javascript
{
    "id": 11751825075,
   "seller_id": 179571326,
   "buyer_id": 56801932,
   "item_id": "MLA739200576",
   "deleted_from_listing": false,
   "suspected_spam": false,
   "status": "ANSWERED",
   "hold": false,
   "text": "Question text.",
   "app_id": 8304540643508652,
   "date_created": "2021-02-08T17:51:21.746608612Z",
   "last_updated": "2021-02-08T17:51:29.184950392Z",
   "answer": {
       "text": "",
       "status": "BANNED",
       "date_created": "2021-02-16T14:52:13.580-04:00"
   }

}
```

Response for Vehicles:

```javascript
{
	"id": 11949565740,
	"seller_id": 456236760,
	"text": "Hi Tete936018, I'm interested in Test - San Jose De La Estrella / La Serena, please contact me. Thanks!",
	"status": "UNANSWERED",
	"item_id": "MLC595976788",
	"date_created": "2021-06-16T12:07:18.109-04:00",
	"hold": false,
	"deleted_from_listing": false,
	"answer": null,
	"from": {
		"id": 21547449,
		"answered_questions": 0,
		"first_name": "Juan",
		"last_name": "Lead",
		"phone": {
			"number": "95712582",
			"area_code": "9"
		},
		"email": "juan.lead@mail.com"
	}
}
}
```

Note:

Learn the reasons why a question or answer has **"status": "BANNED"** by consulting [/moderations/infractions](https://developers.mercadolibre.com.ar/en_us/moderations).

## Attribute description

**id**: Question ID

**seller\_id**: Product seller ID

**text**: Question text

**status**: Question status

    **Possible values:** 

    **-unanswered**: The question has not been answered yet

    **-answered**: The question has been answered

    **-closed\_unanswered**: The product is closed and the question was never answered

    **-under\_review**: The product is under review and so is the question

    **-item\_id**: ID of the product the question belongs to 

    **-date\_created**: Question creation date

    **-answer**: Seller's answer

**text**: Answer text 

**status**: Answer status 

    **Possible values**: 

    **-active**: The answer is available

    **-disabled**: The answer has been disabled

**date\_created**: Answer creation date

Excellent! Now you know what aspects to consider regarding questions. See what actions are available according to the question search.

 

## Allowed methods

GET /questions/:id returns a question with that ID.  
POST /questions: creates a question about an item.  
DELETE /questions/:id: deletes a question.  
POST /answers/: posts an answer to a specific question.  
POST /my/questions/hidden: hides questions.  
As you can see, you can search for questions by item, seller and user who asked it, and filter them by status or period. If you wish, you can also search for all received questions and hide them.

## Related resources and connections

Use the following resources to search for questions by item or by user. You must include the item\_id or the cust:id.

```javascript
"related_resources": [
    	"/items",
        "/users"
	],
	"connections": {
    	"item_id": "/items/:id",
    	"seller_id": "/users/:id"
	}
}
```

Let's see some examples of how to search for questions on our platform.

## Ask questions

It's a very easy task. You just need to know the item\_id and send it along with a text String in the JSON body as in the following example:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' "Content-Type: application/json" -d
{
   "text":"Do you have these shoes in red?",
   "item_id":"MLA123456"
}
https://api.mercadolibre.com/questions
```

Note:

Remember to make the POST with UTF-8 encoding to avoid conflicts with special characters.

## Answer questions

When you have a large number of items listed on Mercado Libre, you are likely to receive many questions; therefore, we recommend that you develop a method to answer those questions in a semi-automatic way, in which operators receive suggested answers based on frequently received keywords. To do this, you need to know how to answer a question via API. This will be easy. First, let's see all the questions received for your item. Simply perform a search for questions by item as shown in the example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/questions/search?item_id=$ITEM_ID&api_version=4
```

You'll see that questions have a status, so you'll probably need to keep them in the "unanswered" status. Now, let's answer a single question:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' "Content-Type: application/json" -d
{
"question_id": 3957150025, 
 "text":"Test answer..." 
}
https://api.mercadolibre.com/answers
```

When working with questions, it is very useful to listen to Notifications, because they allow you to have a real-time feed of events that occur regarding them. Learn [how to work with notifications](../../en_us/products-receive-notifications).

Note:

To answer or ask questions, the maximum number of characters is 2,000.

## Calculate response time

The new "response time" resource calculates in minutes the time it takes a seller to answer a query. It can be given in 3 periods:

- Monday to Friday from 9am to 6pm (weekdays\_working\_hours).
- Monday to Friday from 6pm to 12am (weekdays\_extra\_hours).
- Saturdays and Sundays (weekend).

Additionally, it allows viewing the percentage of projected sales that the seller can have if they respond in less than 1 hour, displaying the percentage in the "sales\_percent\_increase" field.  
The average is considered for each of the mentioned periods, contemplating the last 14 days of questions and using the first question a buyer asked about an item.  
Unanswered questions will be considered answered when calculating response times, with a cap of 1 week. Example: If we have a question without an answer for 4 days, it will be considered that there is a question that took 4 days to answer and the next day 5 days.  
For the "total" object, data from the last 14 days is considered without periods, they also include questions from 0 to 9am that do not fall into any of the other periods we provide visibility for by cut.  
Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/$USER_ID/questions/response_time
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/1111111/questions/response_time
```

Response:

```javascript
{
	"user_id": 1111111,
	"total": {
		"response_time": 22
	},
	"weekend": {
		"response_time": 8,
		"sales_percent_increase": null
	},
	"weekdays_working_hours": {
		"response_time": 8,
		"sales_percent_increase": null
	},
	"weekdays_extra_hours": {
		"response_time": 72,
		"sales_percent_increase": 10
	}
}
```

## Parameter description

**user\_id:** The ID of the queried seller.  
**total:** The seller's average response time, without considering time slots.  
**response\_time:** Represents the seller's average response time in minutes.  
**weekend:** The seller's average response time during weekends.  
**weekdays\_working\_hours:** The seller's average response time during business hours on weekdays (Monday to Friday, 9am to 6pm).  
**weekdays\_extra\_hours:** The seller's average response time during extra business hours on weekdays (Monday to Friday, 6pm to 12am).  
**sales\_percent\_increase:** The percentage of sales that could be increased if response times are improved, as long as the response\_time is greater than 60 in any of the segments, except for Total which does not have this parameter.

Note:

Keep in mind that the information is updated once a day.

If the queried seller has no questions on their items, the response will be a Not Found 404.  
Example:

```javascript
{
	"message": "Response time not found for user id: 276274936",
	"error": "not_found",
	"status": 404,
	"cause": []
}
```

## Delete questions

If you need to delete a question that a user asked about your item, simply use the delete method with the question ID and the user's ACCESS TOKEN.  
Example:

```javascript
curl -X DELETE -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/questions/$QUESTION_ID
```

Delete with our SDK (example) Response:

```javascript
[
  "Question deleted."
]
```

If you wish, you can [block users](https://developers.mercadolibre.com.ar/en_us/real-estate-user-queries?nocache=true#Block-users-from-questions) to prevent them from asking questions.

## Notifications

Subscribe to question notifications through the questions topic. Learn more about [Question notifications](https://developers.mercadolibre.com.ar/en_us/products-receive-notifications).

## Error code reference

Error\_code Error message Description Possible solution invalid\_question The question is invalid. The question cannot be answered. The question\_id parameter must be an integer. To search for your question, call resource/questions/search. invalid\_post\_body Invalid JSON. Valid attributes are: {0}. Invalid parameters. The expected parameters are question\_id and text.

**Next:** [Moderations](https://developers.mercadolibre.com.ar/en_us/moderations).