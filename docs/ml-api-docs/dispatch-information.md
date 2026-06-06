# Dispatch Information

**Tags:** Cainiao,Dispatch Preferences,Pick-Up,Drop Off Agency
**Created:** 2025-01-22T10:42:15Z
**Last Updated:** 2026-05-07T17:44:41Z

---

## Dispatch Information

Sellers integrated with the **CAINIAO** carrier can manage their shipping preferences through the /dispatch\_preferences endpoint. This resource allows for the creation or update of the pickup address and the configuration of shipping preferences, enabling the choice between *pick-up* or *drop-off*.

Important:

The functionality is currently limited to sellers integrated with the Cainiao carrier.

## Dispatch Preferences

### Search dispatch preferences

To obtain the dispatch preferences associated with a seller, use the following request:

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/shipments/dispatch_preferences/carriers
```

#### For merchant who has active CAINIAO

Response:

```javascript
{
        "name": "Cainiao",
        "has_pickup": true,
        "sites": [
            "MLC",
            "MLB",
            "MCO",
            "MLM"
        ],
        "dispatch_info": {
            "pickup": true
        }
    }
```

#### For merchant who does not have active CAINIAO

The successful response will be just a "200 - OK" with an empty return.

```javascript
{}
```

## Set dispatch preferences

The seller can opt for one of the two available dispatch modalities:

- Pick-up
- Drop-off Agency

The modalities are mutually exclusive. Selecting pickup makes it impossible to register drop-off agencies, just as choosing drop-off agency prevents the configuration of a pickup address.

## Associate Pick-Up as dispatch preference

**For merchant who has active CAINIAO**

To configure pickup as the dispatch modality, use the following request:

Request:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/shipments/dispatch_preferences/carriers/$CARRIER_NAME \
-d '{
    "pickup": true
}'
```

Example:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/shipments/dispatch_preferences/carriers/cainiao \
-d '{
    "pickup": true
}'
```

The successful response will be just a "200 - OK" with an empty return.

```javascript
{}
```

## Possible errors when associating pick-up as dispatch preference

Below are the common error scenarios when trying to configure pickup for a seller:

**For merchant without active CAINIAO**

```javascript
{
    "message": "you don't have this carrier configured",
    "error": "some fields are invalid or not accepted in this request",
    "status": 400,
    "cause": null
}
```

**For merchant with active CAINIAO but no registered pickup address**

```javascript
{
    "message": "you don't have pick up address registered",
    "error": "some fields are invalid or not accepted in this request",
    "status": 400,
    "cause": null
}
```

## Associate Drop Off Agency as dispatch preference

**For merchant with active CAINIAO**

To set a drop-off agency as the seller's dispatch preference, use the following request:

Request:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/shipments/dispatch_preferences/carriers/$CARRIER_NAME
 -d {
    "drop_off_agency": "$AGENCY_CODE"
}'
```

