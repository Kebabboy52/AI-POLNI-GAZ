import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { type DepartmentType, type EmployeeType, type OptimizationRecommendationType, type RequestCommentType, RequestStatus, type RequestType, type RequestTypeEnum, type UserType } from '@/types';
import { persist } from 'zustand/middleware';

interface OrganizationState {
  departments: DepartmentType[];
  employees: EmployeeType[];
  requests: RequestType[];
  recommendations: OptimizationRecommendationType[];
  users: UserType[];
  currentUser: UserType | null;

  // Управление пользователями
  registerUser: (username: string, password: string, email: string, firstName?: string, lastName?: string) => UserType;
  loginUser: (username: string, password: string) => UserType | null;
  logoutUser: () => void;
  getCurrentUser: () => UserType | null;

  // Управление отделами
  addDepartment: (name: string, description: string, level: number, parentId: string | null) => DepartmentType;
  updateDepartment: (departmentId: string, data: Partial<DepartmentType>) => void;
  deleteDepartment: (departmentId: string) => void;
  moveDepartment: (departmentId: string, newParentId: string | null) => void;

  // Управление сотрудниками
  addEmployee: (employee: Omit<EmployeeType, 'id'>) => EmployeeType;
  updateEmployee: (employeeId: string, data: Partial<EmployeeType>) => void;
  deleteEmployee: (employeeId: string) => void;
  moveEmployee: (employeeId: string, newDepartmentId: string | null) => void;

  // Управление заявками
  addRequest: (title: string, description: string, type: RequestTypeEnum, createdById: string) => RequestType;
  updateRequestStatus: (requestId: string, status: RequestStatus) => void;
  assignRequest: (requestId: string, departmentId: string, employeeId?: string) => void;
  addRequestComment: (requestId: string, text: string, authorId: string) => RequestCommentType;

  // ИИ-рекомендации
  addRecommendation: (type: 'EMPLOYEE_DISTRIBUTION' | 'WORKLOAD_PREDICTION', description: string, targetDepartmentId: string) => OptimizationRecommendationType;
  implementRecommendation: (recommendationId: string) => void;
  getTopEmployeesForDepartment: (departmentId: string, count?: number) => EmployeeType[];

  // Импорт данных
  importEmployees: (employees: Omit<EmployeeType, 'id'>[]) => void;

  // Вспомогательные методы
  getDepartmentById: (departmentId: string) => DepartmentType | undefined;
  getEmployeeById: (employeeId: string) => EmployeeType | undefined;
  getRequestById: (requestId: string) => RequestType | undefined;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      departments: [],
      employees: [],
      requests: [],
      recommendations: [],
      users: [],
      currentUser: null,

      // Методы для работы с пользователями
      registerUser: (username, password, email, firstName, lastName) => {
        // Проверяем, существует ли пользователь с таким именем
        const existingUser = get().users.find(user => user.username === username);
        if (existingUser) {
          throw new Error('Пользователь с таким именем уже существует');
        }

        const newUser: UserType = {
          id: uuidv4(),
          username,
          password, // В реальном приложении пароль должен быть захеширован
          email,
          firstName,
          lastName,
          role: 'user', // По умолчанию обычный пользователь
          createdAt: new Date(),
        };

        set(state => ({
          users: [...state.users, newUser]
        }));

        return newUser;
      },

      loginUser: (username, password) => {
        const user = get().users.find(
          user => user.username === username && user.password === password
        );

        if (user) {
          set({ currentUser: user });
          return user;
        }

        return null;
      },

      logoutUser: () => {
        set({ currentUser: null });
      },

      getCurrentUser: () => {
        return get().currentUser;
      },

