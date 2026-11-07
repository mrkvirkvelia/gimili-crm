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
    for w,h in [(320,640),(390,844),(768,1024),(1100,800),(1440,900)]:
        pg=b.new_page(viewport={'width':w,'height':h}); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/google.com/**',lambda r:r.abort()); pg.goto(f'http://127.0.0.1:{s.server_address[1]}/'); pg.wait_for_timeout(500)
        st=pg.evaluate("""(()=>{const g=e=>getComputedStyle(document.querySelector(e));return {club:g('.club').borderRadius, contact:g('.contact').display, sheet:g('#sheet').display, bar:g('#bar').position, faq:g('.faq details').borderRadius}})()""")
        ok = st['club']!='0px' and st['contact']=='grid' and st['sheet']=='none' and st['bar']=='fixed' and st['faq']!='0px'
        hs=pg.evaluate('document.documentElement.scrollWidth>innerWidth+1')
        pg.click('.hero .ctas [data-tg]'); pg.wait_for_timeout(250); op=pg.is_visible('#sheet .opt.wa'); pg.click('#sheet .opt-close'); pg.wait_for_timeout(150); cl=not pg.is_visible('#sheet .card')
        print(w, 'styles', ok, 'hs', hs, 'chooser', op and cl, errs)
        if not ok or hs or not (op and cl) or errs: bad.append(w)
        pass
    b.close()
print('FAIL' if bad else 'ALL OK', bad); sys.exit(1 if bad else 0)
