-- ============================================================
-- إنشاء حساب Admin واحد فقط
-- Create ONE Admin Account Only
-- ============================================================
-- 
-- ⚠️ CRITICAL SECURITY NOTE:
-- This script creates ONLY ONE admin account.
-- Run this CAREFULLY after signing up through the app.
-- 
-- ⚠️ تحذير أمني مهم:
-- هذا السكريبت ينشئ حساب admin واحد فقط.
-- شغّله بحذر بعد التسجيل من التطبيق.
-- ============================================================

-- ⚠️⚠️⚠️ IMPORTANT: Change the email below to YOUR admin email ⚠️⚠️⚠️
-- ⚠️⚠️⚠️ مهم: غيّر الإيميل أدناه لإيميل الـ admin الذي تريده ⚠️⚠️⚠️

DO $$
DECLARE
  user_id UUID;
  admin_email TEXT := 'admin@devpilot.com';  -- ⚠️ غيّر هذا الإيميل!
BEGIN
  -- Get the user ID by email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = admin_email
  LIMIT 1;

  IF user_id IS NULL THEN
    RAISE NOTICE '';
    RAISE NOTICE '❌ User not found!';
    RAISE NOTICE '   Email searched: %', admin_email;
    RAISE NOTICE '';
    RAISE NOTICE '📝 Steps to fix:';
    RAISE NOTICE '   1. Sign up through the app with email: %', admin_email;
    RAISE NOTICE '   2. Wait for signup to complete';
    RAISE NOTICE '   3. Run this script again';
    RAISE NOTICE '';
  ELSE
    -- Update ONLY this specific user's role to admin
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = user_id;

    RAISE NOTICE '';
    RAISE NOTICE '✅ Admin account created successfully!';
    RAISE NOTICE '   Email: %', admin_email;
    RAISE NOTICE '   User ID: %', user_id;
    RAISE NOTICE '   Role: admin';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 You can now login with this account';
    RAISE NOTICE '';
  END IF;
END $$;

-- ============================================================
-- طريقة بديلة: تحديث يدوي
-- Alternative Method: Manual Update
-- ============================================================
-- 
-- إذا أردت تحديث يدوي بدون script:
-- If you want to update manually without script:
--
-- 1. Sign up through the app
-- 2. Find your user ID:
--    SELECT id, email, role FROM public.profiles WHERE email = 'your@email.com';
-- 3. Update role to admin:
--    UPDATE public.profiles SET role = 'admin' WHERE id = 'USER_ID_HERE';
--

-- ============================================================
-- تحقق من حسابات الـ Admin
-- Verify Admin Accounts
-- ============================================================

SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles
WHERE role = 'admin'
ORDER BY created_at DESC;

-- ============================================================
-- ملاحظات أمنية مهمة
-- Important Security Notes
-- ============================================================
--
-- ✅ DO:
-- - Always use strong passwords for admin accounts
-- - Limit admin accounts to trusted team members only
-- - Regularly audit admin account access
-- - Use 2FA (Two-Factor Authentication) if available
-- - Monitor admin activity logs
--
-- ❌ DON'T:
-- - Never allow public signup as admin
-- - Don't share admin credentials
-- - Don't use weak or common passwords
-- - Don't create unnecessary admin accounts
--
-- ============================================================
