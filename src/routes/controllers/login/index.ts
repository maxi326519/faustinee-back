const { Users } = require("../../../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const loginUser = async (email: string, password: string) => {
  // Check parameneters
  if (!email) throw new Error("missin parameter 'email'");
  if (!password) throw new Error("missin parameter 'password'");

  // Search the user by email
  const usuario = await Users.findOne({ where: { email: email } });

  // Check if the user exist
  if (!usuario) throw new Error("User not found");

  // Verify if the user is current available
  if (usuario.disabled) throw new Error("This user is not allowed access");

  // Check the password with bcrypt
  const isPasswordValid = await bcrypt.compare(password, usuario.password);

  // Check if password exist
  if (!isPasswordValid) throw new Error("Incorrect password");

  // Generate the token
  const secretKey = process.env.SECRET_KEY;
  const token = jwt.sign({ userId: usuario.id }, secretKey, {
    expiresIn: "12d",
  });

  // Response with th user data and token
  return { usuario, token };
};

export { loginUser };
