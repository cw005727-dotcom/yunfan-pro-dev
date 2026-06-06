# Returns

**Tags:** Manage Returns,Returns
**Created:** 2024-11-11T22:40:53Z
**Last Updated:** 2026-05-11T10:36:13Z

---

## Returns

Important: Model 6 Sellers — Restricted Access · 403 Forbidden

Sellers identified as **Model 6** are blocked from accessing the claims and returns endpoints of this API. Any request made with a Model 6 seller identity will receive a **403 Forbidden** response.

Example 403 response body:

```javascript
{
  "code": 403,
  "error": "forbidden_error",
  "message": "Forbidden for CBT model 6 sellers.",
  "cause": null
}
```

A return is a crucial process in the buying experience on our platform, through which a buyer can return an item to the seller. This process can be triggered for various reasons, such as discrepancies between the product description and its actual condition, functionality issues, or even a change of mind by the buyer. Effectively managing returns is key to maintaining customer trust and satisfaction, ensuring any issues are resolved transparently and efficiently.

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/176013242631-Flujo-de-Returns-2024-CBT.png)

Note:

The resource /post-purchase/v2/claims/$CLAIM\_ID/returns is an essential tool that allows you to access the specific details of each return, identified by its $CLAIM\_ID, including types, subtypes, and statuses.

At Mercado Libre, we manage various types of returns to ensure a transparent and fair buying experience:

- **claim:** A return initiated through a buyer's claim.
- **dispute:** A return resulting from a dispute between the buyer and seller.
- **automatic:** A return initiated by the buyer, automatically processed by the system.

These different types of returns allow us to handle each situation specifically, ensuring both buyers and sellers receive the proper support throughout the post-purchase process.

## Manage a return

To correctly identify a return, we make the following recommendations:

1. Monitor the claim notification: Listen to the feed Marketplace claims, which contain the order information where the claim originated.
2. Check the resource /claims/$CLAIMS to access the "related\_entities" field, which offers a list of entities linked to the claim. If the value "return" exists, it means there is a return associated with this claim. Now you can check the /returns resource to get the return details and take the necessary actions within the established timeframes.

