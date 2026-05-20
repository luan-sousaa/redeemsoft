import {Request, Response} from 'express';
import { db } from '../db/db.js';
import {usuario} from '../db/schema.js';
import { eq } from 'drizzle-orm';

interface Usuario{
    idUsuario: number;
    nome: string;
    email: string;
    senha: string;
    type: "client" | "developer";
    cidade?: string;
    estado?: string;
}

export const encontrarUsuario = async (req: Request, res: Response) =>{

    try{

        const listaUsuarios = await db.select().from(usuario);
        res.json(listaUsuarios);
    }catch(error){
        res.status(500).json({mensagem: "Erro ao encontrar usuários. Contate o administrador."})
    }
    
};

export const criarUsuario = async (req: Request, res: Response) => {

    const {nome} = req.body;
    const {email} = req.body;
    const {senha} = req.body;
    const {cidade} = req.body;
    const {estado} = req.body;

    try{
    const [novoUsuario] = await db.insert(usuario).values({nome, email, senha, type: "client", cidade, estado})
    .returning();
   
    res.status(201).json(novoUsuario);
}catch(error){
    res.status(500).json({mensagem: "Erro ao criar usuário. Contate o administrador.", error});
}
}

export const atualizarUsuario = async (req: Request, res: Response)=> {

    const {id} = req.params;
    
    const {nome} = req.body;
    const {email} = req.body;
    const {senha} = req.body;
    const {cidade} = req.body;
    const {estado} = req.body;

    try{

        const usuarioAtualizado = await db.update(usuario).set({nome, email, senha, cidade, estado}).where(eq(usuario.idUsuario, Number(id)))
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

    const {id} = req.params;

    try{
        const usuarioExcluido = await db.delete(usuario).where(eq(usuario.idUsuario, Number(id)))
        .returning();

        if(usuarioExcluido.length === 0){

            return res.status(404).json({mensagem: "Usuário inexistente."});
        }
        
        res.status(200).json({mensagem: "Usuário excluído com sucesso!"});
    }catch(error){
        res.status(500).json({mensagem: "Erro ao deletar usuário. Contate o administrador."})
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