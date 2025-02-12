const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const userRole = require('../utils/roles')

const router = express.Router();

/*

🔒 Proteger endpoints con roles.

*/

// Obtener todos los usuarios (solo Admin)
router.get('/', userController.getAllUsers);

// Obtener usuario por RUT (Admin o el mismo usuario... simplificado, aquí sólo Admin)
router.get('/:rut', userController.getUserByRut);

// Actualizar usuario
router.put('/:rut', userController.updateUser);

// Eliminar usuario
router.delete('/:rut', userController.deleteUser);

// Obtener roles y status
router.get('/meta/roles', userController.getAllRoles);
router.get('/meta/statuses', userController.getAllStatus);

module.exports = router;
