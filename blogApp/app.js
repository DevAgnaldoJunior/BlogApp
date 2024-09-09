    const express = require('express');
    const handlebars = require('express-handlebars');
    const bodyParser = require('body-parser');
    const app = express();
    const admin = require("./routes/admin");
    const path = require("path");
    const mongoose = require('mongoose');
    const session = require("express-session") ;
    const flash = require ("connect-flash"); //Tipo de sessão que so aparece uma vez (quando recarrega a pagina ela some)
    require ("./models/Postagem")
    const Postagem = mongoose.model("postagens")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require("./routes/usuario")
    const passport = require("passport")
    require ("./config/auth") (passport)


// Configurações
    // Session
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())


        app.use(flash())

    //Middleware
        app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg')[0];  //esse objeto "locals" serve para criar variávies globais, o proximo parametro pode ser qualquer nome
        res.locals.error_msg = req.flash("error_msg")[0] ;
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null;
        next();
        })

    // Body Parser
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

    // Handlebars
        app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }));
        app.set('view engine', 'handlebars');

    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/blogapp2").then(() => {
            console.log("Conectado ao mongo");
        }).catch((erro) => {
            console.log("Erro ao se conectar: " + erro);
        });

    // Public
        app.use(express.static(path.join(__dirname, "public")));
    // Rotas
    app.get("/", (req,res) =>{
        Postagem.find().populate("categoria").sort({data: "desc"}).lean().then((postagens, usuarios) => {
            res.render("index", {postagens: postagens, usuarios: usuarios})
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
       
    })

    app.get('/postagem/:slug', (req,res) => {
        const slug = req.params.slug
        Postagem.findOne({slug})
            .then(postagem => {
                if(postagem){
                    const post = {
                        titulo: postagem.titulo,
                        data: postagem.data,
                        conteudo: postagem.conteudo
                    }
                    res.render('postagem/index', post)
                }else{
                    req.flash("error_msg", "Essa postagem nao existe")
                    res.redirect("/")
                }
            })
            .catch(err => {
                req.flash("error_msg", "Houve um erro interno")
                res.redirect("/")
            })
    })

    app.get("/404", (req,res)=>{
        res.send('Erro 404')
    })

    app.get("/categorias", (req,res)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render("categorias/index", {categorias: categorias})

        }).catch(err => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    app.get("/categorias/:slug", (req,res) =>{
        Categoria.findOne({slug: req.params.slug}).then((categoria) =>{
            if(categoria){
                //Pesquisar os posts que pertencem as categorias passadas pelo slug
                Postagem.find({categoria: categoria._id}).then((postagens)=> {

                    res.render('categorias/postagens', {postagens: postagens.map(Categoria=> Categoria.toJSON())})


                }).catch(err => {
                    req.flash("error_msg", "Houve um erro ao listar os posts")
                    res.redirect("/")
            })
            }else{
                req.flash("error_msg", "Esta catgoria não existe")
                res.redirect("/")
            }
        }).catch(err => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })










        app.use("/admin", admin);
        app.use("/usuarios", usuarios)

    // Outros
        const PORT = 8081;
        app.listen(PORT, function () {
            console.log("Servidor rodando!");
        });
