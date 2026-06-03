import {Request, Response} from 'express';
import { db } from '../db/db';
import {usuario, cliente, desenvolvedor} from '../db/schema';
import { eq } from 'drizzle-orm';

interface Usuario{
    idUsuario: number;
    nome: string;
    email: string;
    senha: string;
    type: "client" | "developer";
    cidade?: string;
    estado?: string;
    cpfCnpj?: string;
}

export const encontrarUsuario = async (req: Request, res: Response) => {
    try {

        const listaUsuarios = await db.select().from(usuario); 
        
        return res.status(200).json(listaUsuarios);
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro ao listar usuários.", error });
    }
};
export const criarUsuario = async (req: Request, res: Response) => {

    const {nome} = req.body;
    const {email} = req.body;
    const {senha} = req.body;
    const {type} = req.body;
    const {cidade} = req.body;
    const {estado} = req.body;
    const {cpfCnpj} = req.body;

    try{
    const [novoUsuario] = await db.insert(usuario).values({nome, email, senha, type, cidade, estado, cpfCnpj})
    .returning();

   if (!novoUsuario) {
    return res.status(400).json({ mensagem: "Falha ao registrar usuário no banco de dados." });
}
    if (type === "client") {

        await db.insert(cliente).values({
                idUsuario: novoUsuario.idUsuario,
           
            });
        } else if (type === "developer") {

            await db.insert(desenvolvedor).values({
                idUsuario: novoUsuario.idUsuario,
               
            });
        }
        res.status(201).json(novoUsuario);
} catch (error) {
        // AGORA SIM! O erro vai aparecer no terminal do seu backend:
        console.error("🚨 ERRO DETALHADO AO CRIAR USUÁRIO:", error); 
        return res.status(500).json({ mensagem: "Erro ao criar usuário.", erroReal: String(error) });
    }
}
export const atualizarUsuario = async (req: Request, res: Response)=> {

    const {id} = req.params;
    
    const {nome} = req.body;
    const {email} = req.body;
    const {senha} = req.body;
    const {cidade} = req.body;
    const {estado} = req.body;
    const {cpfCnpj} = req.body;

    try{

        const usuarioAtualizado = await db.update(usuario).set({nome, email, senha, cidade, estado, cpfCnpj}).where(eq(usuario.idUsuario, Number(id)))
        .returning();

        if (usuarioAtualizado.length === 0){
        return res.status(404).json({mensagem:"Usuário inexistente. Não foi possível atualizar."})
        } 
        return res.status(200).json(usuarioAtualizado[0]);
        } catch(error){
            res.status(500).json({mensagem: "Erro ao atualizar usuário. Contate o administrador.", error})
    }
}
export const deletarUsuario = async (req: Request, res: Response) => {

const id = parseInt(req.params.id as string);  4

try{

        await db.delete(cliente).where(eq(cliente.idUsuario, id));
        await db.delete(desenvolvedor).where(eq(desenvolvedor.idUsuario, id));    
        const resultado = await db.delete(usuario).where(eq(usuario.idUsuario, id)).returning();


        if (resultado.length === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado." });
        }

        return res.status(200).json({ mensagem: "Usuário deletado com sucesso!" });

    } catch (error) {
        console.error(error); 
        return res.status(500).json({ mensagem: "Erro ao deletar usuário. Contate o administrador.", error });
    }
}
export const fazerLogin = async (req: Request, res: Response) => {

   const { email, senha } = req.body;

    try {
        const [userEncontrado] = await db.select().from(usuario).where(eq(usuario.email, email));

        if (!userEncontrado) {
            return res.status(404).json({ mensagem: "Usuário não encontrado." });
        }

        if (userEncontrado.senha !== senha) {
            return res.status(401).json({ mensagem: "Senha incorreta." });
        }
        return res.status(200).json({ 
            mensagem: "Login realizado com sucesso!",
            user: userEncontrado 
        });

    } catch (error) {
        return res.status(500).json({ mensagem: "Erro ao realizar login. Contate o administrador.", error });
    }
};