For more information, check the [Claims Management documentation](https://global-selling.mercadolibre.com/devsite/manage-claims?nocache=true).

## Check a return

**Call:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' 
https://api.mercadolibre.com/marketplace/v2/claims/$CLAIM_ID/returns
```

**Example:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/v2/claims/5298893830/returns
```

**Response:**

```javascript
{
    "last_updated": "2024-09-09T22:35:11.717+00:00",
    "shipping": {
        "id": 43822268076,
        "status": "delivered",
        "tracking_number": null,
        "lead_time": {
            "estimated_delivery_time": {
                "date": "2024-09-11T00:00:00.000-06:00"
            }
        },
        "status_history": [
            {
                "status": "handling",
                "substatus": null,
                "date": "2024-09-09T17:49:32.277-04:00"
            },
            {
                "status": "ready_to_ship",
                "substatus": "ready_to_print",
                "date": "2024-09-09T17:49:32.641-04:00"
            },
            {
                "status": "ready_to_ship",
                "substatus": "printed",
                "date": "2024-09-09T17:49:32.641-04:00"
            },
            {
                "status": "shipped",
                "substatus": null,
                "date": "2024-09-09T18:07:11.695-04:00"
            },
            {
                "status": "shipped",
                "substatus": "first_visit",
                "date": "2024-09-09T18:13:44.426-04:00"
            },
            {
                "status": "delivered",
                "substatus": null,
                "date": "2024-09-09T18:13:44.426-04:00"
            }
        ],
        "origin": {
            "type": "selling_address",
            "sender_id": 1517482146,
            "shipping_address": {
                "address_id": 1400526513,
                "address_line": "Calle Sin Nombre SN",
                "street_name": "Calle Sin Nombre",
                "street_number": "SN",
                "comment": "Referencia: 222222",
                "zip_code": "05000",
                "city": {
                    "id": "TUxNQ0NVQTgxNTY",
                    "name": "Cuajimalpa De Morelos"
                },
                "state": {
                    "id": "MX-DIF",
                    "name": "Distrito Federal"
                },
                "country": {
                    "id": "MX",
                    "name": "Mexico"
                },
                "neighborhood": {
                    "id": null,
                    "name": "Cuajimalpa"
                },
                "municipality": {
                    "id": null,
                    "name": null
                },
                "types": [
                    "default_buying_address"
                ],
                "latitude": 19.3557507,
                "longitude": -99.2993504,
                "geolocation_type": "GEOMETRIC_CENTER"
            }
        },
        "destination": {
            "name": "seller_address"
        }
    },
    "refund_at": "delivered",
    "date_closed": "2024-09-09T18:35:11.994-04:00",
    "resource": "order",
    "date_created": "2024-09-09T21:49:32.037+00:00",
    "claim_id": 5298893830,
    "status_money": "retained",
    "resource_id": 2000009255685274,
    "type": "claim",
    "subtype": "return_total",
    "status": "closed",
    "warehouse_review": {
        "product_condition": "",
        "product_destination": "",
        "benefited": false
    },
    "seller_review": {
        "status": "success",
        "reason_id": null
    }
}
```

### Response fields:

The GET response from the v2/claims/$CLAIM\_ID/returns resource will provide the following fields:

- **last\_updated**: last return update.
- **shipping**: return shipment details.
  
  - **id**: shipment identification number.
  - **status**: shipment status.
  - **tracking\_number**: return shipment tracking number.
  - **lead\_time**
  - **estimated\_delivery\_time**: estimated return shipment arrival time.
  - **date**: estimated return shipment arrival time.
- **status\_history**: represents the history of return shipment statuses.
  
  - **status**: return statuses can include:
    
    - **pending**: when the shipment is generated.
    - **ready\_to\_ship**: label ready for dispatch.
    - **shipped**: sent.
    - **not\_delivered**: not delivered.
    - **delivered**: delivered.
    - **cancelled**: shipment canceled.
  - **substatus**: null
  - **date**: status date.
- **origin**: return shipment origin address.
  
  - **type**: address type.
  - **sender\_id**: buyer code (buyer\_id).
  - **shipping\_address**: address details.
    
    - **address\_id**:
    - **address\_line**:
    - **street\_name**:
    - **street\_number**:
    - **comment**:
    - **zip\_code**:
    - **city**:
    - **state**:
    - **country**:
    - **neighborhood**:
    - **municipality**:
    - **types**:
    - **latitude**:
    - **longitude**:
    - **geolocation\_type**:
- **destination**: return destination information.
  
  - **name**
    
    - **seller\_address**: seller's destination.
    - **warehouse**: Mercado Libre's warehouse destination.
- **refund\_at**: when the buyer's money is refunded.
  
  - **shipped**: when the buyer dispatches the return shipment.
  - **delivered**: 3 days after the seller receives the shipment.
  - **n/a**: for low-cost cases where no return is generated.
- **date\_closed**: return closure date.
- **resource**: name of the resource associated with the return.
- **date\_created**: return creation date.
- **claim\_id**: ID of the claim associated with the return.
- **status\_money**: return money status.
  
  - **retained**: money in account but not available, retained.
  - **refunded**: money returned to the buyer.
  - **available**: money in available account.
- **resource\_id**: resource ID.
- **type**: type of return.
  
  - **claim**: return due to claim.
  - **dispute**: return due to dispute.
  - **automatic**: automatic return.
- **subtype**: return subtype.
  
  - **low\_cost**: automatic low-cost return.
  - **return\_partial**: automatic partial return.
- **status**: statuses a return can go through.
  
  - **opened**: when the buyer initiates a return claim to Mercado Libre.
  - **shipped**: return sent, money retained.
  - **closed**: final status of the return upon closing and associated claim\_id.
  - **delivered**: return shipment in seller's hands.
  - **not\_delivered**: return not delivered.
  - **cancelled**: return canceled, money available.
  - **failed**: return failed.
  - **expired**: return expired.
- **warehouse\_review**: result of the triage process at the warehouse (product review). This array only contains information if the attribute "destination" equals warehouse; otherwise, it is null.
  
  - **product\_condition**
    
    - **saleable**: means the product is fit for resale, and it is automatically restocked.
    - **unsaleable**: the product is not in a saleable condition.
    - **discard**: the product is discarded because it differs from the item the buyer received and was supposed to return, e.g., a rock.
  - **product\_destination**
    
    - **buyer**
    - **seller**
    - **meli**
  - **benefited**
    
    - **true**: the seller is reimbursed the sale amount.
    - **false**: the buyer is refunded the transaction amount
- **seller\_review:** provides information on the review conducted by the seller.
  
  - **status:** review status. It can take one of the following values:
    
    - **pending**: the return is pending seller review.
    - **claimed:** the seller reviewed the product and decided it is not in the expected condition.
    - **failed:** the CX team decided the seller is the beneficiary (previous status is claimed).
    - **success:** the seller reviewed the return and indicated it arrived in the expected condition.
  
  <!--THE END-->
  
  - **reason\_id**: identifier for the reason the seller indicated an issue with the product. Possible values are returned by the reasons/return-fail resource. Currently, the possible values are:
    
    - **null**: when no reason is specified. This field is always null unless the status is 'claimed'.
    - **SRF2**: The product arrived damaged.
    - **SRF3**: The return is incomplete.
    - **SRF4**: A different product was returned than what was sent.
    - **SRF5**: The product is not in the package.
    - **SRF6**: Report another product issue.
    - **SRF7**: The product has not yet been received.

Note:

Remember that the resource /shipments/$SHIPMENT\_ID/costs returns the shipping costs the user will need to bear.

## Get return review details

### How to identify if you can query the GET Reviews API?

The [GET Returns](https://global-selling.mercadolibre.com/devsite/manage-returns#Check-a-Return) API will return the related\_entities field, which must contain the "reviews" item to indicate that a review exists for that return.

### What are appeals?

It is when a return has a review by the triage process and the seller can question or dispute the decision made.

### What is the difference between appeals and failed returns?

- **Failed return:** Occurs when there is no review by triage and the seller is responsible for performing that review, being able to indicate if the product arrived with any problem.
- **Appeal:** It is the seller's response to a decision already made by triage.

### Call:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' 
https://api.mercadolibre.com/post-purchase/v1/returns/$RETURN_ID/reviews
```

### Query parameters

Variable Type Example value Description RETURN\_ID Long 54640533964 Return ID obtained through the endpoint: `/post-purchase/v2/claims/$CLAIM_ID/returns`

**Example:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' 
https://api.mercadolibre.com/post-purchase/v1/returns/54640533964/reviews
```

**Response:**

```javascript
{
  "reviews": [
    {
      "resource": "order",
      "resource_id": 20000053458866422,
      "method": "triage",
      "resource_reviews": [
        {
          "stage": "",
          "status": "success",
          "product_condition": "unsaleable",
          "product_destination": "seller",
          "reason_id": "accepted",
          "benefited": "buyer",
          "seller_status": "failed",
          "seller_reason": "SRF2",
          "benefited_type": null,
          "benefited_reason": null,
          "missing_quantity": 1
        }
      ],
      "date_created": "2024-08-27T14:58:21.978Z",
      "last_updated": "2024-08-27T14:58:21.978Z"
    }
  ]
}
```

### Response parameters:

Field Type Example value Possible values Description reviews List&lt;Review&gt; \[] \[] List of reviews completed by the triage process or by the seller. resource String "order" "order" Type of resource that will be related to the review. For cart, it will be order. For cases other than cart, the resource will also be order. resource\_id Long 2000008990790882 &gt; 0 ID of the resource indicated in resource. method String "none" **"none"**: review performed by the seller  
**"triage"**: review by triage. Indicates the return review method. date\_created String "2024-09-03T22:43:06.633Z" - Review creation date (ISO 8601). last\_updated String "2024-09-03T22:43:06.633Z" - Review update date (ISO 8601). resource\_reviews List&lt;ResourceReview&gt; \[] - List with review details.

### resource\_reviews fields:

Field Type Example value Possible values Description stage String "closed" **"closed"**: The review has been finalized. It can be through a triage that resulted in a seller appeal or a return marked as failed.  
**"pending"**: The failed return is pending resolution.  
**"seller\_review\_pending"**: Triage review that may have an appeal from the seller and is pending.  
**"timeout"**: The time to review the product has expired. Possible cases: 1. Resulted in an appeal initiated by the seller; 2. Resolution time expired. status String "success" **"success"**: Review performed and the product is OK.  
**"failed"**: indicates that the operator detected that the product has some problem. The product\_condition field details the product status.  
**""**: does not have a triage review.  
**null**: is a review performed by the seller. Status of the review performed by triage. It can be an empty string ("") in case of a failed return, as this field is exclusive to Warehouse returns. When there is no triage, the value is null. product\_condition String "saleable" **"saleable"**: the product is in good condition for sale.  
**"discard"**: the product was discarded.  
**"unsaleable"**: The product is not suitable for sale. Or the product was discarded and can later be sold in B2B. When "product\_condition" = "discard", this does not occur.  
**"missing"**: The product did not arrive for review.  
**"" or null**: when there is no triage. Product condition. product\_destination String "meli" **"meli"**  
**"buyer"**  
**"seller"**  
**""**  
**null** Product destination after triage analysis. Notes: 1. In missing cases, the value of this field will be empty (""). 2. When there is no triage, the value is null. reason\_id String "accepted" **"accepted"**  
**"different\_product"**  
**"discard"**  
**"misused"**  
**"not\_working"**  
**"incomplete"**  
**"blocked"**  
**"open\_box"**  
**"missing"**  
**"default"**  
**null** Classification chosen in the triage process. "default" value: cases where triage could not generate a review. null value: there is no triage. benefited String "both" **"both"**  
**"buyer"**  
**"seller"**  
**null** Indicates who was the beneficiary of the triage review. null value: there is no triage. benefited\_type String - **null**  
**"partial\_buyer"** When there is a partial return, indicates who performed the partial return. benefited\_reason String null **null**  
**"penalty\_low"**  
**"penalty\_mid"**  
**"penalty\_high"** When there is a partial return, indicates if the buyer received a penalty. seller\_status String "pending" **"pending"**: time for the seller to perform the review.  
**"success"**: Seller indicates the product is OK; Seller did not review in time; The representative ruled in favor of the buyer.  
**"failed"**: The representative ruled in favor of the seller.  
**"claimed"**: seller reviewed and claimed/responded.  
**""**: The triage review does not warrant a new review by the seller, either because the decision results in a discard, a return to the buyer, or restock.  
**null**: when the seller did not receive the product to review it or when it is not necessary to review the product. Status of the seller's review, if applicable. It can be an empty string (""). seller\_reason String "SRF2" **"SRF2"**  
**"SRF3"**  
**"SRF6"**  
**"SRF7"**  
**null**: when the seller did not review the product or when indicated that the product is OK. Identifies the reason alleged by the seller if the review is not performed correctly. To check the meaning of each reason, consult the API: `/post-purchase/v1/returns/reasons?flow=$FLOW&claim_id=$CLAIM_ID` missing\_quantity Long 1 **&gt;= 0**  
**null** Number of missing items. Used to identify the number of items that were not reviewed because the product did not arrive for review.

### Errors

### 404 Not Found

```javascript
{
  "code": 404,
  "error": "not_found_error",
  "message": "return review not found",
  "cause": null
}
```

The review for the return was not found. Check if the related\_entities field in the `/post-purchase/v2/claims/$CLAIM_ID/returns` resource contains the "reviews" element to indicate that a review exists for the return.

## Return Review

When a return arrives to the seller, they must review it and indicate whether the product arrived in the expected condition or if there is any issue with it. This process is essential to resolve the claim appropriately.

Important:

The return review flows have been unified into a single endpoint based on **return\_id**. Use `/post-purchase/v1/returns/{return_id}/return-review` for both successful and failed reviews.

### How to get the return\_id

To perform a return review, you first need to obtain the **return\_id**. Follow these steps:

1. Query the `/marketplace/v2/claims/$CLAIM_ID/returns` resource to get the return details.
2. Extract the **return\_id** from the response (it may be returned as `id` in the return object).
3. Use this **return\_id** to perform the review.

### Check if review is available

To know if the seller has the option to perform a return review, query the `/claims/$CLAIM_ID` resource. Within the **players** array, look for the player with `"type": "seller"` and check if their **available\_actions** includes:

- `"action": "return_review_ok"` - to approve the return
- `"action": "return_review_fail"` - to report an issue with the return

## Perform a return review

Use the unified endpoint to submit your return review. The request body determines whether it's a successful review (OK) or a failed review.

**Call:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
-H 'Content-Type: application/json' \
https://api.mercadolibre.com/post-purchase/v1/returns/$RETURN_ID/return-review \
-d '$REQUEST_BODY'
```

## Review OK (Product arrived as expected)

To confirm that the returned product arrived in the expected condition, send an empty body:

**Example:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
-H 'Content-Type: application/json' \
https://api.mercadolibre.com/post-purchase/v1/returns/12345678/return-review \
-d '{}'
```

## Get reasons to create a failed return review

To create a failed review, you must know the reason why the seller identifies that the product did not arrive in the expected condition.

The list of possible reasons the seller can select is obtained as follows:

**Request:**

```javascript
curl --location 'https://api.mercadolibre.com/post-purchase/v1/returns/reasons?flow=$FLOW&claim_id=$CLAIM_ID' \
    --header 'Authorization: Bearer $ACCESS_TOKEN'
```

**Example:**

```javascript
curl --location 'https://api.mercadolibre.com/post-purchase/v1/returns/reasons?flow=seller_return_failed&claim_id=55555' \
    --header 'Authorization: Bearer $ACCESS_TOKEN'
```

You must provide:

- **flow:** Indicates for which flow you want to obtain the reasons (for now, only the value **seller\_return\_failed** is valid)
- **claim\_id:** Unique identifier of the claim.

**Response:**

```javascript
[
    {
        "id": "SRF2",
        "name": "product_damaged",
        "detail": "The product arrived damaged",
        "position": 1,
        "apply": [
            "order"
        ]
    },
    {
        "id": "SRF3",
        "name": "return_incomplete",
        "detail": "The return is incomplete",
        "position": 2,
        "apply": [
            "order"
        ]
    },
    {
        "id": "SRF4",
        "name": "returned_product_different",
        "detail": "A different product was returned than the one I sent",
        "position": 3,
        "apply": [
            "order"
        ]
    },
    {
        "id": "SRF5",
        "name": "product_not_in_package",
        "detail": "The product is not in the package",
        "position": 4,
        "apply": [
            "order",
         "package"
        ]
    },
    {
        "id": "SRF6",
        "name": "another_failure_with_product",
        "detail": "Report another issue with the product",
        "position": 5,
        "apply": [
            "order"
        ]
    },
    {
        "id": "SRF7",
        "name": "return_has_not_arrived",
        "detail": "It has not arrived yet",
        "position": 6,
        "apply": [
         "package"
        ]
    }
 ]
```

## Get the evidence file name to attach to a failed return review

When creating a failed review, it is also possible to send evidence in order to provide more information for the case. Therefore, you can use the /claims/$CLAIM\_ID/returns/attachments resource to upload files.

As a result, you will obtain the file name to be sent as evidence in the review.

This resource should be used for each piece of evidence you want to attach to a failed review.

**Request:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' 
    https://api.mercadolibre.com/post-purchase/v1/claims/$CLAIM_ID/returns/attachments
    -F 'file=@"/Users/user/Downloads/file.png'
```

**Example:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/post-purchase/v1/claims/5255026166/returns/attachments
    -F 'file=@"/Users/user/Downloads/file.png'
```

**Response:**

```javascript
{
    "user_id": 1277895049,
    "file_name": "1117895119_9d6zaaz8-a1c7-4f1f-a68b-fz0z0135gd6.png"
}
```

**Errors:**

**Nonexistent claim**

```javascript
{
    "code": 404,
    "error": "not_found_error",
    "message": "Claim not found. claimId: 5255026166",
    "cause": null
 }
```

**Body error (for example, no image was sent)**

```javascript
{
    "code": "bad_request",
    "message": "Error retrieving uploaded file. claim_id: 5356116886. caller_id: 1985874106"
}
```

**Invalid key**

```javascript
{
    "code": "not_found",
    "message": "Request error: [{\"status\":404,\"error\":\"not_found\",\"message\":\"Can not get attachment\"}]"
}
```

#### Response Fields

A successful POST request to the /claims/$CLAIM\_ID/returns/attachments resource will return a **status code 200** and the following fields:

- **user\_id**: user identifier
- **file\_name**: file name that can be used when creating a failed review

Note:

With the new architecture, attachments are no longer linked at the `claim` level, but are managed through the **Return**, which can be associated with one or more claims. Make sure to update your integration to use **return\_id** as the correct reference.

## Review Fail (Product arrived with issues)

To indicate that the returned product has issues, you must provide the reason, a message, and optionally attachments as evidence.

##### Parameters

Parameter Type Required Description reason String Yes Identifier for the reason why the product did not arrive as expected. Values obtained from the /returns/reasons resource. message String Yes Message from the seller explaining the issue with the returned product. attachments Array\[String] Required for SRF2 and SRF4 Names of evidence files to attach. Values obtained from the /returns/attachments resource. order\_id Integer Only for cart cases Order identifier. Only use for cart cases when reviewing a specific order. Do not send for non-cart cases or full cart reviews.

**Example - Single order review:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
-H 'Content-Type: application/json' \
https://api.mercadolibre.com/post-purchase/v1/returns/12345678/return-review \
-d '[
  {
    "reason": "SRF2",
    "message": "The product arrived with visible damage on the screen",
    "attachments": ["1117895119_9d6zaaz8-a1c7-4f1f-a68b-fz0z0135gd6.png"]
  }
]'
```

**Example - Cart case with multiple orders:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
-H 'Content-Type: application/json' \
https://api.mercadolibre.com/post-purchase/v1/returns/12345678/return-review \
-d '[
  {
    "reason": "SRF2",
    "message": "Product damaged",
    "attachments": ["1117895119_9d6zaaz8-a1c7-4f1f-a68b-fz0z0135gd6.png"],
    "order_id": 2000011248679992
  },
  {
    "reason": "SRF4",
    "message": "Different product received",
    "attachments": ["1117895119_abc123-a1c7-4f1f-a68b-xyz789.png"],
    "order_id": 2000011248679993
  }
]'
```

**Example - Package-level reason (e.g., package not received):**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
-H 'Content-Type: application/json' \
https://api.mercadolibre.com/post-purchase/v1/returns/12345678/return-review \
-d '[
  {
    "reason": "SRF7",
    "message": "The return package has not arrived yet"
  }
]'
```

Note:

Some reasons apply to the entire package (like SRF7 - "not arrived yet"), while others apply to individual orders. Check the **apply** field in the reasons response to determine the correct usage:

- **package**: applies to the entire return
- **order**: applies to individual orders

**Response:**

```javascript
{
    "id": 5255026166,
    "resource_id": 2000007760636316,
    "status": "closed",
    "type": "mediations",
    "stage": "claim",
    "parent_id": null,
    "resource": "order",
    "reason_id": "PDD9949",
    "fulfilled": true,
    "quantity_type": "total",
    "players": [
        {
            "role": "complainant",
            "type": "buyer",
            "user_id": 1277895049,
            "available_actions": []
        },
        {
            "role": "respondent",
            "type": "seller",
            "user_id": 1582937623,
            "available_actions": []
        },
        {
            "role": "mediator",
            "type": "internal",
            "user_id": 46122402,
            "available_actions": []
        }
    ],
    "resolution": {
        "reason": "item_returned",
        "date_created": "",
        "benefited": [
            "complainant"
        ],
        "closed_by": "mediator",
        "applied_coverage": true
    },
    "site_id": "MLA",
    "date_created": "2024-05-29T23:48:32.000-04:00",
    "last_updated": "2024-05-29T23:51:26.370-04:00"
}
```

**Errors:**

**Nonexistent claim:**

```javascript
{
   "code": 404,
   "error": "not_found_error",
   "message": "claim_Not Found",
   "cause": null
 }
