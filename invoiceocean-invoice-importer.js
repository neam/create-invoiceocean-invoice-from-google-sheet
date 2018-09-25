import { InvoiceOceanApi } from "./invoiceocean-api";
import { GsheetsConnector } from "./gsheets-connector";

// Initialize settings from .env if available
require("dotenv").load();

// Parse cli arguments
const ArgumentParser = require("argparse").ArgumentParser;
const packageInfo = require("./package.json");
const parser = new ArgumentParser({
  version: packageInfo.version,
  description: packageInfo.description,
  addHelp: true,
});
/*
parser.addArgument(["-f", "--foo"], {
  help: "Foo",
});
*/
var args = parser.parseArgs();
console.log("CLI arguments: ", args);

const INVOICEOCEAN_DOMAIN = process.env.INVOICEOCEAN_DOMAIN;
const INVOICEOCEAN_API_TOKEN = process.env.INVOICEOCEAN_API_TOKEN;

const invoiceOcean = new InvoiceOceanApi(
  INVOICEOCEAN_DOMAIN,
  INVOICEOCEAN_API_TOKEN,
);
const gsheets = new GsheetsConnector();

const run = async () => {
  const clients = await invoiceOcean.fetchClients();
  // console.log("fetchClients", clients);

  const invoices = await invoiceOcean.fetchInvoices();
  // console.log("fetchInvoices", invoices);

  const detailedInvoices = await Promise.all(
    invoices.map(async invoice => {
      // console.log("invoice", invoice);
      const detailedInvoice = await invoiceOcean.fetchInvoice(invoice.id);
      console.log("detailedInvoice", detailedInvoice);
      return detailedInvoice;
    }),
  );
  console.log("detailedInvoices", detailedInvoices);

  await gsheets.runExample();
};

run();
