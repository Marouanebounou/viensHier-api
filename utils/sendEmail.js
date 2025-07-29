const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const { PDFDocument, rgb } = require('pdf-lib');
const path = require('path');
const { saveUser } = require('../controllers/user');
const fontkit = require('fontkit');

// Cache the template and font globally to avoid repeated file I/O
let templateCache = null;
let fontCache = null;
let transporterCache = null;

// Initialize transporter once with CORRECT Gmail settings
const getTransporter = () => {
    if (!transporterCache) {
        // Validate environment variables
        const requiredEnvVars = ['USER', 'PASS'];
        const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
        
        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
        }

        console.log('Gmail SMTP Configuration:', {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            user: process.env.USER ? 'SET' : 'NOT SET'
        });

        // CORRECT Gmail SMTP Configuration
        transporterCache = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for port 465, false for other ports
            auth: {
                user: 'maroinbounou.123@gmail.com', // Your Gmail address
                pass: 'sdofkcgcyexhyqry', // Your Gmail App Password (NOT regular password)
            },
            // Add connection pooling for better performance
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            // Add timeout settings
            connectionTimeout: 60000, // 60 seconds
            greetingTimeout: 30000, // 30 seconds
            socketTimeout: 60000, // 60 seconds
            // Add TLS options for better compatibility
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify the connection
        transporterCache.verify((error, success) => {
            if (error) {
                console.error('Gmail SMTP connection verification failed:', error);
            } else {
                console.log('Gmail SMTP server is ready to take our messages');
            }
        });
    }
    return transporterCache;
};

// Preload template and font
const initializeAssets = async () => {
    try {
        if (!templateCache) {
            templateCache = await fs.readFile('./templates/Invitation-template.pdf');
        }
        if (!fontCache) {
            const fontBytes = await fs.readFile('./fonts/BarlowCondensed.ttf');
            fontCache = fontBytes;
        }
    } catch (error) {
        console.error('Error loading assets:', error);
        throw error;
    }
};

