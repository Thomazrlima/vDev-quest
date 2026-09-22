-- Mission rule replacement deletes the previous weekdays and phases before inserting the new set.
-- Keep this grant scoped to the two child tables; RLS still limits the operation to managers.
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'vdev_app') then
    grant delete on quests.mission_phases, quests.mission_weekdays to vdev_app;
  end if;
end $$;
