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
