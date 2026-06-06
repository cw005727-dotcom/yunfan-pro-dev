# Envíos Turbo

**Tags:** Turbo Shipping
**Created:** 2023-11-10T14:46:24Z
**Last Updated:** 2024-04-23T15:14:44Z

---

## Envíos Turbo

Important:

Currently this shipping logistics is only available for sellers from Argentina.

Envíos Turbo is a delivery service that focuses on providing fast shipments in less than three hours. It is designed to serve areas close to the seller and is based on the Flex logistics model. This service aims to offer an extremely fast delivery option, which can be providing a high-quality service to users.

Find more information related to Turbo on the following pages:

- [Envíos Flex](https://developers.mercadolibre.com.ar/es_ar/envios-flex)
- [How do you calculate delivery times with Envíos Turbo?](https://www.mercadolibre.com.ar/ayuda/29935)
- [Frequently Asked Questions about Envíos Turbo](https://www.mercadolibre.com.ar/ayuda/30924)
- [Take your sales to a new level with Envíos Turbo](https://vendedores.mercadolibre.com.ar/nota/lleva-tus-ventas-a-un-nuevo-nivel-con-envios-turbo)
- [Firt Steps with Envíos Turbo](https://vendedores.mercadolibre.com.ar/guia/primeros-pasos-con-envios-turbo?siteId=MLA&locale=es-ar)

Note:

\- It is essential to respect the 1,000 rpm limit on all requests regarding Flex and Turbo resources, since it is shared between these two types of shipments. Maintaining this limit ensures an efficient and equitable use of the available resources.  
\- The Envios Flex app by Mercado Libre is required for scanning shipments and making delivery itineraries. However, it is not available for integrations, so logistics companies will have to adapt.

## Coverage areas by country

To be able to offer Envíos Turbo, the seller’s delivery address must be enabled for one of the coverage areas by country:

Country Coverage Argentina - AMBA (Área Metropolitana de Buenos Aires)

## Setting up a test user

To configure the Envíos Turbo functionality for test users, consider:  
1\. Log in to the account you want to enable Envíos Turbo for.  
2\. Validate that the user already has Flex Shipping active, as this is a prerequisite.  
3\. Make sure that the account has active ads in ME2.  
4\. Check that the account has a Yellow or Green reputation.  
5\. Make sure you have an email address compatible with your country's coverage area.  
6\. Set up the shipping address in AMBA.  
7\. Activate Envíos Turbo on the account by going to "My Profile" &gt; "Sales" &gt; "Sales Preferences".  
Once you have completed these steps, you can use Envíos Turbo as a test user.

## Check a user’s subscriptions

This endpoint allows checking the subscriptions a user has.

- If the user activates both services, Flex and Turbo, they will have two subscriptions, as Flex is a requirement to access Turbo.

Note:

In the context of subscriptions, each subscription has a unique identifier called service\_id. This identifier is essential to be able to access the subscription configuration and make changes to it. In this case, the service\_id of the Turbo mode will be used.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/shipping/flex/sites/$SITE_ID/users/$USER_ID/subscriptions/v1
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/shipping/flex/sites/MLA/users/1438865529/subscriptions/v1
```

Response:

```javascript
[
    {
        "id": 111181,
        "site_id": "MLA",
        "user_id": 1438865529,
        "mode": "FLEX",
        "configuration_type": {
        	"coverage": "zone",
        	"delivery": "custom"
        },       
        "service_id": 736230,
        "status": {
            "id": "in",
        },
        "creation_date": "2023-08-02T06:34:40Z"
    },
    {
        "id": 111183,
        "site_id": "MLA",
        "user_id": 1438865529,
        "mode": "TURBO",
        "configuration_type": {
        	"coverage": "radius",
        	"delivery": "accurate" 
        },  
        "service_id": 738216,
        "status": {
            "id": "in",
        },
        "creation_date": "2023-08-02T06:35:30Z"
    }
]
```

### Response parameters:

- **id** unique subscription ID.
- **site\_id** country identifier.
- **user\_id** user ID.
- **mode** type of subscription (TURBO in this case)
- **configuration\_type** type of subscription settings (TURBO in this case).
- **configuration\_type.coverage** type of coverage.
- **configuration\_type.delivery** type of delivery.
- **service\_id** service ID associated with the subscription.
- **status** status of the subscription.
- **status.id:** status types of the subscription:

<!--THE END-->

- - **in**: The subscription is active. In this status the user can change their settings and will receive shipment orders for the subscription mode.
  - **out**: The subscription is not active. In this status the user cannot change the settings.
  - **pending**: The subscription is pending activation. In this status the user can change his settings although they will not receive orders for shipments.

<!--THE END-->

- **creation\_date** date of the subscription creation.

### Response status codes:

Code Message Description Recommendation 200 - OK - Settings were successfully updated. - 400 - Bad Request empty site id The site\_id is empty. Validate the site\_id. 400 - Bad Request invalid site\_id Invalid site\_id. Validate if the site\_id is enabled for Envios Turbo. 400 - Bad Request can't access to resource Invalid site\_id. Validate if the site\_id is enabled for Envios Turbo 404 - Not Found user not found The user does not exist. Validate the user\_id.

## Identify Turbo orders

This endpoint determines whether a shipment will be handled by the Turbo service, allowing the transaction to be effectively completed.

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/shipments/$SHIPMENT_ID
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/shipments/42469883906
```

Response:

```javascript
"tags": [
        "turbo"
    ]
```

Note:

\- It is important to clarify that Turbo is not a logistics type in itself. This means that when you are interacting without endpoints, the attribute logistic\_typewill continue to be the self\_service and not Turbo.  
\- In addition, the same difference will be found in tags of:  
\- [https://api.mercadolibre.com/users/$USER\_ID/shipping\_preferences](https://api.mercadolibre.com/users/$USER_ID/shipping_preferences)  
\- [https://api.mercadolibre.com/orders/$ORDER\_ID/shipments](https://api.mercadolibre.com/orders/$ORDER_ID/shipments)

## Check the subscription settings

This endpoint allows you to check the settings of the subscriptions a user has, in this case of Turbo.

Llamada:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/shipping/flex/sites/$SITE_ID/configuration/v3
```

Ejemplo:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/shipping/flex/sites/MLA/configuration/v3

{
  "query": "{ configuration(user_id: 1438865529, service_id: 738216) { address { id address_line city { id name } zip_code } subscription { site_id user_id service_id status { id } creation_date training_times { original { value unit } remaining { value unit } activation_date } } delivery_window is_moderated delivery_ranges { week { capacity type processing_time from to et_hour calculated_cutoff } saturday { capacity type processing_time from to et_hour calculated_cutoff } sunday { capacity type processing_time from to et_hour calculated_cutoff } } working_days radius availables { capacity_range { from to } accurate_ranges { from to } radius_range { from to } } disabled_features } }"
}
```

Response:

```javascript

  {
      "configuration": {
          "address": {
              "address_line": "Testing Street 1450",
              "city": {
                  "id": "TUxBQlNBQTM3Mzda",
                  "name": "Saavedra"
              },
              "id": "1316123989",
              "zip_code": "1430"
          },
          "availables": {
             "capacity_range":  {
                 "from": 1,
                 "to": 5
             },
  "accurate_ranges": [
                  {
                     "from": 10
                     "to": 12
                  },
                  {
                     "from": 11
                     "to": 13
                  },
                  {
                     "from": 12
                     "to": 14
                  },
                  {
                     "from": 13
                     "to": 15
                  },
                  {
                     "from": 14
                     "to": 16
                  },
                  {
                     "from": 15
                     "to": 17
                  },
                  {
                     "from": 16
                     "to": 18
                  }
              ],
              "radius_range" {
                 "from": 1,
                 "to": 5
              }
          },
          "delivery_ranges": {
              "saturday": null,
              "sunday": null,
              "week": [
                  {
                      "calculated_cutoff": 10,
                      "capacity": 5,
                      "et_hour": null,
                      "from": 10,
                      "processing_time": 0,
                      "to": 12,
                      "type": "etd"
                  },
                  {
                      "calculated_cutoff": 11,
                      "capacity": 5,
                      "et_hour": null,
                      "from": 11,
                      "processing_time": 0,
                      "to": 13,
                      "type": "etd"
                  },
                  {
                      "calculated_cutoff": 12,
                      "capacity": 5,
                      "et_hour": null,
                      "from": 12,
                      "processing_time": 0,
                      "to": 14,
                      "type": "etd"
                  },
                  {
                      "calculated_cutoff": 13,
                      "capacity": 5,
                      "et_hour": null,
                      "from": 13,
                      "processing_time": 0,
                      "to": 15,
                      "type": "etd"
                  },
                  {
                      "calculated_cutoff": 14,
                      "capacity": 5,
                      "et_hour": null,
                      "from": 14,
                      "processing_time": 0,
                      "to": 16,
                      "type": "etd"
                  },
                  {
                      "calculated_cutoff": 15,
                      "capacity": 5,
                      "et_hour": null,
                      "from": 15,
                      "processing_time": 0,
                      "to": 17,
                      "type": "etd"
                  },
                  {
                      "calculated_cutoff": 16,
                      "capacity": 5,
                      "et_hour": null,
                      "from": 16,
                      "processing_time": 0,
                      "to": 18,
                      "type": "cpt"
                  }
              ]
          },
          "delivery_window": "same_day",
          "disabled_features": [],
          "is_moderated": false,
          "subscription": {
              "creation_date": "2023-08-02T06:35:30Z",
              "service_id": 738216,
              "site_id": "MLA",
              "status": {
                  "id": "in"
              },
              "training_times": null,
              "user_id": 1438865529
          },
          "working_days": [
              "week"
          ],
          "radius": 8000
      }
  }
```

### Response parameters:

- **address**: information about the user's address.
- **availables**: contains information on the capacity, cuts and ranges available for the service.

<!--THE END-->

- **availables.capacity\_range**: range of values for capacity.
- **availables.accurate\_ranges**: turbo time ranges available (at least 3 must be selected by the user).
- **availables.radius\_range**: range of available radiuses in kilometers.

<!--THE END-->

- **delivery\_ranges**: information on available capacity, cuts and ranges for different days of the week.
  
  - **delivery\_ranges.saturday**: delivery ranges and capacity for Saturdays (consider that Turbo is currently not available for Saturdays).
  - **delivery\_ranges.sunday**: delivery ranges and capacity for Sundays (consider that Turbo is currently not available for Sundays).
  - **delivery\_ranges.week**: delivery ranges and capacity for the days of the week.
  
  <!--THE END-->
  
  - **delivery\_window**: the type of service for delivery. The only possible value for Turbo is "same\_day" (same day shipment).
  - **disabled\_features**: disabled features for the service including, for example: "CUTOFF\_BY\_ZONE" and "CAPACITY\_BY\_DAY".
  - **is\_moderated**: indicates whether the service is moderated (true/false).
  - **subscription**: information about the user's subscription.
  - **working\_days**: available working days.
  - **radius**: the coverage radius in meters. The coverage is defined by a circle with a center in the direction of the seller and the defined radius.
  
  ### Response status codes:
  
  Code Message Description Recommendation 200 - OK - The settings were successfully updated. - 400 - Bad Request empty site ID The site\_id is empty. Validate the site\_id. 400 - Bad Request invalid site\_id Invalid site\_id. Validate if the site\_id is enabled for Envíos Turbo. 400 - Bad Request can't access to resource Invalid site\_id. Validate if the site\_id is enabled for Envíos Turbo. 400 - Bad Request invalid JSON body The JSON is invalid. Validate the established query scheme. 400 - Bad Request failed to create schema in graphql operation Invalid GraphQL for the defined scheme. Validate the established query scheme. 400 - Bad Request invalid query Invalid GraphQL for the defined scheme. Validate the established query scheme. 404 - Not Found subscriptions not found No subscription to Envíos Turbo for the combination of user\_id and service\_id sent. Validate the user\_id and service\_id at the endpoint. 404 - Not Found user not found The user doesn’t exist. Validate the user\_id.
  
  ## Set delivery time ranges and delivery limits
  
  Through this endpoint, it’s possible to set different aspects for Envíos Turbo such as:  
  \- Delivery time ranges  
  \- Delivery limits
  
  Request:
  
  ```javascript
  curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/shipping/flex/sites/$SITE_ID/users/$USER_ID/services/$SERVICE_ID/configuration/delivery/accurate/v3
  ```
  
  Example:
  
  ```javascript
  
    curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/shipping/flex/sites/MLA/users/1438865529/services/736230/configuration/delivery/accurate/v3
    
    {
            "delivery_ranges": {
                "week": [
                    {   
                        "from": 10,
                        "to": 12,
                        "capacity": 30
                    },
                    {   
                        "from": 11,
                        "to": 13,
                        "capacity": 20
                    },
                    {   
                        "from": 12,
                        "to": 14,
                        "capacity": 10
                    }
                ]
            }
    }
  ```
  
  ### Response parameters:
  
  - **delivery\_ranges.week**: information on delivery range and shipping limit.
  - **from**: beginning of the time range for delivery.
  - **to**: end of the time range for delivery.
  - **capacity**: delivery capacity for the given time range.
  
  Note:
  
  \- Unlike the Flex Delivery Time Ranges settings, Turbo shipments have multiple Time Ranges. These time ranges define a delivery window in which the seller must make shipments associated with sales in the previous hour.  
  \- The **From and To** values defining each range are fixed and must be taken from the service response returned by the seller's Turbo settings in the configuration.accurate\_ranges attribute (no custom ranges can be defined).  
  \- For example: if the Time Range is from noon to 2:00 p.m., it means that for sales made between 11:00 a.m. and noon the seller must deliver the package between noon and 2:00 p.m., so a maximum of 3 hours can pass between the sale and the delivery.  
  \- Delivery Time Ranges are only available Monday through Friday, indicating from what time (from) and to what time (to) a Delivery Time Range is defined for Turbo.  
  \- To ensure the accuracy of delivery capacity information, even if the capacity of a single delivery range is changed, it is necessary to send all active delivery ranges together with their capacity. Otherwise, it will be assumed that unsent ranges are not active.
  
  Code Message Description Recommendation 200 - OK - The settings were successfully updated. - 400 - Bad Request invalid user\_id Invalid User\_id. Validate the user\_id (must be an integer).. 400 - Bad Request invalid service\_id Invalid Service\_id. Validate the service\_id (must be an integer).. 400 - Bad Request invalid JSON body The JSON is invalid. Validate the established query scheme. 404 - Not Found can't update delivery custom The settings update could not be performed because there is no Envios Turbo subscription for the user\_id and service\_id combination submitted. Validate the user\_id and service\_id at the endpoint.
  
  ## Expand Turbo coverage area
  
  This endpoint allows you to add more coverage areas for Envíos Turbo.
  
  Request:
  
  ```javascript
  curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/shipping/flex/sites/$SITE_ID/users/$USER_ID/services/$SERVICE_ID/configuration/coverage/radius/v3
  ```
  
  Example:
  
  ```javascript
  curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/shipping/flex/sites/MLA/users/1438865529/services/736230/configuration/coverage/radius/v3
  
  {
    "radius": 8000
  }
  ```
  
  Note:
  
  In this example, it is stated that the seller has delivery coverage within a radius of 8000 meters. Radiuses can vary from a minimum of 3000 meters to a maximum of 8000 meters
  
  ### Response status codes:
  
  Code Message Description Recommendation 200 - OK - The settings were successfully updated. - 400 - Bad Request invalid user\_id Invalid user\_id. Validate the user\_id (must be an integer). 400 - Bad Request invalid service\_id Invalid service\_id. Validate the service\_id (must be an integer). 400 - Bad Request invalid JSON body The JSON is invalid. Validate the established query scheme. 404 - Not Found can't update delivery custom The settings update could not be performed because there is no Shipping Turbo subscription for the user\_id and service\_id combination sent. Validate the user\_id and service\_id at the endpoint.
  
  ## Turbo items management
  
  Item management in Turbo involves the activation of Turbo for those items. In order to achieve this, it is crucial to consider the following:
  
  1\. Before activating Turbo, it is necessary to enable Flex.  
  2\. Items with active Flex will be offered by Turbo as long as they meet the dimensional and weight restrictions of Shipping Turbo.  
  3\. Activation is automatic once the prerequisites have been met.
  
  Important:
  
  Before listing or editing an item using Turbo, it is important to take into account the following aspects:  
  1\. Verify that the seller already has the [Flex logistics active](https://developers.mercadolibre.ar/es_ar/envios-flex)  
  2\. Verify that the item has [Flex active](https://developers.mercadolibre.ar/es_ar/envios-flex).  
  3\. Verify that the item complies with the established dimensions:
  
  - Height: 70 cm
  - Width: 70 cm
  - Length: 70 cm
  - Weight: 30000 gr = 30 kg
  
  4\. Please note that if an item meets these requirements, the activation is automatic, i.e. Turbo will appear immediately in the listing  
  5\. If you do not wish to offer the item with Turbo, it is recommended to deactivate it or remove it from Flex  
  These steps will ensure proper management of items in Mercado Libre and will help provide the best shopping experience for users.