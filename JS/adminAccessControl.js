// User management functions


// Function to fetch users from the API
async function fetchUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://trsms-db.onrender.com/api/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const users = await response.json();
        populateUserTable(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        showNotification('Error fetching users. Please try again.', 'error');
    }
}

// Function to populate users table dynamically
function populateUserTable(users) {
    const tableBody = document.querySelector('.table tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    if (users.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="6" class="text-center">No users found</td>`;
        tableBody.appendChild(emptyRow);
        return;
    }

    users.forEach(user => {
        const isActive = user.active || user.status === 'active'; // Support `active` or `status`

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user._id || 'N/A'}</td>
            <td>${user.name || 'N/A'}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>${user.role || 'N/A'}</td>
            <td>
                <span style="color: ${isActive ? 'green' : 'red'};">
                    ${isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <button class="btn btn-success ${isActive ? 'hidden' : ''}" onclick="toggleUserStatus('${user._id}', true)">Enable</button>
                <button class="btn btn-danger ${isActive ? '' : 'hidden'}" onclick="toggleUserStatus('${user._id}', false)">Disable</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Function to toggle user status (Enable/Disable)
async function toggleUserStatus(userId, setActive) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://trsms-db.onrender.com/api/users/${userId}`, {
            method: 'PATCH', // Use PATCH instead of PATCH/toggle-status/
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ active: setActive })
        });

        if (!response.ok) {
            throw new Error('Failed to update user status');
        }

        // Show success notification
        const message = setActive ? 'User enabled successfully' : 'User disabled successfully';
        showNotification(message, 'success');

        // Refresh the user list
        fetchUsers();
    } catch (error) {
        console.error('Error updating user status:', error);
        showNotification('Error updating user status. Please try again.', 'error');
    }
}

// Helper function to show notifications
function showNotification(message, type = 'info') {
    let notificationContainer = document.querySelector('.notification-container');

    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notificationContainer.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fadeOut');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// CSS styles
const style = document.createElement('style');
style.textContent = `
    .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
    }
    .notification {
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        animation: fadeIn 0.3s ease;
    }
    .notification.success {
        background-color: #d1fae5;
        color: #065f46;
        border-left: 4px solid #10b981;
    }
    .notification.error {
        background-color: #fee2e2;
        color: #991b1b;
        border-left: 4px solid #ef4444;
    }
    .notification.info {
        background-color: #e0f2fe;
        color: #0369a1;
        border-left: 4px solid #0ea5e9;
    }
    .notification.fadeOut {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .hidden {
        display: none;
    }
`;
document.head.appendChild(style);
