---
name: iubizon-engineering-standards
description: Estándar de Ingeniería Obligatorio para todo cambio en iubizon. Define el flujo de trabajo, principios de código limpio, reutilización, modularidad, consistencia con BD y verificación automática. DEBE consultarse ANTES de implementar cualquier cambio.
---

# ⚙️ Estándar de Ingeniería Obligatorio para iubizon

Este skill define el **protocolo de desarrollo obligatorio** que todo cambio —funcional, visual o arquitectónico— debe cumplir antes de ser entregado al usuario.

> [!CAUTION]
> **OBLIGATORIO:** Todo cambio en el código DEBE seguir este protocolo completo.
> Si alguna fase detecta una inconsistencia o ambigüedad, el agente DEBE detenerse y consultar al usuario antes de continuar.

---

## 📋 Flujo de Trabajo Obligatorio (7 Fases)

### Fase 1 — Investigación
- Leer y comprender los **Skills de Negocio** aplicables (`iubizon-business-rules`).
- Localizar los archivos, componentes, funciones y tipos existentes relacionados con el cambio.
- Revisar el modelo de datos en `schema.prisma` para entender la estructura real de la BD.

### Fase 2 — Análisis de Impacto
- Identificar qué archivos, flujos y endpoints serán afectados.
- Verificar si el cambio requiere modificar alguna **regla de negocio establecida** → si es así, emitir alerta y solicitar aprobación explícita del usuario.
- Evaluar efectos colaterales en otros módulos (Admin, Web, Emails, Payouts).

### Fase 3 — Reutilización Primero
- **Componentes UI:** Buscar componentes existentes en `components/ui/` y `components/features/` antes de crear uno nuevo. Si no existe, crear un componente genérico y reutilizable en `components/ui/`.
- **Funciones y Servicios:** Buscar funciones existentes en `lib/utils/`, `lib/services/` y `lib/` antes de escribir lógica nueva. Si no existe, crear una función pura y genérica en la ubicación correspondiente.
- **Tipos e Interfaces:** Reutilizar los tipos generados por Prisma y los tipos compartidos existentes. No duplicar definiciones de tipos.

### Fase 4 — Implementación
- **Código Limpio:** Menos es más. Funciones cortas, con responsabilidad única.
- **Genérico y Modular:** Si una solución puede servir para más de un caso, abstraerla en un componente o función genérica con props/parámetros configurables.
- **Consistencia con la BD:** Los nombres de campos, tipos de datos y relaciones deben coincidir exactamente con `schema.prisma`. No inventar campos, enums ni estructuras que no existan en la base de datos, a menos que el cambio lo requiera y se haya consultado y aprobado por el usuario.
- **Escalabilidad:** Diseñar pensando en crecimiento. Evitar soluciones rígidas o acopladas a un solo caso de uso.
- **Mantenibilidad:** Preservar comentarios y documentación existentes. Nombrar variables y funciones de forma descriptiva.

### Fase 5 — Integridad de Flujos
- Verificar que el cambio no rompa ningún flujo existente (checkout, envíos, reembolsos, payouts, onboarding).
- Probar mentalmente los caminos críticos: ¿qué pasa si el dato es `null`? ¿y si el array está vacío? ¿y si la empresa no tiene comisión preferencial?
- Confirmar que los estados (`status`) y sus transiciones se mantienen coherentes con los Skills de Negocio.

### Fase 6 — Limpieza
- Eliminar imports no utilizados.
- Remover código muerto, `console.log` temporales y comentarios obsoletos.
- Asegurar que no queden variables sin usar ni tipos `any` innecesarios.

### Fase 7 — Verificación Automatizada
Al finalizar todo cambio, ejecutar obligatoriamente:

```bash
# TypeScript — 0 errores
npx tsc --noEmit   # en apps/web
npx tsc --noEmit   # en apps/admin

# Linter — 0 errores, 0 advertencias
npm run lint        # en la raíz del monorepo
```

> [!WARNING]
> **No se considera un cambio entregado hasta que las 3 verificaciones pasen con 0 errores y 0 advertencias.**

---

## 🧱 Principios de Arquitectura

| Principio | Descripción |
| :--- | :--- |
| **DRY** | No repetir lógica. Extraer a funciones o componentes compartidos. |
| **Single Responsibility** | Cada función/componente hace una sola cosa bien. |
| **Props sobre Hardcode** | Los componentes reciben configuración por props, no valores fijos internos. |
| **Composición sobre Herencia** | Preferir composición de componentes pequeños sobre componentes monolíticos. |
| **Consistencia de Naming** | Seguir las convenciones existentes del proyecto (camelCase en TS, snake_case en BD). |
| **Fail-Safe** | Manejar `null`, `undefined` y arrays vacíos con defaults seguros. Nunca asumir que un dato existe. |

---

## 🚫 Prohibiciones Explícitas

1. **No inventar columnas o tablas** que no existan en `schema.prisma` sin aprobación del usuario.
2. **No duplicar tipos** que ya genera Prisma o que ya existen en `lib/utils/`.
3. **No hardcodear valores** que puedan cambiar (comisiones, días de protección, direcciones). Usar `platform_settings` o constantes compartidas.
4. **No ignorar errores de TypeScript o Lint.** Corregirlos antes de entregar.
5. **No modificar reglas de negocio** sin activar la Regla de Guardia del skill `iubizon-business-rules`.
