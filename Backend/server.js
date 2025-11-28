const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const xml2js = require("xml2js");
const cors = require("cors");

const app = express();
app.use(cors());  // <-- IMPORTANT
app.use(bodyParser.json());

// SAP SOAP URL
const SAP_URL ="http://172.17.19.24:8000/sap/bc/srt/scs/sap/zsg_rfc_vp_login?sap-client=100";

// SAP Basic Auth
const SAP_USERNAME = "k901890";
const SAP_PASSWORD = "Sathish@gp0212";

// Convert login request to SOAP XML
function buildLoginXML(vendorId, password) {
  return `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
        xmlns:urn="urn:sap-com:document:sap:rfc:functions">
        <soapenv:Header/>
        <soapenv:Body>
            <urn:ZSG_FM_LOGIN_VP>
                <IV_VENDOR_ID>${vendorId}</IV_VENDOR_ID>
                <IV_PASSWORD>${password}</IV_PASSWORD>
            </urn:ZSG_FM_LOGIN_VP>
        </soapenv:Body>
    </soapenv:Envelope>
  `;
}

app.post("/login", async (req, res) => {
  const { vendorId, password } = req.body;

  const xmlData = buildLoginXML(vendorId, password);

  try {
    const response = await axios.post(SAP_URL, xmlData, {
      headers: { "Content-Type": "text/xml;charset=UTF-8" },
      auth: { username: SAP_USERNAME, password: SAP_PASSWORD },
    });

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) return res.status(500).json({ message: "XML Parsing Error" });

      const soapBody =
        result["soap-env:Envelope"]["soap-env:Body"]["n0:ZSG_FM_LOGIN_VPResponse"];

      return res.json({
        success: soapBody.EV_SUCCESS === "X",
        message: soapBody.EV_MESSAGE
      });
    });

  } catch (error) {
    return res.status(500).json({ message: "SAP Connection Failed" });
  }
});

// ---------------- PROFILE API ----------------

// SAP Profile URL
const SAP_PROFILE_URL =
  "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zsg_rfc_vp_profile?sap-client=100";

// Build SOAP XML for Profile Request
function buildProfileXML(vendorId) {
  return `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tns="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
      <tns:ZSG_FM_PROFILE_VP>
        <IV_VENDOR_ID>${vendorId}</IV_VENDOR_ID>
      </tns:ZSG_FM_PROFILE_VP>
    </soapenv:Body>
  </soapenv:Envelope>
  `;
}

// Profile API Endpoint
app.post("/profile", async (req, res) => {
  const { vendorId } = req.body;

  if (!vendorId) {
    return res.status(400).json({ message: "Vendor ID required" });
  }

  const xmlData = buildProfileXML(vendorId);

  try {
    const response = await axios.post(SAP_PROFILE_URL, xmlData, {
      headers: { "Content-Type": "text/xml;charset=UTF-8" },
      auth: { username: SAP_USERNAME, password: SAP_PASSWORD },
    });

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) return res.status(500).json({ message: "XML Parsing Error" });

      try {
        const profile =
          result["soap-env:Envelope"]["soap-env:Body"]["n0:ZSG_FM_PROFILE_VPResponse"]["EV_PROFILE"];

        // Return clean JSON to frontend
        return res.json({
          vendorId: profile.VENDOR_ID,
          vendorName: profile.VENDOR_NAME,
          city: profile.CITY,
          postal: profile.POSTAL,
          telephone: profile.TELEPHONE,
          region: profile.REGION,
          country: profile.COUNTRY,
          street: profile.STREET,
        });

      } catch (e) {
        return res.status(500).json({ message: "Invalid SOAP Response" });
      }
    });

  } catch (error) {
    return res.status(500).json({ message: "SAP Connection Failed" });
  }
});

// ---------------- RFQ API ----------------

// SAP RFQ URL
const SAP_RFQ_URL =
  "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zsg_rfc_vp_rfq?sap-client=100";

