import type React from 'react';
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { useOrganizationStore } from '@/store/organizationStore';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { importEmployeesFromCSV, validateEmployeeCSV } from '@/lib/csv-import';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { EmployeeType } from '@/types';

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
}

export function CSVImportDialog({
  open,
  onOpenChange,
  departmentId,
}: CSVImportDialogProps) {
  const { importEmployees } = useOrganizationStore();
  const { toast } = useToast();

  // Состояния
  const [csvText, setCsvText] = useState('');
  const [parseResult, setParseResult] = useState<{
    isValid: boolean;
    errors: string[];
    data?: Omit<EmployeeType, 'id'>[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Ссылка на input file для загрузки CSV
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обработчик ввода CSV в textarea
  const handleCsvTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvText(e.target.value);
    setParseResult(null);
  };

  // Обработчик загрузки файла
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      setParseResult(null);
    };

    reader.readAsText(file);
  };

  // Обработчик предварительной проверки
  const handleValidate = () => {
    setIsLoading(true);

    try {
      const result = validateEmployeeCSV(csvText);
      setParseResult(result);

      if (result.isValid) {
        toast({
          title: 'Проверка успешна',
          description: `Найдено ${result.data?.length || 0} сотрудников для импорта.`,
        });
      } else {
        toast({
          title: 'Ошибки в CSV файле',
          description: 'Исправьте ошибки перед импортом.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка валидации',
        description: (error as Error).message || 'Не удалось обработать CSV',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик импорта
  const handleImport = () => {
    setIsLoading(true);

    try {
      if (!parseResult || !parseResult.isValid || !parseResult.data) {
        // Попытка выполнить валидацию перед импортом, если еще не сделано
        const result = validateEmployeeCSV(csvText);

        if (!result.isValid) {
          toast({
            title: 'Ошибки в CSV файле',
            description: 'Пожалуйста, сначала исправьте ошибки и выполните проверку.',
            variant: 'destructive',
          });
          setParseResult(result);
          setIsLoading(false);
          return;
        }

        setParseResult(result);

        if (!result.data || result.data.length === 0) {
          toast({
            title: 'Нет данных для импорта',
            description: 'CSV не содержит данных о сотрудниках.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        // Добавляем departmentId к данным сотрудников
        const employeesWithDepartment = result.data.map(emp => ({
          ...emp,
          departmentId,
        }));

        // Импортируем сотрудников
        importEmployees(employeesWithDepartment);
      } else {
        // Если валидация уже пройдена
        // Добавляем departmentId к данным сотрудников
        const employeesWithDepartment = parseResult.data.map(emp => ({
          ...emp,
          departmentId,
        }));

        // Импортируем сотрудников
        importEmployees(employeesWithDepartment);
      }

      toast({
        title: 'Импорт выполнен',
        description: 'Сотрудники успешно импортированы в отдел.',
      });

      // Сбрасываем состояние и закрываем диалог
      setCsvText('');
      setParseResult(null);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Ошибка импорта',
        description: (error as Error).message || 'Не удалось импортировать сотрудников',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Пример CSV для подсказки
  const csvExample = `ФИО,Должность,Email,Телефон,Навыки
Иванов Иван Иванович,Менеджер,ivanov@example.com,+7 (123) 456-78-90,"MS Word, Excel, PowerPoint"
Петрова Анна Сергеевна,Дизайнер,petrova@example.com,+7 (987) 654-32-10,"Photoshop, Illustrator, Figma"`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Импорт сотрудников из CSV</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Загрузить CSV файл
            </Button>

            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleValidate}
                disabled={!csvText.trim() || isLoading}
              >
                Проверить
              </Button>
              <Button
                type="button"
                onClick={handleImport}
                disabled={(!parseResult?.isValid && parseResult !== null) || !csvText.trim() || isLoading}
              >
                Импортировать
              </Button>
            </div>
          </div>

          <Textarea
            value={csvText}
            onChange={handleCsvTextChange}
            placeholder={`Введите или вставьте CSV данные. Пример:\n${csvExample}`}
            className="h-[200px] font-mono text-sm"
          />

          {parseResult && (
            <div className={`p-4 rounded-md ${parseResult.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-start">
                {parseResult.isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <div>
                  <h3 className="font-medium">
                    {parseResult.isValid
                      ? `Проверка пройдена: найдено ${parseResult.data?.length} сотрудников`
                      : 'Обнаружены ошибки'
                    }
                  </h3>
                  {!parseResult.isValid && parseResult.errors.length > 0 && (
                    <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                      {parseResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <h4 className="font-medium">Требования к CSV файлу:</h4>
            <ul className="list-disc list-inside">
              <li>Разделитель - запятая (,)</li>
              <li>Должны быть указаны заголовки колонок</li>
              <li>Обязательные поля: ФИО (или Имя), Должность, Email</li>
              <li>Навыки следует указывать через запятую, в двойных кавычках</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
