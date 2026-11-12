# Made with Claude (Anthropic) · © Homes in Georgia · Created by Irakli Kvirkvelia
"""Automatic checks for the Gimili CRM — run before every upload:

    pip install playwright && python -m playwright install chromium   (once)
    python3 tests/crm_test.py

The CRM runs in a real browser against a fake Google Apps Script with test data,
with the clock fixed at 20 November 2026, so results never depend on the real date
and the real Google Sheet is never touched.
"""
import copy, functools, http.server, json, os, threading, unittest
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NOW = '2026-11-20T10:00:00+04:00'

FIXTURE = {
    'staff': [
        {'id': 's1', 'name': 'ბელა', 'staffType': 'staff', 'role': 'დამლაგებელი', 'monthlySalary': 1000, 'active': True},
        {'id': 't1', 'name': 'ნინო', 'active': True},
        {'id': 't3', 'name': 'ლია', 'active': True},
        {'id': 't4', 'name': 'ეკატერინე', 'active': True, 'weeklySettlement': True},
    ],
    'clubs': [
        {'id': 'c1', 'name': 'მენტალური არითმეტიკა', 'billingType': 'monthly', 'tariff': 150, 'teacherId': 't1', 'teacherPercent': 50, 'section': 'circles', 'weekdays': [6], 'timeSlots': ['11:00'], 'billingCatalogVersion': 5},
        {'id': 'c3', 'name': 'კრაფტი', 'billingType': 'per_lesson', 'kindergartenRate': 30, 'externalRate': 40, 'teacherId': 't3', 'teacherPercent': 75, 'section': 'circles', 'billingCatalogVersion': 5},
        {'id': 'c4', 'name': 'ტომატისი', 'billingType': 'per_lesson', 'lessonRate': 50, 'teacherId': 't4', 'section': 'specialists', 'billingCatalogVersion': 5},
    ],
    'children': [
        {'id': 'k1', 'name': 'ანა', 'activityIds': ['c1', 'c3'], 'paymentDay': 5, 'active': True, 'phone': '555', 'activityParticipantTypes': {'c3': 'kindergarten'}},
        {'id': 'k3', 'name': 'ტრიშან', 'activityIds': ['c3'], 'active': True, 'activityParticipantTypes': {'c3': 'kindergarten'}},
        {'id': 'k4', 'name': 'თეა', 'activityIds': ['c3'], 'active': True, 'activityParticipantTypes': {'c3': 'kindergarten'}},
        {'id': 'k5', 'name': 'ლეა', 'activityIds': ['c3'], 'active': True, 'activityParticipantTypes': {'c3': 'kindergarten'}},
        {'id': 'k6', 'name': 'ნიკა', 'activityIds': ['c1'], 'active': True, 'activityStart': {'c1': '2026-11-10'}},
    ],
    'payments': [
        {'id': 'pp', 'childId': 'k3', 'subjectId': 'c3', 'amount': 120, 'date': '2026-11-03', 'billingMonth': '2026-11', 'method': 'cash', 'prepaidLessons': 4},
        {'id': 'pt', 'childId': 'k4', 'subjectId': 'c3', 'amount': 30, 'date': '2026-11-05', 'billingMonth': '2026-11', 'method': 'cash'},
        {'id': 'old', 'childId': 'k1', 'subjectId': '', 'amount': 450, 'date': '2026-09-01', 'method': 'cash'},
        {'id': 'oct', 'childId': 'k1', 'subjectId': 'c1', 'amount': 150, 'date': '2026-10-05', 'billingMonth': '2026-10', 'method': 'cash'},
    ],
    'attendance': [
        {'id': 'a1', 'childId': 'k3', 'subjectId': 'c3', 'date': '2026-11-05', 'status': 'present'},
        {'id': 'a2', 'childId': 'k4', 'subjectId': 'c3', 'date': '2026-11-05', 'status': 'present'},
        {'id': 'a3', 'childId': 'k5', 'subjectId': 'c3', 'date': '2026-11-05', 'status': 'present'},
    ],
    'expenses': [
        {'id': 'e1', 'title': 'ქირა', 'category': 'ქირა', 'amount': 500, 'date': '2026-11-01'},
        {'id': 'e2', 'title': 'ხელფასი · ნინო', 'category': 'ხელფასები', 'amount': 80, 'date': '2026-11-03', 'staffId': 't1', 'salaryMonth': '2026-10'},
    ],
    'settlements': [{'id': 'st1', 'staffId': 't4', 'subjectId': 'c4', 'date': '2026-11-12', 'total': 100, 'centerAmount': 40}],
    'stats': [
        {'id': '2026-11-19', 'date': '2026-11-19', 'views': 30, 'visitors': 20, 'newVisitors': 12, 'book': 6, 'contacts': 4, 'sources': {'instagram': 14, 'direct': 16}, 'contactBy': {'whatsapp': 3, 'call': 1}, 'bookWhat': {'კრაფტი': 4, 'general': 2}, 'sections': {'clubs': 18}},
        {'id': '2026-11-20', 'date': '2026-11-20', 'views': 10, 'visitors': 8, 'newVisitors': 5, 'book': 2, 'contacts': 1, 'sources': {'instagram': 6, 'google': 4}, 'contactBy': {'telegram': 1}},
        {'id': '2026-08-01', 'date': '2026-08-01', 'views': 99, 'visitors': 99},
    ],
    'deposits': [], 'closings': [], 'schedule': [], 'leads': [], 'tasks': [], 'groups': [], 'parents': [],
}
VIEWS = ['analytics', 'dashboard', 'children', 'payments', 'expenses', 'accounting', 'reports', 'months', 'clubs', 'staff', 'attendance', 'schedule', 'parents', 'settings']


