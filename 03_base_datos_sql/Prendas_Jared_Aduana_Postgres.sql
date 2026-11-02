-- ============================================================================
-- LABORATORIO #3 | SISTEMA DE INVENTARIO ADUANERO
-- Asignatura: Bases de Datos
-- Estudiante: Jared Prendas Ramírez
-- Gestor Oficial: MySQL 8.0+ / MariaDB
-- Fecha de entrega: Noviembre 2026
-- Descripción: Diseño e implementación de base de datos relacional para control
--              aduanero (DUAs, contenedores, mercancías, bodegas, aranceles e
--              inspecciones), con datos de prueba realistas y consultas analíticas.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. PREPARACIÓN DEL ENTORNO Y BASE DE DATOS
-- ----------------------------------------------------------------------------
-- PostgreSQL version: run inside database aduana_inventario
-- CREATE DATABASE aduana_inventario;

-- ----------------------------------------------------------------------------
-- 1. CREACIÓN DE TABLAS (DDL) CON RESTRICCIONES E INTEGRIDAD REFERENCIAL
-- ----------------------------------------------------------------------------

-- Tabla 1: Catálogo de Países de Origen y Destino
CREATE TABLE pais (
    id_pais SERIAL PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    codigo_iso CHAR(2) NOT NULL UNIQUE,
    continente VARCHAR(40) NOT NULL,
    acuerdo_comercial BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_codigo_iso CHECK (LENGTH(codigo_iso) = 2)
) ;

-- Tabla 2: Partidas Arancelarias (Sistema Armonizado / SAC)
CREATE TABLE categoria_arancelaria (
    id_categoria SERIAL PRIMARY KEY,
    codigo_partida VARCHAR(20) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NOT NULL,
    porcentaje_arancel DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    requiere_permiso BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT chk_arancel_rango CHECK (porcentaje_arancel >= 0.00 AND porcentaje_arancel <= 100.00)
) ;

-- Tabla 3: Agentes Aduanales Acreditados
CREATE TABLE agente_aduanal (
    id_agente SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(120) NOT NULL,
    numero_licencia VARCHAR(30) NOT NULL UNIQUE,
    agencia_aduanal VARCHAR(150) NOT NULL,
    telefono VARCHAR(25) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    estado_licencia VARCHAR(20) NOT NULL DEFAULT 'Activa',
    CONSTRAINT chk_estado_licencia CHECK (estado_licencia IN ('Activa', 'Suspendida', 'Inactiva'))
) ;

-- Tabla 4: Funcionarios de Aduana (Incluye Relación Recursiva de Jerarquía/Supervisor)
CREATE TABLE funcionario (
    id_funcionario SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(120) NOT NULL,
    codigo_empleado VARCHAR(20) NOT NULL UNIQUE,
    cargo VARCHAR(80) NOT NULL,
    departamento VARCHAR(80) NOT NULL DEFAULT 'Aforo y Fiscalizacion',
    correo_institucional VARCHAR(100) NOT NULL UNIQUE,
    id_supervisor INT NULL,
    FOREIGN KEY (id_supervisor) REFERENCES funcionario(id_funcionario)
        ON UPDATE CASCADE ON DELETE SET NULL
) ;

-- Tabla 5: Bodegas y Depósitos Fiscales Aduaneros
CREATE TABLE bodega (
    id_bodega SERIAL PRIMARY KEY,
    codigo_bodega VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(150) NOT NULL,
    capacidad_maxima_m3 DECIMAL(10,2) NOT NULL,
    temperatura_controlada BOOLEAN NOT NULL DEFAULT FALSE,
    estado_operativo VARCHAR(20) NOT NULL DEFAULT 'Operativa',
    CONSTRAINT chk_capacidad_bodega CHECK (capacidad_maxima_m3 > 0),
    CONSTRAINT chk_estado_bodega CHECK (estado_operativo IN ('Operativa', 'En Mantenimiento', 'Saturada'))
) ;

-- Tabla 6: Operadores Comerciales (Importadores y Exportadores)
CREATE TABLE operador_comercial (
    id_operador SERIAL PRIMARY KEY,
    razon_social VARCHAR(150) NOT NULL,
    identificacion_tributaria VARCHAR(30) NOT NULL UNIQUE,
    tipo_operador VARCHAR(20) NOT NULL DEFAULT 'Importador',
    direccion VARCHAR(200) NOT NULL,
    telefono VARCHAR(25) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    id_pais_sede INT NOT NULL,
    CONSTRAINT chk_tipo_operador CHECK (tipo_operador IN ('Importador', 'Exportador', 'Ambos')),
    FOREIGN KEY (id_pais_sede) REFERENCES pais(id_pais)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ;

-- Tabla 7: Mercancías y Productos
CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    codigo_sku VARCHAR(40) NOT NULL UNIQUE,
    descripcion VARCHAR(180) NOT NULL,
    unidad_medida VARCHAR(30) NOT NULL DEFAULT 'Unidades',
    valor_unitario_usd DECIMAL(12,2) NOT NULL,
    peso_unitario_kg DECIMAL(8,2) NOT NULL DEFAULT 1.00,
    id_categoria INT NOT NULL,
    CONSTRAINT chk_valor_unitario CHECK (valor_unitario_usd > 0),
    CONSTRAINT chk_peso_unitario CHECK (peso_unitario_kg > 0),
    FOREIGN KEY (id_categoria) REFERENCES categoria_arancelaria(id_categoria)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ;

-- Tabla 8: Declaraciones Únicas Aduaneras (DUA)
CREATE TABLE declaracion_aduanera (
    id_declaracion SERIAL PRIMARY KEY,
    numero_dua VARCHAR(30) NOT NULL UNIQUE,
    fecha_registro DATE NOT NULL,
    regimen VARCHAR(25) NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'Registrada',
    total_cif_usd DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    arancel_total_usd DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    id_operador INT NOT NULL,
    id_agente INT NOT NULL,
    id_pais_origen INT NOT NULL,
    CONSTRAINT chk_regimen CHECK (regimen IN ('Importacion', 'Exportacion', 'Transito', 'Deposito')),
    CONSTRAINT chk_estado_dua CHECK (estado IN ('Registrada', 'En Inspeccion', 'Retenida', 'Pendiente de Pago', 'Liberada', 'Despachada')),
    FOREIGN KEY (id_operador) REFERENCES operador_comercial(id_operador)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_agente) REFERENCES agente_aduanal(id_agente)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_pais_origen) REFERENCES pais(id_pais)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ;

