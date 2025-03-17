async function fetchTotalUsers() {
    const totalUsersElement = document.getElementById('total-users-count');

    try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token missing');
        }

        // Fetch total user count
        const response = await fetch('https://trsms-db.onrender.com/api/users/count', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user count');
        }

        const data = await response.json();

        // Update the UI with total user count
        totalUsersElement.textContent = data.totalUsers ?? 'N/A';
    } catch (error) {
        console.error('Error fetching total users:', error);
        totalUsersElement.textContent = 'Error';
    }
}

document.addEventListener('DOMContentLoaded', fetchTotalUsers);

//Users Table
document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.querySelector(".user-management-table tbody");

    try {
        const response = await fetch("https://trsms-db.onrender.com/api/users", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`, // Ensure token is stored
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const users = await response.json();

        // Clear existing table rows
        tableBody.innerHTML = "";

        if (users.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5">No users found</td></tr>`;
            return;
        }

        users.forEach(user => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${user.name || "N/A"}</td>
                <td>${user.role || "N/A"}</td>
                <td>${user.lastActive || "N/A"}</td>
                <td><span class="badge ${user.status === "Active" ? "badge-success" : "badge-warning"}">${user.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary edit-user">Edit</button>
                    <button class="btn btn-sm btn-danger delete-user" data-id="${user._id}">Disable</button>
                </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading users:", error);
        tableBody.innerHTML = `<tr><td colspan="5">Error loading users</td></tr>`;
    }
});


//system Logs
document.addEventListener("DOMContentLoaded", async () => {
    const logsTableBody = document.querySelector(".table-container tbody");

    try {
        const response = await fetch("https://trsms-db.onrender.com/api/logs", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch logs: ${response.status}`);
        }

        const logs = await response.json();

        // Clear existing table rows
        logsTableBody.innerHTML = "";

        if (logs.length === 0) {
            logsTableBody.innerHTML = `<tr><td colspan="4">No logs found</td></tr>`;
            return;
        }

        logs.forEach(log => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${new Date(log.timestamp).toLocaleString()}</td>
                <td>${log.user || "System"}</td>
                <td>${log.action}</td>
                <td>${log.details}</td>
            `;

            logsTableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading logs:", error);
        logsTableBody.innerHTML = `<tr><td colspan="4">Error loading logs</td></tr>`;
    }
});
