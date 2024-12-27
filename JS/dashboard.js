// Modal functionality
const modal = document.getElementById("invoiceModal");
const createInvoiceBtn = document.querySelector(".btn-primary");
const closeModal = document.querySelector(".close-modal");

createInvoiceBtn.addEventListener("click", () => {
	modal.style.display = "block";
});

closeModal.addEventListener("click", () => {
	modal.style.display = "none";
});

window.addEventListener("click", (event) => {
	if (event.target === modal) {
		modal.style.display = "none";
	}
});

// Mobile menu toggle
const mobileMenuBtn = document.createElement("button");
mobileMenuBtn.classList.add("mobile-menu");
mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
document.querySelector(".nav-container").appendChild(mobileMenuBtn);

mobileMenuBtn.addEventListener("click", () => {
	const sidebar = document.querySelector(".sidebar");
	sidebar.style.transform =
		sidebar.style.transform === "translateX(0%)"
			? "translateX(-100%)"
			: "translateX(0%)";
});

// Responsive table
const tables = document.querySelectorAll("table");
tables.forEach((table) => {
	const tableContainer = document.createElement("div");
	tableContainer.style.overflowX = "auto";
	table.parentNode.insertBefore(tableContainer, table);
	tableContainer.appendChild(table);
});


    const profile = document.querySelector(".profile");
		const dropdown = document.querySelector(".dropdown__wrapper");

		profile.addEventListener("click", () => {
			dropdown.classList.remove("none");
			dropdown.classList.toggle("hide");
		});

		document.addEventListener("click", (event) => {
			const isClickInsideDropdown = dropdown.contains(event.target);
			const isProfileClicked = profile.contains(event.target);

			if (!isClickInsideDropdown && !isProfileClicked) {
				dropdown.classList.add("hide");
				dropdown.classList.add("dropdown__wrapper--fade-in");
			}
		});