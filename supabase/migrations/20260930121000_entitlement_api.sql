create or replace function public.has_pro()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.has_pro();
$$;

revoke all on function public.has_pro() from public, anon;
grant execute on function public.has_pro() to authenticated, service_role;

comment on function public.has_pro() is
  'Authenticated Data API surface for the canonical private.has_pro() entitlement check. Accepts no user_id.';
