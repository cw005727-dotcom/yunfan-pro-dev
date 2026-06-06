# Visits

## This resource retrieves information about visits on MercadoLibre items VIPs (View Item Page). You can query data by time window and site.

**Tags:** CBT,Visits,trends,metrics
**Created:** 2020-12-22T14:18:00Z
**Last Updated:** 2025-12-30T20:07:04Z

---

## Visits

This resource retrieves information about visits on MercadoLibre items VIPs (View Item Page). You can query data by time window and site. Visits are counted as unique per day, the number of visits will be available within 48 hours, and the time range to consult visits is limited to 150 days.

Important:

These resources only work with local items (MLM, MLA, MCO, MLB, MLC, etc.). They will not return visit information for CBT (Cross Border Trade) items.

## Parameters

- **item\_id** (String): Item ID.
- **date\_from** (String): Date in ISO format that defines the start of the query. Maximum range is 150 days.
- **date\_to** (String): Date in ISO format that defines the end of the query. Maximum range is 150 days.
- **ending** (String, optional): Date in ISO format **YYYY-MM-DD** which states the time of completion of the sample. Defaults to current date and time.
- **unit** (String): Query unit. Possible values: `day`.
- **last** (Integer, optional): How many last days define the test.

### Response Fields

- **total\_visits** (Integer): Total visits on an item.
- **visits\_detail** (Array): Visits detailed by company.
- **results** (Array): Visits detail grouped by time intervals. The length is defined by the `unit` parameter.

## Total visits by item

Retrieve total visits to an article of the last two years.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/visits/items?ids=$ITEM_ID
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/visits/items?ids=MLB9992242141
```

Response:

```javascript
{
  "MLB9992242141": 552
}
```

## Total visits by item between date ranges

Retrieves total visits on an item between date ranges and by site.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/visits?ids=$ITEM_ID&date_from=$DATE_FROM&date_to=$DATE_TO
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/visits?ids=MCO473861358&date_from=2021-01-01&date_to=2021-02-01
```

Response:

```javascript
{
  "item_id": "MCO473861358",
  "date_from": "2021-01-01T00:00:00Z",
  "date_to": "2021-02-01T00:00:00Z",
  "total_visits": 536,
  "visits_detail": [
    {
      "company": "mercadolibre",
      "quantity": 536
    }
  ]
}
```

## Dated visits by item

Retrieves visits on an item for a certain time window, by site. The information detail is grouped by time intervals.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/$ITEM_ID/visits/time_window?last=$LAST&unit=$UNIT&ending=$ENDING
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MCO471870973/visits/time_window?last=2&unit=day&ending=2025-12-29
```

Response:

```javascript
{
  "item_id": "MCO471870973",
  "date_from": "2025-12-27T00:00:00Z",
  "date_to": "2025-12-29T00:00:00Z",
  "total_visits": 26,
  "last": 2,
  "unit": "day",
  "results": [
    {
      "date": "2025-12-27T00:00:00Z",
      "total": 16,
      "visits_detail": [
        {
          "company": "mercadolibre",
          "quantity": 16
        }
      ]
    },
    {
      "date": "2025-12-28T00:00:00Z",
      "total": 10,
      "visits_detail": [
        {
          "company": "mercadolibre",
          "quantity": 10
        }
      ]
    }
  ]
}
```

## Errors

The following table lists the possible errors returned by the Visits API:

Status\_code Error code Error message Description 400 bad\_request Invalid Site ID When the item or user does not belong to a valid local site (CBT items are not supported). 400 bad\_request unknown date format When the date\_from or date\_to parameter is missing or has an invalid format. 400 bad\_request invalid time window, should be smaller or equal to 150 days When the time range exceeds the maximum allowed of 150 days. 400 bad\_request invalid date format for ending date When the ending parameter has an invalid date format. Only YYYY-MM-DD format is accepted. 400 validation\_parameters maximum amount of items to query is 1 When trying to query more than one item at a time in the ids parameter. 400 bad\_request Invalid item ID format: $ITEM\_ID When the item ID does not follow the correct format (site prefix + numeric ID). 403 PA\_UNAUTHORIZED\_RESULT\_FROM\_POLICIES At least one policy returned UNAUTHORIZED When the access token is invalid, expired, or does not have the required permissions. 404 not\_found Item not found When the item ID does not exist in the time\_window endpoint.