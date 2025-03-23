/*
  Warnings:

  - The primary key for the `Donor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `donor_id` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `interest_domain` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `last_donation_date` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `middle_name` on the `Donor` table. All the data in the column will be lost.
  - You are about to alter the column `gender` on the `Donor` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.
  - The primary key for the `Tag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `tag_id` on the `Tag` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `Tag` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to drop the `DonorTag` table. If the table is not empty, all the data it contains will be lost.
  - The required column `id` was added to the `Donor` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updated_at` to the `Donor` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Tag` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updated_at` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `DonorTag` DROP FOREIGN KEY `DonorTag_donor_id_fkey`;

-- DropForeignKey
ALTER TABLE `DonorTag` DROP FOREIGN KEY `DonorTag_tag_id_fkey`;

-- AlterTable
ALTER TABLE `Donor` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `donor_id`,
    DROP COLUMN `interest_domain`,
    DROP COLUMN `last_donation_date`,
    DROP COLUMN `middle_name`,
    ADD COLUMN `city` TEXT NULL,
    ADD COLUMN `communication_restrictions` VARCHAR(191) NULL,
    ADD COLUMN `contact_phone_type` VARCHAR(191) NULL,
    ADD COLUMN `country` VARCHAR(100) NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `email_restrictions` VARCHAR(191) NULL,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `last_donation_id` VARCHAR(191) NULL,
    ADD COLUMN `nick_name` VARCHAR(255) NULL,
    ADD COLUMN `organization_name` VARCHAR(255) NULL,
    ADD COLUMN `phone_restrictions` VARCHAR(191) NULL,
    ADD COLUMN `postal_code` VARCHAR(20) NULL,
    ADD COLUMN `state` VARCHAR(100) NULL,
    ADD COLUMN `subscription_events_in_person` VARCHAR(191) NULL,
    ADD COLUMN `subscription_events_magazine` VARCHAR(191) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `first_name` VARCHAR(255) NULL,
    MODIFY `last_name` VARCHAR(255) NULL,
    MODIFY `gender` VARCHAR(50) NULL,
    MODIFY `phone_number` VARCHAR(50) NULL,
    MODIFY `address` TEXT NULL,
    MODIFY `registration_date` DATETIME(3) NULL,
    MODIFY `merge_to_donor_id` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Tag` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `tag_id`,
    ADD COLUMN `color` VARCHAR(20) NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `name` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `DonorTag`;

-- CreateTable
CREATE TABLE `Donation` (
    `id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `donation_date` DATETIME(3) NOT NULL,
    `donation_type` VARCHAR(50) NULL,
    `payment_method` VARCHAR(100) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'completed',
    `campaign_id` VARCHAR(191) NULL,
    `event_id` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `is_anonymous` BOOLEAN NOT NULL DEFAULT false,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Donation_donation_date_idx`(`donation_date`),
    INDEX `Donation_campaign_id_idx`(`campaign_id`),
    INDEX `Donation_event_id_idx`(`event_id`),
    INDEX `Donation_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Donor_Donation` (
    `donor_id` VARCHAR(191) NOT NULL,
    `donation_id` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Donor_Donation_donor_id_idx`(`donor_id`),
    INDEX `Donor_Donation_donation_id_idx`(`donation_id`),
    PRIMARY KEY (`donor_id`, `donation_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Donor_Tag` (
    `donor_id` VARCHAR(191) NOT NULL,
    `tag_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Donor_Tag_donor_id_idx`(`donor_id`),
    INDEX `Donor_Tag_tag_id_idx`(`tag_id`),
    PRIMARY KEY (`donor_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Interest_Domain` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Interest_Domain_name_key`(`name`),
    INDEX `Interest_Domain_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Donor_Interest_Domain` (
    `donor_id` VARCHAR(191) NOT NULL,
    `interest_domain_id` VARCHAR(191) NOT NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Donor_Interest_Domain_donor_id_idx`(`donor_id`),
    INDEX `Donor_Interest_Domain_interest_domain_id_idx`(`interest_domain_id`),
    PRIMARY KEY (`donor_id`, `interest_domain_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Communication` (
    `id` VARCHAR(191) NOT NULL,
    `donor_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `direction` VARCHAR(20) NOT NULL,
    `subject` VARCHAR(255) NULL,
    `content` TEXT NULL,
    `status` VARCHAR(50) NOT NULL,
    `communication_date` DATETIME(3) NOT NULL,
    `response_required` BOOLEAN NOT NULL DEFAULT false,
    `response_received` BOOLEAN NOT NULL DEFAULT false,
    `response_date` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `Communication_donor_id_idx`(`donor_id`),
    INDEX `Communication_communication_date_idx`(`communication_date`),
    INDEX `Communication_type_idx`(`type`),
    INDEX `Communication_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Donor_email_idx` ON `Donor`(`email`);

-- CreateIndex
CREATE INDEX `Donor_phone_number_idx` ON `Donor`(`phone_number`);

-- CreateIndex
CREATE INDEX `Donor_last_donation_id_idx` ON `Donor`(`last_donation_id`);

-- CreateIndex
CREATE INDEX `Donor_is_company_idx` ON `Donor`(`is_company`);

-- CreateIndex
CREATE INDEX `Donor_is_merged_idx` ON `Donor`(`is_merged`);

-- CreateIndex
CREATE INDEX `Donor_merge_to_donor_id_idx` ON `Donor`(`merge_to_donor_id`);

-- CreateIndex
CREATE INDEX `Donor_is_deleted_idx` ON `Donor`(`is_deleted`);

-- CreateIndex
CREATE INDEX `Tag_name_idx` ON `Tag`(`name`);

-- AddForeignKey
ALTER TABLE `Donor` ADD CONSTRAINT `Donor_last_donation_id_fkey` FOREIGN KEY (`last_donation_id`) REFERENCES `Donation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Donor` ADD CONSTRAINT `Donor_merge_to_donor_id_fkey` FOREIGN KEY (`merge_to_donor_id`) REFERENCES `Donor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Donor_Donation` ADD CONSTRAINT `Donor_Donation_donor_id_fkey` FOREIGN KEY (`donor_id`) REFERENCES `Donor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Donor_Donation` ADD CONSTRAINT `Donor_Donation_donation_id_fkey` FOREIGN KEY (`donation_id`) REFERENCES `Donation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Donor_Tag` ADD CONSTRAINT `Donor_Tag_donor_id_fkey` FOREIGN KEY (`donor_id`) REFERENCES `Donor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Donor_Tag` ADD CONSTRAINT `Donor_Tag_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Donor_Interest_Domain` ADD CONSTRAINT `Donor_Interest_Domain_donor_id_fkey` FOREIGN KEY (`donor_id`) REFERENCES `Donor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Donor_Interest_Domain` ADD CONSTRAINT `Donor_Interest_Domain_interest_domain_id_fkey` FOREIGN KEY (`interest_domain_id`) REFERENCES `Interest_Domain`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Communication` ADD CONSTRAINT `Communication_donor_id_fkey` FOREIGN KEY (`donor_id`) REFERENCES `Donor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
