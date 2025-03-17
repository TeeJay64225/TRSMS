// Function to fetch invoices from the database
async function fetchInvoices() {
  try {
      const token = localStorage.getItem('token'); // Get stored auth token
      if (!token) {
          alert("Unauthorized: Please log in again.");
          return;
      }

      // API Request to fetch invoices
      const response = await fetch('https://trsms-db.onrender.com/api/invoices', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch invoices');

      const invoices = await response.json();

      // Display invoices in the table
      renderInvoiceTable(invoices);
  } catch (error) {
      console.error('Error fetching invoices:', error);
      document.getElementById('invoiceTableBody').innerHTML = `<tr><td colspan="7" style="color: red;">Error loading invoices</td></tr>`;
  }
}

// Function to render invoices in the table
function renderInvoiceTable(invoices) {
  const tbody = document.getElementById('invoiceTableBody');
  tbody.innerHTML = ''; // Clear table before inserting new rows

  if (!invoices || invoices.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7">No invoices found</td></tr>`;
      return;
  }

  invoices.forEach(invoice => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${invoice.invoiceNumber || `INV-${invoice._id}`}</td>
          <td>${invoice.client?.name || 'Unknown'}</td>
          <td>${formatDate(invoice.createdAt)}</td>
          <td>${formatDate(invoice.dueDate)}</td>
          <td>$${invoice.total?.toFixed(2) || '0.00'}</td>
          <td><span class="status-badge status-${invoice.status?.toLowerCase()}">${invoice.status || 'N/A'}</span></td>
          <td class="action-buttons">
              <button class="btn btn-secondary" onclick="viewInvoice('${invoice._id}')">View</button>
              <button class="btn btn-primary" onclick="editInvoice('${invoice._id}')">Edit</button>
              <button class="btn btn-danger" onclick="deleteInvoice('${invoice._id}')">Delete</button>
          </td>
      `;
      tbody.appendChild(row);
  });
}

// Function to format date for better readability
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(dateString));
}

// Fetch and display invoices when the page loads
document.addEventListener('DOMContentLoaded', fetchInvoices);






//view modal
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('viewInvoiceModal');
  const closeModalBtn = document.getElementById('closeViewInvoiceModal');
  const closeInvoiceBtn = document.getElementById('closeInvoiceBtn');
  const printInvoiceBtn = document.getElementById('printInvoiceBtn');
  const emailInvoiceBtn = document.getElementById('emailInvoiceBtn');

  let currentInvoiceId = null;

  // Function to open and load invoice details
  async function viewInvoice(invoiceId) {
      currentInvoiceId = invoiceId;

      // Show the modal
      modal.style.display = 'block';
      document.body.style.overflow = 'hidden'; // Prevent background scrolling

      try {
          // Fetch invoice data from the API
          const token = localStorage.getItem('token');
          if (!token) {
              alert('Unauthorized: Please log in again.');
              closeModal();
              return;
          }

          console.log(`Fetching invoice details for ID: ${invoiceId}`);

          const response = await fetch(`https://trsms-db.onrender.com/api/invoices/${invoiceId}`, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!response.ok) {
              throw new Error(`Failed to fetch invoice details (Status: ${response.status})`);
          }

          const invoice = await response.json();
          console.log("Invoice Data:", invoice);

          if (!invoice || !invoice._id) {
              throw new Error('Invalid invoice data received');
          }

          // Populate modal fields
          document.getElementById('viewInvoiceId').textContent = invoice.invoiceNumber || `INV-${invoice._id}`;
          document.getElementById('viewInvoiceClient').textContent = invoice.client?.name || 'Unknown';
          document.getElementById('viewInvoiceDate').textContent = formatDate(invoice.date);
          document.getElementById('viewInvoiceDueDate').textContent = formatDate(invoice.dueDate);
          document.getElementById('viewInvoiceAmount').textContent = `$${invoice.total?.toFixed(2) || '0.00'}`;

          const statusElement = document.getElementById('viewInvoiceStatus');
          statusElement.textContent = invoice.status || 'Pending';
          statusElement.className = `detail-value status-${(invoice.status || 'pending').toLowerCase()}`;

          // Populate invoice items
          const itemsContainer = document.getElementById('viewInvoiceItems');
          itemsContainer.innerHTML = '';

          if (invoice.items?.length) {
              invoice.items.forEach(item => {
                  const row = document.createElement('tr');
                  row.innerHTML = `
                      <td>${item.description || 'N/A'}</td>
                      <td>${item.quantity || 0}</td>
                      <td>$${(item.price || 0).toFixed(2)}</td>
                      <td>$${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td>
                  `;
                  itemsContainer.appendChild(row);
              });
          } else {
              itemsContainer.innerHTML = '<tr><td colspan="4">No items on this invoice</td></tr>';
          }

          // Populate totals
          document.getElementById('viewInvoiceSubtotal').textContent = `$${invoice.subtotal?.toFixed(2) || '0.00'}`;
          document.getElementById('viewInvoiceTax').textContent = `$${invoice.tax?.toFixed(2) || '0.00'}`;
          document.getElementById('viewInvoiceTotal').textContent = `$${invoice.total?.toFixed(2) || '0.00'}`;
          document.getElementById('viewInvoiceNotes').textContent = invoice.notes || 'No notes';

      } catch (error) {
          console.error('Error loading invoice details:', error);
          document.getElementById('viewInvoiceItems').innerHTML = `<tr><td colspan="4" style="color: red;">Error loading invoice details: ${error.message}</td></tr>`;
      }
  }

  // Format date function
  function formatDate(dateString) {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
      });
  }

  // Close modal function
  function closeModal() {
      modal.style.display = 'none';
      document.body.style.overflow = ''; // Re-enable scrolling
  }

  // Close modal event listeners
  closeModalBtn.addEventListener('click', closeModal);
  closeInvoiceBtn.addEventListener('click', closeModal);
  window.addEventListener('click', event => {
      if (event.target === modal) closeModal();
  });

  // Print invoice
  printInvoiceBtn.addEventListener('click', function () {
      window.print();
  });

  // Email invoice
  emailInvoiceBtn.addEventListener('click', async function () {
      try {
          const token = localStorage.getItem('token');
          const response = await fetch(`https://trsms-db.onrender.com/api/invoices/${currentInvoiceId}/email`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              }
          });

          if (!response.ok) {
              throw new Error('Failed to send invoice via email');
          }

          alert('Invoice emailed successfully!');
      } catch (error) {
          console.error('Error emailing invoice:', error);
          alert('Failed to send invoice');
      }
  });

  // Expose the function globally
  window.viewInvoice = viewInvoice;
});
