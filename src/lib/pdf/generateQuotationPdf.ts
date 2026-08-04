import { formatPrice } from "@/lib/utils";

interface QuotationItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export function generateQuotationPdf(items: QuotationItem[], total: number) {
  const dateStr = new Date().toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const quoteNumber = `COT-${Date.now().toString().slice(-6)}`;

  const itemsHtml = items
    .map(
      (item, index) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px; text-align: center; color: #64748b;">${index + 1}</td>
      <td style="padding: 12px; font-weight: 600; color: #112237;">${item.title}</td>
      <td style="padding: 12px; text-align: center; font-weight: 700; color: #112237;">${item.quantity}</td>
      <td style="padding: 12px; text-align: right; color: #475569;">${formatPrice(item.price)}</td>
      <td style="padding: 12px; text-align: right; font-weight: 700; color: #f25c05;">${formatPrice(item.price * item.quantity)}</td>
    </tr>
  `
    )
    .join("");

  const printHtml = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Cotización ${quoteNumber} - iubizon</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          margin: 0;
          padding: 40px;
          color: #112237;
          background: #ffffff;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #f25c05;
          padding-bottom: 24px;
          margin-bottom: 32px;
        }
        .logo-title {
          font-size: 28px;
          font-weight: 900;
          color: #112237;
          letter-spacing: -0.5px;
        }
        .logo-tag {
          color: #f25c05;
          font-size: 13px;
          font-weight: 700;
        }
        .quote-info {
          text-align: right;
        }
        .quote-badge {
          background: #fff7ed;
          border: 1px solid #ffedd5;
          color: #c2410c;
          font-weight: 800;
          padding: 6px 14px;
          border-radius: 12px;
          font-size: 14px;
          display: inline-block;
          margin-bottom: 8px;
        }
        .company-details {
          display: flex;
          justify-content: space-between;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 32px;
          font-size: 13px;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 32px;
          font-size: 13px;
        }
        .table th {
          background: #112237;
          color: #ffffff;
          padding: 12px;
          text-align: left;
          font-weight: 700;
        }
        .totals {
          width: 320px;
          margin-left: auto;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 20px;
          border-radius: 16px;
          font-size: 13px;
          margin-bottom: 40px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
        }
        .totals-row.final {
          border-top: 2px solid #f25c05;
          margin-top: 8px;
          padding-top: 12px;
          font-size: 16px;
          font-weight: 800;
          color: #112237;
        }
        .footer-terms {
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
          font-size: 11px;
          color: #64748b;
          line-height: 1.6;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo-title">iubizon<span style="color: #f25c05;">.com</span></div>
          <div class="logo-tag">Tecnología para educar y trabajar</div>
        </div>
        <div class="quote-info">
          <div class="quote-badge">COTIZACIÓN DE PAQUETE</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Nº Documento: <strong>${quoteNumber}</strong></div>
          <div style="font-size: 12px; color: #64748b;">Fecha: <strong>${dateStr}</strong></div>
          <div style="font-size: 12px; color: #64748b;">Validez: <strong>15 días calendario</strong></div>
        </div>
      </div>

      <div class="company-details">
        <div>
          <strong style="color: #112237; font-size: 14px;">Emisor del servicio:</strong><br>
          <strong>IUBIZON COMPANY S.A.C.</strong><br>
          RUC: 20614600374<br>
          Lima, Perú
        </div>
        <div style="text-align: right;">
          <strong style="color: #112237; font-size: 14px;">Contacto y Atenciones:</strong><br>
          Email: iubizon.company@gmail.com<br>
          Teléfono / WhatsApp: +51 972 300 301<br>
          Web: www.iubizon.com
        </div>
      </div>

      <h3 style="font-size: 15px; font-weight: 800; margin-bottom: 12px; color: #112237;">
        Detalle de Productos del Paquete Solución
      </h3>

      <table class="table">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th>Descripción del Producto / Solución</th>
            <th style="width: 80px; text-align: center;">Cant.</th>
            <th style="width: 120px; text-align: right;">P. Unit. (S/)</th>
            <th style="width: 140px; text-align: right;">Importe (S/)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal Neto:</span>
          <strong>${formatPrice(total / 1.18)}</strong>
        </div>
        <div class="totals-row">
          <span>IGV (18%):</span>
          <strong>${formatPrice(total - total / 1.18)}</strong>
        </div>
        <div class="totals-row final">
          <span>Total Paquete (S/):</span>
          <span style="color: #f25c05;">${formatPrice(total)}</span>
        </div>
      </div>

      <div class="footer-terms">
        <strong>Términos y Condiciones de la Cotización:</strong><br>
        • Todos los precios incluyen IGV y garantía oficial emitida por los fabricantes / vendedores en iubizon.<br>
        • Incluye opción de consolidación y despacho unificado en un solo envío a domicilio o institución.<br>
        • Para hacer efectiva esta cotización y proceder con la compra, ingrese a <strong>www.iubizon.com</strong> o contacte a nuestro equipo de atención corporativa al <strong>+51 972 300 301</strong>.<br>
        • Documento generado automáticamente por la plataforma iubizon.
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(printHtml);
    printWindow.document.close();
  }
}
