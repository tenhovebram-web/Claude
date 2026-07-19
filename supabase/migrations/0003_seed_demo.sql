-- =============================================================================
-- 0003_seed_demo.sql  (OPTIONAL — nur für Demo/Entwicklung)
-- Legt einen Beispiel-Workspace "Muster Handwerk GmbH" mit realistischen
-- Demodaten an. Idempotent über feste UUIDs.
--
-- Mitglieder werden NICHT geseedet (brauchen echte auth.users). Nach dem
-- ersten Login einen User verknüpfen, z. B.:
--   insert into public.workspace_members (workspace_id, user_id, role)
--   values ('00000000-0000-0000-0000-0000000000d0', '<auth-user-id>', 'owner');
-- =============================================================================

insert into public.workspaces (id, name, slug, branding, enabled_modules)
values (
  '00000000-0000-0000-0000-0000000000d0',
  'Muster Handwerk GmbH',
  'muster-handwerk',
  '{"primary_color":"#0d9488","company":"Muster Handwerk GmbH","support_email":"buero@muster-handwerk.de","locale":"de-DE"}'::jsonb,
  '{"calls": true, "pipeline": true, "appointments": true}'::jsonb
)
on conflict (id) do nothing;

-- Kontakte
insert into public.contacts (id, workspace_id, name, phone, email, company) values
  ('00000000-0000-0000-0000-0000000c0001','00000000-0000-0000-0000-0000000000d0','Familie Berger','+49 151 2345678','berger@example.de',null),
  ('00000000-0000-0000-0000-0000000c0002','00000000-0000-0000-0000-0000000000d0','Sabine Krüger','+49 170 9876543','s.krueger@example.de',null),
  ('00000000-0000-0000-0000-0000000c0003','00000000-0000-0000-0000-0000000000d0','Hausverwaltung Nord','+49 40 111222','info@hv-nord.de','Hausverwaltung Nord GmbH'),
  ('00000000-0000-0000-0000-0000000c0004','00000000-0000-0000-0000-0000000000d0','Thomas Wagner','+49 160 5551234','t.wagner@example.de',null)
on conflict (id) do nothing;

-- Anrufe (Anruf-Cockpit) — inkl. offener Rückrufliste
insert into public.calls (workspace_id, contact_id, direction, status, phone_number, caller_name, callback_required, callback_done, occurred_at, provider) values
  ('00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-0000000c0001','inbound','missed','+49 151 2345678','Familie Berger',true,false, now() - interval '35 minutes','mock'),
  ('00000000-0000-0000-0000-0000000000d0',null,'inbound','missed','+49 152 4443322','Unbekannt',true,false, now() - interval '2 hours','mock'),
  ('00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-0000000c0002','inbound','answered','+49 170 9876543','Sabine Krüger',false,false, now() - interval '3 hours','mock'),
  ('00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-0000000c0003','inbound','voicemail','+49 40 111222','Hausverwaltung Nord',true,true, now() - interval '1 day','mock');

-- Leads / Angebots-Pipeline
insert into public.leads (workspace_id, contact_id, title, stage, value_cents, source, quote_sent_at, next_follow_up_at, notes) values
  ('00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-0000000c0001','Badsanierung EFH','new',480000,'phone',null,null,'Anfrage über verpassten Anruf zurückgeholt'),
  ('00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-0000000c0002','Heizungswartung','contacted',35000,'website',null, now() + interval '2 days',null),
  ('00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-0000000c0004','Elektro-Neuinstallation','quoted',1250000,'immoscout', now() - interval '4 days', now() - interval '1 day','Angebot raus, Nachfassen überfällig!'),
  ('00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-0000000c0003','Wartungsvertrag Objekt','followed_up',96000,'phone', now() - interval '9 days', now() + interval '5 days',null),
  ('00000000-0000-0000-0000-0000000000d0',null,'Fenstertausch','won',720000,'website', now() - interval '20 days',null,null),
  ('00000000-0000-0000-0000-0000000000d0',null,'Gartentor','lost',180000,'phone', now() - interval '30 days',null,'Kunde hat sich für Wettbewerber entschieden');

-- Termine (Termin-Zentrale)
insert into public.appointments (workspace_id, contact_id, title, status, starts_at, ends_at, location, reminder_sent_at) values
  ('00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-0000000c0001','Vor-Ort-Aufmaß Bad','confirmed', now() + interval '1 day' + interval '9 hours', now() + interval '1 day' + interval '10 hours','Musterstr. 12, Hamburg', now() - interval '2 hours'),
  ('00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-0000000c0002','Heizung Beratung','scheduled', now() + interval '3 days' + interval '14 hours', now() + interval '3 days' + interval '15 hours','Telefon',null),
  ('00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-0000000c0004','Angebotstermin Elektro','completed', now() - interval '5 days', now() - interval '5 days' + interval '1 hour','Büro',now() - interval '6 days'),
  ('00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-0000000c0003','Objektbegehung','no_show', now() - interval '2 days', now() - interval '2 days' + interval '1 hour','Objekt Nord',null);
