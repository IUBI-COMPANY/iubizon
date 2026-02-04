# Copilot Instructions

## Model Selection Strategy
**Use the cheapest model that can solve the task**

### GPT-3.5 (Fast, Cheap) - Prefer for:
- Simple fixes (typos, syntax)
- Basic CRUD operations
- Standard React patterns
- Common TypeScript types
- File/folder creation
- Simple refactors

### GPT-4 (Smart, Expensive) - Only for:
- Complex architecture decisions
- Performance optimization
- Advanced TypeScript generics
- Custom hook design
- Critical bug fixes
- Security issues

### Trigger Words for GPT-4:
- "optimize", "architecture", "design pattern"
- "performance", "memory leak", "complex"
- "security", "vulnerability", "critical bug"

### Trigger Words for GPT-3.5:
- "create", "add", "simple", "basic"
- "rename", "move", "delete"
- "format", "fix typo", "import"

## Response Style: ULTRA-CONCISE
- **Max 7 lines** explanation (only if needed, less is better)
- Code first, explanation only if critical
- No greetings, no pleasantries, no "Sure!", no "Here's how"
- One solution only (the best one)
- Skip obvious explanations
- **Don't repeat the user's question** back to them
- **Don't ask clarifying questions** unless absolutely critical - make reasonable assumptions
- **NEVER create README.md files** after completing tasks
- Show summaries in chat only, not in files
- If solution is obvious from code, skip explanation entirely

## Project Rules
- **Check existing code first** before creating anything new
- **camelCase** for all files/variables (camelCaseFile.ts, camelCaseComponent.tsx)
- **Components** are PascalCase but files are camelCase (PascalComponent in camelCaseComponent.tsx)
- **Optimize always** (React.memo, useMemo, useCallback, lazy loading)
- **TypeScript strict** (no `any`, explicit return types)
- **Yarn only** (never suggest npm commands)
- **Named exports** over default exports
- **Functional components** only (no class components)

## File Organization
- Place files in logical locations following existing structure
- Check `src/components/`, `src/hooks/`, `src/utils/` before creating
- Reuse existing utilities, hooks, and components
- DRY principle is mandatory

## Response Format
```typescript
// src/location/camelCaseFile.ts
code solution
```
Brief explanation (if needed). Done.

## Token Efficiency Rules
- **Combine related changes** in one response instead of multiple
- **Reference existing files** by path instead of repeating code
- **Use "..." comments** to indicate unchanged code sections
- **Avoid explaining standard patterns** (useState, useEffect basics)
- **Skip import statements** if obvious from context
- **One code block per file** - don't show the same file multiple times

## Checklist Before Responding
- [ ] Searched existing resources?
- [ ] File in correct location?
- [ ] camelCase naming?
- [ ] Code optimized (memo/lazy/callbacks)?
- [ ] TypeScript strict types?
- [ ] Can be reused elsewhere?

## What to Skip Entirely
- Long explanations
- Multiple solution options
- Theory or background
- Phrases like "Here's how", "You can", "Let me explain"
- Restating the question

## Code Optimization Patterns
- Use `React.memo()` for expensive components
- Use `useMemo()` for expensive computations
- Use `useCallback()` for functions passed as props
- Use `React.lazy()` for route components
- Import only what's needed (tree-shaking)
- Avoid inline functions in JSX render

## TypeScript Patterns
- Interfaces over types for objects
- Explicit return types for all functions
- Use generics for reusable logic
- No `any` - use `unknown` or proper types
- Use utility types: `Pick`, `Omit`, `Partial`, `Record`

## React Patterns
- Functional components + hooks
- Custom hooks for reusable logic
- Composition over prop drilling
- Context for global state (when needed)
- Error boundaries for error handling
- Suspense for lazy loading

## Priority Order
1. Critical bugs (production breaking)
2. Performance issues (slow, memory leaks)
3. Refactor to reuse (eliminate duplication)
4. New features (only if no existing solution)

## Anti-Patterns (Never Suggest)
- Duplicate utilities/hooks/components
- `any` type
- Default exports
- Inline styles
- Class components
- Prop drilling (more than 2 levels)
- Unnecessary re-renders
- Large bundle imports
- **Creating README.md files automatically** (summaries in chat only)

## Example Good Response
```typescript
// src/hooks/useDebounce.ts
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};
```
Optimized, typed, reusable.

## Example Bad Response
"Sure! I'd be happy to help you create a debounce hook. Debouncing is a technique that delays the execution of a function until after a certain amount of time has passed since it was last called. This is particularly useful for..."

## Stack Details
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Package Manager**: Yarn only (never npm)
- **Styling**: Tailwind CSS
- **State**: React hooks, Context (check existing before adding libraries)
- **Programming Style**: Functional, ES6+, immutable patterns

## Project Structure
```
src/
  ├── app/           # Next.js app router pages
  ├── components/    # Reusable components (check here first)
  ├── hooks/         # Custom hooks (check here first)
  ├── utils/         # Utility functions (check here first)
  ├── types/         # TypeScript types and interfaces
  └── config/        # Configuration files
```

## Common Existing Resources (Check Before Creating)
Look for existing code in these locations before suggesting new files:
- Custom hooks: `src/hooks/`
- Utility functions: `src/utils/`
- Type definitions: `src/types/`
- Shared components: `src/components/`

