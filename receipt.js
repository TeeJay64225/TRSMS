// Receipt viewing functionality
function viewReceipt(receiptId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div id="receipt-preview">Loading receipt ${receiptId}...</div>
        </div>
    `;
    document.body.appendChild(modal);

    // Fetch receipt data
    fetch(`/api/receipts/${receiptId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('receipt-preview').innerHTML = generateReceiptHTML(data);
        })
        .catch(error => console.error('Error:', error));

    modal.querySelector('.close').onclick = () => modal.remove();
}

// Print functionality
function printReceipt(receiptId) {
    fetch(`/api/receipts/${receiptId}`)
        .then(response => response.json())
        .then(data => {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Receipt ${data.receiptId}</title>
                        <link rel="stylesheet" href="/css/print-styles.css">
                    </head>
                    <body>
                        ${generateReceiptHTML(data)}
                        <script>
                            window.onload = () => {
                                window.print();
                                window.close();
                            }
                        </script>
                    </body>
                </html>
            `);
        });
}

// Email functionality
function emailReceipt(receiptId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Send Receipt</h2>
            <form id="email-form">
                <input type="email" placeholder="Recipient Email" required>
                <textarea placeholder="Message (optional)"></textarea>
                <button type="submit" class="btn btn-primary">Send</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#email-form').onsubmit = (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        const message = e.target.querySelector('textarea').value;

        fetch('/api/receipts/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiptId, email, message })
        })
        .then(response => {
            if(response.ok) {
                alert('Receipt sent successfully');
                modal.remove();
            }
        })
        .catch(error => console.error('Error:', error));
    };

    modal.querySelector('.close').onclick = () => modal.remove();
}

// Helper function to generate receipt HTML
function generateReceiptHTML(data) {
    return `
        <div class="receipt">
            <h2>Receipt #${data.receiptId}</h2>
            <div class="receipt-details">
                <p><strong>Client:</strong> ${data.client}</p>
                <p><strong>Date:</strong> ${data.date}</p>
                <p><strong>Amount:</strong> $${data.amount}</p>
                <p><strong>Status:</strong> ${data.status}</p>
            </div>
            <div class="receipt-items">
                ${data.items.map(item => `
                    <div class="item">
                        <span>${item.description}</span>
                        <span>$${item.amount}</span>
                    </div>
                `).join('')}
            </div>
            <div class="receipt-total">
                <strong>Total:</strong> $${data.amount}
            </div>
        </div>
    `;
}

// Event listeners for buttons
document.querySelectorAll('.action-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const action = e.target.textContent.toLowerCase();
        const row = e.target.closest('tr');
        const receiptId = row.querySelector('td').textContent;

        switch(action) {
            case 'view':
                viewReceipt(receiptId);
                break;
            case 'print':
                printReceipt(receiptId);
                break;
            case 'email':
                emailReceipt(receiptId);
                break;
        }
    });
});