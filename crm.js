// Made with Claude (Anthropic) · © Homes in Georgia · Created by Irakli Kvirkvelia
const sections = ["closings", "parents", "children", "staff", "leads", "payments", "expenses", "tasks", "groups", "clubs", "schedule", "attendance"];
let data = Object.fromEntries(sections.map(key => [key, []]));
let sourceRows = [];
let signedInUser = null;
let current = "dashboard";
let staffTab = "teachers";
let sectionTab = "garden";
let showAllToday = false;
let period = "month";
let customPeriod = null;
let currentChildId = null;
let expenseCategory = 'all';
let paymentMonth = todayMonth();
let calendarMonth = todayMonth();
let calendarSelected = localDate();
let participantStatusFilter = 'all';
const expenseCategories = ['კომუნალური მომსახურება', 'საკანცელარიო ნივთები', 'ხელფასები', 'ქირა', 'რეკლამა', 'სასწავლო მასალები', 'კვება', 'რემონტი და აღჭურვილობა', 'გადასახადები და საკომისიოები', 'მასტერკლასის წამყვანი', 'სხვა'];
const expenseCategoryAliases = {
  'Коммунальные услуги':'კომუნალური მომსახურება','Канцелярия':'საკანცელარიო ნივთები','Зарплаты':'ხელფასები',
  'Аренда':'ქირა','Реклама':'რეკლამა','Материалы для занятий':'სასწავლო მასალები','Питание':'კვება',
  'Ремонт и оборудование':'რემონტი და აღჭურვილობა','Налоги и комиссии':'გადასახადები და საკომისიოები','Другое':'სხვა'
};
const expenseCategoryLabel = value => expenseCategoryAliases[value] || value || 'კატეგორიის გარეშე';
const paymentMethodLabels = {cash:'ნაღდი',transfer:'გადარიცხვა',card:'ბარათი',other:'სხვა','Наличные':'ნაღდი','Перевод':'გადარიცხვა','Карта':'ბარათი','Другое':'სხვა'};
const paymentMethodLabel = value => paymentMethodLabels[value] || value || 'მეთოდი მითითებული არ არის';
const uiTranslations = new Map([
  ['Главная','მთავარი'],['Статистика','სტატისტიკა'],['Календарь','კალენდარი'],['Предметы','წრეები'],['Педагоги','მასწავლებლები'],['Преподаватели','მასწავლებლები'],['Контакты','კონტაქტები'],['Группы','ჯგუფები'],['Посещаемость','დასწრება'],['Заявки','განაცხადები'],['Задачи','ამოცანები'],['Исходная таблица','საწყისი ცხრილი'],['Настройки','პარამეტრები'],['Бухгалтерия','ბუღალტერია'],
  ['Дети','ბავშვები'],['Оплаты','გადახდები'],['Расходы','ხარჯები'],['Добавить','დამატება'],['Ещё','სხვა'],['Все','ყველა'],['Сохранить','შენახვა'],['Отмена','გაუქმება'],['Изменить','შეცვლა'],['Открыть','გახსნა'],['Оплатить','გადახდა'],['Телефон','ტელეფონი'],['Родитель','მშობელი'],['Группа','ჯგუფი'],['Расписание','განრიგი'],['Статус','სტატუსი'],['Комментарий','კომენტარი'],['Дата','თარიღი'],['Сумма','თანხა'],['Категория','კატეგორია'],['Доход','შემოსავალი'],['Прибыль','მოგება'],['Результат','შედეგი'],['Сотрудники','თანამშრომლები'],
  ['Оплачено','გადახდილია'],['Частично','ნაწილობრივ'],['Надо оплатить','გადასახდელია'],['Бесплатно','უფასო'],['Укажите цену','მიუთითეთ ფასი'],['Активен','აქტიური'],['Неактивен','არააქტიური'],['В списке','სიაში'],['Пауза','პაუზა'],['Завершил','დასრულებული'],['Не указан','მითითებული არ არის'],['Не указана','მითითებული არ არის'],['Не указано','მითითებული არ არის'],['Наличные','ნაღდი'],['Перевод','გადარიცხვა'],['Карта','ბარათი'],['Другое','სხვა'],['Офлайн','ოფლაინ'],['Рекомендация','რეკომენდაცია'],
  ['Новая','ახალი'],['Связались','დავუკავშირდით'],['Пробное','საცდელი გაკვეთილი'],['Пришли','მოვიდა'],['Клиент','კლიენტი'],['Отказ','უარი'],['Был','იყო'],['Не был','არ იყო'],['Открыта','ღიაა'],['Выполнена','შესრულებულია'],['Преподаватель','მასწავლებელი'],
  ['Месяц','თვე'],['3 месяца','3 თვე'],['Квартал','კვარტალი'],['6 месяцев','6 თვე'],['Год','წელი'],['Свой период','საკუთარი პერიოდი'],['С','დან'],['По','მდე'],
  ['Новый ребёнок','ახალი ბავშვი'],['Новый платёж','ახალი გადახდა'],['Расход','ხარჯი'],['Новая запись','ახალი ჩანაწერი'],['Изменить запись','ჩანაწერის შეცვლა'],['Рабочий кабинет','სამუშაო კაბინეტი'],['CRM центра','ცენტრის CRM'],['Диана Давидова','დიანა დავიდოვა']
]);
const uiPhrases = [
  ['По детям и предметам','ბავშვებისა და საგნების მიხედვით'],['Занятия и дни оплаты','გაკვეთილები და გადახდის დღეები'],['По категориям и датам','კატეგორიებისა და თარიღების მიხედვით'],['Все разделы','ყველა განყოფილება'],['Добавить ребёнка','ბავშვის დამატება'],['Добавить оплату','გადახდის დამატება'],['Добавить расход','ხარჯის დამატება'],['Добавить преподавателя','მასწავლებლის დამატება'],['Добавить предмет','საგნის დამატება'],['Добавить занятие','გაკვეთილის დამატება'],['По тарифам в месяц','თვეში ტარიფებით'],['Внесено за период','პერიოდში მიღებული'],['Надо оплатить','გადასახდელია'],['Платежи за месяц','თვის გადახდები'],['Цена не указана','ფასი მითითებული არ არის'],['Телефон не указан','ტელეფონი მითითებული არ არის'],['Родитель не указан','მშობელი მითითებული არ არის'],['Группа не указана','ჯგუფი მითითებული არ არის'],['День оплаты','გადახდის დღე'],['Дата рождения','დაბადების თარიღი'],['Основной телефон','ძირითადი ტელეფონი'],['Дополнительный телефон','დამატებითი ტელეფონი'],['Источник привлечения','მოზიდვის წყარო'],['ФИО ребёнка','ბავშვის სახელი და გვარი'],['ФИО преподавателя','მასწავლებლის სახელი და გვარი'],['Должность','თანამდებობა'],['Способ','გადახდის მეთოდი'],['Название предмета','საგნის დასახელება'],['Цена за месяц','თვიური ფასი'],['Повторяющееся расписание','განმეორებადი განრიგი'],['Занятие','გაკვეთილი'],['Группа / место','ჯგუფი / ადგილი'],['Новая заявка','ახალი განაცხადი'],['Имя','სახელი'],['Источник','წყარო'],['Этап','ეტაპი'],
  ['Карточка ребёнка','ბავშვის ბარათი'],['Дети / профиль','ბავშვები / პროფილი'],['К списку детей','ბავშვების სიაში დაბრუნება'],['Все дети','ყველა ბავშვი'],['Личные данные','პირადი მონაცემები'],['Общий тариф','საერთო ტარიფი'],['Внести платёж','გადახდის შეტანა'],['Получено','მიღებულია'],['Тариф','ტარიფი'],['Скидка','ფასდაკლება'],['Начало','დაწყება'],['Доп. телефон','დამატებითი ტელეფონი'],['Возраст не указан','ასაკი მითითებული არ არის'],
  ['Поиск ребёнка','ბავშვის ძებნა'],['Поиск детей','ბავშვების ძებნა'],['Имя или телефон','სახელი ან ტელეფონი'],['Поиск контактов','კონტაქტების ძებნა'],['Позвонить','დარეკვა'],['Контакты появятся вместе с карточками детей','კონტაქტები ბავშვების ბარათებთან ერთად გამოჩნდება'],
  ['К оплате и оплачено','გადასახდელი და გადახდილი'],['Остаток по указанным ценам','ნაშთი მითითებული ფასების მიხედვით'],['Предметов и тарифов','საგნები და ტარიფები'],['Общий платёж','საერთო გადახდა'],['Платежей за этот месяц пока нет','ამ თვეში გადახდები ჯერ არ არის'],['Пока нет тарифов и предметов с ценой','ფასიანი ტარიფები ან საგნები ჯერ არ არის'],['Дата платежа','გადახდის თარიღი'],
  ['Добавить заявку','განაცხადის დამატება'],['Этап заявки','განაცხადის ეტაპი'],['Заявок пока нет','განაცხადები ჯერ არ არის'],['Источник не указан','წყარო მითითებული არ არის'],['Пока нет записей','ჩანაწერები ჯერ არ არის'],['Пока нет записей детей','ბავშვების ჩანაწერები ჯერ არ არის'],['Запись','ჩანაწერი'],
  ['Цена задаётся для каждого предмета. При необходимости её можно изменить отдельно в карточке ребёнка.','ფასი თითოეული საგნისთვის განისაზღვრება და საჭიროების შემთხვევაში ბავშვის ბარათში იცვლება.'],['Пока никого не записали','ჯერ არავინ ჩაწერილა'],['Добавьте первый предмет','დაამატეთ პირველი საგანი'],['Преподаватель не назначен','მასწავლებელი არ არის დანიშნული'],['Предмет не указан','საგანი მითითებული არ არის'],['Не назначен','არ არის დანიშნული'],
  ['Предыдущий месяц','წინა თვე'],['Следующий месяц','შემდეგი თვე'],['Пн','ორშ'],['Вт','სამ'],['Ср','ოთხ'],['Чт','ხუთ'],['Пт','პარ'],['Сб','შაბ'],['Вс','კვ'],['Занятия','გაკვეთილები'],['Дни оплаты','გადახდის დღეები'],['Добавить в календарь','კალენდარში დამატება'],['Занятие в календаре','გაკვეთილი კალენდარში'],['Выберите предмет','აირჩიეთ საგანი'],['Время','დრო'],['На этот день занятия не добавлены','ამ დღისთვის გაკვეთილები არ არის დამატებული'],['Календарь обновлён','კალენდარი განახლდა'],
  ['Описание расхода','ხარჯის აღწერა'],['Подтверждённые расходы','დადასტურებული ხარჯები'],['Без категории','კატეგორიის გარეშე'],['Без даты','თარიღის გარეშე'],['В этой категории расходов нет','ამ კატეგორიაში ხარჯები არ არის'],['Подтверждённых расходов пока нет','დადასტურებული ხარჯები ჯერ არ არის'],['Разнести','განაწილება'],['Из таблицы','ცხრილიდან'],['Без подписи','დასახელების გარეშე'],
  ['Задача','ამოცანა'],['Срок','ვადა'],['Задач пока нет','ამოცანები ჯერ არ არის'],['Добавить задачу','ამოცანის დამატება'],['Доступ и данные','წვდომა და მონაცემები'],['Выйти','გასვლა'],['Открыть таблицу','ცხრილის გახსნა'],['Обновить источник','წყაროს განახლება'],['Общее хранение','საერთო საცავი'],['Рабочая Google-таблица','სამუშაო Google ცხრილი'],
  ['Динамика прибыли','მოგების დინამიკა'],['Динамика детей','ბავშვების დინამიკა'],['Расходы по категориям','ხარჯები კატეგორიების მიხედვით'],['Источники заявок','განაცხადების წყაროები'],['Воронка заявок','განაცხადების ძაბრი'],['Финансовая динамика','ფინანსური დინამიკა'],['Последние 6 месяцев','ბოლო 6 თვე'],['Результат за период','პერიოდის შედეგი'],['Дети и посещаемость','ბავშვები და დასწრება'],['Новых за период','ახალი ამ პერიოდში'],['Без телефона','ტელეფონის გარეშე'],
  [' строк',' სტრიქონი'],[' записей',' ჩანაწერი'],[' человек',' ადამიანი'],[' детей',' ბავშვი'],[' лет',' წლის'],[' / месяц',' / თვე'],['оплата ','გადახდა: '],['день оплаты не указан','გადახდის დღე მითითებული არ არის'],['Строка ','სტრიქონი '],['колонка ','სვეტი ']
];
function translateText(value) {
  let out = String(value ?? '');
  if (uiTranslations.has(out.trim())) return out.replace(out.trim(), uiTranslations.get(out.trim()));
  for (const [from,to] of uiPhrases) out = out.replaceAll(from,to);
  out = out.replaceAll('საგნებიდან','წრეებიდან').replaceAll('საგნების','წრეების').replaceAll('საგნები','წრეები').replaceAll('საგნის','წრის').replaceAll('საგანი','წრე');
  return out;
}
function translateUi(root = document) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node; while ((node = walker.nextNode())) if (/[А-Яа-яЁё]/.test(node.nodeValue)) node.nodeValue = translateText(node.nodeValue);
  root.querySelectorAll?.('[placeholder],[aria-label],[title]').forEach(el => ['placeholder','aria-label','title'].forEach(attr => { if (el.hasAttribute(attr)) el.setAttribute(attr, translateText(el.getAttribute(attr))); }));
}

