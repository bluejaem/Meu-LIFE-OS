export const randomId = () => `id_${Math.random().toString(36).slice(2, 10)}`;
export const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return hours ? `${hours}h ${remainder}m` : `${remainder} min`;
};
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' });
};
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
export const createChartBars = (container, values) => {
    container.innerHTML = '';
    const max = Math.max(...values, 1);
    values.forEach((item) => {
        const marker = document.createElement('span');
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${(item.value / max) * 100}%`;
        marker.appendChild(bar);
        const label = document.createElement('small');
        label.textContent = item.label;
        marker.appendChild(label);
        container.appendChild(marker);
    });
};
