# Variations

**Tags:** Variations,variation,SKU
**Created:** 2018-06-27T12:01:32Z
**Last Updated:** 2022-12-21T09:53:27Z

---

## Variations

Importante:

As of December 14, 2022, the maximum number of variations allowed (max\_variations\_allowed) per category will be 100. Except for Fashion, Mobile Accessories and Auto Parts categories which will have a limit of 250. In addition, all existing variations can be edited.

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

 

## List of items with variations

To list items with variations, you should choose the category where you want to list. Once selected, you must check if the same allows variations identifying those attributes with the allow\_variations tag. This type of attributes must be loaded in the section attribute\_combinations, within variations, keeping in mind that you must load them for all the variations.

In turn, you can send the attributes property for each variation, specifying the item characteristics typical of each variation. In this section you can upload the attributes identified with the variation\_attribute tag in the API. For example, if you sell a mobile phone in different colors and have a barcode for each one, you can upload it for each variation in the attributes section.

Note:

\- To learn about mandatory variation attributes, look for those with tags required = true. A category with allow variation but without attributes with this tag means that you can create items without variations.  
\- The VIP does not currently, but will in the future, show attributes with the variation\_attribute tag. We encourage you to complete them in order to get ready for the new functionality involving these attributes!  
Imagine that you want to sell a fan with Brown and Black color variations, but you also want to upload the bar code (EAN). To do that, go to the attribute API of that category and check if the attributes Color and EAN have the allow\_variations and variation\_attribute tags, respectively.

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/categories/MLA126186/attributes
```

Response:

```javascript
[
  {
    "id": "BRAND",
    "name": "Marca",
    "tags": {
      "fixed": true
    },
    "value_type": "string",
    "value_max_length": 60,
    "values": [
      {
        "id": "5601",
        "name": "BGH"
      }
    ],
    "attribute_group_id": "MAIN",
    "attribute_group_name": "Atributos Principales"
  },
  {
    "id": "COLOR",
    "name": "Color",
    "tags": {
      "allow_variations": true,
      "hidden": true
    },
    "type": "color",
    "value_type": "list",
    "values": [
      {
        "id": "52049",
        "name": "Negro",
        "metadata": {
          "rgb": "000000"
        }
      },
      {
        "id": "51993",
        "name": "Rojo",
        "metadata": {
          "rgb": "FF0000"
        }
      },
      {
        "id": "52035",
        "name": "Violeta",
        "metadata": {
          "rgb": "9F00FF"
        }
      },
      {
        "id": "52028",
        "name": "Azul",
        "metadata": {
          "rgb": "1717FF"
        }
      },
      {
        "id": "52005",
        "name": "Marrón",
        "metadata": {
          "rgb": "A0522D"
        }
      },
      {
        "id": "52051",
        "name": "Gris oscuro",
        "metadata": {
          "rgb": "666666"
        }
      },
      {
        "id": "52000",
        "name": "Naranja",
        "metadata": {
          "rgb": "FF8C00"
        }
      },
      {
        "id": "52014",
        "name": "Verde",
        "metadata": {
          "rgb": "0DA600"
        }
      },
      {
        "id": "51994",
        "name": "Rosa",
        "metadata": {
          "rgb": "FCB1BE"
        }
      },
      {
        "id": "283164",
        "name": "Dorado",
        "metadata": {
          "rgb": "FFD700"
        }
      },
      {
        "id": "52007",
        "name": "Amarillo",
        "metadata": {
          "rgb": "FFED00"
        }
      },
      {
        "id": "52053",
        "name": "Plateado",
        "metadata": {
          "rgb": "CBCFD0"
        }
      },
      {
        "id": "283165",
        "name": "Gris claro",
        "metadata": {
          "rgb": "E1E1E1"
        }
      },
      {
        "id": "52021",
        "name": "Celeste",
        "metadata": {
          "rgb": "83DDFF"
        }
      },
      {
        "id": "52055",
        "name": "Blanco",
        "metadata": {
          "rgb": "FFFFFF"
        }
      },
      {
        "id": "51998",
        "name": "Bordó",
        "metadata": {
          "rgb": "830500",
          "parent_id": "51993"
        }
      },
      {
        "id": "51996",
        "name": "Terracota",
        "metadata": {
          "rgb": "C63633",
          "parent_id": "51993"
        }
      },
      {
        "id": "283149",
        "name": "Coral",
        "metadata": {
          "rgb": "FA8072",
          "parent_id": "51993"
        }
      },
      {
        "id": "283148",
        "name": "Coral claro",
        "metadata": {
          "rgb": "F9AC95",
          "parent_id": "51993"
        }
      },
      {
        "id": "52047",
        "name": "Violeta oscuro",
        "metadata": {
          "rgb": "4E0087",
          "parent_id": "52035"
        }
      },
      {
        "id": "283162",
        "name": "Índigo",
        "metadata": {
          "rgb": "7A64C6",
          "parent_id": "52035"
        }
      },
      {
        "id": "52038",
        "name": "Lila",
        "metadata": {
          "rgb": "CC87FF",
          "parent_id": "52035"
        }
      },
      {
        "id": "52036",
        "name": "Lavanda",
        "metadata": {
          "rgb": "D9D2E9",
          "parent_id": "52035"
        }
      },
      {
        "id": "52033",
        "name": "Azul oscuro",
        "metadata": {
          "rgb": "013267",
          "parent_id": "52028"
        }
      },
      {
        "id": "283161",
        "name": "Azul marino",
        "metadata": {
          "rgb": "0F5299",
          "parent_id": "52028"
        }
      },
      {
        "id": "52031",
        "name": "Azul acero",
        "metadata": {
          "rgb": "6FA8DC",
          "parent_id": "52028"
        }
      },
      {
        "id": "52029",
        "name": "Azul claro",
        "metadata": {
          "rgb": "DCECFF",
          "parent_id": "52028"
        }
      },
      {
        "id": "283155",
        "name": "Marrón oscuro",
        "metadata": {
          "rgb": "5D3806",
          "parent_id": "52005"
        }
      },
      {
        "id": "283154",
        "name": "Marrón claro",
        "metadata": {
          "rgb": "AF8650",
          "parent_id": "52005"
        }
      },
      {
        "id": "283153",
        "name": "Suela",
        "metadata": {
          "rgb": "FAEBD7",
          "parent_id": "52005"
        }
      },
      {
        "id": "52001",
        "name": "Beige",
        "metadata": {
          "rgb": "F5F3DC",
          "parent_id": "52005"
        }
      },
      {
        "id": "283152",
        "name": "Chocolate",
        "metadata": {
          "rgb": "9B3F14",
          "parent_id": "52000"
        }
      },
      {
        "id": "283151",
        "name": "Naranja oscuro",
        "metadata": {
          "rgb": "D2691E",
          "parent_id": "52000"
        }
      },
      {
        "id": "283150",
        "name": "Naranja claro",
        "metadata": {
          "rgb": "FDAF20",
          "parent_id": "52000"
        }
      },
      {
        "id": "52003",
        "name": "Piel",
        "metadata": {
          "rgb": "FFE4C4",
          "parent_id": "52000"
        }
      },
      {
        "id": "52019",
        "name": "Verde oscuro",
        "metadata": {
          "rgb": "003D00",
          "parent_id": "52014"
        }
      },
      {
        "id": "283158",
        "name": "Verde musgo",
        "metadata": {
          "rgb": "3F7600",
          "parent_id": "52014"
        }
      },
      {
        "id": "283157",
        "name": "Verde limón",
        "metadata": {
          "rgb": "73E129",
          "parent_id": "52014"
        }
      },
      {
        "id": "52015",
        "name": "Verde claro",
        "metadata": {
          "rgb": "9FF39F",
          "parent_id": "52014"
        }
      },
      {
        "id": "52042",
        "name": "Fucsia",
        "metadata": {
          "rgb": "FF00EC",
          "parent_id": "51994"
        }
      },
      {
        "id": "283163",
        "name": "Rosa chicle",
        "metadata": {
          "rgb": "FF51A8",
          "parent_id": "51994"
        }
      },
      {
        "id": "52045",
        "name": "Rosa pálido",
        "metadata": {
          "rgb": "D06EA8",
          "parent_id": "51994"
        }
      },
      {
        "id": "52043",
        "name": "Rosa claro",
        "metadata": {
          "rgb": "FADBE2",
          "parent_id": "51994"
        }
      },
      {
        "id": "52012",
        "name": "Dorado oscuro",
        "metadata": {
          "rgb": "BF9000",
          "parent_id": "52007"
        }
      },
      {
        "id": "52010",
        "name": "Ocre",
        "metadata": {
          "rgb": "EACB53",
          "parent_id": "52007"
        }
      },
      {
        "id": "283156",
        "name": "Caqui",
        "metadata": {
          "rgb": "F0E68C",
          "parent_id": "52007"
        }
      },
      {
        "id": "52008",
        "name": "Crema",
        "metadata": {
          "rgb": "FFFFE0",
          "parent_id": "52007"
        }
      },
      {
        "id": "52024",
        "name": "Azul petróleo",
        "metadata": {
          "rgb": "1E6E7F",
          "parent_id": "52021"
        }
      },
      {
        "id": "283160",
        "name": "Turquesa",
        "metadata": {
          "rgb": "40E0D0",
          "parent_id": "52021"
        }
      },
      {
        "id": "52022",
        "name": "Agua",
        "metadata": {
          "rgb": "E0FFFF",
          "parent_id": "52021"
        }
      },
      {
        "id": "283159",
        "name": "Cyan",
        "metadata": {
          "rgb": "00FFFF",
          "parent_id": "52021"
        }
      }
    ],
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "PACKAGE_HEIGHT",
    "name": "Altura del paquete",
    "tags": {
      "hidden": true,
      "read_only": true,
      "variation_attribute": true
    },
    "value_type": "number_unit",
    "value_max_length": 60,
    "allowed_units": [
      {
        "id": "mm",
        "name": "mm"
      },
      {
        "id": "cm",
        "name": "cm"
      },
      {
        "id": "in",
        "name": "in"
      },
      {
        "id": "pulgadas",
        "name": "pulgadas"
      },
      {
        "id": "ft",
        "name": "ft"
      },
      {
        "id": "m",
        "name": "m"
      },
      {
        "id": "km",
        "name": "km"
      }
    ],
    "default_unit": "mm",
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "PACKAGE_WIDTH",
    "name": "Ancho del paquete",
    "tags": {
      "hidden": true,
      "read_only": true,
      "variation_attribute": true
    },
    "value_type": "number_unit",
    "value_max_length": 60,
    "allowed_units": [
      {
        "id": "mm",
        "name": "mm"
      },
      {
        "id": "cm",
        "name": "cm"
      },
      {
        "id": "in",
        "name": "in"
      },
      {
        "id": "pulgadas",
        "name": "pulgadas"
      },
      {
        "id": "ft",
        "name": "ft"
      },
      {
        "id": "m",
        "name": "m"
      },
      {
        "id": "km",
        "name": "km"
      }
    ],
    "default_unit": "mm",
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "TURNTABLE",
    "name": "Bandeja Giratoria",
    "tags": {
    },
    "value_type": "boolean",
    "values": [
      {
        "id": "242084",
        "name": "No",
        "metadata": {
          "value": false
        }
      },
      {
        "id": "242085",
        "name": "Sí",
        "metadata": {
          "value": true
        }
      }
    ],
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "NUMBER_OF_PROGRAMS",
    "name": "Cantidad de Programas",
    "tags": {
      "hidden": true
    },
    "value_type": "number",
    "value_max_length": 60,
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "VOLUME_CAPACITY",
    "name": "Capacidad",
    "tags": {
    },
    "value_type": "number_unit",
    "value_max_length": 60,
    "allowed_units": [
      {
        "id": "l",
        "name": "l"
      },
      {
        "id": "cc",
        "name": "cc"
      },
      {
        "id": "ft³",
        "name": "ft³"
      },
      {
        "id": "ml",
        "name": "ml"
      },
      {
        "id": "mm³",
        "name": "mm³"
      }
    ],
    "default_unit": "l",
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "CONVECTION",
    "name": "Convección",
    "tags": {
    },
    "value_type": "boolean",
    "values": [
      {
        "id": "242084",
        "name": "No",
        "metadata": {
          "value": false
        }
      },
      {
        "id": "242085",
        "name": "Sí",
        "metadata": {
          "value": true
        }
      }
    ],
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "TURNTABLE_DIAMETER",
    "name": "Diámetro de Bandeja Giratoria",
    "tags": {
      "hidden": true
    },
    "value_type": "number_unit",
    "value_max_length": 60,
    "allowed_units": [
      {
        "id": "mm",
        "name": "mm"
      },
      {
        "id": "cm",
        "name": "cm"
      },
      {
        "id": "ft",
        "name": "ft"
      },
      {
        "id": "in",
        "name": "in"
      },
      {
        "id": "km",
        "name": "km"
      },
      {
        "id": "m",
        "name": "m"
      },
      {
        "id": "pulgadas",
        "name": "pulgadas"
      }
    ],
    "default_unit": "mm",
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "EAN",
    "name": "EAN",
    "tags": {
      "hidden": true,
      "multivalued": true,
      "variation_attribute": true
    },
    "type": "product_identifier",
    "value_type": "string",
    "value_max_length": 60,
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "FREQUENCY",
    "name": "Frecuencia",
    "tags": {
      "hidden": true
    },
    "value_type": "number_unit",
    "value_max_length": 60,
    "allowed_units": [
      {
        "id": "hz",
        "name": "hz"
      },
      {
        "id": "ghz",
        "name": "ghz"
      },
      {
        "id": "khz",
        "name": "khz"
      },
      {
        "id": "mhz",
        "name": "mhz"
      },
      {
        "id": "rpm",
        "name": "rpm"
      }
    ],
    "default_unit": "hz",
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "MICROWAVE_FUNCTIONS",
    "name": "Funciones",
    "tags": {
      "hidden": true,
      "multivalued": true
    },
    "value_type": "string",
    "value_max_length": 60,
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "GRILL",
    "name": "Grill",
    "tags": {
    },
    "value_type": "boolean",
    "values": [
      {
        "id": "242084",
        "name": "No",
        "metadata": {
          "value": false
        }
      },
      {
        "id": "242085",
        "name": "Sí",
        "metadata": {
          "value": true
        }
      }
    ],
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "GTIN",
    "name": "GTIN",
    "tags": {
      "hidden": true,
      "multivalued": true,
      "variation_attribute": true
    },
    "type": "product_identifier",
    "value_type": "string",
    "value_max_length": 60,
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "JAN",
    "name": "JAN",
    "tags": {
      "hidden": true,
      "variation_attribute": true
    },
    "type": "product_identifier",
    "value_type": "string",
    "value_max_length": 60,
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "LINE",
    "name": "Línea",
    "tags": {
      "hidden": true
    },
    "value_type": "string",
    "value_max_length": 60,
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "PACKAGE_LENGTH",
    "name": "Longitud del paquete",
    "tags": {
      "hidden": true,
      "read_only": true,
      "variation_attribute": true
    },
    "value_type": "number_unit",
    "value_max_length": 60,
    "allowed_units": [
      {
        "id": "mm",
        "name": "mm"
      },
      {
        "id": "cm",
        "name": "cm"
      },
      {
        "id": "in",
        "name": "in"
      },
      {
        "id": "pulgadas",
        "name": "pulgadas"
      },
      {
        "id": "ft",
        "name": "ft"
      },
      {
        "id": "m",
        "name": "m"
      },
      {
        "id": "km",
        "name": "km"
      }
    ],
    "default_unit": "mm",
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "DIMENSIONS",
    "name": "Medidas",
    "tags": {
    },
    "value_type": "string",
    "value_max_length": 60,
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "MODEL",
    "name": "Modelo",
    "tags": {
    },
    "value_type": "string",
    "value_max_length": 60,
    "attribute_group_id": "MAIN",
    "attribute_group_name": "Atributos Principales"
  },
  {
    "id": "ALPHANUMERIC_MODEL",
    "name": "Modelo Alfanumérico",
    "tags": {
      "hidden": true
    },
    "value_type": "string",
    "value_max_length": 60,
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "DETAILED_MODEL",
    "name": "Modelo Detallado",
    "tags": {
      "hidden": true
    },
    "value_type": "string",
    "value_max_length": 60,
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "MPN",
    "name": "MPN",
    "tags": {
      "hidden": true,
      "multivalued": true,
      "variation_attribute": true
    },
    "type": "product_identifier",
    "value_type": "string",
    "value_max_length": 60,
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "POWER_LEVELS",
    "name": "Niveles de Potencia",
    "tags": {
      "hidden": true
    },
    "value_type": "number",
    "value_max_length": 60,
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "PACKAGE_WEIGHT",
    "name": "Peso del paquete",
    "tags": {
      "hidden": true,
      "read_only": true,
      "variation_attribute": true
    },
    "value_type": "number_unit",
    "value_max_length": 60,
    "allowed_units": [
      {
        "id": "mcg",
        "name": "mcg"
      },
      {
        "id": "mg",
        "name": "mg"
      },
      {
        "id": "g",
        "name": "g"
      },
      {
        "id": "oz",
        "name": "oz"
      },
      {
        "id": "lb",
        "name": "lb"
      },
      {
        "id": "kg",
        "name": "kg"
      }
    ],
    "default_unit": "mcg",
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "POWER",
    "name": "Potencia",
    "tags": {
    },
    "value_type": "number_unit",
    "value_max_length": 60,
    "allowed_units": [
      {
        "id": "w",
        "name": "w"
      },
      {
        "id": "btu/h",
        "name": "btu/h"
      },
      {
        "id": "cv",
        "name": "cv"
      },
      {
        "id": "fg",
        "name": "fg"
      },
      {
        "id": "hp",
        "name": "hp"
      },
      {
        "id": "kcal/h",
        "name": "kcal/h"
      },
      {
        "id": "kw",
        "name": "kw"
      },
      {
        "id": "mw",
        "name": "mw"
      },
      {
        "id": "tfr",
        "name": "tfr"
      },
      {
        "id": "va",
        "name": "va"
      }
    ],
    "default_unit": "w",
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "GRILL_POWER",
    "name": "Potencia de Grill",
    "tags": {
      "hidden": true
    },
    "value_type": "number_unit",
    "value_max_length": 60,
    "allowed_units": [
      {
        "id": "w",
        "name": "w"
      },
      {
        "id": "btu/h",
        "name": "btu/h"
      },
      {
        "id": "cv",
        "name": "cv"
      },
      {
        "id": "fg",
        "name": "fg"
      },
      {
        "id": "hp",
        "name": "hp"
      },
      {
        "id": "kcal/h",
        "name": "kcal/h"
      },
      {
        "id": "kw",
        "name": "kw"
      },
      {
        "id": "mw",
        "name": "mw"
      },
      {
        "id": "tfr",
        "name": "tfr"
      },
      {
        "id": "va",
        "name": "va"
      }
    ],
    "default_unit": "w",
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "MIRRORED_DOOR",
    "name": "Puerta Espejada",
    "tags": {
      "hidden": true
    },
    "value_type": "boolean",
    "values": [
      {
        "id": "242084",
        "name": "No",
        "metadata": {
          "value": false
        }
      },
      {
        "id": "242085",
        "name": "Sí",
        "metadata": {
          "value": true
        }
      }
    ],
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "PROGRAMMABLE_KEYS",
    "name": "Teclas Programables",
    "tags": {
      "hidden": true
    },
    "value_type": "boolean",
    "values": [
      {
        "id": "242084",
        "name": "No",
        "metadata": {
          "value": false
        }
      },
      {
        "id": "242085",
        "name": "Sí",
        "metadata": {
          "value": true
        }
      }
    ],
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "MICROWAVE_TYPE",
    "name": "Tipo",
    "tags": {
    },
    "value_type": "list",
    "values": [
      {
        "id": "289784",
        "name": "De Apoyo"
      },
      {
        "id": "289785",
        "name": "De Embutir"
      }
    ],
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "CHILD_SAFETY_LOCK",
    "name": "Traba de Seguridad para Niños",
    "tags": {
      "hidden": true
    },
    "value_type": "boolean",
    "values": [
      {
        "id": "242084",
        "name": "No",
        "metadata": {
          "value": false
        }
      },
      {
        "id": "242085",
        "name": "Sí",
        "metadata": {
          "value": true
        }
      }
    ],
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "UPC",
    "name": "UPC",
    "tags": {
      "hidden": true,
      "multivalued": true,
      "variation_attribute": true
    },
    "type": "product_identifier",
    "value_type": "string",
    "value_max_length": 60,
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  },
  {
    "id": "VOLTAGE",
    "name": "Voltaje",
    "tags": {
      "hidden": true
    },
    "value_type": "list",
    "values": [
      {
        "id": "198812",
        "name": "110V / 220V"
      },
      {
        "id": "198813",
        "name": "220V"
      },
      {
        "id": "198814",
        "name": "110V"
      }
    ],
    "attribute_group_id": "DFLT",
    "attribute_group_name": "Otros"
  }
]
```

After checking the attribute API configuration, you should create a listing JSON like the one below.  
Example:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -d '
{  
   "listing_type_id":"gold_special",
   "pictures":[  
      {  
         "id":"553111-MLA20482692355_112015"
      }
   ],
   "title":"Item de testeo",
   "available_quantity":4,
   "category_id":"MLA378496",
   "buying_mode":"buy_it_now",
   "currency_id":"ARS",
   "condition":"not_specified",
   "site_id":"MLA",
   "price":100,
   "variations":[  
      {  
         "attribute_combinations":[  
            {  
               "name":"Color",
               "value_id":"52049",
               "value_name":"Negro"
            }
         ],
         "price":100,
         "available_quantity":4,
         "attributes":[  
            {  
               "id":"EAN",
               "value_name":"4006381333931"
            }
         ],
         "sold_quantity":0,
         "picture_ids":[  
            "553111-MLA20482692355_112015"
         ]
      },
      {  
         "attribute_combinations":[  
            {  
               "name":"Color",
               "value_id":"52005",
               "value_name":"Marrón"
            }
         ],
         "price":100,
         "available_quantity":4,
         "attributes":[  
            {  
               "id":"EAN",
               "value_name":"9780471117094"
            }
         ],
         "sold_quantity":0,
         "picture_ids":[  
            "553111-MLA20482692355_112015"
         ]
      }
   ]
}' 'http://api.mercadolibre.com/items'
```

