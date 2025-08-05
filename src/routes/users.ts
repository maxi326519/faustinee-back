import { UserStatus } from "../interfaces/User";
import { Router } from "express";
import {
  changePassword,
  deleteUsuario,
  getUsuarios,
  setUsuario,
  updateUsuario,
} from "../routes/controllers/users";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verificar si existen todos los campos requeridos
    const camposObligatorios = { name, email, password, role };
    const camposFaltantes = Object.entries(camposObligatorios)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        message: `Faltan los siguientes campos obligatorios: ${camposFaltantes.join(
          ", "
        )}`,
      });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "El email ingresado no es válido." });
    }

    // Validar password (mínimo 6 caracteres)
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "La contraseña debe tener al menos 6 caracteres." });
    }

    // Crear el usuario
    const nuevoUsuario = await setUsuario({
      name,
      email,
      status: UserStatus.ACTIVE,
      password,
      role,
    });

    return res.status(201).json(nuevoUsuario);
  } catch (error: any) {
    console.error("Error al crear usuario:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    let statusCode = 500;
    let errorMessage = "Error inesperado en el servidor.";

    // Manejo de errores específicos
    if (error.name === "SequelizeUniqueConstraintError") {
      statusCode = 409;
      errorMessage = "El email ingresado ya está registrado.";
    } else if (error.name === "ValidationError") {
      statusCode = 400;
      errorMessage = "Datos inválidos en la solicitud.";
    }

    return res.status(statusCode).json({
      message: errorMessage,
      details: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const usuarios = await getUsuarios();

    if (!usuarios || usuarios.length === 0) {
      return res.status(200).json({
        message: "No se encontraron usuarios en la base de datos.",
      });
    }

    return res.status(200).json(usuarios);
  } catch (error: any) {
    console.error("Error al obtener usuarios:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    let statusCode = 500;
    let errorMessage = "Error interno del servidor al obtener usuarios.";

    // Manejo de errores específicos
    if (error.name === "SequelizeDatabaseError") {
      statusCode = 500;
      errorMessage = "Error en la base de datos al obtener usuarios.";
    } else if (error.name === "SequelizeConnectionError") {
      statusCode = 503;
      errorMessage = "Error de conexión a la base de datos.";
    } else if (error.name === "ValidationError") {
      statusCode = 400;
      errorMessage = "Datos inválidos en la solicitud.";
    }

    return res.status(statusCode).json({
      message: errorMessage,
      details: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    // Verifica que el ID sea válido
    if (!id) {
      return res.status(400).json({ message: "ID de usuario es requerido." });
    }

    // Verifica que haya datos para actualizar
    if (!Object.keys(datos).length) {
      return res
        .status(400)
        .json({ message: "No se proporcionaron datos para actualizar." });
    }

    // Llamamos a la función de actualización
    const usuarioActualizado = await updateUsuario(id, datos);

    if (!usuarioActualizado) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res.status(200).json(usuarioActualizado);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);

    return res.status(500).json({
      message: "Error interno del servidor al actualizar usuario.",
    });
  }
});

router.put("/forget-password/:id", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Validaciones previas
    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Correo, contraseña actual y nueva contraseña son requeridos.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "La nueva contraseña debe tener al menos 8 caracteres.",
      });
    }

    const result = await changePassword(email, oldPassword, newPassword);

    if (!result) {
      return res.status(400).json({
        message:
          "No se pudo cambiar la contraseña. Verifique los datos ingresados.",
      });
    }

    return res
      .status(200)
      .json({ message: "Contraseña cambiada exitosamente." });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);

    return res.status(500).json({
      message: "Error interno del servidor al cambiar la contraseña.",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validación del ID
    if (!id) {
      return res
        .status(400)
        .json({ message: "El ID del usuario es requerido." });
    }

    // Intentamos eliminar el usuario
    const resultado = await deleteUsuario(id);

    if (!resultado) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res.status(200).json({ message: "Usuario eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);

    return res.status(500).json({
      message: "Error interno del servidor al eliminar el usuario.",
    });
  }
});

export default router;
