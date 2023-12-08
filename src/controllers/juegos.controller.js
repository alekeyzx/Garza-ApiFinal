import { pool } from "../db.js";



// Middleware para validar si el usuario está logeado

// Controlador para agregar un juego
export const agregarJuego = async (req, res) => {
  try {
    const { nombre, genero, lanzamiento } = req.body;

    await pool.query('CALL CrearJuego(?, ?, ?)', [nombre, genero, lanzamiento]);

    res.status(201).json({
      message: 'Juego agregado exitosamente',
    });
  } catch (error) {
    console.error('Error al agregar el juego:', error);
    res.status(500).send('Error interno del servidor');
  }
};

// Controlador para eliminar un juego
export const eliminarJuego = async (req, res) => {
  try {
    const { idJuego } = req.body;
      await pool.query('DELETE FROM juegos where idJuego = ?', [idJuego]);
      res.status(200).json({
        message: 'Juego eliminado exitosamente',
      });
    
    
  } catch (error) {
    console.error('Error al eliminar el juego:', error);
    res.status(500).send('Error interno del servidor');
  }
};

// Controlador para obtener la lista de juegos
export const obtenerListaJuegos = async (req, res) => {
  try {
    const listaJuegos = await pool.query('CALL ObtenerListaJuegos()');
    res.status(200).json({
      juegos: listaJuegos[0],
    });
  } catch (error) {
    console.error('Error al obtener la lista de juegos:', error);
    res.status(500).send('Error interno del servidor');
  }
};
