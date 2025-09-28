# ---- BUILD ----
FROM node:20-alpine AS build
WORKDIR /usr/src/app

# --- ADICIONADO ---
# Instala OpenSSL, necessário para o Prisma Client
RUN apk update && apk add --no-cache openssl

ENV CI=true

# Copia package.json e lock
COPY package*.json tsconfig*.json ./
RUN npm ci

# Copia o schema antes do resto do código para otimizar o cache
COPY src/Data/Db/Prisma/schema.prisma ./src/Data/Db/Prisma/schema.prisma

# Gera Prisma Client (com path maiúsculo)
ENV PRISMA_SCHEMA_PATH=./src/Data/Db/Prisma/schema.prisma
RUN npx prisma generate --schema=$PRISMA_SCHEMA_PATH

# Copia o resto do código
COPY . .

# Compila TS -> JS
RUN npm run build

# ---- RUNTIME ----
FROM node:20-alpine AS runtime
WORKDIR /usr/src/app

ENV NODE_ENV=production \
    PORT=3000 \
    PRISMA_SCHEMA_PATH=./src/Data/Db/Prisma/schema.prisma

# --- AJUSTADO ---
# Instala OpenSSL para a execução e tini para gerenciar o processo
RUN apk update && apk add --no-cache openssl tini

# Só dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copia artefatos buildados + schema
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/src/Data/Db/Prisma ./src/Data/Db/Prisma

EXPOSE 3000

ENTRYPOINT ["/sbin/tini","--"]
CMD ["sh","-c","npx prisma generate --schema=$PRISMA_SCHEMA_PATH && npx prisma migrate deploy --schema=$PRISMA_SCHEMA_PATH && npm start"]

