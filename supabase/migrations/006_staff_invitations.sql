-- Pre-assign staff by email before they sign up; applied on first auth.users insert.

create table if not exists public.staff_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email)),
  profile_role text not null
    check (profile_role in ('admin', 'restaurant_manager', 'office_admin', 'employee')),
  office_id uuid references public.offices(id) on delete cascade,
  office_user_role text check (office_user_role in ('office_admin', 'employee')),
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint staff_invitations_scope check (
    (
      profile_role = 'admin'
      and office_id is null
      and restaurant_id is null
      and office_user_role is null
    )
    or (
      profile_role = 'restaurant_manager'
      and restaurant_id is not null
      and office_id is null
      and office_user_role is null
    )
    or (
      office_id is not null
      and office_user_role is not null
      and restaurant_id is null
      and profile_role in ('office_admin', 'employee')
      and profile_role = office_user_role
    )
  )
);

create unique index if not exists staff_invitations_platform_admin_email
  on public.staff_invitations (email)
  where profile_role = 'admin';

create unique index if not exists staff_invitations_office_email
  on public.staff_invitations (email, office_id)
  where office_id is not null;

create unique index if not exists staff_invitations_restaurant_email
  on public.staff_invitations (email, restaurant_id)
  where restaurant_id is not null;

alter table public.staff_invitations enable row level security;

create policy "staff_invitations_admin_all" on public.staff_invitations
  for all using (public.is_admin());

grant all on public.staff_invitations to authenticated;

create or replace function public.apply_staff_invitations_for_user(
  p_user_id uuid,
  p_email text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  inv record;
  current_role text;
  normalized_email text;
begin
  normalized_email := lower(trim(coalesce(p_email, '')));
  if normalized_email = '' then
    return;
  end if;

  for inv in
    select *
    from public.staff_invitations
    where email = normalized_email
    order by created_at
  loop
    select role into current_role from public.profiles where id = p_user_id;
    if current_role is null then
      return;
    end if;

    if inv.profile_role = 'admin' then
      update public.profiles set role = 'admin' where id = p_user_id;
    elsif inv.profile_role = 'restaurant_manager' and current_role not in ('admin') then
      update public.profiles set role = 'restaurant_manager' where id = p_user_id;
    elsif inv.profile_role = 'office_admin' and current_role = 'employee' then
      update public.profiles set role = 'office_admin' where id = p_user_id;
    end if;

    if inv.office_id is not null then
      insert into public.office_users (office_id, user_id, role)
      values (inv.office_id, p_user_id, inv.office_user_role)
      on conflict (office_id, user_id) do update
        set role = excluded.role;
    end if;

    if inv.restaurant_id is not null then
      insert into public.restaurant_users (restaurant_id, user_id)
      values (inv.restaurant_id, p_user_id)
      on conflict (restaurant_id, user_id) do nothing;
    end if;

    delete from public.staff_invitations where id = inv.id;
  end loop;
end;
$$;

revoke all on function public.apply_staff_invitations_for_user(uuid, text) from public;
grant execute on function public.apply_staff_invitations_for_user(uuid, text) to service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'role', 'employee')
  );

  perform public.apply_staff_invitations_for_user(
    new.id,
    lower(trim(coalesce(new.email, '')))
  );

  return new;
end;
$$;
