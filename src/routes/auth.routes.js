const { Router } = require('express');
const { signup, login } = require('../controllers/auth.controller');
const passport = require('../config/passport');

const router = Router();

router.post('/signup', signup);
router.post('/login', login);

module.exports = router;