
const profile = document.querySelector('.profile');
const dropdown = document.querySelector('.dropdown__wrapper');

profile.addEventListener('click', () => {
    dropdown.classList.remove('none');
    dropdown.classList.toggle('hide');
})


document.addEventListener("click", (event) => {
    const isClickInsideDropdown = dropdown.contains(event.target);
    const isProfileClicked = profile.contains(event.target);

    if (!isClickInsideDropdown && !isProfileClicked) {
        dropdown.classList.add('hide');
        dropdown.classList.add('dropdown__wrapper--fade-in');
    }
});

//reliable
const BASE_URL = "https://trsms-db.onrender.com/auth"; // Replace with your actual backend URL

// User Registration
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const role = document.getElementById('role').value;
            const registerMessage = document.getElementById('registerMessage');

            if (password !== confirmPassword) {
                registerMessage.style.color = 'red';
                registerMessage.textContent = 'Passwords do not match';
                return;
            }

            try {
                const response = await fetch(`${BASE_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, phone, password, role })
                });

                const data = await response.json();
                if (response.ok) {
                    registerMessage.style.color = 'green';
                    registerMessage.textContent = 'Registration successful!';
                    setTimeout(() => window.location.href = 'index.html', 1000);
                } else {
                    registerMessage.style.color = 'red';
                    registerMessage.textContent = data.error || 'Registration failed';
                }
            } catch (error) {
                registerMessage.style.color = 'red';
                registerMessage.textContent = 'Network error, try again later.';
            }
        });
    }

    // User Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const loginMessage = document.getElementById('loginMessage');

            try {
                const response = await fetch(`${BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, password })
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('role', data.role);
                    localStorage.setItem('name', data.name);

                    loginMessage.style.color = 'green';
                    loginMessage.textContent = 'Login successful!';

                    setTimeout(() => {
                        if (data.role === 'admin') {
                            window.location.href = '../admin/admin_dashboard.html';
                        } else {
                            window.location.href = '../staff/staff_dashboard.html';
                        }
                    }, 1000);
                } else {
                    loginMessage.style.color = 'red';
                    loginMessage.textContent = data.error || 'Login failed';
                }
            } catch (error) {
                loginMessage.style.color = 'red';
                loginMessage.textContent = 'Network error, try again later.';
            }
        });
    }
});






