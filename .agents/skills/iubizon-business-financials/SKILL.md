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
> **Separación de Responsabilidades en el Admin (`/apps/admin`)**:
> - **Módulo Pagos (`/dashboard/pagos`)**: Gestiona exclusivamente la tesorería y liquidación a vendedores (`SellerPayout`: `in_hold` → `pending` → `processing` → `paid` / `refunded`). No duplica la operativa de reclamos de compradores ni muestra banners rojos de disputas.
> - **Módulo Reembolsos (`/dashboard/reembolsos`)**: Gestiona exclusivamente los reclamos del comprador, logística inversa y extornos a tarjeta.

1. **`in_hold` (Retenido en Garantía):** Paquete entregado, pero dentro del período de garantía de 7 días o con reembolso activo. **Bloqueado para transferencia.**
2. **`pending` (Disponible para Pago):** Transcurrieron los 7 días de garantía sin disputas activas. **Listo para desembolso por el Admin.**
3. **`processing` (En Proceso de Transferencia):** Admin inició la transferencia bancaria o en pasarela.
4. **`paid` (Abonado / Transferido):** Transferencia efectuada y registrada con `paid_at`, `payment_method`, `reference_code` y comprobante `payment_proof`.
5. **`refunded` (Reembolsado):** Paquete devuelto al 100%, subtotal neto queda en S/ 0.00. Sin saldo por transferir.
6. **`cancelled` (Anulado):** Pago cancelado por ajuste interno del Admin.

---

## 5. Reglas de Recálculo Financiero ante Devoluciones

Cuando un paquete experimenta una devolución (aprobada y completada):

1. **Subtotal Efectivo:** `subtotal_efectivo = max(0, subtotal_original - subtotal_reembolsado)`.
2. **Comisión Recalculada:** Se recalcula la comisión de plataforma sobre el `subtotal_efectivo` utilizando la tasa congelada `pkg.commission_rate` y aplicando la regla del umbral de S/ 40.00 (`fixed_fee` de S/ 2.50 si `subtotal_efectivo < S/ 40.00`).
3. **Devolución Total (100%):** Si el subtotal efectivo llega a 0, el `SellerPayout` pasa automáticamente al estado `refunded`, con `subtotal = 0.00`, `commission = 0.00` y `net_amount = 0.00`.
4. **Devolución Parcial:** Si quedan ítems efectivos, el `SellerPayout` ajusta su `subtotal`, `commission` y `net_amount` a los productos retenidos por el comprador, preservando la inmutabilidad de la tasa original.