// Build SOAP XML for RFQ Request
function buildRFQXML(vendorId) {
  return `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tns="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
      <tns:ZSG_FM_RFQ_VP>
        <IV_VENDOR_ID>${vendorId}</IV_VENDOR_ID>
      </tns:ZSG_FM_RFQ_VP>
    </soapenv:Body>
  </soapenv:Envelope>
  `;
}

// RFQ API Endpoint
app.post("/rfq", async (req, res) => {
  const { vendorId } = req.body;

  if (!vendorId) {
    return res.status(400).json({ message: "Vendor ID required" });
  }

  const xmlData = buildRFQXML(vendorId);

  try {
    const response = await axios.post(SAP_RFQ_URL, xmlData, {
      headers: { "Content-Type": "text/xml;charset=UTF-8" },
      auth: { username: SAP_USERNAME, password: SAP_PASSWORD },
    });

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) return res.status(500).json({ message: "XML Parsing Error" });

      try {
        const rfqData =
          result["soap-env:Envelope"]["soap-env:Body"]["n0:ZSG_FM_RFQ_VPResponse"]["EV_RFQ"];

        // If no items
        if (!rfqData || !rfqData.item) {
          return res.json({ items: [] });
        }

        let items = rfqData.item;

        // Ensure items is always an array
        if (!Array.isArray(items)) {
          items = [items];
        }

        // Clean JSON Response
        const formattedData = items.map((item) => ({
          rfqNumber: item.EBELN,
          vendorId: item.LIFNR,
          createdDate: item.BEDAT,
          materialNumber: item.MATNR,
          materialDesc: item.TXZ01,
          quantity: item.MENGE,
          unit: item.MEINS,
          deliveryDate: item.EINDT,
        }));

        return res.json({ items: formattedData });

      } catch (e) {
        return res.status(500).json({ message: "Invalid RFQ SOAP Response" });
      }
    });

  } catch (error) {
    return res.status(500).json({ message: "SAP Connection Failed" });
  }
});

// ---------------- PURCHASE ORDER API ----------------

// SAP PO URL
const SAP_PO_URL =
  "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zsg_rfc_vp_purchase_order?sap-client=100";

// Build SOAP XML for Purchase Order Request
function buildPOXML(vendorId) {
  return `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tns="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
      <tns:ZSG_FM_PURCHASE_ORDER_VP>
        <IV_VENDOR_ID>${vendorId}</IV_VENDOR_ID>
      </tns:ZSG_FM_PURCHASE_ORDER_VP>
    </soapenv:Body>
  </soapenv:Envelope>
  `;
}

// Purchase Order API Endpoint
app.post("/po", async (req, res) => {
  const { vendorId } = req.body;

  if (!vendorId) {
    return res.status(400).json({ message: "Vendor ID required" });
  }

  const xmlData = buildPOXML(vendorId);

  try {
    const response = await axios.post(SAP_PO_URL, xmlData, {
      headers: { "Content-Type": "text/xml;charset=UTF-8" },
      auth: { username: SAP_USERNAME, password: SAP_PASSWORD },
    });

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) return res.status(500).json({ message: "XML Parsing Error" });

      try {
        const poData =
          result["soap-env:Envelope"]["soap-env:Body"]["n0:ZSG_FM_PURCHASE_ORDER_VPResponse"]["EV_PO"];

        if (!poData || !poData.item) {
          return res.json({ items: [] });
        }

        let items = poData.item;

        // Ensure it's always an array
        if (!Array.isArray(items)) {
          items = [items];
        }

        // Clean JSON Response
        const formatted = items.map((item) => ({
  poNumber: item.EBELN,
  vendorId: item.LIFNR,
  poDate: item.BEDAT,
  poItem: item.EBELP,          // ADDED
  materialNumber: item.MATNR,
  description: item.TXZ01,     // ADDED
  quantity: item.MENGE,
  unit: item.MEINS,
  deliveryDate: item.EINDT,
  price: item.NETPR,
  currency: item.WAERS
}));

        return res.json({ items: formatted });

      } catch (e) {
        return res.status(500).json({ message: "Invalid PO SOAP Response", error: e });
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: "SAP Connection Failed",
      error: error.message
    });
  }
});

