-- =========================================================
-- Mózg Serwisowy — schemat bazy danych
-- =========================================================

-- Klienci
CREATE TABLE customers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name  TEXT NOT NULL,
  phone      TEXT,
  email      TEXT,
  address    TEXT,
  city       TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_customers_name ON customers USING gin(to_tsvector('simple', full_name));
CREATE INDEX idx_customers_phone ON customers(phone);

-- Kategorie usług
CREATE TABLE service_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  base_price  NUMERIC(10,2),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Status zleceń
CREATE TYPE job_status AS ENUM ('nowe', 'w_trakcie', 'zakonczone', 'oplacone');

-- Zlecenia
CREATE TABLE jobs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      UUID REFERENCES customers(id) ON DELETE SET NULL,
  category_id      UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  status           job_status NOT NULL DEFAULT 'nowe',
  scheduled_at     TIMESTAMPTZ,
  scheduled_end_at TIMESTAMPTZ,
  address          TEXT,
  notes            TEXT,
  revenue          NUMERIC(10,2) DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_jobs_customer ON jobs(customer_id);
CREATE INDEX idx_jobs_status   ON jobs(status);
CREATE INDEX idx_jobs_date     ON jobs(scheduled_at);

-- Koszty zleceń
CREATE TABLE job_costs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id      UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount      NUMERIC(10,2) NOT NULL,
  cost_date   DATE DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_costs_job ON job_costs(job_id);

-- Zdjęcia zleceń
CREATE TABLE job_photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id       UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url   TEXT,
  caption      TEXT,
  photo_type   TEXT CHECK (photo_type IN ('before','after','other')) DEFAULT 'other',
  created_at   TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_photos_job ON job_photos(job_id);

-- Historia czatu z agentem
CREATE TABLE chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role       TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content    TEXT NOT NULL,
  tool_calls JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ustawienia aplikacji
CREATE TABLE app_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO app_settings (key, value) VALUES
  ('business_name', '"Mój Serwis"'),
  ('owner_name',    '"Jan Kowalski"'),
  ('currency',      '"PLN"');

-- Domyślne kategorie usług
INSERT INTO service_categories (name, description, base_price) VALUES
  ('Montaż okna',         'Montaż nowego okna z uszczelnieniem',        500.00),
  ('Montaż drzwi',        'Montaż drzwi zewnętrznych lub wewnętrznych', 600.00),
  ('Serwis okuć',         'Regulacja i naprawa okuć okiennych',          150.00),
  ('Wymiana szyby',       'Wymiana uszkodzonej szyby',                   300.00),
  ('Regulacja okna',      'Regulacja zawiasów i uszczelnienia',          100.00),
  ('Montaż rolety',       'Montaż rolety zewnętrznej lub wewnętrznej',   400.00),
  ('Naprawa rolety',      'Serwis i naprawa rolety',                     200.00),
  ('Uszczelnienie',       'Wymiana lub uzupełnienie uszczelek',          120.00);

-- Funkcja agregatu miesięcznego
CREATE OR REPLACE FUNCTION monthly_summary(p_year INT, p_month INT)
RETURNS TABLE(
  total_revenue NUMERIC,
  total_costs   NUMERIC,
  profit        NUMERIC,
  job_count     INT
) AS $$
  SELECT
    COALESCE(SUM(j.revenue), 0)          AS total_revenue,
    COALESCE(SUM(c.total_cost), 0)       AS total_costs,
    COALESCE(SUM(j.revenue), 0)
      - COALESCE(SUM(c.total_cost), 0)   AS profit,
    COUNT(j.id)::INT                     AS job_count
  FROM jobs j
  LEFT JOIN (
    SELECT job_id, SUM(amount) AS total_cost
    FROM job_costs GROUP BY job_id
  ) c ON c.job_id = j.id
  WHERE
    EXTRACT(YEAR  FROM j.scheduled_at) = p_year
    AND EXTRACT(MONTH FROM j.scheduled_at) = p_month
    AND j.status IN ('zakonczone','oplacone');
$$ LANGUAGE sql STABLE;

-- RLS — dostęp tylko dla zalogowanego użytkownika
ALTER TABLE customers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_costs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_photos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_only" ON customers       FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_only" ON service_categories FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_only" ON jobs            FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_only" ON job_costs       FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_only" ON job_photos      FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_only" ON chat_messages   FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "authenticated_only" ON app_settings    FOR ALL USING (auth.uid() IS NOT NULL);
