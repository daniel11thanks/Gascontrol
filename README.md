# GasControl Frontend

Aplicação Next.js (App Router) para registrar e consultar relatórios de consumo, integrada ao backend GasControl. Inclui testes E2E com Playwright e unitários com Vitest. [attached_file:1]

## Requisitos

- Node 18+ e npm. [attached_file:1]
- Docker e Docker Compose instalados. [attached_file:1]
- Backend GasControl rodando em http://127.0.0.1:8000 (ou conforme configuração local). [attached_file:1]

## Backend: Docker Compose

1. Clonar o repositório do backend GasControl. [attached_file:1]
2. Criar o arquivo .env com variáveis necessárias (DB, credenciais, porta da API, auth BASIC/JWT). [attached_file:1]
3. Subir serviços:
   docker compose up -d
4. Migrações e usuário admin:
   docker compose exec api python manage.py migrate
   docker compose exec api python manage.py createsuperuser
5. Verificações:
   docker compose ps
   docker compose logs -f api
6. Endpoints (descoberta):
   - Verifique a documentação do backend (Swagger/DRF) e/ou arquivos urls.py, views.py, serializers.py. Exemplos:
     - http://127.0.0.1:8000/api/relatorios/
     - http://127.0.0.1:8000/admin/
     - http://127.0.0.1:8000/api/doc ou /api/schema (se configurado) [attached_file:1]

Observações:

- Ver “Django instalado com sucesso” na raiz http://127.0.0.1:8000 é esperado quando a API está sob /api/. [attached_file:1]
- Ajuste a variável do frontend se a API estiver em outra porta/base path. [attached_file:1]

## Configuração do frontend

1. Variáveis de ambiente (.env.local):
   VITE_API_BASE_URL=http://127.0.0.1:8000
   [attached_file:1]
2. App Router (Next 15):
   - Em Server Components, usar searchParams como Promise e fazer await antes de acessar propriedades. [attached_file:1]

## Scripts

- Desenvolvimento:
  npm run dev
  [attached_file:1]
- Build:
  npm run build
  [attached_file:1]
- Testes E2E (Playwright):
  npm run e2e
  [attached_file:1]
- Testes unitários (Vitest):
  npm run test # watch
  npm run test:run # CI
  [attached_file:1]

Nota:

- O Playwright sobe o servidor do Next automaticamente via webServer no config; não precisa rodar dev separadamente para E2E. [attached_file:1]

## Testes E2E (Playwright)

Fluxo:

- Login com usuário de teste. [attached_file:1]
- Página “Relatórios”.
- Criar relatório:
  - Tipo: TORRE
  - Referência ID: 10
  - Data início: 2025-08-10
  - Data fim: 2025-09-10
  - Total consumo: 300
- Alert de sucesso: aguardar “dialog”, validar mensagem e aceitar. [attached_file:1]
- Exportar CSV: aguardar download e verificar nome. [attached_file:1]

Execução inicial:

- npm install -D @playwright/test
- npx playwright install
- npm run e2e
  [attached_file:1]

Estrutura:

- tests/e2e/registro-leitura.spec.ts [attached_file:1]

Detalhes:

- Seletores com data-testid no form/campos para evitar colisões com filtros. [attached_file:1]
- Se houver redirect após o alert, o teste aguarda “/relatorios” ou um heading estável. [attached_file:1]

## Testes unitários (Vitest)

Pasta:

- tests/unit (separada de tests/e2e). [attached_file:1]

Stack:

- Vitest + jsdom + vite-tsconfig-paths (aliases do tsconfig). [attached_file:1]

Incluídos:

- tests/unit/validate-relatorio.spec.ts
  - Regras: tipo obrigatório, datas obrigatórias, “início não pode ser maior que fim”. [attached_file:1]
- tests/unit/format.spec.ts
  - formatPeriodo: “dd/mm/yyyy - dd/mm/yyyy”.
  - toDecimal: “12,50” → 12.5; inválidos → 0. [attached_file:1]

Execução:

- npm run test
- npm run test:run
  [attached_file:1]

## Usuário de teste e dados

- Login: Daniel
- Senha: 123mudar [attached_file:1]

População de dados:

- Via admin do backend (após createsuperuser), ou
- Via endpoints documentados (Swagger/DRF), conforme payloads de criação. [attached_file:1]

## Troubleshooting

- Só aparece “Django instalado com sucesso”:
  - Use /api/... para endpoints, /admin/ para painel e docs da API se disponíveis. [attached_file:1]
- Alert não clicável no E2E:
  - Registre page.waitForEvent("dialog") antes do submit, valide e chame dialog.accept(). [attached_file:1]
- “Strict mode violation” em locators:
  - Escopar seletores pelo form e usar data-testid. [attached_file:1]
- allowedDevOrigins (aviso Next em dev):
  - Apenas informativo; pode ser configurado futuramente. [attached_file:1]
- Vitest pegando specs do Playwright:
  - Mantenha unit em tests/unit e e2e em tests/e2e; ajuste include/exclude no Vitest. [attached_file:1]
