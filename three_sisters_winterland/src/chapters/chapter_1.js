// scenes.js
import sceneText from "./sceneText.js";

// Тут оставляем ТОЛЬКО "скелет" сцен: id/title/isCheckpoint/options/флаги/эффекты.
// Тексты (text/textByRole) берутся из sceneText по ключу сцены (обычно = id).
const baseScenes = {
  // --- СЛУЖЕБНАЯ RESCUE-СЦЕНА ДЛЯ ГЛАВЫ 1 (подготовка) ---
  RESCUE_TAVERN: {
    id: "RESCUE_TAVERN",
    title: "Спасение — Трактир",
    isCheckpoint: false,
    options: [
      {
        id: "rescue_free_sister",
        label: "Освободить сестру",
        next: "RESCUE_TAVERN",
        // позже это станет action: clearIncapacitated(...)
      },
    ],
  },

  S10: {
    id: "S10",
    title: "Глава 1 — Встреча",
    isCheckpoint: false,
    options: [{ id: "next", label: "Далее", next: "S11" }],
  },

  S11: {
    id: "S11",
    title: "Начало",
    isCheckpoint: false,
    options: [{ id: "next", label: "Далее", next: "T0" }],
  },

  T0: {
    id: "T0",
    title: "Трактир «Северный огонь» — Вход",
    isCheckpoint: false,
    options: [
      { id: "t0_scan_hall", label: "Осмотреть зал", next: "T1" },
      { id: "t0_to_bar", label: "Подойти к стойке", next: "T2" },
      { id: "t0_sit_table", label: "Сесть за ближайший стол", next: "T7" },
      { id: "t0_stay_door", label: "Остаться у двери", next: "T6" },
    ],
  },

  T1: {
    id: "T1",
    title: "Осмотр зала",
    isCheckpoint: false,
    options: [
      {
        id: "t1_to_blacksmith",
        label: "Подойти к ремесленнику",
        next: "T3",
        setFlags: ["talked_to_blacksmith"],
      },
      {
        id: "t1_to_guard",
        label: "Подойти к стражнику",
        next: "T4",
        setFlags: ["talked_to_guard"],
      },
      {
        id: "t1_to_barkeep",
        label: "Подойти к трактирщику",
        next: "T2",
        setFlags: ["talked_to_barkeep"],
      },
      {
        id: "t1_to_corner",
        label: "Подойти к тем, кто в углу",
        next: "T5",
        setFlags: ["talked_to_bandits"],
      },
      {
        id: "t1_back_entrance",
        label: "Вернуться ко входу",
        next: "T0",
      },
    ],
  },

  T2: {
    id: "T2",
    title: "Трактирщик",
    isCheckpoint: false,
    options: [
      { id: "t2_order_ale", label: "Заказать эль", next: "T2_1", setFlags: ["ordered_drink"] },
      {
        id: "t2_ask_city",
        label: "Спросить, что происходит в городе",
        next: "T2_2",
        setFlags: ["talked_to_barkeep"],
      },
      { id: "t2_ask_roads", label: "Спросить про дороги", next: "T2_3", setFlags: ["asked_about_roads"] },
      {
        id: "t2_overpay",
        label: "Оставить больше монет, чем нужно",
        next: "T2_4",
        setFlags: ["overpaid_barkeep", "path2_active"],
      },
      {
        id: "t2_back_hall",
        label: "Вернуться в зал",
        next: "T1",
      },
    ],
  },

  T2_1: {
    id: "T2_1",
    title: "Трактирщик — Эль",
    isCheckpoint: false,
    options: [{ id: "next", label: "Далее", next: "T2" }],
  },

  T2_2: {
    id: "T2_2",
    title: "Трактирщик — Город",
    isCheckpoint: false,
    options: [{ id: "next", label: "Далее", next: "T2" }],
  },

  T2_3: {
    id: "T2_3",
    title: "Трактирщик — Дороги",
    isCheckpoint: false,
    options: [{ id: "next", label: "Далее", next: "T2" }],
  },

  T2_4: {
    id: "T2_4",
    title: "Трактирщик — Больше монет",
    isCheckpoint: false,
    options: [
      // по твоему канону: трактирщик за деньги намекает "если хочешь — спроси у госпожи Анны",
      // и это сразу ведёт к Анне => Путь 2
      { id: "next", label: "Далее", next: "A0", setFlags: ["path2_active"] },
    ],
  },

  T3: {
    id: "T3",
    title: "Ремесленник",
    isCheckpoint: false,
    options: [
      { id: "t3_ask_more", label: "Спросить, что он имеет в виду", next: "T3_1" },
      { id: "t3_ask_north", label: "Спросить про север", next: "T3_2" },
      { id: "t3_ask_traders", label: "Спросить про торговцев", next: "T3_3" },
      {
        id: "t3_leave",
        label: "Поблагодарить и уйти",
        next: "T0",
      },
    ],
  },

  T3_1: {
    id: "T3_1",
    title: "Ремесленник — Неправильный вопрос",
    isCheckpoint: false,
    options: [{ id: "next", label: "Далее", next: "T3" }],
  },

  T3_2: {
    id: "T3_2",
    title: "Ремесленник — Север",
    isCheckpoint: false,
    options: [{ id: "next", label: "Далее", next: "T3" }],
  },

  T3_3: {
    id: "T3_3",
    title: "Ремесленник — Торговцы",
    isCheckpoint: false,
    options: [{ id: "next", label: "Далее", next: "T3" }],
  },

  T3_4: {
    id: "T3_4",
    title: "Ремесленник — Звери",
    isCheckpoint: false,
    options: [{ id: "next", label: "Далее", next: "T3" }],
  },

  T4: {
    id: "T4",
    title: "Стражник",
    isCheckpoint: false,
    options: [
      {
        id: "t4_ask_horses",
        label: "Спросить про лошадей",
        next: "T1",
      },
      { id: "t4_ask_carts", label: "Спросить про обозы", next: "T1" },
      { id: "t4_ask_seen", label: "Спросить, что он видел", next: "T1" },
      { id: "t4_offer_coins", label: "Предложить монеты", next: "S0" },
    ],
  },

  // ВАЖНО: у разбойников (варианты 1-3) сразу уходим в Путь 4, "уйти" = просто назад в зал
  T5: {
    id: "T5",
    title: "Разбойники",
    isCheckpoint: false,
    options: [
      { id: "t5_hint", label: "Спросить, что он имеет в виду", next: "T5_1" },
      { id: "t5_roads", label: "Спросить про дороги", next: "T5_2" },
      { id: "t5_help", label: "Спросить, могут ли помочь", next: "T5_3" },
      { id: "t5_leave", label: "Уйти", next: "T7" },
    ],
  },

  T5_1: {
    id: "T5_1",
    title: "Разбойники — Намёк",
    isCheckpoint: false,
    options: [
      {
        id: "next",
        label: "Далее",
        next: "P4_START",
        setFlags: ["path4_active", "path4_locked_in"],
      },
    ],
  },

  T5_2: {
    id: "T5_2",
    title: "Разбойники — Дороги",
    isCheckpoint: false,
    options: [
      {
        id: "next",
        label: "Далее",
        next: "P4_START",
        setFlags: ["path4_active", "path4_locked_in"],
      },
    ],
  },

  T5_3: {
    id: "T5_3",
    title: "Разбойники — Сопровождение",
    isCheckpoint: false,
    options: [
      {
        id: "next",
        label: "Далее",
        next: "P4_START",
        setFlags: ["path4_active", "path4_locked_in"],
      },
    ],
  },

  T6: {
    id: "T6",
    title: "У двери — трус",
    isCheckpoint: false,
    options: [
      { id: "t6_back_hall", label: "Вернуться в зал", next: "T1", setFlags: ["coward_seen"] },
      { id: "t6_follow_glance", label: "Проследить, куда он смотрит", next: "T6_1", setFlags: ["coward_suspected"] },
    ],
  },

  T6_1: {
    id: "T6_1",
    title: "У двери — слишком быстрый уход",
    isCheckpoint: false,
    options: [
      { id: "t6_1_stop", label: "Окликнуть и остановить", next: "T6_2", setFlags: ["coward_confronted"] },
      { id: "t6_1_let_go", label: "Не вмешиваться", next: "T7", setFlags: ["coward_left"] },
    ],
  },

  T6_2: {
    id: "T6_2",
    title: "У двери — разговор на краю",
    isCheckpoint: false,
    options: [
      { id: "t6_2_press", label: "Надавить вопросами", next: "T6_3", setFlags: ["coward_pressed"] },
      { id: "t6_2_release", label: "Отпустить", next: "T7", setFlags: ["coward_released"] },
    ],
  },

  T6_3: {
    id: "T6_3",
    title: "У двери — обрывок правды",
    isCheckpoint: false,
    options: [
      { id: "t6_3_to_exit", label: "Выйти из трактира", next: "T8", setFlags: ["coward_ran", "hint_arrows_outside"] },
      { id: "t6_3_back_hall", label: "Вернуться в зал", next: "T7" },
    ],
  },

  T7: {
    id: "T7",
    title: "Центр зала",
    isCheckpoint: false,
    options: [
      { id: "t7_to_blacksmith", label: "Ремесленник", next: "T3" },
      { id: "t7_to_barkeep", label: "Трактирщик", next: "T2" },
      { id: "t7_to_guard", label: "Стражник", next: "T4" },
      { id: "t7_to_corner", label: "Угол", next: "T5" },
      { id: "t7_to_exit", label: "Выйти", next: "T8" },
    ],
  },

  T8: {
    id: "T8",
    title: "Выход из трактира",
    isCheckpoint: false,
    options: [
      { id: "t8_to_cart", label: "Пойти к повозке", next: "S0" },
      { id: "t8_walk_street", label: "Пройтись по улице", next: "S1" },
      { id: "t8_back_inn", label: "Вернуться внутрь", next: "T0" },
    ],
  },

  S0: {
    id: "S0",
    title: "Улица — к повозкам",
    isCheckpoint: false,
    options: [{ id: "s0_to_cart", label: "Подойти ближе", next: "C0", setFlags: ["cart_seen"] }],
  },

  S1: {
    id: "S1",
    title: "Улица — короткий обход",
    isCheckpoint: false,
    options: [{ id: "s1_to_cart", label: "Вернуться к повозке", next: "C0", setFlags: ["cart_seen"] }],
  },

  C0: {
    id: "C0",
    title: "Повозка и лошади",
    isCheckpoint: false,
    options: [
      { id: "c0_inspect", label: "Осмотреть повозку", next: "C1" },
      { id: "c0_back_inn", label: "Вернуться в трактир", next: "T0" },
    ],
  },

  C1: {
    id: "C1",
    title: "Находка",
    isCheckpoint: false,
    options: [
      { id: "c1_to_choice", label: "Решить, что делать дальше", next: "C2", setFlags: ["arrowheads_found"] },
      { id: "c1_back", label: "Спрятать и отойти", next: "C0", setFlags: ["arrows_hidden"] },
    ],
  },

  C2: {
    id: "C2",
    title: "Выбор пути",
    isCheckpoint: true,
    options: [
      { id: "c2_back_inn_path1", label: "Вернуться в трактир (показать стрелы ремесленнику)", next: "P1_START", setFlags: ["path1_active"] },
      { id: "c2_to_anna_path2", label: "Пойти к Анне (поселения)", next: "A0", setFlags: ["path2_active"] },
      { id: "c2_analyze_path6", label: "Осмотреться и подумать (знаки)", next: "P6_START", setFlags: ["path6_active", "noticed_dry_wood"] },

      // это теперь ПУТЬ 7 (следы/стрелы), и флаг тоже path7_active, а не path4_active
      { id: "c2_follow_tracks_path7", label: "Пойти по следам (короче)", next: "P7_START", setFlags: ["path7_active", "followed_tracks"] },

      { id: "c2_leave_path3", label: "Уйти, не решая", next: "P3_START", setFlags: ["path3_active"] },
      { id: "c2_fair_path5", label: "Зайти на ярмарку", next: "P5_START", setFlags: ["path5_active"] },
    ],
  },

  // --- АННА (ПУТЬ 2) ---
  A0: {
    id: "A0",
    title: "Дом Анны",
    isCheckpoint: false,
    options: [
      { id: "a0_accept", label: "Согласиться и идти через поселения", next: "P2_START", setFlags: ["path2_active", "path2_locked_in", "anna_helped"] },
      // если решение принято — назад нельзя, поэтому "уйти" ведём не в C2, а в выход из города/нейтральный путь
      { id: "a0_decline", label: "Поблагодарить и уйти", next: "T8" },
    ],
  },

  // --- ОБЩИЙ ВЫХОД ИЗ ГОРОДА ---
  E0: {
    id: "E0",
    title: "Выход к лесу",
    isCheckpoint: true,
    options: [{ id: "e0_continue", label: "Продолжить", next: "CH2_HOOK", setFlags: ["game_started"] }],
  },

  P1_START: {
    id: "P1_START",
    title: "Путь 1 — Звериная сказка (старт)",
    isCheckpoint: true,
    options: [
      // если вошли в старт пути — сразу считаем путь выбранным
      { id: "p1_show_arrows", label: "Показать стрелы ремесленнику", next: "P1_BLACKSMITH_ARROWS", setFlags: ["path1_active", "path1_locked_in", "p1_shown_arrows"] },
    ],
  },

  P1_BLACKSMITH_ARROWS: {
    id: "P1_BLACKSMITH_ARROWS",
    title: "Путь 1 — Ремесленник узнаёт стрелы",
    isCheckpoint: false,
    options: [
      { id: "p1_ask_where_from", label: "Спросить, откуда такой металл", next: "P1_LEAD_BEAST" },
      { id: "p1_leave_forest", label: "Уйти и идти в лес", next: "E0", setFlags: ["path1_locked_in"] },
    ],
  },

  P1_LEAD_BEAST: {
    id: "P1_LEAD_BEAST",
    title: "Путь 1 — Намёк на звериные знаки",
    isCheckpoint: false,
    options: [{ id: "p1_to_e0", label: "Выход из города", next: "E0", setFlags: ["path1_locked_in"] }],
  },

  P2_START: {
    id: "P2_START",
    title: "Путь 2 — Людская дорога (старт)",
    isCheckpoint: true,
    options: [{ id: "p2_to_e0", label: "Покинуть город", next: "E0", setFlags: ["path2_locked_in"] }],
  },

  P3_START: {
    id: "P3_START",
    title: "Путь 3 — Тихая глубь (старт)",
    isCheckpoint: true,
    options: [{ id: "p3_to_e0", label: "Выход к лесу", next: "E0", setFlags: ["path3_locked_in"] }],
  },

  P4_START: {
    id: "P4_START",
    title: "Путь 4 — Разбойничий (старт)",
    isCheckpoint: true,
    options: [
      { id: "p4_to_e0", label: "Выйти из города", next: "E0", setFlags: ["path4_locked_in"] },
    ],
  },

  P5_START: {
    id: "P5_START",
    title: "Путь 5 — Ярмарочный (старт)",
    isCheckpoint: true,
    options: [
      { id: "p5_buy_rumor", label: "Купить слух (несколько монет)", next: "P5_RUMOR", setFlags: ["p5_rumor_bought"] },
      { id: "p5_leave", label: "Уйти с ярмарки", next: "E0", setFlags: ["path5_locked_in"] },
    ],
  },

  P5_RUMOR: {
    id: "P5_RUMOR",
    title: "Путь 5 — Слух",
    isCheckpoint: false,
    options: [{ id: "p5_to_e0", label: "Покинуть город", next: "E0", setFlags: ["path5_locked_in"] }],
  },

  P6_START: {
    id: "P6_START",
    title: "Путь 6 — Путь знаков (старт)",
    isCheckpoint: true,
    options: [
      { id: "p6_mark_direction", label: "Отметить направление и идти", next: "E0", setFlags: ["path6_locked_in", "signs_read"] },
    ],
  },

  P7_START: {
    id: "P7_START",
    title: "Путь 7 — Следы и стрелы (старт)",
    isCheckpoint: true,
    options: [
      { id: "p7_to_e0", label: "Выйти из города", next: "E0", setFlags: ["path7_locked_in"] },
    ],
  },

  CH2_HOOK: {
    id: "CH2_HOOK",
    title: "Дальше — не город",
    isCheckpoint: true,
    options: [{ id: "ch2_placeholder", label: "Продолжить", next: "CH2_PATH_ROUTER" }],
  },

  CH2_PATH_ROUTER: {
    id: "CH2_PATH_ROUTER",
    title: "Выбранный путь",
    isCheckpoint: false,
    options: [{ id: "router_back", label: "Вернуться (для теста)", next: "C2" }],
  },
};

// Собираем финальные сцены: добавляем текст из sceneText по id.
const scenes = Object.fromEntries(
  Object.entries(baseScenes).map(([key, scene]) => {
    const id = scene.id ?? key;
    return [key, { ...scene, ...(sceneText[id] ?? {}) }];
  })
);

// (Опционально) проверка: если для сцены нет текста — выводим предупреждение
for (const [key, scene] of Object.entries(scenes)) {
  const hasText =
    Object.prototype.hasOwnProperty.call(scene, "text") ||
    Object.prototype.hasOwnProperty.call(scene, "textByRole");
  if (!hasText) {
    // eslint-disable-next-line no-console
    console.warn(`[scenes] no text for scene: ${key} (${scene.id})`);
  }
}

export default scenes;
