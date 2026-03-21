'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop stale ENUM types left behind by sequelize.sync()
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_submissions_status";');

    await queryInterface.createTable('submissions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      task_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'tasks', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      worker_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: true,
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

    await queryInterface.addIndex('submissions', ['task_id']);
    await queryInterface.addIndex('submissions', ['worker_id']);
    await queryInterface.addIndex('submissions', ['status']);
    await queryInterface.addIndex('submissions', ['task_id', 'worker_id'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('submissions', {});
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_submissions_status";');
  },
};
