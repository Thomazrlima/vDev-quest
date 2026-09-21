create schema if not exists core;
create schema if not exists quests;
create schema if not exists avatar;
create schema if not exists gamification;
create schema if not exists private;

revoke all on schema public from public;
revoke all on schema core, quests, avatar, gamification, private from public;

create type core.user_role as enum ('collaborator', 'manager');
create type quests.evidence_type as enum ('photo', 'pdf', 'link', 'text');
create type quests.mission_status as enum ('active', 'invalidated');
create type quests.recurrence_type as enum ('none', 'daily', 'weekly', 'monthly');
create type quests.weekday as enum ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
create type quests.submission_status as enum ('active', 'cancelled', 'invalidated');
create type quests.submission_status_change_source as enum ('user_cancellation', 'admin_invalidation', 'mission_invalidation');
create type avatar.body_type as enum ('hero', 'heroine');
create type avatar.avatar_slot as enum ('hair', 'headwear', 'face', 'shirt', 'pants', 'overalls', 'skirt', 'outer', 'socks', 'shoes', 'boots', 'hands', 'neck');
create type gamification.xp_movement_type as enum (
  'phase_reward', 'checkin_base_reward', 'checkin_milestone_reward',
  'user_cancellation_reversal', 'admin_invalidation_reversal',
  'mission_invalidation_reversal', 'checkin_bonus_correction'
);

create or replace function private.current_email()
returns text language sql stable set search_path = '' as $$
  select nullif(current_setting('app.user_email', true), '');
$$;

create or replace function private.is_manager()
returns boolean language sql stable set search_path = '' as $$
  select current_setting('app.user_role', true) = 'manager';
$$;

create or replace function private.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table core.users (
  email text primary key,
  name text not null,
  xp bigint not null default 0,
  role core.user_role not null default 'collaborator',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_name_not_blank check (char_length(btrim(name)) > 0),
  constraint users_email_normalized check (email = lower(btrim(email))),
  constraint users_email_shape check (position('@' in email) > 1),
  constraint users_xp_nonnegative check (xp >= 0)
);

create index users_xp_desc_idx on core.users (xp desc);

create table quests.missions (
  id uuid primary key,
  slug text not null unique,
  created_by_email text not null references core.users(email) on update cascade on delete restrict,
  title text not null,
  description text not null,
  evidence_type quests.evidence_type not null,
  start_date date not null,
  end_date date not null,
  recurrence_type quests.recurrence_type not null default 'none',
  is_checkin boolean not null default false,
  allows_multiple_submissions boolean not null default false,
  status quests.mission_status not null default 'active',
  invalidated_at timestamptz,
  invalidated_by_email text references core.users(email) on update cascade on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint missions_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint missions_title_not_blank check (char_length(btrim(title)) > 0),
  constraint missions_description_not_blank check (char_length(btrim(description)) > 0),
  constraint missions_valid_date_range check (end_date >= start_date),
  constraint missions_checkin_requires_monthly check (not is_checkin or recurrence_type = 'monthly'),
  constraint missions_invalidation_consistent check (
    (status = 'active' and invalidated_at is null and invalidated_by_email is null) or
    (status = 'invalidated' and invalidated_at is not null and invalidated_by_email is not null)
  )
);

create index missions_availability_idx on quests.missions (status, start_date, end_date);
create index missions_created_by_email_idx on quests.missions (created_by_email);
create unique index missions_one_checkin_per_month_uidx
  on quests.missions (extract(year from start_date), extract(month from start_date)) where is_checkin;

create table quests.mission_phases (
  mission_id uuid not null references quests.missions(id) on delete cascade,
  phase_number integer not null,
  phase_title text not null,
  xp_reward integer not null,
  primary key (mission_id, phase_number),
  constraint mission_phases_number_positive check (phase_number > 0),
  constraint mission_phases_title_not_blank check (char_length(btrim(phase_title)) > 0),
  constraint mission_phases_xp_reward_positive check (xp_reward > 0)
);

