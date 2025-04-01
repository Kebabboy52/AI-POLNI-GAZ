import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { useOrganizationStore } from '@/store/organizationStore';
import { Badge } from '../ui/badge';
import { EmployeeCard } from '../employee/EmployeeCard';
import { TrophyIcon } from 'lucide-react';

export function TopEmployees() {
  const { departments, getTopEmployeesForDepartment } = useOrganizationStore();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [topEmployees, setTopEmployees] = useState<any[]>([]);

  // Получаем плоский список всех отделов
  const flattenedDepartments = React.useMemo(() => {
    const result: { id: string; name: string; level: number }[] = [];

    const flatten = (departments: any[]) => {
      for (const dept of departments) {
        result.push({
          id: dept.id,
          name: dept.name,
          level: dept.level,
        });

        if (dept.childDepartments && dept.childDepartments.length > 0) {
          flatten(dept.childDepartments);
        }
      }
    };

    flatten(departments);
    return result;
  }, [departments]);

  // Обновляем топ сотрудников при изменении выбранного отдела
  useEffect(() => {
    if (selectedDepartmentId) {
      const employees = getTopEmployeesForDepartment(selectedDepartmentId, 5);
      setTopEmployees(employees);
    } else {
      setTopEmployees([]);
    }
  }, [selectedDepartmentId, getTopEmployeesForDepartment]);

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartmentId(value);
  };

  // Получаем название уровня отдела
  const getLevelName = (level: number): string => {
    switch (level) {
      case 1:
        return 'Служба';
      case 2:
        return 'Отдел';
      case 3:
        return 'Группа';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <TrophyIcon className="h-6 w-6 text-yellow-500" />
          <CardTitle>Топ сотрудников</CardTitle>
        </div>
        <CardDescription>
          Выберите отдел, чтобы увидеть его лучших сотрудников, отсортированных по рейтингу
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="department">Выберите отдел</Label>
          <Select onValueChange={handleDepartmentChange} value={selectedDepartmentId}>
            <SelectTrigger id="department">
              <SelectValue placeholder="Выберите отдел" />
            </SelectTrigger>
            <SelectContent>
              {flattenedDepartments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  <div className="flex items-center gap-2">
                    <span>{dept.name}</span>
                    <Badge variant="outline">{getLevelName(dept.level)}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {topEmployees.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Лучшие сотрудники:</h3>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {topEmployees.map((employee, index) => (
                <div key={employee.id} className="relative">
                  {index < 3 && (
                    <div className="absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      #{index + 1}
                    </div>
                  )}
                  <EmployeeCard employee={employee} showControls={false} />
                </div>
              ))}
            </div>
          </div>
        ) : selectedDepartmentId ? (
          <div className="text-center py-8 text-muted-foreground">
            В выбранном отделе нет сотрудников
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Выберите отдел, чтобы увидеть топ сотрудников
          </div>
        )}
      </CardContent>
    </Card>
  );
}
