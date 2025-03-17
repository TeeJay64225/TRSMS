async function fetchTotalUsers() {
    try {
        const response = await fetch('https://trsms-db.onrender.com/api/user/count'); // Ensure backend route exists
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        document.getElementById('totalUsers').textContent = data.totalUsers || "0";
    } catch (error) {
        console.error('Error fetching total users:', error);
        document.getElementById('totalUsers').textContent = "Error";
    }
}

fetchTotalUsers();
