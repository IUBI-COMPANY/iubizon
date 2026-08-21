---
name: iubizon-business-sunat-invoicing
description: Reglas de Negocio Oficiales para Facturación Fiscal SUNAT y Comprobantes de Pago (Boletas y Facturas) en iubizon. Usar antes de modificar cualquier flujo de facturación o impuestos.
---

# 📄 Reglas de Negocio Oficiales: Facturación Fiscal SUNAT en iubizon

Este skill define la lógica de negocio inalterable para los comprobantes fiscales de venta (Boletas y Facturas) en iubizon.

> [!IMPORTANT]
> **REGLA DE GUARDIA:** Si algún cambio solicitado por el usuario requiere modificar las reglas de este skill, el agente DEBE emitir una alerta explícita informando que se está alterando la lógica de negocio establecida y solicitar confirmación/aprobación antes de aplicar el cambio.

---

## 1. Tipos de Comprobante Fiscal

El comprador selecciona el tipo de comprobante en el Checkout (`OrderInvoice.type`):

1. **Boleta de Venta Simple:**
   - **Requisito:** Nombre completo y DNI / Documento de Identidad del comprador.
   - **Regla SUNAT (umbral S/ 700):** Para boletas cuyo subtotal supere S/ 700, es obligatorio registrar el número de documento (DNI) del comprador; de lo contrario la API rechaza la solicitud.
2. **Factura Electrónica:**
   - **Requisitos Obligatorios:** RUC (11 dígitos), Razón Social / Nombre Legal y Dirección Fiscal registrada ante SUNAT.

---

## 2. Inmutabilidad Fiscal (`OrderInvoice`)

- Los datos del comprobante se congelan en el modelo `OrderInvoice` en el instante que la orden es generada.
- Cambios posteriores en el perfil del usuario no modifican la factura o boleta ya emitida.

---

## 3. Ciclo de Envío y Estados SUNAT (`OrderInvoice.sunat_status`)

1. `pending`: Comprobante creado en BD listo para su envío al PSE/OSE SUNAT.
2. `submitted`: Documento enviado al proveedor de facturación.
3. `accepted`: Comprobante aceptado por SUNAT (se almacena el enlace al PDF/XML oficial en `sunat_pdf_url`).
4. `rejected`: Rechazado por SUNAT por inconsistencia de RUC o formato. Requiere subsanación.
