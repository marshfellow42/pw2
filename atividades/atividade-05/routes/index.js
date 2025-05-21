var express = require('express');
var router = express.Router();
var axios = require('axios');
var FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const env = require('dotenv').config()

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const lista = await axios.get('https://mauricio.inf.br/p6/api/list/');
    const pg_atual = parseInt(req.query.pg) || 0;

    if (lista) {
      res.render('index', { title: 'Lista de Veículos do Maurício', lista: lista.data.veiculos, pg_atual });
    } else {
      res.render('index', { title: 'Lista de Veículos do Maurício', pg_atual });
    }

  } catch (error) {
    console.error('Error fetching list:', error);
    next(error);
  }
});

router.get('/add', async function(req, res, next) {
  res.render('add', { title: 'Formulário de Adição'});
});

router.get('/auth', async function(req, res, next) {
  res.render('auth', { title: 'Formulário de autorização'});
});

router.get('/authFirebase', async function(req, res, next) {
  res.render('firebase', { title: 'Formulário de autorização usando Firebase', env: process.env });
});

router.post('/register', async function (req, res, next) {
  console.log(req.body.placa)
  console.log(req.body.marca)
  console.log(req.body.modelo)
  console.log(req.body.cor)
  console.log(req.body.ano_fabric)
  try {
    const formData = new FormData();
    formData.append('placa', req.body.placa);
    formData.append('marca', req.body.marca);
    formData.append('modelo', req.body.modelo);
    formData.append('cor', req.body.cor);
    formData.append('ano_fabric', req.body.ano_fabric);

    const response = await axios.post('https://mauricio.inf.br/p6/api/add/', formData);

    console.log('Resposta da API externa:', response.data);

    res.redirect('/');
  } catch (err) {
    console.error('Erro no axios:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else if (err.request) {
      console.error('Request foi feito, mas sem resposta:', err.request);
    } else {
      console.error('Erro de configuração:', err.message);
    }
    res.status(500).send('Erro ao enviar dados para a API externa');
  }
});

router.post('/remove', async function (req, res, next) {
  try {
    const formData = new FormData();
    formData.append('placa', req.body.placa);

    const response = await axios.post('https://mauricio.inf.br/p6/api/remove/', formData);

    console.log('Resposta da API externa:', response.data);

    res.redirect('/');
  } catch (err) {
    console.error('Erro no axios:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else if (err.request) {
      console.error('Request foi feito, mas sem resposta:', err.request);
    } else {
      console.error('Erro de configuração:', err.message);
    }
    res.status(500).send('Erro ao enviar dados para a API externa');
  }
});

router.post('/auth', async function (req, res, next) {
  console.log(req.body.username)
  console.log(req.body.password)
  try {
    const formData = new FormData();
    formData.append('username', req.body.username);
    formData.append('password', req.body.password);

    const response = await axios.post('https://mauricio.inf.br/p6/api/auth/', formData);

    console.log('Resposta da API externa:', response.data.access_token);

    localStorage.setItem("access_token", response.data.access_token);

    res.redirect('/');
  } catch (err) {
    console.error('Erro no axios:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else if (err.request) {
      console.error('Request foi feito, mas sem resposta:', err.request);
    } else {
      console.error('Erro de configuração:', err.message);
    }
    res.status(500).send('Erro ao enviar dados para a API externa');
  }
});

module.exports = router;
