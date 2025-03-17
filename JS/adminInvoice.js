// Function to fetch invoices from the API
async function fetchInvoices() {
  try {
      const token = localStorage.getItem('token');
      if (!token) {
          alert("Unauthorized: Please log in again.");
          return;
      }

      showLoadingMessage("Fetching invoices...");
      const response = await fetch('https://trsms-db.onrender.com/api/invoices', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch invoices');

      const invoices = await response.json();
      renderInvoiceTable(invoices);
  } catch (error) {
      console.error('Error fetching invoices:', error);
      showErrorMessage("Error fetching invoices. Please try again later.");
  }
}

// Function to render invoice table
function renderInvoiceTable(data) {
  const tbody = document.getElementById('invoiceTableBody');
  tbody.innerHTML = '';

  if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="7">No invoices found</td></tr>`;
      return;
  }

  data.forEach(invoice => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${invoice.invoiceNumber || `INV-${invoice._id}`}</td>
          <td>${invoice.client?.name || 'Unknown'}</td>
          <td>${formatDate(invoice.createdAt)}</td>
          <td>${formatDate(invoice.dueDate)}</td>
          <td>$${invoice.total?.toFixed(2) || '0.00'}</td>
          <td><span class="status-badge status-${invoice.status.toLowerCase()}">${invoice.status}</span></td>
          <td class="action-buttons">
              <button class="btn btn-secondary" aria-label="View Invoice" onclick="viewInvoice('${invoice._id}')">View</button>
              <button class="btn btn-primary" aria-label="Edit Invoice" onclick="editInvoice('${invoice._id}')">Edit</button>
              <button class="btn btn-danger" aria-label="Delete Invoice" onclick="deleteInvoice('${invoice._id}')">Delete</button>
          </td>
      `;
      tbody.appendChild(row);
  });
}

// View Invoice Functionality
let currentInvoiceId = null;

function viewInvoice(invoiceId) {
  currentInvoiceId = invoiceId;
  const modal = document.getElementById('view-invoice-modal');
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  loadInvoiceDetails(invoiceId);
}

// Fetch invoice details from API
async function loadInvoiceDetails(invoiceId) {
  try {
      showLoadingMessage("Loading invoice details...", 'modal-invoice-items');

      const token = localStorage.getItem('token');
      if (!token) {
          alert("Unauthorized: Please log in again.");
          return;
      }

      const response = await fetch(`https://trsms-db.onrender.com/api/invoice/${invoiceId}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to load invoice details');

      const invoice = await response.json();
      populateInvoiceDetails(invoice);
  } catch (error) {
      console.error('Error loading invoice details:', error);
      showErrorMessage("Error loading invoice details.", 'modal-invoice-items');
  }
}

// Populate invoice details in modal
function populateInvoiceDetails(invoice) {
  document.getElementById('modal-invoice-number').textContent = invoice.invoiceNumber || `INV-${invoice._id}`;
  document.getElementById('modal-invoice-date').textContent = formatDate(invoice.createdAt);
  document.getElementById('modal-invoice-due-date').textContent = formatDate(invoice.dueDate);

  const statusElement = document.getElementById('modal-invoice-status');
  statusElement.textContent = invoice.status;
  statusElement.className = `detail-value status-${invoice.status.toLowerCase()}`;

  document.getElementById('modal-client-name').textContent = invoice.client?.name || 'Unknown';
  document.getElementById('modal-client-address').textContent = invoice.client?.address || 'No address provided';
  document.getElementById('modal-client-phone').textContent = invoice.client?.phone || 'No phone provided';
  document.getElementById('modal-client-email').textContent = invoice.client?.email || 'No email provided';

  const itemsContainer = document.getElementById('modal-invoice-items');
  itemsContainer.innerHTML = '';

  if (invoice.items?.length) {
      invoice.items.forEach(item => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>$${item.unitPrice?.toFixed(2) || '0.00'}</td>
              <td>$${(item.quantity * item.unitPrice).toFixed(2) || '0.00'}</td>
          `;
          itemsContainer.appendChild(row);
      });
  } else {
      showErrorMessage("No items on this invoice", 'modal-invoice-items');
  }

  document.getElementById('modal-invoice-subtotal').textContent = `$${invoice.subtotal?.toFixed(2) || '0.00'}`;
  document.getElementById('modal-invoice-tax').textContent = `$${invoice.tax?.toFixed(2) || '0.00'}`;
  document.getElementById('modal-invoice-total').textContent = `$${invoice.total?.toFixed(2) || '0.00'}`;
  document.getElementById('modal-invoice-notes').textContent = invoice.notes || 'No notes';
}