const $ = id => document.getElementById(id);
const jsq = value => esc(String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, ' '));
const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
const money = value => `₾${Number(value || 0).toLocaleString("ka-GE", {maximumFractionDigits:2})}`;
const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const day = value => Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 31 ? Number(value) : null;
function isActiveRecord(item, kind = '') {
  if (!item) return false;
  if (item.active === false || String(item.active).toLowerCase() === 'false') return false;
  if (item.active === true || String(item.active).toLowerCase() === 'true') return true;
  return kind !== 'children' || !['Пауза','Завершил','Неактивен'].includes(item.status);
}
// Was the record active at some point in [from, to]? Switched-off records still count for the months
// before the date they were switched off (so old debts and old salaries do not disappear).
function activeDuring(item, kind, from) {
  if (isActiveRecord(item, kind)) return true;
  const off = dateKey(item?.inactiveFrom);
  return Boolean(off && from && off > from);
}
const activeLabel = (item, kind = '') => isActiveRecord(item, kind) ? 'აქტიური' : 'არააქტიური';
const activePeople = (kind, rows = data[kind] || []) => rows.filter(item => isActiveRecord(item, kind));
const filteredByParticipantStatus = (kind, rows) => participantStatusFilter === 'all' ? rows : rows.filter(item => isActiveRecord(item, kind) === (participantStatusFilter === 'active'));
function participantStatusTabs(kind, rows) {
  const active = rows.filter(item => isActiveRecord(item, kind)).length;
  return `<div class="status-tabs" role="group" aria-label="სტატუსის ფილტრი"><button class="${participantStatusFilter==='all'?'active':''}" onclick="setParticipantStatusFilter('all')">ყველა <b>${rows.length}</b></button><button class="${participantStatusFilter==='active'?'active':''}" onclick="setParticipantStatusFilter('active')">აქტიური <b>${active}</b></button><button class="${participantStatusFilter==='inactive'?'active':''}" onclick="setParticipantStatusFilter('inactive')">არააქტიური <b>${rows.length-active}</b></button></div>`;
}
function setParticipantStatusFilter(value) { participantStatusFilter = value; go(current); }
async function toggleRecordActive(kind, id) {
  const item = get(kind, id); if (!item) return;
  const active = !isActiveRecord(item, kind);
  const patch = {active, inactiveFrom:active ? '' : today()};
  if (kind === 'children') patch.status = active ? 'Активен' : 'Неактивен';
  try { await dataAdapter.update(kind, id, patch); go(current); toast(active ? 'სტატუსი: აქტიური' : 'სტატუსი: არააქტიური'); }
  catch (error) { toast(error.message); }
}
const today = () => localDate();
const toList = value => Array.isArray(value) ? value : String(value ?? '').split(',').map(x => x.trim()).filter(Boolean);
function monthKey(value) {
  const text=String(value||'').trim();
  if (/^\d{4}-\d{2}/.test(text)) return text.slice(0,7);
  const parsed=new Date(text);
  return Number.isNaN(parsed.getTime()) ? '' : `${parsed.getFullYear()}-${String(parsed.getMonth()+1).padStart(2,'0')}`;
}
function dateKey(value) {
  const text=String(value||'').trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0,10);
  const parsed=new Date(text);
  return Number.isNaN(parsed.getTime())?'':`${parsed.getFullYear()}-${String(parsed.getMonth()+1).padStart(2,'0')}-${String(parsed.getDate()).padStart(2,'0')}`;
}
const monthName = date => date.toLocaleDateString("ka-GE", { month: "long", year: "numeric" });
const get = (kind, id) => data[kind]?.find(item => item.id === id);
function localDate() { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
function todayMonth() { return localDate().slice(0, 7); }
const subjectName = id => get('clubs', id)?.name || 'Предмет не указан';
const teacherName = subject => { const names = circleAssignments(subject).map(item => get('staff', item.teacherId)?.name).filter(Boolean); return names.length ? names.join(' · ') : subject?.teacher || 'Преподаватель не назначен'; };
const enrolledSubjects = child => toList(child.activityIds).map(id => get('clubs', id)).filter(Boolean);
const isCraftCircle = subject => /крафт|craft|კრაფტ/i.test(String(subject?.name || ''));
const isTomatisCircle = subject => /tomatis|томатис|ტომატის/i.test(String(subject?.name || ''));
const tomatisCircle = () => data.clubs.find(isTomatisCircle);
const isFlexibleCircle = subject => subject?.billingType === 'flexible' || /английский клуб|english club|ინგლისური კლუბ/i.test(String(subject?.name || ''));
const childBillingMode = (child, subject) => child?.activityBillingModes?.[subject.id] || (isFlexibleCircle(subject) ? '' : subject?.billingType || 'monthly');
const isPerLessonCircle = (subject, child = null) => isCraftCircle(subject) || subject?.billingType === 'per_lesson' || (isFlexibleCircle(subject) && childBillingMode(child,subject) === 'per_lesson');
const isKindergartenChild = child => /садик|мини[-\s]?сад|ბაღ|kindergarten/i.test(String([child?.group,child?.clubs].filter(Boolean).join(' '))) || [350,450].includes(number(child?.tariff));
const isKindergartenCircle = subject => /მინი[-\s]?ბაღ|мини[-\s]?сад|садик|kindergarten/i.test(String([subject?.name, subject?.audience].filter(Boolean).join(' ')));
const usesBaseTariff = child => child?.tariff !== null && child?.tariff !== undefined && child?.tariff !== '' && (!enrolledSubjects(child).length || (isKindergartenChild(child) && !enrolledSubjects(child).some(isKindergartenCircle)));
const participantType = (child, subject) => child.activityParticipantTypes?.[subject.id] || (isCraftCircle(subject) && isKindergartenChild(child) ? 'kindergarten' : '');
const participantTypeLabel = value => value === 'kindergarten' ? 'ბაღის ბავშვი' : value === 'external' ? 'გარე ბავშვი' : 'ტიპი დასაზუსტებელია';
const wasPresent = attendance => ['present','Был','იყო'].includes(attendance.status);
const attendanceStatusLabel = value => wasPresent({status:value}) ? 'დაესწრო' : ['absent','Не был','არ იყო'].includes(value) ? 'არ დაესწრო' : value || 'სტატუსი არ არის';
function lessonAttendanceCount(child, subject, month) {
  return data.attendance.filter(item => monthKey(item.date) === month && wasPresent(item) && item.subjectId === subject.id && (item.childId === child.id || (!item.childId && item.name === child.name))).length;
}
function perLessonRate(child, subject) {
  const override = child.activityPrices?.[subject.id];
  if (!isCraftCircle(subject) && override !== undefined && override !== null && override !== '') return number(override);
  if (!isCraftCircle(subject)) return subject.lessonRate === null || subject.lessonRate === undefined || subject.lessonRate === '' ? null : number(subject.lessonRate);
  const type = participantType(child, subject);
  if (!type) return null;
  return type === 'kindergarten' ? number(subject.kindergartenRate ?? 30) : number(subject.externalRate ?? 40);
}
function subjectPrice(child, subject, month = paymentMonth) {
  if (isFlexibleCircle(subject) && !childBillingMode(child,subject)) return null;
  if (isPerLessonCircle(subject,child)) {
    const rate = perLessonRate(child,subject);
    return rate === null ? null : lessonAttendanceCount(child,subject,month) * rate;
  }
  const override = child.activityPrices?.[subject.id];
  const raw = override !== undefined && override !== '' ? override : subject.tariff;
  return raw === null || raw === undefined || raw === '' ? null : number(raw);
}
function subjectPayments(childId, subjectId, month) {
  return data.payments.filter(p => p.childId === childId && p.subjectId === subjectId && monthKey(p.billingMonth || p.date) === month)
    .reduce((sum, p) => sum + number(p.amount), 0);
}
const noAccrualStatus = status => status === 'Нет начислений';
const paidStatus = status => status === 'Оплачено' || status === 'Бесплатно' || noAccrualStatus(status);
const billStatusLabel = status => noAccrualStatus(status) ? 'დარიცხვა არ არის' : status === 'Оплачено' ? 'გადახდილია' : status === 'Бесплатно' ? 'უფასო' : status === 'Частично' ? 'ნაწილობრივ' : status === 'Укажите цену' ? 'ტიპი ან ფასი დასაზუსტებელია' : 'გადასახდელია';
const paymentDayFor = (child, month) => day((child?.paymentDayOverrides || {})[month]) || day(child?.paymentDay);
function billingDate(child, month) {
  const targetDay = paymentDayFor(child, month) || 1;
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  return `${month}-${String(Math.min(targetDay,lastDay)).padStart(2,'0')}`;
}
// ---------- Sections: kindergarten / circles / specialists ----------
const SECTIONS = [['garden','ბაღი'],['circles','წრეები'],['specialists','სპეციალისტები'],['events','მასტერკლასები']];
const gardenNames = /მინი.?ბაღი|ბაღის ინგლისური|мини.?сад/i; // kindergarten: mini-kindergarten groups and kindergarten English only
const specialistNames = /ლოგოპედ|ტომატის|tomatis|томатис|логопед/i;
const circleSection = subject => subject?.billingType === 'event' ? 'events' : ['garden','circles','specialists'].includes(subject?.section) ? subject.section : gardenNames.test(subject?.name || '') ? 'garden' : specialistNames.test(subject?.name || '') ? 'specialists' : 'circles';
const sectionLabel = key => (SECTIONS.find(item => item[0] === key) || ['', ''])[1];
// ---------- Course billing (e.g. Tomatis): one price per course, charged once in the month the child starts ----------
const isEvent = subject => subject?.billingType === 'event';
const isCourseCircle = subject => subject?.billingType === 'course' || isEvent(subject);
function courseMonth(child, subject) {
  if (isEvent(subject) && dateKey(subject.date)) return monthKey(subject.date);
  const start = (child?.activityStart || {})[subject.id];
  if (start) return monthKey(start);
  const firstVisit = data.attendance.filter(a => a.childId === child.id && a.subjectId === subject.id && wasPresent(a)).map(a => monthKey(a.date));
  const firstPay = data.payments.filter(p => p.childId === child.id && p.subjectId === subject.id).map(p => monthKey(p.billingMonth || p.date));
  return [...firstVisit, ...firstPay].filter(Boolean).sort()[0] || todayMonth();
}
const withStart = (child, ids) => { const starts = { ...(child?.activityStart || {}) }; ids.forEach(id => { if (!starts[id]) starts[id] = today(); }); return starts; };
function billingRows(month = paymentMonth) {
  return data.children.filter(child => activeDuring(child, 'children', `${month}-01`)).flatMap(child => {
    const subjects = enrolledSubjects(child);
    const rows=subjects.filter(subject => !isCourseCircle(subject) || courseMonth(child,subject) === month).map(subject => ({child,subject,...subjectBill(child,subject,month)}));
    if (!usesBaseTariff(child)) return rows;
    const price = number(child.tariff) * (1-number(child.discount)/100);
    const paid = data.payments.filter(p => p.childId === child.id && !p.subjectId && monthKey(p.billingMonth || p.date) === month).reduce((sum,p)=>sum+number(p.amount),0);
    const markedPaid = monthKey(child.paidMarkerMonth) === month;
    rows.unshift({child,subject:null,price,paid,markedPaid,remaining:markedPaid?0:Math.max(0,price-paid),status:price===0?'Бесплатно':markedPaid||paid>=price?'Оплачено':paid>0?'Частично':'Надо оплатить'});
    return rows;
  });
}
function nextBillingDate(row, month = paymentMonth) {
  return billingDate(row.child, paidStatus(row.status) ? shiftMonth(month,1) : month);
}
function subjectBill(child, subject, month = paymentMonth) {
  if (isCourseCircle(subject)) {
    const start = courseMonth(child, subject), override = child.activityPrices?.[subject.id];
    const price = override !== undefined && override !== null && override !== '' ? number(override) : optNumber(subject.coursePrice ?? subject.tariff);
    const paid = subjectPayments(child.id, subject.id, start);
    return { price, paid, courseMonth: start, remaining: price === null ? null : Math.max(0, price - paid),
      status: price === null ? 'Укажите цену' : price === 0 ? 'Бесплатно' : paid >= price ? 'Оплачено' : paid > 0 ? 'Частично' : 'Надо оплатить' };
  }
  const price = subjectPrice(child, subject, month);
  const paid = subjectPayments(child.id, subject.id, month);
  return { price, paid, remaining: price === null ? null : Math.max(0, price - paid),
    status: price === null ? 'Укажите цену' : isPerLessonCircle(subject,child) && price === 0 ? 'Нет начислений' : price === 0 ? 'Бесплатно' : paid >= price ? 'Оплачено' : paid > 0 ? 'Частично' : 'Надо оплатить' };
}
function shiftMonth(value, count) {
  const [year, month] = value.split('-').map(Number);
  const shifted = new Date(year, month - 1 + count, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}`;
}
function prettyMonth(value) { return monthName(new Date(`${value}-01T12:00:00`)); }

async function api(url, options = {}) {
  if (window.GIMILI_API_URL && !window.GIMILI_API_URL.includes('__GIMILI_')) {
    const method = String(options.method || 'GET').toUpperCase();
    const payload = options.body ? JSON.parse(options.body) : {};
    const action = url === '/api/login' ? 'login' : url === '/api/logout' ? 'logout' : url === '/api/import' ? 'import' : url === '/api/batch' ? 'batch' : method === 'GET' ? 'list' : method === 'POST' ? 'create' : method === 'PUT' ? 'update' : method === 'DELETE' ? 'delete' : '';
    const token = localStorage.getItem('gimili_crm_session') || '';
    const response = await fetch(window.GIMILI_API_URL, {
      method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, token, ...payload })
    });
    const body = await response.json().catch(() => ({}));
    if (!body.ok) throw Object.assign(new Error(body.error || 'Не удалось выполнить действие'), { status: Number(body.status || 500) });
    return body;
  }
  const response = await fetch(url, { credentials: "same-origin", cache: "no-store", ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body.error || "Не удалось выполнить действие"), { status: response.status });
  return body;
}

const CACHE_KEY = 'gimili_crm_cache_v1';
function readCache() { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch (error) { return null; } }
function writeCache() { try { localStorage.setItem(CACHE_KEY, JSON.stringify({ user: signedInUser, records: data, sourceRows, serverVersion, savedAt: Date.now() })); } catch (error) {} }
const serverOutdatedNote = () => serverVersion >= 4 ? '' : `<div class="warn-box">⚠ სერვერის კოდი (Apps Script) მოძველებულია: რამდენიმე მასწავლებელი ერთ წრეზე, კვირეული ანაზღაურება და თვის დახურვა არ შეინახება. საჭიროა Code.gs-ის განახლება.</div>`;
const displayName = user => /диан|დიან|detitbilisi/i.test(String([user?.name, user?.email].join(' '))) ? 'დიანა დავიდოვა' : (user?.name || user?.email || '');
let serverVersion = 0;
// children are always kept in alphabetical order (cards without a name go last)
const byName = (a, b) => { const x = String(a?.name || '').trim(), y = String(b?.name || '').trim(); if (!x || !y) return x ? -1 : y ? 1 : 0; return x.localeCompare(y, 'ka', { sensitivity: 'base', numeric: true }); };
const sortChildren = () => { data.children.sort(byName); };
function applySnapshot(body) {
  serverVersion = Number(body.serverVersion || 0);
  signedInUser = body.user ? { ...body.user, name: displayName(body.user) } : body.user;
  data = Object.fromEntries(sections.map(key => [key, body.records?.[key] || []]));
  sourceRows = body.sourceRows || [];
  sortChildren();
}
async function loadData() {
  const body = await api("/api/records");
  if (pendingOps.length || savingNow) return; // local edits still on the way — keep them on screen
  applySnapshot(body);
  reapplyLocal(failedOps);
  writeCache();
  renderShell();
  renderSyncBanner();
  lastRefresh = Date.now();
  autoCreateParents().catch(error => toast(error.message));
}
function renderShell() {
  $("role").textContent = "სამუშაო კაბინეტი";
  document.querySelector(".brand b").textContent = signedInUser.name || signedInUser.email;
  document.querySelector(".avatar").textContent = "Д";
  document.querySelector(".avatar").classList.remove("hidden");
  document.querySelector(".nav").classList.remove("hidden");
  renderDrawer();
  const modalOpen = !$("modal").classList.contains('hidden');
  if (!modalOpen) go(current);
}

async function boot() {
  $("role").textContent = "ცენტრის CRM";
  document.querySelector(".brand b").textContent = "ღიმილი";
  document.querySelector(".avatar").classList.add("hidden");
  document.querySelector(".nav").classList.add("hidden");
  const splashSafetyTimer = setTimeout(() => $("splash")?.classList.add("done"), 4500);
  if (!localStorage.getItem('gimili_crm_session') && window.GIMILI_API_URL) { location.replace('./login.html'); return; }
  const cached = readCache();
  if (cached?.user) { applySnapshot(cached); reapplyLocal(failedOps); renderShell(); renderSyncBanner(); $("splash")?.classList.add("done"); }
  try {
    await loadData();
    $("splash")?.classList.add("done");
    if (failedOps.length) setTimeout(retryFailed, 800);
  }
  catch (error) {
    if (error.status === 401) { try { localStorage.removeItem(CACHE_KEY); localStorage.removeItem('gimili_crm_session'); } catch (_) {} location.replace('./login.html'); return; }
    if (cached?.user && error.status !== 403) { clearTimeout(splashSafetyTimer); toast('ინტერნეტთან კავშირი არ არის — ნაჩვენებია ბოლოს შენახული მონაცემები'); return; }
    const denied = error.status === 403;
    $("view").innerHTML = `<section class="access-card card"><img src="./assets/logo.webp" alt="ღიმილი"><h1>${denied ? "Нет доступа к записям" : error.status === 401 ? "Рабочая CRM" : "Не удалось загрузить данные"}</h1><p>${denied ? "Записи детей и контакты доступны только Диане и владельцу." : error.status === 401 ? "Войдите по разрешённому email и паролю." : "Данные не потеряны. Проверьте соединение и повторите попытку."}</p>${error.status === 401 || denied ? '<a class="btn access-button" href="./login.html">Войти в CRM</a>' : '<button class="btn" onclick="boot()">Повторить</button>'}</section>`;
    if (error.status === 401 || denied) {
      const card = $("view").querySelector('.access-card');
      card.querySelector('p').textContent = 'Войдите по разрешённому email и паролю.';
      const link = card.querySelector('.access-button');
      link.href = './login.html';
      link.removeAttribute('target');
      link.textContent = 'Войти в CRM';
    }
    translateUi($("view"));
  }
  clearTimeout(splashSafetyTimer);
  $("splash")?.classList.add("done");
}

// Writes are applied on screen immediately and sent to the sheet in the background.
// Several quick changes are sent together in one request.
let pendingOps = [], savingNow = false, batchSupported = true;
// Changes that could not be saved stay on this device (never silently lost) until they are saved or discarded.
const FAILED_KEY = 'gimili_failed_ops_v1';
let failedOps = (() => { try { return JSON.parse(localStorage.getItem(FAILED_KEY) || '[]'); } catch (_) { return []; } })();
let lastSaveError = '';
function persistFailed() { try { failedOps.length ? localStorage.setItem(FAILED_KEY, JSON.stringify(failedOps)) : localStorage.removeItem(FAILED_KEY); } catch (_) {} renderSyncBanner(); }
function newId(kind) { return `${kind}-${(crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random()*16|0; return (c === 'x' ? r : (r&3|8)).toString(16); }))}`; }
function setSavingIndicator() { document.body.classList.toggle('saving', savingNow || pendingOps.length > 0); }
function queueOp(op) { pendingOps.push(op); setSavingIndicator(); writeCache(); flushOps(); }
const stripId = ({ id: _, ...rest }) => rest;
// Updates carry only the fields that were changed. Before sending, they are laid over the freshest copy
// from the sheet, so an edit on one device does not wipe out another device's edit of other fields.
async function freshenUpdates(ops) {
  const updates = ops.filter(op => op.action === 'update');
  if (!updates.length || serverVersion >= 5) return;
  const body = await api('/api/records');
  updates.forEach(op => { const server = (body.records?.[op.kind] || []).find(item => item.id === op.id); if (server) op.record = { ...stripId(server), ...op.patch }; });
}
async function flushOps() {
  if (savingNow || !pendingOps.length) return;
  savingNow = true; setSavingIndicator();
  const ops = pendingOps.splice(0, 40);
  try {
    await freshenUpdates(ops);
    if (ops.length > 1 && batchSupported) {
      try {
        const result = await api('/api/batch', { method: 'POST', body: JSON.stringify({ ops }) });
        const failed = (result.results || []).find(item => !item.ok);
        if (failed) throw new Error(failed.error || 'შენახვა ვერ მოხერხდა');
      } catch (error) {
        if (!/Неизвестная операция/.test(error.message)) throw error;
        batchSupported = false; // older server: send one by one
        for (const op of ops) await sendOp(op);
      }
    } else for (const op of ops) await sendOp(op);
  } catch (error) {
    failedOps.push(...ops, ...pendingOps.splice(0));
    lastSaveError = error.status === 401 ? 'სესია დასრულდა — შედით ხელახლა' : (error.message || 'ინტერნეტთან კავშირი');
    savingNow = false; setSavingIndicator(); persistFailed(); writeCache();
    toast(`შენახვა ვერ მოხერხდა — ცვლილებები ამ მოწყობილობაზე დარჩა`);
    return;
  }
  savingNow = false; setSavingIndicator();
  if (pendingOps.length) flushOps(); else { writeCache(); scheduleRefresh(1500); }
}
async function sendOp(op) {
  if (op.action === 'create') return api('/api/records', { method: 'POST', body: JSON.stringify({ kind: op.kind, record: op.record, id: op.id }) });
  if (op.action === 'update') return api('/api/records', { method: 'PUT', body: JSON.stringify({ id: op.id, kind: op.kind, record: op.record, patch: op.patch }) });
  if (op.action === 'delete') return api('/api/records', { method: 'DELETE', body: JSON.stringify({ kind: op.kind, id: op.id }) });
}
function retryFailed() { if (!failedOps.length) return; pendingOps.unshift(...failedOps.splice(0)); lastSaveError = ''; persistFailed(); flushOps(); }
function discardFailed() {
  if (!confirm(`წავშალოთ ${failedOps.length} შეუნახავი ცვლილება? ისინი აღარ შეინახება.`)) return;
  failedOps = []; lastSaveError = ''; persistFailed(); refreshData(true);
}
// keep unsaved local changes visible on top of a fresh copy from the sheet
function reapplyLocal(ops) {
  ops.forEach(op => {
    const list = data[op.kind] || (data[op.kind] = []);
    const index = list.findIndex(item => item.id === op.id);
    if (op.action === 'create') { if (index < 0) list.unshift({ ...op.record, id: op.id }); }
    else if (op.action === 'update') { if (index >= 0) list[index] = { ...list[index], ...(op.patch || op.record), id: op.id }; }
    else if (op.action === 'delete') { if (index >= 0) list.splice(index, 1); }
  });
  sortChildren();
}
function renderSyncBanner() {
  let bar = document.getElementById('syncBanner');
  if (!failedOps.length) { bar?.remove(); return; }
  if (!bar) { bar = document.createElement('div'); bar.id = 'syncBanner'; bar.className = 'sync-banner'; bar.setAttribute('role', 'alert'); document.body.appendChild(bar); }
  const relogin = /სესია/.test(lastSaveError);
  bar.innerHTML = `<span>⚠ ${failedOps.length} ცვლილება არ არის შენახული${lastSaveError ? ` · ${esc(lastSaveError)}` : ''}</span>${relogin ? '<a class="btn small" href="./login.html">შესვლა</a>' : '<button class="btn small" type="button" onclick="retryFailed()">ხელახლა ცდა</button>'}<button class="btn small secondary" type="button" onclick="discardFailed()">გაუქმება</button>`;
}
// fresh data: when coming back to the tab, after saving, and every few minutes
let refreshTimer = null, lastRefresh = Date.now(), refreshing = false;
function scheduleRefresh(ms) { clearTimeout(refreshTimer); refreshTimer = setTimeout(() => refreshData(), ms); }
async function refreshData(force = false) {
  if (refreshing || !signedInUser || (!force && (pendingOps.length || savingNow))) return;
  refreshing = true;
  try { await loadData(); lastRefresh = Date.now(); } catch (_) {} finally { refreshing = false; }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { if (failedOps.length && !/სესია/.test(lastSaveError)) retryFailed(); if (Date.now() - lastRefresh > 30000) refreshData(); } });
setInterval(() => { if (document.visibilityState === 'visible' && Date.now() - lastRefresh > 180000) refreshData(); }, 60000);
window.addEventListener('online', () => { if (failedOps.length) retryFailed(); });
window.addEventListener('beforeunload', event => { if (savingNow || pendingOps.length) { event.preventDefault(); event.returnValue = ''; } });

const dataAdapter = {
  async list(kind) { return structuredClone(data[kind] || []); },
  async create(kind, record) {
    const id = newId(kind);
    const item = { ...record, id };
    data[kind].unshift(item);
    if (kind === 'children') sortChildren();
    queueOp({ action: 'create', kind, id, record });
    return item;
  },
  async update(kind, id, patch) {
    const old = get(kind, id);
    if (!old) throw new Error("Запись не найдена");
    const item = { ...old, ...patch, id };
    if (kind === 'children') {
      const overrides = new Set(old.manualOverrides || []);
      for (const key of Object.keys(patch)) {
        if (key !== 'manualOverrides' && JSON.stringify(old[key] ?? null) !== JSON.stringify(patch[key] ?? null)) overrides.add(key);
      }
      item.manualOverrides = [...overrides];
    }
    data[kind][data[kind].findIndex(x => x.id === id)] = item;
    if (kind === 'children' && old.name !== item.name) sortChildren();
    const changed = { ...patch }; if (kind === 'children') changed.manualOverrides = item.manualOverrides;
    const queued = pendingOps.find(op => op.kind === kind && op.id === id && op.action !== 'delete');
    if (queued && queued.action === 'create') queued.record = stripId(item); // not sent yet: send the whole new record
    else if (queued) { queued.record = item; queued.patch = { ...(queued.patch || {}), ...changed }; }
    else queueOp({ action: 'update', kind, id, record: item, patch: changed });
    return item;
  },
  async remove(kind, id) {
    data[kind] = data[kind].filter(item => item.id !== id);
    const queuedCreate = pendingOps.findIndex(op => op.kind === kind && op.id === id && op.action === 'create');
    if (queuedCreate >= 0 && !savingNow) { pendingOps = pendingOps.filter(op => !(op.kind === kind && op.id === id)); setSavingIndicator(); writeCache(); return; }
    queueOp({ action: 'delete', kind, id });
  },
  async sync() { return { provider: "CRM", status: "Данные сохранены в общей базе", sheets: "Импорт по запросу" }; },
};
window.GimiliDataAdapter = dataAdapter;

function go(view) {
  if (!signedInUser) return;
  current = view;
  toggleDrawer(false);
  const primaryViews = new Set(['dashboard','children','payments']);
  document.querySelectorAll(".nav button[data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === view || (view === 'childProfile' && button.dataset.view === 'children')));
  const more = document.querySelector('.nav button[data-nav="more"]');
  if (more) more.classList.toggle('active', !primaryViews.has(view) && view !== 'childProfile');
  $("view").innerHTML = (views[view] || views.dashboard)();
  translateUi($("view"));
  renderDrawer();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function head(title, subtitle, action = "") {
  const addLivesInBottomBar = ['children', 'payments', 'dashboard'].includes(current);
  return `<div class="page-head"><div><div class="eyebrow">${esc(subtitle)}</div><h1>${esc(title)}</h1></div>${action ? `<div class="head-action ${addLivesInBottomBar ? 'desktop-only' : ''}">${action}</div>` : ''}</div>`;
}
const empty = (message, action = "") => `<div class="empty card">${esc(message)}${action ? `<div style="margin-top:14px">${action}</div>` : ""}</div>`;
const button = (label, call) => `<button class="btn small" onclick="${call}">${esc(label)}</button>`;

function periodStart() {
  const now = new Date();
  if (period === "custom" && customPeriod) return new Date(`${customPeriod.from}T00:00:00`);
  if (period === "year") return new Date(now.getFullYear(), 0, 1);
  if (period === "quarter") return new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  if (period === "six") return new Date(now.getFullYear(), now.getMonth() - 5, 1);
  if (period === "three") return new Date(now.getFullYear(), now.getMonth() - 2, 1);
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
function inPeriod(value) {
  // compare calendar days, not clock time: anything dated today counts in full
  const key=dateKey(value);
  if (!key) return false;
  const end = period === "custom" && customPeriod ? customPeriod.to : today();
  return key >= localDateOf(periodStart()) && key <= end;
}
function periodChips() {
  return `<div class="periods">${[['month','თვე'],['three','3 თვე'],['quarter','კვარტალი'],['six','6 თვე'],['year','წელი'],['custom','საკუთარი პერიოდი']].map(([id,label])=>`<button class="chip ${period===id?'active':''}" onclick="setPeriod('${id}')">${label}</button>`).join('')}</div>`;
}
function setPeriod(value) {
  if (value === "custom") {
    openForm('საკუთარი პერიოდი', [{ name:'from',label:'დაწყება',type:'date',required:true }, { name:'to',label:'დასრულება',type:'date',required:true }], async values => {
      if (values.from > values.to) throw new Error('დაწყების თარიღი დასრულების თარიღზე გვიანია');
      customPeriod = values; period = "custom"; go(current);
    }, customPeriod || { from: today().slice(0, 8) + "01", to: today() });
  } else { period = value; go(current); }
}
const sums = () => ({
  income: data.payments.filter(p => inPeriod(p.date)).reduce((total, p) => total + number(p.amount), 0),
  expenses: data.expenses.filter(p => inPeriod(p.date)).reduce((total, p) => total + number(p.amount), 0),
});

function periodMonthCount() {
  const start = periodStart();
  const end = period === 'custom' && customPeriod ? new Date(`${customPeriod.to}T12:00:00`) : new Date();
  return Math.max(1, (end.getFullYear()-start.getFullYear())*12 + end.getMonth()-start.getMonth()+1);
}
// ---------- Teacher assignments & pay rules ----------
// A circle can have several teachers. Each assignment = teacher + own pay rule.
const PAY_TYPES = [
  ['monthly','თვიური — ფიქსირებული თანხა თვეში'],
  ['weekly','კვირეული — თანხა ყოველ სამუშაო კვირაზე'],
  ['per_lesson','ფაქტით — თითო ჩატარებულ გაკვეთილზე'],
  ['per_child','ფაქტით — თითო დასწრებულ ბავშვზე'],
  ['per_day','ფაქტით — თითო სამუშაო დღეზე'],
  ['percent','ფაქტით — % მიღებული თანხიდან'],
  ['mixed','შერეული — თვიური თანხა + %'],
];
const payTypeLabel = type => (PAY_TYPES.find(item => item[0] === type) || ['', 'მასწავლებლის საერთო წესით'])[1];
const isAppointmentCircle = subject => subject?.appointmentOnly === true || String(subject?.appointmentOnly).toUpperCase() === 'TRUE';
function parseList(value) { if (Array.isArray(value)) return value; if (typeof value === 'string' && value.trim().startsWith('[')) { try { return JSON.parse(value); } catch (_) {} } return []; }
const optNumber = value => value === '' || value === null || value === undefined ? null : number(value);
function circleAssignments(subject) {
  if (!subject) return [];
  const list = parseList(subject.assignments).filter(item => item && item.teacherId);
  if (list.length) return list.map(item => ({ teacherId: item.teacherId, payType: item.payType || '', amount: optNumber(item.amount), percent: optNumber(item.percent) }));
  if (!subject.teacherId) return [];
  const legacy = subject.teacherPayType === 'percent' ? { payType: 'percent', percent: optNumber(subject.teacherPercent) }
    : subject.teacherPayType === 'per_lesson' ? { payType: subject.teacherAccrualBasis === 'attendance' ? 'per_child' : 'per_lesson', amount: optNumber(subject.teacherRate) }
    : { payType: '' };
  return [{ teacherId: subject.teacherId, amount: null, percent: null, ...legacy }];
}
const teacherCircles = personId => data.clubs.filter(subject => circleAssignments(subject).some(item => item.teacherId === personId));
const assignmentOf = (subject, personId) => circleAssignments(subject).find(item => item.teacherId === personId);
function teacherDefault(person) {
  const raw = person?.payType === 'fixed' ? 'monthly' : person?.payType;
  const type = PAY_TYPES.some(item => item[0] === raw) ? raw : 'per_lesson';
  return { type, monthly: number(person?.monthlySalary), weekly: number(person?.weeklyRate), unit: number(person?.lessonRate), percent: number(person?.revenueShare) };
}
function effectiveRule(asg, person) {
  const d = teacherDefault(person);
  if (!asg?.payType) return { type: d.type, amount: d.type === 'monthly' || d.type === 'mixed' ? d.monthly : d.type === 'weekly' ? d.weekly : d.unit, percent: d.percent, fromDefault: true };
  const fallbackAmount = asg.payType === 'monthly' || asg.payType === 'mixed' ? d.monthly : asg.payType === 'weekly' ? d.weekly : d.unit;
  return { type: asg.payType, amount: asg.amount ?? fallbackAmount, percent: asg.percent ?? d.percent, fromDefault: false };
}
function ruleText(rule) {
  const amount = number(rule.amount), pct = number(rule.percent);
  const need = 'თანხა დასაზუსტებელია';
  switch (rule.type) {
    case 'monthly': return amount ? `${money(amount)} / თვე` : need;
    case 'weekly': return amount ? `${money(amount)} / კვირა` : need;
    case 'per_lesson': return amount ? `${money(amount)} / გაკვეთილი` : need;
    case 'per_child': return amount ? `${money(amount)} / დასწრებული ბავშვი` : need;
    case 'per_day': return amount ? `${money(amount)} / სამუშაო დღე` : need;
    case 'percent': return pct ? `${pct}% მიღებული თანხიდან` : 'პროცენტი დასაზუსტებელია';
    case 'mixed': return `${amount ? money(amount) : '?'} / თვე + ${pct || '?'}%`;
    default: return need;
  }
}
// ranges
const addDays = (key, n) => { const d = new Date(`${key}T12:00:00`); d.setDate(d.getDate() + n); return localDateOf(d); };
function localDateOf(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
const mondayOf = key => { const d = new Date(`${key}T12:00:00`); return addDays(key, -((d.getDay() + 6) % 7)); };
function monthRange(month) { const [y, m] = month.split('-').map(Number); return { from: `${month}-01`, to: `${month}-${String(new Date(y, m, 0).getDate()).padStart(2,'0')}` }; }
function periodRange() { return { from: localDateOf(periodStart()), to: period === 'custom' && customPeriod ? customPeriod.to : today() }; }
function weekRange(key = today()) { const from = mondayOf(key); return { from, to: addDays(from, 6) }; }
const inRange = (value, range) => { const key = dateKey(value); return Boolean(key) && key >= range.from && key <= range.to; };
const rangeMatch = range => item => inRange(item.date, range);
// what actually happened in a circle: lessons (by schedule minus cancellations, or by attendance for appointment-only), days, weeks, attended children
function circleActivity(subject, range) {
  const to = range.to < today() ? range.to : today();
  const days = new Set(); let lessons = 0;
  if (range.from > to) return { lessons: 0, days, children: 0 };
  const own = data.schedule.filter(item => item.subjectId === subject.id && inRange(item.date, { from: range.from, to }));
  const cancelledSlot = new Set(own.filter(item => item.status === 'cancelled').map(item => `${dateKey(item.date)}|${item.time || ''}`));
  const cancelledDay = new Set(own.filter(item => item.status === 'cancelled' && !item.time).map(item => dateKey(item.date)));
  const weekdays = toList(subject.weekdays).map(Number), slots = toList(subject.timeSlots).length ? toList(subject.timeSlots) : [''];
  const add = (key, n = 1) => { lessons += n; days.add(key); };
  if (!isAppointmentCircle(subject) && weekdays.length) {
    for (let key = range.from; key <= to; key = addDays(key, 1)) {
      const wd = new Date(`${key}T12:00:00`).getDay();
      if (!weekdays.includes(wd) || cancelledDay.has(key)) continue;
      const n = slots.filter(time => !cancelledSlot.has(`${key}|${time}`)).length;
      if (n) add(key, n);
    }
  }
  own.filter(item => item.status !== 'cancelled').forEach(item => {
    const key = dateKey(item.date), wd = new Date(`${key}T12:00:00`).getDay();
    const recurring = !isAppointmentCircle(subject) && weekdays.includes(wd) && slots.includes(item.time || '');
    if (!recurring) add(key, 1);
  });
  const present = data.attendance.filter(item => item.subjectId === subject.id && wasPresent(item) && inRange(item.date, { from: range.from, to }));
  present.forEach(item => { const key = dateKey(item.date); if (!days.has(key)) add(key, 1); });
  return { lessons, days, children: present.length };
}
function workedWeeks(subjects, range) {
  const weeks = new Set();
  for (let monday = mondayOf(range.from); monday <= range.to; monday = addDays(monday, 7)) {
    if (monday < range.from) continue; // a week belongs to the month of its Monday
    const week = { from: monday, to: addDays(monday, 6) };
    if (subjects.some(subject => circleActivity(subject, week).lessons > 0)) weeks.add(monday);
  }
  return weeks.size;
}
const circleRevenue = (subject, range) => data.payments.filter(item => item.subjectId === subject.id && inRange(item.date, range)).reduce((sum, item) => sum + number(item.amount), 0);
function ruleAccrual(rule, subjects, range, months, person) {
  const active = activeDuring(person, 'staff', range.from);
  const revenue = () => subjects.reduce((sum, subject) => sum + circleRevenue(subject, range), 0);
  const acts = () => subjects.map(subject => circleActivity(subject, range));
  switch (rule.type) {
    case 'monthly': return active ? number(rule.amount) * months : 0;
    case 'weekly': return active ? number(rule.amount) * workedWeeks(subjects, range) : 0;
    case 'per_lesson': return number(rule.amount) * acts().reduce((sum, a) => sum + a.lessons, 0);
    case 'per_child': return number(rule.amount) * acts().reduce((sum, a) => sum + a.children, 0);
    case 'per_day': { const all = new Set(); acts().forEach(a => a.days.forEach(day => all.add(day))); if (!subjects.length && (person.workDays || []).length) return 0; return number(rule.amount) * all.size; }
    case 'percent': return revenue() * number(rule.percent) / 100;
    case 'mixed': return (active ? number(rule.amount) * months : 0) + revenue() * number(rule.percent) / 100;
    default: return 0;
  }
}
// Teacher pay by section:
//  kindergarten — one fixed monthly salary per teacher (monthlySalary), however many kindergarten groups;
//  circles      — percent of what was paid for the circle (50% unless changed for that teacher/circle);
//  specialists  — set by hand per circle (fixed per child, per lesson, monthly, %…).
const circlePercent = (asg, subject) => asg?.percent ?? optNumber(subject?.teacherPercent) ?? 50;
function teacherAccrualBreakdown(person, range, months) {
  const circles = teacherCircles(person.id), lines = [];
  const garden = circles.filter(subject => circleSection(subject) === 'garden');
  if (garden.length) lines.push({ section: 'garden', subjects: garden, label: number(person.monthlySalary) ? `${money(person.monthlySalary)} / თვე` : 'ხელფასი დასაზუსტებელია', amount: activeDuring(person,'staff',range.from) ? number(person.monthlySalary) * months : 0 });
  circles.filter(subject => circleSection(subject) === 'circles').forEach(subject => {
    const pct = circlePercent(assignmentOf(subject, person.id), subject);
    lines.push({ section: 'circles', subject, label: `${pct}% მიღებული თანხიდან`, amount: circleRevenue(subject, range) * pct / 100 });
  });
  circles.filter(subject => circleSection(subject) === 'specialists').forEach(subject => {
    const asg = assignmentOf(subject, person.id), rule = asg?.payType ? effectiveRule(asg, person) : null;
    lines.push({ section: 'specialists', subject, rule, label: rule ? ruleText(rule) : 'ანაზღაურება დასაზუსტებელია', amount: rule ? ruleAccrual(rule, [subject], range, months, person) : 0 });
  });
  return lines;
}
function circleTeacherCost(subject, range, months) {
  const section = circleSection(subject);
  if (section === 'garden') return 0;
  return circleAssignments(subject).reduce((sum, asg) => {
    const person = get('staff', asg.teacherId); if (!person) return sum;
    if (section === 'circles') return sum + circleRevenue(subject, range) * circlePercent(asg, subject) / 100;
    return asg.payType ? sum + ruleAccrual(effectiveRule(asg, person), [subject], range, months, person) : sum;
  }, 0);
}
// ---------- Master classes ----------
const eventParticipants = event => data.children.filter(child => toList(child.activityIds).includes(event.id));
const eventHostFee = event => optNumber(event.hostFee) ?? 35;
const eventHostAccrued = event => eventParticipants(event).length * eventHostFee(event);
const eventHostPaid = event => data.expenses.filter(item => item.eventId === event.id).reduce((sum, item) => sum + number(item.amount), 0);
const isEventHostExpense = item => Boolean(item.eventId) || expenseCategoryLabel(item.category) === 'მასტერკლასის წამყვანი';
const eventsInRange = range => data.clubs.filter(club => isEvent(club) && inRange(club.date, range));
const eventsHostCost = range => eventsInRange(range).reduce((sum, event) => sum + Math.max(eventHostAccrued(event), eventHostPaid(event)), 0);
function sectionTotals(range, months) {
  const out = Object.fromEntries(SECTIONS.map(([key]) => [key, { income: 0, teachers: 0 }]));
  data.payments.filter(item => inRange(item.date, range)).forEach(item => { const club = get('clubs', item.subjectId); out[club ? circleSection(club) : 'garden'].income += number(item.amount); });
  teacherStaff().forEach(person => teacherAccrualBreakdown(person, range, months).forEach(line => { out[line.section].teachers += line.amount; }));
  out.events.teachers += eventsHostCost(range);
  return out;
}
function teacherRuleLabel(subject, person) {
  const list = circleAssignments(subject), section = circleSection(subject);
  if (!list.length) return 'მასწავლებელი არ არის დანიშნული';
  const pick = person ? list.filter(item => item.teacherId === person.id) : list;
  return pick.map(item => { const p = get('staff', item.teacherId) || {};
    const text = section === 'garden' ? `ბაღის ხელფასი${number(p.monthlySalary) ? ` ${money(p.monthlySalary)} / თვე` : ''}` : section === 'circles' ? `${circlePercent(item, subject)}%` : item.payType ? ruleText(effectiveRule(item, p)) : 'ანაზღაურება დასაზუსტებელია';
    return `${person ? '' : `${p.name || '?'}: `}${text}`; }).join(' · ');
}
const personnelRole = /ბუღალტერ|დიასახლის|დამლაგ|დაცვ|მზარეულ|ადმინისტრატ|ძიძა|бухгалт|уборщ|охран|повар|администр|няня/i;
const isPersonnel = person => person?.staffType ? person.staffType === 'staff' : personnelRole.test(String(person?.role || ''));
const teacherStaff = (rows = data.staff) => rows.filter(person => !isPersonnel(person));
const personnelStaff = (rows = data.staff) => rows.filter(isPersonnel);
function personAccrued(person, range, months) {
  if (isPersonnel(person)) return activeDuring(person,'staff',range.from) ? number(person.monthlySalary) * months : 0;
  return teacherAccrualBreakdown(person, range, months).reduce((sum, line) => sum + line.amount, 0);
}
const isSalaryExpense = item => expenseCategoryLabel(item.category) === 'ხელფასები';
const salaryExpenseFor = (person, item) => isSalaryExpense(item) && (item.staffId === person.id || (!item.staffId && person.name && String(item.title || '').includes(person.name)));
function payroll(range, months) {
  const salaryExpenses = data.expenses.filter(item => isSalaryExpense(item) && inRange(item.date, range));
  const used = new Set();
  const rows = data.staff.map(person => {
    const own = salaryExpenses.filter(item => salaryExpenseFor(person, item)); own.forEach(item => used.add(item.id));
    const paid = own.reduce((sum,item) => sum + number(item.amount), 0), accrued = personAccrued(person, range, months);
    return { person, accrued, paid, cost: paid > 0 ? paid : accrued, due: Math.max(0, accrued - paid) };
  });
  const unassigned = salaryExpenses.filter(item => !used.has(item.id)).reduce((sum,item) => sum + number(item.amount), 0);
  return { rows, unassigned, total: rows.reduce((sum,row) => sum + row.cost, 0) + unassigned,
    accrued: rows.reduce((sum,row) => sum + row.accrued, 0), paid: rows.reduce((sum,row) => sum + row.paid, 0) + unassigned };
}
function teacherFinance(person, range = periodRange(), months = periodMonthCount()) {
  const subjects = teacherCircles(person.id);
  const revenue = subjects.reduce((sum, subject) => sum + circleRevenue(subject, range), 0);
  const lessons = subjects.reduce((sum, subject) => sum + circleActivity(subject, range).lessons, 0);
  return { subjects, revenue, lessons, accrued: personAccrued(person, range, months) };
}
function accountingTotals() {
  const income = data.payments.filter(item => inPeriod(item.date)).reduce((sum,item) => sum+number(item.amount),0);
  const periodExpenses = data.expenses.filter(item => inPeriod(item.date));
  const otherExpenses = periodExpenses.filter(item => !isSalaryExpense(item) && !isEventHostExpense(item)).reduce((sum,item) => sum+number(item.amount),0);
  const teachers = teacherStaff().map(person => ({person,...teacherFinance(person)}));
  const pay = payroll(periodRange(), periodMonthCount());
  const hosts = eventsHostCost(periodRange());
  const paidSalaries = pay.paid, accruedSalaries = pay.accrued, salaries = pay.total + hosts;
  const debt = billingRows(todayMonth()).reduce((sum,row) => sum + number(row.remaining),0);
  return {income,otherExpenses,teachers,pay,salaries,accruedSalaries,paidSalaries,totalExpenses:otherExpenses+salaries,centerShare:income-salaries,profit:income-otherExpenses-salaries,debt};
}
function payrollCostForMonth(key) { return payroll(monthRange(key), 1).total; }
function nonSalaryExpensesForMonth(key) {
  return data.expenses.filter(item=>monthKey(item.date)===key&&expenseCategoryLabel(item.category)!=='ხელფასები'&&!isEventHostExpense(item)).reduce((sum,item)=>sum+number(item.amount),0) + eventsHostCost(monthRange(key));
}

function accounting() {
  const totals = accountingTotals();
  const salaryMode = `დარიცხული ${money(totals.accruedSalaries)} · გაცემული ${money(totals.paidSalaries)}`;
  const personnel = totals.pay.rows.filter(row => isPersonnel(row.person));
  const mode = person => `${teacherCircles(person.id).length} წრე · საერთო წესი: ${ruleText(effectiveRule(null, person))}`;
  return `${head('ბუღალტერია','შემოსავალი, ხელფასები და წმინდა მოგება','<button class="btn small secondary" onclick="go(\'months\')">🔒 თვის დახურვა</button><button class="btn small" onclick="paymentForm()">＋ გადახდა</button>')}${periodChips()}<section class="metrics"><div class="metric" style="--accent:var(--green)"><span class="label">შემოსავალი</span><strong>${money(totals.income)}</strong><span class="delta">კასაში მიღებული გადახდები</span></div><div class="metric" style="--accent:var(--yellow)"><span class="label">ხელფასები</span><strong>${money(totals.salaries)}</strong><span class="delta">${salaryMode}</span></div><div class="metric" style="--accent:var(--pink)"><span class="label">სხვა ხარჯები</span><strong>${money(totals.otherExpenses)}</strong><span class="delta">კომუნალური, ქირა და სხვა</span></div><div class="metric" style="--accent:var(--blue)"><span class="label">კასა / წმინდა ნაშთი</span><strong>${money(totals.profit)}</strong><span class="delta">ყველა ხარჯის შემდეგ</span></div></section>${(()=>{const st=sectionTotals(periodRange(),periodMonthCount());const personnel=totals.pay.rows.filter(row=>isPersonnel(row.person)).reduce((sum,row)=>sum+row.cost,0);const rows=SECTIONS.map(([key,label])=>`<tr><th>${label}</th><td>${money(st[key].income)}</td><td>${money(st[key].teachers)}</td><td class="${st[key].income-st[key].teachers<0?'danger-text':''}">${money(st[key].income-st[key].teachers)}</td></tr>`).join('');return `<section class="section card"><div class="section-title"><div><h2>განყოფილებების მიხედვით</h2><p class="meta">მასწავლებლების ხარჯი დარიცხვით</p></div></div><div class="table-wrap"><table class="sec-table"><thead><tr><th></th><th>შემოსავალი</th><th>მასწავლებლები</th><th>შედეგი</th></tr></thead><tbody>${rows}<tr class="sub"><th>პერსონალი</th><td></td><td>${money(personnel)}</td><td class="danger-text">−${money(personnel)}</td></tr><tr class="sub"><th>სხვა ხარჯები</th><td></td><td>${money(totals.otherExpenses)}</td><td class="danger-text">−${money(totals.otherExpenses)}</td></tr><tr class="total"><th>სულ</th><td>${money(totals.income)}</td><td></td><td>${money(totals.income-SECTIONS.reduce((sum,[key])=>sum+st[key].teachers,0)-personnel-totals.otherExpenses)}</td></tr></tbody></table></div></section>`;})()}<section class="section card"><div class="section-title"><h2>თანხების განაწილება</h2></div><div class="finance"><div><small>დიანა / ცენტრი ხელფასების შემდეგ</small><strong>${money(totals.centerShare)}</strong></div><div><small>სრული ხარჯი</small><strong>${money(totals.totalExpenses)}</strong></div><div class="profit"><small>კასის წმინდა ნაშთი</small><strong>${money(totals.profit)}</strong></div></div><p class="section-note" style="margin-top:14px">ფორმულა: კასაში მიღებული თანხა − ხელფასები − სხვა ხარჯები. თითოეულ თანამშრომელზე: თუ ხელფასი უკვე გაცემულია, ითვლება გაცემული თანხა, თუ არა — დარიცხული. მიმდინარე თვის დავალიანება: <b>${money(totals.debt)}</b>.</p></section><section class="section"><div class="section-title"><h2>პერსონალი</h2><button class="btn small secondary" onclick="staffTab='personnel';go('staff')">პარამეტრები →</button></div>${personnel.length?`<div class="list">${personnel.map(row=>`<article class="teacher-card card"><div class="teacher-top"><div class="pic" style="--accent:var(--yellow)">${esc((row.person.name||'?').slice(0,1))}</div><div><h2>${esc(row.person.name)}</h2><p class="meta">${esc(row.person.role||'პერსონალი')} · ${money(row.person.monthlySalary)} / თვე</p></div><b>${money(row.cost)}</b></div><div class="profile-details" style="margin-top:12px"><div><small>დარიცხული</small><b>${money(row.accrued)}</b></div><div><small>გაცემული</small><b>${money(row.paid)}</b></div></div></article>`).join('')}</div>`:empty('პერსონალი ჯერ არ არის დამატებული')}</section><section class="section"><div class="section-title"><h2>მასწავლებლების დარიცხვა</h2><button class="btn small secondary" onclick="go('staff')">პარამეტრები →</button></div>${totals.teachers.length ? `<div class="list">${totals.teachers.map(item => `<article class="teacher-card card"><div class="teacher-top"><div class="pic" style="--accent:var(--pink)">${esc((item.person.name||'?').slice(0,1))}</div><div><h2>${esc(item.person.name)}</h2><p class="meta">${esc(mode(item.person))}</p></div><b>${money(item.accrued)}</b></div><div class="profile-details" style="margin-top:12px"><div><small>ჩატარებული გაკვეთილები</small><b>${item.lessons}</b></div><div><small>საგნებიდან მიღებული თანხა</small><b>${money(item.revenue)}</b></div></div></article>`).join('')}</div>` : empty('დაამატეთ მასწავლებლები და მიუთითეთ ანაზღაურების წესი')}</section>`;
}

function dashboard() {
  const financeTotals = accountingTotals();
  const { income, totalExpenses:expenses, salaries, profit } = financeTotals;
  const currentChildren = activePeople('children', data.children);
  const active = currentChildren.length;
  const newChildren = currentChildren.filter(c => inPeriod(c.start)).length;
  const due = billingRows(todayMonth()).reduce((total,row) => total + number(row.price), 0);
  const unknownDays = currentChildren.filter(c => !day(c.paymentDay)).length;
  const circlesWithoutTeacher=data.clubs.filter(circle=>!isEvent(circle)&&!circleAssignments(circle).length&&data.children.some(child=>toList(child.activityIds).includes(circle.id))).length;
  const unusedLegacyCircles=data.clubs.filter(circle=>circle.billingCatalogVersion!==5&&!data.children.some(child=>toList(child.activityIds).includes(circle.id))&&!data.payments.some(item=>item.subjectId===circle.id)&&!data.attendance.some(item=>item.subjectId===circle.id)&&!data.schedule.some(item=>item.subjectId===circle.id)).length;
  const invalidTransactionDates=[...data.payments,...data.expenses].filter(item=>item.date&&!dateKey(item.date)).length;
  const currentMonth=todayMonth();
  const oneOffToday=new Map();
  data.attendance.filter(item=>dateKey(item.date)===today()&&wasPresent(item)).forEach(item=>{
    const child=get('children',item.childId),subject=get('clubs',item.subjectId);
    if (!child||!subject||!isPerLessonCircle(subject,child)) return;
    if (!oneOffToday.has(child.id)) oneOffToday.set(child.id,new Set());
    oneOffToday.get(child.id).add(subject.id);
  });
  const todayPayments=currentChildren.filter(child=>(paymentDayFor(child,currentMonth)&&billingDate(child,currentMonth)<=today())||oneOffToday.has(child.id)).map(child=>{
    const dueDate=paymentDayFor(child,currentMonth)?billingDate(child,currentMonth):'';
    const regularDue=Boolean(dueDate&&dueDate<=today());
    const rows=billingRows(currentMonth).filter(row=>row.child.id===child.id&&(regularDue||oneOffToday.get(child.id)?.has(row.subject?.id)));
    const monthly=rows.reduce((sum,row)=>sum+number(row.price),0), remaining=rows.reduce((sum,row)=>sum+number(row.remaining),0), unknownPrice=!rows.length||rows.some(row=>row.price===null);
    const noAccrual=rows.length>0&&rows.every(row=>noAccrualStatus(row.status));
    const complete=!unknownPrice&&rows.every(row=>paidStatus(row.status));
    return {child,rows,monthly,remaining,unknownPrice,noAccrual,complete,dueDate,overdue:regularDue&&dueDate<today(),oneOff:oneOffToday.has(child.id),nextDate:regularDue?billingDate(child,complete?shiftMonth(currentMonth,1):currentMonth):today()};
  }).filter(item=>!item.complete||item.dueDate===today()||item.oneOff).sort((a,b)=>Number(a.complete)-Number(b.complete)||String(a.dueDate).localeCompare(String(b.dueDate)));
  const openCount=todayPayments.filter(item=>!item.complete).length, overdueCount=todayPayments.filter(item=>item.overdue&&!item.complete).length;
  const todayItem=item=>`<article class="today-payment ${item.complete?'paid':'due'} ${item.overdue&&!item.complete?'overdue':''}"><span class="today-status">${item.complete?'✓':item.overdue?'!':'₾'}</span><button class="today-copy" onclick="showChild('${esc(item.child.id)}')"><b>${esc(item.child.name)}</b><small>${item.rows.map(row=>esc(row.subject?.name||'საერთო ტარიფი')).join(' · ')||'ტარიფი მითითებული არ არის'}</small><em>${item.noAccrual?'ამ თვეში დასწრებული გაკვეთილი არ არის':item.complete?(item.oneOff?'დღევანდელი ერთჯერადი გადახდილია':`შემდეგი: ${item.nextDate} · ${money(item.monthly)}`):item.unknownPrice?'ფასი დასაზუსტებელია':item.oneOff?'დღევანდელი გაკვეთილი':item.overdue?`ვადა იყო ${item.dueDate}`:'გადახდის დღე დღესაა'}</em></button><strong>${item.noAccrual?'0':item.complete?'✓':item.unknownPrice?'?':money(item.remaining)}</strong>${!item.complete&&!item.unknownPrice&&item.remaining>0?`<button class="btn small pay-now" onclick="quickPayChild('${esc(item.child.id)}')" aria-label="გადახდილია">✓ გადაიხადა</button>`:''}</article>`;
  const todayBlock=`<section class="section today-card"><div class="section-title"><div><h2>დღევანდელი გადახდები</h2><p class="meta">${openCount?`${openCount} გადასახდელი${overdueCount?` · <b class="danger-text">${overdueCount} ვადაგადაცილებული</b>`:''}`:'ყველაფერი გადახდილია'}</p></div><button class="btn small secondary" onclick="go('payments')">ყველა →</button></div>${(()=>{const debts=oldDebts();return debts.length?`<button class="debt-hint" onclick="paymentMonth=todayMonth();go('payments')">⚠ ძველი ვალები: ${new Set(debts.map(d=>d.childId)).size} ბავშვი · <b>${money(debts.reduce((a,d)=>a+d.remaining,0))}</b> →</button>`:''})()}${todayPayments.length?`<div class="today-list ${todayPayments.length>5&&!showAllToday?'collapsed':''}">${todayPayments.map(todayItem).join('')}</div>${todayPayments.length>5?`<button class="btn small secondary show-more" onclick="showAllToday=!showAllToday;go('dashboard')">${showAllToday?'ნაკლების ჩვენება':`ყველას ჩვენება · ${todayPayments.length}`}</button>`:''}`:`<div class="today-empty"><span>✓</span><div><b>დღეს გადასახდელი არავინაა</b><small>მომდევნო გადახდები ქვემოთ, დღეების ზოლზე ჩანს.</small></div></div>`}</section>`;
  const days=Array.from({length:14},(_,i)=>{const d=new Date();d.setDate(d.getDate()+i);const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;const month=key.slice(0,7);const dueKids=currentChildren.filter(c=>paymentDayFor(c,month)&&billingDate(c,month)===key&&billingRows(month).some(row=>row.child.id===c.id&&!paidStatus(row.status)));return {key,d,dues:dueKids.length,lessons:calendarEventsForDate(key).length}});
  const weekStrip=`<section class="section card week-card"><div class="section-title"><div><h2>უახლოესი დღეები</h2><p class="meta">₾ — გადახდის დღე · ● — გაკვეთილები</p></div><button class="btn small secondary" onclick="go('schedule')">კალენდარი →</button></div><div class="week-strip">${days.map((x,i)=>`<button class="week-day ${i===0?'today':''} ${x.dues?'has-due':''}" onclick="calendarMonth='${x.key.slice(0,7)}';calendarSelected='${x.key}';go('schedule')"><small>${x.d.toLocaleDateString('ka-GE',{weekday:'short'})}</small><b>${x.d.getDate()}</b>${x.dues?`<span class="due-count">₾ ${x.dues}</span>`:'<span class="due-count empty">·</span>'}${x.lessons?`<i>● ${x.lessons}</i>`:'<i>&nbsp;</i>'}</button>`).join('')}</div></section>`;
  const todayLessons=calendarEventsForDate(today());
  const lessonsBlock=`<section class="section card"><div class="section-title"><div><h2>დღევანდელი გაკვეთილები</h2><p class="meta">${todayLessons.length?`${todayLessons.length} გაკვეთილი`:'დღეს გაკვეთილები არ არის'}</p></div></div>${todayLessons.length?`<div class="list">${todayLessons.map(item=>{const marked=data.attendance.filter(a=>a.subjectId===item.subjectId&&dateKey(a.date)===today()&&wasPresent(a)).length;const members=activePeople('children').filter(c=>toList(c.activityIds).includes(item.subjectId)).length;return `<button class="row clickable lesson-row" onclick="groupAttendanceForm('${esc(item.subjectId)}','${today()}')"><div class="due-day calendar-time">${esc(item.time||'•')}</div><div class="row-body"><div class="row-title">${esc(subjectName(item.subjectId))}</div><div class="meta">${esc(teacherName(get('clubs',item.subjectId)||{}))} · დასწრება ${marked} / ${members}</div></div><span class="badge ${marked?'':'warn'}">${marked?'მონიშნულია':'მონიშვნა'}</span></button>`}).join('')}</div>`:''}</section>`;
  return `${head('მთავარი', `${new Date().toLocaleDateString('ka-GE',{weekday:'long',day:'numeric',month:'long'})}`)}<div class="dash-top"><div class="dash-week">${weekStrip}</div><div class="dash-today">${todayBlock}</div><div class="dash-lessons">${lessonsBlock}</div></div>${periodChips()}<section class="metrics"><div class="metric" style="--accent:var(--blue)"><span class="label">აქტიური ბავშვები</span><strong>${active}</strong><span class="delta">ახალი ამ პერიოდში: ${newChildren}</span></div><div class="metric" style="--accent:var(--green)"><span class="label">მასწავლებლები</span><strong>${activePeople('staff',teacherStaff()).length}</strong><span class="delta">პერსონალი: ${activePeople('staff',personnelStaff()).length}</span></div><div class="metric" style="--accent:var(--yellow)"><span class="label">თვიური ტარიფები</span><strong>${money(due)}</strong><span class="delta">გადასახდელი თანხა</span></div><div class="metric" style="--accent:var(--pink)"><span class="label">მიღებული თანხა</span><strong>${money(income)}</strong><span class="delta">ფაქტობრივი გადახდები</span></div></section><div class="dashboard-grid"><section class="section card"><div class="section-title"><h2>ფინანსები</h2><button class="btn small secondary" onclick="go('accounting')">ბუღალტერია →</button></div><div class="finance"><div><small>შემოსავალი</small><strong>${money(income)}</strong></div><div><small>ხარჯები</small><strong>${money(expenses)}</strong></div><div class="profit"><small>წმინდა მოგება</small><strong>${money(profit)}</strong></div></div><p class="section-note" style="margin-top:14px">ხელფასები: <b>${money(salaries)}</b> (მასწავლებლები და პერსონალი).</p></section><section class="section card"><div class="section-title"><div><h2>სისტემის კონტროლი</h2><p class="meta">რა არის შესავსები ან გასაწმენდი</p></div></div><div class="quality-list"><button onclick="go('contacts')"><span>☎</span><b>ტელეფონის გარეშე</b><strong>${currentChildren.filter(c => !c.phone && !c.phone2).length}</strong></button><button onclick="go('payments')"><span>◷</span><b>გადახდის დღის გარეშე</b><strong>${unknownDays}</strong></button><button onclick="go('clubs')"><span>♙</span><b>მასწავლებლის გარეშე</b><strong>${circlesWithoutTeacher}</strong></button><button onclick="go('clubs')"><span>⌁</span><b>ძველი გამოუყენებელი წრეები</b><strong>${unusedLegacyCircles}</strong></button>${invalidTransactionDates?`<button onclick="go('accounting')"><span>!</span><b>არასწორი თარიღი</b><strong>${invalidTransactionDates}</strong></button>`:''}</div></section></div>`;
}

function children() {
  const allRows = data.children, rows = filteredByParticipantStatus('children', allRows);
  return `${head('ბავშვები', `${allRows.length} ჩანაწერი`, '<button class="btn icon-btn" onclick="childForm()" aria-label="ბავშვის დამატება">＋</button>')}<button class="btn small secondary" style="margin-bottom:12px" onclick="go('contacts')">☎ კონტაქტები</button>${participantStatusTabs('children',allRows)}<input class="search" placeholder="ბავშვის ძებნა" aria-label="ბავშვების ძებნა" oninput="filterRows(this.value)">${rows.length?`<div class="list" id="rows">${rows.map(c=>{const circles=enrolledSubjects(c).map(item=>item.name);return `<article class="row clickable ${isActiveRecord(c,'children')?'':'record-inactive'}" data-search="${esc([c.name,c.parent,c.group,...circles].filter(Boolean).join(' '))}" onclick="showChild('${esc(c.id)}')"><div class="pic">${esc((c.name||'?').slice(0,1))}</div><div class="row-body"><div class="row-title">${esc(c.name)}</div><div class="meta">${esc(c.group||'ჯგუფი მითითებული არ არის')}<br><b>${circles.length?esc(circles.join(' · ')):'წრე მითითებული არ არის'}</b> · ${day(c.paymentDay)?`გადახდა ${day(c.paymentDay)} რიცხვში`:'გადახდის დღე არ არის'}</div></div><span class="badge ${isActiveRecord(c,'children')?'':'warn'}">${activeLabel(c,'children')}</span></article>`}).join('')}</div>`:empty(participantStatusFilter==='all'?'ბავშვების ჩანაწერები ჯერ არ არის':'ამ სტატუსით ბავშვები არ მოიძებნა',button('ბავშვის დამატება','childForm()'))}`;
}

function confirmNotAlreadyPaid(childId, subjectId, month, amount) {
  const row = billingRows(month).find(item => item.child.id === childId && (item.subject?.id || '') === (subjectId || ''));
  const sameDay = data.payments.filter(p => p.childId === childId && (p.subjectId || '') === (subjectId || '') && monthKey(p.billingMonth || p.date) === month);
  const already = sameDay.reduce((sum,p) => sum + number(p.amount), 0);
  const label = subjectId ? subjectName(subjectId) : 'საერთო ტარიფი';
  if (row && row.price !== null && already >= number(row.price) && already > 0) {
    if (!confirm(`${label} · ${prettyMonth(month)} უკვე გადახდილია (${money(already)}). მაინც დავამატოთ კიდევ ${money(amount)}?`)) throw new Error('გადახდა არ დაემატა');
  } else if (sameDay.some(p => number(p.amount) === amount && dateKey(p.date) === today())) {
    if (!confirm(`დღეს უკვე შეტანილია ${money(amount)} — ${label}. ეს მეორე გადახდაა?`)) throw new Error('გადახდა არ დაემატა');
  }
}
async function quickPayChild(childId) {
  const child=get('children',childId); if (!child) return;
  const month=todayMonth(), rows=billingRows(month).filter(row=>row.child.id===childId&&number(row.remaining)>0&&row.price!==null);
  const total=rows.reduce((sum,row)=>sum+number(row.remaining),0);
  if (!rows.length) return toast('გადასახდელი არაფერია');
  try { assertOpen(today(),'გადახდა'); } catch (error) { return toast(error.message); }
  if (!confirm(`${child.name}: მივიღეთ ${money(total)} ნაღდით?\n${rows.map(row=>`• ${row.subject?.name||'საერთო ტარიფი'} — ${money(row.remaining)}`).join('\n')}`)) return;
  for (const row of rows) await dataAdapter.create('payments',{childId,child:child.name,subjectId:row.subject?.id||'',amount:number(row.remaining),date:today(),billingMonth:month,method:'cash'});
  go(current); toast(`გადახდა შენახულია · ${money(total)}`);
}
function showChild(id) { currentChildId = id; go('childProfile'); }
function ageOf(birth) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth || '')) return 'ასაკი მითითებული არ არის';
  const born = new Date(`${birth}T12:00:00`), now = new Date();
  let years = now.getFullYear() - born.getFullYear();
  if (now.getMonth() < born.getMonth() || (now.getMonth() === born.getMonth() && now.getDate() < born.getDate())) years--;
  return Number.isFinite(years) && years >= 0 ? `${years} წლის` : 'ასაკი მითითებული არ არის';
}
function circleScheduleLabel(subject) {
  if (subject.schedule) return subject.schedule;
  if (subject.appointmentOnly) return 'წინასწარი ჩაწერით';
  const dayNames={1:'ორშ',2:'სამ',3:'ოთხ',4:'ხუთ',5:'პარ',6:'შაბ',0:'კვ'};
  const days=toList(subject.weekdays).map(day=>dayNames[Number(day)]).filter(Boolean).join(' / ');
  const times=toList(subject.timeSlots).join(' / ');
  return [days,times].filter(Boolean).join(' · ')||'განრიგი დასაზუსტებელია';
}
function circleChargeMeta(child,subject,bill,month) {
  const schedule=`<div class="next-payment">◷ ${esc(circleScheduleLabel(subject))}${subject.audience?` · ${esc(subject.audience)}`:''}</div>`;
  if (isEvent(subject)) return `<div class="next-payment">✦ მასტერკლასი · ${esc(dateKey(subject.date)||'')} ${esc(subject.time||'')} · ${bill.price===null?'ფასი ?':money(bill.price)} · გადახდილია ${money(bill.paid)}</div>`;
  if (isCourseCircle(subject)) return `${schedule}<div class="next-payment">კურსი · ${bill.price===null?'ფასი ?':money(bill.price)} · დაწყება: ${esc(prettyMonth(bill.courseMonth||month))} · გადახდილია ${money(bill.paid)}</div>`;
  if (isPerLessonCircle(subject,child)) {
    const type=participantType(child,subject),rate=perLessonRate(child,subject),lessons=lessonAttendanceCount(child,subject,month);
    const typeText=isCraftCircle(subject)?`<b>${participantTypeLabel(type)}</b> · `:'';
    return `${schedule}<div class="next-payment">${typeText}${rate===null?'ერთჯერადი ფასი დასაზუსტებელია':`${money(rate)} / დასწრებული გაკვეთილი`} · დასწრება: ${lessons}</div>`;
  }
  if (isFlexibleCircle(subject) && !childBillingMode(child,subject)) return `${schedule}<div class="next-payment">აირჩიეთ თვიური ან ერთჯერადი გადახდა</div>`;
  return `${schedule}<div class="next-payment">${paidStatus(bill.status)?`შემდეგი გადახდა: ${nextBillingDate({child,status:bill.status},month)} · ${money(bill.price)}`:`გადახდის ვადა: ${billingDate(child,month)} · დარჩა ${money(bill.remaining)}`}</div>`;
}
function circlePriceControl(child,subject,bill) {
  if (isCourseCircle(subject)) return `<button class="price-edit" onclick="editChildSubjectPrice('${esc(child.id)}','${esc(subject.id)}')">${bill.price===null?'ფასი მითითებული არ არის':`${money(bill.price)} / კურსი`} ✎</button>`;
  if (isCraftCircle(subject)) return `<button class="price-edit" onclick="editCircleBilling('${esc(child.id)}','${esc(subject.id)}')">${participantTypeLabel(participantType(child,subject))} ✎</button>`;
  if (isFlexibleCircle(subject)) return `<button class="price-edit" onclick="editCircleBilling('${esc(child.id)}','${esc(subject.id)}')">${childBillingMode(child,subject)==='monthly'?'თვიური':childBillingMode(child,subject)==='per_lesson'?'ერთჯერადი':'აირჩიეთ ტარიფი'} · ${bill.price===null?'ფასი ?':isPerLessonCircle(subject,child)?`${money(perLessonRate(child,subject))} / გაკვეთილი`:money(bill.price)} ✎</button>`;
  if (isPerLessonCircle(subject,child)) return `<button class="price-edit" onclick="editCircleBilling('${esc(child.id)}','${esc(subject.id)}')">${perLessonRate(child,subject)===null?'ფასი ?':`${money(perLessonRate(child,subject))} / გაკვეთილი`} ✎</button>`;
  return `<button class="price-edit" onclick="editChildSubjectPrice('${esc(child.id)}','${esc(subject.id)}')">${bill.price===null?'ფასი მითითებული არ არის':`${money(bill.price)} / თვე`} ✎</button>`;
}
function childProfile() {
  const c = get('children', currentChildId);
  if (!c) return `${head('Ребёнок', 'Карточка не найдена')}${button('К списку детей', "go('children')")}`;
  const enrolled = new Set(toList(c.activityIds));
  const subjects = enrolledSubjects(c);
  const paid = data.payments.filter(p => p.childId === c.id).reduce((sum, p) => sum + number(p.amount), 0);
  const details = [
    ['დაბადების თარიღი', c.birth ? `${c.birth} · ${ageOf(c.birth)}` : 'მითითებული არ არის'], ['მშობელი', c.parent || 'მითითებული არ არის'],
    ['ტელეფონი', c.phone || 'მითითებული არ არის'], ['დამატებითი ტელეფონი', c.phone2 || 'მითითებული არ არის'],
    ['ჯგუფი', c.group || 'მითითებული არ არის'], ['განრიგი', c.schedule || 'მითითებული არ არის'],
    ['დაწყების თარიღი', c.start || 'მითითებული არ არის'],
    ['ყოველთვიური გადახდის დღე', day(c.paymentDay) ? `ყოველი თვის ${day(c.paymentDay)} რიცხვი` : 'მითითებული არ არის'],
    ['საერთო ტარიფი', c.tariff == null || c.tariff === '' ? 'მითითებული არ არის' : money(c.tariff)], ['ფასდაკლება', `${number(c.discount)}%`],
    ['სულ მიღებულია', money(paid)], ['მოზიდვის წყარო', c.source || 'მითითებული არ არის'],
  ];
  const circleDue = subjects.reduce((sum, subject) => sum + (subjectBill(c, subject).remaining || 0), 0);
  const legacyPaid = data.payments.filter(p => p.childId === c.id && !p.subjectId && monthKey(p.billingMonth||p.date) === paymentMonth).reduce((sum,p)=>sum+number(p.amount),0);
  const legacyPrice = number(c.tariff)*(1-number(c.discount)/100);
  const legacyMarkedPaid = monthKey(c.paidMarkerMonth) === paymentMonth;
  const legacyStatus = legacyMarkedPaid || (c.tariff != null && legacyPaid >= legacyPrice) ? 'Оплачено' : legacyPaid > 0 ? 'Частично' : 'Надо оплатить';
  const showBaseTariff = usesBaseTariff(c);
  const legacyRemaining = showBaseTariff ? (legacyMarkedPaid ? 0 : Math.max(0,legacyPrice-legacyPaid)) : 0;
  const due = circleDue + legacyRemaining;
  const legacyPaymentCard = showBaseTariff ? `<section class="section card legacy-bill"><div><small>საბაზო ტარიფი · ${esc(prettyMonth(paymentMonth))}</small><b>${money(legacyPrice)}</b><small>${esc(c.group||'ბაღი')}</small></div><span class="pay-status ${legacyStatus === 'Оплачено' ? 'paid' : legacyStatus === 'Частично' ? 'partial' : 'due'}">${billStatusLabel(legacyStatus)}</span>${legacyStatus !== 'Оплачено' && isActiveRecord(c,'children') ? `<button class="btn small" onclick="paymentForm('${esc(c.id)}')">გადახდა ${money(legacyRemaining)}</button>` : ''}</section>` : '';
  const childPayments=[...data.payments].filter(item=>item.childId===c.id).sort((a,b)=>dateKey(b.date).localeCompare(dateKey(a.date))).slice(0,8);
  const childAttendance=[...data.attendance].filter(item=>item.childId===c.id||(!item.childId&&item.name===c.name)).sort((a,b)=>dateKey(b.date).localeCompare(dateKey(a.date))).slice(0,8);
  const activityHistory=`<section class="section card"><div class="section-title"><h2>ისტორია</h2><button class="btn small secondary" onclick="paymentForm('${esc(c.id)}')">＋ გადახდა</button></div>${childPayments.length?`<h3 class="history-title">გადახდები</h3><div class="compact-history">${childPayments.map(item=>`<button onclick="paymentForm('${esc(c.id)}','${esc(item.id)}')"><span><b>${esc(item.subjectId?subjectName(item.subjectId):'საერთო გადახდა')}</b><small>${esc(dateKey(item.date)||'თარიღი არ არის')} · ${esc(paymentMethodLabel(item.method))}${item.billingMonth&&monthKey(item.billingMonth)!==monthKey(item.date)?` · ${esc(prettyMonth(monthKey(item.billingMonth)))}-ისთვის`:''}${childPayments.filter(other=>other!==item&&(other.subjectId||'')===(item.subjectId||'')&&monthKey(other.billingMonth||other.date)===monthKey(item.billingMonth||item.date)).length?' · <b class="danger-text">ამ თვეში ორჯერ</b>':''}</small></span><strong>${money(item.amount)}</strong></button>`).join('')}</div>`:'<p class="meta">გადახდების ისტორია ჯერ არ არის.</p>'}${childAttendance.length?`<h3 class="history-title">დასწრება</h3><div class="compact-history">${childAttendance.map(item=>`<button onclick="editSimple('attendance','${esc(item.id)}')"><span><b>${esc(subjectName(item.subjectId))}</b><small>${esc(dateKey(item.date)||'თარიღი არ არის')}</small></span><strong>${esc(attendanceStatusLabel(item.status))}</strong></button>`).join('')}</div>`:''}</section>`;
  return `${head('ბავშვის ბარათი','ბავშვები / პროფილი',`<button class="btn small" onclick="childForm('${esc(c.id)}')">შეცვლა</button>`)}<button class="text-back" onclick="go('children')">← ყველა ბავშვი</button><section class="profile-hero ${isActiveRecord(c,'children')?'':'record-inactive'}"><div class="profile-avatar">${esc((c.name||'?').slice(0,1))}</div><div class="profile-identity"><h2>${esc(c.name)}</h2><span>${activeLabel(c,'children')}</span></div><button class="record-switch hero-switch ${isActiveRecord(c,'children')?'on':'off'}" onclick="toggleRecordActive('children','${esc(c.id)}')" aria-label="სტატუსის შეცვლა"><i></i><span>${isActiveRecord(c,'children')?'გამორთვა':'ჩართვა'}</span></button></section>${oldDebtsBlock(c.id)}${parentsBlock(c)}${legacyPaymentCard}<section class="section card"><div class="section-title"><h2>წრეები · ${subjects.length}</h2><button class="btn small secondary" onclick="go('clubs')">ყველა წრე →</button></div><div class="billing-month"><span>${esc(prettyMonth(paymentMonth))}</span><button class="btn small secondary" onclick="paymentDayForm('${esc(c.id)}','${paymentMonth}')">გადახდის დღე: ${paymentDayFor(c,paymentMonth)||'?'}${(c.paymentDayOverrides||{})[paymentMonth]?' *':''} ✎</button><button class="btn small secondary" onclick="shiftPaymentMonth(-1)">‹</button><button class="btn small secondary" onclick="shiftPaymentMonth(1)">›</button></div>${subjects.length?`<div class="subject-list">${subjects.map(subject=>{const bill=subjectBill(c,subject),complete=paidStatus(bill.status);return `<div class="subject-line ${complete?'bill-paid':''}"><div class="subject-line-head"><div><b>${esc(subject.name)}</b><small>${esc(teacherName(subject))}</small></div><span class="pay-status ${complete?'paid':bill.status==='Частично'?'partial':'due'}">${billStatusLabel(bill.status)}</span></div>${circleChargeMeta(c,subject,bill,paymentMonth)}<div class="subject-line-bottom">${circlePriceControl(c,subject,bill)}${isFlexibleCircle(subject)&&childBillingMode(c,subject)==='per_lesson'?`<button class="btn small secondary" onclick="dropInForm('${esc(c.id)}','${esc(subject.id)}')">＋ ვიზიტი</button>`:''}${hasVisitCalendar(subject,c)?`<button class="btn small secondary" onclick="visitCalendarMonth=null;visitCalendar('${esc(c.id)}','${esc(subject.id)}')">📅 დასწრება · ${childVisits(c.id,subject.id,paymentMonth).length}</button>`:''}<button class="btn small secondary" onclick="if(confirm('მოვხსნათ ბავშვი წრიდან „${esc(subject.name).replace(/'/g,'')}“? ისტორია შენარჩუნდება.'))toggleChildActivity('${esc(c.id)}','${esc(subject.id)}')">✕ მოხსნა</button>${bill.remaining>0&&isActiveRecord(c,'children')?`<button class="btn small" onclick="paymentForSubject('${esc(c.id)}','${esc(subject.id)}')">გადახდა ${money(bill.remaining)}</button>`:''}</div></div>`}).join('')}</div><p class="section-note" style="margin-top:12px">${isActiveRecord(c,'children')?`ამ თვეში დარჩენილი გადასახდელი: <b>${money(due)}</b>. ერთჯერადი მომსახურება ითვლება მხოლოდ დასწრებული ჩანაწერებით.`:'ბავშვი არააქტიურია — ახალი დარიცხვები და დასწრება გამორთულია. ისტორია შენარჩუნებულია.'}</p>`:'<p class="section-note">წრე ჯერ არ არის მინიჭებული. აირჩიეთ ქვემოთ.</p>'}<div class="activity-grid">${data.clubs.filter(a=>!enrolled.has(a.id)&&!isEvent(a)).map(a=>`<button class="activity-choice" onclick="toggleChildActivity('${esc(c.id)}','${esc(a.id)}')"><span>＋</span>${esc(a.name)}</button>`).join('')}</div>${c.clubs?`<p class="meta">ძველი ჩანაწერი: ${esc(c.clubs)}</p>`:''}</section><section class="section card"><div class="section-title"><h2>პირადი მონაცემები</h2></div><div class="profile-details">${details.map(([label,value])=>`<div><small>${esc(label)}</small><b>${esc(value)}</b></div>`).join('')}</div>${c.comment?`<p class="profile-comment">${esc(c.comment)}</p>`:''}</section>${activityHistory}`;
}
// ---------- Visit calendar (craft, Saturday kindergarten): each marked day = one paid visit ----------
const hasVisitCalendar = (subject, child = null) => isCraftCircle(subject) || /შაბათის ბაღი/i.test(String(subject?.name || '')) || (isFlexibleCircle(subject) && child && childBillingMode(child, subject) === 'per_lesson');
const childVisits = (childId, subjectId, month) => data.attendance.filter(item => item.childId === childId && item.subjectId === subjectId && wasPresent(item) && (!month || monthKey(item.date) === month));
let visitCalendarMonth = null;
function visitCalendar(childId, subjectId, month = visitCalendarMonth || paymentMonth) {
  const child = get('children', childId), subject = get('clubs', subjectId);
  if (!child || !subject) return;
  visitCalendarMonth = month;
  const [y, m] = month.split('-').map(Number), first = (new Date(y, m - 1, 1).getDay() + 6) % 7, days = new Date(y, m, 0).getDate();
  const weekdays = toList(subject.weekdays).map(Number), marked = new Set(childVisits(childId, subjectId, month).map(item => dateKey(item.date)));
  const rate = perLessonRate(child, subject), closed = isClosedMonth(month);
  const cells = Array.from({ length: days }, (_, i) => { const key = `${month}-${String(i + 1).padStart(2, '0')}`, wd = new Date(`${key}T12:00:00`).getDay(), future = key > today();
    return `<button type="button" class="visit-day ${weekdays.includes(wd) ? 'sched' : ''} ${marked.has(key) ? 'on' : ''} ${key === today() ? 'is-today' : ''}" ${future || closed ? 'disabled' : ''} onclick="toggleVisit('${esc(childId)}','${esc(subjectId)}','${key}')" aria-pressed="${marked.has(key)}" aria-label="${key}"><b>${i + 1}</b><span>${marked.has(key) ? '✓' : ''}</span></button>`; }).join('');
  const total = rate === null ? null : marked.size * rate;
  $("modalTitle").textContent = `${child.name} · ${subject.name}`;
  const form = $("modalForm");
  form.onsubmit = event => event.preventDefault(); form.onchange = null; form.onclick = null;
  form.innerHTML = `<div class="month-switch"><button type="button" onclick="visitCalendar('${esc(childId)}','${esc(subjectId)}','${shiftMonth(month, -1)}')" aria-label="წინა თვე">‹</button><b>${closed ? '🔒 ' : ''}${esc(prettyMonth(month))}</b><button type="button" onclick="visitCalendar('${esc(childId)}','${esc(subjectId)}','${shiftMonth(month, 1)}')" aria-label="შემდეგი თვე">›</button></div>
  <p class="meta">დააჭირეთ დღეს, როცა ბავშვი დაესწრო. ${weekdays.length ? `ფერით მონიშნულია ${esc(circleScheduleLabel(subject))}.` : ''}${closed ? ' თვე დახურულია — ცვლილება შეუძლებელია.' : ''}</p>
  <div class="visit-grid visit-head">${['ორშ','სამ','ოთხ','ხუთ','პარ','შაბ','კვ'].map(d => `<span>${d}</span>`).join('')}</div>
  <div class="visit-grid">${Array.from({ length: first }, () => '<span></span>').join('')}${cells}</div>
  <div class="visit-total"><span>${marked.size} დასწრება × ${rate === null ? 'ფასი ?' : money(rate)}${isCraftCircle(subject) ? ` <small>(${esc(participantTypeLabel(participantType(child, subject)))})</small>` : ''}</span><strong>${total === null ? '—' : money(total)}</strong></div>
  <div class="form-actions"><button class="btn" type="button" onclick="closeModal();visitCalendarMonth=null;go(current)">მზადაა</button></div>`;
  $("modal").classList.remove('hidden');
}
// one-time visit: came and paid on the spot (e.g. English club, 60 ₾)
const dropInCircles = () => data.clubs.filter(circle => isFlexibleCircle(circle) || (circle.billingType === 'per_lesson' && !isCraftCircle(circle) && !isAppointmentCircle(circle)));
function dropInForm(childId = '', subjectId = '') {
  const circles = dropInCircles(); if (!circles.length) return toast('ერთჯერადი წრეები არ არის');
  const circle = get('clubs', subjectId) || circles.find(c => /ინგლისური კლუბ/i.test(c.name)) || circles[0];
  openForm('ერთჯერადი ვიზიტი', [
    {name:'subjectId',label:'წრე',type:'select',required:true,options:circles.map(c => [c.id, `${c.name} · ${c.lessonRate == null ? 'ფასი ?' : money(c.lessonRate)}`])},
    {name:'childId',label:'ბავშვი',type:'select',options:[['','— ახალი ბავშვი (ბაზაში არ არის) —'],...activePeople('children').map(c => [c.id, c.name])]},
    {name:'newName',label:'ახალი ბავშვის სახელი'},{name:'newPhone',label:'მშობლის ტელეფონი (არასავალდებულო)',type:'tel'},
    {name:'date',label:'თარიღი',type:'date',required:true},{name:'amount',label:'გადახდილი თანხა, ₾',type:'number',required:true},
    {name:'method',label:'გადახდის მეთოდი',type:'select',options:[['cash','ნაღდი'],['transfer','გადარიცხვა'],['card','ბარათი'],['other','სხვა']]},
  ], async values => {
    const subject = get('clubs', values.subjectId), amount = number(values.amount);
    if (!subject) throw new Error('აირჩიეთ წრე');
    if (amount <= 0) throw new Error('თანხა ნულზე მეტი უნდა იყოს');
    assertOpen(values.date, 'ვიზიტი');
    let child = get('children', values.childId);
    if (!child) {
      if (!String(values.newName || '').trim()) throw new Error('აირჩიეთ ბავშვი ან ჩაწერეთ ახალი ბავშვის სახელი');
      child = await dataAdapter.create('children', { name: values.newName.trim(), phone: values.newPhone || '', active: true, status: 'Активен', guest: true, source: 'ერთჯერადი ვიზიტი', activityIds: [subject.id], activityBillingModes: { [subject.id]: 'per_lesson' }, activityStart: { [subject.id]: values.date }, discount: 0, tariff: null });
    } else {
      const mode = childBillingMode(child, subject);
      if (isFlexibleCircle(subject) && mode === 'monthly') throw new Error(`${child.name} ამ წრეზე თვიურ გადახდაზეა — ერთჯერადი ვიზიტი არ ითვლება`);
      if (!toList(child.activityIds).includes(subject.id) || (isFlexibleCircle(subject) && !mode)) child = await dataAdapter.update('children', child.id, { activityIds: [...new Set([...toList(child.activityIds), subject.id])], activityBillingModes: { ...(child.activityBillingModes || {}), [subject.id]: 'per_lesson' }, activityStart: withStart(child, [subject.id]) });
    }
    if (!data.attendance.some(a => a.childId === child.id && a.subjectId === subject.id && dateKey(a.date) === values.date && wasPresent(a)))
      await dataAdapter.create('attendance', { childId: child.id, name: child.name, subjectId: subject.id, date: values.date, status: 'present' });
    await dataAdapter.create('payments', { childId: child.id, child: child.name, subjectId: subject.id, amount, date: values.date, billingMonth: monthKey(values.date), method: values.method, comment: 'ერთჯერადი ვიზიტი' });
    go(current); toast(`ვიზიტი და გადახდა შენახულია · ${money(amount)}`);
  }, { subjectId: circle.id, childId, date: today(), amount: circle.lessonRate ?? '', method: 'cash' });
  const sync = () => { const isNew = !$('field-childId').value; ['newName','newPhone'].forEach(name => { const node = $(`field-${name}`)?.closest('.field'); if (node) node.hidden = !isNew; }); };
  $('field-childId')?.addEventListener('change', sync); sync();
  $('field-subjectId')?.addEventListener('change', () => { const c = get('clubs', $('field-subjectId').value); if (c?.lessonRate != null) $('field-amount').value = c.lessonRate; });
}
async function toggleVisit(childId, subjectId, date) {
  try { assertOpen(date, 'დასწრება'); } catch (error) { return toast(error.message); }
  const child = get('children', childId);
  const existing = data.attendance.find(item => item.childId === childId && item.subjectId === subjectId && dateKey(item.date) === date);
  try {
    if (existing && wasPresent(existing)) await dataAdapter.remove('attendance', existing.id);
    else if (existing) await dataAdapter.update('attendance', existing.id, { status: 'present' });
    else await dataAdapter.create('attendance', { childId, name: child?.name || '', subjectId, date, status: 'present' });
  } catch (error) { return toast(error.message); }
  go(current); visitCalendar(childId, subjectId, monthKey(date));
}
function paymentDayForm(childId, month = paymentMonth) {
  const child = get('children', childId); if (!child) return;
  const override = (child.paymentDayOverrides || {})[month];
  openForm(`${child.name} · გადახდის დღე`, [
    {name:'paymentDay',label:'რიცხვი (1–31)',type:'number',required:true},
    {name:'scope',label:'როდის',type:'select',options:[['always','მუდმივად — ყოველ თვე'],['month',`მხოლოდ ${prettyMonth(month)}`]]},
  ], async values => {
    const d = day(values.paymentDay); if (!d) throw new Error('მიუთითეთ რიცხვი 1-დან 31-მდე');
    const overrides = { ...(child.paymentDayOverrides || {}) };
    if (values.scope === 'month') { overrides[month] = d; await dataAdapter.update('children', childId, { paymentDayOverrides: overrides }); }
    else { delete overrides[month]; await dataAdapter.update('children', childId, { paymentDay: d, paymentDayOverrides: overrides }); }
    go(current); toast(values.scope === 'month' ? `${prettyMonth(month)}: გადახდა ${d} რიცხვში` : `გადახდის დღე: ყოველი თვის ${d}`);
  }, { paymentDay: paymentDayFor(child, month) || '', scope: override ? 'month' : 'always' });
  if (override) $('modalForm').querySelector('.form-actions')?.insertAdjacentHTML('afterbegin', `<button class="btn secondary" type="button" onclick="resetMonthPaymentDay('${esc(childId)}','${month}')">ჩვეულ დღეზე დაბრუნება (${day(child.paymentDay) || '?'})</button>`);
}
async function resetMonthPaymentDay(childId, month) {
  const child = get('children', childId); if (!child) return;
  const overrides = { ...(child.paymentDayOverrides || {}) }; delete overrides[month];
  await dataAdapter.update('children', childId, { paymentDayOverrides: overrides }); closeModal(); go(current); toast('გადახდის დღე დაბრუნდა ჩვეულზე');
}
const monthlyTariffs = subject => { const list = toList(subject?.tariffOptions).map(Number).filter(n => Number.isFinite(n) && n > 0); return list.length ? [...new Set(list)] : (optNumber(subject?.tariff) ? [number(subject.tariff)] : []); };
async function toggleChildActivity(childId, activityId) {
  const c = get('children', childId), ids = new Set(toList(c?.activityIds));
  if (!c) return;
  const adding=!ids.has(activityId); adding ? ids.add(activityId) : ids.delete(activityId);
  try { await dataAdapter.update('children', childId, adding ? { activityIds: [...ids], activityStart: withStart(c, [activityId]) } : { activityIds: [...ids] }); const circle=get('clubs',activityId); if (adding&&(isCraftCircle(circle)||isFlexibleCircle(circle))) editCircleBilling(childId,activityId); else go('childProfile'); }
  catch (error) { toast(error.message); }
}
function editChildSubjectPrice(childId, subjectId) {
  const child = get('children', childId), subject = get('clubs', subjectId);
  if (!child || !subject) return;
  openForm(`Цена · ${subject.name}`, [{name:'price',label:isCourseCircle(subject)?'კურსის ფასი ამ ბავშვისთვის, ₾':'Цена для этого ребёнка, ₾ в месяц',type:'number',required:true}], async values => {
    if (values.price === '' || number(values.price) < 0) throw new Error('Укажите цену от 0 ₾');
    const activityPrices = {...(child.activityPrices || {}), [subjectId]:number(values.price)};
    await dataAdapter.update('children', childId, {activityPrices}); go('childProfile'); toast('Цена сохранена');
  }, {price:(isCourseCircle(subject)?subjectBill(child,subject).price:subjectPrice(child, subject)) ?? ''});
}
function editCircleBilling(childId, subjectId) {
  const child=get('children',childId),subject=get('clubs',subjectId);
  if (!child||!subject) return;
  if (isCraftCircle(subject)) {
    openForm(`${subject.name} · ბავშვის ტიპი`,[{name:'participantType',label:'აირჩიეთ კრაფტის ტარიფი',type:'select',required:true,options:[['kindergarten',`ბაღის ბავშვი — ${money(subject.kindergartenRate??30)} / გაკვეთილი`],['external',`გარე ბავშვი — ${money(subject.externalRate??40)} / გაკვეთილი`]]}],async values=>{
      const activityParticipantTypes={...(child.activityParticipantTypes||{}),[subjectId]:values.participantType};
      await dataAdapter.update('children',childId,{activityParticipantTypes}); go('childProfile'); toast('კრაფტის ტარიფი შენახულია');
    },{participantType:participantType(child,subject)||'kindergarten'});
    return;
  }
  if (isFlexibleCircle(subject)) {
    const mode=childBillingMode(child,subject), price=child.activityPrices?.[subjectId];
    const presets=[...monthlyTariffs(subject).map(n=>[`monthly:${n}`,`${money(n)} / თვე`]),...(subject.lessonRate!=null&&subject.lessonRate!==''?[[`per_lesson:${number(subject.lessonRate)}`,`${money(subject.lessonRate)} / ერთჯერადი ვიზიტი`]]:[])];
    const currentKey=mode&&price!=null&&price!==''?`${mode}:${number(price)}`:'';
    const selected=presets.some(([key])=>key===currentKey)?currentKey:(mode?'custom':presets[0]?.[0]||'custom');
    openForm(`${subject.name} · ტარიფი`,[{name:'choice',label:'აირჩიეთ ტარიფი',type:'choice',required:true,options:[...presets,['custom','სხვა ფასი']]},{name:'billingMode',label:'სხვა ფასის ტიპი',type:'select',options:[['monthly','თვეში'],['per_lesson','ერთჯერადი ვიზიტი']]},{name:'price',label:'სხვა ფასი, ₾',type:'number'}],async values=>{
      let chosenMode, chosenPrice;
      if (values.choice==='custom') { chosenMode=values.billingMode||'monthly'; chosenPrice=values.price; if (chosenPrice===''||number(chosenPrice)<0) throw new Error('მიუთითეთ სწორი ფასი'); }
      else { [chosenMode, chosenPrice]=String(values.choice).split(':'); }
      const activityPrices={...(child.activityPrices||{}),[subjectId]:number(chosenPrice)};
      const activityBillingModes={...(child.activityBillingModes||{}),[subjectId]:chosenMode};
      await dataAdapter.update('children',childId,{activityPrices,activityBillingModes}); go('childProfile'); toast(`ტარიფი: ${money(chosenPrice)} ${chosenMode==='monthly'?'/ თვე':'/ ვიზიტი'}`);
    },{choice:selected,billingMode:mode||'monthly',price:selected==='custom'?(price??''):''});
    const sync=()=>{ const custom=$('modalForm').querySelector('input[name=choice]:checked')?.value==='custom'; ['billingMode','price'].forEach(name=>{ const node=$(`field-${name}`)?.closest('.field'); if (node) node.hidden=!custom; }); };
    $('modalForm').querySelectorAll('input[name=choice]').forEach(input=>input.addEventListener('change',sync)); sync();
    return;
  }
  const flexible=false,mode=childBillingMode(child,subject)||'per_lesson';
  const fields=flexible?[{name:'billingMode',label:'გადახდის ტიპი',type:'select',required:true,options:[['monthly','თვიური გადახდა'],['per_lesson','ერთჯერადი · ყოველ დასწრებაზე']]},{name:'price',label:'არჩეული ტარიფის ფასი, ₾',type:'number',required:true}]:[{name:'price',label:'ფასი ერთ დასწრებულ გაკვეთილზე, ₾',type:'number',required:true}];
  const defaultPrice=child.activityPrices?.[subjectId] ?? (mode==='monthly'?subject.tariff:subject.lessonRate) ?? '';
  openForm(`${subject.name} · გადახდა`,fields,async values=>{
    if (values.price===''||number(values.price)<0) throw new Error('მიუთითეთ სწორი ფასი');
    const activityPrices={...(child.activityPrices||{}),[subjectId]:number(values.price)};
    const activityBillingModes={...(child.activityBillingModes||{}),[subjectId]:values.billingMode||(isPerLessonCircle(subject,child)?'per_lesson':'monthly')};
    await dataAdapter.update('children',childId,{activityPrices,activityBillingModes}); go('childProfile'); toast('გადახდის წესი შენახულია');
  },{billingMode:mode,price:defaultPrice});
}

// ---------- Parents: own card (name, phones), linked to one or more children ----------
const phoneKey = value => String(value || '').replace(/\D/g, '').slice(-9);
const childParentIds = child => toList(child?.parentIds);
const parentChildren = parentId => data.children.filter(child => childParentIds(child).includes(parentId));
const childParents = child => childParentIds(child).map(id => get('parents', id)).filter(Boolean);
function familyDebt(parentId) {
  const kids = parentChildren(parentId), ids = new Set(kids.map(child => child.id));
  const current = billingRows(todayMonth()).filter(row => ids.has(row.child.id)).reduce((sum, row) => sum + number(row.remaining), 0);
  const old = kids.reduce((sum, child) => sum + oldDebts(child.id).reduce((a, bill) => a + bill.remaining, 0), 0);
  return { current, old, total: current + old };
}
// one-time: build parent cards from what children already have (parent name + phone); same phone = same family
let parentsAutoRunning = false;
async function autoCreateParents() {
  if (parentsAutoRunning || serverVersion < 4 || data.parents.length) return;
  try { if (localStorage.getItem('gimili_parents_auto_v1')) return; } catch (_) {}
  const candidates = data.children.filter(child => !childParentIds(child).length && (phoneKey(child.phone).length >= 7 || String(child.parent || '').trim()));
  if (!candidates.length) return;
  parentsAutoRunning = true;
  try {
    const groups = new Map();
    candidates.forEach(child => { const key = phoneKey(child.phone).length >= 7 ? `p:${phoneKey(child.phone)}` : `n:${child.id}`; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(child); });
    for (const kids of groups.values()) {
      const named = kids.find(child => String(child.parent || '').trim());
      const name = named ? String(named.parent).trim() : `${kids.map(child => child.name).filter(Boolean).join(', ')} — მშობელი`;
      const phone2 = kids.map(child => child.phone2).find(value => value && phoneKey(value) !== phoneKey(kids[0].phone)) || '';
      const parent = await dataAdapter.create('parents', { name, phone: kids[0].phone || '', phone2, comment: 'ავტომატურად შექმნილია ბავშვის ბარათიდან' });
      for (const child of kids) await dataAdapter.update('children', child.id, { parentIds: [...new Set([...childParentIds(child), parent.id])] });
    }
    try { localStorage.setItem('gimili_parents_auto_v1', '1'); } catch (_) {}
    if (current === 'parents') go('parents');
    toast(`მშობლების ბარათები შეიქმნა: ${groups.size}`);
  } finally { parentsAutoRunning = false; }
}
// when a child is saved with a phone, link it to the parent with that phone (or create one)
async function ensureParentFor(child) {
  if (!child || childParentIds(child).length || phoneKey(child.phone).length < 7) return;
  let parent = data.parents.find(item => phoneKey(item.phone) === phoneKey(child.phone) || phoneKey(item.phone2) === phoneKey(child.phone));
  if (!parent) parent = await dataAdapter.create('parents', { name: String(child.parent || '').trim() || `${child.name} — მშობელი`, phone: child.phone, phone2: child.phone2 || '', comment: '' });
  await dataAdapter.update('children', child.id, { parentIds: [parent.id] });
}
const telLink = phone => phone ? `<a class="tel" href="tel:${esc(String(phone).replace(/[^+\d]/g, ''))}">${esc(phone)}</a>` : '';
function parentsView() {
  const rows = [...data.parents].sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'ka'));
  const totalDebt = rows.reduce((sum, parent) => sum + familyDebt(parent.id).total, 0);
  return `${head('მშობლები', `${rows.length} ოჯახი`, '<button class="btn icon-btn" onclick="parentForm()" aria-label="მშობლის დამატება">＋</button>')}<div class="metrics payment-metrics"><div class="metric" style="--accent:var(--pink)"><span class="label">ოჯახების ვალი</span><strong>${money(totalDebt)}</strong><span class="delta">მიმდინარე თვე + ძველი ვალები</span></div><div class="metric" style="--accent:var(--blue)"><span class="label">ბავშვები მშობლის გარეშე</span><strong>${activePeople('children').filter(child => !childParents(child).length).length}</strong></div></div><input class="search" placeholder="სახელი ან ტელეფონი" aria-label="მშობლების ძებნა" oninput="filterRows(this.value)">${rows.length ? `<div class="list cards-grid" id="rows">${rows.map(parent => { const kids = parentChildren(parent.id), debt = familyDebt(parent.id); return `<article class="card parent-card" data-search="${esc([parent.name, parent.phone, parent.phone2, ...kids.map(k => k.name)].join(' '))}"><div class="teacher-top"><div class="pic" style="--accent:var(--blue)">${esc((parent.name || '?').slice(0, 1))}</div><div><h2>${esc(parent.name || 'სახელი არ არის')}</h2><p class="meta">${telLink(parent.phone) || 'ტელეფონი არ არის'}${parent.phone2 ? ` · ${telLink(parent.phone2)}` : ''}</p></div><button class="btn small secondary" onclick="parentForm('${esc(parent.id)}')">შეცვლა</button></div><div class="activity-members"><b>ბავშვები:</b>${kids.length ? kids.map(k => `<button onclick="showChild('${esc(k.id)}')">${esc(k.name)}${isActiveRecord(k, 'children') ? '' : ' · არააქტიური'}</button>`).join('') : '<span class="meta">ბავშვი არ არის მიბმული</span>'}</div><div class="family-debt ${debt.total > 0 ? 'due' : 'ok'}"><span>${debt.total > 0 ? `ოჯახის ვალი${debt.old ? ` (ძველი: ${money(debt.old)})` : ''}` : 'ვალი არ არის'}</span><strong>${money(debt.total)}</strong></div>${parent.comment ? `<p class="meta">${esc(parent.comment)}</p>` : ''}</article>`; }).join('')}</div>` : empty('მშობლები ჯერ არ არის', button('მშობლის დამატება', 'parentForm()'))}`;
}
function parentForm(id, presetChildId = '') {
  const old = id ? get('parents', id) : null;
  openForm(old ? 'მშობლის ბარათი' : 'ახალი მშობელი', [
    {name:'name',label:'სახელი და გვარი',required:true},{name:'phone',label:'ტელეფონი',type:'tel'},{name:'phone2',label:'დამატებითი ტელეფონი',type:'tel'},
    {name:'childIds',label:'ბავშვები',type:'multi',options:data.children.map(child => [child.id, `${child.name}${isActiveRecord(child,'children') ? '' : ' · არააქტიური'}`])},
    {name:'comment',label:'კომენტარი',type:'textarea'},
  ], async values => {
    const chosen = new Set(values.childIds || []); delete values.childIds;
    const saved = old ? await dataAdapter.update('parents', id, values) : await dataAdapter.create('parents', values);
    for (const child of data.children) {
      const ids = new Set(childParentIds(child)), has = ids.has(saved.id), want = chosen.has(child.id);
      if (has === want) continue;
      want ? ids.add(saved.id) : ids.delete(saved.id);
      await dataAdapter.update('children', child.id, { parentIds: [...ids] });
    }
    go(current === 'childProfile' ? 'childProfile' : 'parents'); toast('მშობლის ბარათი შენახულია');
  }, old ? { ...old, childIds: parentChildren(old.id).map(child => child.id) } : { childIds: presetChildId ? [presetChildId] : [] });
  if (old) $('modalForm').querySelector('.form-actions')?.insertAdjacentHTML('afterbegin', `<button class="btn danger" type="button" onclick="deleteParent('${esc(old.id)}')">წაშლა</button>`);
}
async function deleteParent(id) {
  const parent = get('parents', id); if (!parent) return;
  if (!confirm(`წავშალოთ „${parent.name || ''}“? ბავშვების ბარათები დარჩება.`)) return;
  for (const child of parentChildren(id)) await dataAdapter.update('children', child.id, { parentIds: childParentIds(child).filter(item => item !== id) });
  await dataAdapter.remove('parents', id); closeModal(); go('parents'); toast('წაიშალა');
}
function linkParentForm(childId) {
  const child = get('children', childId); if (!child) return;
  openForm(`${child.name} · მშობლები`, [{name:'parentIds',label:'აირჩიეთ მშობლები',type:'multi',options:data.parents.map(parent => [parent.id, `${parent.name}${parent.phone ? ` · ${parent.phone}` : ''}`])}], async values => {
    await dataAdapter.update('children', childId, { parentIds: values.parentIds || [] }); go('childProfile'); toast('შენახულია');
  }, { parentIds: childParentIds(child) });
  $('modalForm').querySelector('.form-actions')?.insertAdjacentHTML('afterbegin', `<button class="btn secondary" type="button" onclick="closeModal();setTimeout(()=>parentForm(null,'${esc(childId)}'),90)">＋ ახალი მშობელი</button>`);
}
function parentsBlock(child) {
  const parents = childParents(child);
  return `<section class="section card"><div class="section-title"><h2>მშობლები</h2><button class="btn small secondary" onclick="linkParentForm('${esc(child.id)}')">${parents.length ? 'შეცვლა' : '＋ მიბმა'}</button></div>${parents.length ? `<div class="list single">${parents.map(parent => { const siblings = parentChildren(parent.id).filter(k => k.id !== child.id); const debt = familyDebt(parent.id); return `<article class="row"><div class="pic" style="--accent:var(--blue)">${esc((parent.name || '?').slice(0, 1))}</div><div class="row-body"><div class="row-title">${esc(parent.name)}</div><div class="meta">${telLink(parent.phone) || 'ტელეფონი არ არის'}${parent.phone2 ? ` · ${telLink(parent.phone2)}` : ''}${siblings.length ? `<br>და/ძმა: ${siblings.map(k => `<button class="link-btn" onclick="showChild('${esc(k.id)}')">${esc(k.name)}</button>`).join(', ')}` : ''}${debt.total > 0 && siblings.length ? `<br>ოჯახის ვალი: <b class="danger-text">${money(debt.total)}</b>` : ''}</div></div><button class="btn small secondary" onclick="parentForm('${esc(parent.id)}')">ბარათი</button></article>`; }).join('')}</div>` : `<p class="meta">${child.parent || child.phone ? `ძველი ჩანაწერი: ${esc(child.parent || '')} ${esc(child.phone || '')}` : 'მშობელი არ არის მიბმული'}</p>`}</section>`;
}
function contacts() {
  const allRows = [...data.children], rows = filteredByParticipantStatus('children',allRows).sort((a, b) => Number(!!a.phone || !!a.phone2) - Number(!!b.phone || !!b.phone2));
  const missing = rows.filter(c => !c.phone && !c.phone2).length;
  return `${head("Контакты", `Нужно уточнить: ${missing}`)}${participantStatusTabs('children',allRows)}<input class="search" placeholder="Имя или телефон" aria-label="Поиск контактов" oninput="filterRows(this.value)">${rows.length ? `<div class="list" id="rows">${rows.map(c => `<article class="row contact-row ${isActiveRecord(c,'children')?'':'record-inactive'}" data-search="${esc([c.name, c.parent, c.phone, c.phone2].join(' '))}"><div class="pic" style="--accent:${c.phone || c.phone2 ? 'var(--green)' : 'var(--yellow)'}">☎</div><div class="row-body"><div class="row-title">${esc(c.name)} <span class="inline-status ${isActiveRecord(c,'children')?'active':'inactive'}">${activeLabel(c,'children')}</span></div><div class="meta">${esc(c.parent || "Родитель не указан")}<br>${esc(c.phone || c.phone2 || "Телефон не указан")}${c.phone && c.phone2 ? ` · ${esc(c.phone2)}` : ""}</div></div><div class="contact-action">${c.phone || c.phone2 ? `<a href="tel:${esc(String(c.phone || c.phone2).replace(/[^+\d]/g, ''))}" aria-label="Позвонить">↗</a>` : ""}<button class="btn small secondary" onclick="phoneForm('${esc(c.id)}')">${c.phone || c.phone2 ? "Изменить" : "Добавить"}</button></div></article>`).join("")}</div>` : empty("Контакты появятся вместе с карточками детей")}`;
}

function payments() {
  const closing = closingFor(paymentMonth);
  if (closing) {
    const live = billsWithLivePayments(closing).sort((a,b) => b.remaining - a.remaining);
    const left = live.reduce((sum,bill) => sum + bill.remaining, 0);
    return `${head('გადახდები','დახურული თვე')}<div class="month-switch"><button onclick="shiftPaymentMonth(-1)" aria-label="წინა თვე">‹</button><b>🔒 ${esc(prettyMonth(paymentMonth))}</b><button onclick="shiftPaymentMonth(1)" aria-label="შემდეგი თვე">›</button></div><div class="ok-box" style="margin-bottom:12px">ეს თვე დახურულია ${esc(dateKey(closing.closedAt))}. დარიცხვები დაფიქსირებულია; გადაუხდელი თანხა ვალად ითვლება და მისი გადახდა შეიძლება ახლაც.</div><div class="metrics payment-metrics"><div class="metric" style="--accent:var(--pink)"><span class="label">დარჩენილი ვალი</span><strong>${money(left)}</strong><span class="delta">დახურვისას: ${money(closing.debt)}</span></div><div class="metric" style="--accent:var(--green)"><span class="label">შემოსავალი</span><strong>${money(closing.income)}</strong><span class="delta"><button class="link-btn" onclick="monthReport('${paymentMonth}')">ანგარიში →</button></span></div></div><section class="section"><div class="list">${live.map(bill => `<article class="bill-row card ${bill.remaining ? '' : 'bill-paid'}"><div class="bill-body"><button class="bill-name" onclick="showChild('${esc(bill.childId)}')">${esc(bill.child)}</button><div class="meta">${esc(bill.subject)} · ${bill.price == null ? 'ფასი არ იყო' : money(bill.price)} · გადახდილია ${money(bill.paid)}</div><span class="pay-status ${bill.remaining ? 'due' : 'paid'}">${bill.remaining ? `ვალი ${money(bill.remaining)}` : 'დაფარულია'}</span></div>${bill.remaining ? `<button class="btn small" onclick="payOldDebt('${esc(bill.childId)}','${esc(bill.subjectId || '')}','${paymentMonth}')">გადახდა</button>` : ''}</article>`).join('')}</div></section>`;
  }
  const bills = billingRows(paymentMonth).sort((a,b) => (paymentDayFor(a.child,paymentMonth)||99)-(paymentDayFor(b.child,paymentMonth)||99));
  const actual = [...data.payments].filter(p => monthKey(p.billingMonth || p.date) === paymentMonth).sort((a,b) => String(b.date).localeCompare(String(a.date)));
  const dueTotal = bills.reduce((sum,b) => sum+(b.remaining||0),0);
  const paidCount = bills.filter(b => paidStatus(b.status)).length;
  const cards=bills.map(b=>{
    const complete=paidStatus(b.status);
    const meta=b.subject?circleChargeMeta(b.child,b.subject,b,paymentMonth):`<div class="next-payment">${complete?`შემდეგი: ${nextBillingDate(b,paymentMonth)} · ${money(b.price)}`:`ვადა: ${billingDate(b.child,paymentMonth)} · დარჩა ${money(b.remaining)}`}</div>`;
    return `<article class="bill-row card ${complete?'bill-paid':''}"><button class="bill-day" onclick="paymentDayForm('${esc(b.child.id)}','${paymentMonth}')" aria-label="გადახდის დღის შეცვლა">${paymentDayFor(b.child,paymentMonth)||'?'}${(b.child.paymentDayOverrides||{})[paymentMonth]?'<i>*</i>':''}</button><div class="bill-body"><button class="bill-name" onclick="showChild('${esc(b.child.id)}')">${esc(b.child.name)}</button><div class="meta">${esc(b.subject?.name||'საერთო ტარიფი')} · ${b.price===null?'ფასი ან ტიპი დასაზუსტებელია':money(b.price)}</div><span class="pay-status ${complete?'paid':b.status==='Частично'?'partial':'due'}">${billStatusLabel(b.status)}</span>${meta}</div>${b.remaining>0?`<button class="btn small" onclick="${b.subject?`paymentForSubject('${esc(b.child.id)}','${esc(b.subject.id)}')`:`paymentForm('${esc(b.child.id)}')`}">გადახდა</button>`:''}</article>`;
  }).join('');
  const history=actual.map(p=>`<button class="row clickable transaction-row" onclick="paymentForm('${esc(p.childId)}','${esc(p.id)}')"><div class="pic" style="--accent:var(--green)">₾</div><div class="row-body"><div class="row-title">${esc(p.child||get('children',p.childId)?.name||'ბავშვი')}</div><div class="meta">${esc(p.subjectId?subjectName(p.subjectId):'საერთო გადახდა')} · ${esc(dateKey(p.date)||p.date||'')} · ${esc(paymentMethodLabel(p.method))}</div></div><b class="amount">${money(p.amount)}</b><span>›</span></button>`).join('');
  return `${head('გადახდები','ბავშვებისა და წრეების მიხედვით','<button class="btn icon-btn" onclick="paymentForm()" aria-label="გადახდის დამატება">＋</button>')}<div class="month-switch"><button onclick="shiftPaymentMonth(-1)" aria-label="წინა თვე">‹</button><b>${esc(prettyMonth(paymentMonth))}</b><button onclick="shiftPaymentMonth(1)" aria-label="შემდეგი თვე">›</button></div><div class="metrics payment-metrics"><div class="metric" style="--accent:var(--pink)"><span class="label">დარჩენილი გადასახდელი</span><strong>${money(dueTotal)}</strong><span class="delta">თვიური და ერთჯერადი დარიცხვები</span></div><div class="metric" style="--accent:var(--green)"><span class="label">დახურული დარიცხვა</span><strong>${paidCount} / ${bills.length}</strong><span class="delta">გადახდილი ან დარიცხვის გარეშე</span></div></div>${paymentMonth === todayMonth() ? oldDebtsBlock() : ''}<section class="section"><div class="section-title"><h2>გადახდის გრაფიკი</h2></div>${bills.length?`<div class="list">${cards}</div>`:empty('ფასიანი წრეები ან ტარიფები ჯერ არ არის')}</section><section class="section"><div class="section-title"><h2>თვის მიღებული გადახდები</h2></div>${actual.length?`<div class="list">${history}</div>`:empty('ამ თვეში გადახდები ჯერ არ არის')}</section>`;
}
function shiftPaymentMonth(count) { paymentMonth = shiftMonth(paymentMonth, count); go(current); }

const leadStages = [["new", "Новая"], ["contact", "Связались"], ["trial", "Пробное"], ["came", "Пришли"], ["client", "Клиент"], ["reject", "Отказ"]];
function leads() {
  const allRows=data.leads, rows=filteredByParticipantStatus('leads',allRows);
  return `${head("Заявки", `${allRows.length} записей`, '<button class="btn icon-btn" onclick="leadForm()" aria-label="Добавить заявку">＋</button>')}${participantStatusTabs('leads',allRows)}${rows.length ? `<div class="pipeline">${leadStages.map(([id, title]) => `<section class="stage"><h3>${title}<span>${rows.filter(l => l.stage === id).length}</span></h3>${rows.filter(l => l.stage === id).map(l => `<div class="lead ${isActiveRecord(l,'leads')?'':'record-inactive'}"><div class="lead-status-line"><strong>${esc(l.name)}</strong><button class="record-switch ${isActiveRecord(l,'leads')?'on':'off'}" onclick="toggleRecordActive('leads','${esc(l.id)}')" aria-label="სტატუსის შეცვლა"><i></i><span>${activeLabel(l,'leads')}</span></button></div><div class="meta">${esc(l.phone || 'Телефон не указан')}<br>${esc(l.source || 'Источник не указан')}</div><select aria-label="Этап заявки" onchange="moveLead('${esc(l.id)}',this.value)">${leadStages.map(([value, label]) => `<option value="${value}" ${value === l.stage ? 'selected' : ''}>${label}</option>`).join('')}</select><button class="btn small secondary" style="margin-top:8px" onclick="leadForm('${esc(l.id)}')">Открыть</button></div>`).join('')}</section>`).join('')}</div>` : empty(participantStatusFilter==='all'?"Заявок пока нет":'ამ სტატუსით განაცხადები არ მოიძებნა', button("Добавить заявку", "leadForm()"))}`;
}

function listSection(kind, title, subtitle, display) {
  const rows = data[kind] || [];
  return `${head(title, `${subtitle} · ${rows.length}`, `<button class="btn icon-btn" onclick="editSimple('${kind}')" aria-label="Добавить">＋</button>`)}${rows.length ? `<div class="list">${rows.map(item => `<article class="row clickable" onclick="editSimple('${kind}','${esc(item.id)}')"><div class="pic" style="--accent:var(--green)">${esc((item.name || item.title || '?').slice(0, 1))}</div><div class="row-body"><div class="row-title">${esc(item.name || item.title || 'Запись')}</div><div class="meta">${esc(display(item))}</div></div><span>›</span></article>`).join('')}</div>` : empty("Пока нет записей", button("Добавить", `editSimple('${kind}')`))}`;
}

function setSectionTab(tab) { sectionTab = tab; go('clubs'); }
function eventForm(id) {
  const old = id ? get('clubs', id) : null;
  openForm(old ? 'მასტერკლასი' : 'ახალი მასტერკლასი', [
    {name:'name',label:'დასახელება',required:true},{name:'date',label:'თარიღი',type:'date',required:true},{name:'time',label:'დრო',type:'time'},
    {name:'hostName',label:'წამყვანი (სახელი)'},{name:'hostPhone',label:'წამყვანის ტელეფონი',type:'tel'},
    {name:'coursePrice',label:'ფასი ერთ ბავშვზე, ₾',type:'number',required:true},{name:'hostFee',label:'წამყვანს ერთ ბავშვზე, ₾',type:'number',required:true},
    {name:'comment',label:'კომენტარი',type:'textarea'},
  ], async values => {
    values.coursePrice = number(values.coursePrice); values.hostFee = number(values.hostFee);
    if (values.hostFee > values.coursePrice) throw new Error('წამყვანის წილი ფასზე მეტია');
    Object.assign(values, { billingType: 'event', section: 'events', appointmentOnly: true, weekdays: [], timeSlots: values.time ? [values.time] : [], schedule: `${values.date}${values.time ? ` · ${values.time}` : ''}` });
    const saved = old ? await dataAdapter.update('clubs', id, values) : await dataAdapter.create('clubs', values);
    sectionTab = 'events'; go(current === 'dashboard' ? 'dashboard' : 'clubs'); toast('მასტერკლასი შენახულია');
    if (!old) setTimeout(() => eventParticipantForm(saved.id), 150);
  }, old ? { ...old, date: dateKey(old.date) } : { date: today(), coursePrice: 55, hostFee: 35 });
  if (old) $('modalForm').querySelector('.form-actions')?.insertAdjacentHTML('afterbegin', `<button class="btn danger" type="button" onclick="deleteEvent('${esc(old.id)}')">წაშლა</button>`);
}
async function deleteEvent(id) {
  const event = get('clubs', id); if (!event) return;
  const people = eventParticipants(event), paid = data.payments.filter(item => item.subjectId === id).length;
  if (paid) return toast(`მასტერკლასს აქვს ${paid} გადახდა — ჯერ წაშალეთ გადახდები ან დატოვეთ ისტორიისთვის`);
  if (!confirm(`წავშალოთ „${event.name}“?${people.length ? ` ${people.length} ბავშვი მოიხსნება.` : ''}`)) return;
  for (const child of people) await dataAdapter.update('children', child.id, { activityIds: toList(child.activityIds).filter(item => item !== id) });
  for (const item of data.attendance.filter(a => a.subjectId === id)) await dataAdapter.remove('attendance', item.id);
  await dataAdapter.remove('clubs', id); closeModal(); go('clubs'); toast('წაიშალა');
}
function eventParticipantForm(eventId) {
  const event = get('clubs', eventId); if (!event) return;
  const inEvent = new Set(eventParticipants(event).map(child => child.id));
  openForm(`${event.name} · ბავშვის დამატება`, [
    {name:'childId',label:'ბავშვი',type:'select',options:[['','— ახალი ბავშვი (ბაზაში არ არის) —'],...data.children.filter(child => !inEvent.has(child.id) && isActiveRecord(child,'children')).map(child => [child.id, child.name])]},
    {name:'newName',label:'ახალი ბავშვის სახელი'},{name:'newPhone',label:'მშობლის ტელეფონი (არასავალდებულო)',type:'tel'},
    {name:'payState',label:'გადახდა',type:'choice',options:[['full',`გადაიხადა სრულად · ${money(event.coursePrice)}`],['partial','გადაიხადა ნაწილობრივ'],['none','ჯერ არ გადაუხდია (ვალი)']]},
    {name:'amount',label:'გადახდილი თანხა, ₾',type:'number'},
    {name:'method',label:'გადახდის მეთოდი',type:'select',options:[['cash','ნაღდი'],['transfer','გადარიცხვა'],['card','ბარათი'],['other','სხვა']]},
  ], async values => {
    const date = dateKey(event.date) || today();
    let child = get('children', values.childId);
    if (!child) {
      if (!String(values.newName || '').trim()) throw new Error('აირჩიეთ ბავშვი ან ჩაწერეთ ახალი ბავშვის სახელი');
      child = await dataAdapter.create('children', { name: values.newName.trim(), phone: values.newPhone || '', active: true, status: 'Активен', guest: true, source: `მასტერკლასი · ${event.name}`, activityIds: [], discount: 0, tariff: null });
      try { await ensureParentFor(get('children', child.id)); } catch (_) {}
      child = get('children', child.id);
    }
    const amount = values.payState === 'full' ? number(event.coursePrice) : values.payState === 'partial' ? number(values.amount) : 0;
    if (values.payState === 'partial' && (amount <= 0 || amount >= number(event.coursePrice))) throw new Error(`ნაწილობრივი თანხა უნდა იყოს 0-სა და ${money(event.coursePrice)}-ს შორის`);
    if (amount) assertOpen(date, 'გადახდა');
    await dataAdapter.update('children', child.id, { activityIds: [...new Set([...toList(child.activityIds), event.id])] });
    if (!data.attendance.some(a => a.childId === child.id && a.subjectId === event.id)) await dataAdapter.create('attendance', { childId: child.id, name: child.name, subjectId: event.id, date, status: 'present' });
    if (amount) await dataAdapter.create('payments', { childId: child.id, child: child.name, subjectId: event.id, amount, date: today(), billingMonth: monthKey(date), method: values.method, comment: event.name });
    go(current); toast(`${child.name} დაემატა${amount ? ` · ${money(amount)}` : ' · ვალი'}`);
  }, { payState: 'full', method: 'cash' });
  const sync = () => { const isNew = !$('field-childId').value, partial = $('modalForm').querySelector('input[name=payState]:checked')?.value === 'partial', none = $('modalForm').querySelector('input[name=payState]:checked')?.value === 'none';
    ['newName','newPhone'].forEach(name => { const node = $(`field-${name}`)?.closest('.field'); if (node) node.hidden = !isNew; });
    const amountNode = $('field-amount')?.closest('.field'); if (amountNode) amountNode.hidden = !partial;
    const methodNode = $('field-method')?.closest('.field'); if (methodNode) methodNode.hidden = none; };
  $('field-childId')?.addEventListener('change', sync); $('modalForm').querySelectorAll('input[name=payState]').forEach(input => input.addEventListener('change', sync)); sync();
}
async function removeEventParticipant(eventId, childId) {
  const event = get('clubs', eventId), child = get('children', childId); if (!event || !child) return;
  const paid = data.payments.filter(item => item.subjectId === eventId && item.childId === childId).reduce((sum, item) => sum + number(item.amount), 0);
  if (!confirm(`მოვხსნათ ${child.name} მასტერკლასიდან?${paid ? ` გადახდა (${money(paid)}) ისტორიაში დარჩება.` : ''}`)) return;
  await dataAdapter.update('children', childId, { activityIds: toList(child.activityIds).filter(item => item !== eventId) });
  for (const item of data.attendance.filter(a => a.subjectId === eventId && a.childId === childId)) await dataAdapter.remove('attendance', item.id);
  go(current); toast('მოხსნილია');
}
function payEventHost(eventId) {
  const event = get('clubs', eventId); if (!event) return;
  const due = Math.max(0, eventHostAccrued(event) - eventHostPaid(event));
  editSimple('expenses', null, { title: `მასტერკლასი · ${event.name} · ${event.hostName || 'წამყვანი'}`, category: 'მასტერკლასის წამყვანი', amount: due || '', date: today(), eventId });
}
function eventsTab() {
  const list = data.clubs.filter(isEvent).sort((a, b) => String(dateKey(b.date)).localeCompare(String(dateKey(a.date))));
  return list.length ? `<div class="list cards-grid">${list.map(event => {
    const people = eventParticipants(event), price = number(event.coursePrice), fee = eventHostFee(event);
    const rows = people.map(child => { const bill = subjectBill(child, event); return { child, bill }; });
    const collected = data.payments.filter(item => item.subjectId === event.id).reduce((sum, item) => sum + number(item.amount), 0);
    const owed = rows.reduce((sum, row) => sum + number(row.bill.remaining), 0), hostDue = eventHostAccrued(event), hostPaid = eventHostPaid(event);
    return `<article class="card event-card"><div class="activity-card-head"><div class="pic" style="--accent:var(--yellow)">✦</div><div><h2>${esc(event.name)}</h2><p class="meta">${esc(dateKey(event.date) || '')}${event.time ? ` · ${esc(event.time)}` : ''}${event.hostName ? ` · წამყვანი: ${esc(event.hostName)}` : ''}${event.hostPhone ? ` · ${telLink(event.hostPhone)}` : ''}</p></div><button class="btn small secondary" onclick="eventForm('${esc(event.id)}')">შეცვლა</button></div>
    <p class="meta">${money(price)} ბავშვზე · წამყვანს ${money(fee)} · ცენტრს ${money(price - fee)}</p>
    <div class="profile-details"><div><small>ბავშვები</small><b>${people.length}</b></div><div><small>მიღებული</small><b>${money(collected)}</b></div><div><small>წამყვანს</small><b>${money(hostDue)}</b></div><div><small>ცენტრს რჩება</small><b>${money(collected - hostDue)}</b></div></div>
    ${owed > 0 ? `<p class="meta danger-text">გადაუხდელი: ${money(owed)}</p>` : ''}
    <div class="event-people">${rows.map(({ child, bill }) => `<div class="event-person ${number(bill.remaining) > 0 ? 'due' : 'paid'}"><button class="link-btn" onclick="showChild('${esc(child.id)}')">${esc(child.name)}</button><span>${number(bill.remaining) > 0 ? `ვალი ${money(bill.remaining)}` : '✓ გადახდილია'}</span>${number(bill.remaining) > 0 ? `<button class="btn small" onclick="paymentForSubject('${esc(child.id)}','${esc(event.id)}')">გადახდა</button>` : ''}<button class="btn small secondary" onclick="removeEventParticipant('${esc(event.id)}','${esc(child.id)}')" aria-label="მოხსნა">✕</button></div>`).join('') || '<p class="meta">ბავშვები ჯერ არ არის</p>'}</div>
    <div class="card-actions"><button class="btn small" onclick="eventParticipantForm('${esc(event.id)}')">＋ ბავშვი</button>${hostDue - hostPaid > 0 ? `<button class="btn small secondary" onclick="payEventHost('${esc(event.id)}')">წამყვანს გადახდა · ${money(hostDue - hostPaid)}</button>` : hostDue > 0 ? '<span class="pay-status paid">წამყვანს გადახდილია</span>' : ''}</div></article>`; }).join('')}</div>` : empty('მასტერკლასები ჯერ არ არის', button('მასტერკლასის დამატება', 'eventForm()'));
}
function sectionSummaryHtml(section) {
  const month = todayMonth(), range = monthRange(month), totals = sectionTotals(range, 1)[section];
  return `<div class="metrics payment-metrics section-sum"><div class="metric" style="--accent:var(--green)"><span class="label">${esc(prettyMonth(month))} · მიღებული</span><strong>${money(totals.income)}</strong></div><div class="metric" style="--accent:var(--yellow)"><span class="label">${section==='events'?'წამყვანებს':'მასწავლებლებს'}</span><strong>${money(totals.teachers)}</strong><span class="delta">${section==='garden'?'ფიქსირებული ხელფასები':section==='circles'?'% მიღებული თანხიდან':section==='events'?'წამყვანების წილი':'ხელით დაყენებული'}</span></div><div class="metric" style="--accent:var(--blue)"><span class="label">ცენტრს რჩება</span><strong>${money(totals.income-totals.teachers)}</strong></div></div>`;
}
function activities() {
  const tariffText=a=>isCourseCircle(a)?`<b>${a.coursePrice==null&&a.tariff==null?'კურსის ფასი ?':money(a.coursePrice??a.tariff)} / კურსი</b>`:isCraftCircle(a)?`<b>ბაღის ბავშვი: ${money(a.kindergartenRate??30)} · გარე ბავშვი: ${money(a.externalRate??40)} / გაკვეთილი</b>`:isFlexibleCircle(a)?`<b>თვეში: ${monthlyTariffs(a).length?monthlyTariffs(a).map(n=>money(n)).join(' / '):'ფასი ?'} · ერთჯერადად: ${a.lessonRate==null?'ფასი ?':money(a.lessonRate)}</b>`:isPerLessonCircle(a)?`<b>${a.lessonRate==null?'ფასი მითითებული არ არის':money(a.lessonRate)} / დასწრებული გაკვეთილი</b>`:a.tariff===null||a.tariff===undefined||a.tariff===''?'<span class="badge warn">ფასი მითითებული არ არის</span>':`<b>${money(a.tariff)} / თვე</b>`;
  if (sectionTab === 'events') return `${head('წრეები',`${data.clubs.length} სიაში`,'<button class="btn icon-btn" onclick="eventForm()" aria-label="მასტერკლასის დამატება">＋</button>')}<div class="status-tabs section-tabs" role="tablist">${SECTIONS.map(([key,label])=>`<button class="${sectionTab===key?'active':''}" onclick="setSectionTab('${key}')">${label} <b>${data.clubs.filter(c=>circleSection(c)===key).length}</b></button>`).join('')}</div>${sectionSummaryHtml('events')}<p class="section-note">მასტერკლასი — ერთჯერადი ღონისძიება: ბავშვი იხდის ფასს, წამყვანი იღებს თანხას თითო ბავშვზე, დანარჩენი რჩება ცენტრს.</p>${eventsTab()}`;
  const shown = data.clubs.filter(circle => circleSection(circle) === sectionTab);
  const note = sectionTab==='garden'?'ბაღის მასწავლებლები იღებენ ფიქსირებულ თვიურ ხელფასს — თანხა მიეთითება მასწავლებლის ბარათში.':sectionTab==='circles'?'წრის მასწავლებელი იღებს მიღებული თანხის პროცენტს (ნაგულისხმევად 50%). პროცენტი იცვლება წრეში ან მასწავლებლის ბარათში.':'სპეციალისტის ანაზღაურება ყოველ მომსახურებაზე ხელით ისაზღვრება: თანხა ბავშვზე, გაკვეთილზე, თვეში ან %.';
  return `${head('წრეები',`${data.clubs.length} სიაში`,'<button class="btn icon-btn" onclick="editSimple(\'clubs\')" aria-label="დამატება">＋</button>')}${serverOutdatedNote()}<div class="status-tabs section-tabs" role="tablist">${SECTIONS.map(([key,label])=>`<button class="${sectionTab===key?'active':''}" onclick="setSectionTab('${key}')">${label} <b>${data.clubs.filter(c=>circleSection(c)===key).length}</b></button>`).join('')}</div>${sectionSummaryHtml(sectionTab)}<p class="section-note">${note}</p>${shown.length?`<div class="list cards-grid">${shown.map(a=>{const allMembers=data.children.filter(c=>toList(c.activityIds).includes(a.id)),members=activePeople('children',allMembers);const month=todayMonth(),bills=members.map(child=>subjectBill(child,a,month)),expected=bills.reduce((sum,bill)=>sum+number(bill.price),0),paidIn=data.payments.filter(item=>item.subjectId===a.id&&monthKey(item.billingMonth||item.date)===month).reduce((sum,item)=>sum+number(item.amount),0),teacherPay=circleTeacherCost(a,monthRange(month),1);return `<article class="activity-card card"><div class="activity-card-head"><div class="pic" style="--accent:var(--green)">✦</div><div><h2>${esc(a.name)}</h2><p class="meta">${esc(teacherName(a))} · ${esc(circleScheduleLabel(a))}${a.audience?` · ${esc(a.audience)}`:''}</p></div><button class="btn small secondary" onclick="editSimple('clubs','${esc(a.id)}')">შეცვლა</button></div><div class="subject-price">${tariffText(a)}<p class="meta">${esc(teacherRuleLabel(a))}</p></div><div class="profile-details" style="margin-top:10px"><div><small>${esc(prettyMonth(month))} · დარიცხული</small><b>${money(expected)}</b></div><div><small>მიღებული</small><b>${money(paidIn)}</b></div>${circleSection(a)==='garden'?'':`<div><small>მასწავლებლებს</small><b>${money(teacherPay)}</b></div><div><small>ცენტრს რჩება</small><b>${money(paidIn-teacherPay)}</b></div>`}</div><button class="btn small secondary" style="margin-top:10px" onclick="circleMembersForm('${esc(a.id)}')">＋ ბავშვების ჩაწერა / მოხსნა</button><div class="activity-members"><b>${members.length} აქტიური${allMembers.length!==members.length?` · ${allMembers.length-members.length} არააქტიური`:''}</b>${members.length?members.map(c=>`<button onclick="showChild('${esc(c.id)}')">${esc(c.name)}</button>`).join(''):'<span class="meta">აქტიური ბავშვები არ არიან</span>'}</div></article>`}).join('')}</div>`:empty('ამ განყოფილებაში ჯერ არაფერია',button('დამატება',"editSimple('clubs')"))}`;
}

function circleMembersForm(subjectId) {
  const circle=get('clubs',subjectId); if (!circle) return;
  const pool=data.children.filter(child=>isActiveRecord(child,'children')||toList(child.activityIds).includes(subjectId));
  openForm(`${circle.name} · ბავშვები`,[{name:'members',label:'მონიშნეთ, ვინ დადის ამ წრეზე',type:'multi',options:pool.map(child=>[child.id,`${child.name||'უსახელო'}${isActiveRecord(child,'children')?'':' · არააქტიური'}`])}],async values=>{
    const chosen=new Set(values.members||[]); let changed=0;
    for (const child of pool) {
      const ids=new Set(toList(child.activityIds)), has=ids.has(subjectId), want=chosen.has(child.id);
      if (has===want) continue;
      want?ids.add(subjectId):ids.delete(subjectId);
      await dataAdapter.update('children',child.id,want?{activityIds:[...ids],activityStart:withStart(child,[subjectId])}:{activityIds:[...ids]}); changed++;
    }
    go('clubs'); toast(`შენახულია · ცვლილება: ${changed}`);
  },{members:pool.filter(child=>toList(child.activityIds).includes(subjectId)).map(child=>child.id)});
}
const weekLabel = range => `${range.from.slice(8)}.${range.from.slice(5,7)}–${range.to.slice(8)}.${range.to.slice(5,7)}`;
function paySalary(personId, scope = 'month') {
  const person=get('staff',personId); if (!person) return;
  const range=scope==='week'?weekRange():monthRange(todayMonth()), months=scope==='week'?0:1;
  const row=payroll(range,months).rows.find(item=>item.person.id===personId)||{due:0,accrued:0};
  editSimple('expenses',null,{title:`ხელფასი · ${person.name} · ${scope==='week'?`კვირა ${weekLabel(range)}`:prettyMonth(todayMonth())}`,category:'ხელფასები',amount:row.due||row.accrued||person.monthlySalary||'',date:today(),staffId:person.id});
}
const DAY_NAMES = {1:'ორშ',2:'სამ',3:'ოთხ',4:'ხუთ',5:'პარ',6:'შაბ',0:'კვ'};
function teacherWeekHtml(person) {
  const circles = teacherCircles(person.id);
  const rows = [1,2,3,4,5,6,0].map(wd => {
    const items = circles.filter(subject => toList(subject.weekdays).map(Number).includes(wd)).map(subject => `${toList(subject.timeSlots).join(' / ') || '—'} ${subject.name}`);
    if (toList(person.workDays).map(Number).includes(wd) && circles.some(isAppointmentCircle)) items.push('წინასწარი ჩაწერით');
    return items.length ? `<div><b>${DAY_NAMES[wd]}</b><span>${items.map(esc).join('<br>')}</span></div>` : '';
  }).join('');
  const appointment = circles.filter(subject => isAppointmentCircle(subject) && !toList(subject.weekdays).length);
  return rows || appointment.length ? `<div class="teacher-week">${rows}${appointment.length && !toList(person.workDays).length ? `<div><b>ჩაწერით</b><span>${appointment.map(subject => esc(subject.name)).join('<br>')}</span></div>` : ''}</div>` : '<p class="meta">განრიგი არ არის მითითებული</p>';
}
function setStaffTab(tab) { staffTab=tab; go('staff'); }
function teachers() {
  const month=todayMonth(), pay=payroll(monthRange(month),1), payOf=id=>pay.rows.find(row=>row.person.id===id)||{accrued:0,paid:0,due:0};
  const weekPay=payroll(weekRange(),0), weekOf=id=>weekPay.rows.find(row=>row.person.id===id)||{accrued:0,paid:0,due:0};
  const teacherRows=teacherStaff(), personnelRows=personnelStaff();
  const pool=staffTab==='personnel'?personnelRows:teacherRows, rows=filteredByParticipantStatus('staff',pool);
  const mode = person => person.payType === 'fixed' ? `ფიქსირებული: ${money(person.monthlySalary)} / თვე` : person.payType === 'percent' ? `პროცენტი: ${number(person.revenueShare)}%` : 'წრის წესით';
  const salaryLine = person => { const weekly=person.payoutPeriod==='week', row=weekly?weekOf(person.id):payOf(person.id), label=weekly?`კვირა ${weekLabel(weekRange())}`:prettyMonth(month); return `<div class="profile-details" style="margin-top:8px"><div><small>${esc(label)} · დარიცხული</small><b>${money(row.accrued)}</b></div><div><small>გაცემული</small><b>${money(row.paid)}</b></div>${weekly?`<div><small>${esc(prettyMonth(month))} · სულ</small><b>${money(payOf(person.id).accrued)}</b></div>`:''}</div><div class="card-actions">${row.due>0&&isActiveRecord(person,'staff')?`<button class="btn small" onclick="paySalary('${esc(person.id)}','${weekly?'week':'month'}')">${weekly?'კვირის':'ხელფასის'} გაცემა · ${money(row.due)}</button>`:`<span class="pay-status paid">${row.accrued>0?'გაცემულია':'დარიცხვა არ არის'}</span>`}<button class="btn small secondary" onclick="editSimple('staff','${esc(person.id)}')">შეცვლა</button></div>`; };
  const teacherCard = person => { const subjects=teacherCircles(person.id), calc=teacherFinance(person,monthRange(month),1), lines=teacherAccrualBreakdown(person,monthRange(month),1); return `<article class="teacher-card card ${isActiveRecord(person,'staff')?'':'record-inactive'}"><div class="teacher-top"><div class="pic" style="--accent:var(--pink)">${esc((person.name||'?').slice(0,1))}</div><div><h2>${esc(person.name)}</h2><p class="meta">${esc(person.role||'მასწავლებელი')}${person.phone?` · <a href="tel:${esc(String(person.phone).replace(/[^+\d]/g,''))}">${esc(person.phone)}</a>`:''}</p></div><button class="record-switch ${isActiveRecord(person,'staff')?'on':'off'}" onclick="toggleRecordActive('staff','${esc(person.id)}')" aria-label="სტატუსის შეცვლა"><i></i><span>${activeLabel(person,'staff')}</span></button></div><div class="profile-details" style="margin-top:12px"><div><small>აქტიური მოსწავლეები</small><b>${new Set(subjects.flatMap(a=>activePeople('children').filter(c=>toList(c.activityIds).includes(a.id)).map(c=>c.id))).size}</b></div><div><small>გაკვეთილები ამ თვეში</small><b>${calc.lessons}</b></div></div><h3 class="history-title">ანაზღაურება · ${esc(prettyMonth(month))}</h3>${lines.length?`<div class="pay-lines">${lines.map(line=>`<button onclick="editSimple('staff','${esc(person.id)}')"><span><small class="sec-tag sec-${line.section}">${esc(sectionLabel(line.section))}</small><b>${line.subject?esc(line.subject.name):line.subjects.map(x=>esc(x.name)).join(', ')}</b><small>${esc(line.label)}</small></span><strong>${money(line.amount)}</strong></button>`).join('')}<div class="pay-total"><span>სულ</span><strong>${money(lines.reduce((sum,line)=>sum+line.amount,0))}</strong></div></div>`:'<p class="meta">წრეები ჯერ არ არის მონიშნული — დააჭირეთ „შეცვლა“.</p>'}<h3 class="history-title">კვირის განრიგი</h3>${teacherWeekHtml(person)}${salaryLine(person)}</article>`; };
  const personnelCard = person => `<article class="teacher-card card ${isActiveRecord(person,'staff')?'':'record-inactive'}"><div class="teacher-top"><div class="pic" style="--accent:var(--yellow)">${esc((person.name||'?').slice(0,1))}</div><div><h2>${esc(person.name)}</h2><p class="meta">${esc(person.role||'პერსონალი')}${person.phone?` · <a href="tel:${esc(String(person.phone).replace(/[^+\d]/g,''))}">${esc(person.phone)}</a>`:''}</p></div><button class="record-switch ${isActiveRecord(person,'staff')?'on':'off'}" onclick="toggleRecordActive('staff','${esc(person.id)}')" aria-label="სტატუსის შეცვლა"><i></i><span>${activeLabel(person,'staff')}</span></button></div><div class="profile-details" style="margin-top:12px"><div><small>ხელფასი</small><b>${number(person.monthlySalary)?`${money(person.monthlySalary)} / თვე`:'მითითებული არ არის'}</b></div><div><small>ხარჯის კატეგორია</small><b>ხელფასები</b></div></div>${salaryLine(person)}</article>`;
  return `${head('თანამშრომლები', `${teacherRows.length} მასწავლებელი · ${personnelRows.length} პერსონალი`, '<button class="btn icon-btn" onclick="editSimple(\'staff\')" aria-label="თანამშრომლის დამატება">＋</button>')}${serverOutdatedNote()}<div class="status-tabs" role="tablist" style="margin-bottom:10px"><button class="${staffTab==='teachers'?'active':''}" onclick="setStaffTab('teachers')">მასწავლებლები <b>${teacherRows.length}</b></button><button class="${staffTab==='personnel'?'active':''}" onclick="setStaffTab('personnel')">პერსონალი <b>${personnelRows.length}</b></button></div><p class="section-note">${staffTab==='personnel'?'ბუღალტერი, დამლაგებელი და სხვა პერსონალი: ფიქსირებული ხელფასი, რომელიც „ხელფასების“ ხარჯად ჩაიწერება.':'ბაღი — ფიქსირებული ხელფასი თვეში; წრეები — მიღებული თანხის % (ნაგულისხმევად 50%); სპეციალისტები — ხელით. ყველაფერი იცვლება „შეცვლა“-ში.'}</p>${participantStatusTabs('staff',pool)}${rows.length?`<div class="list cards-grid">${rows.map(staffTab==='personnel'?personnelCard:teacherCard).join('')}</div>`:empty(staffTab==='personnel'?'პერსონალი ჯერ არ არის':'მასწავლებლები ჯერ არ არის',button('დამატება',"editSimple('staff')"))}`;
}

function shiftCalendarMonth(count) { calendarMonth = shiftMonth(calendarMonth,count); calendarSelected = `${calendarMonth}-01`; go('schedule'); }
function selectCalendarDay(date) { calendarSelected = date; go('schedule'); }
function recurringCircleEvents(date) {
  const weekday=new Date(`${date}T12:00:00`).getDay();
  return data.clubs.filter(circle=>toList(circle.weekdays).map(Number).includes(weekday)).flatMap(circle=>{
    const slots=toList(circle.timeSlots).length?toList(circle.timeSlots):[''];
    return slots.map((time,index)=>({id:`repeat-${circle.id}-${date}-${index}`,subjectId:circle.id,name:circle.name,date,time,status:'recurring',group:circle.audience||'',generated:true}));
  });
}
function calendarEventsForDate(date) {
  const masterClasses=data.clubs.filter(club=>isEvent(club)&&dateKey(club.date)===date).map(club=>({id:`event-${club.id}`,subjectId:club.id,name:club.name,date,time:club.time||'',status:'event',group:`მასტერკლასი · ${eventParticipants(club).length} ბავშვი`,generated:true,isEvent:true}));
  const manual=[...data.schedule.filter(item=>dateKey(item.date)===date),...masterClasses];
  const manualKeys=new Set(manual.map(item=>`${item.subjectId||''}|${item.time||''}`));
  return [...manual,...recurringCircleEvents(date).filter(item=>!manualKeys.has(`${item.subjectId}|${item.time}`))].sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
}
function attendanceForCircle(subjectId,date) { groupAttendanceForm(subjectId,date); }
function groupAttendanceForm(subjectId='',date=today()) {
  if (!data.clubs.length) return toast('ჯერ დაამატეთ წრე');
  subjectId = subjectId || data.clubs[0].id;
  const render = () => {
    const subject=get('clubs',subjectId), members=activePeople('children').filter(child=>toList(child.activityIds).includes(subjectId));
    const marked=new Map(data.attendance.filter(item=>item.subjectId===subjectId&&dateKey(item.date)===date).map(item=>[item.childId,item]));
    $("modalTitle").textContent='ჯგუფის დასწრება';
    const form=$("modalForm");
    form.innerHTML=`<div class="field"><label for="ga-subject">წრე</label><select id="ga-subject">${data.clubs.map(circle=>`<option value="${esc(circle.id)}" ${circle.id===subjectId?'selected':''}>${esc(circle.name)}</option>`).join('')}</select></div><div class="field"><label for="ga-date">თარიღი</label><input id="ga-date" type="date" value="${esc(date)}" required></div><p class="meta">${esc(teacherName(subject||{}))} · ${members.length} აქტიური ბავშვი. მონიშნეთ, ვინ დაესწრო.</p>${members.length?`<div class="form-options">${members.map(child=>`<label class="form-option"><input type="checkbox" name="present" value="${esc(child.id)}" ${wasPresent(marked.get(child.id)||{})?'checked':''}><span>${esc(child.name)}</span></label>`).join('')}</div>`:'<p class="meta">ამ წრეში აქტიური ბავშვები არ არიან.</p>'}<div class="form-actions"><button class="btn secondary" type="button" onclick="closeModal()">გაუქმება</button><button class="btn" type="submit" ${members.length?'':'disabled'}>შენახვა</button></div>`;
    $('ga-subject').onchange=event=>{subjectId=event.target.value;render();};
    $('ga-date').onchange=event=>{date=event.target.value||date;render();};
    form.onsubmit=async event=>{
      event.preventDefault();
      const submitButton=form.querySelector('button[type="submit"]'); submitButton.disabled=true;
      const present=new Set(new FormData(form).getAll('present'));
      try {
        assertOpen(date,'დასწრება');
        let changed=0;
        for (const child of members) {
          const existing=marked.get(child.id), want=present.has(child.id);
          if (want&&!existing) { await dataAdapter.create('attendance',{childId:child.id,name:child.name,subjectId,date,status:'present'}); changed++; }
          else if (existing&&wasPresent(existing)!==want) { await dataAdapter.update('attendance',existing.id,{status:want?'present':'absent'}); changed++; }
        }
        closeModal(); go(current); toast(`დასწრება შენახულია · ${present.size} / ${members.length}`);
      } catch (error) { toast(error.message||'შენახვა ვერ მოხერხდა'); submitButton.disabled=false; }
    };
  };
  render();
  $("modal").classList.remove('hidden');
}
function attendanceView() {
  const rows=[...data.attendance].sort((a,b)=>dateKey(b.date).localeCompare(dateKey(a.date)));
  const monthRows=rows.filter(item=>monthKey(item.date)===todayMonth());
  const present=monthRows.filter(wasPresent).length;
  return `${head('დასწრება',`${rows.length} მონიშვნა`,'<button class="btn small" onclick="groupAttendanceForm()">＋ ჯგუფის დასწრება</button>')}<div class="metrics payment-metrics"><div class="metric" style="--accent:var(--green)"><span class="label">ამ თვეში დაესწრო</span><strong>${present}</strong><span class="delta">სულ მონიშვნა: ${monthRows.length}</span></div><div class="metric" style="--accent:var(--blue)"><span class="label">დასწრების %</span><strong>${monthRows.length?Math.round(present/monthRows.length*100)+'%':'—'}</strong><span class="delta">მიმდინარე თვე</span></div></div><input class="search" placeholder="ბავშვის ან წრის ძებნა" aria-label="დასწრების ძებნა" oninput="filterRows(this.value)">${rows.length?`<div class="list" id="rows">${rows.map(item=>{const name=get('children',item.childId)?.name||item.name||'ბავშვი';return `<article class="row clickable" data-search="${esc([name,subjectName(item.subjectId),item.date].join(' '))}" onclick="editSimple('attendance','${esc(item.id)}')"><div class="pic" style="--accent:${wasPresent(item)?'var(--green)':'var(--red)'}">${wasPresent(item)?'✓':'✕'}</div><div class="row-body"><div class="row-title">${esc(name)}</div><div class="meta">${esc(subjectName(item.subjectId))} · ${esc(dateKey(item.date)||'თარიღი არ არის')}</div></div><span class="badge ${wasPresent(item)?'':'warn'}">${esc(attendanceStatusLabel(item.status))}</span></article>`}).join('')}</div>`:empty('დასწრების მონიშვნები ჯერ არ არის',button('ჯგუფის დასწრება','groupAttendanceForm()'))}`;
}
function calendar() {
  const [year, month] = calendarMonth.split('-').map(Number);
  const first = (new Date(year,month-1,1).getDay()+6)%7;
  const days = new Date(year,month,0).getDate();
  const selectedEvents = calendarEventsForDate(calendarSelected);
  const dueChildren = activePeople('children').filter(c => paymentDayFor(c,calendarMonth) && billingDate(c,calendarMonth) === calendarSelected && (enrolledSubjects(c).length || c.tariff != null && c.tariff !== ''));
  const dueCards = dueChildren.map(child=>{const rows=billingRows(calendarMonth).filter(row=>row.child.id===child.id);return {child,complete:rows.length>0&&rows.every(row=>paidStatus(row.status)),noAccrual:rows.length>0&&rows.every(row=>noAccrualStatus(row.status)),remaining:rows.reduce((sum,row)=>sum+number(row.remaining),0)}});
  return `${head('კალენდარი', 'გაკვეთილები და გადახდის დღეები', '<button class="btn icon-btn" onclick="scheduleForm()" aria-label="გაკვეთილის დამატება კალენდარში">＋</button>')}<section class="calendar-card card"><div class="month-switch"><button onclick="shiftCalendarMonth(-1)" aria-label="წინა თვე">‹</button><b>${esc(prettyMonth(calendarMonth))}</b><button onclick="shiftCalendarMonth(1)" aria-label="შემდეგი თვე">›</button></div><div class="calendar-grid weekdays">${['ორშ','სამ','ოთხ','ხუთ','პარ','შაბ','კვ'].map(x=>`<span>${x}</span>`).join('')}</div><div class="calendar-grid">${Array.from({length:first},()=>'<span></span>').join('')}${Array.from({length:days},(_,i)=>{const date=`${calendarMonth}-${String(i+1).padStart(2,'0')}`;const events=calendarEventsForDate(date).length;const dues=activePeople('children').filter(c=>paymentDayFor(c,calendarMonth)&&billingDate(c,calendarMonth)===date).length;return `<button class="calendar-day ${date===calendarSelected?'selected':''} ${date===today()?'is-today':''}" onclick="selectCalendarDay('${date}')"><b>${i+1}</b><span class="calendar-dots">${events?'<i class="event-dot"></i>':''}${dues?'<i class="due-dot"></i>':''}</span></button>`}).join('')}</div><div class="calendar-legend"><span><i class="event-dot"></i> გაკვეთილები</span><span><i class="due-dot"></i> გადახდის დღეები</span></div></section><section class="section"><div class="section-title"><h2>${esc(new Date(`${calendarSelected}T12:00:00`).toLocaleDateString('ka-GE',{day:'numeric',month:'long'}))}</h2></div>${selectedEvents.length ? `<div class="list">${selectedEvents.map(item=>`<article class="row clickable" onclick="${item.isEvent?`sectionTab='events';go('clubs')`:item.generated?`attendanceForCircle('${esc(item.subjectId)}','${esc(item.date)}')`:`scheduleForm('${esc(item.id)}')`}"><div class="due-day calendar-time">${esc(item.time||'•')}</div><div class="row-body"><div class="row-title">${esc(item.subjectId?subjectName(item.subjectId):item.name||'გაკვეთილი')}</div><div class="meta">${esc(item.group||'ჯგუფი მითითებული არ არის')} · ${esc(item.subjectId?teacherName(get('clubs',item.subjectId)||{}):'')} · ${item.generated?'დასწრების მონიშვნა':item.status==='held'?'ჩატარებული':item.status==='cancelled'?'გაუქმებული':'დაგეგმილი'}</div></div><span>›</span></article>`).join('')}</div>` : empty('ამ დღისთვის გაკვეთილები არ არის დამატებული', button('გაკვეთილის დამატება', 'scheduleForm()'))}</section>${dueCards.length?`<section class="section card"><div class="section-title"><h2>ამ დღის გადახდები · ${dueCards.length}</h2></div><div class="today-list">${dueCards.map(item=>`<button class="today-payment ${item.complete?'paid':'due'}" onclick="showChild('${esc(item.child.id)}')"><span class="today-status">${item.complete?'✓':'₾'}</span><span class="today-copy"><b>${esc(item.child.name)}</b><em>${item.complete?'გადახდილია':`დარჩა ${money(item.remaining)}`}</em></span><strong>${item.complete?'✓':money(item.remaining)}</strong></button>`).join('')}</div></section>`:''}`;
}
function scheduleForm(id) {
  if (!data.clubs.length) return toast('Сначала добавьте предмет');
  const old = id ? get('schedule',id) : null;
  openForm(old?'Занятие в календаре':'Добавить в календарь',[
    {name:'subjectId',label:'Предмет',type:'select',options:[['','Выберите предмет'],...data.clubs.map(a=>[a.id,a.name])],required:true},
    {name:'date',label:'Дата',type:'date',required:true},{name:'time',label:'Время',type:'time',required:true},
    {name:'status',label:'სტატუსი',type:'select',options:[['planned','დაგეგმილი'],['held','ჩატარებული'],['cancelled','გაუქმებული']]},
    {name:'group',label:'Группа / место'},{name:'note',label:'Комментарий',type:'textarea'},
  ],async values=>{
    if (!values.subjectId) throw new Error('Выберите предмет');
    values.name = subjectName(values.subjectId);
    if (old) await dataAdapter.update('schedule',id,values); else await dataAdapter.create('schedule',values);
    calendarMonth=monthKey(values.date);calendarSelected=values.date;go('schedule');toast('Календарь обновлён');
  },old||{date:calendarSelected,status:'planned'});
  if (old) {
    const actions=$('modalForm').querySelector('.form-actions');
    actions?.insertAdjacentHTML('afterbegin',`<button class="btn danger" type="button" onclick="deleteRecord('schedule','${esc(old.id)}','${jsq(old.name||'გაკვეთილი')}','schedule')">წაშლა</button>`);
  }
}

function expenses() {
  const total = data.expenses.filter(x => inPeriod(x.date)).reduce((sum, x) => sum + number(x.amount), 0);
  const shown = data.expenses.filter(x => expenseCategory === 'all' || expenseCategoryLabel(x.category) === expenseCategory);
  const categories = [['all','ყველა',data.expenses.length], ...expenseCategories.map(category => [category,category,data.expenses.filter(x => expenseCategoryLabel(x.category) === category).length])];
  return `${head('ხარჯები','კატეგორიებისა და თარიღების მიხედვით','<button class="btn icon-btn" onclick="editSimple(\'expenses\')" aria-label="ხარჯის დამატება">＋</button>')}${periodChips()}<div class="metric" style="--accent:var(--pink);margin-bottom:14px"><span class="label">პერიოდის დადასტურებული ხარჯი</span><strong>${money(total)}</strong><span class="delta">მხოლოდ თარიღით და კატეგორიით შენახული ჩანაწერები</span></div><div class="periods expense-filters">${categories.map(([key,label,count])=>`<button class="chip ${expenseCategory===key?'active':''}" onclick="setExpenseCategory('${esc(key)}')">${esc(label)} · ${count}</button>`).join('')}</div><section class="section"><div class="section-title"><h2>დადასტურებული ხარჯები</h2></div>${shown.length?`<div class="list">${[...shown].sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>`<article class="row clickable" onclick="editSimple('expenses','${esc(x.id)}')"><div class="pic" style="--accent:var(--pink)">−</div><div class="row-body"><div class="row-title">${esc(x.title)}</div><div class="meta">${esc(expenseCategoryLabel(x.category))} · ${esc(x.date||'თარიღი არ არის')}</div></div><b>${money(x.amount)}</b></article>`).join('')}</div>`:empty(expenseCategory==='all'?'დადასტურებული ხარჯები ჯერ არ არის':'ამ კატეგორიაში ხარჯები არ არის',button('ხარჯის დამატება',"editSimple('expenses')"))}</section>`;
}
function setExpenseCategory(category) { expenseCategory = category; go('expenses'); }
function pendingExpenseItems() {
  let label = '';
  const used = new Set(data.expenses.filter(x => x.sourceRow && x.sourceColumn).map(x => `${x.sourceRow}:${x.sourceColumn}`));
  return [...sourceRows].filter(row => row.section === 'Расходы' || row.rowNumber >= 59).sort((a,b) => a.rowNumber-b.rowNumber).flatMap(row => {
    if (String(row.a || '').trim()) label = String(row.a).trim();
    return 'bcdefghijkl'.split('').filter(column => String(row[column] || '').trim() && !used.has(`${row.rowNumber}:${column}`)).map(column => ({ rowNumber: row.rowNumber, column, raw: String(row[column]).trim(), label }));
  });
}
function expenseFromSource(rowNumber, column) {
  const item = pendingExpenseItems().find(x => x.rowNumber === rowNumber && x.column === column);
  if (!item) return toast('ეს თანხა უკვე დამუშავებულია');
  editSimple('expenses', null, { title: item.label ? `ძველი ცხრილიდან: ${item.label}` : 'ძველი ცხრილიდან', amount: /^\d+(?:[.,]\d+)?$/.test(item.raw) ? item.raw.replace(',', '.') : '', date: '', category: 'სხვა', sourceRow: rowNumber, sourceColumn: column, sourceRaw: item.raw });
}

function tasks() {
  return `${head("Задачи", `${data.tasks.filter(x => !x.done).length} открыто`, '<button class="btn icon-btn" onclick="editSimple(\'tasks\')" aria-label="Добавить задачу">＋</button>')}${data.tasks.length ? `<div class="list">${data.tasks.map(x => `<div class="row"><button class="pic" style="border:0;--accent:${x.done ? 'var(--green)' : 'var(--yellow)'}" onclick="toggleTask('${esc(x.id)}')" aria-label="Изменить статус задачи">${x.done ? '✓' : '!'}</button><div class="row-body"><div class="row-title" style="${x.done ? 'text-decoration:line-through;opacity:.6' : ''}">${esc(x.title)}</div><div class="meta">${esc(x.due || '')}</div></div><button class="btn small secondary" onclick="editSimple('tasks','${esc(x.id)}')">Открыть</button></div>`).join('')}</div>` : empty("Задач пока нет", button("Добавить задачу", "editSimple('tasks')"))}`;
}

function reports() {
  const totals = accountingTotals(), income=totals.income, expenses=totals.totalExpenses;
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - 5 + i, 1));
  const monthData = months.map(date => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const otherExpense=nonSalaryExpensesForMonth(key);
    return { label: date.toLocaleDateString('ka-GE', { month: 'short' }), income: data.payments.filter(x => monthKey(x.date) === key).reduce((s, x) => s + number(x.amount), 0), expense: otherExpense+payrollCostForMonth(key), children: data.children.filter(x => monthKey(x.start) === key).length };
  });
  const ceiling = Math.max(1, ...monthData.flatMap(x => [x.income, x.expense]));
  const leads = activePeople('leads').filter(x => inPeriod(x.date));
  const sources = Object.entries(leads.reduce((acc, x) => { const key = x.source || 'Не указан'; acc[key] = (acc[key] || 0) + 1; return acc; }, {})).sort((a,b) => b[1] - a[1]);
  const attended = data.attendance.filter(x => inPeriod(x.date));
  const present = attended.filter(wasPresent).length;
  const tomatisIds=new Set(data.clubs.filter(isTomatisCircle).map(item=>item.id));
  const tomatisAttendance=data.attendance.filter(item=>tomatisIds.has(item.subjectId)&&wasPresent(item)&&inPeriod(item.date));
  const tomatisPayments=data.payments.filter(item=>tomatisIds.has(item.subjectId)&&inPeriod(item.date));
  const tomatisChildren=new Set([...tomatisAttendance.map(item=>item.childId),...tomatisPayments.map(item=>item.childId)].filter(Boolean));
  const tomatisIncome=tomatisPayments.reduce((sum,item)=>sum+number(item.amount),0);
  const tomatisDue=billingRows(todayMonth()).filter(item=>isTomatisCircle(item.subject)).reduce((sum,item)=>sum+number(item.remaining),0);
  const tomatisCard=`<section class="mini-card tomatis-card"><div class="section-title"><div><h3>Tomatis · ცალკე აღრიცხვა</h3><p class="meta">თანხა შედის საერთო შემოსავალსა და მოგებაში</p></div><button class="btn small" onclick="addTomatisSession()">＋ პროცედურა</button></div><div class="info-grid"><div><small>პროცედურები</small><b>${tomatisAttendance.length}</b></div><div><small>ბავშვები</small><b>${tomatisChildren.size}</b></div><div><small>შემოსავალი</small><b>${money(tomatisIncome)}</b></div><div><small>მიმდინარე ნაშთი</small><b>${money(tomatisDue)}</b></div></div></section>`;
  return `${head('სტატისტიკა','CRM-ის რეალური ჩანაწერები')}${periodChips()}<section class="stat-hero"><small>წმინდა მოგება პერიოდში</small><b class="big">${money(totals.profit)}</b><div class="stat-split"><div><small>შემოსავალი</small><b>${money(income)}</b></div><div><small>სრული ხარჯი</small><b>${money(expenses)}</b></div></div></section><div class="grid-cards section">${tomatisCard}<section class="mini-card"><h3>ფინანსური დინამიკა</h3><p class="meta">ბოლო 6 თვე · ხარჯში ხელფასიც შედის</p><div class="chart">${monthData.map(x => `<div class="bar-group"><i class="bar income" style="height:${Math.max(x.income ? 4 : 0, x.income / ceiling * 100)}%"></i><i class="bar expense" style="height:${Math.max(x.expense ? 4 : 0, x.expense / ceiling * 100)}%"></i><span>${x.label}</span></div>`).join('')}</div><div class="legend"><span><i class="dot" style="background:var(--blue)"></i>შემოსავალი</span><span><i class="dot" style="background:var(--pink)"></i>ხარჯი</span></div></section><section class="mini-card"><h3>ბავშვები და დასწრება</h3><div class="info-grid"><div><small>აქტიური</small><b>${activePeople('children').length}</b></div><div><small>ახალი ამ პერიოდში</small><b>${activePeople('children').filter(x => inPeriod(x.start)).length}</b></div><div><small>დასწრება</small><b>${attended.length ? Math.round(present / attended.length * 100) + '%' : '—'}</b></div><div><small>ტელეფონის გარეშე</small><b>${activePeople('children').filter(x => !x.phone && !x.phone2).length}</b></div></div><p class="meta">არააქტიური ბავშვები: ${data.children.length-activePeople('children').length}. ${attended.length ? `${present} / ${attended.length} დასწრების მონიშვნა` : 'დასწრების მონიშვნები ჯერ არ არის'}</p></section><section class="mini-card"><h3>განაცხადების წყაროები</h3>${sources.length ? `<div class="source-list">${sources.map(([name, count]) => `<div><span>${esc(name)}</span><b>${count}</b></div>`).join('')}</div>` : '<p class="meta">ამ პერიოდში დათარიღებული განაცხადები არ არის</p>'}</section><section class="mini-card"><h3>განაცხადების ძაბრი</h3>${leads.length ? `<div class="funnel">${leadStages.slice(0, 5).map(([id, label], index) => { const count = leads.filter(x => leadStages.findIndex(s => s[0] === x.stage) >= index && x.stage !== 'reject').length; return `<div class="funnel-row"><span>${translateText(label)}</span><div class="funnel-track"><div class="funnel-fill" style="width:${Math.round(count / leads.length * 100)}%">${Math.round(count / leads.length * 100)}%</div></div><b>${count}</b></div>`; }).join('')}</div>` : '<p class="meta">კონვერსიის მონაცემები ჯერ არ არის</p>'}</section></div>`;
}

function sourceTable() {
  const letters = 'abcdefghijkl'.split('');
  const labels = {a:'ბავშვი / კატეგორია',b:'ტარიფი / მნიშვნელობა',c:'მონიშვნა / მნიშვნელობა',d:'დღე / ტელეფონი'};
  const known = sourceRows.filter(row => row.section === 'Дети');
  const other = sourceRows.filter(row => row.section !== 'Дети' && row.section !== 'Расходы' && row.rowNumber < 59);
  const expenseRows = sourceRows.filter(row => row.section === 'Расходы' || row.rowNumber >= 59);
  const table = (rows,label)=>rows.length?`<section class="section card"><div class="section-title"><h2>${label} · ${rows.length}</h2></div><p class="meta source-hint">E–L სვეტების სანახავად ცხრილი მარცხნივ გაწიეთ →</p><div class="source-scroll"><table class="source-table"><thead><tr><th>სტრიქონი</th>${letters.map(letter=>`<th>${letter.toUpperCase()}<small>${labels[letter]||'დამატებითი ველი'}</small></th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr data-search="${esc(letters.map(letter=>row[letter]).join(' '))}"><th>№ ${row.rowNumber}</th>${letters.map(letter=>`<td>${esc(row[letter]||'—')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`:'';
  return `${head('საწყისი ცხრილი',`${sourceRows.length} შევსებული სტრიქონი · ფურცელი „სექტემბერი 2026“`,'<button class="btn small" onclick="importSheet()">განახლება ↻</button>')}<div class="insight"><i>▦</i><div><b>თითოეული უჯრა ცალკე სვეტად ინახება</b><p>A — ბავშვის სახელი; B — ტარიფი ან ტექსტი; C — გადახდის მონიშვნა; D — გადახდის დღე ან ტელეფონი. E–L მნიშვნელობები ინახება უცვლელად. ძველი ხარჯები სტატისტიკაში მხოლოდ თარიღისა და კატეგორიის დაზუსტების შემდეგ მოხვდება.</p></div></div><input class="search" style="margin-top:14px" placeholder="ყველა სვეტში ძებნა" aria-label="საწყის ცხრილში ძებნა" oninput="filterSourceRows(this.value)">${sourceRows.length?table(known,'ბავშვების სია')+table(other,'გაკვეთილები და სხვა ჩანაწერები')+table(expenseRows,'ძველი ხარჯების ჩანაწერები'):empty('ცხრილი ჯერ არ არის ჩატვირთული',button('ჩატვირთვა','importSheet()'))}`;
}

function filterSourceRows(query) {
  document.querySelectorAll('.source-table tbody tr').forEach(row => row.classList.toggle('hidden', !row.dataset.search.toLowerCase().includes(query.toLowerCase())));
}

function settings() {
  return `${head('პარამეტრები','წვდომა და მონაცემები')}<div class="grid-cards"><section class="mini-card"><h3>ჩანაწერებზე წვდომა</h3><p class="meta">${esc(signedInUser?.email||'')}. ბავშვებისა და კონტაქტების მონაცემები მხოლოდ ნებადართულ ანგარიშებს აქვს.</p><button type="button" onclick="logoutCRM()" class="btn secondary access-button">გასვლა</button></section><section class="mini-card"><h3>სამუშაო Google ცხრილი</h3><p class="meta">ბავშვები, საგნები, მასწავლებლები, გადახდები და ხარჯები ცალკე ფურცლებზეა განაწილებული.</p><a class="btn" href="https://docs.google.com/spreadsheets/d/1qW0gh9_mcOFoA9zt_ON2f9qe3qyBtDJZncI0j-wECPw/edit" target="_blank" rel="noopener noreferrer">ცხრილის გახსნა ↗</a><p class="meta">CRM ცვლილებებს პირდაპირ ამ ცხრილში ინახავს.</p></section><section class="mini-card"><h3>საწყისი ცხრილი</h3><p class="meta">თითოეული შევსებული სტრიქონი და A–L უჯრები ცალ-ცალკე ინახება. დაზუსტებული ველები ბავშვების ბარათებშია გადატანილი.</p><button class="btn" onclick="importSheet()">წყაროს განახლება</button><p class="meta">განახლება ბავშვების ბარათებს არ გააორმაგებს და ხელით შეტანილ ცვლილებებს არ წაშლის.</p></section><section class="mini-card"><h3>საერთო საცავი</h3><p class="meta">ცვლილებები Google ცხრილში ინახება და შესვლის შემდეგ სხვადასხვა მოწყობილობაზე ჩანს.</p></section></div>`;
}

// ---------- Month closing ----------
const closingFor = month => data.closings.find(item => monthKey(item.month) === month);
const isClosedMonth = month => Boolean(month && closingFor(month));
function assertOpen(dateValue, what = 'ჩანაწერი') {
  const month = monthKey(dateValue);
  if (isClosedMonth(month)) throw new Error(`${prettyMonth(month)} დახურულია — ${what} ვერ შეიცვლება. საჭიროების შემთხვევაში თვე ჯერ გახსენით.`);
}
const closingBills = closing => Array.isArray(closing?.bills) ? closing.bills : [];
function billsWithLivePayments(closing) {
  const month = monthKey(closing.month);
  return closingBills(closing).map(bill => {
    const paid = data.payments.filter(p => p.childId === bill.childId && (p.subjectId || '') === (bill.subjectId || '') && monthKey(p.billingMonth || p.date) === month).reduce((sum,p) => sum + number(p.amount), 0);
    return { ...bill, month, paid, remaining: bill.price == null ? 0 : Math.max(0, number(bill.price) - paid) };
  });
}
function oldDebts(childId = null) {
  return data.closings.flatMap(billsWithLivePayments).filter(bill => bill.remaining > 0 && (!childId || bill.childId === childId));
}
function monthSummary(month) {
  const inMonth = item => monthKey(item.date) === month;
  const income = data.payments.filter(inMonth).reduce((sum,item) => sum + number(item.amount), 0);
  const monthExpenses = data.expenses.filter(inMonth);
  const byCategory = {};
  monthExpenses.filter(item => !isSalaryExpense(item) && !isEventHostExpense(item)).forEach(item => { const key = expenseCategoryLabel(item.category); byCategory[key] = (byCategory[key] || 0) + number(item.amount); });
  const hosts = eventsHostCost(monthRange(month));
  if (hosts) byCategory['მასტერკლასის წამყვანი'] = hosts;
  const otherExpenses = Object.values(byCategory).reduce((a,b) => a + b, 0);
  const pay = payroll(monthRange(month), 1);
  const bills = billingRows(month).map(row => ({ childId: row.child.id, child: row.child.name, subjectId: row.subject?.id || '', subject: row.subject?.name || 'საერთო ტარიფი', price: row.price, paid: row.paid, remaining: row.remaining == null ? null : number(row.remaining) }));
  const debt = bills.reduce((sum,bill) => sum + number(bill.remaining), 0);
  const attendance = data.attendance.filter(inMonth);
  return { month, income, otherExpenses, byCategory, salaries: pay.total,
    payroll: pay.rows.map(row => ({ staffId: row.person.id, name: row.person.name, accrued: row.accrued, paid: row.paid })), unassignedSalaries: pay.unassigned,
    profit: income - otherExpenses - pay.total, debt, bills, activeChildren: activePeople('children').length,
    attendance: { present: attendance.filter(wasPresent).length, total: attendance.length } };
}
function monthList() {
  const keys = new Set([todayMonth()]);
  [...data.payments, ...data.expenses, ...data.attendance].forEach(item => { const key = monthKey(item.date); if (key && key <= todayMonth()) keys.add(key); });
  data.closings.forEach(item => keys.add(monthKey(item.month)));
  return [...keys].filter(Boolean).sort().reverse();
}
function monthsView() {
  const rows = monthList().map(month => {
    const closing = closingFor(month), s = closing ? { ...closing, ...(closing.summary || {}) } : monthSummary(month);
    const debtNow = closing ? billsWithLivePayments(closing).reduce((sum,bill) => sum + bill.remaining, 0) : s.debt;
    return `<article class="card month-card ${closing ? 'closed' : ''}"><div class="month-head"><div><h2>${esc(prettyMonth(month))}</h2><p class="meta">${closing ? `დაიხურა ${esc(dateKey(closing.closedAt) || '')}${closing.closedBy ? ` · ${esc(closing.closedBy)}` : ''}` : month === todayMonth() ? 'მიმდინარე თვე' : 'ღია თვე'}</p></div><span class="pay-status ${closing ? 'paid' : 'due'}">${closing ? '🔒 დახურულია' : 'ღიაა'}</span></div><div class="month-figures"><div><small>შემოსავალი</small><b>${money(s.income)}</b></div><div><small>ხარჯი + ხელფასი</small><b>${money(number(s.otherExpenses) + number(s.salaries))}</b></div><div><small>მოგება</small><b class="${number(s.profit) < 0 ? 'danger-text' : ''}">${money(s.profit)}</b></div><div><small>${closing ? 'დარჩენილი ვალი' : 'გადაუხდელი'}</small><b class="${debtNow > 0 ? 'danger-text' : ''}">${money(debtNow)}</b></div></div><div class="card-actions">${closing ? `<button class="btn small secondary" onclick="monthReport('${month}')">ანგარიში</button><button class="btn small secondary" onclick="reopenMonth('${month}')">თვის გახსნა</button>` : `<button class="btn small" onclick="closeMonthPreview('${month}')">🔒 თვის დახურვა</button><button class="btn small secondary" onclick="monthReport('${month}')">წინასწარი ანგარიში</button>`}</div></article>`;
  }).join('');
  return `${head('თვის დახურვა', 'ყოველთვიური შეჯამება და ჩაკეტვა')}${serverOutdatedNote()}<p class="section-note">თვის დახურვისას ფიქსირდება შემოსავალი, ხარჯები, ხელფასები, მოგება და გადაუხდელი თანხები. დახურული თვის გადახდები, ხარჯები და დასწრება აღარ იცვლება, ხოლო გადაუხდელი თანხა ვალად გადადის შემდეგ თვეებში.</p><div class="list cards-grid">${rows}</div>`;
}
function monthWarnings(month, s) {
  const warnings = [];
  const unpaidSalaries = s.payroll.filter(row => row.accrued > row.paid);
  if (unpaidSalaries.length) warnings.push(`ხელფასი სრულად არ არის გაცემული: ${unpaidSalaries.map(row => `${row.name} (${money(row.accrued - row.paid)})`).join(', ')}`);
  const debtors = s.bills.filter(bill => number(bill.remaining) > 0);
  if (debtors.length) warnings.push(`${new Set(debtors.map(bill => bill.childId)).size} ბავშვს აქვს გადაუხდელი ${money(s.debt)} — ვალად გადავა.`);
  const unknown = s.bills.filter(bill => bill.price === null);
  if (unknown.length) warnings.push(`${unknown.length} დარიცხვას ფასი არ აქვს მითითებული.`);
  if (month === todayMonth()) warnings.push('თვე ჯერ არ დასრულებულა.');
  return warnings;
}
function monthReportHtml(month, s, live = null) {
  const cats = Object.entries(s.byCategory || {}).sort((a,b) => b[1] - a[1]);
  const bills = (live || s.bills || []).filter(bill => number(bill.remaining) > 0);
  return `<div class="report"><div class="month-figures"><div><small>შემოსავალი</small><b>${money(s.income)}</b></div><div><small>სხვა ხარჯები</small><b>${money(s.otherExpenses)}</b></div><div><small>ხელფასები</small><b>${money(s.salaries)}</b></div><div><small>წმინდა მოგება</small><b class="${number(s.profit) < 0 ? 'danger-text' : ''}">${money(s.profit)}</b></div></div>
  <h3 class="history-title">ხარჯები კატეგორიებით</h3>${cats.length ? `<div class="source-list">${cats.map(([k,v]) => `<div><span>${esc(k)}</span><b>${money(v)}</b></div>`).join('')}</div>` : '<p class="meta">ხარჯები არ არის.</p>'}
  <h3 class="history-title">ხელფასები</h3>${(s.payroll || []).filter(row => row.accrued || row.paid).length ? `<div class="source-list">${s.payroll.filter(row => row.accrued || row.paid).map(row => `<div><span>${esc(row.name)}</span><b>${money(row.paid || row.accrued)}${row.paid && row.paid !== row.accrued ? ` <small class="meta">(დარიცხ. ${money(row.accrued)})</small>` : ''}</b></div>`).join('')}</div>` : '<p class="meta">ხელფასები არ არის.</p>'}
  <h3 class="history-title">${live ? 'დარჩენილი ვალები' : 'გადაუხდელი თანხები'} · ${bills.length}</h3>${bills.length ? `<div class="source-list">${bills.map(bill => `<div><span>${esc(bill.child)} · ${esc(bill.subject)}</span><b class="danger-text">${money(bill.remaining)}</b></div>`).join('')}</div>` : '<p class="meta">ყველაფერი გადახდილია.</p>'}
  <p class="meta" style="margin-top:12px">აქტიური ბავშვები: ${s.activeChildren ?? '—'} · დასწრება: ${s.attendance ? `${s.attendance.present} / ${s.attendance.total}` : '—'}</p></div>`;
}
function showInfoModal(title, html, actions = '') {
  $("modalTitle").textContent = title;
  const form = $("modalForm");
  form.onsubmit = event => event.preventDefault();
  form.innerHTML = `${html}<div class="form-actions">${actions}<button class="btn secondary" type="button" onclick="closeModal()">${actions ? 'გაუქმება' : 'კარგი'}</button></div>`;
  $("modal").classList.remove('hidden');
}
function monthReport(month) {
  const closing = closingFor(month);
  if (closing) showInfoModal(`${prettyMonth(month)} · ანგარიში`, monthReportHtml(month, { ...closing, ...(closing.summary || {}) }, billsWithLivePayments(closing)));
  else showInfoModal(`${prettyMonth(month)} · წინასწარი ანგარიში`, monthReportHtml(month, monthSummary(month)));
}
function closeMonthPreview(month) {
  if (isClosedMonth(month)) return toast('თვე უკვე დახურულია');
  const s = monthSummary(month), warnings = monthWarnings(month, s);
  showInfoModal(`${prettyMonth(month)} · დახურვა`, `${warnings.length ? `<div class="warn-box">${warnings.map(w => `<p>⚠ ${esc(w)}</p>`).join('')}</div>` : '<div class="ok-box">✓ ყველაფერი რიგზეა — შეგიძლიათ დახუროთ.</div>'}${monthReportHtml(month, s)}`, `<button class="btn" type="button" onclick="confirmCloseMonth('${month}')">🔒 დახურვა</button>`);
}
async function confirmCloseMonth(month) {
  if (isClosedMonth(month)) return;
  const s = monthSummary(month);
  try {
    await dataAdapter.create('closings', { month, closedAt: new Date().toISOString(), closedBy: signedInUser?.name || '', income: s.income, expenses: s.otherExpenses, salaries: s.salaries, profit: s.profit, debt: s.debt, summary: (({ bills, ...rest }) => rest)(s), bills: s.bills });
    closeModal(); go('months'); toast(`${prettyMonth(month)} დახურულია`);
  } catch (error) { toast(error.message); }
}
async function reopenMonth(month) {
  const closing = closingFor(month); if (!closing) return;
  if (!confirm(`გავხსნათ ${prettyMonth(month)}? შეჯამება წაიშლება და ჩანაწერები ისევ შეიცვლება. შემდეგ თვე ხელახლა დახურეთ.`)) return;
  await dataAdapter.remove('closings', closing.id); go('months'); toast('თვე გახსნილია');
}
function payOldDebt(childId, subjectId, month) {
  const bill = oldDebts(childId).find(item => (item.subjectId || '') === (subjectId || '') && item.month === month); if (!bill) return;
  openForm(`ვალი · ${bill.child} · ${prettyMonth(month)}`, [{name:'amount',label:'თანხა, ₾',type:'number',required:true},{name:'date',label:'გადახდის თარიღი',type:'date',required:true},{name:'method',label:'გადახდის მეთოდი',type:'select',options:[['cash','ნაღდი'],['transfer','გადარიცხვა'],['card','ბარათი'],['other','სხვა']]}], async values => {
    if (number(values.amount) <= 0) throw new Error('თანხა ნულზე მეტი უნდა იყოს');
    assertOpen(values.date, 'გადახდა');
    await dataAdapter.create('payments', { childId, child: bill.child, subjectId: subjectId || '', amount: number(values.amount), date: values.date, billingMonth: month, method: values.method, comment: 'ვალის დაფარვა' });
    go(current); toast('ვალის გადახდა შენახულია');
  }, { amount: bill.remaining, date: today(), method: 'cash' });
}
function oldDebtsBlock(childId = null) {
  const debts = oldDebts(childId); if (!debts.length) return '';
  const total = debts.reduce((sum,bill) => sum + bill.remaining, 0);
  return `<section class="section card debt-card"><div class="section-title"><div><h2>ვალები დახურული თვეებიდან</h2><p class="meta">${debts.length} ჩანაწერი · სულ <b class="danger-text">${money(total)}</b></p></div></div><div class="list single">${debts.map(bill => `<article class="row"><div class="pic" style="--accent:var(--red)">!</div><div class="row-body"><div class="row-title">${childId ? esc(bill.subject) : `<button class="link-btn" onclick="showChild('${esc(bill.childId)}')">${esc(bill.child)}</button>`}</div><div class="meta">${childId ? '' : `${esc(bill.subject)} · `}${esc(prettyMonth(bill.month))} · გადახდილია ${money(bill.paid)} / ${money(bill.price)}</div></div><b class="danger-text">${money(bill.remaining)}</b><button class="btn small" onclick="payOldDebt('${esc(bill.childId)}','${esc(bill.subjectId || '')}','${bill.month}')">გადახდა</button></article>`).join('')}</div></section>`;
}

const views = {
  dashboard, children, childProfile, contacts, payments, leads, reports, accounting, expenses, tasks, settings, sourceTable,
  staff: teachers,
  groups: () => listSection('groups', 'Группы', 'Направления', x => `${x.teacher || 'Педагог не указан'} · ${x.schedule || 'Расписание не указано'}`),
  clubs: activities,
  schedule: calendar,
  attendance: attendanceView,
  months: monthsView,
  parents: parentsView,
};

const baseReports = views.reports;
views.reports = () => {
  const now = new Date();
  const months = Array.from({length: 6}, (_, i) => new Date(now.getFullYear(), now.getMonth() - 5 + i, 1));
  const trend = months.map(date => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const income = data.payments.filter(x => monthKey(x.date) === key).reduce((sum, x) => sum + number(x.amount), 0);
    const expenses = nonSalaryExpensesForMonth(key) + payrollCostForMonth(key);
    const started = data.children.filter(x => x.start && x.start <= `${key}-31`).length;
    return {label: date.toLocaleDateString('ka-GE', {month:'short'}), profit: income - expenses, started};
  });
  const scale = Math.max(1, ...trend.map(x => Math.abs(x.profit)));
  const maxChildren = Math.max(1, ...trend.map(x => x.started));
  const profits = `<section class="mini-card"><h3>მოგების დინამიკა</h3><p class="meta">შემოსავალი მინუს სრული ხარჯი, ბოლო 6 თვე</p><div class="chart">${trend.map(x => `<div class="bar-group"><i class="bar" style="height:${Math.max(x.profit ? 4 : 0, Math.abs(x.profit) / scale * 100)}%;background:${x.profit >= 0 ? 'var(--green)' : 'var(--red)'}" title="${esc(x.label)}: ${money(x.profit)}"></i><span>${esc(x.label)}</span></div>`).join('')}</div><p class="meta">მწვანე — მოგება, წითელი — ზარალი.</p></section>`;
  const children = `<section class="mini-card"><h3>ბავშვების დინამიკა</h3><p class="meta">მხოლოდ დაწყების სრული თარიღის მქონე ბარათები</p>${trend.some(x => x.started) ? `<div class="chart">${trend.map(x => `<div class="bar-group"><i class="bar" style="height:${x.started / maxChildren * 100}%;background:var(--yellow)" title="${esc(x.label)}: ${x.started}"></i><span>${esc(x.label)}</span></div>`).join('')}</div>` : '<p class="meta">გრაფიკისთვის ბავშვების დაწყების სრული თარიღები შეავსეთ.</p>'}</section>`;
  const categoryTotals = expenseCategories.map(category => [category, category==='ხელფასები'?accountingTotals().salaries:data.expenses.filter(x => expenseCategoryLabel(x.category) === category && inPeriod(x.date)).reduce((sum,x) => sum + number(x.amount), 0)]).filter(([,amount]) => amount > 0);
  const breakdown = `<section class="mini-card section"><h3>ხარჯები კატეგორიების მიხედვით</h3>${categoryTotals.length ? `<div class="source-list">${categoryTotals.map(([category,amount]) => `<div><span>${esc(category)}</span><b>${money(amount)}</b></div>`).join('')}</div>` : '<p class="meta">ხარჯების სტრუქტურის სანახავად მიუთითეთ თარიღები და კატეგორიები.</p>'}</section>`;
  return baseReports() + `<div class="grid-cards section">${profits}${children}${breakdown}</div>`;
};

const NAV_GROUPS = [
  ['', [['dashboard','⌂','მთავარი'],['schedule','▦','კალენდარი']]],
  ['ბავშვები', [['children','☺','ბავშვები'],['parents','♡','მშობლები'],['attendance','✓','დასწრება'],['contacts','☎','კონტაქტები'],['leads','✉','განაცხადები']]],
  ['ცენტრი', [['clubs','✦','წრეები'],['staff','♙','თანამშრომლები']]],
  ['ფინანსები', [['payments','₾','გადახდები'],['expenses','−','ხარჯები'],['accounting','◫','ბუღალტერია'],['months','🔒','თვის დახურვა'],['reports','▤','სტატისტიკა']]],
  ['სხვა', [['tasks','☑','ამოცანები'],['sourceTable','▥','საწყისი ცხრილი'],['settings','⚙','პარამეტრები']]],
];
function navActive(id) { return id === current || (current === 'childProfile' && id === 'children'); }
function renderDrawer() {
  $("drawerGrid").innerHTML = NAV_GROUPS.map(([title, items]) => `${title?`<div class="drawer-group">${title}</div>`:''}${items.map(([id, icon, label]) => `<button class="drawer-item ${navActive(id)?'active':''}" onclick="go('${id}')"><span>${icon}</span>${label}</button>`).join('')}`).join('');
  const side = $("sidebar");
  if (side) side.innerHTML = `<div class="side-brand"><img src="assets/logo.webp" alt="ღიმილი"><div><small>ცენტრის CRM</small><b>${esc(signedInUser?.name || 'ღიმილი')}</b></div></div><button class="btn side-add" onclick="quickAdd()">＋ დამატება</button>${NAV_GROUPS.map(([title, items]) => `<nav class="side-group">${title?`<small>${title}</small>`:''}${items.map(([id, icon, label]) => `<button class="side-item ${navActive(id)?'active':''}" onclick="go('${id}')"><span>${icon}</span>${label}</button>`).join('')}</nav>`).join('')}<button class="side-item side-exit" onclick="logoutCRM()"><span>⎋</span>გასვლა</button>`;
}
function toggleDrawer(open) {
  if (open) renderDrawer();
  $("drawer").classList.toggle("hidden", !open);
  const more = document.querySelector('.nav button[data-nav="more"]');
  if (more) more.classList.toggle('active', open || !['dashboard','children','payments','childProfile'].includes(current));
}
function filterRows(query) { document.querySelectorAll('#rows [data-search]').forEach(node => node.classList.toggle('hidden', !node.dataset.search.toLowerCase().includes(query.toLowerCase()))); }

// keeps the old single-teacher columns in sync, so the sheet stays readable and older servers still work
function assignmentFields(list) {
  const clean = list.filter(item => item && item.teacherId).map(item => ({ teacherId: item.teacherId, payType: item.payType || '', amount: optNumber(item.amount), percent: optNumber(item.percent) }));
  const first = clean[0] || {};
  const legacy = first.payType === 'percent' ? { teacherPayType: 'percent', teacherPercent: first.percent, teacherRate: null, teacherAccrualBasis: '' }
    : first.payType === 'per_lesson' ? { teacherPayType: 'per_lesson', teacherRate: first.amount, teacherPercent: null, teacherAccrualBasis: '' }
    : first.payType === 'per_child' ? { teacherPayType: 'per_lesson', teacherRate: first.amount, teacherPercent: null, teacherAccrualBasis: 'attendance' }
    : { teacherPayType: '', teacherRate: null, teacherPercent: null, teacherAccrualBasis: '' };
  return { assignments: clean, teacherId: first.teacherId || '', teacher: clean.map(item => get('staff', item.teacherId)?.name).filter(Boolean).join(', '), ...legacy };
}
function assignmentRowHtml(item, options) {
  const opts = [['', 'აირჩიეთ მასწავლებელი'], ...options];
  return `<div class="asg-row"><select name="asg_teacher" aria-label="მასწავლებელი">${opts.map(([v,l]) => `<option value="${esc(v)}" ${String(v) === String(item.teacherId || '') ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select><select name="asg_type" aria-label="ანაზღაურების წესი"><option value="">საერთო წესით (მასწავლებლის ბარათიდან)</option>${PAY_TYPES.map(([v,l]) => `<option value="${v}" ${v === (item.payType || '') ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select><div class="asg-nums"><input name="asg_amount" type="number" min="0" step="any" inputmode="decimal" placeholder="თანხა, ₾" value="${item.amount ?? ''}"><input name="asg_percent" type="number" min="0" max="100" step="any" inputmode="decimal" placeholder="%" value="${item.percent ?? ''}"><button type="button" class="btn small secondary asg-remove" aria-label="მოხსნა">✕</button></div></div>`;
}
function syncAssignmentRow(row) {
  const section = row.closest('form')?.querySelector('[name=section]')?.value || 'specialists';
  const typeSelect = row.querySelector('[name=asg_type]'), amount = row.querySelector('[name=asg_amount]'), percent = row.querySelector('[name=asg_percent]');
  if (section === 'garden') { typeSelect.hidden = true; amount.hidden = true; percent.hidden = true; return; }
  if (section === 'circles') { typeSelect.hidden = true; amount.hidden = true; percent.hidden = false; percent.placeholder = '50 %'; return; }
  typeSelect.hidden = false; percent.placeholder = '%';
  amount.hidden = !['monthly','weekly','per_lesson','per_child','per_day','mixed'].includes(typeSelect.value);
  percent.hidden = !['percent','mixed'].includes(typeSelect.value);
}
function syncCircleRow(row) {
  const on = row.querySelector('[name=tc_on]').checked, rule = row.querySelector('.tc-rule');
  row.classList.toggle('on', on);
  if (!rule) return;
  rule.hidden = !on;
  const type = rule.querySelector('select')?.value;
  if (row.dataset.section === 'specialists') {
    rule.querySelector('[name^=tc_amount_]').hidden = !['monthly','weekly','per_lesson','per_child','per_day','mixed'].includes(type);
    rule.querySelector('[name^=tc_percent_]').hidden = !['percent','mixed'].includes(type);
  }
}
function openForm(title, fields, submit, initial = {}) {
  modalDirty = false;
  $("modalTitle").textContent = translateText(title);
  const form = $("modalForm");
  form.innerHTML = fields.map(field => {
    const value = initial[field.name] ?? '';
    const id = `field-${field.name}`;
    let input;
    if (field.type === 'select') {
      input = `<select id="${id}" name="${field.name}" ${field.required ? 'required' : ''}>${field.options.map(option => { const [optionValue, label] = Array.isArray(option) ? option : [option, option]; return `<option value="${esc(optionValue)}" ${String(value) === String(optionValue) ? 'selected' : ''}>${esc(label)}</option>`; }).join('')}</select>`;
    } else if (field.type === 'choice') {
      input = `<div class="choice-list" id="${id}">${field.options.map(([optionValue, label]) => `<label class="choice-option"><input type="radio" name="${field.name}" value="${esc(optionValue)}" ${String(value) === String(optionValue) ? 'checked' : ''} ${field.required ? 'required' : ''}><span>${esc(label)}</span></label>`).join('')}</div>`;
    } else if (field.type === 'multi') {
      input = `<div class="form-options">${field.options.map(option => { const [optionValue, label] = Array.isArray(option) ? option : [option, option]; return `<label class="form-option"><input type="checkbox" name="${field.name}" value="${esc(optionValue)}" ${toList(value).map(String).includes(String(optionValue)) ? 'checked' : ''}><span>${esc(label)}</span></label>`; }).join('')}</div>`;
    } else if (field.type === 'teacherCircles') {
      const current = value && typeof value === 'object' ? value : {};
      input = `<div class="tc-list" id="${id}">${SECTIONS.map(([sec, secLabel]) => { const rows = field.options.filter(option => option[3] === sec); if (!rows.length) return ''; const hint = sec === 'garden' ? 'ფიქსირებული ხელფასი (ზემოთ)' : sec === 'circles' ? 'მიღებული თანხის %' : 'ანაზღაურება ხელით'; return `<div class="tc-group"><div class="tc-group-head"><b>${secLabel}</b><small>${hint}</small></div>${rows.map(([circleId, name, others, , defPct]) => { const a = current[circleId]; const rule = sec === 'circles' ? `<div class="asg-nums"><input name="tc_percent_${esc(circleId)}" type="number" min="0" max="100" step="any" inputmode="decimal" placeholder="${defPct}" value="${a?.percent ?? ''}" aria-label="პროცენტი · ${esc(name)}"><span class="unit">%</span></div>` : sec === 'specialists' ? `<select name="tc_type_${esc(circleId)}" aria-label="ანაზღაურება · ${esc(name)}"><option value="">აირჩიეთ…</option>${PAY_TYPES.map(([v,l]) => `<option value="${v}" ${a && a.payType === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select><div class="asg-nums"><input name="tc_amount_${esc(circleId)}" type="number" min="0" step="any" inputmode="decimal" placeholder="თანხა, ₾" value="${a?.amount ?? ''}"><input name="tc_percent_${esc(circleId)}" type="number" min="0" max="100" step="any" inputmode="decimal" placeholder="%" value="${a?.percent ?? ''}"></div>` : ''; return `<div class="tc-row ${a ? 'on' : ''}" data-section="${sec}"><label class="tc-head"><input type="checkbox" name="tc_on" value="${esc(circleId)}" ${a ? 'checked' : ''}><span><b>${esc(name)}</b>${others ? `<small>ასევე: ${esc(others)}</small>` : ''}</span></label>${rule ? `<div class="tc-rule">${rule}</div>` : ''}</div>`; }).join('')}</div>`; }).join('')}</div>`;
    } else if (field.type === 'assignments') {
      const list = Array.isArray(value) && value.length ? value : [{}];
      input = `<div class="asg-list" id="${id}" data-options='${esc(JSON.stringify(field.options))}'>${list.map(item => assignmentRowHtml(item, field.options)).join('')}</div><button type="button" class="btn small secondary asg-add">＋ კიდევ ერთი მასწავლებელი</button>`;
    } else if (field.type === 'textarea') input = `<textarea id="${id}" name="${field.name}">${esc(value)}</textarea>`;
    else input = `<input id="${id}" name="${field.name}" type="${field.type || 'text'}" value="${esc(value)}" ${field.name === 'paymentDay' ? 'min="1" max="31" step="1"' : field.type === 'number' ? 'min="0" step="any" inputmode="decimal"' : ''} ${field.required ? 'required' : ''}>`;
    return `<div class="field"><label for="${id}">${esc(field.label)}</label>${input}</div>`;
  }).join('') + '<div class="form-actions"><button class="btn secondary" type="button" onclick="closeModal()">Отмена</button><button class="btn" type="submit">Сохранить</button></div>';
  translateUi(form);
  form.querySelectorAll('.asg-row').forEach(syncAssignmentRow);
  form.querySelectorAll('.tc-row').forEach(syncCircleRow);
  form.onchange = event => { if (event.target.name === 'section') form.querySelectorAll('.asg-row').forEach(syncAssignmentRow); const row = event.target.closest?.('.asg-row'); if (row) syncAssignmentRow(row); const tc = event.target.closest?.('.tc-row'); if (tc) syncCircleRow(tc); };
  form.onclick = event => {
    if (event.target.closest?.('.asg-remove')) { const list = event.target.closest('.asg-list'); event.target.closest('.asg-row').remove(); if (!list.children.length) list.insertAdjacentHTML('beforeend', assignmentRowHtml({}, JSON.parse(list.dataset.options))); }
    if (event.target.closest?.('.asg-add')) { const list = event.target.closest('.field').querySelector('.asg-list'); list.insertAdjacentHTML('beforeend', assignmentRowHtml({}, JSON.parse(list.dataset.options))); syncAssignmentRow(list.lastElementChild); }
  };
  form.onsubmit = async event => {
    event.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try { const formData = new FormData(form); const values = Object.fromEntries(formData); fields.filter(field => field.type === 'multi').forEach(field => { values[field.name] = formData.getAll(field.name); }); fields.filter(field => field.type === 'teacherCircles').forEach(field => { const chosen = {}; formData.getAll('tc_on').forEach(circleId => { const sec = circleSection(get('clubs', circleId)); const percent = optNumber(formData.get(`tc_percent_${circleId}`)); if (percent != null && (percent < 0 || percent > 100)) throw new Error('პროცენტი უნდა იყოს 0-დან 100-მდე'); chosen[circleId] = sec === 'garden' ? { payType: '', amount: null, percent: null } : sec === 'circles' ? { payType: 'percent', amount: null, percent } : { payType: formData.get(`tc_type_${circleId}`) || '', amount: optNumber(formData.get(`tc_amount_${circleId}`)), percent }; }); Object.keys(values).filter(key => key.startsWith('tc_')).forEach(key => delete values[key]); values[field.name] = chosen; }); fields.filter(field => field.type === 'assignments').forEach(field => { const t = formData.getAll('asg_teacher'), ty = formData.getAll('asg_type'), am = formData.getAll('asg_amount'), pc = formData.getAll('asg_percent'); const seen = new Set(); values[field.name] = t.map((teacherId, i) => ({ teacherId, payType: ty[i] || '', amount: optNumber(am[i]), percent: optNumber(pc[i]) })).filter(item => item.teacherId && !seen.has(item.teacherId) && seen.add(item.teacherId)); if (values[field.name].some(item => item.percent != null && (item.percent < 0 || item.percent > 100))) throw new Error('პროცენტი უნდა იყოს 0-დან 100-მდე'); ['asg_teacher','asg_type','asg_amount','asg_percent'].forEach(key => delete values[key]); }); await submit(values); closeModal(); }
    catch (error) { toast(error.message || 'Не удалось сохранить'); }
    finally { submitButton.disabled = false; }
  };
  $("modal").classList.remove('hidden');
}
// The card closes only with its own buttons (× / Cancel / Save) — never by tapping the dimmed background,
// so selecting text or a stray tap can't close it. × asks first if something was changed.
let modalDirty = false;
function closeModal() { modalDirty = false; $("modal").classList.add('hidden'); }
function requestCloseModal() {
  if (modalDirty && !confirm('ცვლილებები არ არის შენახული. დავხუროთ შენახვის გარეშე?')) return;
  closeModal();
}
document.addEventListener('input', event => { if (event.target.closest?.('#modalForm')) modalDirty = true; });
document.addEventListener('change', event => { if (event.target.closest?.('#modalForm')) modalDirty = true; });
async function logoutCRM() {
  try { await api('/api/logout', {method:'POST', body:'{}'}); }
  finally { localStorage.removeItem(CACHE_KEY); localStorage.removeItem('gimili_crm_session'); localStorage.removeItem('gimili_crm_user'); location.replace('./login.html'); }
}
function toast(message) { const node = $("toast"); node.textContent = translateText(message); node.classList.remove('hidden'); clearTimeout(window._toastTimer); window._toastTimer = setTimeout(() => node.classList.add('hidden'), 3200); }

const childFields = [
  {name:'name',label:'ФИО ребёнка',required:true},{name:'birth',label:'Дата рождения',type:'date'},{name:'parent',label:'Родитель / контактное лицо'},
  {name:'phone',label:'Основной телефон',type:'tel'},{name:'phone2',label:'Дополнительный телефон',type:'tel'},{name:'group',label:'Группа'},
  {name:'schedule',label:'Расписание'},{name:'start',label:'Полная дата начала, если известна',type:'date'},
  {name:'paymentDay',label:'Число прихода и оплаты (1–31)',type:'number'},
  {name:'active',label:'სტატუსი',type:'select',options:[['true','აქტიური'],['false','არააქტიური']]},
  {name:'tariff',label:'Тариф, ₾',type:'number'},{name:'discount',label:'Скидка, %',type:'number'},
  {name:'source',label:'Источник привлечения',type:'select',options:['','Instagram','Facebook','Telegram','Google','Рекомендация','Офлайн','Другое']},
  {name:'comment',label:'Комментарий',type:'textarea'},
];
function childForm(id) {
  const old = id ? get('children', id) : null;
  const fields = [...childFields.slice(0, 6), {name:'activityIds',label:'Предметы (можно выбрать несколько)',type:'multi',options:data.clubs.filter(a => !isEvent(a) || toList(old?.activityIds).includes(a.id)).map(a => [a.id,a.name])}, ...childFields.slice(6)];
  openForm(old ? 'Карточка ребёнка' : 'Новый ребёнок', fields, async values => {
    values.active = values.active !== 'false';
    if (old && isActiveRecord(old,'children') && !values.active) values.inactiveFrom = today();
    if (values.active) values.inactiveFrom = '';
    values.status = values.active ? 'Активен' : 'Неактивен';
    values.paymentDay = values.paymentDay ? day(values.paymentDay) : null;
    values.tariff = values.tariff === '' ? null : number(values.tariff);
    values.discount = number(values.discount);
    values.activityIds = values.activityIds || [];
    values.activityStart = withStart(old, values.activityIds.filter(circleId => !toList(old?.activityIds).includes(circleId)));
    const saved = old ? await dataAdapter.update('children', id, values) : await dataAdapter.create('children', values);
    currentChildId = saved.id;
    try { await ensureParentFor(get('children', saved.id)); } catch (_) {}
    const needsSetup=toList(saved.activityIds).map(circleId=>get('clubs',circleId)).find(circle=>(isCraftCircle(circle)&&!participantType(saved,circle))||(isFlexibleCircle(circle)&&!childBillingMode(saved,circle)));
    if (needsSetup) setTimeout(()=>editCircleBilling(saved.id,needsSetup.id),120); else go('childProfile');
    toast('ბავშვის ბარათი შენახულია');
  }, old ? {...old,activityIds:toList(old.activityIds),active:String(isActiveRecord(old,'children'))} : { active:'true' });
  if (old) $('modalForm').querySelector('.form-actions')?.insertAdjacentHTML('afterbegin',`<button class="btn danger" type="button" onclick="deleteChild('${esc(old.id)}')">წაშლა</button>`);
}
async function deleteChild(id) {
  const child=get('children',id); if (!child) return;
  const history=data.payments.filter(item=>item.childId===id).length+data.attendance.filter(item=>item.childId===id).length;
  if (history) return toast(`ბავშვს აქვს ${history} ჩანაწერი (გადახდა/დასწრება). წაშლის ნაცვლად გახადეთ არააქტიური.`);
  if (!confirm(`წავშალოთ ბარათი „${child.name||'უსახელო'}“? ეს მოქმედება ვერ გაუქმდება.`)) return;
  try { await dataAdapter.remove('children',id); closeModal(); go('children'); toast('ბარათი წაიშალა'); }
  catch (error) { toast(error.message||'წაშლა ვერ მოხერხდა'); }
}
function phoneForm(id) {
  const old = get('children', id);
  if (!old) return;
  openForm(`Контакт · ${old.name}`, [{name:'parent',label:'Родитель / контактное лицо'},{name:'phone',label:'Основной телефон',type:'tel'},{name:'phone2',label:'Дополнительный телефон',type:'tel'}], async values => {
    await dataAdapter.update('children', id, values); try { await ensureParentFor(get('children', id)); } catch (_) {} go('contacts'); toast('Контакт сохранён');
  }, old);
}
function paymentForm(initialChildId = '', paymentId = '') {
  const old=paymentId?get('payments',paymentId):null;
  const selectableChildren=activePeople('children');
  if (old&&!selectableChildren.some(child=>child.id===old.childId)) { const child=get('children',old.childId); if (child) selectableChildren.push(child); }
  if (!selectableChildren.length) return toast('ჯერ დაამატეთ ან ჩართეთ აქტიური ბავშვი');
  openForm(old?'გადახდის შეცვლა':'ახალი გადახდა', [{name:'childId',label:'ბავშვი',type:'select',required:true,options:selectableChildren.map(c=>[c.id,c.name])},{name:'subjectId',label:'წრე',type:'select',options:[['','საერთო გადახდა / წრის გარეშე'],...data.clubs.map(a=>[a.id,a.name])]},{name:'amount',label:'თანხა, ₾',type:'number',required:true},{name:'date',label:'გადახდის თარიღი',type:'date',required:true},{name:'billingMonth',label:'რომელი თვის დარიცხვას ფარავს',type:'month',required:true},{name:'method',label:'გადახდის მეთოდი',type:'select',options:[['cash','ნაღდი'],['transfer','გადარიცხვა'],['card','ბარათი'],['other','სხვა']]}], async values => {
    if (number(values.amount) <= 0) throw new Error('თანხა ნულზე მეტი უნდა იყოს');
    if (old) assertOpen(old.date, 'გადახდა');
    assertOpen(values.date, 'გადახდა');
    if (!old) confirmNotAlreadyPaid(values.childId, values.subjectId, values.billingMonth || monthKey(values.date), number(values.amount));
    if (values.subjectId && !toList(get('children',values.childId)?.activityIds).includes(values.subjectId)) throw new Error('ჯერ მიანიჭეთ ბავშვს ეს საგანი');
    values.child = get('children', values.childId)?.name || '';
    values.amount = number(values.amount);
    values.billingMonth = values.billingMonth || monthKey(values.date);
    if (old) await dataAdapter.update('payments',paymentId,values); else await dataAdapter.create('payments', values);
    paymentMonth=values.billingMonth; go('payments'); toast('გადახდა შენახულია');
  }, old?{...old,date:dateKey(old.date),billingMonth:monthKey(old.billingMonth||old.date)}:{ childId:selectableChildren.some(c=>c.id===initialChildId)?initialChildId:selectableChildren[0].id, date:paymentMonth === todayMonth() ? today() : `${paymentMonth}-01`, billingMonth:paymentMonth, method:'cash' });
  const childSelect = $('field-childId'), subjectSelect = $('field-subjectId');
  function updateSubjects() {
    const allowed = new Set(toList(get('children',childSelect.value)?.activityIds));
    [...subjectSelect.options].forEach(option => { option.hidden = !!option.value && !allowed.has(option.value); option.disabled = !!option.value && !allowed.has(option.value); });
    if (subjectSelect.selectedOptions[0]?.disabled) subjectSelect.value = '';
  }
  childSelect.addEventListener('change',updateSubjects); updateSubjects();
  if (old) {
    const actions=$('modalForm').querySelector('.form-actions');
    actions?.insertAdjacentHTML('afterbegin',`<button class="btn danger" type="button" onclick="deleteRecord('payments','${esc(old.id)}','გადახდა','payments')">წაშლა</button>`);
  }
}
function paymentForSubject(childId, subjectId) {
  const child = get('children',childId), subject = get('clubs',subjectId);
  if (!child || !subject || !toList(child.activityIds).includes(subjectId)) return toast('საგანი ბავშვს არ აქვს მინიჭებული');
  const bill = subjectBill(child,subject), billMonth = isCourseCircle(subject) ? bill.courseMonth : paymentMonth;
  openForm(`გადახდა · ${subject.name}`, [{name:'amount',label:'თანხა, ₾',type:'number',required:true},{name:'date',label:'გადახდის თარიღი',type:'date',required:true},{name:'method',label:'გადახდის მეთოდი',type:'select',options:[['cash','ნაღდი'],['transfer','გადარიცხვა'],['card','ბარათი'],['other','სხვა']]}], async values => {
    if (number(values.amount) <= 0) throw new Error('თანხა ნულზე მეტი უნდა იყოს');
    assertOpen(values.date,'გადახდა');
    confirmNotAlreadyPaid(childId, subjectId, billMonth, number(values.amount));
    await dataAdapter.create('payments',{...values,amount:number(values.amount),billingMonth:billMonth,childId,child:child.name,subjectId});
    go(current); toast('გადახდა შენახულია');
  }, {amount:bill.remaining || bill.price || '',date:paymentMonth === todayMonth() ? today() : `${paymentMonth}-01`,method:'cash'});
}
function leadForm(id) {
  const old = id ? get('leads', id) : null;
  openForm(old ? 'Заявка' : 'Новая заявка', [{name:'name',label:'Имя',required:true},{name:'phone',label:'Телефон',type:'tel'},{name:'date',label:'Дата',type:'date',required:true},{name:'source',label:'Источник',type:'select',options:['','Instagram','Facebook','Telegram','Google','Рекомендация','Офлайн','Другое']},{name:'stage',label:'Этап',type:'select',options:leadStages},{name:'active',label:'სტატუსი',type:'select',options:[['true','აქტიური'],['false','არააქტიური']]}], async values => {
    values.active=values.active!=='false';
    if (old) await dataAdapter.update('leads', id, values); else await dataAdapter.create('leads', values);
    go('leads'); toast('Заявка сохранена');
  }, old ? {...old,active:String(isActiveRecord(old,'leads'))} : { date: today(), stage: 'new',active:'true' });
  if (old) $('modalForm').querySelector('.form-actions')?.insertAdjacentHTML('afterbegin',`<button class="btn danger" type="button" onclick="deleteRecord('leads','${esc(old.id)}','${jsq(old.name||'')}','leads')">წაშლა</button>`);
}
async function moveLead(id, stage) { try { await dataAdapter.update('leads', id, {stage}); go('leads'); } catch(error) { toast(error.message); } }
async function toggleTask(id) { const old = get('tasks', id); if (!old) return; try { await dataAdapter.update('tasks', id, {done: !old.done}); go('tasks'); } catch(error) { toast(error.message); } }
async function deleteRecord(kind,id,label,returnView=kind) {
  if (['payments','expenses','attendance','schedule'].includes(kind)) { try { assertOpen(get(kind,id)?.date); } catch (error) { return toast(error.message); } }
  if (!get(kind,id)||!confirm(`წავშალოთ ჩანაწერი „${label||''}“? ეს მოქმედება ვერ გაუქმდება.`)) return;
  try { await dataAdapter.remove(kind,id); closeModal(); go(returnView); toast('ჩანაწერი წაიშალა'); }
  catch (error) { toast(error.message||'ჩანაწერის წაშლა ვერ მოხერხდა'); }
}
async function deleteAttendance(id) {
  const item=get('attendance',id); if (!item) return;
  try { assertOpen(item.date,'დასწრება'); } catch (error) { return toast(error.message); }
  if (!confirm(`წავშალოთ ${item.date||''} დასწრების ჩანაწერი?`)) return;
  try { await dataAdapter.remove('attendance',id); closeModal(); go('attendance'); toast('დასწრების ჩანაწერი წაიშალა'); }
  catch (error) { toast(error.message || 'ჩანაწერის წაშლა ვერ მოხერხდა'); }
}
async function deleteStaff(id) {
  const person=get('staff',id); if (!person) return;
  const linked=teacherCircles(id);
  if (!confirm(`წავშალოთ „${person.name||''}“?${linked.length?` ${linked.length} წრე დარჩება მასწავლებლის გარეშე.`:''}`)) return;
  try {
    for (const circle of linked) await dataAdapter.update('clubs',circle.id,assignmentFields(circleAssignments(circle).filter(item=>item.teacherId!==id)));
    await dataAdapter.remove('staff',id); closeModal(); go('staff'); toast('წაიშალა');
  } catch (error) { toast(error.message||'წაშლა ვერ მოხერხდა'); }
}
async function deleteClub(id) {
  const item=get('clubs',id); if (!item) return;
  const linkedChildren=data.children.filter(child=>toList(child.activityIds).includes(id)).length;
  const linkedRecords=['payments','attendance','schedule'].reduce((sum,kind)=>sum+data[kind].filter(record=>record.subjectId===id).length,0);
  if (linkedChildren||linkedRecords) return toast(`წაშლამდე მოხსენით კავშირები: ${linkedChildren} ბავშვი, ${linkedRecords} ჩანაწერი`);
  if (!confirm(`წავშალოთ წრე „${item.name||''}“?`)) return;
  try { await dataAdapter.remove('clubs',id); closeModal(); go('clubs'); toast('წრე წაიშალა'); }
  catch (error) { toast(error.message || 'წრის წაშლა ვერ მოხერხდა'); }
}

const simpleFields = {
  staff:[{name:'staffType',label:'ვინ არის',type:'select',options:[['teacher','მასწავლებელი / სპეციალისტი'],['staff','პერსონალი (ბუღალტერი, დამლაგებელი…)']]},{name:'name',label:'სახელი და გვარი',required:true},{name:'phone',label:'ტელეფონი',type:'tel'},{name:'role',label:'თანამდებობა'},{name:'active',label:'სტატუსი',type:'select',options:[['true','აქტიური'],['false','არააქტიური']]},{name:'monthlySalary',label:'ბაღის ხელფასი თვეში, ₾ (ერთი თანხა ბაღის ყველა ჯგუფზე)',type:'number'},{name:'teacherCircles',label:'რას უძღვება და როგორ იღებს ანაზღაურებას',type:'teacherCircles',options:[]},{name:'payoutPeriod',label:'ხელფასის გაცემა',type:'select',options:[['month','თვეში ერთხელ'],['week','კვირაში ერთხელ']]},{name:'workDays',label:'სამუშაო დღეები (წინასწარი ჩაწერისთვის)',type:'multi',options:[[1,'ორშ'],[2,'სამ'],[3,'ოთხ'],[4,'ხუთ'],[5,'პარ'],[6,'შაბ'],[0,'კვ']]}],
  expenses:[{name:'title',label:'ხარჯის აღწერა',required:true},{name:'category',label:'კატეგორია',type:'select',options:expenseCategories},{name:'amount',label:'თანხა, ₾',type:'number',required:true},{name:'date',label:'თარიღი',type:'date',required:true}],
  tasks:[{name:'title',label:'Задача',required:true},{name:'due',label:'Срок',type:'date'},{name:'done',label:'Статус',type:'select',options:[['false','Открыта'],['true','Выполнена']]}],
  groups:[{name:'name',label:'Название группы',required:true},{name:'teacher',label:'Педагог'},{name:'schedule',label:'Расписание'}],
  clubs:[{name:'name',label:'წრის დასახელება',required:true},{name:'section',label:'განყოფილება',type:'select',options:[['garden','ბაღი — მასწავლებელს ფიქსირებული ხელფასი'],['circles','წრეები — მასწავლებელს % მიღებული თანხიდან'],['specialists','სპეციალისტები — ანაზღაურება ხელით']]},{name:'audience',label:'ასაკი / სექტორი / პირობები'},{name:'assignments',label:'მასწავლებლები და მათი ანაზღაურება ამ წრეზე',type:'assignments',options:[]},{name:'billingType',label:'მშობლის გადახდის ტიპი',type:'select',options:[['monthly','თვიური'],['per_lesson','ერთჯერადი · დასწრებაზე'],['flexible','თვიური ან ერთჯერადი'],['course','კურსი · ერთჯერადი ფასი მთელ კურსზე']]},{name:'coursePrice',label:'კურსის ფასი, ₾',type:'number'},{name:'weekdays',label:'კვირის დღეები',type:'multi',options:[[1,'ორშაბათი'],[2,'სამშაბათი'],[3,'ოთხშაბათი'],[4,'ხუთშაბათი'],[5,'პარასკევი'],[6,'შაბათი'],[0,'კვირა']]},{name:'timeSlots',label:'დროები, მძიმით გამოყოფილი'},{name:'schedule',label:'განრიგის მოკლე აღწერა'},{name:'appointmentOnly',label:'ჩაწერა',type:'select',options:[['false','ფიქსირებული განრიგი'],['true','წინასწარი ჩაწერით']]},{name:'tariff',label:'თვიური ფასი, ₾',type:'number'},{name:'tariffOptions',label:'თვიური ტარიფების არჩევანი, ₾ (მძიმით, მაგ. 200, 300)'},{name:'lessonRate',label:'ერთჯერადი ფასი / გაკვეთილი, ₾',type:'number'},{name:'kindergartenRate',label:'კრაფტი — ბაღის ბავშვის ფასი, ₾',type:'number'},{name:'externalRate',label:'კრაფტი — გარე ბავშვის ფასი, ₾',type:'number'},],
  schedule:[{name:'name',label:'Занятие',required:true},{name:'group',label:'Группа'},{name:'date',label:'Дата',type:'date',required:true},{name:'time',label:'Время',type:'time'}],
  attendance:[{name:'childId',label:'ბავშვი',type:'select',options:[],required:true},{name:'subjectId',label:'წრე',type:'select',options:[],required:true},{name:'date',label:'თარიღი',type:'date',required:true},{name:'status',label:'სტატუსი',type:'select',options:[['present','დაესწრო'],['absent','არ დაესწრო']]}],
};
function editSimple(kind, id, initialOverride = null) {
  const old = id ? get(kind, id) : null;
  const craftFields = new Set(['kindergartenRate','externalRate']);
  const attendanceSubject=kind==='attendance'?(old?.subjectId||initialOverride?.subjectId):'';
  const attendancePool=activePeople('children');
  const attendanceChildren=attendanceSubject?attendancePool.filter(child=>toList(child.activityIds).includes(attendanceSubject)):attendancePool;
  const selectableStaff=activePeople('staff',teacherStaff());
  if (kind==='clubs') circleAssignments(old).forEach(item=>{ if (!selectableStaff.some(person=>person.id===item.teacherId)) { const assigned=get('staff',item.teacherId); if (assigned) selectableStaff.push(assigned); } });
  const fields = simpleFields[kind]?.filter(field => kind !== 'clubs' || isCraftCircle(old) || !craftFields.has(field.name)).map(field => field.name === 'childId' && kind === 'attendance' ? {...field,options:attendanceChildren.map(c=>[c.id,c.name])} : field.name === 'subjectId' && kind === 'attendance' ? {...field,options:data.clubs.map(circle=>[circle.id,circle.name])} : field.name === 'teacherCircles' && kind === 'staff' ? {...field,options:data.clubs.map(circle=>[circle.id,circle.name,circleAssignments(circle).filter(item=>item.teacherId!==old?.id).map(item=>get('staff',item.teacherId)?.name).filter(Boolean).join(', '),circleSection(circle),optNumber(circle.teacherPercent)??50])} : field.name === 'assignments' && kind === 'clubs' ? {...field,options:selectableStaff.map(person=>[person.id,`${person.name}${isActiveRecord(person,'staff')?'':' · არააქტიური'}`])} : field);
  if (!fields) return;
  if (kind === 'attendance' && !attendanceChildren.length) return toast('აქტიური ბავშვები ამ წრეში არ არიან');
  openForm(old ? 'Изменить запись' : 'Новая запись', fields, async values => {
    if (kind === 'tasks') values.done = values.done === 'true';
    if (['expenses','attendance'].includes(kind)) { if (old) assertOpen(old.date); assertOpen(values.date); }
    let staffSubjects=null;
    if (kind === 'staff') { if (values.staffType==='staff') { values.payType='monthly'; values.teacherCircles={}; } staffSubjects=values.teacherCircles||{}; delete values.teacherCircles; if (!values.role.trim()) values.role = values.staffType==='staff' ? 'პერსონალი' : 'მასწავლებელი'; values.active=values.active!=='false'; if (old && isActiveRecord(old,'staff') && !values.active) values.inactiveFrom=today(); if (values.active) values.inactiveFrom=''; ['lessonRate','revenueShare','monthlySalary','weeklyRate'].forEach(key=>values[key]=number(values[key])); if (values.revenueShare<0||values.revenueShare>100) throw new Error('პროცენტი უნდა იყოს 0-დან 100-მდე'); values.workDays=(values.workDays||[]).map(Number); }
    if (kind === 'expenses') { values.amount = number(values.amount); if (initialOverride?.sourceRow) Object.assign(values, {sourceRow:initialOverride.sourceRow,sourceColumn:initialOverride.sourceColumn,sourceRaw:initialOverride.sourceRaw}); if (initialOverride?.staffId) values.staffId=initialOverride.staffId; else if (old?.staffId) values.staffId=old.staffId; if (initialOverride?.eventId) values.eventId=initialOverride.eventId; else if (old?.eventId) values.eventId=old.eventId; }
    if (kind === 'clubs') { values.appointmentOnly=values.appointmentOnly==='true'; values.coursePrice=optNumber(values.coursePrice); values.tariffOptions=String(values.tariffOptions||'').split(/[,;\s]+/).map(Number).filter(n=>Number.isFinite(n)&&n>0); if (!values.tariff&&values.tariffOptions.length) values.tariff=values.tariffOptions[0]; values.assignments=(values.assignments||[]).map(item=>values.section==='garden'?{...item,payType:'',amount:null,percent:null}:values.section==='circles'?{...item,payType:'percent',amount:null}:item); Object.assign(values, assignmentFields(values.assignments)); if (values.section==='circles') values.teacherPercent=values.assignments[0]?.percent??50; values.weekdays=(values.weekdays||[]).map(Number); values.timeSlots=String(values.timeSlots||'').split(',').map(value=>value.trim()).filter(Boolean); values.tariff = values.tariff === '' ? null : number(values.tariff); values.lessonRate=values.lessonRate===''?null:number(values.lessonRate); if ('kindergartenRate' in values) values.kindergartenRate=values.kindergartenRate===''?30:number(values.kindergartenRate); if ('externalRate' in values) values.externalRate=values.externalRate===''?40:number(values.externalRate); }
    if (kind === 'attendance') { const child=get('children',values.childId); values.name=child?.name||''; if (!old&&data.attendance.some(item=>item.childId===values.childId&&item.subjectId===values.subjectId&&dateKey(item.date)===values.date)) throw new Error('ამ ბავშვის დასწრება ამ დღისთვის უკვე მონიშნულია'); }
    const saved = old ? await dataAdapter.update(kind, id, values) : await dataAdapter.create(kind, values);
    if (staffSubjects) {
      for (const circle of data.clubs) {
        const list=circleAssignments(circle), mine=list.find(item=>item.teacherId===saved.id), want=staffSubjects[circle.id];
        let next=null;
        if (want&&!mine) next=[...list,{teacherId:saved.id,...want}];
        else if (want&&mine&&(mine.payType!==want.payType||mine.amount!==want.amount||mine.percent!==want.percent)) next=list.map(item=>item.teacherId===saved.id?{teacherId:saved.id,...want}:item);
        else if (!want&&mine) next=list.filter(item=>item.teacherId!==saved.id);
        if (next) await dataAdapter.update('clubs',circle.id,assignmentFields(next));
      }
    }
    go((kind==='attendance'||kind==='expenses')&&current!=='attendance'&&current!=='expenses'?current:kind); toast('Запись сохранена');
  }, old ? (kind==='clubs'&&isCraftCircle(old)?{...old,section:circleSection(old),assignments:circleAssignments(old),billingType:'per_lesson',kindergartenRate:old.kindergartenRate??30,externalRate:old.externalRate??40,timeSlots:toList(old.timeSlots).join(', ')}:kind==='clubs'?{...old,tariffOptions:monthlyTariffs(old).join(', '),section:circleSection(old),assignments:circleAssignments(old),appointmentOnly:String(isAppointmentCircle(old)),timeSlots:toList(old.timeSlots).join(', ')}:kind==='staff'?{...old,staffType:old.staffType||(isPersonnel(old)?'staff':'teacher'),payType:teacherDefault(old).type,payoutPeriod:old.payoutPeriod||'month',workDays:toList(old.workDays),active:String(isActiveRecord(old,'staff')),teacherCircles:Object.fromEntries(teacherCircles(old.id).map(circle=>[circle.id,assignmentOf(circle,old.id)]))}:old) : initialOverride || { date:today(),done:'false',role:kind==='staff'?'მასწავლებელი':'',active:kind==='staff'?'true':undefined,staffType:kind==='staff'?(staffTab==='personnel'?'staff':'teacher'):'',payType:kind==='staff'?'monthly':'',teacherCircles:kind==='staff'?{}:undefined,payoutPeriod:kind==='staff'?'month':'',billingType:kind==='clubs'?'monthly':'',section:kind==='clubs'?sectionTab:undefined,weekdays:kind==='clubs'?[]:undefined,kindergartenRate:kind==='clubs'?30:'',externalRate:kind==='clubs'?40:'',status:kind==='attendance'?'present':'' });
  if (old && kind === 'attendance') {
    const actions=$('modalForm').querySelector('.form-actions');
    actions?.insertAdjacentHTML('afterbegin',`<button class="btn danger" type="button" onclick="deleteAttendance('${esc(old.id)}')">წაშლა</button>`);
  }
  if (old && ['expenses','tasks','schedule'].includes(kind)) {
    const actions=$('modalForm').querySelector('.form-actions');
    actions?.insertAdjacentHTML('afterbegin',`<button class="btn danger" type="button" onclick="deleteRecord('${esc(kind)}','${esc(old.id)}','${jsq(old.title||old.name||old.date||'ჩანაწერი')}','${kind==='schedule'?'schedule':kind}')">წაშლა</button>`);
  }
  if (kind === 'clubs') {
    const billing=$('field-billingType');
    const syncBilling=()=>{ const t=billing?.value; const show=(name,on)=>{ const node=$('modalForm').querySelector(`[name="${name}"]`)?.closest('.field'); if (node) node.hidden=!on; };
      show('tariff',t==='monthly'||t==='flexible'); show('tariffOptions',t==='flexible'); show('lessonRate',t==='per_lesson'||t==='flexible'); show('coursePrice',t==='course'); };
    billing?.addEventListener('change',syncBilling); syncBilling();
  }
  if (kind === 'staff') {
    const typeSelect=$('field-staffType');
    const show=(name,on)=>{ const node=$('modalForm').querySelector(`[name="${name}"]`)?.closest('.field'); if (node) node.hidden=!on; };
    const sync=()=>{ const personnel=typeSelect.value==='staff';
      show('workDays',!personnel); const tc=$('modalForm').querySelector('.tc-list')?.closest('.field'); if (tc) tc.hidden=personnel;
      const salaryLabel=$('modalForm').querySelector('label[for="field-monthlySalary"]'); if (salaryLabel) salaryLabel.textContent=personnel?'ხელფასი თვეში, ₾':'ბაღის ხელფასი თვეში, ₾ (ერთი თანხა ბაღის ყველა ჯგუფზე)';
      const role=$('field-role'); if (role&&!role.value) role.placeholder=personnel?'ბუღალტერი, დამლაგებელი…':'მასწავლებელი'; };
    typeSelect?.addEventListener('change',sync); sync();
  }
  if (old && kind === 'staff') {
    const actions=$('modalForm').querySelector('.form-actions');
    actions?.insertAdjacentHTML('afterbegin',`<button class="btn danger" type="button" onclick="deleteStaff('${esc(old.id)}')">წაშლა</button>`);
  }
  if (old && kind === 'clubs') {
    const actions=$('modalForm').querySelector('.form-actions');
    actions?.insertAdjacentHTML('afterbegin',`<button class="btn danger" type="button" onclick="deleteClub('${esc(old.id)}')">წრის წაშლა</button>`);
  }
}
function addTomatisSession() {
  const subject=tomatisCircle(), children=activePeople('children');
  if (!subject) return toast('Tomatis-ის მომსახურება ჯერ არ არის დამატებული');
  if (!children.length) return toast('აქტიური ბავშვები არ არიან');
  const course=isCourseCircle(subject);
  openForm('Tomatis · პროცედურის დამატება',[
    {name:'childId',label:'ბავშვი',type:'select',required:true,options:children.map(child=>[child.id,child.name])},
    {name:'date',label:'პროცედურის თარიღი',type:'date',required:true},
    ...(course?[]:[{name:'price',label:'ერთი პროცედურის ფასი, ₾',type:'number',required:true}]),
  ],async values=>{
    const child=get('children',values.childId),price=number(values.price);
    if (!child||(!course&&price<=0)) throw new Error('მიუთითეთ ბავშვი და სწორი ფასი');
    assertOpen(values.date,'დასწრება');
    if (course) {
      if (data.attendance.some(item=>item.childId===child.id&&item.subjectId===subject.id&&dateKey(item.date)===values.date&&wasPresent(item))) throw new Error('ამ დღეს Tomatis-ის პროცედურა უკვე დამატებულია');
      if (!toList(child.activityIds).includes(subject.id)) await dataAdapter.update('children',child.id,{activityIds:[...toList(child.activityIds),subject.id],activityStart:withStart(child,[subject.id])});
      await dataAdapter.create('attendance',{childId:child.id,name:child.name,subjectId:subject.id,date:values.date,status:'present',serviceType:'tomatis'});
      go(current); toast(`პროცედურა დამატებულია · კურსი ${money(subjectBill(get('children',child.id),subject).price)}`); return;
    }
    if (data.attendance.some(item=>item.childId===child.id&&item.subjectId===subject.id&&item.date===values.date&&wasPresent(item))) throw new Error('ამ დღეს Tomatis-ის პროცედურა უკვე დამატებულია');
    const activityIds=[...new Set([...toList(child.activityIds),subject.id])];
    const activityPrices={...(child.activityPrices||{}),[subject.id]:price};
    const activityBillingModes={...(child.activityBillingModes||{}),[subject.id]:'per_lesson'};
    await dataAdapter.update('children',child.id,{activityIds,activityPrices,activityBillingModes});
    await dataAdapter.create('attendance',{childId:child.id,name:child.name,subjectId:subject.id,date:values.date,status:'present',serviceType:'tomatis'});
    go('attendance'); toast('Tomatis-ის პროცედურა დამატებულია');
  },{childId:children[0].id,date:today(),price:children[0].activityPrices?.[subject.id]??subject.lessonRate??''});
}
function quickAdd() {
  $("modalTitle").textContent = 'დამატება';
  $("modalForm").onsubmit = event => event.preventDefault();
  $("modalForm").innerHTML = `<div class="quick-add">
    <button type="button" class="quick-add-button" onclick="quickAddAction('child')"><span class="quick-add-icon" style="--action-bg:#eaf3ff;--action-color:#176fe5"><svg viewBox="0 0 24 24"><circle cx="10" cy="8" r="3"/><path d="M4 19c.6-4 2.6-6 6-6s5.4 2 6 6M19 8v6M16 11h6"/></svg></span><span class="quick-add-copy"><b>ახალი ბავშვი</b><small>ბარათი, მშობელი, საგნები და ტარიფი</small></span><span class="quick-add-arrow">›</span></button>
    <button type="button" class="quick-add-button" onclick="quickAddAction('payment')"><span class="quick-add-icon" style="--action-bg:#e5f8eb;--action-color:#169049"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 10h18M8 15h4"/></svg></span><span class="quick-add-copy"><b>გადახდა</b><small>ბავშვი, საგანი, თანხა და თარიღი</small></span><span class="quick-add-arrow">›</span></button>
    <button type="button" class="quick-add-button" onclick="quickAddAction('expense')"><span class="quick-add-icon" style="--action-bg:#fff0f6;--action-color:#d82f87"><svg viewBox="0 0 24 24"><path d="M4 7h16v12H4zM4 10h16M8 15h5"/><path d="M8 4v3M16 4v3"/></svg></span><span class="quick-add-copy"><b>ხარჯი</b><small>კატეგორია, თანხა და თარიღი</small></span><span class="quick-add-arrow">›</span></button>
    <button type="button" class="quick-add-button" onclick="quickAddAction('event')"><span class="quick-add-icon" style="--action-bg:#fff0e0;--action-color:#c2620a"><svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/></svg></span><span class="quick-add-copy"><b>მასტერკლასი</b><small>ფასი, წამყვანის წილი და ბავშვები</small></span><span class="quick-add-arrow">›</span></button>
    <button type="button" class="quick-add-button" onclick="quickAddAction('dropin')"><span class="quick-add-icon" style="--action-bg:#fff6dd;--action-color:#b07800"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3"/><path d="M6 20c.6-4 2.6-6 6-6s5.4 2 6 6"/><path d="M18 4v4M16 6h4"/></svg></span><span class="quick-add-copy"><b>ერთჯერადი ვიზიტი</b><small>მოვიდა და გადაიხადა — მაგ. ინგლისური კლუბი ₾60</small></span><span class="quick-add-arrow">›</span></button>
    <button type="button" class="quick-add-button" onclick="quickAddAction('tomatis')"><span class="quick-add-icon" style="--action-bg:#eeeaff;--action-color:#6a46d8"><svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="7"/></svg></span><span class="quick-add-copy"><b>Tomatis პროცედურა</b><small>ბავშვი, თარიღი და ინდივიდუალური ფასი</small></span><span class="quick-add-arrow">›</span></button>
  </div>`;
  translateUi($("modalForm"));
  $("modal").classList.remove('hidden');
}
function quickAddAction(type) {
  closeModal();
  setTimeout(() => ({child:childForm,payment:paymentForm,expense:()=>editSimple('expenses'),tomatis:addTomatisSession,dropin:()=>dropInForm(),event:()=>eventForm()}[type]?.()), 90);
}
async function importSheet() {
  if (!confirm('Обновить все исходные колонки A–L из таблицы за сентябрь 2026? Изменённые карточки детей не будут перезаписаны.')) return;
  try {
    const result = await api('/api/import', { method:'POST', body:'{}' });
    await loadData();
    toast(`Синхронизировано ${result.sourceRows} строк. Новых детей: ${result.added}.`);
  } catch(error) { toast(error.message); }
}

boot();
