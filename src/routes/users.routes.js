import { Router } from "express";
import jwt from "jsonwebtoken";
import { SECRET } from "../config.js";
import {
    createUser,
    loginUser,
    adminUser,
    logout
} from "../controllers/users.controller.js";
const router = Router();



function validateToken(req, res, next) {
    const accessToken = req.headers["authorization"];
  
    if (!accessToken) {
      return res.status(401).json({
        message: "Acceso denegado",
        info: "Token de acceso no proporcionado",
      });
    }
    jwt.verify(accessToken, SECRET, (accessTokenError, user) => {
      if (accessTokenError) {
        return res.status(401).json({
          message: "Acceso denegado",
          info: "Token de acceso inválido o expirado",
        });
      } else {
        // El token de acceso es válido, sigue adelante
        next();
      }
    });
}

const validarSesion = (req, res, next) => {
  if (req.session.loggedin === true) {
    next();
  } else {
    res.status(401).json({
      message: "No autorizado. Inicia sesión primero.",
    });
  }
};

/**
 * @swagger
 * /user/create:
 *   post:
 *     summary: Crear un nuevo usuario
 *     description: Crea un nuevo usuario en el sistema.
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - name: usuario
 *         in: body
 *         description: Datos del usuario a crear
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             nombre:
 *               type: string
 *             correo:
 *               type: string
 *             contraseña:
 *               type: string
 *     responses:
 *       200:
 *         description: Usuario creado exitosamente
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             nombre:
 *               type: string
 *             correo:
 *               type: string
 *             contraseña:
 *               type: string
 *       400:
 *         description: El usuario ya existe
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /user/login:
 *   get:
 *     summary: Iniciar sesión
 *     description: Inicia sesión en el sistema.
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - name: usuario
 *         in: body
 *         description: Datos del usuario para iniciar sesión
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             correo:
 *               type: string
 *             contraseña:
 *               type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             user:
 *               type: object
 *               properties:
 *                 Id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 correo:
 *                   type: string
 *                 Admin:
 *                   type: boolean
 *             accessToken:
 *               type: string
 *       400:
 *         description: Contraseña incorrecta o el usuario no existe
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /user/logout:
 *   get:
 *     summary: Cerrar sesión
 *     description: Cierra la sesión actual del usuario.
 *     tags:
 *       - Usuarios
 *     responses:
 *       200:
 *         description: Cierre de sesión correctamente
 *       401:
 *         description: No autorizado. Inicia sesión primero.
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /user/admin:
 *   put:
 *     summary: Asignar rol de administrador a un usuario.
 *     description: Permite asignar el rol de administrador a un usuario existente.
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Objeto JSON que incluye el ID del usuario.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             idUsuario:
 *               type: integer
 *               description: ID del usuario al que se le asignará el rol de administrador.
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 *         content:
 *           application/json:
 *             example:
 *               message: Usuario actualizado correctamente
 *       401:
 *         description: No autorizado. Se requiere autenticación.
 *         content:
 *           application/json:
 *             example:
 *               message: No autorizado. Inicia sesión primero.
 *       403:
 *         description: Acceso denegado. El usuario autenticado no tiene permisos de administrador.
 *         content:
 *           application/json:
 *             example:
 *               message: Acceso denegado. Usuario no autorizado.
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             example:
 *               message: Error interno del servidor.
 */
router.post('/create', createUser);
router.get('/login', loginUser);
router.put('/admin',validarSesion, validateToken, adminUser);
router.get('/logout', validarSesion, validateToken, logout);



export default router;
