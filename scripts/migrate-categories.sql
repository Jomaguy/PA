-- Optional: Migrate existing categories to life roles
-- ⚠️  WARNING: This is OPTIONAL - the system works fine without this migration!
-- ⚠️  Only run this if you want to convert ALL existing todos to use new life role IDs

-- Backup existing data first (recommended)
-- CREATE TABLE todos_backup AS SELECT * FROM todos;

-- Migrate common categories to life roles
UPDATE todos SET category = 'health' WHERE category = 'Health';
UPDATE todos SET category = 'personal_dev' WHERE category = 'Learning';
UPDATE todos SET category = 'finance' WHERE category = 'Shopping';
UPDATE todos SET category = 'other' WHERE category = 'Personal';

-- You can add more specific mappings based on your data:
-- UPDATE todos SET category = 'tennis_coach' WHERE category = 'Work' AND (title ILIKE '%tennis%' OR title ILIKE '%coach%' OR title ILIKE '%lesson%');
-- UPDATE todos SET category = 'miss_money_penny' WHERE category = 'Work' AND (title ILIKE '%money penny%' OR title ILIKE '%project%');
-- UPDATE todos SET category = 'branch' WHERE category = 'Work' AND title ILIKE '%branch%';

-- Leave other categories as-is for now
-- UPDATE todos SET category = 'other' WHERE category NOT IN ('tennis_coach', 'relationship', 'family', 'miss_money_penny', 'branch', 'finance', 'health', 'personal_dev', 'other');

-- Verify the migration
-- SELECT category, COUNT(*) as count FROM todos GROUP BY category ORDER BY count DESC;
