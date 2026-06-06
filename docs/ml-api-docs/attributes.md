# Attributes

**Tags:** Attributes
**Created:** 2018-06-27T12:01:32Z
**Last Updated:** 2023-08-29T17:06:58Z

---

## Attributes

## What is an attribute?

An attribute represents a characteristic of your item, such as Microwave Oven Brand and Model. You can add them when listing an item, and you can change them or add new ones later. Take into account that attributes vary by category, and you can find them at the following URL:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/categories/{CATEGORY_ID}/attributes
[
 {
   "id": "HEADPHONE_FORMAT",
   "name": "Formato",
   "tags": {
     "fixed": true
   },
   "value_type": "list",
   "values": [
     {
       "id": "182349",
       "name": "In-Ear"
     }
   ],
   "attribute_group_id": "DFLT",
   "attribute_group_name": "Otros"
 },
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
       "id": "15438",
       "name": "Shure"
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
   "id": "WIRELESS_RANGE",
   "name": "Alcance Inalámbrico",
   "tags": {
     "hidden": true
   },
   "value_type": "number_unit",
   "value_max_length": 60,
   "allowed_units": [
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
       "id": "mm",
       "name": "mm"
     },
     {
       "id": "pulgadas",
       "name": "pulgadas"
     }
   ],
   "default_unit": "cm",
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
   "id": "BLUETOOTH",
   "name": "Bluetooth",
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
   "id": "BATTERY_LIFE",
   "name": "Duración de la Batería",
   "tags": {
     "hidden": true
   },
   "value_type": "number_unit",
   "value_max_length": 60,
   "allowed_units": [
     {
       "id": "h",
       "name": "h"
     },
     {
       "id": "años",
       "name": "años"
     },
     {
       "id": "d",
       "name": "d"
     },
     {
       "id": "m",
       "name": "m"
     },
     {
       "id": "meses",
       "name": "meses"
     },
     {
       "id": "ms",
       "name": "ms"
     },
     {
       "id": "s",
       "name": "s"
     }
   ],
   "default_unit": "h",
   "attribute_group_id": "DFLT",
   "attribute_group_name": "Otros"
 },
 {
   "id": "EAN",
   "name": "EAN",
   "tags": {
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
   "id": "IMPEDANCE",
   "name": "Impedancia",
   "tags": {
     "hidden": true
   },
   "value_type": "number_unit",
   "value_max_length": 60,
   "allowed_units": [
     {
       "id": "ω",
       "name": "ω"
     }
   ],
   "default_unit": "ω",
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
   "id": "CABLE_LENGTH",
   "name": "Longitud del Cable",
   "tags": {
     "hidden": true
   },
   "value_type": "number_unit",
   "value_max_length": 60,
   "allowed_units": [
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
       "id": "mm",
       "name": "mm"
     },
     {
       "id": "pulgadas",
       "name": "pulgadas"
     }
   ],
   "default_unit": "cm",
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
   "id": "MICROPHONE_INCLUDED",
   "name": "Micrófono Incluido",
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
   "id": "WIRELESS_CAPABILITY",
   "name": "Recepción Inalámbrica",
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
   "id": "FREQUENCY_RESPONSE",
   "name": "Respuesta en Frecuencia",
   "tags": {
     "hidden": true
   },
   "value_type": "string",
   "value_max_length": 60,
   "attribute_group_id": "DFLT",
   "attribute_group_name": "Otros"
 },
 {
   "id": "SENSITIVITY",
   "name": "Sensibilidad",
   "tags": {
     "hidden": true
   },
   "value_type": "number_unit",
   "value_max_length": 60,
   "allowed_units": [
     {
       "id": "db",
       "name": "db"
     }
   ],
   "default_unit": "db",
   "attribute_group_id": "DFLT",
   "attribute_group_name": "Otros"
 },
 {
   "id": "MEMORY_SIZE",
   "name": "Tamaño Efectivo de Memoria",
   "tags": {
     "hidden": true
   },
   "value_type": "number_unit",
   "value_max_length": 60,
   "allowed_units": [
     {
       "id": "gb",
       "name": "gb"
     },
     {
       "id": "gib",
       "name": "gib"
     },
     {
       "id": "kb",
       "name": "kb"
     },
     {
       "id": "kib",
       "name": "kib"
     },
     {
       "id": "mb",
       "name": "mb"
     },
     {
       "id": "mib",
       "name": "mib"
     },
     {
       "id": "tb",
       "name": "tb"
     },
     {
       "id": "tib",
       "name": "tib"
     }
   ],
   "default_unit": "gb",
   "attribute_group_id": "DFLT",
   "attribute_group_name": "Otros"
 },
 {
   "id": "HEADPHONES_TYPE",
   "name": "Tipo",
   "tags": {
     "hidden": true
   },
   "value_type": "string",
   "value_max_length": 60,
   "attribute_group_id": "DFLT",
   "attribute_group_name": "Otros"
 },
 {
   "id": "TYPE_COUPLING",
   "name": "Tipo de Acoplamiento",
   "tags": {
     "hidden": true
   },
   "value_type": "string",
   "value_max_length": 60,
   "suggested_values": [
     {
       "id": "114209",
       "name": "Supraaural"
     },
     {
       "id": "114210",
       "name": "Intraural"
     },
     {
       "id": "114208",
       "name": "Circumaural"
     }
   ],
   "attribute_group_id": "DFLT",
   "attribute_group_name": "Otros"
 },
 {
   "id": "DIAPHRAGM_UNIT",
   "name": "Unidad de Diafragma",
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
   "id": "UPC",
   "name": "UPC",
   "tags": {
     "multivalued": true,
     "variation_attribute": true
   },
   "type": "product_identifier",
   "value_type": "string",
   "value_max_length": 60,
   "attribute_group_id": "DFLT",
   "attribute_group_name": "Otros"
 }
]
```

## Types of possible attributes

There are different types of attributes, so the values to be supported will depend on them. Types of attributes can be viewed by entering the attribute API of the relevant category and querying the value\_type field. The possible types are:

### string

You can complete this type of attributes with free text, including letters and numbers in distinctively.

**Considerations**: for this attributes, there is a list of suggested values, but you can also enter new ones which are not included in such list. For new values, you should only send us the name, but for known values, you can send us the id as the name. We encourage you to see the suggested values in the API!

### number

These attributes can be only completed with numeric values.

**Considerations**: for this type of attributes there is a list of suggested values, but you can also enter new ones that are not included in that list. For new values, you should only send us the name, but for known values, you can send us the id as well as the name. We encourage you to see the suggested values in the API!

### number\_unit

Attributes made up of a numeric value and a unit. You can view the units available for such attributes in the attribute API.

Notes:

\- He format of these attributes will be validated when making or changing a listing, that is, checking that the above described format is followed.  
\- For all the above types of attributes, the value\_max\_length field shows the maximum number of characters to be uploaded in attribute value.

### boolean

It only allows for two values: one corresponding to a positive value and the other corresponding to a negative one.

**Considerations:** you should send the value id, which you can query in the attribute API.

### list

The values property lists the possible values that this attribute may take, there should always be at least one.  
**Considerations**: if you wish to enter a value that is not in the list, you can do so by sending your custom value in value\_name with the value\_id that is closest to yours. For example, if you are selling a mobile Air Conditioner but the attribute PRODUCT\_TYPE does not have a value that exactly represents your item, you can use the value\_id of the value Portable but in the value\_name send Mobile.

## Special behaviors

The tags property specifies particular attribute behaviors. Find below a list of the possible values that may be included, along with a behavior description.

- **allow\_variations**:It allows the item to vary by attribute. For this reason, you should check that the allow\_variations tag is set in “true” in order to upload the variations. To learn more about how to add them, please read the documentation about [Variations](../../en_us/variations).
- **defines\_picture**:it shows that the attribute defines the picture. For example, Color for shoes.The use of this tag will show how to display the different components in the flows. Take into account that this behavior only applies to attributes that allow for variations.
- **fixed**:it shows that there is a fixed value for the category and that all the items listed under this section should have such value. For example, if you are selling a Microwave Oven in the category MLB232411 corresponding to Microwave Ovens -&gt; Other Brands -&gt; 18 Litres, such category includes the VOLUMEN\_CAPACITY attribute with values 18 Litres, 20 Litres, etc. but for such category we already know that the appropriate value is 18 Litres. So you do not need to send it when listing because we autocomplete it for you.
- **hidden**: attributes with this property are not shown by the front, but they can be uploaded via the API.
- **inferred**:it shows that there is an inferred value for the attribute. That value cannot be modified. For example, in the category of iPhone under cell phones, the attribute LINE is fixed with the value iPhone, and it is inferred that the brand is Apple.
- **multivalued**:attributes can be completed with more than one value, separated by commas.
- **others**: this tag is for internal use.
- **product\_pk**: this tag helps identify the attributes that are part of the pk of a product. From it, we can uniquely identify a product from the catalogue.
- **read\_only**: this tag is for internal use. Attributes with this tag cannot be uploaded or changed by the sellers.
- **required**: to list the item, the attribute should be completed.
- **restricted\_values**: this tag is for internal use.
- **variation\_attribute**: if the item allows for variations, this attribute can be listed with a different value for each variation. For example, in any electronics listing with variations by color, product identifier codes can be uploaded for each variation. A value for this attribute can also be uploaded if the item does not have any variation.
- **new\_required**: the completeness of the attribute is required, for the publication of the item, whenever the condition of the item is new.
- **catalog\_listing\_required**: required to send a traditional publication to the catalog. If this value is equal to TRUE, it will be necessary to add the attribute when optin/sending to the catalog.

## Mandatory attributes

Important:

To standardize sales conditions in bulk sales domains such as flooring, cladding and others, when publishing or modifying publications you must send the mandatory attributes **Sales Unit** (**SALE\_UNIT**) and **Yield** (**YIELD\_OF\_SALES\_UNIT**). [Consult the domains that will be impacted](https://www.mercadolibre.com.ar/ayuda/30901)

[](https://www.mercadolibre.com.ar/ayuda/30901)

[](https://www.mercadolibre.com.ar/ayuda/30901)

[](https://www.mercadolibre.com.ar/ayuda/30901)

[Querying the resource /categories/{category\_id}/technical\_specs/input you can find out which are the mandatory attributes by category and complete them in advance to avoid the publications to be affected in their ranking in search results. You can identify the mandatory attributes mandatory with the tag “required”.  
Request:  
\
`curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/categories/{Category_id}/technical_specs/input`  
\
Example:  
\
`curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/categories/MLA1002/technical_specs/input`  
\
Response:  
\
`"value_type": "string", "value_max_length": 255, "tags": [ "catalog_required", "required" ], "values": [ { "id": "20262", "name": "AOC" }, { "id": "27499", "name": "Admiral" }, { "id": "3", "name": "Philips" }, { "id": "9838", "name": "Pioneer" }, { "id": "21980", "name": "RCA" }, { "id": "206", "name": "Samsung" }, "hierarchy": "PARENT_PK", "relevance": 1 } ], "unified_units": [ ] }, { "component": "TEXT_INPUT", "label": "GTIN-14", "ui_config": { "allow_custom_value": false, "allow_filtering": false }, "attributes": [ { "id": "GTIN14", "name": "GTIN-14", "value_type": "string", "value_max_length": 255, "tags": [ "vip_hidden", "hidden", "multivalued", "used_hidden", "variation_attribute", "validate" ], "hierarchy": "PRODUCT_IDENTIFIER", "relevance": 2 } ], "unified_units": [ ] } ] } ] }`  
\
Notes:  
\
\- The attributes marked as required in the resource /categories/{category\_id}/attributes are mandatory when listing, if they are not present an error will be generated.  
\- The attributes marked as mandatory in this new resource and that are not present in /categories/{category\_id}/attributes, will only affect the ranking on search results. Take into account that to identify the items that are losing their rank, you should check the incomplete\_technical\_specs tag.  
\
With the resource /categories/{category\_id}/technical\_specs/output you can show your products as they are displayed in Mercado Libre, this way, your listings will be organized with the same data sheet.  
\
**Required attributes by condition**  
\
Important:  
\
This resource is available only for Argentina, Brazil and Mexico.  
\
Consulting the **/categories/$CATEGORY\_ID/attributes/conditional** resource you can validate if the attributes that have the **"conditional\_required"** tag are required for your publication. To do this you must send all the information of the item you want to publish.  
\
Request:  
\
`curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/categories/$CATEGORY_ID/attributes/conditional`  
\
Example:  
\
`curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/categories/MLA403656/attributes/conditional { "title": "Item de test Cerveza Patagonia - No Ofertar", "category_id": "MLA403656", "price": 900, "currency_id": "ARS", "available_quantity": 10, "buying_mode": "buy_it_now", "condition": "new", "listing_type_id": "gold_special", "description": { "plain_text": "Descripción con Texto Plano \n" }, "video_id": "YOUTUBE_ID_HERE", "sale_terms": [ { "id": "WARRANTY_TYPE", "value_name": "Garantía del vendedor" }, { "id": "WARRANTY_TIME", "value_name": "90 días" } ], "pictures": [ { "source": "http://mla-s2-p.mlstatic.com/968521-MLA20805195516_072016-O.jpg" } ], "attributes": [ { "id": "BEER_STYLE", "name": "Estilo de cerveza", "value_id": "6443462", "value_name": "Pale Ale", "value_struct": null, "values": [], "attribute_group_id": "OTHERS", "attribute_group_name": "Otros" }, { "id": "BRAND", "name": "Marca", "value_id": "2809299", "value_name": "Patagonia", "value_struct": null, "values": [], "attribute_group_id": "OTHERS", "attribute_group_name": "Otros" }, { "id": "IS_CRAFT_BEER", "name": "Es cerveza artesanal", "value_id": "242084", "value_name": "No", "value_struct": null, "values": [], "attribute_group_id": "OTHERS", "attribute_group_name": "Otros" }, { "id": "ITEM_CONDITION", "name": "Condición del ítem", "value_id": "2230284", "value_name": "Nuevo", "value_struct": null, "values": [], "attribute_group_id": "OTHERS", "attribute_group_name": "Otros" }, { "id": "PACKAGING_TYPE", "name": "Tipo de envase", "value_id": "2290293", "value_name": "Botella", "value_struct": null, "values": [], "attribute_group_id": "OTHERS", "attribute_group_name": "Otros" }, { "id": "SALE_FORMAT", "name": "Formato de venta", "value_id": "1359391", "value_name": "Unidad", "value_struct": null, "values": [], "attribute_group_id": "OTHERS", "attribute_group_name": "Otros" }, { "id": "UNITS_PER_PACK", "name": "Unidades por pack", "value_id": null, "value_name": "1", "value_struct": null, "values": [], "attribute_group_id": "OTHERS", "attribute_group_name": "Otros" }, { "id": "UNIT_VOLUME", "name": "Volumen de la unidad", "value_id": "3681798", "value_name": "355 mL", "value_struct": {}, "values": [], "attribute_group_id": "OTHERS", "attribute_group_name": "Otros" } ] }`  
\
Response with required attributes:  
\
`{ required_attributes: [ { id: "GTIN", "name": "Código universal de producto" } ] }`  
\
Note:  
\
The required attributes in the response must be sent when publishing.  
\
Example:  
\
`curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/categories/MLA403656/attributes/conditional { "title": "Item de test Cerveza Artesanal - No Ofertar", "category_id": "MLA403656", "price": 900, "currency_id": "ARS", "available_quantity": 10, "buying_mode": "buy_it_now", "condition": "new", "listing_type_id": "gold_special", "description": { "plain_text": "Descripción con Texto Plano \n" }, "video_id": "YOUTUBE_ID_HERE", "sale_terms": [ { "id": "WARRANTY_TYPE", "value_name": "Garantía del vendedor" }, { "id": "WARRANTY_TIME", "value_name": "90 días" } ], "pictures": [ { "source": "http://mla-s2-p.mlstatic.com/968521-MLA20805195516_072016-O.jpg" } ], "attributes": [ { "id": "BEER_STYLE", "name": "Estilo de cerveza", "value_id": "5893263", "value_name": "Stout", "value_struct": null, "values": [], "attribute_group_id": "OTHERS", "attribute_group_name": "Otros" }, { "id": "BRAND", "name": "Marca", "value_id": null, "value_name": "artesanal", "value_struct": null, "values": [], "attribute_group_id": "OTHERS", "attribute_group_name": "Otros" }, { "id": "IS_CRAFT_BEER", "name": "Es cerveza artesanal", "value_id": "242085", "value_name": "Sí", "value_struct": null, "values": [], "attribute_group_id": "OTHERS", "attribute_group_name": "Otros" }, { "id": "IS_NON_ALCOHOLIC_BEER", "name": "Es cerveza sin alcohol", "value_id": "242084", "value_name": "No", "value_struct": null, "values": [], "attribute_group_id": "OTHERS", "attribute_group_name": "Otros" }, { "id": "ITEM_CONDITION", "name": "Condición del ítem", "value_id": "2230284", "value_name": "Nuevo", "value_struct": null, "values": [], "attribute_group_id": "OTHERS", "attribute_group_name": "Otros" }, { "id": "PACKAGING_TYPE", "name": "Tipo de envase", "value_id": "2130464", "value_name": "Botella retornable", "value_struct": null, "values": [], "attribute_group_id": "OTHERS", "attribute_group_name": "Otros" }, { "id": "SALE_FORMAT", "name": "Formato de venta", "value_id": "1359391", "value_name": "Unidad", "value_struct": null, "values": [], "attribute_group_id": "OTHERS", "attribute_group_name": "Otros" }, { "id": "UNITS_PER_PACK", "name": "Unidades por pack", "value_id": null, "value_name": "1", "value_struct": null, "values": [], "attribute_group_id": "OTHERS", "attribute_group_name": "Otros" }, { "id": "UNIT_VOLUME", "name": "Volumen de la unidad", "value_id": "188135", "value_name": "1 L", "value_struct": {}, "values": [], "attribute_group_id": "OTHERS", "attribute_group_name": "Otros" } ] }`  
\
Response without required attributes:  
\
`{ required_attributes: [] }`  
\
Note:  
\
In this case, it is not necessary to send the attributes that have the “conditional\_required” tag since the item to be published is within the exceptions.  
\
**How to identify penalized items**](https://www.mercadolibre.com.ar/ayuda/30901)

[With the resource items/search? You can list, in the field “results”, all the penalized items that have the incomplete\_technical\_specs tag. This way, you will identify the publications that are losing rank in the search results to improve their quality. To find out in detail the reasons why your publications are losing rank, you should check](https://www.mercadolibre.com.ar/ayuda/30901) [the quality resources](https://developers.mercadolibre.com.ar/en_us/find-out-how-the-sellers-are-in-relation-to-the-loading-of-attributes).

## Specify not applicable attributes

If any specification does not apply to the product you are posting, it is important to mark it as N/A (Not Applicable). To that end, you should send:

- Value\_id = “-1”
- Value\_name = Null

In the items API, in order to display the attributes N/A the parameter include\_internal\_attributes=true must be added, since if the request is made without it, the attributes N/A will not be displayed.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/{item_id?attributes=attributes&include_internal_attributes=true
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA0000000?attributes=attributes&include_internal_attributes=true
```

