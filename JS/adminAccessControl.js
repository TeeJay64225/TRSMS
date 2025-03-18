document.addEventListener("DOMContentLoaded", function () {
    fetchUsers(); // Fetch users when the page loads
});

// Function to fetch users from the API
async function fetchUsers() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Unauthorized: Please log in again.");
            return;
        }

        // Show loading state
        showLoadingMessage("Loading users...", "usersTableBody");

        // Fetch users from API
        const response = await fetch("https://trsms-db.onrender.com/api/users", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch users");
        }

        const users = await response.json();
        renderUsers(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        showErrorMessage("Error fetching users. Please try again later.", "usersTableBody");
    }
}

// Function to render users in the table
function renderUsers(userData) {
    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = "";

    if (!userData.length) {
        tbody.innerHTML = `<tr><td colspan="6">No users found</td></tr>`;
        return;
    }

    userData.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user._id}</td>
            <td>${user.name}</td>
            <td>${user.phone}</td>
            <td>${user.role}</td>
            <td>
                <span style="color: ${user.status === 'active' ? 'green' : 'red'};">
                    ${user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </span>
            </td>
            <td>
                <button class="btn btn-success" onclick="updateUserStatus('${user._id}', 'active')">Enable</button>
                <button class="btn btn-danger" onclick="updateUserStatus('${user._id}', 'disabled')">Disable</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to update user status (Enable/Disable)
async function updateUserStatus(userId, status) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Unauthorized: Please log in again.");
            return;
        }

        const response = await fetch(`https://trsms-db.onrender.com/api/users/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) {
            throw new Error("Failed to update user status");
        }

        alert(`User status updated to ${status}`);
        fetchUsers(); // Refresh users table
    } catch (error) {
        console.error("Error updating user status:", error);
        alert("Failed to update user status");
    }
}

// Helper function to show loading message
function showLoadingMessage(message, elementId) {
    document.getElementById(elementId).innerHTML = `<tr><td colspan="6">${message}</td></tr>`;
}

// Helper function to show error message
function showErrorMessage(message, elementId) {
    document.getElementById(elementId).innerHTML = `<tr><td colspan="6" style="color: red;">${message}</td></tr>`;
}
