// Global variables
let invoices = [];
let currentInvoiceId = null;

// Function to fetch invoices from the API
async function fetchInvoices() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification("Unauthorized: Please log in again.", "error");
      return;
    }

    showLoadingMessage("Fetching invoices...");
    const response = await fetch('https://trsms-db.onrender.com/api/invoices', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to fetch invoices');

    invoices = await response.json();
    renderInvoiceTable(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    showErrorMessage("Error fetching invoices. Please try again later.");
  }
}

// Function to render invoice table
function renderInvoiceTable(data) {
  const tbody = document.getElementById('invoiceTableBody');
  if (!tbody) {
    console.error('Invoice table body not found');
    return;
  }
  
  tbody.innerHTML = '';

  if (!data || !data.length) {
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
function viewInvoice(invoiceId) {
  currentInvoiceId = invoiceId;
  const modal = document.getElementById('view-invoice-modal');
  if (!modal) {
    console.error('View invoice modal not found');
    return;
  }
  
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  loadInvoiceDetails(invoiceId);
}

// Fetch invoice details from API
async function loadInvoiceDetails(invoiceId) {
  try {
    const itemsContainer = document.getElementById('modal-invoice-items');
    if (!itemsContainer) {
      console.error('Invoice items container not found');
      return;
    }
    
    showLoadingMessage("Loading invoice details...", 'modal-invoice-items');

    const token = localStorage.getItem('token');
    if (!token) {
      showNotification("Unauthorized: Please log in again.", "error");
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
  // Invoice details
  setElementText('modal-invoice-number', invoice.invoiceNumber || `INV-${invoice._id}`);
  setElementText('modal-invoice-date', formatDate(invoice.createdAt));
  setElementText('modal-invoice-due-date', formatDate(invoice.dueDate));

  // Status with appropriate class
  const statusElement = document.getElementById('modal-invoice-status');
  if (statusElement) {
    statusElement.textContent = invoice.status;
    statusElement.className = `detail-value status-${invoice.status.toLowerCase()}`;
  }

  // Client details
  setElementText('modal-client-name', invoice.client?.name || 'Unknown');
  setElementText('modal-client-address', invoice.client?.address || 'No address provided');
  setElementText('modal-client-phone', invoice.client?.phone || 'No phone provided');
  setElementText('modal-client-email', invoice.client?.email || 'No email provided');

  // Invoice items
  const itemsContainer = document.getElementById('modal-invoice-items');
  if (itemsContainer) {
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
  }

  // Totals
  setElementText('modal-invoice-subtotal', `$${invoice.subtotal?.toFixed(2) || '0.00'}`);
  setElementText('modal-invoice-tax', `$${invoice.tax?.toFixed(2) || '0.00'}`);
  setElementText('modal-invoice-total', `$${invoice.total?.toFixed(2) || '0.00'}`);
  setElementText('modal-invoice-notes', invoice.notes || 'No notes');
}

// Helper function to set text content of an element if it exists
function setElementText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

// Edit Invoice Functionality
function editInvoice(invoiceId) {
  currentInvoiceId = invoiceId;
  
  // Find the invoice in the fetched invoices array
  const invoice = invoices.find(inv => inv._id === invoiceId);
  
  if (!invoice) {
    // If not found locally, fetch from API
    loadInvoiceForEdit(invoiceId);
    return;
  }
  
  populateEditForm(invoice);
}

// Load invoice data for editing
async function loadInvoiceForEdit(invoiceId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification("Unauthorized: Please log in again.", "error");
      return;
    }

    const response = await fetch(`https://trsms-db.onrender.com/api/invoice/${invoiceId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Failed to load invoice for editing');

    const invoice = await response.json();
    populateEditForm(invoice);
  } catch (error) {
    console.error('Error loading invoice for edit:', error);
    showNotification("Error loading invoice details for editing.", "error");
  }
}

// Populate edit form with invoice data
function populateEditForm(invoice) {
  const editInvoiceModal = document.getElementById('editInvoiceModal');
  if (!editInvoiceModal) {
    console.error('Edit invoice modal not found');
    return;
  }
  
  // Populate form fields
  document.getElementById('editInvoiceId').value = invoice._id;
  
  // Client selection - assuming there's a select element with client options
  const clientSelect = document.getElementById('editClient');
  if (clientSelect && invoice.client) {
    // Find and select the client option
    Array.from(clientSelect.options).forEach(option => {
      if (option.value === invoice.client._id) {
        option.selected = true;
      }
    });
  }
  
  // Format dates for the date inputs
  const createdAt = invoice.createdAt ? new Date(invoice.createdAt) : new Date();
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : new Date();
  
  document.getElementById('editDate').value = formatDateForInput(createdAt);
  document.getElementById('editDueDate').value = formatDateForInput(dueDate);
  
  // Set status dropdown
  const statusSelect = document.getElementById('editStatus');
  if (statusSelect) {
    Array.from(statusSelect.options).forEach(option => {
      if (option.value.toLowerCase() === invoice.status.toLowerCase()) {
        option.selected = true;
      }
    });
  }
  
  // Clear previous error messages
  const errorElement = document.getElementById('editInvoiceError');
  if (errorElement) {
    errorElement.textContent = '';
  }
  
  // Show the modal
  editInvoiceModal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

// Helper function to format date for input fields
function formatDateForInput(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Delete Invoice Functionality
function deleteInvoice(invoiceId) {
  currentInvoiceId = invoiceId;
  
  // Set the invoice ID in the modal
  const idElement = document.getElementById('deleteInvoiceId');
  if (idElement) {
    idElement.textContent = invoiceId;
  }
  
  // Show the modal
  const modal = document.getElementById('deleteInvoiceModal');
  if (!modal) {
    console.error('Delete invoice modal not found');
    return;
  }
  
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

// Function to hide the delete invoice modal
function hideDeleteModal() {
  const modal = document.getElementById('deleteInvoiceModal');
  if (!modal) return;
  
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

// Function to handle the actual invoice deletion
async function confirmDeleteInvoice() {
  if (!currentInvoiceId) {
    showNotification('Invoice ID not found', 'error');
    return;
  }
  
  // Show loading state
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  if (!confirmBtn) return;
  
  const originalText = confirmBtn.textContent;
  confirmBtn.textContent = 'Deleting...';
  confirmBtn.disabled = true;
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification("Unauthorized: Please log in again.", "error");
      return;
    }
    
    // Make API call to delete the invoice
    // Note: Fixed endpoint to match API convention
    const response = await fetch(`https://trsms-db.onrender.com/api/invoice/${currentInvoiceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
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
    invoices = invoices.filter(invoice => invoice._id !== currentInvoiceId);
    
    // Re-render the table
    renderInvoiceTable(invoices);
    
    // Show success message
    showNotification('Invoice deleted successfully', 'success');
    
  } catch (error) {
    console.error('Error deleting invoice:', error);
    showNotification(error.message || 'Error deleting invoice', 'error');
  } finally {
    // Reset button state
    if (confirmBtn) {
      confirmBtn.textContent = originalText;
      confirmBtn.disabled = false;
    }
  }
}

// Utility function for date formatting
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(dateString));
}

// Utility functions for displaying messages
function showLoadingMessage(message, elementId = 'invoiceTableBody') {
  const element = document.getElementById(elementId);
  if (element) {
    if (element.tagName === 'TBODY') {
      element.innerHTML = `<tr><td colspan="7">${message}</td></tr>`;
    } else {
      element.innerHTML = message;
    }
  }
}

function showErrorMessage(message, elementId = 'invoiceTableBody') {
  const element = document.getElementById(elementId);
  if (element) {
    if (element.tagName === 'TBODY') {
      element.innerHTML = `<tr><td colspan="7" style="color: red;">${message}</td></tr>`;
    } else {
      element.innerHTML = `<div style="color: red;">${message}</div>`;
    }
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
  notification.style.color = '#ffffff';
  notification.style.padding = '12px 20px';
  notification.style.borderRadius = '6px';
  notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  notification.style.marginBottom = '10px';
  notification.style.display = 'flex';
  notification.style.justifyContent = 'space-between';
  notification.style.alignItems = 'center';
  notification.style.minWidth = '300px';
  notification.style.maxWidth = '400px';
  notification.style.animation = 'slideIn 0.3s forwards';
  
  // Add message text
  const messageText = document.createElement('span');
  messageText.textContent = message;
  notification.appendChild(messageText);
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.color = '#ffffff';
  closeButton.style.fontSize = '20px';
  closeButton.style.marginLeft = '10px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.outline = 'none';
  closeButton.onclick = () => {
    notification.style.animation = 'slideOut 0.3s forwards';
    setTimeout(() => {
      notificationContainer.removeChild(notification);
    }, 300);
  };
  notification.appendChild(closeButton);
  
  // Add to container
  notificationContainer.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode === notificationContainer) {
      notification.style.animation = 'slideOut 0.3s forwards';
      setTimeout(() => {
        if (notification.parentNode === notificationContainer) {
          notificationContainer.removeChild(notification);
        }
      }, 300);
    }
  }, 5000);
  
  // Add CSS animation if not already added
  if (!document.getElementById('notification-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'notification-styles';
    styleElement.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      .notification {
        transition: all 0.3s ease;
      }
    `;
    document.head.appendChild(styleElement);
  }
  }
  
  // Initialize page
  document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
    
    // Initialize event listeners
    initEventListeners();
    
    // Load invoice data
    fetchInvoices();
    
    // Load client data for new invoice form
    loadClients();
  });
  
  // Initialize event listeners
  function initEventListeners() {
    // Add new invoice button
    const addInvoiceBtn = document.getElementById('addInvoiceBtn');
    if (addInvoiceBtn) {
      addInvoiceBtn.addEventListener('click', showAddInvoiceModal);
    }
    
    // Close modal buttons
    const closeModalButtons = document.querySelectorAll('.close-modal');
    closeModalButtons.forEach(button => {
      button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) {
          modal.style.display = 'none';
          document.body.style.overflow = '';
        }
      });
    });
    
    // Confirm delete button
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', confirmDeleteInvoice);
    }
    
    // Cancel delete button
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelDeleteBtn) {
      cancelDeleteBtn.addEventListener('click', hideDeleteModal);
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInvoices');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterInvoices(searchTerm);
      });
    }
    
    // Filter by status
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', function() {
        const status = this.value;
        const searchTerm = document.getElementById('searchInvoices')?.value.toLowerCase() || '';
        filterInvoices(searchTerm, status);
      });
    }
    
    // Submit invoice form
    const invoiceForm = document.getElementById('addInvoiceForm');
    if (invoiceForm) {
      invoiceForm.addEventListener('submit', handleSubmitInvoice);
    }
    
    // Edit invoice form
    const editInvoiceForm = document.getElementById('editInvoiceForm');
    if (editInvoiceForm) {
      editInvoiceForm.addEventListener('submit', handleUpdateInvoice);
    }
  }
  
  // Function to filter invoices based on search term and/or status
  function filterInvoices(searchTerm = '', status = 'all') {
    if (!invoices || !invoices.length) return;
    
    const filteredInvoices = invoices.filter(invoice => {
      const matchesSearch = searchTerm === '' || 
        (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(searchTerm)) ||
        (invoice.client && invoice.client.name && invoice.client.name.toLowerCase().includes(searchTerm));
      
      const matchesStatus = status === 'all' || (invoice.status && invoice.status.toLowerCase() === status.toLowerCase());
      
      return matchesSearch && matchesStatus;
    });
    
    renderInvoiceTable(filteredInvoices);
  }
  
  // Function to load clients for the invoice form
  async function loadClients() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification("Unauthorized: Please log in again.", "error");
        return;
      }
      
      const response = await fetch('https://trsms-db.onrender.com/api/clients', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch clients');
      
      const clients = await response.json();
      populateClientDropdowns(clients);
    } catch (error) {
      console.error('Error loading clients:', error);
      showNotification("Error loading client data. Please refresh and try again.", "error");
    }
  }
  
  // Function to populate client dropdowns
  function populateClientDropdowns(clients) {
    const clientDropdowns = document.querySelectorAll('.client-select');
    
    if (!clients || !clients.length) {
      clientDropdowns.forEach(dropdown => {
        dropdown.innerHTML = '<option value="">No clients available</option>';
      });
      return;
    }
    
    clientDropdowns.forEach(dropdown => {
      dropdown.innerHTML = '<option value="">Select Client</option>';
      
      clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client._id;
        option.textContent = client.name;
        dropdown.appendChild(option);
      });
    });
  }
  
  // Function to show the add invoice modal
  function showAddInvoiceModal() {
    const modal = document.getElementById('addInvoiceModal');
    if (!modal) return;
    
    // Reset form fields
    const form = document.getElementById('addInvoiceForm');
    if (form) form.reset();
    
    // Set today's date
    const dateInput = document.getElementById('invoiceDate');
    if (dateInput) dateInput.value = formatDateForInput(new Date());
    
    // Set due date (default to 30 days from now)
    const dueDateInput = document.getElementById('invoiceDueDate');
    if (dueDateInput) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      dueDateInput.value = formatDateForInput(dueDate);
    }
    
    // Show the modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
  
  // Function to handle invoice form submission
  async function handleSubmitInvoice(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('saveInvoiceBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification("Unauthorized: Please log in again.", "error");
        return;
      }
      
      // Gather form data
      const formData = {
        client: document.getElementById('invoiceClient').value,
        createdAt: document.getElementById('invoiceDate').value,
        dueDate: document.getElementById('invoiceDueDate').value,
        status: document.getElementById('invoiceStatus').value,
        notes: document.getElementById('invoiceNotes').value,
        // Add items and other fields as needed
      };
      
      // Validate required fields
      if (!formData.client) {
        showNotification("Please select a client", "error");
        return;
      }
      
      // Submit the data
      const response = await fetch('https://trsms-db.onrender.com/api/invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create invoice');
      }
      
      // Get the new invoice from the response
      const newInvoice = await response.json();
      
      // Add to local data and re-render
      invoices.unshift(newInvoice);
      renderInvoiceTable(invoices);
      
      // Hide modal
      const modal = document.getElementById('addInvoiceModal');
      if (modal) modal.style.display = 'none';
      document.body.style.overflow = '';
      
      // Show success message
      showNotification('Invoice created successfully', 'success');
      
    } catch (error) {
      console.error('Error creating invoice:', error);
      showNotification(error.message || 'Error creating invoice', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Invoice';
      }
    }
  }
  
  // Function to handle invoice update
  async function handleUpdateInvoice(event) {
    event.preventDefault();
    
    const updateBtn = document.getElementById('updateInvoiceBtn');
    if (updateBtn) {
      updateBtn.disabled = true;
      updateBtn.textContent = 'Updating...';
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification("Unauthorized: Please log in again.", "error");
        return;
      }
      
      const invoiceId = document.getElementById('editInvoiceId').value;
      if (!invoiceId) {
        throw new Error('Invoice ID not found');
      }
      
      // Gather form data
      const formData = {
        client: document.getElementById('editClient').value,
        createdAt: document.getElementById('editDate').value,
        dueDate: document.getElementById('editDueDate').value,
        status: document.getElementById('editStatus').value,
        notes: document.getElementById('editNotes')?.value || '',
        // Add items and other fields as needed
      };
      
      // Validate required fields
      if (!formData.client) {
        showNotification("Please select a client", "error");
        return;
      }
      
      // Submit the data
      const response = await fetch(`https://trsms-db.onrender.com/api/invoice/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update invoice');
      }
      
      // Get the updated invoice from the response
      const updatedInvoice = await response.json();
      
      // Update in local data and re-render
      const index = invoices.findIndex(inv => inv._id === invoiceId);
      if (index !== -1) {
        invoices[index] = updatedInvoice;
      }
      renderInvoiceTable(invoices);
      
      // Hide modal
      const modal = document.getElementById('editInvoiceModal');
      if (modal) modal.style.display = 'none';
      document.body.style.overflow = '';
      
      // Show success message
      showNotification('Invoice updated successfully', 'success');
      
    } catch (error) {
      console.error('Error updating invoice:', error);
      showNotification(error.message || 'Error updating invoice', 'error');
    } finally {
      if (updateBtn) {
        updateBtn.disabled = false;
        updateBtn.textContent = 'Update Invoice';
      }
    }
  }