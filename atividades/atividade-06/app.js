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
    console.log("Nome de usuário: ", req.session.user)
    try {
        let sql = 'SELECT * FROM usuarios WHERE username = ?';
        conexao.query(sql, [req.session.user], (err, results) => {
            res.render('formulario', {listagem:results});
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erro ao buscar dados do histórico");
    }
});

app.get('/login', function(req,res) {
    if (req.session.user) {
        res.redirect("/")
    } else {
        res.render('formulario_login');
    }
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

            await new Promise((resolve, reject) => {
                conexao.query(insertSql, user, (err, results) => {
                    if (err) return reject(err);
                    console.log('User added with ID:', results.insertId);
                    resolve();
                });
            });
        } else {
            console.log("Username or email already exists.");
        }

        res.redirect("/");
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
          return res.status(401).send('User not found');
        }
  
        const user = results[0];
        console.log(user)
  
        // Verify the password
        const passwordValid = await argon2.verify(user.senha, req.body.senha);
        if (passwordValid) {
          // Set session if login is successful
          req.session.user = user.username;
          res.redirect('/');
        } else {
          res.status(401).send('Invalid username or password');
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

app.listen(3000);