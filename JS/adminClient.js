 // Modal Functionality
 const addClientBtn = document.getElementById('addClientBtn');
 const addClientModal = document.getElementById('addClientModal');
 const cancelButtons = document.querySelectorAll('.btn-danger');

 addClientBtn.addEventListener('click', () => {
     addClientModal.style.display = 'flex';
 });

 cancelButtons.forEach(btn => {
     btn.addEventListener('click', () => {
         addClientModal.style.display = 'none';
     });
 });

 // Select All Checkbox
 const selectAllCheckbox = document.getElementById('selectAll');
 const rowSelectCheckboxes = document.querySelectorAll('.row-select');

 selectAllCheckbox.addEventListener('change', (e) => {
     rowSelectCheckboxes.forEach(checkbox => {
         checkbox.checked = e.target.checked;
     });
 });

 // Bulk Delete Simulation
 const bulkDeleteBtn = document.querySelector('.btn-danger[data-action="bulk-delete"]');
 if (bulkDeleteBtn) {
     bulkDeleteBtn.addEventListener('click', () => {
         const selectedRows = Array.from(rowSelectCheckboxes)
             .filter(cb => cb.checked)
             .map(cb => cb.closest('tr'));

         selectedRows.forEach(row => row.remove());
     });
 }


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
