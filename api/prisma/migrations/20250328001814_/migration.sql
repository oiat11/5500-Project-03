/*
  Warnings:

  - You are about to drop the column `address` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `anonymous_donation_preference` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `is_company` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `is_merged` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `last_donation_date` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `last_donation_id` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `merge_to_donor_id` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `middle_name` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `postal_code` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `registration_date` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `total_donations_count` on the `Donor` table. All the data in the column will be lost.
  - You are about to alter the column `communication_preference` on the `Donor` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(4))`.
  - You are about to drop the `Communication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Donation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Donor_Donation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Donor_Interest_Domain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Interest_Domain` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `pmm` to the `Donor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street_address` to the `Donor` table without a default value. This is not possible if the table is not empty.
  - Made the column `first_name` on table `Donor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `last_name` on table `Donor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `Donor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contact_phone_type` on table `Donor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subscription_events_in_person` on table `Donor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subscription_events_magazine` on table `Donor` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Communication` DROP FOREIGN KEY `Communication_donor_id_fkey`;

-- DropForeignKey
ALTER TABLE `Donor` DROP FOREIGN KEY `Donor_last_donation_id_fkey`;

-- DropForeignKey
ALTER TABLE `Donor` DROP FOREIGN KEY `Donor_merge_to_donor_id_fkey`;

-- DropForeignKey
ALTER TABLE `Donor_Donation` DROP FOREIGN KEY `Donor_Donation_donation_id_fkey`;

-- DropForeignKey
ALTER TABLE `Donor_Donation` DROP FOREIGN KEY `Donor_Donation_donor_id_fkey`;

-- DropForeignKey
ALTER TABLE `Donor_Interest_Domain` DROP FOREIGN KEY `Donor_Interest_Domain_donor_id_fkey`;

-- DropForeignKey
ALTER TABLE `Donor_Interest_Domain` DROP FOREIGN KEY `Donor_Interest_Domain_interest_domain_id_fkey`;

-- DropIndex
DROP INDEX `Donor_email_idx` ON `Donor`;

-- DropIndex
DROP INDEX `Donor_email_key` ON `Donor`;

-- DropIndex
DROP INDEX `Donor_is_company_idx` ON `Donor`;

-- DropIndex
DROP INDEX `Donor_is_deleted_idx` ON `Donor`;

-- DropIndex
DROP INDEX `Donor_is_merged_idx` ON `Donor`;

-- DropIndex
DROP INDEX `Donor_last_donation_id_idx` ON `Donor`;

-- DropIndex
DROP INDEX `Donor_merge_to_donor_id_idx` ON `Donor`;

-- DropIndex
DROP INDEX `Donor_phone_number_idx` ON `Donor`;

-- AlterTable
ALTER TABLE `Donor` DROP COLUMN `address`,
    DROP COLUMN `age`,
    DROP COLUMN `anonymous_donation_preference`,
    DROP COLUMN `country`,
    DROP COLUMN `email`,
    DROP COLUMN `gender`,
    DROP COLUMN `is_company`,
    DROP COLUMN `is_merged`,
    DROP COLUMN `last_donation_date`,
    DROP COLUMN `last_donation_id`,
    DROP COLUMN `merge_to_donor_id`,
    DROP COLUMN `middle_name`,
    DROP COLUMN `phone_number`,
    DROP COLUMN `postal_code`,
    DROP COLUMN `registration_date`,
    DROP COLUMN `state`,
    DROP COLUMN `total_donations_count`,
    ADD COLUMN `deceased` BOOLEAN NULL,
    ADD COLUMN `exclude` BOOLEAN NULL,
    ADD COLUMN `first_gift_date` DATETIME(3) NULL,
    ADD COLUMN `largest_gift_amount` DECIMAL(10, 2) NULL,
    ADD COLUMN `largest_gift_appeal` VARCHAR(255) NULL,
    ADD COLUMN `last_gift_amount` DECIMAL(10, 2) NULL,
    ADD COLUMN `last_gift_appeal` VARCHAR(255) NULL,
    ADD COLUMN `last_gift_date` DATETIME(3) NULL,
    ADD COLUMN `last_gift_request` VARCHAR(255) NULL,
    ADD COLUMN `pmm` VARCHAR(191) NOT NULL,
    ADD COLUMN `street_address` TEXT NOT NULL,
    ADD COLUMN `total_pledge` DECIMAL(10, 2) NULL,
    ADD COLUMN `unit_number` VARCHAR(255) NULL,
    MODIFY `first_name` VARCHAR(255) NOT NULL,
    MODIFY `last_name` VARCHAR(255) NOT NULL,
    MODIFY `total_donation_amount` DECIMAL(10, 2) NULL DEFAULT 0,
    MODIFY `communication_preference` ENUM('Thank_you', 'Magazine', 'Inspiration_event', 'Newsletter', 'Survey', 'Holiday_Card', 'Event', 'Appeal', 'Research_update') NULL,
    MODIFY `city` ENUM('Victoria', 'Nanaimo', 'Courtenay', 'Parksville', 'Campbell_River', 'Saanich', 'Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'North_Vancouver', 'White_Rock', 'Coquitlam', 'West_Vancouver', 'New_Westminster', 'Prince_George', 'Williams_Lake', 'Delta', 'Abbotsford', 'Maple_Ridge', 'Kelowna', 'Langley', 'Port_Coquitlam', 'Vernon', 'Kamloops', 'Salmon_Arm') NOT NULL,
    MODIFY `contact_phone_type` ENUM('Home', 'Work', 'Mobile') NOT NULL,
    MODIFY `subscription_events_in_person` ENUM('Opt_out', 'Opt_in') NOT NULL,
    MODIFY `subscription_events_magazine` ENUM('Opt_out', 'Opt_in') NOT NULL;

-- DropTable
DROP TABLE `Communication`;

-- DropTable
DROP TABLE `Donation`;

-- DropTable
DROP TABLE `Donor_Donation`;

-- DropTable
DROP TABLE `Donor_Interest_Domain`;

-- DropTable
DROP TABLE `Interest_Domain`;

-- CreateTable
CREATE TABLE `Event` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `date` DATETIME(3) NOT NULL,
    `location` TEXT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Event_name_key`(`name`),
    INDEX `Event_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Donor_Event` (
    `donor_id` VARCHAR(191) NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `status` ENUM('invited', 'confirmed', 'declined') NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Donor_Event_donor_id_idx`(`donor_id`),
    INDEX `Donor_Event_event_id_idx`(`event_id`),
    PRIMARY KEY (`donor_id`, `event_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_EventTags` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_EventTags_AB_unique`(`A`, `B`),
    INDEX `_EventTags_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Donor_last_name_idx` ON `Donor`(`last_name`);

-- CreateIndex
CREATE INDEX `Donor_organization_name_idx` ON `Donor`(`organization_name`);

-- CreateIndex
CREATE INDEX `Donor_city_idx` ON `Donor`(`city`);

-- CreateIndex
CREATE INDEX `Donor_exclude_idx` ON `Donor`(`exclude`);

-- CreateIndex
CREATE INDEX `Donor_deceased_idx` ON `Donor`(`deceased`);

-- CreateIndex
CREATE INDEX `Donor_pmm_idx` ON `Donor`(`pmm`);

-- CreateIndex
CREATE INDEX `Donor_communication_preference_idx` ON `Donor`(`communication_preference`);

-- CreateIndex
CREATE INDEX `Donor_subscription_events_in_person_idx` ON `Donor`(`subscription_events_in_person`);

-- CreateIndex
CREATE INDEX `Donor_subscription_events_magazine_idx` ON `Donor`(`subscription_events_magazine`);

-- CreateIndex
CREATE INDEX `Donor_created_at_idx` ON `Donor`(`created_at`);

-- AddForeignKey
ALTER TABLE `Donor_Event` ADD CONSTRAINT `Donor_Event_donor_id_fkey` FOREIGN KEY (`donor_id`) REFERENCES `Donor`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Donor_Event` ADD CONSTRAINT `Donor_Event_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EventTags` ADD CONSTRAINT `_EventTags_A_fkey` FOREIGN KEY (`A`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_EventTags` ADD CONSTRAINT `_EventTags_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
