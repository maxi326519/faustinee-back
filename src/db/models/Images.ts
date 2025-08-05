export const model = (sequelize: any, DataTypes: any) => {
  sequelize.define(
    "Images",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    { timestamps: false, updatedAt: false, createdAt: true }
  );
};
