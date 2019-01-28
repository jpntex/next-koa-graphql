const dateFormat = require('dateformat');

const sqlModel = (sequelize, DataTypes) => {
  const Post = sequelize.define('post', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    published: DataTypes.BOOLEAN
  });

  Post.prototype.publishedAt = function () {
    return dateFormat(this.createdAt, 'mmmm dS, yyyy, h:MM TT');
  };

  Post.associate = (models) => {
    Post.belongsTo(models.user);
  };

  return Post;
};

const graphModel = `
  type Post {
    id: ID!
    user: User!
    title: String!
    content: String!
    published: Boolean!
    publishedAt: String
    createdAt: String
    updatedAt: String
  }
`;

module.exports = {
  sqlModel,
  graphModel
};
