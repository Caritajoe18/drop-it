'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ── tasks table ──────────────────────────────────────────────────────────
    await queryInterface.addColumn('tasks', 'funding_status', {
      type: Sequelize.ENUM('pending_funding', 'funded', 'depleted', 'refunded'),
      allowNull: false,
      defaultValue: 'pending_funding',
      after: 'status',
    });

    await queryInterface.addColumn('tasks', 'escrow_amount', {
      type: Sequelize.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 0,
      after: 'funding_status',
    });

    await queryInterface.addColumn('tasks', 'escrow_transaction_id', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'escrow_amount',
    });

    await queryInterface.addIndex('tasks', ['funding_status'], {
      name: 'tasks_funding_status',
    });

    // ── payments table ───────────────────────────────────────────────────────
    // Make from_user_id and to_user_id nullable (platform as sender/receiver)
    await queryInterface.changeColumn('payments', 'from_user_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    });

    await queryInterface.changeColumn('payments', 'to_user_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    });

    await queryInterface.addColumn('payments', 'type', {
      type: Sequelize.ENUM('escrow_deposit', 'worker_payout', 'escrow_refund'),
      allowNull: false,
      defaultValue: 'worker_payout', // safe default for existing rows
      after: 'currency',
    });

    await queryInterface.addColumn('payments', 'commission_amount', {
      type: Sequelize.DECIMAL(18, 6),
      allowNull: true,
      after: 'type',
    });

    await queryInterface.addColumn('payments', 'submission_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'submissions', key: 'id' },
      after: 'task_id',
    });

    await queryInterface.addIndex('payments', ['type'], { name: 'payments_type' });
    await queryInterface.addIndex('payments', ['submission_id'], {
      name: 'payments_submission_id',
    });
  },

  async down(queryInterface, Sequelize) {
    // payments
    await queryInterface.removeIndex('payments', 'payments_submission_id');
    await queryInterface.removeIndex('payments', 'payments_type');
    await queryInterface.removeColumn('payments', 'submission_id');
    await queryInterface.removeColumn('payments', 'commission_amount');
    await queryInterface.removeColumn('payments', 'type');
    await queryInterface.sequelize.query(
      "ALTER TABLE payments MODIFY COLUMN from_user_id CHAR(36) NOT NULL",
    );
    await queryInterface.sequelize.query(
      "ALTER TABLE payments MODIFY COLUMN to_user_id CHAR(36) NOT NULL",
    );

    // tasks
    await queryInterface.removeIndex('tasks', 'tasks_funding_status');
    await queryInterface.removeColumn('tasks', 'escrow_transaction_id');
    await queryInterface.removeColumn('tasks', 'escrow_amount');
    await queryInterface.removeColumn('tasks', 'funding_status');
  },
};