// Utility function for date formatting
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(dateString));
}

// Utility functions for displaying messages
function showLoadingMessage(message, elementId = 'invoiceTableBody') {
  document.getElementById(elementId).innerHTML = `<tr><td colspan="7">${message}</td></tr>`;
}

function showErrorMessage(message, elementId = 'invoiceTableBody') {
  document.getElementById(elementId).innerHTML = `<tr><td colspan="7" style="color: red;">${message}</td></tr>`;
}

// Modal Handling
document.addEventListener('DOMContentLoaded', function() {
  const modal = document.getElementById('view-invoice-modal');
  const closeButton = modal.querySelector('.close-modal');
  const closeModalButton = document.getElementById('close-invoice-modal');

  closeButton.addEventListener('click', closeModal);
  closeModalButton.addEventListener('click', closeModal);

  window.addEventListener('click', function(event) {
      if (event.target === modal) closeModal();
  });

  function closeModal() {
      modal.style.display = 'none';
      document.body.style.overflow = '';
  }

  // Fetch and display invoices on page load
  fetchInvoices();
});

 


// Edit Invoice Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const editInvoiceModal = document.getElementById('editInvoiceModal');
    const closeEditInvoiceModal = document.getElementById('closeEditInvoiceModal');
    const cancelEditInvoice = document.getElementById('cancelEditInvoice');
    const editInvoiceForm = document.getElementById('editInvoiceForm');
    const editInvoiceError = document.getElementById('editInvoiceError');
    
    // Form fields
    const editInvoiceId = document.getElementById('editInvoiceId');
    const editClient = document.getElementById('editClient');
    const editDate = document.getElementById('editDate');
    const editDueDate = document.getElementById('editDueDate');
    const editAmount = document.getElementById('editAmount');
    const editStatus = document.getElementById('editStatus');
    
    // Function to open the edit invoice modal
    window.editInvoice = function(invoiceId) {
        // Find the invoice in the invoices array
        const invoice = invoices.find(inv => inv.id === invoiceId);
        
        if (!invoice) {
            alert('Invoice not found');
            return;
        }
        
        // Populate form fields
        editInvoiceId.value = invoice.id;
        editClient.value = invoice.client;
        editDate.value = formatDateForInput(invoice.date);
        editDueDate.value = formatDateForInput(invoice.dueDate);
        editAmount.value = invoice.amount.toFixed(2);
        editStatus.value = invoice.status;
        
        // Clear previous error messages
        editInvoiceError.textContent = '';
        
        // Show the modal
        editInvoiceModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    };
    
    // Helper function to format date string for date input
    function formatDateForInput(dateString) {
        // Check if the date is in MM/DD/YYYY format
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
            const parts = dateString.split('/');
            // Convert to YYYY-MM-DD format required by input[type="date"]
            return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
        // If it's already in YYYY-MM-DD format or another format, return as is
        return dateString;
    }
    
    // Function to close the edit invoice modal
    function closeEditModal() {
        editInvoiceModal.style.display = 'none';
        document.body.style.overflow = ''; // Re-enable scrolling
        editInvoiceForm.reset(); // Reset form
    }
    
    // Close modal when clicking the X button
    closeEditInvoiceModal.addEventListener('click', closeEditModal);
    
    // Close modal when clicking the Cancel button
    cancelEditInvoice.addEventListener('click', closeEditModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === editInvoiceModal) {
            closeEditModal();
        }
    });
    
    // Handle form submission
    editInvoiceForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        editInvoiceError.textContent = '';
        
        // Get form values
        const invoiceId = editInvoiceId.value;
        const client = editClient.value.trim();
        const date = editDate.value;
        const dueDate = editDueDate.value;
        const amount = parseFloat(editAmount.value);
        const status = editStatus.value;
        
        // Validate form
        if (!client || !date || !dueDate || isNaN(amount)) {
            editInvoiceError.textContent = 'All fields are required';
            return;
        }
        
        // Disable save button and show loading state
        const saveButton = document.getElementById('saveInvoiceChanges');
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';
        
        try {
            // API endpoint for updating invoice
            const response = await fetch(`https://trsms-db.onrender.com/api/invoice/${invoiceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    client,
                    date,
                    dueDate,
                    amount,
                    status
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to update invoice');
            }
            
            // Update local invoices array
            const index = invoices.findIndex(inv => inv.id === invoiceId);
            if (index !== -1) {
                invoices[index] = {
                    ...invoices[index],
                    client,
                    date,
                    dueDate,
                    amount,
                    status
                };
            }
            
            // Re-render the invoice table
            renderInvoiceTable();
            
            // Success - close modal and notify user
            alert('Invoice updated successfully!');
            closeEditModal();
            
        } catch (error) {
            editInvoiceError.textContent = error.message || 'An error occurred while updating the invoice';
            console.error('Edit invoice error:', error);
        } finally {
            // Re-enable save button
            saveButton.disabled = false;
            saveButton.textContent = 'Save Changes';
        }
    });
});




// Variables for storing the current invoice ID being deleted


// Function to show the delete invoice modal
function deleteInvoice(invoiceId) {
    // Store the invoice ID
    currentInvoiceId = invoiceId;
    
    // Set the invoice ID in the modal
    document.getElementById('deleteInvoiceId').textContent = invoiceId;
    
    // Show the modal
    const modal = document.getElementById('deleteInvoiceModal');
    modal.style.display = 'block';
    
    // Prevent scrolling on the body
    document.body.style.overflow = 'hidden';
}

// Function to hide the delete invoice modal
function hideDeleteModal() {
    const modal = document.getElementById('deleteInvoiceModal');
    modal.style.display = 'none';
    
    // Re-enable scrolling
    document.body.style.overflow = '';
    
    // Reset the current invoice ID
    currentInvoiceId = null;
}

// Function to handle the actual invoice deletion
async function confirmDeleteInvoice() {
    // Show loading state
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const originalText = confirmBtn.textContent;
    confirmBtn.textContent = 'Deleting...';
    confirmBtn.disabled = true;
    
    try {
        // Make API call to delete the invoice
        const response = await fetch(`https://trsms-db.onrender.com/api/invoices/${currentInvoiceId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        // Check if the request was successful
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete invoice');
        }
        
        // Success - hide modal
        hideDeleteModal();
        
        // Remove the invoice from the local data
        invoices = invoices.filter(invoice => invoice.id !== currentInvoiceId);
        
        // Re-render the table
        renderInvoiceTable();
        
        // Show success message
        showNotification('Invoice deleted successfully', 'success');
        
    } catch (error) {
        console.error('Error deleting invoice:', error);
        showNotification(error.message || 'Error deleting invoice', 'error');
    } finally {
        // Reset button state
        confirmBtn.textContent = originalText;
        confirmBtn.disabled = false;
    }
}

