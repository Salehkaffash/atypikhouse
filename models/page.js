'use strict';
module.exports = (sequelize, DataTypes) => {
  const Page = sequelize.define('Page', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('published', 'draft', 'archived'),
      defaultValue: 'draft'
    }
  });

  Page.associate = function(models) {
    // associations can be defined here
  };

  return Page;
};
