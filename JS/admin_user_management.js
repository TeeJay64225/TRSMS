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



   // Get all edit user buttons
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
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get user data from the row
            const row = this.closest('tr');
            const userId = row.dataset.userId || '';
            const name = row.querySelector('td:nth-child(1)').textContent.trim();
            const phone = row.querySelector('td:nth-child(2)').textContent.trim();
            const role = row.querySelector('td:nth-child(3)').textContent.trim().toLowerCase();
            const status = row.querySelector('td:nth-child(4)').textContent.trim().toLowerCase();
            
            // Populate the form with user data
            editUserIdInput.value = userId;
            editNameInput.value = name;
            editPhoneInput.value = phone;
            editPasswordInput.value = ''; // Clear password field
            
            // Set the correct role radio button
            Array.from(editRoleInputs).forEach(input => {
                input.checked = input.value === role;
            });
            
            // Set the correct status radio button
            Array.from(editStatusInputs).forEach(input => {
                input.checked = input.value === status;
            });
            
            // Show the modal
            editUserModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
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
            const userData = {
                name,
                phone,
                role,
                status
            };
            
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
                
                // Try to parse response as JSON
                let data;
                try {
                    data = await response.json();
                } catch (err) {
                    const text = await response.text();
                    throw new Error(text || 'Invalid server response');
                }
                
                if (!response.ok) {
                    throw new Error(data.error || data.message || 'Failed to update user');
                }
                
                // Success - close modal and notify user
                alert('User updated successfully!');
                closeEditUserModal();
                
                // Update the row in the table with new data
                const row = document.querySelector(`tr[data-user-id="${userId}"]`);
                if (row) {
                    row.querySelector('td:nth-child(1)').textContent = name;
                    row.querySelector('td:nth-child(2)').textContent = phone;
                    row.querySelector('td:nth-child(3)').textContent = role.charAt(0).toUpperCase() + role.slice(1);
                    row.querySelector('td:nth-child(4)').textContent = status.charAt(0).toUpperCase() + status.slice(1);
                } else {
                    // If row can't be found, reload the page to show updated data
                    window.location.reload();
                }
                
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