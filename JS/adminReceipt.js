// Global variable to store current receipt ID
let currentReceiptId = null;

// Function to view receipt details
function viewReceipt(receiptId) {
  currentReceiptId = receiptId;
  const modal = document.getElementById("viewReceiptModal");

  // Show loading state
  document.getElementById("modal-receipt-id").textContent = "Loading...";
  document.getElementById("modal-receipt-items").innerHTML =
    '<tr><td colspan="4">Loading receipt details...</td></tr>';

  // Display the modal
  modal.style.display = "block";
  document.body.style.overflow = "hidden"; // Prevent scrolling

  // Fetch receipt details from the API
  fetchReceiptDetails(receiptId);
}

// Function to fetch receipt details from the API
async function fetchReceiptDetails(receiptId) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized: Please log in again.");
      closeViewReceiptModal();
      return;
    }

    const response = await fetch(
      `https://trsms-db.onrender.com/api/receipts/${receiptId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch receipt details");
    }

    const receiptData = await response.json();
    displayReceiptDetails(receiptData);
  } catch (error) {
    console.error("Error fetching receipt details:", error);
    document.getElementById("modal-receipt-items").innerHTML =
      '<tr><td colspan="4">Error loading receipt details. Please try again.</td></tr>';
  }
}

// Function to display receipt details in the modal
function displayReceiptDetails(receipt) {
  // Basic receipt info
  document.getElementById("modal-receipt-id").textContent =
    receipt.receiptNumber || `REC-${receipt._id}`;
  document.getElementById("modal-receipt-date").textContent = formatDate(
    receipt.date
  );

  // Status with appropriate class
  const statusElem = document.getElementById("modal-receipt-status");
  statusElem.textContent =
    receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1);
  statusElem.className = `status-badge status-${receipt.status.toLowerCase()}`;

  // Client information
  document.getElementById("modal-client-name").textContent =
    receipt.client?.name || "Unknown Client";
  document.getElementById("modal-client-phone").textContent =
    receipt.client?.phone || "N/A";
  document.getElementById("modal-client-address").textContent =
    receipt.client?.address || "N/A";

  // Receipt items
  const itemsContainer = document.getElementById("modal-receipt-items");
  itemsContainer.innerHTML = "";

  if (receipt.items && receipt.items.length > 0) {
    receipt.items.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.description}</td>
        <td>${item.quantity}</td>
        <td>$${item.unitPrice?.toFixed(2) || "0.00"}</td>
        <td>$${(item.quantity * item.unitPrice).toFixed(2) || "0.00"}</td>
      `;
      itemsContainer.appendChild(row);
    });
  } else {
    itemsContainer.innerHTML =
      '<tr><td colspan="4">No items found for this receipt</td></tr>';
  }

  // Summary information
  document.getElementById("modal-subtotal").textContent = `${
    receipt.subtotal?.toFixed(2) || receipt.amount?.toFixed(2) || "0.00"
  }`;
  document.getElementById("modal-tax").textContent = `${
    receipt.tax?.toFixed(2) || "0.00"
  }`;
  document.getElementById("modal-total").textContent = `${
    receipt.amount?.toFixed(2) || "0.00"
  }`;

  // Payment information
  document.getElementById("modal-payment-method").textContent =
    receipt.paymentMethod || "N/A";
  document.getElementById("modal-payment-date").textContent = formatDate(
    receipt.paymentDate || receipt.date
  );

  // Notes
  document.getElementById("modal-notes").textContent =
    receipt.notes || "No additional notes";
}

// Function to format date
function formatDate(dateString) {
  if (!dateString) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
}

// Function to close the receipt modal
function closeViewReceiptModal() {
  const modal = document.getElementById("viewReceiptModal");
  modal.style.display = "none";
  document.body.style.overflow = "";
  currentReceiptId = null;
}

// Close modal when clicking on X or outside the modal
document.addEventListener("DOMContentLoaded", function () {
  const closeBtn = document.getElementById("closeViewReceiptModal");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeViewReceiptModal);
  }

  window.addEventListener("click", function (event) {
    const modal = document.getElementById("viewReceiptModal");
    if (event.target === modal) {
      closeViewReceiptModal();
    }
  });
});




// Global variable to store the current receipt ID


// Function to open print receipt modal
function printReceipt(receiptId) {
    currentReceiptId = receiptId;
    const modal = document.getElementById("printReceiptModal");
    modal.style.display = "block";
    document.body.style.overflow = "hidden"; // Prevent scrolling

    // Load receipt data
    loadReceiptData(receiptId);
}

