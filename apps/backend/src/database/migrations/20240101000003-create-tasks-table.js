'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop stale ENUM types left behind by sequelize.sync()
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tasks_status";');

    await queryInterface.createTable('tasks', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      reward_amount: {
        type: Sequelize.DECIMAL(18, 6),
        allowNull: false,
      },
      max_submissions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      current_submissions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM('open', 'in_progress', 'under_review', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'open',
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      requester_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('tasks', ['status']);
    await queryInterface.addIndex('tasks', ['category']);
    await queryInterface.addIndex('tasks', ['requester_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tasks', {});
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tasks_status";');
  },
};
