import { Router } from "express";
import jwt from "jsonwebtoken";
import { SECRET } from "../config.js";
import {
    calificarJuego,
    obtenerPuntuacionesPorJuego
} from "../controllers/valoraciones.controller.js";
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
          });
      } else {
          // El token de acceso es válido
          // Verifica si el usuario tiene la propiedad 'admin' en true
          if (decodedUser && decodedUser.Admin === true) {
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
 * /valoraciones/valorar-juego:
 *   post:
 *     summary: Calificar un juego
 *     description: Califica un juego y guarda la puntuación y el comentario del usuario.
 *     tags:
 *       - Valoraciones
 *     parameters:
 *       - name: juego
 *         in: body
 *         description: Datos para calificar el juego
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             idJuego:
 *               type: integer
 *             puntuacion:
 *               type: integer
 *             comentario:
 *               type: string
 *     responses:
 *       201:
 *         description: Juego calificado exitosamente
 *       400:
 *         description: La puntuación debe ser un número entre 1 y 5
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /valoraciones/valorar-juego:
 *   put:
 *     summary: Obtener puntuaciones por juego
 *     description: Obtiene las puntuaciones y comentarios de un juego específico.
 *     tags:
 *       - Valoraciones
 *     parameters:
 *       - name: id-juego
 *         in: header
 *         description: ID del juego para el cual se obtendrán las puntuaciones
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Puntuaciones por juego obtenidas exitosamente
 *         schema:
 *           type: object
 *           properties:
 *             juegoNombre:
 *               type: string
 *             puntuaciones:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idUsuario:
 *                     type: integer
 *                   puntuacion:
 *                     type: integer
 *                   comentario:
 *                     type: string
 *       400:
 *         description: Falta la ID del juego en el header
 *       500:
 *         description: Error interno del servidor
 */


router.post('/valorar-juego', validarSesion, validateToken,  calificarJuego);
router.put('/valorar-juego', validarSesion,  obtenerPuntuacionesPorJuego);


export default router;
