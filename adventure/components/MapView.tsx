import { useEffect, useRef, useState, useCallback } from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import { useGameStore } from "../store/gameStore";
import { useThemeStore } from "../store/themeStore";
import { CITIES, CITY_STATE } from "../constants/config";
import { Colors } from "../constants/colors";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_usaLow from "@amcharts/amcharts5-geodata/usaLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

// ── ФАКТЫ О ШТАТАХ США (для облачка при слежении) ──────────────────────────
const STATE_FACTS: Record<string, string[]> = {
  TX: ["🤠 Техас — крупнейший штат по грузоперевозкам в США. Более 800 млн тонн в год.", "🛢️ Нефтяной хаб: Хьюстон — крупнейший порт по тоннажу в США.", "🌵 I-10 через Техас — одна из самых загруженных фрейт-трасс страны.", "🏭 Техас производит больше нефти, чем большинство стран ОПЕК.", "🚛 Каждый 8-й трак в США зарегистрирован в Техасе."],
  CA: ["🌉 Калифорния — #1 по объёму импорта через порты Лос-Анджелес и Лонг-Бич.", "🍊 Центральная долина: 25% всех продуктов питания США выращено здесь.", "🚛 I-5 — главная артерия West Coast, 24/7 поток рефрижераторов.", "💻 Silicon Valley генерирует огромный поток электроники и tech-грузов.", "🌊 Порт LA обрабатывает 40% всего импорта США из Азии."],
  FL: ["🍊 Флорида — главный поставщик цитрусовых в США. Миллионы тонн ежегодно.", "🏖️ Майами — ворота в Латинскую Америку для грузоперевозок.", "🚛 I-95 вдоль побережья — один из самых загруженных коридоров East Coast.", "🌴 Туристическая индустрия генерирует огромный поток потребительских товаров.", "⚡ Флорида — лидер по солнечной энергетике, растёт спрос на оборудование."],
  IL: ["🌽 Чикаго — крупнейший железнодорожный хаб Северной Америки.", "🏙️ O'Hare — один из самых загруженных аэропортов для авиагрузов.", "🌾 Иллинойс производит 10% всей кукурузы США.", "🚛 I-80 через Иллинойс — главный трансконтинентальный маршрут.", "🏭 Чикаго — центр металлургии и машиностроения Среднего Запада."],
  OH: ["🏭 Огайо — сердце «Ржавого пояса», крупный производитель стали и авто.", "🚛 I-70 и I-71 пересекаются в Колумбусе — крупнейший логистический узел.", "🚗 Огайо — 3-й по объёму производства автомобилей штат.", "📦 Колумбус — один из крупнейших дистрибуционных центров Amazon.", "🌽 Огайо входит в топ-5 по производству кукурузы и сои."],
  TN: ["🎸 Нэшвилл — не только музыка, но и крупный логистический хаб юго-востока.", "🚛 I-40 через Теннесси — главный маршрут между East и West Coast.", "📦 Мемфис — штаб-квартира FedEx, крупнейший авиагрузовой хаб мира.", "🏭 Теннесси — крупный производитель автомобилей (Volkswagen, Nissan).", "🌊 Река Миссисипи на западе — важный водный путь для баржевых грузов."],
  GA: ["✈️ Атланта — крупнейший авиационный хаб мира по пассажиропотоку.", "🍑 Джорджия — главный производитель персиков и арахиса в США.", "🚛 I-75 и I-85 сходятся в Атланте — крупнейший дорожный узел юга.", "📦 Атланта — региональный дистрибуционный центр для всего юго-востока.", "🏭 Порт Саванна — 4-й по загруженности контейнерный порт США."],
  NC: ["🚬 Северная Каролина — исторически крупнейший производитель табака.", "🏭 Charlotte — финансовый центр и крупный логистический хаб.", "🌲 Мебельная столица США — High Point, NC. Огромный поток мебели.", "🚛 I-85 — главная артерия Piedmont Corridor между Charlotte и Atlanta.", "✈️ Charlotte Douglas — один из крупнейших хабов American Airlines."],
  PA: ["🏭 Пенсильвания — исторический центр сталелитейной промышленности США.", "🚛 I-76 (Pennsylvania Turnpike) — одна из первых платных дорог страны.", "🏙️ Филадельфия — крупный порт и дистрибуционный центр East Coast.", "⛽ Пенсильвания — крупный производитель природного газа (сланец Марселлус).", "🍄 Кеннет-Сквер — «грибная столица мира», 60% грибов США."],
  NY: ["🗽 Нью-Йорк — крупнейший потребительский рынок США, огромный спрос на доставку.", "🚢 Порт Нью-Йорк/Нью-Джерси — 3-й по загруженности порт США.", "🚛 I-87 и I-95 — главные грузовые коридоры северо-востока.", "🍎 Штат Нью-Йорк — 2-й по производству яблок в США.", "🏭 Буффало — крупный промышленный центр у границы с Канадой."],
  TX: ["🤠 Техас — крупнейший штат по грузоперевозкам в США.", "🛢️ Хьюстон — нефтехимический хаб #1 в Северной Америке.", "🌵 I-10 через Техас — одна из самых загруженных фрейт-трасс.", "🚛 Ламаредо — крупнейший сухопутный пограничный переход США/Мексика.", "🏭 Техас производит 40% всей нефти США."],
  MO: ["🌉 Сент-Луис — исторические «Ворота на Запад», крупный речной порт.", "🚛 I-70 пересекает Миссури — главный трансконтинентальный маршрут.", "🌽 Миссури входит в топ-10 по производству кукурузы и сои.", "✈️ Канзас-Сити — крупный авиагрузовой и железнодорожный хаб.", "🏭 Миссури — крупный производитель автомобилей и авиационных компонентов."],
  KY: ["🐎 Кентукки — «Лошадиная столица мира», огромный поток спецгрузов.", "📦 Луисвилл — штаб-квартира UPS, крупнейший авиагрузовой хаб UPS.", "🚛 I-65 через Кентукки — главный коридор между Чикаго и Нэшвиллом.", "🥃 Кентукки производит 95% всего бурбона в мире.", "🏭 Кентукки — крупный производитель автомобилей (Toyota, Ford)."],
  IN: ["🏎️ Индианаполис — «Перекрёсток Америки», 5 Interstate сходятся в одной точке.", "🚛 I-65, I-70, I-74 делают Индиану ключевым транзитным штатом.", "🌽 Индиана входит в топ-5 по производству кукурузы и сои.", "🏭 Крупный производитель стали — Gary, IN у озера Мичиган.", "📦 Индианаполис — один из крупнейших дистрибуционных центров Среднего Запада."],
  MI: ["🚗 Детройт — «Автомобильная столица мира», Ford, GM, Chrysler.", "🏭 Мичиган производит больше автомобилей, чем любой другой штат.", "🌊 Мичиган граничит с 4 из 5 Великих озёр — огромный водный транспорт.", "🚛 I-75 — главный коридор для автокомпонентов между Детройтом и Канадой.", "🍒 Мичиган — #1 по производству вишни в США."],
  WI: ["🧀 Висконсин — «Молочный штат», производит 25% всего сыра США.", "🚛 I-94 — главный коридор между Чикаго и Миннеаполисом.", "🌲 Висконсин — крупный производитель бумаги и древесины.", "🏭 Милуоки — исторический центр пивоварения и машиностроения.", "🌽 Висконсин входит в топ-10 по производству кукурузы."],
  MN: ["🌾 Миннесота — крупнейший производитель сахарной свёклы в США.", "🚛 I-35 — главный коридор между Канзас-Сити и Канадой.", "❄️ Зимой температура падает до -40°F — особые требования к грузовикам.", "🏭 Миннеаполис — крупный центр пищевой промышленности (General Mills, Cargill).", "🌊 Дулут — крупнейший порт на Великих озёрах по тоннажу."],
  IA: ["🌽 Айова — #1 по производству кукурузы и свинины в США.", "🚛 I-80 пересекает Айову — главный трансконтинентальный маршрут.", "🐷 Айова производит 30% всей свинины США.", "🌾 Айова — крупнейший производитель этанола из кукурузы.", "🏭 Де-Мойн — крупный страховой и финансовый центр Среднего Запада."],
  KS: ["🌾 Канзас — «Пшеничный штат», производит 20% всей пшеницы США.", "🚛 I-70 пересекает Канзас — исторический маршрут на Запад.", "🐄 Канзас — крупнейший производитель говядины в США.", "🌪️ Торнадо Аллея — особые риски для грузоперевозок весной.", "✈️ Уичита — «Авиационная столица мира», Boeing, Cessna, Learjet."],
  NE: ["🌽 Небраска — 3-й по производству кукурузы штат в США.", "🐄 Небраска — крупнейший производитель говядины по объёму переработки.", "🚛 I-80 через Небраску — главный трансконтинентальный маршрут.", "🌾 Омаха — крупнейший в мире центр переработки мяса.", "🏦 Омаха — штаб-квартира Berkshire Hathaway и Union Pacific Railroad."],
  CO: ["⛰️ Колорадо — горные перевалы создают сложности для грузовиков зимой.", "🚛 I-70 через Скалистые горы — один из самых сложных маршрутов США.", "🌿 Колорадо — крупный производитель пшеницы и сахарной свёклы.", "⛷️ Горнолыжные курорты генерируют огромный поток туристических грузов.", "🛢️ Колорадо — крупный производитель нефти и природного газа."],
  AZ: ["☀️ Аризона — один из самых быстрорастущих штатов, огромный строительный бум.", "🚛 I-10 через Аризону — главный маршрут между LA и Техасом.", "🌵 Феникс — крупный дистрибуционный хаб для юго-запада США.", "🔋 Аризона — лидер по производству солнечных панелей.", "🏭 Тусон — крупный центр аэрокосмической промышленности."],
  NV: ["🎰 Лас-Вегас генерирует огромный поток продуктов питания и товаров.", "🚛 I-15 — главный коридор между Лас-Вегасом и Лос-Анджелесом.", "⚡ Невада — лидер по производству лития для электробатарей.", "🏭 Reno — крупный логистический хаб (Tesla Gigafactory, Amazon).", "🌵 Невада — крупнейший производитель золота в США."],
  WA: ["🍎 Вашингтон — #1 по производству яблок в США, 60% всего урожая.", "🚛 I-5 — главный коридор West Coast от Канады до Мексики.", "✈️ Сиэтл — штаб-квартира Boeing, огромный поток авиакомпонентов.", "☕ Сиэтл — кофейная столица США, Starbucks и сотни обжарочных.", "🌊 Порт Сиэтл — крупный контейнерный порт для торговли с Азией."],
  OR: ["🌲 Орегон — крупнейший производитель пиломатериалов в США.", "🚛 I-5 через Орегон — главный коридор West Coast.", "🍇 Орегон — крупный производитель вина, особенно Pinot Noir.", "🏭 Портленд — крупный порт на реке Колумбия для зерновых грузов.", "🌲 Орегон производит 25% всей древесины США."],
  VA: ["🏛️ Вирджиния — крупный центр федеральных контрактов и оборонной промышленности.", "🚛 I-95 через Вирджинию — главный коридор East Coast.", "🚢 Норфолк — крупнейшая военно-морская база в мире.", "🍗 Вирджиния — крупный производитель птицы и морепродуктов.", "💻 Northern Virginia — «Дата-центр мира», 70% мирового интернет-трафика."],
  MD: ["🦀 Мэриленд — знаменит крабами Chesapeake Bay, огромный поток морепродуктов.", "🚛 I-95 через Балтимор — один из самых загруженных коридоров East Coast.", "🚢 Порт Балтимор — крупнейший порт по импорту автомобилей в США.", "🏛️ Близость к Вашингтону генерирует огромный поток правительственных грузов.", "⚗️ Мэриленд — крупный центр биотехнологий и фармацевтики."],
  SC: ["🚢 Порт Чарлстон — один из самых быстрорастущих контейнерных портов США.", "🚛 I-26 и I-95 — главные коридоры для грузов юго-востока.", "🏭 Южная Каролина — крупный производитель автомобилей (BMW, Volvo, Mercedes).", "🍑 Южная Каролина — крупный производитель персиков и табака.", "✈️ Гринвилл-Спартанбург — крупный авиационный и производственный хаб."],
  AL: ["🚗 Алабама — крупный производитель автомобилей (Mercedes, Honda, Hyundai).", "🚛 I-65 — главный коридор между Чикаго и Мобилом.", "🚢 Порт Мобил — крупный порт Мексиканского залива для стали и угля.", "🌾 Алабама — крупный производитель арахиса и хлопка.", "🏭 Хантсвилл — крупный центр аэрокосмической промышленности (NASA)."],
  MS: ["🎵 Миссисипи — родина блюза, джаза и рок-н-ролла.", "🚛 I-55 — главный коридор между Чикаго и Новым Орлеаном.", "🌊 Река Миссисипи — крупнейший водный путь для баржевых грузов.", "🌾 Миссисипи — крупный производитель хлопка и сои.", "🐟 Миссисипи — крупнейший производитель сома в США."],
  LA: ["🚢 Порт Нового Орлеана — 5-й по тоннажу порт в мире.", "🛢️ Луизиана — крупный производитель нефти и природного газа.", "🚛 I-10 через Луизиану — главный коридор вдоль Мексиканского залива.", "🦞 Луизиана производит 90% всех раков в США.", "🌾 Луизиана — крупный производитель сахарного тростника и риса."],
  AR: ["🐔 Арканзас — крупнейший производитель бройлеров в США (Tyson Foods).", "🚛 I-40 пересекает Арканзас — главный трансконтинентальный маршрут.", "🌾 Арканзас — крупный производитель риса и соевых бобов.", "🏪 Бентонвилл — штаб-квартира Walmart, крупнейшего ритейлера мира.", "🌊 Река Арканзас — важный водный путь для баржевых грузов."],
  OK: ["🛢️ Оклахома — крупный производитель нефти и природного газа.", "🚛 I-40 через Оклахому — историческая «Route 66».", "🌾 Оклахома — крупный производитель пшеницы и скота.", "🌪️ Торнадо Аллея — особые риски для грузоперевозок.", "🏭 Талса — крупный нефтехимический и авиационный центр."],
  NM: ["🌵 Нью-Мексико — крупный производитель чили и пекана.", "🚛 I-40 и I-25 пересекаются в Альбукерке — ключевой узел юго-запада.", "🛢️ Нью-Мексико — крупный производитель нефти и природного газа.", "☢️ Лос-Аламос — центр ядерных исследований, особые грузы.", "🌞 Нью-Мексико — лидер по солнечной энергетике на юго-западе."],
  WV: ["⛏️ Западная Вирджиния — исторический центр угольной промышленности.", "🚛 I-79 и I-77 — главные коридоры через горы Аппалачи.", "🌲 Западная Вирджиния — крупный производитель пиломатериалов.", "⚗️ Чарлстон — крупный центр химической промышленности.", "🏔️ Горный рельеф создаёт сложности для грузовиков — крутые подъёмы."],
  UT: ["⛷️ Юта — «Лучший снег на Земле», огромный поток туристических грузов.", "🚛 I-15 — главный коридор между Лас-Вегасом и Солт-Лейк-Сити.", "⛏️ Юта — крупный производитель меди, золота и серебра.", "🏭 Солт-Лейк-Сити — крупный дистрибуционный хаб для Горного Запада.", "🌵 Юта — крупный производитель соли (Большое Солёное озеро)."],
  ID: ["🥔 Айдахо — #1 по производству картофеля в США, 30% всего урожая.", "🚛 I-84 — главный коридор между Портлендом и Солт-Лейк-Сити.", "🌲 Айдахо — крупный производитель пиломатериалов и бумаги.", "🐟 Айдахо — крупный производитель форели.", "⛏️ Айдахо — крупный производитель серебра и фосфатов."],
  MT: ["🐄 Монтана — крупный производитель пшеницы и скота.", "🚛 I-90 и I-15 — главные коридоры через Монтану.", "⛏️ Монтана — крупный производитель меди и угля.", "🌲 Монтана — крупный производитель пиломатериалов.", "🦌 Монтана — крупнейший штат по площади к востоку от Скалистых гор."],
  WY: ["🛢️ Вайоминг — крупный производитель нефти, газа и угля.", "🚛 I-80 через Вайоминг — один из самых сложных зимних маршрутов.", "🐄 Вайоминг — крупный производитель скота.", "⛏️ Вайоминг — крупнейший производитель угля в США.", "🌋 Йеллоустон генерирует огромный поток туристических грузов летом."],
  SD: ["🌽 Южная Дакота — крупный производитель кукурузы и пшеницы.", "🚛 I-90 — главный коридор через Южную Дакоту.", "🐄 Южная Дакота — крупный производитель скота.", "🏔️ Маунт-Рашмор генерирует огромный туристический поток.", "🌾 Южная Дакота входит в топ-10 по производству сои."],
  ND: ["🛢️ Северная Дакота — крупный производитель нефти (сланец Баккен).", "🌾 Северная Дакота — #1 по производству подсолнечника и канолы.", "🚛 I-94 — главный коридор через Северную Дакоту.", "🌾 Северная Дакота — крупный производитель пшеницы и ячменя.", "❄️ Суровые зимы создают особые условия для грузоперевозок."],
  NH: ["🍁 Нью-Гэмпшир — крупный производитель кленового сиропа.", "🚛 I-93 — главный коридор между Бостоном и Монреалем.", "🌲 Нью-Гэмпшир — крупный производитель пиломатериалов.", "🏔️ Гора Вашингтон — самые сильные ветры в мире, сложные условия.", "🍎 Нью-Гэмпшир — крупный производитель яблок и тыкв."],
  VT: ["🍁 Вермонт — #1 по производству кленового сиропа в США.", "🚛 I-89 — главный коридор через Вермонт.", "🧀 Вермонт — крупный производитель сыра и молочных продуктов.", "🌲 Вермонт — крупный производитель пиломатериалов.", "🍎 Вермонт — крупный производитель яблок и сидра."],
  ME: ["🦞 Мэн — #1 по производству омаров в США, 90% всего улова.", "🚛 I-95 — главный коридор через Мэн.", "🌲 Мэн — крупный производитель пиломатериалов и бумаги.", "🫐 Мэн — #1 по производству черники в США.", "🐟 Мэн — крупный производитель морепродуктов."],
  MA: ["🦞 Массачусетс — крупный производитель морепродуктов (Бостон).", "🚛 I-90 (Mass Pike) — главный коридор через Массачусетс.", "💊 Массачусетс — крупный центр биотехнологий и фармацевтики.", "🎓 Бостон — крупный центр образования, огромный поток книг и оборудования.", "🏭 Массачусетс — исторический центр текстильной промышленности."],
  CT: ["🏭 Коннектикут — крупный производитель вертолётов (Sikorsky).", "🚛 I-95 — главный коридор East Coast через Коннектикут.", "💊 Коннектикут — крупный центр фармацевтики и страхования.", "⚓ Гротон — крупнейший производитель подводных лодок в США.", "🎓 Йель и другие университеты генерируют огромный поток грузов."],
  RI: ["🦞 Род-Айленд — крупный производитель морепродуктов.", "🚛 I-95 — главный коридор через Род-Айленд.", "🏭 Провиденс — исторический центр ювелирной промышленности.", "⚓ Ньюпорт — крупный военно-морской центр.", "🎓 Браун и RISD генерируют поток образовательных грузов."],
  DE: ["🏭 Делавэр — крупный химический центр (DuPont).", "🚛 I-95 — главный коридор East Coast через Делавэр.", "🏦 Делавэр — «корпоративная столица» США, 60% Fortune 500 зарегистрированы здесь.", "🌽 Делавэр — крупный производитель кукурузы и сои.", "🐔 Делавэр — крупный производитель бройлеров."],
  NJ: ["🏭 Нью-Джерси — крупный фармацевтический центр (Johnson & Johnson, Merck).", "🚛 I-95 и I-78 — главные коридоры через Нью-Джерси.", "🚢 Порт Нью-Джерси — крупнейший порт East Coast.", "🍅 Нью-Джерси — «Садовый штат», крупный производитель томатов.", "🏭 Нью-Джерси — крупный нефтеперерабатывающий центр."],
};