class Server:
    def __enter__(self):
        class Quiet(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *a): pass
        handler = functools.partial(Quiet, directory=ROOT)
        self.httpd = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()
        self.url = f'http://127.0.0.1:{self.httpd.server_address[1]}/crm.html'
        return self
    def __exit__(self, *a): self.httpd.shutdown(); self.httpd.server_close()


class CRMTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = Server().__enter__()
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch()
    @classmethod
    def tearDownClass(cls):
        cls.browser.close(); cls.pw.stop(); cls.server.__exit__()

    def open(self, width=390, extra=None):
        """Fresh CRM page with its own copy of the test data (self.db mirrors what the fake server stores)."""
        self.db = copy.deepcopy(FIXTURE)
        for kind, rows in (extra or {}).items(): self.db[kind] = self.db.get(kind, []) + rows
        self.errors = []
        ctx = self.browser.new_context(viewport={'width': width, 'height': 900}, timezone_id='Asia/Tbilisi', locale='ka-GE')
        self.addCleanup(ctx.close)
        page = ctx.new_page()
        page.clock.set_fixed_time(NOW)
        page.on('pageerror', lambda e: self.errors.append(str(e)))
        page.on('dialog', lambda d: d.accept())
        page.route('https://script.google.com/**', self._fake_server)
        page.add_init_script("localStorage.setItem('gimili_crm_session','x')")
        page.goto(self.server.url)
        page.wait_for_function('typeof data !== "undefined" && data.children && data.children.length > 0', timeout=15000)
        self.page = page
        return page

    def _fake_server(self, route):
        body = json.loads(route.request.post_data or '{}'); action = body.get('action'); db = self.db
        def apply(op):
            rows = db.setdefault(op['kind'], [])
            if op['action'] == 'create': rows.insert(0, {**op['record'], 'id': op.get('id') or f"{op['kind']}-{len(rows) + 1}"})
            elif op['action'] == 'update': db[op['kind']] = [{**op['record'], 'id': op['id']} if x['id'] == op['id'] else x for x in rows]
            elif op['action'] == 'delete': db[op['kind']] = [x for x in rows if x['id'] != op['id']]
        if action == 'list': out = {'ok': True, 'user': {'name': 'Test', 'email': 't@t'}, 'records': db, 'sourceRows': []}
        elif action == 'batch':
            for op in body['ops']: apply(op)
            out = {'ok': True, 'results': [{'ok': True} for _ in body['ops']]}
        elif action in ('create', 'update', 'delete'): apply({**body, 'action': action}); out = {'ok': True, 'id': body.get('id')}
        else: out = {'ok': True}
        route.fulfill(status=200, content_type='application/json', body=json.dumps(out))

    def js(self, code): return self.page.evaluate(code)
    def submit(self):
        self.page.click('#modalForm button[type=submit]'); self.page.wait_for_timeout(400)
    def modal_open(self): return self.page.locator('#modal:not(.hidden)').count() > 0
    def tearDown(self):
        self.assertEqual(getattr(self, 'errors', []), [], 'JavaScript errors on the page')

    # ---------- every screen opens ----------
    def test_all_screens_open_on_phone_and_desktop(self):
        for width in (390, 1366):
            self.open(width)
            for view in VIEWS + ['childProfile', 'staffProfile', 'circleProfile']:
                if view == 'childProfile': self.js("showChild('k1')")
                elif view == 'staffProfile': self.js("showStaff('t3')")
                elif view == 'circleProfile': self.js("showCircle('c3')")
                else: self.js(f"go('{view}')")
                self.page.wait_for_timeout(80)
                self.assertTrue(self.page.inner_text('#view').strip(), f'{view} is empty at {width}px')
                self.assertFalse(self.js('document.documentElement.scrollWidth > innerWidth + 1'), f'{view} scrolls sideways at {width}px')

    # ---------- the same money figures on every screen ----------
    def test_income_is_the_same_on_every_screen(self):
        # October lesson paid on 2 November: belongs to October everywhere
        self.open(extra={'payments': [{'id': 'late', 'childId': 'k1', 'subjectId': 'c1', 'amount': 150, 'date': '2026-11-02', 'billingMonth': '2026-10', 'method': 'cash'}]})
        for period, month in (('month', '2026-11'), ('prev', '2026-10')):
            self.js(f"period='{period}'")
            totals = self.js("(() => { const t = accountingTotals(); return [t.income, t.totalExpenses, t.profit]; })()")
            fin = self.js(f"(() => {{ const f = monthFinance('{month}'); return [f.income, f.expenses, f.profit]; }})()")
            self.assertEqual(totals, fin, f'dashboard and accounting differ for {month}')
        self.assertEqual(self.js("monthFinance('2026-10').income"), 300)
        self.assertEqual(self.js("monthSummary('2026-11').income"), self.js("monthFinance('2026-11').income"))
        self.js("period='month'; go('dashboard'); go('reports')")
        self.assertEqual(self.errors, [])

    # ---------- old debts after closing a month ----------
    def test_closed_month_debts(self):
        self.open(extra={'children': [
            {'id': 'g1', 'name': 'გიო', 'tariff': 350, 'group': 'მინი-ბაღი', 'paymentDay': 3, 'active': True, 'paidMarkerMonth': '2026-10'},
            {'id': 'd1', 'name': 'დათო', 'activityIds': ['c1'], 'paymentDay': 5, 'active': True, 'activityStart': {'c1': '2026-10-01'}},
        ]})
        self.js("confirmCloseMonth('2026-10')"); self.page.wait_for_timeout(300)
        self.assertEqual(self.js("oldDebts('g1').length"), 0, 'a month marked as paid is not a debt after closing')
        self.assertEqual(self.js("oldDebts('d1').map(b => b.remaining)"), [150])
        self.db['payments'].insert(0, {'id': 'pd', 'childId': 'd1', 'subjectId': 'c1', 'amount': 100, 'date': '2026-11-20', 'billingMonth': '2026-10', 'method': 'cash'})
        self.js("data.payments.unshift({id:'pd',childId:'d1',subjectId:'c1',amount:100,date:'2026-11-20',billingMonth:'2026-10',method:'cash'})")
        self.assertEqual(self.js("oldDebts('d1').map(b => b.remaining)"), [50], 'a payment after closing lowers the old debt')

    def test_circle_name_with_apostrophe(self):
        self.open(extra={'clubs': [{'id': 'cx', 'name': "Kid's art", 'billingType': 'monthly', 'tariff': 100, 'section': 'specialists', 'teacherId': 't4'}],
                         'children': [{'id': 'kx', 'name': 'X', 'activityIds': ['cx'], 'active': True}]})
        self.js("showChild('kx')"); self.page.wait_for_timeout(150)
        self.page.locator("button:has-text('მოხსნა')").first.click(); self.page.wait_for_timeout(300)
        self.assertNotIn('cx', self.js("get('children','kx').activityIds"))

    def test_children_active_first(self):
        self.open(extra={'children': [{'id': 'z0', 'name': 'ააა', 'active': False}]})
        self.js("go('children')"); self.page.wait_for_timeout(100)
        tabs = self.page.locator('#view .status-tabs button')
        self.assertEqual([tabs.nth(i).inner_text().split()[0] for i in range(3)], ['აქტიური', 'არააქტიური', 'ყველა'])
        self.assertIn('active', tabs.nth(0).get_attribute('class'), 'active children are shown by default')
        self.assertNotIn('ააა', self.page.inner_text('#rows'))
        self.js("setParticipantStatusFilter('all')"); self.page.wait_for_timeout(100)
        self.assertEqual(self.js("filteredByParticipantStatus('children', data.children).at(-1).id"), 'z0', 'inactive children go to the bottom')
        self.assertFalse(self.js("MENU.some(s => s[3].some(p => p[0] === 'sourceTable'))"), 'the old source table is gone from the menu')

    # ---------- menu: 5 sections with tabs ----------
    def test_menu_five_sections_with_tabs(self):
        old_menu = {'dashboard', 'schedule', 'children', 'parents', 'attendance', 'contacts', 'leads', 'clubs', 'staff',
                    'payments', 'expenses', 'accounting', 'months', 'reports', 'analytics', 'tasks', 'settings'}
        page = self.open(1366)
        self.assertEqual(self.js("MENU.length"), 5)
        self.assertEqual(set(self.js("MENU.flatMap(s => s[3].map(p => p[0]))")), old_menu, 'every screen of the old menu is still in the menu')
        self.assertEqual(page.locator('#sidebar .side-group > .side-item').count(), 5)
        self.js("go('accounting')"); page.wait_for_timeout(100)
        self.assertEqual(page.locator('#view .section-tabs button').count(), 6)
        self.assertEqual(page.inner_text('#view .section-tabs button.active'), 'ბუღალტერია')
        self.assertEqual(page.locator('#sidebar .side-subitem.active').inner_text(), 'ბუღალტერია')
        page.click("#view .section-tabs button:has-text('ხარჯები')"); page.wait_for_timeout(100)
        self.assertEqual(self.js('current'), 'expenses')
        self.js("go('dashboard')"); self.js("openSection('money')")
        self.assertEqual(self.js('current'), 'expenses', 'a section opens on the tab used last time')
        self.js("go('dashboard')"); page.wait_for_timeout(100)
        self.assertEqual(page.locator('#view .section-tabs').count(), 0, 'one-page section has no tabs')
        self.js("showChild('k1')"); page.wait_for_timeout(100)
        self.assertEqual(page.locator('#view .section-tabs').count(), 0, 'detail pages have no tabs')
        self.assertIn('ბავშვები', page.locator('#sidebar .side-item.active').inner_text())
        # phone: bottom bar highlights the section, the menu lists the 5 sections
        page = self.open(390)
        self.js("go('months')"); page.wait_for_timeout(100)
        self.assertEqual(page.locator('.nav button.active').get_attribute('data-section'), 'money')
        self.js("go('attendance')"); page.wait_for_timeout(100)
        self.assertEqual(page.locator('.nav button.active').get_attribute('data-nav'), 'more')
        self.js('toggleDrawer(true)'); page.wait_for_timeout(100)
        self.assertEqual(page.locator('#drawerGrid .drawer-section').count(), 5)
        page.click("#drawerGrid .drawer-section:has-text('ცენტრი')"); page.wait_for_timeout(100)
        self.assertEqual(self.js('current'), 'clubs')
        self.assertFalse(self.js('document.documentElement.scrollWidth > innerWidth + 1'))

    # ---------- billing ----------
    def test_monthly_circle_bill_and_payment(self):
        self.open()
        bill = self.js("subjectBill(get('children','k1'), get('clubs','c1'), '2026-11')")
        self.assertEqual(bill['remaining'], 150)
        self.js("paymentForSubject('k1','c1')"); self.submit()
        self.assertEqual(self.js("subjectBill(get('children','k1'), get('clubs','c1'), '2026-11').remaining"), 0)

    def test_billing_starts_from_the_month_the_child_started(self):
        self.open()
        rows = lambda m: self.js(f"billingRows('{m}').filter(r=>r.child.id==='k6').map(r=>r.remaining)")
        self.assertEqual(rows('2026-10'), [], 'Nika started in November — no October bill')
        self.assertEqual(rows('2026-11'), [150])

    def test_per_lesson_ledger_prepaid_and_debt(self):
        self.open()
        led = self.js("perLessonLedger(get('children','k3'), get('clubs','c3'), '2026-11')")
        self.assertEqual((led['lessons'], led['available'], led['remaining'], led['lessonsLeft']), (1, 120, 0, 3))
        led = self.js("perLessonLedger(get('children','k5'), get('clubs','c3'), '2026-11')")
        self.assertEqual(led['remaining'], 30)

    # ---------- teacher pay ----------
    def test_teacher_paid_only_for_held_and_paid_lessons(self):
        self.open()
        # Trishan prepaid 4 lessons (120) and came once; Tea paid 30 and came; Lea came but did not pay → 75% of 60.
        self.assertEqual(self.js("payroll(monthRange('2026-11'),1).rows.find(r=>r.person.id==='t3').accrued"), 45)
        base = self.js("circleBase(get('clubs','c3'), monthRange('2026-11'))")
        self.assertEqual(sum(x['amount'] for x in base['prepaid']), 90)
        self.assertEqual(sum(x['amount'] for x in base['unpaid']), 30)

    def test_teacher_percent_of_monthly_circle(self):
        self.open()
        self.js("paymentForSubject('k1','c1')"); self.submit()
        self.assertEqual(self.js("payroll(monthRange('2026-11'),1).rows.find(r=>r.person.id==='t1').accrued"), 75)

    def test_weekly_settlement_share(self):
        self.open()
        self.assertEqual(self.js("payroll(monthRange('2026-11'),1).rows.find(r=>r.person.id==='t4').accrued"), 60)

    def test_salary_advance_and_rest(self):
        self.open()
        self.js("staffTab='personnel'; go('staff')"); self.page.wait_for_timeout(150)
        self.js("salaryAdvance('s1')"); self.page.fill('#field-amount', '300'); self.page.fill('#field-date', '2026-11-07'); self.submit()
        row = self.js("payroll(monthRange('2026-11'),1).rows.find(r=>r.person.id==='s1')")
        self.assertEqual((row['accrued'], row['paid'], row['due']), (1000, 300, 700))
        self.assertIn('700', self.page.inner_text('#view'))
        self.assertEqual(row['cost'], 1000, 'the month costs the whole salary, not only the advance')

    def test_month_cost_is_whole_salary(self):
        self.open()
        oct_t1 = self.js("payroll(monthRange('2026-10'),1).rows.find(r=>r.person.id==='t1')")
        self.assertEqual(oct_t1['cost'], max(oct_t1['accrued'], oct_t1['paid']))
        nov = self.js("payroll(monthRange('2026-11'),1).rows.find(r=>r.person.id==='s1')")
        self.assertEqual((nov['paid'], nov['cost']), (0, 1000), 'unpaid fixed salary still counts in the month')
        self.assertEqual(self.js("monthFinance('2026-11').salaries"), self.js("payroll(monthRange('2026-11'),1).total"))

    def test_salary_counts_for_the_month_it_was_given_for(self):
        self.open()
        oct_paid = self.js("payroll(monthRange('2026-10'),1).rows.find(r=>r.person.id==='t1').paid")
        nov_paid = self.js("payroll(monthRange('2026-11'),1).rows.find(r=>r.person.id==='t1').paid")
        self.assertEqual((oct_paid, nov_paid), (80, 0))

    # ---------- deposit ----------
    def test_deposit_in_pay_overspend_refund(self):
        self.open()
        self.js("showChild('k1')"); self.page.wait_for_timeout(150)
        self.js("depositForm('k1','in')"); self.page.fill('#field-amount', '200'); self.submit()
        self.assertEqual(self.js("depositBalance('k1')"), 200)
        self.page.locator('button:has-text("დეპოზიტიდან")').first.click(); self.page.wait_for_timeout(400)
        self.assertEqual(self.js("depositBalance('k1')"), 50)
        self.assertTrue(any(p.get('method') == 'deposit' and p['amount'] == 150 for p in self.db['payments']))
        self.js("paymentForm('k1')"); self.page.fill('#field-amount', '100'); self.page.select_option('#field-method', 'deposit'); self.submit()
        self.assertTrue(self.modal_open(), 'paying 100 from a 50 deposit must be refused')
        self.js("closeModal()")
        self.js("depositForm('k1','refund')"); self.submit()
        self.assertEqual(self.js("depositBalance('k1')"), 0)

    def test_deposit_is_not_income_until_spent(self):
        self.open(extra={'deposits': [{'id': 'd1', 'childId': 'k1', 'type': 'in', 'amount': 500, 'date': '2026-11-02', 'method': 'cash'}]})
        before = self.js("accountingTotals().income")
        self.assertEqual(self.js("depositsHeld()"), 500)
        self.js("go('accounting')"); self.page.wait_for_timeout(100)
        self.assertEqual(self.js("accountingTotals().income"), before)

    # ---------- website analytics ----------
    def test_analytics_sums_the_chosen_period(self):
        self.open(1366)
        self.js("setStatsDays(7)")
        tot = self.js("sumStats(statsRows(7)).total")
        self.assertEqual((tot['visitors'], tot['views'], tot['contacts'], tot['book']), (28, 40, 5, 8))
        self.assertEqual(self.js("sumStats(statsRows(7)).lists.sources.instagram"), 20)
        text = self.page.inner_text('#view')
        self.assertIn('Instagram', text); self.assertIn('WhatsApp', text); self.assertIn('17.9%', text)

    def test_directions_profit(self):
        self.open(1366)
        self.js("paymentForSubject('k1','c1')"); self.submit()   # 150 for mental arithmetic, teacher 50%
        res = self.js("(() => { const r = directionStats(['2026-11']); return { rows: r.rows.map(x => [x.name, x.revenue, x.teachers, x.margin, Math.round(x.overhead), Math.round(x.net)]), total: r.total }; })()")
        rows = {r[0]: r for r in res['rows']}
        self.assertEqual(rows['მენტალური არითმეტიკა'][1:4], [150, 75, 75])
        self.assertEqual(rows['კრაფტი'][1:4], [150, 45, 105])          # 150 paid; 45 earned by the teacher
        self.assertEqual(rows['ტომატისი'][1:4], [100, 60, 40])          # Ekaterine's settlement
        self.assertAlmostEqual(res['total']['net'], res['total']['margin'] - res['total']['overhead'], places=6)
        self.js("analyticsTab='dirs'; go('analytics')"); self.page.wait_for_timeout(150)
        self.assertIn('მიმართულებები', self.page.inner_text('#view'))

    # ---------- dashboard: money of one day by circle ----------
    def test_dashboard_day_earnings_by_circle(self):
        self.open(extra={
            'payments': [
                {'id': 'd20a', 'childId': 'k1', 'subjectId': 'c1', 'amount': 150, 'date': '2026-11-20', 'billingMonth': '2026-11', 'method': 'cash'},
                {'id': 'd20b', 'childId': 'k5', 'subjectId': 'c3', 'amount': 30, 'date': '2026-11-20', 'billingMonth': '2026-11', 'method': 'cash'},
                {'id': 'd20c', 'childId': 'k4', 'subjectId': 'c3', 'amount': 30, 'date': '2026-11-20', 'billingMonth': '2026-11', 'method': 'deposit'},
            ],
            'deposits': [{'id': 'dep', 'childId': 'k1', 'type': 'in', 'amount': 500, 'date': '2026-11-20', 'method': 'cash'}],
        })
        rows = self.js("dayEarnings('2026-11-20').map(r => [r.name, r.amount, r.count])")
        self.assertEqual(rows, [['მენტალური არითმეტიკა', 150, 1], ['კრაფტი', 60, 2]], 'deposit top-up is not income; paying from it is')
        self.js("go('dashboard')"); self.page.wait_for_timeout(100)
        text = self.page.inner_text('#view')
        self.assertIn('დღის შემოსავალი წრეებით', text); self.assertIn('₾210', text)
        self.js("shiftEarnDay(-15)"); self.page.wait_for_timeout(100)
        self.assertEqual(self.js("dayEarnings(earnDay).map(r => [r.name, r.amount])"), [['კრაფტი', 30]])
        self.js("shiftEarnDay(-1)"); self.page.wait_for_timeout(100)
        self.assertIn('ამ დღეს გადახდები არ არის', self.page.inner_text('#view'))
        self.js("shiftEarnDay(99)"); self.assertEqual(self.js("earnDay"), '', 'cannot go past today')

    # ---------- months ----------
    def test_september_is_hidden(self):
        self.open()
        self.assertEqual(self.js("accountingMonths()")[0], '2026-10')
        self.assertNotIn('2026-09', self.js("monthList()"))

    def test_closed_month_refuses_new_payments(self):
        self.open(extra={'closings': [{'id': 'cl1', 'month': '2026-10', 'closedAt': '2026-11-03', 'closedBy': 'test'}]})
        self.js("paymentForm('k1')"); self.page.fill('#field-amount', '50'); self.page.fill('#field-date', '2026-10-15'); self.submit()
        self.assertTrue(self.modal_open(), 'a payment dated in a closed month must be refused')


if __name__ == '__main__':
    unittest.main(verbosity=2)
