import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Edit, Trash2, MoveRight } from 'lucide-react';
import type { EmployeeType } from '@/types';
import { EmployeeRating } from './EmployeeRating';
import { useOrganizationStore } from '@/store/organizationStore';

interface EmployeeCardProps {
  employee: EmployeeType;
  onEdit?: () => void;
  onDelete?: () => void;
  onMove?: () => void;
  showRating?: boolean;
  showControls?: boolean;
}

export function EmployeeCard({
  employee,
  onEdit,
  onDelete,
  onMove,
  showRating = true,
  showControls = true
}: EmployeeCardProps) {
  const { updateEmployee } = useOrganizationStore();

  // Получаем инициалы для аватара
  const getInitials = (name: string, surname: string): string => {
    return (name[0] + (surname ? surname[0] : '')).toUpperCase();
  };

  // Генерируем цвет аватара на основе имени
  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
    ];

    // Используем имя для генерации числа и получаем цвет по индексу
    const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const colorIndex = charSum % colors.length;

    return colors[colorIndex];
  };

  const handleRatingChange = (newRating: number) => {
    updateEmployee(employee.id, { rating: newRating });
  };

  return (
    <Card className="w-full max-w-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className={getAvatarColor(employee.name)}>
          {employee.photoUrl ? (
            <AvatarImage src={employee.photoUrl} alt={employee.fullName || employee.name} />
          ) : (
            <AvatarFallback>{getInitials(employee.name, employee.surname)}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg">
            {employee.fullName || `${employee.name} ${employee.surname}`}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{employee.position}</p>

          {showRating && (
            <EmployeeRating
              rating={employee.rating || 0}
              size="sm"
              className="mt-1"
              onRatingChange={handleRatingChange}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          {employee.description && (
            <p className="text-sm text-muted-foreground">{employee.description}</p>
          )}
          <p className="text-sm">
            <span className="font-medium">Email:</span> {employee.email}
          </p>
          {employee.phone && (
            <p className="text-sm">
              <span className="font-medium">Телефон:</span> {employee.phone}
            </p>
          )}
          {employee.skills.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Навыки:</p>
              <div className="flex flex-wrap gap-1">
                {employee.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      {showControls && (
        <CardFooter className="flex justify-between pt-2">
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={onMove}>
            <MoveRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
