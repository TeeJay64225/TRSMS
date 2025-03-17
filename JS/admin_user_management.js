// Modal functionality
const modal = document.getElementById('userModal');
const addUserBtn = document.getElementById('addUserBtn');
const closeModal = document.querySelector('.close-modal');
const editUserBtns = document.querySelectorAll('.edit-user');
const userForm = document.getElementById('userForm');
const errorContainer = document.getElementById('error-container'); // For error messages

const BASE_URL = "https://trsms-db.onrender.com/api/user"; // Ensure API consistency
let editingUserId = null; // To track if we are editing a user

addUserBtn.addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'Add New User';
    userForm.reset();
    editingUserId = null; // Reset editing mode
    modal.style.display = 'block';
});

editUserBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Edit User';
        modal.style.display = 'block';

        // Fetch user details and populate form
        const userId = btn.dataset.userId;
        fetch(`${BASE_URL}/${userId}`)
            .then(response => response.json())
            .then(user => {
                document.getElementById('name').value = user.name;
                document.getElementById('phone').value = user.phone;
                document.getElementById('role').value = user.role;
                editingUserId = userId; // Set editing mode
            })
            .catch(error => console.error("Error fetching user data:", error));
    });
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Form submission handler
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorContainer.textContent = ''; // Clear previous errors

    // Collect form data
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const role = document.getElementById('role').value.trim();
    const password = document.getElementById('password') ? document.getElementById('password').value.trim() : "";

    if (!name || !phone || !role || (!editingUserId && !password)) {
        errorContainer.textContent = "All fields are required.";
        return;
    }

    const userData = { name, phone, role };
    if (!editingUserId) {
        userData.password = password; // Include password only for new users
    }

    try {
        const endpoint = editingUserId ? `${BASE_URL}/${editingUserId}` : BASE_URL;
        const method = editingUserId ? "PUT" : "POST";

        const response = await fetch(endpoint, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to save user");
        }

        alert(editingUserId ? "User updated successfully!" : "User added successfully!");
        modal.style.display = 'none';
        location.reload(); // Refresh to update user list
    } catch (error) {
        errorContainer.textContent = error.message;
    }
});



document.addEventListener('DOMContentLoaded', function() {
    // Get all edit user buttons
    const editButtons = document.querySelectorAll('.edit-user');
    const editUserModal = document.getElementById('edit-user-modal');
    const cancelEditUser = document.getElementById('cancel-edit-user');
    const closeEditModal = editUserModal?.querySelector('.close-modal');
    const editUserForm = document.getElementById('edit-user-form');
    const editUserError = document.getElementById('edit-user-error');
    
    // Edit form fields
    const editUserIdInput = document.getElementById('edit-user-id');
    const editNameInput = document.getElementById('edit-user-name');
    const editPhoneInput = document.getElementById('edit-user-phone');
    const editPasswordInput = document.getElementById('edit-user-password');
    const editRoleInputs = document.getElementsByName('edit-user-role');
    const editStatusInputs = document.getElementsByName('edit-user-status');
    
    // Add click handler to each edit button
    editButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // Get user ID from the data attribute
            const userId = this.getAttribute('data-id');
            
            if (!userId) {
                console.error('User ID not found');
                return;
            }
            
            try {
                // Fetch user data from the API
                const response = await fetch(`https://trsms-db.onrender.com/api/user/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch user: ${response.status}`);
                }
                
                const user = await response.json();
                
                // Populate the form with user data
                editUserIdInput.value = user._id;
                editNameInput.value = user.name || '';
                editPhoneInput.value = user.phone || '';
                editPasswordInput.value = ''; // Clear password field
                
                // Set the correct role radio button
                const role = (user.role || '').toLowerCase();
                Array.from(editRoleInputs).forEach(input => {
                    input.checked = input.value === role;
                });
                
                // Set the correct status radio button
                const status = (user.status || '').toLowerCase();
                Array.from(editStatusInputs).forEach(input => {
                    input.checked = input.value === status;
                });
                
                // Show the modal
                editUserModal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling
                
            } catch (error) {
                console.error('Error fetching user data:', error);
                alert('Failed to load user data. Please try again.');
            }
        });
    });
    
    // Close modal functionality
    function closeEditUserModal() {
        editUserModal.style.display = 'none';
        document.body.style.overflow = ''; // Re-enable scrolling
        editUserForm.reset(); // Reset form
        editUserError.textContent = ''; // Clear any error messages
    }
    
    // Close modal when clicking the X
    if (closeEditModal) {
        closeEditModal.addEventListener('click', closeEditUserModal);
    }
    
    // Close modal when clicking cancel button
    if (cancelEditUser) {
        cancelEditUser.addEventListener('click', closeEditUserModal);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === editUserModal) {
            closeEditUserModal();
        }
    });
    
    // Form submission
    if (editUserForm) {
        editUserForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            editUserError.textContent = '';
            
            // Get form values
            const userId = editUserIdInput.value;
            const name = editNameInput.value.trim();
            const phone = editPhoneInput.value.trim();
            const password = editPasswordInput.value.trim();
            const role = Array.from(editRoleInputs).find(radio => radio.checked)?.value;
            const status = Array.from(editStatusInputs).find(radio => radio.checked)?.value;
            
            // Validate form
            if (!name || !phone) {
                editUserError.textContent = 'Name and phone number are required';
                return;
            }
            
            // Disable submit button and show loading state
            const submitBtn = document.getElementById('submit-edit-user');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
            
            // Prepare data for API - only include password if provided
            const userData = { name, phone, role, status };
            if (password) {
                userData.password = password;
            }
            
            try {
                // API endpoint for updating user
                const response = await fetch(`https://trsms-db.onrender.com/api/user/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(userData)
                });
                
                let data;
                try {
                    data = await response.json();
                } catch (err) {
                    throw new Error('Invalid server response');
                }
                
                if (!response.ok) {
                    throw new Error(data.error || data.message || 'Failed to update user');
                }
                
                // Success - close modal and notify user
                alert('User updated successfully!');
                closeEditUserModal();
                
                // Refresh the page to show updated data
                window.location.reload();
                
            } catch (error) {
                editUserError.textContent = error.message || 'An error occurred while updating the user';
                console.error('Edit user error:', error);
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Changes';
            }
        });
    }
});


//table for users
document.addEventListener("DOMContentLoaded", async () => {
    const usersTableBody = document.querySelector(".table-container tbody");

    try {
        const response = await fetch("https://trsms-db.onrender.com/api/users", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const users = await response.json();

        // Clear existing table rows
        usersTableBody.innerHTML = "";

        if (users.length === 0) {
            usersTableBody.innerHTML = `<tr><td colspan="6">No users found</td></tr>`;
            return;
        }

        users.forEach(user => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.phone}</td>
                <td>${user.role}</td>
                <td><span class="badge ${user.status === 'Active' ? 'badge-active' : 'badge-inactive'}">${user.status}</span></td>
                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-user" data-user="${user.name}">Edit</button>
                    <button class="btn btn-sm btn-danger disable-user" data-id="${user._id}">${user.status === 'Active' ? 'Disable' : 'Enable'}</button>
                </td>
            `;

            usersTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading users:", error);
        usersTableBody.innerHTML = `<tr><td colspan="6">Error loading users</td></tr>`;
    }
});