Response:

```javascript
{  
   "id":"MLA657381404",
   "site_id":"MLA",
   "title":"Item De Testeo",
   "subtitle":null,
   "seller_id":222576250,
   "category_id":"MLA378496",
   "official_store_id":null,
   "price":100,
   "base_price":100,
   "original_price":null,
   "currency_id":"ARS",
   "initial_quantity":8,
   "available_quantity":8,
   "sold_quantity":0,
   "buying_mode":"buy_it_now",
   "listing_type_id":"gold_special",
   "start_time":"2017-03-10T21:18:09.588Z",
   "stop_time":"2037-03-05T21:18:09.588Z",
   "end_time":"2037-03-05T21:18:09.588Z",
   "expiration_time":"2017-05-29T21:18:09.651Z",
   "condition":"not_specified",
   "permalink":"http://articulo.mercadolibre.com.ar/MLA-657381404-item-de-testeo-_JM",
   "thumbnail":"http://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-I.jpg",
   "secure_thumbnail":"https://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-I.jpg",
   "pictures":[  
      {  
         "id":"553111-MLA20482692355_112015",
         "url":"http://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-O.jpg",
         "secure_url":"https://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-O.jpg",
         "size":"320x320",
         "max_size":"320x320",
         "quality":""
      }
   ],
   "video_id":null,
   "descriptions":[  

   ],
   "accepts_mercadopago":true,
   "non_mercado_pago_payment_methods":[  

   ],
   "shipping":{  
      "mode":"not_specified",
      "local_pick_up":false,
      "free_shipping":false,
      "methods":[  

      ],
      "dimensions":null,
      "tags":[  
         "me2_available"
      ],
      "logistic_type":"not_specified"
   },
   "international_delivery_mode":"none",
   "seller_address":{  
      "id":189626559,
      "comment":"",
      "address_line":"santa fe 1000",
      "zip_code":"1641",
      "city":{  
         "id":"",
         "name":"Acassuso"
      },
      "state":{  
         "id":"AR-B",
         "name":"Buenos Aires"
      },
      "country":{  
         "id":"AR",
         "name":"Argentina"
      },
      "latitude":-34.4817565,
      "longitude":-58.5056779,
      "search_location":{  
         "neighborhood":{  
            "id":"TUxBQkFDQTMyNzNa",
            "name":"Acassuso"
         },
         "city":{  
            "id":"TUxBQ1NBTjg4ZmJk",
            "name":"San Isidro"
         },
         "state":{  
            "id":"TUxBUEdSQWU4ZDkz",
            "name":"Bs.As. G.B.A. Norte"
         }
      }
   },
   "seller_contact":null,
   "location":{  

   },
   "geolocation":{  
      "latitude":-34.4817565,
      "longitude":-58.5056779
   },
   "coverage_areas":[  

   ],
   "attributes":[  
      {  
         "id":"FAN_TYPE",
         "name":"Tipo de Ventilador",
         "value_id":"291719",
         "value_name":"De Techo",
         "attribute_group_id":"DFLT",
         "attribute_group_name":"Otros"
      },
      {  
         "id":"BRAND",
         "name":"Marca",
         "value_id":"86416",
         "value_name":"Eiffel",
         "attribute_group_id":"MAIN",
         "attribute_group_name":"Atributos Principales"
      }
   ],
   "warnings":[  

   ],
   "listing_source":"",
   "variations":[  
      {  
         "id":14979332589,
         "attribute_combinations":[  
            {  
               "id":"COLOR",
               "name":"Color",
               "value_id":"52049",
               "value_name":"Negro"
            }
         ],
         "price":100,
         "available_quantity":4,
         "sold_quantity":0,
         "picture_ids":[  
            "553111-MLA20482692355_112015"
         ],
         "seller_custom_field":null,
         "catalog_product_id":null,
         "attributes":[  
            {  
               "id":"EAN",
               "name":"EAN",
               "value_id":null,
               "value_name":"4006381333931"
            }
         ]
      },
      {  
         "id":14979332592,
         "attribute_combinations":[  
            {  
               "id":"COLOR",
               "name":"Color",
               "value_id":"52005",
               "value_name":"Marrón"
            }
         ],
         "price":100,
         "available_quantity":4,
         "sold_quantity":0,
         "picture_ids":[  
            "553111-MLA20482692355_112015"
         ],
         "seller_custom_field":null,
         "catalog_product_id":null,
         "attributes":[  
            {  
               "id":"EAN",
               "name":"EAN",
               "value_id":null,
               "value_name":"9780471117094"
            }
         ]
      }
   ],
   "status":"active",
   "sub_status":[  

   ],
   "tags":[  
      "immediate_payment"
   ],
   "warranty":null,
   "catalog_product_id":null,
   "domain_id":null,
   "seller_custom_field":null,
   "parent_item_id":null,
   "differential_pricing":null,
   "deal_ids":[  

   ],
   "automatic_relist":false,
   "date_created":"2017-03-10T21:18:09.763Z",
   "last_updated":"2017-03-10T21:18:09.763Z"
}
```

