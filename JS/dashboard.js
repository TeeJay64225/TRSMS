// Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    const addUserControl = document.getElementById('add-user-control');
    const addUserModal = document.getElementById('add-user-modal');
    const cancelAddUser = document.getElementById('cancel-add-user');
    const closeModal = document.querySelector('.close-modal');
    const addUserForm = document.getElementById('add-user-form');
    const addUserError = document.getElementById('add-user-error');
    
    // Basic form elements
    const nameInput = document.getElementById('new-user-name');
    const phoneInput = document.getElementById('new-user-phone');
    const passwordInput = document.getElementById('new-user-password');
    const confirmPasswordInput = document.getElementById('new-user-confirm-password');
    const roleInputs = document.getElementsByName('new-user-role');
    
    // Open modal when clicking on the control item
    addUserControl.addEventListener('click', function() {
        addUserModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    });
    
    // Close modal functionality
    function closeAddUserModal() {
        addUserModal.style.display = 'none';
        document.body.style.overflow = ''; // Re-enable scrolling
        addUserForm.reset(); // Reset form
        addUserError.textContent = ''; // Clear any error messages
    }
    
    // Close modal when clicking the X
    closeModal.addEventListener('click', closeAddUserModal);
    
    // Close modal when clicking cancel button
    cancelAddUser.addEventListener('click', closeAddUserModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === addUserModal) {
            closeAddUserModal();
        }
    });
    
    // Form submission
    addUserForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        addUserError.textContent = '';
        
        // Get form values
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const role = Array.from(roleInputs).find(radio => radio.checked).value;
        
        // Validate form
        if (!name || !phone || !password || !confirmPassword) {
            addUserError.textContent = 'All fields are required';
            return;
        }
        
        if (password !== confirmPassword) {
            addUserError.textContent = 'Passwords do not match';
            return;
        }
        
        // Disable submit button and show loading state
        const submitBtn = document.getElementById('submit-add-user');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding User...';
        
        try {
            // API endpoint for adding new user
            const response = await fetch('https://trsms-db.onrender.com/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name,
                    phone,
                    password,
                    role
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to add user');
            }
            
            // Success - close modal and notify user
            alert('User added successfully!');
            closeAddUserModal();
            
            // Optionally refresh the user list if you have one on the page
            // refreshUserList();
            
        } catch (error) {
            addUserError.textContent = error.message || 'An error occurred while adding the user';
            console.error('Add user error:', error);
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add User';
        }
    });
});

// Mobile menu toggle
const mobileMenuBtn = document.createElement("button");
mobileMenuBtn.classList.add("mobile-menu");
mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
document.querySelector(".nav-container").appendChild(mobileMenuBtn);

mobileMenuBtn.addEventListener("click", () => {
	const sidebar = document.querySelector(".sidebar");
	sidebar.style.transform =
		sidebar.style.transform === "translateX(0%)"
			? "translateX(-100%)"
			: "translateX(0%)";
});

// Responsive table
const tables = document.querySelectorAll("table");
tables.forEach((table) => {
	const tableContainer = document.createElement("div");
	tableContainer.style.overflowX = "auto";
	table.parentNode.insertBefore(tableContainer, table);
	tableContainer.appendChild(table);
});


    const profile = document.querySelector(".profile");
		const dropdown = document.querySelector(".dropdown__wrapper");

		profile.addEventListener("click", () => {
			dropdown.classList.remove("none");
			dropdown.classList.toggle("hide");
		});

		document.addEventListener("click", (event) => {
			const isClickInsideDropdown = dropdown.contains(event.target);
			const isProfileClicked = profile.contains(event.target);

			if (!isClickInsideDropdown && !isProfileClicked) {
				dropdown.classList.add("hide");
				dropdown.classList.add("dropdown__wrapper--fade-in");
			}
		});