const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const userRole = require('../utils/roles')

const router = express.Router();

/**
 * 🔒 Proteger endpoints con roles.
 */

// Obtener todos los usuarios (solo Admin)
router.get('/', authMiddleware(userRole.ADMIN), userController.getAllUsers);

// Obtener usuario por RUT (Admin o el mismo usuario... simplificado, aquí sólo Admin)
router.get('/:rut', authMiddleware(userRole.ADMIN), userController.getUserByRut);

// Actualizar usuario
router.put('/:rut', authMiddleware(userRole.ADMIN), userController.updateUser);

// Eliminar usuario
router.delete('/:rut', authMiddleware(userRole.ADMIN), userController.deleteUser);

// Obtener roles y status
router.get('/meta/roles', authMiddleware(userRole.ADMIN), userController.getAllRoles);
router.get('/meta/statuses', authMiddleware(userRole.ADMIN), userController.getAllStatus);

module.exports = router;
