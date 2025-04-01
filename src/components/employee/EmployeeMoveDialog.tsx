import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { useOrganizationStore } from '@/store/organizationStore';
import type { DepartmentType, EmployeeType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@radix-ui/react-label';

interface EmployeeMoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: EmployeeType;
  currentDepartmentId: string;
}

export function EmployeeMoveDialog({
  open,
  onOpenChange,
  employee,
  currentDepartmentId,
}: EmployeeMoveDialogProps) {
  const { departments, moveEmployee } = useOrganizationStore();
  const { toast } = useToast();

  // Состояние для выбранного отдела
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);

  // Плоский список отделов для выбора
  const [flatDepartments, setFlatDepartments] = useState<{id: string; name: string; level: number}[]>([]);

  // Преобразуем вложенную структуру отделов в плоский список для выбора
  useEffect(() => {
    const flattenDepartments = (departments: DepartmentType[], result: any[] = []) => {
      for (const dept of departments) {
        result.push({
          id: dept.id,
          name: dept.name,
          level: dept.level,
        });

        if (dept.childDepartments.length > 0) {
          flattenDepartments(dept.childDepartments, result);
        }
      }
      return result;
    };

    setFlatDepartments(flattenDepartments(departments).filter(dept => dept.id !== currentDepartmentId));
  }, [departments, currentDepartmentId]);

  const handleMove = () => {
    if (!selectedDepartmentId) {
      toast({
        title: 'Ошибка',
        description: 'Выберите отдел для перемещения сотрудника.',
        variant: 'destructive',
      });
      return;
    }

    moveEmployee(employee.id, selectedDepartmentId);

    toast({
      title: 'Сотрудник перемещен',
      description: `${employee.name} был успешно перемещен в другой отдел.`,
    });

    onOpenChange(false);
  };

  // Получаем метку уровня отдела
  const getDepartmentLevelLabel = (level: number) => {
    switch (level) {
      case 1:
        return 'Служба';
      case 2:
        return 'Отдел';
      case 3:
        return 'Группа';
      default:
        return 'Подразделение';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Переместить сотрудника</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4">
            <p className="font-medium">Сотрудник: {employee.name}</p>
            <p className="text-sm text-muted-foreground">
              Текущий отдел: {departments.flatMap(d => [...d.childDepartments, d]).find(d => d.id === currentDepartmentId)?.name}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Выберите новый отдел</Label>
            {flatDepartments.length > 0 ? (
              <Select
                onValueChange={(value) => setSelectedDepartmentId(value)}
                value={selectedDepartmentId || undefined}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Выберите отдел" />
                </SelectTrigger>
                <SelectContent>
                  {flatDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({getDepartmentLevelLabel(dept.level)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">Нет доступных отделов для перемещения</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            type="button"
            onClick={handleMove}
            disabled={!selectedDepartmentId || flatDepartments.length === 0}
          >
            Переместить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
