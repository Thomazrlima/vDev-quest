# API v(dev) Quest

## Desenvolvimento local

Pré-requisitos: Java 21 e Docker.

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

## Testes

```bash
./gradlew test
```

Os testes de integração usam Testcontainers e precisam do socket Docker disponível.
