const sqlModel = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  User.associate = (models) => {
    User.hasMany(models.post);
  };

  return User;
};

const graphModel = `
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post]
    createdAt: String
    updatedAt: String
  }
`;

module.exports = {
  sqlModel,
  graphModel
};
