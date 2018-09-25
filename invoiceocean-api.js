import fetch from "node-fetch";

export class InvoiceOceanApi {
  constructor(INVOICEOCEAN_DOMAIN, INVOICEOCEAN_API_TOKEN) {
    this.INVOICEOCEAN_DOMAIN = INVOICEOCEAN_DOMAIN;
    this.INVOICEOCEAN_API_TOKEN = INVOICEOCEAN_API_TOKEN;
  }

  async fetchClients() {
    const res = await fetch(
      `https://${
        this.INVOICEOCEAN_DOMAIN
      }.invoiceocean.com/clients.json?api_token=${
        this.INVOICEOCEAN_API_TOKEN
      }&page=1`,
    );
    return await res.json();
  }

  async fetchClient(id) {
    const res = await fetch(
      `https://${
        this.INVOICEOCEAN_DOMAIN
      }.invoiceocean.com/clients.json?external_id=${id}&api_token=${
        this.INVOICEOCEAN_API_TOKEN
      }`,
    );
    return await res.json();
  }

  async fetchInvoices() {
    const res = await fetch(
      `https://${
        this.INVOICEOCEAN_DOMAIN
      }.invoiceocean.com/invoices.json?api_token=${
        this.INVOICEOCEAN_API_TOKEN
      }`,
    );
    return await res.json();
  }

  async fetchInvoice(id) {
    const res = await fetch(
      `https://${
        this.INVOICEOCEAN_DOMAIN
      }.invoiceocean.com/invoices/${id}.json?api_token=${
        this.INVOICEOCEAN_API_TOKEN
      }`,
    );
    return await res.json();
  }

  async todo() {
    //       "client_id": 11063048,

    /*
    Adding client
    curl https://${INVOICEOCEAN_DOMAIN}.invoiceocean.com/clients.json
                  -H 'Accept: application/json'
                  -H 'Content-Type: application/json'
                  -d '{"api_token": "${INVOICEOCEAN_API_TOKEN}",
                      "client": {
                          "name": "Client1",
                          "tax_no": "5252445767",
                          "bank" : "bank1",
                          "bank_account" : "bank_account1",
                          "city" : "city1",
                          "country" : "",
                          "email" : "example@email.com",
                          "person" : "person1",
                          "post_code" : "post-code1",
                          "phone" : "phone1",
                          "street" : "street1",
                          "street_no" : "street-no1"
                      }}'

     */

    const payload = {
      api_token: INVOICEOCEAN_API_TOKEN,
      invoice: {
        sell_date: "2013-02-07",
        issue_date: "2013-02-07",
        payment_to: "2013-02-14",
        /*
        "kind": "vat",
        "number": null,
        "seller_name": "Wystawca Sp. z o.o.",
        "seller_tax_no": "5252445767",
        "buyer_name": "Klient1 Sp. z o.o.",
        "buyer_tax_no": "5252445767",

        "payment_to_kind": 5,
        "department_id": 323858,
        */
        client_id: 11063048,
        positions: [
          {
            name: "Produkt A1",
            tax: 23,
            total_price_gross: 10.23,
            quantity: 1,
          },
          {
            name: "Produkt A2",
            tax: 0,
            total_price_gross: 50,
            quantity: 3,
          },
        ],
      },
    };

    const jsonString = JSON.stringify(payload);

    const endPoint = `https://${INVOICEOCEAN_DOMAIN}.invoiceocean.com/invoices.json -H 'Accept: application/json' -H 'Content-Type: application/json' -d '${jsonString}'`;

    // Download invoice as PDF
    // curl "https://${INVOICEOCEAN_DOMAIN}.invoiceocean.com/invoices/100.pdf?api_token=${INVOICEOCEAN_API_TOKEN}"
  }
}
