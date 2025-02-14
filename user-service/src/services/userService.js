const UserRepository = require('../models/userRepository');

const UserService = {
  getAllUsers: () => {
    return UserRepository.getAllUsers();
  },

  getUserByRut: async (rut) => {
    return UserRepository.findByRut(rut);
  },

  updateUser: async (rut, data) => {
    return UserRepository.updateUser(rut, data);
  },

  deleteUser: async (rut) => {
    return UserRepository.deleteUser(rut);
  },

  getAllRoles: () => {
    return UserRepository.getAllRoles();
  },

  getAllStatus: () => {
    return UserRepository.getAllStatus();
  },
};

module.exports = UserService;