# Variations

**Tags:** Variations,variation
**Created:** 2020-03-19T00:10:57Z
**Last Updated:** 2025-12-15T10:14:32Z

---

## Variations

Important:

A new process for "flattening" variants will apply exclusively to monovariant listings (those with just 1 variant ID). The objective is to improve coverage of listings in different projects that will help us in the conversion and sales of our sellers. We will apply this process in different waves, at the same time that we turn on 11 domains in all sites for Dropshipping logistic (SQUISHIES, BOARD\_AND\_CARD\_GAMES, PARTY\_DECORATION\_KITS, PUZZLES, ACTION\_FIGURES, STUFFED\_TOYS, TOY\_BUILDING\_SETS, DOLLS, REMOTE\_CONTROL\_TOY\_VEHICLES, INFANTS\_SORTING\_AND\_STACKING\_TOYS, DOLLHOUSES, PARTY\_AND\_COSTUME\_MASKS\_AND\_HELMETS). Sellers can still create listings with 1 variation, but we will implement a daily process to "flatten" them afterward.

This guide will explain what to do if, for example, you have to list the same shoe model, but in different colors and sizes. Variations will help you describe all item variations in the same listing, also keeping a differential stock for each of them. This way, when your receive a purchase, the purchase order will show the color and size chosen by the buyer for a smooth post-sale process. Good news! Variations are not applicable to apparel only: you can also use them in other categories. For example, in electric drills, changing items for voltage. Therefore, you will be able to sell 110V- and 220V-drills in the same listing.

## Benefits

- The buyer can see the different alternatives and their availability in the same listing.
- Fewer questions between buyer and seller.
- The purchase order will show the color and size chosen by the buyer for a smooth post-sale process and no claims.
- Improved stock control and handling.

## Considerations

- You can send the stock code (SKU) for each variation. The correct way to keep the SKU is in the item attribute. This attribute is the SELLER\_SKU, leaving the seller\_custom\_field field for internal use by the seller and without relationship between the two fields.
- In the /orders resource, both fields are currently available as in the /items resource and these are not combinable.
- Whenever the item has the attribute SELLER\_SKU, both the /items and /orders will display the value of the attribute. You must always load the value in the attribute for it to be considered.
- The price must be the same for each variation. Only the highest price will be seen in the VIP and will also be taken into account at the time the payment is made.

## List items with variations

To list items with variations, you should choose the category where you want to list. Once selected, you must check if the same allows variations identifying those attributes with the allow\_variations tag. This type of attributes must be loaded in the section attribute\_combinations, within variations, keeping in mind that you must load them for all the variations.

In turn, you can send the attributes property for each variation, specifying the item characteristics typical of each variation. In this section you can upload the attributes identified with the variation\_attribute tag in the API. For example, if you sell a mobile phone in different colors and have a barcode for each one, you can upload it for each variation in the attributes section.

Note:

\- To learn about mandatory variation attributes, look for those with tags required = true. A category with allow variation but without attributes with this tag means that you can create items without variations.  
\- The VIP does not currently, but will in the future, show attributes with the variation\_attribute tag. We encourage you to complete them in order to get ready for the new functionality involving these attributes!  
Imagine that you want to sell a soccer ball with Multicolor and Orange color variations, but you also want to upload the bar code (GTIN). To do that, go to the attribute API of that category and check if the attributes Color and GTIN have the allow\_variations and variation\_attribute tags, respectively.

