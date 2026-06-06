# Manage Claims

**Tags:** Manage,Claims
**Created:** 2024-11-07T16:41:45Z
**Last Updated:** 2026-05-11T10:22:36Z

---

## Claims

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

A claim is a formal request that users can submit to express dissatisfaction or issues related to a specific process. These claims are essential for resolving problems, ensuring a positive user experience, and maintaining the integrity of the service. Only four types of resources can generate claims, each associated with a different aspect of the transaction on the platform. The possible resources are detailed below:

- **Order**: This type of claim is generated from a purchase order made on the Mercado Libre platform. Users can file a claim if they experience issues with the order, such as discrepancies in the received product, errors in quantity, or any other inconvenience related to the order. This ensures that users can communicate any dissatisfaction and receive an appropriate solution, thereby maintaining trust and service integrity.
- **Shipment**: shipment claims originate from the shipping process of a purchase on the Mercado Libre platform. Users can file a claim if they encounter problems with the delivery of the product, such as delays, products damaged during shipping, or logistical issues. These claims allow for quick resolution of incidents, improving the customer experience.
- **Payment**: this type of claim is created in relation to a payment made through the Mercado Libre platform. Users can file a claim for payments related to purchases on the platform or any other type of transaction made through the Mercado Libre payment system. Issues that may prompt these claims include incorrect charges, payment processing failures, or disputes related to the transaction. This mechanism not only allows users to quickly resolve their issues but also helps the platform identify and correct potential failures in its payment system, enhancing reliability and customer satisfaction.
- **Purchase**: purchase claims arise from a purchase made on the Mercado Libre platform. These claims focus on the purchase transaction and address issues such as defective products, discrepancies between the product description and what was received, among other inconveniences. Allowing users to file these claims improves transparency and facilitates a quick resolution, which not only reinforces customer trust in the platform but also helps identify and resolve flaws in the purchase process.

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/176181125835-Flujo-de-Cancels-2024-CBT.png)

## Claims notifications

In the 'My Applications' section, edit your application and enable the 'Marketplace Claims' topic in our feed. This will allow you to receive immediate notifications whenever a claim is initiated or any related interaction occurs. Stay informed and up to date with all important claim updates.

## Consult an specific claim

To consult the information of a specific claim, including its actual status, it's necessary to consult the /claims/$CLAIM\_ID resource.

**Request:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/v2/claims/$CLAIM_ID
```

**Example:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/v2/claims/5298903643
```

**Response:**

```javascript

   {
   "id": 5298903643,
   "resource_id": 2000009256002260,
   "status": "opened",
   "type": "mediations",
   "stage": "dispute",
   "parent_id": null,
   "resource": "order",
   "reason_id": "PDD9939",
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
   "date_created": "2024-09-09T18:18:38.000-04:00",
   "last_updated": "2024-09-09T19:00:12.000-04:00",
   "related_entities": [
       "return"
   ]
}
```

### Response fields

The response to a GET request on the /claims/search resource will provide the following parameters:

- **id**: Claim id
- **resource\_id**: ID of the resource on which the claim is created. It depends on the "resource".
- **status**: Status of the claim. It can take two values: opened and closed.
- **type**: Type of claim. It can take one of the following values:
  
  - **mediations**: Claim between buyer and seller.
  - **fulfillment**: Claim between buyer and Mercado Libre originating from a purchase with full shipping.
  - **ml\_case**: Purchase cancellation by the buyer due to delayed shipping.
  - **cancel\_sale**: Purchase cancellation by the seller.
  - **cancel\_purchase**: Purchase cancellation by the buyer.
  - **change**: Product exchange. Indicates that a product exchange will take place.
  - **service**: Service cancellation for bundled orders.
- **stage**: Stage of the claim. It can take one of the following values:
  
  - **claim**: Stage where the buyer and seller are involved
  - **dispute**: Mediation stage involving a Mercado Libre representative.
  - **recontact**: Stage where one of the parties contacts after the claim/dispute is closed.
  - **none**: Not applicable.
  - **stale**: Claim stage involving the buyer and Mercado Libre for claims of type ml\_case.
- **parent\_id**: ID of another claim on which this claim depends.
- **resource**: Identifier of the resource on which the claim is created. It can be:
  
  - payment
  - order
  - shipment
  - purchase
- **reason\_id**: Reason for which the claim was created. It directly influences the proposed solutions.
  
  - PNR: Product Not Received
  - PDD: Wrong or Defective Product
  - CS: Canceled Purchase
