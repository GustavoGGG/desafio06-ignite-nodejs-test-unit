import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class CreateColumnSenderInStatements1650747102472 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'statements',
      new TableColumn({
        name: "sender_id",
        type: "uuid",
        isNullable: true,
      }))
    await queryRunner.createForeignKey(
      "statements",
      new TableForeignKey({
        name: "FKStatementsUserSender",
        columnNames: ["sender_id"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }),
    )

  }


  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("statements", "FKStatementsUserSender")
    await queryRunner.dropColumn("statements", "sender_id")

  }


}