// ---------------- GOODS RECEIPT API ----------------

// SAP Goods Receipt URL
const SAP_GOODS_RECEIPT_URL =
  "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zsg_rfc_vp_goods_receipt?sap-client=100";

// Build SOAP XML for Goods Receipt Request
function buildGoodsReceiptXML(vendorId) {
  return `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tns="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
      <tns:ZSG_FM_GOODS_RECEIPT_VP>
        <IV_VENDOR_ID>${vendorId}</IV_VENDOR_ID>
      </tns:ZSG_FM_GOODS_RECEIPT_VP>
    </soapenv:Body>
  </soapenv:Envelope>
  `;
}

// Goods Receipt API Endpoint
app.post("/goods-receipt", async (req, res) => {
  const { vendorId } = req.body;

  if (!vendorId) {
    return res.status(400).json({ message: "Vendor ID required" });
  }

  const xmlData = buildGoodsReceiptXML(vendorId);

  try {
    const response = await axios.post(SAP_GOODS_RECEIPT_URL, xmlData, {
      headers: { "Content-Type": "text/xml;charset=UTF-8" },
      auth: { username: SAP_USERNAME, password: SAP_PASSWORD }
    });

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "XML Parsing Error" });
      }

      try {
        const grData =
          result["soap-env:Envelope"]["soap-env:Body"]["n0:ZSG_FM_GOODS_RECEIPT_VPResponse"]["EV_GOODS_RECEIPT"];

        if (!grData || !grData.item) {
          return res.json({ items: [] });
        }

        let items = grData.item;

        // Convert single item → array
        if (!Array.isArray(items)) {
          items = [items];
        }

        // Format JSON
        const formatted = items.map(item => ({
          materialDocument: item.MBLNR,
          companyCode: item.BUKRS,
          postingDate: item.BUDAT,
          materialYear: item.MJAHR,
          vendorId: item.LIFNR,
          materialNumber: item.MATNR,
          plant: item.WERKS,
          purchaseOrder: item.EBELN,
          poItem: item.EBELP
        }));

        return res.json({ items: formatted });

      } catch (e) {
        return res.status(500).json({
          message: "Invalid Goods Receipt SOAP Response",
          error: e.message
        });
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: "SAP Connection Failed",
      error: error.message
    });
  }
});

// ---------------- INVOICE API ----------------

// SAP Invoice URL
const SAP_INVOICE_URL =
  "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zsg_rfc_vp_invoice_detail?sap-client=100";

// Build SOAP XML for Invoice Request
function buildInvoiceXML(vendorId) {
  return `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tns="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
      <tns:ZSG_FM_INVOICE_DETAIL_VP>
        <IV_VENDOR_ID>${vendorId}</IV_VENDOR_ID>
      </tns:ZSG_FM_INVOICE_DETAIL_VP>
    </soapenv:Body>
  </soapenv:Envelope>
  `;
}

