-- ============================================================================
-- SCRIPT DE SEGURIDAD: USUARIO DE SOLO LECTURA PARA AGENTE DE IA EN n8n
-- Estudiante: Jared Prendas Ramírez
-- Asignatura: Bases de Datos - Laboratorio #3
-- ============================================================================

-- Por principio de mínimo privilegio (Least Privilege Principle), un agente
-- de IA que consulta la base de datos a través de modelos de lenguaje (LLM)
-- NUNCA debe conectarse con credenciales de administrador (root o similar),
-- para prevenir inyecciones accidentales o maliciosas de DDL/DML destructivo
-- (DROP, DELETE, UPDATE, INSERT, ALTER).

-- 1. Crear el usuario exclusivo para n8n con autenticación segura:
CREATE USER IF NOT EXISTS 'aduanas_readonly'@'%' IDENTIFIED BY 'Aduana2026#ReadOnlySecure';

-- 2. Limitar al usuario para que ÚNICAMENTE pueda ejecutar sentencias SELECT
--    sobre la base de datos del inventario aduanero:
GRANT SELECT ON aduana_inventario.* TO 'aduanas_readonly'@'%';

-- 3. Revocar explícitamente cualquier permiso de inserción, modificación o borrado:
REVOKE INSERT, UPDATE, DELETE, DROP, ALTER, CREATE, EXECUTE, REFERENCES ON aduana_inventario.* FROM 'aduanas_readonly'@'%';

-- 4. Aplicar cambios de privilegios en el motor MySQL:
FLUSH PRIVILEGES;

-- 5. Consulta de verificación de privilegios otorgados:
SHOW GRANTS FOR 'aduanas_readonly'@'%';

-- ============================================================================
-- EQUIVALENTE EN POSTGRESQL (si se utiliza Supabase / Neon / Postgres local):
-- ============================================================================
-- CREATE USER aduanas_readonly WITH PASSWORD 'Aduana2026#ReadOnlySecure';
-- GRANT CONNECT ON DATABASE aduana_inventario TO aduanas_readonly;
-- GRANT USAGE ON SCHEMA public TO aduanas_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO aduanas_readonly;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO aduanas_readonly;

