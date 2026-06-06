# Dynamic freight

**Tags:** Dynamic,freight
**Created:** 2021-04-22T14:16:28Z
**Last Updated:** 2024-04-11T11:16:03Z

---

## Dynamic Freight

Dynamic Freight is a Mercado Envios 1 functionality that is a feature that speeds up the selection of prices and shipping times for sellers and provides buyers with accurate information on delivery times. This configuration verifies the prices and shipping conditions in real time, and shows the shipping cost before the purchase, improving the experience and logistic efficiency. Also, to correctly register the development of this functionality it is necessary to undergo a homologation process.

## Homologation dynamics

Homologation is a process in which Mercado Libre verifies and approves an external URL so that users can register with Mercado Libre from that website in a safe and reliable manner. This involves technical tests, security evaluation and implementing the necessary measures to guarantee the authenticity and protection of users' data. Once approved, the URL becomes a valid channel for ME1 users.

## Homologation requirements

Below are the homologation requirements to ensure a successful integration with our dynamic freight platform:

- Compliance with the contract
- Optimal response time
- Infrastructure location
- Specification of the data’s origin and destination
- Use of cache
- Error monitoring
- Mercado Libre contingency
  
  ## Compliance with the contract
  
  Here is a step-by-step approach to creating the endpoint for homologation:
  
  - The URL does not have a specific structure, which provides flexibility in the setup.
  - Each request should contain only one item from one seller. This is essential to maintain the efficiency of data transmission.
  - Use the HTTP GET method to access the endpoint. This method is suitable for requesting data and is commonly used in web integrations.
  - Clearly outline the data source (origin) and the destination system. Understanding these aspects is critical to ensure a smooth and accurate data flow.
    
    Importante:
    
    Gather the following necessary elements:
    
    - The URL or endpoint you want to register.
    - Required headers for the communication.
    - Body format or JSON request that meets the specifications.
    - Name and ID of your application.  
      Consider creating a short video showing the development done to validate and verify the contract specifications. This can be useful to document the process and share suggestions. To create the application, we suggest checking the documentation: [Register your application](https://developers.mercadolibre.com.ar/en_us/register-your-application)
      
      It is important to note that the approval process is reserved exclusively for certified integrators. If you belong to this group, we invite you to generate a ticket to start the certification process. In case you are not yet certified, we recommend you to check our [Developer Partner Program](https://developers.mercadolibre.com.ar/es_ar/developer-partner-program) for more information on how to get your certification.
    
    ## Optimal response time
    
    This approach is essential to ensure an efficient user experience and to avoid integration problems with sellers, for this purpose:
    
    - Get familiar with the need to keep the response time below 400 ms and understand its importance for a successful integration.
    - Before activating the endpoint, submit it to an initial load validation. This involves evaluating its response time under normal conditions of use.
    - If the response time exceeds the limit, corrective actions are required. This may include code and infrastructure review and optimization.
    - If the response time meets the 400 ms requirement, the integration is approved and can be activated for sellers.
    - Make sure you continue to optimize the response time continuously to deliver an exceptional user experience.
      
      ## Infrastructure location
      
      Following these steps, you will be able to make informed decisions to improve the performance of your application based on the infrastructure location:
      
      - Consider that the current dynamic freight infrastructure is located in the East region of the United States, specifically in Virginia.
      - Evaluate if it is necessary to optimize your application or adjust the settings to make the most of the infrastructure location.
        
        ## Data origin and destination
        
        ### Data source specifications (origin)
        
        The data source specifications are part of the communication protocol or data exchange in the homologation process:
        
        Example by Zip\_Code:
        
        ```javascript
        {
          "seller_id": 337352780,
          "buyer_id": 3123212,
          "declared_value": 69.9,
          "items": [
            {
              "id": "MLB1223500643",
              "variation_id": 0,
              "category_id": "ABC1234",
              "price": 69.9,
              "quantity": 1,
              "sku": "RB-PC890A",
              "store_id": 231,
              "dimensions": {
                "height": 10,
                "width": 10,
                "length": 31,
                "weight": 500
              }
            }
          ],
          "destination": {
            "type": "zipcode",
            "value": "88063038"
          },
          "origin": {
            "type": "zipcode",
            "value": "88063038"
          }
        }
        ```
        
        Example by City:
        
        ```javascript
        {
          "seller_id": 337352780,
          "buyer_id": 3123212,
          "declared_value": 69.9,
          "items": [
            {
              "id": "MLB1223500643",
              "variation_id": 0,
              "category_id": "ABC1234",
              "price": 69.9,
              "quantity": 1,
              "sku": "RB-PC890A",
              "store_id": 231,
              "dimensions": {
                "height": 10,
                "width": 10,
                "length": 31,
                "weight": 500
              }
            }
          ],
        "destination": {
            "type": "city",
            "value": "Ñuble/Yungay"
          },
          "origin": {
            "type": "city",
            "value": "Metropolitana/Pudahuel"
           }
        }
        ```
        
        ### Response parameters:
        
        **seller\_id** (string)​​: mandatory. It is the identification of the account within Mercado Libre.  
        **buyer\_id** (string): Opcional. optional. It is the identification of the user that is buying on Mercado Libre. It is available only when the user that is making the quote is logged in the Mercado Libre platform.  
        **declared\_value** (float)​​: optional. This is the value that will be declared on the invoice.  
        **items** (array): mandatory. Information about the item purchased.
        
        - **items.id** (string): mandatory. It is the identification of the product registered in Mercado Libre.
        - **items.variation\_id** (string): mandatory. It is the identification of the variation chosen by the buyer for the purchase, it has data only when the quote corresponds to an item with variation.
        - **items.category\_id** (string)​​: optional. It is the identification of the product category within Mercado Libre.
        - **items.price** (float)​​: optional. It is the unit price of the product multiplied by the number of items chosen by the buyer at the time of the quote.
        - **items.quantity** (int)​​: mandatory. It is the quantity that will be purchased of the same product.
        - **items.sku** (string)​​: mandatory. It is the identification of the product when it is purchased.
        - **items.store\_id** (string)​​: optional. It is the identification of the official store within Mercado Libre.
        - **items.dimensions** (object)​​: mandatory. It is the list of measurements of a product.
        
        \- **items.dimensions.length** (float)​​: mandatory. It is the length of the product (in centimeters).  
        \- **items.dimensions.width** (float)​​: mandatory. It is the width of the product (in centimeters).  
        \- **items.dimensions.height** (float)​​: mandatory. It is the height of the product (in centimeters).  
        \- **items.dimensions.weight** (float)​​: mandatory. It is the weight of the product (in grams).
        
        **origin** (object)​​: optional. It is the information of the address of origin of the delivery or of the seller.  
        **destination** (object)​: mandatory. It is the information of the address where the product will be delivered. Below is the detail according to each country:
        
        Country Detail Brazil Zip Code Argentina Zip Code Mexico Zip Code Chile Region / Commune Colombia Department / Township Perú Department / Province or District Uruguay Department / Township
        
        Note:
        
        - When the number of items is greater than 1, Mercado Libre will use an algorithm to consolidate the dimensions in the best possible combination to optimize space. In this case, the integration must use the values sent in the request without any multiplication.
        - The response should include the quote for the item purchased.
        - It is possible to send several quotes, each with a different delivery time/promise and price.
        - All response values are mandatory and must be provided.
        
        ## Specifications of the destination of the data (destination)
        
        The data destination specifications are part of the communication protocol or data exchange in the homologation process:
        
        Example:
        
        ```javascript
        {
           "destinations":[
              "88063038"
           ],
           "packages":[
              {
                 "dimensions":{
                    "height":10,
                    "width":10,
                    "length":15,
                    "weight":500
                 },
                 "items":[
                    {
                       "id":"MLB1223500643",
                       "variation_id":3123212,
                       "quantity":1,
                       "dimensions":{
                          "height":10,
                          "width":10,
                          "length":15,
                          "weight":500
                       }
                    }
                 ],
                 "quotations":[
                    {
                       "price":119.88,
                       "handling_time":0,
                       "shipping_time":4,
                       "promise":4,
                       "service":99
                    },
                    {
                       "price":0,
                       "handling_time":0,
                       "shipping_time":6,
                       "promise":6,
                       "service":99
                    }
                 ]
              }
           ]
        }
        ```
        
        ### Response parameters:
        
        **destinations** (array)​​: information containing zip codes or other identification of destinations to which packages will be sent.  
        **packages** (array)​​: information representing the packages created by the vendor.
        
        - **packages.dimensions** (object)​​: mandatory. It is the list of measurements of the package.**items** (array): mandatory. Information about the purchased item.
        - **items.id** (string): mandatory. It is the identification of the item registered in Mercado Libre.
        - **items.variation\_id** (string): mandatory. It is the identification of the variation chosen by the buyer.
        - **items.quantity** (int)​​: this is the quantity of product to be shipped.
        - **items.dimensions** (object)​​: mandatory. This is the list of item measurements.**quotations** (array)​​: mandatory. information about the freight for a product.
        - **quotations.price** (float)​​: this is the freight price that will be presented to the buyer.
        - **quotations.handling\_time** (int)​​: this is the time, in business days, that will be used to separate and pack the product. It covers all processes prior to the actual shipment of the package. If this information is not available, the value 0 should be returned.
        - **quotations.shipping\_time** (int)​​: this is the time, in business days, the package takes in transit (from the time it enters the vehicle to the time it is delivered to the buyer).
        - **quotations.promise** (int)​​: it is the sum of the values of handling\_time and shipping\_time.
        - **quotations.service** (int) : it is the service/carrier code with unique identification ranging from 0 to 99, assigned by the seller/integrator.
          
          Note:
          
          For the case of the quotations.service attribute:
          
          - This code is the sole responsibility of the seller/integrator, Mercado Libre only transmits it.
          - If you send only one digit, it will be automatically completed with a "0" to the left. For example, if you send "5", it will become "05".
          - In the event of sending more than 2 digits, the information will not be integrated and the carrier code will return **00**. For example, if you send **123**, the answer will be **00**.
          - It is essential to include at least one object within the **quotations** array.
          
          In the event that an internal error occurs or an item is related to an error, the structure of the response should follow the following format:
          
          - For error code 3 (no coverage), the HTTP status should be 400 (Incorrect request).
          - For any other error code or internal error related to the quote, the HTTP status should be 500 (Internal Server Error).
          
          Response example:
          
          ```javascript
          {
             "message": "any message",
             "error_code": 1
          }
          ```
          
          ## Use of the cache
          
          In this context, [RFC IETF 7234](https://datatracker.ietf.org/doc/html/rfc7234) a widely recognized specification that establishes best practices for caching HTTP calls, will be used.
          
          ## HTTP verbs
          
          In this context, it is essential to align the semantics of our calls with the HTTP protocol, which suggests that only GET calls should be cached.
          
          ## Headers
          
          Additional headers should be added to calls and responses made to integrators. In the case of calls, the following headers should be added:
          
          Attribute Description If-None-Match Identifier of the resource (quote) in question (header ETag). It is used to check if the resource version is still valid. It is valid if the partner returns HTTP status 304 with no content. Otherwise, it returns a new version of the resource and a new ETag.
          
          Por otro lado, en las respuestas proporcionadas de los integradores, es necesario incluir los siguientes encabezados adicionales:
          
          Attribute Description Cache-Control Used to specify the directives for the cache of the responses. The directives that you must adapt are:
          
          - no-store: (optional) indicates that the response must not be cached. If this directive is used, the other ones are not necessary.
          - must-revalidate: you must verify if the response is valid with the integrator. It must return the HTTP Status 304 if it is still valid or 200 with the new value for the quote. This validation is optional and it is up to the integrator to adopt it or not. If you do not adapt it, the max-age will be used to define the TTL of the response in the cache.
          - private: (mandatory) the response must not be stored by any intermediary proxy.
          - max-age: (mandatory) maximum time in seconds in which the response is valid.
          
          Age Time in seconds since the resource version became valid. In case this control does not exist by the partners, you must send the value zero (0). ETag Resource version identifier. It is mandatory to use it.
          
          In order to optimize our responses and reduce the number of calls, the attribute called "destinations" will contain a list of destinations in the form of strings, indicating all the places where the quote can be used. Now, with a single quote, multiple calls can be avoided, significantly improving the efficiency of our APIs.  
          Here is an example of how the returned ETag header can be checked to determine if the cached response is still valid. Example of a call with cache validation:
          
          Headers Status Body - Cache-Control:private;max-age:1000000  
          \- Age:50000  
          \- ETag:0943dc18-a8d7-4508-97a9-ba9221fa 304 No Content
          
          To provide more detailed control over caching, we are introducing the "no-store" directive in the "Cache-Control" header of our responses. This directive allows partners to indicate that a quotation should not be cached.
          
          Example of a response without allowing caching:
          
          Headers Status Body - Cache-Control:no-store 200 Same body as in the quote reply
          
          Ejemplo de respuesta con caché:
          
          Headers Status Body - Cache-Control:private;max-age:1000000  
          \- Age:0  
          \- ETag:0943dc18-a8d7-4508-97a9-ba9221fa 200 Same body as in the quote reply
          
          ## Error monitoring
          
          The following is a list of possible errors related to the handling of Dynamic Freight:
          
          Parameter Description Possible Solution -1 This error occurs when the integrator application experiences internal problems that prevent it from functioning properly. As a result, the buyer will receive a quote from the MELI calculator in contingency mode. In case of an internal error in the integrator application, it is recommended to consider the Contingency Table as a backup plan. **When an internal error is detected, the application automatically activates the query to the Contingency Table.** 1 This error occurs when the product selected by the buyer is not in stock. As a result, it is not possible to calculate a shipping quote for a product that is not in stock. It is recommended to implement an effective inventory management process or consider showing alternatives of similar products available. 2 This error occurs when the destination (zip code, commune, etc.) provided by the buyer is invalid. As a result, an accurate shipping quote cannot be calculated. When verifying the destination as invalid, the application should query the Contingency Table. If the Contingency Table contains valid information for the destination entered, this information should be used to calculate the shipping quote. 3 This error occurs when the product selected by the buyer is not available for delivery to the specified destination. As a result, a shipping quote cannot be calculated. If the product is not available at the original location, the Contingency Table may contain information on alternative products or alternative delivery locations. 4 This error occurs when the application cannot find the product specified by the buyer. This makes it impossible to calculate an accurate shipping quote. Ensure that the product database is up to date and easily accessible to the application.
          
          ## Mercado Libre contingency
          
          The Contingency Table, also known as the Axado Table, is a carrier template that can be uploaded directly from Mercado Libre. Its main function is to act as a backup plan in case the integrator's endpoint or URL fails. In other words, it is a security tool designed to keep the sellers' operation running even when unexpected problems arise.  
          Here are some criteria to take into account:
          
          - Initial requirement: MELI's Commercial Advisor will request the Contingency Table from the seller when activating the integration with the dynamic freight integrator.
          - Seller responsibility: the seller must complete and keep this table updated with the values both in the integrator and in MELI.
          - Establish freight rules: it is recommended that the seller establishes clear freight rules, such as zero cost for nearby locations to optimize delivery.
          - Easy update: if the seller wants to update the table, they can do so from the “My profile” section, then “Orders”, “Selling preferences” and finally “Carriers”.
          
          In addition, we attach a breakdown by country along with a reference link to the Model Contingency Table:
          
          Country Details Link Brazil Zip code [https://www.mercadolivre.com.br/transportadoras/config](https://www.mercadolivre.com.br/transportadoras/config) Argentina Zip code [https://www.mercadolibre.com.ar/transportadoras/config](https://www.mercadolibre.com.ar/transportadoras/config) México Zip code [https://www.mercadolibre.com.mx/transportadoras/config](https://www.mercadolibre.com.mx/transportadoras/config) Chile Region / Commune [https://www.mercadolibre.cl/transportadoras/config](https://www.mercadolibre.cl/transportadoras/config) Colombia Department / Township [https://www.mercadolibre.com.co/transportadoras/config](https://www.mercadolibre.com.co/transportadoras/config) Perú Department / Province or District [https://www.mercadolibre.com.pe/transportadoras/config](https://www.mercadolibre.com.pe/transportadoras/config) Uruguay Department / Township [https://www.mercadolibre.com.uy/transportadoras/config](https://www.mercadolibre.com.uy/transportadoras/config)
          
          Important:
          
          To avoid errors while loading the Contingency Table, it is important to follow these recommendations:
          
          - Please note that the carriers registered in Mercado Libre follow the code scheme 16 for sellers from Brazil and 17 for other countries, as established in the Contingency Table.
          - Verify the extension of the file: make sure that the file has the right extension according to Mercado Libre’s model.
          - Maintain the names of the pages: do not change the names of the pages of the template that will be loaded. Everything must match the original model. In addition, no pages can be removed.
          - Keep headers: do not change the headers of the file. Verify that the structure of the worksheet is the same as in the model.
          - Validate information: Verify that the zip codes are correct. Pay attention to capitalization when referring to departments, cities, communities, etc.