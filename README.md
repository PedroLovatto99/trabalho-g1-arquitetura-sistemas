# Para iniciar o projeto:

### Clone o repositório
```bash
git clone https://github.com/PedroLovatto99/trabalho-g1-arquitetura-sistemas.git
```

### Rode o docker-compose para iniciar a aplicação com dados prontos com a seed
```bash
docker-compose up
```
### ⚠️ NÃO UTILIZE O -d

----------------

# Alguns pontos:

## Obs: Os IDs de users, products, orders e payments para endpoints que precisam do ID eu estou usando o id que foi determinado nas seed.

## Obs²: Todos os comandos foram testados no Git bash, pelo o que eu pesquisei, no Windows a sintaxe muda em alguns comandos de curl, então no terminal do Windows não vai funcionar.

## Obs³: Para testar se a cache funcionou, é necessário rodar o(s) comando(s) 
- docker-compose logs payment-service
- docker-compose logs order-service
- docker-compose logs product-service
- docker-compose logs user-service
- Mensagem de quando o resultado não é pego na cache: **[Cache] MISS:** <resto da mensagem>  
- Mensagem de quando o valor na cache foi consultado: **[Cache] HIT:** <resto da mensagem>

## Obs⁴: Para verificar a mensagem de sucesso do Kakfa, após rodar o comando de criar um pedido/order, cheque o terminal que o comando docker-compose up foi rodado, se foi utilizado o -d junto para continuar usando o terminal, a mensagem não irá aparecer.

----------

# Comandos Curl

# Users

### Listar todos os usuários

```bash
curl -i http://localhost:8000/api/clients
```

### Criar um novo usuário

```bash
curl -i -X POST http://localhost:8000/api/clients \
-H "Content-Type: application/json" \
-d '{
    "name": "user teste",
    "email": "userteste@example.com"
}'
```

### Buscar um usuário por ID

```bash
curl -i http://localhost:8000/api/clients/a7846e57-c5c7-4741-bb67-32e70a617309
```

### Atualizar a informação de um usuário

```bash
curl -i -X PUT http://localhost:8000/api/users/a7846e57-c5c7-4741-bb67-32e70a617309 \
-H "Content-Type: application/json" \
-d '{
    "name": "novonome",
    "email": "novoemail@example.com"
}'
```

### Deletar um usuário
### obs: é melhor deixar o comando DELETE por último, senão na hora de criar o order o user com esse ID não vai existir

```bash
curl -i -X DELETE http://localhost:8000/api/clients/25792b49-52ba-47ec-9a8d-c7c5fdb7a200
```


# Produtos


### Listar todos os produtos

```bash
curl -i http://localhost:8000/api/products

```

### Criar um produto

```bash
curl -i -X POST http://localhost:8000/api/products/ \
-H "Content-Type: application/json" \
-d '{
    "name": "mouse",
    "price": 79.99,
    "stock": 11111200
}'
```

### Buscar um produto por ID

```bash

curl -i http://localhost:8000/api/products/88e1a0ce-c7ab-44ef-aab3-94761167770d
```

### Ajustar estoque de um produto

```bash
curl -i -X PATCH http://localhost:8000/api/products/88e1a0ce-c7ab-44ef-aab3-94761167770d/stock \
-H "Content-Type: application/json" \
-d '{
    "quantity": -5
}'
```

### Atualizar informação de um produto

```bash
curl -i -X PUT http://localhost:8000/api/products/88e1a0ce-c7ab-44ef-aab3-94761167770d \
-H "Content-Type: application/json" \
-d '{
    "name": "Controle PS5",
    "price": 199.99,
    "stock": 12300
}'
```

### Deletar um produto
### obs: é melhor deixar o comando DELETE por último, senão na hora de criar o order o produto com esse ID não vai existir

```bash
curl -i -X DELETE http://localhost:8000/api/products/88e1a0ce-c7ab-44ef-aab3-94761167770d
```


# Orders

### Criar um pedido

```bash

curl -i -X POST http://localhost:8000/api/orders \
-H "Content-Type: application/json" \
-d '{
    "clientId": "25792b49-52ba-47ec-9a8d-c7c5fdb7a200",
    "products": [
      { 
        "productId": "88e1a0ce-c7ab-44ef-aab3-94761167770d", "quantity": 1 
       }
    ],
    "typePaymentIds": ["2"]
}'
```


### Listar todos os pedidos

```bash
curl -i http://localhost:8000/api/orders

```

### Listar os pedidos de um cliente específico

```bash
curl -i http://localhost:8000/api/orders?clientId=25792b49-52ba-47ec-9a8d-c7c5fdb7a200
```

### Buscar um pedido por ID

```bash
curl -i http://localhost:8000/api/orders/6920a5c7e79d84019ecc3470
```

### Atualizar status de um pedido

```bash
curl -i -X PATCH http://localhost:8000/api/orders/6920a5c7e79d84019ecc3470/status \
-H "Content-Type: application/json" \
-d '{
    "status": "SHIPPED"
}'
```


# Payments


### Listar todos os payments

```bash
curl -i http://localhost:8000/api/payments
```

### Listar tipos de pagamento

```bash
curl -i http://localhost:8000/api/payments/types
```

### Processar um pagamento
### obs: apesar de ser uma requisição POST, não precisa passar nada como body
### obs²: aqui é necessário pegar o id do payment que retorna do primeiro GET, pois por conta da seed o payment ID muda quando o docker-compose é iniciado
```bash
curl -i -X POST http://localhost:8000/api/payments/process/<PAYMENT_ID>
```

### Visualizar um pagamento específico
### obs: aqui é necessário pegar o id do payment que retorna do primeiro GET, pois por conta da seed o payment ID muda quando o docker-compose é iniciado
```bash
curl -i http://localhost:8000/api/payments/<PAYMENT_ID>
```