---
name: iubizon-business-logistics
description: Reglas de Negocio Oficiales para la Logística de Envíos de iubizon (Envío Consolidado 3 Pasos vs Envío Directo 2 Pasos, Máquina de Estados de Órdenes y Almacén Chorrillos). Usar antes de modificar cualquier flujo o endpoint de despacho.
---

# 🚚 Reglas de Negocio Oficiales: Logística de Envíos en iubizon

Este skill define la lógica de negocio inalterable para los envíos en el marketplace iubizon.

> [!IMPORTANT]
> **REGLA DE GUARDIA:** Si algún cambio solicitado por el usuario requiere modificar las reglas de este skill, el agente DEBE emitir una alerta explícita informando que se está alterando la lógica de negocio establecida y solicitar confirmación/aprobación antes de aplicar el cambio.

---

## 1. Tipos de Envío (`delivery_type`)

Existen exactamente dos modalidades de envío por paquete (`OrderPackage.delivery_type`):

1. **Envío Consolidado por iubizon (`delivery_type = "complete"`):**
   - **Nodos del Stepper (3 Pasos):**
     1. **Origen:** Proveedor / Vendedor prepara paquete.
     2. **Almacén Central iubizon:** Paquete en tránsito y recepcionado físicamente en Chorrillos.
     3. **Tu Domicilio / Destino Cliente:** iubizon consolida y despacha el paquete final a la puerta del cliente.
   - **Dirección del Centro de Acopio:** se obtiene **dinámicamente** de la BD en `platform_settings` (clave `IUBIZON_SETTINGS`, campos `address` + `district` + `department`). Valor por defecto: `Calle las acacias, Pje. los Jazmines 181, Chorrillos, Lima (RUC: 20614600374)`.

2. **Envío Directo del Proveedor (`delivery_type = "progressive"`):**
   - **Nodos del Stepper (2 Pasos):**
     1. **Origen:** Proveedor / Vendedor prepara paquete.
     2. **Tu Domicilio / Destino Cliente:** Proveedor realiza despacho directo al domicilio del comprador.

---

## 2. Máquina de Estados Oficiales de la Orden (`Order.status` / `OrderPackage.status`)

> [!NOTE]
> Estados que la plataforma **efectivamente escribe** en `Order.status` / `OrderPackage.status`. No usar `processing`, `in_transit_to_warehouse` ni transición automática a `completed`/`paid`: no están implementados en el código actual.

1. `pending`: Orden creada en checkout (incluye órdenes ya pagadas con tarjeta; no existe transición automática a `paid`).
2. `shipped`: Paquete despachado hacia su destino final (al Almacén Chorrillos si `complete`, o directo al cliente si `progressive`).
3. `received_in_warehouse` *(Solo `complete`)*: Admin iubizon escaneó y confirmó recepción física en Chorrillos.
4. `delivered`: Entrega física confirmada al comprador. **Activa el temporizador de 7 días del Seguro del Comprador**.
5. `refunded`: Orden reembolsada al 100% por el Admin (solo reembolsos `full`).
6. `cancelled`: Orden anulada antes de entrega (por el vendedor o por soporte Admin).

> [!NOTE]
> `paid` y `completed` se referencian en consultas/UI (filtros de dashboard, elegibilidad de reembolso) pero **no son estados que el código transicione de forma automática hoy**: la orden queda en `delivered` y solo el `SellerPayout` avanza a `pending` al vencer los 7 días.

---

## 3. Reglas de Transición y Sincronización
- **Sincronización Automática:** La `Order` global solo pasa a `shipped` o `delivered` cuando **TODOS** sus paquetes (`OrderPackage[]`) alcancen dicho estado.
- **Campos Obligatorios de Tracking:** En cada despacho se requiere registrar `courier`, `tracking_number`, `tracking_url` (opcional) y `estimated_delivery`.
