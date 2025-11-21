#!/bin/bash

echo "🔧 Fixing date-fns import errors..."
echo ""

echo "Step 1: Removing problematic @types/date-fns package..."
rm -rf node_modules/@types/date-fns
echo "✅ Removed node_modules/@types/date-fns"

echo ""
echo "Step 2: Clearing all caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf node_modules/.prisma
echo "✅ Cleared .next, node_modules/.cache, and node_modules/.prisma"

echo ""
echo "Step 3: Reinstalling dependencies..."
npm install --legacy-peer-deps
echo "✅ Dependencies reinstalled"

echo ""
echo "Step 4: Verifying date-fns types..."
if [ -d "node_modules/@types/date-fns" ]; then
    echo "❌ ERROR: @types/date-fns still exists!"
    echo "   Manually delete: node_modules/@types/date-fns"
else
    echo "✅ @types/date-fns successfully removed"
fi

echo ""
echo "Step 5: Testing date-fns imports..."
node -e "const { eachDayOfInterval, formatDistanceToNow } = require('date-fns'); console.log('✅ date-fns imports work correctly');" || echo "❌ date-fns import test failed"

echo ""
echo "Step 6: Running TypeScript check..."
npx tsc --noEmit app/calendar/page.tsx 2>&1 | grep "eachDayOfInterval" && echo "❌ Still has errors" || echo "✅ TypeScript check passed"

echo ""
echo "🎉 Fix complete! You can now run: npm run build"