Response:

```javascript
],
  "attributes": [
    {
      "id": "BRAND",
      "name": "Marca",
      "value_id": "134",
      "value_name": "Winco",
      "value_struct": null,
      "attribute_group_id": "OTHERS",
      "attribute_group_name": "Otros"
    },
    {
      "id": "GTIN",
      "name": "Código universal de producto",
      "value_id": "-1",
      "value_name": null,
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
    },
  {
      "id": "MODEL",
      "name": " Modelo",
      "value_id": null,
      "value_name": "Modelo1",
      "value_struct": null,
      "attribute_group_id": "OTHERS",
    "attribute_group_name": "Otros"
    "attribute_group_name": "Otros"
    },

    {
      "id": "POWER",
      "name": "Potencia",
      "value_id":"-1",
      "value_name":null,
      "value_struct": null    
  }
      "attribute_group_id": "OTHERS",
      "attribute_group_name": "Otros"
    },
```

 

## Create ítem with atribute N/A

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -d '{
 "site_id":"MLA",
 "title":"Item de testeo, por favor no contactar --kc:off",
 "category_id":"MLA125703",
 "price":4000,
 "currency_id":"ARS",
 "buying_mode":"buy_it_now",
 "listing_type_id":"gold_special",
 "condition":"new",
 "available_quantity":10,
