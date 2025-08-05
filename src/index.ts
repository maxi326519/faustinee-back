import { conn, Users } from "./db";
require("./db");

const app = require("./app");
const bcrypt = require("bcrypt");

const PORT = process.env.PORT || 3001;

// Inicialización
conn.sync({ force: false }).then(async () => {
  // Creamos un usuario
  Users.create({
    name: "Maximiliano García",
    role: "Admin",
    email: "admin@mipanel.online",
    password: await bcrypt.hash("123qwe", 10),
  })
    .then(() => console.log("User created"))
    .catch(() => console.log("Error al crear el usuario"));

  // Open server
  app.listen(PORT, () => {
    console.log(`Server listening in port ${PORT}`);
  });
});
