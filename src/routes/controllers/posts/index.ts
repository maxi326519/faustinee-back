import { OrderItem, WhereOptions } from "sequelize";
import { PostTS } from "../../../interfaces/Post";
import { Posts } from "../../../db";
import fs from "fs";
import path from "path";

// Utilidad para obtener la carpeta de una publicación
const getPostFolder = (postId: string) =>
  path.join(__dirname, `../../../../uploads/posts/${postId}`);

export async function getPosts(filters: {
  page?: number;
  items?: number;
  latest?: boolean;
  mustRead?: boolean;
  category?: string;
}) {
  const { page = 1, items = 10, latest, mustRead, category } = filters;

  const offset = (page - 1) * items;
  const limit = items;
  const order: OrderItem[] = [];
  const where: WhereOptions = { state: "Pendiente" };

  if (latest) order.push(["date", "DESC"]);
  if (mustRead) order.push(["reads", "DESC"]);
  if (order.length === 0) order.push(["date", "DESC"]);
  if (category) where.category = category;

  console.log(order, where);

  const posts = await Posts.findAll({
    limit,
    offset,
    order,
    where,
  });

  const postFormated = posts.map(
    (post): PostTS => ({
      ...post.dataValues,
      coverUrl: process.env.API_URL + post.dataValues.coverUrl,
    })
  );

  return postFormated;
}

// Crear una publicación nueva
export async function setPost(data: PostTS, file: Express.Multer.File) {
  // Create post
  const newPost = await Posts.create({
    title: data.title,
    category: data.category,
    contentHtml: data.contentHtml,
    coverUrl: data.coverUrl || "",
    tags: data.tags,
    state: data.state,
    reads: data.reads,
    author: data.author,
    date: data.date,
  });

  // Change img path
  const imgUrl = await saveImagesByPost(file, newPost.dataValues.id);

  // Update cover
  const postUpdated = await newPost.update({ coverUrl: imgUrl });
  const postFormated: PostTS = {
    ...postUpdated.dataValues,
    coverUrl: process.env.API_URL + postUpdated.dataValues.coverUrl,
  };

  return postFormated;
}

export async function saveImagesByPost(
  file: Express.Multer.File,
  postId: string
) {
  try {
    let coverImageUrl = "";
    if (file) {
      const folder = getPostFolder(postId);
      fs.mkdirSync(folder, { recursive: true });

      const fileName = `${Date.now()}-${file.originalname}`;
      const destPath = path.join(folder, fileName);
      fs.renameSync(file.path, destPath);

      coverImageUrl = `/uploads/posts/${postId}/${fileName}`;
    }
    return coverImageUrl;
  } catch (error) {
    console.log(error);
  }
}

// Actualizar publicación existente
export async function updatePost(
  id: string,
  data: any,
  file?: Express.Multer.File
) {
  const post = await Posts.findByPk(id);
  if (!post) return null;

  const newData: PostTS = { ...data };

  // Si hay nuevo archivo de portada
  if (file) {
    // Eliminar portada anterior si existe
    const previousFileName = path.basename(post.dataValues.coverUrl);
    const folder = getPostFolder(id);
    const previousFilePath = path.join(folder, previousFileName);

    try {
      if (fs.existsSync(previousFilePath)) {
        fs.unlinkSync(previousFilePath);
        console.log("Portada anterior eliminada:", previousFilePath);
      }
    } catch (err) {
      console.error("Error al eliminar la portada anterior:", err);
    }

    fs.mkdirSync(folder, { recursive: true });

    const fileName = `${Date.now()}-${file.originalname}`;
    const destPath = path.join(folder, fileName);
    fs.renameSync(file.path, destPath);

    newData.coverUrl = `/uploads/posts/${newData.id!}/${fileName}`;
  }

  if (!process.env.API_URL) throw new Error("missing env API_URL");

  // Actualizar el post
  await post.update(newData);
  const postFormated: PostTS = {
    ...post.dataValues,
    coverUrl: process.env.API_URL + post.dataValues.coverUrl,
  };

  return postFormated;
}

// Eliminar publicación y su carpeta
export async function deletePost(id: string) {
  const post = await Posts.findByPk(id);
  if (!post) return false;

  const folder = getPostFolder(id);
  if (fs.existsSync(folder)) {
    fs.rmSync(folder, { recursive: true, force: true });
  }

  await post.destroy();
  return true;
}