### Category attributes

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/categories/$CATEGORY_ID/attributes
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/categories/CBT1287/attributes
```

Response:

```javascript
[
   {
       "id": "BRAND",
       "name": "Brand",
       "tags": {
           "catalog_required": true,
           "required": true
       },
       "hierarchy": "PARENT_PK",
       "relevance": 1,
       "value_type": "string",
       "value_max_length": 255,
       "values": [
           {"id": "14671", "name": "Nike"},
           {"id": "415945", "name": "Penalty"},
           {"id": "23132", "name": "Puma"},
           {"id": "14810", "name": "adidas"}
       ],
       "attribute_group_id": "OTHERS",
       "attribute_group_name": "Others",
       "hint": "Indicate the actual brand of the product or 'Generic' if it has no brand."
   },
   {
       "id": "MODEL",
       "name": "Model",
       "tags": {
           "catalog_required": true,
           "required": true
       },
       "hierarchy": "PARENT_PK",
       "relevance": 1,
       "value_type": "string",
       "value_max_length": 255,
       "values": [
           {"id": "13073598", "name": "Al Rihla"},
           {"id": "13073599", "name": "Slick"},
           {"id": "6232691", "name": "Selección Argentina"}
       ],
       "attribute_group_id": "OTHERS",
       "attribute_group_name": "Others"
   },
   {
       "id": "COLOR",
       "name": "Color",
       "tags": {
           "allow_variations": true,
           "defines_picture": true
       },
       "hierarchy": "CHILD_PK",
       "relevance": 1,
       "value_type": "string",
       "value_max_length": 255,
       "values": [
           {"id": "52055", "name": "White"},
           {"id": "52049", "name": "Black"},
           {"id": "51993", "name": "Red"},
           {"id": "52014", "name": "Green"},
           {"id": "52000", "name": "Orange"}
       ],
       "attribute_group_id": "OTHERS",
       "attribute_group_name": "Others"
   },
   {
       "id": "BALL_SIZE",
       "name": "Ball size",
       "tags": {},
       "hierarchy": "CHILD_PK",
       "relevance": 1,
       "value_type": "number",
       "value_max_length": 18,
       "values": [
           {"id": "3088204", "name": "3"},
           {"id": "3040573", "name": "4"},
           {"id": "3040562", "name": "5"}
       ],
       "attribute_group_id": "OTHERS",
       "attribute_group_name": "Others",
       "hint": "Select the ball's universal size."
   },
   {
       "id": "MAIN_COLOR",
       "name": "Main color",
       "tags": {
           "variation_attribute": true
       },
       "hierarchy": "CHILD_DEPENDENT",
       "relevance": 1,
       "type": "color",
       "value_type": "list",
       "values": [
           {"id": "2450295", "name": "Black", "metadata": {"rgb": "000000"}},
           {"id": "2450308", "name": "White", "metadata": {"rgb": "FFFFFF"}},
           {"id": "46671867", "name": "Multicolored", "metadata": {"rgb": "FFFFFF"}}
       ],
       "attribute_group_id": "OTHERS",
       "attribute_group_name": "Others"
   },
   {
       "id": "PACKAGE_HEIGHT",
       "name": "Package height",
       "tags": {
           "required": true,
           "variation_attribute": true,
           "catalog_listing_required": true
       },
       "hierarchy": "FAMILY",
       "relevance": 1,
       "value_type": "number_unit",
       "value_max_length": 255,
       "allowed_units": [{"id": "cm", "name": "cm"}, {"id": "mm", "name": "mm"}],
       "default_unit": "cm",
       "attribute_group_id": "OTHERS",
       "attribute_group_name": "Others"
   },
   {
       "id": "PACKAGE_WIDTH",
       "name": "Package width",
       "tags": {
           "required": true,
           "variation_attribute": true,
           "catalog_listing_required": true
       },
       "hierarchy": "FAMILY",
       "relevance": 1,
       "value_type": "number_unit",
       "value_max_length": 255,
       "default_unit": "cm",
       "attribute_group_id": "OTHERS",
       "attribute_group_name": "Others"
   },
   {
       "id": "PACKAGE_LENGTH",
       "name": "Package length",
       "tags": {
           "required": true,
           "variation_attribute": true,
           "catalog_listing_required": true
       },
       "hierarchy": "FAMILY",
       "relevance": 1,
       "value_type": "number_unit",
       "value_max_length": 255,
       "default_unit": "cm",
       "attribute_group_id": "OTHERS",
       "attribute_group_name": "Others"
   },
   {
       "id": "PACKAGE_WEIGHT",
       "name": "Package weight",
       "tags": {
           "required": true,
           "variation_attribute": true,
           "catalog_listing_required": true
       },
       "hierarchy": "FAMILY",
       "relevance": 1,
       "value_type": "number_unit",
       "value_max_length": 255,
       "allowed_units": [{"id": "g", "name": "g"}, {"id": "kg", "name": "kg"}],
       "default_unit": "g",
       "attribute_group_id": "OTHERS",
       "attribute_group_name": "Others"
   },
   {
       "id": "GTIN",
       "name": "Universal product code",
       "tags": {
           "multivalued": true,
           "variation_attribute": true,
           "validate": true,
           "conditional_required": true
       },
       "hierarchy": "PRODUCT_IDENTIFIER",
       "relevance": 1,
       "type": "product_identifier",
       "value_type": "string",
       "value_max_length": 255,
       "tooltip": "How do I find it? It is the number that identifies a product globally and has between 8 and 14 digits.",
       "attribute_group_id": "OTHERS",
       "attribute_group_name": "Others",
       "hint": "It may be an EAN, UPC or another GTIN."
   },
   {
       "id": "SELLER_SKU",
       "name": "SKU",
       "tags": {
           "hidden": true,
           "variation_attribute": true
       },
       "hierarchy": "ITEM",
       "relevance": 1,
       "value_type": "string",
       "value_max_length": 255,
       "attribute_group_id": "OTHERS",
       "attribute_group_name": "Others"
   }
]
```

After checking the attribute API configuration, you should create a listing JSON like the one below.  
Example:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/global/items -d
{
 "sites_to_sell": [
   {
     "site_id": "MLB",
     "logistic_type": "remote",
     "title": "Item teste Bola De Futebol Reflexiva Que Brilha"
   },
   {
     "site_id": "MLC",
     "logistic_type": "remote",
     "title": "Test item Bola de fútbol reflectante que brilla"
   }
 ],
 "currency_id": "USD",
 "catalog_listing": false,
 "category_id": "CBT1287",
 "sale_terms": [
   {
     "id": "WARRANTY_TYPE",
     "name": "Warranty type",
     "value_id": "2230279",
     "value_name": "Factory warranty"
   },
   {
     "id": "WARRANTY_TIME",
     "name": "Warranty time",
     "value_name": "90 days"
   }
 ],
 "attributes": [
   {
     "id": "BRAND",
     "name": "Brand",
     "value_id": "276243",
     "value_name": "Generic"
   },
   {
     "id": "ITEM_CONDITION",
     "name": "Item condition",
     "value_id": "2230284",
     "value_name": "New"
   },
   {
     "id": "MODEL",
     "name": "Model",
     "value_id": "15341587",
     "value_name": "Soccer balls"
   }
 ],
 "title": "Test Items Reflective Glow-in-the-Dark Soccer Ball",
 "description": {
   "plain_text": "Bring your game to life, day or night, with our Reflective Soccer Ball!"
 },
 "pictures": [
   {"source": "https://http2.mlstatic.com/D_647917-CBT52638413527_112022-O.jpg"},
   {"source": "https://http2.mlstatic.com/D_831581-MLU74344637844_022024-O.jpg"}
 ],
 "variations": [
   {
     "attribute_combinations": [
       {
         "id": "COLOR",
         "name": "Color",
         "value_id": "3801470",
         "value_name": "Multicolor"
       }
     ],
     "available_quantity": 40,
     "price": 65.99,
     "picture_ids": [
       "https://http2.mlstatic.com/D_647917-CBT52638413527_112022-O.jpg"
     ],
     "attributes": [
       {"id": "PACKAGE_HEIGHT", "name": "Package height", "value_name": "30 cm"},
       {"id": "PACKAGE_LENGTH", "name": "Package length", "value_name": "30 cm"},
       {"id": "PACKAGE_WEIGHT", "name": "Package weight", "value_name": "900 g"},
       {"id": "PACKAGE_WIDTH", "name": "Package width", "value_name": "30 cm"},
       {"id": "SELLER_SKU", "name": "SKU", "value_name": "SC-1520"},
       {"id": "GTIN", "name": "Universal product code", "value_name": "8429412807090"}
     ]
   },
   {
     "attribute_combinations": [
       {
         "id": "COLOR",
         "name": "Color",
         "value_id": "32278799",
         "value_name": "laranja-neon-escuro"
       }
     ],
     "available_quantity": 40,
     "price": 65.99,
     "picture_ids": [
       "https://http2.mlstatic.com/D_831581-MLU74344637844_022024-O.jpg"
     ],
     "attributes": [
       {"id": "PACKAGE_HEIGHT", "name": "Package height", "value_name": "30 cm"},
       {"id": "PACKAGE_LENGTH", "name": "Package length", "value_name": "30 cm"},
       {"id": "PACKAGE_WEIGHT", "name": "Package weight", "value_name": "910 g"},
       {"id": "PACKAGE_WIDTH", "name": "Package width", "value_name": "30 cm"},
       {"id": "SELLER_SKU", "name": "SKU", "value_name": "70079889"},
       {"id": "GTIN", "name": "Universal product code", "value_name": "3583787891193"}
     ]
   }
 ]
}
```

