interface InvoiceData {
  tenant: {
    name: string
    email: string
    phone: string
    unit: string
    building: string
  }
  invoice: {
    number: string
    billingPeriod: string
    monthlyRent: number
    arrears: number
    totalDue: number
    dueDate: string
  }
  company: {
    name: string
    address: string
    phone: string
    email: string
  }
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Rent Invoice - ${data.invoice.number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #3B82F6; }
        .invoice-info { text-align: right; }
        .invoice-number { font-size: 18px; font-weight: bold; color: #3B82F6; }
        .tenant-info, .company-info { margin-bottom: 30px; }
        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #374151; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .invoice-details { margin: 30px 0; }
        .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .details-table th, .details-table td { padding: 12px; text-align: left; border-bottom: 1px solid #E5E7EB; }
        .details-table th { background-color: #F9FAFB; font-weight: bold; }
        .total-row { font-weight: bold; background-color: #F3F4F6; }
        .payment-info { background-color: #F0F9FF; padding: 20px; border-radius: 8px; margin: 30px 0; }
        .footer { margin-top: 40px; text-align: center; color: #6B7280; font-size: 12px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .status-pending { background-color: #FEF3C7; color: #92400E; }
        .amount { font-weight: bold; color: #059669; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">🏢 Swyft Agent</div>
          <div style="color: #6B7280; margin-top: 5px;">${data.company.name}</div>
        </div>
        <div class="invoice-info">
          <div class="invoice-number">Invoice #${data.invoice.number}</div>
          <div style="color: #6B7280; margin-top: 5px;">Date: ${new Date().toLocaleDateString()}</div>
          <div class="status-badge status-pending">PENDING</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="company-info">
          <div class="section-title">From:</div>
          <div><strong>${data.company.name}</strong></div>
          <div>${data.company.address}</div>
          <div>Phone: ${data.company.phone}</div>
          <div>Email: ${data.company.email}</div>
        </div>
        
        <div class="tenant-info">
          <div class="section-title">Bill To:</div>
          <div><strong>${data.tenant.name}</strong></div>
          <div>Unit: ${data.tenant.unit}</div>
          <div>Building: ${data.tenant.building}</div>
          <div>Phone: ${data.tenant.phone}</div>
          <div>Email: ${data.tenant.email}</div>
        </div>
      </div>

      <div class="invoice-details">
        <div class="section-title">Invoice Details</div>
        <table class="details-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Period</th>
              <th>Amount (KSh)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Monthly Rent</td>
              <td>${data.invoice.billingPeriod}</td>
              <td class="amount">${formatCurrency(data.invoice.monthlyRent)}</td>
            </tr>
            ${
              data.invoice.arrears > 0
                ? `
            <tr>
              <td>Arrears Carried Forward</td>
              <td>Previous Months</td>
              <td class="amount" style="color: #DC2626;">${formatCurrency(data.invoice.arrears)}</td>
            </tr>
            `
                : ""
            }
            <tr class="total-row">
              <td colspan="2"><strong>Total Amount Due</strong></td>
              <td class="amount"><strong>${formatCurrency(data.invoice.totalDue)}</strong></td>
            </tr>
          </tbody>
        </table>
        
        <div style="margin-top: 20px;">
          <strong>Due Date: ${new Date(data.invoice.dueDate).toLocaleDateString()}</strong>
        </div>
      </div>

      <div class="payment-info">
        <div class="section-title">Payment Instructions</div>
        <div style="margin-top: 10px;">
          <strong>Paybill Number:</strong> 247247<br>
          <strong>Account Number:</strong> ${data.tenant.unit.replace(/\s+/g, "")}<br>
          <strong>Bank Transfer:</strong> Account #1234567890 - KCB Bank<br>
          <strong>M-Pesa:</strong> 0700000000<br>
        </div>
        <div style="margin-top: 15px; color: #059669;">
          <strong>💡 Tip:</strong> Pay early to avoid late fees. Contact us for payment plans if needed.
        </div>
      </div>

      <div class="footer">
        <p>This is a computer-generated invoice. For inquiries, contact ${data.company.email}</p>
        <p>Powered by Swyft Agent - Property Management Made Simple</p>
      </div>
    </body>
    </html>
  `
}

export async function generateInvoicePDF(data: InvoiceData): Promise<string> {
  // In a real implementation, you would use a PDF generation library like Puppeteer or jsPDF
  // For now, we'll return the HTML content as a mock PDF URL
  const html = generateInvoiceHTML(data)

  // Mock PDF generation - in production, use proper PDF generation
  const mockPdfUrl = `data:text/html;base64,${btoa(html)}`

  return mockPdfUrl
}

export function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")

  return `INV-${year}${month}-${random}`
}
