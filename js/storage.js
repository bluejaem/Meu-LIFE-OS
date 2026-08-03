const STORAGE_KEY = 'plannerTiLifeOsData';
export const defaultData = {
    settings: {
        theme: 'light',
        accent: '#2563eb'
    },
    hours: {
        today: 0,
        week: 0,
        month: 0,
        streak: 0,
        dailyGoal: 4,
        weeklyGoal: 20,
        monthlyGoal: 80
    },
    events: [],
    tasks: [],
    faculties: [
        {
            id: 'eng',
            name: 'Engenharia da Computação',
            disciplines: [
                {id:'eng1', name:'Programação Avançada', grade: 8.8, attendance: 92},
                {id:'eng2', name:'Circuitos Digitais', grade: 7.4, attendance: 88}
            ]
        }
    ],
    books: [],
    goals: [],
    certifications: [],
    diary: [],
    pomodoro: {
        minutes: 25,
        activeSessions: 0,
        running: false,
        remainingSeconds: 1500
    },
    kanban: [
        { id: 'card1', title: 'Planejar roteiro', status: 'backlog', description: 'Definir etapas iniciais do projeto.' },
        { id: 'card2', title: 'Criar protótipo', status: 'doing', description: 'Protótipo visual do dashboard.' },
        { id: 'card3', title: 'Revisar deploy', status: 'done', description: 'Testar deployment local e ajustes.' }
    ]
};

export const loadStorage = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        saveStorage(defaultData);
        return structuredClone(defaultData);
    }
    try {
        const parsed = JSON.parse(raw);
        return {...defaultData, ...parsed};
    } catch (error) {
        console.error('Falha ao ler storage', error);
        saveStorage(defaultData);
        return structuredClone(defaultData);
    }
};

export const saveStorage = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
};