- **fulfilled**: Indicates whether the claim was initiated for a delivered product. It can take two values: false | true.
- **quantity\_type**: Indicates whether the claim is a partial claim or not.
  
  - partial: Indicates that it is a partial claim.
  - total: Indicates that it is a complete claim.
- **players**: List of actors involved in the claim with their respective actions and available times.
  
  - **role**: Role within the claim. It can be:
    
    - complainant: The person who makes the claim.
    - respondent: The person against whom the claim is made.
    - mediator: The person who intervenes to help resolve the issue.
    - purchase: Buyer - Mercado Libre.
  - **type**: The role the person plays in the operation being claimed. It varies according to the resource.
    
    - Payment: Buyer or collector.
    - Order: Buyer or seller.
    - Shipment: Receiver or sender.
  - **user\_id**: ID of the user in MercadoLibre who fulfills the role.
  - **available\_actions**: List of actions that each of the intervening parties can take:
    
    - **action**: Possible actions that can be taken. For the seller, they are:
      
      - **send\_message\_to\_complainant**: Send a message to the buyer (with or without attachments).
      - **send\_message\_to\_mediator**: Send a message to the mediator (with or without attachments).
      - **recontact** (not yet available): Reopen an already closed claim through an interaction, such as a message.
      - **refund**: Refund the buyer's money.
      - **open\_dispute**: Initiate a mediation.
      - **send\_potential\_shipping**: Send a shipping promise, a date.
      - **add\_shipping\_evidence**: Post evidence that the product was shipped.
      - **send\_attachments**: Send a message with attachments.
      - **allow\_return**: Generate a return label.
      - **allow\_return\_label**: Generate a return label.
      - **allow\_partial\_refund**: Partially refund the buyer's money for claims of the type PDD.
      - **send\_tracking\_number**: Send the tracking number.
      - **return\_review\_fail**: Perform a failed review of a return. (tracking number).
      - **return\_review\_ok**: Perform a successful review of a return.
    - **mandatory**: A true type field where the action is mandatory and must be completed before the deadline.
    - **due\_date**: Deadline to perform the action.
- **resolution**: Resolution form of the claim.
  
  - **reason**: Resolution form of the claim.
    
    - already\_shipped: Product in transit.
    - buyer\_claim\_opened: Return closure due to the opening of another claim.
    - buyer\_dispute\_opened: Return closure due to the opening of another claim in dispute (with Mercado Libre mediation).
    - charged\_back: Closure due to chargeback.
    - coverage\_decision: Dispute closed with coverage by Mercado Libre.
    - found\_missing\_parts: Buyer found the missing parts.
    - item\_returned: Product returned.
    - no\_bpp: Closure without coverage by Mercado Libre.
    - not\_delivered: Product not delivered.
    - opened\_claim\_by\_mistake: Buyer created the claim by mistake.
    - partial\_refunded: Partial refund granted to the buyer.
    - payment\_refunded: Payment refunded to the buyer.
    - prefered\_to\_keep\_product: Buyer preferred to keep the product.
    - product\_delivered: Decision made by a Mercado Libre representative.
    - reimbursed: Refund issued.
    - rep\_resolution: Decision made by a Mercado Libre representative.
    - respondent\_timeout: Seller did not respond.
    - return\_canceled: Return canceled by the buyer.
    - return\_expired: Return expired without a change in shipping status.
    - seller\_asked\_to\_close\_claim: Seller asked the buyer to close the claim.
    - seller\_did\_not\_help: Buyer was able to resolve the issue without the seller's help.
    - seller\_explained\_functions: Seller explained how the item works.
    - seller\_sent\_product: Seller shipped the product.
    - timeout: Closure due to buyer action timeout.
    - warehouse\_decision: Closure due to delay in product review at Warehouse.
    - warehouse\_timeout: Closure due to delay in product review at Warehouse.
    - worked\_out\_with\_seller: Buyer resolved it with the seller outside of Mercado Libre.
    - low\_cost: Closure because the shipping cost is higher than the product cost.
    - item\_changed: Closure because the exchange was successfully completed.
    - change\_expired: The exchange was not completed, and the allowed time expired.
    - change\_cancelled\_buyer: Proactive closure of an exchange by the buyer.
    - change\_cancelled\_seller: Proactive closure of an exchange by the seller.
    - change\_cancelled\_meli: Closure of an exchange by Mercado Libre.
    - shipment\_not\_stopped: Closure because the shipment could not be stopped.
    - cancel\_installation: Cancellation of installation service.
  - **date\_created**: Date of claim resolution/closure.
  - **benefited**: Beneficiaries of the resolution (complainant | respondent).
  - **closed\_by**: Actor who closed the claim (mediator | buyer).
  - **applied\_coverage**: Indicates whether the claim is covered (false | true).
  - **site\_id**: ID of the site where the claim is being processed.
  - **created\_date**: Date of claim creation/opening.
  - **last\_updated**: Date of the last update on the claim.
  - **related\_entities**: Contains a list of entities related to the claim. If there are no returns, the IDs will have a value of vda.

