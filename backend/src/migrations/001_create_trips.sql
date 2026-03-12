CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS trips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lt          TEXT UNIQUE NOT NULL,
  tipo_veiculo TEXT NOT NULL DEFAULT 'truck',
  eta_plan    TIMESTAMPTZ,
  cpt_plan    TIMESTAMPTZ,
  turno       TEXT,
  date_soc    DATE,
  status      TEXT,
  destino     TEXT,
  hub         TEXT,
  shipments   INTEGER,
  is_spot     BOOLEAN NOT NULL DEFAULT false,
  placa       TEXT,
  rota        TEXT,
  lh          TEXT,
  estacao     TEXT,
  tres_pl     TEXT,
  driver      TEXT,
  pct         INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS trips_date_soc_idx ON trips(date_soc);
CREATE INDEX IF NOT EXISTS trips_turno_idx ON trips(turno);
CREATE INDEX IF NOT EXISTS trips_status_idx ON trips(status);
