document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const messageInput = document.getElementById('messageInput');
    const titleInput = document.getElementById('titleInput');
    const sendBtn = document.getElementById('sendBtn');
    const statusMessage = document.getElementById('statusMessage');

    // Modal Elements
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.getElementById('closeModal');
    const modalPasswordInput = document.getElementById('modalPasswordInput');
    const modalSubmitBtn = document.getElementById('modalSubmitBtn');
    const modalErrorMessage = document.getElementById('modalErrorMessage');

    let savedPassword = localStorage.getItem("edith_password");

    // Main Send Trigger
    sendBtn.addEventListener('click', async () => {
        const text = messageInput.value.trim();
        if (!text) {
            showStatus('Please enter a message.', 'error');
            return;
        }

        if (savedPassword) {
            await sendMessage(savedPassword);
        } else {
            showModal();
        }
    });

    // Modal Logic
    function showModal() {
        loginModal.classList.add('show');
        modalPasswordInput.value = '';
        modalPasswordInput.focus();
        modalErrorMessage.textContent = '';
    }

    function hideModal() {
        loginModal.classList.remove('show');
    }

    closeModal.addEventListener('click', hideModal);

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) hideModal();
    });

    modalSubmitBtn.addEventListener('click', async () => {
        const password = modalPasswordInput.value.trim();
        if (!password) {
            modalErrorMessage.textContent = 'Password is required.';
            return;
        }
        
        modalSubmitBtn.disabled = true;
        modalSubmitBtn.textContent = 'Verifying...';
        
        const success = await sendMessage(password, true);
        
        if (!success) {
            modalSubmitBtn.disabled = false;
            modalSubmitBtn.textContent = 'Verify & Send';
        }
    });

    modalPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') modalSubmitBtn.click();
    });

    // Send Logic
    async function sendMessage(password, fromModal = false) {
        setLoading(true);
        const text = messageInput.value.trim();
        const title = titleInput.value.trim();

        try {
            const response = await fetch("/api/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, title, password })
            });

            const data = await response.json();

            if (data.success) {
                messageInput.value = '';
                titleInput.value = '';
                showStatus('Success! Message sent.', 'success');
                
                if (fromModal) {
                    localStorage.setItem("edith_password", password);
                    savedPassword = password;
                    hideModal();
                }
                return true;
            } else {
                if (fromModal) {
                    modalErrorMessage.textContent = 'Incorrect password.';
                } else {
                    showStatus('Authentication failed. Try again.', 'error');
                    localStorage.removeItem("edith_password");
                    savedPassword = null;
                }
                return false;
            }
        } catch (err) {
            console.error(err);
            const msg = 'Connection error. Check console.';
            if (fromModal) modalErrorMessage.textContent = msg;
            else showStatus(msg, 'error');
            return false;
        } finally {
            setLoading(false);
        }
    }

    function setLoading(isLoading) {
        sendBtn.disabled = isLoading;
        sendBtn.textContent = isLoading ? "Sending..." : "Send Message";
        if (!isLoading) {
            modalSubmitBtn.disabled = false;
            modalSubmitBtn.textContent = 'Verify & Send';
        }
    }

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status ${type}`;
        setTimeout(() => {
            statusMessage.style.opacity = '0';
            setTimeout(() => {
                statusMessage.textContent = '';
                statusMessage.style.opacity = '1';
                statusMessage.className = 'status';
            }, 300);
        }, 3000);
    }
});