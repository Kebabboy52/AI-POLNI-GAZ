import Papa from 'papaparse';
import type { EmployeeType } from '@/types';

/**
 * Преобразует строковое представление навыков в массив
 * @param skills Строка с навыками, разделенными запятой или точкой с запятой
 * @returns Массив навыков
 */
function parseSkills(skills: string): string[] {
  if (!skills) return [];
  return skills.split(/[,;]/).map(skill => skill.trim()).filter(Boolean);
}

/**
 * Импортирует сотрудников из CSV-строки
 * @param csvString Строка в формате CSV
 * @returns Массив сотрудников
 */
export function importEmployeesFromCSV(csvString: string): Omit<EmployeeType, 'id'>[] {
  const result = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => {
      // Преобразуем заголовки в camelCase и нормализуем
      const normalizedHeader = header.toLowerCase().trim();

      const headerMap: Record<string, string> = {
        'фио': 'name',
        'имя': 'name',
        'ф.и.о.': 'name',
        'фамилия имя отчество': 'name',
        'должность': 'position',
        'позиция': 'position',
        'электронная почта': 'email',
        'email': 'email',
        'почта': 'email',
        'телефон': 'phone',
        'тел': 'phone',
        'тел.': 'phone',
        'навыки': 'skills',
        'компетенции': 'skills',
        'умения': 'skills',
        'отдел': 'department',
        'департамент': 'department',
        'подразделение': 'department',
      };

      return headerMap[normalizedHeader] || normalizedHeader;
    }
  });

  if (result.errors.length > 0) {
    console.error('Ошибка при парсинге CSV:', result.errors);
    throw new Error(`Ошибка при парсинге CSV: ${result.errors[0].message}`);
  }

  const employees = result.data.map((row: any) => {
    return {
      name: row.name || 'Не указано',
      position: row.position || 'Не указано',
      email: row.email || '',
      phone: row.phone || '',
      skills: parseSkills(row.skills || ''),
      departmentId: null, // ID отдела будет присвоен позже при распределении
    };
  });

  return employees;
}

/**
 * Проверяет корректность CSV-файла для импорта сотрудников
 * @param csvString Строка в формате CSV
 * @returns Объект с результатом проверки
 */
export function validateEmployeeCSV(csvString: string): {
  isValid: boolean;
  errors: string[];
  data?: Omit<EmployeeType, 'id'>[];
} {
  try {
    const result = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });

    const errors: string[] = [];

    // Проверяем наличие обязательных полей
    const headers = result.meta.fields || [];
    const requiredFields = ['name', 'position', 'email'];
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

    const missingRequiredFields = requiredFields.filter(field => {
      const fieldAlternatives = {
        'name': ['фио', 'имя', 'ф.и.о.', 'фамилия имя отчество'],
        'position': ['должность', 'позиция'],
        'email': ['электронная почта', 'почта'],
      };

      return !normalizedHeaders.some(header =>
        header === field || (fieldAlternatives[field as keyof typeof fieldAlternatives]?.includes(header))
      );
    });

    if (missingRequiredFields.length > 0) {
      errors.push(`Отсутствуют обязательные поля: ${missingRequiredFields.join(', ')}`);
    }

    // Проверяем корректность данных для каждой строки
    result.data.forEach((row: any, index: number) => {
      const rowNumber = index + 2; // +2 потому что первая строка - заголовки и индексация с 0

      // Проверка email
      if (row.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email)) {
          errors.push(`Строка ${rowNumber}: Некорректный формат email "${row.email}"`);
        }
      }

      // Проверка на наличие имени
      if (!row.name || row.name.trim() === '') {
        errors.push(`Строка ${rowNumber}: Имя не указано`);
      }

      // Проверка на наличие должности
      if (!row.position || row.position.trim() === '') {
        errors.push(`Строка ${rowNumber}: Должность не указана`);
      }
    });

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // Если проверки прошли успешно, возвращаем данные
    const employees = importEmployeesFromCSV(csvString);
    return { isValid: true, errors: [], data: employees };

  } catch (error) {
    return {
      isValid: false,
      errors: [(error as Error).message || 'Ошибка при проверке CSV-файла']
    };
  }
}
