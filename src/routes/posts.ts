import { Router } from "express";
import {
  getPosts,
  setPost,
  updatePost,
  deletePost,
  saveImagesByPost,
  getPostsBySlug,
} from "./controllers/posts";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const postFolder = path.join(__dirname, "../../uploads/temp");
    fs.mkdirSync(postFolder, { recursive: true });
    cb(null, postFolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const data = req.body;
    const file = req.file;

    const camposFaltantes = [];
    if (!data.title) camposFaltantes.push("title");
    if (!data.contentHtml) camposFaltantes.push("contentHtml");
    if (!data.date) camposFaltantes.push("date");
    if (!file) camposFaltantes.push("file");

    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        message: `Faltan los siguientes campos obligatorios: ${camposFaltantes.join(
          ", "
        )}`,
      });
    }

    const nuevoPost = await setPost(data, file!);

    return res.status(201).json(nuevoPost);
  } catch (error) {
    console.error("Error al crear publicación:", error);
    return res.status(500).json({
      message: (error as any).message,
    });
  }
});

router.post("/:id/img", upload.single("file"), async (req, res) => {
  try {
    const id = req.params.id;
    const file = req.file;

    if (!id) throw new Error("missing param 'id'");
    if (!file) throw new Error("missing cover image 'file'");

    const url = await saveImagesByPost(file, id);

    res.status(200).json({ url: url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { page = 1, items = 10, latest, mustRead, category } = req.query;

    const filters = {
      page: parseInt(page as string),
      items: parseInt(items as string),
      latest: latest === "true",
      mustRead: mustRead === "true",
      category: category as string,
    };

    const posts = await getPosts(filters);

    return res.status(200).json(posts);
  } catch (error) {
    console.error("Error al obtener publicaciones:", error);
    return res.status(500).json({
      message: "Error interno del servidor al obtener publicaciones.",
      details: (error as any).message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.status(400).json({ message: "id de publicación requerido." });

    const posts = await getPostsBySlug(id);

    return res.status(200).json(posts);
  } catch (error) {
    console.error("Error al obtener publicaciones:", error);
    return res.status(500).json({
      message: "Error interno del servidor al obtener publicaciones.",
      details: (error as any).message,
    });
  }
});

router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const file = req.file;

    console.log("Actualizando", data, file);

    if (!id)
      return res.status(400).json({ message: "ID de publicación requerido." });

    const actualizado = await updatePost(id, data, file);

    if (!actualizado) {
      return res.status(404).json({ message: "Publicación no encontrada." });
    }

    return res.status(200).json(actualizado);
  } catch (error) {
    console.error("Error al actualizar publicación:", error);
    return res.status(500).json({
      message: "Error interno del servidor al actualizar publicación.",
    });
  }
});

router.delete("/posts/img", (req, res) => {
  const { src } = req.body;

  if (!src || typeof src !== "string") {
    return res.status(400).json({ error: "Parámetro 'src' inválido" });
  }

  // Ruta absoluta al archivo
  const filePath = path.join(__dirname, "..", "public", src);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res
        .status(200)
        .json({ message: "Imagen eliminada correctamente" });
    } else {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }
  } catch (error) {
    console.error("Error al eliminar imagen:", error);
    return res
      .status(500)
      .json({ error: "Error al eliminar imagen del servidor" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID de publicación requerido." });
    }

    const eliminado = await deletePost(id);

    if (!eliminado) {
      return res.status(404).json({ message: "Publicación no encontrada." });
    }

    return res
      .status(200)
      .json({ message: "Publicación eliminada exitosamente." });
  } catch (error) {
    console.error("Error al eliminar publicación:", error);
    return res.status(500).json({
      message: "Error interno del servidor al eliminar publicación.",
    });
  }
});

export default router;
