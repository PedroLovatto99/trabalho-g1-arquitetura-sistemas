# ---- 1. Build Stage ----
FROM node:18-alpine AS build

WORKDIR /usr/src/app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala TODAS as dependências para compilar o projeto
RUN npm install

# Copia o restante do código-fonte
COPY . .

# Compila o código TypeScript para JavaScript
# Garanta que você tenha um script "build": "tsc" no seu package.json
RUN npm run build

# ---- 2. Production Stage ----
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Instala APENAS as dependências de produção
RUN npm ci --only=production

# Copia o código JavaScript compilado da etapa de 'build'
COPY --from=build /usr/src/app/dist ./dist

# Expõe a porta da aplicação
EXPOSE 3000

# Comando para iniciar a aplicação
CMD [ "node", "dist/src/index.js" ]