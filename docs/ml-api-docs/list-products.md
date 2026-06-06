# List products

**Tags:** List,products,SKU
**Created:** 2018-06-27T12:01:32Z
**Last Updated:** 2025-12-30T15:38:05Z

---

## List products

Importante:

For new developments in the publication flow, it will be necessary to take into account the new way of publishing on Mercado Libre, which is **User Products**. We invite you to read the [documentation](https://developers.mercadolibre.com.ar/es_ar/user-products) and identify the relevant activation dates

On MercadoLibre's API, listings are items that contain products and other attributes you can sell or buy. Users can’t exchange contact information right away on them, so every time there’s an intention of buying a product, potential buyers are able to make as many questions they want on the item and when they’re ready, an order is created for both seller and buyer detailing the transaction as a sale or a purchase for each one, and that’s when contact information is visible automatically between those users.

## Item details page

When a user chooses an item from the result, this page displays the following item details:

- Item\_id
- Title
- Category
- Pictures
- Price
- City
- Sold quantity
- Questions
- Sellers reputation

Importante:

We removed the exclusive\_channel attribute from the /items resource. **To create or modify the publication channel correctly you must use the array channels** otherwise you will receive an error message: Item attribute EXCLUSIVE\_CHANNEL is no longer supported.

## Consult items

Nota:

From now it is possible to obtain a new parameter **"value\_type"** within the detail of the attributes of the items. This field provides information on the type of data that is expected. example: string, number, etc.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/$ITEM_ID
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA1136716168
```

Response:

```javascript
{
"id": "MLA1136716168",
   "site_id": "MLA",
   "title": "Zapatillas Avid Fof - Test Item",
   "seller_id": 1108966308,
   "category_id": "MLA109027",
   "official_store_id": null,
   "price": 15000,
   "base_price": 15000,
   "original_price": null,
   "currency_id": "ARS",
   "initial_quantity": 2,
   "available_quantity": 2, --- No aparece sin token propietario
   "sold_quantity": 0, --- No aparece sin token propietario
   "sale_terms": [],
   "buying_mode": "buy_it_now",
   "listing_type_id": "gold_pro",
   "start_time": "2022-05-10T21:55:46.000Z", --- No aparece sin token propietario
   "historical_start_time": "2022-05-10T21:55:46.000Z", --- No aparece sin token propietario
   "stop_time": "2042-05-05T04:00:00.000Z", --- No aparece sin token propietario
   "condition": "new",
   "permalink": "https://articulo.mercadolibre.com.ar/MLA-1136716168-zapatillas-avid-fof-test-item-_JM",
   "thumbnail_id": "963513-MLA49868862376_052022",
   "thumbnail": "http://http2.mlstatic.com/D_963513-MLA49868862376_052022-I.jpg",
   "secure_thumbnail": "https://http2.mlstatic.com/D_963513-MLA49868862376_052022-I.jpg",
   "pictures": [
       {
           "id": "963513-MLA49868862376_052022",
           "url": "http://http2.mlstatic.com/D_963513-MLA49868862376_052022-O.jpg",
           "secure_url": "https://http2.mlstatic.com/D_963513-MLA49868862376_052022-O.jpg",
           "size": "500x411",
           "max_size": "898x739",
           "quality": ""
       }
   ],
   "video_id": null,
   "descriptions": [],
   "accepts_mercadopago": true,
   "non_mercado_pago_payment_methods": [],
   "shipping": {
       "mode": "not_specified",
       "methods": [],
       "tags": [
           "adoption_required"
       ],
       "dimensions": null,
       "local_pick_up": false,
       "free_shipping": false,
       "logistic_type": "not_specified",
       "store_pick_up": false
   },
   "international_delivery_mode": "none",
   "seller_address": {
       "id": 0
   },
   "seller_contact": null,
   "location": {},
   "coverage_areas": [],
   "attributes": [
       {
           "id": "AGE_GROUP",
           "name": "Edad",
           "value_id": "6725189",
           "value_name": "Adultos"
       },
       {
           "id": "BRAND",
           "name": "Marca",
           "value_id": "11823494",
           "value_name": "Propia"
       },
       {
           "id": "EXCLUSIVE_CHANNEL",
           "name": "Canal exclusivo",
           "value_id": "7865259",
           "value_name": "Mercado Libre"
       },
       {
           "id": "FOOTWEAR_TYPE",
           "name": "Tipo de calzado",
           "value_id": "517583",
           "value_name": "Zapatilla"
       },
       {
           "id": "GENDER",
           "name": "Género",
           "value_id": "339666",
           "value_name": "Hombre"
       },
       {
           "id": "ITEM_CONDITION",
           "name": "Condición del ítem",
           "value_id": "2230284",
           "value_name": "Nuevo"
       },
       {
           "id": "MODEL",
           "name": "Modelo",
           "value_id": null,
           "value_name": "EQ2122",
           "values": [
               {
                   "id": null,
                   "name": "EQ2122",
                   "struct": null
               }
           ],
           "value_type": "string"
       },
       {
           "id": "SIZE_GRID_ID",
           "name": "ID de la guía de talles",
           "value_id": null,
           "value_name": "210052"
       },
       {
           "id": "STYLE",
           "name": "Estilo",
           "value_id": "6694773",
           "value_name": "Urbano"
       }
   ],
   "listing_source": "",
   "variations": [
       {
           "id": 174497701554,
           "price": 15000.00,
           "attribute_combinations": [
               {
                   "id": "COLOR",
                   "name": "Color",
                   "value_id": "52049",
                   "value_name": "Negro"
               },
               {
                   "id": "SIZE",
                   "name": "Talle",
                   "value_id": "11505183",
                   "value_name": "45,0 AR"
               }
           ],
           "available_quantity": 1,
           "sold_quantity": 0,
           "sale_terms": [],
           "picture_ids": [
               "963513-MLA49868862376_052022"
           ],
           "catalog_product_id": null
       },
       {
           "id": 174497701555,
           "price": 15000.00,
           "attribute_combinations": [
               {
                   "id": "COLOR",
                   "name": "Color",
                   "value_id": "52049",
                   "value_name": "Negro"
               },
               {
                   "id": "SIZE",
                   "name": "Talle",
                   "value_id": "11505178",
                   "value_name": "44,0 AR"
               }
           ],
           "available_quantity": 1,
           "sold_quantity": 0,
           "sale_terms": [],
           "picture_ids": [
               "963513-MLA49868862376_052022"
           ],
           "catalog_product_id": null
       }
   ],
   "status": "active",
   "sub_status": [],
   "tags": [
       "test_item",
       "good_quality_picture",
       "good_quality_thumbnail",
       "immediate_payment"
   ],
   "warranty": null,
   "catalog_product_id": null,
   "domain_id": "MLA-SNEAKERS",
   "parent_item_id": null,
   "deal_ids": [],
   "automatic_relist": false,
   "date_created": "2022-05-10T21:55:46.000Z",
   "last_updated": "2022-05-22T09:49:16.725Z",
   "total_listing_fee": null,
   "health": 0.85,
   "catalog_listing": false,
   "channels": [
       "marketplace", --- No aparece sin token propietario   ],
   "bundle": null  
}
```

## Attributes

Some of the fields are mandatory when you create an item, while some others can be skipped or will be automatically added to the item. They will define how the item is displayed, how buyers can purchase it and the position on search results among other variables.

### Title

Importante:

In the new way of publishing **(User Products)**the title field will change its function and should not be included in the publication. It is necessary to identify the relevant activation dates in [User Products documentation](https://developers.mercadolibre.com.ar/es_ar/precio-variacion#:~:text=Publicar%20un%20%C3%ADtem-,Importante,-%3A) .

The title is the key for buyers to find your product. Therefore, it should be as explicit as possible.

- Generate the title with **Product + Brand + product model + some specifications that help identify the product**.
- **Avoid in the title information of other services**, such as returns, free shipping or installment payments because your information will be seen by your buyers next to the product, without having to enter the publication.
- **If your product is new, used or refurbished, do not include it in the title**, upload it in the features and we will show it in the detail of the publication.
- **If you sell the same product but with different colors, do not put the color in the title**. Better create variants, so everything will be in a single publication.
- If you only have stock of a certain color, **load the color when publishing or in the characteristics section so that your buyers read the complete technical sheet, but you can add it in the title since it would be a publication that only sells a variant**.
- **If you make a discount we will also indicate it showing the percentage of the promotion**, we also have a special label to call attention. No need to add it in the title.
- Separate words with spaces, **do not use punctuation or symbols**.
- Check **have no spelling errors**.
- It is not allowed to mention stock if you do it your publication will be moderated. The limit of the publication title is set by the category to which it belongs ("max\_title\_length").

For example: HP Dual Core 425 LED 14 320 GB 4 GB Wifi HDMI Notebook

Note:

You can always make all the changes you need making a PUT on an item's resource modifying the tittle field when sold\_quantity be 0.

### Description

Note:

As of September 1, 2021 the content of the "descriptions" field will be deactivated. When doing a GET to / items, this field will show an empty array.  
To create the description, you must first create the publication without a description and then submit the description via a POST to **/items/$ITEM\_ID/description** resource.

A detailed description will improve your chances to sell a product and will save time from answering questions. Check our [item descriptions guide](../../en_us/item-description-2/).

### Condition

When listing an item you need to declare if the condition is new, used or not\_specified. This attribute is mandatory to complete a list operation.

Nota:

From **June 28th** for items used in the **moda/sports category** you can only create items with available quantit = 1, and when making the sale, the item will change to status: closed. This functionality only applies to Argentina, Brazil, Mexico and Colombia.

### Available quantity

Note:

This field can only be visible when the item with the token owner of this listing is consulted. What means that only the seller will be able to see the information of his listing. If the request is made with a token that does not belong to the owner, this field will not be available.

This attribute defines the stock, that's the number of products available for selling on this item. The highest value is defined by the chosen to list type. See more details in the [listing type](../../en_us/listing-types-item-upgrades-tutorial/) section.

Also, when you want to publish Fulfillment products you can specify the available quantity to zero, modifying the **available\_quantity** field to 0. In this way, the publication will be created with a **paused** status and **out\_of\_stock** sub-status. This will allow you to not have sales and cannot deliver them due to lack of logistics. What happens when you PUT items and have no stock? It supports the same operations as an item paused due to lack of stock, that is, you will not be able to activate it and you must add units so that it is activated automatically.

Example:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -d

'{
    ...
    "available_quantity": 0,
    ...
}'
 
https://api.mercadolibre.com/items
```

Response:

```javascript
{
    "id": "MLB1374737433",
    "site_id": "MLB",
    "title": "Item De Teste - Não Comprar",
    "base_price": 10,
    ...
    "initial_quantity": 0,
    "available_quantity": 0,
    "sold_quantity": 0,
    ...
    "status": "paused",
    "sub_status": [
        "out_of_stock"
    ],
    ...
}
```

Important:

This possibility applies only to Argentina, Mexico and Brazil where we operate Fulfillment.

### Pictures

Nice pictures can make an item more appealing and give buyers a better idea of the item’s appearance. Basically, you should add an array of up to six URL pictures on the Json.

```javascript
{
 ....
 "pictures":[
  {"source":"http://yourServer/path/to/your/picture.jpg"},
  {"source":"http://yourServer/path/to/your/otherPicture.gif"},
  {"source":"http://yourServer/path/to/your/anotherPicture.png"}
 ]
 ...
}
```

We highly recommend you don’t use slow servers to host your pictures, since this can lead to disadvantages when listing. You can also add or change pictures to your item here later on. Please read more about this topic to know [which kind of pictures are allowed and how to work with them here](https://developers.mercadolibre.com.ar/en_us/working-with-pictures?nocache=true).

### Category

Sellers must define a category in MercadoLibre site. This attribute is mandatory and only accepts pre-established ids. For more information read categories guide. To get a category suggestion [read this article](../../en_us/category-prediction-resource/).

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/categories/$CATEGORY_ID
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/categories/MLA1055
```

Response:

```javascript
{
  "id": "MLA1055",
  "name": "Celulares y Smartphones",
  "picture": "http://resources.mlstatic.com/category/images/fdca1620-3b63-4af2-bc0b-aeed17048d5d.png",
  "permalink": null,
  "total_items_in_this_category": 79627,
  "path_from_root": [
    {
      "id": "MLA1051",
      "name": "Celulares y Teléfonos"
    },
    {
      "id": "MLA1055",
      "name": "Celulares y Smartphones"
    }
  ],
  "children_categories": [
  ],
  "attribute_types": "variations",
  "settings": {
    "adult_content": false,
    "buying_allowed": true,
    "buying_modes": [
      "buy_it_now",
      "auction"
    ],
    "catalog_domain": "MLA-CELLPHONES",
    "coverage_areas": "not_allowed",
    "currencies": [
      "ARS"
    ],
    "fragile": false,
    "immediate_payment": "required",
    "item_conditions": [
      "not_specified",
      "used",
      "new"
    ],
    "items_reviews_allowed": false,
    "listing_allowed": true,
    "max_description_length": 50000,
    "max_pictures_per_item": 12,
    "max_pictures_per_item_var": 10,
    "max_sub_title_length": 70,
    "max_title_length": 60,
    "maximum_price": null,
    "minimum_price": 22,
    "mirror_category": null,
    "mirror_master_category": null,
    "mirror_slave_categories": [
    ],
    "price": "required",
    "reservation_allowed": "not_allowed",
    "restrictions": [
    ],
    "rounded_address": false,
    "seller_contact": "not_allowed",
    "shipping_modes": [
      "me1",
      "custom",
      "me2",
      "not_specified"
    ],
    "shipping_options": [
      "custom",
      "carrier"
    ],
    "shipping_profile": "optional",
    "show_contact_information": false,
    "simple_shipping": "optional",
    "stock": "required",
    "sub_vertical": "smartphones",
    "subscribable": false,
    "tags": [
    ],
    "vertical": "consumer_electronics",
    "vip_subdomain": "articulo",
    "buyer_protection_programs": [
      "delivered",
      "undelivered"
    ],
    "status": "enabled"
  },
  "meta_categ_id": null,
  "attributable": false,
  "date_created": "2018-04-25T08:12:56.000Z"
}
```

**Considerations**  
With the /categories resource, you will be able to recognize whether the category is enabled on the site you want to publish.  
With **listing\_allowed** and **status** fields you can identify whether the categories are enabled for publication on the site. To identify those that are enabled, the **listing\_allowed** field should have **true** value and the **status** field, **enabled** value.

### Purchase method

The immediate buying mode ("buying\_mode"="buy\_it\_now") guarantees that an order will only appear for the seller when the payment is approved.

### Price

It is a required attribute: when you define a new item, it must have a price. To consult and edit prices you must use the [Prices API](../../en_us/price-apl).

### Currency

Besides price, you need to define a currency. This one is also a mandatory attribute. You need to define it using a pre-established id. Calling our Currencies resource you will know which Id to send.

### Payment methods

It’s important that you have in consideration which payment methods you have available to work with. This will vary depending on the country you are currently working. Check [this guide to know more about it](../../en_us/products-sync-listings/).

### Shipping

Shipping details are not mandatory, but there are many options to choose, and shipping the products you sell is a competitive advantage. Know more about [Mercado Envíos](../../en_us/ship-products/).

### Product Identifiers

The identifiers are specific codes that help to locate a product.

### SKU

This information will help your sellers to identify, locate and internally track a product. We only take into account the information loaded in the SELLER\_SKU attribute. Learn more about [variations considerations](https://developers.mercadolibre.com.ar/en_us/variations#Considerations).

### Variations

With Variations you can count in the same publication all the variants of the item, maintaining even differential stock for each one. In this way, when you receive a purchase, you will see in the purchase order the color and size chosen by the buyer, thus facilitating the after-sales process. Lear more about [Variations](https://developers.mercadolibre.com.ar/en_us/variations).

## Listing type

[Learn about the different types of listings](https://developers.mercadolibre.com.ar/en_us/listing-types-item-upgrades-tutorial) (listing\_types).

## An item condition

To define if a product is new, used or refurbished, you will need to send the “item\_condition” attribute with the value you intend to give. We recommend you to review [the Attribute documentation](https://developers.mercadolibre.com.ar/en_us/attributes?nocache=true) to learn about category attributes and supported values. 

Note:

While today it is allowed to send if an item is new or used in the “condition” field, it should be placed as attribute in the case of “reacondicionado”.

Example:

```javascript
 curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/categories/MLA30835/attributes
```

Response:

```javascript
{
    "id": "ITEM_CONDITION",
    "name": "Condición del ítem",
    "tags": {
      "hidden": true
    },
    "hierarchy": "ITEM",
    "relevance": 2,
    "value_type": "list",
    "values": [
      {
        "id": "2230284",
        "name": "Nuevo"
      },
      {
        "id": "2230581",
        "name": "Usado"
      },
      {
        "id": "2230582",
        "name": "Reacondicionado"
      }
    ],
  },
```

Important:

When the listing has “reacondicionado” condition, you need to load the Product Warranty in "sale\_terms".

## Product warranty

Within an item “sale\_terms” section, define the warranty of the listed product. For this, the information should have a combination of attributes:  
**Warranty Type:** represents the forms that warranty can take. For example, seller or factory warranty, etc.  
**Warranty Time:** represents the time that warranty will be in force.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/categories/$CATEGORY_ID/sale_terms
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/categories/MLA1642/sale_terms
```

Response:

```javascript
{
    "id": "WARRANTY_TYPE",
    "name": "Tipo de garantía",
    "tags": {
    },
    "hierarchy": "SALE_TERMS",
    "relevance": 2,
    "value_type": "list",
    "values": [
      {
        "id": "2230279",
        "name": "Garantía de fábrica"
      },
      {
        "id": "2230280",
        "name": "Garantía del vendedor"
      }
    ]
  },
  {
    "id": "WARRANTY_TIME",
    "name": "Tiempo de garantía",
    "tags": {
    },
    "hierarchy": "SALE_TERMS",
    "relevance": 2,
    "value_type": "number_unit",
    "value_max_length": 255,
    "allowed_units": [
      {
        "id": "días",
        "name": "días"
      },
      {
        "id": "años",
        "name": "años"
      },
      {
        "id": "meses",
        "name": "meses"
      }
    ],
    "default_unit": "días"
  },
```

Note:

Keep in mind that when setting an item as reconditioned it should be done with a minimum 90-day guarantee. Look more about [Publication Policies](https://www.mercadolibre.com.ar/ayuda/Politicas-de-Publicacion_s1011#3737).

## Item tags

Resource Tag Description Attributes incomplete\_technical\_specs The item's technical specifications (attributes) are incomplete. These items are losing exposure. Attributes extended\_warranty\_eligible An extended warranty can be applied to the purchase of the item. Catalog catalog\_listing\_eligible Eligible listings for the catalog Catalog catalog\_boost Listings that were automatically optimized by Mercado Libre Catalog catalog\_forewarning Marketplace listings that must be published in the catalog before being moderated to avoid friction with the seller. Catalog catalog\_only\_restricted Exclusive domains Catalog opt\_obey Mandatory domains Price per variation user\_product\_listing Item in the new User Products model Price per variation variations\_migration\_source Old item that went through UPTIN migration and was finished. Price per variation variations\_migration\_pending Item in the process of creation through migration to the new user products model, since the UPTIN action. Price per variation variations\_migration\_uptin Items created through migration to the new user products model, since the UPTIN action. Multisource warehouse\_management Item under the Multisource model Images poor\_quality\_picture / poor\_quality\_thumbnail The item's images are of poor quality. Images good\_quality\_thumbnail / good\_quality\_picture The item's images are of good quality. Images unknown\_quality\_picture The quality of the item's images is unknown. Price not\_market\_price Listings with uncompetitive prices. Promotion loyalty\_discount\_eligible A loyalty discount can be applied. Promotion today\_promotion Indicates that the item applies to short-term promotional offers. list product non\_buyable\_as\_standalone The item cannot be purchased alone; it must be part of a kit. Relist dragged\_visits Indicates that the item is relisted, and the visits from its parent item are counted. Relist dragged\_bids\_and\_visits Indicates that the item is relisted, and the sales and visits from its parent item are counted. Relist relist Indicates that the item has already been relisted. In this case, it cannot be relisted again. Relist free\_relist Indicates whether the item was relisted for free, under the PHQLV modality. Orders cart\_eligible The item can be added to the cart. Payment immediate\_payment Indicates that the item only accepts MercadoPago as a payment method. Shipping fbm\_in\_process When the seller schedules shipping to full (inbound), the item is paused. Upon arrival at FBM, the tag is removed. Shipping optional\_me1\_chosen The account has ME1 and ME2 allowed, and the item has ME1 as an optional shipping method. Shipping lost\_me2\_by\_dimensions The seller is restricted from shipping via ME2 because the package dimensions exceed the allowed limit. Shipping adoption\_required Item not\_specified that hasn't yet adopted ME2, which is recommended. Shipping mandatory\_free\_shipping The item is priced above the minimum to offer free shipping on the site. As a result, the item has free\_shipping=true and this tag. Shipping me2\_available The item can be offered as ME2 Shipping self\_service\_in The item has Flex activated Shipping self\_service\_out The item does not have Flex activated Shipping self\_service\_available The item is eligible for Flex but is not activated Moderation moderation\_penalty Item with a restriction. If the item is only for the marketplace, the status is paused; otherwise, it is active. Brand brand\_verified Items from an official store that have been validated. CPG supermarket\_eligible Supermarket items. VIS hirable The item is a service (classified), on which the "hire" action can be performed. CBT cbt\_item CBT items Test test\_item Test items

## Gender of a publication

Note:

Starting from late July 2023, we will begin impacting domains that contain the gender attribute, which will be changed to a "list" type, adding a new option called "Gender neutral kid", as well as a new validation that will prevent creating items where the title refers to a gender different from the one specified in "GENDER". In order to carry out tests on this change and adapt integrations, we have pre-configured a testing domain SNEAKERS\_TEST

In some domains **/domains/$DOMAIN\_ID/technical\_specs** you will find the main attribute for the gender, **"id": "GENDER"**. More information on domains and categories can be found [here](/en_us/categories-and-listings).

This attribute aims to detail the gender of an item, enabling easier segmentation when buyers want to perform selective searches within the listings. Example: Hydraulic Disc Bicycle - Adult.

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/219224449253-Captura-de-Pantalla-2023-06-27-a-la-s--13.17.21.png)

The gender attribute is a closed list that only allows the following options:

```javascript
{
    "attributes": [
{
"id": "GENDER",
"name": "Género",
"value_type": "list",
"tags": [
"catalog_listing_required",
"grid_template_required",
"grid_filter",
"catalog_required",
"required"
],
"values": [
{
"id": "339665",
"name": "Mujer"
},
{
"id": "339666",
"name": "Hombre"
},
{
"id": "339668",
"name": "Niñas"
},
{
"id": "339667",
"name": "Niños"
},
{
"id": "110461",
"name": "Sin género"
},
{
"id": "19159491",
"name": "Sin género infantil"
},
{
"id": "371795",
"name": "Bebés"
}
],
"hierarchy": "PARENT_PK",
"relevance": 1
}
],
}
```

The option "Gender neutral" will be focused on segmenting unisex publications for adults, while "Gender neutral kid" will be only focused on unisex publications for children.

The GENDER attribute is mainly found in fashion domains, for which you must remember that the [size chart](/en_us/first-steps-mkt) is mandatory. After the PUT or POST of the /items resource, if you used a gender that is not listed in the technical specifications, it will display the following error, preventing the creation of the new publication until you make the respective correction:

```javascript
{
"department": "structured-data",
"cause_id": 2516,
"type": "error",
"code": "error.item.attribute.business_conditional.value_name",
"references": [
"item.name"
],
"message": "Attribute [GENDER] is not valid"
}
```

Additionally, the title attribute for publications where the GENDER is required, will be validated and will return an error if the title refers to a different genre than the one specified in the "id" attribute: "GENDER", you can check the details of the [validations](/en_us/validations).

## Listing an item

Importante:

Starting September 2, 2024, we will disable the option to include YouTube videos in posts. In the meantime, we recommend that sellers with a green reputation or higher, from Argentina, Brazil and Mexico, with videos on YouTube migrate them to [Clips](https://vendedores.mercadolibre.com.ar/nota/sube-videos-de-tus-productos-para-llegar-a-mas-personas).

You’re ready to list your first item. Notice you’ll need an access\_token to make it. If you have questions regarding how to get your access token, please go back to [the Authenticate tutorial](../../en_us/products-authentication-authorization/). We also recommend using test users to publish test articles. If you don't have your user test yet, see [how to perform tests and get yours](../../en_us/start-testing/). You can create a Json for your item basing on the following example, or send it as it is, and you’ll be listing a sample product on the site:

Request:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -d '{
  "title":"Item de test - No Ofertar",
  "category_id":"MLA3530",
  "price":350,
  "currency_id":"ARS",
  "available_quantity":10,
  "buying_mode":"buy_it_now",
  "condition":"new",
  "listing_type_id":"gold_special",
  "sale_terms":[
     {
        "id":"WARRANTY_TYPE",
        "value_name":"Garantía del vendedor"
     },
     {
        "id":"WARRANTY_TIME",
        "value_name":"90 días"
     }
  ],
  "pictures":[
     {
        "source":"http://mla-s2-p.mlstatic.com/968521-MLA20805195516_072016-O.jpg"
     }
  ],
  "attributes":[
     {
        "id":"BRAND",
        "value_name":"Marca del producto"
     },
     {
        "id":"EAN",
        "value_name":"7898095297749"
     }
  ]
}' 'https://api.mercadolibre.com/items
```

Example:

```javascript
{
    "title": "Item de test - No Ofertar",
    "category_id": "MLA3530",
    "user_product_id": "MLAU1234567",
    "price": 350,
    "currency_id": "ARS",
    "available_quantity": 10,
    "buying_mode": "buy_it_now",
    "condition": "new",
    "listing_type_id": "gold_special",
    "description": {
        "plain_text": "Descripción con Texto Plano  \n"
    },
    "video_id": "YOUTUBE_ID_HERE",
    "sale_terms": [
        {
            "id": "WARRANTY_TYPE",
            "vale_name": "Garantía del vendedor"
        },
        {
            "id": "WARRANTY_TIME",
            "value_name": "90 días"
        }
    ],
    "pictures": [
        {
            "source": "http://mla-s2-p.mlstatic.com/968521-MLA20805195516_072016-O.jpg"
        }
    ],
    "attributes": [
        {
            "id": "BRAND",
            "value_name": "Marca del producto"
        },
        {
            "id": "EAN",
            "value_name": "7898095297749"
        }
    ]
}
```

Note:

If you have any trouble when trying to list, check the API Error Codes Reference chart at the end of this guide.

## Items with mandatory Mercado Pago

Just as a user or a category can be marked with immediate payment, so can an item. This scenario occurs when:

- All MLB listings.
- All MLA and MLM listings from the sale of products with "condition: new".
- Official Store listings in every country with Mercado Pago.
- There are categories with Mercado Pago as the only choice. For more information, visit: “[Categories with immediate payment](../../en_us/list-products/#Categories). User automatically marked to have transactions routed through this flow with the mark “immediate\_payment” in the users API.
- [](../../es_ar/producto-consulta-usuarios#Mercado-Pago)[Seller “auto” marked to have sales routed through this flow](../../en_us/products-manage-users#Mercado-Pago).

Learn more about the [Validations to publish](https://developers.mercadolibre.com.ar/en_us/validations?nocache=true)[.]()

## List an item with immediate payment

If you want to get your item paid only with Mercado Pago, you may set that choice when you create a new item, or when you change an active one. To that end, use the tag “inmediate\_payment”.

Request:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -d
'{
    "title": "Item de teste - Não Comprar",
    "category_id": "MLB437616",
    "price": 10,
    "currency_id": "BRL",
    "available_quantity": 1,
    "buying_mode": "buy_it_now",
    "listing_type_id": "gold_special",
    "condition": "new",
    "description": "Publicação de teste, não comprar",
    "video_id": "YOUTUBE_ID_HERE",
    "tags": [
        "immediate_payment"
    ],
   "sale_terms":[
      {
         "id":"WARRANTY_TYPE",
         "value_name":"Garantia do vendedor"
      },
      {
         "id":"WARRANTY_TIME",
         "value_name":"90 días"
      }
   ],

    "pictures": [
         {
    "source": "https://www.motorino.com.br/site/wp-content/uploads/2018/01/produto_de_teste_amarelo_4_2_20171020224326-400x400.jpg"}

    ]
}
 
'
 
https://api.mercadolibre.com/items
```

Response:

```javascript
{
    "id": "MLB1548991737",
    "site_id": "MLB",
    "title": "Item De Teste - Não Comprar",
    "seller_id": 419059118,
    "category_id": "MLB437616",
    "user_product_id": "MLAU1234567",
    "official_store_id": null,
    "price": 10,
    "base_price": 10,
    "original_price": null,
    "inventory_id": null,
    "currency_id": "BRL",
    "initial_quantity": 1,
    "available_quantity": 1,
    "sold_quantity": 0,
    "sale_terms": [
        {
            "id": "WARRANTY_TYPE",
            "name": "Tipo de garantia",
            "value_id": "2230280",
            "value_name": "Garantia do vendedor"
            ]
        },
        {
            "id": "WARRANTY_TIME",
            "name": "Tempo de garantia",
            "value_id": null,
        }
    ],
    "buying_mode": "buy_it_now",
    "listing_type_id": "gold_special",
    "start_time": "2020-06-05T13:48:44.964Z",--- No aparece sin token propietario
    "stop_time": "2040-05-31T04:00:00.000Z",--- No aparece sin token propietario
    "end_time": "2040-05-31T04:00:00.000Z",
    "expiration_time": "2020-08-24T13:48:45.039Z",
    "condition": "new",
    "permalink": "http://produto.mercadolivre.com.br/MLB-1548991737-item-de-teste-no-comprar-_JM",
    "pictures": [
        {
            "id": "830983-MLB42088778762_062020",
            "url": "http://http2.mlstatic.com/resources/frontend/statics/processing-image/1.0.0/O-PT.jpg",
            "secure_url": "https://http2.mlstatic.com/resources/frontend/statics/processing-image/1.0.0/O-PT.jpg",
            "size": "500x500",
            "max_size": "500x500",
            "quality": ""
        }
    ],
    "video_id": null,
    "descriptions": [ ],
    "accepts_mercadopago": true,
    "non_mercado_pago_payment_methods": [],
    "shipping": {
        "mode": "me1",
        "local_pick_up": false,
        "free_shipping": false,
        "methods": [],
        "dimensions": null,
        "tags": [],
        "logistic_type": "default",
        "store_pick_up": false
    },
    "international_delivery_mode": "none",
    "seller_address": {
        "id": 1032937241,
        "comment": "",
        "address_line": "Rua Exemplo 123",
        "zip_code": "01234100",
        "city": {
            "id": "BR-SP-44",
            "name": "São Paulo"
        },
        "state": {
            "id": "BR-SP",
            "name": "São Paulo"
        },
        "country": {
            "id": "BR",
            "name": "Brasil"
        },
        "latitude": -23.6251244,
        "longitude": -46.7441422,
        "search_location": {
            "neighborhood": {
                "id": "TUxCQlZJTDI1OTI",
                "name": "Vila Andrade"
            },
            "city": {
                "id": "TUxCQ1NQLTkxMjE",
                "name": "São Paulo Zona Sul"
            },
            "state": {
                "id": "TUxCUFNBT085N2E4",
                "name": "São Paulo"
            }
        }
    },
    "seller_contact": null,
    "location": {},
    "geolocation": {
        "latitude": -23.6251244,
        "longitude": -46.7441422
    },
    "coverage_areas": [],
    "attributes": [
        {
            "id": "ITEM_CONDITION",
            "name": "Condição do item",
            "value_id": "2230284",
            "value_name": "Novo"
        }
    ],
    "listing_source": "",
    "variations": [],
    "thumbnail": "http://http2.mlstatic.com/resources/frontend/statics/processing-image/1.0.0/I-PT.jpg",
    "status": "active",
    "sub_status": [],
    "tags": [
        "cart_eligible",
        "immediate_payment",
        "test_item"
    ],
    "warranty": "Garantia do vendedor: 90 días",
    "catalog_product_id": null,
    "domain_id": null,
    "seller_custom_field": null,
    "parent_item_id": null,
    "deal_ids": [],
    "automatic_relist": false,
    "date_created": "2020-06-05T13:48:45.176Z",
    "last_updated": "2020-06-05T13:48:45.176Z",
    "health": null,
    "catalog_listing": false,
    "item_relations": []
}
```

## Categories with immediate payment

Some categories within MercadoLibre require Mercado Pago as the only choice. To find out if the category where you wish to list is one of them, check the following:

```javascript
curl - X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/sites/categories/$CATEGORY_ID

"immediate_payment": "required",
    "item_conditions": [
      "new",
      "not_specified",
      "used"
    ],
```

If the "immediate\_payment" field is set as "required," Mercado Pago is mandatory. If it reads "optional,” it also accepts “As agreed with the seller”.

## List an official store item

Listing an official store item is just like listing any other item, except that you also need to add the official\_store\_id attribute on the JSON.

Important:

The **limited listing brands** may only be offered by **official stores and sellers certified by the brands.** . This measure applies in the following countries:  
\- In **Argentina:**Adidas, Reebok and Nike  
\- In **Brasil:** Adidas, Reebok and Nike  
\- In **Colômbia:** Adidas, Reebok and Nike  
\- In **México:** Adidas, Reebok and Nike  
\- In **Peru:** Adidas and Reebok  
\- In **Chile:** Adidas and Rebook

Example:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -d
'{
   "title":"Item de Test -No Ofertar",
   "category_id":"MLA5529",
   "price":10,
   "official_store_id":1,
   "currency_id":"ARS",
   "available_quantity":1,
   "buying_mode":"buy_it_now",
   "listing_type_id":"bronze",
   "condition":"new",
   "description":{
      "plain_text":"Item:, Ray-Ban WAYFARER Gloss Black RB2140 901 Model: RB2140. Size: 50mm. Name: WAYFARER. Color: Gloss Black. Includes Ray-Ban Carrying Case and Cleaning Cloth. New in Box"
   },
   "video_id":"YOUTUBE_ID_HERE",
   "sale_terms":[
      {
         "id":"WARRANTY_TYPE",
         "value_name":"Garantia do vendedor"
      },
      {
         "id":"WARRANTY_TIME",
         "value_name":"90 días"
      }
   ],

   "pictures":[
      {
         "source":"http://upload.wikimedia.org/wikipedia/commons/f/fd/Ray_Ban_Original_Wayfarer.jpg"
      },
      {
         "source":"http://en.wikipedia.org/wiki/File:Teashades.gif"
      }
   ]
}'https://api.mercadolibre.com/items
```

Note:

If your store is multi-brand you need to specify the official\_store\_id of the brand where you want to list that item. Check our [Official Stores guide](../../en_us/official-stores/) to know more about this topic.

## Error

Example of a response with an error:

```javascript
{   "message": "body.invalid_fields",
   "error": "The fields [$FIELD_ID] are invalid for requested call.",
   "status": 400,
   "cause": []
}
```

In the following, you can see details of the errors:

We detail the most common errors when you execute the PUT/POST from the api of /items/ in the following table.  
If the response returns an **error** code: **validation\_error**, it indicates that the validation flow has been activated.

Error Error message Description Possible solution item.category\_id.invalid Category $categoryId does not exist. Category does not exist. See the [categories available on the site](https://developers.mercadolibre.com.mx/es_ar/categoriza-productos#Categor%C3%ADas-por-Site) body.invalid\_fields The fields \[$FIELD\_ID] are invalid for requested call. The $FIELD\_ID is invalid for the category. See valid fields in /categories/$CATEGORY\_ID seller.unable\_to\_list The seller is not allowed to publish. The seller cannot post for certain cause. Identify the **cause** field in the response. - Find out the meaning of **cause** under /users#options, set the status to list, and you will see the meaning.  
\- Try to make the first manual posting from My Account in Mercado Libre to see the warnings in the flow.

## HTTP response code references

If any information could not be obtained, items can return the http code 206. Keep in mind that in most cases, the information you receive will be enough to continue working.  
In the response header X-Content-Missing you will find the name of the fields without information, which could be **location**, **geolocation** and/or **seller\_address**.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/$ITEM_ID
```

Response http 200 OK:

```javascript
{
    "id": "",
    "seller_id": ,
    ...
    "seller_address": {
        "id": 1011241361,
        "address_line": "Evaristo Lillo 112",
        "zip_code": "7200",
        "comment": "this is a comment",
        "city": {
            "id": "TUxDQ0xBUzU2MTEz",
            "name": "Las Condes"
        },
        "state": {
            "id": "CL-RM",
            "name": "RM (Metropolitana)"
        },
        "country": {
            "id": "CL",
            "name": "Chile"
        },
        "search_location": {
            "neighborhood": {
                "id": "",
                "name": ""
            },
            "city": {
                "id": "TUxDQ0xBUzU2MTEz",
                "name": "Las Condes"
            },
            "state": {
                "id": "TUxDUE1FVEExM2JlYg",
                "name": "RM (Metropolitana)"
            }
        },
        "latitude": -33.4140509,
        "longitude": -70.5814078
    },
    "location": {},
    "geolocation": {
        "latitude": -33.4140509,
        "longitude": -70.5814078
    },
    ...
}
```

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/$ITEM_ID
```

Response :

```javascript
{
    "id": "",
    "seller_id": ,
    ...
    "seller_address": {
        "id": 1011241361
    },
    "location": {},
    "geolocation": {},
    ...
}
```

**Related articles:** [Add and configure shipping options for your products](../../en_us/ship-products/) and [Know listing prices and exposures](../../en_us/listing-types-item-upgrades-tutorial/).

**Next topic**: [Ship products](../../en_us/ship-products/)