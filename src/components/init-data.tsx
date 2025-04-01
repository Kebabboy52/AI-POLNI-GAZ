'use client';

import { useEffect } from 'react';
import { useOrganizationStore } from '@/store/organizationStore';
import { RequestStatus, RequestTypeEnum } from '@/types';

// Фотографии сотрудников (реальные URL для использования)
const EMPLOYEE_PHOTOS = [
  'https://media.istockphoto.com/id/1300972573/photo/pleasant-young-indian-woman-freelancer-consult-client-via-video-call.jpg?s=612x612&w=0&k=20&c=cbjgWR58DgUUETP6a0kpeiKTCxwJydyvXZXPeNTEOxg=',
  'https://media.istockphoto.com/id/1309328823/photo/headshot-portrait-of-smiling-male-employee-in-office.jpg?s=612x612&w=0&k=20&c=kPvoBm6qCYzQXMAn9JUtqLREXPSFvg_sA9xeKtzsTRk=',
  'https://media.istockphoto.com/id/1338134319/photo/portrait-of-young-businesswoman-working-at-creative-office.jpg?s=612x612&w=0&k=20&c=ufQyw4I8f5XGVQOYGrlwVUUXvWLbfJ_J-iBSfGIXlB4=',
  'https://media.istockphoto.com/id/1300512215/photo/headshot-portrait-of-smiling-ethnic-businessman-in-office.jpg?s=612x612&w=0&k=20&c=QjebAlXBgee05B3rcLDAtOaMtmdLjtZ5Yg9IJoiy-VY=',
  'https://media.istockphoto.com/id/1318858332/photo/headshot-portrait-of-smiling-female-employee-posing-in-office.jpg?s=612x612&w=0&k=20&c=8KxF1WEMGpSdXi-_0-keDt_byjoGiXZWYVzxruLXK-I=',
  'https://media.istockphoto.com/id/1362956007/photo/profile-portrait-of-smiling-businessman-on-gray.jpg?s=612x612&w=0&k=20&c=NpQTH8M2W8zs1_U5-Goa9JQGAuFAF5El9YxTWpWLNZ0=',
  'https://media.istockphoto.com/id/1413766112/photo/successful-mature-businessman-looking-at-camera-with-confidence.jpg?s=612x612&w=0&k=20&c=nWEIpUlevtbV6w1XAWouV5DRoGiVCRXaMU1ZtMIKZ0I=',
  'https://media.istockphoto.com/id/1366605667/photo/young-asian-woman-student-distance-learning-from-home.jpg?s=612x612&w=0&k=20&c=KULGIb4XQ7gxrE5xyXXg9fD4jOUr56sT-ZkXwg9r1e8=',
  'https://media.istockphoto.com/id/1341347261/photo/portrait-of-smiling-caucasian-man-pose-in-office.jpg?s=612x612&w=0&k=20&c=KZM9xJ226Bi1X5jrm3F37rA54WxfYNUv85UaeLsVvYc=',
  'https://media.istockphoto.com/id/1322325912/photo/modern-business-woman-standing-confidently.jpg?s=612x612&w=0&k=20&c=Y5D9IwFyBZ4SrTarxWBjZWeIBNyKGRJ0CAtSRj7GkQw=',
  'https://media.istockphoto.com/id/1324968804/photo/manager-at-a-creative-office.jpg?s=612x612&w=0&k=20&c=VHVp6WV6gQx1IQfm1ZYMEWldZmdmQ7D6NL5RSG87UWg=',
  'https://media.istockphoto.com/id/1344688156/photo/portrait-of-success-businessman-on-white-background.jpg?s=612x612&w=0&k=20&c=Jk1fU0C7m1Gu7GyQPAqXSYYQa13VUv9i4OKD5a8QCbU=',
  'https://media.istockphoto.com/id/1317804597/photo/one-businesswoman-headshot-smiling-at-camera.jpg?s=612x612&w=0&k=20&c=EqR2Lffp4tkIYzpqYh8aYIPRr-gmZliRHR3pexqZiI4=',
  'https://media.istockphoto.com/id/1328085545/photo/portrait-of-a-young-asia-businesswoman-using-laptop-for-online-working-at-office-with-happy.jpg?s=612x612&w=0&k=20&c=qwfJ4u7W6-F4WWDNzkQ5lHHpnm33m3JX3aN9aJapVXI=',
  'https://media.istockphoto.com/id/1365310330/photo/young-beautiful-african-american-afro-businesswoman-smiling-happy.jpg?s=612x612&w=0&k=20&c=V3g7xYXwBCb12bY6Ms2OQIJVVVqVdWRf-c9DL3nwpO4=',
  'https://media.istockphoto.com/id/1346124900/photo/confident-successful-mature-leader-ceo-executive-elegant-middle-aged-asian-businessman-mentor.jpg?s=612x612&w=0&k=20&c=dgnbCginJY9jKoIpxGBBIHOFCbgqxKPQj5Siey0PDXA=',
  'https://media.istockphoto.com/id/1170257859/photo/confident-programmer-working-in-office.jpg?s=612x612&w=0&k=20&c=wqbDtvG7IQi0-1tDQFxJWMvvJDZuNh-NwfjRYMnpxKw=',
  'https://media.istockphoto.com/id/1323990939/photo/close-up-of-smiling-middle-eastern-businessman.jpg?s=612x612&w=0&k=20&c=rvlM5fWIrEVe8jJYIFUfcYlO_rNdx0bbnCbOuNyRV00=',
  'https://media.istockphoto.com/id/1342247162/photo/handsome-middle-eastern-businessman-standing-in-office.jpg?s=612x612&w=0&k=20&c=stpK0Jrz27zfKTbXGNYMnYECknuVlZ_bvPKxm-B_Gmc=',
  'https://media.istockphoto.com/id/1336200142/photo/shot-of-a-young-businesswoman-using-a-digital-tablet-in-a-modern-office.jpg?s=612x612&w=0&k=20&c=QmEg8VJptcP_vT7YkA_YQgD7hiigzhVrSPmMCsYRkBM=',
];