Response:

```javascript
{
   "item_id": "CBT2801110995",
   "seller_id": 2560656533,
   "site_id": "CBT",
   "site_items": [
       {
           "item_id": "MLC3405633130",
           "seller_id": 2565546852,
           "site_id": "MLC",
           "logistic_type": "remote"
       },
       {
           "item_id": "MLB6029714360",
           "seller_id": 2565546850,
           "site_id": "MLB",
           "logistic_type": "remote"
       }
   ]
}
```

Notes:

\- There are mandatory properties that should be sent in each variation. These are: price, available\_quantity, pictures and attribute\_combinations.  
\- The maximum number of images that can be sent per variation is defined by the field max\_pictures\_per\_item\_var in the Categories API.  
\- attribute\_combinations of all variations should include the same attributes, but with no repetition of value combinations.  
\- If an attribute that does not belong to the category is sent, it will be ignored, which can cause two variations to have the same attributes and present duplicate variations.  
\- You can add an attribute with the allow\_variations tag in the item's attributes property.  
\- You can add an attribute with the variation\_attribute tag in the item's attributes property.

Example: if you want to use size 46 and it is not among possible Size attribute values in the category, you can use it anyway as "value\_name": "46", as shown below:

```javascript
"variations": [
 {
   "attribute_combinations": [
     {
       "id": "SIZE",
       "value_id": "1234567"  // existing size value
     }
   ],
   "available_quantity": 17,
   "price": 65.99,
   ...
 },
 {
   "attribute_combinations": [
     {
       "id": "SIZE",
       "value_name": "46"  // custom size not in predefined values
     }
   ],
   "available_quantity": 21,
   "price": 65.99,
   ...
 }
]
```

