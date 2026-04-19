import { useEffect, useRef, useState, useCallback } from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import { useGameStore } from "../store/gameStore";
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
  const antLinesRef = useRef<any[]>([]);
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
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // Слушаем события из store для тостов
  useEffect(() => {
    function handleMapToast(e: Event) {
      const { message, color } = (e as CustomEvent).detail;
      addToast(message, color);
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
    const TIMES: Array<{ h: number; p: Palette }> = [
      { h: 0,  p: [0x0a0f2e, 0x1e3a8a, 0x3b82f6] }, // ночь
      { h: 3,  p: [0x1a0a2e, 0x4c1d95, 0x7c3aed] }, // предрассвет
      { h: 6,  p: [0x431407, 0xc2410c, 0xfb923c] }, // рассвет
      { h: 9,  p: [0x0c2340, 0x0369a1, 0x38bdf8] }, // утро
      { h: 12, p: [0x1e3a5f, 0x0284c7, 0x06b6d4] }, // день
      { h: 15, p: [0x422006, 0xb45309, 0xfbbf24] }, // послеполудень
      { h: 18, p: [0x450a0a, 0xb91c1c, 0xf97316] }, // закат
      { h: 21, p: [0x1e1b4b, 0x4338ca, 0x818cf8] }, // вечер
      { h: 24, p: [0x0a0f2e, 0x1e3a8a, 0x3b82f6] }, // ночь (замыкание)
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
          fillOpacity: 0.75,
          stroke: am5.color(0x64748b),
          strokeWidth: 1.5,
          strokeOpacity: 1,
        });
      } else {
        // Неактивные штаты — базовый цвет палитры
        polygon.setAll({ 
          fill: am5.color(baseColor),
          fillOpacity: 0.9,
          stroke: am5.color(0x64748b),
          strokeWidth: 1.5,
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
    oldSeries.animate({ key: "opacity" as any, to: 0, duration: 280 });
    setTimeout(() => {
      rebuildTruckSeries(root, chart);
      const newSeries = truckSeriesRef.current;
      if (!newSeries) return;
      // Стартуем с opacity=0 и плавно показываем
      newSeries.set("opacity" as any, 0);
      newSeries.animate({ key: "opacity" as any, from: 0, to: 1, duration: 350 });
    }, 290);
  }

  function rebuildTruckSeries(root: any, chart: any) {
    if (truckSeriesRef.current) {
      chart.series.removeIndex(chart.series.indexOf(truckSeriesRef.current));
      truckSeriesRef.current.dispose();
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

      // Пульс для активных траков
      if (d.active) {
        const pulse = container.children.push(am5.Circle.new(root, {
          radius: 14, fill: am5.color(d.colorInt), fillOpacity: 0,
        }));
        pulse.animate({ key: "radius", from: 8, to: 20, duration: 1400, loops: Infinity });
        pulse.animate({ key: "fillOpacity", from: 0.35, to: 0, duration: 1400, loops: Infinity });
      }
      // Предупреждение idle
      if (d.idleWarning > 0) {
        const warnColor = d.idleWarning >= 3 ? 0xef4444 : d.idleWarning === 2 ? 0xf97316 : 0xfbbf24;
        const warnSpeed = d.idleWarning >= 3 ? 600 : d.idleWarning === 2 ? 800 : 1200;
        const alertPulse = container.children.push(am5.Circle.new(root, {
          radius: 16, fill: am5.color(warnColor), fillOpacity: 0,
        }));
        alertPulse.animate({ key: "radius", from: 10, to: 24, duration: warnSpeed, loops: Infinity });
        alertPulse.animate({ key: "fillOpacity", from: 0.5, to: 0, duration: warnSpeed, loops: Infinity });
      }

      // Эмодзи трака по статусу (текстовый — стабильный)
      const truckEmoji = (() => {
        if (d.breakdown) return "🔧";
        if (d.waiting) return "⏳";
        if (d.status === "at_pickup") return "📦";
        if (d.status === "at_delivery") return "🏭";
        if (d.status === "loaded") return "🚛";
        if (d.status === "driving") return "🚛";
        if ((d as any).onNightStop) return "🌙";
        return "🅿️";
      })();

      const emojiSize = variant === 'micro' ? 16 : variant === 'medium' ? 20 : 26;
      const dyBase = -(emojiSize / 2);
      const hitRadius = variant === 'micro' ? 20 : 28;

      const emojiLabel = container.children.push(am5.Label.new(root, {
        text: truckEmoji,
        fontSize: emojiSize,
        centerX: am5.percent(50),
        centerY: am5.percent(50),
        dy: dyBase,
      }));

      // Анимация по статусу
      if (d.status === "driving" || d.status === "loaded") {
        // Покачивание вверх-вниз для едущих
        emojiLabel.animate({ key: "dy" as any, from: dyBase - 2, to: dyBase + 2, duration: 600, loops: Infinity, easing: am5.ease.sinInOut });
      } else if (d.status === "at_pickup" || d.status === "at_delivery") {
        // Пульсация для погрузки/разгрузки
        emojiLabel.animate({ key: "scale" as any, from: 0.9, to: 1.2, duration: 700, loops: Infinity, easing: am5.ease.sinInOut });
      } else if (d.breakdown) {
        // Вращение для поломки
        emojiLabel.animate({ key: "rotation" as any, from: -15, to: 15, duration: 400, loops: Infinity, easing: am5.ease.sinInOut });
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
        dy: -(hitRadius * 0.6),
        interactive: true,
        cursorOverStyle: "pointer",
      })).events.on("click", onClick);

      // Карточка видна только если truckId в visibleCardsRef
      const cardVisible = visibleCardsRef.current.has(d.truckId);

      // HOS цвет: зелёный >4h, жёлтый 2-4h, красный <2h
      const hosColor = d.hoursLeft > 4 ? 0x22c55e : d.hoursLeft > 2 ? 0xfbbf24 : 0xef4444;
      // HOS прогресс 0..1 (макс 11ч)
      const hosFrac = Math.min(1, Math.max(0, d.hoursLeft / 11));

      // ── MICRO: только ID + статус-полоска ─────────────────────────────
      if (variant === 'micro') {
        const W = 58, H = 28;
        const card = container.children.push(am5.Container.new(root, {
          width: W, height: H,
          dy: -(H + 14), dx: -(W / 2),
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
        const W = 118, H = 82;
        const STRIP = 4; // ширина левой полоски
        const card = container.children.push(am5.Container.new(root, {
          width: W, height: H,
          dy: -(H + 16), dx: -(W / 2),
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
    rootRef.current = root;

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "translateX", panY: "translateY",
        projection: am5map.geoAlbersUsa(),
        homeZoomLevel: 1, wheelY: "zoom", maxZoomLevel: 8,
      })
    );
    chartRef.current = chart;

    chart.set("background", am5.Rectangle.new(root, {
      fill: am5.color(0x0f172a), fillOpacity: 1,
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
    
    // Базовые настройки для всех штатов — СВЕТЛЕЕ!
    polygonSeries.mapPolygons.template.setAll({
      fill: am5.color(0x334155), // Светло-серый синий (было 0x1e3a5f)
      fillOpacity: 0.9,
      stroke: am5.color(0x64748b), // Серые границы
      strokeWidth: 1.5,
      strokeOpacity: 1,
      interactive: true,
      // tooltipText убран — используем свой попап при клике, чтобы не перекрывал карточки траков
    });
    
    // Hover эффект
    polygonSeries.mapPolygons.template.states.create("hover", { 
      fill: am5.color(0x2563eb), // Ярко-синий при наведении
      fillOpacity: 1,
      strokeWidth: 2.5,
      stroke: am5.color(0x06b6d4),
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
          text: stateCode, fill: am5.color(0xe2e8f0), fillOpacity: 0.7,
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
      stroke: am5.color(0x64748b), strokeOpacity: 0.25, strokeWidth: 0.8,
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
        fill: am5.color(0x94a3b8),
        fillOpacity: 0.8,
      }));
      
      // Название города
      container.children.push(am5.Label.new(root, {
        text: d.name, 
        fill: am5.color(0x94a3b8), 
        fillOpacity: 0.6,
        fontSize: 9, 
        fontWeight: "500",
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
        chart.zoomToGeoPoint({ longitude: -90, latitude: 38 }, 1.2, true);
        setTimeout(() => {
          chart.zoomToGeoPoint({ longitude: targetLng, latitude: targetLat }, 4, true);
        }, 1200);
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

      // Чем меньше разброс — тем сильнее зум (3–6)
      const zoomLevel = maxDist < 3 ? 6 : maxDist < 8 ? 4 : maxDist < 15 ? 3 : 2;

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
      } else if (statusKey !== lastStatusKey) {
        // Статус изменился — пересоздаём серию (меняется иконка)
        lastStatusKey = statusKey;
        rebuildTruckSeries(root, chart);
      } else {
        // Только позиции — обновляем данные без пересоздания bullets
        if (truckSeriesRef.current) {
          try {
            truckSeriesRef.current.data.setAll(buildPointData());
          } catch (_) {}
        }
      }
    }, 2000);

    // Цвета штатов — каждые 10 секунд (плавная смена по времени суток)
    colorIntervalRef.current = setInterval(() => {
      updatePolygonColors();
    }, 10000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(antIntervalRef.current);
      clearInterval(colorIntervalRef.current);
      intervalRef.current = null;
      antIntervalRef.current = null;
      colorIntervalRef.current = null;
      window.removeEventListener('zoomToTruck', handleZoomToTruck);
      root.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Статистика для мини-легенды
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
      ? "linear-gradient(135deg, rgba(6,182,212,0.35), rgba(14,165,233,0.2))"
      : "linear-gradient(160deg, rgba(15,28,55,0.97), rgba(10,20,42,0.97))",
    border: active ? "1.5px solid rgba(6,182,212,0.8)" : "1.5px solid rgba(56,189,248,0.2)",
    boxShadow: active
      ? "0 0 14px rgba(6,182,212,0.6), inset 0 1px 0 rgba(255,255,255,0.08)"
      : "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
    cursor: "pointer", fontSize: 20, fontWeight: 700, color: "#fff",
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

          {/* Облачко Zoom */}
          <div style={{
            background: "rgba(10,22,40,0.55)",
            border: "1px solid rgba(56,189,248,0.15)",
            borderRadius: 20, padding: "3px 7px",
            display: "flex", alignItems: "center", gap: 4,
            opacity: 0.5, transition: "opacity 0.2s",
          } as any}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = "1"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = "0.5"}
          >
            <span style={{ fontSize: 8, fontWeight: 700, color: "#38bdf8", letterSpacing: 1 } as any}>ZOOM</span>
            <div style={{ display: "flex", gap: 3 } as any}>
          {([
            { label: "x1", title: "Вся карта", zoom: 1 },
            { label: "x2", title: "Все траки", zoom: null },
            { label: "x3", title: "Ближний вид", zoom: 6 },
          ] as const).map((btn, i) => (
            <button
              key={i}
              title={btn.title}
              onClick={() => {
                const chart = chartRef.current;
                if (!chart) return;
                if (btn.zoom === 1) {
                  chart.zoomToGeoPoint({ longitude: -98, latitude: 38 }, 1, true);
                } else if (btn.zoom === null) {
                  const ts = trucksRef.current;
                  if (ts.length === 0) return;
                  const avgLng = ts.reduce((s: number, t: any) => s + t.position[0], 0) / ts.length;
                  const avgLat = ts.reduce((s: number, t: any) => s + t.position[1], 0) / ts.length;
                  const maxDist = ts.reduce((max: number, t: any) => Math.max(max, Math.hypot(t.position[0] - avgLng, t.position[1] - avgLat)), 0);
                  const zl = maxDist < 3 ? 6 : maxDist < 8 ? 4 : maxDist < 15 ? 3 : 2;
                  chart.zoomToGeoPoint({ longitude: avgLng, latitude: avgLat }, zl, true);
                } else {
                  const ts = trucksRef.current;
                  const target = selectedTruckRef.current
                    ? ts.find((t: any) => t.id === selectedTruckRef.current?.truckId)
                    : ts.find((t: any) => t.status === 'loaded' || t.status === 'driving') ?? ts[0];
                  if (target) chart.zoomToGeoPoint({ longitude: target.position[0], latitude: target.position[1] }, 7, true);
                }
              }}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(56,189,248,0.3)",
                borderRadius: 10, width: 26, height: 22,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 9, fontWeight: 800, color: "#38bdf8",
                transition: "all 0.15s", padding: 0,
              } as any}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(6,182,212,0.25)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(6,182,212,0.8)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(10,22,40,0.92)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(56,189,248,0.35)";
              }}
            >
              {btn.label}
            </button>
          ))}
          </div></div>

          {/* Кнопка гайда — только пока не пройден */}
          {guideActive && onGuideOpen && (
            <button
              onClick={onGuideOpen}
              style={{
                background: "rgba(10,22,40,0.92)",
                border: "1px solid rgba(129,140,248,0.45)",
                borderRadius: 20, padding: "5px 12px",
                display: "flex", alignItems: "center", gap: 5,
                cursor: "pointer",
                animation: "guideBtnPulse 2.5s ease-in-out infinite",
              } as any}
            >
              <span style={{ fontSize: 13 } as any}>📖</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#a5b4fc" } as any}>Гайд</span>
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
      } as any}>

      {/* Легенда */}
      <div style={{
        background: "rgba(10,22,40,0.92)", borderRadius: 12,
        border: "1px solid rgba(45,106,79,0.4)",
        padding: legendVisible ? "clamp(6px,1.2vw,10px) clamp(8px,1.5vw,14px)" : "5px 10px",
        display: "flex", flexDirection: "column", gap: "clamp(3px,0.5vw,5px)",
        transition: "padding 0.2s, opacity 0.6s ease",
        opacity: legendVisible ? 1 : 0.85,
        maxWidth: "clamp(130px,18vw,180px)",
      } as any} className="map-legend">
        {/* Toggle кнопка */}
        <div
          onClick={() => setLegendVisible(v => !v)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
            cursor: "pointer", userSelect: "none",
            background: legendVisible
              ? "transparent"
              : "linear-gradient(135deg, rgba(6,182,212,0.25), rgba(99,102,241,0.2))",
            borderRadius: legendVisible ? 0 : 6,
            padding: legendVisible ? "0" : "3px 5px",
            margin: legendVisible ? "0" : "-2px",
            border: legendVisible ? "none" : "1px solid rgba(6,182,212,0.4)",
            transition: "all 0.2s",
          } as any}
        >
          <span style={{
            fontSize: "clamp(10px,1.4vw,13px)",
            fontWeight: 800,
            background: "linear-gradient(90deg, #06b6d4, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: 0.5,
          } as any}>
            {legendVisible ? "ЛЕГЕНДА" : "🗺 ЛЕГЕНДА"}
          </span>
          <span style={{
            fontSize: legendVisible ? "clamp(9px,1.2vw,11px)" : "clamp(11px,1.5vw,14px)",
            background: "linear-gradient(135deg, #06b6d4, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 900,
            lineHeight: 1,
            filter: legendVisible ? "none" : "drop-shadow(0 0 4px rgba(6,182,212,0.8))",
          } as any}>{legendVisible ? "▲" : "▼"}</span>
        </div>
        {legendVisible && (<>
        {Object.entries(STATUS_LABEL).map(([s, l]) => {
          const n = activeTrucks.filter(t => t.status === s).length;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 } as any}>
              <div style={{ width: "clamp(7px,1vw,9px)", height: "clamp(7px,1vw,9px)", borderRadius: "50%", background: STATUS_COLOR[s], flexShrink: 0 } as any} />
              <span style={{ fontSize: "clamp(11px,1.3vw,13px)", color: "#94a3b8" } as any}>{STATUS_EMOJI[s]} {l}</span>
              {n > 0 && <span style={{ fontSize: "clamp(11px,1.3vw,13px)", fontWeight: 800, color: STATUS_COLOR[s], marginLeft: "auto", paddingLeft: 6 } as any}>{n}</span>}
            </div>
          );
        })}
        {/* Статистика */}
        {phase === 'playing' && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 4, paddingTop: 6, display: "flex", flexDirection: "column", gap: 3 } as any}>
            <div style={{ fontSize: "clamp(11px,1.3vw,13px)", color: "#38bdf8" } as any}>
              🛣 В пути: <span style={{ fontWeight: 700 } as any}>{totalMilesInFlight.toLocaleString()} mi</span>
            </div>
            <div style={{ fontSize: "clamp(11px,1.3vw,13px)", color: "#4ade80" } as any}>
              💰 Ожидается: <span style={{ fontWeight: 700 } as any}>${expectedRevenue.toLocaleString()}</span>
            </div>
          </div>
        )}
        {/* Surge legend */}
        {surgeStates.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 4, paddingTop: 6 } as any}>
            <div style={{ fontSize: "clamp(10px,1.2vw,12px)", color: "#ff6b35", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as any}>
              🔥 Surge: {surgeStates.join(", ")}
            </div>
          </div>
        )}
        </>)}
      </div>

      {/* Факт о штате — компактно справа от легенды */}
      <div style={{
        maxWidth: "clamp(220px, 45vw, 420px)",
        minWidth: "clamp(180px, 35vw, 280px)",
        opacity: (followTruck && stateFact) ? 1 : 0,
        pointerEvents: "none",
        transition: "opacity 0.6s ease",
        background: "rgba(8,14,28,0.92)",
        border: "1px solid rgba(56,189,248,0.35)",
        borderRadius: 12,
        padding: "clamp(8px,1.2vw,12px) clamp(10px,1.5vw,16px)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      } as any}>
        <div style={{ fontSize: "clamp(12px,1.4vw,14px)", fontWeight: 700, color: "#38bdf8", marginBottom: 4, letterSpacing: 0.5 } as any}>
          📍 {lastFactStateRef.current}
        </div>
        <div style={{ fontSize: "clamp(13px,1.5vw,15px)", color: "#e2e8f0", lineHeight: 1.55, fontWeight: 500 } as any}>
          {stateFact}
        </div>
      </div>

      </div>{/* конец flex-контейнера легенда+факт */}

      {/* Тосты — правый верхний угол (если нет попапа штата) */}
      {!selectedState && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          display: "flex", flexDirection: "column", gap: 6,
          zIndex: 1001, fontFamily: "sans-serif", pointerEvents: "none",
        } as any} className="map-toasts">
          {toasts.map(t => (
            <div key={t.id} style={{
              background: "rgba(8,14,28,0.95)", border: `1px solid ${t.color}55`,
              borderLeft: `3px solid ${t.color}`, borderRadius: 8,
              padding: "7px 12px", fontSize: 12, color: "#e2e8f0",
              boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
              animation: "fadeInSlide 0.3s ease",
            } as any}>
              {t.msg}
            </div>
          ))}
        </div>
      )}

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
          background: "rgba(8,16,32,0.7)",
          borderRadius: 16,
          border: "1px solid rgba(56,189,248,0.12)",
          padding: "8px 6px",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          opacity: mapBtnsVisible ? 1 : 0.12,
          transition: "opacity 0.6s ease, border-color 0.3s ease",
        } as any}>
        {/* 🏠 Home */}
        <button onClick={() => { resetMapBtnsTimer(); chartRef.current?.goHome(); }} title="Обзор"
          style={mapBtnStyle()}>🏠</button>
        {/* + Zoom in */}
        <button onClick={() => { resetMapBtnsTimer(); chartRef.current?.zoomIn(); }} title="Приблизить"
          style={{ ...mapBtnStyle(), fontSize: 22, fontWeight: 900, color: "#38bdf8" }}>＋</button>
        {/* − Zoom out */}
        <button onClick={() => { resetMapBtnsTimer(); chartRef.current?.zoomOut(); }} title="Отдалить"
          style={{ ...mapBtnStyle(), fontSize: 22, fontWeight: 900, color: "#94a3b8" }}>－</button>
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
          background: "linear-gradient(135deg, rgba(251,146,60,0.6), rgba(234,88,12,0.45))",
          border: "2px solid rgba(251,146,60,0.95)",
          boxShadow: "0 0 20px rgba(251,146,60,0.8), 0 0 8px rgba(251,146,60,0.5)",
          cursor: "pointer", fontSize: 22, fontWeight: 700, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 0, opacity: 1, pointerEvents: "auto",
          animation: "follow-pulse-orange 1s ease-in-out infinite",
        } as any : {
          position: "absolute", right: 16, bottom: 16, zIndex: 202,
          width: 44, height: 44, borderRadius: 12,
          background: "linear-gradient(160deg, rgba(15,28,55,0.97), rgba(10,20,42,0.97))",
          border: "1.5px solid rgba(56,189,248,0.2)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
          cursor: "pointer", fontSize: 22, fontWeight: 700, color: "#fff",
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

      {/* Попап штата */}
      {selectedState && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(8,14,28,0.97)", borderRadius: 16,
          border: `2px solid ${selectedState.isSurge ? "rgba(255,107,53,0.5)" : "rgba(6,182,212,0.35)"}`,
          padding: "16px 18px", width: 320, zIndex: 1000,
          boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
          fontFamily: "sans-serif", maxHeight: "80vh", overflowY: "auto",
          animation: "statePopupFadeIn 0.3s ease-out",
        } as any} className="map-state-popup">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } as any}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 } as any}>
              <span style={{ fontSize: 22, fontWeight: 900, color: selectedState.isSurge ? "#ff6b35" : "#06b6d4" } as any}>
                {selectedState.id}
              </span>
              <span style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600 } as any}>{STATE_NAMES[selectedState.id] || selectedState.name}</span>
              {selectedState.isSurge && (
                <span style={{ fontSize: 11, fontWeight: 700, color: "#ff6b35", background: "rgba(255,107,53,0.15)", padding: "3px 7px", borderRadius: 5 } as any}>
                  🔥 SURGE
                </span>
              )}
            </div>
            <span onClick={() => setSelectedState(null)} style={{ cursor: "pointer", fontSize: 20, color: "#94a3b8", transition: "color 0.2s" } as any}
              onMouseEnter={e => (e.currentTarget.style.color = "#e2e8f0")}
              onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}
            >✕</span>
          </div>

          {selectedState.trucks.length > 0 && (
            <div style={{ marginBottom: 14 } as any}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 } as any}>
                🚛 ТРАКИ В ШТАТЕ ({selectedState.trucks.length})
              </div>
              {selectedState.trucks.map((t: any) => {
                const color = getTruckColor(t, gameMinuteRef.current);
                const isIdle = t.status === "idle";
                return (
                  <div key={t.id}
                    onClick={() => { onTruckInfo?.(t.id); setSelectedState(null); }}
                    style={{
                      background: "rgba(255,255,255,0.04)", borderRadius: 10,
                      padding: "9px 12px", marginBottom: 6,
                      border: `1px solid ${color}33`,
                      display: "flex", flexDirection: "column", gap: 4,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    } as any}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" } as any}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" } as any}>{t.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}22`, padding: "2px 7px", borderRadius: 5 } as any}>
                        {STATUS_LABEL[t.status] || t.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#cbd5e1" } as any}>👤 {t.driver} · ⏱ {t.hoursLeft}h HOS</div>
                    {t.currentLoad && (
                      <div style={{ fontSize: 11, color: "#4ade80", lineHeight: 1.4 } as any}>
                        📦 {t.currentLoad.fromCity}, {CITY_STATE[t.currentLoad.fromCity] || ""} → {t.currentLoad.toCity}, {CITY_STATE[t.currentLoad.toCity] || ""} · ${t.currentLoad.agreedRate?.toLocaleString()}
                      </div>
                    )}
                    {!t.currentLoad && t.currentCity && (
                      <div style={{ fontSize: 11, color: "#cbd5e1" } as any}>📍 {t.currentCity}{CITY_STATE[t.currentCity] ? `, ${CITY_STATE[t.currentCity]}` : ""}</div>
                    )}
                    {isIdle && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onFindLoad?.(t.currentCity); setSelectedState(null); }}
                        style={{
                          marginTop: 4, background: "rgba(74,222,128,0.15)",
                          border: "1px solid rgba(74,222,128,0.4)", borderRadius: 7,
                          padding: "5px 10px", color: "#4ade80", fontSize: 11,
                          fontWeight: 700, cursor: "pointer", alignSelf: "flex-start",
                          transition: "all 0.2s ease",
                        } as any}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "rgba(74,222,128,0.25)";
                          e.currentTarget.style.borderColor = "#4ade80";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "rgba(74,222,128,0.15)";
                          e.currentTarget.style.borderColor = "rgba(74,222,128,0.4)";
                        }}
                      >🔍 Найти груз</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {selectedState.inboundTrucks?.length > 0 && (
            <div style={{ marginBottom: 14 } as any}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 } as any}>
                ➡️ ЕДУТ В ШТАТ ({selectedState.inboundTrucks.length})
              </div>
              {selectedState.inboundTrucks.map((t: any) => (
                <div key={t.id} style={{ fontSize: 11, color: "#38bdf8", marginBottom: 4, lineHeight: 1.4 } as any}>
                  🚛 {t.name} · {t.driver} → {t.destinationCity}{CITY_STATE[t.destinationCity] ? `, ${CITY_STATE[t.destinationCity]}` : ""}
                </div>
              ))}
            </div>
          )}

          {selectedState.loads.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 } as any}>
                📋 ГРУЗЫ ИЗ ШТАТА ({selectedState.loads.length})
                {selectedState.isSurge && <span style={{ color: "#ff6b35", marginLeft: 4 } as any}>🔥 +15% ставки</span>}
              </div>
              {selectedState.loads.slice(0, 4).map((l: any) => (
                <div key={l.id}
                  onClick={() => { onFindLoad?.(l.fromCity); setSelectedState(null); }}
                  style={{
                    background: "rgba(255,255,255,0.04)", borderRadius: 10,
                    padding: "8px 12px", marginBottom: 6,
                    border: "1px solid rgba(255,255,255,0.07)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  } as any}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 } as any}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.3 } as any}>
                      {l.fromCity}, {CITY_STATE[l.fromCity] || ""} → {l.toCity}, {CITY_STATE[l.toCity] || ""}
                    </span>
                    <span style={{ fontSize: 11, color: "#94a3b8" } as any}>
                      {l.miles}mi · {l.equipment} · {l.commodity}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: selectedState.isSurge ? "#ff6b35" : "#4ade80" } as any}>
                    ${l.postedRate?.toLocaleString()}
                  </span>
                </div>
              ))}
              {selectedState.loads.length > 4 && (
                <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 6 } as any}>
                  +{selectedState.loads.length - 4} ещё грузов
                </div>
              )}
            </div>
          )}

          {selectedState.trucks.length === 0 && selectedState.loads.length === 0 && (
            <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "16px 0" } as any}>
              Нет траков и грузов в этом штате
            </div>
          )}
        </div>
      )}

      {/* CSS для анимации тостов */}
      <style>{`
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes statePopupFadeIn {
          from { 
            opacity: 0; 
            transform: translateY(-10px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
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
  container: { flex: 1, backgroundColor: Colors.bg, overflow: "hidden" as any },
  text: { color: Colors.textMuted, fontSize: 16 },
});


