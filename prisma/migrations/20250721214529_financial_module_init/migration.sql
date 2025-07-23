-- AlterEnum
ALTER TYPE "FinancialEntryStatus" ADD VALUE 'PARTIALLY_PAID';

-- AlterTable
ALTER TABLE "financial_entries" ADD COLUMN     "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "bankAccountId" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bankName" TEXT,
    "accountNo" TEXT,
    "clabe" TEXT,
    "initialBalance" DECIMAL(10,2) NOT NULL,
    "currentBalance" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_entries" ADD CONSTRAINT "financial_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
