# ---- 1) BUILD ----
FROM node:20-alpine AS build
WORKDIR /payments/src/app

# --- ADICIONADO ---
# Instala OpenSSL, necessário para o Prisma Client
RUN apk update && apk add --no-cache openssl

# Evita prompts interativos em CI
ENV CI=true

# 1) Copia mínimos para cache eficiente
COPY package*.json tsconfig*.json ./
# 2) Copia o schema já agora para gerar o Client usado no build TS
COPY src/Data/Db/prisma/schema.prisma ./src/Data/Db/prisma/schema.prisma

# Instala TODAS as dependências (inclui dev) para compilar
RUN npm ci

# Gera Prisma Client (tipos para o build)
RUN npx prisma generate --schema=./src/Data/Db/prisma/schema.prisma

# Copia o restante do código
COPY . .

# Compila TS -> JS
RUN npm run build

# ---- 2) RUNTIME ----
FROM node:20-alpine AS runtime
WORKDIR /payments/src/app

# Variáveis padrão (ajuste conforme necessário)
ENV NODE_ENV=production \
    PORT=3000 \
    PRISMA_SCHEMA_PATH=./src/Data/Db/prisma/schema.prisma

# --- AJUSTADO ---
# Instala OpenSSL para a execução e tini para gerenciar o processo
RUN apk update && apk add --no-cache openssl tini

# Apenas dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Artefatos do build + schema
COPY --from=build /payments/src/app/dist ./dist
COPY --from=build /payments/src/app/src/Data/Db/prisma ./src/Data/Db/prisma

# Porta da aplicação
EXPOSE 3000

# Sem entrypoint.sh: roda generate + migrate deploy e sobe a app
ENTRYPOINT ["/sbin/tini","--"]
CMD ["sh","-c","npx prisma generate --schema=$PRISMA_SCHEMA_PATH && npx prisma migrate deploy --schema=$PRISMA_SCHEMA_PATH && npm start"]

