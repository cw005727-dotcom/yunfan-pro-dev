# Upload invoices

**Tags:** upload invoices,invoices,invoice
**Created:** 2020-03-29T14:59:48Z
**Last Updated:** 2023-11-01T14:20:07Z

---

## Upload invoices

Important:

This resource is available in all sites, except Mercado Livre Brasil.  
Remember that if you programmed automatic messages notifying the invoice upload, you must cancel your shipment to avoid moderation, since Mercado Libre sends a notification and an email.  
To Mercado Libre Chile, the pack with Full shipping will not use this resource.

With this new feature, Mercado Libre sellers can share their buyers invoices in an orderly way within the purchase-sale process. This way, we facilitate access to the documents avoiding these to be attached in the messaging after sales and improving the purchasing experience. Follow our guide, you will learn to upload, obtain and delete invoices per pack.

## Upload invoices

In order to upload an invoice you must make a POST as form.data with key: type **file** and **fiscal\_document** value that references the **fiscal\_document** (document file you attach), **pack\_id** (pack ID) and **access\_token** (public token).  
To know the pack\_id, you must obtain the “pack\_id” field in the response of /orders / &lt;order\_id&gt;.  
**If the pack id contains a null value, must take the order id by default, keeping the resource /packs in the API request**.

Important:

The file must have a maximum size of 1 MB, be in PDF format and can only be one fiscal\_document per pack. Also, in case you need to attach an associated XML and PDF file, you can load the two fiscal\_documents as we show you in [Attach XML](https://developers.mercadolibre.com.ar/en_us/upload-invoices?#Attach-XML).

Request:

```javascript
curl -X POST https://api.mercadolibre.com/packs/$PACK_ID/fiscal_documents
-H 'Authorization: Bearer $ACCESS_TOKEN'
-H 'Content-Type: multipart/form-data' \
-F 'fiscal_document=@/home/user/.../Factura_adjunta.pdf'
```

Example:

```javascript
curl -X POST https://api.mercadolibre.com/packs/2000000089077943/fiscal_documents
  -H 'Authorization: Bearer $ACCESS_TOKEN'
  -H 'content-type: multipart/form-data'
  -F 'fiscal_document=@/home/user/.../Factura_adjunta.pdf'
```

Response:

```javascript
{
  "ids" : ["415460047_a96d8dea-38cd-4402-938e-80a1c134fc5d"]
}
```

Note:

The response will return the uploaded fiscal\_document ID, that you must save in order to retrieve it.  
If you attach a wrong file, you can [delete the existing fiscal\_document](https://developers.mercadolibre.com.ar/en_us/upload-receipts#Delete-sales-receipt) and then upload the correct fiscal\_document.

## Attach XML file

Currently, you can choose to attach the invoice in associated XML, making the following POST and specifying one of the following formats:

- **application/pdf**
- **application/xml**
- **text/xml**

Request:

```javascript
curl -X POST https://api.mercadolibre.com/packs/$PACK_ID/fiscal_documents
  -H 'Authorization: Bearer $ACCESS_TOKEN'
  -H 'content-type: multipart/form-data' 
  -F 'fiscal_document=@/home/user/.../Factura_adjunta.pdf'
  -F 'fiscal_document=@/home/user/.../Factura_adjunta.xml'
```

Example:

```javascript
curl -X POST 'https://api.mercadolibre.com/packs/2000000089077943/fiscal_documents'
  -H 'Authorization: Bearer $ACCESS_TOKEN'
  -H 'content-type: multipart/form-data'
  -F 'fiscal_document=@/home/user/.../Factura_adjunta.pdf'
  -F 'fiscal_document=@/home/user/.../Factura_adjunta.xml'
```

Response:

```javascript
{
  "ids" : ["415460047_a96d8dea-38cd-4402-938e-80a1c134fc5d",
               "415460047_4c942945-ae16-46f2-98fa-a772322c7e70" ]
}
```

Note:

We recommend that you review the details of all discounts applied on a sale. It is possible to obtain these details with [the /discounts resource](https://developers.mercadolibre.com.ar/en_us/manage-sales?nocache=true#Get-discounts-applied).

## Possible errors in uploading an invoice

The user is not authorized to upload an invoice:

```javascript
{
    "message": "Access Denied, you are not authorized.",
    "error": "forbidden",
    "status": 403,
    "cause": []
}
```

The file can not be null or file not found:

```javascript
{
    "message": "File cannot be empty",
    "error": "bad_request",
    "status": 400,
    "cause": []
}
```

File type not supported:

```javascript
{
   "message":"File type: $FILE_TYPE is not allowed",
   "error":"bad_request",
   "status":400,
   "cause":[

   ]
}
```

File exceeds maximum size:

```javascript
{
   "message":"File Not allowed, exceeds maximum size",
   "error":"bad_request",
   "status":400,
   "cause":[]
}
```

More than one file attached:

```javascript
{
   "message":"Files Not allowed, you can upload only two files, one of each type",
   "error":"bad_request",
   "status":400,
   "cause":[]
}
```

Attach more than one file in a pack of the same type:

```javascript
{
   "message":"Files Not allowed, you can upload only one file of type: $FILE_TYPE",
   "error":"conflict",
   "status":409,
   "cause":[]
}
```

Attach a file in a pack that already has the maximum number of files previously loaded:

```javascript
{
   "message":"File Not allowed, the max amount of files already exist for the pack: $PACK_ID and seller: $SELLER_ID",
   "error":"conflict",
   "status":409,
   "cause":[]
}
```

Attach a file of a type in a pack that already has a file of that type previously loaded:

```javascript
{
   "message":"File Not allowed, a file already exists for the pack: $PACK_ID and seller: $SELLER_ID of the type: $FILE_TYPE",
   "error":"conflict",
   "status":409,
   "cause":[

   ]
}
```

File attached with empty name:

```javascript
{
   "message":"Filename cannot be empty",
   "error":"bad_request",
   "status":400,
   "cause":[]
}
```

## Obtain invoices IDs

In order to obtain the invoice id, you must make a GET request. The response will depend on the role of the user making the query and may be:  
**Rol vendedor**: the id of the invoices you loaded in the pack.  
**Buyer role**: all the ids of the invoices that belong to the pack.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/packs/$PACK_ID/fiscal_documents
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/packs/2000000089077943/fiscal_documents
```

Response:

```javascript
{
    "pack_id": 2000000089077943,
    "fiscal_documents":[
      {
         "id":"fc76f79d-1599-43ed-8675-569482e2ec21",
         "date":"2020-04-27T23:10:21Z",
         "file_type":"application/pdf"
         "filename":"factura.pdf"
      }
   ]
}
```

Note:

The response will return the IDS of the loaded fiscal\_document, which you must save in order to download, the date it was loaded and the type of file (PDF or XML).  
If there are fiscal\_documents that were removed, the fiscal\_documents ids list may appear empty.

## Errors obtaining the invoices ids

The user is not authorized to obtain the invoices ids associated with the pack:

```javascript
{
    "message": "Access Denied, you are not authorized.",
    "error": "forbidden",
    "status": 403,
    "cause": []
}
```

If the pack does not have any invoices charged:

```javascript
{
   "message": "The pack_fiscal_document with pack_id: %d does not exist",
    "error": "not_found",
    "status": 404,
    "cause": []
}
```

If the user does not have any invoices loaded by him within the pack:

```javascript
{
   "message": "The pack_fiscal_document with pack_id: %d does not have any fiscal_document attached for the user_id: %d",
    "error": "not_found",
    "status": 404,
    "cause": []
}
```

## Obtain invoices

To obtain invoices, you must make a GET request with the filename, i.e., the ID´s file. The response will be successful when it returns the file requested.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/packs/$PACK_ID/fiscal_documents/$FISCAL_DOCUMENT_ID
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/packs/2000000089077943/fiscal_documents/415460047_a96d8dea-38cd-4402-938e-80a1c134fc5d
```

## Errors obtaining the invoices

The user is not authorized to delete the invoices linked to the pack:

```javascript
{
    "message": "Access Denied for user with id : ${ID} to the fiscal_document with id: ${ID}.",
    "error": "forbidden",
    "status": 403,
    "cause": []
}
```

The fiscal\_document requested does not exist:

```javascript
{
    "message": "The fiscal_document with id: ${ID} does not exist",
    "error": "bad_request",
    "status": 400,
    "cause": []
}
```

The invoices could not be found in the server, try again in some seconds:

```javascript
{
    "message": "The fiscal_document with id: ${ID} could not be retrieved from storage",
    "error": "not_found",
    "status": 404,
    "cause": []
}
```

## Delete invoices

To delete an invoice you must make a DELETE call specifying the pack\_id i.e., the pack ID. This way, you will delete the invoices belonging to this pack.

Request:

```javascript
curl -X DELETE -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/packs/$PACK_ID/fiscal_documents
```

Example:

```javascript
curl -X DELETE -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/packs/2000000089077943/fiscal_documents
```

If the seller has only 1 file attached to the PACK\_ID, this is the response:

```javascript
{
  "message" : "The fiscal_document with "id" : 415460047_a96d8dea-38cd-4402-938e-80a1c134fc5d was deleted"
}
```

If you have more than one file attached (PDF and XML), the response is:

```javascript
{
  "message" : "The fiscal_documents with the following ids: 415460047_a96d8dea-38cd-4402-938e-80a1c134fc5d,              415460047_4c942945-ae16-46f2-98fa-a772322c7e70 were deleted
}
```

Note:

In the response you will obtain the deleted fiscal\_document ID.

## Possible errors deleting an invoice

Deleting a non-existing or already deleted invoices from a pack:

```javascript
{
   "message":"Cannot delete. The pack: 2000000089077943 doesn't have a fiscal_document attached",
   "error":"not_found",
   "status":404,
   "cause":[]
}
```

User is not authorized to delete the invoices linked to the pack:

```javascript
{
    "message": "Access Denied, you are not authorized.",
    "error": "forbidden",
    "status": 403,
    "cause": []
}
```

### Possible errors requesting billing data

The body is empty:

```javascript
{
    "message": "The body of the request cannot be empty",
    "error": "internal_server_error",
    "status": 500,
    "cause": []
}
```

Could not retrieve body of request:

```javascript
{
    "message": "Error retrieving the body from the request",
    "error": "internal_server_error",
    "status": 500,
    "cause": []
}
```

The user is not authorized to request tax data:

```javascript
{
    "message": "Access Denied, you are not authorized.",
    "error": "forbidden",
    "status": 403,
    "cause": []
}
```

If the user can not use the messaging:

```javascript
{
    "message": "You cannot ask for the billing_info because you are not allowed to use the messaging service",
    "error": "forbidden",
    "status": 403,
    "cause": []
}
```

If the text exceeds the maximum number of characters:

```javascript
{
    "message": "The text content is too long, max characters allowed are: 500",
    "error": "bad_request",
    "status": 400,
    "cause": []
}
```

If the text is empty:

```javascript
{
    "message": "The text content cannot be empty",
    "error": "bad_request",
    "status": 400,
    "cause": []
}
```

If the text is not valid:

```javascript
{
    "message": "You cannot ask for the billing_info because the text is not valid. Check Messaging Post Sale documentation for more information",
    "error": "not_acceptable",
    "status": 406,
    "cause": []
}
```

## General errors

The order id do not be part of a pack:

```javascript
{
"message": "The order belong to a pack/purchase",
"error": "bad_request",
"status": 400,
"cause": []
}
```

Pack\_id empty or non-numeric:

```javascript
{
"message": "pack.id must be numeric and not empty",
"error": "bad_request",
"status": 400,
"cause": []
}
```

Negative pack\_id or 0:

```javascript
{
"message": "pack.id is invalid",
"error": "bad_request",
"status": 400,
"cause": []
}
```

**Access token error**

If you make the query without the corresponding ACCESS\_TOKEN, you will get the following error:

```javascript
{
    "message": "access_token was not sent",
    "error": "access_token_not_granted",
    "status": 403,
    "cause": []
}
```

**Error for access from unauthorized site**

In case you want to use the API from a site where it is not available, you will get the following error:

```javascript
{
    "message": "Access Denied, this API is not available on your site: MLB",
    "error": "forbidden",
    "status": 403,
    "cause": []
}
```