@echo off
echo ================================
echo Removing Secret from Git History
echo ================================
echo.

echo WARNING: This will rewrite git history!
echo Make sure you're the only one working on this branch.
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo Step 1: Installing dotenv...
call npm install dotenv
echo.

echo Step 2: Finding current commit...
git log --oneline -5
echo.

echo Step 3: Resetting to before the secret commit...
echo Looking for commit 8e03800620ccb64d5ed80f0ff117dde824391998...
git reset --soft HEAD~1
echo.

echo Step 4: Staging all fixed files...
git add .
echo.

echo Step 5: Creating new clean commit...
git commit -m "fix: remove hardcoded secrets and add ERD visualization

- Moved Supabase credentials to environment variables (.env)
- Updated migration scripts to use dotenv for secrets
- Added MermaidRenderer component for visual ERD diagrams  
- Updated AI Assistant to parse and render Mermaid ERD blocks
- Updated system prompts to instruct AI to generate Mermaid syntax
- Secrets now loaded from .env file (not committed to git)"
echo.

echo Step 6: Checking status before push...
git status
echo.

echo Step 7: Pushing with force to overwrite bad commit...
git push --force origin main

if errorlevel 1 (
    echo.
    echo ================================
    echo Push STILL failed!
    echo ================================
    echo.
    echo The secret might be in multiple commits. Try:
    echo   git log --all --full-history -- apply-migration*.mjs
    echo.
    echo Then reset further back:
    echo   git reset --soft HEAD~2
    echo   git add .
    echo   git commit -m "fix: remove secrets"
    echo   git push --force origin main
    echo.
    pause
    exit /b 1
)

echo.
echo ================================
echo SUCCESS! Changes pushed!
echo ================================
echo.
echo CRITICAL SECURITY STEP:
echo A Supabase secret key was exposed in the commit history!
echo.
echo YOU MUST REVOKE IT NOW:
echo 1. Go to: https://supabase.com/dashboard/project/chxqtomltraqbtqpwglk/settings/api
echo 2. Click "Regenerate" next to Service Role Key
echo 3. Update your .env file with the new key
echo.
echo DO NOT SKIP THIS STEP!
echo.
pause