"attributes": [{
			"id": "COLOR",
			"value_id": "52049"
		},
		{
			"id": "VOLTAGE",
			"value_name": "198813"
		},
		{
			"id": "DIAMETER",
			"value_id": “-1”,
			"value_name": null
		}

 ]
}'
```

## Change an active post and indicate an attribute is not applicable (N/A)

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -H "Accept: application/json" -d {	"attributes": [{
			"id": "COLOR",
			"value_id": "52049"
		},
		{
			"id": "VOLTAGE",
			"value_name": "198813"
		},
		{
			"id": "DIAMETER",
			"value_id": “-1”,
			"value_name": null
		},
		{
			"id": "LATERAL_OSCILLATION",
			"value_id": "242085"
		
		}
	]
}
```

### Considerations

- Attributes with allow\_variations tag cannot be N/A.
- If a value\_id -1 attribute is sent, but the value\_name has a value other than null, it will be disregarded as if it has never been sent. This is because, from the item API, it is verified whether the N/A specification has been sent, and both fields are read to consider an N/A attribute.
- So far, if you send N/A, it can only be replaced for a value (When making a PUT, the attribute cannot be null).

## Exclusions and implications of behaviors

Matrix of exclusions               Required Fixed Allow\_variations Variation\_attribute Defines\_Picture Hidden Required           X Fixed     X X X   Allow\_variations   X   X     Variation\_attribute   X X   X   Defines\_Picture   X   X     Hidden X          

