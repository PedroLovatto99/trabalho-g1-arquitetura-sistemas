import { Request, Response, Router } from 'express';

const router = Router();

export const getProducts = (req: Request, res: Response) => {
    try {
        res.status(200).json({
        message: "Produtos listados com sucesso",
        });

    } catch (error) {
        res.status(404).json({ message: "Não há produtos no estoque" });
    }
}

export const postProducts = (req: Request, res: Response) => {
    try {
         res.status(201).json({
            message: "Produto criado com sucesso"
         })

    } catch (error) {
        res.status(400).json({
            message: "Erro por parte do cliente"
        })

        res.status(500).json({
            message: "Erro por parte do servidor"
        })
    } 
}

export const patchProduct = (req: Request, res: Response) => {
    try {
         res.status(201).json({
            message: "Produto alterado com sucesso"
         })

    } catch (error) {
        res.status(400).json({
            message: "Erro por parte do cliente"
        })

        res.status(404).json({
            message: "Produto não encontrado"
        })


        res.status(500).json({
            message: "Erro por parte do servidor"
        })
    } 
}  

export const deleteProduct = (req: Request, res: Response) => {
    try {
         res.status(201).json({
            message: "Produto deletado com sucesso"
         })

    }  catch (error) {
        res.status(400).json({
            message: "Erro por parte do cliente"
        })

        res.status(500).json({
            message: "Erro por parte do servidor"
        })
    } 
}  


router.get('/products', getProducts);
router.post("/products", postProducts);
router.patch(`/products/:id`, patchProduct);
router.delete(`/products/:id`, deleteProduct);

export default router