-- Tabla 9: Detalle de Declaración (Relación N:M entre Declaración y Producto)
CREATE TABLE detalle_declaracion (
    id_detalle SERIAL PRIMARY KEY,
    id_declaracion INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    valor_declarado_usd DECIMAL(12,2) NOT NULL,
    arancel_aplicado_usd DECIMAL(12,2) NOT NULL,
    CONSTRAINT chk_cantidad_detalle CHECK (cantidad > 0),
    CONSTRAINT chk_valor_declarado CHECK (valor_declarado_usd > 0),
    CONSTRAINT uq_declaracion_producto UNIQUE (id_declaracion, id_producto),
    FOREIGN KEY (id_declaracion) REFERENCES declaracion_aduanera(id_declaracion)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ;

-- Tabla 10: Contenedores Físicos Asociados a la Carga
CREATE TABLE contenedor (
    id_contenedor SERIAL PRIMARY KEY,
    numero_contenedor VARCHAR(20) NOT NULL UNIQUE,
    tipo_contenedor VARCHAR(30) NOT NULL,
    peso_bruto_kg DECIMAL(10,2) NOT NULL,
    temperatura_setpoint_c DECIMAL(4,1) NULL,
    id_declaracion INT NOT NULL,
    CONSTRAINT chk_tipo_contenedor CHECK (tipo_contenedor IN ('20ft Dry', '40ft Dry High Cube', '40ft Refrigerado', 'Open Top', 'Flat Rack')),
    CONSTRAINT chk_peso_bruto CHECK (peso_bruto_kg > 0),
    FOREIGN KEY (id_declaracion) REFERENCES declaracion_aduanera(id_declaracion)
        ON UPDATE CASCADE ON DELETE CASCADE
) ;

-- Tabla 11: Inventario y Control de Stock en Bodegas
CREATE TABLE inventario_stock (
    id_stock SERIAL PRIMARY KEY,
    id_bodega INT NOT NULL,
    id_producto INT NOT NULL,
    id_declaracion INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 0,
    fecha_ingreso DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado_stock VARCHAR(30) NOT NULL DEFAULT 'Retenido',
    observacion VARCHAR(255) NULL,
    CONSTRAINT chk_cantidad_stock CHECK (cantidad >= 0),
    CONSTRAINT chk_estado_stock CHECK (estado_stock IN ('Retenido', 'En Cuarentena', 'En Tramite', 'Liberado', 'Despachado')),
    CONSTRAINT uq_stock_bodega_prod_dua UNIQUE (id_bodega, id_producto, id_declaracion),
    FOREIGN KEY (id_bodega) REFERENCES bodega(id_bodega)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_declaracion) REFERENCES declaracion_aduanera(id_declaracion)
        ON UPDATE CASCADE ON DELETE CASCADE
) ;

