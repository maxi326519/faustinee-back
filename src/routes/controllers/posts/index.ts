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

  // primero por fijado (true primero, false después)
  order.push(["fixedHome", "DESC"]);

  if (category) {
    where.category = category;
    order.push(["fixedCategory", "DESC"]);
  }

  // después según filtros
  if (latest) {
    order.push(["date", "DESC"]);
  } else if (mustRead) {
    order.push(["reads", "DESC"]);
  } else {
    order.push(["date", "DESC"]);
  }

  const { rows: posts, count: totalItems } = await Posts.findAndCountAll({
    limit,
    offset,
    order,
    where,
  });

  return {
    items: posts,
    page: {
      current: page,
      items,
      totalPages: Math.ceil(totalItems / items),
    },
  };
}

export async function getPostsBySlug(slug: string) {
  const post = await Posts.findOne({ where: { slug } });
  if (!post) throw new Error("post not found");
  return post;
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

  let lastPost: PostTS = { ...newPost.dataValues };

  if (file) {
    // Change img path
    const imgUrl = await saveImagesByPost(file, newPost.dataValues.id);

    if (imgUrl) {
      // Update cover
      await newPost.update({ coverUrl: imgUrl });
      lastPost.coverUrl = imgUrl;
    }
  }
  return lastPost;
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

      coverImageUrl = `${process.env.API_URL}/uploads/posts/${postId}/${fileName}`;
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
    const imgUrl = await saveImagesByPost(file, newData.id!);
    if (imgUrl) newData.coverUrl = imgUrl;
  }

  // Actualizar el post
  await post.update(newData);

  return newData;
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
