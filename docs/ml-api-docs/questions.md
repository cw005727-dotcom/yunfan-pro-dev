# Questions & Answers

**Tags:** Questions,&,Answers
**Created:** 2018-06-27T12:01:32Z
**Last Updated:** 2023-03-15T15:33:04Z

---

## Questions &amp; Answers

Note:

For security, you can get the buyer's email, phone number and name under /questions/$QUESTION\_ID.  
Use the api\_version = 4 parameter and get the questions and answers with the new structure.

This example will help you manage questions and answers.

Resource Description Example **/questions/search?item=$ITEM\_ID** Search any question made to user's items. [GET](#modal1)

[Go back](#close) [X](#close "Close")

## Get questions by Item ID

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/questions/search?item_id=MLA608007087
```

 

## Response

```javascript
{
    "total": 0,
    "limit": 50,
    "questions": [],
    "filters": {
        "limit": 50,
        "offset": 0,
        "api_version": "4",
        "is_admin": false,
        "sorts": [],
        "caller": 447594313,
        "item": "MLA608007087"
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

[Learn more.](https://developers.mercadolibre.com.ar/en_us/manage-questions-and-answers)

**/questions** Ask questions on other user's items. [POST](#modal2)

[Go back](#close) [X](#close "Close")

## Make a question

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -d '{
   "text":"Test question.",
   "item_id":"MLA608007087"
}' https://api.mercadolibre.com/questions
```

 

## Response

```javascript
{
	"id": 3957150025,
	"answer": null,
	"date_created": "2016-02-29T11:19:42.957-04:00",
	"item_id": "MLA608007087",
	"seller_id": 202593498,
	"status": "UNANSWERED",
	"text": "Test question.",
	"from": {
		"id": 207119838
	}
}
```

[Learn more.](https://developers.mercadolibre.com.ar/en_us/manage-questions-and-answers)

**/answers** Answer questions made on your items. [POST](#modal3)

[Go back](#close) [X](#close "Close")

## Answer a question.

```javascript
 curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H ""Content-Type: application/json"" -d '{
     "question_id": 3957150025, 
     "text":"Test answer..." 
}' https://api.mercadolibre.com/answers
```

 

## Response

```javascript
{
	"id": 3957150025,
	"answer": {
		"date_created": "2016-02-29T11:21:27.831-04:00",
		"status": "ACTIVE",
		"text": "Test answer..."
	},
	"date_created": "2016-02-29T11:19:42.000-04:00",
	"deleted_from_listing": false,
	"hold": false,
	"item_id": "MLA608007087",
	"seller_id": 202593498,
	"status": "ANSWERED",
	"text": "Test question.",
	"from": {
		"id": 207119838,
		"answered_questions": 0
	}
}
```

[Learn more.](https://developers.mercadolibre.com.ar/en_us/manage-questions-and-answers)

**/questions/$QUESTION\_ID** Retrieves information for an specific question ID. [GET](#modal4)

[Go back](#close) [X](#close "Close")

## Get question details.

```javascript
 curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/questions/3957150025
```

 

## Response

```javascript
{
  "id": 3957150025,
  "answer": {
    "date_created": "2016-02-29T11:21:27.000-04:00",
    "status": "ACTIVE",
    "text": "Test answer..."
  },
  "date_created": "2016-02-29T11:19:42.000-04:00",
  "deleted_from_listing": false,
  "hold": false,
  "item_id": "MLA608007087",
  "seller_id": 202593498,
  "status": "ANSWERED",
  "text": "Test question.",
  "from": {
    "id": 207119838,
    "answered_questions": 1
  }
}
```

[Learn more.](https://developers.mercadolibre.com.ar/en_us/manage-questions-and-answers)

**/users/$SELLER\_ID/questions\_blacklist/$BUYERID** Manage questions blacklist. [GET](#modal5) [GET](#modal5-1) [POST](#modal5-2) [DELETE](#modal5-3)

[Go back](#close) [X](#close "Close")

## Check user's questions blacklist (With limit and offset).

```
$ curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' http://api.mercadolibre.com/users/$SELLER_ID/questions_blacklist
```

 

## Response (In case there are blocked users)

```
{
    "paging": {
        "total": 5,
        "limit": 50,
        "offset": 0
    },
    "users": [{
        "id": 70927648
    }, {
        "id": 170577643
    }, {
        "id": 82411799
    }, {
        "id": 158470042
    }, {
        "id": 194938540
    }]
}
```

## Response (In case there are no blocked users)

```
{
    "paging": {
        "total": 0,
        "limit": 50,
        "offset": 0
    },
    "users": []
}
```

[Go back](#close) [X](#close "Close")

## Check user's questions blacklist (Without offset and limit)

```
$ curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' "http://api.mercadolibre.com/users/${seller_id}/questions_blacklist?limit=1&offset=2"

```

 

## Response (In case there are blocked users)

```
{
    "paging": {
        "total": 5,
        "limit": 50,
        "offset": 0
    },
    "users": [{
        "id": 70927648
    }, {
        "id": 170577643
    }, {
        "id": 82411799
    }, {
        "id": 158470042
    }, {
        "id": 194938540
    }]
}
```

## Response (In case there are no blocked users)

```
{
    "paging": {
        "total": 0,
        "limit": 50,
        "offset": 0
    },
    "users": []
}
```

[Learn more.](https://developers.mercadolibre.com.ar/en_us/manage-questions-and-answers)

[Go back](#close) [X](#close "Close")

## Send users to questions blacklist

```
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -d
'{
  "user_id": blocked user id
}'
https://api.mercadolibre.com/users/$SELLER_ID/questions_blacklist
```

  [Learn more.](https://developers.mercadolibre.com.ar/en_us/manage-questions-and-answers#blacklist)

[Go back](#close) [X](#close "Close")

## Remove user from your question blacklist.

```
$ curl -X DELETE -H 'Authorization: Bearer $ACCESS_TOKEN' 'https://api.mercadolibre.com/users/$SELLER_ID/questions_blacklist/$USER_ID
```

  [Learn more.](https://developers.mercadolibre.com.ar/en_us/manage-questions-and-answers)

**/my/received\_questions/search** Received questions by user. [GET](#modal6)

[Go back](#close) [X](#close "Close")

## Get questions made on your items.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/my/received_questions/search
```

 

## Response

```javascript
{
    "total": 3,
    "limit": 50,
    "questions": [
        {
            "date_created": "2020-04-14T16:30:02.000-04:00",
            "item_id": "MLB1494945960",
            "seller_id": 447594313,
            "status": "ANSWERED",
            "text": "Olá, vc teria máscaras com filtro tbm? E com estampas personalizada tipo de desenho animado?",
            "id": 6940134223,
            "deleted_from_listing": false,
            "hold": false,
            "answer": {
                "text": "Olá Tudo bem? Temos sim o filtro interno e diversas estampas. =)",
                "status": "ACTIVE",
                "date_created": "2020-04-14T19:53:43.069-04:00"
            },
            "from": {
                "id": 546874560
            }
        },
        {
            "date_created": "2020-04-26T00:47:49.000-04:00",
            "item_id": "MLB1494945960",
            "seller_id": 447594313,
            "status": "ANSWERED",
            "text": "Tem cm escolher as estampas?",
            "id": 6994706979,
            "deleted_from_listing": false,
            "hold": false,
            "answer": {
                "text": "",
                "status": "BANNED",
                "date_created": "2020-04-26T10:14:18.529-04:00"
            },
            "from": {
                "id": 212866079
            }
        },
        {
            "date_created": "2020-05-03T20:46:00.000-04:00",
            "item_id": "MLB1494945960",
            "seller_id": 447594313,
            "status": "ANSWERED",
            "text": "Olá Tem mais estampas disponíveis ou somente as do anúncio?",
            "id": 7101218884,
            "deleted_from_listing": false,
            "hold": false,
            "answer": {
                "text": "Olá, esperamos q esteja bem. Apenas as do anúncio e algumas infantis",
                "status": "ACTIVE",
                "date_created": "2020-05-04T10:52:19.697-04:00"
            },
            "from": {
                "id": 129810625
            }
        }
    ],
    "filters": {
        "limit": 50,
        "offset": 0,
        "api_version": "4",
        "is_admin": false,
        "sorts": [],
        "caller": 447594313,
        "seller": 447594313
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

[Learn more.](https://developers.mercadolibre.com.ar/en_us/manage-questions-and-answers)