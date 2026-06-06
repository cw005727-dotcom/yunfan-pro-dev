# Claims Resolutions 

**Tags:** Manage resolution,claims ,resolution of a claim,claim resolution 
**Created:** 2024-11-08T15:01:25Z
**Last Updated:** 2026-05-11T10:33:42Z

---

## Claims Resolutions

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

Managing the resolution of claims involves addressing and resolving user complaints efficiently and satisfactorily. The primary goal is to effectively solve issues to maintain high levels of customer satisfaction and ensure the continuous quality of the service provided. This not only strengthens customer trust in the platform but also helps cultivate positive and long-lasting relationships with the user base.

### Claims resolution options

The claimant's resolution expectation is recorded as additional information alongside the claim, ensuring that their wishes are considered when issuing a decision. This practice not only demonstrates a commitment to customer satisfaction but also allows for more informed and personalized decision-making.

### Types of Expected Resolutions

EXPECTED RESOLUTION CLAIM TYPE EXPECTATION product PNR The buyer wants the product to arrive. refund PNR and PDD The buyer wants a refund for the product (claim initiation - expected created by the buyer) / The seller directly executes the refund (claim closure - expected created by the seller). change\_product PDD The buyer wants the product to be exchanged. return\_product PDD The buyer wants the product to be returned with a subsequent refund.

Note:

Resolutions can be accepted or rejected, and in the case of rejection, an alternative is offered. This allows for adaptation to the specific needs of each situation, ensuring that all available options are explored to reach a satisfactory solution.

## Consult expected resolutions

**Call:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
https://api.mercadolibre.com/marketplace/v2/claims/$CLAIM_ID/expected-resolutions
```

**Example:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
https://api.mercadolibre.com/marketplace/v2/claims/5294629673/expected-resolutions
```

**Response:**

```javascript
[
    {
        "player_role": "complainant",
        "user_id": 1517482146,
        "expected_resolution": "return_product",
        "details": [],
        "date_created": "2024-08-22T17:31:32.000-04:00",
        "last_updated": "2024-08-22T17:31:32.000-04:00",
        "status": "pending"
    }
]
```

### Response Fields

The response to a GET request to the /claims/expected-resolutions resource will provide the following parameters:

- **player\_role**: Actor initiating or interacting in the claim.
  
  - complainant
  - respondent
  - mediator
- **user\_id**: ID of the user initiating the claim.
- **expected\_resolution**: Resolution of the claim loaded by the player indicated in the previous parameter.
  
  - refund: The player expects a refund.
  - product: The player expects the product to arrive.
  - change\_product: The player expects to exchange the product.
  - return\_product: The player expects to return the product with a subsequent refund.
- **details**: Additional information about the expected resolution.
- **date\_created**: Date when the expected resolution was created.
- **last\_updated**: Date of the last update to the expected resolution.
- **status**: Status of the claim resolution.
  
  - pending: The player has loaded the expected resolution, but it has not yet been accepted by the other party.
  - accepted: The resolution loaded by the player was accepted by the other party or, failing that, by the Mercado Libre mediator.
  - rejected: The resolution loaded by the player was rejected by the other party, and a new resolution option was loaded in response.

Note:

Despite the resolutions presented by the participants, in certain scenarios, the final determination falls to a Mercado Libre representative, especially when the parties fail to reach a mutual agreement. This process ensures that even in cases of disagreement, an impartial and fair decision is made, preserving the integrity and fairness of the mediation system.

## Partial Refund

The partial refund flow is closely tied to the buyer's claim process. Depending on the options available to the seller, a solution to the claim can be offered by returning a portion of the amount paid for the purchase.

For this reason, it is crucial that the set of available actions, represented by the available\_actions array, includes the allow\_partial\_refund option, as illustrated in the following example (Use the "consult a specific claim" API):

**Response:**

```javascript
{
    "id": 5294629673,
    "resource_id": 2000009106165734,
    "status": "opened",
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
            "user_id": 1517482146,
            "available_actions": []
        },
        {
            "role": "respondent",
            "type": "seller",
            "user_id": 1317418851,
            "available_actions": [
                {
                    "action": "send_message_to_complainant",
                    "mandatory": false,
                    "due_date": null
                },
                {
                    "action": "refund",
                    "mandatory": false,
                    "due_date": null
                },
                {
                    "action": "open_dispute",
                    "mandatory": false,
                    "due_date": null
                },
                {
                    "action": "allow_partial_refund",
                    "mandatory": false,
                    "due_date": null
                }
            ]
        }
    ],
    "resolution": null,
    "site_id": "MLM",
    "date_created": "2024-08-22T17:31:31.000-04:00",
    "last_updated": "2024-08-22T18:21:20.000-04:00",
    "related_entities": []
}
```

## How to Offer a Partial Refund

To grant a partial refund, the claim must be in PDD, with expected\_resolution set as return\_product and status as pending. It is necessary to consult the /available-offers resource to determine the available refund amounts and percentages. This approach ensures a precise and transparent management of partial refunds, thereby optimizing the experience for both the buyer and the seller.

