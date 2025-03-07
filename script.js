

document.addEventListener("click", (event) => {
    const isClickInsideDropdown = dropdown.contains(event.target);
    const isProfileClicked = profile.contains(event.target);

    if (!isClickInsideDropdown && !isProfileClicked) {
        dropdown.classList.add('hide');
        dropdown.classList.add('dropdown__wrapper--fade-in');
    }
});
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const submitBtn = document.getElementById('submit-btn');
const switchLink = document.getElementById('switch-link');
const switchText = document.getElementById('switch-text');
const errorContainer = document.getElementById('error-container');

// Additional form groups
const nameGroup = document.getElementById('name-group');
const confirmPasswordGroup = document.getElementById('confirm-password-group');
const roleGroup = document.getElementById('role-group');

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
        nameGroup.classList.add('hidden');
        confirmPasswordGroup.classList.add('hidden');
        roleGroup.classList.add('hidden');
        switchText.textContent = "Don't have an account? ";
        switchLink.textContent = "Register";
    } else {
        authTitle.textContent = 'Register';
        submitBtn.textContent = 'Register';
        nameGroup.classList.remove('hidden');
        confirmPasswordGroup.classList.remove('hidden');
        roleGroup.classList.remove('hidden');
        switchText.textContent = "Already have an account? ";
        switchLink.textContent = "Login";
    }

    errorContainer.textContent = ''; // Clear error messages
});

// Form submission handler
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorContainer.textContent = '';

    const authData = {
        phone: phoneInput.value,
        password: passwordInput.value
    };

    // Registration: add extra fields
    if (!isLoginMode) {
        if (passwordInput.value !== confirmPasswordInput.value) {
            errorContainer.textContent = "Passwords do not match.";
            return;
        }

        authData.name = nameInput.value;
        authData.role = Array.from(roleInputs).find(radio => radio.checked).value;
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

        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect based on role
        window.location.href = data.user.role === 'admin' ? '../admin/admin_dashboard.html' : '../staff/staff_dashboard.html';
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