Matrix of exclusions               Required Fixed Allow\_variations Variation\_attribute Defines\_Picture Hidden Required             Fixed             Allow\_variations             Variation\_attribute             Defines\_Picture     X       Hidden            

## Benefit

Item information will be more comprehensive and relevant, with attributes displayed in a VIP data sheet to avoid questions and friction.

## Create an item with attributes

Imagine that you want to sell a Microwave Oven about which you know brand, model, and capacity. First, you should select the category in which you want to list it and, then, you should query the attributes for such category:

```javascript
https://api.mercadolibre.com/categories/MLA125703/attributes
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
     "conditional_required": true
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

In this example, you can see that the BRAND attribute has a fixed tag for category. This makes sense because, after navigating the tree to find the category under which to list the microwave oven, you have implicitly chosen its brand. Then, you just need to analyze the available attributes, their types and suggested values to make the listing JSON, including the attributes section. Find below how to do it:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -d '{
 "site_id":"MLA",
 "title":"Item de testeo, por favor no contactar --kc:off",
 "category_id":"MLA125703",
 "price":4000,
 "currency_id":"ARS",
 "buying_mode":"buy_it_now",
 "listing_type_id":"gold_special",
 "condition":"new",
 "available_quantity":10,
 "attributes":[
   {
     "id":"MODEL",
     "value_name":"B228D"
   },
   {
     "id":"VOLUME_CAPACITY",
     "value_name":"28 L"
   }
 ]
}' 'https://api.mercadolibre.com/items'
```