**Call:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
https://api.mercadolibre.com/marketplace/v2/claims/$CLAIM_ID/partial-refund/available-offers
```

**Example:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' \
https://api.mercadolibre.com/marketplace/v2/claims/5294629673/partial-refund/available-offers
```

**Response:**

```javascript
{
    "currency_id": "USD",
    "available_offers": [
        {
            "amount": 18.18,
            "percentage": 90.0
        },
        {
            "amount": 16.16,
            "percentage": 80.0
        },
        {
            "amount": 14.14,
            "percentage": 70.0
        },
        {
            "amount": 12.12,
            "percentage": 60.0
        },
        {
            "amount": 10.10,
            "percentage": 50.0
        },
        {
            "amount": 8.08,
            "percentage": 40.0
        },
        {
            "amount": 6.06,
            "percentage": 30.0
        },
        {
            "amount": 4.04,
            "percentage": 20.0
        },
        {
            "amount": 2.02,
            "percentage": 10.0
        }
    ]
}
```

### Response fields:

The response to a GET request to the /claims/partial-refund/available-offers resource will provide the following parameters:

- **currency\_id**: Currency code (e.g., USD, MXN).
- **available\_offers**: List of valid refund options.
- **amount**: Refund amount in the specified currency.
- **percentage**: Refund percentage representing the value (amount).

Note:

To select the refund percentage, an active choice is essential. If a percentage is not specified, a default refund value of 50% will be automatically assigned, set as **default\_percentage**.

When offering a partial refund, a transition occurs in the **expected\_resolution** field. Initially, this field was on the seller's side with **player\_role: complainant**. However, by offering a partial refund, this field will be rejected and a new one will be created with **expected\_resolution=partial\_refund**. In this new field, the status will be pending and the responsibility will fall on the buyer, with **player\_role: respondent**. This change in roles and statuses ensures a smooth and transparent management of partial refunds, thereby optimizing the experience for all involved parties.

After obtaining the available amounts and percentages, you will proceed to make the corresponding POST request to execute the selected refund. It is important to highlight that at this point, offering a 100% refund through this specific endpoint is not allowed. In other words, a full refund cannot be offered in the context of a partial refund request. This limitation ensures precise and consistent handling of refunds, aligned with established policies.

**Call:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
-H 'Content-Type: application/json' \
-d '{"percentage": $PERCENTAGE}' \
https://api.mercadolibre.com/marketplace/v2/claims/$CLAIM_ID/expected-resolutions/partial-refund
```

**Example:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
-H 'Content-Type: application/json' \
-d '{"percentage": 50}' \
https://api.mercadolibre.com/marketplace/v2/claims/5294629673/expected-resolutions/partial-refund
```

**Response:**

```javascript
[
    {
        "player_role": "complainant",
        "user_id": 1517482146,
        "details": [],
        "expected_resolution": "return_product",
        "date_created": "2024-08-22T17:31:32.000-04:00",
        "last_updated": "2024-08-22T17:31:32.000-04:00",
        "status": "rejected"
    },
    {
        "player_role": "respondent",
        "user_id": 1317418851,
        "details": [
            {
                "key": "percentage",
                "value": "50.0"
            },
            {
                "key": "seller_amount",
                "value": "10.1"
            },
            {
                "key": "seller_currency",
                "value": "US$"
            }
        ],
        "expected_resolution": "partial_refund",
        "date_created": "2024-08-22T18:34:54.000-04:00",
        "last_updated": "2024-08-22T18:34:54.000-04:00",
        "status": "pending"
    }
]
```

If you send a value different from the allowed ones, you will receive this response:

**Response:**

```javascript
{
    "code": 400,
    "error": "bad_request_error",
    "message": "35.5 is not a valid percentage",
    "cause": null
}
```

If the seller does not have the partial refund option enabled, you will receive this response:

**Response:**

```javascript
{
    "code": 400,
    "error": "bad_request_error",
    "message": "Action allow_partial_refund not available",
    "cause": null
}
```

Note:

- If the partial refund is accepted by the buyer, the claim will be closed, and the buyer will be refunded the amount corresponding to the offered percentage.
- If the partial refund is not accepted by the buyer, the expected partial refund resolution will be marked as rejected. This notification indicates that the partial refund request has not been accepted in its current state.

## Full Refund

When the **available\_actions** option is **refund**, the following resources can be used to issue a full refund to the buyer through the claim.

**Call:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
https://api.mercadolibre.com/marketplace/v2/claims/$CLAIM_ID/expected-resolutions/refund
```

**Example:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
https://api.mercadolibre.com/marketplace/v2/claims/5294629673/expected-resolutions/refund
```

**Response:**

```javascript
[
    {
        "player_role": "complainant",
        "user_id": 1517482146,
        "expected_resolution": "refund",
        "status": "pending",
        "details": [],
        "date_created": "2024-08-21T13:47:31.000-04:00",
        "last_updated": "2024-08-21T13:47:31.000-04:00"
    }
]
```

## Product Return

Important:

The **/expected-resolutions/allow-return** resource is added to process returns, replacing the functionality of "accept resolution" or "submit a new resolution" since both flows resulted in a return.

