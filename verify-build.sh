#!/bin/bash
echo "🧹 Cleaning build artifacts..."
rm -rf .next node_modules/.cache

echo ""
echo "📦 Reinstalling dependencies..."
npm install --ignore-scripts

echo ""
echo "✅ Running TypeScript check..."
npx tsc --noEmit 2>&1 | grep -E "(eachDayOfInterval|formatDistanceToNow)" && echo "❌ date-fns errors found" || echo "✅ No date-fns import errors!"

echo ""
echo "🏗️  Running Next.js build..."
npx next build
