# Report System

Sistema de geração de relatórios e CADOCs

## Tecnologias

- **Node.js** + **TypeScript**
- **Fastify** - Framework web
- **MongoDB** + **Mongoose** - Banco de dados
- **MinIO** - Object storage

## Arquitetura

```
[processor] -> [reports] -> [orgão]


> processor: serviço responsavel por toda a logica dos cados e relatorios (Mock usando o seed)
- o processor é responsavel por pre-processar os dados e salvar os dados no banco em estrutura proximo ao report

> reports: serviço responsavel por processar os dados, gerar os relatorios e comunicar com orgãos (Sefaz, Bacen)
```

## Estrutura do Projeto

```
src/
├── api/                   # Controllers e rotas HTTP
├── database/              # Conexão e schemas MongoDB
├── providers/             # Lógica de geração de relatórios
├── reports/               # Agregações e processadores
├── storage/               # Cliente MinIO
└── types/                 # Definições TypeScript
```

## Pré-requisitos

- Docker e Docker Compose
- Node.js 20+ (para desenvolvimento local)

## Configuração

### Variáveis de Ambiente

O projeto usa as seguintes variáveis de ambiente (já configuradas no `docker-compose.yml`):

```env
# MongoDB
MONGO_URI=mongodb://admin:admin123@mongodb:27017/reports?authSource=admin

# MinIO
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=reports
```

## Executando com Docker

### 1. Iniciar os serviços

```bash
docker compose up --build
```

Isso iniciará:

- **MongoDB** na porta `27017`
- **MinIO** nas portas `9000` (API) e `9001` (Console)
- **App** na porta `3000`

### 2. Popular o banco de dados

```bash
docker compose exec app npm run seed
```

Isso gerará dados de teste para os últimos 6 meses.

### 3. Gerar reports

```bash
curl -X POST http://localhost:3000/reports \
  -H "Content-Type: application/json" \
  -d '{"reports": ["3040"]}'
```

> isso gerará o cadoc 3040.

> idealmente seria uma mensagem assincrona, mas por questões de testes, esta como API

### 3. Acessar os serviços

- **API**: http://localhost:3000
- **MinIO Console**: http://localhost:9001
  - Usuário: `minioadmin`
  - Senha: `minioadmin`

## Executando Localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar ambiente

Crie um arquivo `.env` com as variáveis necessárias (use `localhost` para MongoDB e MinIO).

### 3. Compilar TypeScript

```bash
npm run build
```

### 4. Executar seed

```bash
npm run seed
```

### 5. Iniciar servidor

```bash
npm start
```

Ou em modo de desenvolvimento:

```bash
npm run dev
```

## API Endpoints

### GET /

Verifica o status do serviço.

**Resposta:**

```json
{
  "status": "ok",
  "service": "Report System",
  "version": "1.0.0"
}
```

### POST /reports

Gera relatórios em formato XML e armazena no MinIO.

**Request:**

```json
{
  "reports": ["3040"]
}
```

**Resposta:**

```json
{
  "success": true,
  "results": [
    {
      "reportType": "3040",
      "status": "success",
      "fileUrl": "https://minio:9000/reports/CADOC3040_20260112.zip",
      "documentsProcessed": 30
    }
  ]
}
```

## Estrutura de Dados

### CADOC 3040

Documento que contém informações sobre operações de crédito:

- **DtBase**: Data base no formato `YYYYMMDD`
- **CNPJ**: CNPJ da instituição financeira
- **Cli**: Array de clientes com suas operações
- **Agreg**: Dados agregados por modalidade

Ver [src/types/cadoc3040.ts](src/types/cadoc3040.ts) para a estrutura completa.

## Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento (nodemon)
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Executa o servidor compilado
- `npm run seed` - Popula o banco com dados de teste
- `npm run lint` - Executa o linter

## Desenvolvimento

### Adicionar novo tipo de relatório

1. Criar schema em `src/database/schema/`
2. Criar agregações em `src/reports/aggregations/`
3. Criar provider em `src/providers/`
4. Adicionar rota em `src/api/routes/reports.routes.ts`

## Parar os Serviços

```bash
docker compose down
```

Para remover volumes (dados persistidos):

```bash
docker compose down -v
```