create table quests.mission_weekdays (
  mission_id uuid not null references quests.missions(id) on delete cascade,
  weekday quests.weekday not null,
  primary key (mission_id, weekday)
);

create table quests.submissions (
  id uuid primary key,
  mission_id uuid not null references quests.missions(id) on delete restrict,
  current_phase integer not null default 1,
  collaborator_email text not null references core.users(email) on update cascade on delete restrict,
  occurrence_date date,
  status quests.submission_status not null default 'active',
  status_changed_at timestamptz,
  status_changed_by_email text references core.users(email) on update cascade on delete restrict,
  status_change_source quests.submission_status_change_source,
  invalidation_justification text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint submission_current_phase_exists foreign key (mission_id, current_phase)
    references quests.mission_phases(mission_id, phase_number),
  constraint submissions_status_state_consistent check (
    (status = 'active' and status_changed_at is null and status_changed_by_email is null and status_change_source is null and invalidation_justification is null) or
    (status = 'cancelled' and status_changed_at is not null and status_changed_by_email is not null and status_change_source = 'user_cancellation' and invalidation_justification is null) or
    (status = 'invalidated' and status_changed_at is not null and status_changed_by_email is not null and status_change_source in ('admin_invalidation', 'mission_invalidation'))
  ),
  constraint submissions_justification_matches_source check (
    (status_change_source = 'admin_invalidation' and char_length(btrim(invalidation_justification)) > 0) or
    (status_change_source is distinct from 'admin_invalidation' and invalidation_justification is null)
  )
);

create index submissions_fifo_active_idx on quests.submissions (mission_id, collaborator_email, current_phase, submitted_at, id)
  where status = 'active';
create index submissions_collaborator_history_idx on quests.submissions (collaborator_email, submitted_at desc, id desc);
create unique index submissions_one_active_occurrence_uidx on quests.submissions (mission_id, collaborator_email, occurrence_date)
  where status = 'active' and occurrence_date is not null;
create index submissions_mission_collaborator_status_idx on quests.submissions (mission_id, collaborator_email, status);

create table quests.submission_phase_evidences (
  submission_id uuid not null references quests.submissions(id) on delete restrict,
  phase_number integer not null,
  evidence_value text,
  attachment_object_key text,
  original_file_name text,
  mime_type text,
  file_size_bytes bigint,
  submitted_at timestamptz not null default now(),
  primary key (submission_id, phase_number),
  constraint evidence_file_size_limit check (file_size_bytes is null or (file_size_bytes > 0 and file_size_bytes <= 3145728)),
  constraint evidence_payload_shape check (
    (attachment_object_key is not null and evidence_value is null and original_file_name is not null and mime_type is not null and file_size_bytes is not null) or
    (attachment_object_key is null and evidence_value is not null and char_length(btrim(evidence_value)) > 0 and original_file_name is null and mime_type is null and file_size_bytes is null)
  )
);

create table avatar.slot_definitions (
  slot avatar.avatar_slot primary key,
  label text not null,
  asset_directory text not null,
  draw_order smallint not null unique,
  icon_code text not null,
  constraint slot_draw_order_nonnegative check (draw_order >= 0)
);

create table avatar.items (
  id uuid primary key,
  slot avatar.avatar_slot not null references avatar.slot_definitions(slot) on delete restrict,
  code text not null,
  label text not null,
  file_path text not null,
  shaped_file_path text,
  under_file_path text,
  hides_hair boolean not null default false,
  hidden_by_hats boolean not null default false,
  unique (slot, code),
  unique (id, slot),
  constraint avatar_item_code_not_blank check (char_length(btrim(code)) > 0),
  constraint avatar_item_file_path_not_blank check (char_length(btrim(file_path)) > 0)
);

create table avatar.user_avatars (
  user_email text primary key references core.users(email) on delete cascade on update cascade,
  body_type avatar.body_type not null default 'hero',
  skin_color_index smallint not null default 0,
  updated_at timestamptz not null default now(),
  constraint avatar_skin_nonnegative check (skin_color_index >= 0)
);

