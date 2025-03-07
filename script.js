const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const submitBtn = document.getElementById('submit-btn');
const switchLink = document.getElementById('switch-link');
const switchText = document.getElementById('switch-text');
const errorContainer = document.getElementById('error-container');

// Additional form groups
const nameGroup = document.getElementById('name-group');
const roleGroup = document.getElementById('role-group');
const confirmPasswordGroup = document.getElementById('confirm-password-group');

// Form inputs
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const roleInputs = document.getElementsByName('role');

let isLoginMode = true;
const BASE_URL = "https://trsms-db.onrender.com/api/user"; // Ensure consistency

// Toggle between login and register
switchLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;

    if (isLoginMode) {
        authTitle.textContent = 'Login';
        submitBtn.textContent = 'Login';
        nameGroup.style.display = 'none';
        roleGroup.style.display = 'none';
        confirmPasswordGroup.style.display = 'none';
        switchText.textContent = "Don't have an account? ";
        switchLink.textContent = "Register";
    } else {
        authTitle.textContent = 'Register';
        submitBtn.textContent = 'Register';
        nameGroup.style.display = 'block';
        roleGroup.style.display = 'block';
        confirmPasswordGroup.style.display = 'block';
        switchText.textContent = "Already have an account? ";
        switchLink.textContent = "Login";
    }
    
    // Clear error messages and reset form
    errorContainer.textContent = '';
    authForm.reset();
});

// Form submission handler
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorContainer.textContent = '';

    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();

    if (!phone || !password) {
        errorContainer.textContent = "Phone number and password are required.";
        return;
    }

    let authData = { phone, password };

    // Registration Mode: Add extra fields
    if (!isLoginMode) {
        const name = nameInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const role = Array.from(roleInputs).find(radio => radio.checked)?.value;

        if (!name || !confirmPassword || !role) {
            errorContainer.textContent = "All fields are required.";
            return;
        }

        if (password !== confirmPassword) {
            errorContainer.textContent = "Passwords do not match.";
            return;
        }

        authData = { name, phone, password, role };
    }

    try {
        const endpoint = isLoginMode ? `${BASE_URL}/login` : `${BASE_URL}/register`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Authentication failed');
        }

        if (isLoginMode) {
            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // Redirect based on role
            window.location.href = data.user.role === 'admin' 
                ? '../admin/admin_dashboard.html' 
                : '../staff/staff_dashboard.html';
        } else {
            alert("Registration successful! Redirecting to login...");
            switchLink.click(); // Switch to login mode automatically
        }

        // Clear form after success
        authForm.reset();

    } catch (error) {
        errorContainer.textContent = error.message;
    }
});

// Profile dropdown handling
const profile = document.querySelector('.profile');
const dropdown = document.querySelector('.dropdown__wrapper');

if (profile && dropdown) {
    profile.addEventListener('click', () => {
        dropdown.classList.toggle('hide');
    });

    document.addEventListener("click", (event) => {
        if (!dropdown.contains(event.target) && !profile.contains(event.target)) {
            dropdown.classList.add('hide');
        }
    });
}