      // Методы для управления отделами
      addDepartment: (name, description, level, parentId) => {
        const newDepartment: DepartmentType = {
          id: uuidv4(),
          name,
          description,
          level,
          parentId,
          employees: [],
          childDepartments: [],
        };

        set((state) => {
          // Если это корневой элемент (служба)
          if (parentId === null) {
            return {
              departments: [...state.departments, newDepartment],
            };
          }

          // Иначе добавляем как подразделение
          const updateDepartmentsWithChildren = (departments: DepartmentType[]): DepartmentType[] => {
            return departments.map((dept) => {
              if (dept.id === parentId) {
                return {
                  ...dept,
                  childDepartments: [...dept.childDepartments, newDepartment],
                };
              }

              if (dept.childDepartments.length > 0) {
                return {
                  ...dept,
                  childDepartments: updateDepartmentsWithChildren(dept.childDepartments),
                };
              }

              return dept;
            });
          };

          return {
            departments: updateDepartmentsWithChildren(state.departments),
          };
        });

        return newDepartment;
      },

      updateDepartment: (departmentId, data) => {
        set((state) => {
          const updateDepartmentsRecursive = (departments: DepartmentType[]): DepartmentType[] => {
            return departments.map((dept) => {
              if (dept.id === departmentId) {
                return {
                  ...dept,
                  ...data,
                  // Сохраняем ссылки на дочерние элементы
                  childDepartments: dept.childDepartments,
                  employees: dept.employees,
                };
              }

              if (dept.childDepartments.length > 0) {
                return {
                  ...dept,
                  childDepartments: updateDepartmentsRecursive(dept.childDepartments),
                };
              }

              return dept;
            });
          };

          return {
            departments: updateDepartmentsRecursive(state.departments),
          };
        });
      },

      deleteDepartment: (departmentId) => {
        set((state) => {
          // Освобождаем сотрудников отдела
          const employeesToUpdate = state.employees.filter(
            (emp) => emp.departmentId === departmentId
          );

          const updatedEmployees = state.employees.map((emp) =>
            emp.departmentId === departmentId
              ? { ...emp, departmentId: null }
              : emp
          );

          // Удаляем отдел рекурсивно
          const filterDepartments = (departments: DepartmentType[]): DepartmentType[] => {
            return departments
              .filter((dept) => dept.id !== departmentId)
              .map((dept) => ({
                ...dept,
                childDepartments: filterDepartments(dept.childDepartments),
              }));
          };

          return {
            departments: filterDepartments(state.departments),
            employees: updatedEmployees,
          };
        });
      },

      moveDepartment: (departmentId, newParentId) => {
        const departmentToMove = get().getDepartmentById(departmentId);
        if (!departmentToMove) return;

        // Сначала извлекаем отдел (клонируем)
        const extractedDepartment: DepartmentType = { ...departmentToMove };

        // Удаляем отдел из прежнего места
        get().deleteDepartment(departmentId);

        set((state) => {
          // Если перемещаем на верхний уровень
          if (newParentId === null) {
            return {
              departments: [...state.departments, extractedDepartment],
            };
          }

          // Иначе добавляем как подразделение
          const updateWithNewParent = (departments: DepartmentType[]): DepartmentType[] => {
            return departments.map((dept) => {
              if (dept.id === newParentId) {
                return {
                  ...dept,
                  childDepartments: [...dept.childDepartments, extractedDepartment],
                };
              }

              if (dept.childDepartments.length > 0) {
                return {
                  ...dept,
                  childDepartments: updateWithNewParent(dept.childDepartments),
                };
              }

              return dept;
            });
          };

          return {
            departments: updateWithNewParent(state.departments),
          };
        });
      },

      // Методы для управления сотрудниками
      addEmployee: (employee) => {
        const id = uuidv4();
        const fullName = `${employee.name} ${employee.surname}`;

        const newEmployee: EmployeeType = {
          ...employee,
          id,
          fullName,
          rating: employee.rating || Math.floor(Math.random() * 5) + 1, // Если рейтинг не указан, генерируем случайный
        };

        set((state) => ({
          employees: [...state.employees, newEmployee],
        }));

        // Если указан отдел, добавляем сотрудника в него
        if (employee.departmentId) {
          get().moveEmployee(id, employee.departmentId);
        }

        return newEmployee;
      },

