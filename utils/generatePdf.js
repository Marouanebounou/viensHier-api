const fs = require('fs');
const { PDFDocument, rgb } = require('pdf-lib');

async function personalizeInvite() {
  const templateBytes = fs.readFileSync('./templates/Invitation-template.pdf');
  const fontBytes = fs.readFileSync('./fonts/BukhariScript.ttf'); 

  const pdfDoc = await PDFDocument.load(templateBytes);
  const font = await pdfDoc.embedFont(fontBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width } = firstPage.getSize();

  const name = `${User.fullName}`;
  const fontSize = 24;
  const textWidth = font.widthOfTextAtSize(name, fontSize);
  const x = (width - textWidth) / 2;
  const y = 400;

  firstPage.drawText(name, {
    x,
    y,
    size: fontSize,
    font,
    color: rgb(202, 196, 181), 
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('invites/personalized-invite.pdf', pdfBytes);
}
