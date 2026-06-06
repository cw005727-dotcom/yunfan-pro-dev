# Seller reputation

## Your reputation reflects your seller performance, and it measures the quality of service you offer to buyers. See more how we calculate it.

**Tags:** reputation
**Created:** 2022-12-01T08:09:46Z
**Last Updated:** 2025-12-15T10:23:48Z

---

## Seller reputation

Note:

We will have updates on seller reputations:  
\- [MLB - As of March 21](https://global-selling.mercadolibre.com/help/what-the-changes-in-reputation-are_27672)  
\- [MLA - As of April 10](https://global-selling.mercadolibre.com/help/what-the-changes-in-reputation-are_27672)  
\- [MLM - As of April 12](https://global-selling.mercadolibre.com/help/what-the-changes-in-reputation-are_27672)  
\- [MLU - As of April 19](https://global-selling.mercadolibre.com/help/what-the-changes-in-reputation-are_27672)  
\- [MCO - As of April 19](https://global-selling.mercadolibre.com/help/what-the-changes-in-reputation-are_27672)  
\- [MLC - As of April 19](https://global-selling.mercadolibre.com/help/what-the-changes-in-reputation-are_27672)  
Sellers can check, through their Mercado Libre account, the simulation and see how their reputation will look like with the changes.

Your reputation reflects your seller performance, and it measures the quality of service you offer to buyers. In Mercado Libre, your reputation is reflected by a color. We calculate your reputation based on three metrics. To do so, **we take into consideration your fulfilled orders during the last 3 months plus the days of the current month**. If your total sales history has less than 40 fulfilled orders, we take into consideration your whole order record. See more details about [show it works](https://global-selling.mercadolibre.com/learning-center/news/seller-reputation-learn-how-it-works).

## Check global and marketplace sellers reputation

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/global/users/seller_reputation
```

Response:

```javascript

{
    "user_id": 1234,
    "site_id": "CBT",
    "seller_reputation": [
        {
            "user_id": 5678,
            "site_id": "MLM",
            "logistic_type": "remote",
            "seller_reputation": {
                "level_id": "5_green",
                "power_seller_status": "gold",
                "transactions": {
                    "canceled": 81,
                    "completed": 601,
                    "period": "historic",
                    "ratings": {
                        "negative": 0.04,
                        "neutral": 0.02,
                        "positive": 0.94
                    },
                    "total": 682
                },
                "metrics": {
                    "sales": {
                        "period": "60 days",
                        "completed": 219
                    },
                    "claims": {
                        "period": "60 days",
                        "rate": 0.0166,
                        "value": 4
                    },
                    "delayed_handling_time": {
                        "period": "60 days",
                        "rate": 0.0877,
                        "value": 20
                    },
                    "cancellations": {
                        "period": "60 days",
                        "rate": 0,
                        "value": 1
                    }
                }
            }
        },
        {
            "user_id": 33355,
            "site_id": "MLC",
            "logistic_type": "remote",
            "seller_reputation": {
                "level_id": null,
                "power_seller_status": null,
                "transactions": {
                    "canceled": 3,
                    "completed": 6,
                    "period": "historic",
                    "ratings": {
                        "negative": 0.09,
                        "neutral": 0.03,
                        "positive": 0.88
                    },
                    "total": 9
                },
                "metrics": {
                    "sales": {
                        "period": "365 days",
                        "completed": 6
                    },
                    "claims": {
                        "period": "365 days",
                        "rate": 0,
                        "value": 1
                    },
                    "delayed_handling_time": {
                        "period": "365 days",
                        "rate": 0,
                        "value": 7
                    },
                    "cancellations": {
                        "period": "365 days",
                        "rate": 0,
                        "value": 0
                    }
                }
            }
        },
        {
            "user_id": 123123,
            "site_id": "MLB",
            "logistic_type": "remote",
            "seller_reputation": {
                "level_id": null,
                "power_seller_status": null,
                "transactions": {
                    "canceled": 2,
                    "completed": 7,
                    "period": "historic",
                    "ratings": {
                        "negative": 0.31,
                        "neutral": 0,
                        "positive": 0.69
                    },
                    "total": 9
                },
                "metrics": {
                    "sales": {
                        "period": "365 days",
                        "completed": 7
                    },
                    "claims": {
                        "period": "365 days",
                        "rate": 0,
                        "value": 0
                    },
                    "delayed_handling_time": {
                        "period": "365 days",
                        "rate": 0,
                        "value": 1
                    },
                    "cancellations": {
                        "period": "365 days",
                        "rate": 0,
                        "value": 1
                    }
                }
            }
        },
        {
            "user_id": 678768,
            "site_id": "MCO",
            "logistic_type": "remote",
            "seller_reputation": {
                "level_id": null,
                "power_seller_status": null,
                "transactions": {
                    "canceled": 5,
                    "completed": 4,
                    "period": "historic",
                    "ratings": {
                        "negative": 1,
                        "neutral": 0,
                        "positive": 0
                    },
                    "total": 9
                },
                "metrics": {
                    "sales": {
                        "period": "365 days",
                        "completed": 4
                    },
                    "claims": {
                        "period": "365 days",
                        "rate": 0,
                        "value": 0
                    },
                    "delayed_handling_time": {
                        "period": "365 days",
                        "rate": 0,
                        "value": 1
                    },
                    "cancellations": {
                        "period": "365 days",
                        "rate": 0.5555,
                        "value": 5
                    }
                }
            }
        }
    ]
}
```

Note:

Remember that if you are a protected seller, you will see the actual data within the excluded field.

## Resource fields

- **level\_id:** User reputation level described in thermometer numbering and color.
- **power\_seller\_status:** This field shows if the seller is Mercado Lider, and the name of medal received, whether Silver, Gold or Platinum.
- **real\_level**: Actual level of reputation of the seller, during the protection period (appears only when the seller is protected).
- **protection\_end\_date**: End date of protection (only when the seller is protected).
- **transactions:** Number of sales made by user in certain period.
- **canceled**: Number of transactions cancelled.
- **completed**: Number of transactions completed.
- **period**: Period considered.
- **ratings**: Ratio of sales rated as negative, neutral or positive.
- **total**: Total transactions.

## Quality metrics

- **sales**: The number of sales with mediations (claims and/or disputes) a seller has.
- **period**: The period for ratio calculation will depend on the number of sales fulfilled in the past 60 days.
- **completed**: Number of sales completed. Whether an order has claims or not matters. So if an order has more than one claim / dispute, to avoid counting it, all the claims / disputes must be excluded from his/her reputation (tag "avoid\_reputation").

Period to evaluate, depending on country and number of sales:

### **México (MLM)**

Transactions in the past 60 days Period for reputation evaluation **For MLM &gt; or = 40 sales** The past 60 days. **For MLM &lt; 40 sales** All the sales history is considered (past 365 days).

### **Brasil (MLB)**

Transactions in the past 60 days Period for reputation evaluation **For MLB &gt; or = 60 sales** The past 60 days. **For MLB &lt; 60 sales** All the sales history is considered (past 365 days).

### **Colombia (MCO)**

Transactions in the past 60 days Period for reputation evaluation **For MCO &gt; or = 60 sales** The past 60 days. **For MCO &lt; 60 sales** All the sales history is considered (past 365 days).

### **Chile (MLC)**

Transactions in the past 60 days Period for reputation evaluation **Para MLC &gt; or = a 40 sales** The past 60 days. **Para MLC &lt; 40 sales** All the sales history is considered (past 365 days).

Notes:

\- Sales fulfilled are calculated on the total sales minus sales cancelled by seller or buyer.  
\- Sales not fulfilled mean orders where fulfilled = false.  
\- Values chosen were values to enter Mercado Líderes programs for each country.  
\- Total sales mean the number of seller's transactions in a given period, regardless of the payment and shipping method. Sales from disqualified users, fraudulent user sales, sales with all payments rejected and invalid sales were not considered.

Exceptions:

Certain measurements are automatically ignored when specific rules are met. For exceptional cases, a process for order exception via contact with CX will be provided.

## Claims

For calculation, sales with claims made by buyer regardless of payment or shipping method will be considered. That is, sales from disqualified users, fraudulent user sales, sales with payment rejected and invalid sales were not considered.

Formula

**claims\_rate = sales with claims / total sales**

To start impacting on reputation, at least, 3 sales with claims are needed.

Notes:

\- With a minimum of 3 sales with claims, reputation will be affected.  
\- All sellers need to have more than 10 sales in their history.

Once the period to calculate number of sales made by seller is known, thermometer color will be determined by seller percentage. Thermometer example in the same way as it will be viewed by seller in account:

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/343218683222-termometro-vendedor.png "Flujo para publicar")

## Minimum for each thermometer level with this variable

**MLM**

- - - light\_green &amp; up ==&gt; claims\_rate &lt;= 2%
    - yellow ==&gt; 2% &lt; claims\_rate &lt;= 4%
    - orange ==&gt; 4% &lt; claims\_rate &lt;= 7%
    - red ==&gt; 7% &lt; claims\_rate

Important:

As of March 21 there [will be changes in the reputation for MLB](https://www.mercadolivre.com.br/ajuda/o-que-muda-na-reputacao_27672). Sellers can check, through their Mercado Libre account, the simulation and see how their reputation will look like with the changes.

**MLB**

- - - light\_green &amp; up ==&gt; claims\_rate &lt;= 3%
    - yellow ==&gt; 3% &lt; claims\_rate &lt;= 7%
    - orange ==&gt; 7% &lt; claims\_rate &lt;= 12%
    - red ==&gt; 12% &lt; claims\_rate

**MCO**

- - - light\_green &amp; up ==&gt; claims\_rate &lt;= 5%
    - yellow ==&gt; 5% &lt; claims\_rate &lt;= 7%
    - orange ==&gt; 7% &lt; claims\_rate &lt;= 10%
    - red ==&gt; 10% &lt; claims\_rate

**MLC**

- - - light\_green &amp; up ==&gt; claims\_rate &lt;= 5%
    - yellow ==&gt; 5% &lt; claims\_rate &lt;= 7%
    - orange ==&gt; 7% &lt; claims\_rate &lt;= 10%
    - red ==&gt; 10% &lt; claims\_rate

## Handling Time

It measures the time it takes for you to ship an order, that is, deliver the package to the carrier. It applies to both Mercado Libre’s partnered carriers and your own chosen carriers. Our policy is that you keep a 3-day handling time per order or lower. Having a handling time above 3 days could hurt your reputation.

**If you are using your own chosen carrier**, it’s important for you to add the shipment details as soon as possible so that buyers can start tracking their orders online. Doing this will help you keep your buyers happy, reduce complaints and negative feedback.

The following only apply to your direct-to-consumer operation:

- - - **In order to have a green color reputation**, your orders with delayed handling time cannot exceed 15% of total orders.
    - **In order to have a yellow color reputation**, your orders with delayed handling time cannot exceed 20% of total orders.
    - **In order to have an orange color reputation**, your orders with delayed handling time cannot exceed 30% of total orders.

Avoid affecting your reputation by dispatching the product to the warehouse of your assigned carrier 96 hours since the order was created.

## Cancellations

This metric shows the number of seller cancellations without any claim. The rate of canceled orders should not be over 4% when it comes to Mexico, and it should be below 3% in the case of Brazil.

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/237207364826-Captura-de-Tela-2022-12-01-a-s-10.02.55.png "Flujo para publicar")

## Errors

The following errors may occur when querying the seller reputation endpoint. Generic errors (500, 503) are excluded from this table.

HTTP Status Error Code Message Solution **400** bad\_request Malformed access\_token: {token} Verify the access token format. Ensure it's a valid Bearer token obtained from the OAuth flow. **400** (empty) unknown\_error The request could not be processed. Verify your token is valid and has the required scopes. **401** unauthorized\_request\_error Invalid caller.id The Authorization header is missing or the caller cannot be identified. Include a valid Bearer token in the request header.