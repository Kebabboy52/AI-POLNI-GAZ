import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '@radix-ui/react-label';
import { useOrganizationStore } from '@/store/organizationStore';
import type { EmployeeType } from '@/types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
import { EmployeeRating } from './EmployeeRating';

// Схема валидации для формы сотрудника
const employeeSchema = z.object({
  name: z.string().min(2, { message: 'Имя должно содержать как минимум 2 символа' }),
  surname: z.string().min(2, { message: 'Фамилия должна содержать как минимум 2 символа' }),
  position: z.string().min(2, { message: 'Должность должна содержать как минимум 2 символа' }),
  email: z.string().email({ message: 'Введите корректный email' }),
  phone: z.string().optional(),
  photoUrl: z.string().optional(),
  description: z.string().optional(),
  skills: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: EmployeeType;
  departmentId: string;
  mode: 'create' | 'edit';
}

export function EmployeeDialog({
  open,
  onOpenChange,
  employee,
  departmentId,
  mode,
}: EmployeeDialogProps) {
  const { addEmployee, updateEmployee } = useOrganizationStore();
  const { toast } = useToast();
  const [rating, setRating] = useState<number>(employee?.rating || 0);

  // Инициализируем форму
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: employee?.name || '',
      surname: employee?.surname || '',
      position: employee?.position || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      photoUrl: employee?.photoUrl || '',
      description: employee?.description || '',
      skills: employee?.skills?.join(', ') || '',
    },
  });

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  // Обработчик отправки формы
  const onSubmit = (data: EmployeeFormValues) => {
    try {
      // Преобразуем строку навыков в массив
      const skills = data.skills
        ? data.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
        : [];

      const employeeData = {
        name: data.name,
        surname: data.surname,
        position: data.position,
        email: data.email,
        phone: data.phone || '',
        photoUrl: data.photoUrl || '',
        description: data.description || '',
        skills,
        rating,
      };

      if (mode === 'create') {
        const newEmployee = addEmployee({
          ...employeeData,
          departmentId,
        });

        toast({
          title: 'Сотрудник создан',
          description: `${newEmployee.name} ${newEmployee.surname} был успешно добавлен в отдел.`,
        });
      } else if (mode === 'edit' && employee) {
        updateEmployee(employee.id, employeeData);

        toast({
          title: 'Сотрудник обновлен',
          description: `Данные ${data.name} ${data.surname} были успешно обновлены.`,
        });
      }

      onOpenChange(false);
      reset();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при сохранении сотрудника.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Добавить сотрудника' : `Редактировать сотрудника: ${employee?.name} ${employee?.surname}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Введите имя сотрудника"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="surname">Фамилия</Label>
              <Input
                id="surname"
                {...register('surname')}
                placeholder="Введите фамилию сотрудника"
              />
              {errors.surname && (
                <p className="text-sm text-red-500">{errors.surname.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Должность</Label>
            <Input
              id="position"
              {...register('position')}
              placeholder="Введите должность сотрудника"
            />
            {errors.position && (
              <p className="text-sm text-red-500">{errors.position.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="photoUrl">Фото (URL)</Label>
            <div className="flex space-x-2">
              <Input
                id="photoUrl"
                {...register('photoUrl')}
                placeholder="Введите URL фотографии сотрудника"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Укажите URL фотографии сотрудника или загрузите изображение
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Введите краткое описание сотрудника"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Рейтинг сотрудника</Label>
            <div className="flex items-center space-x-2 mt-1">
              <EmployeeRating
                rating={rating}
                size="lg"
                onRatingChange={handleRatingChange}
              />
              <span className="text-sm text-muted-foreground ml-2">
                {rating} из 5
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Введите email сотрудника"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="Введите телефон сотрудника (необязательно)"
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Навыки</Label>
            <Textarea
              id="skills"
              {...register('skills')}
              placeholder="Введите навыки сотрудника через запятую"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Например: Excel, Word, Анализ данных, Переговоры
            </p>
            {errors.skills && (
              <p className="text-sm text-red-500">{errors.skills.message}</p>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {mode === 'create' ? 'Создать' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
