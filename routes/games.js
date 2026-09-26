const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { gameValidationRules, handleValidationErrors } = require('../middleware/validators');

router.get('/', gameController.index);
router.get('/new', gameController.newForm);
router.post('/', gameValidationRules, handleValidationErrors, gameController.create);
router.get('/:id', gameController.show);
router.get('/:id/edit', gameController.editForm);
router.put('/:id', gameValidationRules, handleValidationErrors, gameController.update);
router.delete('/:id', gameController.destroy);

module.exports = router;
