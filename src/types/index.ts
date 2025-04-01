export type EmployeeType = {
  id: string;
  name: string;
  surname: string; // Добавляем фамилию
  fullName?: string; // Полное имя (будет вычисляться)
  position: string;
  email: string;
  phone?: string;
  photoUrl?: string; // URL фотографии сотрудника
  description?: string; // Описание сотрудника
  rating?: number; // Рейтинг сотрудника (1-5)
  skills: string[];
  departmentId: string | null;
};

export type DepartmentType = {
  id: string;
  name: string;
  description: string;
  level: number; // 1 - служба, 2 - отдел, 3 - группа
  parentId: string | null;
  employees: EmployeeType[];
  childDepartments: DepartmentType[];
};

export enum RequestTypeEnum {
  IT = "IT",
  HR = "HR",
  LOGISTICS = "ЛОГИСТИКА",
}

export enum RequestStatus {
  NEW = "НОВАЯ",
  IN_PROGRESS = "В РАБОТЕ",
  COMPLETED = "ЗАВЕРШЕНА",
  REJECTED = "ОТКЛОНЕНА",
}

export type RequestType = {
  id: string;
  title: string;
  description: string;
  type: RequestTypeEnum;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  assignedToDepartmentId: string;
  assignedToEmployeeId?: string;
  comments: RequestCommentType[];
};

export type RequestCommentType = {
  id: string;
  text: string;
  createdAt: Date;
  authorId: string;
  requestId: string;
};

export type OptimizationRecommendationType = {
  id: string;
  type: "EMPLOYEE_DISTRIBUTION" | "WORKLOAD_PREDICTION";
  description: string;
  targetDepartmentId: string;
  createdAt: Date;
  implemented: boolean;
};

// Новый тип для пользователя системы
export type UserType = {
  id: string;
  username: string;
  password: string; // В реальном приложении здесь должен быть хеш пароля
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user'; // Роль пользователя
  createdAt: Date;
};
