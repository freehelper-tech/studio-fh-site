#!/usr/bin/env python3
"""
studio.fh — gera as versões fixas /en/ e /es/ a partir das páginas em PT.

    python3 tools/i18n/build.py          # gera en/ e es/ (falha se faltar tradução)
    python3 tools/i18n/build.py --check  # só lista os textos PT sem tradução

O PT continua sendo a fonte: edite o HTML em PT, rode o script e ele avisa
quais textos novos precisam entrar em tools/i18n/en.json e es.json
(chave = texto em PT, valor = tradução). "_keep" lista o que não se traduz
(marcas, nomes de programas, ONGs, e-mails).

Também injeta nas páginas PT (e nas geradas) o bloco de SEO/analytics:
hreflang, og:locale e dataLayer.page_language.
"""
import json, re, sys
from pathlib import Path
from urllib.parse import urljoin, urlsplit

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SITE = "https://studio.freehelper.com.br"
PAGES = ["index.html", "cadastro/index.html", "case-fh/mapfre/index.html", "obrigado-empresa/index.html"]
LANGS = {"en": {"html": "en", "og": "en_US"}, "es": {"html": "es", "og": "es_ES"}}
PT = {"html": "pt-BR", "og": "pt_BR"}

SKIP = r"<script\b.*?</script>|<style\b.*?</style>|<!--.*?-->|<noscript\b.*?</noscript>"
TOKEN = re.compile(SKIP + r"|<[^>]+>", re.S | re.I)
ATTR = re.compile(r'\b(alt|aria-label|placeholder|title|content)="([^"]*)"')
URL_ATTR = re.compile(r'\b(href|src)="([^"]*)"')
META_TEXT = re.compile(r'(name|property)="(description|og:title|og:description|twitter:title|twitter:description)"')
LETTER = re.compile(r"[A-Za-zÀ-ú]")
BLOCK = re.compile(r"\n?<!-- i18n:start -->.*?<!-- i18n:end -->", re.S)


def page_url(page):
    return "/" + page[: -len("index.html")]


def norm(s):
    return " ".join(s.split())


class Missing(Exception):
    pass


def translator(dic, keep, missing):
    def tr(s):
        key = norm(s)
        if not LETTER.search(key) or key in keep:
            return s
        if key not in dic:
            missing.add(key)
            return s
        lead = s[: len(s) - len(s.lstrip())]
        trail = s[len(s.rstrip()):]
        return lead + dic[key] + trail
    return tr


def rewrite_url(v, base, lang):
    if re.match(r"^(#|[a-z]+:|//)", v):
        return v
    parts = urlsplit(urljoin(SITE + base, v))
    path = parts.path
    is_page = any(path == page_url(p) for p in PAGES)
    if lang and is_page:
        path = "/" + lang + path
    out = path + ("?" + parts.query if parts.query else "") + ("#" + parts.fragment if parts.fragment else "")
    return out


def i18n_block(page, lang):
    url = page_url(page)
    info = LANGS[lang] if lang else PT
    lines = ["<!-- i18n:start -->"]
    lines.append('<script>window.dataLayer=window.dataLayer||[];dataLayer.push({page_language:"%s"});</script>' % (lang or "pt"))
    if "obrigado" not in page:
        lines.append('<link rel="alternate" hreflang="pt-BR" href="%s%s" />' % (SITE, url))
        for l in LANGS:
            lines.append('<link rel="alternate" hreflang="%s" href="%s/%s%s" />' % (l, SITE, l, url))
        lines.append('<link rel="alternate" hreflang="x-default" href="%s%s" />' % (SITE, url))
    lines.append('<meta property="og:locale" content="%s" />' % info["og"])
    for l, i in [(None, PT)] + list(LANGS.items()):
        if l != lang:
            lines.append('<meta property="og:locale:alternate" content="%s" />' % i["og"])
    lines.append("<!-- i18n:end -->")
    return "\n".join(lines)


def with_block(src, page, lang):
    src = BLOCK.sub("", src)
    # logo depois do <meta charset>, antes do GTM (page_language chega junto do page_view)
    return re.sub(r"(<meta charset=\"UTF-8\" />)", lambda m: m.group(1) + "\n" + i18n_block(page, lang), src, count=1)


def translate_page(src, page, lang, tr):
    base = page_url(page)
    out, pos = [], 0
    for m in TOKEN.finditer(src):
        out.append(tr(src[pos:m.start()]))
        tag = m.group(0)
        if tag.startswith("<") and not re.match(r"<(script|style|!--|noscript)", tag, re.I):
            is_meta = tag.startswith("<meta")
            def attr(a):
                if a.group(1) == "content" and not (is_meta and META_TEXT.search(tag)):
                    return a.group(0)
                return '%s="%s"' % (a.group(1), tr(a.group(2)))
            tag = ATTR.sub(attr, tag)
            tag = URL_ATTR.sub(lambda a: '%s="%s"' % (a.group(1), rewrite_url(a.group(2), base, lang)), tag)
        elif re.match(r"<script\b[^>]*\bsrc=", tag, re.I):
            tag = URL_ATTR.sub(lambda a: '%s="%s"' % (a.group(1), rewrite_url(a.group(2), base, lang)), tag)
        out.append(tag)
        pos = m.end()
    out.append(tr(src[pos:]))
    html = "".join(out)
    html = re.sub(r'<html lang="[^"]*"', '<html lang="%s"' % LANGS[lang]["html"], html, count=1)
    # URLs absolutas da própria página (canonical, og:url, botões de compartilhar)
    abs_pt = SITE + base
    abs_tr = SITE + "/" + lang + base
    html = html.replace('"%s"' % abs_pt, '"%s"' % abs_tr)
    enc = lambda u: u.replace(":", "%3A").replace("/", "%2F")
    html = html.replace(enc(abs_pt), enc(abs_tr))
    return with_block(html, page, lang)


def main():
    check = "--check" in sys.argv
    problems = {}
    results = {}
    for lang in LANGS:
        data = json.loads((HERE / (lang + ".json")).read_text())
        keep = set(data.pop("_keep", []))
        data = {norm(k): v for k, v in data.items() if not k.startswith("_")}
        missing = set()
        tr = translator(data, keep, missing)
        for page in PAGES:
            src = (ROOT / page).read_text()
            results[(lang, page)] = translate_page(src, page, lang, tr)
        if missing:
            problems[lang] = sorted(missing)
    if problems:
        for lang, keys in problems.items():
            print("\n[%s] %d texto(s) sem tradução em tools/i18n/%s.json:" % (lang, len(keys), lang))
            for k in keys:
                print("  " + json.dumps(k, ensure_ascii=False))
        sys.exit(1)
    if check:
        print("tudo traduzido.")
        return
    for page in PAGES:
        p = ROOT / page
        p.write_text(with_block(p.read_text(), page, None))
    for (lang, page), html in results.items():
        dest = ROOT / lang / page
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html)
    print("ok: %d páginas geradas em %s" % (len(results), ", ".join("/%s/" % l for l in LANGS)))


if __name__ == "__main__":
    main()
