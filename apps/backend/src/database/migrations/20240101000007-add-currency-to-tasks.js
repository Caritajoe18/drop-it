'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add currency column to tasks (defaults to 'USDC' for backward compat)
    await queryInterface.sequelize.query(
      `DO $$ BEGIN
         IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_tasks_currency') THEN
           CREATE TYPE "enum_tasks_currency" AS ENUM ('USDC', 'HBAR');
         END IF;
       END $$;`,
    );

    await queryInterface.addColumn('tasks', 'currency', {
      type: Sequelize.ENUM('USDC', 'HBAR'),
      allowNull: false,
      defaultValue: 'USDC',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tasks', 'currency');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tasks_currency";');
  },
};