## Claims details

To understand the reason for the claim and details on how to act in response to it, use the claims/detail resource. This resource will bring the actual status only.

**Request:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/v2/claims/$CLAIM_ID/detail
```

**Example:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/v2/claims/5298903643/detail
```

**Response:**

```javascript
{
   "due_date": "2024-09-11T22:39:00.000-04:00",
   "action_responsible": "mediator",
   "title": "Return in mediation awaiting a response from Mercado Libre",
   "description": "We will get in touch with you before Thursday, September 12.",
   "problem": "You told us the product returned is different from the one dispatched"
}
```

### Response fields:

The response to a GET request on the /claims/detail resource will provide the following parameters:

- **due\_date:** Deadline to resolve the claim.
- **action\_responsible:** Party responsible for the action. It can take one of the following values: seller | buyer | mediator.
- **title:** Title detailing the status of the claim.
- **description:** Detailed description of the current status of the claim.
- **problem:** Problem that prompted the claim.

## Customize claim search

The claim search provides you with a comprehensive view of all claims associated with a specific seller. This tool is essential for efficiently monitoring and managing reported incidents.

### Parameters:

A claim can be retrieved by performing a search in the claims system using various parameters. The available search parameters are as follows:

Query params Type Values Value Details date\_created date (yyyy-MM-dd'T'HH:mm:ss.SS SZ) Claim creation date. Example: 2018-05-01T00:00:00.000-0400 id Long {claimId} Claim ID last\_updated date (yyyy-MM-dd'T'HH:mm:ss.SS SZ) Last claim update. Example: 2018-05-01T00:00:00.000-0400 order\_id Long {orderId} Claim whose resource may or may not be an order, but said resource is related to the order of the entered order\_id. player\_role String {userId} Role in the claim {complainant - Person who makes the claim, respondent - person against whom the claim is made, mediator - person who intervenes to help resolve the issue.} player\_user\_id String {userId} ID of the user involved in the claim reason\_id Long {reasonId} Reason/motive for which the claim was created {PNR: Product Not Received; PDD: Wrong or Defective Product; CS: Canceled Purchase} resource String shipment, payment, order, purchase Resource on which the claim was created resource\_id Long {ID del recurso} ID of the resource on which the claim was created site\_id String {enabledSites} ID of the site where the claim is being processed stage String claim, dispute, recontact, stale, none Stage of the claim status String mediations, returns, ml\_case, cancel\_sale, cancel\_purchase, fulfillment, change Type of claim

Note:

With the claim search resource, you can apply certain filters to obtain more specific results based on the required fields detailed above.

It is also possible to search by **pack\_id** and **order\_id**, you will retrieve all claims indirectly related to the entered ID. For example, when entering a **pack\_id**, the search will return all claims linked to that pack through its orders, shipments, and payments. Similarly, when searching by **order\_id**all claims associated with that specific order will be displayed. This capability allows you to manage and resolve incidents more effectively.

**Request:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' 
https://api.mercadolibre.com/marketplace/v2/claims/search?status=opened&user_id=$USER_ID
```

**Example:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' 
https://api.mercadolibre.com/marketplace/v2/claims/search?status=opened&user_id=1317418851
```

**Response:**

```javascript
{
 {
   "paging": {
       "total": 4,
       "offset": 0,
       "limit": 30
   },
   "data": [
       {
           "id": 5298903643,
           "resource_id": 2000009256002260,
           "status": "opened",
           "type": "mediations",
           "stage": "dispute",
           "parent_id": null,
           "resource": "order",
           "reason_id": "PDD9939",
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
               }
           ],
           "resolution": null,
           "site_id": "MLM",
           "date_created": "2024-09-09T18:18:38.000-04:00",
           "last_updated": "2024-09-09T19:00:12.000-04:00"
       },
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
               }
           ],
           "resolution": null,
           "site_id": "MLM",
           "date_created": "2024-08-22T18:45:22.000-04:00",
           "last_updated": "2024-08-22T18:49:44.000-04:00"
       }
       ...
   ]
}
```

