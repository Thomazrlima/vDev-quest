alter policy missions_read_active_or_manager on quests.missions
  using (
    status = 'active'
    or (select private.is_manager())
    or exists (
      select 1 from quests.submissions s
      where s.mission_id = quests.missions.id and s.collaborator_email = (select private.current_email())
    )
  );
