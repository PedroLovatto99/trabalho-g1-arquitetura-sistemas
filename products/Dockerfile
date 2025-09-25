FROM node:18-alpine AS build

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala TODAS as dependências, incluindo as de desenvolvimento para compilar o projeto
RUN npm install

# Copia o restante do código-fonte do projeto
COPY . .

# Gera o cliente Prisma (essencial antes da compilação)
RUN npx prisma generate

# Compila o código TypeScript para JavaScript.
# Este comando assume que você tem um script "build" no seu package.json (ex: "build": "tsc")
RUN npm run build

# ---- 2. Production Stage ----
# Começamos uma nova imagem limpa para a versão final
FROM node:18-alpine

WORKDIR /usr/src/app

# Copia os arquivos de dependência novamente
COPY package*.json ./

# Instala APENAS as dependências de produção
RUN npm ci --only=production

# Copia o código JavaScript compilado da etapa de 'build'
# Isso assume que seu tsconfig.json gera os arquivos em uma pasta "dist"
COPY --from=build /usr/src/app/dist ./dist

# Copia o schema.prisma, que é necessário em tempo de execução pelo Prisma
COPY --from=build /usr/src/app/src/Data/Db/Prisma/schema.prisma ./src/Data/Db/Prisma/schema.prisma

# Expõe a porta em que a aplicação vai rodar
EXPOSE 3000

# O comando para iniciar a aplicação
# O caminho exato pode variar dependendo da sua configuração no tsconfig.json
CMD [ "node", "dist/src/index.js" ]