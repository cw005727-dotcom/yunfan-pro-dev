# Billing data

**Tags:** Billing,data
**Created:** 2018-06-27T12:01:33Z
**Last Updated:** 2024-06-25T20:22:06Z

---

## Billing data

Important:

\- To obtain the response with the new version, send the **header 'x-version: 2'**  
\- This change to v2 only impacts MLA, MLB, MLM, MLC, MCO, and MEC; the other sites (MLU, MPE, MLV) continue with the first version of the resource.  
\- We will soon remove the previous version of the /billing\_info resource for the sites mentioned earlier.  
\- For MEC, this is the first time we are publishing this resource, so there is no need to replace the previous version, just adopt the new one.  
\- For the MLM site, billing-info data is only returned in the current version or V2 when the purchase is made through the cart or with Extended Warranty and/or Theft or Damage Protection. We are gradually migrating sellers to V2. In cases where the data is not available in V2, it is possible to consult V1 to obtain this information.

To bill a sale you need to have the buyer's data which are available in Orders resource, more specifically, in /orders/order\_id/billing\_info.

## Query billing data

To get the information about a buyer's billing data contained in an order, make the following call. Request:

```javascript
curl -X GET \
  -H 'Authorization: Bearer $ACCESS_TOKEN' \
  -H 'x-version:2' \
  https://api.mercadolibre.com/orders/$ORDER_ID/billing_info
```

Example:

```javascript
curl -X GET \
  -H 'Authorization: Bearer $ACCESS_TOKEN' \
  -H 'x-version:2' \
  https://api.mercadolibre.com/orders/1691789796/billing_info
```

Response these are examples of persons Individual/Legal Entity **MLA - Individual**

```javascript
{
    "site_id":"MLA",
    "buyer":{
        "cust_id": "123123123"
       "billing_info":{
          "name":"Juan Soares",
          "last_name":"Sanchez",
          "identification":{
             "type":"DNI" / "CUIL",
             "number":"307722738"
          },
          "taxes": {
            "taxpayer_type": {
                "id": "01",
                "description": "Consumidor Final"
            }
          },
          "address":{
             "street_name":"Aysen",
             "street_number":"30",
             "city_name":"Buenos Aires",
             "state":{
                "code": "01",
                "name": "Buenos Aires"
            },
             "zip_code":"5000",
             "country_id":"AR"
          },
          "attributes": {
            "vat_discriminated_billing": "true",
            "doc_type_number": "123123123",
            "is_normalized": true,
            "cust_type": "CO"
          }
       }
    },
    "seller":{
        "cust_id": 0,
    }
```

**MLA - Legal Entity**

```javascript
{
    "site_id":"MLA",
    "buyer":{
        "cust_id": "123123123",
       "billing_info":{
          "name":"Apple Argentina"
          "identification":{
             "type":"CUIT",
             "number":"307722738"
          },
          "taxes": {
            "taxpayer_type": {
                "description": "IVA Responsable Inscripto"
            }
          },
          "address":{
             "street_name":"Aysen",
             "street_number":"30",
             "city_name":"Buenos Aires",
             "state":{
                "code": "01",
                "name": "Buenos Aires"
            },
             "zip_code":"5000",
             "country_id":"AR"
          },
          "attributes": {
            "vat_discriminated_billing": "true",
            "doc_type_number": "123123123",
            "is_normalized": true,
            "cust_type": "BU"
          }
       }
    },
    "seller":{
        "cust_id": 0,
    }

```

**MLB - Individual**

```javascript
{
  "site_id": "MLB",
  "buyer": {
    "cust_id": 234343545,
    "billing_info": {
      "name": "María Lupita",
      "last_name": "Gomez Blanco",
      "identification": {
        "type": "CPF",
        "number": "32659430" 
      },
      "address": {
        "street_name": "Nicolau de Marcos",
        "street_number": "05",
        "city_name": "Bom Jardim",
        "comment": "7b",
        "neighborhood": "Jardim Ornelas",
        "state": {
          "name": "Rio de Janeiro"
        },
        "zip_code": "28660000",
        "country_id": "BR"
      },
      "attributes": {
          "is_normalized": true,
          "cust_type": "CO"
      }
    }
  },
  "seller": {
    "cust_id": 34345454,
  }}

```