Remember:

- Attributes can be added to items at any time during their life cycle.
- If the attribute has a suggested\_values list, you can send either one of those values or a new one. To send new values you must only send the value\_name but for the existing values, sending the value\_id is enough.
- For list-type attributes, you should only send values included in such list. Sending only the value\_id is enough. If you wish to enter a value that is not on the list, you can do so by sending your custom value in value\_name with the value\_id that is closest to yours.
- All the main attributes are identified as MAIN in the field attribute\_group\_id while, the secondary attributes will be differentiated under other values such as: DELT.
- Take into account that in categories that include primary and secondary colors, as an exception, it will not be necessary that all the variations duplicate both attributes.

## Most used values (tops values)

With this resource you will be able to know what are the most used values ​​for a specific attribute of a domain. You can also further search by indicating other attribute values ​​so that only the values ​​that apply to them are listed.  
Sellers will be able to use the values ​​obtained to choose the correct one among them and improve the quality of the publications.

### Mandatory parameters

**domain\_id**: ID of the domain to which we want to refer.  
**attribute\_id**: ID of the attribute of which we need to know the most used values.

### Optional parameters

**limit**: limit of results that is requested has a maximum of 1000.  
**metric\_type**: metric by which the results will be ordered, in principle only NOLs (new publications in the last 90 days) are supported. The only parameter at the moment is NOL\_90. Soon, we will add new criteria. Example: metric\_type=NOL\_90.

