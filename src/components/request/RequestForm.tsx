import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '@radix-ui/react-label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type DepartmentType, RequestTypeEnum } from '@/types';
import { useOrganizationStore } from '@/store/organizationStore';
import { useToast } from '@/hooks/use-toast';
import { classifyRequestWithConfidence } from '@/lib/nlp';

// Схема валидации для формы заявки
const requestSchema = z.object({
  title: z.string().min(3, { message: 'Заголовок должен содержать как минимум 3 символа' }),
  description: z.string().min(10, { message: 'Описание должно содержать как минимум 10 символов' }),
  type: z.nativeEnum(RequestTypeEnum, { message: 'Выберите тип заявки' }),
});

type RequestFormValues = z.infer<typeof requestSchema>;

interface RequestFormProps {
  onCreate?: (values: RequestFormValues) => void;
  onCancel?: () => void;
}

export function RequestForm({ onCreate, onCancel }: RequestFormProps) {
  const { departments } = useOrganizationStore();
  const { toast } = useToast();

  // Для автоматической классификации
  const [autoClassification, setAutoClassification] = useState<{
    type: RequestTypeEnum;
    confidence: number;
  } | null>(null);

  // Получаем плоский список всех отделов
  const flattenedDepartments = React.useMemo(() => {
    const result: { id: string; name: string; level: number }[] = [];

    const flatten = (departments: DepartmentType[]) => {
      departments.forEach(dept => {
        result.push({
          id: dept.id,
          name: dept.name,
          level: dept.level,
        });

        if (dept.childDepartments.length > 0) {
          flatten(dept.childDepartments);
        }
      });
    };

    flatten(departments);
    return result;
  }, [departments]);

  // Инициализируем форму
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: '',
      description: '',
      type: undefined,
    },
  });

  // Наблюдаем за полями для автоклассификации
  const title = watch('title');
  const description = watch('description');

  // Автоматически классифицируем заявку при изменении заголовка или описания
  useEffect(() => {
    if (title && description && title.length > 3 && description.length > 10) {
      const result = classifyRequestWithConfidence(title, description);
      if (result) {
        setAutoClassification(result);
        // Автоматически устанавливаем тип заявки, если уверенность высокая
        if (result.confidence > 0.7) {
          setValue('type', result.type);
        }
      } else {
        setAutoClassification(null);
      }
    }
  }, [title, description, setValue]);

  // Обработчик отправки формы
  const onSubmit = (data: RequestFormValues) => {
    if (onCreate) {
      onCreate(data);
      reset();
      setAutoClassification(null);
    }
  };

  // Получаем название типа заявки
  const getRequestTypeName = (type: RequestTypeEnum) => {
    switch (type) {
      case RequestTypeEnum.IT:
        return 'ИТ-запрос';
      case RequestTypeEnum.HR:
        return 'Кадровый вопрос';
      case RequestTypeEnum.LOGISTICS:
        return 'Запрос логистики';
      default:
        return type;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Создание новой заявки</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} id="request-form" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Введите краткий заголовок заявки"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Опишите вашу проблему или запрос подробно"
              rows={5}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Тип заявки</Label>
            <Select
              onValueChange={(value) => setValue('type', value as RequestTypeEnum)}
              value={watch('type')}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Выберите тип заявки" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(RequestTypeEnum).map((type) => (
                  <SelectItem key={type} value={type}>
                    {getRequestTypeName(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}

            {/* Автоматическая классификация */}
            {autoClassification && (
              <div className="mt-2 flex items-center">
                <span className="text-sm text-muted-foreground">
                  Автоклассификация: {getRequestTypeName(autoClassification.type)}
                  (уверенность: {Math.round(autoClassification.confidence * 100)}%)
                </span>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="ml-2"
                  onClick={() => setValue('type', autoClassification.type)}
                >
                  Применить
                </Button>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        )}
        <Button type="submit" form="request-form">
          Создать заявку
        </Button>
      </CardFooter>
    </Card>
  );
}