**MLB - Legal Entity**

```javascript
{
  "site_id": "MLB",
  "buyer": {
    "cust_id": 234343545,
    "billing_info": {
      "name": "Apple Brasil",
   "identification": {
        "type": "CNPJ",
        "number": "326594309119203" 
      },
      "taxes": {
        "inscriptions": 
         {
            "state_registration": "30703088534",
         }
        , 
        "taxpayer_type": {
          "description": "Contribuinte" 
        }
      },
      "address": {
        "street_name": "Nicolau de Marcos",
        "street_number": "05",
        "city_name": "Bom Jardim",
        "comment": "7b",
        "neighborhood": "Jardim Ornelas",
        "state": {
          "name": "Rio de Janeiro"
        },
        "zip_code": "28660000",
        "country_id": "BR"
      },
      "attributes": {
          "is_normalized": true,
          "cust_type": "BU"
      }
    }
  },
  "seller": {
    "cust_id": 34345454,
  }}

```

**MLM - Individual**

```javascript
{
  "site_id": "MLM",
  "buyer": {
    "cust_id": 234343545,
    "billing_info": {
      "name": "Juan Soraes",
   "last_name": "Sanchez"	
      "identification": {
        "type": "RFC",
        "number": "CUPU800825569"
      },
      "taxes": {
        "contributor": "PERSONA FÍSICA",
        "taxpayer_type": {
          "id": "606",
          "description": "Arrendamiento"
        },
        "cfdi": {
          "id": "G03",
          "description": "Gastos en general"
        }
      },
      "address": {
        "street_name": "Calle 134A #18A",
        "street_number": "05",
        "city_name": "Alvaro Obregón",
        "state": {
          "code": "DIF",
          "name": "Distrito Federal"
        },
        "zip_code": "01040",
        "country_id": "MX"
      },
      "attributes": {
        "vat_discriminated_billing": "true",
        "birth_date": "2000/02/03",
        "is_normalized": true,
        "customer_type": "CO"
      }
    }
  },
  "seller": {
    "cust_id": 34345454  }}

```

**MLM - Legal Entity**

```javascript
{
  "site_id": "MLM",
  "buyer": {
    "cust_id": 234343545,
    "billing_info": {
      "name": "SALVADO HNOS S A",
      "identification": {
        "type": "RFC",
        "number": "CUPU800825569"
      },
      "taxes": {
        "contributor": "PERSONA MORAL",
        "taxpayer_type": {
          "id": "606",
          "description": "Arrendamiento"
        },
        "cfdi": {
          "id": "G03",
          "description": "Gastos en general"
        }
      },
      "address": {
        "street_name": "Calle 134A #18A",
        "street_number": "05",
        "city_name": "Alvaro Obregón",
        "state": {
          "code": "DIF",
          "name": "Distrito Federal"
        },
        "zip_code": "01040",
        "country_id": "MX"
      },
      "attributes": {
        "vat_discriminated_billing": "true",
        "birth_date": "2000/02/03",
        "is_normalized": true,
        "customer_type": "BU"
      }
    }
  },
  "seller": {
    "cust_id": 34345454,
 }
}

```

**MLC - Individual**

```javascript
{
    "site_id": "MLC",
    "buyer": {
      "cust_id": 234343545,
      "billing_info": {
        "name": "Tamara nicolt",
        "last_name": "larenas reyes",
        "identification": {
          "type": "RUT",
          "number": "159321126"
        },
     "address": {
          "street_name": "Pasaje Beethoven",
          "street_number": "56",
          "city_name": "Maipú",
          "comment": "73",
          "neighborhood": "Maipú",
          "state": {
            "name": "RM (Metropolitana)"
          },
          "country_id": "CL"
        },
        "attributes": {
          "is_normalized": true,
           "cust_type": "CO"
       }
      }
    },
    "seller": {
      "cust_id": 34345454,
    }
  }

```

