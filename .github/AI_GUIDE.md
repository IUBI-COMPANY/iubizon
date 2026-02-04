# 🤖 Guía Completa de IA para Desarrollo

> **Guía maestra consolidada para uso eficiente de herramientas de IA**

---

## 📋 Tabla de Contenidos

1. [Mejores Prácticas](#mejores-prácticas)
2. [Plantillas de Preguntas](#plantillas-de-preguntas)
3. [Plan de Aprendizaje](#plan-de-aprendizaje)
4. [Comparativa de Modelos](#comparativa-de-modelos)

---

## 🎯 Mejores Prácticas

### Decision Tree: ¿Usar IA?

```
¿Tengo un problema?
│
├─ ¿Leí el error completo? → NO → Lee primero
├─ ¿Busqué en Google 2 min? → NO → Busca primero  
├─ ¿Revisé docs oficiales? → NO → Lee docs
│
└─ SI a todo → ¿Es crítico?
   │
   ├─ SI → Usa IA (GPT-4 si es complejo)
   └─ NO → ¿Puedo combinar con otras preguntas?
      │
      ├─ SI → Agrupa y pregunta después
      └─ NO → Usa IA (GPT-3.5 si es simple)
```

### Reglas de Oro

1. **Resource-First**: Buscar código existente antes de crear
2. **Combinar preguntas**: 3 preguntas → 1 consulta
3. **Ser específico**: Stack + Código + Error + Pregunta concreta
4. **Modelo correcto**: Simple → GPT-3.5, Complejo → GPT-4
5. **Max 7 líneas**: De explicación (menos es mejor)

### Template Ultra-Rápido

```markdown
Stack: [Next.js 14 + TypeScript]
Archivo: [ruta/archivo.tsx:línea]
Error: [mensaje completo]

Código relevante:
[solo 10-20 líneas]

Intenté:
- [solución 1]
- [solución 2]

¿Cómo [pregunta específica]?
```

---

## 📝 Plantillas de Preguntas

### 🐛 Debugging

```markdown
**Stack**: Next.js 14 + TypeScript + Tailwind
**Archivo**: src/components/productCard.tsx:67
**Error**: 
[mensaje de error completo con stack trace]

**Código relevante**:
[líneas 60-75]

**Comportamiento esperado**: [qué debería pasar]
**Comportamiento actual**: [qué pasa]

**Ya intenté**:
1. Optional chaining
2. Verificar con console.log

**Pregunta**: ¿Cómo manejar productos sin precio en el render?
```

### ⚡ Performance

```markdown
**Problema**: Re-renders excesivos
**Componente**: ProductList
**Métricas**: 
- Renders por update: 15x
- Tiempo: 450ms

**Código**:
[componente problemático]

**Pregunta**: ¿Qué optimizar?
```

### 🏗️ Nueva Feature

```markdown
**Feature**: Filtro de productos por categoría

**Stack**: Next.js 14 App Router, Zustand, Prisma
**Requerimientos**:
1. Filtro por múltiples categorías
2. Persistir en URL (searchParams)
3. Optimistic UI updates

**Donde estoy trabado**: 
[problema específico]

**Código actual**:
[lo que ya tienes]

**Pregunta**: ¿Cómo implementar [parte específica]?
```

### 🎨 UI/Styling

```markdown
**Componente**: Modal de confirmación
**Diseño**: Centrado, backdrop blur, animación fade-in
**Responsive**: Mobile + Desktop

**Código actual**:
[JSX actual]

**Pregunta**: ¿Cómo implementar con Tailwind + Framer Motion?
```

### 🔐 Auth/Validación

```markdown
**Endpoint**: POST /api/auth/login
**Validar**:
- email: formato válido, required
- password: min 8 chars, required

**Librería**: Zod
**Pregunta**: ¿Schema de validación completo?
```

### 🧪 Testing

```markdown
**Qué testear**: Custom hook useDebounce
**Casos**:
1. Valor debounced después de delay
2. Limpieza de timer en unmount
3. Actualización en cambio de delay

**Framework**: Jest + React Testing Library
**Pregunta**: ¿Tests completos?
```

---

## 🎓 Plan de Aprendizaje

### Autoevaluación

**Principiante (<6 meses)**:
- Usa IA libremente para aprender
- Documenta todo lo aprendido
- Meta: Reconocer patrones comunes

**Intermedio (6-18 meses)**:
- Docs primero, IA después
- Resuelve 50%+ sin IA
- Meta: Independencia en tareas comunes

**Avanzado (18+ meses)**:
- IA solo para casos complejos
- Ayuda a otros sin IA
- Meta: 70%+ autonomía

### Skills Esenciales

#### Frontend (Next.js + React + TypeScript)

**Nivel 1: Básico**
- [ ] JSX sintaxis
- [ ] Props y estado simple
- [ ] Event handlers
- [ ] TypeScript básico

**Nivel 2: Intermedio**
- [ ] React Hooks (useState, useEffect, useContext)
- [ ] TypeScript interfaces y types
- [ ] Next.js routing y data fetching
- [ ] Tailwind CSS responsive

**Nivel 3: Avanzado**
- [ ] Performance (useMemo, useCallback, React.memo)
- [ ] TypeScript utility types y generics
- [ ] Next.js Server Components, Server Actions
- [ ] State management patterns

### Plan Mensual

**Mes 1: Fundamentos**
- Objetivo: Reducir 30% uso de IA
- [ ] TypeScript handbook (2h/semana)
- [ ] React docs - Hooks section
- [ ] Next.js tutorial completo
- [ ] 3 componentes sin IA

**Mes 2: Intermedio**
- Objetivo: 50%+ problemas sin IA
- [ ] Patterns avanzados React
- [ ] Performance optimization
- [ ] Refactor proyecto existente

**Mes 3: Avanzado**
- Objetivo: 70%+ autonomía
- [ ] Architecture patterns
- [ ] Testing strategies
- [ ] Proyecto completo sin IA

### Recursos

**Documentación (SIEMPRE PRIMERO)**:
- React: https://react.dev
- Next.js: https://nextjs.org/docs
- TypeScript: https://typescriptlang.org/docs
- Tailwind: https://tailwindcss.com/docs

**Práctica**:
- Frontend Mentor: https://frontendmentor.io
- TypeScript Exercises: https://typescript-exercises.github.io

---

## 🔄 Comparativa de Modelos

### GitHub Copilot

**Límite**: ~50 requests premium/mes  
**Ventaja**: Autocompletado integrado (ilimitado)

**Usar para**:
- ✅ Autocompletado inline (Tab)
- ✅ Fixes rápidos
- ✅ Refactors simples

**Estrategia**:
1. Autocompletado primero
2. Chat solo si falla
3. Una pregunta específica por request

---

### Claude Sonnet

**Límite**: Tokens + mensajes por sesión  
**Ventaja**: Conversaciones largas, razonamiento complejo

**Usar para**:
- ✅ Arquitectura de features
- ✅ Debugging complejo
- ✅ Múltiples iteraciones
- ✅ Explicaciones profundas

**Estrategia**:
1. Todo el contexto al inicio
2. Una conversación = un problema
3. Aprovecha memoria conversacional

---

### ChatGPT

**Límite**: ~40 mensajes/3 horas  
**Ventaja**: Rápido, accesible

**Usar para**:
- ✅ Preguntas conceptuales
- ✅ Brainstorming
- ✅ Consultas generales

**Estrategia**:
1. Preguntas directas
2. Divide problemas complejos
3. Verifica con docs oficiales

---

### Estrategia Híbrida (Recomendada)

```
Snippet simple
  ↓
Copilot Autocompletado (Tab)
───────────────────────

Fix rápido / 1 archivo
  ↓
Copilot Chat
───────────────────────

Arquitectura / Problema complejo
  ↓
Claude Sonnet
───────────────────────

Consulta conceptual
  ↓
ChatGPT o Docs
```

---

## 💰 Optimización de Recursos

### Jerarquía (más barato → más caro)

1. 🟢 **Gratis ilimitado**:
   - Documentación oficial
   - Stack Overflow
   - Google

2. 🟢 **Incluido**:
   - Copilot autocompletado

3. 🟡 **Limitado**:
   - Copilot Chat (~50/mes)
   - ChatGPT (~40/3h)
   - Claude mensajes

4. 🟠 **Pay-per-use**:
   - APIs directas

### Ahorro Estimado

**Aplicando esta guía**:
- 70% de preguntas → GPT-3.5 (10x más barato)
- 60% reducción en tokens (respuestas concisas)
- 0 archivos innecesarios creados
- Combinar preguntas = menos requests

**Resultado**: Tu presupuesto dura **2.5-3x más**

---

## 📊 Tracking Semanal

```markdown
Semana: [Fecha]

IA usada:       ____× (reducir)
Sin IA:         ____× (aumentar)
Evitables:      ____× (buscar primero)

Aprendí: ________________

Próxima semana:
- [ ] Reducir X% uso de IA
- [ ] Aprender [skill]
```

---

## 💊 Primeros Auxilios

### "Cannot read property 'X' of undefined"
```typescript
// ❌ objeto.propiedad
// ✅ objeto?.propiedad
```

### useState no se actualiza
```typescript
// Recuerda: setState es asíncrono
// Usa useEffect para reaccionar a cambios
useEffect(() => {
  console.log(state); // ✅ Valor nuevo
}, [state]);
```

### useEffect loop infinito
```typescript
// ❌ Mal - modifica dependencia
useEffect(() => {
  setData([...data, newItem]);
}, [data]);

// ✅ Bien - función updater
useEffect(() => {
  setData(prev => [...prev, newItem]);
}, [newItem]);
```

---

## ✅ Checklist Pre-Consulta

Antes de usar cualquier IA:

- [ ] ¿Leí el error completo?
- [ ] ¿Busqué en Google/Stack Overflow (2 min)?
- [ ] ¿Revisé documentación oficial?
- [ ] ¿Tengo contexto completo? (stack, código, error)
- [ ] ¿Pregunta específica y accionable?
- [ ] ¿Puedo combinarla con otra pregunta?
- [ ] ¿Es realmente necesario?

---

**Recuerda**: IA = Herramienta, no muleta. El objetivo es aprender y crecer. 🚀

