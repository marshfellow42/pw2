var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const response = await axios.get('https://mauricio.inf.br/p6/api/list/');
    const lista = response.data.veiculos;

    res.render('index', { title: 'Lista de Veículos do Maurício', lista: lista });
  } catch (error) {
    console.error('Error fetching list:', error);
    next(error);
  }
});

router.get('/add', async function(req, res, next) {
  try {
    res.render('add', { title: 'Formulário de Adição'});
  } catch (error) {
    console.error('Error fetching list:', error);
    next(error);
  }
});

module.exports = router;