**MLC - Legal Entity**

```javascript
{
    "site_id": "MLC",
    "buyer": {
      "cust_id": 234343545,
      "billing_info": {
        "name": "Apple",
        "identification": {
          "type": "RUT",
          "number": "159321126"
        },
        "taxes": {
           "economic_activity": "Vta.y arrdo artcls Electrónico",
        },
        "address": {
          "street_name": "Pasaje Beethoven",
          "street_number": "56",
          "city_name": "Maipú",
          "comment": "73",
          "neighborhood": "Maipú",
          "state": {
            "name": "RM (Metropolitana)"
          },
          "country_id": "CL"
        },
        "attributes": {
          "is_normalized": true,
      "cust_type": "BU" 
       }
      }
    },
    "seller": {
      "cust_id": 34345454,
    }
  }

```

**MCO - Individual**

```javascript
{
  "site_id": "MCO",
  "buyer": {
    "cust_id": 234343545,
    "billing_info": {
      "name": "Adrian",
      "last_name": "Garces",
      "identification": {
        "type": "CC",
        "number": "73160000"
      },
     "address": {
          "street_name": "Pasaje Beethoven",
          "street_number": "#10-11",
          "city_name": "La Candelaria",
          "comment": "73",
          "neighborhood": "Candelaria",
          "state": {
            "name": "RM (Metropolitana)",
	     "code": "CO-DC"
          },
          "country_id": "CO"
        },
  },
  "seller": {
    "cust_id": 34345454,
  }
}

```

**MCO - Legal Entity**

```javascript
{
  "site_id": "MCO",
  "buyer": {
    "cust_id": 234343545,
    "billing_info": {
      "name": "Apple",
      "identification": {
        "type": "CC",
        "number": "73160000"
      },
      "address": {
          "street_name": "Pasaje Beethoven",
          "street_number": "#10-11",
          "city_name": "La Candelaria",
          "comment": "73",
          "neighborhood": "Candelaria",
          "state": {
            "name": "RM (Metropolitana)",
	     "code": "CO-DC"
          },
          "country_id": "CO"
        },
      "attributes": {
        "is_normalized": true
      }
    }
  },
  "seller": {
    "cust_id": 34345454,
  }

```

**MEC - Individual**

```javascript
{
  "site_id": "MEC",
  "buyer": {
    "cust_id": 234343545,
    "billing_info": {
      "name": "Adrian",
      "last_name": "Garces",
      "identification": {
        "type": "RUC" / "CI",
        "number": "1711168979001"
      },
      "address": {
        "country_id": "EC"
      },
      "attributes": {
        "is_normalized": true
    "email":"test_user_937841642@testuser.com"
      }
    }
  },
  "seller": {
    "cust_id": 34345454,
  }
}

```

**MEC - Legal Entity**

```javascript
{
  "site_id": "MEC",
  "buyer": {
    "cust_id": 234343545,
    "billing_info": {
      "name": "Apple",
      "identification": {
        "type": "RUC",
        "number": "1711168979001"
      },
      "address": {
        "country_id": "EC"
      },
      "attributes": {
        "is_normalized": true
    	 "email":"test_user_937841642@testuser.com"
      }
    }
  },
  "seller": {
    "cust_id": 34345454,
  }
}

```

## Types and values

**site\_id**

**buyer:**

- cust\_id: buyer ID

**billing\_info:**

- name: buyer's name
- last\_name: buyer's last name
- identification:
  
  - type: type of document
  - number: document number

**taxes:**

- Inscriptions:
  
  - state\_registration
- economic\_activity
- contributor: taxpayer type
- taxpayer\_type
  
  - id: tax status ID
  - description: the buyer's tax status

**address:**

- street\_name
- street\_number
- city\_name
- neighbhood
- zip\_code
- comment: additional comment about the buyer's address
- country\_id
- state:
  
  - code: state code
  - name

**attirbutes:**

- birth\_date: buyer's birthday
- doc\_type\_number: número del documento
- cust\_type: type of person (Legal Entity or Individual)

**seller:**

