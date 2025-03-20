import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import cors from "cors";
import bodyParser from "body-parser";

// Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder
dotenv.config({ path: path.resolve(__dirname, "./.env") });

console.log("🔍 DEBUG: EMAIL =", process.env.EMAIL);
console.log("🔍 DEBUG: EMAIL_PASSWORD =", process.env.EMAIL_PASSWORD ? "✅ Loaded" : "❌ Missing!");

// Initialize Express
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Email Sending Endpoint
app.post("/send-order", async (req, res) => {
    const { email, cartItems } = req.body;

    if (!email || !cartItems.length) {
        return res.status(400).json({ error: "Invalid request. Email and cart items are required." });
    }

    // 📦 Format Order Details
    let orderDetails = cartItems.map(
        (item) => `🛒 ${item.title} - $${item.price} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`
    ).join("\n");

    const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

    const emailContent = `
        📢 Order Confirmation
        --------------------------------
        ${orderDetails}
        --------------------------------
        🏷️ Total Amount: $${totalAmount}
        
        Thank you for shopping with us!
    `;

    try {
        // 🔑 Configure Nodemailer Transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // ✉️ Send Email
        const mailOptions = {
            from: `"Shop Cart" <${process.env.EMAIL}>`,
            to: email,
            subject: "🛍️ Your Order Confirmation",
            text: emailContent,
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Order email sent successfully!");

        res.status(200).json({ message: "Order email sent successfully!" });
    } catch (error) {
        console.error("⚠️ Error sending email:", error);
        res.status(500).json({ error: "Failed to send order. Try again." });
    }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
