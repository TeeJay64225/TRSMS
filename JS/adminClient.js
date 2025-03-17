document.addEventListener('DOMContentLoaded', function () {
    // Modal Elements
    const addClientModal = document.getElementById('addClientModal');
    const addClientForm = document.getElementById('addClientForm');
    const cancelButton = addClientModal.querySelector('.btn-danger');
    const closeModalX = addClientModal.querySelector('.close-modal');
    const errorMessage = document.getElementById('clientFormError');
    
    // Form Inputs
    const companyNameInput = document.getElementById('clientCompanyName');
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
        
        // Get Form Values
        const clientData = {
            companyName: companyNameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            status: statusSelect.value,
            sendWelcomeEmail: sendWelcomeEmailCheckbox.checked
        };

        // Form Validation
        if (!clientData.companyName || !clientData.email || !clientData.phone) {
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
            // Authentication Token
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication required! Please log in.');

            // Send Data to Server
            const response = await fetch('https://trsms-db.onrender.com/api/clients/', {  // 🔥 Corrected URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(clientData)
            });
            

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to create client');

            // Success
            alert('Client created successfully!');
            closeModal();
            if (typeof refreshClientList === 'function') refreshClientList();
            else window.location.reload();

        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = error.message || 'An error occurred!';
        } finally {
            // Re-enable Button
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
