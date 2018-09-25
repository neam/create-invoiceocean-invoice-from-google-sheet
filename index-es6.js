import { InvoiceOceanApi } from "./invoiceocean-api";
import { GsheetsConnector } from "./gsheets-connector";
import { zipObject } from "lodash";
import fs from "fs";

// Fail on error
process.on("unhandledRejection", error => {
  console.error(error);
  process.exit(1);
});

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
parser.addArgument(["-sid", "--spreadsheetId"], {
  help: "Foo",
  required: true,
});
parser.addArgument(["-sn", "--sheetName"], {
  help: "Foo",
  required: true,
});
const args = parser.parseArgs();
console.log("CLI arguments: ", args);

const spreadsheetId = args.spreadsheetId;
const sheetName = args.sheetName;

const INVOICEOCEAN_DOMAIN = process.env.INVOICEOCEAN_DOMAIN;
const INVOICEOCEAN_API_TOKEN = process.env.INVOICEOCEAN_API_TOKEN;

const invoiceOcean = new InvoiceOceanApi(
  INVOICEOCEAN_DOMAIN,
  INVOICEOCEAN_API_TOKEN,
);
const gsheets = new GsheetsConnector();

const run = async () => {
  /*
  const invoices = await invoiceOcean.fetchInvoices();
  console.log("invoices", invoices);

  const detailedInvoices = await Promise.all(
    invoices.map(invoice => {
      return invoiceOcean.fetchInvoice(invoice.id);
    }),
  );
  console.log("detailedInvoices", detailedInvoices);
  */

  await gsheets.ensureAuthorized();

  const range = `${sheetName}`;
  const rows = await gsheets.getValues(spreadsheetId, range);

  const invoiceOceanObjects = gsheetRowsToInvoiceOceanObjects(rows);
  console.log("invoiceOceanObjects", invoiceOceanObjects);

  const invoice = invoiceOceanObjects.invoice[0];
  invoice.client = invoiceOceanObjects.client[0];
  invoice.positions = invoiceOceanObjects.positions;

  try {
    // Create the invoice on invoiceocean.com
    const createdInvoice = await invoiceOcean.createInvoice(invoice);
    console.log("Created invoice: ", createdInvoice);

    // Download invoice as PDF
    const destinationPath = `./${sheetName}.pdf`;
    const destinationStream = fs.createWriteStream(destinationPath);
    invoiceOcean.downloadInvoiceToStream(createdInvoice.id, destinationStream);
    console.log(`Invoice downloaded to ${destinationPath}`);
  } catch (err) {
    console.error(err);
  }
};

function gsheetRowsToInvoiceOceanObjects(rows) {
  // console.log("rows", rows);

  const removeUndefinedProperties = obj => {
    Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
  };

  const convertExcelDates = obj => {
    Object.keys(obj).forEach(key => {
      obj[key] =
        key.indexOf("_date") > -1 || key.indexOf("payment_to") > -1
          ? excelDateToJSDate(obj[key])
              .toISOString()
              .slice(0, 10)
          : obj[key];
    });
  };

  function excelDateToJSDate(excelDate) {
    return new Date(Math.round((excelDate - 25569) * 86400 * 1000));
  }

  let currentItemType = null;
  let currentRowType = null;
  let currentHeaders = null;
  let invoiceOceanObjects = {};
  rows.forEach(function(element) {
    if (element[0]) {
      currentItemType = element[0];
      invoiceOceanObjects[currentItemType] = [];
      currentRowType = "header";
      return;
    }
    if (currentRowType === "header") {
      currentHeaders = element.slice(1);
      currentRowType = "data";
    } else {
      const values = element.slice(1);
      const object = zipObject(currentHeaders, values);
      removeUndefinedProperties(object);
      convertExcelDates(object);
      invoiceOceanObjects[currentItemType].push(object);
    }
  });
  return invoiceOceanObjects;
}

run();