// Получить случайный факт для штата
function getStateFact(stateCode: string): string {
  const facts = STATE_FACTS[stateCode];
  if (!facts || facts.length === 0) return `📍 Штат ${stateCode} — часть великой американской дорожной сети.`;
  return facts[Math.floor(Math.random() * facts.length)];
}

const STATUS_COLOR: Record<string, string> = {
  idle:        '#94a3b8', // серый — свободен
  driving:     '#818cf8', // индиго — едет к погрузке
  loaded:      '#4ade80', // зелёный — везёт груз
  at_pickup:   '#fbbf24', // жёлтый — на погрузке
  at_delivery: '#c084fc', // фиолетовый — на разгрузке
  breakdown:   '#f87171', // красный — поломка
  waiting:     '#fb923c', // оранжевый — detention
};
const STATUS_LABEL: Record<string, string> = {
  idle: "Свободен", driving: "Едет к погрузке", loaded: "Везёт груз",
  at_pickup: "На погрузке", at_delivery: "На разгрузке",
  breakdown: "Поломка", waiting: "Detention",
};
const STATUS_EMOJI: Record<string, string> = {
  idle: "⚪", driving: "🔵", loaded: "🟢",
  at_pickup: "🟡", at_delivery: "🟣",
  breakdown: "🔴", waiting: "🟠",
};
const HUBS = [
  "Chicago","Los Angeles","New York","Houston","Dallas",
  "Atlanta","Seattle","Miami","Denver","Phoenix","Memphis",
  "Nashville","Indianapolis","Kansas City","Minneapolis",
  "Portland","San Francisco","Las Vegas","Salt Lake City",
];

// Штаты с высокими ставками (surge zones) — ротируются случайно при старте
const SURGE_STATES = ["TX","CA","FL","IL","GA","OH","PA","TN","NC","MO"];

function getTruckColor(truck: any, gameMinute = 0): string {
  // Ночёвка / обязательный перерыв / detention — серо-синий (проверяем первым)
  if ((truck as any).onNightStop || (truck as any).onMandatoryBreak) return "#64748b";
  if (truck.status === 'waiting') return "#64748b";
  // breakdown
  if (truck.status === 'breakdown') return "#f87171";
  // outOfOrder — только если реально сейчас заблокирован И gameMinute > 0
  const outOfOrder = (truck as any).outOfOrderUntil;
  if (gameMinute > 0 && outOfOrder && typeof outOfOrder === 'number' && outOfOrder > gameMinute) return "#ff0000";
  // idleWarning — только для idle траков
  if (truck.status === 'idle') {
    const warn = (truck as any).idleWarningLevel ?? 0;
    if (warn === 3) return "#ef4444";
    if (warn === 2) return "#f97316";
    if (warn === 1) return "#fbbf24";
  }
  return STATUS_COLOR[truck.status] || "#94a3b8";
}

const STATE_NAMES: Record<string, string> = {
  AL:"Alabama", AK:"Alaska", AZ:"Arizona", AR:"Arkansas", CA:"California",
  CO:"Colorado", CT:"Connecticut", DE:"Delaware", FL:"Florida", GA:"Georgia",
  HI:"Hawaii", ID:"Idaho", IL:"Illinois", IN:"Indiana", IA:"Iowa",
  KS:"Kansas", KY:"Kentucky", LA:"Louisiana", ME:"Maine", MD:"Maryland",
  MA:"Massachusetts", MI:"Michigan", MN:"Minnesota", MS:"Mississippi", MO:"Missouri",
  MT:"Montana", NE:"Nebraska", NV:"Nevada", NH:"New Hampshire", NJ:"New Jersey",
  NM:"New Mexico", NY:"New York", NC:"North Carolina", ND:"North Dakota", OH:"Ohio",
  OK:"Oklahoma", OR:"Oregon", PA:"Pennsylvania", RI:"Rhode Island", SC:"South Carolina",
  SD:"South Dakota", TN:"Tennessee", TX:"Texas", UT:"Utah", VT:"Vermont",
  VA:"Virginia", WA:"Washington", WV:"West Virginia", WI:"Wisconsin", WY:"Wyoming",
};

// Случайные погодные/трафик события на маршрутах
const ROUTE_EVENTS = ["⛈","🌨","🚧","🌫","⚠️"];
function getRouteEvent(truckId: string): string | null {
  const hash = truckId.charCodeAt(truckId.length - 1);
  if (hash % 5 === 0) return ROUTE_EVENTS[hash % ROUTE_EVENTS.length];
  return null;
}

// История маршрутов трака за смену
const routeHistory: Record<string, Array<[number, number]>> = {};

export default function MapView({ onTruckInfo, onTruckSelect, onFindLoad, onGuideOpen, guideActive }: {
  onTruckInfo?: (truckId: string) => void;
  onTruckSelect?: (truckId: string) => void;
  onFindLoad?: (city: string) => void;
  onGuideOpen?: () => void;
  guideActive?: boolean;
}) {
  if (Platform.OS !== "web") {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Карта доступна в веб-версии</Text>
      </View>
    );
  }
  return <MapAmCharts onTruckInfo={onTruckInfo} onTruckSelect={onTruckSelect} onFindLoad={onFindLoad} onGuideOpen={onGuideOpen} guideActive={guideActive} />;
}

