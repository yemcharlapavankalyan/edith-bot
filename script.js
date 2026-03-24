document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');
    const titleInput = document.getElementById('titleInput');
    const passwordInput = document.getElementById('passwordInput');
    const sendBtn = document.getElementById('sendBtn');
    const statusMessage = document.getElementById('statusMessage');

    // 🔐 Check if password already saved
    let savedPassword = localStorage.getItem("edith_password");

    if (savedPassword) {
        passwordInput.style.display = "none";
    }

    sendBtn.addEventListener('click', async () => {
        const text = messageInput.value.trim();
        const title = titleInput.value.trim();
        let password = savedPassword || passwordInput.value.trim();

        if (!text) {
            showStatus('Please enter a message.', 'error');
            return;
        }

        if (!password) {
            showStatus('Enter password.', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: text,
                    title,
                    password
                })
            });

            const data = await response.json();

            if (data.success) {
                messageInput.value = '';
                titleInput.value = '';
                showStatus('Message sent!', 'success');

                // 🔐 Save password after first success
                if (!savedPassword) {
                    localStorage.setItem("edith_password", password);
                    passwordInput.style.display = "none";
                    savedPassword = password;
                }

            } else {
                showStatus('Wrong password.', 'error');
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