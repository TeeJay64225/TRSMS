document.addEventListener('DOMContentLoaded', function () {
    // Modal Elements
    const addClientModal = document.getElementById('addClientModal');
    const addClientForm = document.getElementById('addClientForm');
    const cancelButton = addClientModal.querySelector('.btn-danger');
    const closeModalX = addClientModal.querySelector('.close-modal');
    const errorMessage = document.getElementById('clientFormError');
    
    // Form Inputs
    const companyNameInput = document.getElementById('name');
    const emailInput = document.getElementById('clientEmail');
    const phoneInput = document.getElementById('clientPhone');
    const statusSelect = document.getElementById('clientStatus');
    const sendWelcomeEmailCheckbox = document.getElementById('sendWelcomeEmail');
    
    // Open Modal Button
    const addClientBtn = document.getElementById('addClientBtn');
    if (addClientBtn) addClientBtn.addEventListener('click', openModal);
    
    // Open Modal Function
    function openModal() {
        addClientModal.style.display = 'flex'; // Use flex for proper centering
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        addClientForm.reset();
        errorMessage.textContent = '';
    }
    
    // Close Modal Function
    function closeModal() {
        addClientModal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
    
    // Close Modal Events
    if (closeModalX) closeModalX.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    });
    window.addEventListener('click', (event) => {
        if (event.target === addClientModal) closeModal();
    });

// Form Submission
addClientForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    errorMessage.textContent = '';

    const clientData = {
        name: companyNameInput.value.trim(),  // ✅ FIX: Use `name` instead of `companyName`
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        status: statusSelect.value,
        sendWelcomeEmail: sendWelcomeEmailCheckbox.checked
    };

    // ✅ Debugging: Log the data before sending
    console.log("Sending data:", clientData);

    // Form Validation
    if (!clientData.name || !clientData.email || !clientData.phone) {  // ✅ FIXED VALIDATION CHECK
        errorMessage.textContent = 'All fields are required!';
        return;
    }

    // Email Validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(clientData.email)) {
        errorMessage.textContent = 'Invalid email address!';
        return;
    }

    // Phone Validation
    const phonePattern = /^\+?[0-9\s\-\(\)]+$/;
    if (!phonePattern.test(clientData.phone)) {
        errorMessage.textContent = 'Invalid phone number!';
        return;
    }

    // Disable Button to Prevent Multiple Clicks
    const submitButton = addClientForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Creating...';

    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required! Please log in.');

        const response = await fetch('https://trsms-db.onrender.com/api/clients/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(clientData)
        });

        const data = await response.json();
        console.log("Server response:", data);  // ✅ Debugging: Check server response

        if (!response.ok) throw new Error(data.error || 'Failed to create client');

        alert('Client created successfully!');
        closeModal();
        if (typeof refreshClientList === 'function') refreshClientList();
        else window.location.reload();

    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = error.message || 'An error occurred!';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Create Client';
    }
});

// Expose the openModal function
window.openAddClientModal = openModal;

});



 document.addEventListener('DOMContentLoaded', function() {
    // Select Edit buttons correctly
    const editButtons = document.querySelectorAll('.edit-client');
    const editClientModal = document.getElementById('edit-client-modal');
    const closeModal = document.querySelector('.close-modal');
    const cancelEditClient = document.getElementById('cancel-edit-client');
    const editClientForm = document.getElementById('edit-client-form');
    const editClientError = document.getElementById('edit-client-error');

    // Form fields
    const clientIdInput = document.getElementById('edit-client-id');
    const clientNameInput = document.getElementById('edit-client-name');
    const clientEmailInput = document.getElementById('edit-client-email');
    const clientContactInput = document.getElementById('edit-client-contact');
    const clientStatusInput = document.getElementById('edit-client-status');
    const clientNotesInput = document.getElementById('edit-client-notes');

    // Function to open modal
    function openEditModal(clientId) {
        editClientModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        editClientForm.reset();
        editClientError.textContent = '';

        // Fetch client data
        fetchClientData(clientId);
    }

    // Fetch client data
    async function fetchClientData(clientId) {
        try {
            const response = await fetch(`https://trsms-db.onrender.com/api/clients/${clientId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch client data');
            }

            const clientData = await response.json();
            clientIdInput.value = clientData._id || clientId;
            clientNameInput.value = clientData.name || '';
            clientEmailInput.value = clientData.email || '';
            clientContactInput.value = clientData.contact || '';
            clientStatusInput.value = clientData.status || 'active';
            clientNotesInput.value = clientData.notes || '';

        } catch (error) {
            console.error('Error fetching client data:', error);
            editClientError.textContent = 'Unable to load client data. Please try again.';
        }
    }

    // Attach event listeners to edit buttons
    editButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const clientId = button.getAttribute('data-client-id');

            if (clientId) {
                openEditModal(clientId);
            } else {
                console.error('No client ID found');
            }
        });
    });

    // Close modal
    function closeEditModal() {
        editClientModal.style.display = 'none';
        document.body.style.overflow = ''; // Re-enable scrolling
    }

    closeModal.addEventListener('click', closeEditModal);
    cancelEditClient.addEventListener('click', closeEditModal);
    
    window.addEventListener('click', function(event) {
        if (event.target === editClientModal) {
            closeEditModal();
        }
    });
});



//client details table
document.addEventListener('DOMContentLoaded', async function () {
    const clientTableBody = document.querySelector('tbody');

    async function fetchClients() {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication required! Please log in.');

            const response = await fetch('https://trsms-db.onrender.com/api/clients/', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to fetch clients');

            populateClientTable(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
            clientTableBody.innerHTML = `<tr><td colspan="7" class="error-message">${error.message}</td></tr>`;
        }
    }

    function populateClientTable(clients) {
        clientTableBody.innerHTML = ''; // Clear table before adding new data

        if (clients.length === 0) {
            clientTableBody.innerHTML = `<tr><td colspan="7" class="text-center">No clients found.</td></tr>`;
            return;
        }

        clients.forEach(client => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" class="row-select"></td>
                <td>${client.name}</td>
                <td>${client.email}</td>
                <td>${client.phone}</td>
                <td>$${client.totalSpend || '0.00'}</td>
                <td>
                    <span class="status-badge ${client.status === 'active' ? 'status-active' : 'status-inactive'}">
                        ${client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </span>
                </td>
                <td>
                    <button class="btn btn-primary edit-client" data-client-id="${client._id}">Edit</button>
                    <button class="btn btn-danger suspend-client" data-client-id="${client._id}">Suspend</button>
                </td>
            `;
            clientTableBody.appendChild(row);
        });
    }

    // Fetch and display clients when the page loads
    fetchClients();
});