function MapAmCharts({ onTruckInfo, onTruckSelect, onFindLoad, onGuideOpen, guideActive }: {
  onTruckInfo?: (truckId: string) => void;
  onTruckSelect?: (truckId: string) => void;
  onFindLoad?: (city: string) => void;
  onGuideOpen?: () => void;
  guideActive?: boolean;
}) {
  const divRef = useRef<any>(null);
  const rootRef = useRef<any>(null);
  const chartRef = useRef<any>(null);
  const truckSeriesRef = useRef<any>(null);
  const routeSeriesRef = useRef<any>(null);
  const historySeriesRef = useRef<any>(null);
  const polygonSeriesRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // Сбрасываем isMountedRef при каждом монтировании
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);
  const antLinesRef = useRef<any[]>([]);
  // Предзагруженная картинка грузовика — загружается один раз
  const lorryImgRef = useRef<HTMLImageElement | null>(null);
  const lorryImgReady = useRef(false);
  if (!lorryImgRef.current && typeof window !== 'undefined') {
    const img = new window.Image();
    img.src = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Articulated%20Lorry.png';
    img.onload = () => { lorryImgReady.current = true; };
    lorryImgRef.current = img;
  }
  const extraSeriesRef = useRef<any[]>([]);
  const antIntervalRef = useRef<any>(null);
  const colorIntervalRef = useRef<any>(null);
  // Карточки: Set видимых truckId + таймеры автоскрытия
  const visibleCardsRef = useRef<Set<string>>(new Set());
  const cardTimersRef = useRef<Record<string, any>>({});
  // Предыдущие статусы для детекции изменений
  const prevTruckStatusRef = useRef<Record<string, string>>({});
  const prevHosRef = useRef<Record<string, number>>({});
  const prevIdleWarnRef = useRef<Record<string, number>>({});

  const { trucks, availableLoads, phase, gameMinute } = useGameStore();
  const { mode: themeMode, colors: T } = useThemeStore();
  const activeTrucks = phase !== 'menu' ? trucks : [];
  const [legendVisible, setLegendVisible] = useState(true);
  const legendTimerRef = useRef<any>(null);

  // Авто-fade кнопок управления картой
  const [mapBtnsVisible, setMapBtnsVisible] = useState(true);
  const mapBtnsTimerRef = useRef<any>(null);
  const resetMapBtnsTimer = () => {
    setMapBtnsVisible(true);
    clearTimeout(mapBtnsTimerRef.current);
    mapBtnsTimerRef.current = setTimeout(() => setMapBtnsVisible(false), 4000);
  };

  // Автозакрытие через 4 секунды после открытия
  useEffect(() => {
    if (legendVisible) {
      clearTimeout(legendTimerRef.current);
      legendTimerRef.current = setTimeout(() => setLegendVisible(false), 4000);
    }
    return () => clearTimeout(legendTimerRef.current);
  }, [legendVisible]);

  // Запускаем таймер fade кнопок при маунте
  useEffect(() => {
    mapBtnsTimerRef.current = setTimeout(() => setMapBtnsVisible(false), 4000);
    return () => clearTimeout(mapBtnsTimerRef.current);
  }, []);
  const trucksRef = useRef(activeTrucks);
  const loadsRef = useRef(availableLoads);
  const gameMinuteRef = useRef(gameMinute);
  const onTruckInfoRef = useRef(onTruckInfo);
  const onTruckSelectRef = useRef(onTruckSelect);
  const onFindLoadRef = useRef(onFindLoad);
  trucksRef.current = activeTrucks;
  loadsRef.current = availableLoads;
  gameMinuteRef.current = gameMinute;
  onTruckInfoRef.current = onTruckInfo;
  onTruckSelectRef.current = onTruckSelect;
  onFindLoadRef.current = onFindLoad;

  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const selectedTruckRef = useRef<any>(null); // кликнутый трак (зафиксирован)
  const [selectedState, setSelectedState] = useState<any>(null);
  const [followTruck, setFollowTruck] = useState(false);
  const followTruckIdRef = useRef<string | null>(null);
  const followIntervalRef = useRef<any>(null);
  const [stateFact, setStateFact] = useState<string>("");
  const factTimerRef = useRef<any>(null);
  const lastFactStateRef = useRef<string>("");
  const truckClickedRef = useRef(false);
  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; color: string }>>([]);
  const [truckTooltips, setTruckTooltips] = useState<Array<{ id: string; truckId: string; msg: string; color: string }>>([]);
  const truckTooltipsRef = useRef(truckTooltips);
  truckTooltipsRef.current = truckTooltips;
  const zoomLevelRef = useRef(1);
  // Surge zones — 3 случайных штата
  const [surgeStates] = useState<string[]>(() => {
    const shuffled = [...SURGE_STATES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });

  // Добавить тост-уведомление
  const addToast = useCallback((msg: string, color = "#06b6d4") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-3), { id, msg, color }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  // Слушаем события из store для тостов
  useEffect(() => {
    function handleMapToast(e: Event) {
      const { message, color, truckId } = (e as CustomEvent).detail;
      
      if (truckId) {
        // Если есть truckId — показываем tooltip над траком
        const id = Math.random().toString(36).slice(2);
        setTruckTooltips(prev => [...prev.slice(-2), { id, truckId, msg: message, color }]);
        setTimeout(() => setTruckTooltips(prev => prev.filter(t => t.id !== id)), 5000);
      } else {
        // Иначе — обычный toast в углу
        addToast(message, color);
      }
    }
    window.addEventListener('mapToast', handleMapToast);
    return () => window.removeEventListener('mapToast', handleMapToast);
  }, [addToast]);

  // Сброс follow при ручном wheel-зуме (мышь/пинч на мобильном)
  useEffect(() => {
    const el = divRef.current;
    if (!el) return;
    const onWheel = () => {
      if (followTruckIdRef.current) {
        followTruckIdRef.current = null;
        setFollowTruck(false);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: true });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Факт о штате при слежении за траком
  useEffect(() => {
    if (!followTruck) { setStateFact(""); clearInterval(factTimerRef.current); return; }
    const updateFact = () => {
      const targetId = followTruckIdRef.current ?? selectedTruckRef.current?.truckId;
      const truck = trucksRef.current.find((t: any) => t.id === targetId) ?? trucksRef.current[0];
      if (!truck) return;
      const stateCode = CITY_STATE[truck.currentCity] ?? "";
      if (!stateCode) return;
      if (stateCode !== lastFactStateRef.current) {
        lastFactStateRef.current = stateCode;
        setStateFact(getStateFact(stateCode));
      }
    };
    updateFact();
    clearInterval(factTimerRef.current);
    factTimerRef.current = setInterval(() => {
      const targetId = followTruckIdRef.current ?? selectedTruckRef.current?.truckId;
      const truck = trucksRef.current.find((t: any) => t.id === targetId) ?? trucksRef.current[0];
      if (!truck) return;
      const stateCode = CITY_STATE[truck.currentCity] ?? "";
      if (stateCode) setStateFact(getStateFact(stateCode));
    }, 12000);
    return () => clearInterval(factTimerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followTruck]);

  // Следование за траком
  useEffect(() => {
    if (followIntervalRef.current) clearInterval(followIntervalRef.current);
    if (!followTruck) return;
    followIntervalRef.current = setInterval(() => {
      const chart = chartRef.current;
      if (!chart) return;
      const trucks = trucksRef.current;
      // Приоритет: назначенный трак → кликнутый трак → первый активный (loaded/driving)
      const targetId = followTruckIdRef.current ?? selectedTruckRef.current?.truckId;
      const target = targetId
        ? trucks.find((t: any) => t.id === targetId)
        : trucks.find((t: any) => t.status === 'loaded' || t.status === 'driving') ?? trucks[0];
      if (target) {
        chart.zoomToGeoPoint({ longitude: target.position[0], latitude: target.position[1] }, 5, true);
      }
    }, 2000);
    return () => clearInterval(followIntervalRef.current);
  // selectedTruck намеренно убран из зависимостей — используем ref чтобы не перезапускать интервал
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followTruck]);

  // Слушаем событие назначения груза — включаем слежение за конкретным траком
  useEffect(() => {
    function handleFollowAssigned(e: Event) {
      const { truckId } = (e as CustomEvent).detail;
      followTruckIdRef.current = truckId;
      setFollowTruck(true);
      // Сохраняем в sessionStorage — на случай если MapView ещё не был смонтирован
      try { sessionStorage.setItem('followTruckId', truckId); } catch (_) {}
    }
    window.addEventListener('followAssignedTruck', handleFollowAssigned);

    // При монтировании проверяем — вдруг событие уже было до нашей подписки
    try {
      const pending = sessionStorage.getItem('followTruckId');
      if (pending) {
        followTruckIdRef.current = pending;
        setFollowTruck(true);
        sessionStorage.removeItem('followTruckId');
      }
    } catch (_) {}

    return () => window.removeEventListener('followAssignedTruck', handleFollowAssigned);
  }, []);

  // Синхронизируем данные закреплённой карточки при каждом обновлении траков
  useEffect(() => {
    if (!selectedTruckRef.current) return;
    const id = selectedTruckRef.current.truckId;
    const updated = activeTrucks.find((t: any) => t.id === id);
    if (!updated) return;
    const dest = updated.destinationCity ? CITIES[updated.destinationCity] : null;
    const milesLeft = dest
      ? Math.round(Math.hypot(dest[0] - updated.position[0], dest[1] - updated.position[1]) * 55)
      : 0;
    const colorHex = getTruckColor(updated, gameMinuteRef.current);
    const colorInt = parseInt(colorHex.replace("#", ""), 16);
    const updatedCard = {
      ...selectedTruckRef.current,
      status: updated.status,
      statusLabel: STATUS_LABEL[updated.status] || updated.status,
      currentCity: updated.currentCity,
      destinationCity: updated.destinationCity || "",
      hoursLeft: updated.hoursLeft,
      milesLeft,
      colorHex,
      colorInt,
      currentLoad: updated.currentLoad,
    };
    selectedTruckRef.current = updatedCard;
    setSelectedTruck(updatedCard);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrucks]);
  const chartInitializedRef = useRef(false);
  useEffect(() => {
    // Пропускаем первый вызов — он совпадает с инициализацией карты
    if (!chartInitializedRef.current) return;
    if (activeTrucks.length > 0 && chartRef.current && rootRef.current) {
      rebuildTruckSeries(rootRef.current, chartRef.current);
      rebuildRoutes(rootRef.current, chartRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrucks.length]);

  // Хелпер: показать карточку на N секунд
  function showCard(truckId: string, durationMs = 15000) {
    visibleCardsRef.current.add(truckId);
    clearTimeout(cardTimersRef.current[truckId]);
    cardTimersRef.current[truckId] = setTimeout(() => {
      if (!isMountedRef.current) return;
      visibleCardsRef.current.delete(truckId);
      if (rootRef.current && chartRef.current) {
        rebuildTruckSeries(rootRef.current, chartRef.current);
      }
    }, durationMs);
    if (rootRef.current && chartRef.current) {
      rebuildTruckSeries(rootRef.current, chartRef.current);
    }
  }

  // Умное появление карточек по событиям
  useEffect(() => {
    if (!chartInitializedRef.current) return;
    activeTrucks.forEach((t: any) => {
      const prevStatus = prevTruckStatusRef.current[t.id];
      const prevHos = prevHosRef.current[t.id] ?? 11;
      const prevWarn = prevIdleWarnRef.current[t.id] ?? 0;
      const warn = t.idleWarningLevel ?? 0;

      // 🚨 Поломка — показать 10 сек
      if (t.status === 'breakdown' && prevStatus !== 'breakdown') {
        showCard(t.id, 30000);
      }
      // 📦 Прибыл на погрузку
      else if (t.status === 'at_pickup' && prevStatus !== 'at_pickup') {
        showCard(t.id, 18000);
      }
      // 🏭 Прибыл на разгрузку
      else if (t.status === 'at_delivery' && prevStatus !== 'at_delivery') {
        showCard(t.id, 18000);
      }
      // ⏰ Detention — статус waiting появился
      else if (t.status === 'waiting' && prevStatus !== 'waiting' && prevStatus !== undefined) {
        showCard(t.id, 24000);
      }
      // 🌙 Ночёвка началась
      else if (t.onNightStop && !prevTruckStatusRef.current[t.id + '_night']) {
        prevTruckStatusRef.current[t.id + '_night'] = 'shown';
        showCard(t.id, 21000);
      }
      // ⚠️ HOS упал ниже 2ч
      else if (t.hoursLeft < 2 && prevHos >= 2) {
        showCard(t.id, 24000);
      }
      // 🔴 idleWarning достиг уровня 3
      else if (warn === 3 && prevWarn < 3) {
        showCard(t.id, 24000);
      }
      // ✅ Трак стал idle (только что доставил)
      else if (t.status === 'idle' && (prevStatus === 'at_delivery' || prevStatus === 'loaded')) {
        showCard(t.id, 15000);
      }

      // Обновляем предыдущие значения
      prevTruckStatusRef.current[t.id] = t.status;
      prevHosRef.current[t.id] = t.hoursLeft;
      prevIdleWarnRef.current[t.id] = warn;
      if (!t.onNightStop) delete prevTruckStatusRef.current[t.id + '_night'];
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrucks]);
  useEffect(() => {
    activeTrucks.forEach(t => {
      if (t.status === "loaded" || t.status === "driving") {
        if (!routeHistory[t.id]) routeHistory[t.id] = [];
        const last = routeHistory[t.id].at(-1);
        const [lng, lat] = t.position;
        if (!last || Math.hypot(last[0] - lng, last[1] - lat) > 0.3) {
          routeHistory[t.id].push([lng, lat]);
          if (routeHistory[t.id].length > 200) routeHistory[t.id].shift();
        }
      }
    });
  }, [activeTrucks]);

  // Строим pointData из текущих траков
  function buildPointData() {
    const ts = trucksRef.current;
    const posCount: Record<string, number> = {};
    const posIdx: Record<string, number> = {};
    ts.forEach(t => {
      const k = `${t.position[0].toFixed(2)},${t.position[1].toFixed(2)}`;
      posCount[k] = (posCount[k] || 0) + 1;
    });
    return ts.map(t => {
      const k = `${t.position[0].toFixed(2)},${t.position[1].toFixed(2)}`;
      const total = posCount[k] || 1;
      posIdx[k] = posIdx[k] ?? 0;
      const idx = posIdx[k]++;
      let jLng = 0, jLat = 0;
      if (total > 1) {
        const angle = (2 * Math.PI * idx) / total;
        jLng = Math.cos(angle) * 0.8;
        jLat = Math.sin(angle) * 0.8;
      }
      const dest = t.destinationCity ? CITIES[t.destinationCity] : null;
      const milesLeft = dest
        ? Math.round(Math.hypot(dest[0] - t.position[0], dest[1] - t.position[1]) * 55)
        : 0;
      const colorHex = getTruckColor(t, gameMinuteRef.current);
      const colorInt = parseInt(colorHex.replace("#", ""), 16);
      return {
        lat: t.position[1] + jLat,
        lng: t.position[0] + jLng,
        truckId: t.id,
        truckName: t.name.replace("Truck ", "T"),
        driver: t.driver,
        status: t.status,
        statusLabel: STATUS_LABEL[t.status] || t.status,
        colorHex, colorInt,
        idleWarning: (t as any).idleWarningLevel ?? 0,
        active: t.status === "loaded" || t.status === "driving",
        breakdown: t.status === "breakdown",
        waiting: t.status === "waiting",
        milesLeft,
        currentCity: t.currentCity,
        destinationCity: t.destinationCity || "",
        hoursLeft: t.hoursLeft,
        currentLoad: t.currentLoad,
        routeEvent: getRouteEvent(t.id),
        truckImageId: (t as any).truckImageId || 1, // ID картинки трака (1-11)
        onNightStop: (t as any).onNightStop || false, // ночёвка
      };
    });
  }

  // История маршрутов — полупрозрачный след
  function rebuildHistory(root: any, chart: any) {
    if (historySeriesRef.current) {
      const idx = chart.series.indexOf(historySeriesRef.current);
      if (idx >= 0) chart.series.removeIndex(idx);
      historySeriesRef.current.dispose();
      historySeriesRef.current = null;
    }
    const ts = trucksRef.current;
    const trucksWithHistory = ts.filter(t => routeHistory[t.id]?.length >= 2);
    if (trucksWithHistory.length === 0) return;

    const historySeries = chart.series.push(am5map.MapLineSeries.new(root, {}));
    historySeries.mapLines.template.setAll({ strokeWidth: 1, strokeOpacity: 0.2 });

    trucksWithHistory.forEach(t => {
      const colorInt = parseInt(getTruckColor(t, gameMinuteRef.current).replace("#", ""), 16);
      const item = historySeries.pushDataItem({
        geometry: { type: "LineString", coordinates: routeHistory[t.id] },
      });
      item.get("mapLine")?.setAll({
        stroke: am5.color(colorInt),
        strokeOpacity: 0.22,
        strokeWidth: 1.5,
        strokeDasharray: [2, 6],
      });
    });
    historySeriesRef.current = historySeries;
  }

  // Маршруты с анимацией "муравьи"
  function rebuildRoutes(root: any, chart: any) {
    antLinesRef.current = []; // сбрасываем список анимируемых линий

    // Удаляем старые серии миль и погоды
    extraSeriesRef.current.forEach(s => {
      try {
        const idx = chart.series.indexOf(s);
        if (idx >= 0) chart.series.removeIndex(idx);
        s.dispose();
      } catch (_) {}
    });
    extraSeriesRef.current = [];
    if (routeSeriesRef.current) {
      const idx = chart.series.indexOf(routeSeriesRef.current);
      if (idx >= 0) chart.series.removeIndex(idx);
      routeSeriesRef.current.dispose();
      routeSeriesRef.current = null;
    }
    const ts = trucksRef.current;
    const trucksWithRoute = ts.filter(t =>
      (t.status === "loaded" || t.status === "driving") &&
      t.routePath && t.routePath.length > 1
    );
    if (trucksWithRoute.length === 0) return;

    const routeSeries = chart.series.push(am5map.MapLineSeries.new(root, {}));
    routeSeries.mapLines.template.setAll({ strokeWidth: 2.5, strokeOpacity: 0.7 });

    trucksWithRoute.forEach(t => {
      const colorInt = parseInt(getTruckColor(t, gameMinuteRef.current).replace("#", ""), 16);
      const path = t.routePath!;
      const startIdx = Math.max(0, Math.floor(t.progress * (path.length - 1)) - 1);

      // Пройденная часть — тусклая
      if (startIdx >= 2) {
        const doneItem = routeSeries.pushDataItem({
          geometry: { type: "LineString", coordinates: path.slice(0, startIdx + 1) },
        });
        doneItem.get("mapLine")?.setAll({
          stroke: am5.color(colorInt), strokeOpacity: 0.15,
          strokeWidth: 1.5, strokeDasharray: [4, 4],
        });
      }

      // Оставшаяся часть — анимированные "муравьи"
      const remainingPath = path.slice(startIdx);
      if (remainingPath.length >= 2) {
        // Фоновая линия
        const bgItem = routeSeries.pushDataItem({
          geometry: { type: "LineString", coordinates: remainingPath },
        });
        bgItem.get("mapLine")?.setAll({
          stroke: am5.color(colorInt), strokeOpacity: 0.25, strokeWidth: 3,
        });
        // Анимированный пунктир поверх — сохраняем ссылку
        const antItem = routeSeries.pushDataItem({
          geometry: { type: "LineString", coordinates: remainingPath },
        });
        const antLine = antItem.get("mapLine");
        if (antLine) {
          antLine.setAll({
            stroke: am5.color(colorInt), strokeOpacity: 0.9,
            strokeWidth: 3, strokeDasharray: [8, 8],
            strokeDashoffset: 0,
          });
          antLinesRef.current.push(antLine);
        }


      }
    });

    routeSeriesRef.current = routeSeries;
  }

  // Обновляем цвета штатов по времени суток
  function updatePolygonColors() {
    const ps = polygonSeriesRef.current;
    if (!ps) return;
    const ls = loadsRef.current;
    const ts = trucksRef.current;

    // Игровое время: gameMinute=0 → 08:43
    const gm = gameMinuteRef.current;
    const totalMinutes = (gm + 8 * 60 + 43) % (24 * 60);
    const hour = totalMinutes / 60; // дробный час 0..24

    // Палитра по времени суток [baseColor, weakColor, strongColor]
    // 06-09 Рассвет — розово-оранжевый
    // 09-12 Утро — голубой
    // 12-15 День — ярко-синий
    // 15-18 Послеполудень — золотой
    // 18-21 Закат — оранжево-красный
    // 21-24 Вечер — фиолетовый
    // 00-03 Ночь — тёмно-синий
    // 03-06 Предрассвет — тёмно-фиолетовый
    type Palette = [number, number, number];
    // Палитра зависит от темы
    const TIMES: Array<{ h: number; p: Palette }> = themeMode === 'dark' ? [
      { h: 0,  p: [0x0a0f2e, 0x1e3a8a, 0x3b82f6] },
      { h: 3,  p: [0x1a0a2e, 0x4c1d95, 0x7c3aed] },
      { h: 6,  p: [0x431407, 0xc2410c, 0xfb923c] },
      { h: 9,  p: [0x0c2340, 0x0369a1, 0x38bdf8] },
      { h: 12, p: [0x1e3a5f, 0x0284c7, 0x06b6d4] },
      { h: 15, p: [0x422006, 0xb45309, 0xfbbf24] },
      { h: 18, p: [0x450a0a, 0xb91c1c, 0xf97316] },
      { h: 21, p: [0x1e1b4b, 0x4338ca, 0x818cf8] },
      { h: 24, p: [0x0a0f2e, 0x1e3a8a, 0x3b82f6] },
    ] : [
      { h: 0,  p: [0x7090a8, 0x5b7fa0, 0x4a90c4] },
      { h: 3,  p: [0x7888a8, 0x6070a0, 0x7c8aed] },
      { h: 6,  p: [0x9a8070, 0xc2804c, 0xfb923c] },
      { h: 9,  p: [0x6090b0, 0x4080b0, 0x38bdf8] },
      { h: 12, p: [0x5a8ab0, 0x3a80c0, 0x06b6d4] },
      { h: 15, p: [0x9a8050, 0xb48030, 0xfbbf24] },
      { h: 18, p: [0xa06050, 0xc05030, 0xf97316] },
      { h: 21, p: [0x7878a8, 0x6060c0, 0x818cf8] },
      { h: 24, p: [0x7090a8, 0x5b7fa0, 0x4a90c4] },
    ];

    // Интерполируем между двумя соседними временными точками
    let i = 0;
    for (let k = 0; k < TIMES.length - 1; k++) {
      if (hour >= TIMES[k].h && hour < TIMES[k + 1].h) { i = k; break; }
    }
    const t0 = TIMES[i], t1 = TIMES[i + 1];
    const frac = (hour - t0.h) / (t1.h - t0.h);

    function lerpColor(c0: number, c1: number, f: number): number {
      const r = Math.round(((c0 >> 16) & 0xff) + f * (((c1 >> 16) & 0xff) - ((c0 >> 16) & 0xff)));
      const g = Math.round(((c0 >> 8) & 0xff) + f * (((c1 >> 8) & 0xff) - ((c0 >> 8) & 0xff)));
      const b = Math.round((c0 & 0xff) + f * ((c1 & 0xff) - (c0 & 0xff)));
      return (r << 16) | (g << 8) | b;
    }

    const baseColor   = lerpColor(t0.p[0], t1.p[0], frac);
    const weakColor   = lerpColor(t0.p[1], t1.p[1], frac);
    const strongColor = lerpColor(t0.p[2], t1.p[2], frac);

    // Считаем активность по штатам
    const stateActivity: Record<string, number> = {};
    ls.forEach(l => {
      const s = CITY_STATE[l.fromCity];
      if (s) stateActivity[s] = (stateActivity[s] || 0) + 1;
    });
    ts.forEach(t => {
      const s = CITY_STATE[t.currentCity];
      if (s) stateActivity[s] = (stateActivity[s] || 0) + 0.5;
    });
    const maxActivity = Math.max(1, ...Object.values(stateActivity));

    ps.mapPolygons.each((polygon: any) => {
      const rawId = polygon.dataItem?.get("id") as string ?? "";
      const stateId = rawId.replace("US-", "");
      const activity = stateActivity[stateId] || 0;
      const isSurge = surgeStates.includes(stateId);

      if (isSurge) {
        polygon.setAll({ 
          fill: am5.color(0xff6b35), 
          fillOpacity: 0.85,
          stroke: am5.color(0xffa500),
          strokeWidth: 2,
          strokeOpacity: 1,
        });
      } else if (activity > 0) {
        // Тепловая карта — интерполяция между слабым и сильным цветом палитры
        const t = activity / maxActivity;
        const r1 = (weakColor >> 16) & 0xff, g1 = (weakColor >> 8) & 0xff, b1 = weakColor & 0xff;
        const r2 = (strongColor >> 16) & 0xff, g2 = (strongColor >> 8) & 0xff, b2 = strongColor & 0xff;
        const r = Math.round(r1 + t * (r2 - r1));
        const g = Math.round(g1 + t * (g2 - g1));
        const b = Math.round(b1 + t * (b2 - b1));
        const hex = (r << 16) | (g << 8) | b;
        polygon.setAll({ 
          fill: am5.color(hex), 
          fillOpacity: 0.85,
          stroke: am5.color(0x6b8fa8),
          strokeWidth: 1,
          strokeOpacity: 1,
        });
      } else {
        // Неактивные штаты — базовый цвет палитры
        polygon.setAll({ 
          fill: am5.color(baseColor),
          fillOpacity: 0.95,
          stroke: am5.color(0x6b8fa8),
          strokeWidth: 1,
          strokeOpacity: 0.9,
        });
      }
    });
  }

  // Серия траков — 3 варианта карточек через amCharts bullets
  // Плавная смена варианта карточек: fade out серии → rebuild → fade in
  function switchCardVariant(root: any, chart: any) {
    const oldSeries = truckSeriesRef.current;
    if (!oldSeries) {
      rebuildTruckSeries(root, chart);
      return;
    }
    // Fade out всей серии целиком — это работает надёжно в amCharts5
    try { oldSeries.animate({ key: "opacity" as any, to: 0, duration: 280 }); } catch (_) {}
    setTimeout(() => {
      if (!isMountedRef.current || !rootRef.current) return;
      rebuildTruckSeries(root, chart);
      const newSeries = truckSeriesRef.current;
      if (!newSeries) return;
      // Стартуем с opacity=0 и плавно показываем
      try {
        newSeries.set("opacity" as any, 0);
        newSeries.animate({ key: "opacity" as any, from: 0, to: 1, duration: 350 });
      } catch (_) {}
    }, 290);
  }

  function rebuildTruckSeries(root: any, chart: any) {
    if (truckSeriesRef.current) {
      try {
        const idx = chart.series.indexOf(truckSeriesRef.current);
        if (idx >= 0) chart.series.removeIndex(idx);
        truckSeriesRef.current.dispose();
      } catch (_) {}
      truckSeriesRef.current = null;
    }
    const pointData = buildPointData();
    const zoom = zoomLevelRef.current;
    const variant = zoom < 2 ? 'micro' : zoom < 4 ? 'medium' : 'large';

    const truckSeries = chart.series.push(
      am5map.MapPointSeries.new(root, { latitudeField: "lat", longitudeField: "lng" })
    );

    truckSeries.bullets.push((_root: any, _s: any, dataItem: any) => {
      const d = dataItem.dataContext as any;
      const container = am5.Container.new(root, { cursorOverStyle: "pointer" });

      const emojiSize = variant === 'micro' ? 22 : variant === 'medium' ? 28 : 34;
      const bgRadius = variant === 'micro' ? 14 : variant === 'medium' ? 18 : 22;
      // dyBase — смещение маркера вверх от точки на карте
      const dyBase = -(bgRadius + 4);
      const hitRadius = variant === 'micro' ? 24 : 32;

      // Иконка трака — картинка из Truck Shop или эмодзи fallback
      const truckImageId = (d as any).truckImageId || 1; // ID картинки трака (1-11)
      // Используем прямые пути для обоих режимов
      const truckImageUrl = `/game/assets/Truck Pic/${truckImageId}.webp`;
      
      const truckEmoji = (() => {
        if (d.breakdown) return "🔧";
        if (d.waiting) return "⏳";
        if (d.status === "at_pickup") return "📦";
        if (d.status === "at_delivery") return "🏁";
        if ((d as any).onNightStop) return "🌙";
        return "🚛"; // fallback
      })();

      // Пульс для активных траков (рисуем первым — он под маркером)
      if (d.active) {
        const pulse = container.children.push(am5.Circle.new(root, {
          radius: bgRadius, fill: am5.color(d.colorInt), fillOpacity: 0,
          centerX: am5.percent(50), centerY: am5.percent(50),
          dy: dyBase,
        }));
        pulse.animate({ key: "radius" as any, from: bgRadius, to: bgRadius + 10, duration: 2200, loops: Infinity });
        pulse.animate({ key: "fillOpacity" as any, from: 0.18, to: 0, duration: 2200, loops: Infinity });
      }
      // Предупреждение idle — тихое, медленное
      if (d.idleWarning > 0) {
        const warnColor = d.idleWarning >= 3 ? 0xef4444 : d.idleWarning === 2 ? 0xf97316 : 0xfbbf24;
        const warnSpeed = d.idleWarning >= 3 ? 2000 : d.idleWarning === 2 ? 2500 : 3000;
        const alertPulse = container.children.push(am5.Circle.new(root, {
          radius: bgRadius, fill: am5.color(warnColor), fillOpacity: 0,
          centerX: am5.percent(50), centerY: am5.percent(50),
          dy: dyBase,
        }));
        alertPulse.animate({ key: "radius" as any, from: bgRadius, to: bgRadius + 10, duration: warnSpeed, loops: Infinity });
        alertPulse.animate({ key: "fillOpacity" as any, from: 0.2, to: 0, duration: warnSpeed, loops: Infinity });
      }

      // Фон-кружок под маркером — без обводки
      const markerBg = container.children.push(am5.Circle.new(root, {
        radius: bgRadius,
        fill: am5.color(0x000000),
        fillOpacity: 0,
        strokeWidth: 0,
        centerX: am5.percent(50), centerY: am5.percent(50),
        dy: dyBase,
      }));

      // Картинка трака (если не breakdown/waiting/special status)
      const showTruckImage = !d.breakdown && !d.waiting && d.status !== "at_pickup" && d.status !== "at_delivery" && !(d as any).onNightStop;
      
      if (showTruckImage) {
        // Сбалансированные пропорции трака
        const truckHeight = emojiSize * 1.2;
        const truckWidth = truckHeight * 1.5;
        
        const truckImg = container.children.push(am5.Picture.new(root, {
          src: truckImageUrl,
          width: truckWidth,
          height: truckHeight,
          centerX: am5.percent(50),
          centerY: am5.percent(50),
          dy: dyBase,
        }));
        
        // 💨 ДЫМ ИЗ ВЫХЛОПНЫХ ТРУБ (только для едущих траков)
        if (d.status === "driving" || d.status === "loaded") {
          // Создаём 2 дымовых частицы (левая и правая труба)
          for (let i = 0; i < 2; i++) {
            const smokeX = i === 0 ? -truckWidth * 0.15 : truckWidth * 0.15; // позиция труб
            const smokeY = dyBase - truckHeight * 0.4; // над траком
            
            const smoke = container.children.push(am5.Circle.new(root, {
              radius: 3,
              fill: am5.color(0x808080),
              fillOpacity: 0,
              centerX: am5.percent(50),
              centerY: am5.percent(50),
              dx: smokeX,
              dy: smokeY,
            }));
            
            // Анимация дыма: появление → подъём → исчезновение
            const smokeDuration = 1200;
            const smokeDelay = i * 600; // задержка между трубами
            
            smoke.animate({ 
              key: "dy" as any, 
              from: smokeY, 
              to: smokeY - 15, 
              duration: smokeDuration, 
              loops: Infinity, 
              delay: smokeDelay,
              easing: am5.ease.out(am5.ease.cubic)
            });
            
            smoke.animate({ 
              key: "radius" as any, 
              from: 2, 
              to: 6, 
              duration: smokeDuration, 
              loops: Infinity, 
              delay: smokeDelay,
              easing: am5.ease.linear
            });
            
            smoke.animate({ 
              key: "fillOpacity" as any, 
              from: 0.4, 
              to: 0, 
              duration: smokeDuration, 
              loops: Infinity, 
              delay: smokeDelay,
              easing: am5.ease.out(am5.ease.quad)
            });
          }
        }
        
        // Реалистичная анимация по статусу
        if (d.status === "driving" || d.status === "loaded") {
          // ЕДУЩИЙ ТРАК — комбинированная анимация подвески
          // 1. Вертикальное покачивание (bounce) — имитация подвески на дороге
          truckImg.animate({ 
            key: "dy" as any, 
            from: dyBase - 1.5, 
            to: dyBase + 1.5, 
            duration: 400, 
            loops: Infinity, 
            easing: am5.ease.sinInOut 
          });
          
          // 2. Легкое вращение (tilt) — трак слегка наклоняется при движении
          truckImg.animate({ 
            key: "rotation" as any, 
            from: -1.5, 
            to: 1.5, 
            duration: 450, 
            loops: Infinity, 
            easing: am5.ease.sinInOut 
          });
          
          // 3. Горизонтальное микро-смещение — имитация вибрации двигателя
          truckImg.animate({ 
            key: "dx" as any, 
            from: -0.5, 
            to: 0.5, 
            duration: 350, 
            loops: Infinity, 
            easing: am5.ease.sinInOut 
          });
          
          // Фон тоже слегка двигается
          markerBg.animate({ 
            key: "dy" as any, 
            from: dyBase - 1, 
            to: dyBase + 1, 
            duration: 400, 
            loops: Infinity, 
            easing: am5.ease.sinInOut 
          });
          
        } else if (d.status === "idle") {
          // СТОЯЩИЙ ТРАК — очень легкое покачивание (двигатель работает на холостых)
          truckImg.animate({ 
            key: "dy" as any, 
            from: dyBase - 0.5, 
            to: dyBase + 0.5, 
            duration: 1800, 
            loops: Infinity, 
            easing: am5.ease.sinInOut 
          });
          
          // Едва заметное вращение
          truckImg.animate({ 
            key: "rotation" as any, 
            from: -0.3, 
            to: 0.3, 
            duration: 2000, 
            loops: Infinity, 
            easing: am5.ease.sinInOut 
          });
        }
      } else {
        // Эмодзи для специальных статусов
        const emojiLabel = container.children.push(am5.Label.new(root, {
          text: truckEmoji,
          fontSize: emojiSize,
          centerX: am5.percent(50),
          centerY: am5.percent(50),
          dy: dyBase,
        }));

        // Анимация по статусу
        if (d.status === "at_pickup" || d.status === "at_delivery") {
          emojiLabel.animate({ key: "scale" as any, from: 0.9, to: 1.2, duration: 700, loops: Infinity, easing: am5.ease.sinInOut });
          markerBg.animate({ key: "scale" as any, from: 0.9, to: 1.1, duration: 700, loops: Infinity, easing: am5.ease.sinInOut });
        } else if (d.breakdown) {
          emojiLabel.animate({ key: "rotation" as any, from: -15, to: 15, duration: 400, loops: Infinity, easing: am5.ease.sinInOut });
        }
      }

      // Текстовые строки
      const fromState = CITY_STATE[d.currentCity] || "";
      const toState   = CITY_STATE[d.destinationCity] || "";
      let routeShort  = fromState ? `${d.currentCity}, ${fromState}` : d.currentCity;
      if ((d.status === "loaded" || d.status === "driving") && d.destinationCity) {
        routeShort = `${d.currentCity.substring(0,3).toUpperCase()},${fromState}→${d.destinationCity.substring(0,3).toUpperCase()},${toState}`;
      } else if (d.status === "at_pickup")  { routeShort = "Погрузка"; }
      else if (d.status === "at_delivery")  { routeShort = "Разгрузка"; }
      else if (d.status === "waiting")      { routeShort = "Detention"; }
      else if (d.status === "breakdown")    { routeShort = "Поломка"; }

      const routeFull = d.destinationCity
        ? `${d.currentCity}, ${fromState} → ${d.destinationCity}, ${toState}`
        : routeShort;
      const hosRounded = Math.round(d.hoursLeft * 10) / 10;
      const hosLine = d.milesLeft > 0 ? `${d.milesLeft}mi · ${hosRounded}h HOS` : `${hosRounded}h HOS`;

      const onClick = () => {
        truckClickedRef.current = true;
        // Показываем карточку
        showCard(d.truckId, 15000);
        setSelectedTruck(d);
        selectedTruckRef.current = d;
        // Если слежение активно — переключаем на кликнутый трак (не выключаем!)
        if (followTruckIdRef.current !== null || followTruck) {
          followTruckIdRef.current = d.truckId;
          setFollowTruck(true);
        }
        // Только выделяем в хабе — модалку НЕ открываем
        onTruckSelectRef.current?.(d.truckId);
        const zl = variant === 'micro' ? 3 : 5;
        chartRef.current?.zoomToGeoPoint({ longitude: d.lng, latitude: d.lat }, zl, true);
        setTimeout(() => { truckClickedRef.current = false; }, 100);
      };

      const onHover = () => {
        if (!selectedTruckRef.current) setSelectedTruck(d);
      };
      const onHoverOut = () => {
        if (!selectedTruckRef.current) setSelectedTruck(null);
      };

      // Большая прозрачная hit-area для удобного нажатия на мобильном
      container.children.push(am5.Circle.new(root, {
        radius: hitRadius,
        fill: am5.color(0xffffff),
        fillOpacity: 0,
        strokeOpacity: 0,
        dy: -(bgRadius + 4),
        interactive: true,
        cursorOverStyle: "pointer",
      })).events.on("click", onClick);

      // 💬 TOOLTIP НАД ТРАКОМ (для событий)
      // Проверяем есть ли активный tooltip для этого трака
      const activeTooltip = truckTooltipsRef.current.find(tt => tt.truckId === d.truckId);
      if (activeTooltip) {
        const tooltipW = 200;
        const tooltipH = 40;
        const tooltipContainer = container.children.push(am5.Container.new(root, {
          width: tooltipW, height: tooltipH,
          dy: -(tooltipH + bgRadius * 2 + 20), 
          dx: -(tooltipW / 2),
          opacity: 1,
        }));
        
        // Конвертируем hex цвет в число для amCharts
        const colorHex = activeTooltip.color.replace('#', '');
        const colorInt = parseInt(colorHex, 16) || 0x06b6d4; // fallback на cyan
        
        // Фон tooltip
        tooltipContainer.children.push(am5.RoundedRectangle.new(root, {
          width: tooltipW, height: tooltipH,
          fill: am5.color(0x111827), fillOpacity: 0.95,
          stroke: am5.color(colorInt), strokeWidth: 2,
          cornerRadiusTL: 12, cornerRadiusTR: 12, cornerRadiusBL: 12, cornerRadiusBR: 12,
        }));
        
        // Текст tooltip
        tooltipContainer.children.push(am5.Label.new(root, {
          text: activeTooltip.msg.replace(/[✅🚨🔧🚛💬💨🌨️💰]/g, '').trim(),
          fontSize: 12,
          fontWeight: "700",
          fill: am5.color(0xffffff),
          centerX: am5.percent(50),
          centerY: am5.percent(50),
          textAlign: "center",
          maxWidth: tooltipW - 20,
          oversizedBehavior: "truncate",
        }));
        
        // Анимация появления
        tooltipContainer.animate({
          key: "opacity" as any,
          from: 0,
          to: 1,
          duration: 300,
          easing: am5.ease.out(am5.ease.cubic)
        });
        
        tooltipContainer.animate({
          key: "dy" as any,
          from: -(tooltipH + bgRadius * 2 + 30),
          to: -(tooltipH + bgRadius * 2 + 20),
          duration: 400,
          easing: am5.ease.out(am5.ease.back)
        });
      }

      // Карточки над траками отключены
      const cardVisible = false;

      // HOS цвет: зелёный >4h, жёлтый 2-4h, красный <2h
      const hosColor = d.hoursLeft > 4 ? 0x22c55e : d.hoursLeft > 2 ? 0xfbbf24 : 0xef4444;
      // HOS прогресс 0..1 (макс 11ч)
      const hosFrac = Math.min(1, Math.max(0, d.hoursLeft / 11));

      // ── MICRO: только ID + статус-полоска ─────────────────────────────
      if (variant === 'micro') {
        const W = 64, H = 30;
        const card = container.children.push(am5.Container.new(root, {
          width: W, height: H,
          dy: -(H + bgRadius * 2 + 10), dx: -(W / 2),
          interactive: true, cursorOverStyle: "pointer",
          visible: cardVisible,
          opacity: cardVisible ? 1 : 0,
        }));
        // Фон с glassmorphism
        card.children.push(am5.RoundedRectangle.new(root, {
          width: W, height: H,
          fill: am5.color(0x0a1628), fillOpacity: 0.92,
          stroke: am5.color(d.colorInt), strokeWidth: 1,
          cornerRadiusTL: 7, cornerRadiusTR: 7, cornerRadiusBL: 7, cornerRadiusBR: 7,
        }));
        // Левая цветная полоска
        card.children.push(am5.RoundedRectangle.new(root, {
          width: 3, height: H,
          fill: am5.color(d.colorInt), fillOpacity: 1,
          cornerRadiusTL: 7, cornerRadiusTR: 0, cornerRadiusBL: 7, cornerRadiusBR: 0,
        }));
        // Имя трака
        card.children.push(am5.Label.new(root, {
          text: d.truckName,
          fill: am5.color(0xffffff), fontSize: 12, fontWeight: "900",
          x: 10, centerX: 0,
          y: am5.percent(50), centerY: am5.percent(50),
        }));
        // Статус-точка справа
        card.children.push(am5.Circle.new(root, {
          radius: 3, fill: am5.color(d.colorInt),
          x: W - 8, y: am5.percent(50), centerY: am5.percent(50),
        }));
        card.events.on("click", onClick);
        card.events.on("pointerover", onHover);
        card.events.on("pointerout", onHoverOut);

      // ── MEDIUM: ID + статус-бейдж + маршрут + HOS-бар ────────────────
      } else if (variant === 'medium') {
        const W = 128, H = 88;
        const STRIP = 4; // ширина левой полоски
        const card = container.children.push(am5.Container.new(root, {
          width: W, height: H,
          dy: -(H + bgRadius * 2 + 12), dx: -(W / 2),
          interactive: true, cursorOverStyle: "pointer",
          visible: cardVisible,
          opacity: cardVisible ? 1 : 0,
        }));
        // Внешнее свечение (glow)
        card.children.push(am5.RoundedRectangle.new(root, {
          width: W + 4, height: H + 4, x: -2, y: -2,
          fill: am5.color(d.colorInt), fillOpacity: d.breakdown ? 0.25 : 0.08,
          cornerRadiusTL: 13, cornerRadiusTR: 13, cornerRadiusBL: 13, cornerRadiusBR: 13,
        }));
        // Основной фон
        card.children.push(am5.RoundedRectangle.new(root, {
          width: W, height: H,
          fill: am5.color(0x0a1628), fillOpacity: 0.96,
          stroke: am5.color(d.colorInt), strokeWidth: d.breakdown ? 2 : 1.5,
          cornerRadiusTL: 10, cornerRadiusTR: 10, cornerRadiusBL: 10, cornerRadiusBR: 10,
        }));
        // Левая цветная полоска
        card.children.push(am5.RoundedRectangle.new(root, {
          width: STRIP, height: H,
          fill: am5.color(d.colorInt), fillOpacity: 1,
          cornerRadiusTL: 10, cornerRadiusTR: 0, cornerRadiusBL: 10, cornerRadiusBR: 0,
        }));
        // Строка 1: эмодзи + имя трака
        card.children.push(am5.Label.new(root, {
          text: `${truckEmoji} ${d.truckName}`,
          fill: am5.color(0xffffff), fontSize: 13, fontWeight: "900",
          x: STRIP + 6, y: 8,
        }));
        // Строка 2: статус-бейдж (цветной текст)
        card.children.push(am5.Label.new(root, {
          text: `● ${d.statusLabel}`,
          fill: am5.color(d.colorInt), fontSize: 10, fontWeight: "700",
          x: STRIP + 6, y: 26,
        }));
        // Строка 3: маршрут
        card.children.push(am5.Label.new(root, {
          text: routeShort,
          fill: am5.color(0xe2e8f0), fontSize: 11, fontWeight: "600",
          x: STRIP + 6, y: 42,
          oversizedBehavior: "truncate", maxWidth: W - STRIP - 10,
        }));
        // HOS бар — фон
        card.children.push(am5.RoundedRectangle.new(root, {
          width: W - STRIP - 12, height: 5,
          x: STRIP + 6, y: 60,
          fill: am5.color(0x1e3a5f), fillOpacity: 0.8,
          cornerRadiusTL: 3, cornerRadiusTR: 3, cornerRadiusBL: 3, cornerRadiusBR: 3,
        }));
        // HOS бар — заполнение
        const hosBarW = Math.max(4, Math.round((W - STRIP - 12) * hosFrac));
        card.children.push(am5.RoundedRectangle.new(root, {
          width: hosBarW, height: 5,
          x: STRIP + 6, y: 60,
          fill: am5.color(hosColor), fillOpacity: 0.9,
          cornerRadiusTL: 3, cornerRadiusTR: 3, cornerRadiusBL: 3, cornerRadiusBR: 3,
        }));
        // HOS текст
        card.children.push(am5.Label.new(root, {
          text: `${Math.round(d.hoursLeft * 10) / 10}h HOS${d.milesLeft > 0 ? `  ·  ${d.milesLeft}mi` : ""}`,
          fill: am5.color(0x94a3b8), fontSize: 10,
          x: STRIP + 6, y: 68,
        }));
        card.events.on("click", onClick);
        card.events.on("pointerover", onHover);
        card.events.on("pointerout", onHoverOut);

      // ── LARGE: полная инфа + водитель + HOS-бар ───────────────────────
      } else {
        const commodity = d.currentLoad?.commodity || "";
        const rate = d.currentLoad?.rate ? `$${d.currentLoad.rate.toLocaleString()}` : "";
        const loadLine = commodity ? (rate ? `📦 ${commodity}  ${rate}` : `📦 ${commodity}`) : "";
        const W = 172, H = loadLine ? 136 : 118;
        const STRIP = 5;
        const card = container.children.push(am5.Container.new(root, {
          width: W, height: H,
          dy: -(H + 18), dx: -(W / 2),
          interactive: true, cursorOverStyle: "pointer",
          visible: cardVisible,
          opacity: cardVisible ? 1 : 0,
        }));
        // Внешнее свечение
        card.children.push(am5.RoundedRectangle.new(root, {
          width: W + 6, height: H + 6, x: -3, y: -3,
          fill: am5.color(d.colorInt), fillOpacity: d.breakdown ? 0.3 : 0.1,
          cornerRadiusTL: 16, cornerRadiusTR: 16, cornerRadiusBL: 16, cornerRadiusBR: 16,
        }));
        // Основной фон
        card.children.push(am5.RoundedRectangle.new(root, {
          width: W, height: H,
          fill: am5.color(0x0a1628), fillOpacity: 0.97,
          stroke: am5.color(d.colorInt), strokeWidth: d.breakdown ? 2.5 : 1.5,
          cornerRadiusTL: 12, cornerRadiusTR: 12, cornerRadiusBL: 12, cornerRadiusBR: 12,
        }));
        // Левая цветная полоска
        card.children.push(am5.RoundedRectangle.new(root, {
          width: STRIP, height: H,
          fill: am5.color(d.colorInt), fillOpacity: 1,
          cornerRadiusTL: 12, cornerRadiusTR: 0, cornerRadiusBL: 12, cornerRadiusBR: 0,
        }));
        // Строка 1: эмодзи + имя трака крупно
        card.children.push(am5.Label.new(root, {
          text: `${truckEmoji} ${d.truckName}`,
          fill: am5.color(0xffffff), fontSize: 15, fontWeight: "900",
          x: STRIP + 8, y: 8,
        }));
        // Строка 2: статус-бейдж
        card.children.push(am5.Label.new(root, {
          text: `● ${d.statusLabel}`,
          fill: am5.color(d.colorInt), fontSize: 11, fontWeight: "700",
          x: STRIP + 8, y: 28,
        }));
        // Строка 3: маршрут со стрелкой
        card.children.push(am5.Label.new(root, {
          text: routeFull,
          fill: am5.color(0xe2e8f0), fontSize: 11, fontWeight: "600",
          x: STRIP + 8, y: 46,
          oversizedBehavior: "truncate", maxWidth: W - STRIP - 14,
        }));
        // Строка 4: водитель
        card.children.push(am5.Label.new(root, {
          text: `\u{1F464} ${d.driver}`,
          fill: am5.color(0xb0c4de), fontSize: 11, fontWeight: "500",
          x: STRIP + 8, y: 63,
        }));
        // Строка 5: груз + ставка (если есть)
        if (loadLine) {
          card.children.push(am5.Label.new(root, {
            text: loadLine,
            fill: am5.color(0x4ade80), fontSize: 11, fontWeight: "600",
            x: STRIP + 8, y: 80,
            oversizedBehavior: "truncate", maxWidth: W - STRIP - 14,
          }));
        }
        const hosY = loadLine ? 100 : 82;
        // HOS бар — фон
        card.children.push(am5.RoundedRectangle.new(root, {
          width: W - STRIP - 16, height: 6,
          x: STRIP + 8, y: hosY,
          fill: am5.color(0x1e3a5f), fillOpacity: 0.8,
          cornerRadiusTL: 3, cornerRadiusTR: 3, cornerRadiusBL: 3, cornerRadiusBR: 3,
        }));
        // HOS бар — заполнение
        const hosBarWL = Math.max(5, Math.round((W - STRIP - 16) * hosFrac));
        card.children.push(am5.RoundedRectangle.new(root, {
          width: hosBarWL, height: 6,
          x: STRIP + 8, y: hosY,
          fill: am5.color(hosColor), fillOpacity: 0.95,
          cornerRadiusTL: 3, cornerRadiusTR: 3, cornerRadiusBL: 3, cornerRadiusBR: 3,
        }));
        // HOS текст + miles
        card.children.push(am5.Label.new(root, {
          text: `⏱ ${Math.round(d.hoursLeft * 10) / 10}h HOS${d.milesLeft > 0 ? `   🛣 ${d.milesLeft} mi` : ""}`,
          fill: am5.color(0x94a3b8), fontSize: 11,
          x: STRIP + 8, y: hosY + 10,
        }));
        card.events.on("click", onClick);
        card.events.on("pointerover", onHover);
        card.events.on("pointerout", onHoverOut);
      }

      container.events.on("click", onClick);
      container.events.on("pointerover", onHover);
      container.events.on("pointerout", onHoverOut);
      return am5.Bullet.new(root, { sprite: container });
    });

    truckSeries.data.setAll(pointData);
    truckSeriesRef.current = truckSeries;
  }

  useEffect(() => {
    if (!divRef.current) return;

    const root = am5.Root.new(divRef.current);
    root.setThemes([am5themes_Animated.new(root)]);
    // Скрываем логотип amCharts
    root._logo?.dispose();
    // Убираем белый фон amCharts (дефолтный)
    root.interfaceColors.set("background" as any, am5.color(themeMode === 'dark' ? 0x0a1628 : 0xb8ccd8));
    root.interfaceColors.set("alternativeBackground" as any, am5.color(themeMode === 'dark' ? 0x0a1628 : 0xb8ccd8));
    rootRef.current = root;

    const isMobileDevice = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1200;
    const homeZoom = isMobileDevice ? 2.5 : isTablet ? 1.8 : 1.5;
    const minZoom = isMobileDevice ? 2 : isTablet ? 1.5 : 1.2;

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "translateX", panY: "translateY",
        projection: am5map.geoAlbersUsa(),
        homeZoomLevel: homeZoom, wheelY: "zoom", maxZoomLevel: 8, minZoomLevel: minZoom,
      })
    );
    chartRef.current = chart;

    chart.set("background", am5.Rectangle.new(root, {
      fill: am5.color(themeMode === 'dark' ? 0x0f172a : 0xb8ccd8), fillOpacity: 1,
      interactive: true,
    }));

    // Клик по пустому месту карты — только закрываем карточку, follow НЕ сбрасываем
    chart.get("background")?.events.on("click", () => {
      selectedTruckRef.current = null;
      setSelectedTruck(null);
    });

    // Ручной pan/zoom — сбрасываем follow (пользователь сам управляет картой)
    let userInteracting = false;
    chart.get("background")?.events.on("pointerdown", () => { userInteracting = true; });
    chart.events.on("panstarted", () => {
      if (!userInteracting) return;
      if (followTruckIdRef.current) {
        followTruckIdRef.current = null;
        setFollowTruck(false);
      }
    });
    chart.events.on("zoomstarted", () => {
      if (!userInteracting) return;
      if (followTruckIdRef.current) {
        followTruckIdRef.current = null;
        setFollowTruck(false);
      }
    });
    chart.get("background")?.events.on("pointerup", () => { userInteracting = false; });

    // Штаты — ОСНОВНОЙ СЛОЙ КАРТЫ
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, { geoJSON: am5geodata_usaLow })
    );
    polygonSeriesRef.current = polygonSeries;
    
    // Базовые настройки для всех штатов — зависит от темы
    const isDark = themeMode === 'dark';
    polygonSeries.mapPolygons.template.setAll({
      fill: am5.color(isDark ? 0x334155 : 0x8fafc4),
      fillOpacity: 0.95,
      stroke: am5.color(isDark ? 0x64748b : 0x6b8fa8),
      strokeWidth: 1,
      strokeOpacity: 1,
      interactive: true,
    });
    
    // Hover эффект
    polygonSeries.mapPolygons.template.states.create("hover", { 
      fill: am5.color(isDark ? 0x2563eb : 0x3b82f6),
      fillOpacity: 1,
      strokeWidth: 2,
      stroke: am5.color(isDark ? 0x06b6d4 : 0x1d4ed8),
      strokeOpacity: 1,
    });

    // Двойной клик — зум + попап штата
    polygonSeries.mapPolygons.template.events.on("dblclick", (ev: any) => {
      const rawId = ev.target.dataItem?.get("id") as string;
      const stateName = ev.target.dataItem?.get("name");
      if (!rawId) return;
      const stateId = rawId.replace("US-", "");
      const ts = trucksRef.current;
      const ls = loadsRef.current;
      // Зум на штат через goHome + небольшой зум
      chart.zoomToGeoPoint({ longitude: -98, latitude: 38 }, 3, true);
      setSelectedState({
        id: stateId, name: stateName,
        trucks: ts.filter(t => CITY_STATE[t.currentCity] === stateId || CITY_STATE[t.destinationCity || ""] === stateId),
        inboundTrucks: ts.filter(t => CITY_STATE[t.destinationCity || ""] === stateId && CITY_STATE[t.currentCity] !== stateId),
        loads: ls.filter(l => CITY_STATE[l.fromCity] === stateId),
        isSurge: surgeStates.includes(stateId),
      });
    });

    // Одиночный клик — попап без зума
    polygonSeries.mapPolygons.template.events.on("click", (ev: any) => {
      // Если клик был на карточке трака — не открываем попап штата
      if (truckClickedRef.current) return;
      // Клик по штату НЕ сбрасывает слежение — пользователь просто смотрит инфо о штате
      const rawId = ev.target.dataItem?.get("id") as string;
      const stateName = ev.target.dataItem?.get("name");
      if (!rawId) return;
      const stateId = rawId.replace("US-", "");
      const ts = trucksRef.current;
      const ls = loadsRef.current;
      setSelectedState({
        id: stateId, name: stateName,
        trucks: ts.filter(t => CITY_STATE[t.currentCity] === stateId || CITY_STATE[t.destinationCity || ""] === stateId),
        inboundTrucks: ts.filter(t => CITY_STATE[t.destinationCity || ""] === stateId && CITY_STATE[t.currentCity] !== stateId),
        loads: ls.filter(l => CITY_STATE[l.fromCity] === stateId),
        isSurge: surgeStates.includes(stateId),
      });
    });

    // Подписи штатов
    const stateLabelSeries = chart.series.push(
      am5map.MapPointSeries.new(root, { polygonIdField: "id" })
    );
    stateLabelSeries.bullets.push((_root: any, _s: any, dataItem: any) => {
      const rawId = (dataItem.dataContext as any)?.id as string ?? "";
      const stateCode = rawId.replace("US-", "");
      return am5.Bullet.new(root, {
        sprite: am5.Label.new(root, {
          text: stateCode, fill: am5.color(themeMode === 'dark' ? 0xe2e8f0 : 0x475569), fillOpacity: 0.8,
          fontSize: 10, fontWeight: "700",
          centerX: am5.percent(50), centerY: am5.percent(50),
        }),
      });
    });
    stateLabelSeries.data.setAll(
      am5geodata_usaLow.features.map((f: any) => ({ id: f.id ?? "" }))
    );

    // Сетка — делаем более заметной
    const graticuleSeries = chart.series.push(am5map.GraticuleSeries.new(root, {}));
    graticuleSeries.mapLines.template.setAll({
      stroke: am5.color(0x94a3b8), strokeOpacity: 0.15, strokeWidth: 0.5,
    });

    // Города
    const citySeries = chart.series.push(
      am5map.MapPointSeries.new(root, { latitudeField: "lat", longitudeField: "lng" })
    );
    citySeries.bullets.push((_root: any, _s: any, dataItem: any) => {
      const d = dataItem.dataContext as any;
      if (!d.major) return am5.Bullet.new(root, { sprite: am5.Circle.new(root, { radius: 0 }) });
      
      const container = am5.Container.new(root, {});
      
      // Точка города
      container.children.push(am5.Circle.new(root, {
        radius: 2.5,
        fill: am5.color(0x475569),
        fillOpacity: 0.7,
      }));
      
      // Название города
      container.children.push(am5.Label.new(root, {
        text: d.name, 
        fill: am5.color(0x334155), 
        fillOpacity: 0.7,
        fontSize: 9, 
        fontWeight: "600",
        centerX: am5.percent(50), 
        centerY: am5.percent(50),
        dy: 12,
      }));
      
      return am5.Bullet.new(root, { sprite: container });
    });
    citySeries.data.setAll(
      Object.entries(CITIES).map(([name, coords]) => ({
        name, lat: coords[1], lng: coords[0], major: HUBS.includes(name),
      }))
    );

    // Убираем дефолтный ZoomControl amCharts — используем свои кнопки
    const zoomControl = chart.set("zoomControl", am5map.ZoomControl.new(root, {}));
    zoomControl.homeButton.set("visible", false);
    zoomControl.plusButton.set("visible", false);
    zoomControl.minusButton.set("visible", false);
    zoomControl.set("forceHidden" as any, true);

    function handleZoomToTruck(e: Event) {
      const { lng, lat, slow, mobile } = (e as CustomEvent).detail;
      // Если координаты не переданы — зумим на центр всех траков
      const targetLng = lng ?? (trucksRef.current.length > 0
        ? trucksRef.current.reduce((s, t) => s + t.position[0], 0) / trucksRef.current.length
        : -83.9207);
      const targetLat = lat ?? (trucksRef.current.length > 0
        ? trucksRef.current.reduce((s, t) => s + t.position[1], 0) / trucksRef.current.length
        : 35.9606);

      if (mobile) {
        chart.zoomToGeoPoint({ longitude: targetLng, latitude: targetLat }, 6, true);
      } else if (slow) {
        chart.zoomToGeoPoint({ longitude: targetLng, latitude: targetLat }, 3, true);
      } else {
        chart.zoomToGeoPoint({ longitude: targetLng, latitude: targetLat }, 5, true);
      }
    }
    window.addEventListener('zoomToTruck', handleZoomToTruck);

    // Первый рендер
    rebuildHistory(root, chart);
    rebuildRoutes(root, chart);
    rebuildTruckSeries(root, chart);
    setTimeout(() => updatePolygonColors(), 500);
    // Помечаем что инициализация завершена — теперь useEffect[activeTrucks.length] может работать
    setTimeout(() => { chartInitializedRef.current = true; }, 100);

    // Автозум на траки при открытии карты
    setTimeout(() => {
      const ts = trucksRef.current;
      if (ts.length === 0) return;

      const avgLng = ts.reduce((s, t) => s + t.position[0], 0) / ts.length;
      const avgLat = ts.reduce((s, t) => s + t.position[1], 0) / ts.length;

      // Считаем разброс траков чтобы подобрать уровень зума
      const maxDist = ts.reduce((max, t) => {
        const d = Math.hypot(t.position[0] - avgLng, t.position[1] - avgLat);
        return Math.max(max, d);
      }, 0);

      // Чем меньше разброс — тем сильнее зум (4–7)
      const zoomLevel = maxDist < 3 ? 7 : maxDist < 8 ? 5 : maxDist < 15 ? 4 : 3;

      chart.zoomToGeoPoint({ longitude: avgLng, latitude: avgLat }, zoomLevel, true);
    }, 800);

    // Очищаем старые интервалы если компонент ремаунтился
    if (antIntervalRef.current) { clearInterval(antIntervalRef.current); antIntervalRef.current = null; }
    if (colorIntervalRef.current) { clearInterval(colorIntervalRef.current); colorIntervalRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }

    // Анимация муравьёв — обновляем strokeDashoffset на живых линиях каждые 60ms
    let dashOffset = 0;
    antIntervalRef.current = window.setInterval(() => {
      dashOffset = (dashOffset - 2 + 10000) % 10000;
      antLinesRef.current.forEach(line => {
        try { line.set("strokeDashoffset", dashOffset); } catch (_) {}
      });
    }, 60);

    // Траки и маршруты — каждые 2 секунды (плавное движение)
    let lastVariant = 'medium';
    // Отслеживаем статусы для минимального rebuild
    let lastStatusKey = '';
    intervalRef.current = setInterval(() => {
      const newZoom = chartRef.current?.get("zoomLevel") ?? 1;
      const newVariant = newZoom < 2 ? 'micro' : newZoom < 4 ? 'medium' : 'large';
      zoomLevelRef.current = newZoom;
      rebuildHistory(root, chart);
      rebuildRoutes(root, chart);

      // Ключ статусов — меняется только при смене статуса/количества
      const statusKey = trucksRef.current.map(t => `${t.id}:${t.status}:${(t as any).onNightStop ? 'n' : ''}`).join('|');
      const variantChanged = newVariant !== lastVariant;

      if (variantChanged) {
        lastVariant = newVariant;
        lastStatusKey = statusKey;
        switchCardVariant(root, chart);
      } else {
        // Только обновляем данные без пересоздания bullets
        // Пересоздание вызывает моргание — избегаем его
        if (truckSeriesRef.current) {
          try {
            truckSeriesRef.current.data.setAll(buildPointData());
          } catch (_) {}
        }
        // Обновляем statusKey для следующей проверки
        lastStatusKey = statusKey;
      }
    }, 2000);

    // Цвета штатов — каждые 10 секунд (плавная смена по времени суток)
    colorIntervalRef.current = setInterval(() => {
      updatePolygonColors();
    }, 10000);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalRef.current);
      clearInterval(antIntervalRef.current);
      clearInterval(colorIntervalRef.current);
      // Очищаем все таймеры карточек
      Object.values(cardTimersRef.current).forEach(t => clearTimeout(t));
      cardTimersRef.current = {};
      intervalRef.current = null;
      antIntervalRef.current = null;
      colorIntervalRef.current = null;
      window.removeEventListener('zoomToTruck', handleZoomToTruck);
      root.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Реакция на смену темы — обновляем фон карты и цвета штатов ──────────
  useEffect(() => {
    const chart = chartRef.current;
    const root = rootRef.current;
    const ps = polygonSeriesRef.current;
    if (!chart || !root || !ps) return;

    const isDarkNow = themeMode === 'dark';
    const bgColor = isDarkNow ? 0x0f172a : 0xb8ccd8;

    // Фон карты
    chart.get("background")?.setAll({ fill: am5.color(bgColor) });
    root.interfaceColors.set("background" as any, am5.color(bgColor));
    root.interfaceColors.set("alternativeBackground" as any, am5.color(bgColor));

    // Скрываем все дефолтные amCharts UI элементы которые могут появиться
    try {
      root.container.children.each((child: any) => {
        const cls = child?.className ?? '';
        if (cls.includes('Legend') || cls.includes('Scrollbar') || cls.includes('ZoomControl')) {
          child.set('visible', false);
        }
      });
      // Скрываем все дочерние элементы root кроме основного chart контейнера
      root.container.children.each((child: any) => {
        if (child !== chart) {
          try { child.set('visible', false); } catch (_) {}
        }
      });
    } catch (_) {}

    // Цвета штатов
    ps.mapPolygons.template.setAll({
      fill: am5.color(isDarkNow ? 0x334155 : 0x8fafc4),
      fillOpacity: 0.95,
      stroke: am5.color(isDarkNow ? 0x64748b : 0x6b8fa8),
      strokeWidth: 1,
      strokeOpacity: 1,
    });

    // Принудительно обновляем цвета через updatePolygonColors
    setTimeout(() => updatePolygonColors(), 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeMode]);
  const totalMilesInFlight = activeTrucks.reduce((sum, t) => {
    if ((t.status === "loaded" || t.status === "driving") && t.currentLoad) {
      const dest = t.destinationCity ? CITIES[t.destinationCity] : null;
      const ml = dest ? Math.round(Math.hypot(dest[0] - t.position[0], dest[1] - t.position[1]) * 55) : 0;
      return sum + ml;
    }
    return sum;
  }, 0);
  const expectedRevenue = activeTrucks.reduce((sum, t) => {
    return sum + (t.currentLoad?.agreedRate || 0);
  }, 0);

  // Таймер смены: SHIFT_DURATION = 1440 минут
  const minutesLeft = Math.max(0, Math.floor(1440 - gameMinute));
  const hoursLeft = Math.floor(minutesLeft / 60);
  const minsLeft = Math.floor(minutesLeft % 60);
  const shiftProgress = Math.min(1, Math.max(0, gameMinute / 1440));
  const timerColor = minutesLeft < 60 ? "#ef4444" : minutesLeft < 120 ? "#f97316" : "#06b6d4";

  const mapBtnStyle = (active = false) => ({
    width: 44, height: 44, borderRadius: 12,
    background: active
      ? (themeMode === 'dark' ? "rgba(56,189,248,0.15)" : "rgba(0,122,255,0.12)")
      : (themeMode === 'dark' ? "rgba(15,25,50,0.92)" : "rgba(255,255,255,0.95)"),
    border: active
      ? (themeMode === 'dark' ? "1.5px solid rgba(56,189,248,0.7)" : "1.5px solid rgba(0,122,255,0.6)")
      : (themeMode === 'dark' ? "1.5px solid rgba(255,255,255,0.15)" : "1.5px solid rgba(0,0,0,0.1)"),
    boxShadow: active
      ? (themeMode === 'dark' ? "0 0 12px rgba(56,189,248,0.5)" : "0 0 10px rgba(0,122,255,0.3)")
      : (themeMode === 'dark' ? "0 2px 8px rgba(0,0,0,0.5)" : "0 2px 6px rgba(0,0,0,0.1)"),
    cursor: "pointer", fontSize: 20, fontWeight: 700,
    color: active
      ? (themeMode === 'dark' ? "#38bdf8" : "#007aff")
      : (themeMode === 'dark' ? "#e2e8f0" : "#374151"),
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s", padding: 0,
    animation: active ? "follow-pulse 1.5s ease-in-out infinite" : "none",
  } as any);

  return (
    <View style={styles.container}>
      <div ref={divRef} style={{ width: "100%", height: "100%", display: "block" } as any} />

      {/* Мини-таймер смены + кнопка гайда — верхний центр */}
      {phase === 'playing' && (
        <div style={{
          position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 6,
          fontFamily: "sans-serif", zIndex: 10,
        } as any}>

          {/* Кнопка гайда — только пока не пройден */}
          {guideActive && onGuideOpen && (
            <button
              onClick={onGuideOpen}
              style={{
                background: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: 20, padding: "5px 12px",
                display: "flex", alignItems: "center", gap: 5,
                cursor: "pointer",
                animation: "guideBtnPulse 2.5s ease-in-out infinite",
              } as any}
            >
              <span style={{ fontSize: 13 } as any}>📖</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#6366f1" } as any}>Гайд</span>
              <span style={{
                background: "linear-gradient(135deg, #818cf8, #6366f1)",
                borderRadius: 8, minWidth: 14, height: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8, fontWeight: 900, color: "#fff",
              } as any}>?</span>
            </button>
          )}
        </div>
      )}

      {/* Мини-легенда со статистикой + факт о штате — левый нижний угол */}
      <div style={{
        position: "absolute", bottom: 8, left: 8,
        display: "flex", alignItems: "flex-end", gap: 6,
        zIndex: 100, fontFamily: "sans-serif", pointerEvents: "auto",
        maxWidth: "calc(100% - 70px)", // не выходить за правый край (кнопки справа)
        overflow: "hidden",
      } as any}>

      {/* Легенда */}
      <div style={{
        background: themeMode === 'dark' ? 'rgba(10,15,30,0.92)' : 'rgba(255,255,255,0.95)',
        borderRadius: 12,
        border: themeMode === 'dark' ? '1px solid rgba(56,189,248,0.2)' : '1px solid rgba(0,0,0,0.08)',
        padding: legendVisible ? "clamp(6px,1.2vw,10px) clamp(8px,1.5vw,14px)" : "5px 10px",
        display: "flex", flexDirection: "column", gap: "clamp(3px,0.5vw,5px)",
        transition: "padding 0.2s, opacity 0.6s ease",
        opacity: legendVisible ? 1 : 0.9,
        maxWidth: "clamp(130px,18vw,180px)",
        boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.1)',
      } as any} className="map-legend">
        {/* Toggle кнопка */}
        <div
          onClick={() => setLegendVisible(v => !v)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
            cursor: "pointer", userSelect: "none",
            background: "transparent",
            borderRadius: legendVisible ? 0 : 6,
            padding: legendVisible ? "0" : "3px 5px",
            margin: legendVisible ? "0" : "-2px",
            border: legendVisible ? "none" : `1px solid ${themeMode === 'dark' ? 'rgba(6,182,212,0.4)' : 'rgba(0,122,255,0.3)'}`,
            transition: "all 0.2s",
          } as any}
        >
          <span style={{
            fontSize: "clamp(10px,1.4vw,13px)",
            fontWeight: 800,
            background: themeMode === 'dark'
              ? "linear-gradient(90deg, #06b6d4, #818cf8)"
              : "linear-gradient(90deg, #007aff, #6366f1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: 0.5,
          } as any}>
            {legendVisible ? "ЛЕГЕНДА" : "🗺 ЛЕГЕНДА"}
          </span>
          <span style={{
            fontSize: legendVisible ? "clamp(9px,1.2vw,11px)" : "clamp(11px,1.5vw,14px)",
            background: themeMode === 'dark'
              ? "linear-gradient(135deg, #06b6d4, #818cf8)"
              : "linear-gradient(135deg, #007aff, #6366f1)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 900,
            lineHeight: 1,
          } as any}>{legendVisible ? "▲" : "▼"}</span>
        </div>
        {legendVisible && (<>
        {Object.entries(STATUS_LABEL).map(([s, l]) => {
          const n = activeTrucks.filter(t => t.status === s).length;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 } as any}>
              <div style={{ width: "clamp(7px,1vw,9px)", height: "clamp(7px,1vw,9px)", borderRadius: "50%", background: STATUS_COLOR[s], flexShrink: 0 } as any} />
              <span style={{ fontSize: "clamp(11px,1.3vw,13px)", color: themeMode === 'dark' ? "#94a3b8" : "#374151" } as any}>{STATUS_EMOJI[s]} {l}</span>
              {n > 0 && <span style={{ fontSize: "clamp(11px,1.3vw,13px)", fontWeight: 800, color: STATUS_COLOR[s], marginLeft: "auto", paddingLeft: 6 } as any}>{n}</span>}
            </div>
          );
        })}
        {/* Статистика */}
        {phase === 'playing' && (
          <div style={{ borderTop: `1px solid ${themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, marginTop: 4, paddingTop: 6, display: "flex", flexDirection: "column", gap: 3 } as any}>
            <div style={{ fontSize: "clamp(11px,1.3vw,13px)", color: themeMode === 'dark' ? "#38bdf8" : "#007aff" } as any}>
              🛣 В пути: <span style={{ fontWeight: 700 } as any}>{totalMilesInFlight.toLocaleString()} mi</span>
            </div>
            <div style={{ fontSize: "clamp(11px,1.3vw,13px)", color: themeMode === 'dark' ? "#4ade80" : "#16a34a" } as any}>
              💰 Ожидается: <span style={{ fontWeight: 700 } as any}>${expectedRevenue.toLocaleString()}</span>
            </div>
          </div>
        )}
        {/* Surge legend */}
        {surgeStates.length > 0 && (
          <div style={{ borderTop: `1px solid ${themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, marginTop: 4, paddingTop: 6 } as any}>
            <div style={{ fontSize: "clamp(10px,1.2vw,12px)", color: "#ff6b35", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as any}>
              🔥 Surge: {surgeStates.join(", ")}
            </div>
          </div>
        )}
        </>)}
      </div>

      {/* Факт о штате — компактно справа от легенды */}
      <div style={{
        maxWidth: "clamp(140px, 38vw, 320px)",
        minWidth: 0,
        opacity: (followTruck && stateFact) ? 1 : 0,
        pointerEvents: "none",
        transition: "opacity 0.6s ease",
        background: "rgba(255,255,255,0.97)",
        border: "1px solid rgba(0,122,255,0.2)",
        borderRadius: 12,
        padding: "clamp(6px,1vw,10px) clamp(8px,1.2vw,14px)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        overflow: "hidden",
      } as any}>
        <div style={{ fontSize: "clamp(11px,1.2vw,13px)", fontWeight: 700, color: "#007aff", marginBottom: 3, letterSpacing: 0.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as any}>
          📍 {lastFactStateRef.current}
        </div>
        <div style={{ fontSize: "clamp(11px,1.3vw,14px)", color: "#374151", lineHeight: 1.45, fontWeight: 500,
          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
        } as any}>
          {stateFact}
        </div>
      </div>

      </div>{/* конец flex-контейнера легенда+факт */}

      {/* Компактные toast-уведомления — внизу по центру (ближе к тракам) */}
      {!selectedState && toasts.length > 0 && (
        <div style={{
          position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", gap: 8,
          zIndex: 1001, fontFamily: "sans-serif", pointerEvents: "none",
          maxWidth: 400,
        } as any} className="map-toasts">
          {toasts.map(t => (
            <div key={t.id} style={{
              background: "rgba(17,24,39,0.95)", 
              border: `2px solid ${t.color}`,
              borderRadius: 16,
              padding: "12px 16px", 
              fontSize: 14, 
              fontWeight: 700,
              color: "#fff",
              boxShadow: `0 6px 20px rgba(0,0,0,0.4), 0 0 0 1px ${t.color}44`,
              animation: "toastBounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              textAlign: "center",
            } as any}>
              <span style={{ 
                fontSize: 18, 
                filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))" 
              }}>
                {t.msg.includes('✅') ? '✅' : 
                 t.msg.includes('🚨') ? '🚨' : 
                 t.msg.includes('🔧') ? '🔧' :
                 t.msg.includes('🚛') ? '🚛' :
                 t.msg.includes('💨') ? '💨' :
                 t.msg.includes('🌨️') ? '🌨️' :
                 t.msg.includes('💰') ? '💰' : '💬'}
              </span>
              <span style={{ flex: 1, lineHeight: 1.5 }}>
                {t.msg.replace(/[✅🚨🔧🚛💬💨🌨️💰]/g, '').trim()}
              </span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes toastBounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(50px);
          }
          50% {
            transform: scale(1.05) translateY(-5px);
          }
          70% {
            transform: scale(0.95) translateY(2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      {/* Невидимая зона активации кнопок когда они прозрачные */}
      {!mapBtnsVisible && (
        <div
          onMouseEnter={resetMapBtnsTimer}
          onTouchStart={resetMapBtnsTimer}
          style={{
            position: "absolute", right: 10, bottom: 10,
            width: 56, height: 220,
            zIndex: 201, pointerEvents: "auto", cursor: "pointer",
          } as any}
        />
      )}
      {/* Кнопки управления картой — все 4 компактно внизу справа */}
      <div
        onMouseEnter={resetMapBtnsTimer}
        onMouseLeave={resetMapBtnsTimer}
        onTouchStart={resetMapBtnsTimer}
        style={{
          position: "absolute", right: 10, bottom: 10,
          zIndex: 200,
          pointerEvents: mapBtnsVisible ? "auto" : "none",
          display: "flex", flexDirection: "column", gap: 6,
          background: themeMode === 'dark' ? "rgba(10,18,38,0.92)" : "rgba(255,255,255,0.95)",
          border: themeMode === 'dark' ? "1px solid rgba(56,189,248,0.15)" : "1px solid rgba(0,122,255,0.3)",
          borderRadius: 16, padding: "8px 6px",
          backdropFilter: "blur(8px)",
          boxShadow: themeMode === 'dark' ? "0 4px 20px rgba(0,0,0,0.5)" : "0 2px 12px rgba(0,0,0,0.1)",
          opacity: mapBtnsVisible ? 1 : 0.12,
          transition: "opacity 0.6s ease, border-color 0.3s ease",
        } as any}>
        {/* 🏠 Home */}
        <button onClick={() => { resetMapBtnsTimer(); chartRef.current?.goHome(); }} title="Обзор"
          style={mapBtnStyle()}>🏠</button>
        {/* + Zoom in */}
        <button onClick={() => { resetMapBtnsTimer(); chartRef.current?.zoomIn(); }} title="Приблизить"
          style={{ ...mapBtnStyle(), fontSize: 22, fontWeight: 900, color: themeMode === 'dark' ? "#38bdf8" : "#007aff" }}>＋</button>
        {/* − Zoom out */}
        <button onClick={() => { resetMapBtnsTimer(); chartRef.current?.zoomOut(); }} title="Отдалить"
          style={{ ...mapBtnStyle(), fontSize: 22, fontWeight: 900, color: themeMode === 'dark' ? "#94a3b8" : "#6b7280" }}>－</button>
        {/* placeholder для сохранения высоты контейнера */}
        <div style={{ width: 44, height: 44 } as any} />
      </div>

      {/* 🎯 Follow — отдельный элемент поверх контейнера, всегда видим когда активен */}
      <button
        onClick={() => {
          resetMapBtnsTimer();
          const next = !followTruck;
          if (next) {
            // При включении — берём трак из открытой карточки, иначе первый активный
            const cardTruckId = selectedTruckRef.current?.truckId ?? null;
            const firstActive = trucksRef.current.find((t: any) =>
              t.status === 'loaded' || t.status === 'driving'
            );
            followTruckIdRef.current = cardTruckId ?? firstActive?.id ?? null;
          } else {
            followTruckIdRef.current = null;
          }
          setFollowTruck(next);
        }}
        title={followTruck
          ? `Отключить слежение${followTruckIdRef.current ? ` (${trucksRef.current.find((t: any) => t.id === followTruckIdRef.current)?.name ?? ''})` : ''}`
          : "Следить за траком"}
        style={followTruck ? {
          position: "absolute", right: 16, bottom: 16, zIndex: 202,
          width: 44, height: 44, borderRadius: 12,
          background: "rgba(234,88,12,0.12)",
          border: "2px solid rgba(234,88,12,0.7)",
          boxShadow: "0 0 12px rgba(234,88,12,0.3)",
          cursor: "pointer", fontSize: 22, fontWeight: 700, color: "#ea580c",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 0, opacity: 1, pointerEvents: "auto",
          animation: "follow-pulse-orange 1s ease-in-out infinite",
        } as any : {
          position: "absolute", right: 16, bottom: 16, zIndex: 202,
          width: 44, height: 44, borderRadius: 12,
          background: themeMode === 'dark' ? "rgba(15,25,50,0.92)" : "rgba(255,255,255,0.95)",
          border: themeMode === 'dark' ? "1.5px solid rgba(255,255,255,0.15)" : "1.5px solid rgba(0,0,0,0.1)",
          boxShadow: themeMode === 'dark' ? "0 2px 8px rgba(0,0,0,0.5)" : "0 2px 6px rgba(0,0,0,0.1)",
          cursor: "pointer", fontSize: 22, fontWeight: 700,
          color: themeMode === 'dark' ? "#e2e8f0" : "#374151",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 0, opacity: mapBtnsVisible ? 1 : 0.12,
          pointerEvents: mapBtnsVisible ? "auto" : "none",
          transition: "opacity 0.6s ease",
        } as any}
      >🎯</button>

      {/* TODO: truck popup card — скрыто, будет переработано позже */}
      {false && selectedTruck && (
        <div style={{
          position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
          display: "flex", alignItems: "center", gap: 8,
          zIndex: 9999, fontFamily: "sans-serif",
        } as any}>
          {/* Стрелка влево */}
          <button
            onClick={() => {
              const trucks = trucksRef.current;
              if (!trucks.length) return;
              const idx = trucks.findIndex((t: any) => t.id === selectedTruck.truckId);
              const prev = trucks[(idx - 1 + trucks.length) % trucks.length];
              const colorHex = getTruckColor(prev, gameMinuteRef.current);
              const colorInt = parseInt(colorHex.replace('#',''), 16);
              const dest = prev.destinationCity ? CITIES[prev.destinationCity] : null;
              const milesLeft = dest ? Math.round(Math.hypot(dest[0]-prev.position[0], dest[1]-prev.position[1])*55) : 0;
              const card = {
                lat: prev.position[1], lng: prev.position[0],
                truckId: prev.id, truckName: prev.name.replace('Truck ','T'),
                driver: prev.driver, status: prev.status,
                statusLabel: STATUS_LABEL[prev.status] || prev.status,
                colorHex, colorInt, milesLeft,
                currentCity: prev.currentCity, destinationCity: prev.destinationCity || '',
                hoursLeft: prev.hoursLeft, currentLoad: prev.currentLoad,
                idleWarning: (prev as any).idleWarningLevel ?? 0,
                routeEvent: getRouteEvent(prev.id),
              };
              setSelectedTruck(card);
              selectedTruckRef.current = card;
              showCard(prev.id, 15000);
              if (followTruckIdRef.current !== null) { followTruckIdRef.current = prev.id; setFollowTruck(true); }
              chartRef.current?.zoomToGeoPoint({ longitude: prev.position[0], latitude: prev.position[1] }, 5, true);
              onTruckSelectRef.current?.(prev.id);
            }}
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: "rgba(8,14,28,0.95)", border: "1.5px solid rgba(56,189,248,0.3)",
              color: "#e2e8f0", fontSize: 16, fontWeight: 900, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            } as any}
          >‹</button>

          {/* Карточка */}
          <div style={{
            background: "rgba(8,14,28,0.98)",
            border: `2px solid ${selectedTruck.colorHex}`,
            borderRadius: 14, padding: "10px 14px",
            display: "flex", flexDirection: "column", gap: 8,
            minWidth: 260, maxWidth: 320,
            boxShadow: `0 0 0 1px ${selectedTruck.colorHex}33, 0 8px 32px rgba(0,0,0,0.85), 0 0 28px ${selectedTruck.colorHex}44`,
            transition: "border-color 0.2s, box-shadow 0.2s",
            position: "relative",
          } as any} className="map-truck-card">
            {/* Индикатор "закреплено" */}
            {selectedTruckRef.current?.truckId === selectedTruck.truckId && (
              <div style={{
                position: "absolute", top: -9, left: "50%", transform: "translateX(-50%)",
                background: selectedTruck.colorHex, borderRadius: 4,
                padding: "1px 8px", fontSize: 9, fontWeight: 800, color: "#000",
                letterSpacing: 0.3, whiteSpace: "nowrap",
              } as any}>📌 ЗАКРЕПЛЕНО</div>
            )}

            {/* СТРОКА 1: имя трака + статус + закрыть */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" } as any}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 } as any}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: selectedTruck.colorHex, flexShrink: 0, boxShadow: `0 0 8px ${selectedTruck.colorHex}` } as any} />
                <span style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: 0.3 } as any}>🚛 {selectedTruck.truckName}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 } as any}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: selectedTruck.colorHex,
                  background: `${selectedTruck.colorHex}22`, borderRadius: 5,
                  padding: "2px 7px", whiteSpace: "nowrap",
                } as any}>{selectedTruck.statusLabel}</span>
                <span onClick={() => { setSelectedTruck(null); selectedTruckRef.current = null; }}
                  style={{ cursor: "pointer", fontSize: 15, color: "#94a3b8", lineHeight: 1, flexShrink: 0 } as any}>✕</span>
              </div>
            </div>

            {/* СТРОКА 2: водитель */}
            {selectedTruck.driver && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 } as any}>
                <span style={{ fontSize: 12, color: "#94a3b8" } as any}>👤</span>
                <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 600 } as any}>{selectedTruck.driver}</span>
              </div>
            )}

            {/* СТРОКА 3: маршрут */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } as any}>
              <span style={{ fontSize: 12, color: "#94a3b8" } as any}>📍</span>
              <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 } as any}>
                {selectedTruck.currentCity}{CITY_STATE[selectedTruck.currentCity] ? `, ${CITY_STATE[selectedTruck.currentCity]}` : ""}
              </span>
              {selectedTruck.destinationCity && (
                <>
                  <span style={{ fontSize: 11, color: "#475569" } as any}>→</span>
                  <span style={{ fontSize: 12, color: "#38bdf8", fontWeight: 600 } as any}>
                    {selectedTruck.destinationCity}{CITY_STATE[selectedTruck.destinationCity] ? `, ${CITY_STATE[selectedTruck.destinationCity]}` : ""}
                  </span>
                  {selectedTruck.milesLeft > 0 && (
                    <span style={{ fontSize: 11, color: "#64748b" } as any}>· {selectedTruck.milesLeft} mi</span>
                  )}
                </>
              )}
            </div>

            {/* СТРОКА 4: груз */}
            {selectedTruck.currentLoad && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 } as any}>
                <span style={{ fontSize: 12, color: "#94a3b8" } as any}>📦</span>
                <span style={{ fontSize: 12, color: "#e2e8f0" } as any}>
                  {selectedTruck.currentLoad.commodity || "Груз"}
                  {selectedTruck.currentLoad.rate ? (
                    <span style={{ color: "#4ade80", fontWeight: 700, marginLeft: 6 } as any}>
                      ${selectedTruck.currentLoad.rate.toLocaleString()}
                    </span>
                  ) : null}
                </span>
              </div>
            )}

            {/* СТРОКА 5: HOS + событие */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" } as any}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 } as any}>
                <span style={{ fontSize: 12, color: "#94a3b8" } as any}>⏱️</span>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: selectedTruck.hoursLeft <= 2 ? "#ef4444" : selectedTruck.hoursLeft <= 5 ? "#fbbf24" : "#4ade80",
                } as any}>{selectedTruck.hoursLeft}h HOS</span>
              </div>
              {selectedTruck.routeEvent && (
                <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600 } as any}>{selectedTruck.routeEvent}</span>
              )}
            </div>

            {/* СТРОКА 6: кнопки */}
            <div style={{ display: "flex", gap: 6, marginTop: 2 } as any}>
              <button onClick={() => onTruckInfo?.(selectedTruck.truckId)} style={{
                flex: 1, background: "rgba(6,182,212,0.15)", border: "1.5px solid rgba(6,182,212,0.45)",
                borderRadius: 8, padding: "6px 0", color: "#06b6d4",
                fontSize: 12, fontWeight: 800, cursor: "pointer",
              } as any}>📋 Детали</button>
              {(selectedTruck.status === "idle" || selectedTruck.status === "at_delivery") && (
                <button onClick={() => { onFindLoad?.(selectedTruck.currentCity); setSelectedTruck(null); selectedTruckRef.current = null; chartRef.current?.goHome(); }} style={{
                  flex: 1, background: "rgba(74,222,128,0.15)", border: "1.5px solid rgba(74,222,128,0.45)",
                  borderRadius: 8, padding: "6px 0", color: "#4ade80",
                  fontSize: 12, fontWeight: 800, cursor: "pointer",
                } as any}>🔍 Найти груз</button>
              )}
            </div>
          </div>

          {/* Стрелка вправо */}
          <button
            onClick={() => {
              const trucks = trucksRef.current;
              if (!trucks.length) return;
              const idx = trucks.findIndex((t: any) => t.id === selectedTruck.truckId);
              const next = trucks[(idx + 1) % trucks.length];
              const colorHex = getTruckColor(next, gameMinuteRef.current);
              const colorInt = parseInt(colorHex.replace('#',''), 16);
              const dest = next.destinationCity ? CITIES[next.destinationCity] : null;
              const milesLeft = dest ? Math.round(Math.hypot(dest[0]-next.position[0], dest[1]-next.position[1])*55) : 0;
              const card = {
                lat: next.position[1], lng: next.position[0],
                truckId: next.id, truckName: next.name.replace('Truck ','T'),
                driver: next.driver, status: next.status,
                statusLabel: STATUS_LABEL[next.status] || next.status,
                colorHex, colorInt, milesLeft,
                currentCity: next.currentCity, destinationCity: next.destinationCity || '',
                hoursLeft: next.hoursLeft, currentLoad: next.currentLoad,
                idleWarning: (next as any).idleWarningLevel ?? 0,
                routeEvent: getRouteEvent(next.id),
              };
              setSelectedTruck(card);
              selectedTruckRef.current = card;
              showCard(next.id, 15000);
              if (followTruckIdRef.current !== null) { followTruckIdRef.current = next.id; setFollowTruck(true); }
              chartRef.current?.zoomToGeoPoint({ longitude: next.position[0], latitude: next.position[1] }, 5, true);
              onTruckSelectRef.current?.(next.id);
            }}
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: "rgba(8,14,28,0.95)", border: "1.5px solid rgba(56,189,248,0.3)",
              color: "#e2e8f0", fontSize: 16, fontWeight: 900, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            } as any}
          >›</button>
        </div>
      )}

      {/* Попап штата — компактный центрированный */}
      {selectedState && (
        <>
          <div onClick={() => setSelectedState(null)}
            style={{ position:"absolute", inset:0, zIndex:999, background:"rgba(0,0,0,0.35)" } as any}
          />
          <div style={{
            position:"absolute", top:"50%", left:"50%",
            transform:"translate(-50%,-50%)",
            width:"min(260px,82vw)",
            background: themeMode === 'dark' ? "#0d1117" : "#ffffff",
            borderRadius:14,
            border:`1.5px solid ${selectedState.isSurge ? "rgba(249,115,22,0.5)" : themeMode === 'dark' ? "rgba(56,189,248,0.2)" : "rgba(0,122,255,0.18)"}`,
            zIndex:1000, fontFamily:"sans-serif",
            boxShadow: themeMode === 'dark' ? "0 8px 40px rgba(0,0,0,0.7)" : "0 6px 28px rgba(0,0,0,0.14)",
            animation:"statePopupIn 0.18s ease",
            overflow:"hidden",
          } as any}>

            {/* Header */}
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"10px 12px 8px",
              borderBottom:`1px solid ${themeMode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
            } as any}>
              <div style={{ display:"flex", alignItems:"center", gap:5 } as any}>
                <span style={{ fontSize:14, fontWeight:900, color: selectedState.isSurge ? "#f97316" : themeMode === 'dark' ? "#38bdf8" : "#007aff" } as any}>
                  {STATE_NAMES[selectedState.id] || selectedState.id}
                </span>
                <span style={{ fontSize:9, color: themeMode === 'dark' ? "#475569" : "#9ca3af", background: themeMode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', padding:"1px 4px", borderRadius:3 } as any}>{selectedState.id}</span>
                {selectedState.isSurge && <span style={{ fontSize:9, fontWeight:800, color:"#f97316", background:"rgba(249,115,22,0.12)", padding:"1px 4px", borderRadius:3 } as any}>🔥 SURGE</span>}
              </div>
              <span onClick={() => setSelectedState(null)} style={{ cursor:"pointer", fontSize:14, color: themeMode === 'dark' ? "#475569" : "#9ca3af", lineHeight:1, padding:"2px 4px" } as any}>✕</span>
            </div>

            {/* Body */}
            <div style={{ padding:"8px 12px 10px", maxHeight:"45vh", overflowY:"auto" } as any}>

              {/* Траки */}
              {selectedState.trucks.length > 0 && (
                <div style={{ marginBottom:7 } as any}>
                  <div style={{ fontSize:9, fontWeight:700, color: themeMode === 'dark' ? "#475569" : "#9ca3af", textTransform:"uppercase", letterSpacing:0.7, marginBottom:4 } as any}>
                    🚛 {selectedState.trucks.length} трак{selectedState.trucks.length > 1 ? 'а' : ''}
                  </div>
                  {selectedState.trucks.map((t: any) => {
                    const color = getTruckColor(t, gameMinuteRef.current);
                    return (
                      <div key={t.id} onClick={() => { onTruckInfo?.(t.id); setSelectedState(null); }}
                        style={{
                          display:"flex", alignItems:"center", justifyContent:"space-between",
                          padding:"5px 7px", marginBottom:3, borderRadius:7,
                          background: themeMode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f9fafb',
                          border:`1px solid ${color}28`, cursor:"pointer",
                        } as any}>
                        <div>
                          <div style={{ fontSize:11, fontWeight:800, color: themeMode === 'dark' ? '#fff' : '#111827' } as any}>{t.name}</div>
                          <div style={{ fontSize:9, color: themeMode === 'dark' ? '#64748b' : '#6b7280' } as any}>
                            {t.driver} · {t.hoursLeft}h
                            {t.currentLoad ? <span style={{ color: themeMode === 'dark' ? '#4ade80' : '#16a34a' } as any}> · ${t.currentLoad.agreedRate?.toLocaleString()}</span> : null}
                          </div>
                        </div>
                        <span style={{ fontSize:9, fontWeight:700, color, background:`${color}18`, padding:"1px 5px", borderRadius:3, flexShrink:0, marginLeft:6 } as any}>
                          {STATUS_LABEL[t.status] || t.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Грузы */}
              {selectedState.loads.length > 0 && (
                <div>
                  <div style={{ fontSize:9, fontWeight:700, color: themeMode === 'dark' ? "#475569" : "#9ca3af", textTransform:"uppercase", letterSpacing:0.7, marginBottom:4 } as any}>
                    📋 {selectedState.loads.length} груз{selectedState.loads.length > 1 ? 'а' : ''}{selectedState.isSurge ? " 🔥" : ""}
                  </div>
                  {selectedState.loads.slice(0, 3).map((l: any) => (
                    <div key={l.id} onClick={() => { onFindLoad?.(l.fromCity); setSelectedState(null); }}
                      style={{
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                        padding:"5px 7px", marginBottom:3, borderRadius:7,
                        background: themeMode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f9fafb',
                        border:`1px solid ${themeMode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                        cursor:"pointer",
                      } as any}>
                      <div style={{ minWidth:0, flex:1 } as any}>
                        <div style={{ fontSize:10, fontWeight:700, color: themeMode === 'dark' ? '#e2e8f0' : '#111827', overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } as any}>
                          {l.fromCity} → {l.toCity}
                        </div>
                        <div style={{ fontSize:9, color: themeMode === 'dark' ? '#475569' : '#9ca3af' } as any}>{l.miles}mi · {l.equipment}</div>
                      </div>
                      <span style={{ fontSize:12, fontWeight:900, color: selectedState.isSurge ? "#f97316" : themeMode === 'dark' ? '#4ade80' : '#16a34a', flexShrink:0, marginLeft:8 } as any}>
                        ${l.postedRate?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {selectedState.loads.length > 3 && (
                    <div style={{ fontSize:9, color: themeMode === 'dark' ? '#475569' : '#9ca3af', textAlign:"center", paddingTop:2 } as any}>
                      +{selectedState.loads.length - 3} ещё
                    </div>
                  )}
                </div>
              )}

              {selectedState.trucks.length === 0 && selectedState.loads.length === 0 && (
                <div style={{ fontSize:11, color: themeMode === 'dark' ? '#475569' : '#9ca3af', textAlign:"center", padding:"10px 0" } as any}>
                  Нет траков и грузов
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {/* CSS для анимации тостов */}
      <style>{`
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes stateSheetIn {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes statePopupIn {
          from { opacity: 0; transform: translate(-50%,-46%) scale(0.95); }
          to   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        }
        @keyframes statePopupFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes follow-pulse {
          0%,100% { box-shadow: 0 0 14px rgba(6,182,212,0.6); }
          50% { box-shadow: 0 0 24px rgba(6,182,212,1), 0 0 40px rgba(6,182,212,0.4); }
        }
        @keyframes follow-pulse-orange {
          0%,100% { box-shadow: 0 0 14px rgba(251,146,60,0.7); border-color: rgba(251,146,60,0.9); }
          50% { box-shadow: 0 0 28px rgba(251,146,60,1), 0 0 50px rgba(251,146,60,0.5); border-color: #fb923c; }
        }
        @keyframes factFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes truckDrive {
          0%   { transform: translateX(0px) rotate(0deg); }
          25%  { transform: translateX(2px) rotate(1deg); }
          75%  { transform: translateX(-2px) rotate(-1deg); }
          100% { transform: translateX(0px) rotate(0deg); }
        }
        @keyframes truckBounce {
          0%,100% { transform: translateY(0px); }
          50%     { transform: translateY(-3px); }
        }
        @keyframes truckPulse {
          0%,100% { transform: scale(1); }
          50%     { transform: scale(1.2); }
        }
        @keyframes truckSpin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .truck-driving { animation: truckDrive 0.6s ease-in-out infinite; display:inline-block; }
        .truck-loaded  { animation: truckBounce 1s ease-in-out infinite; display:inline-block; }
        .truck-pickup  { animation: truckPulse 0.8s ease-in-out infinite; display:inline-block; }
        .truck-repair  { animation: truckSpin 2s linear infinite; display:inline-block; }
        .truck-idle    { opacity: 0.85; display:inline-block; }
        /* Подгоняем ZoomControl под наш стиль */
        .am5-zoomtools-button {
          width: 32px !important;
          height: 32px !important;
          border-radius: 8px !important;
        }
        /* Скрываем дефолтные кнопки зума amCharts */
        .am5-zoomtools,
        [class*="am5-zoomtools"],
        .am5-zoom-control,
        [class*="am5-zoom"] {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }

        /* Скрываем логотип amCharts */
        [class*="am5-logo"],
        [class*="amcharts-logo"],
        a[href*="amcharts.com"],
        div[class*="am5-credits"],
        .am5-credits,
        .am5-logo {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        /* Скрываем дефолтную легенду amCharts */
        .am5-legend,
        [class*="am5-legend"],
        .am5-Legend,
        [class*="am5-Legend"] {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }

        /* Скрываем scrollbar amCharts */
        .am5-scrollbar,
        [class*="am5-scrollbar"],
        [class*="am5-Scrollbar"] {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
        }

        /* Скрываем ВСЕ нативные кнопки amCharts */
        .am5-button,
        [class*="am5-button"],
        [class*="am5-Button"],
        [class*="am5-RoundedRectangle"]:not([class*="am5-MapPolygon"]):not([class*="am5-MapLine"]) {
          pointer-events: none !important;
        }
        
        /* Убираем белый фон amCharts контейнера */
        [class*="am5-"] canvas {
          background: transparent !important;
        }
        div[id^="am5-"] {
          background: transparent !important;
        }
        
        /* Адаптивность для мобильных */
        @media (max-width: 768px) {
          .map-timer {
            top: 6px !important;
            padding: 4px 10px !important;
            border-radius: 14px !important;
          }
          .map-timer span {
            font-size: 9px !important;
          }
          .map-timer > div {
            width: 40px !important;
            height: 3px !important;
          }
          
          .map-legend {
            bottom: 8px !important;
            left: 8px !important;
            padding: 6px 8px !important;
            border-radius: 8px !important;
            max-width: 160px !important;
          }
          .map-legend > div > div {
            font-size: 9px !important;
          }
          
          .map-toasts {
            top: 8px !important;
            right: 8px !important;
            left: 8px !important;
            max-width: calc(100vw - 16px);
          }
          .map-toasts > div {
            font-size: 11px !important;
            padding: 6px 10px !important;
          }
          
          .map-truck-card {
            bottom: 100px !important;
            left: 8px !important;
            right: 8px !important;
            transform: none !important;
            width: calc(100vw - 16px) !important;
            padding: 12px 14px !important;
            gap: 10px !important;
            flex-wrap: wrap;
          }
          .map-truck-card > div > span:first-child {
            font-size: 15px !important;
          }
          .map-truck-card > div > span:nth-child(2) {
            font-size: 13px !important;
          }
          .map-truck-card button {
            font-size: 13px !important;
            padding: 8px 14px !important;
          }
          
          .map-state-popup {
            top: 8px !important;
            right: 8px !important;
            left: 8px !important;
            width: calc(100vw - 16px) !important;
            max-width: none !important;
            padding: 14px !important;
            max-height: calc(100vh - 80px) !important;
          }
          .map-state-popup > div:first-child > div:first-child > span:first-child {
            font-size: 20px !important;
          }
          .map-state-popup > div:first-child > div:first-child > span:nth-child(2) {
            font-size: 13px !important;
          }
          .map-state-popup button {
            font-size: 11px !important;
            padding: 5px 10px !important;
          }
          
          .map-state-fact {
            bottom: 60px !important;
            left: 8px !important;
            right: 8px !important;
            max-width: calc(100vw - 16px) !important;
          }
          .map-state-fact > div {
            padding: 10px 12px !important;
          }
          .map-state-fact > div > div:first-child {
            font-size: 11px !important;
          }
          .map-state-fact > div > div:last-child {
            font-size: 12px !important;
          }
        }
        
        @media (max-width: 480px) {
          .map-timer span {
            font-size: 8px !important;
          }
          .map-legend {
            font-size: 8px !important;
            bottom: 8px !important;
          }
        }

        /* Десктоп — легенда строго внизу */
        @media (min-width: 769px) {
          .map-legend {
            bottom: 12px !important;
            left: 12px !important;
          }
        }
      `}</style>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e1a', overflow: "hidden" as any },
  text: { color: Colors.textMuted, fontSize: 16 },
});


