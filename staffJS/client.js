// DOM Elements
const addClientBtn = document.getElementById("addClientBtn");
const addClientModal = document.getElementById("addClientModal");
const clientModalBackdrop = document.getElementById("clientModalBackdrop");
const closeClientModalBtn = document.getElementById("closeClientModal");
const cancelClientBtn = document.getElementById("cancelClientBtn");
const addClientForm = document.getElementById("addClientForm");
const clientFormMessage = document.getElementById("clientFormMessage");
const saveClientBtn = document.getElementById("saveClientBtn");

// Base URL for API
const API_BASE_URL = "https://trsms-db.onrender.com/api/clients"; // Ensure correct API path

// Function to open the modal
function openClientModal() {
  addClientModal.classList.add("show");
  clientModalBackdrop.classList.add("show");
  document.body.style.overflow = "hidden"; // Prevent scrolling of the background
}

// Function to close the modal
function closeClientModal() {
  addClientModal.classList.remove("show");
  clientModalBackdrop.classList.remove("show");
  document.body.style.overflow = "";
  resetForm();
}

// Function to reset the form and clear messages
function resetForm() {
  addClientForm.reset();
  clientFormMessage.textContent = "";
  clientFormMessage.classList.remove("success", "error");
}

// Function to display messages in the form
function showMessage(message, isSuccess = false) {
  clientFormMessage.textContent = message;
  clientFormMessage.classList.toggle("success", isSuccess);
  clientFormMessage.classList.toggle("error", !isSuccess);
}

// Function to validate form data
function validateForm(formData) {
  if (!formData.name.trim()) {
    showMessage("Client name is required");
    return false;
  }
  if (!formData.phone.trim()) {
    showMessage("Phone number is required");
    return false;
  }
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    showMessage("Please enter a valid email address");
    return false;
  }
  return true;
}

// Event listener for opening the modal
addClientBtn?.addEventListener("click", openClientModal);

// Event listeners for closing the modal
closeClientModalBtn?.addEventListener("click", closeClientModal);
cancelClientBtn?.addEventListener("click", closeClientModal);
clientModalBackdrop?.addEventListener("click", closeClientModal);

// Prevent closing when clicking inside the modal content
addClientModal?.addEventListener("click", (e) => e.stopPropagation());

// Form submission handler
addClientForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form data
  const formData = {
    name: document.getElementById("clientName").value.trim(),
    email: document.getElementById("clientEmail").value.trim(),
    phone: document.getElementById("clientPhone").value.trim(),
    address: document.getElementById("clientAddress").value.trim(),
    company: document.getElementById("companyName").value.trim(),
    truckDetails: document.getElementById("truckDetails").value.trim(),
  };

  // Validate form data
  if (!validateForm(formData)) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      showMessage("Unauthorized: Please log in again.");
      setTimeout(() => (window.location.href = "../index.html"), 2000);
      return;
    }

    saveClientBtn.disabled = true; // Disable button during API request

    // API request to create client
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to add client");

    // Show success message and reload client list
    showMessage("Client added successfully!", true);
    setTimeout(() => {
      closeClientModal();
      typeof loadClients === "function" ? loadClients() : window.location.reload();
    }, 1500);
  } catch (error) {
    console.error("Error adding client:", error);
    showMessage(error.message || "An error occurred. Please try again.");
  } finally {
    saveClientBtn.disabled = false;
  }
});

// Close modal when pressing ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && addClientModal.classList.contains("show")) {
    closeClientModal();
  }
});



//Clients Details Display in cards
document.addEventListener("DOMContentLoaded", function () {
    fetchClients(); // Fetch clients when the page loads
});

// Function to fetch clients from the API
async function fetchClients() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Unauthorized: Please log in again.");
            return;
        }

        // Show loading message
        showLoadingMessage("Loading clients...", "clientGrid");

        // Fetch clients from API
        const response = await fetch("https://trsms-db.onrender.com/api/clients", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch clients");
        }

        const clients = await response.json();
        renderClients(clients);
    } catch (error) {
        console.error("Error fetching clients:", error);
        showErrorMessage("Error fetching clients. Please try again later.", "clientGrid");
    }
}

