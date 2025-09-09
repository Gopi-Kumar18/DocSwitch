import { express } from '../utils/coreModules.js';
import { nodemailer } from '../utils/coreModules.js';

import ContactMessage from "../models/ContactMessage.js";

const router = express.Router();

let transporter;
if (
  process.env.EMAIL_HOST &&
  process.env.EMAIL_PORT &&
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS
) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

router.post("/", async (req, res) => {
  const { enquiryType, fullName, email, countryCode, phone, message } = req.body;

  if (
    !enquiryType ||
    enquiryType !== "grievance" ||
    !fullName ||
    !email ||
    !countryCode ||
    !phone ||
    !message
  ) {
    return res.status(400).json({ error: "All fields are required and must be valid." });
  }

  try {
    const newContact = new ContactMessage({
      enquiryType,
      fullName,
      email,
      countryCode,
      phone,
      message,
    });
    await newContact.save();

    if (transporter) {
      const mailOptions = {
        from: `"DocSwitch Grievance Box" <${process.env.EMAIL_USER}>`,
        to: "gptz1811@gmail.com",
        subject: "New Grievance Submitted",
        text: `
A new grievance was submitted via the Grievance Box:

Full Name: ${fullName}
Email: ${email}
Phone: ${countryCode} ${phone}
Message:
${message}

-------------------------
This is an automatic notification from DocSwitch.
        `,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Error sending email notification:", err);
        } else {
          console.log("Notification email sent:", info.response);
        }
      });
    }

    return res.status(201).json({ message: "Grievance submitted successfully." });
  } catch (error) {
    console.error("Error saving grievance:", error);
    return res.status(500).json({ error: "Server error. Please try again later." });
  }
});

export default router;