To identify the recommended and known attributes, you must perform a POST.

Simple request with an attribute:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/catalog_domains/$DOMAIN_ID/attributes/$ATTRIBUTE_ID/top_values
```

Example with an attribute:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/catalog_domains/MLA-CELLPHONES/attributes/BRAND/top_values
```

Short response of Brands to MLA-CELLPHONES domain:

```javascript
[
    {
        "id": "9344",
        "name": "Apple",
        "metric": 12189
    },
    {
        "id": "206",
        "name": "Samsung",
        "metric": 10389
    },
    {
        "id": "59387",
        "name": "Xiaomi",
        "metric": 5183
    },
    {
        "id": "2503",
        "name": "Motorola",
        "metric": 4272
    },
    {
        "id": "8784",
        "name": "Huawei",
        "metric": 1203
    },
    {
        "id": "215",
        "name": "LG",
        "metric": 1022
    }
]
```

Request with more than one attribute:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/catalog_domains/$DOAMAIN_ID/attributes/$ATTRIBUTE_ID/top_value
{
    "known_attributes": [
        {
            "id": "attributes.id",
            "value_id": "attributes.value_id"
        }
    ]
}
```

Note:

The list of **known\_attributes** represents the set of attributes that will be taken into account for the top values calculation.

Example with more than one attribute:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' -H 'Authorization: Bearer $ACCESS_TOKEN'  https://api.mercadolibre.com/catalog_domains/MLA-CELLPHONES/attributes/MODEL/top_value
{
   "known_attributes": [
       {
           "id": "BRAND",
           "value_id": "206"
       }
   ]
}
```

Short response of Brands to Samsung brand in the MLA-CELLPHONES domain:

```javascript
[
    {
        "id": "7693",
        "name": "A50",
        "metric": 517
    },
    {
        "id": "35040",
        "name": "A30",
        "metric": 437
    },
    {
        "id": "8480",
        "name": "A10",
        "metric": 345
    },
    {
        "id": "397729",
        "name": "J2 Prime",
        "metric": 301
    }
]
```

Note:

All the values ​​of the requested attribute will be listed in the response. This listing will be sorted by the **metric** field in descending order.

## Change and/or add attributes

