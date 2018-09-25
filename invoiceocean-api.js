import fetch from "node-fetch";

function stringValuesOnly(myObj) {
  Object.keys(myObj).forEach(function(key) {
    typeof myObj[key] == "object"
      ? stringValuesOnly(myObj[key])
      : (myObj[key] = String(myObj[key]));
  });
  return myObj;
}

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
      }.invoiceocean.com/{id}.json?&api_token=${this.INVOICEOCEAN_API_TOKEN}`,
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

  async downloadInvoiceToStream(id, destinationStream) {
    const res = await fetch(
      `https://${
        this.INVOICEOCEAN_DOMAIN
      }.invoiceocean.com/invoices/${id}.pdf?api_token=${
        this.INVOICEOCEAN_API_TOKEN
      }`,
    );
    await res.body.pipe(destinationStream);
  }

  async createClientIfNotExists(client) {
    const clients = await this.fetchClients();

    // Consider a client to exist
    const existingClients = clients.filter(c => c.name === client.name);

    if (existingClients.length > 1) {
      console.log("existingClients", existingClients);
      throw new Error(
        "More than one existing clients found - adjust in InvoiceOcean.com and try again",
      );
    }

    if (existingClients.length === 1) {
      return existingClients[0];
    }

    return await this.createClient(client);
  }

  async createClient(client) {
    const payload = {
      api_token: this.INVOICEOCEAN_API_TOKEN,
      client: stringValuesOnly(client),
    };

    const res = await fetch(
      `https://${this.INVOICEOCEAN_DOMAIN}.invoiceocean.com/clients.json`,
      {
        method: "post",
        body: JSON.stringify(payload),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    const json = await res.json();

    if (json.code && json.code === "error") {
      console.error("InvoiceOcean API error - createClient: ", json);
      throw new Error(`InvoiceOcean API error - createClient: ${json.message}`);
    }

    return json;
  }

  async createInvoice(invoice) {
    if (invoice.client) {
      const client = await this.createClientIfNotExists(invoice.client);
      invoice.client_id = client.id;
      invoice.buyer_name = client.name;
      delete invoice.client;
    }

    const payload = {
      api_token: this.INVOICEOCEAN_API_TOKEN,
      invoice: stringValuesOnly(invoice),
    };

    console.log(
      "Creating invoice using the following payload: ",
      stringValuesOnly(invoice),
    );
    console.dir(payload);

    const res = await fetch(
      `https://${this.INVOICEOCEAN_DOMAIN}.invoiceocean.com/invoices.json`,
      {
        method: "post",
        body: JSON.stringify(payload),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    );

    const json = await res.json();

    if (json.code && json.code === "error") {
      console.error("InvoiceOcean API error - createInvoice: ", json);
      throw new Error(
        `InvoiceOcean API error - createInvoice: ${json.message}`,
      );
    }

    return json;
  }
}
