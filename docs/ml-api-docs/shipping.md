# Shipping

**Tags:** Shipping
**Created:** 2018-06-27T12:01:32Z
**Last Updated:** 2023-03-22T14:25:22Z

---

## Shipping

Note:

We have disabled the /sites/$SITE\_ID/shipping\_options feature.  
We recommend querying users / shipping\_options and / or items / shipping\_options.

This examples will guide you through shipping resources.

Resource Description Example **/shipments/$SHIPMENT\_ID** Retrieves all delivery data. [GET](#modal1)

[Go back.](#close) [X](#close "Close")

## Retrieves all delivery data.

```
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/shipments/123456789
```

 

## Response

```
{
    "id": 123456789,
    "external_reference": null,
    "status": "ready_to_ship",
    "substatus": "printed",
    "date_created": "2019-09-02T15:12:31.000-04:00",
    "last_updated": "2019-09-02T15:16:52.000-04:00",
    "declared_value": 120,
    "dimensions": {
        "height": 9,
        "width": 25,
        "length": 32,
        "weight": 310
    },
    "logistic": {
        "direction": "forward",
        "mode": "me2",
        "type": "drop_off"
    },
    "source": {
        "site_id": "MLB",
        "market_place": "MELI",
        "application_id": null
    },
    "tracking_number": "1011234567890",
    "origin": {
        "type": "selling_address",
        "sender_id": 4321345667,
        "shipping_address": {
            "address_id": 1035444445,
            "address_line": "XXXXXXX",
            "street_name": "XXXXXXX",
            "street_number": "XXXXXXX",
            "comment": "XXXXXXX",
            "zip_code": "02554123",
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
            "neighborhood": {
                "id": null,
                "name": "Vila Diva (Zona Norte)"
            },
            "municipality": {
                "id": null,
                "name": null
            },
            "agency": {
                "carrier_id": null,
                "agency_id": null,
                "description": null,
                "phone": null,
                "open_hours": null
            },
            "types": [
                "billing",
                "default_selling_address",
                "shipping"
            ],
            "latitude": 0,
            "longitude": 0,
            "geolocation_type": "ROOFTOP"
        }
    },
    "destination": {
        "type": "buying_address",
        "receiver_id": 4322312345,
        "receiver_name": "Teste Joaozinho",
        "receiver_phone": "48 12345678",
        "comments": null,
        "shipping_address": {
            "address_id": 123456789,
            "address_line": "Avenida Brigadeiro Faria 123456",
            "street_name": "Avenida Brigadeiro Faria",
            "street_number": "123456",
            "comment": null,
            "zip_code": "0713123456",
            "city": {
                "id": "BR-SP-41",
                "name": "Guarulhos"
            },
            "state": {
                "id": "BR-SP",
                "name": "São Paulo"
            },
            "country": {
                "id": "BR",
                "name": "Brasil"
            },
            "neighborhood": {
                "id": null,
                "name": "Cocaia"
            },
            "municipality": {
                "id": null,
                "name": null
            },
            "agency": {
                "carrier_id": null,
                "agency_id": null,
                "description": null,
                "phone": null,
                "open_hours": null
            },
            "types": [
                "default_buying_address"
            ],
            "latitude": -23.442744,
            "longitude": -46.522703,
            "geolocation_type": "ROOFTOP",
            "delivery_preference": "residential"
        }
    },
    "lead_time": {
        "option_id": 1964123456,
        "shipping_method": {
            "id": 182,
            "name": "Expresso",
            "type": "express",
            "deliver_to": "address"
        },
        "currency_id": "BRL",
        "cost": 0,
        "list_cost": 15.45,
        "cost_type": "free",
        "service_id": 22,
        "delivery_type": "estimated",
        "estimated_schedule_limit": {
            "date": null
        },
        "estimated_delivery_time": {
            "type": "known_frame",
            "date": "2019-09-04T00:00:00.000-03:00",
            "unit": "hour",
            "offset": {
                "date": "2019-09-05T00:00:00.000-03:00",
                "shipping": 24
            },
            "time_frame": {
                "from": null,
                "to": null
            },
            "pay_before": null,
            "shipping": 24,
            "handling": 24,
            "schedule": null
        },
        "estimated_delivery_limit": {
            "date": "2019-09-19T00:00:00.000-03:00",
            "offset": 240
        },
        "estimated_delivery_final": {
            "date": "2020-01-03T00:00:00.000-03:00",
            "offset": 1920
        },
        "estimated_delivery_extended": {
            "date": "2019-09-12T00:00:00.000-03:00",
            "offset": 120
        },
        "estimated_handling_limit": {
            "date": "2019-09-03T00:00:00.000-03:00"
        },
        "delay": [
            "handling_delayed"
        ]
    },
    "tags": [
        "test_shipment"
    ]
}
```

[Learn more.](/en_us/ship-products/)

**/items/$ITEM\_ID/shipping\_options** Retrieves all methods available to send the product. Valid for custom shipments only. [GET](#modal2)

[Go back](#close) [X](#close "Close")

## Get visits by user and time

```
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/items/MLA609927611/shipping_options
```

 

## Response

```
{
  "destination": null,
  "options": [{
    "id": "MLA609927611-0",
    "name": "OCA",
    "currency_id": "ARS",
    "list_cost": 40,
    "cost": 40,
    "tracks_shipments_status": "no",
    "display": "always",
    "speed": null
  }]
}
```

[Learn more.](/en_us/ship-products/)

**/sites/$SITE\_ID/shipping\_methods** Retrieves shipping modes available in a country. [GET](#modal3)

[Go back](#close) [X](#close "Close")

## Retrieves shipping modes available in a country.

```
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/sites/MLA/shipping_methods
```

 

## Response

```
[{
  "id": 800,
  "name": "Moto Express a domicilio",
  "status": "active",
  "site_id": "MLA",
  "free_options": ["country"],
  "shipping_modes": ["me2"]
}, {
  "id": 502845,
  "name": "Retiro en sucursal OCA Prioritario",
  "status": "active",
  "site_id": "MLA",
  "free_options": ["country"],
  "shipping_modes": null
}, {
  "id": 501045,
  "name": "Retiro en sucursal OCA",
  "status": "active",
  "site_id": "MLA",
  "free_options": ["country"],
  "shipping_modes": ["me2"]
}, {
  "id": 501145,
  "name": "Estándar",
  "status": "active",
  "site_id": "MLA",
  "free_options": ["country"],
  "shipping_modes": ["me1"]
}, {
  "id": 501146,
  "name": "Prioritario",
  "status": "active",
  "site_id": "MLA",
  "free_options": ["country"],
  "shipping_modes": ["me1"]
}, {
  "id": 73330,
  "name": "Prioritario a domicilio",
  "status": "active",
  "site_id": "MLA",
  "free_options": ["country"],
  "shipping_modes": ["me2"]
}, {
  "id": 73328,
  "name": "Normal a domicilio",
  "status": "active",
  "site_id": "MLA",
  "free_options": ["country"],
  "shipping_modes": ["me2"]
}]
        
```

[Learn more.](/en_us/ship-products/)

**/users/$CUST\_ID/shipping\_preferences** Retrieves all shipping modes and services available to user. [GET](#modal10)

[Go back](#close) [X](#close "Close")

## Retrieves all shipping modes and services available to user.

```
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/207035636/shipping_preferences
```

 

## Response

```

{
  "local_pick_up": false,
  "modes": ["custom", "not_specified", "me2"],
  "services": [61, 62, 151],
  "free_configurations": [{
    "condition": {
      "type": "all",
      "value": null
    },
    "rule": {
      "free_mode": "country",
      "value": null,
      "default": true,
      "free_shipping_flag": true
    }
  }],
  "trusted_user": false,
  "mandatory_mode_for_user": [],
  "custom_calculator": false,
  "picking_type": null,
  "thermal_printer": null,
  "option": "trial",
  "site_id": "MLA"
}

      
```

[Ler mais.](/pt_br/envio-de-produto/)

**/orders/$ORDER\_ID/shipments** Retrieves the delivery information into order. [GET](#modal11)

[Go back](#close) [X](#close "Close")

## Retrieves the delivery information into order.

```
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/orders/123456789/shipments
```

 

## Response

```
{
    "id": 123456789,
    "mode": "me2",
    "created_by": "receiver",
    "order_id": 123456789,
    "order_cost": 120,
    "base_cost": 0,
    "site_id": "MLB",
    "status": "ready_to_ship",
    "substatus": "printed",
    "status_history": {
        "date_cancelled": null,
        "date_delivered": null,
        "date_first_visit": null,
        "date_handling": "2019-09-02T15:12:36.000-04:00",
        "date_not_delivered": null,
        "date_ready_to_ship": "2019-09-02T15:12:36.000-04:00",
        "date_shipped": null,
        "date_returned": null
    },
    "substatus_history": [],
    "date_created": "2019-09-02T15:12:31.000-04:00",
    "last_updated": "2019-09-02T15:16:52.000-04:00",
    "tracking_number": "1010101231564564",
    "tracking_method": "Sedex",
    "service_id": 22,
    "carrier_info": null,
    "sender_id": 4312345678,
    "sender_address": {
        "id": 103123456789,
        "address_line": "XXXXXXX",
        "street_name": "XXXXXXX",
        "street_number": "XXXXXXX",
        "comment": "XXXXXXX",
        "zip_code": "02551234",
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
        "neighborhood": {
            "id": null,
            "name": "Vila Diva (Zona Norte)"
        },
        "municipality": {
            "id": null,
            "name": null
        },
        "agency": null,
        "types": [
            "billing",
            "default_selling_address",
            "shipping"
        ],
        "latitude": 0,
        "longitude": 0,
        "geolocation_type": "ROOFTOP"
    },
    "receiver_id": 43223123456,
    "receiver_address": {
        "id": 1035123456,
        "address_line": "Avenida Brigadeiro Faria 123456",
        "street_name": "Avenida Brigadeiro Faria Lima",
        "street_number": "123456",
        "comment": null,
        "zip_code": "07131234",
        "city": {
            "id": "BR-SP-41",
            "name": "Guarulhos"
        },
        "state": {
            "id": "BR-SP",
            "name": "São Paulo"
        },
        "country": {
            "id": "BR",
            "name": "Brasil"
        },
        "neighborhood": {
            "id": null,
            "name": "Cocaia"
        },
        "municipality": {
            "id": null,
            "name": null
        },
        "agency": null,
        "types": [
            "default_buying_address"
        ],
        "latitude": -23.442744,
        "longitude": -46.522703,
        "geolocation_type": "ROOFTOP",
        "delivery_preference": "residential",
        "receiver_name": "Teste Joaozinho",
        "receiver_phone": "48 12341234"
    },
    "shipping_items": [
        {
            "id": "MLB1223012345",
            "description": "Bermuda adidas Teste Titulo Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Teste Te",
            "quantity": 1,
            "dimensions": "9.0x25.0x32.0,310.0",
            "dimensions_source": {
                "id": "mp2v_similarity_MLB1223012345",
                "origin": "mp2v_similarity"
            }
        }
    ],
    "shipping_option": {
        "id": 19647123456,
        "shipping_method_id": 182,
        "name": "Expresso",
        "currency_id": "BRL",
        "list_cost": 15.45,
        "cost": 0,
        "delivery_type": "estimated",
        "estimated_schedule_limit": {
            "date": null
        },
        "estimated_delivery_time": {
            "type": "known_frame",
            "date": "2019-09-04T00:00:00.000-03:00",
            "unit": "hour",
            "offset": {
                "date": "2019-09-05T00:00:00.000-03:00",
                "shipping": 24
            },
            "time_frame": {
                "from": null,
                "to": null
            },
            "pay_before": null,
            "shipping": 24,
            "handling": 24,
            "schedule": null
        },
        "estimated_delivery_limit": {
            "date": "2019-09-19T00:00:00.000-03:00",
            "offset": 240
        },
        "estimated_delivery_final": {
            "date": "2020-01-03T00:00:00.000-03:00",
            "offset": 1920
        },
        "estimated_delivery_extended": {
            "date": "2019-09-12T00:00:00.000-03:00",
            "offset": 120
        },
        "estimated_handling_limit": {
            "date": "2019-09-03T00:00:00.000-03:00"
        }
    },
    "comments": null,
    "date_first_printed": "2019-09-02T15:16:51.000-04:00",
    "market_place": "MELI",
    "return_details": null,
    "tags": [
        "test_shipment"
    ],
    "delay": [
        "handling_delayed"
    ],
    "type": "forward",
    "logistic_type": "drop_off",
    "application_id": null,
    "return_tracking_number": null,
    "cost_components": {
        "special_discount": 0,
        "loyal_discount": 0,
        "compensation": 0,
        "gap_discount": 0,
        "ratio": 23.35
    }
}
```

[Learn more.](/en_us/ship-products/)

**/shipment\_labels** Allows print the ticket for send the order. [GET](#modal12)

[Go back](#close) [X](#close "Close")

## Allows print the ticket for send the order.

```
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' "https://api.mercadolibre.com/shipment_labels?shipment_ids=21527708516,21528639166&savePdf=Y"
```

 

## Response

Returns the options for downloading tickets. [Learn more.](/en_us/ship-products/)

**/shipment\_labels?shipment\_ids=$SHIPMENT\_ID&amp;response\_type=zpl2** Allows print the ticket for send the order in Zebra Format. [GET](#modal13)

[Go back](#close) [X](#close "Close")

## Allows print the ticket for send the order in Zebra Format.

```
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' "https://api.mercadolibre.com/shipment_labels?shipment_ids=21527708516&response_type=zpl2"
```

 

## Response

Returns the options for downloading tickets. [Learn more.](/en_us/ship-products/)

**/shipment\_labels?shipment\_ids=$SHIPMENT\_ID&amp;savePdf=Y** Allows print the ticket for send the order in PDF Format [GET](#modal14)

[Go back](#close) [X](#close "Close")

## Allows print the ticket for send the order in PDF Format

```
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' "https://api.mercadolibre.com/shipment_labels?shipment_ids=21527708516&savePdf=Y"
```

 

## Response

Returns the options for downloading tickets. [Learn more.](/en_us/ship-products/)