Example:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/shipments/dispatch_preferences/carriers/cainiao 
-d '{
    "drop_off_agency": "TRAN_0001"
}
```

The successful response will be just a "200 - OK" with an empty return.

```javascript
{}
```

**Authorized Agency List: China**

Province City Warehouse Address Warehouse Name Warehouse Code / Drop off agency Jiangxi Province Nanchang City 1st Floor, Building 1, No. 199 Chuangxin Third Road, High-tech Development Zone, Nanchang City, Jiangxi Province Nanchang Changdong Warehouse TRAN\_STORE\_31152718 Jiangxi Province Shangrao City No. 219 Xinke Avenue, Economic Development Zone, Dongtuan Township, Guangxin District, Shangrao City, Jiangxi Shangrao Jingkai Warehouse TRAN\_STORE\_31177914 Anhui Province Hefei City Suning Logistics Park A01, No. 2889 Chuangxin Avenue, Nangang Town, High-tech Zone, Hefei City, Anhui Province Hefei Gaoxin Warehouse TRAN\_STORE\_31153162 Zhejiang Province Ningbo City Warehouse No. 7 (Middle Zone), No. 99 Jucai Road, Ningbo City, Zhejiang Province Ningbo Jiangbei Warehouse TRAN\_STORE\_31121528 Zhejiang Province Wenzhou City 4PX Logistics (Building A, 1st Floor), No. 400 Wenzhou Daily, 100 meters northeast of the intersection of Binhai Fifth Road and Binhai Fourteenth Road, Longwan District Wenzhou Longwan 2 Warehouse TRAN\_STORE\_31121279 Zhejiang Province Yiwu City 1/2 Zone on the 3rd Floor, Warehouse 1, Zhejiang Baowan Yiwu Logistics Park, Intersection of Sihai Avenue and Shugang Expressway, Yiwu City, Zhejiang Province Yiwu Choujiang Baowan Regional Sorting Center TRAN\_STORE\_31405747 Guangdong Province Dongguan City Warehouse 3 (Linkpark) in Dongguan Shatian Logistics Park, First Industrial Park, Shatian Town, Dongguan City, Guangdong Province Dongguan Shatian No. 3 Hub Sorting Center TRAN\_STORE\_31405735 Hebei Province Baoding City No. 446 Jingbai Street, Baigou Town, Gaobeidian City, Hebei Province Baoding Baigou Warehouse TRAN\_STORE\_31152915 Beijing Beijing City 4PX inside the First Industrial Park, No. 9 Hengtong Road, Economic Development Zone, Miyun District, Beijing City Beijing Shunyi Warehouse TRAN\_STORE\_31152916 Sichuan Province Chengdu City 4PX at No. 111-112, Shengfeng Logistics Park, No. 3 Yantang Road, Xindu District, Chengdu City, Sichuan Province Chengdu Xindu Warehouse TRAN\_STORE\_31152813 Liaoning Province Huludao City 4PX at No. 21 Tiexi Road, Ningyuan Street, Xingcheng City, Huludao City, Liaoning Province Huludao Xingcheng Warehouse TRAN\_STORE\_31153201 Henan Province Nanyang City 4PX Express, Unit 1, Building 11, Nanyang Sino-European Industrial Park, Donggang Village Community, Qilin Road, Jinggang Street, Wolong District, Nanyang City, Henan Province Nanyang Wolong Warehouse TRAN\_STORE\_31152060 Hebei Province Shijiazhuang City 4PX Express, 5-2-103, Tianshan Technology Industrial Park, No. 319 Xiangjiang Road, Yuhua District, Shijiazhuang City, Hebei Province Shijiazhuang Gaoxin Warehouse TRAN\_STORE\_31152106 Tianjin Tianjin City 4PX inside Shenzhoutong Logistics Park, No. 39 Middle Ring South Road, Airport Economic Zone, Dongli District, Tianjin City Tianjin Dongli Warehouse TRAN\_STORE\_31154181 Henan Province Xuchang City 4PX Express, Wanli Logistics Park, 100 meters southeast of the intersection of Nanhuandong Road and Wen'an Road, Jian'an District, Xuchang City, Henan Province Xuchang Jian'an Warehouse TRAN\_STORE\_31296697 Henan Province Zhengzhou City 4PX Express, East Zone, Warehouse 3, Zhongyuan Logistics Park, Intersection of Xunjiang East Road and Huaxi Street, Economic Development Zone, Zhengzhou City, Henan Province Zhengzhou Jingkai Warehouse TRAN\_STORE\_31152279 Chongqing Chongqing City 4PX on the 3rd Floor, Building 2, Chongqing Hongdali Food Co., Ltd., No. 100 Baohuan East Road, Yubei District, Chongqing City Chongqing Jiulongpo Warehouse TRAN\_STORE\_31152943 Hubei Province Wuhan City 4PX inside Zhongyuan Logistics Park, intersection of Xincheng Thirteenth Road and Jinshan Avenue, Dongxihu District, Wuhan City, Hubei Province Wuhan Jiangcheng Warehouse TRAN\_STORE\_30500252

**Authorized Agency List: Hong Kong**

Province City Warehouse Address Warehouse Name Warehouse Code / Drop off agency New Territories Yuen Long 4PX Warehouse B, DD129 LOT 3299RP Ping Ha Road, Ha Tsuen, Lau Fau Shan, Yuen Long, New Territories, Hong Kong SAR (Opposite to Hoi Fai Heavy Container Yard) Hong Kong First-Mile Yuen Long Warehouse TRAN\_STORE\_13423798

## Possible errors when associating Drop Off Agency as dispatch preference

**Invalid Drop Off Agency for merchant with active CAINIAO**

Request:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/shipments/dispatch_preferences/carriers/cainiao
 -d '{
    "drop_off_agency": "TRAN_0001"
}
```

