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
        weekdays: [],
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