// Function to show notifications
function showNotification(message, type = 'info') {
    // Check if notification container exists, if not create it
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '1050';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.backgroundColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.marginBottom = '10px';
    notification.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
    notification.style.minWidth = '250px';
    notification.textContent = message;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 500);
    }, 3000);
}

// Set up event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the modal elements
    const modal = document.getElementById('deleteInvoiceModal');
    const closeButton = modal.querySelector('.close-modal');
    const cancelButton = document.getElementById('cancelDeleteBtn');
    const confirmButton = document.getElementById('confirmDeleteBtn');
    
    // Close modal when X is clicked
    closeButton.addEventListener('click', hideDeleteModal);
    
    // Close modal when Cancel button is clicked
    cancelButton.addEventListener('click', hideDeleteModal);
    
    // Handle delete confirmation
    confirmButton.addEventListener('click', confirmDeleteInvoice);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            hideDeleteModal();
        }
    });
    
    // Close modal on escape key press
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            hideDeleteModal();
        }
    });
});



// Function to view invoice details
function viewInvoice(invoiceId) {
    // Find the invoice by ID from your invoices array
    const invoice = invoices.find(inv => inv.id === invoiceId);
    
    if (!invoice) {
      alert('Invoice not found');
      return;
    }
    
    // Populate the modal with invoice details
    document.getElementById('viewInvoiceId').textContent = invoice.id;
    document.getElementById('viewInvoiceClient').textContent = invoice.client;
    document.getElementById('viewInvoiceDate').textContent = invoice.date;
    document.getElementById('viewInvoiceDueDate').textContent = invoice.dueDate;
    
    // Apply status with appropriate styling
    const statusElement = document.getElementById('viewInvoiceStatus');
    statusElement.textContent = invoice.status;
    statusElement.className = 'detail-value status-badge status-' + invoice.status;
    
    document.getElementById('viewInvoiceAmount').textContent = '$' + invoice.amount.toFixed(2);
    
    // Populate invoice items
    const itemsContainer = document.getElementById('viewInvoiceItems');
    itemsContainer.innerHTML = '';
    
    if (invoice.items && invoice.items.length > 0) {
      invoice.items.forEach(item => {
        const row = document.createElement('tr');
        const itemTotal = (parseFloat(item.quantity) * parseFloat(item.unitPrice)).toFixed(2);
        
        row.innerHTML = `
          <td>${item.description}</td>
          <td>${item.quantity}</td>
          <td>$${parseFloat(item.unitPrice).toFixed(2)}</td>
          <td>$${itemTotal}</td>
        `;
        
        itemsContainer.appendChild(row);
      });
    } else {
      // If there are no items, add a placeholder row
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="4">No items found for this invoice</td>';
      itemsContainer.appendChild(row);
    }
    
    // Calculate and display totals
    let subtotal = 0;
    if (invoice.items) {
      subtotal = invoice.items.reduce((total, item) => {
        return total + (parseFloat(item.quantity) * parseFloat(item.unitPrice));
      }, 0);
    }
    
    const taxRate = invoice.taxRate || 0.1; // Default 10% if not specified
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    document.getElementById('viewInvoiceSubtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('viewInvoiceTax').textContent = '$' + taxAmount.toFixed(2) + ` (${(taxRate * 100).toFixed(0)}%)`;
    document.getElementById('viewInvoiceTotal').textContent = '$' + total.toFixed(2);
    
    // Set notes if any
    document.getElementById('viewInvoiceNotes').textContent = invoice.notes || 'No notes for this invoice';
    
    // Show the modal
    const modal = document.getElementById('viewInvoiceModal');
    modal.style.display = 'block';
  }
  
  // Setup event listeners for the modal
  document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('viewInvoiceModal');
    const closeBtn = document.getElementById('closeViewInvoiceModal');
    const closeInvoiceBtn = document.getElementById('closeInvoiceBtn');
    const printInvoiceBtn = document.getElementById('printInvoiceBtn');
    const emailInvoiceBtn = document.getElementById('emailInvoiceBtn');
    
    // Close modal when clicking on X
    closeBtn.addEventListener('click', function() {
      modal.style.display = 'none';
    });
    
    // Close modal when clicking on Close button
    closeInvoiceBtn.addEventListener('click', function() {
      modal.style.display = 'none';
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
    
    // Print invoice functionality
    printInvoiceBtn.addEventListener('click', function() {
      // You can implement printing functionality here
      const invoiceId = document.getElementById('viewInvoiceId').textContent;
      alert(`Printing invoice #${invoiceId}`);
      // window.print() for actual printing or redirect to a print-friendly page
    });
    
    // Email invoice functionality
    emailInvoiceBtn.addEventListener('click', function() {
      // You can implement email functionality here
      const invoiceId = document.getElementById('viewInvoiceId').textContent;
      const client = document.getElementById('viewInvoiceClient').textContent;
      alert(`Sending invoice #${invoiceId} to ${client} by email`);
    });
  }); 