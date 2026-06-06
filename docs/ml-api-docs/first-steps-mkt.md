# First steps

**Tags:** First steps,First steps Size Guide,Size Guide
**Created:** 2023-05-23T08:39:48Z
**Last Updated:** 2024-01-09T15:22:06Z

---

## First steps

Important:

Este recurso está disponible en Argentina, México, Brasil, Uruguay, Colombia, Perú, Ecuador y Chile.

The size chart enables buyers to have a better experience when choosing their product, thus avoiding size changes and/or complaints; therefore, consider developing this functionality to provide to fashion sellers.

Before creating listings with size charts, you must have all the details from the product specification sheets that will enable you to learn about the structure for creating size charts and for the subsequent assignment of a chart to a listing.

Therefore, we have detailed the technical flow in the following image to have fashion listings with quality and a size chart correctly linked:

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/222261998891-Captura-de-Pantalla-2023-05-23-a-la-s--08.32.55.png)

1. First steps to have product specification sheet details.
2. Manage size chart from the product specification sheet details.
3. Validations with possible error messages, moderations and some recommendations.
4. Photo quality where we certify fashion listing images.
   
   ## Define fashion domain to list
   
   To move forward in the fashion listing flow with a linked size chart, it is necessary to run the [category predictor](/en_us/set-categories-for-products#Categories-predictor) through the **/domain\_discovery** feature and thus obtain the **domain\_id** data on which it will be listed.
   
   Example of category predictor response for a fashion domain:
   
   ```javascript
   
       [
         {
           "domain_id": "MLA-SNEAKERS",
           "domain_name": "Zapatillas",
           "category_id": "MLA109027",
           "category_name": "Zapatillas",
           "attributes": []
         }
       ]
   ```
   
   ## Available domains for size chart
   
   You will be able to check the domains linked to the size chart experience by specifying the SITE\_ID.
   
   Request:
   
   ```javascript
   curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' 'https://api.mercadolibre.com/catalog/charts/$SITE_ID/configurations/active_domains'
   ```
   
   Example of the response obtained for **MLA**, here the array **domains** specify all the active domain IDs for the specific country, in the example, Argentina:
   
   ```javascript
   {
      "domains": [
          {
              "domain_id": "MLA-SNEAKERS"
          },
          {
              "domain_id": "MLA-BOOTS_AND_BOOTIES"
          },
          {
              "domain_id": "MLA-LOAFERS_AND_OXFORDS"
          },
          {
              "domain_id": "MLA-FOOTBALL_SHOES"
          },
          {
              "domain_id": "MLA-SANDALS_AND_CLOGS"
          }
      ]
   }
   ```
   
   Example of response when the SITE\_ID has no active domain for size chart use:
   
   ```javascript
   {
      "error": "config_not_found",
      "message": "Config not found",
      "status": 404
   }
   ```
   
   ## Check product specification sheet of domain
   
   Once you have the category and domain identified for the listing, it is necessary to check the **/domains/$domain\_id/technical\_specs** feature and check the product specification sheet of the domain recognizing the attributes with **value\_type: grid\_id** and **grid\_row\_id** that will enable to link the size chart information when creating or editing a listing.
   
   Additionally, it is necessary to recognize those attributes with the **grid\_template\_required** tag, which will be required for searching the product specification sheet of the size chart.
   
   Note:
   
   Please keep in mind that the size chart has a product specification sheet, which is defined according to the listing domain. Therefore, we specify which information is needed when creating a size chart.
   
   Request:
   
   ```javascript
   curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/domains/$DOMAIN_ID/technical_specs
   ```
   
   Example that checks the product specification sheet of MLA-SNEAKERS domain:
   
   ```javascript
   curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/domains/MLA-SNEAKERS/technical_specs
   ```
   
   Response with the details of the product specification sheet of the domain:
   
   ```javascript
   
       {
          "input": {
              "groups": [
                  {
                      "id": "MAIN",
                      "label": "Características principales",
                      "relevance": 1,
                      "section": "SPECIFICATIONS",
                      "ui_config": {},
                      "components": [
                          {
                              "component": "COMBO",
                              "label": "Marca",
                              "ui_config": {
                                  "hint": "Escribe la marca real del producto o 'Genérica' si no tiene marca.",
                                  "allow_custom_value": true,
                                  "allow_filtering": true
                              },
                              "attributes": [
                                  {
                                      "id": "BRAND",
                                      "name": "Marca",
                                      "value_type": "string",
                                      "value_max_length": 255,
                                      "tags": [
                                          "grid_filter",
                                          "catalog_required",
                                          "required"
                                      ],
                                      "values": [],
                                      "hierarchy": "PARENT_PK",
                                      "relevance": 1
                                  }
                              ],
                              "unified_units": []
                          },
                          {},
                          {},
                          {},
                          {
                              "component": "COMBO",
                              "label": "Género",
                              "ui_config": {
                                  "allow_custom_value": false,
                                  "allow_filtering": true
                              },
                              "attributes": [
                                  {
                                      "id": "GENDER",
                                      "name": "Género",
                                      "value_type": "list",
                                      "tags": [
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
                                          }
                                      ],
                                      "hierarchy": "PARENT_PK",
                                      "relevance": 1
                                  }
                              ],
                              "unified_units": []
                          },
                          {},
                          {},
                          {},
                          {},
                          {
                              "component": "GRID_ROW_INPUT",
                              "label": "ID de la fila de la guía de talles",
                              "ui_config": {
                                  "allow_custom_value": false,
                                  "allow_filtering": false
                              },
                              "attributes": [
                                  {
                                      "id": "SIZE_GRID_ROW_ID",
                                      "name": "ID de la fila de la guía de talles",
                                      "value_type": "grid_row_id",
                                      "value_max_length": 255,
                                      "tags": [
                                          "vip_hidden",
                                          "hidden",
                                          "variation_attribute"
                                      ],
                                      "hierarchy": "CHILD_PK",
                                      "relevance": 1
                                  }
                              ],
                              "unified_units": []
                          },
                          {}
                      ]
                  },
                  {
                      "id": "DMT",
                      "label": "Otras características",
                      "relevance": 1,
                      "section": "SPECIFICATIONS",
                      "ui_config": {},
                      "components": [
                          {},
                          {},
                          {},
                          {},
                          {},
                          {
                              "component": "GRID_INPUT",
                              "label": "ID de la guía de talles",
                              "ui_config": {
                                  "allow_custom_value": false,
                                  "allow_filtering": false
                              },
                              "attributes": [
                                  {
                                      "id": "SIZE_GRID_ID",
                                      "name": "ID de la guía de talles",
                                      "value_type": "grid_id",
                                      "value_max_length": 255,
                                      "tags": [
                                          "vip_hidden"
                                      ],
                                      "hierarchy": "FAMILY",
                                      "relevance": 1
                                  }
                              ],
                              "unified_units": []
                          },
                          {},
                          {
                              "component": "COMBO",
                              "label": "Deportes recomendados",
                              "ui_config": {
                                  "allow_custom_value": true,
                                  "allow_filtering": true
                              },
                              "attributes": [
                                  {
                                      "id": "RECOMMENDED_SPORTS",
                                      "name": "Deportes recomendados",
                                      "value_type": "string",
                                      "value_max_length": 255,
                                      "tags": [
                                          "multivalued",
                                          "grid_filter"
                                      ],
                                      "values": [],
                                      "hierarchy": "FAMILY",
                                      "relevance": 1
                                  }
                              ],
                              "unified_units": []
                          },
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {},
                          {}
                      ]
                  }
              ]
          },
          "output": {}
       }
   ```
   
   ## Check the product specification sheet of the size chart
   
   To create a new size chart we must specify the structure of its attributes, therefore, it is necessary to make a POST to the **/domains/$domain\_id/technical\_specs?section=grids** feature by uploading to the body all the attributes recognized when checking the product specification sheet of the domain with the **grid\_template\_required** tag.
   
   There are three types of size charts: Brand**(BRAND)**, Mercado Libre standard **(STANDARD)** or customized/specific **(SPECIFIC)**.
   
   In Uruguay, Colombia, Peru, Ecuador and Chile we will only have the custom/specific **(SPECIFIC)** type of size chart experience.
   
   Request:
   
   ```javascript
   curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -d{...}https://api.mercadolibre.com/domains/$DOMAIN_ID/technical_specs/?section=grids
   ```
   
   Example that checks the details of the product specification sheet for a Nike (BRAND) size chart for women:
   
   ```javascript
   curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -d
       '
       {
           "attributes": [
               {
                   "id": "BRAND",
                   "name": "Marca",
                   "value_id": "14671",
                   "value_name": "Nike",
                   "value_struct": null,
                   "values": [
                       {
                           "id": "14671",
                           "name": "Nike",
                           "struct": null
                       }
                   ],
                   "attribute_group_id": "OTHERS",
                   "attribute_group_name": "Otros"
               },
               {
                   "id": "GENDER",
                   "name": "Género",
                   "value_id": "339665",
                   "value_name": "Mujer",
                   "value_struct": null,
                   "values": [
                       {
                           "id": "339665",
                           "name": "Mujer",
                           "struct": null
                       }
                   ],
                   "attribute_group_id": "OTHERS",
                   "attribute_group_name": "Otros"
               }
           ]
       }'
       https://api.mercadolibre.com/domains/MLA-SNEAKERS/technical_specs/?section=grids
   ```
   
   Response with the details of the product specification sheet of the size chart:
   
   Note:
   
   Take this response into account for the JSON specification when [creating customized size charts.](/en_us/size-guide#Searching%20for%20a%20suggested%20size%20guide) .
   
   ```javascript
   {
       "input": {
           "groups": [
               {
                   "id": "SIZE_CHART",
                   "label": "Guía de talles",
                   "relevance": 1,
                   "section": "GRIDS",
                   "ui_config": {},
                   "components": [
                       {
                           "component": "GRID",
                           "label": "Guia de Talles",
                           "ui_config": {
                               "max_allowed": 75,
                               "allow_custom_value": true,
                               "allow_filtering": false
                           },
                           "components": [
                               {
                                   "component": "TEXT_OUTPUT",
                                   "label": "Género",
                                   "ui_config": {},
                                   "attributes": [
                                       {
                                           "id": "GENDER",
                                           "name": "Género",
                                           "value_type": "string",
                                           "tags": [
                                               "grid_template_required",
                                               "grid_filter",
                                               "fixed",
                                               "catalog_required",
                                               "required"
                                           ],
                                           "values": [
                                               {
                                                   "id": "339665",
                                                   "name": "Mujer"
                                               }
                                           ],
                                           "hierarchy": "PARENT_PK",
                                           "relevance": 1
                                       }
                                   ],
                                   "unified_units": []
                               },
                               {
                                   "component": "TEXT_OUTPUT",
                                   "label": "Marca",
                                   "ui_config": {},
                                   "attributes": [
                                       {
                                           "id": "BRAND",
                                           "name": "Marca",
                                           "value_type": "string",
                                           "value_max_length": 255,
                                           "tags": [
                                               "grid_filter",
                                               "catalog_required",
                                               "required"
                                           ],
                                           "hierarchy": "PARENT_PK",
                                           "relevance": 1
                                       }
                                   ],
                                   "unified_units": []
                               },
                               {
                                   "component": "TEXT_INPUT",
                                   "label": "Edad",
                                   "ui_config": {},
                                   "attributes": [
                                       {
                                           "id": "AGE_GROUP",
                                           "name": "Edad",
                                           "value_type": "string",
                                           "value_max_length": 255,
                                           "tags": [
                                               "hidden",
                                               "read_only",
                                               "grid_filter"
                                           ],
                                           "hierarchy": "PARENT_PK",
                                           "relevance": 1
                                       }
                                   ],
                                   "unified_units": []
                               },
                               {
                                   "component": "TEXT_INPUT",
                                   "label": "Estilo",
                                   "ui_config": {},
                                   "attributes": [
                                       {
                                           "id": "STYLE",
                                           "name": "Estilo",
                                           "value_type": "string",
                                           "value_max_length": 255,
                                           "tags": [
                                               "grid_filter",
                                               "required"
                                           ],
                                           "hierarchy": "FAMILY",
                                           "relevance": 1
                                       }
                                   ],
                                   "unified_units": []
                               },
                               {
                                   "component": "TEXT_INPUT",
                                   "label": "Deportes recomendados",
                                   "ui_config": {},
                                   "attributes": [
                                       {
                                           "id": "RECOMMENDED_SPORTS",
                                           "name": "Deportes recomendados",
                                           "value_type": "string",
                                           "value_max_length": 255,
                                           "tags": [
                                               "multivalued",
                                               "grid_filter"
                                           ],
                                           "hierarchy": "FAMILY",
                                           "relevance": 1
                                       }
                                   ],
                                   "unified_units": []
                               },
                               {
                                   "component": "NUMBER_UNIT_INPUT",
                                   "label": "Largo del pie",
                                   "ui_config": {
                                       "allow_custom_value": false,
                                       "allow_filtering": false
                                   },
                                   "attributes": [
                                       {
                                           "id": "FOOT_LENGTH",
                                           "name": "Largo del pie",
                                           "value_type": "number_unit",
                                           "value_max_length": 255,
                                           "tags": [
                                               "required"
                                           ],
                                           "default_unit_id": "cm",
                                           "units": [
                                               {
                                                   "id": "\"",
                                                   "name": "\""
                                               },
                                               {
                                                   "id": "cm",
                                                   "name": "cm"
                                               }
                                           ],
                                           "hierarchy": "CHILD_PK",
                                           "relevance": 1
                                       }
                                   ],
                                   "default_unified_unit_id": "cm",
                                   "unified_units": [
                                       {
                                           "id": "\"",
                                           "name": "\""
                                       },
                                       {
                                           "id": "cm",
                                           "name": "cm"
                                       }
                                   ]
                               },
                               {
                                   "component": "TEXT_INPUT",
                                   "label": "Talle de marca",
                                   "ui_config": {
                                       "allow_custom_value": false,
                                       "allow_filtering": false
                                   },
                                   "attributes": [
                                       {
                                           "id": "MANUFACTURER_SIZE",
                                           "name": "Talle de marca",
                                           "value_type": "string",
                                           "value_max_length": 255,
                                           "tags": [
                                               "unique",
                                               "main_attribute_candidate"
                                           ],
                                           "hierarchy": "ITEM",
                                           "relevance": 1
                                       }
                                   ],
                                   "unified_units": []
                               },
                               {
                                   "component": "NUMBER_UNIT_INPUT",
                                   "label": "AR",
                                   "ui_config": {
                                       "allow_custom_value": false,
                                       "allow_filtering": false
                                   },
                                   "attributes": [
                                       {
                                           "id": "AR_SIZE",
                                           "name": "AR",
                                           "value_type": "number_unit",
                                           "value_max_length": 255,
                                           "tags": [
                                               "main_attribute_candidate"
                                           ],
                                           "default_unit_id": "AR",
                                           "units": [
                                               {
                                                   "id": "AR",
                                                   "name": "AR"
                                               }
                                           ],
                                           "hierarchy": "CHILD_PK",
                                           "relevance": 1
                                       }
                                   ],
                                   "default_unified_unit_id": "AR",
                                   "unified_units": [
                                       {
                                           "id": "AR",
                                           "name": "AR"
                                       }
                                   ]
                               },
                               {
                                   "component": "NUMBER_UNIT_INPUT",
                                   "label": "US-F",
                                   "ui_config": {
                                       "allow_custom_value": false,
                                       "allow_filtering": false
                                   },
                                   "attributes": [
                                       {
                                           "id": "F_US_SIZE",
                                           "name": "US-F",
                                           "value_type": "number_unit",
                                           "value_max_length": 255,
                                           "tags": [
                                               "main_attribute_candidate"
                                           ],
                                           "default_unit_id": "US",
                                           "units": [
                                               {
                                                   "id": "US",
                                                   "name": "US"
                                               }
                                           ],
                                           "hierarchy": "CHILD_PK",
                                           "relevance": 1
                                       }
                                   ],
                                   "default_unified_unit_id": "US",
                                   "unified_units": [
                                       {
                                           "id": "US",
                                           "name": "US"
                                       }
                                   ]
                               },
                               {
                                   "component": "NUMBER_UNIT_INPUT",
                                   "label": "EU",
                                   "ui_config": {
                                       "allow_custom_value": false,
                                       "allow_filtering": false
                                   },
                                   "attributes": [
                                       {
                                           "id": "EU_SIZE",
                                           "name": "EU",
                                           "value_type": "number_unit",
                                           "value_max_length": 255,
                                           "tags": [
                                               "main_attribute_candidate"
                                           ],
                                           "default_unit_id": "EU",
                                           "units": [
                                               {
                                                   "id": "EU",
                                                   "name": "EU"
                                               }
                                           ],
                                           "hierarchy": "CHILD_PK",
                                           "relevance": 1
                                       }
                                   ],
                                   "default_unified_unit_id": "EU",
                                   "unified_units": [
                                       {
                                           "id": "EU",
                                           "name": "EU"
                                       }
                                   ]
                               },
                               {
                                   "component": "NUMBER_UNIT_INPUT",
                                   "label": "UK",
                                   "ui_config": {
                                       "allow_custom_value": false,
                                       "allow_filtering": false
                                   },
                                   "attributes": [
                                       {
                                           "id": "UK_SIZE",
                                           "name": "UK",
                                           "value_type": "number_unit",
                                           "value_max_length": 255,
                                           "tags": [
                                               "main_attribute_candidate"
                                           ],
                                           "default_unit_id": "UK",
                                           "units": [
                                               {
                                                   "id": "UK",
                                                   "name": "UK"
                                               }
                                           ],
                                           "hierarchy": "CHILD_PK",
                                           "relevance": 1
                                       }
                                   ],
                                   "default_unified_unit_id": "UK",
                                   "unified_units": [
                                       {
                                           "id": "UK",
                                           "name": "UK"
                                       }
                                   ]
                               }
                           ]
                       }
                   ]
               }
           ]
       }
    }
   ```
   
   When checking the product specification sheet of size charts in TOPS and BOTTOMS domains, a **list** data type will be found, which establishes the possible values of a List. These values must be taken into account when [creating a customized size chart](/en_us/size-guide#Searchingfor%20a%20suggested%20size%20guide) in these domains.
   
   ```javascript
   "attributes": [
       {
           "id": "FILTRABLE_SIZE",
           "name": "Talle estándar",
           "value_type": "list",
           "value_max_length": 255,
           "tags": [
               "vip_hidden",
               "hidden",
               "read_only",
               "variation_attribute",
               "required"
           ],
           "values": [
               {
                   "id": "4147746",
                   "name": "26"
               },
               {
                   "id": "3259523",
                   "name": "27"
               },
               {
                   "id": "3259504",
                   "name": "28"
               },
               {
                   "id": "3259505",
                   "name": "29"
               },
               {
                   "id": "3259506",
                   "name": "30"
               },
               {
                   "id": "3259507",
                   "name": "31"
               },
               {
                   "id": "3189126",
                   "name": "32"
               },
               {
                   "id": "3189128",
                   "name": "33"
               },
               {
                   "id": "3189130",
                   "name": "34"
               },
               {
                   "id": "4608574",
                   "name": "35"
               },
               {
                   "id": "3259450",
                   "name": "36"
               },
               {
                   "id": "3259451",
                   "name": "38"
               },
               {
                   "id": "3189142",
                   "name": "40"
               },
               {
                   "id": "3259453",
                   "name": "42"
               },
               {
                   "id": "3259454",
                   "name": "44"
               },
               {
                   "id": "3189154",
                   "name": "46"
               },
               {
                   "id": "3189158",
                   "name": "48"
               },
               {
                   "id": "3189161",
                   "name": "50"
               },
               {
                   "id": "4146158",
                   "name": "52"
               },
               {
                   "id": "3259459",
                   "name": "54"
               },
               {
                   "id": "3259460",
                   "name": "56"
               },
               {
                   "id": "4294027",
                   "name": "58"
               },
               {
                   "id": "4294028",
                   "name": "60"
               },
               {
                   "id": "3259463",
                   "name": "62"
               },
               {
                   "id": "3259464",
                   "name": "64"
               },
               {
                   "id": "3259465",
                   "name": "66"
               },
               {
                   "id": "3259466",
                   "name": "68"
               },
               {
                   "id": "2920269",
                   "name": "70"
               },
               {
                   "id": "5576727",
                   "name": "72"
               },
               {
                   "id": "5576729",
                   "name": "74"
               },
               {
                   "id": "5576730",
                   "name": "76"
               }
           ],
           "hierarchy": "ITEM",
           "relevance": 2
       }
    ]
   ```
   
   Additionally, for TOPS and BOTTOMS&lt; domains it is allowed to create size charts specifying body measures or clothes sizes, in both cases you will be able to recognize them from the data sheet by means of BODY\_MEASURE or CLOTHING\_MEASURE tags.
   
   Example of GARMENT\_LENGTH\_FROM attribute used in clothes sizes:
   
   ```javascript
   "attributes": [
    {
                                           "id": "GARMENT_LENGTH_FROM",
                                           "name": "Largo de la prenda desde",
                                           "value_type": "number_unit",
                                           "value_max_length": 255,
                                           "tags": [
                                               "CLOTHING_MEASURE",
                                               "required"
                                           ],
                                           "default_unit_id": "cm",
                                           "units": [
                                               {
                                                   "id": "\"",
                                                   "name": "\""
                                               },
                                               {
                                                   "id": "cm",
                                                   "name": "cm"
                                               }
                                           ],
                                           "hierarchy": "CHILD_DEPENDENT",
                                           "relevance": 3
                                       }
    
    ]
   ```
   
   ## Size chart search
   
   With the **/catalog/charts/search** feature it is possible to make a POST and recognize the suggested size charts to be used by the seller in their listings.
   
   Request:
   
   ```javascript
   curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json"  -d {...} https://api.mercadolibre.com/catalog/charts/search
   ```
   
   Example for a search of available size charts of adidas BRAND type for Women in the SNEAKERS domain:
   
   ```javascript
   
   curl -X POST 'https://api.mercadolibre.com/catalog/charts/search' -H 'x-caller-id: 123456' -H 'Content-Type: application/json' -H 'Authorization: Bearer $ACCESS_TOKEN' --data-raw '{
      "domain_id": "SNEAKERS",
      "site_id": "MLA",
      "seller_id": 123456,
      "attributes": [
          {
              "id": "GENDER",
              "values": [
                  {
                      "name": "Mujer"
                  }
              ]
          },
          {
              "id": "BRAND",
              "values": [
                  {
                      "name": "adidas"
                  }
              ]
          }
      ]
   }'
   ```
   
   Before searching size charts it is necessary to take into account the attribute with the **grid\_template\_required** tag in the [product specification](/en_us/First-steps-MKT?nocache=true#Check-the-product-specification-sheet-of-the-size-chart) sheet, which establishes the attributes of the POST. The **dominio**, **site**, **seller** are mandatory for all cases.
   
   ### If the following is uploaded to the body of the POST:
   
   - No **type** all custom, standard and by brand chart results are returned. According to the filters uploaded to the POST.
   - With **type**= **SPECIFIC** all the results of customized charts are returned, according to the filters uploaded to the POST, according to the genre uploaded.
   - With **type**= **STANDARD** all the results of standard charts are returned according to the filters uploaded to the POST.
   - With **type**= **BRAND** all chart results by brand are returned according to the filters uploaded to the POST.
   
   Response:
   
   As a response, all chart\_id returned as a result of the search for charts according to the filters uploaded will be obtained.
   
   ```javascript
   {
       "charts": [
           {
               "id": "426237",
               "names": {
                   "MLA": "Guia de talles de calzado de mujer de adidas TEST APPAREL"
               },
               "domain_id": "SNEAKERS",
               "type": "BRAND",
               "main_attribute_id": "EU_SIZE",
               "secondary_attribute_id": "F_US_SIZE",
               "attributes": [],
               "rows": []
           },
           {
               "id": "426238",
               "names": {
                   "MLA": "Guía de talles Standard de calzado de mujer TEST"
               },
               "domain_id": "SNEAKERS",
               "type": "STANDARD",
               "main_attribute_id": "AR_SIZE",
               "secondary_attribute_id": "F_US_SIZE",
               "attributes": [],
               "rows": []
           },
           {},
           {},
           {},
           {}
       ]
   }
   ```
   
   Likewise, you can use in the call the filter of the **main\_attribute\_id** attribute. For the following example we are using UZ\_SIZE:
   
   ```javascript
   
   curl -X POST 'https://api.mercadolibre.com/catalog/charts/search' -H 'x-caller-id: 123456' -H 'Content-Type: application/json' -H 'Authorization: Bearer $ACCESS_TOKEN' --data-raw '{
      "domain_id": "SNEAKERS",
      "site_id": "MLA",
      "seller_id": 123456,
      "attributes": [
          {
              "id": "GENDER",
              "values": [
                  {
                      "name": "Mujer"
                  }
              ]
          },
          {
              "id": "BRAND",
              "values": [
                  {
                      "name": "adidas"
                  }
              ]
          }
      ]
   }'
   ```
   
   If the search does not have suggested table results, the response you will get is as follows and you must first [create size charts](https:/en_us/size-guide#Searchingig-for-a-suggested-size-guide) for the seller:
   
   ```javascript
   {
      "charts": []
   }
   ```
   
   If you search with a domain that is not set up with the new size chart, there will be an error message.
   
   ```javascript
   {
       "error": "domain_not_active",
       "message": "Domain MLA-HATS_AND_CAPS is not active to be used in charts.",
       "status": 400
   }
   ```
   
   ## Standard and Brand domains
   
   Important:
   
   This feature is only for use in Argentina, Mexico and Brazil, where there are brand and standard size charts. **We do not recommend its use to recognize which domains are available for the assignment of size charts for the listings**. [Available domains for size charts](/en_us/First-steps-MKT?nocache=true#Available-domains-for-size-chart) should be used.
   
   This feature aims at informing the domains that currently have size charts created, either **BRAND** or **STANDARD** for a specific country and therefore the seller can use them in their listings.
   
   You must upload to the body of the POST the **type=BRAND** or **type=STANDARD** filter and the corresponding country.
   
   Note:
   
   The standard size charts of Mercado Libre and the Brand already have the complete required information (product specification sheet and amounts).
   
   Request:
   
   ```javascript
   curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -d{...}https://api.mercadolibre.com/catalog/charts/domains/search
   ```
   
   Example of domains set up with charts by brand:
   
   ```javascript
   curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -d
   
       '
       {
             "site_id": "MLA",      
             "type": "BRAND"
       }'
        https://api.mercadolibre.com/catalog/charts/domains/search
   ```
   
   Example of domains set up with standard charts:
   
   ```javascript
   curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -d
   
       '
       {
               "site_id": "MLA"      
               "type": "STANDARD"
       }'
       https://api.mercadolibre.com/catalog/charts/domains/search
   ```
   
   Response:
   
   ```javascript
   {
       "domains": [
           {
               "domain_id": "SNEAKERS"
           },
           {
               "domain_id": "BOOTS_AND_BOOTIES"
           },
           {
               "domain_id": "SANDALS_AND_CLOGS"
           },
           {
               "domain_id": "LOAFERS_AND_OXFORDS"
           },
           {
               "domain_id": "FOOTBALL_SHOES"
           },
           {
               "domain_id": "SNEAKERS_TEST"
           }
       ]
    }
   ```
   
   **Next**: [Manage size chart](/en_us/size-guide).