create table avatar.user_slot_settings (
  user_email text not null references core.users(email) on delete cascade on update cascade,
  slot avatar.avatar_slot not null references avatar.slot_definitions(slot) on delete restrict,
  item_id uuid,
  color_index smallint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_email, slot),
  foreign key (item_id, slot) references avatar.items(id, slot) on delete restrict,
  constraint avatar_slot_color_nonnegative check (color_index >= 0)
);

create table gamification.levels (
  level smallint primary key,
  minimum_xp bigint not null unique,
  label text not null,
  constraint levels_number_positive check (level > 0),
  constraint levels_minimum_nonnegative check (minimum_xp >= 0),
  constraint levels_label_not_blank check (char_length(btrim(label)) > 0)
);

create table gamification.badges (
  id uuid primary key,
  code text not null unique,
  label text not null,
  description text,
  image_path text not null,
  constraint badges_code_not_blank check (char_length(btrim(code)) > 0),
  constraint badges_label_not_blank check (char_length(btrim(label)) > 0),
  constraint badges_image_not_blank check (char_length(btrim(image_path)) > 0)
);

create table gamification.titles (
  id uuid primary key,
  code text not null unique,
  label text not null,
  description text,
  constraint titles_code_not_blank check (char_length(btrim(code)) > 0),
  constraint titles_label_not_blank check (char_length(btrim(label)) > 0)
);

create table gamification.user_badges (
  user_email text not null references core.users(email) on delete cascade on update cascade,
  badge_id uuid not null references gamification.badges(id) on delete restrict,
  granted_at timestamptz not null default now(),
  primary key (user_email, badge_id)
);

create table gamification.user_titles (
  user_email text not null references core.users(email) on delete cascade on update cascade,
  title_id uuid not null references gamification.titles(id) on delete restrict,
  is_active boolean not null default false,
  granted_at timestamptz not null default now(),
  primary key (user_email, title_id)
);
create unique index user_titles_one_active_uidx on gamification.user_titles(user_email) where is_active;

