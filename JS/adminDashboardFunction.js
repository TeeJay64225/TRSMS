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
