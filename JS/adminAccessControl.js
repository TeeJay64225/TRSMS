document.addEventListener("DOMContentLoaded", function () {
    fetchUsers(); // Fetch users when the page loads
});

// Function to fetch users from the API
async function fetchUsers() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Unauthorized: Please log in again.");
            window.location.href = "index.html"; // Redirect to login page
            return;
        }

        // Show loading state
        showLoadingMessage("Loading users...", "usersTableBody");

        // Fetch users from API
        const response = await fetch("https://trsms-db.onrender.com/api/users", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert("Session expired. Please log in again.");
                localStorage.clear();
                window.location.href = "login.html";
                return;
            }
            throw new Error(`Failed to fetch users: ${response.statusText}`);
        }

        const users = await response.json();

        if (!Array.isArray(users)) {
            throw new Error("Unexpected API response: Users data is not an array");
        }

        renderUsers(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        showErrorMessage("Error fetching users. Please try again later.", "usersTableBody");
    }
}

// Function to render users in the table
function renderUsers(users) {
    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = "";

    if (!users.length) {
        tbody.innerHTML = `<tr><td colspan="6">No users found</td></tr>`;
        return;
    }

    users.forEach(user => {
        const status = user.status || (user.active ? "active" : "inactive"); // Support both `status` & `active`
        const isActive = status.toLowerCase() === "active";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user._id || "N/A"}</td>
            <td>${user.name || "N/A"}</td>
            <td>${user.phone || "N/A"}</td>
            <td>${user.role || "N/A"}</td>
            <td>
                <span style="color: ${isActive ? "green" : "red"};">
                    ${status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            </td>
            <td>
                <button class="btn btn-success ${isActive ? "hidden" : ""}" onclick="updateUserStatus('${user._id}', 'active')">Enable</button>
                <button class="btn btn-danger ${isActive ? "" : "hidden"}" onclick="updateUserStatus('${user._id}', 'inactive')">Disable</button>
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
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
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