For more information review documentation about [Attributes](https://global-selling.mercadolibre.com/devsite/attributes).

## Required attributes

When creating new listings, check the `required: true` tag to identify mandatory attributes for the category.

Important:

If a required attribute is not sent, you will receive the following error response (400):

```javascript
{
   "message": "Validation error",
   "error": "validation_error",
   "status": 400,
   "cause": [{
       "code": "item.attributes.missing_required",
       "message": "One or more required attributes are not present in the item. Check the attribute is present in the attributes list or in the variations attributes_combination or attributes."
   }]
}
```

Notes:

\- If an attribute is not required, the `required` tag will not appear.  
\- You cannot remove attributes marked as required from an existing item.

## Query variations

To consult the variations of your item, use the `attributes=variations` parameter to filter only the variations section in the item information:

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/items/$ITEM_ID?attributes=variations
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/items/MLC1781883229?attributes=variations
```

Response:

```javascript
{
   "variations": [
       {
           "id": 187898795824,
           "attribute_combinations": [
               {
                   "id": "COLOR",
                   "name": "Color",
                   "value_id": "3801470",
                   "value_name": "Multicolor"
               }
           ],
           "price": 65.99,
           "available_quantity": 40,
           "sold_quantity": 0,
           "picture_ids": ["708747-MLC100410508778_122025"],
           "attributes": [
               {"id": "PACKAGE_HEIGHT", "name": "Package height", "value_name": "30 cm"},
               {"id": "PACKAGE_WIDTH", "name": "Package width", "value_name": "30 cm"},
               {"id": "GTIN", "name": "Universal product code", "value_name": "8429412807090"},
               {"id": "SELLER_SKU", "name": "SKU", "value_name": "SC-1520"}
           ]
       },
       {
           "id": 187898795826,
           "attribute_combinations": [
               {
                   "id": "COLOR",
                   "name": "Color",
                   "value_id": "32278799",
                   "value_name": "laranja-neon-escuro"
               }
           ],
           "price": 65.99,
           "available_quantity": 40,
           "sold_quantity": 0,
           "picture_ids": ["931730-MLC100410508780_122025"],
           "attributes": [
               {"id": "PACKAGE_HEIGHT", "name": "Package height", "value_name": "30 cm"},
               {"id": "PACKAGE_WIDTH", "name": "Package width", "value_name": "30 cm"},
               {"id": "GTIN", "name": "Universal product code", "value_name": "3583787891193"},
               {"id": "SELLER_SKU", "name": "SKU", "value_name": "70079889"}
           ]
       }
   ]
}
```

Note:

To view the attributes property in each variation, you should add the `include_attributes=all` parameter to the query URL.

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/items/MLC1781883229?include_attributes=all
```

## Add new variations

If a new variation of your already listed item becomes available in your stock, you will be able to add a new variation. To do so, you should make a PUT to the item, listing both the existing variations Ids and the variation to be created in the variations property. If you check the item, you will see the new variation listed.

Example:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/global/items/CBT2801110995 -d
{
   "variations": [
       {
           "id": 187898795824
       },
       {
           "id": 187898795826
       },
       {
           "price": 65.99,
           "attribute_combinations": [
               {
                   "id": "COLOR",
                   "value_name": "Green"
               }
           ],
           "available_quantity": 20,
           "picture_ids": [
               "https://http2.mlstatic.com/D_647917-CBT52638413527_112022-O.jpg"
           ],
           "attributes": [
               {"id": "PACKAGE_HEIGHT", "value_name": "30 cm"},
               {"id": "PACKAGE_LENGTH", "value_name": "30 cm"},
               {"id": "PACKAGE_WEIGHT", "value_name": "920 g"},
               {"id": "PACKAGE_WIDTH", "value_name": "30 cm"},
               {"id": "SELLER_SKU", "value_name": "BALL-GREEN-003"},
               {"id": "GTIN", "value_name": "7891234567890"}
           ]
       }
   ]
}
```

Response: Status Code 200

## Change variations

Now that you have learned how to list and make variations queries, you may need to make changes to update stock, prices, add variations of your item, or change the value of some of the listed attributes. To do so, you should make a PUT, sending all the variations and adding the new attribute in the attribute\_combinations field of each variation.

Note:

Remember to send the id of the other variations or they will be deleted.

Example:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/global/items/CBT2801110995 -d
{
   "variations": [
       {
           "id": 187898795824
       },
       {
           "id": 187898795826
       },
       {
           "id": 187898795830,
           "price": 65.99,
           "attribute_combinations": [
               {
                   "id": "COLOR",
                   "value_name": "Dark Green"
               }
           ],
           "available_quantity": 25,
           "picture_ids": [
               "https://http2.mlstatic.com/D_647917-CBT52638413527_112022-O.jpg"
           ]
       }
   ]
}
```

Response: Status Code 200

You may also want to change or eliminate an attribute by which your item varies. To do so, you must check that the variations you want to change do not have sales.

Note:

For the sales variations, you can only add new attributes without changing or eliminating the existing ones.

Whenever you want to modify a variant, you must send the ID. In case you do not send it, the variant will be deleted and a new one will be created with the information included in the request, losing all the sales history.

Example - The correct way to modify a variation:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/global/items/CBT2801110995 -d
{
   "variations": [
       {
           "id": 187898795824
       },
       {
           "id": 187898795826,
           "available_quantity": 50  // Intended to modify stock
       }
   ]
}
```

Response: Status Code 200

## Add or change the typical attributes of each variation

At some point you may want to add more attributes typical of one or several particular variations. To do so, make a PUT sending all the variations, but adding the attributes field to the variations to which you want to add the attribute.

Example:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Content-Type: application/json' https://api.mercadolibre.com/global/items/CBT2801110995 -d
{
   "variations": [
       {
           "id": 187898795824
       },
       {
           "id": 187898795826,
           "attributes": [
               {"id": "PACKAGE_HEIGHT", "value_name": "32 cm"},
               {"id": "PACKAGE_WIDTH", "value_name": "32 cm"},
               {"id": "SELLER_SKU", "value_name": "BALL-ORANGE-002"}
           ]
       }
   ]
}
```

Response: Status Code 200

You may also want to change the value of a typical attribute of each variation. Imagine that you want to change the GTIN attribute value of a particular variation. To do so, you should make a PUT specifying the variation that you want to change.

Don't forget to send the ID of all the other variations that you don't want to change to prevent deletion.

Example:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Content-Type: application/json' https://api.mercadolibre.com/global/items/CBT2801110995 -d
{
   "variations": [
       {
           "id": 187898795824
       },
       {
           "id": 187898795826,
           "attributes": [
               {"id": "GTIN", "value_name": "9876543210123"}
           ]
       }
   ]
}
```

Response: Status Code 200

Note:

If you do not want to keep the previous pictures, don't send them in the JSON and they will be automatically discarded.

## Change price

If you want to change the price of an item with variations, you should make a PUT sending the same price in all the IDs for the variations. Keep in mind that if you send different prices you will receive an error in the response and the information will not be updated and if you don't send all the IDs of the variations, those that haven't been sent when making the PUT will be deleted from the item.

Example:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Content-Type: application/json' https://api.mercadolibre.com/global/items/CBT2801110995 -d
{
   "variations": [
       {
           "id": 187898795824,
           "price": 69.99
       },
       {
           "id": 187898795826,
           "price": 69.99
       }
   ]
}
```

Response: Status Code 200

## Change stock

As with price changes, you just have to make a PUT to the item API, including the variations property, listing each of them with their relevant id, and the new available\_quantity for those variations which stock you want to change.

Example:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Content-Type: application/json' https://api.mercadolibre.com/global/items/CBT2801110995 -d
{
   "variations": [
       {
           "id": 187898795824,
           "available_quantity": 50
       },
       {
           "id": 187898795826,
           "available_quantity": 35
       }
   ]
}
```

Response: Status Code 200

## Working with images in variations

To view the different images of each variation, take into account that the determinant attribute is that with tag defines\_picture: true. All the variations that share the same value in the attribute with tag define\_picture should ALWAYS have the same images.

Example:

- red/32 and red/28 should have the same images.
- red/32 and green/32 should have different images.

That is:

- All the variations that share the same value in the attribute with tag "defines\_picture" should have the same images.
- All the variations with a different value in the attribute with tag "defines\_picture" should have different images.
- All the variations should have an associated image.
- Based on the above, you will also be able to have thumbnails properly displayed.

## Modify images

If you want to add a picture to an existing variation, you should send its URL or picture\_id, if the picture is already uploaded, both in the item's general picture list and in the variation picture list. Meanwhile, as the update will be done over the items resource, you should send the IDs of every existing variation in the JSON. Otherwise, the API will understand that you do not want to keep them in the listing.

Example:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Content-Type: application/json' https://api.mercadolibre.com/global/items/CBT2801110995 -d
{
   "pictures": [
       {"source": "https://http2.mlstatic.com/D_647917-CBT52638413527_112022-O.jpg"},
       {"source": "https://http2.mlstatic.com/D_831581-MLU74344637844_022024-O.jpg"},
       {"id": "708747-MLC100410508778_122025"},
       {"id": "931730-MLC100410508780_122025"}
   ],
   "variations": [
       {
           "id": 187898795824,
           "picture_ids": [
               "https://http2.mlstatic.com/D_647917-CBT52638413527_112022-O.jpg",
               "708747-MLC100410508778_122025"
           ]
       },
       {
           "id": 187898795826,
           "picture_ids": [
               "https://http2.mlstatic.com/D_831581-MLU74344637844_022024-O.jpg",
               "931730-MLC100410508780_122025"
           ]
       }
   ]
}
```

Response: Status Code 200

Note:

If you do not want to keep the previous pictures, don't send them in the JSON and they will be automatically discarded.

## Delete variations

If you want to delete a variation, you can do so as shown in the example:

Example:

```javascript
curl -X DELETE -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/items/MLC1781883229/variations/187898795830
```

Response: Status Code 200

The variation 187898795830 will be deleted and you will keep the remaining variations.

## Custom Attribute

When listing on Mercado Libre, many categories already include attributes to create item variations. However, if you need to add a variation not defined in the API, you can use a custom attribute in the **attribute\_combinations** section of the variation.

Example:

A phone case seller may want to offer variations based on **design** (Flamenco, Crocodile, and Owl), even if the category does not include this attribute. In this case, "Design" can be added as a **custom attribute**.

Considerations:

- Custom attributes **must not** duplicate attributes already defined in the category.
- Only **one custom attribute** is allowed per item.
- It **must be included** in **attribute\_combinations** within **variations**.

Listing and Modifying

The process is similar to using standard attributes. You only need to:

- Define the **name** of the attribute (e.g., **"Design"**).
- Assign the **value\_name** accordingly (e.g., **"Flamenco"**).

The **"name"** will be visible to buyers on the **product page (VIP)**.

Example:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Content-Type: application/json' https://api.mercadolibre.com/global/items/CBT2801110995 -d
{
  "variations": [
      {
          "attribute_combinations": [
              {
                  "name": "Design",
                  "value_name": "Owl"
              }
          ],
          "price": 65.99,
          "available_quantity": 10,
          "picture_ids": [
              "621778-CBT44844170472_022021",
              "726738-CBT44844170475_022021"
          ]
      },
      {
          "attribute_combinations": [
              {
                  "name": "Design",
                  "value_name": "Flamingo"
              }
          ],
          "price": 65.99,
          "available_quantity": 10,
          "picture_ids": [
              "621778-CBT44844170472_022021",
              "726738-CBT44844170475_022021"
          ]
      },
      {
          "attribute_combinations": [
              {
                  "name": "Design",
                  "value_name": "Crocodile"
              }
          ],
          "price": 65.99,
          "available_quantity": 10,
          "picture_ids": [
              "621778-CBT44844170472_022021",
              "726738-CBT44844170475_022021"
          ]
      }
  ]
}
```

Response: Status Code 200

For more information about updating items, see [Update items](https://global-selling.mercadolibre.com/devsite/sync-and-modify-listings-gs). For error handling, check the error tables in [Publish items](https://global-selling.mercadolibre.com/devsite/global-listing).

**Next**: [Pictures](https://global-selling.mercadolibre.com/devsite/pictures).