import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { useOrganizationStore } from '@/store/organizationStore';
import { useToast } from '@/hooks/use-toast';
import { User } from 'lucide-react';

export function LoginForm({ onRegisterClick }: { onRegisterClick: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser } = useOrganizationStore();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = loginUser(username, password);

      if (user) {
        toast({
          title: 'Успешный вход',
          description: `Добро пожаловать, ${user.firstName || user.username}!`,
        });
      } else {
        toast({
          title: 'Ошибка входа',
          description: 'Неверное имя пользователя или пароль',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при входе в систему',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Вход в систему</CardTitle>
        <CardDescription className="text-center">
          Введите свои данные для входа в систему
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Имя пользователя</Label>
            <Input
              id="username"
              placeholder="Введите имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-sm text-center text-muted-foreground">
          Еще нет аккаунта?{' '}
          <Button variant="link" className="p-0" onClick={onRegisterClick}>
            Зарегистрируйтесь
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
