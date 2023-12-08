import { response } from "express";
import { pool } from "../db.js";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET } from "../config.js";

function generateTokens(user) {
  const accessToken = jwt.sign({ user }, SECRET); // Cambia ACCESS_SECRET por tu clave secreta para los tokens de acceso
  return { accessToken };
}

export const createUser = async (req, res) => {
  console.log(req.body);
  if (req.session.loggedin !== true) {
    try {
      const { nombre, correo, contraseña } = req.body;

      // Verificar si el usuario ya existe utilizando el procedimiento almacenado
      const [existingUser] = await pool.query("select * from usuarios where correo = ?", [
        correo,
      ]);

      if (existingUser.length > 0) {
        return res.status(400).json({
          error: "El usuario ya existe",
        });
      }
      // Hashear la contraseña con bcrypt
      const contraseñaHash = await bcrypt.hash(contraseña, 12);

      // Crear el usuario utilizando el procedimiento almacenado
      const [rows] = await pool.query("CALL crearUsuario(?, ?, ?)", [
        nombre,
        correo,
        contraseñaHash, // Utiliza la contraseña hasheada
      ]);



      res.send({
        id: rows,
        nombre,
        correo,
        contraseña: contraseñaHash, // Utiliza la contraseña hasheada
      });
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      res.status(500).send("Error interno del servidor");
    }
  } else {
    res.status(400).json({
      message: "Ya tienes una sesión iniciada",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    // Verificar las credenciales utilizando el procedimiento almacenado
    
    const [existingUser] = await pool.query("SELECT * from usuarios where correo = ?", [
      correo
    ]);

    console.log(contraseña,correo)
    if (existingUser.length > 0) {
      const isMatch = await bcrypt.compare(
        contraseña,
        existingUser[0].password
      );

      if (!isMatch) {
        return res.status(400).json({
          error: "Contraseña incorrecta",
        });
      } else {
        req.session.loggedin = true;
        req.session.Id = existingUser[0].idUsuario;
        req.session.name = existingUser[0].nombre;
        req.session.adamin = existingUser[0].admin
        // Aquí puedes seguir con el código para obtener grupos de administradores, etc.

        const user = {
          Id: existingUser[0].idUsuario,
          nombre: existingUser[0].nombre,
          correo: existingUser[0].correo,
          Admin: existingUser[0].admin
          // Puedes continuar con las propiedades necesarias del usuario
        };
        const { accessToken } = generateTokens(user);
        res.header("authorization", accessToken).status(200).json({
          message: "Inicio de sesión exitoso",
          user,
          accessToken,
        });
      }
    } else {
      return res.status(400).json({
        error: "El usuario no existe",
        existingUser
      });
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).send("Error interno del servidor");
  }
};

export const adminUser = async (req,res) =>{
  try {
    const { idUsuario } = req.body;
      await pool.query('CALL adminUser = ?', [idUsuario]);
      res.status(200).json({
        message: 'Usuario actualizado correctamente',
      });
    
    
  } catch (error) {
    console.error('Error al hacer administrador aa el usuario:', error);
    res.status(500).send('Error interno del servidor');
  }
}


export const logout = (req, res) => {
  req.session.loggedin = false;
  const tokenDeAcceso = req.headers.authorization;
  // Aquí podrías realizar alguna lógica adicional relacionada con la desautenticación, como invalidar el token si es necesario.
  res.status(200).json({
    message: "Cierre de sesión correctamente",
  });
};
