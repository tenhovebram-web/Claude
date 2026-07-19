-- =============================================================================
-- 0002_rls_policies.sql
-- Row Level Security — die strikte Datentrennung zwischen Kunden-Workspaces.
--
-- Grundregel: Ein eingeloggter User darf NUR Zeilen sehen/ändern, deren
-- workspace_id zu einem Workspace gehört, in dem er Mitglied ist.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Hilfsfunktion: Ist der aktuelle User Mitglied im Workspace?
-- SECURITY DEFINER, damit die Prüfung workspace_members lesen darf, ohne dass
-- der Aufrufer selbst darauf Zugriff braucht (verhindert Rekursion in RLS).
-- -----------------------------------------------------------------------------
create or replace function public.is_workspace_member(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members m
    where m.workspace_id = ws
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_admin(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members m
    where m.workspace_id = ws
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
  );
$$;

-- -----------------------------------------------------------------------------
-- RLS aktivieren
-- -----------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.workspaces        enable row level security;
alter table public.workspace_members enable row level security;
alter table public.contacts          enable row level security;
alter table public.calls             enable row level security;
alter table public.leads             enable row level security;
alter table public.appointments      enable row level security;
alter table public.integrations      enable row level security;

-- -----------------------------------------------------------------------------
-- profiles: jeder sieht/ändert nur sein eigenes Profil
-- -----------------------------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- -----------------------------------------------------------------------------
-- workspaces: sichtbar für Mitglieder; änderbar nur für owner/admin
-- -----------------------------------------------------------------------------
create policy "workspaces_select_member" on public.workspaces
  for select using (public.is_workspace_member(id));
create policy "workspaces_update_admin" on public.workspaces
  for update using (public.is_workspace_admin(id))
  with check (public.is_workspace_admin(id));

-- -----------------------------------------------------------------------------
-- workspace_members: Mitglieder sehen die Mitgliederliste ihres Workspaces;
-- verwalten dürfen nur owner/admin.
-- -----------------------------------------------------------------------------
create policy "members_select" on public.workspace_members
  for select using (public.is_workspace_member(workspace_id));
create policy "members_insert_admin" on public.workspace_members
  for insert with check (public.is_workspace_admin(workspace_id));
create policy "members_update_admin" on public.workspace_members
  for update using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));
create policy "members_delete_admin" on public.workspace_members
  for delete using (public.is_workspace_admin(workspace_id));

-- -----------------------------------------------------------------------------
-- Fachtabellen: einheitliches Muster über is_workspace_member(workspace_id).
-- FOR ALL deckt select/insert/update/delete ab; USING + WITH CHECK stellen
-- sicher, dass niemand Zeilen in fremde Workspaces schreibt.
-- -----------------------------------------------------------------------------
create policy "contacts_all_member" on public.contacts
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "calls_all_member" on public.calls
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "leads_all_member" on public.leads
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "appointments_all_member" on public.appointments
  for all using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

-- Integrationen enthalten Secrets -> nur owner/admin
create policy "integrations_all_admin" on public.integrations
  for all using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));
