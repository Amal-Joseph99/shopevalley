# 🎯 SHOPEVALLEY Agent Rules & Guidelines

**MANDATORY: Read this file before every task execution**

---

## Core Principles

### 1. **NEVER HARDCODE ANYTHING**
- All values must be configurable, data-driven, or derived from state/props
- Use constants files for global values
- Make features extensible and reusable

### 2. **NO ASSUMPTIONS - ALWAYS AUDIT**
- Deep code analysis before making changes
- Test all implementations thoroughly
- Verify edge cases and error scenarios
- Multiple implementation options → choose best

### 3. **UNDERSTAND THE APPLICATION**
- **Structure**: Component hierarchy, folder organization, patterns used
- **Integrations**: How components communicate, state flow, data persistence
- **How it works**: User flows, navigation patterns, data transformations
- **Pages & Navigation**: Route structure, link flow, backward compatibility
- **UI/UX**: Padding consistency, design system, spacing rules
- **Mobile Responsiveness**: Breakpoints (sm:, lg:), touch interactions, viewport handling

### 4. **STRUCTURED TASK EXECUTION**
1. **UNDERSTAND** - Read task carefully, ask clarifying questions if needed
2. **ANALYZE** - Study current implementation, identify options, risks
3. **PLAN** - Create detailed TODO list with step-by-step approach
4. **IMPLEMENT** - Build with production-quality code
5. **TEST** - Verify without assumptions, check edge cases
6. **COMMIT** - Push with clear, descriptive messages

### 5. **CODE QUALITY STANDARDS**
- **Understand actual code behavior** - Don't guess, trace execution
- **Trace root causes** - Go deep, find real issues, not symptoms
- **Identify hidden edge cases** - Think about boundary conditions
- **Production-ready fixes** - Think deeply before changes, test thoroughly
- **Maximum speed, lower memory** - Optimize rendering, cleaner execution
- **Performance first** - Faster rendering, minimal re-renders, efficient state

### 6. **DECISION-MAKING FRAMEWORK**
Before implementing:
- **Ask & Clarify** - Confirm requirements, edge cases
- **Identify risks** - Scaling concerns, performance, maintenance
- **Prioritize simplicity** - Keep it simple without sacrificing security/functionality
- **Suggest better approaches** - Propose optimizations if applicable

### 7. **COMMUNICATION STYLE**
- **Always provide short paragraph explanations** (not long stories)
- **List 3-5 key points** for important notes
- **Be concise and direct**
- **Avoid unnecessary verbosity**

---

## Pre-Task Checklist

- [ ] Read AGENTRULES.md completely
- [ ] Understand the current app structure
- [ ] Identify all affected components
- [ ] Check for existing patterns to follow
- [ ] Plan before coding
- [ ] Build and test locally
- [ ] Verify mobile responsiveness
- [ ] Check console for errors
- [ ] Create comprehensive commit message

---

## Key Metrics

| Aspect | Standard |
|--------|----------|
| Build Success | ✓ Zero errors |
| Test Coverage | All features tested |
| Mobile Support | sm:, lg: breakpoints responsive |
| Code Duplication | Minimal, reuse existing patterns |
| Performance | Fast rendering, optimized state |
| Documentation | Clear comments, meaningful names |

---

## Project Technical Stack

- **React 19** with TypeScript
- **Vite** build tool (port 3000)
- **Tailwind CSS** styling
- **lucide-react** icons
- **Custom Hash Router** (no external routing library)
- **localStorage** for persistence
- **Dev Container** on Ubuntu 24.04

---

## Common Patterns to Follow

### Component Structure
```
Component.tsx
├── Props interface
├── State declarations
├── Effect hooks
├── Event handlers
├── Conditional renders
└── JSX return
```

### Styling Pattern
- Use Tailwind utility classes
- Responsive: `sm:` mobile, `lg:` desktop
- Consistent spacing: `gap-4`, `p-6`, `mb-4`
- Color scheme: slate-900 (dark), amber-500 (accent)

### Navigation Pattern
```typescript
onNavigate('profile')           // Page navigation
onNavigate('cart')              // Checkout flow
onNavigate(`order-status/${id}`) // Dynamic routes
```

### State Management
- Use `useState` for local component state
- Use `localStorage` for persistence
- Pass via props or context as needed

---

## Last Updated
2026-06-03

**Remember: Quality over speed. Think before acting. Test everything.**
