ALTER TABLE "users"
ADD COLUMN "age" INTEGER,
ADD COLUMN "weight" DECIMAL(8, 2),
ADD COLUMN "height" DECIMAL(8, 2),
ADD COLUMN "activity_level" TEXT,
ADD COLUMN "training_experience" TEXT;

ALTER TABLE "plateau_flags"
ADD COLUMN "resolved" BOOLEAN NOT NULL DEFAULT false;
