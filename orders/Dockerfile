# ---- 1. Build Stage ----
FROM node:18-alpine3.18 AS build

WORKDIR /orders/src/app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala TODAS as dependências para compilar o projeto
RUN npm install

# Copia o restante do código-fonte
COPY . .

# Gera o cliente Prisma (essencial para MongoDB também)
RUN npx prisma generate

# Compila o código TypeScript para JavaScript
# Garanta que você tenha um script "build": "tsc" no seu package.json
RUN npm run build

# ---- 2. Production Stage ----
FROM node:18-alpine3.18

WORKDIR /orders/src/app

RUN apk update && apk add openssl1.1-compat

COPY package*.json ./

# Instala APENAS as dependências de produção
RUN npm ci --only=production

COPY --from=build /orders/src/app/node_modules/.prisma/client ./node_modules/.prisma/client

# Copia o código JavaScript compilado da etapa de 'build'
COPY --from=build /orders/src/app/dist ./dist

# Copia o schema.prisma, que é necessário em tempo de execução pelo Prisma
COPY --from=build /orders/src/app/src/Data/Db/Prisma/schema.prisma ./src/Data/Db/Prisma/schema.prisma

# Expõe a porta da aplicação
EXPOSE 3000

# Comando para iniciar a aplicação
CMD [ "npm", "start" ]