---
name: iubizon-business-company-onboarding
description: Reglas de Negocio Oficiales para el Registro, Verificación y Gestión de Empresas / Vendedores en iubizon (Unicidad de RUC, Ficha RUC, Slug Único, Aprobación Admin y Activación por Lote de Productos). Usar antes de modificar cualquier flujo o endpoint de empresas.
---

# 🏢 Reglas de Negocio Oficiales: Registro y Verificación de Empresa en iubizon

Este skill define la lógica de negocio inalterable para el registro, onboarding, vinculación de miembros y verificación de empresas en iubizon.

> [!IMPORTANT]
> **REGLA DE GUARDIA:** Si algún cambio solicitado por el usuario requiere modificar las reglas de este skill, el agente DEBE emitir una alerta explícita informando que se está alterando la lógica de negocio establecida y solicitar confirmación/aprobación antes de aplicar el cambio.

---

## 1. Tipos de Empresa (`Company.is_personal`)

1. **Empresa Personal (`is_personal = true`):**
   - Se crea automáticamente para perfiles individuales de usuario.
   - Permite operar sin RUC comercial inicialmente para ventas eventuales.
2. **Empresa Comercial (`is_personal = false`):**
   - Creada a través del formulario de Onboarding de Proveedores (`POST /api/companies`).
   - Requiere datos fiscales y verificación por parte del equipo Administrador de iubizon.

---

## 2. Requisitos y Validaciones Inquebrantables de Registro (`POST /api/companies`)

1. **Campos Obligatorios:** `name` (Nombre Comercial), `email` (Correo Corporativo), `legal_name` (Razón Social SUNAT).
2. **Unicidad Estricta de RUC (`tax_id`):**
   - Imposible registrar dos empresas con el mismo RUC en iubizon. Si el RUC ya existe, la API rechaza la solicitud con el mensaje: `El RUC X ya está registrado en iubizon.`
3. **Ficha RUC (`tax_id_document_url`):** Obligatoria para la posterior auditoría y aprobación por parte del Administrador.
4. **Generación de Slug Único (`slug`):**
   - Se genera a partir del nombre comercial (`slugify(name)`). Si el slug colisiona, se le añade un sufijo secuencial (`empresa-1`, `empresa-2`).
5. **Vinculación de Propietario (`CompanyMember`):**
   - El usuario creador queda vinculado automáticamente como `role: "owner"`.
   - Se actualiza el `last_active_company_id` en el perfil del usuario.

---

## 3. Flujo de Verificación y Activación por el Administrador (`PATCH /api/companies`)

1. **Estado Inicial:** Toda empresa comercial nace en estado `is_verified: false` (Pendiente de Verificación). Sus productos nacen inactivos (`status: "inactive"`).
2. **Aprobación de Primera Vez (`is_verified: true`):**
   - El Admin audita la Ficha RUC, la razón social y la cuenta bancaria.
   - Al aprobar la empresa por primera vez, el sistema busca los productos borradores del vendedor que cumplan con los requisitos mínimos (título, precio > 0, stock > 0 y al menos 1 imagen) y los activa **automáticamente por lote** (`status: "active"`).
3. **Protección de Suspensión Tardía (> 30 Días):**
   - Si una empresa estuvo desaprobada o suspendida por **más de 30 días** y el Admin vuelve a verificarla, el sistema **FORZARÁ** todos sus productos a `status: "inactive"` con `stock: 0`. Esto obliga al vendedor a revisar físicamente su inventario antes de reanudar ventas.

---

## 4. Gestión de Comisiones Preferenciales
- Desde el módulo Admin (`PATCH /api/companies`), el Administrador puede asignar a la empresa una comisión preferencial (`custom_commission_rate`) y una fecha límite opcional (`custom_commission_until`), las cuales priman sobre la comisión global según el skill `iubizon-business-financials`.
