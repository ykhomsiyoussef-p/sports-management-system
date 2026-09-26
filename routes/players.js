const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const { playerValidationRules, handleValidationErrors } = require('../middleware/validators');

router.get('/', playerController.index);
router.get('/new', playerController.newForm);
router.post('/', playerValidationRules, handleValidationErrors, playerController.create);
router.get('/:id', playerController.show);
router.get('/:id/edit', playerController.editForm);
router.put('/:id', playerValidationRules, handleValidationErrors, playerController.update);
router.delete('/:id', playerController.destroy);

module.exports = router;
