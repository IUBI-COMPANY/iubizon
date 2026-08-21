---
name: iubizon-business-refunds
description: Reglas de Negocio Oficiales para Devoluciones y Reembolsos en iubizon (Período de Garantía 7 días, Nodos de Devolución 2 ó 3 pasos, Retención Anti-Fraude de Payouts). Usar antes de modificar cualquier flujo o endpoint de reembolsos.
---

# 🔄 Reglas de Negocio Oficiales: Devoluciones y Reembolsos en iubizon

Este skill define la lógica de negocio inalterable para las solicitudes de reembolso y retorno de productos en iubizon.

> [!IMPORTANT]
> **REGLA DE GUARDIA:** Si algún cambio solicitado por el usuario requiere modificar las reglas de este skill, el agente DEBE emitir una alerta explícita informando que se está alterando la lógica de negocio establecida y solicitar confirmación/aprobación antes de aplicar el cambio.

---

## 1. Período de Protección al Comprador (7 Días)
- El comprador puede solicitar reembolso dentro de los **7 días posteriores a la fecha de entrega (`delivered`)**.
- Durante este periodo de 7 días, el pago correspondiente al vendedor (`SellerPayout`) se congela obligatoriamente en estado `in_hold`.

---

## 2. Nodos del Timeline de Devolución según `delivery_type`

Al igual que en los envíos de venta, el retorno de productos sigue la modalidad del paquete original:

1. **Retorno Vía Almacén iubizon (3 Nodos para `delivery_type = "complete"`):**
   - **Nodo 1:** Comprador registra el despacho de devolución.
   - **Nodo 2:** Almacén Central iubizon (Chorrillos, Lima) recepciona y realiza inspección técnica de control de calidad.
   - **Nodo 3:** Retorno Final al Vendedor.

2. **Retorno Directo a Tienda Vendedor (2 Nodos para `delivery_type = "progressive"`):**
   - **Nodo 1:** Comprador registra el despacho directo de devolución.
   - **Nodo 2:** Vendedor recepciona y verifica físicamente el producto en su tienda.

---

## 3. Máquina de Estados Oficiales del Reembolso (`RefundRequest.status`)

> [!NOTE]
> Los valores canónicos almacenados en `RefundRequest.status` son exactamente estos 6. No usar nombres alternativos (`approved_for_return`, `return_shipped`, `completed`) porque NO son los que persiste el código.

1. `pending`: Solicitud creada por el comprador, en revisión por el Admin iubizon.
2. `approved`: Admin aprueba la solicitud. Se habilita al comprador el registro del envío de retorno.
3. `return_in_transit`: Comprador despachó el producto e ingresó la guía de retorno.
4. `return_received`: El producto fue recepcionado y verificado (por Admin en Chorrillos para `complete` o por el Vendedor para `progressive`).
5. `refunded`: Reembolso liquidado al comprador en pasarela/transferencia.
6. `rejected`: Solicitud denegada justificadamente por el Admin iubizon.

---

## 4. Retención Anti-Fraude en Liquidación a Vendedores
- **Regla Inquebrantable:** Mientras exista una solicitud de reembolso activa (estado distinto de `rejected` o `refunded`), el pago al vendedor (`SellerPayout`) **PERMANECE BLOQUEADO EN `in_hold`**, impidiendo cualquier transferencia de fondos al vendedor mientras el producto está en disputa o tránsito de retorno.
