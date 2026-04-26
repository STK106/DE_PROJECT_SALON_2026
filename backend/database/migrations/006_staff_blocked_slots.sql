-- Add staff_id to blocked_slots to support per-staff availability blocks
ALTER TABLE blocked_slots ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES staff(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_blocked_slots_staff ON blocked_slots(staff_id);
