const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateBrokerCarrierAgreement(carrier, fileName) {
  const doc = new PDFDocument();

  // Write PDF content
  doc.fontSize(14);
  doc.text('Broker-Carrier Agreement', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12);
  doc.text(`This agreement is made and entered into by and between the following parties:`);
  doc.moveDown();
  doc.text(`Carrier Name: ${carrier.name}`);
  doc.text(`Carrier MC Number: ${carrier.mcNumber}`);
  // Add more carrier details as needed

  doc.moveDown();
  doc.text(`[Place the legal text of the agreement here. You can add dynamic data using the carrier object.]`);

  // Save PDF file
  doc.pipe(fs.createWriteStream(fileName));
  doc.end();
}

module.exports = {
  generateBrokerCarrierAgreement,
};
