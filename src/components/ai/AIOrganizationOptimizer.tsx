import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useOrganizationStore } from '@/store/organizationStore';
import { useToast } from '@/hooks/use-toast';
import { generateEmployeeDistributionRecommendation, generateWorkloadPrediction } from '@/lib/nlp';
import { Label } from '../ui/label';
import { Brain, LineChart, Medal, Trophy, UserSquare2 } from 'lucide-react';
import { EmployeeCard } from '../employee/EmployeeCard';
import { EmployeeType } from '@/types';

export function AIOrganizationOptimizer() {
  const { departments, recommendations, addRecommendation, implementRecommendation, getTopEmployeesForDepartment } = useOrganizationStore();
  const { toast } = useToast();

  // Состояние для выбранного департамента и типа оптимизации
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [optimizationType, setOptimizationType] = useState<string>('EMPLOYEE_DISTRIBUTION');
  const [isGenerating, setIsGenerating] = useState(false);
  const [topEmployees, setTopEmployees] = useState<EmployeeType[]>([]);

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

  // Обновляем список топ сотрудников при изменении выбранного отдела
  useEffect(() => {
    if (selectedDepartmentId) {
      const employees = getTopEmployeesForDepartment(selectedDepartmentId, 5);
      setTopEmployees(employees);
    } else {
      setTopEmployees([]);
    }
  }, [selectedDepartmentId, getTopEmployeesForDepartment]);

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

  // Генерация рекомендации
  const handleGenerateRecommendation = () => {
    if (!selectedDepartmentId) {
      toast({
        title: 'Выберите отдел',
        description: 'Для генерации рекомендации необходимо выбрать отдел.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      let recommendationText = '';

      // Выполняем "анализ" в зависимости от типа оптимизации
      if (optimizationType === 'EMPLOYEE_DISTRIBUTION') {
        // Имитация анализа распределения сотрудников
        // В реальном приложении здесь был бы запрос к модели ИИ
        recommendationText = generateEmployeeDistributionRecommendation(
          selectedDepartmentId,
          [] // В реальном приложении здесь были бы данные о навыках сотрудников
        );
      } else {
        // Имитация прогнозирования загрузки
        recommendationText = generateWorkloadPrediction(
          selectedDepartmentId,
          [] // В реальном приложении здесь была бы история заявок
        );
      }

      // Сохраняем рекомендацию в хранилище
      const newRecommendation = addRecommendation(
        optimizationType as 'EMPLOYEE_DISTRIBUTION' | 'WORKLOAD_PREDICTION',
        recommendationText,
        selectedDepartmentId
      );

      toast({
        title: 'Рекомендация сгенерирована',
        description: 'Новая рекомендация по оптимизации была успешно создана.',
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сгенерировать рекомендацию. Пожалуйста, попробуйте еще раз.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Внедрение рекомендации
  const handleImplementRecommendation = (recommendationId: string) => {
    implementRecommendation(recommendationId);
    toast({
      title: 'Рекомендация внедрена',
      description: 'Статус рекомендации изменен на "Внедрена".',
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-6 w-6 text-primary" />
            <CardTitle>ИИ-оптимизация структуры</CardTitle>
          </div>
          <CardDescription>
            Получите рекомендации по оптимизации организационной структуры на основе ИИ-анализа
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="department">Выберите отдел для анализа</Label>
            <Select onValueChange={setSelectedDepartmentId} value={selectedDepartmentId}>
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

          <div className="space-y-2">
            <Label htmlFor="optimization-type">Тип оптимизации</Label>
            <Select onValueChange={setOptimizationType} value={optimizationType}>
              <SelectTrigger id="optimization-type">
                <SelectValue placeholder="Выберите тип оптимизации" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMPLOYEE_DISTRIBUTION">
                  <div className="flex items-center gap-2">
                    <UserSquare2 className="h-4 w-4" />
                    <span>Распределение сотрудников</span>
                  </div>
                </SelectItem>
                <SelectItem value="WORKLOAD_PREDICTION">
                  <div className="flex items-center gap-2">
                    <LineChart className="h-4 w-4" />
                    <span>Прогноз загрузки</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerateRecommendation}
            className="w-full mt-4"
            disabled={isGenerating || !selectedDepartmentId}
          >
            {isGenerating ? 'Генерация...' : 'Сгенерировать рекомендацию'}
          </Button>
        </CardContent>

        <CardHeader className="pt-0">
          <CardTitle className="text-lg">Существующие рекомендации</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.length > 0 ? (
            <div className="space-y-4">
              {recommendations.map((rec) => {
                const department = flattenedDepartments.find((d) => d.id === rec.targetDepartmentId);

                return (
                  <div key={rec.id} className="p-4 border rounded-lg">
                    <div className="flex gap-2 items-center mb-2">
                      {rec.type === 'EMPLOYEE_DISTRIBUTION' ? (
                        <UserSquare2 className="h-4 w-4 text-primary" />
                      ) : (
                        <LineChart className="h-4 w-4 text-primary" />
                      )}
                      <h4 className="font-medium">
                        {rec.type === 'EMPLOYEE_DISTRIBUTION'
                          ? 'Распределение сотрудников'
                          : 'Прогноз загрузки'}
                      </h4>
                      {rec.implemented && (
                        <Badge variant="success" className="ml-auto bg-green-500 text-white">
                          Внедрено
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Отдел:</span>
                        <Badge variant="outline">
                          {department ? department.name : 'Неизвестный отдел'}
                        </Badge>
                      </div>
                      {!rec.implemented && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleImplementRecommendation(rec.id)}
                        >
                          Внедрить
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Нет рекомендаций. Создайте новую рекомендацию, выбрав отдел и тип оптимизации.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <CardTitle>Топ сотрудников отдела</CardTitle>
          </div>
          <CardDescription>
            Лучшие сотрудники выбранного отдела, отсортированные по рейтингу
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topEmployees.length > 0 ? (
            <div className="space-y-6">
              {topEmployees.map((employee, index) => (
                <div key={employee.id} className="relative">
                  {index < 3 && (
                    <div className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      #{index + 1}
                    </div>
                  )}
                  <EmployeeCard employee={employee} showControls={false} />
                </div>
              ))}
            </div>
          ) : selectedDepartmentId ? (
            <div className="text-center py-16 text-muted-foreground">
              В выбранном отделе нет сотрудников
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              Выберите отдел, чтобы увидеть его лучших сотрудников
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
