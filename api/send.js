export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, title } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message required" });
    }

    const time = new Date().toLocaleString();

    // Format message
    let formattedMessage = `📩 ${title || "New Entry"}\n🕒 ${time}\n\n${message}`;

    // If it's a link
    if (message.startsWith("http")) {
        formattedMessage = `🔗 Link\n🕒 ${time}\n\n${message}`;
    }

    try {
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

        // Optional: check Telegram success
        if (!data.ok) {
            return res.status(500).json({ success: false, error: data });
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false });
    }
}
