# Fix Build Errors - Step by Step Guide

## 🚨 Problem: `Module '"date-fns"' has no exported member 'eachDayOfInterval'`

This error occurs because your local `node_modules` still has the old `@types/date-fns` package cached, even though we removed it from `package.json`.

---

## ✅ Quick Fix (Recommended)

Run this script:

```bash
./fix-date-fns.sh
```

That's it! The script will:
1. Remove `node_modules/@types/date-fns`
2. Clear all caches (`.next`, `node_modules/.cache`)
3. Reinstall dependencies
4. Verify the fix
5. Test TypeScript compilation

---

## 🔧 Manual Fix (If Script Doesn't Work)

### Step 1: Clean Everything

```bash
# Delete the problematic package
rm -rf node_modules/@types/date-fns

# Delete all caches
rm -rf .next
rm -rf node_modules/.cache
rm -rf node_modules

# Optional: Delete package-lock.json to force clean install
rm package-lock.json
```

### Step 2: Reinstall Dependencies

```bash
npm install
```

**IMPORTANT**: Make sure `@types/date-fns` is NOT in your `package.json`. It should look like this:

```json
"devDependencies": {
  "@prisma/nextjs-monorepo-workaround-plugin": "^6.19.0",
  "@types/bcryptjs": "^2.4.6",
  "@types/node": "^20.19.23",
  "@types/react": "^19.2.2",
  "@types/react-dom": "^19.2.2",
  // NO @types/date-fns here!
  "autoprefixer": "^10.4.20",
  ...
}
```

### Step 3: Verify the Fix

```bash
# Check that @types/date-fns is gone
ls node_modules/@types/date-fns 2>/dev/null && echo "❌ Still exists!" || echo "✅ Removed!"

# Test date-fns imports
node -e "const { eachDayOfInterval, formatDistanceToNow } = require('date-fns'); console.log('✅ Works!');"

# Run TypeScript check on calendar page
npx tsc --noEmit app/calendar/page.tsx
```

### Step 4: Build the Project

```bash
npm run build
```

---

## 📝 Why This Happens

- **date-fns v4.1.0** has built-in TypeScript types
- **@types/date-fns v2.5.3** (old community types) conflicts with the built-in types
- When both exist, TypeScript uses the old types which don't have `eachDayOfInterval`
- Solution: Remove `@types/date-fns` and use the built-in types from date-fns

---

## 🎯 Expected Result

After running the fix, you should see:

```
✅ @types/date-fns successfully removed
✅ date-fns imports work correctly
✅ TypeScript check passed
✅ Build succeeds
```

---

## 🆘 Still Not Working?

If the error persists:

1. **Check your package.json**: Ensure `@types/date-fns` is NOT listed
2. **Delete everything and start fresh**:
   ```bash
   rm -rf node_modules package-lock.json .next
   npm install
   npm run build
   ```
3. **Check for multiple package managers**: Make sure you're not mixing npm, yarn, and pnpm
4. **Restart your IDE/editor**: TypeScript language server might be caching old types

---

## ✅ All Fixes Applied

The following issues have been completely resolved:

- ✅ Added `category` field to OneTimeBill schema
- ✅ Fixed all TypeScript type mismatches (status, type, category)
- ✅ Added `outline` variant to Button component
- ✅ Fixed PaymentModal useEffect issue
- ✅ Fixed Toggle component import
- ✅ Removed conflicting @types/date-fns
- ✅ Fixed dashboard CategorySpending types

All changes are committed to branch: `claude/fix-onetimebill-category-01WRbbzc6gYFM4GWhxkNtuBW`

---

## 🚀 After Fixing

Once the build succeeds, remember to:

```bash
# Generate Prisma client with updated schema
npx prisma generate

# Push schema changes to MongoDB
npx prisma db push

# Start development server
npm run dev
```

Your finance app is now ready to use! 🎉
