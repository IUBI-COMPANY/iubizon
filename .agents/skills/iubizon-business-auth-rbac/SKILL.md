---
name: iubizon-business-auth-rbac
description: Reglas de Negocio Oficiales para Autenticación, Permisos, Roles de Empresa y Control de Acceso (RBAC) en iubizon. Usar antes de modificar cualquier flujo de autenticación, miembros o empresas activas.
---

# 🔐 Reglas de Negocio Oficiales: Autenticación, Permisos y Roles en iubizon

Este skill define la lógica de negocio inalterable para la autenticación, roles de miembros de empresa (`CompanyMember`) y aislamiento multi-tenant en iubizon.

> [!IMPORTANT]
> **REGLA DE GUARDIA:** Si algún cambio solicitado por el usuario requiere modificar las reglas de este skill, el agente DEBE emitir una alerta explícita informando que se está alterando la lógica de negocio establecida y solicitar confirmación/aprobación antes de aplicar el cambio.

---

## 1. Jerarquía de Roles en la Empresa (`CompanyMember.role`)

1. **`owner` (Propietario de la Empresa):**
   - Control total de la empresa.
   - Puede administrar miembros, modificar datos bancarios/fiscales, ver finanzas/payouts, gestionar catálogo y procesar envíos.
2. **`admin` (Administrador de Tienda):**
   - Puede gestionar catálogo, precios, stock, procesar envíos y atender devoluciones.
   - No puede eliminar la empresa ni alterar cuentas bancarias principales.
3. **`member` (Colaborador Operativo):**
   - Acceso operativo para despacho de pedidos y gestión de inventario.

---

## 2. Manejo de Contexto de Empresa Activa (`Profile.last_active_company_id`)

- Un usuario con cuenta en iubizon puede pertenecer a una o varias empresas (`CompanyMember[]`).
- El campo `Profile.last_active_company_id` almacena la empresa seleccionada actualmente en el Seller Dashboard.
- Al crear una nueva empresa, `last_active_company_id` se conmuta automáticamente a la empresa recién creada.

---

## 3. Aislamiento Multi-Tenant Inquebrantable
- **Aislamiento por `company_id`:** En todas las consultas a la base de datos dentro del Seller Dashboard (`/user/dashboard/*`), las consultas DEBEN filtrar obligatoriamente por los `company_id` asociados a las membresías del usuario autenticado.
- **Prohibición de Fuga de Datos:** Imposible que un vendedor acceda, edite o visualice órdenes, métricas, clientes o datos de payouts de otra empresa.
