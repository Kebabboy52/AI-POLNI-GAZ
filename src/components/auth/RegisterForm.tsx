import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { useOrganizationStore } from '@/store/organizationStore';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

export function RegisterForm({ onLoginClick }: { onLoginClick: () => void }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    firstName: '',
    lastName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { registerUser, loginUser } = useOrganizationStore();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Проверка на совпадение паролей
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      // Регистрация пользователя
      registerUser(
        formData.username,
        formData.password,
        formData.email,
        formData.firstName,
        formData.lastName
      );

      // Автоматический вход после регистрации
      loginUser(formData.username, formData.password);

      toast({
        title: 'Регистрация успешна',
        description: 'Вы успешно зарегистрировались и вошли в систему',
      });
    } catch (error) {
      let errorMessage = 'Произошла ошибка при регистрации';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: 'Ошибка регистрации',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[450px] shadow-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Регистрация</CardTitle>
        <CardDescription className="text-center">
          Создайте новую учетную запись для доступа к системе
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Имя</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Введите имя"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Введите фамилию"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Имя пользователя</Label>
            <Input
              id="username"
              name="username"
              placeholder="Введите имя пользователя"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Введите email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Введите пароль"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Повторите пароль"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-center w-full text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Button variant="link" className="p-0" onClick={onLoginClick}>
            Войти
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