// Function to load receipt data
async function loadReceiptData(receiptId) {
    const previewElement = document.getElementById("receiptPreview");

    try {
        // Show loading state
        previewElement.innerHTML = `
            <div class="loading-spinner" style="text-align: center; padding: 20px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #2563eb;"></i>
                <p>Loading receipt...</p>
            </div>
        `;

        // Fetch receipt data from API
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Unauthorized: Please log in again.");
            closePrintReceiptModal();
            return;
        }

        const response = await fetch(
            `https://trsms-db.onrender.com/api/receipts/${receiptId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) {
            throw new Error("Failed to load receipt data");
        }

        const receiptData = await response.json();

        // Format and display receipt in the preview
        previewElement.innerHTML = formatReceiptForPreview(receiptData);
    } catch (error) {
        console.error("Error loading receipt:", error);
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
    // Calculate totals
    const subtotal = receipt.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const tax = subtotal * (receipt.taxRate || 0.07); // Default 7% tax
    const total = subtotal + tax;

    return `
        <div style="font-family: Arial, sans-serif;">
            <h2 style="text-align: center; color: #2563eb;">Receipt</h2>
            <p><strong>Receipt #:</strong> ${receipt._id}</p>
            <p><strong>Date:</strong> ${formatDate(receipt.date)}</p>
            <p><strong>Status:</strong> ${capitalizeFirstLetter(receipt.status)}</p>
            <p><strong>Payment Method:</strong> ${receipt.paymentMethod || "Cash"}</p>
            <hr>
            <p><strong>Client:</strong> ${receipt.client?.name || "Unknown"}</p>
            <p><strong>Address:</strong> ${receipt.client?.address || "N/A"}</p>
            <p><strong>Phone:</strong> ${receipt.client?.phone || "N/A"}</p>
            <hr>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f3f4f6;">
                        <th style="text-align: left;">Item</th>
                        <th style="text-align: right;">Qty</th>
                        <th style="text-align: right;">Price</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${receipt.items
                        .map(
                            (item) => `
                        <tr>
                            <td>${item.description}</td>
                            <td style="text-align: right;">${item.quantity}</td>
                            <td style="text-align: right;">$${item.price.toFixed(
                                2
                            )}</td>
                            <td style="text-align: right;">$${(
                                item.quantity * item.price
                            ).toFixed(2)}</td>
                        </tr>
                    `
                        )
                        .join("")}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
                        <td style="text-align: right;">$${subtotal.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align: right;"><strong>Tax:</strong></td>
                        <td style="text-align: right;">$${tax.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
                        <td style="text-align: right; font-weight: bold;">$${total.toFixed(
                            2
                        )}</td>
                    </tr>
                </tfoot>
            </table>
            <hr>
            <p><strong>Notes:</strong> ${receipt.notes || "No additional notes"}</p>
        </div>
    `;
}

// Function to close the print receipt modal
function closePrintReceiptModal() {
    const modal = document.getElementById("printReceiptModal");
    modal.style.display = "none";
    document.body.style.overflow = "";
    currentReceiptId = null;
}

// Function to print the receipt
function handlePrintNow() {
    const receiptPreview = document.getElementById("receiptPreview");
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
        <html>
        <head>
            <title>Receipt #${currentReceiptId}</title>
            <style>
                body { font-family: Arial, sans-serif; }
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

// Function to delete a receipt
async function deleteReceipt(receiptId) {
    if (!confirm(`Are you sure you want to delete receipt #${receiptId}?`)) {
        return;
    }

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Unauthorized: Please log in again.");
            return;
        }

        const response = await fetch(
            `https://trsms-db.onrender.com/api/receipts/${receiptId}`,
            {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to delete receipt");
        }

        alert(`Receipt ${receiptId} has been deleted successfully.`);
        fetchReceipts(); // Refresh list
    } catch (error) {
        console.error("Error deleting receipt:", error);
        alert(`Error: ${error.message}`);
    }
}

// Function to capitalize first letter of status
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to format date
function formatDate(dateString) {
    if (!dateString) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(dateString));
}

// Close modal when clicking on X
document.addEventListener("DOMContentLoaded", function () {
    const closeBtn = document.getElementById("closePrintReceiptModal");
    if (closeBtn) {
        closeBtn.addEventListener("click", closePrintReceiptModal);
    }

    window.addEventListener("click", function (event) {
        const modal = document.getElementById("printReceiptModal");
        if (event.target === modal) {
            closePrintReceiptModal();
        }
    });
});
