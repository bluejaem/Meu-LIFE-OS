import { randomId } from './utils.js';

const get = (id) => document.getElementById(id);
const renderList = (element, items) => {
    if (!element) return;
    element.innerHTML = items.length
        ? items.map((item) => `<li><strong>${item.time || ''}</strong><span>${item.title}</span></li>`).join('')
        : '<li class="empty-state">Nenhuma atividade definida.</li>';
};

export const initRoutine = (data, onChange) => {
    const weekdayList = get('weekdayRoutine');
    const saturdayList = get('saturdayRoutine');
    const sundayList = get('sundayRoutine');
    const saturdayEditor = get('saturdayEditor');
    const sundayEditor = get('sundayEditor');
    const saveWeekendButton = get('saveWeekendRoutine');
    const resetWeekendButton = get('resetWeekendRoutine');

    const updateRoutineSummary = () => {
        const routineCount = (data.routine?.weekdays?.length || 0)
            + (data.routine?.saturday?.length || 0)
            + (data.routine?.sunday?.length || 0);
        const previewText = data.routine?.weekdays?.length
            ? `${data.routine.weekdays.length} ações de segunda a sexta`
            : 'Defina primeiro sua rotina diária.';
        const summaryCount = get('dashboardRoutineCount');
        const summaryPreview = get('dashboardRoutinePreview');
        if (summaryCount) summaryCount.textContent = `${routineCount} ações`;
        if (summaryPreview) summaryPreview.textContent = previewText;
    };

    const refresh = () => {
        renderList(weekdayList, data.routine.weekdays);
        renderList(saturdayList, data.routine.saturday);
        renderList(sundayList, data.routine.sunday);
        saturdayEditor.value = data.routine.saturday.map((item) => item.title).join('\n');
        sundayEditor.value = data.routine.sunday.map((item) => item.title).join('\n');
        updateRoutineSummary();
    };

    const parseWeekend = (text) => text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((title) => ({ id: randomId(), time: '', title }));

    saveWeekendButton?.addEventListener('click', () => {
        data.routine.saturday = parseWeekend(saturdayEditor.value);
        data.routine.sunday = parseWeekend(sundayEditor.value);
        onChange(data);
    });

    resetWeekendButton?.addEventListener('click', () => {
        data.routine.saturday = [];
        data.routine.sunday = [];
        saturdayEditor.value = '';
        sundayEditor.value = '';
        onChange(data);
    });

    refresh();
    return { refresh };
};