      updateEmployee: (employeeId, data) => {
        set((state) => {
          const updatedEmployees = state.employees.map((emp) =>
            emp.id === employeeId ? { ...emp, ...data } : emp
          );

          return {
            employees: updatedEmployees,
          };
        });

        // Обновляем сотрудника в отделах
        const employee = get().getEmployeeById(employeeId);
        if (employee && employee.departmentId) {
          set((state) => {
            const updateDepartmentsWithUpdatedEmployee = (departments: DepartmentType[]): DepartmentType[] => {
              return departments.map((dept) => {
                if (dept.id === employee.departmentId) {
                  return {
                    ...dept,
                    employees: dept.employees.map((emp) =>
                      emp.id === employeeId ? { ...emp, ...data } : emp
                    ),
                  };
                }

                if (dept.childDepartments.length > 0) {
                  return {
                    ...dept,
                    childDepartments: updateDepartmentsWithUpdatedEmployee(dept.childDepartments),
                  };
                }

                return dept;
              });
            };

            return {
              departments: updateDepartmentsWithUpdatedEmployee(state.departments),
            };
          });
        }
      },

      deleteEmployee: (employeeId) => {
        const employee = get().getEmployeeById(employeeId);

        set((state) => ({
          employees: state.employees.filter((emp) => emp.id !== employeeId),
        }));

        // Если сотрудник был в отделе, удаляем его оттуда
        if (employee && employee.departmentId) {
          set((state) => {
            const updateDepartmentsWithoutEmployee = (departments: DepartmentType[]): DepartmentType[] => {
              return departments.map((dept) => {
                if (dept.id === employee.departmentId) {
                  return {
                    ...dept,
                    employees: dept.employees.filter((emp) => emp.id !== employeeId),
                  };
                }

                if (dept.childDepartments.length > 0) {
                  return {
                    ...dept,
                    childDepartments: updateDepartmentsWithoutEmployee(dept.childDepartments),
                  };
                }

                return dept;
              });
            };

            return {
              departments: updateDepartmentsWithoutEmployee(state.departments),
            };
          });
        }
      },

      moveEmployee: (employeeId, newDepartmentId) => {
        const employee = get().getEmployeeById(employeeId);
        if (!employee) return;

        // Обновляем информацию о сотруднике
        get().updateEmployee(employeeId, { departmentId: newDepartmentId });

        set((state) => {
          // Если сотрудник был в отделе, удаляем его оттуда
          if (employee.departmentId) {
            const removeFromOldDepartment = (departments: DepartmentType[]): DepartmentType[] => {
              return departments.map((dept) => {
                if (dept.id === employee.departmentId) {
                  return {
                    ...dept,
                    employees: dept.employees.filter((emp) => emp.id !== employeeId),
                  };
                }

                if (dept.childDepartments.length > 0) {
                  return {
                    ...dept,
                    childDepartments: removeFromOldDepartment(dept.childDepartments),
                  };
                }

                return dept;
              });
            };

            return {
              departments: removeFromOldDepartment(state.departments),
            };
          }

          return {};
        });

        // Если перемещаем в новый отдел
        if (newDepartmentId) {
          set((state) => {
            const addToNewDepartment = (departments: DepartmentType[]): DepartmentType[] => {
              return departments.map((dept) => {
                if (dept.id === newDepartmentId) {
                  return {
                    ...dept,
                    employees: [...dept.employees, { ...employee, departmentId: newDepartmentId }],
                  };
                }

                if (dept.childDepartments.length > 0) {
                  return {
                    ...dept,
                    childDepartments: addToNewDepartment(dept.childDepartments),
                  };
                }

                return dept;
              });
            };

            return {
              departments: addToNewDepartment(state.departments),
            };
          });
        }
      },

      // Методы для управления заявками
      addRequest: (title, description, type, createdById) => {
        const newRequest: RequestType = {
          id: uuidv4(),
          title,
          description,
          type,
          status: RequestStatus.NEW,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdById,
          assignedToDepartmentId: '', // Будет определено автоматически или вручную
          comments: [],
        };

        set((state) => ({
          requests: [...state.requests, newRequest],
        }));

        return newRequest;
      },

      updateRequestStatus: (requestId, status) => {
        set((state) => ({
          requests: state.requests.map((req) =>
            req.id === requestId
              ? { ...req, status, updatedAt: new Date() }
              : req
          ),
        }));
      },

