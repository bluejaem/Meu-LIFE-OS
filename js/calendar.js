import { randomId, formatDuration } from './utils.js';
const days = ['SEG','TER','QUA','QUI','SEX','SAB','DOM'];
const times = ['07:00','08:30','12:00','13:00','15:00','17:00','19:00','20:40'];
const categoryLabels = {
    estudo: 'Estudo',
    trabalho: 'Trabalho',
    faculdade: 'Faculdade',
    projeto: 'Projeto',
    pessoal: 'Pessoal'
};
export const initCalendar = (data, onChange) => {
    const grid = document.getElementById('calendarGrid');
    const eventList = document.getElementById('eventList');
    const form = document.getElementById('eventForm');
    const clearButton = document.getElementById('clearEventForm');
    const newEventButton = document.getElementById('newEventButton');
    const todayButton = document.getElementById('todayWeekButton');
    let selectedEventId = null;
    const renderGrid = () => {
        grid.innerHTML = '';
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.appendChild(document.createElement('div'));
        days.forEach((day) => {
            const label = document.createElement('div');
            label.textContent = day;
            header.appendChild(label);
        });
        grid.appendChild(header);
        times.forEach((time) => {
            const row = document.createElement('div');
            row.className = 'calendar-row';
            const timeCell = document.createElement('div');
            timeCell.textContent = time;
            row.appendChild(timeCell);
            days.forEach((day) => {
                const cell = document.createElement('div');
                cell.className = 'calendar-cell';
                cell.dataset.day = day;
                cell.dataset.time = time;
                const eventsAtSlot = data.events.filter((event) => event.day === day && event.time === time);
                eventsAtSlot.forEach((event) => {
                    const eventItem = document.createElement('button');
                    eventItem.className = `calendar-event ${event.category}`;
                    eventItem.type = 'button';
                    eventItem.innerHTML = `<strong>${event.title}</strong><small>${event.time} • ${formatDuration(event.duration)}</small>`;
                    eventItem.addEventListener('click', () => selectEvent(event.id));
                    eventItem.draggable = true;
                    eventItem.addEventListener('dragstart', (eventDrag) => {
                        eventDrag.dataTransfer.setData('text/plain', event.id);
                    });
                    row.appendChild(eventItem);
                });
                cell.addEventListener('dragover', (dragEvent) => dragEvent.preventDefault());
                cell.addEventListener('drop', (dropEvent) => {
                    const id = dropEvent.dataTransfer.getData('text/plain');
                    if (!id) return;
                    const updated = { ...data };
                    const item = updated.events.find((event) => event.id === id);
                    if (item) {
                        item.day = day;
                        item.time = time;
                        onChange(updated);
                    }
                });
                row.appendChild(cell);
            });
            grid.appendChild(row);
        });
    };
    const renderEventList = () => {
        eventList.innerHTML = '';
        data.events.slice().reverse().forEach((event) => {
            const item = document.createElement('li');
            item.innerHTML = `<div><strong>${event.title}</strong><span>${categoryLabels[event.category] || event.category} • ${event.day} ${event.time}</span></div><div class="task-actions"><button class="btn-secondary" type="button">Editar</button><button class="btn-secondary" type="button">Duplicar</button></div>`;
            item.querySelectorAll('button')[0].addEventListener('click', () => selectEvent(event.id));
            item.querySelectorAll('button')[1].addEventListener('click', () => duplicateEvent(event.id));
            eventList.appendChild(item);
        });
    };
    const selectEvent = (id) => {
        selectedEventId = id;
        const event = data.events.find((item) => item.id === id);
        if (!event) return;
        document.getElementById('eventId').value = event.id;
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventCategory').value = event.category;
        document.getElementById('eventDay').value = event.day;
        document.getElementById('eventTime').value = event.time;
        document.getElementById('eventDuration').value = event.duration;
        document.getElementById('eventNotes').value = event.notes || '';
    };
    const clearForm = () => {
        selectedEventId = null;
        document.getElementById('eventId').value = '';
        form.reset();
        document.getElementById('eventTime').value = '07:00';
    };
    const duplicateEvent = (id) => {
        const original = data.events.find((event) => event.id === id);
        if (!original) return;
        const updated = { ...data };
        updated.events.push({ ...original, id: randomId(), title: `${original.title} (cópia)` });
        onChange(updated);
    };
    const deleteEvent = (id) => {
        const updated = { ...data };
        updated.events = updated.events.filter((event) => event.id !== id);
        onChange(updated);
    };
    document.addEventListener('keydown', (keyboard) => {
        if (keyboard.key === 'Delete' && selectedEventId) {
            deleteEvent(selectedEventId);
            clearForm();
        }
    });
    form.addEventListener('submit', (eventSubmit) => {
        eventSubmit.preventDefault();
        const values = {
            id: document.getElementById('eventId').value || randomId(),
            title: document.getElementById('eventTitle').value.trim(),
            category: document.getElementById('eventCategory').value,
            day: document.getElementById('eventDay').value,
            time: document.getElementById('eventTime').value,
            duration: Number(document.getElementById('eventDuration').value),
            notes: document.getElementById('eventNotes').value.trim()
        };
        if (!values.title) return;
        const updated = { ...data };
        const existing = updated.events.find((item) => item.id === values.id);
        if (existing) {
            Object.assign(existing, values);
        } else {
            updated.events.push(values);
        }
        onChange(updated);
        clearForm();
    });
    clearButton.addEventListener('click', clearForm);
    newEventButton.addEventListener('click', () => {
        clearForm();
        document.getElementById('eventTitle').focus();
    });
    todayButton.addEventListener('click', () => renderGrid());
    renderGrid();
    renderEventList();
    return {
        refresh: () => {
            renderGrid();
            renderEventList();
        }
    };
};