/**
 * Компонент для инициализации тестовых данных при первой загрузке приложения
 */
export function InitData() {
  const {
    departments,
    employees,
    requests,
    recommendations,
    users,
    addDepartment,
    addEmployee,
    addRequest,
    addRecommendation,
    assignRequest,
    registerUser
  } = useOrganizationStore();

  useEffect(() => {
    // Инициализируем тестовые данные только если ещё нет данных
    if (departments.length === 0 && employees.length === 0) {
      // Создаем тестового пользователя для демонстрации
      if(users.length === 0) {
        registerUser(
          'admin',
          'admin123',
          'admin@example.com',
          'Администратор',
          'Системы'
        );
      }

      // Создаем структуру отделов
      const itServiceId = addDepartment(
        'ИТ-служба',
        'Обеспечение информационно-технической поддержки компании',
        1,
        null
      ).id;

      const hrServiceId = addDepartment(
        'Служба персонала',
        'Управление человеческими ресурсами и кадровыми вопросами',
        1,
        null
      ).id;

      const logisticsServiceId = addDepartment(
        'Логистическая служба',
        'Обеспечение логистических операций и закупок',
        1,
        null
      ).id;

      const financeServiceId = addDepartment(
        'Финансовая служба',
        'Управление финансами компании, бухгалтерия, контроль затрат',
        1,
        null
      ).id;

      const marketingServiceId = addDepartment(
        'Маркетинговая служба',
        'Продвижение продуктов компании, исследование рынка, реклама',
        1,
        null
      ).id;

      // Подотделы для ИТ-службы
      const infraDeptId = addDepartment(
        'Отдел инфраструктуры',
        'Обеспечение работы ИТ-инфраструктуры компании',
        2,
        itServiceId
      ).id;

      const devDeptId = addDepartment(
        'Отдел разработки',
        'Разработка и поддержка программного обеспечения',
        2,
        itServiceId
      ).id;

      const supportDeptId = addDepartment(
        'Отдел поддержки',
        'Техническая поддержка пользователей и обслуживание оборудования',
        2,
        itServiceId
      ).id;

      // Добавляем сотрудников (30 человек с фото, описанием и рейтингом)
      // ИТ-служба
      const employee1 = addEmployee({
        name: 'Иван',
        surname: 'Петров',
        position: 'Руководитель ИТ-службы',
        email: 'petrov@example.com',
        phone: '+7 (123) 456-78-90',
        photoUrl: EMPLOYEE_PHOTOS[0],
        description: 'Опытный руководитель с 15-летним стажем в ИТ. Отвечает за стратегическое развитие ИТ-инфраструктуры компании.',
        skills: ['Управление проектами', 'Стратегическое планирование', 'Бюджетирование', 'Agile'],
        departmentId: itServiceId,
        rating: 5
      });

      const employee2 = addEmployee({
        name: 'Алексей',
        surname: 'Сидоров',
        position: 'Руководитель отдела разработки',
        email: 'sidorov@example.com',
        phone: '+7 (123) 456-78-91',
        photoUrl: EMPLOYEE_PHOTOS[1],
        description: 'Ведущий разработчик с опытом более 10 лет. Эксперт в области веб-разработки и архитектуры ПО.',
        skills: ['JavaScript', 'React', 'Node.js', 'Архитектура ПО', 'TypeScript'],
        departmentId: devDeptId,
        rating: 5
      });

      const employee3 = addEmployee({
        name: 'Мария',
        surname: 'Козлова',
        position: 'Старший фронтенд-разработчик',
        email: 'kozlova@example.com',
        phone: '+7 (123) 456-78-92',
        photoUrl: EMPLOYEE_PHOTOS[2],
        description: 'Специалист по пользовательским интерфейсам с творческим подходом к решению задач.',
        skills: ['HTML', 'CSS', 'JavaScript', 'React', 'UI/UX', 'Figma'],
        departmentId: devDeptId,
        rating: 4
      });

      const employee4 = addEmployee({
        name: 'Дмитрий',
        surname: 'Волков',
        position: 'Ведущий бэкенд-разработчик',
        email: 'volkov@example.com',
        phone: '+7 (123) 456-78-93',
        photoUrl: EMPLOYEE_PHOTOS[3],
        description: 'Опытный разработчик серверных приложений и эксперт по базам данных.',
        skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Redis', 'AWS'],
        departmentId: devDeptId,
        rating: 4
      });

      const employee5 = addEmployee({
        name: 'Екатерина',
        surname: 'Новикова',
        position: 'Руководитель инфраструктуры',
        email: 'novikova@example.com',
        phone: '+7 (123) 456-78-94',
        photoUrl: EMPLOYEE_PHOTOS[4],
        description: 'Специалист по сетевым технологиям и серверной инфраструктуре. Обеспечивает стабильную работу всех систем.',
        skills: ['Windows Server', 'Linux', 'VMware', 'Cisco', 'Сетевые технологии'],
        departmentId: infraDeptId,
        rating: 5
      });

      const employee6 = addEmployee({
        name: 'Андрей',
        surname: 'Соколов',
        position: 'Системный администратор',
        email: 'sokolov@example.com',
        phone: '+7 (123) 456-78-95',
        photoUrl: EMPLOYEE_PHOTOS[5],
        description: 'Опытный администратор Windows и Linux систем. Эксперт по автоматизации процессов.',
        skills: ['Windows', 'Linux', 'Active Directory', 'PowerShell', 'Bash', 'Ansible'],
        departmentId: infraDeptId,
        rating: 3
      });

      const employee7 = addEmployee({
        name: 'Игорь',
        surname: 'Кузнецов',
        position: 'Специалист по информационной безопасности',
        email: 'kuznetsov@example.com',
        phone: '+7 (123) 456-78-96',
        photoUrl: EMPLOYEE_PHOTOS[6],
        description: 'Эксперт по защите информации с опытом проведения аудитов безопасности.',
        skills: ['Информационная безопасность', 'Penetration Testing', 'SOC', 'SIEM', 'Шифрование'],
        departmentId: infraDeptId,
        rating: 4
      });

      const employee8 = addEmployee({
        name: 'Анна',
        surname: 'Морозова',
        position: 'QA-инженер',
        email: 'morozova@example.com',
        phone: '+7 (123) 456-78-97',
        photoUrl: EMPLOYEE_PHOTOS[7],
        description: 'Специалист по качеству ПО с опытом автоматизированного и ручного тестирования.',
        skills: ['QA', 'Selenium', 'Автоматизация тестирования', 'Postman', 'Jest', 'Cypress'],
        departmentId: devDeptId,
        rating: 4
      });

      const employee9 = addEmployee({
        name: 'Михаил',
        surname: 'Попов',
        position: 'Мобильный разработчик',
        email: 'popov@example.com',
        phone: '+7 (123) 456-78-98',
        photoUrl: EMPLOYEE_PHOTOS[8],
        description: 'Разработчик мобильных приложений для iOS и Android с опытом создания высоконагруженных приложений.',
        skills: ['iOS', 'Swift', 'Android', 'Kotlin', 'React Native', 'Flutter'],
        departmentId: devDeptId,
        rating: 3
      });

      const employee10 = addEmployee({
        name: 'Ольга',
        surname: 'Лебедева',
        position: 'Руководитель поддержки',
        email: 'lebedeva@example.com',
        phone: '+7 (123) 456-78-99',
        photoUrl: EMPLOYEE_PHOTOS[9],
        description: 'Организует работу службы поддержки, контролирует качество обслуживания пользователей.',
        skills: ['ITIL', 'Управление инцидентами', 'Service Desk', 'Клиентский сервис'],
        departmentId: supportDeptId,
        rating: 5
      });

      const employee11 = addEmployee({
        name: 'Антон',
        surname: 'Орлов',
        position: 'Специалист технической поддержки',
        email: 'orlov@example.com',
        phone: '+7 (123) 456-79-00',
        photoUrl: EMPLOYEE_PHOTOS[10],
        description: 'Оперативно решает технические проблемы пользователей, настраивает рабочие места.',
        skills: ['Техническая поддержка', 'Windows', 'Office 365', 'Helpdesk'],
        departmentId: supportDeptId,
        rating: 4
      });

      const employee12 = addEmployee({
        name: 'Юлия',
        surname: 'Савельева',
        position: 'Фронтенд-разработчик',
        email: 'saveleva@example.com',
        phone: '+7 (123) 456-79-01',
        photoUrl: EMPLOYEE_PHOTOS[11],
        description: 'Разрабатывает современные и удобные пользовательские интерфейсы.',
        skills: ['JavaScript', 'React', 'Vue', 'SCSS', 'Адаптивная верстка'],
        departmentId: devDeptId,
        rating: 3
      });

      const employee13 = addEmployee({
        name: 'Артем',
        surname: 'Галкин',
        position: 'DevOps-инженер',
        email: 'galkin@example.com',
        phone: '+7 (123) 456-79-02',
        photoUrl: EMPLOYEE_PHOTOS[12],
        description: 'Автоматизирует процессы разработки и развертывания, настраивает CI/CD конвейеры.',
        skills: ['Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Terraform', 'AWS'],
        departmentId: devDeptId,
        rating: 5
      });

      const employee14 = addEmployee({
        name: 'Наталья',
        surname: 'Белова',
        position: 'Тестировщик',
        email: 'belova@example.com',
        phone: '+7 (123) 456-79-03',
        photoUrl: EMPLOYEE_PHOTOS[13],
        description: 'Проводит функциональное и регрессионное тестирование приложений, выявляет и документирует ошибки.',
        skills: ['Ручное тестирование', 'TestRail', 'Jira', 'Функциональное тестирование'],
        departmentId: devDeptId,
        rating: 3
      });

      const employee15 = addEmployee({
        name: 'Сергей',
        surname: 'Комаров',
        position: 'Бэкенд-разработчик',
        email: 'komarov@example.com',
        phone: '+7 (123) 456-79-04',
        photoUrl: EMPLOYEE_PHOTOS[14],
        description: 'Разрабатывает надежные и масштабируемые серверные приложения.',
        skills: ['Java', 'Spring', 'Microservices', 'SQL', 'NoSQL', 'REST API'],
        departmentId: devDeptId,
        rating: 4
      });

      // HR сотрудники
      const employee16 = addEmployee({
        name: 'Елена',
        surname: 'Смирнова',
        position: 'Руководитель службы персонала',
        email: 'smirnova@example.com',
        phone: '+7 (123) 456-79-05',
        photoUrl: EMPLOYEE_PHOTOS[15],
        description: 'Стратег в области управления персоналом с опытом создания эффективных HR-процессов.',
        skills: ['Управление персоналом', 'Организационное развитие', 'Трудовое законодательство', 'Compensation & Benefits'],
        departmentId: hrServiceId,
        rating: 5
      });

      const employee17 = addEmployee({
        name: 'Дмитрий',
        surname: 'Борисов',
        position: 'Старший рекрутер',
        email: 'borisov@example.com',
        phone: '+7 (123) 456-79-06',
        photoUrl: EMPLOYEE_PHOTOS[16],
        description: 'Специалист по подбору персонала с опытом найма технических специалистов и руководителей.',
        skills: ['Рекрутинг', 'Проведение интервью', 'HeadHunting', 'Оценка кандидатов'],
        departmentId: hrServiceId,
        rating: 4
      });

      const employee18 = addEmployee({
        name: 'Алина',
        surname: 'Короткова',
        position: 'Специалист по обучению',
        email: 'korotkova@example.com',
        phone: '+7 (123) 456-79-07',
        photoUrl: EMPLOYEE_PHOTOS[17],
        description: 'Разрабатывает и проводит обучающие программы для сотрудников всех уровней.',
        skills: ['Обучение персонала', 'Тренинги', 'Разработка учебных программ', 'Оценка эффективности обучения'],
        departmentId: hrServiceId,
        rating: 4
      });

      // Финансовая служба
      const employee19 = addEmployee({
        name: 'Максим',
        surname: 'Соловьев',
        position: 'Финансовый директор',
        email: 'solovyev@example.com',
        phone: '+7 (123) 456-79-08',
        photoUrl: EMPLOYEE_PHOTOS[18],
        description: 'Опытный финансист с международным опытом работы. Эксперт в области финансового планирования и анализа.',
        skills: ['Финансовый анализ', 'Бюджетирование', 'Управленческий учет', 'Инвестиционный анализ'],
        departmentId: financeServiceId,
        rating: 5
      });

      const employee20 = addEmployee({
        name: 'Ирина',
        surname: 'Зайцева',
        position: 'Главный бухгалтер',
        email: 'zaitseva@example.com',
        phone: '+7 (123) 456-79-09',
        photoUrl: EMPLOYEE_PHOTOS[19],
        description: 'Высококвалифицированный специалист в области бухгалтерского учета и налогообложения.',
        skills: ['Бухгалтерский учет', 'Налоговая отчетность', '1С', 'МСФО', 'Налоговое планирование'],
        departmentId: financeServiceId,
        rating: 4
      });

      const employee21 = addEmployee({
        name: 'Виктор',
        surname: 'Козлов',
        position: 'Финансовый аналитик',
        email: 'kozlov@example.com',
        phone: '+7 (123) 456-79-10',
        photoUrl: EMPLOYEE_PHOTOS[0],
        description: 'Проводит комплексный финансовый анализ и подготавливает аналитические отчеты для руководства.',
        skills: ['Финансовое моделирование', 'Excel', 'Power BI', 'Аналитика', 'Прогнозирование'],
        departmentId: financeServiceId,
        rating: 3
      });

      // Логистическая служба
      const employee22 = addEmployee({
        name: 'Николай',
        surname: 'Титов',
        position: 'Руководитель логистики',
        email: 'titov@example.com',
        phone: '+7 (123) 456-79-11',
        photoUrl: EMPLOYEE_PHOTOS[1],
        description: 'Специалист по оптимизации логистических процессов и управлению цепями поставок.',
        skills: ['Логистика', 'Управление цепями поставок', 'Транспортная логистика', 'Склад'],
        departmentId: logisticsServiceId,
        rating: 4
      });

      const employee23 = addEmployee({
        name: 'Юрий',
        surname: 'Федоров',
        position: 'Специалист по закупкам',
        email: 'fedorov@example.com',
        phone: '+7 (123) 456-79-12',
        photoUrl: EMPLOYEE_PHOTOS[2],
        description: 'Отвечает за организацию процесса закупок и взаимодействие с поставщиками.',
        skills: ['Закупки', 'Тендеры', 'Переговоры', 'Анализ рынка', 'Договоры'],
        departmentId: logisticsServiceId,
        rating: 3
      });

      // Маркетинговая служба
      const employee24 = addEmployee({
        name: 'Вероника',
        surname: 'Павлова',
        position: 'Директор по маркетингу',
        email: 'pavlova@example.com',
        phone: '+7 (123) 456-79-13',
        photoUrl: EMPLOYEE_PHOTOS[3],
        description: 'Руководит маркетинговыми кампаниями компании, разрабатывает стратегии продвижения продуктов.',
        skills: ['Маркетинговая стратегия', 'Брендинг', 'Маркетинговые исследования', 'Product Marketing'],
        departmentId: marketingServiceId,
        rating: 5
      });

      const employee25 = addEmployee({
        name: 'Денис',
        surname: 'Никитин',
        position: 'Руководитель цифрового маркетинга',
        email: 'nikitin@example.com',
        phone: '+7 (123) 456-79-14',
        photoUrl: EMPLOYEE_PHOTOS[4],
        description: 'Эксперт по цифровому маркетингу с опытом проведения успешных кампаний в различных каналах.',
        skills: ['Digital Marketing', 'SEO', 'PPC', 'SMM', 'Email-маркетинг', 'Аналитика'],
        departmentId: marketingServiceId,
        rating: 4
      });

      const employee26 = addEmployee({
        name: 'Светлана',
        surname: 'Громова',
        position: 'SMM-специалист',
        email: 'gromova@example.com',
        phone: '+7 (123) 456-79-15',
        photoUrl: EMPLOYEE_PHOTOS[5],
        description: 'Создает и реализует стратегии продвижения в социальных сетях, работает с контентом.',
        skills: ['SMM', 'Контент-маркетинг', 'Копирайтинг', 'Таргетированная реклама'],
        departmentId: marketingServiceId,
        rating: 3
      });

      const employee27 = addEmployee({
        name: 'Александр',
        surname: 'Григорьев',
        position: 'Специалист по контекстной рекламе',
        email: 'grigoriev@example.com',
        phone: '+7 (123) 456-79-16',
        photoUrl: EMPLOYEE_PHOTOS[6],
        description: 'Настраивает и оптимизирует рекламные кампании в Яндекс.Директ и Google Ads.',
        skills: ['Контекстная реклама', 'Яндекс.Директ', 'Google Ads', 'Аналитика', 'Ретаргетинг'],
        departmentId: marketingServiceId,
        rating: 4
      });

      const employee28 = addEmployee({
        name: 'Полина',
        surname: 'Яковлева',
        position: 'PR-менеджер',
        email: 'yakovleva@example.com',
        phone: '+7 (123) 456-79-17',
        photoUrl: EMPLOYEE_PHOTOS[7],
        description: 'Организует взаимодействие со СМИ, формирует и поддерживает имидж компании.',
        skills: ['PR', 'Работа со СМИ', 'Копирайтинг', 'Организация мероприятий'],
        departmentId: marketingServiceId,
        rating: 5
      });

      const employee29 = addEmployee({
        name: 'Тимур',
        surname: 'Измайлов',
        position: 'Графический дизайнер',
        email: 'izmailov@example.com',
        phone: '+7 (123) 456-79-18',
        photoUrl: EMPLOYEE_PHOTOS[8],
        description: 'Создает визуальные материалы для маркетинговых кампаний и корпоративных коммуникаций.',
        skills: ['Графический дизайн', 'Adobe Photoshop', 'Adobe Illustrator', 'Брендинг', 'Типографика'],
        departmentId: marketingServiceId,
        rating: 4
      });

      const employee30 = addEmployee({
        name: 'Евгения',
        surname: 'Макарова',
        position: 'Контент-менеджер',
        email: 'makarova@example.com',
        phone: '+7 (123) 456-79-19',
        photoUrl: EMPLOYEE_PHOTOS[9],
        description: 'Разрабатывает контент-стратегию и создает качественный контент для различных каналов коммуникации.',
        skills: ['Контент-маркетинг', 'Копирайтинг', 'Редактирование', 'SEO-оптимизация', 'Storytelling'],
        departmentId: marketingServiceId,
        rating: 3
      });

      // Создаем тестовые заявки
      const request1 = addRequest(
        'Не работает компьютер',
        'Компьютер не включается. После нажатия на кнопку питания не происходит ничего.',
        RequestTypeEnum.IT,
        employee16.id
      );

      const request2 = addRequest(
        'Требуется новый сотрудник',
        'Необходимо открыть вакансию на должность менеджера по продажам. Требуется опыт от 2 лет.',
        RequestTypeEnum.HR,
        employee1.id
      );

      const request3 = addRequest(
        'Заказ канцтоваров',
        'Требуется заказать канцелярские товары для офиса: бумага, ручки, карандаши, степлеры.',
        RequestTypeEnum.LOGISTICS,
        employee5.id
      );

      const request4 = addRequest(
        'Настройка VPN для удаленного сотрудника',
        'Необходимо настроить VPN для нового удаленного сотрудника отдела маркетинга.',
        RequestTypeEnum.IT,
        employee24.id
      );

      const request5 = addRequest(
        'Проблема с корпоративной почтой',
        'Не приходят письма от внешних адресатов. Проблема наблюдается с утра.',
        RequestTypeEnum.IT,
        employee19.id
      );

      const request6 = addRequest(
        'Необходимо организовать обучение',
        'Требуется организовать курс повышения квалификации для сотрудников бухгалтерии по изменениям в законодательстве.',
        RequestTypeEnum.HR,
        employee20.id
      );

      // Назначаем заявки на отделы
      assignRequest(request1.id, infraDeptId, employee6.id);
      assignRequest(request2.id, hrServiceId, employee17.id);
      assignRequest(request3.id, logisticsServiceId, employee22.id);
      assignRequest(request4.id, supportDeptId, employee11.id);
      assignRequest(request5.id, infraDeptId, employee6.id);
      assignRequest(request6.id, hrServiceId, employee18.id);

      // Добавляем рекомендации от ИИ
      addRecommendation(
        'EMPLOYEE_DISTRIBUTION',
        'Рекомендуется добавить еще одного сотрудника в группу фронтенд-разработки для более равномерного распределения задач. Текущая нагрузка на отдел превышает оптимальную на 25%.',
        devDeptId
      );

      addRecommendation(
        'EMPLOYEE_DISTRIBUTION',
        'Рекомендуется перераспределить специалистов между отделом инфраструктуры и поддержки для оптимизации рабочих процессов. Текущий анализ показывает избыточную нагрузку в отделе поддержки.',
        supportDeptId
      );

      addRecommendation(
        'WORKLOAD_PREDICTION',
        'Прогнозируется увеличение количества заявок для ИТ-службы на 15% в следующем месяце в связи с планируемым переездом офиса. Рекомендуется подготовить дополнительные ресурсы.',
        itServiceId
      );

      addRecommendation(
        'WORKLOAD_PREDICTION',
        'В течение следующих 2-х недель ожидается увеличение нагрузки на отдел финансового планирования в связи с подготовкой квартального отчета. Рекомендуется временно привлечь еще одного специалиста.',
        financeServiceId
      );

      addRecommendation(
        'EMPLOYEE_DISTRIBUTION',
        'Анализ структуры команды показывает нехватку специалистов по тестированию. Рекомендуется усилить группу тестирования дополнительным QA-инженером для обеспечения качества разрабатываемого ПО.',
        devDeptId
      );
    }
  }, [
    departments.length,
    employees.length,
    users.length,
    addDepartment,
    addEmployee,
    addRequest,
    addRecommendation,
    assignRequest,
    registerUser
  ]);

  // Этот компонент не отображает никаких элементов интерфейса
  return null;
}