Once the listing is created, you can add new attributes or change the existing ones. Let's assume that you want to change the Microwave Oven Model and add the Number of Programs. First, we suggest you should make a GET to know the attributes already filled out (for example, Model).  
Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/{item_id}
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA0000000
```

Response:

```javascript
{
  "id": "MLA0000000",
  "site_id": "MLA",
  "title": "Korg Sintetizador Analogico Monofonico 37 Teclas Ms-20 Mini",
  "subtitle": null,
  "seller_id": 000000,
  "category_id": "MLA3001",
  "official_store_id": null,
  "price": 15150.63,
  "base_price": 15150.63,
  "original_price": null,
  "currency_id": "ARS",
  "initial_quantity": 32,
  "available_quantity": 27,
  "sold_quantity": 5,
  "sale_terms": [
  ],
  "buying_mode": "buy_it_now",
  "listing_type_id": "gold_special",
  "start_time": "2016-06-21T20:59:05.000Z",
  "stop_time": "2036-06-16T20:59:05.000Z",
  "condition": "new",
  "permalink": "http://articulo.mercadolibre.com.ar/MLA-624882373-korg-sintetizador-analogico-monofonico-37-teclas-ms-20-mini-_JM",
  "thumbnail": "http://mla-s2-p.mlstatic.com/777099-MLA26466460545_112017-I.jpg",
  "secure_thumbnail": "https://mla-s2-p.mlstatic.com/777099-MLA26466460545_112017-I.jpg",
  "pictures": [
    {
      "id": "777099-MLA26466460545_112017",
      "url": "http://mla-s2-p.mlstatic.com/777099-MLA26466460545_112017-O.jpg",
      "secure_url": "https://mla-s2-p.mlstatic.com/777099-MLA26466460545_112017-O.jpg",
      "size": "500x297",
      "max_size": "500x297",
      "quality": ""
    },
    {
      "id": "838812-MLA26466460548_112017",
      "url": "http://mla-s2-p.mlstatic.com/838812-MLA26466460548_112017-O.jpg",
      "secure_url": "https://mla-s2-p.mlstatic.com/838812-MLA26466460548_112017-O.jpg",
      "size": "500x167",
      "max_size": "500x167",
      "quality": ""
    },
    {
      "id": "788581-MLA26466460552_112017",
      "url": "http://mla-s2-p.mlstatic.com/788581-MLA26466460552_112017-O.jpg",
      "secure_url": "https://mla-s2-p.mlstatic.com/788581-MLA26466460552_112017-O.jpg",
      "size": "500x262",
      "max_size": "500x262",
      "quality": ""
    },
    {
      "id": "700278-MLA26466460555_112017",
      "url": "http://mla-s2-p.mlstatic.com/700278-MLA26466460555_112017-O.jpg",
      "secure_url": "https://mla-s2-p.mlstatic.com/700278-MLA26466460555_112017-O.jpg",
      "size": "500x169",
      "max_size": "500x169",
      "quality": ""
    },
    {
      "id": "944935-MLA26466456419_112017",
      "url": "http://mla-s2-p.mlstatic.com/944935-MLA26466456419_112017-O.jpg",
      "secure_url": "https://mla-s2-p.mlstatic.com/944935-MLA26466456419_112017-O.jpg",
      "size": "500x210",
      "max_size": "500x210",
      "quality": ""
    },
    {
      "id": "869141-MLA26466456422_112017",
      "url": "http://mla-s2-p.mlstatic.com/869141-MLA26466456422_112017-O.jpg",
      "secure_url": "https://mla-s2-p.mlstatic.com/869141-MLA26466456422_112017-O.jpg",
      "size": "500x500",
      "max_size": "500x500",
      "quality": ""
    },
    {
      "id": "867779-MLA26466456425_112017",
      "url": "http://mla-s2-p.mlstatic.com/867779-MLA26466456425_112017-O.jpg",
      "secure_url": "https://mla-s2-p.mlstatic.com/867779-MLA26466456425_112017-O.jpg",
      "size": "500x500",
      "max_size": "500x500",
      "quality": ""
    },
    {
      "id": "849841-MLA26466456432_112017",
      "url": "http://mla-s2-p.mlstatic.com/849841-MLA26466456432_112017-O.jpg",
      "secure_url": "https://mla-s2-p.mlstatic.com/849841-MLA26466456432_112017-O.jpg",
      "size": "500x500",
      "max_size": "500x500",
      "quality": ""
    },
    {
      "id": "877748-MLA26466456435_112017",
      "url": "http://mla-s2-p.mlstatic.com/877748-MLA26466456435_112017-O.jpg",
      "secure_url": "https://mla-s2-p.mlstatic.com/877748-MLA26466456435_112017-O.jpg",
      "size": "500x500",
      "max_size": "500x500",
      "quality": ""
    }
  ],
  "video_id": "tCRPz6Q70VU",
  "descriptions": [
    {
      "id": "0000000-1123489912"
    }
  ],
  "accepts_mercadopago": true,
  "non_mercado_pago_payment_methods": [
    {
      "id": "MLATB",
      "description": "Transferencia bancaria",
      "type": "G"
    },
    {
      "id": "MLAOT",
      "description": "Tarjeta de crédito",
      "type": "N"
    },
    {
      "id": "MLAMO",
      "description": "Efectivo",
      "type": "G"
    }
  ],
  "shipping": {
    "mode": "not_specified",
    "methods": [
    ],
    "tags": [
    ],
    "dimensions": null,
    "local_pick_up": true,
    "free_shipping": false,
    "logistic_type": "not_specified",
    "store_pick_up": false
  },
  "international_delivery_mode": "none",
  "seller_address": {
    "comment": "",
    "address_line": "",
    "zip_code": "",
    "city": {
      "id": "TUxBQlJFQzkyMTVa",
      "name": "Recoleta"
    },
    "state": {
      "id": "AR-C",
      "name": "Capital Federal"
    },
    "country": {
      "id": "AR",
      "name": "Argentina"
    },
    "search_location": {
      "neighborhood": {
        "id": "TUxBQlJFQzkyMTVa",
        "name": "Recoleta"
      },
      "city": {
        "id": "TUxBQ0NBUGZlZG1sYQ",
        "name": "Capital Federal"
      },
      "state": {
        "id": "TUxBUENBUGw3M2E1",
        "name": "Capital Federal"
      }
    },
    "latitude": -34.598694,
    "longitude": -58.391033,
    "id": 156708999
  },
  "seller_contact": null,
  "location": {
  },
  "geolocation": {
    "latitude": -34.598694,
    "longitude": -58.391033
  },
  "coverage_areas": [
  ],
  "attributes": [
    {
      "id": "AMOUNT_OF_KEYS",
      "name": "Cantidad de teclas",
      "value_id": null,
      "value_name": "37",
      "value_struct": null,
      "attribute_group_id": "DFLT",
      "attribute_group_name": "Otros"
    },
    {
      "id": "DIMENSIONS",
      "name": "Medidas",
      "value_id": null,
      "value_name": "493 × 257 × 208 mm",
      "value_struct": null,
      "attribute_group_id": "DFLT",
      "attribute_group_name": "Otros"
    },
    {
      "id": "WEIGHT",
      "name": "Peso",
      "value_id": null,
      "value_name": "4.8 kg",
      "value_struct": null,
      "attribute_group_id": "DFLT",
      "attribute_group_name": "Otros"
    },
    {
      "id": "BRAND",
      "name": "Marca",
      "value_id": "18163",
      "value_name": "KORG",
      "value_struct": null,
      "attribute_group_id": "MAIN",
      "attribute_group_name": "Principales"
    },
    {
      "id": "MODEL",
      "name": "Modelo",
      "value_id": "522231",
      "value_name": "MS-20 mini",
      "value_struct": null,
      "attribute_group_id": "MAIN",
      "attribute_group_name": "Principales"
    }
  ],
  "warnings": [
  ],
  "listing_source": "",
  "variations": [
  ],
  "status": "active",
  "sub_status": [
  ],
  "tags": [
    "good_quality_thumbnail",
    "good_quality_picture",
    "immediate_payment"
  ],
  "warranty": "null",
  "catalog_product_id": null,
  "domain_id": "MLA-MUSICAL_KEYBOARDS",
  "parent_item_id": null,
  "differential_pricing": null,
  "deal_ids": [
  ],
  "automatic_relist": false,
  "date_created": "2016-06-21T20:59:05.000Z",
  "last_updated": "2017-12-30T16:49:01.000Z"
}
```

**You will need to load this attribute when you make a PUT not to lose information.**  
Ready to make an update? Make a PUT including new attributes, such as Number of Programs, and those you already had (such as Model).

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' -H "Content-Type: application/json" -H "Accept: application/json" -d "{
   "attributes": [{
       "id": "BRAND"
   },{
       "id": "MODEL",
       "value_name": "B466GT"
   }, {
       "id": "VOLUME_CAPACITY"
   }, {
       "id": "NUMBER_OF_PROGRAMS",
       "value_name": "4"
   }]
} "https://api.mercadolibre.com/items/MLA621092868"
```

## Delete attributes

The correct way to eliminate the attribute value is by sending **null** in the "value\_id" and "value\_name" fields. This way, the attribute remains in the item, but without value. If any data is required and you try to send "null", we will return a bad request with the following error code: **"code": "item.attributes.deleted\_required"** Request:

```javascript
curl -H 'Content-Type: application/json' -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA20805195516  -d
```

Example:

```javascript
{
	"title": "Item de test - No Ofertar 456",
	"category_id": "MLA126186",
	"price": 10,
	"currency_id": "ARS",
	"available_quantity": 1,
	"buying_mode": "buy_it_now",
	"listing_type_id": "gold_special",
	"condition": "new",
	"description": "Item de test - No Ofertar",
	"video_id": "YOUTUBE_ID_HERE",
	"warranty": "null",
	"pictures": [{
		"source": "http://mla-s2-p.mlstatic.com/968521-MLA20805195516_072016-O.jpg"
	}],
	"attributes": [{
			"id": "COLOR",
			"value_id": "52049"
		},
		{
			"id": "VOLTAGE",
			"value_name": "198813"
		},
		{
			"id": "DIAMETER",
			"value_id": null,
			"value_name": null
		}
	]
}
```

**Next:** [Product identifiers](../../en_us/product-identifiers/).