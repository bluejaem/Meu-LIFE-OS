import { createChartBars } from './utils.js';
const dayOrder = { SEG: 1, TER: 2, QUA: 3, QUI: 4, SEX: 5, SAB: 6, DOM: 7 };
const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
const parseTimeToMinutes = (time) => {
    const match = time?.match(/(\d{2}):(\d{2})/);
    return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
};
const getRelativeEventValue = (event) => {
    const now = new Date();
    const currentDay = dayNames[now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const eventMinutes = parseTimeToMinutes(event.time || '00:00');
    let dayOffset = dayOrder[event.day] - dayOrder[currentDay];
    if (dayOffset < 0) dayOffset += 7;
    if (dayOffset === 0 && eventMinutes <= currentMinutes) dayOffset = 7;
    return dayOffset * 1440 + eventMinutes;
};
const getNextEvent = (events, filter = () => true) => {
    return events
        .filter(filter)
        .sort((a, b) => getRelativeEventValue(a) - getRelativeEventValue(b))[0];
};
const getSoonestTask = (tasks) => {
    const today = new Date().toISOString().slice(0, 10);
    return tasks
        .filter((task) => task.dueDate && task.dueDate >= today)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.createdAt - b.createdAt)[0];
};
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia, João';
    if (hour < 18) return 'Boa tarde, João';
    return 'Boa noite, João';
};
const formatEventSummary = (event) => `${event.title} • ${event.day} ${event.time}`;
const isExamEvent = (event) => /prova|exame|teste|avaliação|avaliac/i.test(event.title || '') || event.category === 'faculdade' && /prova|exame|teste/i.test(event.title || '');
const isClassEvent = (event) => event.category === 'faculdade' || /aula|seminário|palestra|laboratório/i.test(event.title || '');
export const refreshDashboard = (data) => {
    document.getElementById('dashboardGreeting').textContent = getGreeting();
    document.getElementById('todayHours').textContent = `${data.hours.today} h`;
    document.getElementById('weeklyHours').textContent = `${data.hours.week} h`;
    document.getElementById('monthlyHours').textContent = `${data.hours.month} h`;
    document.getElementById('streakDays').textContent = `${data.hours.streak} dias`;
    document.getElementById('dailyGoalLabel').textContent = `${data.hours.dailyGoal}h`;
    document.getElementById('weeklyGoalLabel').textContent = `${data.hours.weeklyGoal}h`;
    document.getElementById('monthlyGoalLabel').textContent = `${data.hours.monthlyGoal}h`;
    const nextEvent = getNextEvent(data.events);
    const nextTask = getSoonestTask(data.tasks);
    const nextActivityLabel = nextEvent ? formatEventSummary(nextEvent) : nextTask ? `Tarefa: ${nextTask.title} até ${nextTask.dueDate}` : 'Sem atividade agendada';
    document.getElementById('nextActivity').textContent = nextActivityLabel;
    const nextExam = getNextEvent(data.events, isExamEvent);
    document.getElementById('nextExam').textContent = nextExam ? formatEventSummary(nextExam) : 'Nenhuma prova cadastrada';
    const nextClass = getNextEvent(data.events, isClassEvent);
    document.getElementById('nextClass').textContent = nextClass ? formatEventSummary(nextClass) : 'Sem aula marcada';

    const remaining = data.hours.dailyGoal - data.hours.today;
    document.getElementById('remainingGoal').textContent = remaining <= 0 ? 'Meta diária alcançada' : `Faltam ${remaining}h para a meta`; 

    const recentEvents = document.getElementById('dashboardRecentEvents');
    const recentTasks = document.getElementById('dashboardRecentTasks');
    recentEvents.innerHTML = '';
    recentTasks.innerHTML = '';
    data.events.slice(-4).reverse().forEach((event) => {
        const item = document.createElement('li');
        item.innerHTML = `<strong>${event.title}</strong><span>${event.day} • ${event.time}</span>`;
        recentEvents.appendChild(item);
    });
    data.tasks.slice(-4).reverse().forEach((task) => {
        const item = document.createElement('li');
        item.innerHTML = `<strong>${task.title}</strong><span>${task.category} • ${task.priority}</span>`;
        recentTasks.appendChild(item);
    });
    const routineCount = (data.routine?.weekdays?.length || 0) + (data.routine?.saturday?.length || 0) + (data.routine?.sunday?.length || 0);
    const routinePreview = data.routine?.weekdays?.length
        ? `${data.routine.weekdays.length} itens de segunda a sexta`
        : 'Sem rotina diária configurada';
    document.getElementById('dashboardRoutineCount').textContent = `${routineCount} ações`;
    document.getElementById('dashboardRoutinePreview').textContent = routinePreview;
    document.getElementById('statOpenTasks').textContent = `${data.tasks.filter((task) => !task.done).length}`;
    document.getElementById('statEvents').textContent = `${data.events.length}`;
    document.getElementById('statProjects').textContent = `${data.kanban.length}`;
    document.getElementById('sideTaskCount').textContent = `${data.tasks.length}`;
    document.getElementById('sideEventCount').textContent = `${data.events.length}`;
    document.getElementById('sideGoalCount').textContent = `${data.goals.length}`;
    document.getElementById('sideProjectCount').textContent = `${data.kanban.length}`;
    const weeklyChart = document.getElementById('weeklyChart');
    const monthlyChart = document.getElementById('monthlyChart');
    if (weeklyChart) {
        const values = data.events.slice(-7).map((event) => ({ label: event.day.slice(0, 2), value: Number(event.duration) || 0 }));
        createChartBars(weeklyChart, values.length ? values : [{ label: 'SEG', value: 0 }, { label: 'TER', value: 0 }, { label: 'QUA', value: 0 }, { label: 'QUI', value: 0 }, { label: 'SEX', value: 0 }, { label: 'SAB', value: 0 }, { label: 'DOM', value: 0 }]);
    }
    if (monthlyChart) {
        createChartBars(monthlyChart, Array.from({ length: 7 }, (_, index) => ({ label: `S${index + 1}`, value: 0 })));
    }
};
