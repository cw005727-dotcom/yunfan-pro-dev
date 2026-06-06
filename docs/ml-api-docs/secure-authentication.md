# Secure Authentication

**Tags:** Secure,Authentication
**Created:** 2026-04-06T14:58:17Z
**Last Updated:** 2026-04-06T15:00:46Z

---

## Secure authentication

The integrating application may have its own users (operators, administrators, sub-accounts) who access data from multiple Mercado Libre sellers. **Weak authentication means:**

- Unauthorized access.
- Identity impersonation.
- Credential theft.
- Access to Mercado Libre user data.

That is why we recommend the following practices to keep in mind so that your authentication system is secure and robust:

### Secure password policy

- **Complexity:** uppercase, lowercase, numbers and symbols.
- **Length:** minimum 12 characters.
- **Verification against lists (Denylist):** reject common known passwords or those that follow patterns related to the user.
- **Secure storage is fundamental:** use HASH with Argon2 or bcrypt (never plain text or MD5/SHA1).

A weak password is the easiest entry point for an attacker. Compare these examples to evaluate your current policy:

#### Password examples:

❌ **WEAK PASSWORDS (do not allow):**

```
123456          -> Too simple
password        -> Common word
admin123        -> Predictable pattern
company2026     -> Context-related
qwerty          -> Keyboard pattern
```

✅ **STRONG PASSWORDS (require):**

```
Minimum 12 characters
+ Uppercase: A-Z
+ Lowercase: a-z
+ Numbers: 0-9
+ Symbols: !@#$%^&*
Valid example: "K9#mPx$vL2@nQ4"
```

### Password storage

❌ **INCORRECT:**

```
Plain text:
  password = "MyPassword123"

MD5 (broken):
  password = "5f4dcc3b5aa765d61d8327deb882cf99"
  -> Decrypted in seconds with rainbow tables

SHA1 (weak):
  password = "cbfdac6008f9cab4083784cbd1874f76618d2a97"
  -> Also vulnerable to rainbow tables
```

✅ **CORRECT:**

```
bcrypt:
  password = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.oUy..."
  -> Includes automatic salt
  -> Designed to be slow (resistant to brute force)

Argon2 (recommended):
  password = "$argon2id$v=19$m=65536,t=3,p=4$..."
  -> Resistant to GPU attacks
```

### Forgot password flow

The "Forgot Password" process is a common attack vector when not implemented with adequate controls. It is necessary to validate the security of the password recovery flow, verifying aspects such as:

- Single-use links with short expiration.
- Inability to reuse tokens.
- Protection against brute force.
- Integration with a second authentication factor (2FA) to validate user identity.

### How to verify?

1. Review your application's code in the registration and password change functionality.
2. Look for the hash function that was used.

**If you find:**

**Result** **Evaluation** `bcrypt.hash()` or `argon2.hash()` ✅ Secure `hashlib.md5()` or `hashlib.sha1()` ❌ Insecure, change as soon as possible. Password stored without hash ❌ Critical, change immediately

## Multi-factor authentication (MFA)

Using MFA is crucial because it adds a layer of defense that very effectively neutralizes account attacks, even if the password has been stolen or leaked. By requiring a second proof of identity that only the user possesses (TOTP, security keys, push notifications or biometrics), it prevents account hijacking through phishing or brute force, thus protecting the integrity of sensitive data and user trust in the application.

It is recommended that the following types of users have MFA:

- **Administrators** (mandatory).
- **Operators with access to sensitive functionalities** (highly recommended).
- **Regular users** (recommended for important actions).

The following operations are considered critical and must be protected with MFA:

#### Administrative access and account management:

- Initial login, especially to integrator control panels (backoffice).
- Credential changes.
- Roles and permissions management.
- Sales operations that generate a significant change.
- Management of sensitive data or personally identifiable information (PII).
- Critical business changes (listing management, price changes, stock).

**Why is it crucial? Let's look at an example:**

```
AUTHENTICATION FLOW: SECURITY WITH AND WITHOUT MFA

WITHOUT MFA (INSECURE)

1. Attacker obtains password --> 2. Logs in
--> 3. FULL ACCESS ❌
   (Critical risk - Account compromised)

---------------------------------------------------

WITH MFA (RECOMMENDED)

1. Attacker obtains password --> 2. Attempts to log in
--> 3. System requests MFA Code --> 4. ACCESS DENIED ✅
   (Attacker does NOT have the           (Attack blocked)
   device/app)
```

## Protection against brute force attacks

A common attack vector is when the attacker tries thousands of username/password combinations per second using automated tools. Without an adequate protection mechanism, it is only a matter of time before valid credentials are guessed.

That is why having the following controls could prevent this from happening:

- **Attempt limits:** maximum 5 failed attempts per account.
- **Temporary lockout policy:** 15 - 30 minutes after exceeding the attempts.
- **CAPTCHA:** show from the start and after 3 failed attempts.
- **Email notification** alerting the user about failed and successful login attempts, with the location from which the attempts were made, with time and device.

