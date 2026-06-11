# shopevalley
Ecommerce web app 
# Copilot Instructions

## Token Consumption
- Always generate **minimal completions** — prefer concise, single-function or single-line outputs.  
- Avoid unnecessary comments, verbose explanations, or long code blocks.  
- Use **incremental edits** instead of rewriting entire files.  
- Summarize explanations in **≤3 bullet points**.  
- Never expand boilerplate unless explicitly requested.  
- Default to **shortest working solution** that meets requirements.  

## Language & Framework
- Use **TypeScript** with strict typing.  
- For **React**, prefer functional components with hooks.  
- Use **TailwindCSS** for styling; follow responsive breakpoints (`sm:`, `lg:`).  

## Code Style
- Follow **Airbnb JavaScript/TypeScript style guide**.  
- Use camelCase for variables, PascalCase for components.  
- Include JSDoc comments only when requested.  
- Ensure ESLint + Prettier compliance.  

## Testing
- Generate **minimal Jest + React Testing Library tests**.  
- Cover only critical edge cases unless asked for full coverage.  
- Avoid verbose test descriptions.  

## Security
- Never hardcode secrets or API keys.  
- Use environment variables for configuration.  
- Sanitize all user inputs.  
- Do not store sensitive data in localStorage.  

## Performance
- Optimize rendering to minimize re-renders.  
- Use memoization (`React.memo`, `useCallback`, `useMemo`) where appropriate.  
- Keep state management efficient and scoped.  

## Communication Style
- Provide concise explanations in short paragraphs.  
- Use 3–5 bullet points for key notes.  
- Avoid unnecessary verbosity.  

## Commit Messages
- Follow **Conventional Commits** format:
  - `feat:` for new features  
  - `fix:` for bug fixes  
  - `chore:` for maintenance  
  - `docs:` for documentation updates  
