const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { teamValidationRules, handleValidationErrors } = require('../middleware/validators');

router.get('/', teamController.index);
router.get('/new', teamController.newForm);
router.post('/', teamValidationRules, handleValidationErrors, teamController.create);
router.get('/:id', teamController.show);
router.get('/:id/edit', teamController.editForm);
router.put('/:id', teamValidationRules, handleValidationErrors, teamController.update);
router.delete('/:id', teamController.destroy);

module.exports = router;