// Function to render clients in the grid
function renderClients(clientData) {
    const clientGrid = document.getElementById("clientGrid");
    clientGrid.innerHTML = ""; // Clear existing content

    if (!clientData.length) {
        clientGrid.innerHTML = `<div class="no-clients">No clients found</div>`;
        return;
    }

    clientData.forEach(client => {
        const clientCard = document.createElement("div");
        clientCard.classList.add("client-card");

        // Extract initials from client name
        const initials = client.name
            ? client.name.split(" ").map(word => word[0]).join("").toUpperCase()
            : "C";

        clientCard.innerHTML = `
            <div class="client-card-header">
                <div class="client-avatar">${initials}</div>
                <div class="client-actions">
                    <button class="btn btn-small view-client" data-id="${client._id}">View</button>
                    <button class="btn btn-small edit-client" data-id="${client._id}">Edit</button>
                </div>
            </div>
            <div class="client-details">
                <h3>${client.name || "Unknown Client"}</h3>
                <div class="client-detail">
                    <i class="fas fa-envelope"></i>
                    ${client.email || "No Email"}
                </div>
                <div class="client-detail">
                    <i class="fas fa-phone"></i>
                    ${client.phone || "No Phone"}
                </div>
                <div class="client-detail">
                    <i class="fas fa-truck"></i>
                    Active Vehicles: ${client.vehicles || "N/A"}
                </div>
                <div class="client-detail">
                    <span class="badge ${client.status === "active" ? "badge-success" : "badge-danger"}">
                        ${client.status ? client.status.charAt(0).toUpperCase() + client.status.slice(1) : "Inactive"}
                    </span>
                </div>
            </div>
        `;

        clientGrid.appendChild(clientCard);
    });

    // Attach event listeners for view and edit buttons
    document.querySelectorAll(".view-client").forEach(button => {
        button.addEventListener("click", function () {
            const clientId = this.getAttribute("data-id");
            viewClientDetails(clientId);
        });
    });

    document.querySelectorAll(".edit-client").forEach(button => {
        button.addEventListener("click", function () {
            const clientId = this.getAttribute("data-id");
            editClientDetails(clientId);
        });
    });
}

// Function to show loading message
function showLoadingMessage(message, elementId) {
    document.getElementById(elementId).innerHTML = `<div class="loading-message">${message}</div>`;
}

// Function to show error message
function showErrorMessage(message, elementId) {
    document.getElementById(elementId).innerHTML = `<div class="error-message">${message}</div>`;
}

// Function to handle viewing client details (Replace with modal opening logic)
function viewClientDetails(clientId) {
    alert(`Viewing details for Client ID: ${clientId}`);
}

// Function to handle editing client details (Replace with actual edit logic)
function editClientDetails(clientId) {
    alert(`Editing Client ID: ${clientId}`);
}





//Client View Modal Display
document.addEventListener("DOMContentLoaded", function () {
  // Fetch clients when the page loads
  fetchClients();

  // Add event listener for client view buttons
  document.getElementById("clientGrid").addEventListener("click", function (event) {
      if (event.target.classList.contains("view-client")) {
          const clientId = event.target.getAttribute("data-id");
          openClientDetailModal(clientId);
      }
  });

  // Add event listener for modal close
  document.getElementById("clientDetailModal").addEventListener("click", function (event) {
      if (event.target.classList.contains("client-detail-modal")) {
          closeClientDetailModal();
      }
  });

  document.querySelectorAll(".client-profile-tab").forEach(tab => {
      tab.addEventListener("click", function () {
          switchTab(this.dataset.tab);
      });
  });
});