create table gamification.xp_awards (
  id uuid primary key,
  user_email text not null references core.users(email) on delete restrict on update cascade,
  submission_id uuid not null references quests.submissions(id) on delete restrict,
  phase_number integer,
  amount integer not null,
  movement_type gamification.xp_movement_type not null,
  related_award_id uuid references gamification.xp_awards(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint xp_awards_amount_nonzero check (amount <> 0)
);
create index xp_awards_user_created_idx on gamification.xp_awards(user_email, created_at desc);
create index xp_awards_submission_created_idx on gamification.xp_awards(submission_id, created_at);
create unique index xp_awards_one_reversal_per_award_uidx on gamification.xp_awards(related_award_id) where related_award_id is not null;
create unique index xp_awards_phase_reward_once_uidx on gamification.xp_awards(submission_id, phase_number)
  where movement_type in ('phase_reward', 'checkin_base_reward');

create table private.idempotency_requests (
  actor_email text not null references core.users(email) on delete restrict,
  idempotency_key uuid not null,
  request_hash text not null,
  response_status integer,
  response_body jsonb,
  created_at timestamptz not null default now(),
  primary key (actor_email, idempotency_key)
);

create trigger users_touch_updated_at before update on core.users for each row execute function private.touch_updated_at();
create trigger missions_touch_updated_at before update on quests.missions for each row execute function private.touch_updated_at();
create trigger submissions_touch_updated_at before update on quests.submissions for each row execute function private.touch_updated_at();

insert into gamification.levels(level, minimum_xp, label) values (1, 0, 'Aventureiro');
insert into core.users(email, name, role) values ('admin@vdev.local', 'Administradora local', 'manager');

alter table core.users enable row level security;
alter table quests.missions enable row level security;
alter table quests.mission_phases enable row level security;
alter table quests.mission_weekdays enable row level security;
alter table quests.submissions enable row level security;
alter table quests.submission_phase_evidences enable row level security;
alter table avatar.user_avatars enable row level security;
alter table avatar.user_slot_settings enable row level security;
alter table gamification.xp_awards enable row level security;
alter table gamification.user_badges enable row level security;
alter table gamification.user_titles enable row level security;
alter table private.idempotency_requests enable row level security;

alter table core.users force row level security;
alter table quests.missions force row level security;
alter table quests.mission_phases force row level security;
alter table quests.mission_weekdays force row level security;
alter table quests.submissions force row level security;
alter table quests.submission_phase_evidences force row level security;
alter table avatar.user_avatars force row level security;
alter table avatar.user_slot_settings force row level security;
alter table gamification.xp_awards force row level security;
alter table gamification.user_badges force row level security;
alter table gamification.user_titles force row level security;
alter table private.idempotency_requests force row level security;

create policy users_self_or_manager on core.users using (email = (select private.current_email()) or (select private.is_manager()));
create policy missions_read_active_or_manager on quests.missions for select using (status = 'active' or (select private.is_manager()));
create policy missions_manager_write on quests.missions for all using ((select private.is_manager())) with check ((select private.is_manager()));
create policy phases_read_mission on quests.mission_phases for select using (exists (select 1 from quests.missions m where m.id = mission_id));
create policy phases_manager_write on quests.mission_phases for all using ((select private.is_manager())) with check ((select private.is_manager()));
create policy weekdays_read_mission on quests.mission_weekdays for select using (exists (select 1 from quests.missions m where m.id = mission_id));
create policy weekdays_manager_write on quests.mission_weekdays for all using ((select private.is_manager())) with check ((select private.is_manager()));
create policy submissions_self_or_manager on quests.submissions using (collaborator_email = (select private.current_email()) or (select private.is_manager())) with check (collaborator_email = (select private.current_email()) or (select private.is_manager()));
create policy evidence_owner_or_manager on quests.submission_phase_evidences using (exists (select 1 from quests.submissions s where s.id = submission_id and (s.collaborator_email = (select private.current_email()) or (select private.is_manager())))) with check (exists (select 1 from quests.submissions s where s.id = submission_id and (s.collaborator_email = (select private.current_email()) or (select private.is_manager()))));
create policy avatar_self on avatar.user_avatars using (user_email = (select private.current_email())) with check (user_email = (select private.current_email()));
create policy avatar_slots_self on avatar.user_slot_settings using (user_email = (select private.current_email())) with check (user_email = (select private.current_email()));
create policy awards_self_or_manager on gamification.xp_awards using (user_email = (select private.current_email()) or (select private.is_manager())) with check (user_email = (select private.current_email()) or (select private.is_manager()));
create policy badges_self_or_manager on gamification.user_badges using (user_email = (select private.current_email()) or (select private.is_manager()));
create policy titles_self_or_manager on gamification.user_titles using (user_email = (select private.current_email()) or (select private.is_manager()));
create policy idempotency_self on private.idempotency_requests using (actor_email = (select private.current_email())) with check (actor_email = (select private.current_email()));

do $$ begin
  if exists (select 1 from pg_roles where rolname = 'vdev_app') then
    grant usage on schema core, quests, avatar, gamification, private to vdev_app;
    grant select, insert, update on core.users to vdev_app;
    grant select, insert, update on quests.missions, quests.mission_phases, quests.mission_weekdays, quests.submissions, quests.submission_phase_evidences to vdev_app;
    grant select on avatar.slot_definitions, avatar.items, gamification.levels, gamification.badges, gamification.titles to vdev_app;
    grant select, insert, update on avatar.user_avatars, avatar.user_slot_settings, gamification.user_badges, gamification.user_titles to vdev_app;
    grant select, insert on gamification.xp_awards to vdev_app;
    grant select, insert, update on private.idempotency_requests to vdev_app;
  end if;
end $$;
