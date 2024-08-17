// models/blog.js
module.exports = (sequelize, DataTypes) => {
  const Blog = sequelize.define('Blog', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    categories: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    seoTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    seoDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  });

  return Blog;
};