- cust\_id: Id del vendedor

The values CO or BU in the cust\_type field mean:  
\- CO : Customer  
\- BU : Business

## Consult billing data for MLU, MPE, and MLV

To query billing data in MLU, MPE, and MLV, you should continue using the first version of the resource without adding any headers. Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/$ORDER_ID/billing_info
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/1691789796/billing_info
```

Response: **Individual**  
Order Id: 1691789796  
User id: 316440831

```javascript
{
  "billing_info": {
    "additional_info": [
      {
        "type": "STREET_NAME",
        "value": "Arias"
      },
      {
        "type": "ZIP_CODE",
        "value": "1430"
      },
      {
        "type": "STREET_NUMBER",
        "value": "3571"
      },
      {
        "type": "CITY_NAME",
        "value": "Saavedra"
      },
      {
        "type": "LAST_NAME",
        "value": "Gomez Blanco"
      },
      {
        "type": "SITE_ID",
        "value": "MLA"
      },
      {
        "type": "COMMENT",
        "value": "7b"
      },
      {
        "type": "DOC_NUMBER",
        "value": "32659430"
      },
      {
        "type": "DOC_TYPE",
        "value": "DNI"
      },
      {
        "type": "STATE_NAME",
        "value": "Capital Federal"
      },
      {
        "type": "FIRST_NAME",
        "value": "María Lupita"
      },
      {
        "type": "NEIGHBORHOOD",
        "value": "Divino"
      }
    ],
    "doc_number": "32659430",
    "doc_type": "DNI"
  }
}
```

**Legal Entity**  
Order Id: 1691801481  
User id: 316440831

```javascript
{
  "billing_info": {
    "additional_info": [
      {
        "type": "DOC_NUMBER",
        "value": "30703088534"
      },
      {
        "type": "ZIP_CODE",
        "value": "1430"
      },
      {
        "type": "STATE_REGISTRATION",
        "value": "30703088534"
      },
      {
        "type": "TAXPAYER_TYPE_ID",
        "value": "IVA Responsable Inscripto"
      },
      {
        "type": "BUSINESS_NAME",
        "value": "Mercado Libre S.R.L"
      },
      {
        "type": "CITY_NAME",
        "value": "Saavedra"
      },
      {
        "type": "STREET_NAME",
        "value": "Arias"
      },
      {
        "type": "STREET_NUMBER",
        "value": "SN"
      },
      {
        "type": "COMMENT",
        "value": "7b"
      },
      {
        "type": "DOC_TYPE",
        "value": "CUIT"
      },
      {
        "type": "STATE_NAME",
        "value": "Capital Federal"
      },
      {
        "type": "SITE_ID",
        "value": "MLA"
      },
      {
        "type": "NEIGHBORHOOD",
        "value": "Divino"
      },   
 ],
    "doc_number": "30703088534",
    "doc_type": "CUIT"
  }
}

```

## Types and values for additional\_info

These are the possibles types and values (type / value) for additional\_info.

**Individual Entity**

- first\_name: buyer's name
- last\_name: buyer's last name
- doc\_type: document type
- doc\_number: document number
- zip\_code: buyer zip code
- street\_name: buyer's address
- street\_number: buyer address number

Can be "SN" for street cases without number

- comment: extra comment about buyer's address
- state\_name: buyer's status
- city\_name: buyer's city

**Legal Entity**

business\_name: Buying legal entity name

taxpayer\_type\_id: legal entity VAT position

Possible values: between "monotax" (non-VAT taxpayer) and "VAT"

Possible values: any string, "SN" for street without number

comment: buyer's billing address floor

state\_name: buyer's billing address state

city\_name: buyer's billing address city

**DOC\_TYPE's**

**Venezuela (MLV)**: CI, RIF, Passport.

**Uruguay (MLU):** CI, RUT.

**Perú (MPE):** DNI, CE.

Note:

We recommend that you review the details of all discounts applied on a sale. It is possible to obtain these details with [the /discounts resource](https://developers.mercadolibre.com.ar/en_us/manage-sales?nocache=true#Get-discounts-applied).