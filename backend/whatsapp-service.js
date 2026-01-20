const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.WHATSAPP_SERVICE_PORT || 3001;

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './whatsapp-session'
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let isReady = false;
let qrCodeUrl = null;

// Event handlers
client.on('qr', (qr) => {
    console.log('QR Code received, scan with your phone:');
    qrcode.generate(qr, { small: true });
    qrCodeUrl = qr;
});

client.on('ready', () => {
    console.log('WhatsApp client is ready!');
    isReady = true;
    qrCodeUrl = null;
});

client.on('authenticated', () => {
    console.log('WhatsApp client authenticated!');
});

client.on('auth_failure', (msg) => {
    console.error('Authentication failure:', msg);
    isReady = false;
});

client.on('disconnected', (reason) => {
    console.log('WhatsApp client disconnected:', reason);
    isReady = false;
});

// Initialize client
client.initialize().catch(err => {
    console.error('Error initializing WhatsApp client:', err);
});

// Helper function to format phone number
function formatPhoneNumber(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If it starts with 0, remove it
    if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
    }
    
    // If it doesn't start with country code, assume it's Indian number (91)
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
        cleaned = '91' + cleaned;
    }
    
    // Format as WhatsApp ID (country code + number)
    return cleaned + '@c.us';
}

// API endpoint to send WhatsApp message
app.post('/send-message', async (req, res) => {
    try {
        const { phone, message } = req.body;
        
        if (!phone || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone number and message are required' 
            });
        }
        
        if (!isReady) {
            return res.status(503).json({ 
                success: false, 
                error: 'WhatsApp client is not ready. Please scan QR code first.',
                qrCode: qrCodeUrl
            });
        }
        
        // Format phone number
        const chatId = formatPhoneNumber(phone);
        
        // Send message
        const result = await client.sendMessage(chatId, message);
        
        console.log(`Message sent to ${phone}: ${message}`);
        
        res.json({ 
            success: true, 
            messageId: result.id._serialized,
            message: 'WhatsApp message sent successfully'
        });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to send WhatsApp message'
        });
    }
});

// API endpoint to check status
app.get('/status', (req, res) => {
    res.json({
        ready: isReady,
        qrCode: qrCodeUrl
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
    console.log(`WhatsApp service running on port ${PORT}`);
    console.log(`Waiting for WhatsApp client to be ready...`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down WhatsApp service...');
    await client.destroy();
    process.exit(0);
});





