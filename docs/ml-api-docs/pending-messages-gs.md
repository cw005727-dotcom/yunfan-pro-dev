# Pending messages

**Tags:** Pending,messages
**Created:** 2021-01-15T12:38:03Z
**Last Updated:** 2026-04-14T12:37:21Z

---

## Pending messages

Important: Model 6 Sellers — Restricted Access Model 6 403 Forbidden

**Sellers identified as Model 6** are blocked from accessing the Messages endpoints of this API. Any request made with an Model 6 seller identity will receive a **403 Forbidden** response.

Example 403 response body:

```javascript
{
  "message": "Forbidden",
  "error": "Forbidden",
  "status": 403,
  "cause": []
}
```

## Notifications flow

To consume new (unread) messages from your integration, [use /messages notifications](https://global-selling.mercadolibre.com/devsite/receive-notifications?nocache=true#marketplace-messages) to identify sales with new messages. Then perform a GET request on each pack to retrieve the message details.

## Messages pending reading

This resource allows you to retrieve all pending (unread) messages in Mercado Libre for existing orders. You can filter by specific orders and define the user role (buyer or seller). This endpoint is recommended for redundancy validation to ensure no messages were lost during notification processing.

Remember that **when you call /messages/packs/{pack\_id}/sellers/{seller\_id} the messages will be automatically marked as read**. To prevent this, **add the mark\_as\_read=false parameter** to your query: `/messages/packs/{pack_id}/sellers/{seller_id}?mark_as_read=false`.

Note:

This resource returns up to 1,000 conversations per request. To retrieve more, you must [mark some as read](https://global-selling.mercadolibre.com/devsite/pending-messages-gs?nocache=True#Mark-messages-as-read) and make the same request again.

### Parameters

Parameter Type Required Description `role` String No User role filter. Values: `buyer` or `seller`. Defaults to `seller` if not specified or invalid. `tag` String No Message tag filter. Use `post_sale` for post-sale messages.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/messages/unread
```

Response:

```javascript
{
    "results": [
        {
            "resource": "/packs/123123123",
            "count": 1
        },
        {
            "resource": "/packs/1231234123",
            "count": 1
        }
    ],
    "userId": 29293123
}
```

### Response fields

Field Type Description `userId` Integer ID of the user who made the request. `results` Array List of packs with pending messages. Empty array if no messages pending. `results[].resource` String Path to the pack resource (format: `/packs/{pack_id}`). `results[].count` Integer Number of unread messages for this pack.

### Use modes

If you want to get all the orders with messages pending reading as seller, you will need to make this request:

```javascript
curl --location 'https://api.mercadolibre.com/marketplace/messages/unread?role=$ROLE&tag=post_sale&user_id=$USER_ID' \
    --header 'Authorization: Bearer $ACCESS_TOKEN'
```

The possible values for `role` are `buyer` or `seller`.

Note:

For better performance, it is recommended to declare the `role` parameter. If you do not specify a role or provide an invalid value (different from "buyer" or "seller"), the resource will default to `role=seller`.

Response:

```javascript
{
    "results": [
        {
            "resource": "/packs/12312312",
            "count": 1
        }
    ],
    "userId": 123123
}
```

If there are no messages pending reading for the user's orders, or if the specified orders do not belong to the user, the response will be:

```javascript
{
    "userId": 1234512314,
    "results": []
}
```

## Mark messages as read

Use this endpoint to retrieve messages from a specific pack and automatically mark them as read. The response includes conversation status, paging information, and full message details including attachments.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/messages/packs/$PACK_ID/sellers/$SELLER_ID?limit=$LIMIT&offset=$OFFSET&tag=post_sale
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/messages/packs/2000000089077943/sellers/415458330?limit=2&offset=1&tag=post_sale
```

To retrieve messages **without marking them as read**:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/messages/packs/2000000089077943/sellers/415458330?limit=2&offset=1&tag=post_sale&mark_as_read=false
```

Response:

```javascript
{
    "paging": {
        "limit": 2,
        "offset": 1,
        "total": 31
    },
    "conversation_status": {
        "path": "/packs/2000000089077943/seller/415458330",
        "status": "active",
        "substatus": null,
        "status_date": "2019-04-08T16:36:30.000Z",
        "status_update_allowed": false,
        "claim_id": null,
        "shipping_id": null
    },
    "messages": [
        {
            "id": "2c92808469fea23a0169febf14580001",
            "site_id": "MLM",
            "client_id": 123,
            "from": {
                "user_id": "415458330",
                "email": "test_user_83388960@testuser.com",
                "name": "Juan Pablo Robledo"
            },
            "status": "IN_MODERATION",
            "text": "Test message ToUserId",
            "message_date": {
                "received": "2019-04-08T20:58:49.000Z",
                "available": null,
                "notified": null,
                "created": "2019-04-08T20:58:49.000Z",
                "read": "2019-04-08T20:58:52.000Z"
            },
            "message_moderation": {
                "status": "NON_MODERATED",
                "reason": "none",
                "by": "none",
                "moderation_date": null
            },
            "message_attachments": [
                {
                    "filename": "415460047_a96d8dea-38cd-4402-938e-80a1c134fc5d.pdf",
                    "original_filename": "Ayuda-Memoria-Arduino-ELINSI.pdf",
                    "type": "application/octet-stream",
                    "size": 225677,
                    "potential_security_threat": false,
                    "creation_date": "2019-04-08T20:58:49.000Z"
                }
            ],
            "message_resources": [
                {
                    "id": "2000000089077943",
                    "name": "packs"
                },
                {
                    "id": "415458330",
                    "name": "seller"
                }
            ]
        }
    ]
}
```

### Response fields

Field Type Description `paging.limit` Integer Maximum number of messages per page. `paging.offset` Integer Current offset position. `paging.total` Integer Total number of messages in the conversation. `conversation_status.path` String Resource path for the conversation. `conversation_status.status` String Conversation status (e.g., `active`). `conversation_status.substatus` String Conversation substatus. Can be `null`. `conversation_status.status_date` String ISO 8601 timestamp of the last status change. `conversation_status.status_update_allowed` Boolean Whether the conversation status can be updated. `conversation_status.claim_id` String Associated claim ID. Can be `null`. `conversation_status.shipping_id` String Associated shipping ID. Can be `null`. `messages` Array List of message objects. `messages[].id` String Unique message identifier. `messages[].site_id` String Site ID where the transaction occurred. `messages[].client_id` Integer Client application ID. `messages[].from.user_id` String Sender's user ID. `messages[].from.email` String Sender's email address. `messages[].from.name` String Sender's display name. `messages[].status` String Message status (e.g., `IN_MODERATION`, `AVAILABLE`). `messages[].text` String Message content. `messages[].message_date` Object Timestamp information for the message (`received`, `available`, `notified`, `created`, `read`). `messages[].message_moderation` Object Moderation status and details (`status`, `reason`, `by`, `moderation_date`). `messages[].message_attachments` Array List of attached files with `filename`, `original_filename`, `type`, `size`, `potential_security_threat`, and `creation_date`. `messages[].message_resources` Array Associated resources (packs, seller) with `id` and `name`.

### Errors

Status Error Message Solution 400 Bad Request Messages id empty or invalid Verify that the message ID is not empty and follows the correct format. 400 Bad Request The specified message id: {id} does not exist Check if the message ID exists and belongs to your user. 400 Bad Request Not allowed messages from multiple orders Send only one order/pack per request. 403 Forbidden Can not identify the user. Verify your access token is valid and the user\_id belongs to the authenticated user. 404 Not Found The message with id: {id} could not be retrieved from storage The message may have been deleted or is no longer accessible. 404 Not Found Order do not exists The specified pack/order ID does not exist. Verify the pack\_id is correct.

**Next:** [Blocked messages](https://global-selling.mercadolibre.com/devsite/blocked-messages-gs).