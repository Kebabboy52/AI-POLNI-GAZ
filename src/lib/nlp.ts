import { RequestTypeEnum } from '@/types';

// Ключевые слова для каждого типа заявок
const keywords = {
  [RequestTypeEnum.IT]: [
    'компьютер', 'ноутбук', 'система', 'принтер', 'сканер', 'интернет', 'почта',
    'почтовый', 'пароль', 'учетная запись', 'учетной записи', 'сервер', 'windows',
    'офис', 'excel', 'word', 'powerpoint', 'outlook', 'программа', 'программное',
    'приложение', 'установка', 'обновление', 'вирус', 'антивирус', 'настройка',
    'подключение', 'доступ', 'логин', 'ip', 'it', 'ит', 'айти'
  ],
  [RequestTypeEnum.HR]: [
    'отпуск', 'больничный', 'hr', 'кадры', 'персонал', 'собеседование', 'прием', 'увольнение',
    'сотрудник', 'сотрудника', 'коллега', 'коллеги', 'заявление', 'документ', 'справка',
    'трудовая книжка', 'трудовой договор', 'контракт', 'испытательный срок', 'зарплата',
    'оклад', 'премия', 'бонус', 'компенсация', 'отдел кадров', 'кадровый', 'обучение',
    'тренинг', 'курс', 'повышение квалификации', 'аттестация', 'оценка'
  ],
  [RequestTypeEnum.LOGISTICS]: [
    'доставка', 'перевозка', 'транспорт', 'груз', 'склад', 'запас', 'отгрузка', 'поставка',
    'заказ', 'логистика', 'курьер', 'экспедитор', 'посылка', 'накладная', 'товар', 'материал',
    'сырье', 'поставщик', 'клиент', 'маршрут', 'машина', 'автомобиль', 'водитель',
    'хранение', 'канцтовары', 'офисные', 'бумага', 'мебель', 'офисная техника'
  ]
};

/**
 * Определяет тип заявки на основе текста с использованием простого алгоритма на ключевых словах
 * @param title Заголовок заявки
 * @param description Описание заявки
 * @returns Тип заявки или null, если не удалось определить
 */
export function classifyRequest(title: string, description: string): RequestTypeEnum | null {
  const text = `${title} ${description}`.toLowerCase();

  // Счетчики для каждого типа
  const counts = {
    [RequestTypeEnum.IT]: 0,
    [RequestTypeEnum.HR]: 0,
    [RequestTypeEnum.LOGISTICS]: 0,
  };

  // Подсчитываем количество ключевых слов для каждого типа
  Object.entries(keywords).forEach(([type, words]) => {
    for (const word of words) {
      if (text.includes(word.toLowerCase())) {
        counts[type as RequestTypeEnum] += 1;
      }
    }
  });

  // Находим тип с наибольшим количеством совпадений
  let maxCount = 0;
  let predictedType: RequestTypeEnum | null = null;

  Object.entries(counts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      predictedType = type as RequestTypeEnum;
    }
  });

  // Если не найдено ни одного ключевого слова или результат неоднозначный
  if (maxCount === 0) {
    return null;
  }

  return predictedType;
}

/**
 * Вычисляет уверенность в классификации (от 0 до 1)
 * @param title Заголовок заявки
 * @param description Описание заявки
 * @returns Объект с типом заявки и уверенностью или null, если не удалось определить
 */
export function classifyRequestWithConfidence(
  title: string,
  description: string
): { type: RequestTypeEnum; confidence: number } | null {
  const text = `${title} ${description}`.toLowerCase();

  // Счетчики для каждого типа
  const counts = {
    [RequestTypeEnum.IT]: 0,
    [RequestTypeEnum.HR]: 0,
    [RequestTypeEnum.LOGISTICS]: 0,
  };

  const totalKeywords = {
    [RequestTypeEnum.IT]: keywords[RequestTypeEnum.IT].length,
    [RequestTypeEnum.HR]: keywords[RequestTypeEnum.HR].length,
    [RequestTypeEnum.LOGISTICS]: keywords[RequestTypeEnum.LOGISTICS].length,
  };

  // Подсчитываем количество ключевых слов для каждого типа
  Object.entries(keywords).forEach(([type, words]) => {
    for (const word of words) {
      if (text.includes(word.toLowerCase())) {
        counts[type as RequestTypeEnum] += 1;
      }
    }
  });

  // Находим тип с наибольшим количеством совпадений
  let maxCount = 0;
  let predictedType: RequestTypeEnum | null = null;

  Object.entries(counts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count;
      predictedType = type as RequestTypeEnum;
    }
  });

  // Если не найдено ни одного ключевого слова
  if (maxCount === 0 || !predictedType) {
    return null;
  }

  // Вычисляем уверенность как отношение найденных слов к общему числу ключевых слов типа
  // и с учетом общего количества слов в тексте
  const wordCount = text.split(/\s+/).length;
  const confidence = Math.min(
    maxCount / Math.min(totalKeywords[predictedType], wordCount / 3),
    1
  );

  // Если уверенность слишком низкая, не классифицируем
  if (confidence < 0.2) {
    return null;
  }

  return {
    type: predictedType,
    confidence,
  };
}

/**
 * Имитирует оптимизацию распределения сотрудников на основе их навыков и загрузки отделов
 * @param departmentId ID отдела для оптимизации
 * @param employeeSkills Массив навыков сотрудников
 * @returns Рекомендация в виде текста
 */
export function generateEmployeeDistributionRecommendation(
  departmentId: string,
  employeeSkills: { employeeId: string; skills: string[] }[]
): string {
  // Имитация ИИ-рекомендации
  const recommendations = [
    "Рекомендуется перераспределить сотрудников с учетом их компетенций для повышения эффективности. Предлагается перевести специалистов с техническими навыками в ИТ-отдел.",
    "Обнаружен дисбаланс навыков в отделе. Рекомендуется обучение сотрудников новым компетенциям или реорганизация структуры.",
    "Для оптимизации рабочих процессов рекомендуется создать новую группу сотрудников со специализацией в конкретных задачах.",
    "Анализ показал, что в отделе недостаточно специалистов с навыками проектного управления. Рекомендуется добавить сотрудников с этими компетенциями.",
    "Для повышения эффективности отдела рекомендуется равномерное распределение сотрудников с учетом их навыков и опыта."
  ];

  // Выбираем случайную рекомендацию
  return recommendations[Math.floor(Math.random() * recommendations.length)];
}

/**
 * Имитирует прогнозирование загрузки отделов
 * @param departmentId ID отдела для прогнозирования
 * @param requestsHistory История заявок отдела
 * @returns Прогноз загрузки в виде текста
 */
export function generateWorkloadPrediction(
  departmentId: string,
  requestsHistory: { date: Date; count: number }[]
): string {
  // Имитация ИИ-прогноза
  const predictions = [
    "Прогноз показывает увеличение загрузки отдела на 15% в следующем месяце. Рекомендуется подготовить дополнительные ресурсы.",
    "Ожидается снижение количества заявок на 10% в следующие 2 недели. Можно временно перераспределить ресурсы на другие задачи.",
    "Анализ истории заявок показывает циклическое увеличение нагрузки в конце квартала. Рекомендуется заранее планировать ресурсы.",
    "Прогнозируется стабильная загрузка отдела в ближайший месяц. Текущих ресурсов достаточно для обработки ожидаемого объема заявок.",
    "Данные указывают на возможные пиковые нагрузки в начале следующего месяца. Рекомендуется оптимизировать рабочие процессы."
  ];

  // Выбираем случайную рекомендацию
  return predictions[Math.floor(Math.random() * predictions.length)];
}
