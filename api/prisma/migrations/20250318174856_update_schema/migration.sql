-- AlterTable
ALTER TABLE `User` ADD COLUMN `avatar` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Donor` (
    `donor_id` CHAR(36) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,
    `middle_name` VARCHAR(255) NULL,
    `last_name` VARCHAR(255) NOT NULL,
    `gender` VARCHAR(191) NULL,
    `age` INTEGER NULL,
    `email` VARCHAR(255) NULL,
    `phone_number` VARCHAR(20) NULL,
    `address` VARCHAR(191) NULL,
    `registration_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_donation_date` DATETIME(3) NULL,
    `total_donation_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    `total_donations_count` INTEGER NOT NULL DEFAULT 0,
    `anonymous_donation_preference` BOOLEAN NOT NULL DEFAULT false,
    `interest_domain` VARCHAR(191) NULL,
    `is_merged` BOOLEAN NOT NULL DEFAULT false,
    `is_company` BOOLEAN NOT NULL DEFAULT false,
    `merge_to_donor_id` CHAR(36) NULL,
    `communication_preference` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Donor_email_key`(`email`),
    PRIMARY KEY (`donor_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `tag_id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Tag_name_key`(`name`),
    PRIMARY KEY (`tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DonorTag` (
    `donor_id` CHAR(36) NOT NULL,
    `tag_id` CHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`donor_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DonorTag` ADD CONSTRAINT `DonorTag_donor_id_fkey` FOREIGN KEY (`donor_id`) REFERENCES `Donor`(`donor_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DonorTag` ADD CONSTRAINT `DonorTag_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `Tag`(`tag_id`) ON DELETE CASCADE ON UPDATE CASCADE;
