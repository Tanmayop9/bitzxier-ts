# TypeScript Conversion Guide

## Overview
The Friday Discord Bot codebase has been converted from JavaScript ES6 modules to TypeScript while maintaining ES module format.

## What Changed

### 1. File Extensions
- All `.js` files have been renamed to `.ts`
- Total files converted: **207 TypeScript files**

### 2. TypeScript Configuration
- Added `tsconfig.json` with strict type checking enabled
- Target: ES2022
- Module: ESNext (ES modules)
- Output directory: `./dist`

### 3. Package Configuration
**New Dependencies:**
```json
"devDependencies": {
  "typescript": "^5.3.3",
  "@types/node": "^20.10.6",
  "@types/ms": "^0.7.34",
  "ts-node": "^10.9.2"
}
```

**Updated Scripts:**
```json
{
  "build": "tsc",
  "start": "node dist/shards.js",
  "dev": "NODE_ENV=development ts-node index.ts",
  "watch": "tsc --watch",
  "typecheck": "tsc --noEmit"
}
```

### 4. Type Definitions
- Created `types/index.ts` with core type definitions
- TypeScript will generate `.d.ts` files during compilation

## Import Syntax

TypeScript with ES modules requires `.js` extensions in imports (even for `.ts` files):

```typescript
// Correct
import Friday from './structures/friday.js';
import Utils from './structures/util.js';

// TypeScript will resolve these to the .ts files during development
// and emit proper .js files during build
```

## Building the Project

### Development Mode
```bash
npm run dev
# Runs ts-node for direct TypeScript execution
```

### Production Build
```bash
npm run build
# Compiles TypeScript to JavaScript in ./dist folder

npm start
# Runs the compiled JavaScript from ./dist
```

### Type Checking
```bash
npm run typecheck
# Checks types without emitting files
```

### Watch Mode
```bash
npm run watch
# Continuously compiles on file changes
```

## Type Safety

### Current State
The codebase uses TypeScript with the following approach:
- Strict mode enabled
- Gradual migration strategy (some `any` types used initially)
- All files are `.ts` but may need additional type annotations

### Adding Type Annotations

To gradually improve type safety:

1. **Function Parameters**
```typescript
// Before
function handleCommand(client, message, args) {
  // ...
}

// After
import { Message } from 'discord.js';
function handleCommand(client: any, message: Message, args: string[]) {
  // ...
}
```

2. **Interfaces**
```typescript
import { CommandOptions } from '../types/index.js';

const command: CommandOptions = {
  name: 'ping',
  run: async (client, message, args) => {
    // ...
  }
};
```

3. **Return Types**
```typescript
async function getData(): Promise<string> {
  return 'data';
}
```

## Benefits

### 1. Type Safety
- Catch errors at compile time
- Better IDE autocomplete and IntelliSense
- Safer refactoring

### 2. Documentation
- Types serve as inline documentation
- Easier onboarding for new developers

### 3. Tooling
- Better code navigation
- Improved refactoring tools
- Enhanced debugging experience

### 4. Modern Standards
- TypeScript is industry standard
- Better ecosystem support
- Future-proof codebase

## Migration Strategy

The conversion follows a gradual migration approach:

1. ✅ **Phase 1: Setup** - Configure TypeScript
2. ✅ **Phase 2: Rename** - Convert all .js to .ts
3. 🔄 **Phase 3: Type Annotations** - Add types gradually
4. ⏳ **Phase 4: Strict Typing** - Remove `any` types over time

## File Structure

```
.
├── commands/          # Command files (*.ts)
├── events/            # Event handlers (*.ts)
├── logs/              # Log handlers (*.ts)
├── models/            # Database models (*.ts)
├── structures/        # Core classes (*.ts)
├── types/             # Type definitions
├── dist/              # Compiled JavaScript (generated)
├── tsconfig.json      # TypeScript configuration
├── index.ts           # Main entry point
└── shards.ts          # Cluster manager
```

## Common Issues

### Issue: Import paths with .js extension
**Solution:** This is correct! TypeScript requires .js extensions for ES modules.

### Issue: Cannot find module
**Solution:** 
1. Check the path includes `.js` extension
2. Verify the file exists and is `.ts`
3. Run `npm run typecheck` to see detailed errors

### Issue: Type errors during build
**Solution:**
1. Review the error message
2. Add appropriate type annotations
3. Use `any` temporarily if needed
4. Plan to fix gradually

## Environment Requirements

- Node.js 14.13.0+ (ES modules support)
- TypeScript 5.0+
- NPM or Yarn package manager

## Next Steps

1. **Run Type Checker**
   ```bash
   npm run typecheck
   ```

2. **Fix Type Errors**
   - Start with critical files
   - Add type annotations gradually
   - Use `@ts-ignore` sparingly for legacy code

3. **Build Project**
   ```bash
   npm run build
   ```

4. **Test**
   - Test in development mode
   - Build and test production bundle
   - Verify all features work

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript with ES Modules](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [Discord.js TypeScript Guide](https://discordjs.guide/additional-info/typescript.html)

## Support

For issues with the TypeScript conversion:
1. Check this documentation
2. Review TypeScript errors carefully
3. Consult the TypeScript handbook
4. Ask in development channels

---

**Conversion Date**: December 2025  
**TypeScript Version**: 5.3.3  
**Status**: ✅ Complete (Phase 1-2), 🔄 Ongoing (Phase 3-4)
