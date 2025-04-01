import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '@radix-ui/react-label';
import { useOrganizationStore } from '@/store/organizationStore';
import type { DepartmentType } from '@/types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

// Схема валидации для формы отдела
const departmentSchema = z.object({
  name: z.string().min(2, { message: 'Название должно содержать как минимум 2 символа' }),
  description: z.string().min(5, { message: 'Описание должно содержать как минимум 5 символов' }),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: DepartmentType;
  parentId?: string | null;
  mode: 'create' | 'edit';
}

export function DepartmentDialog({
  open,
  onOpenChange,
  department,
  parentId = null,
  mode,
}: DepartmentDialogProps) {
  const { addDepartment, updateDepartment, getDepartmentById } = useOrganizationStore();
  const { toast } = useToast();

  // Определяем уровень нового отдела на основе родителя
  const getNewDepartmentLevel = (): number => {
    if (mode === 'edit' && department) {
      return department.level;
    }

    if (parentId === null) {
      return 1; // Корневой уровень (служба)
    }

    const parent = getDepartmentById(parentId);
    if (parent) {
      return parent.level + 1;
    }

    return 1;
  };

  // Инициализируем форму
  const { register, handleSubmit, formState: { errors }, reset } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name || '',
      description: department?.description || '',
    },
  });

  // Обработчик отправки формы
  const onSubmit = (data: DepartmentFormValues) => {
    try {
      if (mode === 'create') {
        const level = getNewDepartmentLevel();

        // Проверка на максимальный уровень вложенности
        if (level > 3) {
          toast({
            title: 'Ошибка создания отдела',
            description: 'Достигнут максимальный уровень вложенности (3)',
            variant: 'destructive',
          });
          return;
        }

        const newDepartment = addDepartment(data.name, data.description, level, parentId);
        toast({
          title: 'Отдел создан',
          description: `${newDepartment.name} был успешно создан.`,
        });
      } else if (mode === 'edit' && department) {
        updateDepartment(department.id, {
          name: data.name,
          description: data.description
        });
        toast({
          title: 'Отдел обновлен',
          description: `${data.name} был успешно обновлен.`,
        });
      }

      onOpenChange(false);
      reset();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при сохранении отдела.',
        variant: 'destructive',
      });
    }
  };

  // Определяем заголовок и текст кнопки в зависимости от режима
  const getDialogTitle = () => {
    if (mode === 'create') {
      if (parentId === null) {
        return 'Создать службу';
      }

      const parent = getDepartmentById(parentId);
      const level = getNewDepartmentLevel();
      const levelName = level === 2 ? 'отдел' : 'группу';

      return `Создать ${levelName} в "${parent?.name || ''}"`;
    }

    return `Редактировать ${department?.name || 'отдел'}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Введите название отдела"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Введите описание отдела"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
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
