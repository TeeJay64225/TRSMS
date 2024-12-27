// DOM Elements
const loginContainer = document.getElementById("loginContainer");
const dashboardContainer = document.getElementById("dashboardContainer");
const loginForm = document.getElementById("loginForm");
const recoveryForm = document.getElementById("recoveryForm");
const addUserModal = document.getElementById("addUserModal");
const addUserForm = document.getElementById("addUserForm");
const searchUsers = document.getElementById("searchUsers");
const alertBox = document.getElementById("alertBox");
const logoutBtn = document.getElementById("logoutBtn");
const usersTableBody = document.getElementById("usersTableBody");
const addUserBtn = document.getElementById("addUserBtn");

// Mock Database
let users = [
	{
		id: 1,
		name: "Admin User",
		phone: "+1 555-0100",
		role: "admin",
		status: "active",
		password: "admin123",
	},
	{
		id: 2,
		name: "Staff User",
		phone: "+1 555-0101",
		role: "staff",
		status: "active",
		password: "staff123",
	},
];

// Session Management
let currentUser = null;

// Utility Functions
function showAlert(message, type = "error") {
	alertBox.textContent = message;
	alertBox.className = `alert-box ${type}`;
	setTimeout(() => {
		alertBox.className = "alert-box";
	}, 3000);
}

function validatePhoneNumber(phone) {
	const phoneRegex = /^\+?[\d\s-]{10,}$/;
	return phoneRegex.test(phone);
}

// Tab Switching
document.querySelectorAll(".tab-btn").forEach((button) => {
	button.addEventListener("click", () => {
		document
			.querySelectorAll(".tab-btn")
			.forEach((btn) => btn.classList.remove("active"));
		document
			.querySelectorAll(".tab-content")
			.forEach((content) => content.classList.remove("active"));

		button.classList.add("active");
		document
			.getElementById(`${button.dataset.tab}Form`)
			.classList.add("active");
	});
});

// Login Form Submit
loginForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const phone = document.getElementById("phoneNumber").value;
	const password = document.getElementById("password").value;

	if (!validatePhoneNumber(phone)) {
		showAlert("Invalid phone number format");
		return;
	}

	const user = users.find((u) => u.phone === phone && u.password === password);
	if (user) {
		currentUser = user;
		showAlert("Login successful!", "success");
		setTimeout(() => {
			loginContainer.classList.add("hidden");
			dashboardContainer.classList.remove("hidden");
			document.getElementById("userDisplayName").textContent = user.name;
			renderUsersTable();
		}, 1000);
	} else {
		showAlert("Invalid credentials");
	}
});

// Recovery Form Submit
recoveryForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const phone = document.getElementById("recoveryPhone").value;

	if (!validatePhoneNumber(phone)) {
		showAlert("Invalid phone number format");
		return;
	}

	const user = users.find((u) => u.phone === phone);
	if (user) {
		showAlert("Recovery instructions sent to your phone", "success");
		// In a real application, this would trigger an SMS or email
	} else {
		showAlert("No account found with this phone number");
	}
});

// Logout
logoutBtn.addEventListener("click", () => {
	currentUser = null;
	dashboardContainer.classList.add("hidden");
	loginContainer.classList.remove("hidden");
	loginForm.reset();
});

// User Management
function renderUsersTable(filterText = "") {
	const filteredUsers = users.filter(
		(user) =>
			user.name.toLowerCase().includes(filterText.toLowerCase()) ||
			user.phone.includes(filterText)
	);

	usersTableBody.innerHTML = filteredUsers
		.map(
			(user) => `
        <tr>
            <td>${user.name}</td>
            <td>${user.phone}</td>
            <td><span class="badge ${
							user.role === "admin" ? "admin" : "staff"
						}">${user.role}</span></td>
            <td><span class="badge ${user.status}">${user.status}</span></td>
            <td>
                <button onclick="editUser(${user.id})" class="action-btn edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteUser(${
									user.id
								})" class="action-btn delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
		)
		.join("");
}

// Search Users
searchUsers.addEventListener("input", (e) => {
	renderUsersTable(e.target.value);
});

// Add User Modal
addUserBtn.addEventListener("click", () => {
	addUserModal.classList.add("active");
});

document.querySelector(".close-btn").addEventListener("click", () => {
	addUserModal.classList.remove("active");
	addUserForm.reset();
});

document.querySelector(".cancel-btn").addEventListener("click", () => {
	addUserModal.classList.remove("active");
	addUserForm.reset();
});

// Add User Form Submit
addUserForm.addEventListener("submit", (e) => {
	e.preventDefault();

	const newUser = {
		id: users.length + 1,
		name: document.getElementById("newUserName").value,
		phone: document.getElementById("newUserPhone").value,
		role: document.getElementById("newUserRole").value,
		password: document.getElementById("newUserPassword").value,
		status: "active",
	};

	if (!validatePhoneNumber(newUser.phone)) {
		showAlert("Invalid phone number format");
		return;
	}

	// Check if phone number already exists
	if (users.some((user) => user.phone === newUser.phone)) {
		showAlert("Phone number already registered");
		return;
	}

	users.push(newUser);
	renderUsersTable();
	addUserModal.classList.remove("active");
	addUserForm.reset();
	showAlert("User added successfully", "success");
});

// Edit User
function editUser(id) {
	const user = users.find((u) => u.id === id);
	if (user && currentUser.role === "admin") {
		// In a real application, you would show an edit modal
		console.log("Editing user:", user);
	}
}

// Delete User
function deleteUser(id) {
	if (currentUser.role !== "admin") {
		showAlert("Only administrators can delete users");
		return;
	}

	if (currentUser.id === id) {
		showAlert("You cannot delete your own account");
		return;
	}

	if (confirm("Are you sure you want to delete this user?")) {
		users = users.filter((user) => user.id !== id);
		renderUsersTable();
		showAlert("User deleted successfully", "success");
	}
}

// Initial render
renderUsersTable();

// Add these styles to your CSS
const additionalStyles = `
.badge {
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
}

.badge.admin {
    background: #e0f2fe;
    color: #0369a1;
}

.badge.staff {
    background: #f3e8ff;
    color: #7e22ce;
}

.badge.active {
    background: #dcfce7;
    color: #16a34a;
}

.action-btn {
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin: 0 2px;
}

.action-btn.edit {
    background: #e0f2fe;
    color: #0369a1;
}

.action-btn.delete {
    background: #fee2e2;
    color: #dc2626;
}
`;

// Create and append style element
const styleElement = document.createElement("style");
styleElement.textContent = additionalStyles;
document.head.appendChild(styleElement);