```

**Invalid flow:**

```javascript
{
   "code": 400,
   "error": "bad_request_error",
   "message": "flow: invalid_flow does not exist. claimId: 5358155244",
   "cause": null
 }
```

Currently, only the **seller\_return\_failed** flow is valid. Any other value will return this error.

#### Response Fields

A successful GET request to the /returns/reasons resource will return a **status code 200** and the following fields:

- **id**: Reason identifier. This is the value you must send when creating a failed review.
- **name**: Reason code
- **detail**: Reason for the failed return, to give context to the seller when selecting the reason
- **position**: Recommended position of the reason when displaying all reasons to the seller
- **apply**: Indicates for what the reason can be used. This is because now it's possible to perform reviews for cart returns (which include multiple orders), so some reasons apply only to the entire package, others to individual orders, and others can be used for both cases. The possible values for this field in cart cases are: **package** and **order**, and for non-cart cases, only **order**.

## Return Shipping Cost

To improve the experience we offer our sellers, we have created this functionality to allow you to obtain return and exchange shipping cost information.

To get the return and exchange shipping cost information, make a **GET** request to:

**Call:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' 
https://api.mercadolibre.com/post-purchase/v1/claims/$CLAIM_ID/charges/return-cost
```

Specifying the $CLAIM\_ID. This will provide detailed information about the value associated with the return and exchange shipping for the corresponding claim.

