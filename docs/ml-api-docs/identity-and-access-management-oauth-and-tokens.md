# Identity and Access Management (OAuth and Tokens)

**Tags:** Identity,and,Access,Management,(OAuth,and,Tokens)
**Created:** 2026-04-06T14:56:23Z
**Last Updated:** 2026-04-06T15:29:03Z

---

## Identity and access management

### OAuth and token management

The gateway to the seller's experience is the OAuth 2.0 protocol, the standard for authorization on open platforms that guarantees appropriate access to our customers' information.

**By using this protocol, the integrator ensures that the seller never has to share their password directly, reducing the risk of identity theft.**

Mercadolibre provides a unique authentication and authorization mechanism to access the ecosystem APIs on behalf of a Seller. However, it is necessary for the integrating application to implement its own strong authentication and authorization controls, which guarantee that information can be managed legitimately and securely.

### Application credentials

Ensure at all times that the credentials of the integrating application (Client\_ID, Client\_Secret, Access\_token and refresh\_token) **are stored securely, encrypted at rest and with restricted access.**

## Token and credential protection

MercadoLibre access tokens allow operating on behalf of the seller. A compromised token gives full access to their account: orders, listings, messages, buyer data, among other sensitive data.

### Secure storage

- **Encryption in database:** encrypt Access Tokens using an encryption key ideally located in a key manager (secure vault), avoiding its storage in code or configuration files, and using AES-256 encryption algorithm for storage in the database.
- **Log sanitization:** pay special attention to logs, ensuring they are sanitized and do not record tokens or confidential connection information. Avoid logging complete objects from code that may contain PII data or Secrets.
- **In headers, not in URLs:** tokens must always travel via headers and not query strings.

Below we show you what insecure vs secure storage looks like, so you can identify which situation your application is in:

### In the database

❌ **INCORRECT – Unencrypted token:**

```
           TABLE: seller_tokens

  +------------------+------------------------------------------+
  | seller_id        | access_token                             |
  +------------------+------------------------------------------+
  | 12345            | APP-1234567890-abcdef-123456...          |
  | 67890            | APP-0987654321-fedcba-987654...          |
  +------------------+------------------------------------------+

Problem: If your database is hacked, they have all the tokens in plain text. They can access ALL of your sellers' accounts.
```

✅ **CORRECT – Token encrypted with AES-256:**

```
           TABLE: seller_tokens

  +------------------+------------------------------------------+
  | seller_id        | access_token_encrypted                   |
  +------------------+------------------------------------------+
  | 12345            | gAAAAABl2K8xQ7N...[encrypted data]       |
  | 67890            | gAAAAABl2K9yR8M...[encrypted data]       |
  +------------------+------------------------------------------+

The encryption key is in a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.),
NOT in the code or in the same database.

Result: Even if the DB is hacked, the tokens are useless without the key.
```

### In the code

❌ **INCORRECT - Hardcoded credentials:**

```
# config.py
CLIENT_ID = "1234567890"
CLIENT_SECRET = "AbCdEfGhIjKlMnOpQrStUvWxYz"  # DANGER!

Problems:
- Anyone with access to the code can see the credentials
- If you push to GitHub, they are publicly exposed
- If a developer leaves, they take the credentials with them
```

✅ **CORRECT - Credentials in environment variables:**

```
# .env (this file is NEVER pushed to the repository)
CLIENT_ID=1234567890
CLIENT_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz

# config.py (this one is pushed)
import os
CLIENT_ID = os.environ.get("CLIENT_ID")
CLIENT_SECRET = os.environ.get("CLIENT_SECRET")

# .gitignore (ensures .env is not pushed)
.env
.env.local
.env.*.local
```

### In logs

❌ **INCORRECT - Token visible in logs:**

```
[2026-01-15 10:30:45] INFO:  Connecting with seller 12345
[2026-01-15 10:30:45] DEBUG: Token: APP-1234567890-abcdef-123456789...
[2026-01-15 10:30:45] INFO:  Fetching orders...
[2026-01-15 10:30:46] DEBUG: Headers: {"Authorization": "Bearer APP-1234567890..."}

Problem: Anyone with access to logs can see the tokens.
```

✅ **CORRECT - Token sanitized in logs:**

```
[2026-01-15 10:30:45] INFO:  Connecting with seller 12345
[2026-01-15 10:30:45] DEBUG: Token: [REDACTED]
[2026-01-15 10:30:45] INFO:  Fetching orders...
[2026-01-15 10:30:46] DEBUG: Headers: {"Authorization": "Bearer [REDACTED]"}

Or better: Do not log tokens or authorization headers at all.
```