      assignRequest: (requestId, departmentId, employeeId) => {
        set((state) => ({
          requests: state.requests.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  assignedToDepartmentId: departmentId,
                  assignedToEmployeeId: employeeId,
                  updatedAt: new Date(),
                  status: req.status === RequestStatus.NEW ? RequestStatus.IN_PROGRESS : req.status,
                }
              : req
          ),
        }));
      },

      addRequestComment: (requestId, text, authorId) => {
        const newComment: RequestCommentType = {
          id: uuidv4(),
          text,
          createdAt: new Date(),
          authorId,
          requestId,
        };

        set((state) => ({
          requests: state.requests.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  comments: [...req.comments, newComment],
                  updatedAt: new Date(),
                }
              : req
          ),
        }));

        return newComment;
      },

      // ИИ-рекомендации
      addRecommendation: (type, description, targetDepartmentId) => {
        const newRecommendation: OptimizationRecommendationType = {
          id: uuidv4(),
          type,
          description,
          targetDepartmentId,
          createdAt: new Date(),
          implemented: false,
        };

        set((state) => ({
          recommendations: [...state.recommendations, newRecommendation],
        }));

        return newRecommendation;
      },

      implementRecommendation: (recommendationId) => {
        set((state) => ({
          recommendations: state.recommendations.map((rec) =>
            rec.id === recommendationId ? { ...rec, implemented: true } : rec
          ),
        }));
      },

      // Импорт данных
      importEmployees: (employeesToImport) => {
        // Создаем новых сотрудников с ID
        const newEmployees = employeesToImport.map((emp) => ({
          ...emp,
          id: uuidv4(),
        }));

        set((state) => ({
          employees: [...state.employees, ...newEmployees],
        }));

        // Добавляем сотрудников в соответствующие отделы
        newEmployees.forEach((employee) => {
          if (employee.departmentId) {
            set((state) => {
              const updateDepartmentsWithEmployee = (departments: DepartmentType[]): DepartmentType[] => {
                return departments.map((dept) => {
                  if (dept.id === employee.departmentId) {
                    return {
                      ...dept,
                      employees: [...dept.employees, employee],
                    };
                  }

                  if (dept.childDepartments.length > 0) {
                    return {
                      ...dept,
                      childDepartments: updateDepartmentsWithEmployee(dept.childDepartments),
                    };
                  }

                  return dept;
                });
              };

              return {
                departments: updateDepartmentsWithEmployee(state.departments),
              };
            });
          }
        });
      },

      // Вспомогательные методы
      getDepartmentById: (departmentId) => {
        const findDepartment = (departments: DepartmentType[]): DepartmentType | undefined => {
          for (const dept of departments) {
            if (dept.id === departmentId) {
              return dept;
            }

            const foundInChildren = findDepartment(dept.childDepartments);
            if (foundInChildren) {
              return foundInChildren;
            }
          }

          return undefined;
        };

        return findDepartment(get().departments);
      },

      getEmployeeById: (employeeId) => {
        return get().employees.find((emp) => emp.id === employeeId);
      },

      getRequestById: (requestId) => {
        return get().requests.find((req) => req.id === requestId);
      },

      // Добавляем метод для получения топ сотрудников
      getTopEmployeesForDepartment: (departmentId, count = 5) => {
        // Находим отдел
        const findDepartmentById = (departments: DepartmentType[], id: string): DepartmentType | undefined => {
          for (const dept of departments) {
            if (dept.id === id) {
              return dept;
            }

            const childDept = findDepartmentById(dept.childDepartments, id);
            if (childDept) {
              return childDept;
            }
          }
          return undefined;
        };

        const department = findDepartmentById(get().departments, departmentId);
        if (!department) {
          return [];
        }

        // Сортируем сотрудников по рейтингу
        const sortedEmployees = [...department.employees].sort((a, b) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return ratingB - ratingA;
        });

        // Возвращаем первые count сотрудников
        return sortedEmployees.slice(0, count);
      },
    }),
    {
      name: 'organization-store', // имя в localStorage
    }
  )
);
