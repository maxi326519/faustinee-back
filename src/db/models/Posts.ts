export const model = (sequelize: any, DataTypes: any) => {
  sequelize.define(
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
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contentHtml: {
        type: DataTypes.JSON(),
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
    },
    { timestamps: false, updatedAt: true, createdAt: true }
  );
};