Notes:

\- There are mandatory properties that should be sent in each variation. These are: price, available\_quantity, pictures and attribute\_combinations.  
\- The maximum number of images that can be sent per variation is defined by the field max\_pictures\_per\_item\_var in the Categories API.  
\- attribute\_combinations of all variations should include the same attributes, but with no repetition of value combinations.  
\- If an attribute that does not belong to the category is sent, it will be ignored, which can cause two variations yo have the same attributes and present duplicate variations.  
\- You can add an attribute with the allow\_variations tag in the item's attributes property.  
\- You can add an attribute with the variation\_attribute tag in the item's attributes property.

Example: if you want to use size 46 and it is not among possible Size attribute values in category MLU185734, you can use it anyway as "value\_name": "46", as shown below:

 

```javascript
"variations": [{
    "attribute_combinations": [{
      "id": "103000",
      "value_id": "4883e91"     --> value_id que corresponde al talle: 38
    }, {
      "id": "11000",
      "value_id": "10295e4"
    }],
    "available_quantity": 17,
    "price": 1299.0,
    "seller_custom_field": "611111",
    "picture_ids": ["https://s-media-cache-ak0.pinimg.com/736x/63/9c/a0/639ca03b5ca79e73002b4f2d4776d03b.jpg",
    ]
  }, {
    "attribute_combinations": [{
      "id": "103000",
      "value_id": "86e5356"     --> value_id que corresponde al talle: 44
    }, {
      "id": "11000",
      "value_id": "10295e4"
    }],
    "available_quantity": 12,
    "price": 1299.0,
    "seller_custom_field": "6131111",
    "picture_ids": ["https://s-media-cache-ak0.pinimg.com/736x/63/9c/a0/639ca03b5ca79e73002b4f2d4776d03b.jpg",
      ]
  }, {
    "attribute_combinations": [{
      "id": "103000",
      "value_name": "46"     --> value_name que agregamos para el talle 46
    }, {
      "id": "11000",
      "value_id": "10295e4"
    }],
    "available_quantity": 21,
    "price": 1299.0,
    "seller_custom_field": "611111”,
    "picture_ids": ["https://s-media-cache-ak0.pinimg.com/736x/63/9c/a0/639ca03b5ca79e73002b4f2d4776d03b.jpg",
      ]
  }]
```

For more information review documentation about [Attributes](../en_us/attributes).

 

## Required attributes

Now when you make new publications, **you must read the required:true tag to identify the attributes that are required by category**.

You should also identify the attributes that contain the new\_required tag since if the item's condition is new they are mandatory to post.

Important:

If the required attribute is not sent, you will receive the following error as a response. (400 item.attributes.missing\_required - Do not send required attribute).

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

-In case the attribute is not required, the required tag and the new\_required tag will not appear.  
\-You will not be able to eliminate, from the item, attributes marked as required.  
\- In the case of the new\_required tag, the condition of the item will be taken into account. This is mandatory for new publications and for existing ones when you want to remove the attribute.

 

## Query variations

There are two ways to consult the variations of your item, one is by looking at the variations section in the item information:

 

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/{ITEM_ID}
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA658778048?attributes=variations
```

Response:

```javascript
{
    "variations": [
        {
            "id": 15093610263,
            "attribute_combinations": [
                {
                    "id": "COLOR",
                    "name": "Color",
                    "value_id": "52000",
                    "value_name": "Naranja"
                }
            ],
            "price": 100,
            "available_quantity": 4,
            "sold_quantity": 0,
            "picture_ids": [
                "553111-MLA20482692355_112015"
            ],
            "seller_custom_field": null,
            "catalog_product_id": null
        }
    ]
}
```

Or otherwise, with the next call, which will directly filter the previous response to show the variations only:

 

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/{ITEM_ID}/variations
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA658778048/variations
```

Response:

```javascript
[
  {
    "id": 15092589430,
    "attribute_combinations": [
      {
        "id": "COLOR",
        "name": "Color",
        "value_id": "52005",
        "value_name": "Marrón"
      }
    ],
    "price": 100,
    "available_quantity": 4,
    "sold_quantity": 0,
    "picture_ids": [
      "553111-MLA20482692355_112015"
    ],
    "seller_custom_field": null,
    "catalog_product_id": null
  },
  {
    "id": 15092589427,
    "attribute_combinations": [
      {
        "id": "COLOR",
        "name": "Color",
        "value_id": "52049",
        "value_name": "Negro"
      }
    ],
    "price": 100,
    "available_quantity": 4,
    "sold_quantity": 0,
    "picture_ids": [
      "553111-MLA20482692355_112015"
    ],
    "seller_custom_field": null,
    "catalog_product_id": null
  }
]
```

Once you get each variation Id, you can query one in particular by adding the variation\_id at the end of the previous call, as shown below.

 

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/$ITEM_ID/variations/$VARIATION_ID
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA658778048/variations/15092589430
```

Response:

```javascript
{
  "id": 15092589430,
  "attribute_combinations": [
    {
      "id": "COLOR",
      "name": "Color",
      "value_id": "52028",
      "value_name": "Celeste Oscuro"
    }
  ],
  "price": 100,
  "available_quantity": 4,
  "sold_quantity": 0,
  "picture_ids": [
    "553111-MLA20482692355_112015",
    "629425-MLA25446587248_032017"
  ],
  "seller_custom_field": null,
  "catalog_product_id": null,
  "attributes": [
    {
      "id": "EAN",
      "name": "EAN",
      "value_id": null,
      "value_name": "7794940000796"
    },
    {
      "id": "UPC",
      "name": "UPC",
      "value_id": null,
      "value_name": "7792931000015"
    }
  ]
}
```

Note:

To view the attributes property in each variation, you should add the include\_attributes=all parameter to the query URL.

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA640992661?include_attributes=all
```

