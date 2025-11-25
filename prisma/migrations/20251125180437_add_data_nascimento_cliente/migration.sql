/*
  Warnings:

  - Made the column `senha` on table `clientes` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "dataNascimento" TIMESTAMP(3),
ALTER COLUMN "senha" SET NOT NULL;
