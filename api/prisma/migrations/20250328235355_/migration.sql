-- AlterTable
ALTER TABLE `Donor` MODIFY `contact_phone_type` ENUM('Home', 'Work', 'Mobile') NULL,
    MODIFY `subscription_events_in_person` ENUM('Opt_out', 'Opt_in') NULL,
    MODIFY `subscription_events_magazine` ENUM('Opt_out', 'Opt_in') NULL;

-- AlterTable
ALTER TABLE `Event` ADD COLUMN `donor_count` INTEGER NULL,
    ADD COLUMN `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    MODIFY `date` DATETIME(3) NULL;
