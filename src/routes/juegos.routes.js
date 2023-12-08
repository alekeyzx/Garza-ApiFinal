import { Router } from "express";
import jwt from "jsonwebtoken";
import { SECRET } from "../config.js";
import {
    agregarJuego,
    eliminarJuego,
    obtenerListaJuegos,
} from "../controllers/juegos.controller.js";
const router = Router();


function decodeToken(accessToken) {
  try {
    const decoded = jwt.verify(accessToken, SECRET);
    return decoded.user; // Los datos del usuario están en la propiedad 'user' del token
  } catch (error) {
    // Manejar el error si el token no es válido
    console.error('Error al decodificar el token:', error);
    return null;
  }
}

function validateAdminToken(req, res, next) {
  const accessToken = req.headers["authorization"];
  const decodedUser = decodeToken(accessToken);

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
              accessTokenError
          });
      } else {
          // El token de acceso es válido
          // Verifica si el usuario tiene la propiedad 'admin' en true
          console.log(decodedUser, decodedUser.Admin)
          if (decodedUser && decodedUser.Admin === 1) {
              next(); // Usuario autenticado y es administrador
          } else {
              return res.status(403).json({
                  message: "Acceso denegado",
                  info: "Usuario no autorizado",
              });
          }
      }
  });
}

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
 * /juegos/agregar-juego:
 *   post:
 *     summary: Agregar un nuevo juego
 *     description: Agrega un nuevo juego a la lista.
 *     tags:
 *       - Juegos
 *     parameters:
 *       - name: juego
 *         in: body
 *         description: Datos del juego a agregar
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             nombre:
 *               type: string
 *             genero:
 *               type: string
 *             lanzamiento:
 *               type: integer
 *     responses:
 *       201:
 *         description: Juego agregado exitosamente
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /juegos/eliminar-juego:
 *   delete:
 *     summary: Eliminar un juego existente
 *     description: Elimina un juego de la lista.
 *     tags:
 *       - Juegos
 *     parameters:
 *       - name: juego
 *         in: body
 *         description: Datos del juego a eliminar
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             idJuego:
 *               type: integer
 *     responses:
 *       200:
 *         description: Juego eliminado exitosamente
 *       403:
 *         description: No tienes permisos para realizar esta acción
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /juegos/obtener-lista-juegos:
 *   get:
 *     summary: Obtener la lista de juegos activos
 *     description: Obtiene la lista de juegos que están activos.
 *     tags:
 *       - Juegos
 *     responses:
 *       200:
 *         description: Lista de juegos obtenida exitosamente
 *         schema:
 *           type: object
 *           properties:
 *             juegos:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Error interno del servidor
 */

router.post('/agregar-juego', validarSesion, validateToken,  agregarJuego);
router.delete('/eliminar-juego', validarSesion, validateAdminToken, eliminarJuego);
router.get('/obtener-lista-juegos', obtenerListaJuegos);



export default router;
