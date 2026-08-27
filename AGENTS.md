# 🛡️ Guía Global de Agentes e Inmutabilidad de Reglas de Negocio en iubizon

Este archivo define las directrices obligatorias para **CUALQUIER MODELO DE IA** (Gemini, Claude, GPT, etc.) que trabaje en la plataforma **iubizon**.

---

## 📌 Protocolo de Consulta Obligatoria de Skills

Antes de realizar cualquier investigación, refactorización, creación o modificación de código en este repositorio, la IA **DEBE** consultar obligatoriamente los skills ubicados en la carpeta `.agents/skills/`:

1. **Protocolo Maestro:**
   - [`iubizon-business-rules`](.agents/skills/iubizon-business-rules/SKILL.md): Protocolo de Guardia Inalterable y listado maestro de dominios.
   - [`iubizon-engineering-standards`](.agents/skills/iubizon-engineering-standards/SKILL.md): Estándar de desarrollo de 8 fases, auto-auditoría exhaustiva, código limpio, reutilización y verificación.

2. **Skills de Dominio de Negocio:**
   - [`iubizon-business-logistics`](.agents/skills/iubizon-business-logistics/SKILL.md): Logística de Envíos (2 o 3 Pasos, Almacén Chorrillos).
   - [`iubizon-business-refunds`](.agents/skills/iubizon-business-refunds/SKILL.md): Devoluciones, Reembolsos y Seguro de 7 días.
   - [`iubizon-business-financials`](.agents/skills/iubizon-business-financials/SKILL.md): Comisiones, Umbral S/ 40.00, Payouts e Inmutabilidad.
   - [`iubizon-business-company-onboarding`](.agents/skills/iubizon-business-company-onboarding/SKILL.md): Registro, Unicidad de RUC y Aprobación de Empresa.
   - [`iubizon-business-catalog`](.agents/skills/iubizon-business-catalog/SKILL.md): Productos, Inventario y Activación Mínima.
   - [`iubizon-business-auth-rbac`](.agents/skills/iubizon-business-auth-rbac/SKILL.md): Roles, Permisos y Aislamiento Multi-tenant.
   - [`iubizon-business-checkout-niubiz`](.agents/skills/iubizon-business-checkout-niubiz/SKILL.md): Checkout, Niubiz y Paquetes Multi-tienda.
   - [`iubizon-business-sunat-invoicing`](.agents/skills/iubizon-business-sunat-invoicing/SKILL.md): Facturación Fiscal SUNAT (Boletas y Facturas).

---

## 🚨 Regla de Guardia Inalterable

Si una solicitud requiere alterar o romper alguna regla de negocio plasmada en los skills anteriores, la IA **NO DEBE APLICAR EL CAMBIO AUTOMÁTICAMENTE**. En su lugar, emitirá una alerta explícita informando el impacto en la lógica de negocio y solicitará confirmación previa al usuario.
