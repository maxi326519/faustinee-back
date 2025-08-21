import { Op } from "sequelize";

export const model = (sequelize: any, DataTypes: any) => {
  return sequelize.define(
    "Posts",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          is: /^[a-z0-9-]+$/, // Regex para validar formato del slug
        },
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contentHtml: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      coverUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tags: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      state: {
        type: DataTypes.ENUM("Pendiente", "Publicado"),
        allowNull: true,
        defaultValue: "Pendiente",
      },
      reads: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      author: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      fixedHome: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      fixedCategory: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      updatedAt: true,
      createdAt: true,
      hooks: {
        beforeValidate: async (post: any) => {
          if (!post.slug && post.title) {
            post.slug = await generateUniqueSlug(
              sequelize.models.Posts,
              post.title
            );
          }
        },
        beforeUpdate: async (post: any) => {
          if (post.changed("title") && post.title) {
            post.slug = await generateUniqueSlug(
              sequelize.models.Posts,
              post.title,
              post.id
            );
          }
        },
      },
    }
  );
};

// Función mejorada para generar slugs únicos
async function generateUniqueSlug(
  Model: any,
  title: string,
  excludeId: string | null = null
): Promise<string> {
  let baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  // Verificar si el slug ya existe
  const where: any = { slug };
  if (excludeId) {
    where.id = { [Op.ne]: excludeId }; // Excluir el post actual en actualizaciones
  }

  while (await Model.findOne({ where })) {
    slug = `${baseSlug}-${counter}`;
    where.slug = slug;
    counter++;
  }

  return slug;
}

// Función base para generar el slug (sin verificación de duplicados)
function generateSlug(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
