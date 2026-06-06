# Returns

## The new /returns resource allows you to get the details of a product return, know its reasons and status. 

**Tags:** returns
**Created:** 2021-08-19T13:43:17Z
**Last Updated:** 2024-03-25T13:10:07Z

---

## Returns

Important:

Starting May 6, 2024, all return resources at https://api.mercadolibre.com/v2/claims/$CLAIM\_ID/returns will be deprecated, and you will only be able to access the information by calling https://api.mercadolibre.com/post-purchase/v2/claims/$CLAIM\_ID/returns.

We invite you to modify your integration to continue working with returns as usual.  
Both resources will coexist starting March 21, 2024.

The /post-purchase/v2/claims/$CLAIM\_ID/ each return details $CLAIM\_ID with types, subtypes and status.

In Mercado Libre we work with diffent types of returns:

- claim: return created through a claim
- dispute: return through mediation
- automatic: automatic return

## Identify a return

To correctly identify a return, we make the following recommendations:

- Subscribe to the claims notifications (feed claims) which contains the order information where it caused.
- [Check claims API](https://developers.mercadolibre.com.ar/en_us/working-with-claims) in the resource /post-purchase/v1/claims/search, validating if the type is "return".

## Consult a return

To consult a return you must call /post-purchase/v2/claims/$CLAIM\_ID/returns, specifying the $CLAIM\_ID, examples below:

Request example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/post-purchase/v2/claims/$CLAIM_ID/returns
```

Example:

```javascript
{
        "last_updated": "2024-01-11T16:03:22.2+00:00",
        "shipping": {
            "id": 42998970748,
            "status": "delivered",
            "tracking_number": "101010622106990",
            "lead_time": {
                "estimated_delivery_time": {
                    "date": "2024-01-17T00:00:00.000-03:00"
                }
            },
            "status_history": [
                {
                    "status": "handling",
                    "substatus": null,
                    "date": "2024-01-11T12:01:35.576-04:00"
                },
                {
                    "status": "ready_to_ship",
                    "substatus": "ready_to_print",
                    "date": "2024-01-11T12:02:06.839-04:00"
                },
                {
                    "status": "shipped",
                    "substatus": null,
                    "date": "2024-01-11T12:02:10.839-04:00"
                },
                {
                    "status": "delivered",
                    "substatus": null,
                    "date": "2024-01-11T12:02:14.280-04:00"
                }
            ],
            "origin": {
                "type": "selling_address",
                "sender_id": 1632520187,
                "shipping_address": {
                    "address_id": 1350834413,
                    "address_line": "Calle 34 123",
                    "street_name": "Calle 34",
                    "street_number": "123",
                    "comment": "23  Entre: 67 y 54",
                    "zip_code": "5000",
                    "city": {
                        "id": "TUxBQ0NBUGNiZGQx",
                        "name": "Córdoba"
                    },
                    "state": {
                        "id": "AR-X",
                        "name": "Córdoba"
                    },
                    "country": {
                        "id": "AR",
                        "name": "Argentina"
                    },
                    "neighborhood": {
                        "id": null,
                        "name": null
                    },
                    "municipality": {
                        "id": null,
                        "name": null
                    },
                    "types": [
                        "default_buying_address"
                    ],
                    "latitude": -31.010405,
                    "longitude": -64.075891,
                    "geolocation_type": "APPROXIMATE"
                }
            },
            "destination": {
                "name": "seller_address"
            }
        },
        "refund_at": "delivered",
        "date_closed": "2024-01-11T12:03:22.464-04:00",
        "resource": "order",
        "date_created": "2024-01-11T16:01:34.936+00:00",
        "claim_id": 5243352643,
        "status_money": "refunded",
        "resource_id": 2000007357691104,
        "type": "automatic",
        "subtype": null,
        "status": "closed",
        "warehouse_review": {
            "product_condition": "saleable",
            "product_destination": "buyer",
            "benefited": false
        }
     }     
```

## Response parameters description

- **last\_updated**: return last update.
- **shipping**: shipping detail of the return.

<!--THE END-->

- - **id**: identification number of the shipment.
  - **status**: status of the shipment.
  - **tracking\_number** tracking number of the return shipment.
  - **lead\_time**:

<!--THE END-->

- - - **estimated\_delivery\_time**: estimated time of arrival of the return shipment.

<!--THE END-->

- - - - **date**: estimated date of arrival of the return shipment.

<!--THE END-->

- - **status\_history**: represents the history of the states through which the return shipment has passed.

<!--THE END-->

- - - **status**: are the states through which the return shipment can pass:

<!--THE END-->

- - - - - pending: when the shipment is generated.
        - ready\_to\_ship: label ready to ship.
        - shipped: shipped.
        - not\_delivered: not delivered.
        - delivered: delivered.
        - cancelled: shipment canceled.

<!--THE END-->

- - - **substatus**: null

<!--THE END-->

- - - **date**: status date.

<!--THE END-->

- - **origin**: address of origin of the return shipment.

<!--THE END-->

- **refund\_at**: when the money is returned to the buyer.

<!--THE END-->

- - **shipped**: when the buyer dispatches the return shipment.
  - **delivered**: 3 days after the seller receives the shipmen.
  - **n/a**: or low cost cases a return is not generated.

<!--THE END-->

- **date\_closed**: date on which the return ends.
- **resource**: name of the resource to which the return is associated.
- **date\_created**: date on which the return is created.
- **claim\_id**: the ID of the claim to which the return is associated.
- **status\_money**: state in which the money of the return is.

<!--THE END-->

- - **retained**: money in account but not available, retained.
  - **refunded**: money returned to the buyer.
  - **available**: money available on account.

<!--THE END-->

- **resource\_id**: resource ID.
- **type**: return type;

<!--THE END-->

- - **claim**: return by claim.
  - **dispute**: return by mediation.
  - **automatic**: automatic return.

<!--THE END-->

- **subtype**: the subtype of return.

<!--THE END-->

- - **low\_cost**: automatic return of low cost type.
  - **return\_partial**: automatic return of type return partial.

<!--THE END-->

- **status**: status through which a return can pass.

<!--THE END-->

- - Return status:

<!--THE END-->

- - - - **opened**: opened: when the buyer initiates a complaint to Mercado Libre for a return.
      - **shipped**: return shipped, money held.
      - **closed**: final status of the return at the end of the return and the associated claim\_id.
      - **delivered**: sent by hand to the seller.
      - **not\_delivered**: return not delivered.
      - **cancelled**: return canceled, money available.
      - **failed**: return failed.
      - **expired**: return expired.

<!--THE END-->

- **warehouse\_review**: result of the triage process done in the warehouse (product review), **this array has information only if the "destination" attribute is equal to warehouse, otherwise it is null.**

<!--THE END-->

- - product\_condition:

<!--THE END-->

- - - saleable: means that the product is fit to be sold again and restock is done automatically.
    - unsaleable: the product is not in saleable condition.
    - discard: the product is discarded because it is different from the one the buyer got from the transaction and had to return, for example a stone.

<!--THE END-->

- - product\_destination: can be "buyer", "seller" or "meli".
  - benefited:

<!--THE END-->

- - - the seller is refunded the money from the sale.
    - false: the buyer is refunded the money from the transaction.

Note:

The /shipments/$SHIPMENT\_ID/costs resource returns [the shipment cost](https://developers.mercadolibre.com.ar/en_us/shipment-handling#Costs) from user.

## Errors

The following are the error messages that the resource may respond to, and which await corrective action:

1\. The claim does NOT exist (not\_found\_error):

```javascript
{
        "code": 404,
        "error": "not_found_error",
        "message": "Error executing GET [client:claims]",
        "cause": null
     }
```

2\. You do not have permission to access the resource (unauthorized\_request\_error):

```javascript
{
        "code": 401,
        "error": "unauthorized_request_error",
        "message": "{\"message\":\"key: parameter caller.id unauthorized owner, status_code:401\",\"error\":\"access_token_verification_fails\",\"status\":401,\"cause\":[\"access_token_verification_fails\",\"Error validating access token, caller.id is not owner\",401]}",
        "cause": null
     }
```

3\. An error occurs with authentication -token- (unauthorized\_request\_error):

```javascript
{
        "code": 401,
        "error": "unauthorized_request_error",
        "message": "Invalid caller.id",
        "cause": null
     }
```