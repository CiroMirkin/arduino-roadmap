# Referencias hacia adelante en las partes 0 a 9

Revisión del orden de las lecciones después de reordenar Base (25 de octubre de 2026). Se contaron los enlaces y las menciones "ver X.Y" que apuntan a una lección posterior: son 85. No se movió nada; las propuestas esperan aprobación.

## Cómo se clasificaron

Una referencia hacia adelante puede ser un aviso ("las transacciones se ven en 5.2") o una dependencia real: el texto o el código usa algo que hace falta entender ahí y que recién se explica después. Los avisos están bien, porque le dicen al lector que no se preocupe todavía. Las dependencias reales son las que traban la lectura.

## Dependencias reales

### 1.4 usa el operador `::`, que se explica en 1.8

La lección de módulos y namespaces tiene 34 usos de `::` (`riego::actualizar()`), y remite a 1.8 para la explicación completa. 1.8 solo depende de 1.4 en una línea, que remite a los `using` "como se vio en 1.4"; con el cambio pasaría a decir "como se ve en la lección siguiente".

Propuesta: mover 1.8 al lugar 1.4 y correr 1.4 a 1.7 un lugar. Con el reorden de Base, `Clase::metodo` ya aparece en B.6, así que 1.8 queda como profundización justo antes de usarlo con namespaces.

### 4.1 y 4.3 usan transacciones, que se explican en 5.2

`conOrganizacion` (4.1) y `conIdempotencia` (4.3) abren una transacción, hacen `ROLLBACK` si algo falla y dependen de eso para ser correctas. Las dos lecciones remiten a 5.2.

Hay dos caminos:

- Agregar en 4.1, donde aparece la primera transacción, una nota corta con lo mínimo (`BEGIN`, `COMMIT`, `ROLLBACK`: todo o nada) y dejar el detalle de concurrencia en 5.2. Es el cambio más chico.
- Pasar la Parte 5 (bases de datos) antes de la Parte 4 (backend). También ordenaría otras referencias de la Parte 4 hacia 5.1 y 5.4, pero es un cambio grande: cambian los números de 11 lecciones y sus enlaces.

Recomendación: la nota en 4.1.

## Avisos frecuentes que no hace falta tocar

Estas lecciones reciben muchos avisos, pero quien lee no las necesita para entender el lugar desde donde se las nombra:

| Lección | Avisos | Desde | Por qué está bien donde está |
|---|---|---|---|
| 6.3 Validar los datos del dispositivo | 9 | 0.11, 3.2, 3.3, 3.5, 4.2, 4.3, 5.1, 6.1, 6.2 | "validar antes de usar" se entiende sin la lección; 6.3 trae el detalle de seguridad |
| 0.11 NVS y `Preferences` | 5 | 0.2, 0.4, 0.10 | se nombra como destino de datos ("guardalo en la flash"), sin usar la API |
| 2.8 Pruebas fuera del hardware | 8 | 1.1, 1.7, 2.1, 2.2 | las pruebas necesitan la separación en capas, que se arma antes |
| 2.4 FreeRTOS | 6 | 0.1, 0.8, 0.9, 0.10, 2.3 | Parte 0 solo avisa que existe; 2.3 lleva a 2.4 de forma natural |
| 3.5 Reintentos e idempotencia | 6 | 0.10, 2.6, 3.1 | 3.1 menciona el backoff y promete el detalle |
| 0.13 Librerías y PlatformIO | 3 | 0.2, 0.5 | solo se nombra el menú del IDE o `platformio.ini` |
| 7.1 Supuestos falsos sobre el tiempo | 3 | 4.3, 5.1, 5.3 | "guardar con zona horaria" se entiende sin la lección |
