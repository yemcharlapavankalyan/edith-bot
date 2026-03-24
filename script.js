document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const titleInput = document.getElementById('titleInput');
    const sendBtn = document.getElementById('sendBtn');
    const statusMessage = document.getElementById('statusMessage');

    sendBtn.addEventListener('click', async () => {
        const text = messageInput.value.trim();
        const title = titleInput.value.trim();

        if (!text) {
            showStatus('Please enter a message.', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: text, title })
            });

            const data = await response.json();

            if (data.success) {
                messageInput.value = '';
                titleInput.value = '';
                showStatus('Message sent!', 'success');
            } else {
                showStatus('Failed to send.', 'error');
            }

        } catch (err) {
            console.error(err);
            showStatus('Server error.', 'error');
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        sendBtn.disabled = isLoading;
        sendBtn.textContent = isLoading ? "Sending..." : "Send";
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status ${type}`;
    }
});