// Function to fetch clients
async function fetchClients() {
  try {
      const token = localStorage.getItem("token");
      if (!token) {
          alert("Unauthorized: Please log in again.");
          return;
      }

      const response = await fetch("https://trsms-db.onrender.com/api/clients", {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
          throw new Error("Failed to fetch clients");
      }

      const clients = await response.json();
      renderClients(clients);
  } catch (error) {
      console.error("Error fetching clients:", error);
      showErrorMessage("Error fetching clients. Please try again later.", "clientGrid");
  }
}

// Function to render clients
function renderClients(clientData) {
  const clientGrid = document.getElementById("clientGrid");
  clientGrid.innerHTML = ""; // Clear existing content

  if (!clientData.length) {
      clientGrid.innerHTML = `<div class="no-clients">No clients found</div>`;
      return;
  }

  clientData.forEach(client => {
      const clientCard = document.createElement("div");
      clientCard.classList.add("client-card");

      // Extract initials from client name
      const initials = client.name ? client.name[0].toUpperCase() : "C";

      clientCard.innerHTML = `
          <div class="client-card-header">
              <div class="client-avatar">${initials}</div>
              <div class="client-actions">
                  <button class="btn btn-small view-client" data-id="${client._id}">View</button>
                  <button class="btn btn-small edit-client" data-id="${client._id}">Edit</button>
              </div>
          </div>
          <div class="client-details">
              <h3>${client.name || "Unknown Client"}</h3>
              <div class="client-detail"><i class="fas fa-envelope"></i> ${client.email || "No Email"}</div>
              <div class="client-detail"><i class="fas fa-phone"></i> ${client.phone || "No Phone"}</div>
              <div class="client-detail"><i class="fas fa-truck"></i> Active Vehicles: ${client.vehicles || "N/A"}</div>
              <div class="client-detail"><span class="badge badge-success">Good Standing</span></div>
          </div>
      `;

      clientGrid.appendChild(clientCard);
  });
}

// Function to open client detail modal
async function openClientDetailModal(clientId) {
  try {
      const token = localStorage.getItem("token");
      if (!token) {
          alert("Unauthorized: Please log in again.");
          return;
      }

      const response = await fetch(`https://trsms-db.onrender.com/api/clients/${clientId}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
          throw new Error("Failed to fetch client details");
      }

      const client = await response.json();
      populateClientDetails(client);

      // Show modal
      const modal = document.getElementById("clientDetailModal");
      modal.style.display = "block";
  } catch (error) {
      console.error("Error fetching client details:", error);
      alert("Error fetching client details. Please try again later.");
  }
}

// Function to populate client details in the modal
function populateClientDetails(client) {
  document.querySelector(".client-avatar").textContent = client.name[0].toUpperCase();
  document.querySelector(".client-profile-header h2").textContent = client.name;
  document.querySelector(".client-profile-header p").textContent = client.industry || "N/A";
  document.querySelector("#overviewSection .form-group:nth-child(1)").innerHTML = `<strong>Company Registration:</strong> ${client.registration || "N/A"}`;
  document.querySelector("#overviewSection .form-group:nth-child(2)").innerHTML = `<strong>Total Spend:</strong> $${client.totalSpend || "0.00"}`;
  document.querySelector("#overviewSection .form-group:nth-child(3)").innerHTML = `<strong>Last Service:</strong> ${client.lastService || "N/A"}`;

  renderVisitHistory(clientId);
  renderVehicles(client.vehicles || []);
  renderInvoices(client.invoices || []);
  renderNotes(client.notes || "");
}

// Function to render visit history
async function renderVisitHistory(clientId) {
  try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://trsms-db.onrender.com/api/clients/${clientId}/visits`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
          throw new Error("Failed to fetch visit history");
      }

      const visits = await response.json();
      const visitBody = document.getElementById("visitHistoryBody");
      visitBody.innerHTML = "";

      if (!visits.length) {
          visitBody.innerHTML = `<tr><td colspan="3">No visit history available</td></tr>`;
          return;
      }

      visits.forEach(visit => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${new Date(visit.date).toLocaleDateString()}</td>
              <td>${visit.service || "N/A"}</td>
              <td>${visit.technician || "N/A"}</td>
          `;
          visitBody.appendChild(row);
      });
  } catch (error) {
      console.error("Error fetching visit history:", error);
      document.getElementById("visitHistoryBody").innerHTML = `<tr><td colspan="3">Error loading visit history</td></tr>`;
  }
}

// Function to render vehicles
function renderVehicles(vehicles) {
  const vehicleBody = document.querySelector("#vehiclesSection tbody");
  vehicleBody.innerHTML = "";

  if (!vehicles.length) {
      vehicleBody.innerHTML = `<tr><td colspan="4">No vehicles available</td></tr>`;
      return;
  }

  vehicles.forEach(vehicle => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${vehicle.id || "N/A"}</td>
          <td>${vehicle.model || "N/A"}</td>
          <td>${vehicle.year || "N/A"}</td>
          <td>${vehicle.lastService || "N/A"}</td>
      `;
      vehicleBody.appendChild(row);
  });
}

// Function to render invoices
function renderInvoices(invoices) {
  const invoiceBody = document.querySelector("#invoicesSection tbody");
  invoiceBody.innerHTML = "";

  if (!invoices.length) {
      invoiceBody.innerHTML = `<tr><td colspan="5">No invoices available</td></tr>`;
      return;
  }

  invoices.forEach(invoice => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${invoice.invoiceNumber || "N/A"}</td>
          <td>${new Date(invoice.date).toLocaleDateString()}</td>
          <td>${invoice.service || "N/A"}</td>
          <td>$${invoice.amount.toFixed(2)}</td>
          <td><span class="badge ${invoice.status === "Paid" ? "badge-success" : "badge-warning"}">${invoice.status}</span></td>
      `;
      invoiceBody.appendChild(row);
  });
}

// Function to render notes
function renderNotes(notes) {
  document.querySelector("#notesSection textarea").value = notes;
}

// Function to close the client detail modal
function closeClientDetailModal() {
  document.getElementById("clientDetailModal").style.display = "none";
}

// Function to switch between profile tabs
function switchTab(tabName) {
  document.querySelectorAll(".client-section").forEach(section => {
      section.classList.remove("active");
  });
  document.getElementById(tabName + "Section").classList.add("active");
}
