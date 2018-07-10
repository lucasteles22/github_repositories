const express = require('express');
const router = express.Router();
const RepositoriesController = require("../controllers/RepositoriesController");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/repositories", RepositoriesController.Index)

module.exports = router;
