import { createChartBars } from './utils.js';
export const refreshDashboard = (data) => {
    document.getElementById('todayHours').textContent = `${data.hours.today} h`;
    document.getElementById('weeklyHours').textContent = `${data.hours.week} h`;
    document.getElementById('monthlyHours').textContent = `${data.hours.month} h`;
    document.getElementById('streakDays').textContent = `${data.hours.streak} dias`;
    document.getElementById('dailyGoalLabel').textContent = `${data.hours.dailyGoal}h`;
    document.getElementById('weeklyGoalLabel').textContent = `${data.hours.weeklyGoal}h`;
    document.getElementById('monthlyGoalLabel').textContent = `${data.hours.monthlyGoal}h`;
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
