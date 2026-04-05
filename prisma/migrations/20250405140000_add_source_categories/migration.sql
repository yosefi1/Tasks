-- CreateTable
CREATE TABLE "SourceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SourceCategory_name_key" ON "SourceCategory"("name");

INSERT INTO "SourceCategory" ("id", "name", "sortOrder", "createdAt") VALUES
('cmig_private', 'Private', 0, CURRENT_TIMESTAMP),
('cmig_work', 'Work', 1, CURRENT_TIMESTAMP);

ALTER TABLE "Source" ADD COLUMN "categoryId" TEXT;

UPDATE "Source" SET "categoryId" = 'cmig_private' WHERE "category" = 'private';
UPDATE "Source" SET "categoryId" = 'cmig_work' WHERE "category" = 'work';
UPDATE "Source" SET "categoryId" = 'cmig_private' WHERE "categoryId" IS NULL;

ALTER TABLE "Source" DROP COLUMN "category";

ALTER TABLE "Source" ALTER COLUMN "categoryId" SET NOT NULL;

ALTER TABLE "Source" ADD CONSTRAINT "Source_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SourceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
