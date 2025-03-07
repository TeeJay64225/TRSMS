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
    
    // Disable submit button to prevent multiple submissions
    submitBtn.disabled = true;
    submitBtn.textContent = isLoginMode ? 'Logging in...' : 'Registering...';

    try {
        const phone = phoneInput.value.trim();
        const password = passwordInput.value.trim();

        if (!phone || !password) {
            throw new Error("Phone number and password are required.");
        }

        let authData = { phone, password };
        let endpoint = `${BASE_URL}/login`;

        // Registration Mode: Add extra fields
        if (!isLoginMode) {
            const name = nameInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();
            const role = Array.from(roleInputs).find(radio => radio.checked)?.value;

            if (!name) {
                throw new Error("Name is required.");
            }
            
            if (!role) {
                throw new Error("Please select a role.");
            }

            if (!confirmPassword) {
                throw new Error("Please confirm your password.");
            }

            if (password !== confirmPassword) {
                throw new Error("Passwords do not match.");
            }

            authData = { 
                name, 
                phone, 
                password, 
                role 
            };
            
            endpoint = `${BASE_URL}/register`;
            
            console.log("Sending registration data:", authData);
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(authData)
        });

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        let data;
        
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // Handle non-JSON response
            const textResponse = await response.text();
            console.log("Non-JSON response:", textResponse);
            data = { error: "Unexpected server response" };
        }

        if (!response.ok) {
            throw new Error(data.error || data.message || `Authentication failed (${response.status})`);
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
            // Registration successful
            alert("Registration successful! You can now log in.");
            isLoginMode = true;
            authTitle.textContent = 'Login';
            submitBtn.textContent = 'Login';
            nameGroup.style.display = 'none';
            roleGroup.style.display = 'none';
            confirmPasswordGroup.style.display = 'none';
            switchText.textContent = "Don't have an account? ";
            switchLink.textContent = "Register";
        }

        // Clear form after success
        authForm.reset();

    } catch (error) {
        console.error("Authentication error:", error);
        errorContainer.textContent = error.message || "An unexpected error occurred";
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = isLoginMode ? 'Login' : 'Register';
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