Note:

1\. Claim Typification: Each claim typification is associated with a specific set of reasons. To obtain details about the reason a claim was initiated, it is necessary to consult the reasons API.

2\. **Roles within the Claim**: The roles of the players are strictly defined and cannot vary. The player *mediator* intervenes in the claim only when it is in the dispute or recontact stages. Each player can have a list of actions, but within the claim process, only one player has the mandatory action throughout the entire process.

To continue improving claim search options, we provide additional parameters that can help enhance search efficiency.

### Params:

Query params Type Values Detail Value offset Integer Level of offset in the dataset resulting from the search limit Integer Limit on the number of results you want the search to return. By default, 30 results are returned, with a maximum of 100 results sort String field: date\_asc, date\_desc, cualquier campo del reclamo Sorting of search results range (field) :after: "yyyy-MM-dd'T'HH:mm:ss.SSZ" before: "yyyy-MM-dd'T'HH:mm:ss.SSZ" String field: Any date range for claim search Search within/by date range

**Request:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/v2/claims/search?status=opened&stage=dispute&sort=last_updated:asc
```

**Example:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/v2/claims/search?status=opened&stage=dispute&sort=last_updated:asc&user_id=1317418851
```

**Response:**

```javascript
{
   "paging": {
       "total": 4,
       "offset": 0,
       "limit": 30
   },
   "data": [
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
               }
           ],
           "resolution": null,
           "site_id": "MLM",
           "date_created": "2024-08-22T18:45:22.000-04:00",
           "last_updated": "2024-08-22T18:49:44.000-04:00"
       },
       {
           "id": 5294877244,
           "resource_id": 2000009106972774,
           "status": "opened",
           "type": "mediations",
           "stage": "dispute",
           "parent_id": null,
           "resource": "order",
           "reason_id": "PDD9953",
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
               }
           ],
           "resolution": null,
           "site_id": "MLM",
           "date_created": "2024-08-23T16:13:04.000-04:00",
           "last_updated": "2024-08-28T23:42:28.000-04:00"
       },
       {
           "id": 5298903643,
           "resource_id": 2000009256002260,
           "status": "opened",
           "type": "mediations",
           "stage": "dispute",
           "parent_id": null,
           "resource": "order",
           "reason_id": "PDD9939",
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
               }
           ],
           "resolution": null,
           "site_id": "MLM",
           "date_created": "2024-09-09T18:18:38.000-04:00",
           "last_updated": "2024-09-09T19:00:12.000-04:00"
       },
       {
           "id": 5298020007,
           "resource_id": 2000009106924564,
           "status": "opened",
           "type": "mediations",
           "stage": "dispute",
           "parent_id": null,
           "resource": "order",
           "reason_id": "PDD9939",
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
               }
           ],
           "resolution": null,
           "site_id": "MLM",
           "date_created": "2024-09-05T19:05:09.000-04:00",
           "last_updated": "2024-09-10T23:42:18.000-04:00"
       }
   ]
}
```

## Get details on the reason of the claim

To obtain details about the reason for initiating a claim, the /claims/reasons/$REASON\_ID resource should be consulted. This access provides detailed information and allows the use of specific parameters for more effective searches.

### Params:

