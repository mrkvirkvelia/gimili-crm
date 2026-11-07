# Made with Claude (Anthropic) · © Homes in Georgia · Created by Irakli Kvirkvelia
# Full check of gimili.ge page: styles applied, no errors, no sideways scroll, chooser works — phone, tablet, desktop.
import http.server,functools,threading,sys
from playwright.sync_api import sync_playwright
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
s=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Q,directory=__import__('os').path.dirname(__import__('os').path.dirname(__import__('os').path.abspath(__file__))))); threading.Thread(target=s.serve_forever,daemon=True).start()
bad=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for path,w,h in [('/',320,640),('/',390,844),('/',768,1024),('/',1100,800),('/',1440,900),('/ru/',390,844),('/ru/',1440,900),('/en/',390,844),('/en/',1440,900)]:
        pg=b.new_page(viewport={'width':w,'height':h}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/google.com/**',lambda r:r.abort()); pg.goto(f'http://127.0.0.1:{s.server_address[1]}{path}'); pg.wait_for_timeout(500)
        st=pg.evaluate("""(()=>{const g=e=>getComputedStyle(document.querySelector(e));return {club:g('.club').borderRadius, contact:g('.contact').display, sheet:g('#sheet').display, bar:g('#bar').position, faq:g('.faq details').borderRadius}})()""")
        ok = st['club']!='0px' and st['contact']=='grid' and st['sheet']=='none' and st['bar']=='fixed' and st['faq']!='0px'
        hs=pg.evaluate('document.documentElement.scrollWidth>innerWidth+1')
        pg.click('.hero .ctas [data-tg]'); pg.wait_for_timeout(250); op=pg.is_visible('#sheet .opt.wa'); pg.click('#sheet .opt-close'); pg.wait_for_timeout(150); cl=not pg.is_visible('#sheet .card')
        want={'/':'ka','/ru/':'ru','/en/':'en'}[path]; lok=pg.evaluate('document.documentElement.lang')==want and pg.evaluate("document.querySelector('.top .lang [aria-current]').dataset.lang")==want
        if not lok: errs.append('language '+want)
        print(path, w, 'styles', ok, 'hs', hs, 'chooser', op and cl, errs)
        if not ok or hs or not (op and cl) or errs: bad.append(path+str(w))
        pass
    b.close()
print('FAIL' if bad else 'ALL OK', bad)
if bad: sys.exit(1)

# Built pages must carry the text in the HTML itself (for robots that do not run scripts) and be up to date with src/.
import re as _re, os as _os
_root=_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
for _f,_word in [('index.html','კრაფტი'),('ru/index.html','Крафт'),('en/index.html','Craft')]:
    _s=open(_os.path.join(_root,_f),encoding='utf-8').read()
    _txt=_re.sub(r'<script.*?</script>|<style.*?</style>','',_s,flags=_re.S)
    if _word not in _txt: print('NOT BUILT', _f); sys.exit(1)
if _os.path.getmtime(_os.path.join(_root,'src/index.html')) > _os.path.getmtime(_os.path.join(_root,'index.html')) + 1:
    print('src/index.html is newer than index.html — run python3 tools/build_site.py'); sys.exit(1)
print('built pages OK')
