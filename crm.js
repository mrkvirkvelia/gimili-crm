// Made with Claude (Anthropic) · © Homes in Georgia · Created by Irakli Kvirkvelia
const sections = ["children", "staff", "leads", "payments", "expenses", "tasks", "groups", "clubs", "schedule", "attendance"];
let data = Object.fromEntries(sections.map(key => [key, []]));
let sourceRows = [];
let signedInUser = null;
let current = "children";
let period = "month";
let customPeriod = null;
let currentChildId = null;
let expenseCategory = 'all';
let paymentMonth = todayMonth();
let calendarMonth = todayMonth();
let calendarSelected = localDate();
let participantStatusFilter = 'all';
const expenseCategories = ['კომუნალური მომსახურება', 'საკანცელარიო ნივთები', 'ხელფასები', 'ქირა', 'რეკლამა', 'სასწავლო მასალები', 'კვება', 'რემონტი და აღჭურვილობა', 'გადასახადები და საკომისიოები', 'სხვა'];
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
  ['Новый ребёнок','ახალი ბავშვი'],['Новый платёж','ახალი გადახდა'],['Расход','ხარჯი'],['Новая запись','ახალი ჩანაწერი'],['Изменить запись','ჩანაწერის შეცვლა'],['Рабочий кабинет','სამუშაო კაბინეტი'],['CRM центра','ცენტრის CRM'],['Диана Давидова','დიანა დავითოვა']
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
const teacherName = subject => get('staff', subject.teacherId)?.name || subject.teacher || 'Преподаватель не назначен';
const enrolledSubjects = child => (child.activityIds || []).map(id => get('clubs', id)).filter(Boolean);
const isCraftCircle = subject => /крафт|craft|კრაფტ/i.test(String(subject?.name || ''));
const isTomatisCircle = subject => /tomatis|томатис|ტომატის/i.test(String(subject?.name || ''));
const tomatisCircle = () => data.clubs.find(isTomatisCircle);
const isFlexibleCircle = subject => subject?.billingType === 'flexible' || /английский клуб|english club|ინგლისური კლუბ/i.test(String(subject?.name || ''));
const childBillingMode = (child, subject) => child?.activityBillingModes?.[subject.id] || (isFlexibleCircle(subject) ? '' : subject?.billingType || 'monthly');
const isPerLessonCircle = (subject, child = null) => isCraftCircle(subject) || subject?.billingType === 'per_lesson' || (isFlexibleCircle(subject) && childBillingMode(child,subject) === 'per_lesson');
const isKindergartenChild = child => /садик|мини[-\s]?сад|ბაღ|kindergarten/i.test(String([child?.group,child?.clubs].filter(Boolean).join(' '))) || [350,450].includes(number(child?.tariff));
const participantType = (child, subject) => child.activityParticipantTypes?.[subject.id] || (isCraftCircle(subject) && isKindergartenChild(child) ? 'kindergarten' : '');
const participantTypeLabel = value => value === 'kindergarten' ? 'ბაღის ბავშვი' : value === 'external' ? 'გარე ბავშვი' : 'ტიპი დასაზუსტებელია';
const wasPresent = attendance => ['present','Был','იყო'].includes(attendance.status);
const attendanceStatusLabel = value => wasPresent({status:value}) ? 'დაესწრო' : ['absent','Не был','არ იყო'].includes(value) ? 'არ დაესწრო' : value || 'სტატუსი არ არის';
function lessonAttendanceCount(child, subject, month) {
  return data.attendance.filter(item => monthKey(item.date) === month && wasPresent(item) && item.subjectId === subject.id && (item.childId === child.id || (!item.childId && item.name === child.name))).length;
}
function perLessonRate(child, subject) {
  const override = child.activityPrices?.[subject.id];
  if (isFlexibleCircle(subject) && override !== undefined && override !== '') return number(override);
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
function billingDate(child, month) {
  const targetDay = day(child.paymentDay) || 1;
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  return `${month}-${String(Math.min(targetDay,lastDay)).padStart(2,'0')}`;
}
function billingRows(month = paymentMonth) {
  return activePeople('children', data.children).flatMap(child => {
    const subjects = enrolledSubjects(child);
    const rows=subjects.map(subject => ({child,subject,...subjectBill(child,subject,month)}));
    const includeBaseTariff=child.tariff !== null && child.tariff !== undefined && child.tariff !== '' && (!subjects.length || isKindergartenChild(child));
    if (!includeBaseTariff) return rows;
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
    const action = url === '/api/login' ? 'login' : url === '/api/logout' ? 'logout' : url === '/api/import' ? 'import' : method === 'GET' ? 'list' : method === 'POST' ? 'create' : method === 'PUT' ? 'update' : method === 'DELETE' ? 'delete' : '';
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

async function loadData() {
  const body = await api("/api/records");
  signedInUser = body.user;
  data = Object.fromEntries(sections.map(key => [key, body.records?.[key] || []]));
  sourceRows = body.sourceRows || [];
  $("role").textContent = "სამუშაო კაბინეტი";
  document.querySelector(".brand b").textContent = signedInUser.name || signedInUser.email;
  document.querySelector(".avatar").textContent = "Д";
  document.querySelector(".avatar").classList.remove("hidden");
  document.querySelector(".nav").classList.remove("hidden");
  renderDrawer();
  go(current);
}

async function ensureBillingCatalog() {
  const catalog = [
    { match:item=>/მინი-ბაღი.*10:00.*14:00|мини-сад.*10:00.*14:00/i.test(item.name||''), name:'მინი-ბაღი · 10:00–14:00', audience:'მინი-ბაღი', billingType:'monthly', tariff:350, lessonRate:null, weekdays:[1,2,3,4,5], timeSlots:['10:00–14:00'], schedule:'ორშ–პარ · 10:00–14:00', teacherPayType:'', teacherPercent:null, teacherRate:null },
    { match:item=>/მინი-ბაღი.*10:00.*16:00|мини-сад.*10:00.*16:00/i.test(item.name||''), name:'მინი-ბაღი · 10:00–16:00', audience:'მინი-ბაღი', billingType:'monthly', tariff:450, lessonRate:null, weekdays:[1,2,3,4,5], timeSlots:['10:00–16:00'], schedule:'ორშ–პარ · 10:00–16:00', teacherPayType:'', teacherPercent:null, teacherRate:null },
    { match:item=>/субботн.*(грузин|сад)|შაბათ.*(ქართულ|ბაღ)/i.test(item.name||''), name:'შაბათის ბაღი', audience:'საბავშვო პროგრამა', billingType:'per_lesson', tariff:null, lessonRate:40, weekdays:[6], timeSlots:['11:00–15:00'], schedule:'შაბათი · 11:00–15:00', teacherPayType:'percent', teacherPercent:50, teacherRate:null },
    { match:item=>item.id==='sheet-activity-georgian'||/წინასასკოლო მომზადება|подготовк.*школ/i.test(item.name||''), name:'წინასასკოლო მომზადება · ქართული სექტორი', audience:'ქართული სექტორი', billingType:'monthly', tariff:200, lessonRate:null, weekdays:[1,3,5], timeSlots:['16:30–18:00'], schedule:'ორშ / ოთხ / პარ · 16:30–18:00', teacherPayType:'percent', teacherPercent:50, teacherRate:null },
    { match:item=>/განვითარება 4.?5|ზოგადი განვითარება|развивашка|общее развитие/i.test(item.name||''), name:'განვითარება 4–5 წლის', audience:'4–5 წლის', billingType:'monthly', tariff:150, lessonRate:null, weekdays:[2,4], timeSlots:['16:30–17:30'], schedule:'სამ / ხუთ · 16:30–17:30', teacherPayType:'percent', teacherPercent:50, teacherRate:null },
    { match:item=>item.id==='sheet-activity-english'||/английский клуб|english club|ინგლისური კლუბ/i.test(item.name||''), name:'ინგლისური კლუბი 4+', audience:'4+ წლის', billingType:'flexible', tariff:200, lessonRate:60, weekdays:[6], timeSlots:['11:00–15:00'], schedule:'შაბათი · 11:00–15:00', teacherPayType:'percent', teacherPercent:50, teacherRate:null },
    { match:item=>/ინგლისურის გაკვეთილები|ინგლისური ენა|уроки английского|английский язык/i.test(item.name||''), name:'ინგლისური ენა', audience:'ბავშვები', billingType:'monthly', tariff:100, lessonRate:null, weekdays:[6], timeSlots:['11:00'], schedule:'შაბათი · 11:00', teacherPayType:'percent', teacherPercent:50, teacherRate:null },
    { match:item=>/მენტალური არითმეტიკა|ментальн.*арифмет/i.test(item.name||''), name:'მენტალური არითმეტიკა', audience:'ბავშვები', billingType:'monthly', tariff:150, lessonRate:null, weekdays:[6], timeSlots:['11:00','12:00','13:00'], schedule:'შაბათი · 11:00 / 12:00 / 13:00', teacherPayType:'percent', teacherPercent:50, teacherRate:null },
    { match:item=>/ლოგოპედის კონსულტაცია|ეკას კონსულტაცია|консультац.*(логопед|эк)/i.test(item.name||''), name:'ლოგოპედის კონსულტაცია', audience:'წინასწარი ჩაწერით', billingType:'per_lesson', tariff:null, lessonRate:100, weekdays:[], timeSlots:[], schedule:'წინასწარი ჩაწერით', appointmentOnly:true, teacherPayType:'per_lesson', teacherAccrualBasis:'attendance', teacherRate:50, teacherPercent:null },
    { match:item=>/ლოგოპედის გაკვეთილი|მეტყველების თერაპევტი|речев.*терапевт|логопед.*урок/i.test(item.name||''), name:'ლოგოპედის გაკვეთილი', audience:'წინასწარი ჩაწერით', billingType:'per_lesson', tariff:null, lessonRate:40, weekdays:[], timeSlots:[], schedule:'წინასწარი ჩაწერით', appointmentOnly:true, teacherPayType:'per_lesson', teacherAccrualBasis:'attendance', teacherRate:25, teacherPercent:null },
    { match:item=>/ლოგოპედი და ქცევა|მეტყველება.*ქცევის თერაპია|речев.*поведен/i.test(item.name||''), name:'ლოგოპედი და ქცევა', audience:'წინასწარი ჩაწერით', billingType:'per_lesson', tariff:null, lessonRate:50, weekdays:[], timeSlots:[], schedule:'წინასწარი ჩაწერით', appointmentOnly:true, teacherPayType:'per_lesson', teacherAccrualBasis:'attendance', teacherRate:30, teacherPercent:null },
    { match:item=>/ტომატის|томатис/i.test(item.name||''), name:'ტომატისი', audience:'წინასწარი ჩაწერით', billingType:'per_lesson', tariff:null, lessonRate:null, weekdays:[], timeSlots:[], schedule:'წინასწარი ჩაწერით', appointmentOnly:true, teacherPayType:'', teacherPercent:null, teacherRate:null },
  ];
  let changed=false;
  const craft=data.clubs.find(isCraftCircle);
  if (craft && craft.billingCatalogVersion !== 5) {
    await dataAdapter.update('clubs',craft.id,{name:'კრაფტი',audience:'ბაღის და გარე ბავშვები',billingType:'per_lesson',tariff:null,lessonRate:null,kindergartenRate:30,externalRate:40,weekdays:[4],timeSlots:['14:00','16:00'],schedule:'ხუთშაბათი · 14:00 / 16:00',teacherPayType:'percent',teacherPercent:50,teacherRate:null,billingCatalogVersion:5});
    changed=true;
  }
  for (const entry of catalog) {
    const matches=data.clubs.filter(entry.match);
    const existing=matches.find(item=>item.billingCatalogVersion===5)||matches[0];
    const {match,...record}=entry;
    if (!existing) {
      await dataAdapter.create('clubs',{...record,teacherId:'',teacher:'',importSource:'Добавлено по запросу',billingCatalogVersion:5});
      changed=true;
    } else if (existing.billingCatalogVersion !== 5) {
      await dataAdapter.update('clubs',existing.id,{...record,billingCatalogVersion:5});
      changed=true;
    }
  }
  if (changed) { renderDrawer(); go(current); }
}

async function boot() {
  $("role").textContent = "ცენტრის CRM";
  document.querySelector(".brand b").textContent = "ღიმილი";
  document.querySelector(".avatar").classList.add("hidden");
  document.querySelector(".nav").classList.add("hidden");
  const splashSafetyTimer = setTimeout(() => $("splash")?.classList.add("done"), 4500);
  try {
    await loadData();
    $("splash")?.classList.add("done");
    if (!sourceRows.length) {
      try {
        const result = await api('/api/import', { method:'POST', body:'{}' });
        await loadData();
        if (result.sourceRows) toast(`Из таблицы обновлено ${result.sourceRows} строк`);
      } catch (error) { toast('Таблица пока не импортирована: откройте Настройки и повторите'); }
    }
    try { await ensureBillingCatalog(); }
    catch (error) { toast('ტარიფების კატალოგის განახლება ვერ მოხერხდა'); }
  }
  catch (error) {
    const denied = error.status === 403;
    $("view").innerHTML = `<section class="access-card card"><img src="./assets/logo.png" alt="ღიმილი"><h1>${denied ? "Нет доступа к записям" : error.status === 401 ? "Рабочая CRM" : "Не удалось загрузить данные"}</h1><p>${denied ? "Записи детей и контакты доступны только Диане и владельцу." : error.status === 401 ? "Войдите по разрешённому email и паролю." : "Данные не потеряны. Проверьте соединение и повторите попытку."}</p>${error.status === 401 || denied ? '<a class="btn access-button" href="./login.html">Войти в CRM</a>' : '<button class="btn" onclick="boot()">Повторить</button>'}</section>`;
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

const dataAdapter = {
  async list(kind) { return structuredClone(data[kind] || []); },
  async create(kind, record) {
    const result = await api("/api/records", { method: "POST", body: JSON.stringify({ kind, record }) });
    const item = { ...record, id: result.id };
    data[kind].unshift(item);
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
    await api("/api/records", { method: "PUT", body: JSON.stringify({ id, kind, record: item }) });
    data[kind][data[kind].findIndex(x => x.id === id)] = item;
    return item;
  },
  async remove(kind, id) {
    await api("/api/records", { method: "DELETE", body: JSON.stringify({ kind, id }) });
    data[kind] = data[kind].filter(item => item.id !== id);
  },
  async sync() { return { provider: "CRM", status: "Данные сохранены в общей базе", sheets: "Импорт по запросу" }; },
};
window.GimiliDataAdapter = dataAdapter;

function go(view) {
  if (!signedInUser) return;
  current = view;
  toggleDrawer(false);
  const primaryViews = new Set(['children','payments','expenses']);
  document.querySelectorAll(".nav button[data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === view || (view === 'childProfile' && button.dataset.view === 'children')));
  const more = document.querySelector('.nav button[data-nav="more"]');
  if (more) more.classList.toggle('active', !primaryViews.has(view) && view !== 'childProfile');
  $("view").innerHTML = (views[view] || views.dashboard)();
  translateUi($("view"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function head(title, subtitle, action = "") {
  const addLivesInBottomBar = ['children', 'payments', 'expenses'].includes(current);
  return `<div class="page-head"><div><div class="eyebrow">${esc(subtitle)}</div><h1>${esc(title)}</h1></div>${addLivesInBottomBar ? '' : action}</div>`;
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
  const key=dateKey(value);
  if (!key) return false;
  const date = new Date(`${key}T12:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const end = period === "custom" && customPeriod ? new Date(`${customPeriod.to}T23:59:59`) : new Date();
  return date >= periodStart() && date <= end;
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
function heldLessonDates(subjectId,match) {
  const cancelled=new Set(data.schedule.filter(item=>item.subjectId===subjectId&&item.status==='cancelled'&&match(item)).map(item=>dateKey(item.date)));
  const held=new Set();
  data.schedule.filter(item=>item.subjectId===subjectId&&item.status==='held'&&match(item)).forEach(item=>held.add(`${dateKey(item.date)}|${item.time||''}`));
  const heldDays=new Set([...held].map(key=>key.split('|')[0]));
  data.attendance.filter(item=>item.subjectId===subjectId&&wasPresent(item)&&match(item)).forEach(item=>{const key=dateKey(item.date);if(key&&!heldDays.has(key)&&!cancelled.has(key)){held.add(`${key}|`);heldDays.add(key);}});
  return held.size;
}
function subjectTeacherAccrual(subject,person,paymentMatch,scheduleMatch) {
  const type=subject.teacherPayType||person.payType||'per_lesson';
  if (type==='percent') {
    const share=subject.teacherPercent==null||subject.teacherPercent===''?person.revenueShare:subject.teacherPercent;
    const revenue=data.payments.filter(item=>item.subjectId===subject.id&&paymentMatch(item)).reduce((sum,item)=>sum+number(item.amount),0);
    return revenue*number(share)/100;
  }
  const rate=subject.teacherRate==null||subject.teacherRate===''?person.lessonRate:subject.teacherRate;
  const lessons=subject.teacherAccrualBasis==='attendance'
    ? data.attendance.filter(item=>item.subjectId===subject.id&&wasPresent(item)&&scheduleMatch(item)).length
    : heldLessonDates(subject.id,scheduleMatch);
  return lessons*number(rate);
}
function teacherRuleLabel(subject,person=get('staff',subject.teacherId)||{}) {
  if (!subject.teacherId) return 'მასწავლებელი და ანაზღაურება დასაზუსტებელია';
  const type=subject.teacherPayType||person.payType||'per_lesson';
  if (type==='percent') return `მასწავლებელს: ${number(subject.teacherPercent==null||subject.teacherPercent===''?person.revenueShare:subject.teacherPercent)}% მიღებული თანხიდან`;
  return `მასწავლებელს: ${money(subject.teacherRate==null||subject.teacherRate===''?person.lessonRate:subject.teacherRate)} / ჩატარებული გაკვეთილი`;
}
function teacherFinance(person) {
  const subjects = data.clubs.filter(subject => subject.teacherId === person.id);
  const subjectIds = new Set(subjects.map(subject => subject.id));
  const payments = data.payments.filter(item => subjectIds.has(item.subjectId) && inPeriod(item.date));
  const revenue = payments.reduce((sum,item) => sum + number(item.amount),0);
  const attendanceBased=new Set(subjects.filter(subject=>subject.teacherAccrualBasis==='attendance').map(subject=>subject.id));
  const lessons = subjects.filter(subject=>!attendanceBased.has(subject.id)).reduce((sum,subject)=>sum+heldLessonDates(subject.id,item=>inPeriod(item.date)),0);
  const attendedLessons=data.attendance.filter(item=>attendanceBased.has(item.subjectId)&&wasPresent(item)&&inPeriod(item.date));
  let accrued = 0;
  if (person.payType === 'fixed' && !subjects.some(subject=>subject.teacherPayType)) accrued = number(person.monthlySalary) * periodMonthCount();
  else accrued = subjects.reduce((sum,subject)=>sum+subjectTeacherAccrual(subject,person,item=>inPeriod(item.date),item=>inPeriod(item.date)),0);
  return {subjects, revenue, lessons:lessons+attendedLessons.length, accrued};
}
function accountingTotals() {
  const income = data.payments.filter(item => inPeriod(item.date)).reduce((sum,item) => sum+number(item.amount),0);
  const periodExpenses = data.expenses.filter(item => inPeriod(item.date));
  const paidSalaries = periodExpenses.filter(item => expenseCategoryLabel(item.category) === 'ხელფასები').reduce((sum,item) => sum+number(item.amount),0);
  const otherExpenses = periodExpenses.filter(item => expenseCategoryLabel(item.category) !== 'ხელფასები').reduce((sum,item) => sum+number(item.amount),0);
  const teachers = data.staff.map(person => ({person,...teacherFinance(person)}));
  const accruedSalaries = teachers.reduce((sum,item) => sum+item.accrued,0);
  const salaries = paidSalaries > 0 ? paidSalaries : accruedSalaries;
  const debt = billingRows(todayMonth()).reduce((sum,row) => sum + number(row.remaining),0);
  return {income,otherExpenses,teachers,salaries,accruedSalaries,paidSalaries,totalExpenses:otherExpenses+salaries,centerShare:income-salaries,profit:income-otherExpenses-salaries,debt};
}
function teacherSalariesForMonth(key) {
  return data.staff.reduce((total,person) => {
    const subjects=data.clubs.filter(subject=>subject.teacherId===person.id); const ids=new Set(subjects.map(subject=>subject.id));
    if (person.payType==='fixed'&&!subjects.some(subject=>subject.teacherPayType)) return total+number(person.monthlySalary);
    return total+subjects.reduce((sum,subject)=>sum+subjectTeacherAccrual(subject,person,item=>monthKey(item.date)===key,item=>monthKey(item.date)===key),0);
  },0);
}
function payrollCostForMonth(key) {
  const paid=data.expenses.filter(item=>monthKey(item.date)===key&&expenseCategoryLabel(item.category)==='ხელფასები').reduce((sum,item)=>sum+number(item.amount),0);
  return paid>0?paid:teacherSalariesForMonth(key);
}
function nonSalaryExpensesForMonth(key) {
  return data.expenses.filter(item=>monthKey(item.date)===key&&expenseCategoryLabel(item.category)!=='ხელფასები').reduce((sum,item)=>sum+number(item.amount),0);
}

function accounting() {
  const totals = accountingTotals();
  const salaryMode = totals.paidSalaries > 0 ? 'ფაქტობრივად გაცემული ხელფასი' : 'ავტომატურად დარიცხული ხელფასი';
  const mode = person => person.payType === 'fixed' ? `ფიქსირებული · ${money(person.monthlySalary)} / თვე` : person.payType === 'percent' ? `შემოსავლის ${number(person.revenueShare)}%` : `${money(person.lessonRate)} / ჩატარებული გაკვეთილი`;
  return `${head('ბუღალტერია','შემოსავალი, ხელფასები და წმინდა მოგება','<button class="btn small" onclick="paymentForm()">＋ გადახდა</button>')}${periodChips()}<section class="metrics"><div class="metric" style="--accent:var(--green)"><span class="label">შემოსავალი</span><strong>${money(totals.income)}</strong><span class="delta">კასაში მიღებული გადახდები</span></div><div class="metric" style="--accent:var(--yellow)"><span class="label">ხელფასები</span><strong>${money(totals.salaries)}</strong><span class="delta">${salaryMode}</span></div><div class="metric" style="--accent:var(--pink)"><span class="label">სხვა ხარჯები</span><strong>${money(totals.otherExpenses)}</strong><span class="delta">კომუნალური, ქირა და სხვა</span></div><div class="metric" style="--accent:var(--blue)"><span class="label">კასა / წმინდა ნაშთი</span><strong>${money(totals.profit)}</strong><span class="delta">ყველა ხარჯის შემდეგ</span></div></section><section class="section card"><div class="section-title"><h2>თანხების განაწილება</h2></div><div class="finance"><div><small>დიანა / ცენტრი ხელფასების შემდეგ</small><strong>${money(totals.centerShare)}</strong></div><div><small>სრული ხარჯი</small><strong>${money(totals.totalExpenses)}</strong></div><div class="profit"><small>კასის წმინდა ნაშთი</small><strong>${money(totals.profit)}</strong></div></div><p class="section-note" style="margin-top:14px">ფორმულა: კასაში მიღებული თანხა − ხელფასი − კომუნალური და სხვა ხარჯები. თუ „ხელფასები“ კატეგორიაში ფაქტობრივი გაცემა არსებობს, სისტემა მას იყენებს და დარიცხვას მეორედ აღარ აკლებს. მიმდინარე თვის დავალიანება: <b>${money(totals.debt)}</b>.</p>${totals.paidSalaries>0?`<p class="accounting-note">დარიცხული იყო ${money(totals.accruedSalaries)}, ფაქტობრივად გაცემულია ${money(totals.paidSalaries)}.</p>`:''}</section><section class="section"><div class="section-title"><h2>მასწავლებლების დარიცხვა</h2><button class="btn small secondary" onclick="go('staff')">პარამეტრები →</button></div>${totals.teachers.length ? `<div class="list">${totals.teachers.map(item => `<article class="teacher-card card"><div class="teacher-top"><div class="pic" style="--accent:var(--pink)">${esc((item.person.name||'?').slice(0,1))}</div><div><h2>${esc(item.person.name)}</h2><p class="meta">${esc(mode(item.person))}</p></div><b>${money(item.accrued)}</b></div><div class="profile-details" style="margin-top:12px"><div><small>ჩატარებული გაკვეთილები</small><b>${item.lessons}</b></div><div><small>საგნებიდან მიღებული თანხა</small><b>${money(item.revenue)}</b></div></div></article>`).join('')}</div>` : empty('დაამატეთ მასწავლებლები და მიუთითეთ ანაზღაურების წესი')}</section>`;
}

function dashboard() {
  const financeTotals = accountingTotals();
  const { income, totalExpenses:expenses, salaries, profit } = financeTotals;
  const currentChildren = activePeople('children', data.children);
  const active = currentChildren.length;
  const newChildren = currentChildren.filter(c => inPeriod(c.start)).length;
  const due = billingRows(todayMonth()).reduce((total,row) => total + number(row.price), 0);
  const unknownDays = currentChildren.filter(c => !day(c.paymentDay)).length;
  const circlesWithoutTeacher=data.clubs.filter(circle=>!circle.teacherId&&data.children.some(child=>(child.activityIds||[]).includes(circle.id))).length;
  const unusedLegacyCircles=data.clubs.filter(circle=>circle.billingCatalogVersion!==5&&!data.children.some(child=>(child.activityIds||[]).includes(circle.id))&&!data.payments.some(item=>item.subjectId===circle.id)&&!data.attendance.some(item=>item.subjectId===circle.id)&&!data.schedule.some(item=>item.subjectId===circle.id)).length;
  const invalidTransactionDates=[...data.payments,...data.expenses].filter(item=>item.date&&!dateKey(item.date)).length;
  const currentMonth=todayMonth();
  const oneOffToday=new Map();
  data.attendance.filter(item=>item.date===today()&&wasPresent(item)).forEach(item=>{
    const child=get('children',item.childId),subject=get('clubs',item.subjectId);
    if (!child||!subject||!isPerLessonCircle(subject,child)) return;
    if (!oneOffToday.has(child.id)) oneOffToday.set(child.id,new Set());
    oneOffToday.get(child.id).add(subject.id);
  });
  const todayPayments=currentChildren.filter(child=>(day(child.paymentDay)&&billingDate(child,currentMonth)<=today())||oneOffToday.has(child.id)).map(child=>{
    const dueDate=day(child.paymentDay)?billingDate(child,currentMonth):'';
    const regularDue=Boolean(dueDate&&dueDate<=today());
    const rows=billingRows(currentMonth).filter(row=>row.child.id===child.id&&(regularDue||oneOffToday.get(child.id)?.has(row.subject?.id)));
    const monthly=rows.reduce((sum,row)=>sum+number(row.price),0), remaining=rows.reduce((sum,row)=>sum+number(row.remaining),0), unknownPrice=!rows.length||rows.some(row=>row.price===null);
    const noAccrual=rows.length>0&&rows.every(row=>noAccrualStatus(row.status));
    const complete=!unknownPrice&&rows.every(row=>paidStatus(row.status));
    return {child,rows,monthly,remaining,unknownPrice,noAccrual,complete,dueDate,overdue:regularDue&&dueDate<today(),oneOff:oneOffToday.has(child.id),nextDate:regularDue?billingDate(child,complete?shiftMonth(currentMonth,1):currentMonth):today()};
  }).filter(item=>!item.complete||item.dueDate===today()||item.oneOff).sort((a,b)=>Number(a.complete)-Number(b.complete)||String(a.dueDate).localeCompare(String(b.dueDate)));
  const todayBlock=`<section class="section today-card"><div class="section-title"><div><h2>დღეს და ვადაგადაცილებული</h2><p class="meta">${todayPayments.filter(item=>!item.complete).length} გადასახდელი · ${todayPayments.filter(item=>item.overdue&&!item.complete).length} ვადაგადაცილებული</p></div><button class="btn small secondary" onclick="go('payments')">ყველა →</button></div>${todayPayments.length?`<div class="today-list">${todayPayments.map(item=>`<button class="today-payment ${item.complete?'paid':'due'} ${item.overdue&&!item.complete?'overdue':''}" onclick="showChild('${esc(item.child.id)}')"><span class="today-status">${item.complete?'✓':item.overdue?'!':'₾'}</span><span class="today-copy"><b>${esc(item.child.name)}</b><small>${item.rows.map(row=>esc(row.subject?.name||'საერთო ტარიფი')).join(' · ')||'ტარიფი მითითებული არ არის'}</small><em>${item.noAccrual?'ამ თვეში დასწრებული გაკვეთილი არ არის':item.complete?(item.oneOff?'დღევანდელი ერთჯერადი გადახდილია':`შემდეგი გადახდა: ${item.nextDate} · ${money(item.monthly)}`):item.unknownPrice?'ტარიფი დასაზუსტებელია':item.oneOff?`დღევანდელი გაკვეთილი · დარჩენილია ${money(item.remaining)}`:item.overdue?`ვადა იყო ${item.dueDate} · დარჩენილია ${money(item.remaining)}`:`დღეს · დარჩენილია ${money(item.remaining)}`}</em></span><strong>${item.noAccrual?'დარიცხვა 0':item.complete?'გადახდილია':item.unknownPrice?'ფასი ?':money(item.remaining)}</strong></button>`).join('')}</div>`:`<div class="today-empty"><span>✓</span><div><b>დღეს და წარსულში დაუფარავი გადახდა არ არის</b><small>შემდეგი გადახდის დღეები კალენდარში ჩანს.</small></div></div>`}</section>`;
  return `${head('მთავარი', `გამარჯობა, ${signedInUser?.name || 'დიანა'}`)}${todayBlock}${periodChips()}<section class="metrics"><div class="metric" style="--accent:var(--blue)"><span class="label">აქტიური ბავშვები</span><strong>${active}</strong><span class="delta">ახალი ამ პერიოდში: ${newChildren}</span></div><div class="metric" style="--accent:var(--green)"><span class="label">აქტიური თანამშრომლები</span><strong>${activePeople('staff').length}</strong><span class="delta">სულ ბაზაში: ${data.staff.length}</span></div><div class="metric" style="--accent:var(--yellow)"><span class="label">თვიური ტარიფები</span><strong>${money(due)}</strong><span class="delta">გადასახდელი თანხა</span></div><div class="metric" style="--accent:var(--pink)"><span class="label">მიღებული თანხა</span><strong>${money(income)}</strong><span class="delta">ფაქტობრივი გადახდები</span></div></section><div class="dashboard-grid"><section class="section card"><div class="section-title"><h2>ფინანსები</h2><button class="btn small secondary" onclick="go('accounting')">ბუღალტერია →</button></div><div class="finance"><div><small>შემოსავალი</small><strong>${money(income)}</strong></div><div><small>ხარჯები</small><strong>${money(expenses)}</strong></div><div class="profit"><small>წმინდა მოგება</small><strong>${money(profit)}</strong></div></div><p class="section-note" style="margin-top:14px">ხელფასის ხარჯი: <b>${money(salaries)}</b>. ფაქტობრივი გაცემა პრიორიტეტულია; თუ ის ჯერ არ არის შეტანილი, გამოიყენება ავტომატური დარიცხვა.</p></section><section class="section card"><div class="section-title"><div><h2>სისტემის კონტროლი</h2><p class="meta">რა არის შესავსები ან გასაწმენდი</p></div></div><div class="quality-list"><button onclick="go('contacts')"><span>☎</span><b>ტელეფონის გარეშე</b><strong>${currentChildren.filter(c => !c.phone && !c.phone2).length}</strong></button><button onclick="go('payments')"><span>◷</span><b>გადახდის დღის გარეშე</b><strong>${unknownDays}</strong></button><button onclick="go('clubs')"><span>♙</span><b>მასწავლებლის გარეშე</b><strong>${circlesWithoutTeacher}</strong></button><button onclick="go('clubs')"><span>⌁</span><b>ძველი გამოუყენებელი წრეები</b><strong>${unusedLegacyCircles}</strong></button>${invalidTransactionDates?`<button onclick="go('accounting')"><span>!</span><b>არასწორი თარიღი</b><strong>${invalidTransactionDates}</strong></button>`:''}</div></section></div>`;
}

function children() {
  const allRows = data.children, rows = filteredByParticipantStatus('children', allRows);
  return `${head('ბავშვები', `${allRows.length} ჩანაწერი`, '<button class="btn icon-btn" onclick="childForm()" aria-label="ბავშვის დამატება">＋</button>')}<button class="btn small secondary" style="margin-bottom:12px" onclick="go('contacts')">☎ კონტაქტები</button>${participantStatusTabs('children',allRows)}<input class="search" placeholder="ბავშვის ძებნა" aria-label="ბავშვების ძებნა" oninput="filterRows(this.value)">${rows.length?`<div class="list" id="rows">${rows.map(c=>{const circles=enrolledSubjects(c).map(item=>item.name);return `<article class="row clickable ${isActiveRecord(c,'children')?'':'record-inactive'}" data-search="${esc([c.name,c.parent,c.group,...circles].filter(Boolean).join(' '))}" onclick="showChild('${esc(c.id)}')"><div class="pic">${esc((c.name||'?').slice(0,1))}</div><div class="row-body"><div class="row-title">${esc(c.name)}</div><div class="meta">${esc(c.group||'ჯგუფი მითითებული არ არის')}<br><b>${circles.length?esc(circles.join(' · ')):'წრე მითითებული არ არის'}</b> · ${day(c.paymentDay)?`გადახდა ${day(c.paymentDay)} რიცხვში`:'გადახდის დღე არ არის'}</div></div><span class="badge ${isActiveRecord(c,'children')?'':'warn'}">${activeLabel(c,'children')}</span></article>`}).join('')}</div>`:empty(participantStatusFilter==='all'?'ბავშვების ჩანაწერები ჯერ არ არის':'ამ სტატუსით ბავშვები არ მოიძებნა',button('ბავშვის დამატება','childForm()'))}`;
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
  const days=(subject.weekdays||[]).map(day=>dayNames[Number(day)]).filter(Boolean).join(' / ');
  const times=(subject.timeSlots||[]).join(' / ');
  return [days,times].filter(Boolean).join(' · ')||'განრიგი დასაზუსტებელია';
}
function circleChargeMeta(child,subject,bill,month) {
  const schedule=`<div class="next-payment">◷ ${esc(circleScheduleLabel(subject))}${subject.audience?` · ${esc(subject.audience)}`:''}</div>`;
  if (isPerLessonCircle(subject,child)) {
    const type=participantType(child,subject),rate=perLessonRate(child,subject),lessons=lessonAttendanceCount(child,subject,month);
    const typeText=isCraftCircle(subject)?`<b>${participantTypeLabel(type)}</b> · `:'';
    return `${schedule}<div class="next-payment">${typeText}${rate===null?'ერთჯერადი ფასი დასაზუსტებელია':`${money(rate)} / დასწრებული გაკვეთილი`} · დასწრება: ${lessons}</div>`;
  }
  if (isFlexibleCircle(subject) && !childBillingMode(child,subject)) return `${schedule}<div class="next-payment">აირჩიეთ თვიური ან ერთჯერადი გადახდა</div>`;
  return `${schedule}<div class="next-payment">${paidStatus(bill.status)?`შემდეგი გადახდა: ${nextBillingDate({child,status:bill.status},month)} · ${money(bill.price)}`:`გადახდის ვადა: ${billingDate(child,month)} · დარჩა ${money(bill.remaining)}`}</div>`;
}
function circlePriceControl(child,subject,bill) {
  if (isCraftCircle(subject)) return `<button class="price-edit" onclick="editCircleBilling('${esc(child.id)}','${esc(subject.id)}')">${participantTypeLabel(participantType(child,subject))} ✎</button>`;
  if (isFlexibleCircle(subject)) return `<button class="price-edit" onclick="editCircleBilling('${esc(child.id)}','${esc(subject.id)}')">${childBillingMode(child,subject)==='monthly'?'თვიური':childBillingMode(child,subject)==='per_lesson'?'ერთჯერადი':'გადახდის ტიპი'} · ${bill.price===null?'ფასი ?':isPerLessonCircle(subject,child)?`${money(perLessonRate(child,subject))} / გაკვეთილი`:money(bill.price)} ✎</button>`;
  if (isPerLessonCircle(subject,child)) return `<button class="price-edit" onclick="editSimple('clubs','${esc(subject.id)}')">${perLessonRate(child,subject)===null?'საერთო ფასი ?':`${money(perLessonRate(child,subject))} / გაკვეთილი`} ✎</button>`;
  return `<button class="price-edit" onclick="editChildSubjectPrice('${esc(child.id)}','${esc(subject.id)}')">${bill.price===null?'ფასი მითითებული არ არის':`${money(bill.price)} / თვე`} ✎</button>`;
}
function childProfile() {
  const c = get('children', currentChildId);
  if (!c) return `${head('Ребёнок', 'Карточка не найдена')}${button('К списку детей', "go('children')")}`;
  const enrolled = new Set(c.activityIds || []);
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
  const showBaseTariff = c.tariff != null && c.tariff !== '' && (!subjects.length || isKindergartenChild(c));
  const legacyRemaining = showBaseTariff ? (legacyMarkedPaid ? 0 : Math.max(0,legacyPrice-legacyPaid)) : 0;
  const due = circleDue + legacyRemaining;
  const legacyPaymentCard = showBaseTariff ? `<section class="section card legacy-bill"><div><small>საბაზო ტარიფი · ${esc(prettyMonth(paymentMonth))}</small><b>${money(legacyPrice)}</b><small>${esc(c.group||'ბაღი')}</small></div><span class="pay-status ${legacyStatus === 'Оплачено' ? 'paid' : legacyStatus === 'Частично' ? 'partial' : 'due'}">${billStatusLabel(legacyStatus)}</span>${legacyStatus !== 'Оплачено' && isActiveRecord(c,'children') ? `<button class="btn small" onclick="paymentForm('${esc(c.id)}')">გადახდა ${money(legacyRemaining)}</button>` : ''}</section>` : '';
  const childPayments=[...data.payments].filter(item=>item.childId===c.id).sort((a,b)=>dateKey(b.date).localeCompare(dateKey(a.date))).slice(0,8);
  const childAttendance=[...data.attendance].filter(item=>item.childId===c.id||(!item.childId&&item.name===c.name)).sort((a,b)=>dateKey(b.date).localeCompare(dateKey(a.date))).slice(0,8);
  const activityHistory=`<section class="section card"><div class="section-title"><h2>ისტორია</h2><button class="btn small secondary" onclick="paymentForm('${esc(c.id)}')">＋ გადახდა</button></div>${childPayments.length?`<h3 class="history-title">გადახდები</h3><div class="compact-history">${childPayments.map(item=>`<button onclick="paymentForm('${esc(c.id)}','${esc(item.id)}')"><span><b>${esc(item.subjectId?subjectName(item.subjectId):'საერთო გადახდა')}</b><small>${esc(dateKey(item.date)||'თარიღი არ არის')} · ${esc(paymentMethodLabel(item.method))}</small></span><strong>${money(item.amount)}</strong></button>`).join('')}</div>`:'<p class="meta">გადახდების ისტორია ჯერ არ არის.</p>'}${childAttendance.length?`<h3 class="history-title">დასწრება</h3><div class="compact-history">${childAttendance.map(item=>`<button onclick="editSimple('attendance','${esc(item.id)}')"><span><b>${esc(subjectName(item.subjectId))}</b><small>${esc(dateKey(item.date)||'თარიღი არ არის')}</small></span><strong>${esc(attendanceStatusLabel(item.status))}</strong></button>`).join('')}</div>`:''}</section>`;
  return `${head('ბავშვის ბარათი','ბავშვები / პროფილი',`<button class="btn small" onclick="childForm('${esc(c.id)}')">შეცვლა</button>`)}<button class="text-back" onclick="go('children')">← ყველა ბავშვი</button><section class="profile-hero ${isActiveRecord(c,'children')?'':'record-inactive'}"><div class="profile-avatar">${esc((c.name||'?').slice(0,1))}</div><div class="profile-identity"><h2>${esc(c.name)}</h2><span>${activeLabel(c,'children')}</span></div><button class="record-switch hero-switch ${isActiveRecord(c,'children')?'on':'off'}" onclick="toggleRecordActive('children','${esc(c.id)}')" aria-label="სტატუსის შეცვლა"><i></i><span>${isActiveRecord(c,'children')?'გამორთვა':'ჩართვა'}</span></button></section>${legacyPaymentCard}<section class="section card"><div class="section-title"><h2>წრეები · ${subjects.length}</h2><button class="btn small secondary" onclick="go('clubs')">ყველა წრე →</button></div><div class="billing-month"><span>${esc(prettyMonth(paymentMonth))}</span><button class="btn small secondary" onclick="shiftPaymentMonth(-1)">‹</button><button class="btn small secondary" onclick="shiftPaymentMonth(1)">›</button></div>${subjects.length?`<div class="subject-list">${subjects.map(subject=>{const bill=subjectBill(c,subject),complete=paidStatus(bill.status);return `<div class="subject-line ${complete?'bill-paid':''}"><div class="subject-line-head"><div><b>${esc(subject.name)}</b><small>${esc(teacherName(subject))}</small></div><span class="pay-status ${complete?'paid':bill.status==='Частично'?'partial':'due'}">${billStatusLabel(bill.status)}</span></div>${circleChargeMeta(c,subject,bill,paymentMonth)}<div class="subject-line-bottom">${circlePriceControl(c,subject,bill)}${bill.remaining>0&&isActiveRecord(c,'children')?`<button class="btn small" onclick="paymentForSubject('${esc(c.id)}','${esc(subject.id)}')">გადახდა ${money(bill.remaining)}</button>`:''}</div></div>`}).join('')}</div><p class="section-note" style="margin-top:12px">${isActiveRecord(c,'children')?`ამ თვეში დარჩენილი გადასახდელი: <b>${money(due)}</b>. ერთჯერადი მომსახურება ითვლება მხოლოდ დასწრებული ჩანაწერებით.`:'ბავშვი არააქტიურია — ახალი დარიცხვები და დასწრება გამორთულია. ისტორია შენარჩუნებულია.'}</p>`:'<p class="section-note">წრე ჯერ არ არის მინიჭებული. აირჩიეთ ქვემოთ.</p>'}<div class="activity-grid">${data.clubs.filter(a=>!enrolled.has(a.id)).map(a=>`<button class="activity-choice" onclick="toggleChildActivity('${esc(c.id)}','${esc(a.id)}')"><span>＋</span>${esc(a.name)}</button>`).join('')}</div>${c.clubs?`<p class="meta">ძველი ჩანაწერი: ${esc(c.clubs)}</p>`:''}</section><section class="section card"><div class="section-title"><h2>პირადი მონაცემები</h2></div><div class="profile-details">${details.map(([label,value])=>`<div><small>${esc(label)}</small><b>${esc(value)}</b></div>`).join('')}</div>${c.comment?`<p class="profile-comment">${esc(c.comment)}</p>`:''}</section>${activityHistory}`;
}
async function toggleChildActivity(childId, activityId) {
  const c = get('children', childId), ids = new Set(c?.activityIds || []);
  if (!c) return;
  const adding=!ids.has(activityId); adding ? ids.add(activityId) : ids.delete(activityId);
  try { await dataAdapter.update('children', childId, { activityIds: [...ids] }); const circle=get('clubs',activityId); if (adding&&(isCraftCircle(circle)||isFlexibleCircle(circle))) editCircleBilling(childId,activityId); else go('childProfile'); }
  catch (error) { toast(error.message); }
}
function editChildSubjectPrice(childId, subjectId) {
  const child = get('children', childId), subject = get('clubs', subjectId);
  if (!child || !subject) return;
  openForm(`Цена · ${subject.name}`, [{name:'price',label:'Цена для этого ребёнка, ₾ в месяц',type:'number',required:true}], async values => {
    if (values.price === '' || number(values.price) < 0) throw new Error('Укажите цену от 0 ₾');
    const activityPrices = {...(child.activityPrices || {}), [subjectId]:number(values.price)};
    await dataAdapter.update('children', childId, {activityPrices}); go('childProfile'); toast('Цена сохранена');
  }, {price:subjectPrice(child, subject) ?? ''});
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
  const flexible=isFlexibleCircle(subject),mode=childBillingMode(child,subject)||(flexible?'monthly':'per_lesson');
  const fields=flexible?[{name:'billingMode',label:'გადახდის ტიპი',type:'select',required:true,options:[['monthly','თვიური გადახდა'],['per_lesson','ერთჯერადი · ყოველ დასწრებაზე']]},{name:'price',label:'არჩეული ტარიფის ფასი, ₾',type:'number',required:true}]:[{name:'price',label:'ფასი ერთ დასწრებულ გაკვეთილზე, ₾',type:'number',required:true}];
  const defaultPrice=child.activityPrices?.[subjectId] ?? (mode==='monthly'?subject.tariff:subject.lessonRate) ?? '';
  openForm(`${subject.name} · გადახდა`,fields,async values=>{
    if (values.price===''||number(values.price)<0) throw new Error('მიუთითეთ სწორი ფასი');
    const activityPrices={...(child.activityPrices||{}),[subjectId]:number(values.price)};
    const activityBillingModes={...(child.activityBillingModes||{}),[subjectId]:values.billingMode||'per_lesson'};
    await dataAdapter.update('children',childId,{activityPrices,activityBillingModes}); go('childProfile'); toast('გადახდის წესი შენახულია');
  },{billingMode:mode,price:defaultPrice});
}

function contacts() {
  const allRows = [...data.children], rows = filteredByParticipantStatus('children',allRows).sort((a, b) => Number(!!a.phone || !!a.phone2) - Number(!!b.phone || !!b.phone2));
  const missing = rows.filter(c => !c.phone && !c.phone2).length;
  return `${head("Контакты", `Нужно уточнить: ${missing}`)}${participantStatusTabs('children',allRows)}<input class="search" placeholder="Имя или телефон" aria-label="Поиск контактов" oninput="filterRows(this.value)">${rows.length ? `<div class="list" id="rows">${rows.map(c => `<article class="row contact-row ${isActiveRecord(c,'children')?'':'record-inactive'}" data-search="${esc([c.name, c.parent, c.phone, c.phone2].join(' '))}"><div class="pic" style="--accent:${c.phone || c.phone2 ? 'var(--green)' : 'var(--yellow)'}">☎</div><div class="row-body"><div class="row-title">${esc(c.name)} <span class="inline-status ${isActiveRecord(c,'children')?'active':'inactive'}">${activeLabel(c,'children')}</span></div><div class="meta">${esc(c.parent || "Родитель не указан")}<br>${esc(c.phone || c.phone2 || "Телефон не указан")}${c.phone && c.phone2 ? ` · ${esc(c.phone2)}` : ""}</div></div><div class="contact-action">${c.phone || c.phone2 ? `<a href="tel:${esc(String(c.phone || c.phone2).replace(/[^+\d]/g, ''))}" aria-label="Позвонить">↗</a>` : ""}<button class="btn small secondary" onclick="phoneForm('${esc(c.id)}')">${c.phone || c.phone2 ? "Изменить" : "Добавить"}</button></div></article>`).join("")}</div>` : empty("Контакты появятся вместе с карточками детей")}`;
}

function payments() {
  const bills = billingRows(paymentMonth).sort((a,b) => (day(a.child.paymentDay)||99)-(day(b.child.paymentDay)||99));
  const actual = [...data.payments].filter(p => monthKey(p.billingMonth || p.date) === paymentMonth).sort((a,b) => String(b.date).localeCompare(String(a.date)));
  const dueTotal = bills.reduce((sum,b) => sum+(b.remaining||0),0);
  const paidCount = bills.filter(b => paidStatus(b.status)).length;
  const cards=bills.map(b=>{
    const complete=paidStatus(b.status);
    const meta=b.subject?circleChargeMeta(b.child,b.subject,b,paymentMonth):`<div class="next-payment">${complete?`შემდეგი: ${nextBillingDate(b,paymentMonth)} · ${money(b.price)}`:`ვადა: ${billingDate(b.child,paymentMonth)} · დარჩა ${money(b.remaining)}`}</div>`;
    return `<article class="bill-row card ${complete?'bill-paid':''}"><div class="bill-day">${day(b.child.paymentDay)||'?'}</div><div class="bill-body"><button class="bill-name" onclick="showChild('${esc(b.child.id)}')">${esc(b.child.name)}</button><div class="meta">${esc(b.subject?.name||'საერთო ტარიფი')} · ${b.price===null?'ფასი ან ტიპი დასაზუსტებელია':money(b.price)}</div><span class="pay-status ${complete?'paid':b.status==='Частично'?'partial':'due'}">${billStatusLabel(b.status)}</span>${meta}</div>${b.remaining>0?`<button class="btn small" onclick="${b.subject?`paymentForSubject('${esc(b.child.id)}','${esc(b.subject.id)}')`:`paymentForm('${esc(b.child.id)}')`}">გადახდა</button>`:''}</article>`;
  }).join('');
  const history=actual.map(p=>`<button class="row clickable transaction-row" onclick="paymentForm('${esc(p.childId)}','${esc(p.id)}')"><div class="pic" style="--accent:var(--green)">₾</div><div class="row-body"><div class="row-title">${esc(p.child||get('children',p.childId)?.name||'ბავშვი')}</div><div class="meta">${esc(p.subjectId?subjectName(p.subjectId):'საერთო გადახდა')} · ${esc(dateKey(p.date)||p.date||'')} · ${esc(paymentMethodLabel(p.method))}</div></div><b class="amount">${money(p.amount)}</b><span>›</span></button>`).join('');
  return `${head('გადახდები','ბავშვებისა და წრეების მიხედვით','<button class="btn icon-btn" onclick="paymentForm()" aria-label="გადახდის დამატება">＋</button>')}<div class="month-switch"><button onclick="shiftPaymentMonth(-1)" aria-label="წინა თვე">‹</button><b>${esc(prettyMonth(paymentMonth))}</b><button onclick="shiftPaymentMonth(1)" aria-label="შემდეგი თვე">›</button></div><div class="metrics payment-metrics"><div class="metric" style="--accent:var(--pink)"><span class="label">დარჩენილი გადასახდელი</span><strong>${money(dueTotal)}</strong><span class="delta">თვიური და ერთჯერადი დარიცხვები</span></div><div class="metric" style="--accent:var(--green)"><span class="label">დახურული დარიცხვა</span><strong>${paidCount} / ${bills.length}</strong><span class="delta">გადახდილი ან დარიცხვის გარეშე</span></div></div><section class="section"><div class="section-title"><h2>გადახდის გრაფიკი</h2></div>${bills.length?`<div class="list">${cards}</div>`:empty('ფასიანი წრეები ან ტარიფები ჯერ არ არის')}</section><section class="section"><div class="section-title"><h2>თვის მიღებული გადახდები</h2></div>${actual.length?`<div class="list">${history}</div>`:empty('ამ თვეში გადახდები ჯერ არ არის')}</section>`;
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

function activities() {
  const tariffText=a=>isCraftCircle(a)?`<b>ბაღის ბავშვი: ${money(a.kindergartenRate??30)} · გარე ბავშვი: ${money(a.externalRate??40)} / გაკვეთილი</b>`:isFlexibleCircle(a)?`<b>თვეში: ${a.tariff==null?'ფასი ?':money(a.tariff)} · ერთჯერადად: ${a.lessonRate==null?'ფასი ?':money(a.lessonRate)}</b>`:isPerLessonCircle(a)?`<b>${a.lessonRate==null?'ფასი მითითებული არ არის':money(a.lessonRate)} / დასწრებული გაკვეთილი</b>`:a.tariff===null||a.tariff===undefined||a.tariff===''?'<span class="badge warn">ფასი მითითებული არ არის</span>':`<b>${money(a.tariff)} / თვე</b>`;
  return `${head('წრეები',`${data.clubs.length} სიაში`,'<button class="btn icon-btn" onclick="editSimple(\'clubs\')" aria-label="წრის დამატება">＋</button>')}<p class="section-note">თითოეულ წრეს შეიძლება ჰქონდეს თვიური, ერთჯერადი ან ორივე ტიპის გადახდა. ერთჯერადი თანხა დასწრების მიხედვით ითვლება.</p>${data.clubs.length?`<div class="list">${data.clubs.map(a=>{const allMembers=data.children.filter(c=>(c.activityIds||[]).includes(a.id)),members=activePeople('children',allMembers);const month=todayMonth(),bills=members.map(child=>subjectBill(child,a,month)),expected=bills.reduce((sum,bill)=>sum+number(bill.price),0),paidIn=data.payments.filter(item=>item.subjectId===a.id&&monthKey(item.billingMonth||item.date)===month).reduce((sum,item)=>sum+number(item.amount),0),teacher=get('staff',a.teacherId),teacherPay=teacher?subjectTeacherAccrual(a,teacher,item=>monthKey(item.date)===month,item=>monthKey(item.date)===month):0;return `<article class="activity-card card"><div class="activity-card-head"><div class="pic" style="--accent:var(--green)">✦</div><div><h2>${esc(a.name)}</h2><p class="meta">${esc(teacherName(a))} · ${esc(circleScheduleLabel(a))}${a.audience?` · ${esc(a.audience)}`:''}</p></div><button class="btn small secondary" onclick="editSimple('clubs','${esc(a.id)}')">შეცვლა</button></div><div class="subject-price">${tariffText(a)}<p class="meta">${esc(teacherRuleLabel(a))}</p></div><div class="profile-details" style="margin-top:10px"><div><small>${esc(prettyMonth(month))} · დარიცხული</small><b>${money(expected)}</b></div><div><small>მიღებული</small><b>${money(paidIn)}</b></div><div><small>მასწავლებელს</small><b>${money(teacherPay)}</b></div><div><small>ცენტრს რჩება</small><b>${money(paidIn-teacherPay)}</b></div></div><div class="activity-members"><b>${members.length} აქტიური${allMembers.length!==members.length?` · ${allMembers.length-members.length} არააქტიური`:''}</b>${members.length?members.map(c=>`<button onclick="showChild('${esc(c.id)}')">${esc(c.name)}</button>`).join(''):'<span class="meta">აქტიური ბავშვები არ არიან</span>'}</div></article>`}).join('')}</div>`:empty('დაამატეთ პირველი წრე',button('წრის დამატება',"editSimple('clubs')"))}`;
}

function teachers() {
  const mode = person => person.payType === 'fixed' ? `ფიქსირებული: ${money(person.monthlySalary)} / თვე` : person.payType === 'percent' ? `პროცენტი: ${number(person.revenueShare)}%` : `გაკვეთილზე: ${money(person.lessonRate)}`;
  const allRows=data.staff, rows=filteredByParticipantStatus('staff',allRows);
  return `${head('მასწავლებლები', `${allRows.length} ადამიანი`, '<button class="btn icon-btn" onclick="editSimple(\'staff\')" aria-label="მასწავლებლის დამატება">＋</button>')}<p class="section-note">თითოეულ მასწავლებელს მიუთითეთ ანაზღაურების წესი. დარიცხვა გამოჩნდება ბუღალტერიაში.</p>${participantStatusTabs('staff',allRows)}${rows.length ? `<div class="list">${rows.map(person => { const subjects = data.clubs.filter(a => a.teacherId === person.id); const calc=teacherFinance(person); return `<article class="teacher-card card ${isActiveRecord(person,'staff')?'':'record-inactive'}"><div class="teacher-top"><div class="pic" style="--accent:var(--pink)">${esc((person.name||'?').slice(0,1))}</div><div><h2>${esc(person.name)}</h2><p class="meta">${esc(person.role || 'მასწავლებელი')}${person.phone ? ` · ${esc(person.phone)}` : ''}</p></div><button class="record-switch ${isActiveRecord(person,'staff')?'on':'off'}" onclick="toggleRecordActive('staff','${esc(person.id)}')" aria-label="სტატუსის შეცვლა"><i></i><span>${activeLabel(person,'staff')}</span></button><button class="btn small secondary" onclick="editSimple('staff','${esc(person.id)}')">შეცვლა</button></div><div class="profile-details" style="margin-top:12px"><div><small>ანაზღაურება</small><b>${esc(mode(person))}</b></div><div><small>დარიცხულია ამ პერიოდში</small><b>${money(calc.accrued)}</b></div></div><div class="profile-details" style="margin-top:8px"><div><small>აქტიური მოსწავლეები</small><b>${new Set(subjects.flatMap(a=>activePeople('children').filter(c=>(c.activityIds||[]).includes(a.id)).map(c=>c.id))).size}</b></div><div><small>ჩატარებული გაკვეთილები</small><b>${calc.lessons}</b></div></div><div class="activity-members"><b>საგნები:</b>${subjects.length ? subjects.map(a => `<button onclick="go('clubs')">${esc(a.name)}</button>`).join('') : '<span class="meta">ჯერ არ არის მინიჭებული</span>'}</div></article>`; }).join('')}</div>` : empty(participantStatusFilter==='all'?'მასწავლებლები ჯერ არ არის':'ამ სტატუსით მასწავლებლები არ მოიძებნა', button('მასწავლებლის დამატება', "editSimple('staff')"))}`;
}

function shiftCalendarMonth(count) { calendarMonth = shiftMonth(calendarMonth,count); calendarSelected = `${calendarMonth}-01`; go('schedule'); }
function selectCalendarDay(date) { calendarSelected = date; go('schedule'); }
function recurringCircleEvents(date) {
  const weekday=new Date(`${date}T12:00:00`).getDay();
  return data.clubs.filter(circle=>(circle.weekdays||[]).map(Number).includes(weekday)).flatMap(circle=>{
    const slots=Array.isArray(circle.timeSlots)&&circle.timeSlots.length?circle.timeSlots:[''];
    return slots.map((time,index)=>({id:`repeat-${circle.id}-${date}-${index}`,subjectId:circle.id,name:circle.name,date,time,status:'recurring',group:circle.audience||'',generated:true}));
  });
}
function calendarEventsForDate(date) {
  const manual=data.schedule.filter(item=>item.date===date);
  const manualKeys=new Set(manual.map(item=>`${item.subjectId||''}|${item.time||''}`));
  return [...manual,...recurringCircleEvents(date).filter(item=>!manualKeys.has(`${item.subjectId}|${item.time}`))].sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
}
function attendanceForCircle(subjectId,date) { groupAttendanceForm(subjectId,date); }
function groupAttendanceForm(subjectId='',date=today()) {
  if (!data.clubs.length) return toast('ჯერ დაამატეთ წრე');
  subjectId = subjectId || data.clubs[0].id;
  const render = () => {
    const subject=get('clubs',subjectId), members=activePeople('children').filter(child=>(child.activityIds||[]).includes(subjectId));
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
  const dueChildren = activePeople('children').filter(c => day(c.paymentDay) && billingDate(c,calendarMonth) === calendarSelected && (enrolledSubjects(c).length || c.tariff != null && c.tariff !== ''));
  const dueCards = dueChildren.map(child=>{const rows=billingRows(calendarMonth).filter(row=>row.child.id===child.id);return {child,complete:rows.length>0&&rows.every(row=>paidStatus(row.status)),noAccrual:rows.length>0&&rows.every(row=>noAccrualStatus(row.status)),remaining:rows.reduce((sum,row)=>sum+number(row.remaining),0)}});
  return `${head('კალენდარი', 'გაკვეთილები და გადახდის დღეები', '<button class="btn icon-btn" onclick="scheduleForm()" aria-label="გაკვეთილის დამატება კალენდარში">＋</button>')}<section class="calendar-card card"><div class="month-switch"><button onclick="shiftCalendarMonth(-1)" aria-label="წინა თვე">‹</button><b>${esc(prettyMonth(calendarMonth))}</b><button onclick="shiftCalendarMonth(1)" aria-label="შემდეგი თვე">›</button></div><div class="calendar-grid weekdays">${['ორშ','სამ','ოთხ','ხუთ','პარ','შაბ','კვ'].map(x=>`<span>${x}</span>`).join('')}</div><div class="calendar-grid">${Array.from({length:first},()=>'<span></span>').join('')}${Array.from({length:days},(_,i)=>{const date=`${calendarMonth}-${String(i+1).padStart(2,'0')}`;const events=calendarEventsForDate(date).length;const dues=activePeople('children').filter(c=>day(c.paymentDay)&&billingDate(c,calendarMonth)===date).length;return `<button class="calendar-day ${date===calendarSelected?'selected':''} ${date===today()?'is-today':''}" onclick="selectCalendarDay('${date}')"><b>${i+1}</b><span class="calendar-dots">${events?'<i class="event-dot"></i>':''}${dues?'<i class="due-dot"></i>':''}</span></button>`}).join('')}</div><div class="calendar-legend"><span><i class="event-dot"></i> გაკვეთილები</span><span><i class="due-dot"></i> გადახდის დღეები</span></div></section><section class="section"><div class="section-title"><h2>${esc(new Date(`${calendarSelected}T12:00:00`).toLocaleDateString('ka-GE',{day:'numeric',month:'long'}))}</h2></div>${selectedEvents.length ? `<div class="list">${selectedEvents.map(item=>`<article class="row clickable" onclick="${item.generated?`attendanceForCircle('${esc(item.subjectId)}','${esc(item.date)}')`:`scheduleForm('${esc(item.id)}')`}"><div class="due-day calendar-time">${esc(item.time||'•')}</div><div class="row-body"><div class="row-title">${esc(item.subjectId?subjectName(item.subjectId):item.name||'გაკვეთილი')}</div><div class="meta">${esc(item.group||'ჯგუფი მითითებული არ არის')} · ${esc(item.subjectId?teacherName(get('clubs',item.subjectId)||{}):'')} · ${item.generated?'დასწრების მონიშვნა':item.status==='held'?'ჩატარებული':item.status==='cancelled'?'გაუქმებული':'დაგეგმილი'}</div></div><span>›</span></article>`).join('')}</div>` : empty('ამ დღისთვის გაკვეთილები არ არის დამატებული', button('გაკვეთილის დამატება', 'scheduleForm()'))}</section>${dueCards.length?`<section class="section card"><div class="section-title"><h2>ამ დღის გადახდები · ${dueCards.length}</h2></div><div class="today-list">${dueCards.map(item=>`<button class="today-payment ${item.complete?'paid':'due'}" onclick="showChild('${esc(item.child.id)}')"><span class="today-status">${item.complete?'✓':'₾'}</span><span class="today-copy"><b>${esc(item.child.name)}</b><em>${item.complete?'გადახდილია':`დარჩა ${money(item.remaining)}`}</em></span><strong>${item.complete?'✓':money(item.remaining)}</strong></button>`).join('')}</div></section>`:''}`;
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
    actions?.insertAdjacentHTML('afterbegin',`<button class="btn danger" type="button" onclick="deleteRecord('schedule','${esc(old.id)}','${esc(old.name||'გაკვეთილი')}','schedule')">წაშლა</button>`);
  }
}

function expenses() {
  const total = data.expenses.filter(x => inPeriod(x.date)).reduce((sum, x) => sum + number(x.amount), 0);
  const shown = data.expenses.filter(x => expenseCategory === 'all' || expenseCategoryLabel(x.category) === expenseCategory);
  const pending = pendingExpenseItems();
  const categories = [['all','ყველა',data.expenses.length], ...expenseCategories.map(category => [category,category,data.expenses.filter(x => expenseCategoryLabel(x.category) === category).length])];
  return `${head('ხარჯები','კატეგორიებისა და თარიღების მიხედვით','<button class="btn icon-btn" onclick="editSimple(\'expenses\')" aria-label="ხარჯის დამატება">＋</button>')}${periodChips()}<div class="metric" style="--accent:var(--pink);margin-bottom:14px"><span class="label">პერიოდის დადასტურებული ხარჯი</span><strong>${money(total)}</strong><span class="delta">მხოლოდ თარიღით და კატეგორიით შენახული ჩანაწერები</span></div><div class="periods expense-filters">${categories.map(([key,label,count])=>`<button class="chip ${expenseCategory===key?'active':''}" onclick="setExpenseCategory('${esc(key)}')">${esc(label)} · ${count}</button>`).join('')}</div><section class="section"><div class="section-title"><h2>დადასტურებული ხარჯები</h2></div>${shown.length?`<div class="list">${[...shown].sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>`<article class="row clickable" onclick="editSimple('expenses','${esc(x.id)}')"><div class="pic" style="--accent:var(--pink)">−</div><div class="row-body"><div class="row-title">${esc(x.title)}</div><div class="meta">${esc(expenseCategoryLabel(x.category))} · ${esc(x.date||'თარიღი არ არის')}</div></div><b>${money(x.amount)}</b></article>`).join('')}</div>`:empty(expenseCategory==='all'?'დადასტურებული ხარჯები ჯერ არ არის':'ამ კატეგორიაში ხარჯები არ არის',button('ხარჯის დამატება',"editSimple('expenses')"))}</section><section class="section card"><div class="section-title"><div><h2>დასაზუსტებელი ძველი თანხები</h2><p class="meta">${pending.length} ჩანაწერი</p></div></div><p class="section-note">ეს თანხები ძველი ცხრილიდანაა და ჯერ არ აქვს ზუსტი თარიღი ან კატეგორია. დააჭირეთ „ხარჯად დამატებას“, მიუთითეთ დანიშნულება, თარიღი და კატეგორია — ამის შემდეგ თანხა შევა სტატისტიკაში.</p>${pending.length?`<div class="source-expense-list">${pending.map(item=>`<div class="source-expense"><div><b>${esc(item.raw)}</b><small>წყარო: ${item.rowNumber}-ე სტრიქონი, ${item.column.toUpperCase()} სვეტი${item.label?` · ${esc(item.label)}`:''}</small></div><button class="btn small secondary" onclick="expenseFromSource(${item.rowNumber},'${item.column}')">ხარჯად დამატება</button></div>`).join('')}</div>`:'<p class="meta">ყველა ძველი თანხა უკვე დამუშავებულია.</p>'}</section>`;
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

const views = {
  dashboard, children, childProfile, contacts, payments, leads, reports, accounting, expenses, tasks, settings, sourceTable,
  staff: teachers,
  groups: () => listSection('groups', 'Группы', 'Направления', x => `${x.teacher || 'Педагог не указан'} · ${x.schedule || 'Расписание не указано'}`),
  clubs: activities,
  schedule: calendar,
  attendance: attendanceView,
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

function renderDrawer() {
  const items = [['dashboard','⌂','მთავარი'],['accounting','₾','ბუღალტერია'],['reports','▤','სტატისტიკა'],['schedule','▦','კალენდარი'],['clubs','✦','წრეები'],['staff','♙','მასწავლებლები'],['contacts','☎','კონტაქტები'],['attendance','✓','დასწრება'],['tasks','☑','ამოცანები'],['sourceTable','▥','საწყისი ცხრილი'],['settings','⚙','პარამეტრები']];
  $("drawerGrid").innerHTML = items.map(([id, icon, label]) => `<button class="drawer-item" onclick="go('${id}')"><span>${icon}</span>${label}</button>`).join('');
}
function toggleDrawer(open) {
  $("drawer").classList.toggle("hidden", !open);
  const more = document.querySelector('.nav button[data-nav="more"]');
  if (more) more.classList.toggle('active', open || !['children','payments','expenses','childProfile'].includes(current));
}
function filterRows(query) { document.querySelectorAll('#rows [data-search]').forEach(node => node.classList.toggle('hidden', !node.dataset.search.toLowerCase().includes(query.toLowerCase()))); }

function openForm(title, fields, submit, initial = {}) {
  $("modalTitle").textContent = translateText(title);
  const form = $("modalForm");
  form.innerHTML = fields.map(field => {
    const value = initial[field.name] ?? '';
    const id = `field-${field.name}`;
    let input;
    if (field.type === 'select') {
      input = `<select id="${id}" name="${field.name}" ${field.required ? 'required' : ''}>${field.options.map(option => { const [optionValue, label] = Array.isArray(option) ? option : [option, option]; return `<option value="${esc(optionValue)}" ${String(value) === String(optionValue) ? 'selected' : ''}>${esc(label)}</option>`; }).join('')}</select>`;
    } else if (field.type === 'multi') {
      input = `<div class="form-options">${field.options.map(option => { const [optionValue, label] = Array.isArray(option) ? option : [option, option]; return `<label class="form-option"><input type="checkbox" name="${field.name}" value="${esc(optionValue)}" ${Array.isArray(value) && value.includes(optionValue) ? 'checked' : ''}><span>${esc(label)}</span></label>`; }).join('')}</div>`;
    } else if (field.type === 'textarea') input = `<textarea id="${id}" name="${field.name}">${esc(value)}</textarea>`;
    else input = `<input id="${id}" name="${field.name}" type="${field.type || 'text'}" value="${esc(value)}" ${field.name === 'paymentDay' ? 'min="1" max="31" step="1"' : field.type === 'number' ? 'min="0" step="any" inputmode="decimal"' : ''} ${field.required ? 'required' : ''}>`;
    return `<div class="field"><label for="${id}">${esc(field.label)}</label>${input}</div>`;
  }).join('') + '<div class="form-actions"><button class="btn secondary" type="button" onclick="closeModal()">Отмена</button><button class="btn" type="submit">Сохранить</button></div>';
  translateUi(form);
  form.onsubmit = async event => {
    event.preventDefault();
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try { const formData = new FormData(form); const values = Object.fromEntries(formData); fields.filter(field => field.type === 'multi').forEach(field => { values[field.name] = formData.getAll(field.name); }); await submit(values); closeModal(); }
    catch (error) { toast(error.message || 'Не удалось сохранить'); }
    finally { submitButton.disabled = false; }
  };
  $("modal").classList.remove('hidden');
}
function closeModal() { $("modal").classList.add('hidden'); }
async function logoutCRM() {
  try { await api('/api/logout', {method:'POST', body:'{}'}); }
  finally { localStorage.removeItem('gimili_crm_session'); localStorage.removeItem('gimili_crm_user'); location.replace('./login.html'); }
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
  const fields = [...childFields.slice(0, 6), {name:'activityIds',label:'Предметы (можно выбрать несколько)',type:'multi',options:data.clubs.map(a => [a.id,a.name])}, ...childFields.slice(6)];
  openForm(old ? 'Карточка ребёнка' : 'Новый ребёнок', fields, async values => {
    values.active = values.active !== 'false';
    values.status = values.active ? 'Активен' : 'Неактивен';
    values.paymentDay = values.paymentDay ? day(values.paymentDay) : null;
    values.tariff = values.tariff === '' ? null : number(values.tariff);
    values.discount = number(values.discount);
    const saved = old ? await dataAdapter.update('children', id, values) : await dataAdapter.create('children', values);
    currentChildId = saved.id;
    const needsSetup=(saved.activityIds||[]).map(circleId=>get('clubs',circleId)).find(circle=>(isCraftCircle(circle)&&!participantType(saved,circle))||(isFlexibleCircle(circle)&&!childBillingMode(saved,circle)));
    if (needsSetup) setTimeout(()=>editCircleBilling(saved.id,needsSetup.id),120); else go('childProfile');
    toast('ბავშვის ბარათი შენახულია');
  }, old ? {...old,active:String(isActiveRecord(old,'children'))} : { active:'true' });
}
function phoneForm(id) {
  const old = get('children', id);
  if (!old) return;
  openForm(`Контакт · ${old.name}`, [{name:'parent',label:'Родитель / контактное лицо'},{name:'phone',label:'Основной телефон',type:'tel'},{name:'phone2',label:'Дополнительный телефон',type:'tel'}], async values => {
    await dataAdapter.update('children', id, values); go('contacts'); toast('Контакт сохранён');
  }, old);
}
function paymentForm(initialChildId = '', paymentId = '') {
  const old=paymentId?get('payments',paymentId):null;
  const selectableChildren=activePeople('children');
  if (old&&!selectableChildren.some(child=>child.id===old.childId)) { const child=get('children',old.childId); if (child) selectableChildren.push(child); }
  if (!selectableChildren.length) return toast('ჯერ დაამატეთ ან ჩართეთ აქტიური ბავშვი');
  openForm(old?'გადახდის შეცვლა':'ახალი გადახდა', [{name:'childId',label:'ბავშვი',type:'select',required:true,options:selectableChildren.map(c=>[c.id,c.name])},{name:'subjectId',label:'წრე',type:'select',options:[['','საერთო გადახდა / წრის გარეშე'],...data.clubs.map(a=>[a.id,a.name])]},{name:'amount',label:'თანხა, ₾',type:'number',required:true},{name:'date',label:'გადახდის თარიღი',type:'date',required:true},{name:'billingMonth',label:'რომელი თვის დარიცხვას ფარავს',type:'month',required:true},{name:'method',label:'გადახდის მეთოდი',type:'select',options:[['cash','ნაღდი'],['transfer','გადარიცხვა'],['card','ბარათი'],['other','სხვა']]}], async values => {
    if (number(values.amount) <= 0) throw new Error('თანხა ნულზე მეტი უნდა იყოს');
    if (values.subjectId && !(get('children',values.childId)?.activityIds || []).includes(values.subjectId)) throw new Error('ჯერ მიანიჭეთ ბავშვს ეს საგანი');
    values.child = get('children', values.childId)?.name || '';
    values.amount = number(values.amount);
    values.billingMonth = values.billingMonth || monthKey(values.date);
    if (old) await dataAdapter.update('payments',paymentId,values); else await dataAdapter.create('payments', values);
    paymentMonth=values.billingMonth; go('payments'); toast('გადახდა შენახულია');
  }, old?{...old,date:dateKey(old.date),billingMonth:monthKey(old.billingMonth||old.date)}:{ childId:selectableChildren.some(c=>c.id===initialChildId)?initialChildId:selectableChildren[0].id, date:paymentMonth === todayMonth() ? today() : `${paymentMonth}-01`, billingMonth:paymentMonth, method:'cash' });
  const childSelect = $('field-childId'), subjectSelect = $('field-subjectId');
  function updateSubjects() {
    const allowed = new Set(get('children',childSelect.value)?.activityIds || []);
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
  if (!child || !subject || !(child.activityIds || []).includes(subjectId)) return toast('საგანი ბავშვს არ აქვს მინიჭებული');
  const bill = subjectBill(child,subject);
  openForm(`გადახდა · ${subject.name}`, [{name:'amount',label:'თანხა, ₾',type:'number',required:true},{name:'date',label:'გადახდის თარიღი',type:'date',required:true},{name:'method',label:'გადახდის მეთოდი',type:'select',options:[['cash','ნაღდი'],['transfer','გადარიცხვა'],['card','ბარათი'],['other','სხვა']]}], async values => {
    if (number(values.amount) <= 0) throw new Error('თანხა ნულზე მეტი უნდა იყოს');
    await dataAdapter.create('payments',{...values,amount:number(values.amount),billingMonth:paymentMonth,childId,child:child.name,subjectId});
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
}
async function moveLead(id, stage) { try { await dataAdapter.update('leads', id, {stage}); go('leads'); } catch(error) { toast(error.message); } }
async function toggleTask(id) { const old = get('tasks', id); if (!old) return; try { await dataAdapter.update('tasks', id, {done: !old.done}); go('tasks'); } catch(error) { toast(error.message); } }
async function deleteRecord(kind,id,label,returnView=kind) {
  if (!get(kind,id)||!confirm(`წავშალოთ ჩანაწერი „${label||''}“? ეს მოქმედება ვერ გაუქმდება.`)) return;
  try { await dataAdapter.remove(kind,id); closeModal(); go(returnView); toast('ჩანაწერი წაიშალა'); }
  catch (error) { toast(error.message||'ჩანაწერის წაშლა ვერ მოხერხდა'); }
}
async function deleteAttendance(id) {
  const item=get('attendance',id); if (!item) return;
  if (!confirm(`წავშალოთ ${item.date||''} დასწრების ჩანაწერი?`)) return;
  try { await dataAdapter.remove('attendance',id); closeModal(); go('attendance'); toast('დასწრების ჩანაწერი წაიშალა'); }
  catch (error) { toast(error.message || 'ჩანაწერის წაშლა ვერ მოხერხდა'); }
}
async function deleteClub(id) {
  const item=get('clubs',id); if (!item) return;
  const linkedChildren=data.children.filter(child=>(child.activityIds||[]).includes(id)).length;
  const linkedRecords=['payments','attendance','schedule'].reduce((sum,kind)=>sum+data[kind].filter(record=>record.subjectId===id).length,0);
  if (linkedChildren||linkedRecords) return toast(`წაშლამდე მოხსენით კავშირები: ${linkedChildren} ბავშვი, ${linkedRecords} ჩანაწერი`);
  if (!confirm(`წავშალოთ წრე „${item.name||''}“?`)) return;
  try { await dataAdapter.remove('clubs',id); closeModal(); go('clubs'); toast('წრე წაიშალა'); }
  catch (error) { toast(error.message || 'წრის წაშლა ვერ მოხერხდა'); }
}

const simpleFields = {
  staff:[{name:'name',label:'მასწავლებლის სახელი და გვარი',required:true},{name:'phone',label:'ტელეფონი',type:'tel'},{name:'role',label:'თანამდებობა'},{name:'active',label:'სტატუსი',type:'select',options:[['true','აქტიური'],['false','არააქტიური']]},{name:'payType',label:'ანაზღაურების წესი',type:'select',options:[['per_lesson','თითო ჩატარებულ გაკვეთილზე'],['percent','საგნის შემოსავლის პროცენტი'],['fixed','ფიქსირებული თვიური ხელფასი']]},{name:'lessonRate',label:'თანხა ერთ ჩატარებულ გაკვეთილზე, ₾',type:'number'},{name:'revenueShare',label:'პროცენტი საგნის შემოსავლიდან, %',type:'number'},{name:'monthlySalary',label:'ფიქსირებული ხელფასი თვეში, ₾',type:'number'}],
  expenses:[{name:'title',label:'ხარჯის აღწერა',required:true},{name:'category',label:'კატეგორია',type:'select',options:expenseCategories},{name:'amount',label:'თანხა, ₾',type:'number',required:true},{name:'date',label:'თარიღი',type:'date',required:true}],
  tasks:[{name:'title',label:'Задача',required:true},{name:'due',label:'Срок',type:'date'},{name:'done',label:'Статус',type:'select',options:[['false','Открыта'],['true','Выполнена']]}],
  groups:[{name:'name',label:'Название группы',required:true},{name:'teacher',label:'Педагог'},{name:'schedule',label:'Расписание'}],
  clubs:[{name:'name',label:'წრის დასახელება',required:true},{name:'audience',label:'ასაკი / სექტორი / პირობები'},{name:'teacherId',label:'მასწავლებელი',type:'select',options:[]},{name:'billingType',label:'გადახდის ტიპი',type:'select',options:[['monthly','თვიური'],['per_lesson','ერთჯერადი · დასწრებაზე'],['flexible','თვიური ან ერთჯერადი']]},{name:'weekdays',label:'კვირის დღეები',type:'multi',options:[[1,'ორშაბათი'],[2,'სამშაბათი'],[3,'ოთხშაბათი'],[4,'ხუთშაბათი'],[5,'პარასკევი'],[6,'შაბათი'],[0,'კვირა']]},{name:'timeSlots',label:'დროები, მძიმით გამოყოფილი'},{name:'schedule',label:'განრიგის მოკლე აღწერა'},{name:'tariff',label:'თვიური ფასი, ₾',type:'number'},{name:'lessonRate',label:'ერთჯერადი ფასი / გაკვეთილი, ₾',type:'number'},{name:'kindergartenRate',label:'კრაფტი — ბაღის ბავშვის ფასი, ₾',type:'number'},{name:'externalRate',label:'კრაფტი — გარე ბავშვის ფასი, ₾',type:'number'},{name:'teacherPayType',label:'მასწავლებლის ანაზღაურება',type:'select',options:[['','მასწავლებლის საერთო წესით'],['per_lesson','ფიქსირებული თანხა გაკვეთილზე'],['percent','პროცენტი მიღებული თანხიდან']]},{name:'teacherRate',label:'ფიქსირებული თანხა ერთ გაკვეთილზე, ₾',type:'number'},{name:'teacherPercent',label:'მასწავლებლის პროცენტი, %',type:'number'}],
  schedule:[{name:'name',label:'Занятие',required:true},{name:'group',label:'Группа'},{name:'date',label:'Дата',type:'date',required:true},{name:'time',label:'Время',type:'time'}],
  attendance:[{name:'childId',label:'ბავშვი',type:'select',options:[],required:true},{name:'subjectId',label:'წრე',type:'select',options:[],required:true},{name:'date',label:'თარიღი',type:'date',required:true},{name:'status',label:'სტატუსი',type:'select',options:[['present','დაესწრო'],['absent','არ დაესწრო']]}],
};
function editSimple(kind, id, initialOverride = null) {
  const old = id ? get(kind, id) : null;
  const craftFields = new Set(['kindergartenRate','externalRate']);
  const attendanceSubject=kind==='attendance'?(old?.subjectId||initialOverride?.subjectId):'';
  const attendancePool=activePeople('children');
  const attendanceChildren=attendanceSubject?attendancePool.filter(child=>(child.activityIds||[]).includes(attendanceSubject)):attendancePool;
  const selectableStaff=activePeople('staff');
  if (kind==='clubs'&&old?.teacherId&&!selectableStaff.some(person=>person.id===old.teacherId)) { const assigned=get('staff',old.teacherId); if (assigned) selectableStaff.push(assigned); }
  const fields = simpleFields[kind]?.filter(field => kind !== 'clubs' || isCraftCircle(old) || !craftFields.has(field.name)).map(field => field.name === 'childId' && kind === 'attendance' ? {...field,options:attendanceChildren.map(c=>[c.id,c.name])} : field.name === 'subjectId' && kind === 'attendance' ? {...field,options:data.clubs.map(circle=>[circle.id,circle.name])} : field.name === 'teacherId' && kind === 'clubs' ? {...field,options:[['','არ არის დანიშნული'],...selectableStaff.map(person=>[person.id,`${person.name}${isActiveRecord(person,'staff')?'':' · არააქტიური'}`])]} : field);
  if (!fields) return;
  if (kind === 'attendance' && !attendanceChildren.length) return toast('აქტიური ბავშვები ამ წრეში არ არიან');
  openForm(old ? 'Изменить запись' : 'Новая запись', fields, async values => {
    if (kind === 'tasks') values.done = values.done === 'true';
    if (kind === 'staff') { if (!values.role.trim()) values.role = 'მასწავლებელი'; values.active=values.active!=='false'; values.lessonRate=number(values.lessonRate); values.revenueShare=number(values.revenueShare); values.monthlySalary=number(values.monthlySalary); }
    if (kind === 'expenses') { values.amount = number(values.amount); if (initialOverride?.sourceRow) Object.assign(values, {sourceRow:initialOverride.sourceRow,sourceColumn:initialOverride.sourceColumn,sourceRaw:initialOverride.sourceRaw}); }
    if (kind === 'clubs') { values.weekdays=(values.weekdays||[]).map(Number); values.timeSlots=String(values.timeSlots||'').split(',').map(value=>value.trim()).filter(Boolean); values.tariff = values.tariff === '' ? null : number(values.tariff); values.lessonRate=values.lessonRate===''?null:number(values.lessonRate); if ('kindergartenRate' in values) values.kindergartenRate=values.kindergartenRate===''?30:number(values.kindergartenRate); if ('externalRate' in values) values.externalRate=values.externalRate===''?40:number(values.externalRate); values.teacherRate = values.teacherRate === '' ? null : number(values.teacherRate); values.teacherPercent=values.teacherPercent===''?null:number(values.teacherPercent); if (values.teacherPercent!=null&&(values.teacherPercent<0||values.teacherPercent>100)) throw new Error('პროცენტი უნდა იყოს 0-დან 100-მდე'); }
    if (kind === 'attendance') { const child=get('children',values.childId); values.name=child?.name||''; if (!old&&data.attendance.some(item=>item.childId===values.childId&&item.subjectId===values.subjectId&&item.date===values.date)) throw new Error('ამ ბავშვის დასწრება ამ დღისთვის უკვე მონიშნულია'); }
    if (old) await dataAdapter.update(kind, id, values); else await dataAdapter.create(kind, values);
    go(kind==='attendance'&&current!=='attendance'?current:kind); toast('Запись сохранена');
  }, old ? (kind==='clubs'&&isCraftCircle(old)?{...old,billingType:'per_lesson',kindergartenRate:old.kindergartenRate??30,externalRate:old.externalRate??40,timeSlots:(old.timeSlots||[]).join(', ')}:kind==='clubs'?{...old,timeSlots:(old.timeSlots||[]).join(', ')}:kind==='staff'?{...old,active:String(isActiveRecord(old,'staff'))}:old) : initialOverride || { date:today(),done:'false',role:kind==='staff'?'მასწავლებელი':'',active:kind==='staff'?'true':undefined,payType:kind==='staff'?'per_lesson':'',billingType:kind==='clubs'?'monthly':'',weekdays:kind==='clubs'?[]:undefined,kindergartenRate:kind==='clubs'?30:'',externalRate:kind==='clubs'?40:'',status:kind==='attendance'?'present':'' });
  if (old && kind === 'attendance') {
    const actions=$('modalForm').querySelector('.form-actions');
    actions?.insertAdjacentHTML('afterbegin',`<button class="btn danger" type="button" onclick="deleteAttendance('${esc(old.id)}')">წაშლა</button>`);
  }
  if (old && ['expenses','tasks','schedule'].includes(kind)) {
    const actions=$('modalForm').querySelector('.form-actions');
    actions?.insertAdjacentHTML('afterbegin',`<button class="btn danger" type="button" onclick="deleteRecord('${esc(kind)}','${esc(old.id)}','${esc(old.title||old.name||old.date||'ჩანაწერი')}','${kind==='schedule'?'schedule':kind}')">წაშლა</button>`);
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
  openForm('Tomatis · პროცედურის დამატება',[
    {name:'childId',label:'ბავშვი',type:'select',required:true,options:children.map(child=>[child.id,child.name])},
    {name:'date',label:'პროცედურის თარიღი',type:'date',required:true},
    {name:'price',label:'ერთი პროცედურის ფასი, ₾',type:'number',required:true},
  ],async values=>{
    const child=get('children',values.childId),price=number(values.price);
    if (!child||price<=0) throw new Error('მიუთითეთ ბავშვი და სწორი ფასი');
    if (data.attendance.some(item=>item.childId===child.id&&item.subjectId===subject.id&&item.date===values.date&&wasPresent(item))) throw new Error('ამ დღეს Tomatis-ის პროცედურა უკვე დამატებულია');
    const activityIds=[...new Set([...(child.activityIds||[]),subject.id])];
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
    <button type="button" class="quick-add-button" onclick="quickAddAction('tomatis')"><span class="quick-add-icon" style="--action-bg:#eeeaff;--action-color:#6a46d8"><svg viewBox="0 0 24 24"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="7"/></svg></span><span class="quick-add-copy"><b>Tomatis პროცედურა</b><small>ბავშვი, თარიღი და ინდივიდუალური ფასი</small></span><span class="quick-add-arrow">›</span></button>
  </div>`;
  translateUi($("modalForm"));
  $("modal").classList.remove('hidden');
}
function quickAddAction(type) {
  closeModal();
  setTimeout(() => ({child:childForm,payment:paymentForm,expense:()=>editSimple('expenses'),tomatis:addTomatisSession}[type]?.()), 90);
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
