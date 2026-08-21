---
name: iubizon-business-checkout-niubiz
description: Reglas de Negocio Oficiales para el Checkout, Carrito Multi-Tienda y Pasarela Niubiz en iubizon. Usar antes de modificar cualquier flujo de pago del comprador o integración de pasarela.
---

# 💳 Reglas de Negocio Oficiales: Checkout y Pasarela Niubiz en iubizon

Este skill define la lógica de negocio inalterable para el proceso de compra del cliente, formación de la orden y la transacción de pago con la pasarela Niubiz.

> [!IMPORTANT]
> **REGLA DE GUARDIA:** Si algún cambio solicitado por el usuario requiere modificar las reglas de este skill, el agente DEBE emitir una alerta explícita informando que se está alterando la lógica de negocio establecida y solicitar confirmación/aprobación antes de aplicar el cambio.

---

## 1. Carrito Multi-Proveedor y Desglose en Paquetes

- **Cobro Unificado al Comprador:** El comprador realiza un único pago total en el Checkout por todo su carrito (`total_amount = subtotal + shipping_cost + tax_amount`).
- **Agregación por Empresa (`OrderPackage[]`):** Tras confirmarse el pago, la orden se desglosa automáticamente en un paquete independiente (`OrderPackage`) por cada empresa vendedora presente en la compra.

---

## 2. Unicidad de Transacción Niubiz (`PaymentTransaction.purchase_number`)

- Para la pasarela Niubiz se genera un número de compra único e inmutable (`purchase_number`).
- El estado de la transacción en `PaymentTransaction` sigue el flujo:
  - `pending`: Formulario de pago abierto esperando tokenización/autorización.
  - `authorized`: Pago aprobado por la pasarela de tarjeta. La orden se crea con `Order.status = "pending"` (no existe transición automática a `paid`; ver skill `iubizon-business-logistics`).
  - `denied` / `failed`: Pago rechazado por saldo insuficiente, fraude o error bancario. La orden permanece no efectuada.

---

## 3. Atomicidad y Rollback de Órdenes
- La creación de la orden, los paquetes, ítems, registros de envío e impuestos se ejecuta dentro de una **Transacción Prisma Atómica** (`prisma.$transaction`). Si falla cualquier inserción o la llamada a la pasarela, se realiza rollback completo.
