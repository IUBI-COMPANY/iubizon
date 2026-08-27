---
name: iubizon-business-rules
description: Protocolo Central y Colección de Skills de Lógica de Negocio de iubizon. OBLIGATORIO consultar antes de realizar cualquier cambio funcional o arquitectónico en la plataforma.
---

# 🛡️ Protocolo Principal de Lógica de Negocio en iubizon

Este skill es la **referencia central e inalterable** para el desarrollo de funcionalidades y refactorizaciones en la plataforma iubizon.

> [!CAUTION]
> **REGLA DE GUARDIA OBLIGATORIA DE CAMBIOS DE NEGOCIO:**
> Antes de realizar cualquier modificación en el código, el agente DEBE consultar los skills de negocio aplicables.
> Si una solicitud o cambio requiere modificar o romper alguna regla contenida en estos skills, el agente **NO DEBE APLICAR EL CAMBIO AUTOMÁTICAMENTE**.
> En su lugar, DEBE emitir una **alerta explícita al usuario** indicando:
> 1. Qué regla de negocio se estaría modificando.
> 2. Por qué el cambio solicitado afecta la lógica establecida.
> 3. Solicitar la aprobación explícita del usuario para actualizar el skill y la lógica de negocio.

---

## 📚 Skills de Dominio de Negocio Disponibles

### 🏢 Dominio: Empresa y Acceso

1. **`iubizon-business-company-onboarding`:**
   - Registro de Empresa Personal vs Comercial (`Company.is_personal`).
   - Unicidad inquebrantable de RUC (`tax_id`) y generación de slug único.
   - Proceso de verificación Admin (`is_verified`) y activación por lote de productos borradores.
   - Protección de re-aprobación tardía (> 30 días de suspensión fuerzan `stock: 0` e `inactive`).

2. **`iubizon-business-auth-rbac`:**
   - Roles de empresa: `owner`, `admin`, `member`.
   - Manejo de contexto de empresa activa (`last_active_company_id`).
   - Aislamiento multi-tenant inquebrantable por `company_id`.

---

### 🛍️ Dominio: Catálogo y Productos

3. **`iubizon-business-catalog`:**
   - Requisitos mínimos de activación de producto (título, precio > 0, stock > 0, ≥ 1 imagen).
   - Estados del producto (`inactive`, `active`, `archived`).
   - Control de stock: descuento en compra pagada, restauración en cancelación/devolución.

---

### 💳 Dominio: Checkout y Pagos

4. **`iubizon-business-checkout-niubiz`:**
   - Carrito multi-proveedor con cobro unificado al comprador.
   - Desglose automático en paquetes por empresa (`OrderPackage[]`).
   - Unicidad de `purchase_number` Niubiz y manejo de respuestas de pasarela.
   - Atomicidad y rollback de órdenes con `prisma.$transaction`.

5. **`iubizon-business-financials`:**
   - Jerarquía de resolución de comisiones (Preferencial > Exención Matriz IUBIZON > Fallback Global `platform_settings`).
   - Regla de Umbral de S/ 40.00 (`fixed_fee` S/ 2.50 si < S/ 40.00).
   - Inmutabilidad y congelamiento de `commission_rate` al crear la orden.
   - Ciclo de vida de 6 estados para `SellerPayout` (`in_hold`, `pending`, `processing`, `paid`, `refunded`, `cancelled`).

6. **`iubizon-business-sunat-invoicing`:**
   - Comprobantes fiscales: Boleta (DNI) y Factura (RUC + Razón Social + Dirección Fiscal).
   - Inmutabilidad fiscal en `OrderInvoice`.
   - Ciclo de envío a SUNAT (`pending`, `submitted`, `accepted`, `rejected`).

---

### 🚚 Dominio: Logística y Post-Venta

7. **`iubizon-business-logistics`:**
   - Envío Consolidado (3 Pasos vía Almacén Chorrillos) vs Envío Directo (2 Pasos).
   - Máquina de estados de la Orden y Paquete (`pending`, `paid`, `processing`, `in_transit_to_warehouse`, `received_in_warehouse`, `shipped`, `delivered`, `completed`, `cancelled`).

8. **`iubizon-business-refunds`:**
   - Período de protección de 7 días al comprador.
   - Ruta de devolución de 2 ó 3 nodos según `delivery_type`.
   - Máquina de estados de reembolso (`pending`, `approved_for_return`, `return_shipped`, `return_received`, `completed`, `rejected`).
   - Retención anti-fraude de Payouts en `in_hold` durante reclamos activos.

---

## 📌 Guía de Uso en el Desarrollo
- **Al Planificar:** Consultar los skills de negocio relevantes para la tarea.
- **Al Implementar:** Seguir obligatoriamente el protocolo de `iubizon-engineering-standards`.
- **Al Auto-Auditar:** Inspeccionar el `git diff` línea por línea, cotejar contratos de API frontend ↔ backend y validar casos de borde multi-tienda.
- **Al Validar:** Verificar con `npx tsc --noEmit` y `npm run lint`.

---

## ⚙️ Estándar de Ingeniería Transversal

**`iubizon-engineering-standards`:**
- Flujo obligatorio de 8 fases: Investigación → Análisis → Reutilización → Implementación → Integridad → Limpieza / Cero Diálogos Nativos → Auto-Auditoría Activa (Línea por Línea) → Verificación Automatizada.
- Principios DRY, Single Responsibility, Composición, Fail-Safe, Consistencia con BD y Auto-Auditoría Activa.
- Prohibiciones explícitas: cero `alert()`/`confirm()` nativos, no inventar columnas, no duplicar tipos, no hardcodear valores, no ignorar errores.

