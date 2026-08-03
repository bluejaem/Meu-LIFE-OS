import { randomId, formatDate } from './utils.js';
export const initDiary = (data, onChange) => {
    const textInput = document.getElementById('diaryText');
    const moodSelect = document.getElementById('diaryMood');
    const dateInput = document.getElementById('diaryDate');
    const addButton = document.getElementById('addDiaryButton');
    const resetButton = document.getElementById('resetDiaryForm');
    const searchInput = document.getElementById('diarySearch');
    const list = document.getElementById('diaryList');
    const render = () => {
        const query = searchInput.value.toLowerCase();
        list.innerHTML = '';
        data.diary
            .filter((entry) => entry.text.toLowerCase().includes(query) || entry.mood.includes(query) || (entry.date || '').includes(query))
            .slice()
            .reverse()
            .forEach((entry) => {
                const item = document.createElement('li');
                item.innerHTML = `<div><strong>${entry.mood} • ${formatDate(entry.date)}</strong><p>${entry.text}</p></div><div class="task-actions"><button class="btn-secondary" type="button">Editar</button><button class="btn-secondary" type="button">Excluir</button></div>`;
                item.querySelectorAll('button')[0].addEventListener('click', () => {
                    textInput.value = entry.text;
                    moodSelect.value = entry.mood;
                    dateInput.value = entry.date;
                    const updated = { ...data };
                    updated.diary = updated.diary.filter((item) => item.id !== entry.id);
                    onChange(updated);
                });
                item.querySelectorAll('button')[1].addEventListener('click', () => {
                    const updated = { ...data };
                    updated.diary = updated.diary.filter((item) => item.id !== entry.id);
                    onChange(updated);
                });
                list.appendChild(item);
            });
    };
    addButton.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (!text) return;
        const entry = { id: randomId(), mood: moodSelect.value, date: dateInput.value || new Date().toISOString().slice(0, 10), text };
        const updated = { ...data };
        updated.diary = [entry, ...updated.diary];
        onChange(updated);
        resetForm();
    });
    const resetForm = () => {
        textInput.value = '';
        moodSelect.value = '😊';
        dateInput.value = '';
    };
    resetButton.addEventListener('click', resetForm);
    searchInput.addEventListener('input', render);
    render();
    return { refresh: render };
};
