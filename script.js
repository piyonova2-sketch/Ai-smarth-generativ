document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements Auth
    const authModal = document.getElementById("auth-modal");
    const appContainer = document.getElementById("app-container");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const verifyForm = document.getElementById("verify-form");
    const toRegister = document.getElementById("to-register");
    const toLogin = document.getElementById("to-login");
    
    // DOM Chat Elements
    const chatWindow = document.getElementById("chat-window");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const micBtn = document.getElementById("mic-btn");
    const fileInput = document.getElementById("file-input");
    const previewContainer = document.getElementById("preview-container");
    const imagePreview = document.getElementById("image-preview");
    const removeImage = document.getElementById("remove-image");
    const aiMoodStatus = document.getElementById("ai-mood-status");

    let generatedSimulatedCode = "";
    let selectedImageBase64 = null;

    // API Key Gemini lu
    const GEMINI_API_KEY = "AQ.Ab8RN6KDhKrqs4ZfzqQ9IHR7a3OsOoX4o37XHnJwcaeoyae7vg";

    // Switch Forms
    toRegister.addEventListener("click", () => {
        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");
    });

    toLogin.addEventListener("click", () => {
        registerForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
    });

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        checkLocationAndEnter("Login Berhasil!");
    });

    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        generatedSimulatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        alert(`[SIMULASI GMAIL] Kode verifikasi: ${generatedSimulatedCode}`);
        registerForm.classList.add("hidden");
        verifyForm.classList.remove("hidden");
    });

    verifyForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const enteredCode = document.getElementById("verification-code").value;
        if (enteredCode === generatedSimulatedCode) {
            checkLocationAndEnter("Akun Berhasil Dibuat!");
        } else {
            alert("Kode salah bro!");
        }
    });

    function checkLocationAndEnter(successMessage) {
        alert(`${successMessage}\nMasuk ke AI Smarth Generativ...`);
        authModal.classList.add("hidden");
        appContainer.classList.remove("hidden");
    }

    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(uploadEvent) {
                selectedImageBase64 = uploadEvent.target.result;
                imagePreview.src = selectedImageBase64;
                previewContainer.classList.remove("hidden");
            }
            reader.readAsDataURL(file);
        }
    });

    removeImage.addEventListener("click", () => {
        selectedImageBase64 = null;
        imagePreview.src = "";
        previewContainer.classList.add("hidden");
        fileInput.value = "";
    });

    micBtn.addEventListener("click", () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Browser lu gak support voice recognition bro!");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        micBtn.style.color = "#ef4444";
        
        recognition.onresult = function(event) {
            userInput.value = event.results[0][0].transcript;
            micBtn.style.color = "#94a3b8";
        };
        recognition.onerror = () => { micBtn.style.color = "#94a3b8"; };
        recognition.start();
    });

    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text && !selectedImageBase64) return;

        appendMessage(text, 'user', selectedImageBase64);
        userInput.value = "";
        
        const currentImg = selectedImageBase64;
        selectedImageBase64 = null;
        previewContainer.classList.add("hidden");
        fileInput.value = "";

        aiMoodStatus.innerText = "AI Merasakan: Menghubungi Gemini...";
        appendMessage("🤖 Sedang berpikir...", 'ai');

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
            
            let contents = [{ parts: [{ text: text }] }];

            if (currentImg) {
                const base64Data = currentImg.split(',')[1];
                const mimeType = currentImg.split(';')[0].split(':')[1];
                contents = [{
                    parts: [
                        { text: text || "Jelaskan gambar ini." },
                        { inline_data: { mime_type: mimeType, data: base64Data } }
                    ]
                }];
            }

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: contents })
            });

            const data = await response.json();
            chatWindow.lastChild.remove(); 

            if (data.candidates && data.candidates[0].content.parts[0].text) {
                const reply = data.candidates[0].content.parts[0].text;
                appendMessage(reply, 'ai');
                aiMoodStatus.innerText = "AI Mood: Aktif & Nyambung 🔥";
            } else {
                appendMessage("Duh, respons Gemini kosong atau error nih.", 'ai');
                aiMoodStatus.innerText = "AI Mood: Kendala API";
            }
        } catch (error) {
            chatWindow.lastChild.remove();
            appendMessage("Gagal konek ke Gemini API! Cek koneksi internet lu.", 'ai');
            aiMoodStatus.innerText = "AI Mood: Offline";
        }
    }

    function appendMessage(text, sender, img = null) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender === 'user' ? "user-message" : "ai-message");

        let imgHtml = img ? `<img src="${img}" style="max-width:100%; border-radius:8px; margin-bottom:8px;">` : "";
        
        messageDiv.innerHTML = `<div class="bubble">${imgHtml}${text}</div>`;
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return messageDiv;
    }
});
