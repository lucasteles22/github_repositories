const express = require('express');
const router = express.Router();
const RepositoriesController = require("../controllers/repositories_controller");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/repositories", RepositoriesController.Index)

module.exports = router;