-- Tabla 12: Inspecciones Aduaneras (Aforo Físico y Documental)
CREATE TABLE inspeccion (
    id_inspeccion SERIAL PRIMARY KEY,
    fecha_inspeccion DATETIME NOT NULL,
    canal_asignado VARCHAR(15) NOT NULL,
    resultado VARCHAR(30) NOT NULL,
    observaciones TEXT NULL,
    id_declaracion INT NOT NULL,
    id_funcionario INT NOT NULL,
    CONSTRAINT chk_canal CHECK (canal_asignado IN ('Verde', 'Amarillo', 'Rojo')),
    CONSTRAINT chk_resultado_insp CHECK (resultado IN ('Conforme', 'Con Observaciones', 'Retenido por Infraccion', 'Decomisado')),
    FOREIGN KEY (id_declaracion) REFERENCES declaracion_aduanera(id_declaracion)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (id_funcionario) REFERENCES funcionario(id_funcionario)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ;

-- Tabla 13: Movimientos y Trazabilidad de Inventario
CREATE TABLE movimiento_inventario (
    id_movimiento SERIAL PRIMARY KEY,
    tipo_movimiento VARCHAR(25) NOT NULL,
    fecha_movimiento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cantidad INT NOT NULL,
    motivo VARCHAR(180) NOT NULL,
    id_producto INT NOT NULL,
    id_bodega_origen INT NULL,
    id_bodega_destino INT NULL,
    id_funcionario INT NOT NULL,
    CONSTRAINT chk_tipo_mov CHECK (tipo_movimiento IN ('Ingreso', 'Salida', 'Traslado', 'Ajuste Merma')),
    CONSTRAINT chk_cantidad_mov CHECK (cantidad > 0),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (id_bodega_origen) REFERENCES bodega(id_bodega)
        ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (id_bodega_destino) REFERENCES bodega(id_bodega)
        ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY (id_funcionario) REFERENCES funcionario(id_funcionario)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ;

-- ----------------------------------------------------------------------------
-- 2. POBLACIÓN DE DATOS (INSERT INTO) - MÍNIMO 15 REGISTROS POR TABLA
-- ----------------------------------------------------------------------------

-- Tabla 1: pais (16 registros)
INSERT INTO pais (id_pais, nombre, codigo_iso, continente, acuerdo_comercial) VALUES
(1, 'China', 'CN', 'Asia', FALSE),
(2, 'Estados Unidos', 'US', 'America', TRUE),
(3, 'Alemania', 'DE', 'Europa', TRUE),
(4, 'Japon', 'JP', 'Asia', FALSE),
(5, 'Mexico', 'MX', 'America', TRUE),
(6, 'Corea del Sur', 'KR', 'Asia', TRUE),
(7, 'Vietnam', 'VN', 'Asia', FALSE),
(8, 'Brasil', 'BR', 'America', FALSE),
(9, 'Espana', 'ES', 'Europa', TRUE),
(10, 'Colombia', 'CO', 'America', TRUE),
(11, 'Costa Rica', 'CR', 'America', TRUE),
(12, 'Panama', 'PA', 'America', TRUE),
(13, 'Chile', 'CL', 'America', TRUE),
(14, 'Paises Bajos', 'NL', 'Europa', TRUE),
(15, 'India', 'IN', 'Asia', FALSE),
(16, 'Italia', 'IT', 'Europa', TRUE);

-- Tabla 2: categoria_arancelaria (16 registros con partidas SAC reales)
INSERT INTO categoria_arancelaria (id_categoria, codigo_partida, descripcion, porcentaje_arancel, requiere_permiso) VALUES
(1, '8517.13.00', 'Telefonos inteligentes (Smartphones) y terminales moviles', 5.00, FALSE),
(2, '8471.30.00', 'Computadoras portatiles y tabletas digitales', 0.00, FALSE),
(3, '8703.23.00', 'Automoviles de turismo con motor de gasolina >1500cc', 30.00, TRUE),
(4, '3004.90.99', 'Medicamentos dosificados para uso terapeutico humano', 2.50, TRUE),
(5, '0901.11.00', 'Cafe en grano sin tostar ni descafeinar', 15.00, TRUE),
(6, '8528.72.00', 'Televisores y monitores a color de pantalla plana LED/OLED', 13.00, FALSE),
(7, '6109.10.00', 'Camisetas y poleras de punto de algodon', 12.00, FALSE),
(8, '6403.99.00', 'Calzado deportivo con suela de caucho y parte superior textil', 15.00, FALSE),
(9, '2204.21.00', 'Vino de uvas frescas en recipientes con capacidad <= 2 litros', 20.00, TRUE),
(10, '8415.10.00', 'Acondicionadores de aire tipo split para pared', 10.00, FALSE),
(11, '8504.40.90', 'Inversores de corriente y fuentes solares fotovoltaicas', 0.00, FALSE),
(12, '9503.00.00', 'Juguetes infantiles, modelos a escala y rompecabezas', 5.00, FALSE),
(13, '0201.30.00', 'Carne de bovino deshuesada, fresca o refrigerada', 25.00, TRUE),
(14, '8473.30.00', 'Memorias RAM, SSD y partes para procesamiento de datos', 0.00, FALSE),
(15, '3926.90.90', 'Manufacturas de plastico y polimeros para embalaje industrial', 8.00, FALSE),
(16, '8711.60.00', 'Motocicletas y bicicletas con motor electrico', 5.00, FALSE);

-- Tabla 3: agente_aduanal (16 registros)
INSERT INTO agente_aduanal (id_agente, nombre_completo, numero_licencia, agencia_aduanal, telefono, correo, estado_licencia) VALUES
(1, 'Carlos Morales Chaves', 'AGT-2024-001', 'Agencia de Aduanas InterAmericana S.A.', '+506 2221-4500', 'cmorales@interamericana.cr', 'Activa'),
(2, 'Maria Elena Fallas Rojas', 'AGT-2024-002', 'Logistica Aduanera del Caribe S.A.', '+506 2758-3010', 'mfallas@logisticacaribe.com', 'Activa'),
(3, 'Rodrigo Brenes Solano', 'AGT-2024-003', 'Aduanera TransGlobal Limitada', '+506 2440-8899', 'rbrenes@transglobal.cr', 'Activa'),
(4, 'Sonia Valverde Mendez', 'AGT-2024-004', 'Servicios Aduaneros Caldera S.A.', '+506 2661-2244', 'svalverde@aduanascaldera.com', 'Activa'),
(5, 'Jorge Alberto Quiros Vega', 'AGT-2024-005', 'Customs Brokers Pacifico Sur', '+506 2777-1090', 'jquiros@brokerpacific.com', 'Activa'),
(6, 'Adriana Campos Monge', 'AGT-2024-006', 'Soluciones de Comercio Exterior CR', '+506 2289-5566', 'acampos@comercioexterior.cr', 'Activa'),
(7, 'Esteban Gutierrez Pineda', 'AGT-2024-007', 'Logix Customs & Freight', '+506 2203-9000', 'egutierrez@logixcustoms.com', 'Activa'),
(8, 'Patricia Naranjo Mora', 'AGT-2024-008', 'Aduanas & Despachos Mundiales', '+506 2433-7711', 'pnaranjo@aduanasmundiales.cr', 'Activa'),
(9, 'Federico Aguilar Castro', 'AGT-2024-009', 'Grupo Logistico Portuario S.A.', '+506 2798-4422', 'faguilar@logisticoportuario.com', 'Activa'),
(10, 'Gabriela Salazar Cordero', 'AGT-2024-010', 'InterCustoms Forwarding CR', '+506 2296-6080', 'gsalazar@intercustoms.cr', 'Activa'),
(11, 'Alvaro Castillo Vargas', 'AGT-2024-011', 'Despachos Aduanales del Norte', '+506 2460-3322', 'acastillo@aduanasnorte.cr', 'Activa'),
(12, 'Silvia Barquero Jimenez', 'AGT-2024-012', 'Consorcio Aduanero Continental', '+506 2253-1188', 'sbarquero@continental.cr', 'Activa'),
(13, 'Daniel Fonseca Lizano', 'AGT-2024-013', 'Express Customs & Courier S.A.', '+506 2442-9900', 'dfonseca@expresscustoms.cr', 'Activa'),
(14, 'Lorena Esquivel Arroyo', 'AGT-2024-014', 'Asesores Aduaneros del Valle', '+506 2234-7070', 'lesquivel@aduanasvalle.com', 'Activa'),
(15, 'Manuel Cordero Blanco', 'AGT-2024-015', 'Servicios Logisticos Transpacifico', '+506 2663-8090', 'mcordero@transpacifico.cr', 'Activa'),
(16, 'Beatriz Sanchez Murillo', 'AGT-2024-016', 'Alianza Aduanal Central', '+506 2248-1200', 'bsanchez@alianzaaduanal.cr', 'Activa');

-- Tabla 4: funcionario (16 registros con jerarquía recursiva)
-- Directores (Supervisores máximos con id_supervisor = NULL)
INSERT INTO funcionario (id_funcionario, nombre_completo, codigo_empleado, cargo, departamento, correo_institucional, id_supervisor) VALUES
(1, 'Lic. Roberto Montero Chacon', 'DIR-001', 'Director General de Aduanas', 'Direccion Superior', 'roberto.montero@aduanas.gob.cr', NULL),
(2, 'Licda. Xinia Corrales Soto', 'DIR-002', 'Jefa Regional de Aforo y Fiscalizacion', 'Operaciones Portuarias', 'xinia.corrales@aduanas.gob.cr', 1),
(3, 'Ing. Mauricio Gamboa Arce', 'DIR-003', 'Jefe de Control de Almacenes y Deposito', 'Logistica y Bodegas', 'mauricio.gamboa@aduanas.gob.cr', 1);

-- Supervisores Intermedios
INSERT INTO funcionario (id_funcionario, nombre_completo, codigo_empleado, cargo, departamento, correo_institucional, id_supervisor) VALUES
(4, 'Marco Vinicio Araya Perez', 'SUP-010', 'Supervisor de Aforo Fisico Caldera', 'Operaciones Portuarias', 'marcov.araya@aduanas.gob.cr', 2),
(5, 'Tatiana Segura Varela', 'SUP-011', 'Supervisora de Aforo Fisico Moin', 'Operaciones Portuarias', 'tatiana.segura@aduanas.gob.cr', 2),
(6, 'David Urena Carvajal', 'SUP-012', 'Supervisor de Almacenes Fiscales', 'Logistica y Bodegas', 'david.urena@aduanas.gob.cr', 3),
(7, 'Laura Benavides Solis', 'SUP-013', 'Supervisora de Fiscalizacion Normativa', 'Normativa y Riesgo', 'laura.benavides@aduanas.gob.cr', 2);

-- Inspectores y Aforadores Operativos
INSERT INTO funcionario (id_funcionario, nombre_completo, codigo_empleado, cargo, departamento, correo_institucional, id_supervisor) VALUES
(8, 'Oscar Hernandez Ruiz', 'AFO-101', 'Aforador Tecnico Inspector', 'Operaciones Portuarias', 'oscar.hernandez@aduanas.gob.cr', 4),
(9, 'Karla Madrigal Vega', 'AFO-102', 'Aforadora Tecnica Inspectora', 'Operaciones Portuarias', 'karla.madrigal@aduanas.gob.cr', 4),
(10, 'Jose Andres Mora Castro', 'AFO-103', 'Aforador Tecnico Inspector', 'Operaciones Portuarias', 'josea.mora@aduanas.gob.cr', 5),
(11, 'Veronica Gomez Salas', 'AFO-104', 'Aforadora Tecnica Inspectora', 'Operaciones Portuarias', 'veronica.gomez@aduanas.gob.cr', 5),
(12, 'Andres Calvo Zuniga', 'BOD-201', 'Custodio Oficial de Bodega', 'Logistica y Bodegas', 'andres.calvo@aduanas.gob.cr', 6),
(13, 'Daniela Rojas Segura', 'BOD-202', 'Custodia Oficial de Bodega', 'Logistica y Bodegas', 'daniela.rojas@aduanas.gob.cr', 6),
(14, 'Felipe Castro Cordoba', 'AFO-105', 'Inspector de Riesgo y Decomisos', 'Normativa y Riesgo', 'felipe.castro@aduanas.gob.cr', 7),
(15, 'Monica Quiros Chaves', 'AFO-106', 'Inspectora Quimica Farmaceutica', 'Normativa y Riesgo', 'monica.quiros@aduanas.gob.cr', 7),
(16, 'Ignacio Venegas Lopez', 'AFO-107', 'Inspector de Carga General', 'Operaciones Portuarias', 'ignacio.venegas@aduanas.gob.cr', 4);

-- Tabla 5: bodega (10 registros estratégicos)
INSERT INTO bodega (id_bodega, codigo_bodega, nombre, ubicacion, capacidad_maxima_m3, temperatura_controlada, estado_operativo) VALUES
(1, 'BOD-CAL-01', 'Bodega General Puerto Caldera', 'Terminal Portuaria de Caldera, Muelle 1', 25000.00, FALSE, 'Operativa'),
(2, 'BOD-CAL-02', 'Depósito de Carga Retenida Caldera', 'Sector Aduanal Caldera, Edificio B', 12000.00, FALSE, 'Operativa'),
(3, 'BOD-MOI-01', 'Almacén Fiscal Moin Terminal', 'Terminal de Contenedores de Moín, Zona 3', 35000.00, FALSE, 'Operativa'),
(4, 'BOD-MOI-02', 'Cámara Fría de Inspección Moín', 'Terminal de Contenedores de Moín, Sector Frío', 8500.00, TRUE, 'Operativa'),
(5, 'BOD-SJO-01', 'Bodega Aérea Central Juan Santamaría', 'Aeropuerto Internacional SJO, Carga Aérea', 18000.00, TRUE, 'Operativa'),
(6, 'BOD-SJO-02', 'Depósito Fiscal La Uruca', 'San José, La Uruca, Módulo Central', 22000.00, FALSE, 'Operativa'),
(7, 'BOD-PBL-01', 'Almacén Terrestre Peñas Blancas', 'Frontera Norte Peñas Blancas, Puesto Aduanal', 15000.00, FALSE, 'Operativa'),
(8, 'BOD-PCA-01', 'Almacén Terrestre Paso Canoas', 'Frontera Sur Paso Canoas, Zona de Carga', 14000.00, FALSE, 'Operativa'),
(9, 'BOD-RET-ESP', 'Depósito de Decomisos y Contrabando', 'Alajuela, Complejo Aduanal Central', 6000.00, FALSE, 'Operativa'),
(10, 'BOD-FAR-01', 'Depósito Especializado Medicamentos', 'Heredia, Zona Franca Metropolitana', 9000.00, TRUE, 'Operativa');

-- Tabla 6: operador_comercial (16 registros)
INSERT INTO operador_comercial (id_operador, razon_social, identificacion_tributaria, tipo_operador, direccion, telefono, correo, id_pais_sede) VALUES
(1, 'TechLogistics Importaciones S.A.', '3-101-558899', 'Importador', 'San Jose, Oficentro La Sabana, Torre 2', '+506 2290-1122', 'contacto@techlogistics.cr', 11),
(2, 'ElectroMundo Internacional Limitada', '3-102-447788', 'Importador', 'Heredia, Parque Empresarial Forum', '+506 2260-3344', 'compras@electromundo.cr', 11),
(3, 'Corporacion Automotriz del Valle S.A.', '3-101-112233', 'Importador', 'San Jose, Paseo Colon', '+506 2222-7788', 'aduanas@automotrizvalle.com', 11),
(4, 'Farmaceutica BioSalud Centroamerica', '3-101-998877', 'Ambos', 'Alajuela, Coyol Free Zone', '+506 2437-6000', 'logistica@biosalud.cr', 11),
(5, 'Exportadora Cafe Oro de Altura S.A.', '3-101-334455', 'Exportador', 'Tarrazu, San Marcos, 500m N de la Iglesia', '+506 2544-0101', 'ventas@cafeoroaltura.com', 11),
(6, 'Distribuidora Textil y Moda Latina S.A.', '3-102-665544', 'Importador', 'San Jose, Barrio Mexico', '+506 2258-9900', 'import@textillatina.cr', 11),
(7, 'Global Retail & Electronics Corp', 'US-EIN-984412', 'Exportador', 'Miami, Florida, 8200 NW 33rd St', '+1 305-592-8000', 'orders@globalretailusa.com', 2),
(8, 'Shenzhen Digital Tech Exports Ltd', 'CN-91440300MA', 'Exportador', 'Shenzhen, Guangdong, High-Tech Park', '+86 755-8633-900', 'export@shenzhendigital.cn', 1),
(9, 'AgroIndustrial del Pacifico Central', '3-101-778899', 'Ambos', 'Puntarenas, Esparza, Zona Industrial', '+506 2635-4411', 'aduanas@agropacifico.cr', 11),
(10, 'Importadora Gastronomica Mediterranea', '3-102-887766', 'Importador', 'Escazu, Multiplaza, Local B-12', '+506 2201-5500', 'info@gastronomiamed.com', 11),
(11, 'Energia Solar & Renovable S.A.', '3-101-443322', 'Importador', 'Cartago, Parque Industrial Terra', '+506 2573-8800', 'proyectos@energiasolar.cr', 11),
(12, 'Logistica Integral Transnacional S.A.', '3-101-229988', 'Ambos', 'San Jose, Pavas, Zona Industrial', '+506 2232-1515', 'operaciones@logisticaintegral.cr', 11),
(13, 'Bayerische Motoren Export GMBH', 'DE-HRB-789012', 'Exportador', 'Munich, Petuelring 130', '+49 89-382-0', 'logistics@bmw-export.de', 3),
(14, 'Consorcio Juguetero de Oriente S.A.', '3-102-123456', 'Importador', 'Curridabat, Centro Comercial del Este', '+506 2272-9090', 'pedidos@jugueteriaoriente.cr', 11),
(15, 'Carnicos y Congelados del Sur Limitada', '3-101-654321', 'Importador', 'San Jose, Desamparados', '+506 2259-4040', 'ventas@carnicosdelsur.cr', 11),
(16, 'Mobility & E-Bikes Costa Rica S.A.', '3-101-987654', 'Importador', 'Santa Ana, Lindora, Centro Corporativo', '+506 2203-7766', 'contacto@ebikescr.com', 11);

-- Tabla 7: producto (18 registros coherentes)
INSERT INTO producto (id_producto, codigo_sku, descripcion, unidad_medida, valor_unitario_usd, peso_unitario_kg, id_categoria) VALUES
(1, 'SMART-SAM-S24', 'Smartphone Samsung Galaxy S24 Ultra 256GB', 'Unidades', 850.00, 0.35, 1),
(2, 'SMART-IPH-16P', 'Apple iPhone 16 Pro 128GB Titanio Natural', 'Unidades', 920.00, 0.32, 1),
(3, 'LAP-LEN-T14', 'Laptop Lenovo ThinkPad T14 Gen 4 Intel Core i7 16GB', 'Unidades', 1100.00, 1.80, 2),
(4, 'LAP-APL-M3', 'Apple MacBook Air 15 pulgadas Chip M3 512GB SSD', 'Unidades', 1250.00, 1.95, 2),
(5, 'AUTO-TOY-RAV4', 'Vehiculo SUV Toyota RAV4 2.5L Gasolina 4x4 2026', 'Unidades', 26000.00, 1680.00, 3),
(6, 'AUTO-BMW-X3', 'Vehiculo BMW X3 xDrive30i 2.0L Turbo 2026', 'Unidades', 42000.00, 1890.00, 3),
(7, 'MED-AMOXI-500', 'Amoxicilina + Acido Clavulanico 500/125mg Caja x 30 Tab', 'Cajas', 14.50, 0.12, 4),
(8, 'MED-INSUL-GLA', 'Insulina Glargina 100 UI/ml Solucion Inyectable 5 Plumas', 'Cajas', 48.00, 0.25, 4),
(9, 'AGRO-CAF-GEI', 'Sacos de Cafe Grano Especial Variedad Geisha Lavado 46kg', 'Sacos', 380.00, 46.50, 5),
(10, 'TV-LG-OLED65', 'Televisor LG Smart TV 65 pulgadas OLED 4K Cinema', 'Unidades', 1350.00, 24.00, 6),
(11, 'TEX-CAM-POLO', 'Lote de Camisetas Polo Algodon Pima 100% (x 100 unid)', 'Lotes', 850.00, 22.00, 7),
(12, 'CALZ-NIKE-AIR', 'Zapatillas Deportivas Nike Air Pegasus 40 Tallas Surtidas', 'Pares', 75.00, 0.90, 8),
(13, 'VIN-RIOJA-RES', 'Vino Tinto Espanol Marques de Riscal Reserva Botella 750ml', 'Cajas x 12', 180.00, 14.00, 9),
(14, 'AC-SPLIT-INVER', 'Aire Acondicionado Split Inverter 18000 BTU R32 Eco', 'Unidades', 420.00, 38.00, 10),
(15, 'SOL-PANEL-550', 'Panel Solar Fotovoltaico Monocristalino 550W Tier 1', 'Unidades', 115.00, 27.50, 11),
(16, 'JUG-LEGO-ROB', 'Set Robotica Educativa Programable Mindstorms', 'Sets', 220.00, 3.20, 12),
(17, 'CARN-CORTE-RIB', 'Corte Fino Ribeye Angus Congelado al Vacio x Caja 20kg', 'Cajas', 280.00, 20.00, 13),
(18, 'MOT-ELEC-VESP', 'Scooter Motocicleta Electrica Urbana 3000W Autonomia 80km', 'Unidades', 1650.00, 95.00, 16);

-- Tabla 8: declaracion_aduanera (16 DUAs registradas entre Octubre y Noviembre 2026)
INSERT INTO declaracion_aduanera (id_declaracion, numero_dua, fecha_registro, regimen, estado, total_cif_usd, arancel_total_usd, id_operador, id_agente, id_pais_origen) VALUES
(1, 'DUA-2026-0001', '2026-10-02', 'Importacion', 'Liberada', 85000.00, 4250.00, 1, 1, 1),
(2, 'DUA-2026-0002', '2026-10-05', 'Importacion', 'Retenida', 125000.00, 0.00, 2, 3, 1),
(3, 'DUA-2026-0003', '2026-10-08', 'Importacion', 'Liberada', 156000.00, 46800.00, 3, 4, 3),
(4, 'DUA-2026-0004', '2026-10-10', 'Importacion', 'Retenida', 42000.00, 1050.00, 4, 2, 9),
(5, 'DUA-2026-0005', '2026-10-12', 'Exportacion', 'Despachada', 38000.00, 0.00, 5, 2, 11),
(6, 'DUA-2026-0006', '2026-10-15', 'Importacion', 'Retenida', 68000.00, 8840.00, 1, 1, 1),
(7, 'DUA-2026-0007', '2026-10-18', 'Importacion', 'Pendiente de Pago', 45000.00, 6750.00, 6, 6, 7),
(8, 'DUA-2026-0008', '2026-10-20', 'Transito', 'Liberada', 92000.00, 0.00, 12, 7, 2),
(9, 'DUA-2026-0009', '2026-10-22', 'Importacion', 'En Inspeccion', 57500.00, 0.00, 11, 8, 1),
(10, 'DUA-2026-0010', '2026-10-24', 'Importacion', 'Retenida', 32400.00, 6480.00, 10, 10, 9),
(11, 'DUA-2026-0011', '2026-10-26', 'Deposito', 'Registrada', 110000.00, 5500.00, 1, 1, 1),
(12, 'DUA-2026-0012', '2026-10-28', 'Importacion', 'Liberada', 22000.00, 1100.00, 14, 12, 6),
(13, 'DUA-2026-0013', '2026-10-29', 'Importacion', 'Retenida', 56000.00, 14000.00, 15, 5, 2),
(14, 'DUA-2026-0014', '2026-10-31', 'Importacion', 'En Inspeccion', 49500.00, 2475.00, 16, 9, 1),
(15, 'DUA-2026-0015', '2026-11-01', 'Importacion', 'Registrada', 130000.00, 39000.00, 3, 4, 4),
(16, 'DUA-2026-0016', '2026-11-02', 'Importacion', 'Retenida', 92000.00, 4600.00, 2, 1, 1);

-- Tabla 9: detalle_declaracion (26 registros que resuelven N:M)
INSERT INTO detalle_declaracion (id_detalle, id_declaracion, id_producto, cantidad, valor_declarado_usd, arancel_aplicado_usd) VALUES
(1, 1, 1, 100, 85000.00, 4250.00),
(2, 2, 3, 60, 66000.00, 0.00),
(3, 2, 4, 40, 50000.00, 0.00),
(4, 3, 6, 3, 126000.00, 37800.00),
(5, 3, 5, 1, 26000.00, 7800.00),
(6, 4, 7, 1000, 14500.00, 362.50),
(7, 4, 8, 500, 24000.00, 600.00),
(8, 5, 9, 100, 38000.00, 0.00),
(9, 6, 10, 50, 67500.00, 8775.00),
(10, 7, 12, 600, 45000.00, 6750.00),
(11, 8, 3, 50, 55000.00, 0.00),
(12, 8, 1, 40, 34000.00, 0.00),
(13, 9, 15, 500, 57500.00, 0.00),
(14, 10, 13, 180, 32400.00, 6480.00),
(15, 11, 2, 80, 73600.00, 3680.00),
(16, 11, 1, 40, 34000.00, 1700.00),
(17, 12, 16, 100, 22000.00, 1100.00),
(18, 13, 17, 200, 56000.00, 14000.00),
(19, 14, 18, 30, 49500.00, 2475.00),
(20, 15, 5, 5, 130000.00, 39000.00),
(21, 16, 1, 60, 51000.00, 2550.00),
(22, 16, 2, 40, 36800.00, 1840.00),
(23, 6, 14, 20, 8400.00, 840.00),
(24, 7, 11, 20, 17000.00, 2040.00),
(25, 9, 14, 10, 4200.00, 420.00),
(26, 10, 9, 20, 7600.00, 1140.00);

-- Tabla 10: contenedor (16 registros de contenedores reales ISO 6346)
INSERT INTO contenedor (id_contenedor, numero_contenedor, tipo_contenedor, peso_bruto_kg, temperatura_setpoint_c, id_declaracion) VALUES
(1, 'MSKU-781920-1', '40ft Dry High Cube', 18450.00, NULL, 1),
(2, 'COSU-992314-2', '40ft Dry High Cube', 22100.00, NULL, 2),
(3, 'CMAU-451209-8', '40ft Dry High Cube', 24800.00, NULL, 3),
(4, 'MAEU-118902-3', '40ft Refrigerado', 16700.00, 4.5, 4),
(5, 'HLCU-882190-4', '20ft Dry', 12300.00, NULL, 5),
(6, 'ONEU-552019-9', '40ft Dry High Cube', 21400.00, NULL, 6),
(7, 'EGLV-304918-0', '40ft Dry High Cube', 19800.00, NULL, 7),
(8, 'MSKU-331298-5', '40ft Dry High Cube', 20500.00, NULL, 8),
(9, 'COSU-449182-7', '40ft Dry High Cube', 23600.00, NULL, 9),
(10, 'MAEU-902188-1', '40ft Refrigerado', 15900.00, 14.0, 10),
(11, 'CMAU-661290-3', '40ft Dry High Cube', 17800.00, NULL, 11),
(12, 'ONEU-772189-2', '20ft Dry', 11400.00, NULL, 12),
(13, 'HLCU-120934-8', '40ft Refrigerado', 22800.00, -18.0, 13),
(14, 'MSKU-662910-4', '40ft Dry High Cube', 19200.00, NULL, 14),
(15, 'MAEU-884102-6', '40ft Dry High Cube', 25600.00, NULL, 15),
(16, 'COSU-330198-2', '40ft Dry High Cube', 21900.00, NULL, 16);

-- Tabla 11: inventario_stock (20 registros en bodegas)
INSERT INTO inventario_stock (id_stock, id_bodega, id_producto, id_declaracion, cantidad, fecha_ingreso, estado_stock, observacion) VALUES
(1, 1, 1, 1, 100, '2026-10-02 14:30:00', 'Liberado', 'Inspeccion conforme y arancel cancelado'),
(2, 2, 3, 2, 60, '2026-10-05 11:15:00', 'Retenido', 'Retenido en Bodega 2 por falta de factura original'),
(3, 2, 4, 2, 40, '2026-10-05 11:15:00', 'Retenido', 'Retenido en Bodega 2 por discrepancia en valor CIF'),
(4, 1, 6, 3, 3, '2026-10-08 16:40:00', 'Liberado', 'Vehiculos nacionalizados con pago de arancel 30%'),
(5, 4, 7, 4, 1000, '2026-10-10 09:20:00', 'Retenido', 'Retenido en Moin frio por permiso del Ministerio de Salud pendiente'),
(6, 4, 8, 4, 500, '2026-10-10 09:20:00', 'Retenido', 'Cadena de frio bajo revision tecnica'),
(7, 3, 9, 5, 100, '2026-10-12 08:00:00', 'Despachado', 'Cargamento de exportacion embarcado a Europa'),
(8, 2, 10, 6, 50, '2026-10-15 13:50:00', 'Retenido', 'Mercancia de China retenida en Bodega 2 por inspeccion fisica roja'),
(9, 2, 14, 6, 20, '2026-10-15 13:50:00', 'Retenido', 'Aires acondicionados retenidos por certificado de eficiencia energetica'),
(10, 6, 12, 7, 600, '2026-10-18 10:10:00', 'En Tramite', 'Pendiente de cancelacion de comprobante bancario'),
(11, 1, 3, 8, 50, '2026-10-20 15:00:00', 'Liberado', 'Mercancia en transito internacional autorizada'),
(12, 1, 15, 9, 500, '2026-10-22 11:30:00', 'En Cuarentena', 'En proceso de toma de muestras por laboratorio aduanero'),
(13, 10, 13, 10, 180, '2026-10-24 14:15:00', 'Retenido', 'Retenido por revision de timbres fiscales de alcohol'),
(14, 6, 2, 11, 80, '2026-10-26 16:00:00', 'Retenido', 'En deposito fiscal La Uruca pendiente de nacionalizacion'),
(15, 6, 1, 11, 40, '2026-10-26 16:00:00', 'Retenido', 'Lote complementario en custodia'),
(16, 5, 16, 12, 100, '2026-10-28 09:45:00', 'Liberado', 'Juguetes educativos liberados con arancel preferencial'),
(17, 4, 17, 13, 200, '2026-10-29 17:10:00', 'Retenido', 'Retenido en camara fria Moin por certificado fitosanitario SENASA'),
(18, 1, 18, 14, 30, '2026-10-31 12:00:00', 'En Cuarentena', 'Inspeccion fisica de homologacion de bateria'),
(19, 1, 5, 15, 5, '2026-11-01 10:30:00', 'En Tramite', 'Calculo de impuestos de importacion'),
(20, 2, 1, 16, 60, '2026-11-02 08:30:00', 'Retenido', 'Mercancia nueva de China retenida en Bodega 2 por aforo documental');

-- Tabla 12: inspeccion (16 registros con canales y resultados)
INSERT INTO inspeccion (id_inspeccion, fecha_inspeccion, canal_asignado, resultado, observaciones, id_declaracion, id_funcionario) VALUES
(1, '2026-10-02 11:00:00', 'Verde', 'Conforme', 'Levante automatico sin revision fisica requerida', 1, 8),
(2, '2026-10-05 14:00:00', 'Rojo', 'Con Observaciones', 'Se detecto subvaluacion preliminar en factura comercial de laptops', 2, 9),
(3, '2026-10-08 10:30:00', 'Amarillo', 'Conforme', 'Revision documental exhaustiva de VIN de vehiculos, todo conforme', 3, 8),
(4, '2026-10-10 13:15:00', 'Rojo', 'Con Observaciones', 'Falta permiso de importacion emitido por Ministerio de Salud', 4, 15),
(5, '2026-10-12 09:00:00', 'Verde', 'Conforme', 'Exportacion de cafe aprobada para despacho inmediato', 5, 10),
(6, '2026-10-15 15:45:00', 'Rojo', 'Retenido por Infraccion', 'Mercancia no coincide exactamente con descripcion de partida arancelaria', 6, 8),
(7, '2026-10-18 11:20:00', 'Amarillo', 'Con Observaciones', 'Pendiente de acreditacion de pago de arancel e impuestos de venta', 7, 11),
(8, '2026-10-20 14:00:00', 'Verde', 'Conforme', 'Transito aduanero autorizado con precinto de seguridad intacto', 8, 8),
(9, '2026-10-22 10:00:00', 'Rojo', 'Con Observaciones', 'Inspeccion quimica a paneles solares por componentes electronicos no reportados', 9, 14),
(10, '2026-10-24 16:30:00', 'Rojo', 'Retenido por Infraccion', 'Vino sin registro sanitario de etiquetado nutricional', 10, 11),
(11, '2026-10-26 14:10:00', 'Amarillo', 'Conforme', 'Documentacion de admision temporal a deposito fiscal en regla', 11, 8),
(12, '2026-10-28 11:30:00', 'Verde', 'Conforme', 'Importacion liberada bajo convenio comercial asiatico', 12, 10),
(13, '2026-10-29 15:00:00', 'Rojo', 'Con Observaciones', 'Temperatura de camara en -12C cuando la norma exige -18C continuo', 13, 11),
(14, '2026-10-31 10:45:00', 'Rojo', 'Con Observaciones', 'Verificacion de certificacion de seguridad electrica de motores', 14, 16),
(15, '2026-11-01 11:00:00', 'Amarillo', 'Conforme', 'Aforo documental de unidades Toyota conforme', 15, 8),
(16, '2026-11-02 09:15:00', 'Rojo', 'Retenido por Infraccion', 'Diferencia en 20 unidades de smartphones respecto al manifiesto', 16, 9);

-- Tabla 13: movimiento_inventario (18 registros de trazabilidad)
INSERT INTO movimiento_inventario (id_movimiento, tipo_movimiento, fecha_movimiento, cantidad, motivo, id_producto, id_bodega_origen, id_bodega_destino, id_funcionario) VALUES
(1, 'Ingreso', '2026-10-02 14:30:00', 100, 'Ingreso inicial por arribo de buque portacontenedores', 1, NULL, 1, 12),
(2, 'Salida', '2026-10-03 16:00:00', 100, 'Salida por levante y nacionalizacion autorizada', 1, 1, NULL, 12),
(3, 'Ingreso', '2026-10-05 11:15:00', 60, 'Custodia preventiva de carga retenida', 3, NULL, 2, 12),
(4, 'Ingreso', '2026-10-05 11:15:00', 40, 'Custodia preventiva de carga retenida', 4, NULL, 2, 12),
(5, 'Ingreso', '2026-10-08 16:40:00', 3, 'Ingreso a patio automotriz', 6, NULL, 1, 12),
(6, 'Salida', '2026-10-09 11:00:00', 3, 'Entrega a importador tras cancelacion arancelaria', 6, 1, NULL, 12),
(7, 'Ingreso', '2026-10-10 09:20:00', 1000, 'Ingreso a camara fria portuaria Moin', 7, NULL, 4, 13),
(8, 'Ingreso', '2026-10-10 09:20:00', 500, 'Ingreso a camara fria portuaria Moin', 8, NULL, 4, 13),
(9, 'Ingreso', '2026-10-15 13:50:00', 50, 'Ingreso de televisores retenidos', 10, NULL, 2, 12),
(10, 'Ingreso', '2026-10-15 13:50:00', 20, 'Ingreso de aires acondicionados retenidos', 14, NULL, 2, 12),
(11, 'Ingreso', '2026-10-18 10:10:00', 600, 'Ingreso a bodega de transito terrestre', 12, NULL, 6, 12),
(12, 'Traslado', '2026-10-21 14:00:00', 200, 'Traslado preventivo de calzado a bodega fiscal La Uruca', 12, 6, 2, 12),
(13, 'Ingreso', '2026-10-22 11:30:00', 500, 'Ingreso de paneles solares para aforo', 15, NULL, 1, 12),
(14, 'Ingreso', '2026-10-24 14:15:00', 180, 'Ingreso de lote de vinos bajo retencion', 13, NULL, 10, 13),
(15, 'Ingreso', '2026-10-26 16:00:00', 80, 'Ingreso por admision a deposito fiscal', 2, NULL, 6, 12),
(16, 'Traslado', '2026-10-27 10:00:00', 30, 'Traslado de laptops a bodega de aforo especializado', 2, 6, 10, 13),
(17, 'Ingreso', '2026-10-29 17:10:00', 200, 'Ingreso de carne congelada a camara fria', 17, NULL, 4, 13),
(18, 'Ingreso', '2026-11-02 08:30:00', 60, 'Ingreso de carga de smartphones retenida', 1, NULL, 2, 12);

-- ----------------------------------------------------------------------------
-- 3. CONSULTAS ANALÍTICAS DEL NEGOCIO (MÍNIMO 8 CONSULTAS SELECT)
-- ----------------------------------------------------------------------------

-- CONSULTA 1:
-- ¿Cuántas declaraciones de importación se registraron en octubre de 2026 y cuál fue su valor total CIF y arancel promedio?
-- Demuestra: JOIN, WHERE, GROUP BY, funciones de agregación (COUNT, SUM, AVG) y formateo de fechas.
SELECT 
    TO_CHAR(d.fecha_registro, 'YYYY-MM') AS periodo_mes,
    d.regimen,
    COUNT(d.id_declaracion) AS total_declaraciones,
    CONCAT('$', TO_CHAR(SUM(d.total_cif_usd), 'FM999,999,999.00')) AS valor_cif_total,
    CONCAT('$', TO_CHAR(AVG(d.arancel_total_usd), 'FM999,999,999.00')) AS arancel_promedio,
    CONCAT('$', TO_CHAR(SUM(d.arancel_total_usd), 'FM999,999,999.00')) AS arancel_recaudado
FROM declaracion_aduanera d
WHERE d.regimen = 'Importacion'
  AND d.fecha_registro BETWEEN '2026-10-01' AND '2026-10-31'
GROUP BY TO_CHAR(d.fecha_registro, 'YYYY-MM'), d.regimen;

-- CONSULTA 2:
-- ¿Qué mercancías siguen retenidas en los depósitos, en qué bodega están ubicadas y cuál es su país de origen?
-- (Responde directamente la pregunta rectora: "¿Qué mercancías de China siguen retenidas en la bodega 2?")
SELECT 
    b.nombre AS nombre_bodega,
    b.codigo_bodega,
    p.nombre AS pais_origen,
    d.numero_dua,
    pr.codigo_sku,
    pr.descripcion AS descripcion_producto,
    inv.cantidad AS unidades_retenidas,
    inv.estado_stock,
    inv.observacion
FROM inventario_stock inv
JOIN bodega b ON inv.id_bodega = b.id_bodega
JOIN producto pr ON inv.id_producto = pr.id_producto
JOIN declaracion_aduanera d ON inv.id_declaracion = d.id_declaracion
JOIN pais p ON d.id_pais_origen = p.id_pais
WHERE inv.estado_stock = 'Retenido'
ORDER BY b.id_bodega ASC, inv.cantidad DESC;

-- CONSULTA 3:
-- ¿Cuál es el país de origen con más contenedores recibidos y cuál es el peso bruto total transportado?
-- Demuestra: JOIN múltiple, GROUP BY, SUM, COUNT y ORDER BY DESC con LIMIT.
SELECT 
    p.nombre AS pais_origen,
    p.codigo_iso,
    p.continente,
    COUNT(c.id_contenedor) AS total_contenedores,
    CONCAT(TO_CHAR(SUM(c.peso_bruto_kg), 'FM999,999,999.00'), ' kg') AS peso_bruto_total,
    CONCAT(TO_CHAR(AVG(c.peso_bruto_kg), 'FM999,999,999.00'), ' kg') AS peso_promedio_por_contenedor
FROM contenedor c
JOIN declaracion_aduanera d ON c.id_declaracion = d.id_declaracion
JOIN pais p ON d.id_pais_origen = p.id_pais
GROUP BY p.id_pais, p.nombre, p.codigo_iso, p.continente
ORDER BY total_contenedores DESC, SUM(c.peso_bruto_kg) DESC;

-- CONSULTA 4:
-- ¿Qué importadores han declarado el mayor valor total acumulado en mercancías y cuál es su aporte arancelario?
-- Demuestra: JOIN, WHERE, GROUP BY, HAVING y ordenamiento por valor financiero.
SELECT 
    op.razon_social AS importador,
    op.identificacion_tributaria,
    COUNT(d.id_declaracion) AS total_duas_tramitadas,
    CONCAT('$', TO_CHAR(SUM(d.total_cif_usd), 'FM999,999,999.00')) AS valor_total_declarado_usd,
    CONCAT('$', TO_CHAR(SUM(d.arancel_total_usd), 'FM999,999,999.00')) AS aranceles_totales_pagados_usd
FROM declaracion_aduanera d
JOIN operador_comercial op ON d.id_operador = op.id_operador
WHERE op.tipo_operador IN ('Importador', 'Ambos')
GROUP BY op.id_operador, op.razon_social, op.identificacion_tributaria
HAVING SUM(d.total_cif_usd) > 50000.00
ORDER BY SUM(d.total_cif_usd) DESC;

-- CONSULTA 5:
-- ¿Qué inspecciones tuvieron resultado "Con Observaciones" o "Retenido por Infraccion", qué funcionario la realizó y quién es su supervisor?
-- Demuestra: JOIN con relación recursiva (empleado -> supervisor), filtro WHERE compuesto y orden cronológico.
SELECT 
    i.id_inspeccion,
    d.numero_dua,
    i.fecha_inspeccion,
    i.canal_asignado,
    i.resultado AS resultado_inspeccion,
    i.observaciones,
    func.nombre_completo AS funcionario_inspector,
    func.cargo AS cargo_inspector,
    COALESCE(sup.nombre_completo, 'Sin Supervisor Asignado') AS supervisor_responsable,
    COALESCE(sup.cargo, 'N/A') AS cargo_supervisor
FROM inspeccion i
JOIN declaracion_aduanera d ON i.id_declaracion = d.id_declaracion
JOIN funcionario func ON i.id_funcionario = func.id_funcionario
LEFT JOIN funcionario sup ON func.id_supervisor = sup.id_funcionario
WHERE i.resultado IN ('Con Observaciones', 'Retenido por Infraccion')
ORDER BY i.fecha_inspeccion DESC;

-- CONSULTA 6:
-- ¿Cuánto stock queda consolidado por producto en todas las bodegas, discriminando entre unidades liberadas y unidades bajo retención?
-- Demuestra: CASE condicional agrupado, SUM agregado, cálculo de valor de inventario y ORDER BY.
SELECT 
    pr.codigo_sku,
    pr.descripcion AS producto,
    pr.unidad_medida,
    CONCAT('$', TO_CHAR(pr.valor_unitario_usd, 'FM999,999,999.00')) AS valor_unitario,
    SUM(inv.cantidad) AS stock_total_fisico,
    SUM(CASE WHEN inv.estado_stock = 'Liberado' THEN inv.cantidad ELSE 0 END) AS unidades_liberadas,
    SUM(CASE WHEN inv.estado_stock IN ('Retenido', 'En Cuarentena') THEN inv.cantidad ELSE 0 END) AS unidades_bloqueadas,
    CONCAT('$', TO_CHAR(SUM(inv.cantidad * pr.valor_unitario_usd), 'FM999,999,999.00')) AS valor_total_inventario_usd
FROM inventario_stock inv
JOIN producto pr ON inv.id_producto = pr.id_producto
GROUP BY pr.id_producto, pr.codigo_sku, pr.descripcion, pr.unidad_medida, pr.valor_unitario_usd
ORDER BY stock_total_fisico DESC;

-- CONSULTA 7:
-- Liquidación y recaudación arancelaria por Categoría / Partida Arancelaria del Sistema Armonizado.
-- Demuestra: Triple JOIN, tasa arancelaria, valor imponible base y suma de tributos liquidados.
SELECT 
    cat.codigo_partida,
    cat.descripcion AS categoria_arancelaria,
    CONCAT(cat.porcentaje_arancel, '%') AS tasa_arancelaria,
    COUNT(DISTINCT det.id_declaracion) AS total_declaraciones_afectas,
    SUM(det.cantidad) AS total_unidades_declaradas,
    CONCAT('$', TO_CHAR(SUM(det.valor_declarado_usd), 'FM999,999,999.00')) AS valor_aduanero_total_usd,
    CONCAT('$', TO_CHAR(SUM(det.arancel_aplicado_usd), 'FM999,999,999.00')) AS arancel_efectivo_recaudado_usd
FROM detalle_declaracion det
JOIN producto pr ON det.id_producto = pr.id_producto
JOIN categoria_arancelaria cat ON pr.id_categoria = cat.id_categoria
GROUP BY cat.id_categoria, cat.codigo_partida, cat.descripcion, cat.porcentaje_arancel
ORDER BY SUM(det.arancel_aplicado_usd) DESC;

-- CONSULTA 8:
-- Auditoría de trazabilidad: Movimientos de inventario de traslado entre bodegas, con detalle de origen, destino y custodio oficial.
-- Demuestra: Doble JOIN a la misma tabla (bodega origen y destino con alias b1 y b2), JOIN a funcionario y filtro de tipo de movimiento.
SELECT 
    m.id_movimiento,
    m.fecha_movimiento,
    m.tipo_movimiento,
    pr.codigo_sku,
    pr.descripcion AS producto,
    m.cantidad AS cantidad_trasladada,
    COALESCE(b_orig.nombre, 'Sin Bodega Previa') AS bodega_origen,
    COALESCE(b_dest.nombre, 'Sin Bodega Destino') AS bodega_destino,
    m.motivo,
    f.nombre_completo AS funcionario_autorizo,
    f.cargo AS cargo_funcionario
FROM movimiento_inventario m
JOIN producto pr ON m.id_producto = pr.id_producto
LEFT JOIN bodega b_orig ON m.id_bodega_origen = b_orig.id_bodega
LEFT JOIN bodega b_dest ON m.id_bodega_destino = b_dest.id_bodega
JOIN funcionario f ON m.id_funcionario = f.id_funcionario
WHERE m.tipo_movimiento = 'Traslado'
ORDER BY m.fecha_movimiento DESC;
