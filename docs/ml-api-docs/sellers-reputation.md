# Sellers reputation 

**Tags:** Sellers,reputation
**Created:** 2019-12-26T01:20:02Z
**Last Updated:** 2026-02-27T14:00:59Z

---

## Seller reputation

A seller's reputation on Mercado Libre is the image they have within the platform so that buyers and sellers can build trust when transacting with them. It is important to maintain it in order to grow within the site. Learn about [What seller reputation is and how it works](https://www.mercadolibre.com.ar/ayuda/Como-funciona-la-reputacion-de-vendedor_866).

Request:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/$USER_ID
```

Example:

```javascript
curl -X GET -H 'Authorization: Bearer $ACCESS_TOKEN' https://api.mercadolibre.com/users/128885
```

Response:

```javascript
"seller_reputation": {
        "level_id": "5_green",
        "power_seller_status": "platinum",
        "real_level": "red",
        "protection_end_date": "2019-12-27T00:00:00.000-04:00",
        "transactions": {
            "canceled": 981,
            "completed": 6211,
            "period": "historic",
            "ratings": {
                "negative": 0.04,
                "neutral": 0.08,
                "positive": 0.88
            },
            "total": 7192
        },
        "metrics": {
            "sales": {
                "period": "60 days",
                "completed": 244
            },
            "claims": {
                "period": "60 days",
                "rate": 0,
                "value": 0,
                "excluded": { 
                    "real_value": 24, 
                    "real_rate": 0.0912 
                }
            },
            "delayed_handling_time": {
                "period": "60 days",
                "rate": 0,
                "value": 0,
                "excluded": { 
                    "real_value": 47, 
                    "real_rate": 0.723 
                }
            },
            "cancellations": {
                "period": "60 days",
                "rate": 0,
                "value": 0,
                "excluded": { 
                    "real_value": 6, 
                    "real_rate": 0.0228 
                }
            }
        }
    },
