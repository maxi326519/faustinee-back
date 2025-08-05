import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";

const secretKey: string | undefined = process.env.SECRET_KEY;

if (!secretKey) {
  throw new Error(
    "The secret key is not defined in the environment variables."
  );
}

// Middleware para verificar el token
export const verificarToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Obtener el token del header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) throw new Error("Token not provided");

    // Decodificar el token
    const decoded = jwt.verify(token, secretKey) as {
      id: string;
      nombre: string;
      role: "Admin" | "Asistente";
      correo: string;
    };

    // Agregar la información del usuario al request
    req.body.user = decoded;

    next();
  } catch (error: any) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// Middleware para verificar roles permitidos (Admins siempre tienen acceso)
export const verificarRol = (rolesPermitidos: ("Admin" | "Asistente")[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.body.user;

    // Si el usuario es "Admin", permitir acceso sin importar la ruta
    if (user.role === "Admin") return next();

    // Si el usuario no tiene el role adecuado, denegar acceso
    if (!rolesPermitidos.includes(user.role)) {
      return res
        .status(403)
        .json({ error: "Forbidden: You don't have permission" });
    }

    next();
  };
};
