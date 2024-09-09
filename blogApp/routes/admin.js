
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin") //pega apenas a função eAdmin dessa rota






router.get('/', eAdmin, (req, res) => {
    res.render("/admin/index");
});

router.get('/posts', eAdmin, (req, res) => {
    res.send("Página de posts");
});

router.get("/categorias", eAdmin, (req, res) => {
    Categoria.find().sort({date: 1 }).lean().then((categorias) => { //(find) para listar todos, (sort)para listar em ordem decrescente
        res.render("admin/categorias", {categorias:categorias});

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
});

router.get("/categorias/add", eAdmin, (req, res) => {
    res.render("admin/addcategorias");
});

router.post('/categorias/nova', eAdmin, async (req, res) => {
     // Validação dos dados
     const erros = [];
     if (!req.body.nome || !req.body.slug) {
         erros.push("Nome e Slug são obrigatórios");
     }
     
     if (req.body.nome.length <= 2) {
         erros.push("Nome da categoria é muito pequeno");
     }

     if (erros.length > 0) {
         // Envia um JSON com erros
         return res.status(400).json({ erros: erros });
     }
    try {
       

        // Criação da nova categoria
        const novaCategoria = new Categoria({
            nome: req.body.nome,
            slug: req.body.slug
        });

        // Salvar a nova categoria
        await novaCategoria.save();

        // Redirecionar para a página de categorias
        return res.status(200).json({ success_msg: "Categoria criada com sucesso" });
        
    } catch (err) {
        // Enviar erro como JSON
        return res.status(500).json({ error: err.message });
    }
});

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
        Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
            res.render("admin/editcategorias", {categoria: categoria})
        }).catch((err) => {
            req.flash("error_msg", "Esta categoria não existe")
            res.redirect("/admin/categorias")
        })
})

router.post("/categorias/edit", eAdmin, (req,res) => {
         Categoria.findOne({_id: req.body.id}).then((categoria) => {

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
           
        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso!")
            res.redirect("/admin/categorias")
            
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria")
            res.redirect("/admin/categorias")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/deletar",eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
})


router.get("/postagens", eAdmin,(req, res) => {
    Postagem.find().lean().populate("categoria").sort({data:"desc"}).then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
    
})

router.get("/postagens/add", eAdmin, (req,res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((erre) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect("/admin")
    })
    
})

router.post("/postagens/nova", eAdmin, (req,res) =>{
    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto:"Categoria inválida, registre uma categoria"})
        
    }

    if(erros.length > 0){
        res.render("admin/addpostagem", {erros:erros})

    }else{
        
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug : req.body.slug,
        }
        new Postagem(novaPostagem).save().then(() => {
            erros.push({texto: "Postagem criada com sucesso!"})
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro durante a criação da postagem")
            res.redirect("/admin/postagens")
        })
    }
})


router.get("/postagens/edit/:id", eAdmin, (req, res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            console.log("erro1")
            res.redirect("/admin/postagens")
    })
    }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar o formulario de edição")
            console.log("erro2")
            res.redirect("/admin/postagens")
    })
})


router.post("/postagem/edit", eAdmin, (req,res) =>{
    Postagem.findOne({_id: req.body.id}).then((postagem)=> {
        postagem.titulo = req.body.titulo,
        postagem.slug = req.body.slug,
        postagem.descricao = req.body.descricao,
        postagem.conteudo = req.body.conteudo,
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash("success_msg", "Postagem editada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg", "erro interno")
            res.redirect("/admin/postagens")
            
        })
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens")
        
    })
})

router.get("/postagens/deletar/:id", eAdmin, (req,res)=>{
    Postagem.deleteOne({_id: req.params.id}).then(()=>{
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/admin/postagens")
    })
})







module.exports = router;