Query params Type Values Value Details flow string cancel\_sale, distant\_agencies, fulfillment\_delivered, fulfillment\_undelivered, label\_unavailable, mediations, mediations\_delivered, mediations\_undelivered, no\_shipping\_options, reservation, returns, unification\_delivered To obtain PDD or PNR reasons delivered string true, false Allows you to validate if the product has already been delivered and it's a PDD claim, or if it hasn't been delivered (PNR: paid but not received) deep boolean true, false It allows you to retrieve the dependency tree for the queried reason. name string wrong\_shipment\_cost, wrong\_seller\_address, wrong\_buyer\_address, unavailable\_pick\_up, unknown\_buyer, unknown\_seller, unknown\_shipment\_policy, unavailable\_incorrect\_shipping, shipment\_type\_not\_allowed\_daft, unavailable\_correct\_shipping, unavailable\_product, unavailable\_payment\_method, unavailable\_buyer\_item\_report, alignment\_prices\_taxes, alignment\_discounts, safe\_review, safety\_notifications, seller\_rate\_modification, unauthorized\_transference, seller\_address\_not\_allowed, return\_request\_return, represent\_buyer\_claim, represent\_buyer\_dispute, alignment\_packaging, improper\_tracking, improper\_package\_weight, payment\_method\_fraud, no\_agreed\_delivery, not\_expected\_quality\_offer, not\_expected\_quality\_item, wrong\_warranty, misleading\_promotion, returned\_service, finished\_return\_automatic, finished\_return\_with\_request, return\_claim\_not\_accept, return\_claim\_accept, return\_claim\_cancel, return\_claim\_item\_restock, return\_claim\_item\_refurbished, return\_claim\_item\_lost, wrong\_pack\_service, wrong\_pack\_service\_transport, buyer\_return\_pack\_service, seller\_return\_pack\_service, wrong\_pack\_service\_provider, wrong\_pack\_service\_time, wrong\_pack\_service\_repack, wrong\_pack\_service\_delivery, buyer\_dispute\_delivery, buyer\_dispute\_delivery\_not\_show, buyer\_dispute\_delivery\_not\_contact, buyer\_dispute\_delivery\_not\_receive, buyer\_dispute\_delivery\_no\_show, buyer\_dispute\_delivery\_no\_call, wrong\_pack\_service\_failed, buyer\_dispute\_buyer\_claim\_delivery, delivery\_wrong\_seller, delivery\_wrong\_buyer, delivery\_same\_state, delivery\_same\_city, delivery\_same\_zip\_code, delivery\_wrong\_shipping, delivery\_lost, delivery\_damaged, delivery\_delayed, delivery\_wrong\_address, delivery\_wrong\_city, delivery\_wrong\_state, delivery\_wrong\_zip\_code, delivery\_wrong\_country, delivery\_wrong\_date, delivery\_wrong\_time, delivery\_wrong\_shipping\_service, delivery\_wrong\_pack\_service, wrong\_pack\_service\_full, wrong\_pack\_service\_partial, wrong\_pack\_service\_product\_wrong, wrong\_pack\_service\_product\_changed, wrong\_pack\_service\_restock, wrong\_pack\_service\_no\_restock, wrong\_pack\_service\_refurbished, wrong\_pack\_service\_lost, wrong\_pack\_service\_failed, wrong\_pack\_service\_provider, wrong\_pack\_service\_time, wrong\_pack\_service\_repack, buyer\_dispute\_buyer\_claim\_delivery

Note:

If you wish to understand the reason for the order cancellation, please refer to the **"cancel\_details"** field in the [orders API.](https://global-selling.mercadolibre.com/devsite/manage-sales-global-selling#Get-an-order-detail) Additionally, if you want to understand what happened with the product shipment, check the delivery details in the **"substatus"** field within the [shipments API](https://global-selling.mercadolibre.com/devsite/manage-shipments#Receive-a-shipment) to get the context.

**Request:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/v2/claims/reasons/$REASON_ID
```

**Example:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/v2/claims/reasons/PNR9502
```

**Response:**

```javascript
{
   "id": "PNR9502",
   "flow": "mediations_undelivered",
   "name": "respondent_unanswered",
   "detail": "El vendedor no me respondió",
   "position": 200,
   "filter": {
       "group": null,
       "site_id": [
           "MLC",
           "MCO",
           "MLU",
           "MPE",
           "MLM",
           "MLA",
           "MLB",
           "CBT",
           "MEC",
           "MPA",
           "MBO",
           "MCR",
           "MGT",
           "MLV",
           "MNI",
           "MCU",
           "MHN",
           "MPY",
           "MRD",
           "MSV",
           "MPT"
       ]
   },
   "settings": {
       "allowed_flows": [],
       "expected_resolutions": [
           "refund",
           "product"
       ],
       "rules_engine_triage": []
   },
   "parent_id": null,
   "children_title": null,
   "status": "active",
   "date_created": "2022-08-02T20:12:53.522-04:00",
   "last_updated": "2024-10-02T23:02:32.31-04:00"
}
```

### Response fields

The response to a GET request on the /claims/reasons/$REASON\_ID resource will provide the following parameters:

- **id:** Claim ID
- **flow:** Claim Flow
- **name:** Name of the reason
- **detail:** Detail of the reason
- **position:** Functions as sort\_by but by default. Without sort\_by, the system sorts the reasons by ascending position.
- **group:** The group indicates the item's vertical. It can take one of the following values:
  
  - generic
  - fashion
  - installable\_autoparts
  - expiring\_food
  - expiring\_health
- **site\_id:** ID of the site where the claim is processed
- **settings:** Can take one of the following values:
  
  - **allowed\_flows:** Indicates in which flows this reason can be viewed
  - **expected\_resolutions:** Possible resolutions expected by the claimant
    
    - product
    - refund
    - other
  - **rules\_engine\_triage:** This item defines the tag for triage categorization, with values such as:
    
    - repentant
    - defective
    - incomplete
    - different
    - not\_working
- **parent\_id:** Parent reason.
- **children\_title:** This value is used for post-purchase typing, assigning the title to child reasons of those containing this attribute. Only reasons have this attribute.
- **status:** Status of the reason.
- **date\_created:** Date the reason was created.
- **last\_updated:** Date of the last update to the reason.

## Claim action history

The action history of a claim details the actions taken, who executed them, and when, allowing a precise and strategic tracking of the process.

**Request:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/v2/claims/$CLAIM_ID/actions-history
```

**Example:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/v2/claims/5294289551/actions-history
```

**Response:**

```javascript
[
   {
       "action_name": "close_claim",
       "player_role": "mediator",
       "action_reason_id": null,
       "claim_stage": "claim",
       "claim_status": "opened",
       "date_created": "2024-08-21T19:11:46.000-04:00"
   },
   {
       "action_name": "refund",
       "player_role": "respondent",
       "action_reason_id": null,
       "claim_stage": "claim",
       "claim_status": "opened",
       "date_created": "2024-08-21T19:11:45.000-04:00"
   },
   {
       "action_name": "send_message_to_respondent",
       "player_role": "complainant",
       "action_reason_id": null,
       "claim_stage": "claim",
       "claim_status": "opened",
       "date_created": "2024-08-21T18:41:19.000-04:00"
   },
   {
       "action_name": "open_claim",
       "player_role": "complainant",
       "action_reason_id": null,
       "claim_stage": null,
       "claim_status": null,
       "date_created": "2024-08-21T13:47:31.000-04:00"
   }
]
```

### Response fields:

The response to a GET request on the /claims/actions-history resource will provide the following parameters:

- **action\_name:** Name of the action performed.
- **player\_role:** Player who performed the action.
- **action\_reason\_id:** ID of the action performed.
- **claim\_stage:** Stage in which the action was performed.
- **claim\_status:** Status of the stage in which the action was performed.
- **date\_created:** Date the action was performed.

## Claim status history

The claim status history provides information about the stage and status of the claim at the time of each action, enabling precise and strategic tracking of the process.

**Request:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/v2/claims/$CLAIM_ID/status-history
```

**Example:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/v2/claims/5294289551/status-history
```

**Response:**

```javascript
[
   {
       "stage": "claim",
       "status": "closed",
       "date": "2024-08-21T19:11:46.000-04:00",
       "change_by": "mediator"
   },
   {
       "stage": "claim",
       "status": "opened",
       "date": "2024-08-21T13:47:31.000-04:00",
       "change_by": "complainant"
   }
]
```

## How to identify if a claim affects reputation

The /affects-reputation resource provides integrators with the ability to determine whether a specific complaint impacts the seller's reputation by executing the corresponding call

**Request:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/v2/claims/$CLAIM_ID/affects-reputation
```

**Example:**

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/v2/claims/5298903643/affects-reputation
```

**Response:**

```javascript
{
    "affects_reputation": "not_affected",
    "has_incentive": false,
    "due_date": null
}
```

### Response fields

The GET response to the /claims/affects-reputation resource will provide the following parameters:

- **affects\_reputation:** Inform if the complaint affects the seller's reputation. It can take any of the following values:
  
  - **affected:** Affects reputation.
  - **not\_affected:** Does not affect reputation.
  - **not\_applies:** Payments not linked to marketplace orders.
- **has\_incentive:** When this field returns true, if the seller responds satisfactorily within the first 48 hours, it will not affect their reputation. If false, the seller still has the same 48 hours, but we do not guarantee that the seller's reputation will not be affected
- **due\_date:** Deadline to resolve the claim

## Related topics

- [Claims messages](https://global-selling.mercadolibre.com/devsite/manage-claims-messages) - Send and receive messages within claims, upload and download attachments
- [Claim resolutions](https://global-selling.mercadolibre.com/devsite/manage-claim-resolutions) - Resolve claims with refunds, returns, or disputes

**Next:** [Post-sale messages](https://global-selling.mercadolibre.com/devsite/what-is-post-sale-messages)