Let's see how a vulnerable system behaves vs a protected one against brute force attacks:

❌ **WITHOUT PROTECTION:**

```
Attacker:
Attempt 1:  admin / 123456    --> ❌ Incorrect
Attempt 2:  admin / password  --> ❌ Incorrect
Attempt 3:  admin / admin123  --> ❌ Incorrect
... (continues automatically)
Attempt 10,000: admin / @Dm1n2026! --> ✅ Correct!

---------------------------------------------------

Total time: ~5 minutes with automated tool
☹️ Result: Attacker has access
```

✅ **WITH PROTECTION:**

```
Attacker:
Attempt 1: admin / 123456   --> Incorrect
Attempt 2: admin / password --> Incorrect
Attempt 3: admin / admin123 --> Incorrect + CAPTCHA appears
Attempt 4: admin / qwerty   --> Incorrect + CAPTCHA
Attempt 5: admin / letmein  --> Incorrect

⛔ ACCOUNT BLOCKED FOR 30 MINUTES
[mail] Email sent to user: "We detected attempts..."

---------------------------------------------------

⏳ Time for 10,000 attempts: ~1000 hours
✅ Result: Attacker cannot continue + User alerted
```

### How to verify if we are protected?

Note:

The ideal is to use a development environment that simulates the production environment in all its characteristics.

1. Try to login with an incorrect password 6 or more times.
2. Observe what happens:

**Behavior** **Result** I can keep trying without limit ❌ No protection CAPTCHA appears after 3 attempts ✅ Basic protection Account temporarily blocked ✅ Strong protection I receive notification of failed attempts ✅ Protection + alerts

## Session management

To protect your users, sessions must: be generated securely, expire on time, be regenerated after authentication, and be completely invalidated upon logout. Below are the key points:

- **Secure session tokens:** use tokens generated with secure cryptographic functions.
- **Inactivity timeout:** logout after a considered period of time (to be defined by the integrator).
- **Absolute timeout:** maximum session closure of 8 to 12 hours (or representing the daily working time of a user on the platform to request re-login).
- **Session ID regeneration:** always create a new session ID after a login and deactivate the rest of active sessions.
- **Secure logout:** invalidate session on the server and allow closing all active sessions.

### Use of session cookies

When using cookies for sessions, make sure to have the `Secure`, `HttpOnly` and `SameSite` attributes active. These mechanisms ensure that cookies are not accessible by unauthorized third parties.

Compare your current cookie implementation with these scenarios:

❌ **INCORRECT - Insecure cookie:**

```
Set-Cookie: session=abc123
```

**Problems:**

- Can be stolen by malicious Javascript.
- Can be sent over the insecure HTTP protocol (unencrypted).
- Can be sent to other malicious websites (CSRF).

✅ **CORRECT - Secure cookie:**

```
Set-Cookie: session=abc123; Secure; HttpOnly; SameSite=Lax

Attributes:
- Secure:        Only sent over HTTPS
- HttpOnly:      Not accessible from JavaScript
- SameSite=Lax:  Protects against CSRF
```

### How to verify the cookies of my website?

1. Open the application in the browser.
2. Press F12 or right-click and inspect.
3. Go to the **Application &gt; Cookies** section.
4. Review the session cookie:

**Attribute** **Must be** Secure ✓ HttpOnly ✓ SameSite Lax or Strict

## References

- [OWASP Authentication Cheat Sheet:](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) authentication best practices: passwords, MFA, sessions, among others.
- [OWASP Session Management Cheat Sheet:](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) comprehensive session management, cookies, timeouts among others.
- [NIST SP 800-63B: Digital Identity Guidelines:](https://pages.nist.gov/800-63-3/sp800-63b.html) official standard for passwords and MFA.
- [OWASP Blocking Brute Force Attacks:](https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks) specific guide for brute force protection.
- [CWE-287: Improper Authentication:](https://cwe.mitre.org/data/definitions/287.html) categorization of all authentication problems.
- [CAPTCHA:](https://www.google.com/recaptcha/about/) protection mechanism against automated attacks.

## Glossary

**Term** **Meaning** **Authentication** Verifying the identity of a user (confirming they are who they claim to be) **MFA / 2FA** Multi-factor authentication / two-factor authentication. Requires something you know (password) + something you have (phone) or something you are (fingerprint). **TOTP** Time-based One-Time Password. 6-digit code that changes every 30 seconds (Google Authenticator, Authy) **Brute force** Attack that tries all possible password combinations until finding the correct one **Hardcoding** Writing credentials directly in the source code (bad practice) **Rate limiting** Limiting how many login attempts are allowed per minute/hour to stop attacks **CAPTCHA** Test to verify that the user is human, not an automated bot **Password hash** Irreversible transformation of the password to store it securely **Salt** Random value added to the password before hashing it to prevent dictionary attacks

**Next**: [Access control and authorization](/en_us/access-control-and-authorization?nocache=true).