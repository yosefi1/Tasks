-- TaskCategoryStyle: colors for Work / Personal tabs
CREATE TABLE "TaskCategoryStyle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "TaskCategoryStyle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TaskCategoryStyle_slug_key" ON "TaskCategoryStyle"("slug");

INSERT INTO "TaskCategoryStyle" ("id", "slug", "color") VALUES
('tcss_personal', 'personal', '#8b5cf6'),
('tcss_work', 'work', '#0ea5e9');

-- Per-task stripe override
ALTER TABLE "Task" ADD COLUMN "accentColor" TEXT;

-- Source category accent
ALTER TABLE "SourceCategory" ADD COLUMN "color" TEXT;
