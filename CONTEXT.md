# Contexto: el sistema del invernadero

Todas las lecciones usan el mismo ejemplo ficticio: un sistema de control de invernaderos. Este archivo reúne el dominio y los valores que ya aparecen en los ejemplos, para que las lecciones nuevas o corregidas sigan siendo consistentes. Nunca se usa el proyecto real del autor: ni nombres de archivos, clases, hardware, endpoints ni cifras.

Audiencia: sabe programar en algún lenguaje, no sabe C++.

## Las tres partes del sistema

**Nodos sensores**: ESP32 (o C3) a batería, con deep sleep. Miden temperatura y humedad del aire y del suelo, y tienen un botón para despertar. Envían por BLE (servidor GATT, notify) una trama binaria de 6 bytes. No mandan hora: el controlador fecha cada medición al recibirla.

**Controlador**: ESP32-S3 con PSRAM y pantalla táctil de 800×480. Recibe a los nodos (cliente BLE), decide el riego y la ventilación (máquina de estados), maneja relés y PWM (ventilador a 25 kHz, luces, servo de la ventana cenital), guarda la configuración y la calibración en NVS, y envía al backend por WiFi/HTTP con una cola de pendientes. Sigue funcionando sin red, con la última configuración que recibió.

**Backend**: Node + Express + PostgreSQL. Varias organizaciones (productores), cada una con varios invernaderos, cada uno con sus zonas y sus dispositivos. Roles admin, operario y solo lectura. Ingesta idempotente de lecturas y límite de pedidos por dispositivo.

## Glosario

- **Organización**: un productor, cliente del sistema. Todo dato pertenece a una organización, y nadie ve datos de otra.
- **Invernadero**: pertenece a una organización. Tiene zonas y dispositivos.
- **Zona**: sector de un invernadero que se riega por separado. Su nombre es único dentro del invernadero.
- **Dispositivo** (o equipo): un nodo o un controlador. Tiene su propia clave, que se puede revocar sin afectar a los demás.
- **Lectura**: una medición con su identificador de envío y dos momentos: cuándo midió el equipo (`momento`) y cuándo llegó al servidor (`recibido`).
- **Usuario y membresía**: una persona tiene una membresía por organización, con un rol en cada una.
- **Rol**: `solo_lectura`, `operario` o `admin`. Agrupa permisos (`lecturas.ver`, `alarmas.reconocer`, `riego.accionar`, `config.editar`, `usuarios.administrar`); el código pregunta por permisos, no por roles.
- **Configuración de riego**: umbrales y tiempos de una zona, con historial; su `id` creciente sirve como versión para sincronizarla con el controlador.
- **Alarma**: se activa (temperatura alta o baja, tanque vacío, equipo sin noticias) y la reconoce un usuario.

## Valores que ya se usan

- **Pines**: bomba/válvula 26 (relé activo en bajo), ventilador 27, sensores de suelo 32/33/34 (ADC1), caudalímetro 33, I2C SDA 21 / SCL 22, SD con CS 5.
- **Sensores**: SHT31 en 0x44 (y 0x45), caudalímetro de 450 pulsos por litro, sensor de CO₂ tipo MH-Z19 por UART2 (pines 16/17, 9600 baudios).
- **Calibración típica de suelo**: seco 2600 mV, mojado 1150 mV.
- **Umbrales de ejemplo**: regar por debajo de 35 %, cortar sobre 55 %; abrir ventanas sobre 30 °C, cerrar bajo 27 °C.
- **UUIDs BLE**: servicio `7b1e0001-5c1d-4f6e-9a2b-1c3d4e5f6a7b`, lectura `7b1e0002-...`.
- **URL del backend en los ejemplos**: `http://192.168.0.10:3000/api/invernaderos/2/...` (las rutas de equipos usan `/api/v1/...`).
- **Tipos recurrentes del firmware**: `struct Lectura`, `ZonaRiego`, `Bomba`, `Rele`, `EstadoRiego`, `AccionRiego`, `ColaPendientes`, `ConfigRiego`.
- **NVS**: namespace `equipo` con las claves `ssid`, `wifi_clave` y `clave` (la clave del equipo, 64 caracteres hexadecimales).

## El backend en los ejemplos

- **Tablas**: `organizaciones`, `invernaderos`, `zonas`, `dispositivos`, `membresias`, `lecturas` (clave primaria `(dispositivo_id, id_envio)`), `estado_dispositivos`, `config_riego`, `alarmas`, `trabajos`, `auditoria`, `claves_idempotencia`.
- **Middlewares y ayudas**: `autenticarEquipo` (deja `req.equipo`), `cargarMembresia` (deja `req.usuario`), `requierePermiso(permiso)`, `repositorioDe(db, organizacionId)`, `conOrganizacion` para la seguridad a nivel de fila, `auditar(req, accion, detalle)`.
- `req.db` es el pool de `pg`, y `req.log` es el logger de `pino`.
- La organización de un pedido sale siempre de la autenticación o de la membresía, nunca del cuerpo.
