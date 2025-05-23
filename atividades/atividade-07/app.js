const express = require('express');
const { engine } = require('express-handlebars');
const mysql = require('mysql2');
const argon2 = require('argon2');
var session = require('express-session')

var app = express();

//Configuração do express-handlebars
app.engine('handlebars',engine());
app.set('view engine','handlebars');
app.set('views','./views');

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(
    session({
        secret: "your-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 15778464000, // 6 meses
        },
    })
);

const conexao = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'aula'
});

conexao.connect(function(err) {
    if (err) throw err;
    console.log("Conectado no banco de dados!");
});

app.get('/', function(req,res) {
    console.log("Nome do usuário:", req.session.user)
    console.log("Nível de acesso do usuário:", req.session.nivel_de_acesso)
    if (req.session.user) {
        try {
            let sql = 'SELECT * FROM materiais WHERE soft_delete = 0';
            conexao.query(sql, (err, results) => {
                res.render('tela_principal', {
                    listagem: results,
                    loggedIn: true,
                    user: req.session.user,
                    nivel_de_acesso: req.session.nivel_de_acesso
                })
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Erro ao buscar dados do banco de dados");
        }
    } else {
        res.render('tela_principal', {loggedIn: false})
    }
});

app.get('/login', function(req,res) {
    if (req.session.user) {
        res.redirect("/")
    } else {
        res.render('formulario_login');
    }
});

app.get('/cadastro', function(req,res) {
    if (req.session.user) {
        res.redirect("/")
    } else {
        try {
            let sql = 'SELECT * FROM usuarios WHERE username = ?';
            conexao.query(sql, [req.session.user], (err, results) => {
                res.render('formulario', {listagem:results});
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Erro ao buscar dados do banco de dados");
        }
    }
});

app.get('/criarMaterial', function(req,res) {
    if (req.session.nivel_de_acesso == 1) {
        res.render('formulario_criacao');
    } else {
        res.redirect("/")
    }
});

app.get('/editarMaterial', function(req, res) {
    if (req.session.nivel_de_acesso == 1) {
        try {
            let sql = 'SELECT * FROM materiais WHERE id = ?';
            conexao.query(sql, [req.query.id], (err, results) => {
                res.render('formulario_editar', {listagem:results});
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Erro ao buscar dados do banco de dados");
        }

    } else {
        res.redirect("/");
    }
});

app.get('/logout', function(req, res) {
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
            return res.status(500).send('Erro ao fazer logout');
        }
        res.redirect('/');
    });
});

app.post('/cadastrar', async function(req, res) {
    try {
        const usernameExists = await new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM usuarios WHERE username = ?';
            conexao.query(sql, [req.body.username], (err, results) => {
                if (err) return reject(err);
                resolve(results.length > 0);
            });
        });

        const emailExists = await new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM usuarios WHERE email = ?';
            conexao.query(sql, [req.body.email], (err, results) => {
                if (err) return reject(err);
                resolve(results.length > 0);
            });
        });

        if (!usernameExists && !emailExists) {
            const insertSql = 'INSERT INTO usuarios (username, email, senha, nivel_de_acesso) VALUES (?, ?, ?, ?)';
            const user = [req.body.username, req.body.email, await argon2.hash(req.body.senha), req.body.nivel_de_acesso];

            const insertResult = await new Promise((resolve, reject) => {
                conexao.query(insertSql, user, (err, results) => {
                    if (err) return reject(err);
                    console.log('User added with ID:', results.insertId);
                    resolve(results);
                });
            });

            const newUser = await new Promise((resolve, reject) => {
                const sql = 'SELECT * FROM usuarios WHERE id = ?';
                conexao.query(sql, [insertResult.insertId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results[0]);
                });
            });

            req.session.user = newUser.username;
            req.session.nivel_de_acesso = newUser.nivel_de_acesso;

            res.redirect("/");
        } else {
            console.log("Usuário ou Email já existe");
        }

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/login', async function (req, res) {
    try {
      const sql = 'SELECT * FROM usuarios WHERE username = ?';
      conexao.query(sql, [req.body.username], async (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
          return res.status(401).send('Usuário não encontrado');
        }

        const user = results[0];
        console.log(user)

        const passwordValid = await argon2.verify(user.senha, req.body.senha);
        if (passwordValid) {
          req.session.user = user.username;
          req.session.nivel_de_acesso = user.nivel_de_acesso
          res.redirect('/');
        } else {
          res.status(401).send('Email ou Senha inválida');
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
});

app.post('/cadastroMaterial', function (req, res) {
    try {
        const insertSql = 'INSERT INTO materiais (nome_do_material, quantidade) VALUES (?, ?)';
        const user = [req.body.nome_material, req.body.qtd_material];

        conexao.query(insertSql, user, (err, results) => {
            if (err) throw (err);
            console.log('Material adicionado com o ID:', results.insertId)
            res.redirect('/');
        });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
});

app.post('/updateMaterial', function (req, res) {
    try {
        const insertSql = 'UPDATE materiais SET nome_do_material = ?, quantidade = ? WHERE id = ?';
        conexao.query(insertSql, [req.body.nome_material, req.body.qtd_material, req.body.id], (err, results) => {
            if (err) throw (err);
            console.log('Material editado com o ID:', results.affectedRows)
            res.redirect('/');
        });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
});

app.post('/deletarMaterial', function(req, res) {
    try {
        const insertSql = 'UPDATE materiais SET soft_delete = 1 WHERE id = ?';
        conexao.query(insertSql, [req.query.id], (err, results) => {
            if (err) throw (err);
            console.log('Material editado com o ID:', results.affectedRows)
            res.redirect('/');
        });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
});

app.listen(3000);