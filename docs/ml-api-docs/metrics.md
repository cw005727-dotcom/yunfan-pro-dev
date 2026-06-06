# Metrics

**Tags:** Metrics
**Created:** 2018-06-27T12:01:32Z
**Last Updated:** 2023-03-15T15:34:47Z

---

# Metrics

This example will teach you how to use our resources to take metrics.

Resource Description Example **/users/$USER\_ID/items\_visits?date\_from=$DATE\_FROM&amp;date\_to=$DATE\_TO** Returns how many visits a user had. [GET](#modal1)

[Go back](#close) [X](#close "Close")

### Get visits by user

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/206946886/items_visits?date_from=2016-01-01T00:00:00.000-00:00&date_to=2016-02-10T00:00:00.000-00:00
```

 

### Response

```javascript
{
  "user_id": 206946886,
  "date_from": "2016-01-01T00:00:00.000-00:00",
  "date_to": "2016-02-10T00:00:00.000-00:00",
  "total_visits": 0,
  "visits_detail": [
  ]
}
```

[Learn more.](/en_us/real-estate-manage-questions-contacts/)

**/users/$USER\_ID/items\_visits/time\_window?last=$LAST&amp;UNIT=$UNIT&amp;ENDING=$ENDING** Returns a user's visits to each published item over a period of time, per site. The information detail it’s grouped by time intervals. [GET](#modal2)

[Go back](#close) [X](#close "Close")

### Get visits by user and time.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/52366166/items_visits/time_window?last=2&unit=day
```

 

### Response

```javascript
{
    "user_id": 52366166,
    "date_from": "2021-06-16T00:00:00Z",
    "date_to": "2021-06-18T00:00:00Z",
    "total_visits": 0,
    "last": 2,
    "unit": "day",
    "results": [
        {
            "date": "2021-06-16T00:00:00Z",
            "total": 0,
            "visits_detail": []
        },
        {
            "date": "2021-06-17T00:00:00Z",
            "total": 0,
            "visits_detail": []
        }
    ]
}
```

[Learn more.](/pt_br/imoveis-gerenciamento-de-perguntas-e-contatos/)

**/users/$USER\_ID/contacts/questions?date\_from=$DATE\_FROM&amp;date\_to=$DATE\_TO** Retrieve the total questions a specific user had in all of his classified items between a date range. [GET](#modal3)

[Go back](#close) [X](#close "Close")

### Get total amount of questions by user.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLV421672596/contacts/questions?date_from=2014-08-01T00:00:00.000-03:00&date_to=2014-08-02T23:59:59.999
```

 

### Response

```javascript
{
    "date_from": "2014-08-01T00:00:00.000-03:00",
    "date_to": "2014-08-02T23:59:59.999",
    "item_id": "MLV421672596",
    "total": 9
}
```

[Learn more.](/en_us/real-estate-manage-questions-contacts/)

**/users/$USER\_ID/contacts/questions/time\_window?last=$LAST&amp;UNIT=$UNIT** This resource let you get the questions made on a seller classified items for a certain time window. [GET](#modal4)

[Go back](#close) [X](#close "Close")

### Get questions made on a seller classified items within a time window.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA510272257/contacts/questions/time_window?last=2&unit=hour
```

 

### Response

```javascript
{
    "total": 0,
    "last": "2",
    "unit": "hour",
    "date_from": "2021-06-18T18:00:00Z",
    "date_to": "2021-06-18T20:00:00Z",
    "item_id": "MLA510272257",
    "results": [
        {
            "date": "2021-06-18T18:00:00Z",
            "total": 0
        },
        {
            "date": "2021-06-18T19:00:00Z",
            "total": 0
        }
    ]
}
```

[Learn more.](/en_us/real-estate-manage-questions-contacts/)

**/users/$USER\_ID/contacts/questions/time\_window?last=$LAST&amp;UNIT=$UNIT** This resource let you get the questions made on a seller classified item for a certain time window. [GET](#modal5)

[Go back](#close) [X](#close "Close")

### Get contacts received by seller for his classified items within a time window.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA510272257/contacts/questions/time_window?last=2&unit=hour
```

 

### Respuesta

```javascript
{
    "total": 0,
    "last": "2",
    "unit": "hour",
    "date_from": "2021-06-18T18:00:00Z",
    "date_to": "2021-06-18T20:00:00Z",
    "item_id": "MLA510272257",
    "results": [
        {
            "date": "2021-06-18T18:00:00Z",
            "total": 0
        },
        {
            "date": "2021-06-18T19:00:00Z",
            "total": 0
        }
    ]
}
```

[Learn more.](/en_us/real-estate-manage-questions-contacts/)

**/users/$USER\_ID/contacts/phone\_views?date\_from=$DATE\_FROM&amp;DATE\_TO=$DATE\_TO** You can get the total times the ‘See phone’ option was clicked for every item of a user between date ranges. [GET](#modal6)

[Go back](#close) [X](#close "Close")

### Get "See phone" views by date.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/52366166/contacts/phone_views?date_from=2014-05-28T00:00:00.000-03:00&date_to=2014-05-29T23:59:59.999
```

 

### Response

```javascript
{
    "date_from": "2014-05-28T00:00:00.000-03:00",
    "date_to": "2014-05-29T23:59:59.999",
    "total": 71,
    "user_id": "52366166"
}
```

[Learn more.](/en_us/real-estate-manage-questions-contacts/)

**/users/$USER\_ID/contacts/phone\_views/time\_window?last=$LAST&amp;UNIT=$UNIT** You can get the total times the ‘See phone’ option was clicked on an item or for every item of an user on a time window. [GET](#modal8)

[Go back](#close) [X](#close "Close")

### Get "See Phone" views within a time window.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/contacts/phone_views/time_window?ids=MLA510272257,MLA489747739&last=2&unit=hour&ending=2014-05-28T00:00:00.000-03:00
```

 

### Response

```javascript
[
    {
        "total": 0,
        "last": "2",
        "unit": "hour",
        "date_from": "2021-06-18T18:00:00Z",
        "date_to": "2021-06-18T20:00:00Z",
        "item_id": "MLA510272257",
        "results": [
            {
                "date": "2021-06-18T18:00:00Z",
                "total": 0
            },
            {
                "date": "2021-06-18T19:00:00Z",
                "total": 0
            }
        ]
    },
    {
        "total": 0,
        "last": "2",
        "unit": "hour",
        "date_from": "2021-06-18T18:00:00Z",
        "date_to": "2021-06-18T20:00:00Z",
        "item_id": "MLA489747739",
        "results": [
            {
                "date": "2021-06-18T18:00:00Z",
                "total": 0
            },
            {
                "date": "2021-06-18T19:00:00Z",
                "total": 0
            }
        ]
    }
]
```

[Learn more.](/en_us/real-estate-manage-questions-contacts/)

**/items/visits?ids=$ID1, ID2&amp;date\_from=$DATE\_FROM&amp;date\_to=$DATE\_TO** Retrieves item's visits (Multi-Get). [GET](#modal9)

[Go back](#close) [X](#close "Close")

### &gt;Retrieves item's visits (Multi Get)

```javascript
 curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/visits?ids=MLA506635149,MLA506634973,MLA503004418&date_from=2014-06-01T00:00:00.000-00:00&date_to=2014-06-10T00:00:00.000-00:00
```

 

### Response

```javascript
[
 {
    "item_id": "MLA506635149",
    "date_from": "2014-06-01T00:00:00.000-00:00",
    "date_to": "2014-06-10T00:00:00.000-00:00",
    "total_visits": 134,
    "visits_detail":  [
       {
        "company": "mercadolibre",
        "quantity": 134,
      },
    ],
  },
   {
    "item_id": "MLA506634973",
    "date_from": "2014-06-01T00:00:00.000-00:00",
    "date_to": "2014-06-10T00:00:00.000-00:00",
    "total_visits": 122,
    "visits_detail": [
       {
        "company": "mercadolibre",
        "quantity": 122,
      },
    ],
  },
   {
    "item_id": "MLA503004418",
    "date_from": "2014-06-01T00:00:00.000-00:00",
    "date_to": "2014-06-10T00:00:00.000-00:00",
    "total_visits": 355,
    "visits_detail": [
       {
        "company": "mercadolibre",
        "quantity": 355,
      },
    ],
  },
]
```

[Learn more.](/en_us/visits-resource/)

**/items/$ITEM\_ID/visits/time\_window?last=$LAST&amp;UNIT=$UNIT&amp;ENDING=$ENDING** Retrieves item's visits on a time window filtering by unit and ending parameters. [GET](#modal10)

[Go back](#close) [X](#close "Close")

### Get item's visits.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA506635149/visits/time_window?last=2&unit=day&ending=2014-06-11
```

 

### Response

```javascript
{
  "item_id": "MLA506635149",
  "total_visits": 15,
  "date_from": "2014-06-09T04:00:00Z",
  "date_to": "2014-06-11T04:00:00Z",
  "last": 2,
  "unit": "day",
  "results": [
     {
      "date": "2014-06-09T04:00:00Z",
      "total": 10,
      "visits_detail": - [
         {
          "company": "mercadolibre",
          "quantity": 10,
        },
      ],
    },
     {
      "date": "2014-06-10T04:00:00ZZ",
      "total": 5,
      "visits_detail": - [
         {
          "company": "mercadolibre",
          "quantity": 5,
        },
      ],
    },
  ],
}

```

[Learn more.](/en_us/visits-resource/)

**/items/visits/time\_window?ids=$ID1, ID2last=$LAST&amp;UNIT=UNIT&amp;ENDING=$ENDING** Retrieves multiple item's visits on a time window filtering by unit and ending parameters(Multi Get). [GET](#modal11)

[Go back](#close) [X](#close "Close")

### Get item's visits (Multi Get)

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/visits/time_window?ids=MLA506635149,MLA506634973,MLA503004418&last=3&unit=day
```

 

### Response

```javascript
[
    {
        "item_id": "MLA506635149",
        "date_from": "2021-06-15T00:00:00Z",
        "date_to": "2021-06-18T00:00:00Z",
        "total_visits": 0,
        "last": 3,
        "unit": "day",
        "results": [
            {
                "date": "2021-06-15T00:00:00Z",
                "total": 0,
                "visits_detail": []
            },
            {
                "date": "2021-06-16T00:00:00Z",
                "total": 0,
                "visits_detail": []
            },
            {
                "date": "2021-06-17T00:00:00Z",
                "total": 0,
                "visits_detail": []
            }
        ]
    },
    {
        "item_id": "MLA506634973",
        "date_from": "2021-06-15T00:00:00Z",
        "date_to": "2021-06-18T00:00:00Z",
        "total_visits": 0,
        "last": 3,
        "unit": "day",
        "results": [
            {
                "date": "2021-06-15T00:00:00Z",
                "total": 0,
                "visits_detail": []
            },
            {
                "date": "2021-06-16T00:00:00Z",
                "total": 0,
                "visits_detail": []
            },
            {
                "date": "2021-06-17T00:00:00Z",
                "total": 0,
                "visits_detail": []
            }
        ]
    },
    {
        "item_id": "MLA503004418",
        "date_from": "2021-06-15T00:00:00Z",
        "date_to": "2021-06-18T00:00:00Z",
        "total_visits": 0,
        "last": 3,
        "unit": "day",
        "results": [
            {
                "date": "2021-06-15T00:00:00Z",
                "total": 0,
                "visits_detail": []
            },
            {
                "date": "2021-06-16T00:00:00Z",
                "total": 0,
                "visits_detail": []
            },
            {
                "date": "2021-06-17T00:00:00Z",
                "total": 0,
                "visits_detail": []
            }
        ]
    }
]
```

[Learn more.](/en_us/visits-resource/)

**/items/contacts/phone\_views/time\_window?ids=$ID1,ID2&amp;last=$LAST&amp;UNIT=$UNIT&amp;ENDING=ENDING\_DATE** Retrieves how many time user's clicked on "See phone" for multiple items (Multi Get). [GET](#modal12)

[Go back](#close) [X](#close "Close")

### Get "See Phone" views.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/contacts/phone_views/time_window?ids=MLA510272257,MLA489747739&last=2&unit=hour&ending=2014-05-28T00:00:00.000-03:00
```

 

### Response

```javascript
[
    {
        "total": 0,
        "last": "2",
        "unit": "hour",
        "date_from": "2021-06-18T18:00:00Z",
        "date_to": "2021-06-18T20:00:00Z",
        "item_id": "MLA510272257",
        "results": [
            {
                "date": "2021-06-18T18:00:00Z",
                "total": 0
            },
            {
                "date": "2021-06-18T19:00:00Z",
                "total": 0
            }
        ]
    },
    {
        "total": 0,
        "last": "2",
        "unit": "hour",
        "date_from": "2021-06-18T18:00:00Z",
        "date_to": "2021-06-18T20:00:00Z",
        "item_id": "MLA489747739",
        "results": [
            {
                "date": "2021-06-18T18:00:00Z",
                "total": 0
            },
            {
                "date": "2021-06-18T19:00:00Z",
                "total": 0
            }
        ]
    }
]
```

[Learn more.](/en_us/real-estate-manage-questions-contacts/)