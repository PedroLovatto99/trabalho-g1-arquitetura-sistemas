# ---- BUILD ----
FROM node:20-alpine AS build
WORKDIR /usr/src/app
ENV CI=true

# Copia package.json e lock
COPY package*.json tsconfig*.json ./
RUN npm ci

# Copia tudo
COPY . .

# Gera Prisma Client (com path maiúsculo)
ENV PRISMA_SCHEMA_PATH=./src/Data/Db/Prisma/schema.prisma
RUN npx prisma generate --schema=$PRISMA_SCHEMA_PATH

# Compila TS -> JS
RUN npm run build

# ---- RUNTIME ----
FROM node:20-alpine AS runtime
WORKDIR /usr/src/app

ENV NODE_ENV=production \
    PORT=3000 \
    PRISMA_SCHEMA_PATH=./src/Data/Db/Prisma/schema.prisma

RUN apk add --no-cache tini

# Só dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copia artefatos buildados + schema
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/src/Data/Db/Prisma ./src/Data/Db/Prisma

EXPOSE 3000

ENTRYPOINT ["/sbin/tini","--"]
CMD ["sh","-c","npx prisma generate --schema=$PRISMA_SCHEMA_PATH && npx prisma migrate deploy --schema=$PRISMA_SCHEMA_PATH && npm start"]
