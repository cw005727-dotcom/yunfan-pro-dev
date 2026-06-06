# Create application

**Tags:** first,application,first application
**Created:** 2020-02-21T16:05:00Z
**Last Updated:** 2025-12-15T13:37:59Z

---

## Create application

Welcome to the first steps to start using our APIs. By following this guidance you will be able to create your first application.

## Register account

To start using the Global Selling APIs, you must have a registered account. You can register in one of the following ways:

- By invitation from the commercial team.
- Through self-registration on the [Global Selling Landing Page](https://global-selling.mercadolibre.com/landing/about).

Once registered, you can:

- Create an application.
- Execute authentication and authorization flows to obtain access and refresh tokens.
- Understand the different types of users.
- Test flows using test users.
- Learn more about the Applications API.
- Understand the security methods required to execute our APIs.

If you have any additional questions, you can consult [Seller Learning Center](https://global-selling.mercadolibre.com/learning-center/) or [Global Selling Help](https://global-selling.mercadolibre.com/help).

## Create application

If you have already created your user account, please go to [https://global-selling.mercadolibre.com/devsite](https://global-selling.mercadolibre.com/devsite)

![Global Selling Developers landing page](https://http2.mlstatic.com/storage/developers-site-cms-admin/141294354417-Captura-de-Tela-2025-12-15-a-s-12.32.32.png)

Click "Login" and enter your credentials. (If you're already logged in, you can proceed directly to the next step.)

![Login screen](https://http2.mlstatic.com/storage/developers-site-cms-admin/141294354417-Captura-de-Tela-2025-12-15-a-s-12.32.37.png)

Now, please go to [https://global-selling.mercadolibre.com/devcenter](https://global-selling.mercadolibre.com/devcenter) and link your account.

![Link account screen](https://http2.mlstatic.com/storage/developers-site-cms-admin/141294354417-Captura-de-Tela-2025-12-15-a-s-12.32.42.png)

When you link your account you will belong to Mercado Libre developers community in charge of creating electronic commerce tools and solutions.

Congrats! Now you have access to create an application.

![Account linked confirmation](https://http2.mlstatic.com/storage/developers-site-cms-admin/141294354417-Captura-de-Tela-2025-12-15-a-s-12.32.50.png)

Note:

Before creating an application, make sure the account you are using is **the owner account** for the solution you intend to develop. This helps avoid potential account transfer issues in the future. We recommend creating the account under a legal entity.

By clicking on "Create new application" you access the following page.

![Application basic information form](https://http2.mlstatic.com/storage/developers-site-cms-admin/141294354417-Captura-de-Tela-2025-12-15-a-s-12.32.55.png)

### Basic information

Here you must complete your application's basic information:

- **Name**: The name of your application. Maximum 50 characters. It must be unique within the site.
- **Short Name**: This will be used by Mercado Libre to generate your application URL. Maximum 50 characters, using only letters, numbers, and underscores.
- **Description**: Briefly describe what your application does. Maximum 150 characters.
- **Logo**: Upload a PNG image (400x400 pixels, under 100 KB). We recommend using a white background for best results.

And then click to "Continue"

### Configurations and scopes

Now, you will set your Configuration and permissions:

![Configurations and scopes form](https://http2.mlstatic.com/storage/developers-site-cms-admin/141294354417-Captura-de-Tela-2025-12-15-a-s-12.33.12.png)

- **Redirect URI**: This is the URL to which the user will be redirected after authentication. The address must begin with https:// — using the HTTPS protocol is mandatory to ensure that the message is encrypted and only accessible to authorized users. If you're still using HTTP, please update your redirect URI to use HTTPS.
- **PKCE** (Proof Key for Code Exchange): This setting determines whether PKCE validation will be enabled for token generation. Enabling PKCE adds an extra layer of security by performing a second check to help prevent authorization code injection and CSRF (Cross-site Request Forgery) attacks. Its use is optional.
- **Business units**: Please choose Mercadolibre.
- **Permissions (Scopes)**: You must configure the functional permissions for your integration. These permissions are required for users to authorize your application, granting the appropriate access and enabling correct use of our APIs on their behalf.
  
  - **Read only**: allows the use of API GET HTTPS methods.
  - **Read and write**: allows the use of API PUT, POST and DELETE HTTPS methods.

### Notification configuration

![Notification configuration and topics](https://http2.mlstatic.com/storage/developers-site-cms-admin/141294354417-Captura-de-Tela-2025-12-15-a-s-12.33.28.png)

- **Topics**: List of topics you want to subscribe to receive notifications about changes on APIs. There are more than ten possible topics: marketplace orders, items, marketplace items, marketplace questions, marketplace messages and marketplace claims. See more about [Notifications](https://global-selling.mercadolibre.com/devsite/receive-notifications).
- **Callback URL Notifications**: URL to return users to your app after they grant access. Configure the public URL of your domain where you want to receive the notifications on the different topics.

**Accept terms and conditions** and click on "Create application".

Done! You will be redirected to My Applications. There you will have your application created with the name of application and app id.

![My Applications with created app](https://http2.mlstatic.com/storage/developers-site-cms-admin/141294354417-Captura-de-Tela-2025-12-15-a-s-12.33.33.png)

## More information regarding Scopes &amp; connected resources

### Users (default)

This permission is active by default in all created applications. It allows consumption of users' resources, allowing you to obtain information from a Mercado Libre registered and authorized account.

- [Seller reputation](https://global-selling.mercadolibre.com/devsite/seller-reputation-global-selling)
- [What is Brand Protection Program?](https://global-selling.mercadolibre.com/devsite/what-is-the-brand-protection-program)
- [Complained listings](https://global-selling.mercadolibre.com/devsite/complained-listings)
- [Users](https://global-selling.mercadolibre.com/devsite/manage-users-global-selling)
- [CyberSecurity Best Practices](https://global-selling.mercadolibre.com/devsite/cybersecurity-best-practices)
- [Authorization and Token Best Practices](https://global-selling.mercadolibre.com/devsite/authorization-and-token-best-practices)
- [Security requirements and validations](https://global-selling.mercadolibre.com/devsite/security-requirements-and-validations)
- [Authentication and Authorization](https://global-selling.mercadolibre.com/devsite/authentication-and-authorization-global-selling)
- [Design considerations](https://global-selling.mercadolibre.com/devsite/design-considerations-global-selling)
- [Category dump](https://global-selling.mercadolibre.com/devsite/category-dump-global-selling)
- [Application and permissions](https://global-selling.mercadolibre.com/devsite/application-manager-gs)
- [Notifications](https://global-selling.mercadolibre.com/devsite/receive-notifications)
- [Seller news](https://global-selling.mercadolibre.com/devsite/seller-news)
- [Test users](https://global-selling.mercadolibre.com/devsite/start-testing-global-selling)

### Publication and synchronization

This is a permission that allows your application to create, update, pause and/or delete one or all store listings. It allows access to the resources of items, pictures, prices and more.

- [Listings quality](https://global-selling.mercadolibre.com/devsite/listings-quality-gs)
- [Attributes](https://global-selling.mercadolibre.com/devsite/atributtes-global-selling)
- [Size charts - First steps](https://global-selling.mercadolibre.com/devsite/first-steps)
- [Manage size chart](https://global-selling.mercadolibre.com/devsite/manage-size-chart)
- [Size chart validation](https://global-selling.mercadolibre.com/devsite/size-chart-validation)
- [Recommendations for photo quality](https://global-selling.mercadolibre.com/devsite/recommendations-for-photo-quality)
- [Visits](https://global-selling.mercadolibre.com/devsite/visits)
- [Items &amp; Searches](https://global-selling.mercadolibre.com/devsite/items-and-searches-global-selling)
- [Products search](https://global-selling.mercadolibre.com/devsite/products-search-gs)
- [Category predictor](https://global-selling.mercadolibre.com/devsite/category-predictor)
- [What is catalog?](https://global-selling.mercadolibre.com/devsite/what-is-catalog)
- [Catalog eligibility](https://global-selling.mercadolibre.com/devsite/catalog-eligibility-gs)
- [Catalog listing](https://global-selling.mercadolibre.com/devsite/catalog-listing-gs)
- [Listing Required](https://global-selling.mercadolibre.com/devsite/listing-required)
- [Catalog competition](https://global-selling.mercadolibre.com/devsite/catalog-competition-gs)
- [Global Listing](https://global-selling.mercadolibre.com/devsite/global-listing)
- [Sync and modify listings](https://global-selling.mercadolibre.com/devsite/sync-and-modify-listings-gs)
- [Multi-marketplace tool](https://global-selling.mercadolibre.com/devsite/multi-marketplace-tool)
- [Validations](https://global-selling.mercadolibre.com/devsite/validations-cbt)
- [Pricing Reference](https://global-selling.mercadolibre.com/devsite/pricing-reference)
- [Pricing Automation](https://global-selling.mercadolibre.com/devsite/manage-automations)
- [Product identifiers](https://global-selling.mercadolibre.com/devsite/product-identifiers-gs)
- [Listing types and exposures](https://global-selling.mercadolibre.com/devsite/listing-types-and-exposures)
- [Variations](https://global-selling.mercadolibre.com/devsite/variations-global-selling)
- [Pictures](https://global-selling.mercadolibre.com/devsite/pictures)
- [Item description](https://global-selling.mercadolibre.com/devsite/item-description)
- [Specific Regulations](https://global-selling.mercadolibre.com/devsite/specific-regulations)
- [Official Stores](https://global-selling.mercadolibre.com/devsite/official-storesglobal-selling)

### Questions &amp; Answers, post-purchase communication, claims and returns management

Allows your application to read and send Questions &amp; Answers, post-purchase messages, manage claims and returns. Allows access to resources of Questions &amp; Answers, post-purchase messages, claims and returns.

- [Post-sale messages management](https://global-selling.mercadolibre.com/devsite/messaging-after-sale-global-selling)
- [Blocked messages](https://global-selling.mercadolibre.com/devsite/blocked-messages-gs)
- [Pending messages](https://global-selling.mercadolibre.com/devsite/pending-messages-gs)
- [What is post-sale messages](https://global-selling.mercadolibre.com/devsite/what-is-post-sale-messages)
- [Manage Returns](https://global-selling.mercadolibre.com/devsite/manage-returns)
- [Manage Claims](https://global-selling.mercadolibre.com/devsite/manage-claims)
- [Manage claims messages](https://global-selling.mercadolibre.com/devsite/manage-claims-messages)
- [Manage Claim Resolutions](https://global-selling.mercadolibre.com/devsite/manage-claim-resolutions)
- [Manage questions &amp; answers](https://global-selling.mercadolibre.com/devsite/manage-questions-answers-global-selling)

### Advertising

This is a permission that allows your application to access, create and manage advertising campaigns. Allows access to Advertising resources.

- [What is Mercado Ads?](https://global-selling.mercadolibre.com/devsite/mercado-ads)
- [Product Ads](https://global-selling.mercadolibre.com/devsite/new-product-ads)
- [Display Ads](https://global-selling.mercadolibre.com/devsite/display-gs)

### Business metrics

This is a permission that allows your application to follow the metrics and indicators regarding sales, stock and reputation, as well as fiscal information, balances and operation reports. Allows access to trends, highlights, visits and more resources.

- [Trends](https://global-selling.mercadolibre.com/devsite/trends-gs)
- [Visits](https://global-selling.mercadolibre.com/devsite/visits)
- [Listings quality](https://global-selling.mercadolibre.com/devsite/listings-quality-gs)
- [Product reviews](https://global-selling.mercadolibre.com/devsite/product-reviews)
- [Seller news](https://global-selling.mercadolibre.com/devsite/seller-news)
- [Seller reputation](https://global-selling.mercadolibre.com/devsite/seller-reputation-global-selling)
- [Shopping experience](https://global-selling.mercadolibre.com/devsite/shopping-experience)

### Sales and shipping

This is a permission that allows your application to manage sales and shipments such as dispatches, returns, chargebacks and claims. Allows access to orders, shipments, claims and returns resources.

- [Manage orders](https://global-selling.mercadolibre.com/devsite/manage-sales-global-selling)
- [Packs](https://global-selling.mercadolibre.com/devsite/packs)
- [Shipments](https://global-selling.mercadolibre.com/devsite/manage-shipments)
- [Compensations](https://global-selling.mercadolibre.com/devsite/compensations)
- [Dispatch information](https://global-selling.mercadolibre.com/devsite/dispatch-information)
- [Shipping](https://global-selling.mercadolibre.com/devsite/shipping-global-selling)
- [Fulfillment stock](https://global-selling.mercadolibre.com/devsite/fulfillment-stock-gs)
- [Partial refund express](https://global-selling.mercadolibre.com/devsite/partial-refund-express)
- [Manage Claims](https://global-selling.mercadolibre.com/devsite/manage-claims)
- [Manage Returns](https://global-selling.mercadolibre.com/devsite/manage-returns)

### Promotions, coupons and discounts

This is a permission that allows your application to access, create, and manage offers and coupons. Allows access to offers and deals resources.

- [Manage promotions](https://global-selling.mercadolibre.com/devsite/manage-promotions-gs)
- [Deals](https://global-selling.mercadolibre.com/devsite/deals-gs)
- [Co-funded campaigns](https://global-selling.mercadolibre.com/devsite/cofunded-campaigns)
- [Deal of the day](https://global-selling.mercadolibre.com/devsite/deal-of-day-gs)
- [Lightning Deal](https://global-selling.mercadolibre.com/devsite/lightning-deal-gs)
- [Pre-negotiated discount per item](https://global-selling.mercadolibre.com/devsite/pre-negotiated-discount-per-item-gs)
- [Price discount](https://global-selling.mercadolibre.com/devsite/price-discount)
- [Seller Campaign](https://global-selling.mercadolibre.com/devsite/seller-campaign)
- [Volume Discount](https://global-selling.mercadolibre.com/devsite/volume-discount)
- [Unhealthy Stock Campaign](https://global-selling.mercadolibre.com/devsite/unhealthy-stock-campaign)
- [Automated co-participation and competitive pricing campaign](https://global-selling.mercadolibre.com/devsite/automated-co-participation-and-competitive-pricing-campaign)

### Billing

This is a permission that allows your application to send invoices and manage billing details, besides monitoring income, movements, account balances and all billing reports. Allows access to invoices, billing and more resources.

- [Billing data](https://global-selling.mercadolibre.com/devsite/gs-billing-data)

**Next**: [Authentication and Authorization](https://global-selling.mercadolibre.com/devsite/authentication-and-authorization-global-selling).