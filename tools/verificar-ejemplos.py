"""Compila para ESP32 los ejemplos completos (con setup() y loop()) de las lecciones.

Uso:
  python tools/verificar-ejemplos.py            # todas las lecciones
  python tools/verificar-ejemplos.py b- 0-      # solo las que empiezan con b- o 0-

Necesita arduino-cli y el core esp32 instalados. Por defecto usa el arduino-cli
que trae el Arduino IDE 2; se puede cambiar con la variable de entorno ARDUINO_CLI.
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
CLI = os.environ.get(
    "ARDUINO_CLI",
    os.path.expandvars(r"%LOCALAPPDATA%\Programs\Arduino IDE\resources\app\lib\backend\resources\arduino-cli.exe"),
)
FQBN = os.environ.get("FQBN", "esp32:esp32:esp32")
BLOQUE = re.compile(r"^```cpp([^\n]*)\n(.*?)^```", re.S | re.M)


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
                sketches.append((nombre, carpeta, m.group(1).strip()))
    return sketches


def main():
    prefijos = sys.argv[1:]
    temporal = tempfile.mkdtemp(prefix="ejemplos-")
    build = os.path.join(temporal, "build")   # compartido: el core se compila una sola vez
    sketches = extraer(os.path.join(temporal, "sketches"), prefijos)
    print(f"{len(sketches)} sketches en {temporal}")
    fallos = 0
    for nombre, carpeta, etiqueta in sketches:
        r = subprocess.run(
            [CLI, "compile", "--fqbn", FQBN, "--warnings", "all", "--build-path", build, carpeta],
            capture_output=True, text=True, encoding="utf8", errors="replace",
        )
        salida = r.stdout + r.stderr
        ok = "Sketch uses" in salida
        if not ok:
            fallos += 1
        print(f"{'OK  ' if ok else 'FALLA'} {nombre} ({etiqueta})", flush=True)
        for linea in salida.splitlines():
            if ("error:" in linea or "warning:" in linea) and "sketches" in linea:
                print("      " + linea.split("sketches")[-1])
    print(f"\n{fallos} con errores de {len(sketches)}")


if __name__ == "__main__":
    main()
