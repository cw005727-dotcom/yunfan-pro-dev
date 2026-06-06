# Test users

## With this tutorial guide you on how to create a test user, buy, sell between test users and simulate the same actions allowed for a real user.

**Tags:** Global Selling ,Start Testing,Test Users
**Created:** 2020-11-24T21:55:51Z
**Last Updated:** 2026-01-22T20:00:58Z

---

## Start testing

At Mercado Libre, **we don't have a test or sandbox environment**. Instead, we provide test users to test directly in production. The advantage of working with a test user is that you can simulate the same actions allowed for real users—publish, update data, ask questions, answer, buy, sell, etc.—among test users, **without paying charges, receiving penalties, or affecting a real user's reputation**.

Once you get your **production account access token**, you can create a global and marketplace test user and simulate end-to-end operations. Learn more about the [type of users](https://global-selling.mercadolibre.com/devsite/manage-users-global-selling).

Important:

- **API Update:** The **country\_id** parameter is now **required** when creating Global Test Users (**CBT**). Requests without this field will return a **400 Bad Request** error.
- All test operations must be made with test users. Personal accounts should not be used for testing.
- **Critical:** Once the test user is created, save its credentials immediately. **We do not have an endpoint to retrieve test users or their credentials after creation.**
- All **site\_id** and **country\_id** values must be in **UPPERCASE** (case-sensitive).

## Send access token via header

For enhanced security, we recommend sending your access token via header when making API calls. This prevents your token from appearing in server logs or browser history.

Example:

```javascript
curl -H 'Authorization: Bearer $PROD_ACCESS_TOKEN' \
https://api.mercadolibre.com/users/me
```

## Create a global test user

Create a test user for Global Selling (Cross-Border Trade) operations. You must specify both the **site\_id** (always **"CBT"**) and the **country\_id** (**"US"** for United States or **"CN"** for China).

**Note:** You must use the Access Token of your real (production) account to create this user.

Request (US Origin):

```javascript
curl -X POST -H 'Authorization: Bearer $PROD_ACCESS_TOKEN' -H "Content-Type: application/json" https://api.mercadolibre.com/users/global_selling_test_user -d
{
    "site_id": "CBT",
    "country_id": "US"
}
```

Request (China Origin):

```javascript
curl -X POST -H 'Authorization: Bearer $PROD_ACCESS_TOKEN' -H "Content-Type: application/json" https://api.mercadolibre.com/users/global_selling_test_user -d
{
    "site_id": "CBT",
    "country_id": "CN"
}
```

Response:

```javascript
{
    "id": 2608734521,
    "nickname": "TESTGSELL2608734521",
    "password": "qatest9132",
    "site_status": "active",
    "email": "test_user_gs_2608734521@testuser.com"
}
```

On the response you get the following fields:

- **id**: The unique identifier of the created test user.
- **nickname**: The username assigned to the test user.
- **password**: The password for the test user account. Store this securely; it cannot be recovered.
- **site\_status**: The current status of the user. Returns `"active"` upon successful creation.
- **email**: The email address assigned to the test user.

## Create a marketplace test user

In addition, you can create marketplace test users, in order to be able to do end-to-end tests, buying and selling between these.

Important:

You must use the **Access Token of your real (production) account** to create these users. You cannot use the token of a previously created Test User to create another Test User; doing so will result in a **403 Forbidden** error.

Supported marketplaces: **MLA** (Argentina), **MLB** (Brazil), **MLC** (Chile), **MCO** (Colombia), **MLM** (Mexico), **MPE** (Peru).

Example:

```javascript
curl -X POST -H 'Authorization: Bearer $PROD_ACCESS_TOKEN' -H "Content-Type: application/json" https://api.mercadolibre.com/users/test_user -d
{
    "site_id": "MLM"
}
```

Response:

```javascript
{
    "id": 2608891234,
    "nickname": "TESTXYZ2608891234",
    "password": "qatest4521",
    "site_status": "active",
    "email": "test_user_2608891234@testuser.com"
}
```

On the response you get the following fields:

- **id**: The unique identifier of the created test user.
- **nickname**: The username assigned to the test user.
- **password**: The password for the test user account. Store this securely; it cannot be recovered.
- **site\_status**: The current status of the user. Returns `"active"` upon successful creation.
- **email**: The email address assigned to the test user.

## Possible errors

The following errors may occur when creating test users:

### Global Test User errors (POST /users/global\_selling\_test\_user):

Status Error Message Solution 400 bad\_request country\_id is required Include `country_id` with value `"US"` or `"CN"`. 400 bad\_request site\_id is required Include `site_id` parameter in the request body. 400 bad\_request invalid site\_id Use `"CBT"` as site\_id. Must be uppercase. 400 bad\_request site\_id cannot be null Provide a valid string value, not `null`. 400 bad\_request site\_id cannot be empty Provide a non-empty string value. 400 bad\_request invalid site\_id type Ensure site\_id is a string, not a number. 400 bad\_request Malformed JSON Verify the request body contains valid JSON syntax. 400 bad\_request Invalid request body Include a valid JSON body in the request. 403 forbidden Invalid client.id Verify your access token is valid and not expired.

### Marketplace Test User errors (POST /users/test\_user):

Status Error Message Solution 400 bad\_request site\_id is required Include `site_id` parameter in the request body. 400 bad\_request invalid site\_id Use a valid site\_id (MLA, MLB, MLC, MCO, MLM, MPE). Must be uppercase. 400 bad\_request invalid clientID format Verify your access token format is correct.

## Considerations

When working with test users, you need to take into account the following considerations:

- Once you have created the test user for a global seller, you have to access global-selling to [configure the marketplace account's](https://global-selling.mercadolibre.com/devsite/manage-users-global-selling).
- You can create up to 10 test users with your Mercado Libre account and these cannot be eliminated by the user, nor by Mercado Libre.
- Test users won't be active for too long, but once they expire, you can create new ones.
- **Test items must be titled "Test item - Do not offer"** (Test Item - Please DO NOT BID) to clearly identify them as test listings.
- List under the "Others" category as much as possible.
- **Never publish with "gold" or "gold\_premium" listing types** to prevent your test items from appearing on the homepage.
- Test users can simulate operations only with listings from other test users: they can only buy, sell, ask questions, etc., in test list, created by test accounts.
- Test users showing no activity (buy, ask, publish, etc.) during 60 days are immediately removed.
- Test items are removed regularly.
- The email's validation code for test users will be equal to the last digits of the user ID and can have 4 or 6 digits. For example, for user ID 653764425, the code could be 764425.
- All **site\_id** and **country\_id** values are case-sensitive and must be in **UPPERCASE**.

Test user blocked?

If your test user is incorrectly blocked, contact support for the corresponding marketplace.

## Buy and sell between test users

Remember that tests on the platform and all transactions must be done with test users. In addition, personal accounts should not contain ads. If you want to simulate purchases between test users, you could use [our test cards](https://www.mercadopago.com/developers/en/docs/checkout-api/integration-test/test-cards). Remember that testing on the platform and all transactions must be done between test users. In addition, personal accounts must not contain listings for this purpose.

Notes:

- The data to be uploaded is fictitious and, for security reasons, we do not add the names of the banks on the cards available for testing purposes.
- When you access the test card link, you will need to change the URL to the URL of the country you are in. Please note that the link will only be available for countries where Mercado Pago is active.
- To test different payment results, fill in the desired payment status in the cardholder's first and last name when making the purchase. For example, if you want the payment to be approved, you must enter "APRO APRO".

**Next**: [Application and permissions](https://global-selling.mercadolibre.com/devsite/application-manager-gs).