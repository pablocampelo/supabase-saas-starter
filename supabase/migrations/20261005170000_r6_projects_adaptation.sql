alter table public.example_resources rename to projects;

alter index public.example_resources_user_updated_idx
  rename to projects_user_updated_idx;

alter table public.projects
  add column status text not null default 'draft'
  check (status in ('draft', 'active'));

alter trigger example_resources_set_updated_at
  on public.projects
  rename to projects_set_updated_at;

drop trigger example_resources_owner_immutable on public.projects;
drop function private.prevent_example_owner_change();

create or replace function private.prevent_project_owner_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'project owner is immutable' using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function private.prevent_project_owner_change() from public, anon, authenticated;

create trigger projects_owner_immutable
before update of user_id on public.projects
for each row execute function private.prevent_project_owner_change();

alter policy "example_select_own" on public.projects rename to "projects_select_own";
alter policy "example_insert_own_pro" on public.projects rename to "projects_insert_own_pro";
alter policy "example_update_own_pro" on public.projects rename to "projects_update_own_pro";
alter policy "example_delete_own" on public.projects rename to "projects_delete_own";

comment on table public.projects is
  'Private Projects domain created during the R6 adaptability exercise; preserves ownership, RLS, entitlement-gated writes, and retained read/delete semantics.';