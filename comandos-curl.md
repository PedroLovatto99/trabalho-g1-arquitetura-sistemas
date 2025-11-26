## Obs: professor, os IDs de users, products, orders e payments para endpoints que precisam do ID eu estou usando o id que foi determinado nas seed


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
curl -i http://localhost:8000/api/clients/25792b49-52ba-47ec-9a8d-c7c5fdb7a200
```

### Atualizar a informação de um usuário

```bash
curl -i -X PUT http://localhost:8000/api/users/25792b49-52ba-47ec-9a8d-c7c5fdb7a200 \
-H "Content-Type: application/json" \
-d '{
    "name": "novonome",
    "email": "novoemail@example.com",
}'
```

### Deletar um usuário

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


### Listar tipos de pagamento

```bash
curl -i http://localhost:8000/api/payments/types
```

### Processar um pagamento
### obs: apesar de ser uma requisição POST, não precisa passar nada como body
```bash
curl -i -X POST http://localhost:8000/api/payments/process/44be453f-31d9-4d1e-b6a0-98bfe1a27d94
```

### Visualizar um pagamento específico

```bash
curl -i http://localhost:8000/api/payments/44be453f-31d9-4d1e-b6a0-98bfe1a27d94
```