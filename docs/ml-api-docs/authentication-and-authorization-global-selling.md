# Authentication and Authorization

**Tags:** Authentication,and,Authorization
**Created:** 2020-02-21T16:12:35Z
**Last Updated:** 2026-04-01T12:43:56Z

---

## Authentication and Authorization

To start using our resources, you need to develop the processes of Authentication and Authorization to get access tokens. This way, you can work with the private resources for each user once authorization is granted by your application.

## Send access token by header

For security, you must send the access token by header every time you make calls to the API. The header for the Authorization is:

```javascript
curl -H 'Authorization: Bearer APP_USR-12345678-031820-X-12345678'
```

And for example, making a GET to the /users/me resource it would be:

```javascript
curl -H 'Authorization: Bearer APP_USR-12345678-031820-X-12345678' \
https://api.mercadolibre.com/users/me
```

Learn more about [the security of your development](devsite/authorization-and-token-best-practices).

## Authentication

Is used to verify a person's identity based on one or several factors, ensuring the sender's data are correct. Although there are different methods, in Global Selling we authenticate ourselves by entering our username and password.

## Authorization

Is the process whereby we allow someone or something to access private resources. In this process, it must be defined which resources and operations can be performed ("read only" or "read and write"). **How get authorization?** Via the OAuth 2.0 Protocol, which is one of the most widely used protocols in open platforms (Twitter, Facebook, etc.) and a secure method to work with private resources. This protocol offers: confidentiality, integrity and availability.

### How do we obtain authorization?

Via the OAuth 2.0 Protocol, which is one of the most widely used protocols in open platforms (Twitter, Facebook, etc.) and a secure method to work with private resources.

This protocol offers:

- Confidentiality, users will never have to disclose their keys.
- Integrity, private data can only be viewed by applications with permits to do so.
- Availability, data will always be available on a need basis.

The operation protocol is called Grant Types, and the one used is The Authorization Code Grant Type (Server Side).

Below, we will show you how to work with Mercado Libre resources using Authorization Code Grant Type.

## Server side flow

In Mercado Libre we are using Authorization Code Grant Type. Is better suited for applications executing the server-side code such as, applications developed in Java, Grails, Go, etc. The process you will be performing is as follows:

![flujo_serverside](https://http2.mlstatic.com/storage/developers-site-cms-admin/141286798674-Captura-de-Tela-2025-12-15-a-s-14.38.45.png)

## Get access token

### 1. Login and Authenticate with your Mercado Libre account

**References**

1. Redirects the app to Mercado Libre.
2. You do not have to worry about the authentication of the users of Mercado Libre, our platform will take care of it!
3. Authorization site.
4. POST to exchange the authorization code for an access token.
5. The Mercado Libre API exchanges the authorization code for an access token.
6. You can now use the access token to make requests to our API and obtain access to the private resources of the user.

You can use the same user who created the application to test the flow.

![login_screen](https://http2.mlstatic.com/storage/developers-site-cms-admin/141286798674-Captura-de-Tela-2025-12-15-a-s-14.38.53.png)

Notes:

\- You can also [use test users](https://global-selling.mercadolibre.com/devsite/start-testing-global-selling).  
\- Remember that the user who logs in must be a manager, so the obtained access\_token has sufficient permissions to perform the requests.  
\- If the user is an operator or partner, the grant will be invalid.  
\- The following events may cause an access\_token to become invalid before its expiration time:

- The user changes their password.
- The application refreshes its App Secret.
- The user revokes permissions to your application.
- The application is not used to make any request to https://api.mercadolibre.com/ for 4 months.

Important:

The redirect\_uri must match exactly what is registered in your application settings to avoid access errors; the url cannot contain variable information.

### 2. Place the URL in your browser to get authorization

**APP\_ID:** id of application.  
**YOUR\_URL:** the redirect URI that you add when creating the app.

```javascript
https://global-selling.mercadolibre.com/authorization?response_type=code&client_id=$APP_ID&redirect_uri=$YOUR_URL
```

You will receive the following parameters are optional and only apply if the app has enabled the **PKCE** flow (Proof Key for Code Exchange):

- **code\_challenge:** verification code generated from code\_verifier and encrypted with code\_challenge\_method.
- **code\_challenge\_method:** method used to generate the code challenge. The following values are currently supported:
  
  - S256: specifies that the code\_challenge is using the SHA-256 encryption algorithm.
  - plain: the same code\_verifier is sent as code\_challenge. For security reasons, it is not recommended to use this method.

The redirect\_uri has to match exactly what is registered in your application settings to avoid access errors; the URL cannot contain variable information.

![redirect_uri_error](https://http2.mlstatic.com/storage/developers-site-cms-admin/141286798674-Captura-de-Tela-2025-12-15-a-s-14.39.05.png)

### 3. Users will be redirected to the following screen to accept associate the application with their account

![authorization_screen](https://http2.mlstatic.com/storage/developers-site-cms-admin/141286798674-Captura-de-Tela-2025-12-15-a-s-14.39.10.png)

Once they click in Authorize, you will get a confirmation message and at the URL, the parameter CODE has been added.

```javascript
http://YOUR_REDIRECT_URI?code=$TG-CODE
```

This code will be used when an access\_token needs to be generated, it will grant access to our API.

### 4. Changing the code for access token

#### Mandatory parameters

**grant\_type:** authorization\_code, it shows that the desired operation is to exchange the "code" for an access\_token.  
**client\_id:** is the APP ID of the application that you created.  
**client\_secret:** Secret Key generated when the app was created.  
**code:** The authorization code obtained in the previous step.  
**redirect\_uri:** Redirect URI set for your application.

```javascript
curl -X POST -H 'accept: application/json' -H 'content-type: application/x-www-form-urlencoded' https://api.mercadolibre.com/oauth/token?grant_type=authorization_code&client_id=$APP_ID&client_secret=$CLIENT_SECRET&code=$TG_CODE&redirect_uri=$REDIRECT_URL
```

Response:

```javascript
{
    "access_token": "APP_USR-5387223166827464-090515-8cc4448aac10d5105474e135355a8321-8035443",
    "token_type": "bearer",
    "expires_in": 10800,
    "scope": "offline_access read write",
    "user_id": 8035443,
    "refresh_token": "TG-5b9032b4e4b0714aed1f959f-8035443"
}
```

The **access\_token is valid for 6 hours from the moment it was generated.** To get more time, we recommend get **refresh token (new access\_token which is valid for 6 months).** Save it to use each time it expires. We only allow using the last refresh token generated. Additionally, remember that the refresh token is single-use, and you will receive a new one with each token refresh process.

Note:

We provided the seller with information regarding if the application is certified or not (DPP - partner level).

If we check the URL, it can be observed that the parameter CODE was added.

```javascript
https://YOUR_REDIRECT_URI?code=$SERVER_GENERATED_AUTHORIZATION_CODE
```

This Code will be used when an access token needs to be generated, it will grant access to our API.

```javascript
https://YOUR_REDIRECT_URI?code=$SERVER_GENERATED_AUTHORIZATION_CODE&state=$RANDOM_ID
```

Example:

```javascript
https://YOUR_REDIRECT_URI?code=$SERVER_GENERATED_AUTHORIZATION_CODE&state=ABC1234
```

Remember to check that value to make sure that the response belongs to a request started by your application. From Mercado Libre we do not validate this field.

Nota:

\- Consider that if the user is an operator/collaborator, you will NOT be able to grant the application. It will return the error invalid\_operator\_user\_id.

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/304395161321-operador-error.png)

1.4. If you get the error message: **The application cannot connect to Mercado Libre.** The following considerations must be made:

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/132051991442-error-conect-app-EN-CBT.png)

1. 1\. The redirect\_uri must match exactly what is registered in your application settings to avoid access errors; the url cannot contain variable information.
2. 2\. Validate that the appid token and grant are valid.
3. 3\. Make sure the seller is logging in with the main account and not a collaborator.
4. 4\. Validate that the seller has the correct KYC and that the seller is not blocked for non-compliance with policies.

## 2. Changing code for a token

The authorization code is used to exchange it for an access token.

You must perform a POST sending the parameters by BODY:

```javascript
curl -X POST \
-H 'accept: application/json' \
-H 'content-type: application/x-www-form-urlencoded' \
'https://api.mercadolibre.com/oauth/token' \
-d 'grant_type=authorization_code' \
-d 'client_id=$APP_ID' \
-d 'client_secret=$SECRET_KEY' \
-d 'code=$SERVER_GENERATED_AUTHORIZATION_CODE' \
-d 'redirect_uri=$REDIRECT_URI' \
-d 'code_verifier=$CODE_VERIFIER'
```

Response:

```javascript
{
    "access_token": "APP_USR-123456-090515-8cc4448aac10d5105474e1351-1234567",
    "token_type": "bearer",
    "expires_in": 10800,
    "scope": "offline_access read write",
    "user_id": 1234567,
    "refresh_token": "TG-5b9032b4e23464aed1f959f-1234567"
}
```

Done! You can now use the access token to make requests to our API and obtain access to the private resources of the user.

### Parameters

**grant\_type**: authorization\_code – it shows that the desired operation is to exchange the “code” for an access token.  
**client\_id**: is the APP ID of the application that you created.  
**client\_secret**: secret Key generated when the app was created.  
**code**: the authorization code obtained in the previous step.  
**redirect\_uri**: the redirect URI configured for your application cannot have variable information.

The following parameters are optional and only apply if the application has **PKCE (Proof Key for Code Exchange)** flow enabled:

**code\_verifier**: random character sequence with which the code\_challenge was generated. This will be used to verify and validate the request.

### 5. Refresh token

#### Mandatory parameters

**grant\_type:** refresh\_token It shows that the desired operation is to refresh a token.  
**refresh\_token:** Refresh token from the approval step previously saved.  
**client\_id:** Is the APP ID of the application that you created.  
**client\_secret:** Secret Key generated when the app was created.

Request:

```javascript
curl -X POST https://api.mercadolibre.com/oauth/token?grant_type=refresh_token&client_id=$APP_ID&client_secret=$SECRET_KEY&refresh_token=$REFRESH_TOKEN
```

Response:

```javascript
{
    "access_token": "APP_USR-5387223166827464-090515-b0ad156bce700509ef81b273466faa15-8035443",
    "token_type": "bearer",
    "expires_in": 10800,
    "scope": "offline_access read write",
    "user_id": 8035443,
    "refresh_token": "TG-5b9032b4e4b0714aed1f959f-8035443"
}
```

The response includes a new access token which is valid for 6 more hours and a new REFRESH\_TOKEN that you will need to save to use each time it expires.

Important:

\- We only allow using the last REFRESH\_TOKEN generated for the exchange.  
\- The REFRESH\_TOKEN can only be used once and only by the client\_id it is associated with, after being used it will become invalid.  
\- To optimize the processes of your development, we suggest you to renew your access token only when it expires.

## Errors

Error Description invalid\_client Invalid client\_id and/or client\_secret provided. invalid\_grant The provided authorization grant is invalid, expired or revoked; the client\_id or redirect uri do not match the original. The authorization\_code or refresh\_token do not exist, or have been deleted. invalid\_scope The requested scope is invalid, unknown or malformed. The values allowed for parameter scope are: "offline\_access", "write", "read". invalid\_request The request is missing a required parameter, includes an unsupported parameter or parameter value, there is some duplicated value or is otherwise malformed. unsupported\_grant\_type The values allowed for grant\_type are "authorization\_code" or "refresh\_token". forbidden The call is not authorized to access this resource. It could be possibly using the token of another user.

## Error Invalid Grant

In the flow to refresh token or authorization code it is possible to get the error **invalid\_grant** with the message "Error validating grant. Your refresh token or authorization code may be expired or has already been used."

```javascript
{
    "error_description": "Error validating grant. Your authorization code or refresh token may be expired or it was already used",
    "error": "invalid_grant",
    "status": 400,
    "cause": []
}
```

This message indicates that the authorization\_code or refresh\_token do not exist, or have been deleted. Some reasons are:

- **Expiration Tim:** after the [refresh\_token](https://global-selling.mercadolibre.com/devsite/authentication-and-authorization-global-selling?nocache=true#:~:text=validate%20the%20request.-,5.%20Refresh%20token,-Mandatory%20parameters) expires (6 months), it will automatically expire, and you will need to re-flow to get a new refresh\_token.
- **Revocation of authorization:** by revoking the authorization between the seller's account and your application (either by the integrator or the seller), the access\_token and refresh\_token will be invalidated. You can check the users who have no grant with your application from the "Manage Permissions" option (in My Applications dashboard), or by using the call to access the [users who have granted licenses to your application.](https://global-selling.mercadolibre.com/devsite/application-manager-gs#Users-that-granted-permissions-to-your-application)
- **Internal revocation:** there are some internal flows that cause users' credentials to be deleted, preventing integrators from being able to continue working on behalf of vendors; in these cases, it is necessary to complete the authorization/authentication flow again. These flows are triggered primarily by deletion of user sections. The reasons are various, but the most common are password change, device unlinkage, or fraud. Learn how to [revoke a user's authorization to your application](https://global-selling.mercadolibre.com/devsite/application-manager-gs#Users-that-granted-permissions-to-your-application).

Important:

Keep in mind that for this last stream, we have only detailed some examples, not all available cases.

## Revokes types

- **Revocation of authorization:** by revoking the authorization between the seller's account and your application (either by the integrator or the seller), the access\_token and refresh\_token will be invalidated. You can check the users who have no grant with your application from the "Manage Permissions" option (in My Application's dashboard), or by using the call to access the [users who have granted licenses to your application.](https://global-selling.mercadolibre.com/devsite/application-manager-gs#Users-that-granted-permissions-to-your-application)
- **Internal revocation:** there are some internal flows that cause users' credentials to be deleted, preventing integrators from being able to continue working on behalf of vendors; in these cases, it is necessary to complete the authorization/authentication flow again. These flows are triggered primarily by deletion of user sections. The reasons are various, but the most common are password change, device unlinkage, or fraud. [Learn how to revoke a user's authorization to your application.](https://global-selling.mercadolibre.com/pampa/profile)

Important:

For this last stream, we have only detailed some examples, not all available cases.

**Next:** [Users](https://global-selling.mercadolibre.com/devsite/manage-users-global-selling)