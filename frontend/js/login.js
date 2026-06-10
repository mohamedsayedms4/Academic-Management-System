document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    // Toggle Password Visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        // Optional: Update eye icon visual if needed
    });

    // Handle Form Submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = passwordInput.value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Reset error message
        errorMessage.innerText = '';

        const btn = loginForm.querySelector('.btn-login');
        const originalText = btn.innerText;
        btn.innerText = 'Logging in...';
        btn.disabled = true;

        try {
            const response = await fetch('https://dirictiondback.digitalrace.net/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed. Please check your credentials.');
            }

            const data = await response.json();

            // Success! Store JWT and User Data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                id: data.id,
                username: data.username,
                role: data.role,
                fullName: data.fullName // Assuming you add this to AuthResponse
            }));

            if (rememberMe) {
                localStorage.setItem('rememberedUser', username);
            }

            // Redirect to main dashboard
            window.location.href = 'index.html';

        } catch (error) {
            errorMessage.innerText = error.message;
            console.error('Login error:', error);
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
});
