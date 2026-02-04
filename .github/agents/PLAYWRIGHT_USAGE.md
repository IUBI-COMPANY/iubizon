# 🎭 Guía Rápida: Usar el Agente de Playwright

## 🚀 Cómo Activar

En el chat de GitHub Copilot, menciona el agente:

```
@playwright [tu pregunta]
```

---

## 📝 Ejemplos de Uso

### 1. Crear Test Nuevo

```
@playwright crea test E2E para el login flow
```

**Respuesta esperada:**
- Código del test completo
- Selectores semánticos (getByRole)
- Assertions claras
- Max 5 líneas de explicación

---

### 2. Debug Test Flaky

```
@playwright este test falla aleatoriamente:

[pega tu código del test]

¿Cómo lo hago más estable?
```

**Respuesta esperada:**
- Identificación del problema
- Código corregido
- Uso de auto-retry en lugar de waits

---

### 3. Refactor a Page Object

```
@playwright convierte este test a Page Object Model:

[pega tu código]
```

**Respuesta esperada:**
- Clase Page Object
- Test refactorizado
- Más mantenible

---

### 4. Mejorar Selectores

```
@playwright estos selectores son frágiles, mejóralos:

await page.locator('.btn-submit-123').click()
await page.locator('#user-name').fill('test')
```

**Respuesta esperada:**
- Selectores semánticos con getByRole
- Más estables y accesibles

---

### 5. Crear Fixture Reutilizable

```
@playwright crea fixture para usuario autenticado
```

**Respuesta esperada:**
- Fixture configuration
- Cómo usarlo en tests

---

### 6. Test para Feature Específica

```
@playwright test E2E para:
- Agregar producto al carrito
- Ver carrito
- Ir a checkout
- Completar compra
```

**Respuesta esperada:**
- Test completo del flow
- Assertions en cada paso
- Selectores optimizados

---

## 💡 Tips para Mejores Resultados

### ✅ Sé Específico

```
❌ Mal: "@playwright crea test"
✅ Bien: "@playwright crea test para formulario de contacto con validación"
```

### ✅ Proporciona Contexto

```
@playwright test para modal de confirmación

Context: El modal aparece al hacer click en "Delete"
Debe tener botones "Cancel" y "Confirm"
Al confirmar debe cerrar modal y mostrar toast
```

### ✅ Comparte Código Problemático

```
@playwright este test falla:

[pega código completo del test]

Error: TimeoutError waiting for selector
```

---

## 🎯 Qué Esperar del Agente

### ✅ SÍ Obtendrás:
- Código production-ready
- Selectores semánticos (getByRole preferido)
- Best practices de Playwright
- Tests mantenibles y estables
- Respuestas concisas (max 5 líneas explicación)

### ❌ NO Obtendrás:
- Tutoriales básicos de Playwright
- Explicaciones de conceptos generales
- Múltiples alternativas (solo la mejor solución)
- Código sin optimizar

---

## 📋 Estructura de Respuesta Típica

```typescript
// tests/e2e/featureName.spec.ts
test('should do specific action', async ({ page }) => {
  // Código del test optimizado
  await page.goto('/route');
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page).toHaveURL(/\/success/);
});
```

Usa getByRole para accesibilidad, auto-retry assertions.

---

## 🔧 Comandos Útiles de Playwright

El agente puede ayudarte con:

```bash
# Debug mode
npx playwright test --debug

# UI mode
npx playwright test --ui

# Specific test
npx playwright test featureName.spec.ts

# Headed mode
npx playwright test --headed

# Generate test
npx playwright codegen http://localhost:3000
```

---

## 🚦 Workflow Recomendado

```
1. Define el feature a testear
   ↓
2. Pregunta al agente: "@playwright test para [feature]"
   ↓
3. Recibe código optimizado
   ↓
4. Copia y adapta a tu proyecto
   ↓
5. Si hay issues: "@playwright debug este test [código]"
```

---

## 💊 Solución Rápida de Problemas

### Test falla intermitentemente
```
@playwright este test es flaky [código]
```

### Selector no encuentra elemento
```
@playwright selector no funciona [código]
```

### Test muy lento
```
@playwright optimiza performance [código]
```

### Necesito esperar algo específico
```
@playwright cómo esperar que [condición]
```

---

## 📚 Patrones Comunes

### Login Flow
```
@playwright test para login con email y password
```

### Form Validation
```
@playwright test validación de formulario con campos requeridos
```

### Navigation
```
@playwright test navegación entre páginas
```

### Modal Interactions
```
@playwright test abrir modal, llenar form, y cerrar
```

### API Mocking
```
@playwright mockear API response para [endpoint]
```

---

## ✅ Checklist Antes de Preguntar

- [ ] ¿Definí claramente qué quiero testear?
- [ ] ¿Incluí contexto relevante (rutas, elementos)?
- [ ] ¿Si es debug, pegué el código completo?
- [ ] ¿Si es error, incluí el mensaje de error?

---

## 🎯 Objetivo del Agente

**Ayudarte a escribir tests E2E de calidad, rápidos y mantenibles, sin perder tiempo en configuraciones o explicaciones innecesarias.**

---

**¿Listo?** Empieza con: `@playwright [tu primera pregunta]` 🚀