**Call:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
https://api.mercadolibre.com/marketplace/v2/claims/$CLAIM_ID/expected-resolutions/allow-return
```

**Example:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
https://api.mercadolibre.com/marketplace/v2/claims/5298893830/expected-resolutions/allow-return
```

**Response:**

```javascript
[
    {
        "player_role": "complainant",
        "user_id": 1517482146,
        "expected_resolution": "return_product",
        "details": [],
        "date_created": "2024-09-09T17:47:08.000-04:00",
        "last_updated": "2024-09-09T17:47:08.000-04:00",
        "status": "pending"
    }
]
```

The claim type directly influences the solutions that can be offered and how the expectations of both the buyer and the seller are managed. There are mainly two types of claims: "PNR" (Paid but Not Received) and "PDD" (Defective Product). To identify the claim type, check the first three letters of the `reason_id` field. For example, if the field contains "PNR3430", the claim is of type "PNR".

For **PNR** claims, the available options are:

- "refund": The buyer wants a refund for the amount paid for the product.
- "product": The buyer wants to receive the product they purchased.

Similarly, for **PDD** cases, the following options are available:

- "return\_product": The buyer wants a refund for the amount paid for the product and, additionally, to return the received product.
- "partial\_refund": A partial refund is offered to the buyer.

With this information, the seller can decide whether to proceed according to the buyer's request or take a different action on the claim, such as offering a partial refund or managing the product return.

For **"PDD"** cases where the purchase uses Mercado Envíos and the shipping status is 'delivered', when the seller offers the return, a label is generated for the buyer to return the product. The money is refunded once the return shipment status is updated to 'shipped' or 'delivered'.

If the resolution is a full refund, the claim will be closed and the amount will be refunded to the buyer.

If the resolution is a partial refund, the buyer will receive a refund offer. If they accept the offer, the claim will be closed. If not, the buyer can choose to escalate the issue to a dispute.

This approach ensures that all parties involved understand the process and the available options, promoting efficient and transparent claim management. Both sellers and buyers can handle claims with confidence, ensuring fair attention.

## Request Mediation (Dispute Resolution)

The main goal of mediation is to achieve a solution that is beneficial to both parties, ensuring a fair and equitable resolution of any disputes that may arise. For sellers facing claims, this process represents an effective tool for addressing conflicts quickly and efficiently while maintaining a positive relationship with both their customers and the Mercado Libre platform. This tactic, in addition to promoting customer satisfaction, strengthens the seller's reputation and fosters a collaborative atmosphere in the Mercado Libre environment.

**Call:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
https://api.mercadolibre.com/marketplace/v2/claims/$CLAIM_ID/actions/open-dispute
```

**Example:**

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
https://api.mercadolibre.com/marketplace/v2/claims/5294651094/actions/open-dispute
```

**Response:**

```javascript
{
    "id": 5294651094,
    "resource_id": 2000009106789766,
    "status": "opened",
    "type": "mediations",
    "stage": "dispute",
    "parent_id": null,
    "resource": "order",
    "reason_id": "PDD9942",
    "fulfilled": true,
    "quantity_type": "total",
    "players": [
        {
            "role": "complainant",
            "type": "buyer",
            "user_id": 1517482146,
            "available_actions": []
        },
        {
            "role": "respondent",
            "type": "seller",
            "user_id": 1317418851,
            "available_actions": [
                {
                    "action": "send_message_to_mediator",
                    "mandatory": false,
                    "due_date": null
                }
            ]
        },
        {
            "role": "mediator",
            "type": "internal",
            "user_id": 46622406,
            "available_actions": []
        }
    ],
    "resolution": null,
    "site_id": "MLM",
    "date_created": "2024-08-22T18:45:22.000-04:00",
    "last_updated": "2024-08-22T18:49:09.000-04:00"
}
```

Note:

When mediation is activated, an exclusive communication channel is established through Mercado Libre, meaning direct messages cannot be sent to the buyer. In this process, it is essential to set the "receiver\_role" to "mediator" to ensure that all interactions are managed centrally and efficiently by the platform. This approach guarantees effective and transparent mediation, optimizing the flow of information and facilitating a swift and fair resolution of any disputes.

## Claim Types Reference

CLAIM TYPE DESCRIPTION AVAILABLE RESOLUTIONS **PNR** Paid but Not Received refund, product **PDD** Product with Defect/Damage return\_product, partial\_refund, refund

## Errors

HTTP CODE ERROR CODE MESSAGE SOLUTION 400 bad\_request\_error {value} is not a valid percentage Use only percentages returned by the /available-offers endpoint. 400 bad\_request\_error Action allow\_partial\_refund not available Verify the claim has allow\_partial\_refund in available\_actions. 403 PA\_UNAUTHORIZED\_RESULT\_FROM\_POLICIES At least one policy returned UNAUTHORIZED. Verify the token has required scopes and the claim belongs to the authenticated user. 404 not\_found\_error Claim not found. claimId: {id} Verify the claim ID exists and is accessible.

Next: [Claims Messages](https://global-selling.mercadolibre.com/devsite/manage-claims-messages)