Note:

The **calculate\_amount\_usd** parameter is a query parameter that defaults to `false`. When sent with the value `true`, the application will calculate and return the value in US dollars (USD). If not sent or sent with the value `false`, the USD calculation will not be performed.

### Example with calculate\_amount\_usd=true

**Request:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' 
'https://api.mercadolibre.com/post-purchase/v1/claims/5298893830/charges/return-cost?calculate_amount_usd=true'
```

**Response:**

```javascript
{
    "currency_id": "MXN",
    "amount": 125.50,
    "amount_usd": 7.25
}
```

### Example without calculate\_amount\_usd

**Request:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' 
'https://api.mercadolibre.com/post-purchase/v1/claims/5298893830/charges/return-cost'
```

**Response:**

```javascript
{
    "currency_id": "MXN",
    "amount": 125.50
}
```

### Response Fields

Field Type Description Example **currency\_id** String Currency ID for the amount field MXN, BRL, ARS **amount** BigDecimal Amount to be charged to the seller for the return 125.50 **amount\_usd** BigDecimal Amount converted to US dollars (only when calculate\_amount\_usd=true) 7.25

## Errors

Below are the possible error messages that the resources might generate:

**If the claim does not belong to the seller:**

```javascript
{
   "code": 400,
   "error": "bad_request_error",
   "message": "Invalid roleId :12343234 in claim :123454323",
   "cause": null
}
```

