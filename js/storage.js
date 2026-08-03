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
    faculties: [],
    routine: {
        weekdays: [
            { id: 'r1', time: '06:30', title: 'Acordar' },
            { id: 'r2', time: '06:30–07:00', title: 'Higiene' },
            { id: 'r3', time: '07:00–08:20', title: 'Ônibus • Estudo leve' },
            { id: 'r4', time: '08:30–12:00', title: 'Trabalho' },
            { id: 'r5', time: '12:00–13:00', title: 'Almoço • Leitura técnica' },
            { id: 'r6', time: '13:00–18:30', title: 'Trabalho' },
            { id: 'r7', time: '18:30–20:00', title: 'Ônibus • Vídeos • Podcasts • Leitura' },
            { id: 'r8', time: '20:00–20:40', title: 'Banho' },
            { id: 'r9', time: '20:40–21:40', title: 'Estudo profundo' },
            { id: 'r10', time: '21:40–22:10', title: 'Exercícios' },
            { id: 'r11', time: '22:10–22:30', title: 'Planejamento' },
            { id: 'r12', time: '22:30', title: 'Dormir' }
        ],
        saturday: [],
        sunday: []
    },
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
    kanban: []
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
