const PDFDocument = require('pdfkit');
const stream = require('stream');

function generateBrokerCarrierAgreement(carrier) {
  const doc = new PDFDocument();
  const pdfStream = new stream.PassThrough();

  // Write PDF content
  // ... (same content as before)

  // Return PDF stream
  doc.pipe(pdfStream);
  doc.end();
  return pdfStream;
}

module.exports = {
  generateBrokerCarrierAgreement,
};
const PDFDocument = require('pdfkit');
const stream = require('stream');

function generateBrokerCarrierAgreement(carrier) {
  const doc = new PDFDocument();
  const pdfStream = new stream.PassThrough();

  // Write PDF content
  // ... (same content as before)

  // Return PDF stream
  doc.pipe(pdfStream);
  doc.end();
  return pdfStream;
}

module.exports = {
  generateBrokerCarrierAgreement,
};
