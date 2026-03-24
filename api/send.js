export default async function handler(req, res) {
    // Allow only POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, title, password } = req.body;

    // 🔐 Password protection
    if (password !== process.env.APP_PASSWORD) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    // Validate message
    if (!message) {
        return res.status(400).json({ error: "Message required" });
    }

    // Timestamp
    const time = new Date().toLocaleString();

    // Default format
    let formattedMessage = `📩 ${title || "New Entry"}\n🕒 ${time}\n\n${message}`;

    // If message is a link
    if (message.startsWith("http")) {
        formattedMessage = `🔗 Link\n🕒 ${time}\n\n${message}`;
    }

    try {
        // Send to Telegram
        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chat_id: process.env.CHAT_ID,
                    text: formattedMessage
                })
            }
        );

        const data = await telegramResponse.json();

        // Check Telegram success
        if (!data.ok) {
            return res.status(500).json({ success: false, error: data });
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ success: false });
    }
}