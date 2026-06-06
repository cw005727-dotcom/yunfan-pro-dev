# Payments

**Tags:** Payment,Handling
**Created:** 2020-02-06T14:26:38Z
**Last Updated:** 2022-12-21T16:39:14Z

---

## Payments

Mercado Pago is the payment open platform of Mercado Libre. If you want integrate your business to a payment solution in your applation, you can [visit Mercado Pago Developers](https://www.mercadopago.com.br/developers/es/guides).

## Receive a notification

To [receive payment notifications](/en_us/products-receive-notifications#Subscribe-to-notifications), be sure to subscribe your app to [payments topic](/en_us/products-receive-notifications#payments). Learn about the rest of the available topics and more details about the payments topic.

## Cashback in account for canceled sales

Important:

It is only available for sellers in Mexico and soon, for those in Argentina and Brazil.

In the event of cancellations, buyers with a good reputation and who make payments with a credit or debit card will automatically receive a refund with money in the Mercado Pago account. In this way, the purchase order remains in a different state with respect to the other flows. The changes will be:

- status = paid
- New tag: unfulfilled

Note:

The order will never have the status canceled since by means of the return with money in the account it generates that the payment must be completed. In the payment of the order you will find the refund\_account\_money tag.

**Next**: [Feedback on sale](/en_us/feedback-on-sale).