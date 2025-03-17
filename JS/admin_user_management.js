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
            row.dataset.userId = user._id; // Ensure data-user-id is set

            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.phone}</td>
                <td>${user.role}</td>
                <td><span class="badge ${user.status === 'Active' ? 'badge-active' : 'badge-inactive'}">${user.status}</span></td>
                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-user" data-user-id="${user._id}">Edit</button>
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

// ✅ Event Delegation for Edit Button
document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("edit-user")) {
        const userId = event.target.dataset.userId;
        if (!userId) {
            console.error("User ID not found");
            return;
        }

        try {
            const response = await fetch(`https://trsms-db.onrender.com/api/user/${userId}`);
            if (!response.ok) throw new Error("Failed to fetch user data");

            const user = await response.json();

            // Populate form fields
            document.getElementById("modalTitle").textContent = "Edit User";
            document.getElementById("name").value = user.name;
            document.getElementById("phone").value = user.phone;
            document.getElementById("role").value = user.role;

            editingUserId = userId; // Set editing mode
            document.getElementById("userModal").style.display = "block";
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }
});
