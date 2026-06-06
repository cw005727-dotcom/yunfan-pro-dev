# Pictures

**Tags:** Working,with,pictures
**Created:** 2018-06-27T12:01:32Z
**Last Updated:** 2026-03-24T16:37:39Z

---

## Working with pictures

When listing an item, depending on the type of list, the images can be mandatory and make a big difference with respect to quality, that is, they will attract more visits and improve the chances of selling. When you list a new article, you can add images at that time. In this guide, you can see how to upload images to our servers and add them to your articles. Read more about [the importance of images](https://www.mercadolibre.com.ar/ayuda/805). Photos are your window!

## Recommendations for uploading images

- **Format** JPG, JPEG and PNG.
- **Quality** **RGB image** is better than CMYK and should occupy 95% of the space.
- **Quantity** identifies the maximum number of images per post allowed (max\_pictures\_per\_item and max\_pictures\_per\_item\_var) according to their category.
- **Size**

<!--THE END-->

- You can upload images **up to 10 MB**.
- Upload **images of 1200 x 1200 px**. If they are larger, we will edit them to keep the mentioned size.
- The **maximum size accepted is 1920 x 1920 px** (version F) and **the minimum is 500px x 500px** (version M). If the image has a higher resolution, it will be resized to the F version. If it is smaller than the minimum size, it will remain the same size (we will not enlarge the image).
- If the width of **the image is greater than 800 px, we activate a zoom widget** so that when buyers pass the mouse over the image they can see it in close-up. Recommended for Apparel and Real Estate.

## Validate and upload pictures

This feature allows you, before uploading an image, perform online validation of the size of the image sent through a smartcrop process, which removes the excess background so that the product has an adequate relationship with the size of the image.

Request:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN'  \
-H 'content-type: multipart/form-data' \
-F 'file=@FILE' \
https://api.mercadolibre.com/pictures/items/upload
```

Note:

The endpoint only supports multipart uploads (direct data) and for item.

Example:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN'  \
-H 'content-type: multipart/form-data' \
-F 'file=@/Users/Documents/test.jpg' \
'https://api.mercadolibre.com/pictures/items/upload'
```

**Valid image response**:

```javascript
{
   "id": "959699-MLM43299127002_092020",
   "max_size": "994x1020",
   "dominant_color": null,
   "crop": {
       "y_offset": null,
       "y_size": null,
       "x_offset": null,
       "x_size": null
   },
   "variations": [
       {...},
       {...},
       {...},
       {...},
       {...}
   ]
}
```

We recommend using the obtained ID to make a new publication or associate the image with an existing publication.

## Link a picture to your Item

Using the picture\_id obtained before you can link the picture to your item, like this:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -H "Accept: application/json" -d
'{"id":"MLA430387888_032012"}'

https://api.mercadolibre.com/items/MLA421101451/pictures
```

That’s all! Go to your item’s description page (using the permalink field) and check how your picture displays.

## Replace pictures

If you need to replace the current pictures of an item, you need to make a PUT including the Item ID and the picture url, with your access\_token like in the example that follows:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -H "Accept: application/json" -d
'{
  "pictures":[
    {"source":"http://www.apertura.com/export/sites/revistaap/img/Tecnologia/Logo_ML_NUEVO.jpg_33442984.jpg"},
    {"source":"http://appsuser.net/www/wp-content/uploads/2012/10/logo-mercadolibre.jpg"}
  ]
}' https://api.mercadolibre.com/items/{item_id}
```

**Important!**

- If you want to replace an image, you should create a new source (re-name image); otherwise, if the same existing source is used with different content the image will not be updated.
- In case you have a set of images and you wish to perform the following actions: *Add an image:* you should send the IDs of the uploaded images you wish to keep, along with the source (URL) of the new images. Besides, you can change the order by sending the body of the PUT as you wish to view them.

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -H "Accept: application/json" -d
'{
"pictures": [{"source": "http://SOURCE_IMAGEN_NUEVA.jpg"},
			{"id": "111111 - IMAGEN_EXISTENTE_111111"},
			{"id": "111111 - IMAGEN_EXISTENTE_111111"},
			{"id": "111111 - IMAGEN_EXISTENTE_111111"}
],

"variations": [{
"id": "16787985187",
"picture_ids": [
		"http://SOURCE_IMAGEN_NUEVA.jpg", 
        "111111 - IMAGEN_EXISTENTE_111111", 
        "111111 - IMAGEN_EXISTENTE_111111", 
        "111111 - IMAGEN_EXISTENTE_111111"]},
{
"id": "16787985190",
"picture_ids": [
		"http://SOURCE_IMAGEN_NUEVA.jpg", 
        "111111 - IMAGEN_EXISTENTE_111111", 
        "111111 - IMAGEN_EXISTENTE_111111", 
        "111111 - IMAGEN_EXISTENTE_111111"]},

{
"id": "16787985193",
"picture_ids": [
		"http://SOURCE_IMAGEN_NUEVA.jpg", 
        "111111 - IMAGEN_EXISTENTE_111111", 
        "111111 - IMAGEN_EXISTENTE_111111", 
        "111111 - IMAGEN_EXISTENTE_111111"]}]
}' http://api.mercadolibre.com/items/ITEM_ID
```

To delete an image you should only send the IDs of the uploaded images you wish to keep.

## Check possible errors

If an image is in error (e.g., “Processing image…”) when uploading an item, you may check the following: 

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/pictures/$PICTURE_ID/errors
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/pictures/970736-MLU11111111111_092017/errors
```

