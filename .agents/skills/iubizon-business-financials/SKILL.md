---
name: iubizon-business-financials
description: Reglas de Negocio Oficiales para el Cálculo de Comisiones, Inmutabilidad de Órdenes y Ciclo de Pagos (SellerPayouts) en iubizon. Usar antes de modificar cualquier cálculo financiero o de comisiones.
---

# 💰 Reglas de Negocio Oficiales: Comisiones y Pagos en iubizon

Este skill define la lógica de negocio inalterable para el cálculo de comisiones, inmutabilidad de orden y liquidación de pagos (`SellerPayout`) en iubizon.

> [!IMPORTANT]
> **REGLA DE GUARDIA:** Si algún cambio solicitado por el usuario requiere modificar las reglas de este skill, el agente DEBE emitir una alerta explícita informando que se está alterando la lógica de negocio establecida y solicitar confirmación/aprobación antes de aplicar el cambio.

---

## 1. Reglas de Resolución de Comisión

Al momento de cotizar o crear una orden, la comisión de la plataforma se resuelve con la siguiente jerarquía:

1. **Prioridad 1 (Comisión Preferencial por Empresa):**
   - Si la empresa (`Company`) posee `custom_commission_rate` configurado y la fecha actual es anterior a `custom_commission_until` (o es indefinido `null`), se aplica esa tasa preferencial.
2. **Prioridad 2 (Exención Matriz IUBIZON):**
   - Si la empresa es IUBIZON (RUC 20614600374), la comisión y tarifa fija son `0`.
3. **Prioridad 3 (Fallback Global `COMMISSION_CONFIG`):**
   - Si no aplica preferencia ni exención, se consulta el `base_rate` y `fixed_fee` vigentes en la tabla `platform_settings` (clave `COMMISSION_CONFIG`).

---

## 2. Regla del Umbral de S/ 40.00 (`fixed_fee` S/ 2.50)

El cálculo exacto de la comisión sobre un subtotal se realiza mediante la función pura `calculateCommission`:

- **Si `subtotal < S/ 40.00`:** `Comisión = (subtotal × tasa) + S/ 2.50` (tarifa fija por procesamiento de monto menor).
- **Si `subtotal >= S/ 40.00`:** `Comisión = subtotal × tasa`.

*Nota:* Si la tasa es `0` (exención), la tarifa fija es `0`.

---

## 3. Regla de Inmutabilidad de Comisión en la Orden

- **Congelamiento en Creación:** Al ejecutarse la compra (`createFullOrder`), la tasa efectiva calculada se almacena permanentemente en la columna `commission_rate` del paquete (`OrderPackage`) y de la orden (`Order`).
- **Protección Retroactiva:** Si en el futuro el Administrador modifica el `base_rate` en `COMMISSION_CONFIG` de `platform_settings` o altera la comisión preferencial de la empresa, **las órdenes creadas previamente MANTIENEN SU TASA E HISTORIAL DE COMISIÓN INTACTOS**. La nueva comisión solo afecta a órdenes nuevas.
- **Pagos calculados SIEMPRE con la tasa congelada:** Todo recálculo de comisión (liquidación de `SellerPayout`, reembolsos parciales, retornos a inventario) DEBE leer el campo `commission_rate` congelado de la orden/paquete. **Prohibido** recalcular con la tasa vigente de `platform_settings` o con valores hardcodeados.

---

## 4. Ciclo de Vida y Estados del Pago al Vendedor (`SellerPayout.status`)

Las retribuciones netas a vendedores se liquidan basándose en la tasa congelada `pkg.commission_rate` y siguen estrictamente 6 estados.

> [!NOTE]
> **La liquidación de pagos se gestiona desde el Admin (`/apps/admin`)**: el Administrador es quien procesa los `SellerPayout` (marcar `processing` → `paid`, transferencias Niubiz o manuales) y también gestiona órdenes y reembolsos desde ahí.

1. **`in_hold` (Retenido en Garantía):** Paquete entregado, pero dentro del período de garantía de 7 días o con reembolso activo. **Bloqueado para transferencia.**
2. **`pending` (Disponible para Pago):** Transcurrieron los 7 días de garantía sin disputas activas. **Listo para desembolso por el Admin.**
3. **`processing` (En Proceso de Transferencia):** Admin inició la transferencia bancaria o en pasarela.
4. **`paid` (Abonado / Transferido):** Transferencia efectuada y registrada con `paid_at`, `payment_method`, `reference_code` y comprobante `payment_proof`.
5. **`refunded` (Reembolsado):** Paquete devuelto al 100%, subtotal neto queda en S/ 0.00. Sin saldo por transferir.
6. **`cancelled` (Anulado):** Pago cancelado por ajuste interno del Admin.
