-- Local demo accounts from infrastructure/keycloak/vdev-quest-realm.json.
-- Existing profiles keep their role, display name, and earned XP.
begin;
select set_config('app.user_email', 'admin@vdev.local', true);
select set_config('app.user_role', 'manager', true);

insert into core.users (email, name, role) values
  ('colaborador@vdev.local', 'Aventureiro Local', 'collaborator'),
  ('ana.silva@vdev.local', 'Ana Silva', 'collaborator'),
  ('bruno.lima@vdev.local', 'Bruno Lima', 'collaborator'),
  ('carla.souza@vdev.local', 'Carla Souza', 'collaborator'),
  ('diego.rocha@vdev.local', 'Diego Rocha', 'collaborator'),
  ('elisa.costa@vdev.local', 'Elisa Costa', 'collaborator')
on conflict (email) do nothing;

commit;