Response:

```javascript
{
    "message": "invalid agency informed for carrier Cainiao ",
    "error": "some fields are invalid or not accepted in this request",
    "status": 400,
    "cause": null
}
}
```

**Drop Off Agency for merchant with invalid carrier**

Request:

```javascript
curl -X PUT -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/shipments/dispatch_preferences/carriers/mailamericas
-d '{
    "drop_off_agency": "TRAN_STORE_31405735"
}
```

Response:

```javascript
{
    "message": "invalid agency informed for carrier MailAmericas",
    "error": "some fields are invalid or not accepted in this request",
    "status": 400,
    "cause": null
}
}
```

## Associate pick-up address

To assign or update a pick-up address, you must enter the full address. All fields are mandatory.

Example request:

```javascript
curl -X POST -H 'Authorization: Bearer $ACCESS_TOKEN' \
-H 'Content-Type: application/json' \
https://api.mercadolibre.com/marketplace/shipments/dispatch_preferences/pick_up_addresses \
-d '{
    "address_line": "中国广东省惠州市惠城区江北云山金世界雅景苑B座14A",
    "zip_code": "516003",
    "phone": "10101010",
    "city": {
        "id": "Q04tR0RIdWl6aG91",
        "name": "Huizhou"
    },
    "state": {
        "id": "CN-GD",
        "name": "Guangdong"
    },
    "country": {
        "id": "CN",
        "name": "China"
    },
    "additional_info": "惠城区"
}'
```

The successful response will be just a "200 - OK" with an empty return.

```javascript
{}
```

**Mandatory fields:**

Field Description address\_line Full address of the pickup location (street and number). For addresses in China, the field must mandatory contain the characters 省 (province) and 市 (city). zip\_code Postal code, must contain exactly 6 digits. city Object containing the ID and the identifying name of the city. state Object containing the ID and the identifying name of the state/province. country Object containing the ID and the identifying name of the country. additional\_info City district.

**Optional fields:**

**phone:** Phone number of the seller's pickup warehouse.

Note:

For the information required for the city, state and country fields, see the resources in the [Location](https://global-selling.mercadolibre.com/devsite/location-global-selling) documentation.

## Possible errors when associating the pick-up address

When configuring the pickup address, the following inconsistencies may occur. It is fundamental to understand the cause of each error to perform the appropriate handling and ensure correct integration. Below, we detail the necessary information to identify and solve these problems:

Error Status Message / Cause Solution Invalid JSON body 400 Invalid body Ensure the request body is valid JSON. Missing address\_line 400 missing properties: 'address\_line' Include the *address\_line* field. Missing city 400 missing properties: 'city' Include the *city* object with `id` and `name`. Missing state 400 missing properties: 'state' Include the *state* object with *id* and `name`. Missing country 400 missing properties: 'country' Include the *country* object with `id` and `name`. Invalid address\_line format 400 address\_line: does not match pattern Ensure address contains 省 (province) and 市 (city) characters. Invalid zip\_code format 400 zip\_code: does not match pattern '^\[\\d]{6}$' Provide exactly 6 digits for the postal code. City not in address 400 the city specified \[CityName] does not appear in the address line Ensure the city name appears within the *address\_line* text. Unauthorized 403 At least one policy returned UNAUTHORIZED. Verify credentials and access token permissions.

## Get pick-up address

To determine if the merchant has the correct pick-up address, you can make the following request:

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/marketplace/shipments/dispatch_preferences/pick_up_addresses
```

#### Merchant with registered pick-up address

Response:

```javascript
[
    {
        "sites": [
            "MLC",
            "MLB",
            "MCO",
            "MLM"
        ],
        "address_id": 1434131662,
        "address_line": "广东省东莞市厚街镇赤岭（三屯）福民路86号正通B幢二楼(I0798)",
        "zip_code": "523000",
        "additional_info": "",
        "phone": "15999934561",
        "city": {
            "id": "Q04tR0REb25nZ3Vhbg",
            "name": "Dongguan"
        },
        "state": {
            "id": "CN-GD",
            "name": "Guangdong"
        },
        "country": {
            "id": "CN",
            "name": "China"
        }
    }
]
```

#### Merchant without registered pick-up address

The successful response will be just a "200 - OK" with an empty return.

```javascript
{}
```