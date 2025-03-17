// Global variable to store current receipt ID
let currentReceiptId = null;

// Function to view receipt details
function viewReceipt(receiptId) {
  currentReceiptId = receiptId;
  const modal = document.getElementById('viewReceiptModal');
  
  // Show loading state
  document.getElementById('modal-receipt-id').textContent = receiptId;
  document.getElementById('modal-receipt-items').innerHTML = '<tr><td colspan="4">Loading receipt details...</td></tr>';
  
  // Display the modal
  modal.style.display = 'block';
  
  // Fetch receipt details from the API
  fetchReceiptDetails(receiptId);
}

// Function to fetch receipt details from the API
async function fetchReceiptDetails(receiptId) {
  try {
    const response = await fetch(`https://trsms-db.onrender.com/api/receipts/${receiptId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch receipt details');
    }
    
    const receiptData = await response.json();
    displayReceiptDetails(receiptData);
  } catch (error) {
    console.error('Error fetching receipt details:', error);
    document.getElementById('modal-receipt-items').innerHTML = 
      '<tr><td colspan="4">Error loading receipt details. Please try again.</td></tr>';
  }
}

// Function to display receipt details in the modal
function displayReceiptDetails(receipt) {
  // Basic receipt info
  document.getElementById('modal-receipt-id').textContent = receipt.id;
  document.getElementById('modal-receipt-date').textContent = receipt.date;
  
  // Status with appropriate class
  const statusElem = document.getElementById('modal-receipt-status');
  statusElem.textContent = receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1);
  statusElem.className = `status-badge status-${receipt.status}`;
  
  // Client information
  document.getElementById('modal-client-name').textContent = receipt.client.name || receipt.client;
  document.getElementById('modal-client-phone').textContent = receipt.client.phone || 'N/A';
  document.getElementById('modal-client-address').textContent = receipt.client.address || 'N/A';
  
  // Receipt items
  const itemsContainer = document.getElementById('modal-receipt-items');
  itemsContainer.innerHTML = '';
  
  if (receipt.items && receipt.items.length > 0) {
    receipt.items.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.description}</td>
        <td>${item.quantity}</td>
        <td>$${item.unitPrice.toFixed(2)}</td>
        <td>$${(item.quantity * item.unitPrice).toFixed(2)}</td>
      `;
      itemsContainer.appendChild(row);
    });
  } else {
    itemsContainer.innerHTML = '<tr><td colspan="4">No items found</td></tr>';
  }
  
  // Summary information
  document.getElementById('modal-subtotal').textContent = `$${receipt.subtotal ? receipt.subtotal.toFixed(2) : receipt.amount.toFixed(2)}`;
  document.getElementById('modal-tax').textContent = `$${receipt.tax ? receipt.tax.toFixed(2) : '0.00'}`;
  document.getElementById('modal-total').textContent = `$${receipt.amount.toFixed(2)}`;
  
  // Payment information
  document.getElementById('modal-payment-method').textContent = receipt.paymentMethod || 'N/A';
  document.getElementById('modal-payment-date').textContent = receipt.paymentDate || receipt.date || 'N/A';
  
  // Notes
  document.getElementById('modal-notes').textContent = receipt.notes || 'No additional notes';
}

// Function to close the receipt modal
function closeViewReceiptModal() {
  const modal = document.getElementById('viewReceiptModal');
  modal.style.display = 'none';
  currentReceiptId = null;
}

// Close modal when clicking on X
document.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.getElementById('closeViewReceiptModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeViewReceiptModal);
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    const modal = document.getElementById('viewReceiptModal');
    if (event.target === modal) {
      closeViewReceiptModal();
    }
  });
});






// Print Receipt functionality


// Function to open print receipt modal
function printReceipt(receiptId) {
    currentReceiptId = receiptId;
    const modal = document.getElementById('printReceiptModal');
    modal.style.display = 'block';
    
    // Load receipt data
    loadReceiptData(receiptId);
}