Note:

In case you want to consult the section variations attributes, you should send the parameter "include\_attributes=all" inside the call (https://api.mercadolibre.com/items/MLA000000?include\_attributes=all).

## Add new variations

If a new variation of your already listed item becomes available in your stock, you will be able to add a new variation. To do so, you should make a PUT to the item, listing both the existing variations Ids and the variation to be created in the variations property.  Well done!  If you check the item, you will see the new variation listed.

 

Example:

```javascript
curl  -X PUT -H 'Content-Type: application/json' -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA658778048 -d '{
"variations": [
    {
      "id": 15092589430    
    },
    {
      "id": "15092589427",
    },
    {
      "attribute_combinations": [
        {
          "id": "COLOR",
          "value_id": "52000"
        }
      ],
      "price": 100,
      "available_quantity": 4,
      "picture_ids": [
        "553111-MLA20482692355_112015"
      ]
    }
  ],
}
```

## Change variations

Now that you have learned how to list and make variations queries, you may need to make changes to update stock, prices, add variations of your item, or change the value of some of the listed attributes. Based on the Fan example, we have already shown you how to list a Fan with Color variations. Now imagine that in addition to Color variations, you want to add Voltage variations. To do so, you should make a PUT, as in the example below, sending all the variations and adding the Voltage attribute in the attribute\_combinations field of each variation.

 

Example:

```javascript
curl -X PUT -H 'Content-Type: application/json' -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA658778048 -d '{
"variations": [
    {
      "id": 15092589430,
      "attribute_combinations": [
        {
          "id": "COLOR",
          "value_id": "52005"
        },
        {
          "id": "VOLTAGE",
          "value_id": "198812"
        }
      ]
    },
    {
      "id": 15093506680,
      "attribute_combinations": [
        {
          "id": "COLOR",
          "value_id": "52035"
        },
        {
          "id": "VOLTAGE",
          "value_id": "198813"
        }
      ]
    }
  ]
}'
```

You may also want to change or eliminate an attribute by which your item varies. To do so, you must check that the variations you want to change do not have sales.

Note:

For the sales variations, you can only add new attributes without changing or eliminating the existing ones.

Based on the Fan example, imagine that your Fans no longer vary by Voltage, and, in turn, your Fan is not Violet but Dark Violet. To make this change, you should make a PUT, as in the Example: below, sending all the variations with the attribute Voltage with value\_id and value\_name null to be deleted, and, in turn, the variation corresponding to the Violet color with the value\_name changed to Dark Violet.

 

Example:

```javascript
curl -X PUT -H 'Content-Type: application/json' -H 'Authorization: Bearer $ACCESS_TOKEN'https://api.mercadolibre.com/items/MLA658778048  -d '{
"variations": [
    {
      "id": 15092589430,
      "attribute_combinations": [
        {
          "id": "COLOR",
          "value_id": "52005"
        },
        {
          "id": "VOLTAGE",
          "value_id": null,
          “value_name”: null
        }
      ]
    },
    {
      "id": 15093506680,
      "attribute_combinations": [
        {
          "id": "COLOR",
          "value_id": "52035",
          “value_name”: “Violeta Oscuro”
        },
        {
          "id": "VOLTAGE",
          "value_id": null,
          “value_name”: null
        }
      ]
    }
  ]
}
```

Response:

```javascript
[
 {
   "id": 15092589430,
   "attribute_combinations": [
     {
       "id": "COLOR",
       "name": "Color",
       "value_id": "52005",
       "value_name": "Marrón"
     }
   ],
   "price": 100,
   "available_quantity": 4,
   "sold_quantity": 0,
   "picture_ids": [
     "553111-MLA20482692355_112015",
     "629425-MLA25446587248_032017"
   ],
   "seller_custom_field": null,
   "catalog_product_id": null,
   "attributes": [
     {
       "id": "EAN",
       "name": "EAN",
       "value_id": null,
       "value_name": "7794940000796"
     },
     {
       "id": "UPC",
       "name": "UPC",
       "value_id": null,
       "value_name": "7792931000015"
     }
   ]
 },{
   "id": 15093506680,
   "attribute_combinations": [
     {
       "id": "COLOR",
       "name": "Color",
       "value_id": "52035",
       "value_name": "Violeta Oscuro"
     }
   ],
   "price": 100,
   "available_quantity": 4,
   "sold_quantity": 0,
   "picture_ids": [
     "553111-MLA20482692355_112015",
     "629425-MLA25446587248_032017"
   ],
   "seller_custom_field": null,
   "catalog_product_id": null,
   "attributes": [
     {
       "id": "EAN",
       "name": "EAN",
       "value_id": null,
       "value_name": "7794940000796"
     },
     {
       "id": "UPC",
       "name": "UPC",
       "value_id": null,
       "value_name": "7792931000015"
     }
   ]
 }
]
```

Note:

Whenever you want to modify a variant, you must send the ID. In case you do not send it, the variant will be deleted and a new one will be created with the information included in the request, losing, this way, all the sales history, or generating an error if all the necessary fields for the creation of the same are not present.

Example:  
If you have the following variant:

```javascript
"variations": [
        {
            "id": 30078896884,
            "attribute_combinations": [
                {
                    "id": "COLOR",
                    "name": "Color",
                    "value_id": "52014",
                    "value_name": "Verde",
                    "value_struct": null
                },
                {
                    "id": "SIZE",
                    "name": "Talle",
                    "value_id": null,
                    "value_name": "M",
                    "value_struct": null
                }
            ],
            "price": 47.81,
            "available_quantity": 2
        },
        
{
            "id": 30078896888,
            "attribute_combinations": [
                {
                    "id": "COLOR",
                    "name": "Color",
                    "value_id": "52014",
                    "value_name": "Verde",
                    "value_struct": null
                },
                {
                    "id": "SIZE",
                    "name": "Talle",
                    "value_id": null,
                    "value_name": " L",
                    "value_struct": null
                }
            ],
            "price": 47.81,
            "available_quantity": 2
        }
    ]
```

And you want to modify the variant 30078896888 and you don’t send its id, like in the following example:

```javascript
PUT /items/{itemId}
“variations": [
  {
  “id”: 30078896884
},
{
  "attribute_combinations": [
                {
                    "id": "COLOR",
                    "name": "Color",
                    "value_id": "52014",
                    "value_name": "Verde",
                    "value_struct": null
                },
                {
                    "id": "SIZE",
                    "name": "Talle",
                    "value_id": null,
                    "value_name": " L",
                    "value_struct": null
                }
            ],
  “price”: 47.81
  “available_quantity”: 8 -> Se pretende modificar el stock
      }
]
```

The variant 30078896888 will be deleted (since its ID was not sent) and a new one will be created with Color Green and Size “L” (which will not be connected to the eliminated variant, although it has the same attributes). The correct way of doing this is:

```javascript
curl -X PUT /items/{itemId}
“variations”: [
  {
    “id”: 30078896884
},
{
  “id”: 30078896888,
  “available_quantity”: 8 -> Se pretende modificar el stock
}
]
```

## Add or change the typical attributes of each variation

Moreover, at some point you may want to add more attributes typical of one or several particular variations. Follow the Fan Example: until each variation has the information contained in the bar code (EAN). Now imagine that, for some variations, we have information from another bar code -the UPC- and we want to add it. To do so, we have two alternatives: to make a PUT, as in the Example: below, sending all the variations, but adding the attributes field to the variations to which we want to add the UPC attribute.

 

Example:

```javascript
curl -X PUT -H 'Content-Type: application/json' -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLM623075370 -d

{
	"variations": [{
			"id": 23217493044
		},
		{
			"id": 23217493049,
			"attributes": [{
				"id": "PACKAGE_HEIGHT",
				"value_name": "25 cm"
			}, {
				"id": "PACKAGE_WIDTH",
				"value_name": "17 cm"
			}, {
				"id": "SELLER_SKU",
				"value_name": "Prueba3_xxx"
			}]
		}
	]
}
```

Response:

```javascript
{
    "id": "MLM623075370",
    "site_id": "MLM",
    "title": "Item De Prueba - No Ofertar",
    "subtitle": null,
    "seller_id": 310695640,
    "category_id": "MLM174913",
    "official_store_id": null,
    "price": 1,
    "base_price": 1,
    "original_price": null,
    "currency_id": "MXN",
    "initial_quantity": 2,
    "available_quantity": 2,
    "sold_quantity": 0,
    "sale_terms": [],
    "buying_mode": "buy_it_now",
    "listing_type_id": "gold_pro",
    "start_time": "2018-04-24T16:43:02.000Z",
    "historical_start_time": "2018-04-24T16:43:02.000Z",
    "stop_time": "2038-04-19T04:00:00.000Z",
    "end_time": "2038-04-19T04:00:00.000Z",
    "expiration_time": "2018-07-13T17:01:35.847Z",
    "condition": "new",
    "permalink": "http://articulo.mercadolibre.com.mx/MLM-623075370-item-de-prueba-no-ofertar-_JM",
    "thumbnail": "http://mlm-s1-p.mlstatic.com/965478-MLM27243332493_042018-I.jpg",
    "secure_thumbnail": "https://mlm-s1-p.mlstatic.com/965478-MLM27243332493_042018-I.jpg",
    "pictures": [
        {
            "id": "965478-MLM27243332493_042018",
            "url": "http://mlm-s1-p.mlstatic.com/965478-MLM27243332493_042018-O.jpg",
            "secure_url": "https://mlm-s1-p.mlstatic.com/965478-MLM27243332493_042018-O.jpg",
            "size": "500x500",
            "max_size": "1000x1000",
            "quality": ""
        }
    ],
    "video_id": null,
    "descriptions": [],
    "accepts_mercadopago": true,
    "non_mercado_pago_payment_methods": [],
    "shipping": {
        "mode": "not_specified",
        "local_pick_up": true,
        "free_shipping": false,
        "methods": [],
        "dimensions": null,
        "tags": [],
        "logistic_type": "not_specified",
        "store_pick_up": false
    },
    "international_delivery_mode": "none",
    "seller_address": {
        "id": 855164029,
        "comment": "",
        "address_line": "Test Address 123",
        "zip_code": "",
        "city": {
            "id": "",
            "name": "Ciudad de Mexico"
        },
        "state": {
            "id": "MX-DIF",
            "name": "Distrito Federal"
        },
        "country": {
            "id": "MX",
            "name": "Mexico"
        },
        "latitude": "",
        "longitude": "",
        "search_location": {
            "neighborhood": {
                "id": "",
                "name": ""
            },
            "city": {
                "id": "",
                "name": ""
            },
            "state": {
                "id": "TUxNUERJUzYwOTQ",
                "name": "Distrito Federal"
            }
        }
    },
    "seller_contact": null,
    "location": {},
    "geolocation": {
        "latitude": "",
        "longitude": ""
    },
    "coverage_areas": [],
    "attributes": [
        {
            "id": "MODEL",
            "name": "Modelo",
            "value_id": null,
            "value_name": "Mosaic",
            "value_struct": null,
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Otros"
        },
        {
            "id": "BRAND",
            "name": "Marca",
            "value_id": null,
            "value_name": "ROHO",
            "value_struct": null,
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Otros"
        },
        {
            "id": "ITEM_CONDITION",
            "name": "Condición del ítem",
            "value_id": "2230284",
            "value_name": "Nuevo",
            "value_struct": null,
            "attribute_group_id": "OTHERS",
            "attribute_group_name": "Otros"
        }
    ],
    "warnings": [],
    "listing_source": "",
    "variations": [
        {
            "id": 23217493044,
            "attribute_combinations": [
                {
                    "id": null,
                    "name": "Tamaño",
                    "value_id": null,
                    "value_name": "16\" x 16\" (40 x 40 cm)",
                    "value_struct": null
                }
            ],
            "price": 1,
            "available_quantity": 1,
            "sold_quantity": 0,
            "sale_terms": [],
            "picture_ids": [
                "965478-MLM27243332493_042018"
            ],
            "seller_custom_field": "Datos_interno_variacion_xxxx",
            "catalog_product_id": null,
            "attributes": [
                {
                    "id": "SELLER_SKU",
                    "name": "SKU ",
                    "value_id": null,
                    "value_name": "Prueba-xxx",
                    "value_struct": null
                }
            ]
        },
        {
            "id": 23217493049,
            "attribute_combinations": [
                {
                    "id": null,
                    "name": "Tamaño",
                    "value_id": null,
                    "value_name": "18\" x 18\" (45 x 45 cm)",
                    "value_struct": null
                }
            ],
            "price": 1,
            "available_quantity": 1,
            "sold_quantity": 0,
            "sale_terms": [],
            "picture_ids": [
                "965478-MLM27243332493_042018"
            ],
            "seller_custom_field": "Datos_interno_variacion_xxxx1",
            "catalog_product_id": null,
            "attributes": [
                {
                    "id": "PACKAGE_HEIGHT",
                    "name": "Altura del paquete",
                    "value_id": null,
                    "value_name": "25 cm",
                    "value_struct": {
                        "unit": "cm",
                        "number": 25
                    }
                },
                {
                    "id": "PACKAGE_WIDTH",
                    "name": "Ancho del paquete",
                    "value_id": null,
                    "value_name": "17 cm",
                    "value_struct": {
                        "unit": "cm",
                        "number": 17
                    }
                },
                {
                    "id": "SELLER_SKU",
                    "name": "SKU ",
                    "value_id": null,
                    "value_name": "Prueba3_xxx",
                    "value_struct": null
                }
            ]
        }
    ],
    "status": "active",
    "sub_status": [],
    "tags": [
        "test_item",
        "good_quality_picture",
        "immediate_payment"
    ],
    "warranty": null
    "catalog_product_id": null,
    "domain_id": null,
    "seller_custom_field": "Datos_interno_item",
    "parent_item_id": null,
    "differential_pricing": null,
    "deal_ids": [],
    "automatic_relist": false,
    "date_created": "2018-04-24T16:43:02.000Z",
    "last_updated": "2018-04-24T17:01:35.883Z",
    "total_listing_fee": null
}
```

You may also want to change the value of a typical attribute of each variation. Imagine that you want to change the EAN attribute value of a particular variation. To do so, you should make a PUT, as in the example: below, specifying the variation that you want to change. You should send all the attributes in the attributes field and the changed value\_name field for the EAN attribute.

Don't forget to send the ID of all the other variations that you don't want to change to prevent deletion. 

 

Example:

```javascript
curl -X PUT -H 'Content-Type: application/json' -H 'Authorization: Bearer $ACCESS_TOKEN'https://api.mercadolibre.com/items/MLA658778048 -d '{
"variations": [
    {
       "id": "15092589430",
       "attributes": [{ "id": "EAN", "name": "EAN", "value_name": "7792931000015"},
{ "id": "GTIN", "name": "GTIN", "value_name": "7792931000015"}]
    }
  ],
}
```

Response:

```javascript
{
    "id": "MLA658778048",
    "site_id": "MLA",
    "title": "Item De Testeo",
    "subtitle": null,
    "seller_id": 247212006,
    "category_id": "MLA378496",
    "official_store_id": null,
    "price": 100,
    "base_price": 100,
    "original_price": null,
    "currency_id": "ARS",
    "initial_quantity": 4,
    "available_quantity": 4,
    "sold_quantity": 0,
    "buying_mode": "buy_it_now",
    "listing_type_id": "gold_special",
    "start_time": "2017-03-20T15:44:00.000Z",
    "stop_time": "2037-03-15T15:44:00.000Z",
    "end_time": "2037-03-15T15:44:00.000Z",
    "expiration_time": "2017-06-17T14:55:54.306Z",
    "condition": "not_specified",
    "permalink": "http://articulo.mercadolibre.com.ar/MLA-658778048-item-de-testeo-_JM",
    "thumbnail": "http://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-I.jpg",
    "secure_thumbnail": "https://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-I.jpg",
    "pictures": [
        {
            "id": "553111-MLA20482692355_112015",
            "url": "http://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-O.jpg",
            "secure_url": "https://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-O.jpg",
            "size": "320x320",
            "max_size": "320x320",
            "quality": ""
        },
        {
            "id": "629425-MLA25446587248_032017",
            "url": "http://mla-s2-p.mlstatic.com/629425-MLA25446587248_032017-O.jpg",
            "secure_url": "https://mla-s2-p.mlstatic.com/629425-MLA25446587248_032017-O.jpg",
            "size": "384x500",
            "max_size": "922x1200",
            "quality": ""
        }
    ],
    "video_id": null,
    "descriptions": [],
    "accepts_mercadopago": true,
    "non_mercado_pago_payment_methods": [],
    "shipping": {
        "mode": "not_specified",
        "local_pick_up": false,
        "free_shipping": false,
        "methods": null,
        "dimensions": null,
        "tags": [],
        "logistic_type": "not_specified"
    },
    "international_delivery_mode": "none",
    "seller_address": {
        "id": 265953311,
        "comment": "",
        "address_line": "Test Address 123",
        "zip_code": "1414",
        "city": {
            "id": "",
            "name": "Palermo"
        },
        "state": {
            "id": "AR-C",
            "name": "Capital Federal"
        },
        "country": {
            "id": "AR",
            "name": "Argentina"
        },
        "latitude": "",
        "longitude": "",
        "search_location": {
            "neighborhood": {
                "id": "TUxBQlBBTDI1MTVa",
                "name": "Palermo"
            },
            "city": {
                "id": "TUxBQ0NBUGZlZG1sYQ",
                "name": "Capital Federal"
            },
            "state": {
                "id": "TUxBUENBUGw3M2E1",
                "name": "Capital Federal"
            }
        }
    },
    "seller_contact": null,
    "location": {},
    "geolocation": {
        "latitude": "",
        "longitude": ""
    },
    "coverage_areas": [],
    "attributes": [
        {
            "id": "FAN_TYPE",
            "name": "Tipo de Ventilador",
            "value_id": "291719",
            "value_name": "De Techo",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "HEIGHT_ADJUSTABLE",
            "name": "Altura Regulable",
            "value_id": "242084",
            "value_name": "No",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "LATERAL_OSCILLATION",
            "name": "Oscilación Lateral",
            "value_id": "242084",
            "value_name": "No",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "REMOTE_CONTROL",
            "name": "Control Remoto",
            "value_id": "242084",
            "value_name": "No",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "WITH_LIGHT",
            "name": "Con Luz",
            "value_id": "242084",
            "value_name": "No",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "BRAND",
            "name": "Marca",
            "value_id": "86416",
            "value_name": "Eiffel",
            "attribute_group_id": "MAIN",
            "attribute_group_name": "Atributos Principales"
        }
    ],
    "warnings": [],
    "listing_source": "",
    "variations": [
        {
            "id": 15092589430,
            "attribute_combinations": [
                {
                    "id": "COLOR",
                    "name": "Color",
                    "value_id": "52005",
                    "value_name": "Marrón"
                },
                {
                    "id": "VOLTAGE",
                    "name": "Voltaje",
                    "value_id": "198812",
                    "value_name": "110V/220V (Bivolt)"
                }
            ],
            "price": 100,
            "available_quantity": 4,
            "sold_quantity": 0,
            "picture_ids": [
                "553111-MLA20482692355_112015",
                "629425-MLA25446587248_032017"
            ],
            "seller_custom_field": null,
            "catalog_product_id": null,
            "attributes": [
                {
                    "id": "GTIN",
                    "name": "GTIN",
                    "value_id": null,
                    "value_name": "7792931000015"
                },
                {
                    "id": "EAN",
                    "name": "EAN",
                    "value_id": null,
                    "value_name": "7792931000015"
                }
            ]
        }
    ],
    "status": "active",
    "sub_status": [],
    "tags": [
        "poor_quality_picture",
        "immediate_payment"
    ],
    "warranty": null,
    "catalog_product_id": null,
    "domain_id": "MLA-FANS",
    "seller_custom_field": null,
    "parent_item_id": null,
    "differential_pricing": null,
    "deal_ids": [],
    "automatic_relist": false,
    "date_created": "2017-03-20T15:44:01.000Z",
    "last_updated": "2017-03-29T14:55:54.337Z"
}
```

You may also want to change the value of a typical attribute of each variation. Imagine that you want to change the value of the EAN attribute of a particular variation. To do so, you should make a PUT, as in the Example: below, specifying the variation that you want to change. You should send all the attributes in the attributes field and the changed value\_name field for the EAN attribute.

 

Example:

```javascript
curl -X PUT -H 'Content-Type: application/json' -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA658778048 -d '{
"variations": [
    {
       "id": "15092589430",
       "attributes": [{ "id": "EAN", "name": "EAN", "value_name": "7792931000015"},
{ "id": "UPC", "name": "UPC", "value_name": "7792931000015"}]
    }
  ],
}' 
```

Response:

```javascript
{
    "id": "MLA658778048",
    "site_id": "MLA",
    "title": "Item De Testeo",
    "subtitle": null,
    "seller_id": 247212006,
    "category_id": "MLA378496",
    "official_store_id": null,
    "price": 100,
    "base_price": 100,
    "original_price": null,
    "currency_id": "ARS",
    "initial_quantity": 4,
    "available_quantity": 4,
    "sold_quantity": 0,
    "buying_mode": "buy_it_now",
    "listing_type_id": "gold_special",
    "start_time": "2017-03-20T15:44:00.000Z",
    "stop_time": "2037-03-15T15:44:00.000Z",
    "end_time": "2037-03-15T15:44:00.000Z",
    "expiration_time": "2017-06-17T14:55:54.306Z",
    "condition": "not_specified",
    "permalink": "http://articulo.mercadolibre.com.ar/MLA-658778048-item-de-testeo-_JM",
    "thumbnail": "http://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-I.jpg",
    "secure_thumbnail": "https://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-I.jpg",
    "pictures": [
        {
            "id": "553111-MLA20482692355_112015",
            "url": "http://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-O.jpg",
            "secure_url": "https://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-O.jpg",
            "size": "320x320",
            "max_size": "320x320",
            "quality": ""
        },
        {
            "id": "629425-MLA25446587248_032017",
            "url": "http://mla-s2-p.mlstatic.com/629425-MLA25446587248_032017-O.jpg",
            "secure_url": "https://mla-s2-p.mlstatic.com/629425-MLA25446587248_032017-O.jpg",
            "size": "384x500",
            "max_size": "922x1200",
            "quality": ""
        }
    ],
    "video_id": null,
    "descriptions": [],
    "accepts_mercadopago": true,
    "non_mercado_pago_payment_methods": [],
    "shipping": {
        "mode": "not_specified",
        "local_pick_up": false,
        "free_shipping": false,
        "methods": null,
        "dimensions": null,
        "tags": [],
        "logistic_type": "not_specified"
    },
    "international_delivery_mode": "none",
    "seller_address": {
        "id": 265953311,
        "comment": "",
        "address_line": "Test Address 123",
        "zip_code": "1414",
        "city": {
            "id": "",
            "name": "Palermo"
        },
        "state": {
            "id": "AR-C",
            "name": "Capital Federal"
        },
        "country": {
            "id": "AR",
            "name": "Argentina"
        },
        "latitude": "",
        "longitude": "",
        "search_location": {
            "neighborhood": {
                "id": "TUxBQlBBTDI1MTVa",
                "name": "Palermo"
            },
            "city": {
                "id": "TUxBQ0NBUGZlZG1sYQ",
                "name": "Capital Federal"
            },
            "state": {
                "id": "TUxBUENBUGw3M2E1",
                "name": "Capital Federal"
            }
        }
    },
    "seller_contact": null,
    "location": {},
    "geolocation": {
        "latitude": "",
        "longitude": ""
    },
    "coverage_areas": [],
    "attributes": [
        {
            "id": "FAN_TYPE",
            "name": "Tipo de Ventilador",
            "value_id": "291719",
            "value_name": "De Techo",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "HEIGHT_ADJUSTABLE",
            "name": "Altura Regulable",
            "value_id": "242084",
            "value_name": "No",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "LATERAL_OSCILLATION",
            "name": "Oscilación Lateral",
            "value_id": "242084",
            "value_name": "No",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "REMOTE_CONTROL",
            "name": "Control Remoto",
            "value_id": "242084",
            "value_name": "No",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "WITH_LIGHT",
            "name": "Con Luz",
            "value_id": "242084",
            "value_name": "No",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "BRAND",
            "name": "Marca",
            "value_id": "86416",
            "value_name": "Eiffel",
            "attribute_group_id": "MAIN",
            "attribute_group_name": "Atributos Principales"
        }
    ],
    "warnings": [],
    "listing_source": "",
    "variations": [
        {
            "id": 15092589430,
            "attribute_combinations": [
                {
                    "id": "COLOR",
                    "name": "Color",
                    "value_id": "52005",
                    "value_name": "Marrón"
                },
                {
                    "id": "VOLTAGE",
                    "name": "Voltaje",
                    "value_id": "198812",
                    "value_name": "110V/220V (Bivolt)"
                }
            ],
            "price": 100,
            "available_quantity": 4,
            "sold_quantity": 0,
            "picture_ids": [
                "553111-MLA20482692355_112015",
                "629425-MLA25446587248_032017"
            ],
            "seller_custom_field": null,
            "catalog_product_id": null,
            "attributes": [
                {
                    "id": "EAN",
                    "name": "EAN",
                    "value_id": null,
                    "value_name": "7792931000015"
                },
                {
                    "id": "UPC",
                    "name": "UPC",
                    "value_id": null,
                    "value_name": "7792931000015"
                }
            ]
        }
    ],
    "status": "active",
    "sub_status": [],
    "tags": [
        "poor_quality_picture",
        "immediate_payment"
    ],
    "warranty": null,
    "catalog_product_id": null,
    "domain_id": "MLA-FANS",
    "seller_custom_field": null,
    "parent_item_id": null,
    "differential_pricing": null,
    "deal_ids": [],
    "automatic_relist": false,
    "date_created": "2017-03-20T15:44:01.000Z",
    "last_updated": "2017-03-29T14:55:54.337Z"
}
```

Notes:

If you do not want to keep the previous pictures, don’t send them in the Json and they will be automatically discarded.

 

## Change price

If you want to change the price of an item with variations, you should make a PUT sending the same price in all the IDs for the variations. Keep in mind that if you send different prices you will receive an error in the response and the information will not be updated and if you don’t send all the IDs of the variations, those that haven’t been sent when making the PUT will be deleted from the item.

 

Example:

```javascript
curl -X PUT -H 'Content-Type: application/json' -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA658778048 -d '{
"variations": [
    {
      "id": 15092589430,
      "price": 300
},
{
      "id": 15092544559,
      "price": 300
},
{
      "id": 15091378470,
      "price": 300
}
  ],
}'
```

 

## Change stock

As with price changes, you just have to make a PUT to the item API, including the variations property, listing each of them with their relevant id, and the new available\_quantity for those variations which stock you want to change.

 

Example:

```javascript
curl -X PUT -H 'Content-Type: application/json' -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA658778048 -d '{
"variations": [
    {
      "id": 15092589430,
      "available_quantity": 10
    }
  ],
}'
```

Response:

```javascript
{
    "id": "MLA658778048",
    "site_id": "MLA",
    "title": "Item De Testeo",
    "subtitle": null,
    "seller_id": 247212006,
    "category_id": "MLA378496",
    "official_store_id": null,
    "price": 100,
    "base_price": 100,
    "original_price": null,
    "currency_id": "ARS",
    "initial_quantity": 10,
    "available_quantity": 10,
    "sold_quantity": 0,
    "buying_mode": "buy_it_now",
    "listing_type_id": "gold_special",
    "start_time": "2017-03-20T15:44:00.000Z",
    "stop_time": "2037-03-15T15:44:00.000Z",
    "end_time": "2037-03-15T15:44:00.000Z",
    "expiration_time": "2017-06-17T15:00:27.592Z",
    "condition": "not_specified",
    "permalink": "http://articulo.mercadolibre.com.ar/MLA-658778048-item-de-testeo-_JM",
    "thumbnail": "http://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-I.jpg",
    "secure_thumbnail": "https://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-I.jpg",
    "pictures": [
        {
            "id": "553111-MLA20482692355_112015",
            "url": "http://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-O.jpg",
            "secure_url": "https://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-O.jpg",
            "size": "320x320",
            "max_size": "320x320",
            "quality": ""
        },
        {
            "id": "629425-MLA25446587248_032017",
            "url": "http://mla-s2-p.mlstatic.com/629425-MLA25446587248_032017-O.jpg",
            "secure_url": "https://mla-s2-p.mlstatic.com/629425-MLA25446587248_032017-O.jpg",
            "size": "384x500",
            "max_size": "922x1200",
            "quality": ""
        }
    ],
    "video_id": null,
    "descriptions": [],
    "accepts_mercadopago": true,
    "non_mercado_pago_payment_methods": [],
    "shipping": {
        "mode": "not_specified",
        "local_pick_up": false,
        "free_shipping": false,
        "methods": null,
        "dimensions": null,
        "tags": [],
        "logistic_type": "not_specified"
    },
    "international_delivery_mode": "none",
    "seller_address": {
        "id": 265953311,
        "comment": "",
        "address_line": "Test Address 123",
        "zip_code": "1414",
        "city": {
            "id": "",
            "name": "Palermo"
        },
        "state": {
            "id": "AR-C",
            "name": "Capital Federal"
        },
        "country": {
            "id": "AR",
            "name": "Argentina"
        },
        "latitude": "",
        "longitude": "",
        "search_location": {
            "neighborhood": {
                "id": "TUxBQlBBTDI1MTVa",
                "name": "Palermo"
            },
            "city": {
                "id": "TUxBQ0NBUGZlZG1sYQ",
                "name": "Capital Federal"
            },
            "state": {
                "id": "TUxBUENBUGw3M2E1",
                "name": "Capital Federal"
            }
        }
    },
    "seller_contact": null,
    "location": {},
    "geolocation": {
        "latitude": "",
        "longitude": ""
    },
    "coverage_areas": [],
    "attributes": [
        {
            "id": "FAN_TYPE",
            "name": "Tipo de Ventilador",
            "value_id": "291719",
            "value_name": "De Techo",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "HEIGHT_ADJUSTABLE",
            "name": "Altura Regulable",
            "value_id": "242084",
            "value_name": "No",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "LATERAL_OSCILLATION",
            "name": "Oscilación Lateral",
            "value_id": "242084",
            "value_name": "No",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "REMOTE_CONTROL",
            "name": "Control Remoto",
            "value_id": "242084",
            "value_name": "No",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "WITH_LIGHT",
            "name": "Con Luz",
            "value_id": "242084",
            "value_name": "No",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "BRAND",
            "name": "Marca",
            "value_id": "86416",
            "value_name": "Eiffel",
            "attribute_group_id": "MAIN",
            "attribute_group_name": "Atributos Principales"
        }
    ],
    "warnings": [],
    "listing_source": "",
    "variations": [
        {
            "id": 15092589430,
            "attribute_combinations": [
                {
                    "id": "COLOR",
                    "name": "Color",
                    "value_id": "52005",
                    "value_name": "Marrón"
                },
                {
                    "id": "VOLTAGE",
                    "name": "Voltaje",
                    "value_id": "198812",
                    "value_name": "110V/220V (Bivolt)"
                }
            ],
            "price": 100,
            "available_quantity": 10,
            "sold_quantity": 0,
            "picture_ids": [
                "629425-MLA25446587248_032017"
            ],
            "seller_custom_field": null,
            "catalog_product_id": null,
            "attributes": [
                {
                    "id": "EAN",
                    "name": "EAN",
                    "value_id": null,
                    "value_name": "7792931000015"
                },
                {
                    "id": "UPC",
                    "name": "UPC",
                    "value_id": null,
                    "value_name": "7792931000015"
                }
            ]
        }
    ],
    "status": "active",
    "sub_status": [],
    "tags": [
        "poor_quality_picture",
        "immediate_payment"
    ],
    "warranty": null,
    "catalog_product_id": null,
    "domain_id": "MLA-FANS",
    "seller_custom_field": null,
    "parent_item_id": null,
    "differential_pricing": null,
    "deal_ids": [],
    "automatic_relist": false,
    "date_created": "2017-03-20T15:44:01.000Z",
    "last_updated": "2017-03-29T15:00:27.650Z"
}
```

## Working with images in variations

To view the different images of each variation, take into account that the determinant attribute is that with tag defines\_picture: true. All the variations that share the same value in the attribute with tag define\_picture should ALWAYS have the same images.

 

Example:

- red/32 and red/28 should have the same images.
- red/32 and green/32 should have different images.

That is:

- All the variations that share the same value in the attribute with tag “defines\_picture” should have the same images.
- All the variations with a different value in the attribute with tag “defines\_picture” should have different images.
- All the variations should have an associated image.
- Based on the above, you will also be able to have thumbnails properly displayed.

 

## Modify images

If you want to add a picture to an existing variation, you should send its URL or picture\_id, if the picture is already uploaded, both in the item’s general picture list and in the variation picture list. Meanwhile, as the update will be done over the items resource, you should send the IDs of every existing variation in the Json. Otherwise, the API will understand that you do not want to keep them in the listing.

 

Example:

```javascript
curl -X PUT -H 'Content-Type: application/json' -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA658778048 -d '{
  "pictures": [{
      "source": "http://www.apertura.com/export/sites/revistaap/img/Tecnologia/Logo_ML_NUEVO.jpg_33442984.jpg"
    },
    {
      "source": "http://static.ellahoy.es/ellahoy/fotogallery/1200X0/371265/falda-plisada-rosa.jpg"
    },
    {
      "id": "553111-MLA20482692355_112015"
    },
    {
      "id": "629425-MLA25446587248_032017"
    }
  ],
  "variations": [{
      "id": 18200178910,
      "picture_ids": [
        "http://static.ellahoy.es/ellahoy/fotogallery/1200X0/371265/falda-plisada-rosa.jpg",
        "553111-MLA20482692355_112015"
      ]
    },
    {
      "id": 18200178913,
      "picture_ids": [
        "http://www.apertura.com/export/sites/revistaap/img/Tecnologia/Logo_ML_NUEVO.jpg_33442984.jpg",
        "629425-MLA25446587248_032017"
      ]
    }
  ]
}'
```

Response:

```javascript
{
    "id": "MLA689372871",
    "site_id": "MLA",
    "title": "Test Item - No Ofertar",
    "subtitle": null,
    "seller_id": 235461680,
    "category_id": "MLA374515",
    "official_store_id": null,
    "price": 200,
    "base_price": 200,
    "original_price": null,
    "currency_id": "ARS",
    "initial_quantity": 2,
    "available_quantity": 2,
    "sold_quantity": 0,
    "sale_terms": [],
    "buying_mode": "buy_it_now",
    "listing_type_id": "gold_special",
    "start_time": "2017-10-26T13:03:44.000Z",
    "historical_start_time": "2017-10-26T13:03:44.000Z",
    "stop_time": "2037-10-21T13:03:44.000Z",
    "end_time": "2037-10-21T13:03:44.000Z",
    "expiration_time": "2018-01-14T16:32:57.725Z",
    "condition": "new",
    "permalink": "http://articulo.mercadolibre.com.ar/MLA-689372871-test-item-no-ofertar-_JM",
    "thumbnail": "http://mla-s1-p.mlstatic.com/942947-MLA26244780225_102017-I.jpg",
    "secure_thumbnail": "https://mla-s1-p.mlstatic.com/942947-MLA26244780225_102017-I.jpg",
    "pictures": [
        {
            "id": "942947-MLA26244780225_102017",
            "url": "http://mla-s1-p.mlstatic.com/942947-MLA26244780225_102017-O.jpg",
            "secure_url": "https://mla-s1-p.mlstatic.com/942947-MLA26244780225_102017-O.jpg",
            "size": "500x228",
            "max_size": "625x285",
            "quality": ""
        },
        {
            "id": "837548-MLA26244864461_102017",
            "url": "http://www.mercadolibre.com/jm/img?s=STC&v=O&f=proccesing_image_es.jpg",
            "secure_url": "https://www.mercadolibre.com/jm/img?s=STC&v=O&f=proccesing_image_es.jpg",
            "size": "500x500",
            "max_size": "500x500",
            "quality": ""
        },
        {
            "id": "553111-MLA20482692355_112015",
            "url": "http://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-O.jpg",
            "secure_url": "https://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-O.jpg",
            "size": "320x320",
            "max_size": "320x320",
            "quality": ""
        },
        {
            "id": "629425-MLA25446587248_032017",
            "url": "http://mla-s2-p.mlstatic.com/629425-MLA25446587248_032017-O.jpg",
            "secure_url": "https://mla-s2-p.mlstatic.com/629425-MLA25446587248_032017-O.jpg",
            "size": "384x500",
            "max_size": "922x1200",
            "quality": ""
        }
    ],
    "video_id": null,
    "descriptions": [
        {
            "id": "MLA689372871-1476963486"
        }
    ],
    "accepts_mercadopago": true,
    "non_mercado_pago_payment_methods": [],
    "shipping": {
        "mode": "not_specified",
        "local_pick_up": false,
        "free_shipping": false,
        "methods": [],
        "dimensions": null,
        "tags": [
            "me2_available"
        ],
        "logistic_type": "not_specified",
        "store_pick_up": false
    },
    "international_delivery_mode": "none",
    "seller_address": {
        "id": 206175834,
        "comment": "",
        "address_line": "sssss 111",
        "zip_code": "5000",
        "city": {
            "id": "",
            "name": "Cordoba"
        },
        "state": {
            "id": "AR-X",
            "name": "Córdoba"
        },
        "country": {
            "id": "AR",
            "name": "Argentina"
        },
        "latitude": -32.8224655,
        "longitude": -63.8666332,
        "search_location": {
            "neighborhood": {
                "id": "",
                "name": ""
            },
            "city": {
                "id": "TUxBQ0NBUGNiZGQx",
                "name": "Córdoba"
            },
            "state": {
                "id": "TUxBUENPUmFkZGIw",
                "name": "Córdoba"
            }
        }
    },
    "seller_contact": null,
    "location": {},
    "geolocation": {
        "latitude": -32.8224655,
        "longitude": -63.8666332
    },
    "coverage_areas": [],
    "attributes": [
        {
            "id": "GENDER",
            "name": "Género",
            "value_id": "female",
            "value_name": "Mujer",
            "value_struct": null,
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "Season",
            "name": "Season",
            "value_id": "Season-All-Season",
            "value_name": "All-Season",
            "value_struct": null,
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        }
    ],
    "warnings": [],
    "listing_source": "",
    "variations": [
        {
            "id": 18200178910,
            "attribute_combinations": [
                {
                    "id": "83000",
                    "name": "Color Primario",
                    "value_id": "92028",
                    "value_name": "Blanco",
                    "value_struct": null
                },
                {
                    "id": "93000",
                    "name": "Talle",
                    "value_id": "101994",
                    "value_name": "S",
                    "value_struct": null
                }
            ],
            "price": 200,
            "available_quantity": 1,
            "sold_quantity": 0,
            "sale_terms": [],
            "picture_ids": [
                "837548-MLA26244864461_102017",
                "553111-MLA20482692355_112015"
            ],
            "seller_custom_field": null,
            "catalog_product_id": null,
            "attributes": []
        },
        {
            "id": 18200178913,
            "attribute_combinations": [
                {
                    "id": "83000",
                    "name": "Color Primario",
                    "value_id": "91994",
                    "value_name": "Rosa",
                    "value_struct": null
                },
                {
                    "id": "93000",
                    "name": "Talle",
                    "value_id": "101995",
                    "value_name": "M",
                    "value_struct": null
                }
            ],
            "price": 200,
            "available_quantity": 1,
            "sold_quantity": 0,
            "sale_terms": [],
            "picture_ids": [
                "942947-MLA26244780225_102017",
                "629425-MLA25446587248_032017"
            ],
            "seller_custom_field": null,
            "catalog_product_id": null,
            "attributes": []
        }
    ],
    "status": "active",
    "sub_status": [],
    "tags": [
        "test_item",
        "only_html_description",
        "good_quality_thumbnail",
        "unknown_quality_picture",
        "immediate_payment"
    ],
    "warranty": null,
    "catalog_product_id": null,
    "domain_id": null,
    "seller_custom_field": null,
    "parent_item_id": null,
    "differential_pricing": null,
    "deal_ids": [],
    "automatic_relist": false,
    "date_created": "2017-10-26T13:03:44.000Z",
    "last_updated": "2017-10-26T16:32:57.945Z",
    "total_listing_fee": null
}
```

Note:

If you do not want to keep the previous pictures, don’t send them in the Json and they will be automatically discarded.

## Delete variations

If you want to delete a variation, you can do so as shown in the example:

 

Example:

```javascript
curl -X DELETE -H 'Authorization: Bearer $ACCESS_TOKEN''https://api.mercadolibre.com/items/MLA599099879/variations/10449631060
```

Response

```javascript
{
    "id": "MLA658778048",
    "site_id": "MLA",
    "title": "Item De Testeo",
    "subtitle": null,
    "seller_id": 247212006,
    "category_id": "MLA378496",
    "official_store_id": null,
    "price": 300,
    "base_price": 300,
    "original_price": null,
    "currency_id": "ARS",
    "initial_quantity": 8,
    "available_quantity": 8,
    "sold_quantity": 0,
    "buying_mode": "buy_it_now",
    "listing_type_id": "gold_special",
    "start_time": "2017-03-20T15:44:00.000Z",
    "stop_time": "2037-03-15T15:44:00.000Z",
    "end_time": "2037-03-15T15:44:00.000Z",
    "expiration_time": "2017-06-17T15:03:02.000Z",
    "condition": "not_specified",
    "permalink": "http://articulo.mercadolibre.com.ar/MLA-658778048-item-de-testeo-_JM",
    "thumbnail": "http://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-I.jpg",
    "secure_thumbnail": "https://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-I.jpg",
    "pictures": [
        {
            "id": "553111-MLA20482692355_112015",
            "url": "http://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-O.jpg",
            "secure_url": "https://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-O.jpg",
            "size": "320x320",
            "max_size": "320x320",
            "quality": ""
        },
        {
            "id": "629425-MLA25446587248_032017",
            "url": "http://mla-s2-p.mlstatic.com/629425-MLA25446587248_032017-O.jpg",
            "secure_url": "https://mla-s2-p.mlstatic.com/629425-MLA25446587248_032017-O.jpg",
            "size": "384x500",
            "max_size": "922x1200",
            "quality": ""
        }
    ],
    "video_id": null,
    "descriptions": [],
    "accepts_mercadopago": true,
    "non_mercado_pago_payment_methods": [],
    "shipping": {
        "mode": "not_specified",
        "local_pick_up": false,
        "free_shipping": false,
        "methods": null,
        "dimensions": null,
        "tags": [],
        "logistic_type": "not_specified"
    },
    "international_delivery_mode": "none",
    "seller_address": {
        "id": 265953311,
        "comment": "",
        "address_line": "Test Address 123",
        "zip_code": "1414",
        "city": {
            "id": "",
            "name": "Palermo"
        },
        "state": {
            "id": "AR-C",
            "name": "Capital Federal"
        },
        "country": {
            "id": "AR",
            "name": "Argentina"
        },
        "latitude": "",
        "longitude": "",
        "search_location": {
            "neighborhood": {
                "id": "TUxBQlBBTDI1MTVa",
                "name": "Palermo"
            },
            "city": {
                "id": "TUxBQ0NBUGZlZG1sYQ",
                "name": "Capital Federal"
            },
            "state": {
                "id": "TUxBUENBUGw3M2E1",
                "name": "Capital Federal"
            }
        }
    },
    "seller_contact": null,
    "location": {},
    "geolocation": {
        "latitude": "",
        "longitude": ""
    },
    "coverage_areas": [],
    "attributes": [
        {
            "id": "FAN_TYPE",
            "name": "Tipo de Ventilador",
            "value_id": "291719",
            "value_name": "De Techo",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "HEIGHT_ADJUSTABLE",
            "name": "Altura Regulable",
            "value_id": "242084",
            "value_name": "No",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "LATERAL_OSCILLATION",
            "name": "Oscilación Lateral",
            "value_id": "242084",
            "value_name": "No",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "REMOTE_CONTROL",
            "name": "Control Remoto",
            "value_id": "242084",
            "value_name": "No",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "WITH_LIGHT",
            "name": "Con Luz",
            "value_id": "242084",
            "value_name": "No",
            "attribute_group_id": "DFLT",
            "attribute_group_name": "Otros"
        },
        {
            "id": "BRAND",
            "name": "Marca",
            "value_id": "86416",
            "value_name": "Eiffel",
            "attribute_group_id": "MAIN",
            "attribute_group_name": "Atributos Principales"
        }
    ],
    "warnings": [],
    "listing_source": "",
    "variations": [
        {
            "id": 15092589430,
            "attribute_combinations": [
                {
                    "id": "COLOR",
                    "name": "Color",
                    "value_id": "52005",
                    "value_name": "Marrón"
                },
                {
                    "id": "VOLTAGE",
                    "name": "Voltaje",
                    "value_id": "198812",
                    "value_name": "110V/220V (Bivolt)"
                }
            ],
            "price": 300,
            "available_quantity": 8,
            "sold_quantity": 0,
            "picture_ids": [
                "629425-MLA25446587248_032017"
            ],
            "seller_custom_field": null,
            "catalog_product_id": null,
            "attributes": [
                {
                    "id": "EAN",
                    "name": "EAN",
                    "value_id": null,
                    "value_name": "7792931000015"
                },
                {
                    "id": "UPC",
                    "name": "UPC",
                    "value_id": null,
                    "value_name": "7792931000015"
                }
            ]
        }
    ],
    "status": "active",
    "sub_status": [],
    "tags": [
        "poor_quality_picture",
        "immediate_payment"
    ],
    "warranty": null,
    "catalog_product_id": null,
    "domain_id": "MLA-FANS",
    "seller_custom_field": null,
    "parent_item_id": null,
    "differential_pricing": null,
    "deal_ids": [],
    "automatic_relist": false,
    "date_created": "2017-03-20T15:44:01.000Z",
    "last_updated": "2017-03-29T15:04:20.999Z"
}
```

As you can see, we eliminate the variation 10449631060 and we keep the variations 10449631063 and 10449631067. Another way to eliminate variations is sending a PUT to the items API with the variations property, listing only the Ids of the variations that we wish to keep.

 

Example:

```javascript
curl -X DELETE -H 'Content-Type: application/json' -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA658778048/variations/15092589430
```

## Customized variation

If for a large number of categories there are attributes identified to vary your item, you may need to generate customized variations that are not defined in the attribute by category API. For example, a mobile phone case seller may want to vary items by “Design” so as to offer the Flamingo, Crocodile and Owl variations in the same listing. As the category does not have this attribute defined, you can send the customized variation in the variation's attribute\_combinations.

 

Considerations:

- To list an item with customized variations, make sure that the attributes in the category where you want to list are different from those that you want to add.
- Besides, bear in mind that you can only vary your item with a single customized variation.
- Customized variations should be in variations, under the attribute\_combinations section.

 

### List and change items with customized variations

To add or change customized attributes, you should do the same as for those defined in the attribute API by category: you just have to specify the attribute name and the value\_name of the value to be added. Remember to be consistent with the name defined for the attribute, and change its value\_name just like you would do it with any other. Buyers will view the attribute name in the VIP. For the above example, we will use "Design" name.

 

Example:

```javascript
curl -X PUT -H 'Content-Type: application/json' -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA658778048 -d '{
"variations": [
{
	"attribute_combinations": [
	      {
	        "name": "Diseño",
	        "value_name": "Buho"
	      }
	    ],
	    "price": 100,
	    "available_quantity": 10
    },
    {
	"attribute_combinations": [
	      {
	        "name": "Diseño",
	        "value_name": "Flamenco"
	      }
	    ],
	    "price": 100,
	    "available_quantity": 10
    },
    {
	"attribute_combinations": [
	      {
	        "name": "Diseño",
	        "value_name": "Cocodrilo"
	      }
	    ],
	    "price": 100,
	    "available_quantity": 10
    }
  ]
}' 
```

Response:

```javascript
{
  "id": "MLA658778048",
  "site_id": "MLA",
  "title": "Item De Testeo",
  "subtitle": null,
  "seller_id": 247212006,
  "category_id": "MLA378496",
  "official_store_id": null,
  "price": 100,
  "base_price": 100,
  "original_price": null,
  "currency_id": "ARS",
  "initial_quantity": 30,
  "available_quantity": 30,
  "sold_quantity": 0,
  "buying_mode": "buy_it_now",
  "listing_type_id": "gold_special",
  "start_time": "2017-03-20T15:44:00.000Z",
  "stop_time": "2037-03-15T15:44:00.000Z",
  "end_time": "2037-03-15T15:44:00.000Z",
  "expiration_time": "2017-06-26T16:55:52.935Z",
  "condition": "not_specified",
  "permalink": "http://articulo.mercadolibre.com.ar/MLA-658778048-item-de-testeo-_JM",
  "thumbnail": "http://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-I.jpg",
  "secure_thumbnail": "https://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-I.jpg",
  "pictures": [
    {
      "id": "553111-MLA20482692355_112015",
      "url": "http://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-O.jpg",
      "secure_url": "https://mla-s2-p.mlstatic.com/553111-MLA20482692355_112015-O.jpg",
      "size": "320x320",
      "max_size": "320x320",
      "quality": ""
    },
    {
      "id": "629425-MLA25446587248_032017",
      "url": "http://mla-s2-p.mlstatic.com/629425-MLA25446587248_032017-O.jpg",
      "secure_url": "https://mla-s2-p.mlstatic.com/629425-MLA25446587248_032017-O.jpg",
      "size": "384x500",
      "max_size": "922x1200",
      "quality": ""
    }
  ],
  "video_id": null,
  "descriptions": [],
  "accepts_mercadopago": true,
  "non_mercado_pago_payment_methods": [],
  "shipping": {
    "mode": "not_specified",
    "local_pick_up": false,
    "free_shipping": false,
    "methods": null,
    "dimensions": null,
    "tags": [],
    "logistic_type": "not_specified"
  },
  "international_delivery_mode": "none",
  "seller_address": {
    "id": 265953311,
    "comment": "",
    "address_line": "Test Address 123",
    "zip_code": "1414",
    "city": {
      "id": "",
      "name": "Palermo"
    },
    "state": {
      "id": "AR-C",
      "name": "Capital Federal"
    },
    "country": {
      "id": "AR",
      "name": "Argentina"
    },
    "latitude": "",
    "longitude": "",
    "search_location": {
      "neighborhood": {
        "id": "TUxBQlBBTDI1MTVa",
        "name": "Palermo"
      },
      "city": {
        "id": "TUxBQ0NBUGZlZG1sYQ",
        "name": "Capital Federal"
      },
      "state": {
        "id": "TUxBUENBUGw3M2E1",
        "name": "Capital Federal"
      }
    }
  },
  "seller_contact": null,
  "location": {},
  "geolocation": {
    "latitude": "",
    "longitude": ""
  },
  "coverage_areas": [],
  "attributes": [
    {
      "id": "FAN_TYPE",
      "name": "Tipo de Ventilador",
      "value_id": "291719",
      "value_name": "De Techo",
      "attribute_group_id": "DFLT",
      "attribute_group_name": "Otros"
    },
    {
      "id": "HEIGHT_ADJUSTABLE",
      "name": "Altura Regulable",
      "value_id": "242084",
      "value_name": "No",
      "attribute_group_id": "DFLT",
      "attribute_group_name": "Otros"
    },
    {
      "id": "REMOTE_CONTROL",
      "name": "Control Remoto",
      "value_id": "242084",
      "value_name": "No",
      "attribute_group_id": "DFLT",
      "attribute_group_name": "Otros"
    },
    {
      "id": "WITH_LIGHT",
      "name": "Con Luz",
      "value_id": "242084",
      "value_name": "No",
      "attribute_group_id": "DFLT",
      "attribute_group_name": "Otros"
    },
    {
      "id": "BRAND",
      "name": "Marca",
      "value_id": "86416",
      "value_name": "Eiffel",
      "attribute_group_id": "MAIN",
      "attribute_group_name": "Atributos Principales"
    }
  ],
  "warnings": [],
  "listing_source": "",
  "variations": [
    {
      "id": 15311871917,
      "attribute_combinations": [
        {
          "id": null,
          "name": "Diseño",
          "value_id": null,
          "value_name": "Buho"
        }
      ],
      "price": 100,
      "available_quantity": 10,
      "sold_quantity": 0,
      "picture_ids": [],
      "seller_custom_field": null,
      "catalog_product_id": null,
      "attributes": []
    },
    {
      "id": 15313572235,
      "attribute_combinations": [
        {
          "id": null,
          "name": "Diseño",
          "value_id": null,
          "value_name": "Flamenco"
        }
      ],
      "price": 100,
      "available_quantity": 10,
      "sold_quantity": 0,
      "picture_ids": [],
      "seller_custom_field": null,
      "catalog_product_id": null,
      "attributes": []
    },
    {
      "id": 15313572237,
      "attribute_combinations": [
        {
          "id": null,
          "name": "Diseño",
          "value_id": null,
          "value_name": "Cocodrilo"
        }
      ],
      "price": 100,
      "available_quantity": 10,
      "sold_quantity": 0,
      "picture_ids": [],
      "seller_custom_field": null,
      "catalog_product_id": null,
      "attributes": []
    }
  ],
  "status": "active",
  "sub_status": [],
  "tags": [
    "poor_quality_picture",
    "immediate_payment"
  ],
  "warranty": null,
  "catalog_product_id": null,
  "domain_id": "MLA-FANS",
  "seller_custom_field": null,
  "parent_item_id": null,
  "differential_pricing": null,
  "deal_ids": [],
  "automatic_relist": false,
  "date_created": "2017-03-20T15:44:01.000Z",
  "last_updated": "2017-04-07T16:55:52.996Z"
}
```