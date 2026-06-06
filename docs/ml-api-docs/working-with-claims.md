# Claims

**Tags:** Working,with,claims,Working with claims
**Created:** 2018-06-27T12:01:33Z
**Last Updated:** 2024-05-06T09:58:49Z

---

## Claims

Important:

Starting May 6, 2024, all resources for claims at https://api.mercadolibre.com/v1/claims/ will be deprecated and you will only be able to access the information by calling https://api.mercadolibre.com/post-purchase/v1/claims/.

We invite you to modify your integration to continue working with claims as usual.  
Both resources will coexist starting March 21, 2024.

The resource /claims will help you get the claim details and start actions via API to settle them properly by adding this feature to your integration.

## Receive a notification

In [My applications](https://global-selling.mercadolibre.com/devcenter), edit your application and [activate the marketplace claims topic](https://global-selling.mercadolibre.com/devsite/receive-notifications#Subscribe-to-notifications) in our feed to inform you whenever a claim has been initiated or receive any interaction. Learn more about [claim notifications](https://global-selling.mercadolibre.com/devsite/receive-notifications#marketplace-claims).

## Claims search

The search for claims will help you know which ones belong to the user of a valid token.

Llamada:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/post-purchase/v1/claims/search?stage=dispute
```

Response:

```javascript
{
    "paging": {
        "offset": 0,
        "limit": 30,
        "total": 170
    },
    "data": [
        {
            "id": 2342342432,
            "type": "mediations",
            "stage": "dispute",
            "status": "closed",
            "parent_id": null,
            "client_id": null,
            "resource_id": 234342342,
            "resource": "order",
            "reason_id": "PDD316",
            "quantity_type": "total",
            "players": [
                {
                    "role": "complainant",
                    "type": "buyer",
                    "user_id": 44234343,
                    "available_actions": [
                        {
                            "action": "recontact",
                            "due_date": "2018-09-29T07:37:16.656-04:00",
                            "mandatory": null
                        }
                    ]
                },
                {
                    "role": "respondent",
                    "type": "seller",
                    "user_id": 2343424,
                    "available_actions": [
                        {
                            "action": "recontact",
                            "due_date": "2018-09-29T07:37:16.656-04:00",
                            "mandatory": null
                        }
                    ]
                },
                {
                    "role": "mediator",
                    "type": "internal",
                    "user_id": 432434324,
                    "available_actions": []
                }
            ],
            "resolution": {
                "reason": "payment_refunded",
                "date_created": "2018-08-30T07:37:16.656-04:00",
                "benefited": [
                    "complainant"
                ],
                "closed_by": "mediator"
            },
            "labels": [],
            "site_id": "MLM",
            "date_created": "2018-08-25T15:57:55.588-04:00",
            "last_updated": "2018-08-30T07:37:16.839-04:00"
        } 
]}
```

Nota:

The "quantity\_type" field will initially only display the value "total" and in the future the value "partial" will be displayed. Indicates whether a return corresponds to all products in the order or only some of them.

## How to filter?

The availables parameters to filters are:  
\- **id**  
\- **type**  
\- **stage**  
\- **status**  
\- **resource**: order, shipment, payment or purchase.  
\- **resource\_id**: it is the resource id where the claim is created and should use with the previous parameter.  
\- **reason\_id**  
\- **site\_id**  
\- **players.role**: complainant or respondent.  
\- **players.user\_id**: is related to the previous parameter.  
\- **parent\_id**  
\- **date\_created**  
\- **order\_id**  
\- **last\_updated**

For example, if you want to filter by stage and status:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/post-purchase/v1/claims/search?stage=dispute&status=opened
```

For example to, if you want to filter by date:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/post-purchase/v1/claims/search?stage=dispute&status=opened&range=date_created:after:2020-09-26T14:52:14.000-04:00,before:2020-09-27T14:52:14.000-04:00&sort:desc
```

## How to sort?

To sort the results just add the sort parameter with the respective field that you want and if the order must be ascending or decreasing (&amp;sort=:asc|desc). For example, to sort by update date:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/post-purchase/v1/claims/search?stage=dispute&status=opened&sort=last_updated:asc
```

## Parameters description

The response to a resource **/claims** GET results in the following parameters:

- **id**: Claim ID
- **type**: Type of claim. It may take one of the following values:
  
  - mediations: Claim between buyer and seller
  - cancel\_purchase: Purchase cancelled by buyer
  - return: Product return. In this case, there are no messages. To process returns, follow the documentation [Work with returns](https://developers.mercadolibre.com.ar/en_us/ml-returns).
  - cancel\_sale: Cancellation of purchase by the seller.  
    The status always would be "**closed**".  
    The stage always would be"**none**".  
    The complainant role will always be the type seller, collector or sender depending on the resource.

<!--THE END-->

- **stage**: Claim stage. It may take one of the following values:
  
  - claim: Claim stage involving both buyer and seller
  - dispute: Mediation stage involving a representative of Mercado Libre.
  - recontact: Stage in which one of the parties contacts the other after the claim/dispute is settled.
  - none: Not applicable.

<!--THE END-->

- **status**: Claim status. It may take two values: opened and closed.
- **parent\_id**: ID of a parent claim
- **resource**: Identifier of the resource on which the claim is created. It may be:
  
  - payment
  - order
  - shipment
  - purchase

<!--THE END-->

- **resource\_id**: ID of the resource on which the claim is created, depending on the above parameter.
- **players**: List of players involved in the claim with their relevant actions and available times.
  
  - **role**: Role within the claim. It may be:  
    complainant: person who starts the claim.  
    respondent: person the claim is filed against.  
    mediator: Person who intervenes to help solve the problem
  - **type**: Role filled by the person regarding the claimed transaction.
    
    It may vary according to the resource.
    
    - Payment: buyer or collector.
    - Order: buyer or seller.
    - Shipment: receptor o remitente.
  - **user\_id**: Type ID of the above parameter.
  - **available\_actions**: List of actions that the involved parties may take action:
  - **action**: possible actions to be performed. For the seller they will be:
    
    *send\_message\_to\_complainant*: [send message to the buyer](https://developers.mercadolibre.com.ar/en_us/working-with-claims?nocache=true#Answer-and-attach-files-to-messages) (with or without attachments).  
    *send\_message\_to\_mediator*: [send message to the mediator](https://developers.mercadolibre.com.ar/en_us/working-with-claims?nocache=true#Answer-and-attach-files-to-messages) (with or without attachments).  
    *recontact*: reopen an already closed claim, through an interaction like a message.  
    *refund*: return the money purchased. It must be done by the front of Mercado Libre or Mercado Pago.  
    *open\_dispute*: [start a mediation](https://developers.mercadolibre.com.ar/es_ar/trabajar-con-reclamos?nocache=true#Solicitar-mediacion).  
    *send\_potential\_shipping*: [send a post promise, a date](https://developers.mercadolibre.com.ar/en_us/working-with-claims?nocache=true#Request-mediation).  
    *add\_shipping\_evidence*: [post an evidence that the product was sent](https://developers.mercadolibre.com.ar/en_us/working-with-claims?nocache=true#Request-mediation).  
    *send\_attachments*: [send message with attachments](https://developers.mercadolibre.com.ar/en_us/working-with-claims?nocache=true#Attachment-post).  
    *allow\_return\_label*: [generate return label](https://developers.mercadolibre.com.ar/en_us/working-with-claims?nocache=true#See-participants-expected-resolutions).  
    *allow\_return*: [generate return label](https://developers.mercadolibre.com.ar/en_us/working-with-claims?nocache=true#See-participants-expected-resolutions).  
    *send\_tracking\_number*: send the tracking number.
    
    - **due\_date**: time limit to perform the action.
    - **mandatory**: this field in true indicates that the action is mandatory and must be performed within the reported time.
  - resolution: Form of claim resolution.
  - labels: Claim labels, e.g., a label that shows whether the claim affects reputation or not.
  - site\_id: ID of the site on which the claim is conducted.
  - date\_created: Claim creation date.
  - last\_updated: Time when the claim was last updated.
  
  The response to a resource /claim message GET results in a list with the following parameters:
  
  - **sender\_role**: Player who sent the message
  - **receiver\_role**: Player who will receive the message
  - **attachments**: List of message attachments
  
  filename: Named hashed attached file.  
  original\_filename: Actual name of the attachments.  
  size: File size in Bytes.  
  type: File type.  
  date\_created: Date when the attachments was uploaded.
  
  - change: product change. Indicates that a product change is to be made.
  - **stage**: Stage in which the message was sent.
  - **date\_created**: Date when the message was sent.
  - **date\_read**: This value will be null until a new resource version is available.
  - **message**: Message text.
  
  ## Using resources - Step by step
  
  ## See message details
  
  Request:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}”
  ```
  
  Example:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/950700111”
  ```
  
  Response:
  
  ```javascript
  {
      "id": 950700111,
      "type": "mediations",
      "stage": "claim",
      "status": "closed",
      "parent_id": null,
      "client_id": null,
      "resource_id": 1656223086,
      "resource": "order",
      "reason_id": "PDD-0",
      "quantity_type": "total",
      "players": [
          {
              "role": "complainant",
              "type": "buyer",
              "user_id": 271942703,
              "available_actions": [
                  {
                      "action": "recontact",
                      "due_date": "2018-04-07T10:35:29.000-0400",
                      "mandatory": false
                  }
              ]
          },
          {
              "role": "respondent",
              "type": "seller",
              "user_id": 271959653,
              "available_actions": [
                  {
                      "action": "recontact",
                      "due_date": "2018-04-07T10:35:29.000-0400",
                      "mandatory": false
                  }
              ]
          }
      ],
      "resolution": {
          "reason": "item_returned",
          "date_created": "2018-03-08T10:35:29.269-0400",
          "decision": [
              "complainant",
              "respondent"
          ],
          "closed_by": "mediator"
      },
      "coverages": [
          {
              "type": "bpp",
              "benefited": "complainant",
              "amount": 194.99,
              "resource": "bpp",
              "resource_id": 224635193,
              "date_created": "2018-03-08T10:35:30.000-0400",
              "costs": [
                  {
                      "role": "respondent",
                      "amount": 194.99,
                      "date_created": "2018-03-08T10:35:30.000-0400"
                  }
              ]
          },
          {
              "type": "return_label",
              "benefited": "complainant",
              "amount": 144.99,
              "resource": "bpp",
              "resource_id": 224635218,
              "date_created": "2018-03-08T10:38:28.000-0400",
              "costs": [
                  {
                      "role": "mediator",
                      "amount": 144.99,
                      "date_created": "2018-03-08T10:38:28.000-0400"
                  },
                  {
                      "role": "respondent",
                      "amount": 0,
                      "date_created": "2018-03-08T10:38:28.000-0400"
                  }
              ]
          }
      ],
      "labels": [
          {
              "name": "reputation",
              "value": "avoid",
              "comments": null,
              "admin_id": null,
              "date_created": "2018-03-08T09:56:00.078-0400"
          },
          {
              "name": null,
              "value": null,
              "comments": null,
              "admin_id": null,
              "date_created": "2018-03-08T09:56:00.078-0400"
          },
          {
              "name": null,
              "value": null,
              "comments": null,
              "admin_id": null,
              "date_created": "2018-03-08T09:56:00.078-0400"
          },
          {
              "name": "return_label",
              "value": "charged",
              "comments": null,
              "admin_id": null,
              "date_created": "2018-03-08T09:56:00.078-0400"
          }
      ],
      "site_id": "MLA",
      "date_created": "2018-03-08T09:56:00.078-0400",
      "last_updated": "2018-03-08T10:38:27.999-0400"
  }
  ```
  
  ## Get all the messages of a claim
  
  Request:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/messages”
  ```
  
  Example:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' "https://api.mercadolibre.com/post-purchase/v1/claims/950463475/messages"
  ```
  
  Response:
  
  ```javascript
  [
      {
          "sender_role": "respondent",
          "receiver_role": "complainant",
          "attachments": [
              {
                  "filename": "fa8d559e-b6c9-4a9d-9824-aba4607bd869_271959653.jpg",
                  "original_filename": "camiseta promocional 6555 rosa.jpg",
                  "size": 5434,
                  "type": "image/jpeg",
                  "date_created": "2018-03-08T16:59:25.936-0400"
              }
          ],
          "stage": "claim",
          "date_created": "2018-03-08T16:59:25.936-0400",
          "message": "Este es un mensaje de test del respondant al complainant",
      },
      {
          "sender_role": "complainant",
          "receiver_role": "respondent",
          "attachments": [],
          "stage": "claim",
          "date_created": "2018-03-08T10:40:02.602-0400",
          "message": "Test pdd ",
      }
  ]
  ```
  
  ## Answer, and attach files to messages
  
  ## Attachment post
  
  Request:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' "https://api.mercadolibre.com/post-purchase/v1/claims/$CLAIM_ID/attachments" -F file=$FILE_PATH
  ```
  
  Notes:
  
  \- The POST should be made as form.data with file = file location.  
  \- The file needs to have a maximum 5 MB size.  
  \- You can exchange pictures, instruction manuals, invoices, and any other attachments of up to 5 MB in JPG, PNG, PDF and TXT format.
  
  Example:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' "https://api.mercadolibre.com/post-purchase/v1/claims/950463475/attachments" -H 'content-type: multipart/form-data;  -F 'file=@/Users/user/Desktop/file.jpg'
  ```
  
  Response:
  
  ```javascript
  {
      "user_id": 271959653,
      "file_name": "fa8d559e-b6c9-4a9d-9824-aba4607bd869_271959653.jpg",
     }
  ```
  
  ## Message post with the above attachment
  
  Request:
  
  ```javascript
  curl -X POST "https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/actions/message?access_token=$ACCESS_TOKEN&application_id=$APPLICATION_ID"
  ```
  
  Note:
  
  the attachment list will display all the attachments retrieved in the previous POST and associated to the message, separated by comma.
  
  Example:
  
  ```javascript
  curl -X POST "https://api.mercadolibre.com/post-purchase/v1/claims/950463475/actions/message?access_token=$ACCESS_TOKEN&application_id=$APPLICATION_ID" -H 'Content-Type: application/json'  \
   -d '{ \
    "receiver_role": "complainant", \
    "message": "Este es un mensaje de test del respondent al complainant", \
    "attachments": [ \
      "fa8d559e-b6c9-4a9d-9824-aba4607bd869_271959653.jpg" \
    ] \
  }'
  ```
  
  Response:
  
  ```javascript
  {"id":1817133310}
  ```
  
  ## Send messages without attachments
  
  Request:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/messages”
  ```
  
  Example:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/950463475/messages” -H 'Content-Type: application/json'  \
   -d '{ \
    "receiver_role": "complainant", \
    "message": "Este es un mensaje de test del respondent al complainant", \
  }'
  ```
  
  Response:
  
  ```javascript
  {
    "execution_response": {
        "id": 0
    },
  "new_state": {
    "name": "pdd_opened",
    "modifiers": {
        "send_message_turn":"complainant",
        "optional_refund": "denied",
        "partial_refund": "denied",
        "return_condition": "allowable"
    }
  }
  }
  ```
  
  ## Download the file
  
  Request:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' "https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/attachments/{attach_id}/download"
  ```
  
  Example:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' "https://api.mercadolibre.com/post-purchase/v1/claims/1022718940/attachments/0f2d81a2-c489-435e-96af-59688ad3d8f4_305860144.jpeg/download"
  ```
  
  Response: the attachtments picture.
  
  ## Get file's information
  
  Request:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' "https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/attachments/{attach_id}"
  ```
  
  Example:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' "https://api.mercadolibre.com/post-purchase/v1/claims/1022718940/attachments/0f2d81a2-c489-435e-96af-59688ad3d8f4_305860144.jpeg"
  ```
  
  Response:
  
  ```javascript
  {
      "filename": "0f2d81a2-c489-435e-96af-59688ad3d8f4_305860144.jpeg",
      "original_filename": "casa.jpeg",
      "size": 10080,
      "date_created": "2018-07-30T12:25:18.133-04:00",
      "type": "image/jpeg"
  }
  ```
  
  ## Request mediation
  
  Request:
  
  ```javascript
  curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}”
  ```
  
  Example:
  
  ```javascript
  curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/950463475”  -H 'Content-Type: application/json' -d '{"stage":"dispute"}'
  ```
  
  Response:
  
  ```javascript
  {
      "id": 950463475,
      "type": "mediations",
      "stage": "dispute",
      "status": "opened",
      "parent_id": null,
      "client_id": null,
      "resource_id": 1656273684,
      "resource": "order",
      "reason_id": "PDD-0",
      "players": [
          {
              "role": "complainant",
              "type": "buyer",
              "id": 271942703,
              "available_actions": []
          }
      ],
      "resolution": null,
      "coverages": [],
      "labels": [
          {
              "name": null,
              "value": null,
              "comments": null,
              "admin_id": null,
              "date_created": "2018-03-08T10:40:02.390-0400"
          },
          {
              "name": null,
              "value": null,
              "comments": null,
              "admin_id": null,
              "date_created": "2018-03-08T10:40:02.390-0400"
          }
      ],
      "site_id": "MLA",
      "date_created": "2018-03-08T10:40:02.390-0400",
      "last_updated": "2018-03-12T09:17:56.844-0400"
  }
  ```
  
  Once mediation has begun, messages cannot be sent to the buyer. All communication will be made by Mercado Libre. For this, it is necessary to change the receiver\_role to mediator.
  
  Request:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' "https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/messages"
  ```
  
  Example:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' 'https://api.mercadolibre.com/post-purchase/v1/claims/1036274835/messages'  -H 'Content-Type: application/json' -d '{"receiver_role": "mediator", "message": "Teste de resposta"}'
  ```
  
  Response:
  
  ```javascript
  {"id": 1914089028}
  ```
  
  ## See participants expected resolutions
  
  Request:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/expected_resolutions”
  ```
  
  Example:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/950463475/expected_resolutions”
  ```
  
  Response:
  
  ```javascript
  [
      {
          "player_role": "complainant",
          "user_id": 271942703,
          "expected_resolution": "return",
          "date_created": "2018-03-08T11:40:02.489-0300",
          "last_updated": "2018-03-08T11:40:02.489-0300",
          "status": "pending"
      }
  ]
  ```
  
  ## Parameters description
  
  - player\_role: claim player role
  - user\_id: claim player ID
  - expected\_resolution: claim resolution loaded by the player specified in the above parameter. Possible values are:  
     - refund: the player expects a money refund  
     - product: the player expects to receive the product  
     - change\_product: the player expects to change the product  
     - return\_product: the player expects to have the product returned with the subsequent money refund
  - date\_created: expected resolution creation date
  - date\_created: time when the expected resolution was last updated
  - status: expected resolution status. It may take one of the following values:  
     - pending: the player loaded the expected resolution, but its counterparty has not accepted it yet  
     - accepted: the resolution loaded by the player was accepted by its counterparty or, otherwise, by Mercado Libre's mediator  
     - rejected: the resolution loaded by the player was rejected by its counterparty or, otherwise, a new resolution alternative was loaded
  
  Notes:
  
  Regardless of the resolutions loaded by the parties involved, in certain cases the final resolution is defined by a representative of Mercado Libre, if the parties fail to come to an agreement.
  
  ## Partial refund
  
  The partial refund flow is linked to the buyer's claim process, where depending on the actions available to the seller, it is possible to offer a solution to the claim by refunding part of the money paid for the purchase.
  
  That is why it is necessary that the array available\_actions, one of the actions is allow\_partial\_refund, as shown in the following example:
  
  ```javascript
  {
      "id": 123,
      "type": "mediations",
      "stage": "claim",
      "status": "opened",
      "parent_id": null,
      "client_id": null,
      "resource_id": 123,
      "resource": "order",
      "reason_id": "PDD9551",
      "fulfilled": true,
      "players":
      [
          {
              "role": "complainant",
              "type": "buyer",
              "user_id": 123,
              "available_actions":
              []
          },
          {
              "role": "respondent",
              "type": "seller",
              "user_id": 123,
              "available_actions":
              [
                  {
                      "action": "send_message_to_complainant",
                      "due_date": "2023-01-27T22:43:59.000-04:00",
                      "mandatory": true
                  },
                  {
                      "action": "refund",
                      "due_date": null,
                      "mandatory": false
                  },
                  {
                      "action": "allow_partial_refund",
                      "due_date": null,
                      "mandatory": false
                  }
              ]
          }
      ],
      "resolution": null,
      "labels": null,
      "site_id": "MLB",
      "date_created": "2023-01-23T09:59:05.000-04:00",
      "last_updated": "2023-01-23T11:18:01.000-04:00"
  }
  ```
  
  ## Offer partial refund
  
  To offer a partial refund, the claim must be PDD with **expected\_resolution: return\_product** and **status pending**.
  
  ## Calculate partial return value
  
  Check the available refund percentages and how much refund value are used on the following resource.
  
  Request:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Content-Type: application/json' https://api.mercadolibre.com/post-purchase/v1/claims/$claim_id/partial-refund/available-offers
  ```
  
  Example:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Content-Type: application/json' https://api.mercadolibre.com/post-purchase/v1/claims/5224172034/partial-refund/available-offers
  ```
  
  Response:
  
  ```javascript
  {
       "currency_id": "USD"
      "available_offers":
      [
          {
              "amount": 90.0,
              "percentage": 90
          },
          {
              "amount": 80.0,
              "percentage": 80
          },
          {
              "amount": 70.0,
              "percentage": 70
          },
          {
              "amount": 60.0,
              "percentage": 60
          },
          {
              "amount": 50.0,
              "percentage": 50
          },
          {
              "amount": 40.0,
              "percentage": 40
          },
          {
              "amount": 30.0,
              "percentage": 30
          },
          {
              "amount": 20.0,
              "percentage": 20
          }
      ]
  }
  ```
  
  ### Response fields:
  
  - **currency\_id**: currency.
  - **amount**: return value.
  - **percentage**: percent return representing the value (amount).
  
  Choose the percentage for the refund: **if you do not send a refund percentage**, default\_percentege = 50 will be assigned by default.
  
  Note:
  
  When you offer partial refund, the **expected\_resolution** field that was on the seller's side **player\_role: complainant** will be rejected and **expected\_resolution=partial\_refund** will be created, where the status will be **pending** and the response will be on the buyer's side (**player\_role: respondent**).
  
  Request:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/post-purchase/v1/claims/$CLAIM_ID/expected_resolutions
  ```
  
  Example:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/post-purchase/v1/claims/5224158283/expected_resolutions - d 
  {
    "expected_resolution": "allow_partial_refund",
    "detail": {
      "key": "percentage",
      "value": "50.0"
    }
  }
  ```
  
  Response:
  
  ```javascript
  [
      {
          "player_role": "complainant",
          "user_id": 710928120,
          "expected_resolution": "return_product",
          "detail": [],
          "date_created": "2022-11-04T12:23:44.000-05:00",
          "last_updated": "2022-11-04T12:23:44.000-05:00",
          "status": "rejected"
      },
      {
          "player_role": "respondent",
          "user_id": 823876519,
          "expected_resolution": "partial_refund",
          "detail": [
              {
                  "key": "percentage",
                  "value": "50.0"
              },
              {
                  "key": "seller_amount",
                  "value": "114.52"
              },
              {
                  "key": "seller_currency",
                  "value": "R$"
              }
          ],
          "date_created": "2022-11-04T12:43:06.000-05:00",
          "last_updated": "2022-11-04T12:43:06.000-05:00",
          "status": "pending"
      }
  ]
  ```
  
  If you send a value other than those allowed, you will receive this response:
  
  ```javascript
  {
      "message": "Percentage not found 35.0",
      "error": "error checking configuration percentage",
      "status": 400,
      "cause": []
  }
  ```
  
  If the seller has not enabled partial reimbursement, this will be the case:
  
  ```javascript
  {
      "message": "Action allow_partial_refund not available for player",
      "error": "bad_request",
      "status": 400,
      "cause": []
  }
  ```
  
  - **If the partial refund is accepted by the buyer**, the claim will be closed and the buyer will be refunded the money corresponding to the percentage offered.
  - **If the partial refund is not accepted by the buyer**, the expected partial refund resolution will have rejected status.
  
  ## Offer total refund
  
  In cases where there is an available\_actions as a refund, the following resources can be used to generate a full refund to the buyer through the claim.
  
  Request:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Content-Type: application/json' https://api.mercadolibre.com/post-purchase/v1/claims/$claim_id/expected-resolutions/refund
  ```
  
  Example:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Content-Type: application/json' https://api.mercadolibre.com/post-purchase/v1/claims/5224172034/expected-resolutions/refund
  ```
  
  Response:
  
  ```javascript
  {
          "player_role": "complainant",
          "user_id": 1234,
          "expected_resolution": "refund",
          "detail": [],
          "date_created": "2022-11-04T12:43:06.000-05:00",
          "last_updated": "2022-11-04T12:43:06.000-05:00",
          "status": "accepted"
  }
  ```
  
  ## Accept the payers resolution
  
  Request:
  
  ```javascript
  curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/expected_resolutions”
  ```
  
  Example:
  
  ```javascript
  curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/950463475/expected_resolutions” d '{"status":"accepted"}'
  ```
  
  Response:
  
  ```javascript
  [
      {
          "player_role": "complainant",
          "user_id": 271942703,
          "expected_resolution": "change_product",
          "date_created": "2018-03-08T11:40:02.489-0300",
          "last_updated": "2018-03-08T11:40:02.489-0300",
          "status": "accepted"
      }
  ]
  ```
  
  Notes:
  
  -In the event the respondent accepts the complainant's resolution.  
  \- If applicable, Mercado Libre will give the buyer a label to return the product.  
  \- The resolution to be accepted is always depending on the counterparty's decision.
  
  ## Load a new resolution
  
  Request:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/expected_resolutions”
  ```
  
  Example:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/950463475/expected_resolutions” -d '{"expected_resolution":"return_product"}'
  ```
  
  Response:
  
  ```javascript
  [
      {
          "player_role": "complainant",
          "user_id": 271942703,
          "expected_resolution": "change_product",
          "date_created": "2018-03-07T11:40:02.489-0300",
          "last_updated": "2018-03-08T11:40:02.489-0300",
          "status": "rejected"
      },
  {
          "player_role": "respondent",
          "user_id": 271944560,
          "expected_resolution": "return_product",
          "date_created": "2018-03-08T11:40:02.489-0300",
          "last_updated": "2018-03-08T11:40:02.489-0300",
          "status": "accepted"
      }
  ]
  ```
  
  Note:
  
  In the example, the seller rejects the buyer's requested change of product, but accepts the product return and, alternatively, grants a money refund to the buyer.
  
  Or type of claim directly interfere with the solutions that may be proposed. There are claims of type PNR (paguei e não recebi) and PDD (produto com defeito). To identify or type of claim, check the three first letters of the reason\_id field. For example, there is no information field for "PNR3430", it is a claim to **PNR** type.
  
  In this way, for the claims of the PNR type, we have the following resolutions:
  
  \- refund - Return of Dinheiro,
  
  \- product - Shipping the product.
  
  If by consulting the expected resolution and you are as a product, the seller can accept this solution or propose refund. However, if the expected solution is refund, the seller must accept the solution or negotiate via message with the buyer.
  
  To accept or to offer the option of a refund will not return the payment. Nowadays, through API claims,  it’s still not possible to carry out this action.
  
  **For purchases made with ME2:**
  
  Solutions to PDD claims type will generate a label for the buyer to return the goods. For this to occur, the submission status of the order that originated the claim must be delivered.
  
  If the chosen solution is return\_product, the money back will only occur when the generated tag is in shipped or delivered status, depending on internal validations.
  
  To identify if the purchase is ME2, use the Shipping API. The information will be in the Mode field.
  
  ## Get claim evidence
  
  Request:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/evidences”
  ```
  
  Example:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/949903015/evidences”  
  ```
  
  Note:
  
  At present, there is only the shipping evidence load by the seller.
  
  Response:
  
  ```javascript
  [
      {
          "attachments": [],
          "type": "shipping_evidence",
          "date_shipped": "2018-03-07T05:00:00Z",
          "date_delivered": null,
          "destination_agency": null,
          "receiver_email": null,
          "receiver_id": null,
          "receiver_name": null,
          "shipping_company_name": "servientrega",
          "shipping_method": "mail",
          "tracking_number": "132456787"
      }
  ]
  ```
  
  ## Load shipping evidence
  
  Request:
  
  ```javascript
  curl -X POST "https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/actions/evidences?access_token=$ACCESS_TOKEN"
  ```
  
  Example:
  
  ```javascript
  curl -X POST "https://api.mercadolibre.com/post-purchase/v1/claims/949903015/actions/evidences?access_token=$ACCESS_TOKEN" -d {"attachments": [],"type": "shipping_evidence", "date_shipped": "2018-03-07T05:00:01.858-03:00", "shipping_company_name": "servientrega", "shipping_method": "mail" } 
  ```
  
  Response:
  
  ```javascript
  [
      {
          "attachments": [],
          "type": "shipping_evidence",
          "date_shipped": "2018-03-07T05:00:00Z",
          "date_delivered": null,
          "destination_agency": null,
          "receiver_email": null,
          "receiver_id": null,
          "receiver_name": null,
          "shipping_company_name": "servientrega",
          "shipping_method": "mail",
          "tracking_number": "132456787"
      }
  ]
  ```
  
  ## Uploading proof of shipping
  
  When the buyer opens a claim to receive the product or to have a solution on this matter, and the seller has already shipped the product and holds proof of shipping, they should use the following resource.
  
   
  
  ## Resource fields
  
  **type**: is the kind of proof. The expected values for this field are:  
  **shipping\_evidence** cuando el vendedor ya tiene la prueba de envío o **handling\_shipping\_evidence** que debe usarse cuando existe un previsión de publicaciones.   
  **shipping\_method**: refers to how the product was shipped, by mail, parcel (through a courier service), personal delivery (through a person) or by email.  
  **shipping\_company\_name**: you should enter the name of the courier service;  
  **tracking\_number**: enter the tracking number.  
  **date\_shipped**: date of shipping.  
  **date\_delivered**: date of delivery.  
  **destination\_agency**: name of the destination agency.  
  **receiver\_name**: name of the receiver.  
  **receiver\_id**: id of the person who received the product.  
  **attachments**: attachment files.   
  **receiver\_email**: e-mail address of the receiver of the digital order.   
  **handling\_date**: date of publication. 
  
  Notes:
  
  all dates must be entered using the following format:  
  \- Long format: yyyy-MM-dd’T’HH: mm: ss.SSSZ. Example: 2019-08-06T14: 00: 00.000-0400;  
  \- Short format: yyyy-MM-dd. Example: 2019-08-06  
  Every shipping type has mandatory fields, follow them accordingly.
  
  ## Delivery by mail
  
  Required fields: "shipping\_company\_name", "date\_shipped"  
  Optionals fields: "tracking\_number", "attachments"  
  Request:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/evidences”
  ```
  
  Example:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/949903015/evidences” -d {"type": "shipping_evidence",  "shipping_method": "mail" ,  "shipping_company_name": "Correios",  "tracking_number": "XX123456789XX", "date_shipped": "2018-03-07T05:00:01.858-03:00",  "attachments": ["38f4e399-0f18-41e4-8f48-91aecd2dee1a_419059118.png"] } 
  ```
  
  Response:
  
  ```javascript
  [
      {
          "attachments": [
              {
                  "filename": "38f4e399-0f18-41e4-8f48-91aecd2dee1a_419059118.png",
                  "original_filename": "Captura de Tela 2019-07-30 a?s 09.45.40.png",
                  "size": 63337,
                  "date_created": "2019-08-21T09:33:02.325-04:00",
                  "type": "image/png",
              }
          ],
          "date_shipped": "2018-03-07T04:00:01.858-04:00",
          "date_delivered": null,
          "destination_agency": null,
          "receiver_email": null,
          "receiver_id": null,
          "receiver_name": null,
          "shipping_company_name": "Correios",
          "shipping_method": "mail",
          "tracking_number": "XX123456789XX",
          "type": "shipping_evidence"
      }
  ]
  ```
  
   
  
  ## Delivery by courier service
  
  Required fields: "shipping\_company\_name", "destination\_agency", "date\_shipped", "receiver\_name"  
  Optionals fields: "receiver\_id", "tracking\_number", "date\_delivered", "receiver\_email", "attachments"  
  Request:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/evidences”
  ```
  
  Example:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/949903016/evidences” -d {"type": "shipping_evidence",  "shipping_method": "entrusted" , "shipping_company_name": "Total", "destination_agency": "Agencia", "date_shipped": "2018-08-17T05:00:01.858-03:00", "receiver_name": "Jose da Silva", "receiver_id": "12345678", "tracking_number": "XX123456789XX", "attachments": [] } 
  ```
  
  Response:
  
  ```javascript
  [
      {
          "attachments": [],
          "date_shipped": "2018-08-17T04:00:01.858-04:00",
          "date_delivered": null,
          "destination_agency": "Agencia",
          "receiver_email": null,
          "receiver_id": 12345678,
          "receiver_name": "Jose da Silva",
          "shipping_company_name": "Total",
          "shipping_method": "mail",
          "tracking_number": "XX123456789XX",
          "type": "shipping_evidence"
      }
  ]
  ```
  
   
  
  ## Delivery by hand
  
  Required fields: "date\_delivered"   
  Optionals fields: "attachments"  
  Request:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/evidences”
  ```
  
  Example:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/949903017/evidences” -d {"type": "shipping_evidence",  "shipping_method": "personal_delivery" , "date_delivered": "2018-03-07T05:00:01.858-03:00", "attachments": [] } 
  ```
  
  Response:
  
  ```javascript
  [
      {
          "attachments": [
              {
                  "filename": "38f4e399-0f18-41e4-8f48-91aecd2dee1a_419059118.png",
                  "original_filename": "Captura de Tela 2019-07-30 a?s 09.45.40.png",
                  "size": 63337,
                  "date_created": "2019-08-21T09:39:06.316-04:00",
                  "type": "image/png",
              }
          ],
          "date_shipped": null,
          "date_delivered": "2018-03-07T04:00:01.858-04:00",
          "destination_agency": null,
          "receiver_email": null,
          "receiver_id": null,
          "receiver_name": null,
          "shipping_company_name": null,
          "shipping_method": "personal_delivery",
          "tracking_number": null,
          "type": "shipping_evidence"
      }
  ]
  ```
  
  ## Delivery by email
  
  Required fields: receiver\_email", "date\_shipped  
  Optionals fields: "attachments".  
  Request:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/evidences”
  ```
  
  Example:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/949903018/evidences” -d {"type": "shipping_evidence",  "shipping_method": "email" , "receiver_email": "teste@teste.com.br", "date_shipped": "2018-03-07T05:00:01.858-03:00",  "attachments": [] } 
  ```
  
  Response:
  
  ```javascript
  [
      {
          "attachments": [
              {
                  "filename": "38f4e399-0f18-41e4-8f48-91aecd2dee1a_419059118.png",
                  "original_filename": "Captura de Tela 2019-07-30 a?s 09.45.40.png",
                  "size": 63337,
                  "date_created": "2019-08-21T09:44:43.908-04:00",
                  "type": "image/png",
              }
          ],
          "date_shipped": "2018-03-07T04:00:01.858-04:00",
          "date_delivered": null,
          "destination_agency": null,
          "receiver_email": "teste@teste.com.br",
          "receiver_id": null,
          "receiver_name": null,
          "shipping_company_name": null,
          "shipping_method": "email",
          "tracking_number": null,
          "type": "shipping_evidence"
      }
  ]
  ```
  
  There are cases in which the products haven’t been published yet, but the seller has the intention to publish and they already have a scheduled date to do so. Then, this resource can be used:
  
  Request:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/evidences”
  ```
  
  Example:
  
  ```javascript
  curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/949903019/evidences” -d {"type": "handling_shipping_evidence", "handling_date": "2019-08-23" } 
  ```
  
  Response:
  
  ```javascript
  [
      {
          "handling_date": "2019-08-23T22:59:59.000-04:00",
          "type": "handling_shipping_evidence"
      }
  ]
  ```
  
  Note:
  
  When the stage of the claim over a product is in discussion/mediation, the seller won’t be able to send proof of shipping. Once any type of proof is sent, it can’t be changed. To this end, we recommend that you complete as much information as possible.
  
  **Status history and claim scenario**
  
  Request:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/status_history”
  ```
  
  Example:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/950463475/status_history”
  ```
  
  Response:
  
  ```javascript
  [
      {
          "stage": "dispute",
          "status": "closed",
          "date": "2018-03-12T10:33:01.858-03:00",
          "change_by": "mediator"
      },
      {
          "stage": "dispute",
          "status": "opened",
          "date": "2018-03-12T10:17:56.844-03:00",
          "change_by": "respondent"
      },
      {
          "stage": "claim",
          "status": "opened",
          "date": "2018-03-08T11:40:02.390-03:00",
          "change_by": "complainant"
      }
  ]
  ```
  
  ## See history of status and actions taken on the claim
  
  Access the history of status and scenarios that the complaint has gone through, you can also see the history of actions taken.
  
  Request:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/{claim_id}/status_history”
  ```
  
  Example:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/claims/950463475/status_history”
  ```
  
  Response:
  
  ```javascript
  [
      {
          "stage": "dispute",
          "status": "closed",
          "date": "2018-03-12T10:33:01.858-03:00",
          "change_by": "mediator"
      },
      {
          "stage": "dispute",
          "status": "opened",
          "date": "2018-03-12T10:17:56.844-03:00",
          "change_by": "respondent"
      },
      {
          "stage": "claim",
          "status": "opened",
          "date": "2018-03-08T11:40:02.390-03:00",
          "change_by": "complainant"
      }
  ]
  ```
  
  ## Parameters description
  
  - action\_id: ID of action taken.
  - action\_name: action taken.
  - role: player who took the action.
  - claim\_stage: stage in which the action was taken.
  - claim\_status: status of the stage in which the action was taken.
  - date\_created: date on which the action was taken.
  
  ## Get details of the reason why the claim was filed
  
  Request:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/reasons/{reason_id}/children”
  ```
  
  Example:
  
  ```javascript
  curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' “https://api.mercadolibre.com/post-purchase/v1/reasons/PDD2/children”
  ```
  
  Response:
  
  ```javascript
  {
      "id": "PDD2",
      "name": "damaged_item",
      "detail": "El paquete llegó dañado y afectó al producto",
      "flow": "mediations",
      "position": 10,
      "site_id": "MLA",
      "parent_id": "PDD1",
      "status": "active",
      "categories": [],
      "expected_resolutions": [
          "product",
          "refund",
          "other"
      ],
      "date_created": "2018-03-14T19:22:11Z",
      "last_updated": "2018-03-14T19:22:10Z"
  }
  ```

## How to identify if a claim affects the reputation

The /affects-reputation resource lets the developer identify whether a particular claim affects the seller's reputation by making the following request.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/post-purchase/v1/claims/$CLAIM_ID/affects-reputation
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/post-purchase/v1/claims/5224172034/affects-reputation
```

Response:

```javascript
{
    "affects_reputation": affected,
    "has_incentive": true,
    "due_date": "2023-04-19T00:00-04:00"

}
```

### Response fields:

- **affects\_reputation**: reports whether the complaint affects the seller's reputation. Possible values: affected/not\_affected/not\_applies.
- **has\_incentive**: in cases where the claim is open, the field will have the result true so that the seller can deal with the claim. In case it is closed, it will be false and the seller will have the result if it impacts or not the reputation.
- **due\_date**: deadline to resolve the claim.