```

Note:

Remember that if you are a protected seller, you will see the real data within the excluded field.

### Response fields

- **level\_id:** user's reputation level, described in numbering and thermometer color.
- **power\_seller\_status:** this field indicates if the seller is a Mercado Lider, and the name of the medal received, which can be Silver, Gold or Platinum.
- **real\_level**: seller's real reputation level during the protection period (appears only when the seller is protected).
- **protection\_end\_date**: protection end date (only when the seller is protected).
- **transactions:** number of sales made by the user in a given period.
  
  - **canceled**: number of canceled transactions.
  - **completed**: number of completed transactions.
  - **period**: period considered.
  - **ratings**: ratio of sales rated as negative, neutral, or positive.
  - **total**: total transactions.

## Quality metrics

- - **sales:** the number of **sales** the seller has.
    
    - **period**: the period considered to calculate the ratio will depend on the number of completed sales made in the last 60 days.
    - **completed**: number of completed sales. It counts whether the order has claims or not, so if an order has more than one claim/dispute, for it not to be counted, all claims/disputes must be excluded from reputation (avoid\_reputation tag).

Depending on the country and the number of sales, the evaluation period varies:

**Mexico (MLM)**

Transactions in the last 60 days Period to evaluate for reputation **For MLM &gt; or = 40 sales** The last 60 days are considered. **For MLM &lt; 40 sales** The entire sales history from the last 365 days is considered.

**Brazil (MLB)**

Transactions in the last 60 days Period to evaluate for reputation **For MLB &gt; or = 60 sales** The last 60 days are considered. **For MLB &lt; 60 sales** The entire sales history from the last 365 days is considered.

**Argentina (MLA)**

Transactions in the last 60 days Period to evaluate for reputation **For MLA &gt; or = 50 sales** The last 60 days are considered. **For MLA &lt; 50 sales** The entire sales history from the last 365 days is considered.

**Colombia (MCO)**

Transactions in the last 60 days Period to evaluate for reputation **For MCO &gt; or = 60 sales** The last 60 days are considered. **For MCO &lt; 60 sales** The entire sales history from the last 365 days is considered.

**Chile (MLC)**

Transactions in the last 60 days Period to evaluate for reputation **For MLC &gt; or = 40 sales** The last 60 days are considered. **For MLC &lt; 40 sales** The entire sales history from the last 365 days is considered.

**Uruguay (MLU)**

Completed transactions in the last 120 days Period to evaluate for reputation **For MLU &gt; or = 25 sales** The last 120 days are considered. **For MLU &lt; 25 sales** The entire sales history from the last 365 days is considered.

**Ecuador (MEC)**

Transactions in the last 120 days Period to evaluate for reputation **For MEC &gt; or = 20 sales** The last 120 days are considered. **For MEC &lt; 20 sales** The entire sales history from the last 365 days is considered.

**Peru (MPE)**

Transactions in the last 120 days Period to evaluate for reputation **For MPE &gt; or = 20 sales** The last 120 days are considered. **For MPE &lt; 20 sales** The entire sales history from the last 365 days is considered.

For Venezuela, the old reputation system is used. For more information, access the following help links:

\- [Venezuela](https://www.mercadolibre.com.ve/ayuda/Como-funciona-la-reputacion-vendedor_1621)

Notes:

\- Completed sales are calculated on total sales minus sales canceled by the seller or buyer.  
\- "Uncompleted sale" refers to orders with fulfilled = false.  
\- The values chosen were the entry values for the Mercado Lideres program corresponding to each country.  
\- Total sales refers to the number of seller transactions in the considered period, regardless of payment or shipping method. We do not consider sales from users who were disabled, sales from fraudulent users, sales with all payments rejected, or invalid sales.

Exceptions:

Certain mediations are automatically ignored when they meet specific rules. For exceptional cases, a process will be applied via contact with CX.

## Claims

For the calculation, sales with claims initiated by the buyer are considered, regardless of the shipping or payment method. That is, we do not consider sales from users who were disabled, sales from fraudulent users, sales with rejected payments, or invalid sales.

Formula

**claims\_rate = sales with claims / total sales**

Notes:

\- Sellers need to have more than 10 sales in their history.

Once the period to calculate the number of sales made by the seller is known, the thermometer color will be determined according to the seller's percentage.  
Example of a thermometer as the seller will see it in their account:

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/343218683222-termometro-vendedor.png)

## Delayed delivery time (Handling Time)

Handling Time is the difference between when it is ready to ship (ready\_to\_ship) and when the carrier actually indicates it was collected (shipped). Except for Cross Docking shipping types, where Handling Time is the difference between when the package is at the HUB (in\_hub) and when the carrier actually indicates it was collected (shipped). Delayed handling time is the percentage of sales with late shipments.

- - - We only consider sellers who use Mercado Envios and have 10 or more shipped sales. The rest will not be affected by this metric and we assume their deliveries made outside the deadline is 0%.
    - The time we use to measure this is the last 60 days if the seller has more than 50 sales in MLA, 60 sales in MLB, 40 sales in MLC, 60 sales in MCO and 40 sales in MLM made in that period, and it will be the last 365 days if they don't reach this number of sales in their countries.

Formula: **delayed handling time rate = sales with late dispatch / sales dispatched with me2**

Period considered: 60 or 365 days, depending on the number of transactions in the last 60 days. For MLU we consider 120 or 365 days.  
In the case where the cart has multiple orders with the same shipment, if dispatched late, it affects the seller as many times as there are orders in the package.

You can also [use the /schedule resource](/es_ar/horario-de-despacho-por-logistica) to get dispatch schedules and avoid delays.

## Cancellations

This metric shows us the number of cancellations made by the seller where there is no claim involved.  
It is a resource known by Mercado Lideres, which will now apply to all sellers.  
The formula used to calculate it:  
**Cancellations rate = cancellations made by the seller / total sales**  
Applies to all sites where the new reputation system is in effect: **MLA**, **MLB**, **MLM**, **MCO**, **MLC**, **MLU**, **MPE**, **MEC**.

## Limits for each variable

We modified the limits for each variable across all colors, levels and sites. The new limits are as follows:

**MLB**

Variables Leaders Green Yellow Orange Red Claim 1% 2% 4.5% 8% &gt; 8% Cancellations 0.5% 1.5% 3.5% 4% &gt; 4% delayed handling time 6% 10% 18% 22% &gt; 22%

**MLA**

Variables Leaders Green Yellow Orange Red Claim 1% 1.5% 3% 6% &gt; 6% Cancellations 0.5% 1% 2.5% 3% &gt; 3% delayed handling time 8% 10% 15% 22% &gt; 22%

**MLM**

Variables Leaders Green Yellow Orange Red Claim 1% 1.5% 3% 6% &gt; 6% Cancellations 0.5% 1% 2.5% 3% &gt; 3% delayed handling time 8% 10% 15% 22% &gt; 22%

**MCO**

Variables Leaders Green Yellow Orange Red Claim 2.5% 3.5% 5.5% 7% &gt; 7% Cancellations 1.5% 2.5% 7% 9% &gt; 9% delayed handling time 10% 12% 18% 26% &gt; 26%

**MLU**

Variables Leaders Green Yellow Orange Red Claim 2.5% 3.5% 5.5% 7% &gt; 7% Cancellations 1.5% 2.5% 7% 9% &gt; 9% delayed handling time 10% 12% 18% 26% &gt; 26%

**MLC**

Variables Leaders Green Yellow Orange Red Claim 2.5% 3.5% 5.5% 7% &gt; 7% Cancellations 1.5% 2.5% 7% 9% &gt; 9% delayed handling time 10% 12% 18% 26% &gt; 26%

**MEC**

Variables Leaders Green Yellow Orange Red Claim 4% 4.0% 6% 8% &gt; 8% Cancellations 3% 3% 8% 11% &gt; 11% delayed handling time 12% 12% 20% 30% &gt; 30%

**MPE**

Variables Leaders Green Yellow Orange Red Claim 2% 2% 4.5% 8% &gt; 8% Cancellations 2.5% 2.5% 7% 9% &gt; 9% delayed handling time 12% 12% 18% 26% &gt; 26%