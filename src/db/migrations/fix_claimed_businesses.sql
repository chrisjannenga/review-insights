-- First drop the existing foreign key constraint
ALTER TABLE claimed_businesses
DROP CONSTRAINT IF EXISTS claimed_businesses_user_id_users_id_fk;

-- Rename the column
ALTER TABLE claimed_businesses
RENAME COLUMN user_id TO "userId";

-- Add the foreign key constraint back with the new column name
ALTER TABLE claimed_businesses
ADD CONSTRAINT claimed_businesses_userId_users_id_fk
FOREIGN KEY ("userId") REFERENCES users(id); 