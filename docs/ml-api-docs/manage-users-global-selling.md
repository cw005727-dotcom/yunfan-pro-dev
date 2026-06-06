# Users

**Tags:** Global selling,Manage users,users
**Created:** 2020-05-02T18:43:43Z
**Last Updated:** 2025-12-26T17:54:48Z

---

## Manage users

If you [registered your application](https://global-selling.mercadolibre.com/devsite/register-your-application-global-selling) and [authenticated](https://global-selling.mercadolibre.com/devsite/authentication-and-authorization-global-selling), the next step is to learn how to work with users (sellers and buyers). There are 2 types of users in Global Selling:

- **Global user**: is the that has the login to Global Selling and also the grants ([get access token](https://global-selling.mercadolibre.com/devsite/authentication-and-authorization-global-selling#Get-your-access-token)) to operate on marketplaces users. Per account, you can have a global user and one or more marketplaces users.
- **Marketplace user**: each marketplace user corresponds to each local operation and logistic type set: **Mexico Remote**, **Mexico Fulfillment**, **Brazil Remote**, **Chile Fulfillment**, **Chile Remote** and **Colombia Remote**. The operations for each marketplace user can be managed using the global user's access token.

As integrator you can operate over all these accounts with just one access token. The operations for each marketplace user can be managed using the global user's access token. See more the users architecture:

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/211783200576-global-users.png)

# Users &amp; Apps

This examples will help you work with users and applications registered on Global Selling.

Resource Description Example **/users/$USER\_ID** User account information. [GET](#modal1)  
[PUT](#modal1-1)

[Go back](#close) [X](#close "Close")

### Get user information.

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/users/523130418
```

### Response:

```javascript
{
    "id": 523130418,
    "nickname": "CNTESTNICOCBT",
    "registration_date": "2020-02-05T20:16:58.000-04:00",
    "first_name": "TESTNICOCBT",
    "last_name": "TESTNICOCBT",
    "gender": "",
    "country_id": "CN",
    "email": "testnicocbt@emailna.co",
    "identification": {
        "number": "12345678",
        "type": "TaxID"
    },
    "address": {
        "address": "498 NW 3rd Av",
        "city": "Chongqing",
        "state": "CHONGQING",
        "zip_code": "12345"
    },
    "phone": {
        "area_code": "131",
        "extension": "",
        "number": "23456789",
        "verified": false
    },
    "alternative_phone": {
        "area_code": "",
        "extension": "",
        "number": ""
    },
    "user_type": "normal",
    "tags": [
        "normal",
        "messages_as_seller"
    ],
    "logo": null,
    "points": 0,
    "site_id": "CBT",
    "permalink": "nullCNTESTNICOCBT",
    "seller_experience": "ADVANCED",
    "bill_data": {
        "accept_credit_note": null
    },
    "seller_reputation": {
        "level_id": null,
        "power_seller_status": null,
        "transactions": {
            "canceled": 0,
            "completed": 0,
            "period": "historic",
            "ratings": {
                "negative": 0,
                "neutral": 0,
                "positive": 0
            },
            "total": 0
        },
        "metrics": {
            "sales": {
                "period": "60 months",
                "completed": 0
            },
            "claims": {
                "period": "60 months",
                "rate": 0,
                "value": 0
            },
            "delayed_handling_time": {
                "period": "60 months",
                "rate": 0,
                "value": 0
            },
            "cancellations": {
                "period": "60 months",
                "rate": 0,
                "value": 0
            }
        }
    },
    "buyer_reputation": {
        "canceled_transactions": 0,
        "tags": [],
        "transactions": {
            "canceled": {
                "paid": null,
                "total": null
            },
            "completed": null,
            "not_yet_rated": {
                "paid": null,
                "total": null,
                "units": null
            },
            "period": "historic",
            "total": null,
            "unrated": {
                "paid": null,
                "total": null
            }
        }
    },
    "status": {
        "billing": {
            "allow": true,
            "codes": []
        },
        "buy": {
            "allow": true,
            "codes": [],
            "immediate_payment": {
                "reasons": [],
                "required": false
            }
        },
        "confirmed_email": false,
        "shopping_cart": {
            "buy": null,
            "sell": null
        },
        "immediate_payment": false,
        "list": {
            "allow": true,
            "codes": [],
            "immediate_payment": {
                "reasons": [],
                "required": false
            }
        },
        "mercadoenvios": "not_accepted",
        "mercadopago_account_type": null,
        "mercadopago_tc_accepted": false,
        "required_action": null,
        "sell": {
            "allow": true,
            "codes": [],
            "immediate_payment": {
                "reasons": [],
                "required": false
            }
        },
        "site_status": "active",
        "user_type": null
    },
    "secure_email": "ttestni.wq2n28@mail.mercadolibre.com",
    "company": {
        "brand_name": "TESTNICOCBT",
        "city_tax_id": null,
        "corporate_name": "TESTNICOCBT",
        "identification": "12345678",
        "state_tax_id": null,
        "soft_descriptor": null
    },
    "credit": {
        "consumed": 0,
        "credit_level_id": "CBT5",
        "rank": "newbie"
    },
    "pwd_generation_status": "none",
    "context": {
        "device": "desktop",
        "flow": "cbt-merchant",
        "source": "mercadolibre"
    }
}
```

[Learn more](https://global-selling.mercadolibre.com/devsite/manage-users-global-selling).

[Go back](#close) [X](#close "Close")

### Update user information.

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' \
     -X PUT \
     -H "Content-Type: application/json" \
     -d '{
    "identification_type": "TaxID",
    "identification_number": "1234567890",
    "address": "498 NW 3rd Av",
    "city": "Chongqing",
    "state": "CN-CQ",
    "zip_code": "12345",
    "phone": {
        "area_code": "131",
        "number": "234562789",
        "extension": ""
    },
    "first_name": "John",
    "last_name": "Paul",
    "company": {
        "corporate_name": "Acme",
        "brand_name": "Acme Company"
    }
}' \
https://api.mercadolibre.com/users/123456789
```

[Learn more](https://global-selling.mercadolibre.com/devsite/manage-users-global-selling).

**/users/me** Returns account information about the authenticated user. [GET](#modal2)

[Go back](#close) [X](#close "Close")

### Get information about the authenticated in user:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET http://api.mercadolibre.com/users/me
```

### Response:

```javascript
{
    "id": 523130418,
    "nickname": "CNTESTNICOCBT",
    "registration_date": "2020-02-05T20:16:58.000-04:00",
    "first_name": "Pedro",
    "last_name": "Picapiedras",
    "gender": "M",
    "country_id": "CN",
    "email": "testnicocbt@emailna.co",
    "identification": {
        "number": "1234567890",
        "type": "TaxID"
    },
    "internal_tags": [
        "developer",
        "cbt_merchant",
        "global_seller"
    ],
    "address": {
        "address": "498 NW 3rd Av",
        "city": "Chongqing",
        "state": "CHONGQING",
        "zip_code": "12345"
    },
    "phone": {
        "area_code": "131",
        "extension": "",
        "number": "234562789",
        "verified": false
    },
    "alternative_phone": {
        "area_code": "",
        "extension": "",
        "number": ""
    },
    "user_type": "normal",
    "tags": [
        "normal",
        "messages_as_seller"
    ],
    "logo": null,
    "points": 0,
    "site_id": "CBT",
    "permalink": "nullCNTESTNICOCBT",
    "shipping_modes": [
        "custom",
        "not_specified"
    ],
    "seller_experience": "ADVANCED",
    "bill_data": {
        "accept_credit_note": null
    },
    "seller_reputation": {
        "level_id": null,
        "power_seller_status": null,
        "transactions": {
            "canceled": 0,
            "completed": 0,
            "period": "historic",
            "ratings": {
                "negative": 0,
                "neutral": 0,
                "positive": 0
            },
            "total": 0
        },
        "metrics": {
            "sales": {
                "period": "60 months",
                "completed": 0
            },
            "claims": {
                "period": "60 months",
                "rate": 0,
                "value": 0
            },
            "delayed_handling_time": {
                "period": "60 months",
                "rate": 0,
                "value": 0
            },
            "cancellations": {
                "period": "60 months",
                "rate": 0,
                "value": 0
            }
        }
    },
    "buyer_reputation": {
        "canceled_transactions": 0,
        "tags": [],
        "transactions": {
            "canceled": {
                "paid": null,
                "total": null
            },
            "completed": null,
            "not_yet_rated": {
                "paid": null,
                "total": null,
                "units": null
            },
            "period": "historic",
            "total": null,
            "unrated": {
                "paid": null,
                "total": null
            }
        }
    },
    "status": {
        "billing": {
            "allow": true,
            "codes": []
        },
        "buy": {
            "allow": true,
            "codes": [],
            "immediate_payment": {
                "reasons": [],
                "required": false
            }
        },
        "confirmed_email": false,
        "shopping_cart": {
            "buy": null,
            "sell": null
        },
        "immediate_payment": false,
        "list": {
            "allow": true,
            "codes": [],
            "immediate_payment": {
                "reasons": [],
                "required": false
            }
        },
        "mercadoenvios": "not_accepted",
        "mercadopago_account_type": null,
        "mercadopago_tc_accepted": false,
        "required_action": null,
        "sell": {
            "allow": true,
            "codes": [],
            "immediate_payment": {
                "reasons": [],
                "required": false
            }
        },
        "site_status": "active",
        "user_type": null
    },
    "secure_email": "ttestni.wq2n28@mail.mercadolibre.com",
    "company": {
        "brand_name": "Acme Company",
        "city_tax_id": null,
        "corporate_name": "Acme",
        "identification": "12345678",
        "state_tax_id": null,
        "soft_descriptor": null
    },
    "credit": {
        "consumed": 0,
        "credit_level_id": "CBT5",
        "rank": "newbie"
    },
    "pwd_generation_status": "none",
    "context": {
        "device": "desktop",
        "flow": "cbt-merchant",
        "source": "mercadolibre"
    }
}
```

[Learn more](https://global-selling.mercadolibre.com/devsite/manage-users-global-selling).

**/users/$USER\_ID/addresses** Returns addresses registered by the user. [GET](#modal3)

[Go back](#close) [X](#close "Close")

### Get user addresses.

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET https://api.mercadolibre.com/users/523130418/addresses
```

### Response

```javascript
[
    {
        "id": 1086581840,
        "user_id": 523130418,
        "contact": null,
        "phone": null,
        "address_line": "498 NW 3rd Av",
        "floor": null,
        "apartment": null,
        "street_number": null,
        "street_name": null,
        "zip_code": "12345",
        "city": {
            "id": "Q04tQ1FDaG9uZ3Fpbmc",
            "name": "Chongqing"
        },
        "state": {
            "id": "CN-CQ",
            "name": "Chongqing"
        },
        "country": {
            "id": "CN",
            "name": "China"
        },
        "neighborhood": {
            "id": null,
            "name": null
        },
        "municipality": {
            "id": null,
            "name": null
        },
        "search_location": {
            "state": {
                "id": null,
                "name": null
            },
            "city": {
                "id": null,
                "name": null
            },
            "neighborhood": {
                "id": null,
                "name": null
            }
        },
        "types": [
            "billing",
            "default_selling_address",
            "shipping"
        ],
        "comment": null,
        "between": null,
        "references": null,
        "aditional_info": null,
        "geolocation_type": null,
        "geolocation_last_updated": null,
        "geolocation_source": null,
        "latitude": null,
        "longitude": null,
        "status": "active",
        "date_created": "2020-02-05T20:20:13.000-04:00",
        "normalized": true,
        "open_hours": null
    }
]
```

[Learn more](https://global-selling.mercadolibre.com/devsite/addresses).

**/users/$USER\_ID/accepted\_payment\_methods** Returns payment methods accepted by a seller to collect its operations. [GET](#modal4)

[Go back](#close) [X](#close "Close")

### Get accepted payment methods by user.

```javascript
curl -X GET https://api.mercadolibre.com/users/523132944/accepted_payment_methods
```

### Response

```javascript
[
    {
        "id": "visa",
        "name": "Visa",
        "payment_type_id": "credit_card",
        "thumbnail": "http://img.mlstatic.com/org-img/MP3/API/logos/visa.gif",
        "secure_thumbnail": "https://www.mercadopago.com/org-img/MP3/API/logos/visa.gif"
    },
    {
        "id": "master",
        "name": "Mastercard",
        "payment_type_id": "credit_card",
        "thumbnail": "http://img.mlstatic.com/org-img/MP3/API/logos/master.gif",
        "secure_thumbnail": "https://www.mercadopago.com/org-img/MP3/API/logos/master.gif"
    }
]
```

[Learn more](https://global-selling.mercadolibre.com/devsite/manage-users-global-selling).

**/applications/$APP\_ID** Returns information about the application. [GET](#modal5)

[Go back](#close) [X](#close "Close")

### Get application details.

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET http://api.mercadolibre.com/applications/6098792155457031
```

### Response

```javascript
{
    "id": 6098792155457031,
    "site_id": "CBT",
    "name": "Test application to Global Selling operation",
    "description": "Test application ",
    "thumbnail": null,
    "catalog_product_id": null,
    "item_id": null,
    "price": null,
    "currency_id": null,
    "short_name": "TestAppGsInt",
    "url": "http://globalselling.mercadolibre.com/devcenter/testappgsint",
    "callback_url": "https://test.com",
    "sandbox_mode": true,
    "project_id": null,
    "active": true,
    "max_requests_per_hour": 18000,
    "scopes": [
        "offline_access",
        "read",
        "write"
    ],
    "domains": [],
    "certification_status": "not_certified"
}
```

[Learn more](https://global-selling.mercadolibre.com/devsite/application-manager).

**/users/$USER\_ID/brands** This resource retrieves brands associated to an user\_id. The official\_store\_id attribute identifies a store. [GET](#modal6)

[Go back](#close) [X](#close "Close")

### Get brands by user.

```javascript
curl -X GET https://api.mercadolibre.com/users/470225786/brands
```

### Response

```javascript
{
    "cust_id": 470225786,
    "site_id": "MLM",
    "user_type": "brand",
    "tags": [
        "brand",
        "large_seller"
    ],
    "brands": [
        {
            "official_store_id": 2572,
            "site_id": "MLM",
            "name": "Hyiear",
            "fantasy_name": "Hyiear",
            "type": "normal",
            "status": "active",
            "permalink": "https://tienda.mercadolibre.com.mx/hyiear"
        }
    ]
}
```

[Learn more](https://global-selling.mercadolibre.com/devsite/official-stores-global-selling).

**/users/$USER\_ID/applications/$APP\_ID** Application permissions. [DELETE](#modal12)

[Go back](#close) [X](#close "Close")

### Revoke permissions to an application.

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' \
     -X DELETE \
     https://api.mercadolibre.com/users/$CUST_ID/applications/$APP_ID
```

[Learn more](https://global-selling.mercadolibre.com/devsite/application-manager).

**/missed\_feeds?app\_id=$APP\_ID** Notifications history. [GET](#modal13)

[Go back](#close) [X](#close "Close")

### Get historic of notifications by app

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' \
     -X GET \
     https://api.mercadolibre.com/missed_feeds?app_id=$APP_ID
```

[Learn more](https://global-selling.mercadolibre.com/devsite/application-manager).

**/marketplace/users/$USER\_ID** User mapping with its corresponding marketplace user detail. [GET](#modal14)

[Go back](#close) [X](#close "Close")

### Get the mapping of a user and its corresponding marketplace:

```javascript
curl -H 'Authorization: Bearer $ACCESS_TOKEN' -X GET http://api.mercadolibre.com/marketplace/users/471826944
```

### Response

```javascript
{
    "user_id": 471826944,
    "site_id": "CBT",
    "marketplaces": [
        {
            "user_id": 471828584,
            "site_id": "MLM",
            "logistic_type": "remote"
        },
        {
            "user_id": 471830260,
            "site_id": "MLB",
            "logistic_type": "remote"
        },
        {
            "user_id": 538932857,
            "site_id": "MLC",
            "logistic_type": "remote"
        }
    ]
}
```

[Learn more](https://global-selling.mercadolibre.com/devsite/manage-users-global-selling).

## Get personal information

If you are logged in Mercado Libre and have a token, you will be able to make the request below and learn about your user-related information:

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/me
```

Response:

```javascript
{
    "id": 701124911,
    "nickname": "MLMCBT",
    "registration_date": "2021-01-13T13:35:17.000-04:00",
    "first_name": "Test",
    "last_name": "Test",
    "gender": "",
    "country_id": "US",
    "email": "maca1122334455@test.com",
    "identification": {
        "number": "ABC123",
        "type": "TaxID"
    },
    "address": {
        "address": "498 NW 3rd Av",
        "city": "Akiachak",
        "state": "US-AK",
        "zip_code": "2233333"
    },
    "phone": {
        "area_code": "01",
        "extension": "",
        "number": "1111-1111",
        "verified": false
    },
    "alternative_phone": {
        "area_code": "",
        "extension": "",
        "number": ""
    },
    "user_type": "normal",
    "tags": [
        "normal",
        "test_user",
        "messages_as_seller"
    ],
    "logo": null,
    "points": 100,
    "site_id": "CBT",
    "permalink": "nullMLMCBT",
    "seller_experience": "ADVANCED",
    "bill_data": {
        "accept_credit_note": null
    },
    "seller_reputation": {
        "level_id": null,
        "power_seller_status": null,
        "transactions": {
            "canceled": 0,
            "completed": 0,
            "period": "historic",
            "ratings": {
                "negative": 0,
                "neutral": 0,
                "positive": 0
            },
            "total": 0
        },
        "metrics": {
            "sales": {
                "period": "60 months",
                "completed": 0
            },
            "claims": {
                "period": "60 months",
                "rate": 0,
                "value": 0
            },
            "delayed_handling_time": {
                "period": "60 months",
                "rate": 0,
                "value": 0
            },
            "cancellations": {
                "period": "60 months",
                "rate": 0,
                "value": 0
            }
        }
    },
    "buyer_reputation": {
        "canceled_transactions": 0,
        "tags": [],
        "transactions": {
            "canceled": {
                "paid": null,
                "total": null
            },
            "completed": null,
            "not_yet_rated": {
                "paid": null,
                "total": null,
                "units": null
            },
            "period": "historic",
            "total": null,
            "unrated": {
                "paid": null,
                "total": null
            }
        }
    },
    "status": {
        "billing": {
            "allow": true,
            "codes": []
        },
        "buy": {
            "allow": true,
            "codes": [],
            "immediate_payment": {
                "reasons": [],
                "required": false
            }
        },
        "confirmed_email": true,
        "shopping_cart": {
            "buy": null,
            "sell": null
        },
        "immediate_payment": false,
        "list": {
            "allow": true,
            "codes": [],
            "immediate_payment": {
                "reasons": [],
                "required": false
            }
        },
        "mercadoenvios": "not_accepted",
        "mercadopago_account_type": "personal",
        "mercadopago_tc_accepted": true,
        "required_action": null,
        "sell": {
            "allow": true,
            "codes": [],
            "immediate_payment": {
                "reasons": [],
                "required": false
            }
        },
        "site_status": "active",
        "user_type": null
    },
    "secure_email": "ttest.h6rdpb@mail.mercadolibre.com",
    "company": {
        "brand_name": "TESTACMECOMPANY",
        "city_tax_id": "",
        "corporate_name": "TESTACMECOMPANY",
        "identification": "12345678",
        "state_tax_id": "",
        "cust_type_id": "BU",
        "soft_descriptor": null
    },
    "credit": {
        "consumed": 0,
        "credit_level_id": "CBT5",
        "rank": "newbie"
    },
    "pwd_generation_status": "none",
    "context": {
        "ip_address": "200.0.0.0"
    },
    "registration_identifiers": []
}
```

### Response fields

Field Type Description id Integer The user's unique identifier. nickname String The user's nickname displayed on the platform. registration\_date String Date and time when the user registered (ISO 8601 format). first\_name String The user's first name. last\_name String The user's last name. country\_id String The user's country code (ISO 3166-1 alpha-2). email String The user's email address. identification Object User's identification document information (number, type). address Object The user's address information (address, city, state, zip\_code). phone Object The user's primary phone information (area\_code, number, verified). site\_id String The site identifier (CBT for Cross-Border Trade). seller\_experience String The seller's experience level (e.g., "ADVANCED", "INTERMEDIATE", "NEWBIE"). seller\_reputation Object The seller's reputation metrics and transaction history. buyer\_reputation Object The buyer's reputation and transaction history. status Object User's account status and permissions (billing, buy, sell, list, site\_status). secure\_email String Anonymized email for secure communications. company Object Company information for business accounts (brand\_name, corporate\_name, identification, cust\_type\_id). credit Object User's credit information (consumed, credit\_level\_id, rank). pwd\_generation\_status String Password generation status (e.g., "none", "generated"). context Object Contextual information about the request (ip\_address, device, flow, source). registration\_identifiers Array Additional registration identifiers.

## Get public global user information

Now, as you already know the user ID, you can make a request to the users' resource as shown below in order to get the public information of the user you want:

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/$USER_ID
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/202593498
```

Response:

```javascript
{
    "id": 202593498,
    "nickname": "TETE2870021",
    "registration_date": "2016-01-06T11:31:42.000-04:00",
    "country_id": "AR",
    "address": {
        "state": "AR-C",
        "city": "Palermo"
    },
    "user_type": "normal",
    "tags": [
        "normal",
        "test_user",
        "user_info_verified"
    ],
    "logo": null,
    "points": 100,
    "site_id": "MLA",
    "permalink": "http://perfil.mercadolibre.com.ar/TETE2870021",
    "seller_reputation": {
        "level_id": null,
        "power_seller_status": null,
        "transactions": {
            "period": "historic",
            "total": 0,
            "completed": 0,
            "canceled": 0,
            "ratings": {
                "positive": 0,
                "negative": 0,
                "neutral": 0
            }
        }
    },
    "buyer_reputation": {
        "tags": []
    },
    "status": {
        "site_status": "active"
    }
}
```

### Public vs private fields

When querying another user's information, you receive **public data only**. When querying your own user (with valid access token), you receive **private data** including additional fields:

Public fields Private fields (own user only) id, nickname email registration\_date first\_name, last\_name country\_id identification address (city, state only) phone, alternative\_phone user\_type, tags address (full details) logo, points secure\_email site\_id, permalink company (full details) seller\_reputation credit, bill\_data buyer\_reputation context, pwd\_generation\_status status.site\_status status (full details)

## Get private global user information

Now, as you already know the user ID, you can make a request to the users' resource as shown below in order to get the private information of the user you want:

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/$USER_ID
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/526124693
```

Response:

```javascript
{
    "id": 526124693,
    "nickname": "CNMOLMEDOTESTCBT",
    "registration_date": "2020-02-12T09:43:00.000-04:00",
    "first_name": "molmedotestcbt",
    "last_name": "MolmedoTestCBTOP",
    "gender": "",
    "country_id": "CN",
    "email": "6bdb83c0d0@emailtown.club",
    "identification": {
        "number": "12345678",
        "type": "TaxID"
    },
    "address": {
        "address": "false street 1212",
        "city": "Chongqing",
        "state": "CHONGQING",
        "zip_code": "22344"
    },
    "phone": {
        "area_code": null,
        "extension": "",
        "number": "5032423424242",
        "verified": false
    },
    "alternative_phone": {
        "area_code": "",
        "extension": "",
        "number": ""
    },
    "user_type": "normal",
    "tags": [
        "normal",
        "messages_as_seller"
    ],
    "logo": null,
    "points": 0,
    "site_id": "CBT",
    "permalink": "nullCNMOLMEDOTESTCBT",
    "shipping_modes": [
        "custom",
        "not_specified"
    ],
    "seller_experience": "ADVANCED",
    "bill_data": {
        "accept_credit_note": null
    },
    "seller_reputation": {
        "level_id": null,
        "power_seller_status": null,
        "transactions": {
            "canceled": 0,
            "completed": 0,
            "period": "historic",
            "ratings": {
                "negative": 0,
                "neutral": 0,
                "positive": 0
            },
            "total": 0
        },
        "metrics": {
            "sales": {
                "period": "60 months",
                "completed": 0
            },
            "claims": {
                "period": "60 months",
                "rate": 0,
                "value": 0
            },
            "delayed_handling_time": {
                "period": "60 months",
                "rate": 0,
                "value": 0
            },
            "cancellations": {
                "period": "60 months",
                "rate": 0,
                "value": 0
            }
        }
    },
    "buyer_reputation": {
        "canceled_transactions": 0,
        "tags": [],
        "transactions": {
            "canceled": {
                "paid": null,
                "total": null
            },
            "completed": null,
            "not_yet_rated": {
                "paid": null,
                "total": null,
                "units": null
            },
            "period": "historic",
            "total": null,
            "unrated": {
                "paid": null,
                "total": null
            }
        }
    },
    "status": {
        "billing": {
            "allow": true,
            "codes": []
        },
        "buy": {
            "allow": true,
            "codes": [],
            "immediate_payment": {
                "reasons": [],
                "required": false
            }
        },
        "confirmed_email": false,
        "shopping_cart": {
            "buy": null,
            "sell": null
        },
        "immediate_payment": false,
        "list": {
            "allow": true,
            "codes": [],
            "immediate_payment": {
                "reasons": [],
                "required": false
            }
        },
        "mercadoenvios": "not_accepted",
        "mercadopago_account_type": null,
        "mercadopago_tc_accepted": false,
        "required_action": null,
        "sell": {
            "allow": true,
            "codes": [],
            "immediate_payment": {
                "reasons": [],
                "required": false
            }
        },
        "site_status": "active",
        "user_type": null
    },
    "secure_email": "mmolmed.hgxgj0@mail.com",
    "company": {
        "brand_name": "molmedotestcbt",
        "city_tax_id": "",
        "corporate_name": "MolmedoTestCBTOP",
        "identification": "12345678",
        "state_tax_id": "",
        "cust_type_id": "BU",
        "soft_descriptor": null
    },
    "credit": {
        "consumed": 0,
        "credit_level_id": "CBT5",
        "rank": "newbie"
    },
    "pwd_generation_status": "none",
    "context": {
        "device": "desktop",
        "flow": "cbt-merchant",
        "source": "mercadolibre"
    }
}
```

As you can see, this time you got more information about the user: full name, e-mail, telephone, address, etc. Please do not disclose this data since it may jeopardize the user.

## Update global user information

To update your user information, follow the next request:

Request:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' \
     -H "Content-Type: application/json" \
     -d '{BODY}' \
     https://api.mercadolibre.com/users/$USER_ID
```

Example:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' \
     -H "Content-Type: application/json" \
     -d '{
    "first_name": "Mister X"
}' \
https://api.mercadolibre.com/users/526124693
```

Response:

```javascript
{
    "user_id": 526124693
}
```

Remember to only send the fields you want to update.

### Updatable fields

The following fields can be updated via PUT request:

Field Type Description first\_name String The user's first name. last\_name String The user's last name. identification\_type String The type of identification document (e.g., "TaxID"). identification\_number String The identification document number. address String Street address. city String City name. state String State or region code. zip\_code String Postal/ZIP code. phone Object Phone information (area\_code, number, extension). company Object Company information (corporate\_name, brand\_name).

#### Example: Update phone number

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' \
     -H "Content-Type: application/json" \
     -d '{
    "phone": {
        "area_code": "55",
        "number": "999999999",
        "extension": ""
    }
}' \
https://api.mercadolibre.com/users/$USER_ID
```

#### Example: Update company information

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' \
     -H "Content-Type: application/json" \
     -d '{
    "company": {
        "corporate_name": "Acme Corporation",
        "brand_name": "Acme"
    }
}' \
https://api.mercadolibre.com/users/$USER_ID
```

## Marketplace user mapping

Returns the mapping between a global user and their marketplace-specific users. This is essential for understanding the relationship between the CBT global account and local marketplace operations.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/$USER_ID
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/users/471826944
```

Response:

```javascript
{
    "user_id": 471826944,
    "site_id": "CBT",
    "marketplaces": [
        {
            "user_id": 471828584,
            "site_id": "MLM",
            "logistic_type": "remote"
        },
        {
            "user_id": 471830260,
            "site_id": "MLB",
            "logistic_type": "remote"
        },
        {
            "user_id": 538932857,
            "site_id": "MLC",
            "logistic_type": "remote"
        }
    ]
}
```

### Response fields

Field Type Description user\_id Integer The global user's unique identifier. site\_id String The site identifier (CBT for Cross-Border Trade global user). marketplaces Array List of marketplace user mappings. marketplaces\[].user\_id Integer The marketplace-specific user ID. marketplaces\[].site\_id String The marketplace site identifier (e.g., MLM, MLB, MLC, MCO). marketplaces\[].logistic\_type String The logistic type for this marketplace operation: fulfillment or remote.

### Available marketplaces

Site ID Country Available logistic types MLM Mexico Remote, Fulfillment MLB Brazil Remote MLC Chile Remote, Fulfillment MCO Colombia Remote

**Next**: [Test users](https://global-selling.mercadolibre.com/devsite/start-testing-global-selling).