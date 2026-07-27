-- ============================================================
-- 🚨 إصلاح طارئ: إزالة Admin من الحسابات غير المصرح بها
-- EMERGENCY FIX: Remove Admin from Unauthorized Accounts
-- ============================================================

-- Step 1: عرض جميع حسابات Admin الحالية
SELECT 
  email,
  full_name,
  role,
  created_at
FROM public.profiles
WHERE role = 'admin'
ORDER BY created_at ASC;

-- ============================================================
-- Step 2: إعادة جميع الحسابات إلى Client (ما عدا Admin الحقيقي)
-- ============================================================

-- ⚠️ غيّر الإيميل هنا للإيميل الوحيد المسموح له بأن يكون Admin
UPDATE public.profiles
SET role = 'client'
WHERE role = 'admin' 
  AND email != 'admin@devpilot.com';  -- ← غيّر هذا للإيميل الصحيح

-- ============================================================
-- Step 3: تحقق من النتيجة
-- ============================================================

SELECT 
  email,
  full_name,
  role,
  created_at
FROM public.profiles
WHERE role = 'admin';

-- يجب أن يظهر admin واحد فقط!

-- ============================================================
-- Step 4: (اختياري) إذا أردت حذف جميع Admin وإنشاء واحد جديد
-- ============================================================

-- إعادة الجميع إلى client
UPDATE public.profiles
SET role = 'client'
WHERE role = 'admin';

-- ثم ارفع حساب واحد فقط إلى admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@devpilot.com';  -- ← الإيميل المسموح له فقط

-- ============================================================
-- ✅ تحقق نهائي
-- ============================================================

SELECT 
  'Total Admins' as label,
  COUNT(*) as count
FROM public.profiles
WHERE role = 'admin';

-- يجب أن يكون: count = 1 فقط!

SELECT 
  email,
  full_name,
  role
FROM public.profiles
ORDER BY role DESC, created_at ASC;
