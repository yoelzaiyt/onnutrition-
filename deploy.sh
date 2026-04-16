#!/bin/bash
# ONNutrition Deploy Script

echo "🚀 Starting ONNutrition Deploy..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Run lint
echo "🔍 Running lint..."
npm run lint

# 3. Build
echo "🏗️ Building project..."
npm run build

# 4. Commit changes
echo "💾 Committing changes..."
git add -A
git commit -m "deploy: Ready for production"

# 5. Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Deploy script completed!"
echo "Now go to Vercel and deploy from your GitHub repository."