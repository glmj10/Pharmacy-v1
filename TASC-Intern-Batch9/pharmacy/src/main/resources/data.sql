INSERT INTO roles (name, code, description)
SELECT * FROM (
                  SELECT 'Admin' AS name, 'ROLE_ADMIN' AS code, 'Administrator with full system access' AS description
              ) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE code = 'ROLE_ADMIN'
);

INSERT INTO roles (name, code, description)
SELECT * FROM (
                  SELECT 'User' AS name, 'ROLE_USER' AS code, 'Regular user with basic permissions' AS description
              ) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE code = 'ROLE_USER'
);

INSERT INTO roles (name, code, description)
SELECT * FROM (
                  SELECT 'Staff' AS name, 'ROLE_STAFF' AS code, 'Staff member with elevated permissions' AS description
              ) AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE code = 'ROLE_STAFF'
);