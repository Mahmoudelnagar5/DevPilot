-- ============================================================
-- إرجاع حسابات Mustafa إلى Client
-- Reset Mustafa Accounts to Client Role
-- ============================================================

-- Step 1: عرض الحسابات الحالية
SELECT 
  email,
  full_name,
  role,
  created_at
FROM public.profiles
WHERE email IN (
  'mustafagomaa95@gmail.com',
  'mustafagomaa@icloud.com'
);

-- ============================================================
-- Step 2: إرجاع الحسابين إلى Client
-- ============================================================

UPDATE public.profiles
SET role = 'client'
WHERE email IN (
  'mustafagomaa95@gmail.com',
  'mustafagomaa@icloud.com'
);

-- ============================================================
-- Step 3: تحقق من النتيجة
-- ============================================================

-- عرض حسابات Mustafa بعد التعديل
SELECT 
  email,
  full_name,
  role,
  updated_at
FROM public.profiles
WHERE email IN (
  'mustafagomaa95@gmail.com',
  'mustafagomaa@icloud.com'
);

-- ============================================================
-- Step 4: تحقق من جميع Admin الحاليين
-- ============================================================

SELECT 
  email,
  full_name,
  role,
  created_at
FROM public.profiles
WHERE role = 'admin'
ORDER BY created_at ASC;

-- يجب أن يظهر admin@devpilot.com فقط!

-- ============================================================
-- Step 5: عرض ملخص الأدوار
-- ============================================================

SELECT 
  role,
  COUNT(*) as count,
  STRING_AGG(email, ', ') as emails
FROM public.profiles
GROUP BY role
ORDER BY role;

-- ============================================================
-- ✅ النتيجة المتوقعة:
-- ============================================================
-- 
-- mustafagomaa95@gmail.com  → client
-- mustafagomaa@icloud.com   → client
-- admin@devpilot.com        → admin
--
-- ============================================================
