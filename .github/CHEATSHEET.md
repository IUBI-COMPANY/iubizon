# 🚀 Cheat Sheet Ultra-Rápida - IA para Desarrollo

> **Imprime esto o guárdalo visible en tu escritorio**

---

## 🎯 ¿QUÉ HACER ANTES DE PREGUNTAR?

```
┌─────────────────────────────────────┐
│  1. ¿Leí el error completo?    ❌/✅│
│  2. ¿Busqué en Google 2 min?   ❌/✅│
│  3. ¿Revisé la documentación?  ❌/✅│
│  4. ¿Tengo el contexto listo?  ❌/✅│
└─────────────────────────────────────┘
         ↓ Si todo ✅ → Continúa
```

---

## 🚦 ¿DEBO USAR IA?

### 🟢 SÍ - Usa IA inmediatamente
- ❗ Error que bloquea desarrollo
- 🔥 Bug en producción
- 🏗️ Feature compleja (arquitectura)
- ⚡ Performance crítico

### 🟡 PIENSA - ¿Realmente necesitas?
- 🔄 Refactoring
- 🎨 UI/Styling
- 📝 Tests
- 🤔 Consultas de arquitectura

### 🔴 NO - Busca primero
- 📚 Sintaxis básica (if/loops)
- 📖 Documentación estándar
- 🔍 Error con solución obvia en Google
- ❓ "¿Cómo funciona X?" (conceptual)

---

## 🛠️ ¿QUÉ HERRAMIENTA USAR?

```
Autocompletado simple
  ↓
GitHub Copilot (Tab)
───────────────────────

Fix rápido / 1 archivo
  ↓
Copilot Chat
───────────────────────

Problema complejo / Arquitectura
  ↓
Claude Sonnet
───────────────────────

Pregunta conceptual
  ↓
ChatGPT / Docs
```

---

## 📝 TEMPLATE ULTRA-RÁPIDO

Copia y rellena:

```
Stack: [Next.js 14 / React / etc]
Archivo: [ruta:línea]
Error: [mensaje completo]

Código:
[solo 10-20 líneas relevantes]

Intenté:
- [solución 1]
- [solución 2]

¿Cómo [pregunta específica]?
```

---

## ⌨️ ATAJOS COPILOT

| Acción | Mac | Descripción |
|--------|-----|-------------|
| Aceptar | `Tab` | Acepta sugerencia |
| Siguiente | `Alt + ]` | Siguiente opción |
| Anterior | `Alt + [` | Opción anterior |
| Rechazar | `Esc` | Ignora sugerencia |
| Chat | `Cmd + I` | Abre inline chat |

---

## 💊 PRIMEROS AUXILIOS

### Error: "Cannot read property 'X' of undefined"
```typescript
// ❌ Mal
objeto.propiedad

// ✅ Bien
objeto?.propiedad
```

### useState no se actualiza
```typescript
// Recuerda: setState es ASÍNCRONO
setState(newValue)
console.log(state) // ❌ Aún tiene valor viejo

// ✅ Usa useEffect para reaccionar
useEffect(() => {
  console.log(state) // ✅ Valor nuevo
}, [state])
```

### useEffect loop infinito
```typescript
// ❌ Mal - modifica dependencia
useEffect(() => {
  setData([...data, newItem]) // ❌
}, [data])

// ✅ Bien - usa función updater
useEffect(() => {
  setData(prev => [...prev, newItem]) // ✅
}, [newItem])
```

---

## 📊 TRACKING SEMANAL

```
Semana: ____

IA usada:  ____× (objetivo: reducir)
Sin IA:    ____× (objetivo: aumentar)
Evitables: ____× (pudiste buscar)

Aprendí: ________________
```

---

## 🎓 REDUCE DEPENDENCIA

### Top 3 Skills que Más Ayudan:
1. **Leer errores completos** (50% menos preguntas)
2. **TypeScript types** (30% menos)
3. **React DevTools** (25% menos)

### Recursos de 5 minutos:
- Error TypeScript → https://typescript.tv
- React Hook → https://react.dev/reference/react
- Next.js → https://nextjs.org/docs

---

## 💡 REGLAS DE ORO

```
1. Google primero, IA después
2. Docs oficiales > Tutorial > IA
3. Lee el error COMPLETO
4. Combina 3 preguntas en 1
5. Sé específico (stack + error + código)
6. Autocompletado no gasta requests
```

---

## 🔗 LINKS FAVORITOS

**Documentación:**
- React: https://react.dev
- Next.js: https://nextjs.org/docs
- TypeScript: https://typescriptlang.org/docs
- Tailwind: https://tailwindcss.com/docs

**Ayuda:**
- Stack Overflow: https://stackoverflow.com
- GitHub Issues: buscar problemas conocidos

**Uso de IA:**
- Copilot Dashboard: https://github.com/settings/copilot

---

## 🎯 META PERSONAL

```
Nivel actual: [Principiante/Intermedio/Avanzado]

Esta semana voy a:
- [ ] Reducir X% uso de IA
- [ ] Aprender [skill específica]
- [ ] Resolver [tipo problema] solo

Próximo mes:
- [ ] [Objetivo 1]
- [ ] [Objetivo 2]
```

---

## 🆘 EMERGENCIA

**Sin requests/tokens?**
1. Pregunta al equipo (Slack/Discord)
2. Stack Overflow
3. Lee código similar en el proyecto
4. GitHub Issues de la librería

---

## 📞 ARCHIVOS COMPLETOS

Para guías detalladas, revisa:
- 📘 `AI_INSTRUCTIONS.md` - Guía completa
- 📝 `AI_TEMPLATES.md` - Todas las plantillas
- 🔄 `LLM_COMPARISON.md` - Comparativa modelos
- 📕 `README.md` - Índice completo

---

**Recuerda:** IA = Herramienta, no muleta
**Objetivo:** Aprender y crecer como dev 🚀

*v1.0 - Febrero 2026*

