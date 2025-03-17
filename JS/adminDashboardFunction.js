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




document.addEventListener("DOMContentLoaded", async () => {
    const tableBody = document.querySelector("tbody");

    try {
        const response = await fetch("https://trsms-db.onrender.com/api/users");
        const users = await response.json();

        if (!Array.isArray(users)) {
            console.error("Unexpected response format:", users);
            return;
        }

        tableBody.innerHTML = ""; // Clear existing table data

        users.forEach(user => {
            const lastActive = user.lastActive || "N/A"; // Handle missing last active time
            const status = user.status === "active" ? 
                '<span class="badge badge-success">Active</span>' : 
                '<span class="badge badge-danger">Inactive</span>';

            const row = `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.phone}</td>
                    <td>${user.role}</td>
                    <td>${lastActive}</td>
                    <td>${status}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-user">Active</button>
                        <button class="btn btn-sm btn-danger">Disable</button>
                    </td>
                </tr>
            `;

            tableBody.innerHTML += row;
        });

    } catch (error) {
        console.error("Error fetching users:", error);
    }
});

