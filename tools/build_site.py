# Made with Claude (Anthropic) · © Homes in Georgia · Created by Irakli Kvirkvelia
"""Builds the public site from src/index.html, ready for search engines and AI crawlers:

    python3 tools/build_site.py

Renders the page in a browser once per language and saves the finished HTML (all text, prices,
schedule, FAQ, reviews and search data already inside), so robots that do not run JavaScript
(ChatGPT, Perplexity, part of Bing/Yandex) see everything:
    index.html (ka) · ru/index.html · en/index.html · llms.txt · sitemap.xml
Visitors get the same page as before; the script on it simply takes over.
"""
import functools, http.server, os, re, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANGS = {'ka': 'index.html', 'ru': 'ru/index.html', 'en': 'en/index.html'}
URLS = {'ka': 'https://gimili.ge/', 'ru': 'https://gimili.ge/ru/', 'en': 'https://gimili.ge/en/'}
STAMP = '<!-- Made with Claude (Anthropic) · © Homes in Georgia · Created by Irakli Kvirkvelia -->'


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def main():
    template = open(os.path.join(ROOT, 'src/index.html'), encoding='utf-8').read()
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{srv.server_address[1]}'
    llms = {}
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for lang, out in LANGS.items():
            html = template.replace('<html lang="ka">', f'<html lang="{lang}" data-lang="{lang}">', 1)
            page = browser.new_page(viewport={'width': 1280, 'height': 900})
            page.route('**/fonts.googleapis.com/**', lambda r: r.abort())
            page.route('**/fonts.gstatic.com/**', lambda r: r.abort())
            page.route('**/google.com/maps**', lambda r: r.fulfill(body='', content_type='text/html'))
            page.route(f'{base}/__build/{lang}/', (lambda h: lambda r: r.fulfill(body=h, content_type='text/html; charset=utf-8'))(html))
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(f'{base}/__build/{lang}/')
            page.wait_for_function('document.getElementById("clubList").children.length > 0')
            if errors: raise SystemExit(f'{lang}: {errors}')
            built = '<!doctype html>\n' + page.evaluate('document.documentElement.outerHTML')
            if STAMP not in built: raise SystemExit('attribution line missing')
            path = os.path.join(ROOT, out)
            os.makedirs(os.path.dirname(path) or ROOT, exist_ok=True)
            open(path, 'w', encoding='utf-8').write(built)
            llms[lang] = page.evaluate('''() => {
              const t = T[lang], L = [];
              L.push(`## ${t.metaTitle}`, '', t.metaDesc, '', `URL: ${"https://gimili.ge" + LANG_URL[lang]}`,
                     `${t.lblAddress}: ${t.address}`, `${t.lblPhone}: +995 557 256 038 (WhatsApp)`, 'Telegram: https://t.me/centre_gimili', `${t.lblHours}: ${t.hours}`, '');
              const price = (p, u) => p ? ` — ${p} ₾ / ${u === 'l' ? t.perL.replace('₾ / ', '') : u === 'c' ? t.perC.replace('₾ / ', '') : t.perM.replace('₾ / ', '')}` : '';
              L.push(`### ${t.gardenTitle}`, t.gardenLead, ...GARDEN_SLOTS.map(g => `- ${g.label[lang]} ${g.time}${price(g.price, 'm')}`), '');
              L.push(`### ${t.clubsTitle}`, ...CLUBS.map(k => `- ${k.name[lang]}${price(k.price, k.unit)}${k.days.length ? ' · ' + dayRange(k.days) : ''}${k.time ? ' ' + k.time : ''}: ${k.text[lang]}`), '');
              L.push(`### ${t.specTitle}`, ...SPECS.map(k => `- ${k.name[lang]}${price(k.price, k.unit)}${k.days ? ' · ' + dayRange(k.days) + ' ' + k.time : ''}: ${k.text[lang]}`), '');
              L.push(`### ${t.teamTitle}`, ...TEAM.map(p => `- ${p.name[lang]} — ${p.role[lang]}${p.exp ? ' (' + t.exp(p.exp) + ')' : ''}`), '');
              L.push(`### ${t.faqTitle}`, ...t.faq.flatMap(([q, a]) => [`- ${q}`, `  ${a}`]), '');
              return L.join('\\n');
            }''')
            page.close()
        browser.close()
    srv.shutdown()
    head = ('# ღიმილი · Gimili · Гимили\n\n'
            '> Children\'s development centre and mini kindergarten in Isani, Tbilisi, Georgia. '
            'Georgian, Russian and English. Booking: WhatsApp +995 557 256 038 or https://t.me/centre_gimili\n\n')
    open(os.path.join(ROOT, 'llms.txt'), 'w', encoding='utf-8').write(head + '\n'.join(llms[l] for l in ('ka', 'ru', 'en')) + '\n')
    alt = ''.join(f'\n    <xhtml:link rel="alternate" hreflang="{l}" href="{u}"/>' for l, u in URLS.items())
    urls = ''.join(f'\n  <url><loc>{u}</loc><changefreq>weekly</changefreq><priority>{"1.0" if l == "ka" else "0.9"}</priority>{alt}\n  </url>' for l, u in URLS.items())
    open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8').write(
        f'<?xml version="1.0" encoding="UTF-8"?>\n{STAMP}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">{urls}\n</urlset>\n')
    print('built:', ', '.join(LANGS.values()), '+ llms.txt, sitemap.xml')


if __name__ == '__main__':
    main()