// Function to load receipt data
async function loadReceiptData(receiptId) {
    const previewElement = document.getElementById('receiptPreview');
    
    try {
        // Show loading state
        previewElement.innerHTML = `
            <div class="loading-spinner" style="text-align: center; padding: 20px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #2563eb;"></i>
                <p>Loading receipt...</p>
            </div>
        `;
        
        // Fetch receipt data from API
        const response = await fetch(`https://trsms-db.onrender.com/api/receipts/${receiptId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load receipt data');
        }
        
        const receiptData = await response.json();
        
        // Format and display receipt in the preview
        previewElement.innerHTML = formatReceiptForPreview(receiptData);
        
    } catch (error) {
        console.error('Error loading receipt:', error);
        previewElement.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #ef4444;">
                <i class="fas fa-exclamation-circle" style="font-size: 24px;"></i>
                <p>Error loading receipt. Please try again.</p>
            </div>
        `;
    }
}

// Function to format receipt for preview
function formatReceiptForPreview(receipt) {
    // Get company logo option
    const includeLogo = document.getElementById('includeLogo').checked;
    const includeFooter = document.getElementById('includeFooter').checked;
    
    // Calculate totals
    const subtotal = receipt.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * (receipt.taxRate || 0.07); // Default 7% if not specified
    const total = subtotal + tax;
    
    // Format receipt HTML
    let html = `
        <div style="font-family: Arial, sans-serif;">
            ${includeLogo ? `
                <div style="text-align: center; margin-bottom: 15px;">
                    <h2 style="margin: 0; color: #2563eb;">TruckFix Pro</h2>
                    <p style="margin: 5px 0;">123 Repair Street, Mechanic City</p>
                    <p style="margin: 5px 0;">Tel: (555) 123-4567</p>
                </div>
            ` : ''}
            
            <div style="border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 10px 0; margin-bottom: 15px;">
                <h3 style="margin: 0; text-align: center;">RECEIPT</h3>
                <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                    <div>
                        <p style="margin: 3px 0;"><strong>Receipt #:</strong> ${receipt.id}</p>
                        <p style="margin: 3px 0;"><strong>Date:</strong> ${receipt.date}</p>
                    </div>
                    <div>
                        <p style="margin: 3px 0;"><strong>Status:</strong> ${receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}</p>
                        <p style="margin: 3px 0;"><strong>Payment Method:</strong> ${receipt.paymentMethod || 'Cash'}</p>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <p style="margin: 3px 0;"><strong>Client:</strong> ${receipt.client}</p>
                <p style="margin: 3px 0;"><strong>Address:</strong> ${receipt.clientAddress || 'N/A'}</p>
                <p style="margin: 3px 0;"><strong>Phone:</strong> ${receipt.clientPhone || 'N/A'}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #f3f4f6;">
                        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
                        <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Qty</th>
                        <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
                        <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Amount</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    // Add receipt items
    receipt.items.forEach(item => {
        const amount = item.price * item.quantity;
        html += `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.description}</td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">${item.quantity}</td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">$${item.price.toFixed(2)}</td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #eee;">$${amount.toFixed(2)}</td>
            </tr>
        `;
    });
    
    // Add totals
    html += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="padding: 8px; text-align: right;"><strong>Subtotal:</strong></td>
                        <td style="padding: 8px; text-align: right;">$${subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="padding: 8px; text-align: right;"><strong>Tax (${(receipt.taxRate || 0.07) * 100}%):</strong></td>
                        <td style="padding: 8px; text-align: right;">$${tax.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="padding: 8px; text-align: right;"><strong>Total:</strong></td>
                        <td style="padding: 8px; text-align: right; font-weight: bold;">$${total.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
    `;
    
    // Add footer if selected
    if (includeFooter) {
        html += `
            <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
                <p>Thank you for choosing TruckFix Pro for your truck repair needs!</p>
                <p style="margin-top: 5px; font-size: 14px; color: #6b7280;">
                    For questions about this receipt, please contact us at support@truckfixpro.com
                </p>
            </div>
        `;
    }
    
    html += `</div>`;
    
    return html;
}