// Invoice API Endpoint
app.post("/invoice", async (req, res) => {
  const { vendorId } = req.body;

  if (!vendorId) {
    return res.status(400).json({ message: "Vendor ID required" });
  }

  const xmlData = buildInvoiceXML(vendorId);

  try {
    const response = await axios.post(SAP_INVOICE_URL, xmlData, {
      headers: { "Content-Type": "text/xml;charset=UTF-8" },
      auth: { username: SAP_USERNAME, password: SAP_PASSWORD }
    });

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) return res.status(500).json({ message: "XML Parsing Error" });

      try {
        const invoiceData =
          result["soap-env:Envelope"]["soap-env:Body"]["n0:ZSG_FM_INVOICE_DETAIL_VPResponse"]["EV_INVOICE"];

        if (!invoiceData || !invoiceData.item) {
          return res.json({ items: [] });
        }

        let items = invoiceData.item;

        // Ensure array always
        if (!Array.isArray(items)) {
          items = [items];
        }

        // Format JSON
        const formatted = items.map(item => ({
          invoiceNumber: item.BELNR,
          fiscalYear: item.GJAHR,
          documentDate: item.BLDAT,
          postingDate: item.BUDAT,
          vendorId: item.LIFNR,
          reference: item.XBLNR || "",
          amount: item.WRBTR,
          currency: item.WAERS,
          poNumber: item.EBELN || "",
          poItem: item.EBELP,
          materialNumber: item.MATNR || "",
          quantity: item.MENGE,
          unit: item.MEINS || ""
        }));

        return res.json({ items: formatted });

      } catch (e) {
        return res.status(500).json({ message: "Invalid Invoice SOAP Response", error: e.message });
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: "SAP Connection Failed",
      error: error.message
    });
  }
});

// ---------------- PAYMENTS AGING API ----------------

// SAP Payments Aging URL
const SAP_PAYMENTS_AGING_URL =
  "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zsg_rfc_vp_payment_aging?sap-client=100";

// Build SOAP XML for Payments Aging Request
function buildPaymentsAgingXML(vendorId) {
  return `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tns="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
      <tns:ZSG_FM_PAYMENT_AGING_VP>
        <IV_VENDOR_ID>${vendorId}</IV_VENDOR_ID>
      </tns:ZSG_FM_PAYMENT_AGING_VP>
    </soapenv:Body>
  </soapenv:Envelope>
  `;
}

// Payments Aging API Endpoint
app.post("/payments-aging", async (req, res) => {
  const { vendorId } = req.body;

  if (!vendorId) {
    return res.status(400).json({ message: "Vendor ID required" });
  }

  const xmlData = buildPaymentsAgingXML(vendorId);

  try {
    const response = await axios.post(SAP_PAYMENTS_AGING_URL, xmlData, {
      headers: { "Content-Type": "text/xml;charset=UTF-8" },
      auth: { username: SAP_USERNAME, password: SAP_PASSWORD }
    });

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) return res.status(500).json({ message: "XML Parsing Error" });

      try {
        const agingData =
          result["soap-env:Envelope"]["soap-env:Body"]["n0:ZSG_FM_PAYMENT_AGING_VPResponse"]["EV_PAYMENTS_AGING"];

        if (!agingData || !agingData.item) {
          return res.json({ items: [] });
        }

        let items = agingData.item;

        // Convert single item -> array
        if (!Array.isArray(items)) {
          items = [items];
        }

        // Format JSON output
        const formatted = items.map(item => ({
          vendorId: item.LIFNR,
          documentNumber: item.BELNR_D,   // Clearing / Document Number
          postingDate: item.BUDAT,
          documentDate: item.BLDAT,
          currency: item.WAERS,
          taxCode: item.MWSKZ || "",
          amount: item.WRBTR,
          paymentTerm: item.DZTERM || "",
          dueDate: item.DATS,
          overdueDays: item.INT3
        }));

        return res.json({ items: formatted });

      } catch (e) {
        return res.status(500).json({ message: "Invalid Payment Aging SOAP Response", error: e });
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: "SAP Connection Failed",
      error: error.message
    });
  }
});

// ---------------- MEMO API ----------------

// SAP Memo URL
const SAP_MEMO_URL =
  "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zsg_rfc_vp_memo?sap-client=100";

// Build SOAP XML for Memo Request
function buildMemoXML(vendorId) {
  return `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tns="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
      <tns:ZSG_FM_MEMO_VP>
        <IV_VENDOR_ID>${vendorId}</IV_VENDOR_ID>
      </tns:ZSG_FM_MEMO_VP>
    </soapenv:Body>
  </soapenv:Envelope>
  `;
}

