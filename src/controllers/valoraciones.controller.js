import { pool } from "../db.js";
// Middleware para validar si el usuario está logeado

// Controlador para calificar un juego
export const calificarJuego = async (req, res) => {
  try {
    const { idJuego, puntuacion, comentario } = req.body;
    const idUsuario = req.session.Id; // Suponiendo que guardas la información del usuario en la sesión
    if(puntuacion > 0 && puntuacion <=5){
      
    }else{
      res.status(400).send('la puntuacion debe ser un numero entre 1 y 5');
    }
    // Insertar nueva valoración utilizando el procedimiento almacenado
    await pool.query('CALL calificarJuego(?, ?, ?, ?)', [idJuego, idUsuario, puntuacion, comentario]);
    res.status(201).json({
      message: 'Juego calificado exitosamente',
    });
  } catch (error) {
    console.error('Error al calificar el juego:', error);
    res.status(500).send('Error interno del servidor');
  }
};

export const obtenerPuntuacionesPorJuego = async (req, res) => {
    try {
      const idJuego = req.headers['id-juego']; // Obtén la id del juego desde el header
  
      // Verifica si la id del juego está presente en el header
      if (!idJuego) {
        return res.status(400).json({
          message: 'Falta la id del juego en el header',
        });
      }
      
      // Llama al procedimiento almacenado para obtener las puntuaciones por juego
      const [result] = await pool.query('CALL ObtenerPuntuacionesPorJuego(?)', [idJuego]);
      console.log(result)
      const juegoNombre = result[0][0].juegoNombre; // Nombre del juego
  
      // Puntuaciones del juego con nombres de usuario y comentarios
      const puntuaciones = result[1];
  
      res.status(200).json({
        result
      });
    } catch (error) {
      console.error('Error al obtener las puntuaciones por juego:', error);
      res.status(500).send('Error interno del servidor');
    }
  };