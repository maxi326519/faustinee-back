import { cleanObject } from "../../../utils";
import { UserTS } from "../../../interfaces/User";
import { Users } from "../../../db";

const bcrypt = require("bcrypt");

const setUsuario = async (usuario: UserTS) => {
  if (!usuario.name) throw new Error("missing parameter (nombre)");
  if (!usuario.role) throw new Error("missing parameter (role)");
  if (!usuario.email) throw new Error("missing parameter (correo)");
  if (!usuario.password) throw new Error("missing parameter (password)");

  // Verificar si el correo ya está registrado
  const alreadyCorreo = await Users.findOne({
    where: { email: usuario.email },
  });
  if (alreadyCorreo) throw new Error("'correo' already exists");

  // Hashear la contraseña antes de almacenarla
  usuario.password = await bcrypt.hash(usuario.password, 10);

  // Limpiar los datos antes de la inserción
  const cleanedData = cleanObject(usuario);

  // Crear un nuevo usuario con la contraseña encriptada
  const nuevoUsuario = await Users.create(cleanedData);

  return {
    id: nuevoUsuario.dataValues.id,
    name: nuevoUsuario.dataValues.name,
    role: nuevoUsuario.dataValues.role,
    email: nuevoUsuario.dataValues.email,
  };
};

const getUsuarios = async () => {
  const usuarios = await Users.findAll({
    attributes: { exclude: ["password"] },
  });
  return usuarios;
};

const updateUsuario = async (id: string, datos: Partial<UserTS>) => {
  // Buscar el usuario por ID
  const usuario = await Users.findByPk(id);
  if (!usuario) throw new Error("user not found");

  // Limpiar el objeto antes de actualizar
  const cleanedData = cleanObject(datos);

  // Validar que no se sobreescriba la contraseña con un valor inválido
  if (cleanedData.password) {
    if (
      typeof cleanedData.password !== "string" ||
      cleanedData.password.trim() === ""
    ) {
      throw new Error("Invalid password format");
    }
    cleanedData.password = await bcrypt.hash(cleanedData.password, 10);
  } else {
    // Si no se envía una nueva contraseña, eliminamos la clave del objeto para no modificarla
    delete cleanedData.password;
  }

  // Actualizar el usuario con los nuevos datos
  await usuario.update(cleanedData);

  return { message: "User updated successfully" };
};

const changePassword = async (
  email: string,
  oldPassword: string,
  newPassword: string
) => {
  // Buscar al usuario por su correo
  const user = await Users.findOne({ where: { email } });

  if (!user) throw new Error("user not found");

  // Verificar que la contraseña antigua sea correcta
  const passwordMatch = await bcrypt.compare(
    oldPassword,
    user.dataValues.password
  );
  if (!passwordMatch) throw new Error("incorrect password");

  // Hashear la nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Actualizar la contraseña en la base de datos
  await user.update({ password: hashedPassword });

  // Recargar el usuario para asegurarnos de que la actualización se refleje!!!
  await user.reload();

  return { message: "password updated successfully" };
};

const deleteUsuario = async (id: string) => {
  // Buscar el usuario por ID
  const usuario = await Users.findByPk(id);
  if (!usuario) throw new Error("user not found");

  // Eliminar el usuario
  await usuario.destroy();

  return { message: "'Usuario' deleted successfully" };
};

export {
  setUsuario,
  getUsuarios,
  updateUsuario,
  changePassword,
  deleteUsuario,
};
