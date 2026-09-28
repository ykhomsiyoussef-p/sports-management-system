const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { gameValidationRules, handleValidationErrors } = require('../middleware/validators');
const { requireAdmin } = require('../middleware/auth');

router.get('/', gameController.index);
router.get('/new', requireAdmin, gameController.newForm);
router.post('/', requireAdmin, gameValidationRules, handleValidationErrors, gameController.create);
router.get('/:id', gameController.show);
router.get('/:id/edit', requireAdmin, gameController.editForm);
router.put('/:id', requireAdmin, gameValidationRules, handleValidationErrors, gameController.update);
router.delete('/:id', requireAdmin, gameController.destroy);

module.exports = router;
