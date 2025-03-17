async function fetchTotalUsers() {
    try {
        const response = await fetch('https://trsms-db.onrender.com/api/user'); // Use the correct backend URL
        const data = await response.json();
        document.getElementById('totalUsers').textContent = data.totalUsers;
    } catch (error) {
        console.error('Error fetching total users:', error);
        document.getElementById('totalUsers').textContent = "Error";
    }
}

fetchTotalUsers();