# Shipping

**Tags:** Shipping
**Created:** 2020-05-08T14:54:58Z
**Last Updated:** 2025-12-15T10:32:40Z

---

# Shipping

This examples will guide you through shipping resources.

Resource Description Example **/marketplace/shipments/$SHIPMENT\_ID** Retrieves all delivery data. [GET](#modal1)

[Go back.](#close) [X](#close "Close")

### Retrieves all delivery data.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' http://api.mercadolibre.com/marketplace/shipments/28254144429
```

 

### Response

```javascript
{
    "id": 28254144429,
    "order_id": 2328110827,
    "site_id": "MLM",
    "status": "delivered",
    "substatus": "",
    "date_created": "2020-02-17T09:45:37.000-04:00",
    "last_updated": "2020-04-09T08:00:27.000-04:00",
    "tracking_number": "String",
    "tracking_method": "CBT CustomShipping",
    "sender_id": 523132944,
    "receiver_id": 441782523,
    "receiver_address": {
        "id": 1061239068,
        "address_line": "AV LAS ROSAS 1235",
        "street_name": "AV LAS ROSAS",
        "street_number": "1235",
        "comment": "Referencia: PUERTA ROJA, VENTANA VERDE, TIMBRE 3",
        "zip_code": "45200",
        "city": {
            "id": "TUxNQ1pBUDM4NzE",
            "name": "Zapopan"
        },
        "state": {
            "id": "MX-JAL",
            "name": "Jalisco"
        },
        "country": {
            "id": "MX",
            "name": "Mexico"
        },
        "neighborhood": {
            "id": null,
            "name": "Colonia Altamira"
        },
        "municipality": {
            "id": null,
            "name": null
        },
        "agency": null,
        "types": null,
        "latitude": 20.665695,
        "longitude": -103.402469,
        "geolocation_type": "RANGE_INTERPOLATED",
        "geolocation_last_updated": "2020-02-06T15:17:24Z",
        "geolocation_source": "google-maps",
        "receiver_name": "Pedro Funes",
        "receiver_phone": "123123123123"
    },
    "shipping_items": [
        {
            "id": "MLM755638064",
            "description": "Elemento De Prueba - Para Pruebas De Carga",
            "quantity": 1,
            "dimensions": "10.0x10.0x10.0,318.0"
        }
    ],
    "date_first_printed": "",
    "logistic_type": "default"
}
```

[Learn more.](https://global-selling.mercadolibre.com/devsite/manage-shipments)

**/sites/$SITE\_ID/shipping\_methods** Retrieves shipping modes available in a country. [GET](#modal2)

[Go back](#close) [X](#close "Close")

### Retrieves shipping modes available in a country.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' http://api.mercadolibre.com/sites/MLM/shipping_methods
```

 

### Response

```javascript
[
    {
        "id": 509245,
        "name": "Next Day Agency",
        "type": "next_day",
        "deliver_to": "agency",
        "status": "active",
        "site_id": "MLM",
        "free_options": [],
        "shipping_modes": [
            "me2"
        ],
        "company_id": null,
        "company_name": null,
        "min_time": 24,
        "max_time": 24,
        "currency_id": "MXN"
    },
    {
        "id": 509247,
        "name": "Three Days",
        "type": "three_days",
        "deliver_to": "address",
        "status": "active",
        "site_id": "MLM",
        "free_options": [],
        "shipping_modes": [
            "me2"
        ],
        "company_id": null,
        "company_name": null,
        "min_time": 72,
        "max_time": 72,
        "currency_id": "MXN"
    },
    {
        "id": 502245,
        "name": "Envío internacional",
        "type": "standard",
        "deliver_to": "address",
        "status": "active",
        "site_id": "MLM",
        "free_options": [],
        "shipping_modes": [
            "me1"
        ],
        "company_id": 17501140,
        "company_name": "CBT México",
        "min_time": null,
        "max_time": null,
        "currency_id": "MXN"
    },
    {
        "id": 504745,
        "name": "Estándar a sucursal de correo",
        "type": "standard",
        "deliver_to": "agency",
        "status": "active",
        "site_id": "MLM",
        "free_options": [
            "no"
        ],
        "shipping_modes": [
            "me2"
        ],
        "company_id": 17502340,
        "company_name": "Mercado Envios",
        "min_time": null,
        "max_time": null,
        "currency_id": "MXN"
    },
    {
        "id": 507845,
        "name": "Prioritario a sucursal de correo",
        "type": "same_day",
        "deliver_to": "agency",
        "status": "active",
        "site_id": "MLM",
        "free_options": [],
        "shipping_modes": [
            "me2"
        ],
        "company_id": null,
        "company_name": null,
        "min_time": 0,
        "max_time": 24,
        "currency_id": "MXN"
    },
    {
        "id": 509246,
        "name": "Two Days Agency",
        "type": "two_days",
        "deliver_to": "agency",
        "status": "active",
        "site_id": "MLM",
        "free_options": [],
        "shipping_modes": [
            "me2"
        ],
        "company_id": null,
        "company_name": null,
        "min_time": 48,
        "max_time": 48,
        "currency_id": "MXN"
    },
    {
        "id": 504045,
        "name": "Prioritario a domicilio",
        "type": "same_day",
        "deliver_to": "address",
        "status": "active",
        "site_id": "MLM",
        "free_options": [
            "country"
        ],
        "shipping_modes": [
            "me2"
        ],
        "company_id": 17501740,
        "company_name": "99minutos",
        "min_time": null,
        "max_time": null,
        "currency_id": "MXN"
    },
    {
        "id": 501345,
        "name": "Express a domicilio",
        "type": "express",
        "deliver_to": "address",
        "status": "active",
        "site_id": "MLM",
        "free_options": [
            "country"
        ],
        "shipping_modes": [
            "me2"
        ],
        "company_id": 17500540,
        "company_name": "DHL",
        "min_time": 0,
        "max_time": 72,
        "currency_id": "MXN"
    },
    {
        "id": 501645,
        "name": "Envío internacional",
        "type": "standard",
        "deliver_to": "address",
        "status": "active",
        "site_id": "MLM",
        "free_options": [
            "country"
        ],
        "shipping_modes": [
            "me1"
        ],
        "company_id": 17501140,
        "company_name": "CBT México",
        "min_time": null,
        "max_time": null,
        "currency_id": "MXN"
    },
    {
        "id": 504645,
        "name": "Express a sucursal de correo",
        "type": "express",
        "deliver_to": "agency",
        "status": "active",
        "site_id": "MLM",
        "free_options": [
            "no"
        ],
        "shipping_modes": [
            "me2"
        ],
        "company_id": 17502340,
        "company_name": "Mercado Envios",
        "min_time": null,
        "max_time": null,
        "currency_id": "MXN"
    },
    {
        "id": 507745,
        "name": "Prioritario a sucursal de correo",
        "type": "same_day",
        "deliver_to": "agency",
        "status": "active",
        "site_id": "MLM",
        "free_options": [],
        "shipping_modes": [
            "me2"
        ],
        "company_id": 17501740,
        "company_name": "99minutos",
        "min_time": null,
        "max_time": null,
        "currency_id": "MXN"
    },
    {
        "id": 509445,
        "name": "Three Days Agency",
        "type": "three_days",
        "deliver_to": "agency",
        "status": "active",
        "site_id": "MLM",
        "free_options": [],
        "shipping_modes": [
            "me2"
        ],
        "company_id": null,
        "company_name": null,
        "min_time": 72,
        "max_time": 72,
        "currency_id": "MXN"
    },
    {
        "id": 509450,
        "name": "Normal",
        "type": "standard",
        "deliver_to": "address",
        "status": "active",
        "site_id": "MLM",
        "free_options": [],
        "shipping_modes": [
            "me2"
        ],
        "company_id": null,
        "company_name": null,
        "min_time": 96,
        "max_time": 2400,
        "currency_id": "MXN"
    },
    {
        "id": 509446,
        "name": "Four Days",
        "type": "four_days",
        "deliver_to": "address",
        "status": "active",
        "site_id": "MLM",
        "free_options": [],
        "shipping_modes": [
            "me2"
        ],
        "company_id": null,
        "company_name": null,
        "min_time": 96,
        "max_time": 96,
        "currency_id": "MXN"
    },
    {
        "id": 509449,
        "name": "Express Agency",
        "type": "express",
        "deliver_to": "agency",
        "status": "active",
        "site_id": "MLM",
        "free_options": [],
        "shipping_modes": [
            "me2"
        ],
        "company_id": null,
        "company_name": null,
        "min_time": 48,
        "max_time": 72,
        "currency_id": "MXN"
    },
    {
        "id": 509145,
        "name": "Next Day",
        "type": "next_day",
        "deliver_to": "address",
        "status": "active",
        "site_id": "MLM",
        "free_options": [],
        "shipping_modes": [
            "me2"
        ],
        "company_id": null,
        "company_name": null,
        "min_time": 24,
        "max_time": 24,
        "currency_id": "MXN"
    },
    {
        "id": 509448,
        "name": "Express",
        "type": "express",
        "deliver_to": "address",
        "status": "active",
        "site_id": "MLM",
        "free_options": [],
        "shipping_modes": [
            "me2"
        ],
        "company_id": null,
        "company_name": null,
        "min_time": 48,
        "max_time": 72,
        "currency_id": "MXN"
    },
    {
        "id": 509545,
        "name": "Normal Agency",
        "type": "standard",
        "deliver_to": "agency",
        "status": "active",
        "site_id": "MLM",
        "free_options": [],
        "shipping_modes": [
            "me2"
        ],
        "company_id": null,
        "company_name": null,
        "min_time": 96,
        "max_time": 2400,
        "currency_id": "MXN"
    },
    {
        "id": 509447,
        "name": "Four Days Agency",
        "type": "four_days",
        "deliver_to": "agency",
        "status": "active",
        "site_id": "MLM",
        "free_options": [],
        "shipping_modes": [
            "me2"
        ],
        "company_id": null,
        "company_name": null,
        "min_time": 96,
        "max_time": 96,
        "currency_id": "MXN"
    },
    {
        "id": 501845,
        "name": "Estándar",
        "type": "standard",
        "deliver_to": "address",
        "status": "active",
        "site_id": "MLM",
        "free_options": [
            "country"
        ],
        "shipping_modes": [
            "me1"
        ],
        "company_id": null,
        "company_name": null,
        "min_time": null,
        "max_time": null,
        "currency_id": "MXN"
    },
    {
        "id": 501846,
        "name": "Express",
        "type": "express",
        "deliver_to": "address",
        "status": "active",
        "site_id": "MLM",
        "free_options": [
            "country"
        ],
        "shipping_modes": [
            "me1"
        ],
        "company_id": null,
        "company_name": null,
        "min_time": null,
        "max_time": null,
        "currency_id": "MXN"
    },
    {
        "id": 501245,
        "name": "Estándar a domicilio",
        "type": "standard",
        "deliver_to": "address",
        "status": "active",
        "site_id": "MLM",
        "free_options": [
            "country"
        ],
        "shipping_modes": [
            "me2"
        ],
        "company_id": 17500540,
        "company_name": "DHL",
        "min_time": 72,
        "max_time": null,
        "currency_id": "MXN"
    },
    {
        "id": 509345,
        "name": "Two Days",
        "type": "two_days",
        "deliver_to": "address",
        "status": "active",
        "site_id": "MLM",
        "free_options": [],
        "shipping_modes": [
            "me2"
        ],
        "company_id": null,
        "company_name": null,
        "min_time": 48,
        "max_time": 48,
        "currency_id": "MXN"
    }
]
```

[Learn more.](https://global-selling.mercadolibre.com/devsite/manage-shipments)

**/sites/$SITE\_ID/shipping\_options?zip\_code\_from=$ZIP\_CODE&amp;zip\_code\_to=$ZIP\_CODE&amp;dimensions=$DIMENSIONS** Retrieves the cost of a shipping. Shipping cost calculator per country. [GET](#modal3)

[Go back](#close) [X](#close "Close")

### Retrieves the cost of a shipping. Shipping cost calculator per country.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' http://api.mercadolibre.com/sites/MLM/shipping_options?zip_code_from=04500&zip_code_to=05000&dimensions=10x10x20,500
```

 

### Response

```javascript
{
    "destination": {
        "zip_code": "05000",
        "city": {
            "id": "TUxNQ0NVQTgxNTY",
            "name": "Cuajimalpa De Morelos"
        },
        "state": {
            "id": "MX-DIF",
            "name": "Distrito Federal"
        },
        "country": {
            "id": "MX",
            "name": "Mexico"
        },
        "extended_attributes": {
            "status": "active"
        }
    },
    "options": [
        {
            "id": 669295533,
            "option_hash": "696c9b0168b9c8e81467104c9f8629be",
            "name": "Express a domicilio",
            "currency_id": "MXN",
            "list_cost": 94,
            "cost": 94,
            "base_cost": 94,
            "display": "optional",
            "shipping_method_id": 501345,
            "shipping_method_type": "express",
            "shipping_option_type": "address",
            "estimated_delivery_time": {
                "type": "known_frame",
                "date": "2020-05-12T00:00:00.000-05:00",
                "unit": "hour",
                "offset": {
                    "date": "2020-05-13T00:00:00.000-05:00",
                    "shipping": 24
                },
                "time_frame": {
                    "from": null,
                    "to": null
                },
                "pay_before": null,
                "shipping": 24,
                "handling": 72,
                "schedule": null
            },
            "discount": {
                "rate": 0,
                "type": "none",
                "show_loyal_benefit": false,
                "promoted_amount": 0
            },
            "tags": []
        },
        {
            "id": 677181626,
            "option_hash": "3883db0fc668ab1b5191c4f34c39a7e5",
            "name": "Estándar a domicilio",
            "currency_id": "MXN",
            "list_cost": 79,
            "cost": 79,
            "base_cost": 79,
            "display": "always",
            "shipping_method_id": 501245,
            "shipping_method_type": "standard",
            "shipping_option_type": "address",
            "estimated_delivery_time": {
                "type": "known",
                "date": "2020-05-12T00:00:00.000-05:00",
                "unit": "hour",
                "offset": {
                    "date": null,
                    "shipping": null
                },
                "time_frame": {
                    "from": null,
                    "to": null
                },
                "pay_before": null,
                "shipping": 24,
                "handling": 72,
                "schedule": null
            },
            "discount": {
                "rate": 0,
                "type": "none",
                "show_loyal_benefit": false,
                "promoted_amount": 0
            },
            "tags": []
        },
        {
            "id": 542116804,
            "option_hash": "a501cd3613f10350ec5e97dfa397eb50",
            "name": "Express a sucursal de correo",
            "currency_id": "MXN",
            "list_cost": 94,
            "cost": 94,
            "base_cost": 94,
            "display": "optional",
            "shipping_method_id": 504645,
            "shipping_method_type": "express",
            "shipping_option_type": "agency",
            "estimated_delivery_time": {
                "type": "known",
                "date": "2020-05-12T00:00:00.000-05:00",
                "unit": "hour",
                "offset": {
                    "date": null,
                    "shipping": null
                },
                "time_frame": {
                    "from": null,
                    "to": null
                },
                "pay_before": null,
                "shipping": 24,
                "handling": 72,
                "schedule": null
            },
            "discount": {
                "rate": 0,
                "type": "none",
                "show_loyal_benefit": false,
                "promoted_amount": 0
            },
            "tags": []
        },
        {
            "id": 676245365,
            "option_hash": "1af7c5b15519a118cb5c1e552103e2d7",
            "name": "Prioritario a sucursal de correo",
            "currency_id": "MXN",
            "list_cost": 72,
            "cost": 72,
            "base_cost": 72,
            "display": "recommended",
            "shipping_method_id": 507845,
            "shipping_method_type": "same_day",
            "shipping_option_type": "agency",
            "estimated_delivery_time": {
                "type": "known",
                "date": "2020-05-12T00:00:00.000-05:00",
                "unit": "hour",
                "offset": {
                    "date": null,
                    "shipping": null
                },
                "time_frame": {
                    "from": null,
                    "to": null
                },
                "pay_before": null,
                "shipping": 24,
                "handling": 72,
                "schedule": null
            },
            "discount": {
                "rate": 0,
                "type": "none",
                "show_loyal_benefit": false,
                "promoted_amount": 0
            },
            "tags": []
        }
    ],
    "buyer": {
        "id": null,
        "loyalty_level": null,
        "shipping_level": null
    },
    "custom_message": {
        "reason": "",
        "display_mode": null
    }
}
```

[Learn more.](https://global-selling.mercadolibre.com/devsite/manage-shipments)

**/users/$CUST\_ID/shipping\_preferences** Retrieves the cost of a shipping. Shipping cost calculator per country. [GET](#modal8)

[Go back](#close) [X](#close "Close")

### Retrieves all shipping modes and services available to user.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' http://api.mercadolibre.com/users/523132944/shipping_preferences
```

 

### Response

```javascript
{
    "local_pick_up": false,
    "modes": [
        "custom",
        "not_specified",
        "me1"
    ],
    "trusted_user": false,
    "custom_calculator": "CBT",
    "picking_type": null,
    "thermal_printer": null,
    "option": "in",
    "tags": [],
    "carrier_pickup": false,
    "items_combination": "disabled",
    "services": [
        182441
    ],
    "logistics": [
        {
            "mode": "me1",
            "types": [
                {
                    "type": "default",
                    "carrier_pickup": [],
                    "services": [
                        182441
                    ],
                    "default": true,
                    "status": "active"
                }
            ]
        },
        {
            "mode": "custom",
            "types": [
                {
                    "type": "custom",
                    "carrier_pickup": [],
                    "services": null,
                    "default": true,
                    "status": "active"
                }
            ]
        },
        {
            "mode": "not_specified",
            "types": [
                {
                    "type": "not_specified",
                    "carrier_pickup": [],
                    "services": null,
                    "default": true,
                    "status": "active"
                }
            ]
        }
    ],
    "content_declaration_disabled": false,
    "mandatory_invoice_data": false,
    "site_id": "MLM",
    "free_configurations": [
        {
            "condition": {
                "value": null,
                "type": "all"
            },
            "rule": {
                "default": true,
                "free_mode": "country",
                "value": null
            }
        }
    ],
    "mandatory_settings": {}
}
```

[Learn more.](https://global-selling.mercadolibre.com/devsite/manage-shipments)

**/marketplace/shipments/$SHIPMENT\_ID/labels** Allows print the ticket for send the order. [GET](#modal9)

[Go back](#close) [X](#close "Close")

### Allows print the ticket for send the order.

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' http://api.mercadolibre.com/marketplace/shipments/28242489394/labels
```

 

### Response: Return the file to download the shipping label.

[Learn more.](https://global-selling.mercadolibre.com/devsite/manage-shipments)

**/marketplace/shipments/$SHIPMENT\_ID/tracking** This endpoint allows you to report the tracking of a shipment, which must be entered by parameter. [POST](#modal10)

[Go back](#close) [X](#close "Close")

### This endpoint allows you to report the tracking of a shipment, which must be entered by parameter.

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/shipments/28262122315/tracking
  -d '{
    "tracking_id": "String",
    "tracking_url": "http://carrier.com",
    "carrier": "name carrier"
}'
```

 

### Response

```javascript
{
    "status": "success"
}
```

[Learn more.](https://global-selling.mercadolibre.com/devsite/manage-shipments)