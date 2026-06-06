# Authentication and Authorization

**Tags:** Authentication,Authorization,Revocation ,Revocation of authorization,revoking 
**Created:** 2018-06-27T12:01:32Z
**Last Updated:** 2026-01-19T14:12:49Z

---

## Authentication and Authorization

To start using our resources you need to develop the processes of Authentication and Authorization. This way, you can work with the private resources for each user once authorization is granted by your application.

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

Learn more about [the security of your development](/en_us/authorization-and-token-recommendations).

## Authentication

The process of authentication is used to verify a person’s identity based on one or several factors, ensuring the sender’s data are correct. Although there are different methods, in Mercado Libre we authenticate ourselves by entering our username and password.

## Authorization

Authorization is the process whereby we allow someone or something to access private resources. In this process, it must be defined which resources and operations can be performed (“read only” or “read and write”).

### How do we obtain authorization?

Via the OAuth 2.0 Protocol, which is one of the most widely used protocols in open platforms (Twitter, Facebook, etc.) and a secure method to work with private resources.

This protocol offers:

- Confidentiality, users will never have to disclose their keys.
- Integrity, private data can only be viewed by applications with permits to do so.
- Availability, data will always be available on a need basis.

The operation protocol is called Grant Types, and the one used is The Authorization Code Grant Type (Server Side).

Below, we will show you how to work with Mercado Libre resources using Authorization Code Grant Type.

## Server side

The Server Side flow is better suited for applications executing the server-side code. Such as, applications developed in Java, Grails, Go, etc.

To sum up, the process you will be doing is the following:

[![flujo_serverside_eng](https://http2.mlstatic.com/storage/developers-site-cms-admin/DevSite/315200635235-flujo-serverSide-EN.jpg)](https://http2.mlstatic.com/storage/developers-site-cms-admin/s3/flujo_serverside_eng.jpg)

**References**

1. Redirects the app to Mercado Libre.
2. You do not have to worry about the authentication of the users of Mercado Libre, our platform will take care of it!
3. Authorization site.
4. POST to exchange the authorization code for an access token.
5. The Mercado Libre API exchanges the authorization code for an access token.
6. You can now use the access token to make requests to our API and obtain access to the private resources of the user.

### Step by step:

## 1. Performing the authorization

1.1. Authenticate yourself with your Mercado Libre username:

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/DevSite/335694202856-ingreso-email.png)

Notes:

\- If you want to use a test user, enter [here](https://developers.mercadolibre.com.ar/es_ar/realiza-pruebas#Crea-un-usuario-de-test).  
\- Remember that the user that logs in has to be a manager, so that the obtained access\_token grants the sufficient permits to make the queries.  
\- If the user is operator/partner, the grant will be invalid.  
\- The following events may cause an access\_token to become invalid before its expiration time:

- User changing his/her password.
- An application refreshing its App Secret.
- A user revoking permissions to your application.
- If you do not use the application with any request at https://api.mercadolibre.com/ for 4 months.

Important:

The redirect\_uri must match exactly what is registered in your application settings to avoid access errors; the url cannot contain variable information.

1.2. Put the following URL in your browser window to get authorization:

```javascript
https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=$APP_ID&redirect_uri=$YOUR_URL&code_challenge=$CODE_CHALLENGE&code_challenge_method=$CODE_METHOD
```

In the example we use the URL for Argentina (MLA) but if you are working in other countries remember to change the .com.ar for the domain of the corresponding country. See [the list of countries we operate in](https://api.mercadolibre.com/sites).

### Parameters

**response\_type**: Sending the value **code** you will obtain an access token that will allow you to interact with Mercado Libre.  
**redirect\_URI**: The attribute YOUR\_URL is completed with the value added when the app was created. It must be exact to the one you configured and cannot have variable information.  
![](https://http2.mlstatic.com/storage/developers-site-cms-admin/DevSite/309251123628-redirect-auth.png) **client\_id**: Is the APP ID of the application that you created.  
For added security, we recommend that you include the state parameter in the authorization URL to ensure that the response belongs to a request initiated by your application.

**State**: In case you do not have a secure random identifier, you can create it using SecureRandom and it must be unique for each request.

The redirect URL will be:

```javascript
https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=$APP_ID&state=$RANDOM_ID&redirect_uri=$REDIRECT_URL
```

A proper use for the **state** parameter is to send a state that you need to know when the URL set in the redirect\_uri is called. Remember that the redirect\_uri must be a static URL, so if you are considering sending parameters on this URL use the state parameter to send this information, otherwise your request will fail because the redirect\_uri does not exactly match the one configured in your application.

The following parameters are optional and only apply if the application has **PKCE** (Proof Key for Code Exchange) flow enabled. Hhowever, when this option is activated, sending the field becomes mandatory:

**code\_challenge:**: ódigo de verificación generado a partir de code\_verifier y cifrado con code\_challenge\_method.

**code\_challenge\_method:**: method used to generate the code challenge. The following values are currently supported:

- S256: specifies that the code\_challenge is encrypted using the SHA-256 encryption algorithm.
- plain: the same code\_verifier is sent as code\_challenge. For security reasons it is not recommended to use this method.

The redirect\_uri has to match **exactly** what was entered when the application was created to avoid getting the following error, cannot contain variable information:

1.3. As a final step, the users will be redirected to the following screen where they will be requested to associate the application with their account.

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

1.4. If you get the error message: **Sorry, the application cannot connect to your account.** The following considerations must be made:

![](https://http2.mlstatic.com/storage/developers-site-cms-admin/209296477720-Error-autenticaci-n.png)

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

## 3. Refresh token

Keep in mind that the access token will be valid for a period of 6 hours from the moment it was generated. To ensure you can work for an extended period of time and avoid the need to constantly request the user to log in again to generate a new token, we provide the solution to work with a refresh token. Also, remember that the refresh\_token is for one-time **use only and you will receive a new one at each token update process**.

Every time you make the call to exchange the code for an access token, you will also get a refresh\_token, that you will have to save to exchange it for a new access token once it expires.  
To renew your access token you must make the following request:

```javascript
curl -X POST \
-H 'accept: application/json' \
-H 'content-type: application/x-www-form-urlencoded' \
'https://api.mercadolibre.com/oauth/token' \
-d 'grant_type=refresh_token' \
-d 'client_id=$APP_ID' \
-d 'client_secret=$SECRET_KEY' \
-d 'refresh_token=$REFRESH_TOKEN'
```

### Parameters

**grant\_type**: refresh\_token It shows that the desired operation is to refresh a token.  
**refresh\_token**: Refresh token from the approval step previously saved.  
**client\_id**: Is the APP ID of the application that you created.  
**client\_secret**: Secret Key generated when the app was created.

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

## Error codes reference

**invalid\_client**: invalid client\_id and/or client\_secret provided.  
**invalid\_grant**: the provided authorization grant is invalid, expired or revoked; the client\_id or redirect uri do not match the original, or refresh\_token is invalid, it expires or the format is revoked, the format is sent in an incorrect stream, it belongs to another client or the redirect\_uri used does not correspond to the authorization stream that is configured in your application, or user (seller) may be required to include data and/or documents.  
**invalid\_scope**: the requested scope is invalid, unknown or malformed. The values allowed for parameter scope are: “offline\_access”, “write”, “read”.  
**invalid\_request**: the request is missing a required parameter, includes an unsupported parameter or parameter value, there is some duplicated value or is otherwise malformed.  
**unsupported\_grant\_type**: the values allowed for grant\_type are “authorization\_code” or “refresh\_token”.  
**local\_rate\_limited (429)**: due to excessive calls, the request is temporarily rejected. Please try again in a few seconds.  
**forbidden (403)**: the request is not authorized to access this resource. It could be possibly using the token of another user, or in the case of a grant, the user does not have access to the Mercado Libre URL of their country (.ar, .br, .mx, etc.) and should check that their connection or browser is functioning correctly for MELI domains.

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

- **Expiration Tim:** after the [refresh\_token](/en_us/authentication-and-authorization?nocache=true#Refresh-token) expires (6 months), it will automatically expire, and you will need to re-flow to get a new refresh\_token.
- **Revocation of authorization:** by revoking the authorization between the seller's account and your application (either by the integrator or the seller), the access\_token and refresh\_token will be invalidated. You can check the users who have no grant with your application from the "Manage Permissions" option (in My Applications dashboard), or by using the call to access the [users who have granted licenses to your application.](https://developers.mercadolibre.com.ar/es_ar/gestiona-tus-aplicaciones#Usuarios-que-le-dieron-permisos-a-tu-aplicaci%C3%B3n)
- **Internal revocation:** there are some internal flows that cause users' credentials to be deleted, preventing integrators from being able to continue working on behalf of vendors; in these cases, it is necessary to complete the authorization/authentication flow again. These flows are triggered primarily by deletion of user sections. The reasons are various, but the most common are password change, device unlinkage, or fraud. Learn how to revoke a user's authorization to your application.

Important:

Keep in mind that for this last stream, we have only detailed some examples, not all available cases.

**Siguiente**: [Consulta API Docs](https://developers.mercadolibre.com.ar/es_ar/api-docs-es).