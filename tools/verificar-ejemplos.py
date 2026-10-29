"""Compila los ejemplos completos (con setup() y loop()) de las lecciones.

Uso:
  python3 tools/verificar-ejemplos.py            # todas las lecciones
  python3 tools/verificar-ejemplos.py b- 0-      # solo las que empiezan con b- o 0-

Necesita arduino-cli en el PATH (o en la variable ARDUINO_CLI), el core esp32 y U8g2.
Cada ejemplo se compila para el equipo que le corresponde: el controlador es un
ESP32-S3 y el nodo un ESP32 clásico. Un ejemplo es del nodo si su etiqueta o sus
primeras líneas dicen "nodo". Además se revisa que los pines de las constantes
PIN_... existan y se puedan usar en ese chip.
Los bloques que son fragmentos (usan funciones que no definen) fallan con
"was not declared": revisarlos a mano y descartar los esperables.
"""

import glob
import os
import re
import subprocess
import sys
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LECCIONES = os.path.join(RAIZ, "src", "content", "conceptos")
CLI = os.environ.get("ARDUINO_CLI", "arduino-cli")
FQBN = {
    "controlador": "esp32:esp32:esp32s3:FlashSize=16M",   # DevKitC-1 N16R8
    "nodo": "esp32:esp32:esp32",
}
# Pines que se pueden usar en cada placa (sin strapping, flash, PSRAM, USB ni UART0).
PINES = {
    "controlador": {1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 21, 39, 40, 41, 42, 47},
    "nodo": {2, 4, 5, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33, 34, 35, 36, 39},
}
BLOQUE = re.compile(r"^```cpp([^\n]*)\n(.*?)^```", re.S | re.M)
PIN = re.compile(r"\bPIN_\w+\s*=\s*(?:GPIO_NUM_)?(\d+)")


def equipo(etiqueta, codigo):
    cabecera = etiqueta + "\n".join(codigo.splitlines()[:3])
    return "nodo" if "nodo" in cabecera.lower() else "controlador"


def extraer(destino, prefijos):
    sketches = []
    for ruta in sorted(glob.glob(os.path.join(LECCIONES, "*.md"))):
        slug = os.path.basename(ruta)[:-3]
        if prefijos and not any(slug.startswith(p) for p in prefijos):
            continue
        texto = open(ruta, encoding="utf8").read().split("\n---\n", 1)[1]   # sin frontmatter
        for i, m in enumerate(BLOQUE.finditer(texto)):
            codigo = m.group(2)
            if "void setup()" in codigo and "void loop()" in codigo:
                nombre = f"s_{slug.replace('-', '_')}_{i}"
                carpeta = os.path.join(destino, nombre)
                os.makedirs(carpeta)
                with open(os.path.join(carpeta, nombre + ".ino"), "w", encoding="utf8") as f:
                    f.write(codigo)
                etiqueta = m.group(1).strip()
                sketches.append((nombre, carpeta, etiqueta, equipo(etiqueta, codigo), codigo))
    return sketches


def main():
    prefijos = sys.argv[1:]
    temporal = tempfile.mkdtemp(prefix="ejemplos-")
    build = os.path.join(temporal, "build")   # uno por equipo: el core se compila una vez por chip
    sketches = extraer(os.path.join(temporal, "sketches"), prefijos)
    print(f"{len(sketches)} sketches en {temporal}")
    fallos = 0
    for nombre, carpeta, etiqueta, eq, codigo in sketches:
        r = subprocess.run(
            [CLI, "compile", "--fqbn", FQBN[eq], "--warnings", "all",
             "--build-path", os.path.join(build, eq), carpeta],
            capture_output=True, text=True, encoding="utf8", errors="replace",
        )
        salida = r.stdout + r.stderr
        malos = sorted({int(n) for n in PIN.findall(codigo)} - PINES[eq])
        ok = r.returncode == 0 and not malos
        if not ok:
            fallos += 1
        print(f"{'OK  ' if ok else 'FALLA'} {nombre} ({etiqueta}, {eq})", flush=True)
        if malos:
            print(f"      pines que no se pueden usar en el {eq}: {malos}")
        for linea in salida.splitlines():
            if ("error:" in linea or "warning:" in linea) and "sketches" in linea:
                print("      " + linea.split("sketches")[-1])
    print(f"\n{fallos} con errores de {len(sketches)}")


if __name__ == "__main__":
    main()