**If the claim does not exist:**

```javascript
{
   "code": 404,
   "error": "not_found_error",
   "message": "claim id: 5255026166 not found",
   "cause": null
}
```

**If the token is not sent:**

```javascript
{
   "code": 401,
   "error": "unauthorized_request_error",
   "message": "Invalid caller.id",
   "cause": null
}
```

**If the token has expired or is invalid:**

```javascript
{
   "message": "invalid_token",
   "error": "not_found",
   "status": 401,
   "cause": []
}
```

**If the token is incorrect:**

```javascript
{
   "message": "{\"message\":\"Malformed access_token: token\",\"error\":\"bad_request\",\"status\":400,\"cause\":[]}",
   "error": "",
   "status": 400,
   "cause": []
}
```

**If the seller is not enabled to review a return:**

```javascript
{
   "code": 400,
   "error": "bad_request_error",
   "message": "Not valid action return_review_ok for player role respondent",
   "cause": null
}
```

**If the format of the file to be attached is not valid:**

```javascript
{
   "code": 400,
   "error": "bad_request_error",
   "message": "Invalid mime_type",
   "cause": null
}
```

**If the file name is not valid:**

```javascript
{
   "code": 400,
   "error": "bad_request_error",
   "message": "Invalid file_name: ",
   "cause": null
}
```

**If the "file" field is not sent:**

```javascript
{
   "code": 400,
   "error": "bad_request_error",
   "message": "Current request is not a multipart request",
   "cause": null
}
```

**If one of the required fields is missing:**

```javascript
{
   "code": 400,
   "error": "bad_request_error",
   "message": "Required request body is missing or incorrect, please see the documentation.",
   "cause": null
}
```

## Related topics

- [Manage claims](https://global-selling.mercadolibre.com/devsite/manage-claims) - Handle buyer claims and disputes
- [Claims messages](https://global-selling.mercadolibre.com/devsite/manage-claims-messages) - Send and receive messages within claims
- [Claim resolutions](https://global-selling.mercadolibre.com/devsite/manage-claim-resolutions) - Resolve claims with refunds, returns, or disputes

**Next:** [Post-sale messages](https://global-selling.mercadolibre.com/devsite/what-is-post-sale-messages)