const PDFDocument = require('pdfkit');
const MemoryStream = require('memorystream');

function generateBrokerCarrierAgreement(carrier) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const memStream = new MemoryStream();

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

   // Save PDF to buffer
   doc.pipe(memStream);
   doc.on('end', () => {
     resolve(memStream.read());
   });
   doc.on('error', (err) => {
     reject(err);
   });
   doc.end();
 });
}

module.exports = {
 generateBrokerCarrierAgreement,
};