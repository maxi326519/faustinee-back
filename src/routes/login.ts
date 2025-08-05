import { Request, Response } from "express";
import { verificarToken } from "./controllers/verifications";
import { loginUser } from "./controllers/login";
import { Users } from "../db";
import { Router } from "express";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { correo, password } = req.body;

    // Validación básica de entrada
    if (!correo || !password) {
      return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
    }

    const result = await loginUser(correo, password);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en login:", error);

    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return res.status(500).json({ message: errorMessage });
  }
});


router.post("/token", verificarToken, async (req: Request, res: Response) => {
  try {
    const { user } = req.body;

    // Validación del usuario en el body
    if (!user || !user.userId) {
      return res.status(400).json({ message: "Parámetro 'user' o 'userId' faltante en la solicitud." });
    }

    // Buscar usuario en la base de datos excluyendo la contraseña
    const userData = await Users.findByPk(user.userId, {
      attributes: { exclude: ["contraseña"] },
    });

    // Si no se encuentra el usuario, se devuelve un error
    if (!userData) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Respuesta con los datos del usuario
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error al obtener usuario por token:", error);

    if (error instanceof Error) {
      return res.status(400).json({ message: `Error de solicitud: ${error.message}` });
    } else {
      return res.status(500).json({ message: "Error interno del servidor." });
    }
  }
});


export default router;