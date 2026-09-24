# API v(dev) Quest

## Desenvolvimento local

Pré-requisitos: Java 21, Bun e Docker.

Na raiz do repositório, suba somente as dependências:

```bash
docker compose up -d
```

Depois, inicie a API fora do Docker:

```bash
cd apps/backend
./gradlew bootRun
```

A API estará em `http://localhost:8080`; a documentação OpenAPI fica em `http://localhost:8080/swagger-ui/index.html`.

Em outro terminal, inicie o frontend:

```bash
cd apps/frontend
bun install
bun run dev
```

O Vite abre em `http://localhost:5173` e encaminha `/api` para o `bootRun` local. O login SSO usa o Keycloak em `http://localhost:8180`. O backend **não** é iniciado pelo Compose.

No ambiente local importado pelo Compose, `admin@vdev.local` é gestor. As contas abaixo são colaboradores para testar perfis, missões, envios de evidências e ranking:

| Conta | Nome |
| --- | --- |
| `colaborador@vdev.local` | Aventureiro Local |
| `ana.silva@vdev.local` | Ana Silva |
| `bruno.lima@vdev.local` | Bruno Lima |
| `carla.souza@vdev.local` | Carla Souza |
| `diego.rocha@vdev.local` | Diego Rocha |
| `elisa.costa@vdev.local` | Elisa Costa |

Todas as contas locais, incluindo o gestor, usam a senha de desenvolvimento `vdev-local`. Elas são definidas em `infrastructure/keycloak/vdev-quest-realm.json`. O backend cria o perfil de colaborador no PostgreSQL no primeiro acesso; o papel é lido do banco, não do token do Keycloak.

Em uma hospedagem sem o proxy de desenvolvimento do Vite, configure `VITE_API_URL` para a base pública da API (por exemplo, `https://api.exemplo.com/api/v1`) e permita a origem do frontend em `CORS_ALLOWED_ORIGINS`.

## Testes

```bash
./gradlew test
```

Os testes de integração usam Testcontainers e precisam do socket Docker disponível.