// Function to handle print now button
function handlePrintNow() {
    const receiptPreview = document.getElementById('receiptPreview');
    const paperSize = document.getElementById('paperSizeSelect').value;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Set print styles based on paper size
    let paperCSS = '';
    if (paperSize === 'thermal') {
        paperCSS = '@page { size: 80mm auto; margin: 0mm; }';
    } else if (paperSize === 'a4') {
        paperCSS = '@page { size: A4; margin: 15mm; }';
    } else { // letter
        paperCSS = '@page { size: letter; margin: 15mm; }';
    }
    
    // Inject content into the new window
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt #${currentReceiptId}</title>
            <style>
                ${paperCSS}
                body { font-family: Arial, sans-serif; }
                @media print {
                    body { margin: 0; padding: ${paperSize === 'thermal' ? '5mm' : '0'}; }
                }
            </style>
        </head>
        <body>
            ${receiptPreview.innerHTML}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                }
            </script>
        </body>
        </html>
    `);
}

// Function to handle PDF download
function handleDownloadPDF() {
    alert('Downloading receipt as PDF...');
    // In a real implementation, you would use a library like html2pdf.js or jsPDF
    // For this example, we'll just show an alert
}

// Function to handle email receipt
function handleEmailReceipt() {
    // Get client email (in a real app, this would come from the receipt data)
    const clientEmail = prompt('Enter client email address:');
    
    if (clientEmail && /^\S+@\S+\.\S+$/.test(clientEmail)) {
        alert(`Receipt will be sent to ${clientEmail}`);
        // In a real implementation, you would call your API to send the email
    } else if (clientEmail) {
        alert('Please enter a valid email address');
    }
}

// Set up event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Make sure the modal HTML is added to the document
    if (!document.getElementById('printReceiptModal')) {
        const modalHTML = `<!-- Print Receipt Modal HTML goes here -->`;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    // Close modal when clicking on X
    const closeButton = document.querySelector('.close-print-modal');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            document.getElementById('printReceiptModal').style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === addUserModal) {
            closeAddUserModal();
        }
    });

    // Form submission
    addUserForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        addUserError.textContent = '';
        
        // Get form values
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const role = Array.from(roleInputs).find(radio => radio.checked).value;
        
        // Validate form
        if (!name || !phone || !password || !confirmPassword) {
            addUserError.textContent = 'All fields are required';
            return;
        }
        
        if (password !== confirmPassword) {
            addUserError.textContent = 'Passwords do not match';
            return;
        }
        
        // Disable submit button and show loading state
        const submitBtn = document.getElementById('submit-add-user');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding User...';
        
        try {
            // API endpoint for adding new user
            const response = await fetch('https://trsms-db.onrender.com/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name,
                    phone,
                    password,
                    role
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || data.message || 'Failed to add user');
            }
            
            // Success - close modal and notify user
            alert('User added successfully!');
            closeAddUserModal();
            
            // Optionally refresh the user list if you have one on the page
            // refreshUserList();
            
        } catch (error) {
            addUserError.textContent = error.message || 'An error occurred while adding the user';
            console.error('Add user error:', error);
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add User';
        }
    }); // <- This is the closing brace for addEventListener on form submission

}); // <- This is the missing closing brace for the DOMContentLoaded event listener


// Delete Receipt Modal Functionality
let currentReceiptIdToDelete = null;

// Function to open the delete confirmation modal
function deleteReceipt(receiptId) {
    // Store the receipt ID to delete
    currentReceiptIdToDelete = receiptId;
    
    // Update the modal text with the receipt ID
    document.getElementById('deleteReceiptId').textContent = receiptId;
    
    // Show the modal
    const modal = document.getElementById('deleteReceiptModal');
    modal.style.display = 'block';
}

// Function to handle the actual deletion
async function confirmDeleteReceipt() {
    if (!currentReceiptIdToDelete) return;
    
    try {
        // Show loading state on button
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        const originalText = confirmBtn.textContent;
        confirmBtn.textContent = 'Deleting...';
        confirmBtn.disabled = true;
        
        // Make API call to delete the receipt
        const response = await fetch(`https://trsms-db.onrender.com/api/receipts/${currentReceiptIdToDelete}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete receipt');
        }
        
        // Success - close modal and refresh data
        closeDeleteModal();
        
        // Remove the receipt from the UI without reloading
        const row = document.querySelector(`tr[data-receipt-id="${currentReceiptIdToDelete}"]`);
        if (row) {
            row.remove();
        } else {
            // If we can't find the row by data attribute, refresh the whole list
            fetchReceipts(); // Assuming this function exists to reload receipt data
        }
        
        // Show success message
        alert(`Receipt ${currentReceiptIdToDelete} has been deleted successfully.`);
        
    } catch (error) {
        console.error('Error deleting receipt:', error);
        alert(`Error: ${error.message}`);
    } finally {
        // Reset button state
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        confirmBtn.textContent = 'Delete';
        confirmBtn.disabled = false;
    }
}

// Function to close the delete modal
function closeDeleteModal() {
    const modal = document.getElementById('deleteReceiptModal');
    modal.style.display = 'none';
    currentReceiptIdToDelete = null;
}

// Set up event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when clicking the X
    document.getElementById('closeDeleteModal').addEventListener('click', closeDeleteModal);
    
    // Close modal when clicking the Cancel button
    document.getElementById('cancelDeleteBtn').addEventListener('click', closeDeleteModal);
    
    // Handle confirm delete button click
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDeleteReceipt);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('deleteReceiptModal');
        if (event.target === modal) {
            closeDeleteModal();
        }
    });
    
    // Update the renderReceipts function to add data attributes for easier deletion
    const originalRenderReceipts = window.renderReceipts;
    window.renderReceipts = function(receiptData) {
        const tbody = document.getElementById('receiptTableBody');
        tbody.innerHTML = '';

        receiptData.forEach(receipt => {
            const row = document.createElement('tr');
            // Add data attribute for easier row selection
            row.setAttribute('data-receipt-id', receipt.id);
            row.innerHTML = `
                <td>${receipt.id}</td>
                <td>${receipt.client}</td>
                <td>${receipt.date}</td>
                <td>$${receipt.amount.toFixed(2)}</td>
                <td>
                    <span class="status-badge status-${receipt.status}">
                        ${receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                    </span>
                </td>
                <td class="action-buttons">
                    <button class="btn btn-secondary" onclick="viewReceipt('${receipt.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-primary" onclick="printReceipt('${receipt.id}')">
                        <i class="fas fa-print"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteReceipt('${receipt.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    };
});