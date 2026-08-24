CREATE TABLE IF NOT EXISTS exam_papers (
  id VARCHAR(50) PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  drive_url TEXT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  title TEXT NOT NULL,
  year INTEGER NOT NULL CHECK (year BETWEEN 1900 AND 2200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO exam_papers (id, category, drive_url, subject, title, year)
VALUES (
  '0ICJe2jALrvzKlqeNvH7',
  'social_science',
  'https://drive.google.com/uc?export=download&id=1HzOIU5d3fZHv95Y6LOO4GgcStjPCd_9T',
  'អក្សរសាស្ត្រខ្មែរ',
  'វិញ្ញាសាបាក់ឌុបអក្សរសាស្ត្រខ្មែរ២០១៩',
  2019
)
ON CONFLICT (id) DO NOTHING;
