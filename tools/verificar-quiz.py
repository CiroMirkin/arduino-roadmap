"""Revisa que en los quiz la respuesta correcta no se delate por ser la más larga.

Uso:
  python tools/verificar-quiz.py            # todas las lecciones
  python tools/verificar-quiz.py b- 0-      # solo las que empiezan con b- o 0-

Una pregunta falla si la opción correcta supera a todas las incorrectas por más
de TOLERANCIA caracteres. Sale con código 1 si alguna falla.
Necesita PyYAML (pip install pyyaml).
"""

import glob
import os
import sys

import yaml

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LECCIONES = os.path.join(RAIZ, "src", "content", "conceptos")
TOLERANCIA = 6


def revisar(prefijos):
    fallas = 0
    total = 0
    for ruta in sorted(glob.glob(os.path.join(LECCIONES, "*.md"))):
        slug = os.path.basename(ruta)[:-3]
        if prefijos and not any(slug.startswith(p) for p in prefijos):
            continue
        frontmatter = open(ruta, encoding="utf8").read().split("\n---\n", 1)[0][4:]
        for n, quiz in enumerate(yaml.safe_load(frontmatter).get("quiz") or [], 1):
            total += 1
            correcta = max(len(o["text"]) for o in quiz["options"] if o["correct"])
            incorrecta = max(len(o["text"]) for o in quiz["options"] if not o["correct"])
            if correcta > incorrecta + TOLERANCIA:
                fallas += 1
                print(f"{slug} pregunta {n}: correcta {correcta}, incorrecta más larga {incorrecta}")
    print(f"{fallas} de {total} preguntas delatan la respuesta por el largo")
    return fallas


if __name__ == "__main__":
    sys.exit(1 if revisar(sys.argv[1:]) else 0)