// Memo API Endpoint
app.post("/memo", async (req, res) => {
  const { vendorId } = req.body;

  if (!vendorId) {
    return res.status(400).json({ message: "Vendor ID required" });
  }

  const xmlData = buildMemoXML(vendorId);

  try {
    const response = await axios.post(SAP_MEMO_URL, xmlData, {
      headers: { "Content-Type": "text/xml;charset=UTF-8" },
      auth: { username: SAP_USERNAME, password: SAP_PASSWORD }
    });

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "XML Parsing Error" });
      }

      try {
        const memoData =
          result["soap-env:Envelope"]["soap-env:Body"]["n0:ZSG_FM_MEMO_VPResponse"]["EV_MEMO"];

        if (!memoData || !memoData.item) {
          return res.json({ items: [] });
        }

        let items = memoData.item;

        // Ensure items is an array
        if (!Array.isArray(items)) {
          items = [items];
        }

        // Format JSON
        const formatted = items.map(item => ({
          vendorId: item.LIFNR,
          memoNumber: item.BELNR,
          fiscalYear: item.GJAHR,
          companyCode: item.BUKRS,
          documentDate: item.BLDAT,
          postingDate: item.BUDAT,
          debitCreditIndicator: item.SHKZG,  // S = Debit, H = Credit
          amount: item.WRBTR,
          currency: item.WAERS,
          reference: item.XBLNR || "",
          text: item.SGTXT || "",
          materialNumber: item.MATNR || "",
          quantity: item.MENGE,
          unit: item.MEINS || ""
        }));

        return res.json({ items: formatted });

      } catch (e) {
        return res.status(500).json({
          message: "Invalid Memo SOAP Response",
          error: e.message
        });
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: "SAP Connection Failed",
      error: error.message
    });
  }
});


// ---------------- INVOICE PDF DOWNLOAD API ----------------

// SAP Invoice PDF URL
const SAP_INVOICE_PDF_URL =
  "http://172.17.19.24:8000/sap/bc/srt/scs/sap/zsg_rfc_invoice_pdf_vp?sap-client=100";

// Build SOAP XML for PDF Request
function buildInvoicePDFXML(invoiceNo, vendorId) {
  return `
  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                    xmlns:tns="urn:sap-com:document:sap:rfc:functions">
    <soapenv:Header/>
    <soapenv:Body>
      <tns:ZSG_FM_INVOICE_PDF_VP>
        <IV_INVOICE_NO>${invoiceNo}</IV_INVOICE_NO>
        <IV_VENDOR_ID>${vendorId}</IV_VENDOR_ID>
      </tns:ZSG_FM_INVOICE_PDF_VP>
    </soapenv:Body>
  </soapenv:Envelope>
  `;
}

// Invoice PDF API Endpoint
app.post("/invoice-download", async (req, res) => {
  const { invoiceNo, vendorId } = req.body;

  if (!invoiceNo || !vendorId) {
    return res.status(400).json({
      message: "Invoice Number and Vendor ID required"
    });
  }

  const xmlData = buildInvoicePDFXML(invoiceNo, vendorId);

  try {
    const response = await axios.post(SAP_INVOICE_PDF_URL, xmlData, {
      headers: { "Content-Type": "text/xml;charset=UTF-8" },
      auth: { username: SAP_USERNAME, password: SAP_PASSWORD }
    });

    xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
      if (err)
        return res.status(500).json({ message: "XML Parsing Error" });

      try {
        const base64Data =
          result["soap-env:Envelope"]["soap-env:Body"]["n0:ZSG_FM_INVOICE_PDF_VPResponse"]["EV_BASE64"];

        if (!base64Data) {
          return res.status(404).json({ message: "PDF not found" });
        }

        // SEND TO FRONT-END
        return res.json({
          invoiceNo,
          base64: base64Data
        });

      } catch (e) {
        return res.status(500).json({
          message: "Invalid PDF SOAP Response",
          error: e.message
        });
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: "SAP Connection Failed",
      error: error.message
    });
  }
});



app.listen(3000, () => console.log("Server running on port 3000"));
