-- Enable Row Level Security on user-owned tables.
-- See research_report_rls.md for the full rationale and pgBouncer notes.

ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- categories
-- Rows with user_id IS NULL are system-wide defaults visible to all
-- authenticated users. Rows with user_id set are private to that user.
-- ---------------------------------------------------------------------------

CREATE POLICY "categories_select"
  ON "categories"
  FOR SELECT
  TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "categories_insert"
  ON "categories"
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "categories_update"
  ON "categories"
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "categories_delete"
  ON "categories"
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- transactions
-- Strict per-user isolation across all four operations.
-- ---------------------------------------------------------------------------

CREATE POLICY "transactions_select"
  ON "transactions"
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "transactions_insert"
  ON "transactions"
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "transactions_update"
  ON "transactions"
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "transactions_delete"
  ON "transactions"
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