### In transit / transmission

❌ **INCORRECT - Token in URL (query string):**

```
GET https://api.mercadolibre.com/orders?access_token=APP-1234567890...

Problems:
- Remains in server logs
- Remains in browser history
- May remain in intermediate proxy logs
- Visible in the address bar
```

✅ **CORRECT - Token in header:**

```
GET https://api.mercadolibre.com/orders
Headers:
  Authorization: Bearer APP-1234567890...

Advantages:
- Does not remain in URLs
- Does not remain in history
- Harder to accidentally leak
```

### How could we verify?

**Search for hardcoded credentials in your code:**

```
# Search for hardcoded client_secret
grep -rn "client_secret.*=.*['\"]" --include="*.py" --include="*.js" --include="*.ts" .

# Search for MercadoLibre token patterns
grep -rn "APP-[0-9]" --include="*.py" --include="*.js" --include="*.ts" .
```

**Verify that .env is in .gitignore:**

```
cat .gitignore | grep ".env"
```

**Review logs for tokens or confidential info:**

```
grep -rn "APP-" logs/  # Adjust path according to your project
grep -rn "access_token" logs/
```

## Token renewal and revocation

Token revocation is not just a mechanism used when things go wrong. It is a fundamental part of the credential lifecycle: tokens must be renewed periodically, deleted when no longer needed, and revoked immediately upon any suspicion of compromise.

**Good revocation management protects both your application and the sellers who trust you.**

That is why it is necessary to:

- Implement automatic refresh by revoking before the access\_token expires.
- Handle refresh errors: if the refresh fails, re-authorization must be requested from the seller.
- Securely store the new refresh token generated on each revocation.
- Stored tokens must be deleted if the seller disconnects their app from their account.
- In case of suspected token compromise, tokens must be revoked via API and re-authorization requested.
- In case an employee leaves the company, credentials they may have known must be audited and rotated.

Below we show you what incorrect and correct token handling looks like:

### Token revocation

❌ **INCORRECT - Not handling expiration:**

```
1. You get the access_token
2. You save it
3. You use it forever until it fails
4. When it fails, you show an error to the user

Problem: The user experiences unexpected errors.
```

✅ **CORRECT - Automatic refresh:**

```
1. You get the access_token (valid for 6 hours)
2. You save the access_token AND refresh_token
3. Before it expires (e.g.: at 5 hours), you refresh automatically
4. You save the new access_token and refresh_token
5. The user never sees an expired token error
```

### A visual example below:

![Automatic token refresh diagram](https://http2.mlstatic.com/storage/developers-site-cms-admin/131603508517-Captura-de-pantalla-2026-04-06-a-las-4.26.38-p.-m..png)

### Revocation scenarios

**Scenario** **Required action** Seller disconnects from your app Delete all stored tokens for that seller Suspected compromise Revoke tokens via API and request re-authorization Employee leaves the company Audit and rotate all credentials they knew Refresh error Request re-authorization from the seller

## References

- [OWASP Password Storage:](https://owasp.org/www-community/attacks/password_cracking) how to store passwords securely.
- [OWASP Secrets Management:](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) comprehensive guide to secrets and credentials management.
- [CWE-312:](https://cwe.mitre.org/data/definitions/312.html) technical documentation of the exact problem (storing tokens without encryption). Useful for understanding the risk.
- [OWASP TOP 10 - A02:2021 Cryptographic Failures:](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/) high-level reference on cryptographic failures.

## Glossary

**Term** **Meaning** **Access token** Temporary credential that allows your app to act on behalf of the seller **Refresh Token** Long-lived token used to obtain new access tokens without asking the seller for authorization again **Encryption at rest** Encrypting data when it is stored (in database or disk), not only when it travels over the network **Plain text** Unencrypted data, readable by anyone who accesses it **Hardcoding** Writing credentials directly in the source code (bad practice) **Environment variables** Way to pass sensitive configuration to the program without writing it in the code **Secrets Manager** Specialized service for storing and managing credentials securely (e.g.: HashiCorp Vault, AWS Secrets Manager) **Credential rotation** Changing tokens/passwords periodically to limit the impact if they were compromised **.env** File where environment variables are stored locally. Must never be pushed to the repository **.gitignore** File that tells Git which files should NOT be pushed to the repository (like .env)

**Next**: [Secure authentication](/en_us/secure-authentication?nocache=true).