drop function if exists private.ranking_profiles();

create function private.ranking_profiles()
returns table(
  name text,
  xp bigint,
  active_submissions bigint,
  level smallint,
  level_label text,
  active_title text,
  badges jsonb
)
language sql security definer set search_path = '' as $$
  select
    u.name,
    u.xp,
    count(s.id) filter (where s.status = 'active') as active_submissions,
    level_row.level,
    level_row.label,
    (
      select title.label
      from gamification.user_titles user_title
      join gamification.titles title on title.id = user_title.title_id
      where user_title.user_email = u.email and user_title.is_active
    ) as active_title,
    coalesce((
      select jsonb_agg(jsonb_build_object('label', badge.label, 'imagePath', badge.image_path) order by badge.label)
      from gamification.user_badges user_badge
      join gamification.badges badge on badge.id = user_badge.badge_id
      where user_badge.user_email = u.email
    ), '[]'::jsonb) as badges
  from core.users u
  left join quests.submissions s on s.collaborator_email = u.email
  cross join lateral (
    select levels.level, levels.label
    from gamification.levels
    where levels.minimum_xp <= u.xp
    order by levels.minimum_xp desc
    limit 1
  ) level_row
  group by u.email, u.name, u.xp, level_row.level, level_row.label
  order by u.xp desc, count(s.id) filter (where s.status = 'active') desc, u.name asc;
$$;

revoke all on function private.ranking_profiles() from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'vdev_app') then
    grant execute on function private.ranking_profiles() to vdev_app;
  end if;
end $$;