const sendEmailWithAttachment = async (fullName, email, attachmentPath) => {
    try {
        const transporter = getTransporter();
        
        const mailOptions = {
            from: process.env.USER, // Gmail address
            to: email,
            subject: `You're Invited! Viens Hier!`,
            html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitation</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #667eea, #764ba2); font-family: 'Arial', sans-serif;">

  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 40px rgba(0,0,0,0.15);">

    <!-- Header Section -->
    <div style="background: linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3); padding: 15px 30px; text-align: center; position: relative;">
      <div style="position: absolute; inset: 0; background: rgba(255,255,255,0.1); backdrop-filter: blur(12px); border-radius: 20px;"></div>
      <div style="position: relative; z-index: 1;">
        <h1 style="color: white; font-size: 34px; font-weight: bold; text-shadow: 1px 1px 6px rgba(0,0,0,0.3); margin-bottom: 10px;">
          ✨ Invitation  ✨
        </h1>
      </div>
    </div>

    <!-- Main Content -->
    <div style="padding: 40px 30px;">

      <!-- Greeting -->
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #333; font-size: 24px; font-weight: 600; margin-bottom: 10px;">
          Cher/Chère ${fullName} 👋
        </h2>
        <div style="height: 4px; width: 70px; margin: 0 auto; background: linear-gradient(to right, #ff6b6b, #feca57); border-radius: 2px;"></div>
      </div>

      <!-- Event Description -->
      <div style="color: #444; line-height: 1.7; font-size: 16px; margin-bottom: 40px;">
        <h3 style="color: #2c2c2c; text-align: center; font-size: 22px; font-weight: 600; margin-bottom: 10px;">
          Viens-hier!
        </h3>
        <p style="text-align: center; font-style: italic; color: #777; margin-bottom: 20px;">
          – Basée sur une histoire vraie.
        </p>
        <p><strong>Viens-hier!</strong> explore un amour condamné dans un monde où le temps se brise, la mémoire vacille et les silences pèsent.</p>
        <p>Entre surréalisme, absurde et théâtre contemporain, Leila et Omar s'accrochent l'un à l'autre, pris dans un vertige où rêve et réalité s'entrelacent.</p>
        <p>Un spectacle sensoriel, troublant et viscéral.</p>
        <p style="text-align: center; font-style: italic; color: #777; margin-top: 20px;">
          – Une création signée <strong>Reda El Azami</strong>.
        </p>
      </div>

      <!-- Event Info -->
      <div style="background: linear-gradient(135deg, #f093fb, #f5576c); padding: 25px; border-radius: 16px; color: white; text-align: center; box-shadow: inset 0 0 10px rgba(255,255,255,0.15);">
        <h3 style="font-size: 20px; margin-bottom: 15px;">📅 Détails de l'Événement</h3>
        <p style="font-size: 18px; font-weight: bold; margin: 0 0 10px;">🗓 Mardi 5 Août 2025 – 20h</p>
        <p style="font-size: 16px; margin: 0 0 15px;">📍 Palais des Arts et Culture de Tanger</p>
        <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; display: inline-block;">
          <strong>‼ Entrée libre ‼</strong>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8f9ff; padding: 25px 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 14px; margin-bottom: 15px;">
        Nous avons hâte de vous y voir ! 🌟
      </p>
      <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
        
      </div>
      <p style="color: #999; font-size: 12px;">
        Cette invitation a été créée spécialement pour vous avec amour 💝
      </p>
    </div>
  </div>

</body>
</html>
            `,
            attachments: [
                {
                    filename: `${fullName}_Invitation.pdf`,
                    path: attachmentPath,
                    contentType: 'application/pdf'
                },
            ],
        };
        
        console.log(`Attempting to send email to: ${email}`);
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return info;
        
    } catch (error) {
        console.error(`Failed to send email to ${email}:`, error.message);
        throw error;
    }
};

const personalizeAndSendInvite = async (fullName, email, number) => {
    try {
        // Initialize assets if not already done
        await initializeAssets();
        
        // Load PDF from cache
        const pdfDoc = await PDFDocument.load(templateCache);
        
        // Register fontkit and embed font
        pdfDoc.registerFontkit(fontkit);
        const customFont = await pdfDoc.embedFont(fontCache);
        
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width } = firstPage.getSize();
        
        const name = fullName.toUpperCase();
        const fontSize = 33;
        const textWidth = customFont.widthOfTextAtSize(name, fontSize);
        const x = (width - textWidth) / 2 + 50;
        const y = 75;
        
        // Draw the name
        firstPage.drawText(name, {
            x,
            y,
            size: fontSize,
            font: customFont,
            color: rgb(0.784, 0.729, 0.678),
        });
        
        // Save PDF
        const pdfBytes = await pdfDoc.save();
        const pdfPath = `invites/${fullName}.pdf`;
        
        // Ensure directory exists
        const dir = path.dirname(pdfPath);
        await fs.mkdir(dir, { recursive: true });
        
        await fs.writeFile(pdfPath, pdfBytes);
        
        console.log(`Personalized invitation created for ${fullName}`);
        
        // Run email sending and user saving in parallel
        const [emailResult] = await Promise.all([
            sendEmailWithAttachment(fullName, email, pdfPath),
            saveUser(fullName, email, number)
        ]);
        
        console.log(`Invitation sent successfully to ${fullName} at ${email}`);
        return emailResult;
        
    } catch (error) {
        console.error('Error creating personalized invitation:', error);
        throw error;
    }
};

// Cleanup function to close transporter when done
const cleanup = () => {
    if (transporterCache) {
        transporterCache.close();
        transporterCache = null;
    }
};

module.exports = {
    personalizeAndSendInvite,
    sendEmailWithAttachment,
    cleanup
};