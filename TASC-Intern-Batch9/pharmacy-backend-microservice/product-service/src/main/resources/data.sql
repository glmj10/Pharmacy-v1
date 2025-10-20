INSERT INTO types (code, name, description)
SELECT * FROM (
                  SELECT 'BLOG' AS name, 'BLOG' AS code, 'BLOG' AS description
              ) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM types WHERE code = 'BLOG'
);

INSERT INTO types (code, name, description)
SELECT * FROM (
                  SELECT 'PRODUCT' AS name, 'PRODUCT' AS code, 'PRODUCT' AS description
              ) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM types WHERE code = 'PRODUCT'
);