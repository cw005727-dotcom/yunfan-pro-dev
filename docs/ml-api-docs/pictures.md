# Pictures

## When you list a new article, you can add images at that time. In this guide, you can see how to upload images to our servers and add them to your articles.

**Tags:** Pictures
**Created:** 2020-06-25T23:20:51Z
**Last Updated:** 2026-03-24T16:38:16Z

---

## Working with pictures

Important:

Soon will be mandatory change all PUT Global items API adding /global **https://api.mercadolibre.com/global/items**. You can starting update now your endpoints.

When listing an item, depending on the type of list, the images can be mandatory and make a big difference with respect to quality, that is, they will attract more visits and improve the chances of selling. When you list a new article, you can add images at that time. In this guide, you can see how to upload images to our servers and add them to your articles. Read more about the importance of images. [Photos are your window!](https://sellers.mercadolibre.com/news/photos-are-your-shop-window-make-it-shine/)

## Recommendations for uploading images

\- RGB pictures are highly recommended over CMYK pictures.

\- The maximum size we accept is 1920 x 1920 px (F version) and the minimum is 500 x 500 px (M version). If the image has higher resolution, it will be resized for version F.

\- If the image is smaller than the minimum, it will be the same size (we will not enlarge the image).

\- There are um maximum images per item allowed to publish according to the category.

\- For pictures wider than 800 pixels, a zoom widget is activated so when buyers roll over they can take a close-up look. This is highly recommended for Clothes.

\- You’re allowed to upload pictures up to 10 MB in the following formats:

- JPG
- JPEG
- PNG

## Validate and upload pictures

This feature allows you, before uploading an image, perform online validation of the size of the image sent through a smartcrop process, which removes the excess background so that the product has an adequate relationship with the size of the image.

Request:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X POST  \
-H 'content-type: multipart/form-data' \
-F 'file=@FILE' \
https://api.mercadolibre.com/pictures/items/upload
```

Note:

The endpoint only supports multipart uploads (direct data) and for item.

Example:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X POST  \
-H 'content-type: multipart/form-data' \
-F 'file=@/Users/Documents/test.jpg' \
'https://api.mercadolibre.com/pictures/items/upload'
```

**Valid image response**:

```javascript
{
   "id": "123-MLM456_112021",
   "variations": [
       {
           "size": "1920x1076",
           "url": "http://http2.mlstatic.com/D_NQ_NP_123-MLA456_112021-F.jpg",
           "secure_url": "https://http2.mlstatic.com/D_NQ_NP_123-MLA456_112021-F.jpg"
       },
       {
           "size": "500x280",
           "url": "http://http2.mlstatic.com/D_NQ_NP_123-MLA456_112021-O.jpg",
           "secure_url": "https://http2.mlstatic.com/D_NQ_NP_123-MLA456_112021-O.jpg"
       },
       {
           "size": "400x400",
           "url": "http://http2.mlstatic.com/D_NQ_NP_123-MLA456_112021-C.jpg",
           "secure_url": "https://http2.mlstatic.com/D_NQ_NP_123-MLA456_112021-C.jpg"
       },
[...]
}
```

We recommend using the obtained id to make a new publication or associate the image with an existing publication.

**Invalid image response**:

Important:

Due to the high processing load of the resource, we limit the requests per minute (RPM) for each app\_id. If you receive an http error 429 it means that you have exceeded your assigned quota and you will have to wait to retry, or it is because you do not have an assigned quota yet.

```javascript
{
   "message": "Asegúrate de que la imagen tenga como mínimo 500 píxeles en uno de los lados. Tené en cuenta que de tener bordes en blanco estos se eliminan dejando un margen total del 10%. Te recomendamos usar 1200 x 1200 para poder hacer zoom. La imagen subida, procesados los bordes blancos, tiene un tamaño de 376px x 340px",
   "error": "bad_request",
   "status": 400,
   "cause": []
}
```

In the case that the image does not exceed the minimum size, it will return an http 400 error, informing the details of the same.

## Link a picture to your Item

Using the picture id obtained before, you can link the picture to your item, like this example:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN'
-H "Content-Type: application/json"
-H "Accept: application/json" -d 
{
  "id": "676385-CBT42336685170_062020"
}
https://api.mercadolibre.com/items/$ITEM_ID/pictures
```

That’s all! Go to your item’s description page (using the permalink field) and check how your picture displays.

## Replace pictures in Variations and Global Item

If you need to replace the current pictures of an item, you need to link the pictures to your item and then make a PUT including the Item ID and the picture ID [previously linked](https://global-selling.mercadolibre.com/devsite/pictures#Validate-and-upload-pictures), with your access\_token like in the following example:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -H "Accept: application/json" -d
'{
  "pictures": [
    {
      "id": "679765-CBT423366854653_082021"
    },
    {
      "id": "4629765-CBT423354837509_042020"
    }
  ]
}
' https://api.mercadolibre.com/global/items/$ITEM_ID
```

Important

- If you want to replace an image, omit old ID in pictures\_id array and be assurance to set new picture ID [previously linked](https://global-selling.mercadolibre.com/devsite/pictures#Validate-and-upload-pictures).
- In case you have a set of images and you wish to perform the following actions: Add a new image: you should send the IDs of the uploaded images that you wish to keep, along with the ID of the new images [previously linked](https://global-selling.mercadolibre.com/devsite/pictures#Validate-and-upload-pictures). Besides, you can change the order by sending it in the body of the PUT request as you wish to view them.

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -H "Accept: application/json" -d
'{
    "pictures": [
        {
            "id": "679765-CBT423366854653_082021"
        },
        {
            "id": "636579-CBT42348571098_062020"
        },
        {
            "id": "676385-CBT42336685170_062020"
        }
    ],
    "variations": [
        {
            "id": "16787985187",
            "picture_ids": [
                "753377-CBT32543573702_102019",
                "666344-CBT42350430700_062020",
                "679765-CBT423366854653_082021"
            ]
        }
    ]
}' 
http://api.mercadolibre.com/global/items/$ITEM_ID
```

To delete an image you should only send the IDs of the uploaded images you want to keep.

## Check possible errors

If loading the item displays an error message (e.g., "Processing Image ..."), you can check the following:

Request:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/pictures/$PICTURE_ID/errors
```

Example:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/pictures/622077-CBT42350860502_062020/errors
```

Response:

```javascript
{
  "id": "622077-CBT42350860502_062020",
  "source": "https://s3.amazonaws.com/images/pictures/146.111111.jpg",
  "status": "PENDING",
  "error": "{error_code=response_code, meta={responseCode=403, responseMessage=Forbidden, contentType=application/xml, contentLength=-1, contentEncoding=null}}"
}
```

## Image format

- Use the browser to check that the image exists and verify potential errors.
- If the image error continues when uploading an item, you can identify why, using the last call.
- Verify Content-Type against the extension, checking the image with curl -v
  
  ```javascript
  curl -v 'image link' >> /dev/null
  ```
  
  ```javascript
  curl -v 'https://s3.amazonaws.com/images/pictures/146.111111.jpg' >> /dev/null
  ```
- Download the image with curl -O "image link" and run the File command to verify the extension.
  
  ```javascript
  curl -O "https://s3.amazonaws.com/images/pictures/146.111111.jpg"
  ```
  
  ```javascript
  file 146.111111.jpg
  ```
  
  Obtaining the answer as follows:
  
  ```javascript
  146.111111.jpg: XML 1.0 document text, ASCII text
  ```

Both should match the formats that we work with: \*based on uploading speed.

- JPG
- JPEG
- PNG

## Errors

Error\_code Mensaje del error Descripción Posible solución 400 Bad\_request. See message detail. Due to the high processing load of the resource, we limit the requests per minute (RPM) for each app\_id. You have exceeded your assigned quota. Wait to retry, you still do not have a quota assigned. Unable to find valid certification path to requested target El certificado HTTPS no es válido para nuestros servidores. Change the URL, put HTTP (without “s” in the end). In this way, the image is downloaded without validating the certificate. 301 redirect/moved permanently/etc error\_code=content\_type,meta={responseCode=301,responseMessage=Moved Permanently, contentType=text/html; charset=UTF-8, contentLength=221, contentEncoding=null} The image you are downloading redirects to another URL (if you test it by browser, you can see the redirection). Don´t work with redirectings. Please, send the last picture URL. 404 (not found) {error\_code=response\_code, meta={responseCode=404, responseMessage=Not Found, contentType=application/json, contentLength=30, contentEncoding=null}} the server not found the picture. Verify that the image exists and have our IP´s in the whitelist. 403 o 401 (Forbidden) It was not possible to download the image because the external server is blocking our access. Verify that you have our ip's in the whitelist. Connect timed out It was not possible to connect to the external server to download the picture. Verify that the URL is valid and that the external server has released our IPs. Received fatal alert: protocol\_version Incompatibility of the ssl protocol by HTTPS. Use HTTP without redirecting. Picture wasnt create in buckets The picture do not exist. Verify the page by the browser. 400 validation\_error "cause\_id": 508 "Picture id 642584-MLA107576465620\_032026 has an invalid status 'ERROR'. Only ACTIVE or PENDING pictures are allowed." Send a new image ID for an active image. 400 validation\_error "cause\_id": 509 "Picture id 650349-MLA10B360106259\_032026 is below the minimum allowed size." Adjust the image size.

## Connection/block

Check if you are working with Mercado Libre IPs block:

- 216.33.196.4
- 216.33.196.25
- 54.88.218.97
- 18.215.140.160
- 18.213.114.129
- 18.206.34.84

Check if the URL has a redirection. The link should redirect exactly to the image. For example, if the URL is http but changes to https when entered in the browser, it means that there was a redirection.)

If the SSL certificate is incompatible with our server, we recommend getting the SSL by sending the URLs with HTTP.