Response:

```javascript
{
 "id": "970736-MLU11111111111_092017",
 "source": "https://s3.amazonaws.com/images/pictures/146.111111.jpg",
 "error": {
   "message": "{error_code=response_code, meta={responseCode=403, responseMessage=Forbidden, contentType=application/xml, contentLength=-1}}",
   "items": "MLU111111111"
 }
}
```

 

### Image format

- Use the browser to check that the image exists and verify potential errors.
- If the image error continues when uploading an item, you will be able to identify why using the last call.

<!--THE END-->

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

```javascript
146.111111.jpg: XML 1.0 document text, ASCII text
```

Both should match the formats that we work with: \*based on uploading speed.

- JPG
- JPEG
- PNG
  
  ## HTTP response code references
  
  The status codes of the HTTP responses indicate whether an HTTP resource was correctly performed. The most frequent cases are:
  
  Error\_code Error message Description Posible solutions Unable to find valid certification path to requested target El certificado HTTPS no es válido para nuestros servidores. Change the URL, put HTTP (without “s” in the end). In this way, the image is downloaded without validating the certificate. 301 redirect/moved permanently/etc error\_code=content\_type,meta={responseCode=301,responseMessage=Moved Permanently, contentType=text/html; charset=UTF-8, contentLength=221, contentEncoding=null} The image you are downloading redirects to another URL (if you test it by browser, you can see the redirection). Don´t work with redirectings. Please, send the last picture URL. 404 (not found) {error\_code=response\_code, meta={responseCode=404, responseMessage=Not Found, contentType=application/json, contentLength=30, contentEncoding=null}} the server not found the picture. Verify that the image exists and have our IP´s in the whitelist. 403 o 401 (Forbidden) It was not possible to download the image because the external server is blocking our access. Verify that you have our ip's in the whitelist. Connect timed out, Slow\_domain\_to\_many\_posts, Slow\_domain It was not possible to connect to the external server to download the picture. Verify that the URL is valid and that the external server has released our IPs. Received fatal alert: protocol\_version Incompatibility of the ssl protocol by HTTPS. Use HTTP without redirecting. Picture wasnt create in buckets The picture do not exist. Verify the page by the browser. 400 validation\_error "cause\_id": 508 "Picture id 642584-MLA107576465620\_032026 has an invalid status 'ERROR'. Only ACTIVE or PENDING pictures are allowed." Send a new image ID for an active image. 400 validation\_error "cause\_id": 509 "Picture id 650349-MLA10B360106259\_032026 is below the minimum allowed size." Adjust the image size.
  
  ### Connection/block
  
  Check if you are working with Mercado Libre IPs block:
  
  - 216.33.196.4
  - 216.33.196.25
  - 54.88.218.97
  - 18.215.140.160
  - 18.213.114.129
  - 18.206.34.84
  
  Check if the URL has a redirection. The link should redirect exactly to the image. For example, if the URL is http but changes to https when entered in the browser, it means that there was a redirection.)
  
  If the SSL certificate is incompatible with our server, we recommend getting the SSL by sending the URLs with HTTP.
  
  Now the new picture will be showing on your item. Now you know how to add or replace pictures, remember good pictures will attract more buyers!
  
  ## Pictures moderations
  
  Learn more information about [the resource /quality /picture](https://developers.mercadolibre.com.ar/en_us/moderations#Picture-Quality) that will allow you to identify the reasons why the item is losing exposure in the listings, that is, it does not meet the image requirements.