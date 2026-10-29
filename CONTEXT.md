# Contexto: el sistema del invernadero

Todas las lecciones usan el mismo ejemplo ficticio: un sistema de control de invernaderos. Este archivo reúne el dominio y los valores que ya aparecen en los ejemplos, para que las lecciones nuevas o corregidas sigan siendo consistentes. Nunca se usa el proyecto real del autor: ni nombres de archivos, clases, hardware, endpoints ni cifras.

Audiencia: sabe programar en algún lenguaje, no sabe C++.

## Las tres partes del sistema

**Nodos sensores**: ESP32 clásico (o C3) a batería, con deep sleep. Miden temperatura y humedad del aire y del suelo, y tienen un botón para despertar. Envían por BLE (servidor GATT, notify) una trama binaria de 6 bytes. No mandan hora: el controlador fecha cada medición al recibirla.

**Controlador**: ESP32-S3 (placa DevKitC-1 N16R8; no depende de la PSRAM) con una pantalla OLED de 1,3" (SH1106, 128×64, I2C) y tres botones (▲ ▼ OK). Recibe a los nodos (cliente BLE), decide el riego y la ventilación (máquina de estados), maneja relés y PWM (ventilador a 25 kHz, luces, servo de la ventana cenital, motor de la cortina de sombra), guarda la configuración y la calibración en NVS, y envía al backend por WiFi/HTTP con una cola de pendientes. Sigue funcionando sin red, con la última configuración que recibió.

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

- **Sensores**: SHT31 en 0x44 (y 0x45), caudalímetro de 450 pulsos por litro, sensor de CO₂ tipo MH-Z19 por UART2 (`HardwareSerial sensorCo2(2)`, 9600 baudios).
- **Pantalla**: OLED SH1106 de 1,3" en 0x3C, alimentado con 3,3 V, con U8g2 (`U8G2_SH1106_128X64_NONAME_F_HW_I2C`). Con un SSD1306 de 0,96" solo cambia el constructor. Orden de pines del módulo: GND, VCC, SCL, SDA. Vistas: Estado, Nodos, Riego manual y Umbral; una alarma se muestra arriba de cualquier vista y OK la silencia.
- **Expansor**: PCF8574 en 0x20; lee los fines de carrera de la cortina (P0 desplegada, P1 recogida), que aparecen recién en la lección 2.2.
- **Humedad del suelo**: la miden los nodos y llega por BLE. Los ejemplos que en un mismo programa leen el suelo y prenden la bomba usan el sensor de respaldo cableado al controlador (GPIO 2); en el sistema completo, ese valor sería la última lectura que mandó el nodo de la zona.

## Mapa de pines

Los ejemplos de "Mal:" que usan un pin incorrecto a propósito (strapping, ADC2, pin que no es RTC) quedan fuera de este mapa.

**Controlador** (ESP32-S3-DevKitC-1 N16R8). No se usan: 0, 3, 45 y 46 (strapping), 19 y 20 (USB), 26 a 37 (flash y PSRAM OPI), 43 y 44 (UART0 del monitor serie), 38 y 48 (LED RGB de la placa, según la revisión).

| Función | GPIO |
|---|---|
| Corriente de la bomba (ADC1) | 1 |
| Sensor de suelo de respaldo de la zona 1 (ADC1), o un accesorio por ejemplo (pluviómetro, anemómetro, puerta, flotante, luz) | 2 |
| Relé de la bomba o válvula (activo en bajo) | 4 |
| Ventilador, PWM a 25 kHz | 5 |
| Luces de cultivo | 6 |
| Servo de la ventana cenital | 7 |
| I2C SDA / SCL (OLED 0x3C, SHT31 0x44, PCF8574 0x20) | 8 / 9 |
| SD: CS / MOSI / SCK / MISO | 10 / 11 / 12 / 13 |
| Zona 2: relé de la válvula / caudalímetro | 14 / 21 |
| Caudalímetro (interrupción) | 15 |
| Parada de emergencia | 16 |
| CO₂ por UART2: TX / RX | 17 / 18 |
| Botones ▲ / ▼ / OK | 39 / 40 / 41 |
| Motor de la cortina: desplegar / recoger | 42 / 47 |

**Nodo** (ESP32 clásico, DevKit). Los ejemplos de LED y de `analogRead` de suelo corren en el nodo.

| Función | GPIO |
|---|---|
| LED | 2 |
| I2C SDA / SCL (SHT31) | 21 / 22 |
| Botón para despertar (RTC GPIO, ext0) | 27 |
| Luz, fotorresistencia (ADC1) | 33 |
| Humedad del suelo (ADC1); un segundo sensor en el 32 | 34 |
| Batería, divisor (ADC1) | 35 |

## Otros valores

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
