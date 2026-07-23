#!/usr/bin/env python3
"""
Normaliza as logos dos clientes para tamanho/peso óptico consistente.

Uso:
    python3 tools/normalize-logos.py

O que faz, para cada arquivo em assets/img/clients/*.png:
  1. Recorta o espaço transparente em volta (trim).
  2. Redimensiona para uma altura-base * peso óptico (logos "cheias" como
     wordmarks ficam menores; marcas compactas/brasões ficam um pouco maiores).
  3. Centraliza verticalmente numa tela de altura fixa (mesma p/ todas),
     mantendo a largura colada ao conteúdo (alinha bem à esquerda nos cards).

Assim, no CSS basta usar UMA altura fixa e todas as logos alinham na mesma
linha de base, com equilíbrio visual. Rode de novo sempre que trocar um arquivo.
"""
import os, glob
from PIL import Image

CLIENTS_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "img", "clients")

CANVAS_H = 120          # altura fixa da tela (retina ~2x do tamanho exibido)
BASE_H   = 78           # altura-base do conteúdo antes do peso
MAX_W    = 460          # largura máxima do conteúdo (evita wordmark gigante)

# peso óptico por logo (1.0 = padrão). >1 aumenta, <1 diminui.
WEIGHTS = {
    "stone": 1.00,
    "ambev": 1.06,
    "gestamp": 0.88,
    "redbull-bragantino": 1.50,  # brasão compacto -> aumenta
    "mapfre": 0.90,
    "levesaude": 1.20,           # logo empilhada (compacta)
    "argo": 0.96,
    "ache": 1.02,
    "tractian": 0.80,            # wordmark bem larga -> reduz
    "sanremo": 1.15,             # logo empilhada compacta
    "sap": 0.95,
    "enaex": 1.00,
}

def trim(im):
    bbox = im.split()[3].getbbox()
    return im.crop(bbox) if bbox else im

def normalize(path):
    name = os.path.splitext(os.path.basename(path))[0]
    w = WEIGHTS.get(name, 1.0)
    im = Image.open(path).convert("RGBA")
    im = trim(im)
    target_h = BASE_H * w
    scale = target_h / im.height
    new_w = im.width * scale
    if new_w > MAX_W:                      # respeita largura máxima
        scale = MAX_W / im.width
    nw, nh = max(1, round(im.width * scale)), max(1, round(im.height * scale))
    im = im.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new("RGBA", (nw, CANVAS_H), (0, 0, 0, 0))
    canvas.paste(im, (0, (CANVAS_H - nh) // 2), im)
    canvas.save(path)
    print(f"  {name:22} -> {nw}x{CANVAS_H}  (peso {w})")

def main():
    files = sorted(glob.glob(os.path.join(CLIENTS_DIR, "*.png")))
    if not files:
        print("Nenhuma logo .png encontrada em", CLIENTS_DIR)
        return
    print("Normalizando logos:")
    for f in files:
        normalize(f)
    print("OK.")

if __name__ == "__main__":
    main()
