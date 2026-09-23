-- Run in Supabase → SQL Editor when a platform admin was demoted to office_admin
-- (usually from assigning themselves as office admin before the role-preservation fix).

-- Replace with your login email:
update public.profiles
set role = 'admin'
where lower(email) = lower('you@example.com');

-- You can stay linked to an office via office_users; profile.role = admin keeps /admin access.
