-- PostgreSQL Schema for Indian Standards Recommender Engine
-- Aligned with IS_RECOMMENDER_ARCHITECTURE_v3.md (Appendix A)

CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Sources registry table
CREATE TABLE IF NOT EXISTS sources (
  id            BIGSERIAL PRIMARY KEY,
  kind          TEXT NOT NULL CHECK (kind IN ('CATALOGUE','IS_PDF','AMENDMENT_PDF','QCO_PDF','BIS_PAGE','TENDER','ARCHIVE_ORG','OTHER')),
  url           TEXT,
  adapter       TEXT,
  retrieved_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  sha256        TEXT NOT NULL,
  blob_path     TEXT,
  licence_note  TEXT,
  UNIQUE (sha256, kind)
);

-- Master Indian Standards table
CREATE TABLE IF NOT EXISTS standards (
  family_id     TEXT PRIMARY KEY,           -- e.g. 'IS:1786', 'IS:771:P6', 'IS:12970:P3:S2'
  prefix        TEXT NOT NULL DEFAULT 'IS',
  number        TEXT NOT NULL,              -- e.g. '1786', '771'
  part          TEXT,                       -- e.g. '6', '1'
  section       TEXT,                       -- e.g. '2'
  title_en      TEXT NOT NULL,
  title_hi      TEXT,
  scope_text    TEXT,
  ics_class     TEXT,
  aspect        TEXT,
  committee     TEXT,                       -- e.g. 'Sanitary Appliances and Water Fittings (CED 3)'
  committee_code TEXT,                      -- e.g. 'CED 3', 'LITD 5', 'MTD 4'
  division      TEXT,                       -- e.g. 'Civil Engineering', 'Electronics and IT'
  tier          TEXT NOT NULL DEFAULT 'CATALOGUE_EVIDENCE' CHECK (tier IN ('CLAUSE_EVIDENCE','CATALOGUE_EVIDENCE')),
  raw_id        TEXT,                       -- as printed (e.g. 'IS 771-6')
  status        TEXT NOT NULL DEFAULT 'CURRENT' CHECK (status IN ('CURRENT','WITHDRAWN','UNDER_REVISION','SUPERSEDED','UNKNOWN')),
  num_amendments INT DEFAULT 0,
  year          INT,
  source_id     BIGINT REFERENCES sources(id),
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Trigram index for fast fuzzy title search
CREATE INDEX IF NOT EXISTS standards_title_trgm ON standards USING gin (title_en gin_trgm_ops);
CREATE INDEX IF NOT EXISTS standards_number_idx ON standards (number);
CREATE INDEX IF NOT EXISTS standards_committee_code_idx ON standards (committee_code);
CREATE INDEX IF NOT EXISTS standards_division_idx ON standards (division);

-- Editions and version chains
CREATE TABLE IF NOT EXISTS editions (
  id              BIGSERIAL PRIMARY KEY,
  family_id       TEXT NOT NULL REFERENCES standards(family_id) ON DELETE CASCADE,
  year            INT,
  reaffirmed_year INT,
  status          TEXT NOT NULL DEFAULT 'CURRENT' CHECK (status IN ('CURRENT','REAFFIRMED','AMENDED','UNDER_REVISION','SUPERSEDED','WITHDRAWN','UNKNOWN')),
  status_source_id BIGINT REFERENCES sources(id),
  superseded_by   TEXT REFERENCES standards(family_id),
  effective_from  DATE,
  effective_to    DATE,
  retrieved_at    TIMESTAMPTZ DEFAULT now()
);

-- Allied Standards Graph (Edges)
CREATE TABLE IF NOT EXISTS edges (
  id            BIGSERIAL PRIMARY KEY,
  src_family_id TEXT NOT NULL REFERENCES standards(family_id) ON DELETE CASCADE,
  dst_family_id TEXT NOT NULL REFERENCES standards(family_id) ON DELETE CASCADE,
  edge_type     TEXT NOT NULL CHECK (edge_type IN ('PRIMARY','TEST_METHOD','TERMINOLOGY','SAFETY','INSTALLATION','MATERIAL','RELATED_PRODUCT','INTL_EQUIVALENT','SUPERSEDES','AMENDS')),
  provenance    TEXT NOT NULL CHECK (provenance IN ('DECLARED_CATALOGUE','DECLARED_TEXT','CATALOGUE_STATUS','QCO_TABLE','COMMITTEE_COUNCIL','INFERRED_CITATION','INFERRED_STATISTICAL')),
  confidence    REAL NOT NULL DEFAULT 1.0,
  source_id     BIGINT REFERENCES sources(id),
  UNIQUE (src_family_id, dst_family_id, edge_type, provenance)
);

CREATE INDEX IF NOT EXISTS edges_src ON edges(src_family_id);
CREATE INDEX IF NOT EXISTS edges_dst ON edges(dst_family_id);
CREATE INDEX IF NOT EXISTS edges_type ON edges(edge_type);

-- Compulsory Certification & Quality Control Orders (QCO)
CREATE TABLE IF NOT EXISTS cert_rules (
  id             BIGSERIAL PRIMARY KEY,
  scheme         TEXT NOT NULL CHECK (scheme IN ('ISI_MARK','CRS','HALLMARK','OTHER')),
  order_title    TEXT NOT NULL,
  issuing_authority TEXT,
  gazette_ref    TEXT,
  notified_on    DATE,
  effective_date DATE,
  effective_note TEXT,
  status         TEXT NOT NULL DEFAULT 'IN_FORCE' CHECK (status IN ('IN_FORCE','NOT_YET_IN_FORCE','RESCINDED','REINSTATED','REQUIRES_VERIFICATION')),
  source_id      BIGINT REFERENCES sources(id),
  last_verified  TIMESTAMPTZ DEFAULT now()
);

-- Map goods / product items in QCOs to IS standards
CREATE TABLE IF NOT EXISTS cert_rule_items (
  id          BIGSERIAL PRIMARY KEY,
  rule_id     BIGINT NOT NULL REFERENCES cert_rules(id) ON DELETE CASCADE,
  goods_text  TEXT NOT NULL,
  is_number   TEXT,                       -- original text e.g. 'IS 12330'
  family_id   TEXT REFERENCES standards(family_id),
  hs_code     TEXT
);

CREATE INDEX IF NOT EXISTS cert_items_family_idx ON cert_rule_items(family_id);
CREATE INDEX IF NOT EXISTS cert_items_goods_trgm ON cert_rule_items USING gin (goods_text gin_trgm_ops);
