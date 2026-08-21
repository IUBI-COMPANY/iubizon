---
name: iubizon-business-catalog
description: Reglas de Negocio Oficiales para el Catálogo, Productos e Inventario en iubizon (Activación Mínima, Stock, Precios y Moderación). Usar antes de modificar cualquier flujo de productos o catálogo.
---

# 🛍️ Reglas de Negocio Oficiales: Catálogo, Productos e Inventario en iubizon

Este skill define la lógica de negocio inalterable para la creación, edición, moderación y control de inventario de productos en iubizon.

> [!IMPORTANT]
> **REGLA DE GUARDIA:** Si algún cambio solicitado por el usuario requiere modificar las reglas de este skill, el agente DEBE emitir una alerta explícita informando que se está alterando la lógica de negocio establecida y solicitar confirmación/aprobación antes de aplicar el cambio.

---

## 1. Requisitos Mínimos de Activación de Producto (`status = "active"`)

Un producto sólo puede pasar a estado activo (`status = "active"`) en la tienda pública si cumple **TODOS** los siguientes requisitos indispensables:

1. **Título Válido:** No vacío ni compuesto únicamente por espacios.
2. **Precio Válido:** Mayor a cero (`price > 0`).
3. **Stock Válido:** Mayor a cero (`stock > 0`).
4. **Imágenes Oblicuas:** Al menos **1 imagen de producto subida** y vinculada en `ProductImage`.

*Si falta cualquiera de estos 4 requisitos, el producto debe permanecer o cambiar automáticamente a estado inactivo (`status = "inactive"`).*

---

## 2. Estados Oficiales del Producto (`Product.status`)

1. `draft` / `inactive`: Borrador o inactivo. No visible en el catálogo público ni en búsquedas.
2. `active`: Producto verificado, activo y disponible para compra en el marketplace.
3. `sold`: Producto cuyo stock llegó a `0` tras una compra (se asigna automáticamente al descontar el último stock).
4. `archived` / `deleted`: Archivado o eliminado lógicamente.

> [!NOTE]
> Una empresa personal (`is_personal = true`) publica productos con `status = "active"` de inmediato (no requiere verificación Admin). Una empresa comercial no verificada publica en `status = "inactive"` y solo se activa por lote al aprobarse (ver skill `iubizon-business-company-onboarding`).

---

## 3. Control de Stock e Inventario
- **Reserva/Descuento de Stock:** Al ser autorizada y pagada una orden (`Order.status = "paid"`), el stock de los productos comprados se descuenta inmediatamente.
- **Restauración de Stock:** Si una orden es cancelada antes de la entrega o si se aprueba la devolución de un producto con retorno a inventario, el stock se incrementa automáticamente por el número exacto de unidades devueltas.

---

## 4. Moderación por Verificación de Empresa
- Si la empresa vendedora se encuentra sin verificar (`is_verified = false`), sus productos permanecen inactivos.
- Al verificarse la empresa por primera vez, el sistema activa por lote únicamente aquellos productos que cumplan los 4 Requisitos Mínimos de Activación.
