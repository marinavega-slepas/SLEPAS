document.addEventListener('DOMContentLoaded', () => {
    console.log('Socio-Emotional Report Platform Initialized');

    // Initialize date to today
    const dateInput = document.getElementById('reportDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    renderRubric();
    initChart();

    document.getElementById('generate-pdf-btn').addEventListener('click', generatePDF);
});

function generatePDF() {
    const element = document.querySelector('.app-container');
    const btn = document.getElementById('generate-pdf-btn');
    const originalText = btn.innerHTML;

    // Visual feedback
    btn.innerHTML = 'Generando...';
    btn.disabled = true;
    document.body.classList.add('generating-pdf');

    const opt = {
        margin: [0.5, 0.5],
        filename: `Reporte_Socioemocional_${document.getElementById('studentName').value || 'Estudiante'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        // Reset state
        btn.innerHTML = originalText;
        btn.disabled = false;
        document.body.classList.remove('generating-pdf');
    }).catch(err => {
        console.error(err);
        alert('Error al generar el PDF');
        btn.innerHTML = originalText;
        btn.disabled = false;
        document.body.classList.remove('generating-pdf');
    });
}

// Rubric Data (Standard SEL Framework)
const rubricData = [
    {
        id: 'self-awareness',
        title: 'Autoconciencia',
        description: 'Capacidad para reconocer las propias emociones, pensamientos y valores.',
        items: [
            { text: 'Identifica y nombra sus emociones con precisión.', description: 'El estudiante es capaz de verbalizar cómo se siente en diferentes situaciones.' },
            { text: 'Reconoce sus fortalezas y áreas de mejora.', description: 'Muestra consciencia de lo que hace bien y dónde necesita apoyo.' },
            { text: 'Muestra confianza en sí mismo y autoeficacia.', description: 'Cree en su capacidad para lograr metas y superar desafíos.' }
        ]
    },
    {
        id: 'self-management',
        title: 'Autogestión',
        description: 'Capacidad para regular las emociones, pensamientos y comportamientos.',
        items: [
            { text: 'Maneja el estrés y la frustración adecuadamente.', description: 'Utiliza estrategias de calma ante situaciones difíciles.' },
            { text: 'Establece y trabaja hacia metas personales y académicas.', description: 'Es capaz de planificar y persistir para alcanzar objetivos.' },
            { text: 'Demuestra autodisciplina y motivación.', description: 'Muestra control de impulsos y motivación intrínseca.' }
        ]
    },
    {
        id: 'social-awareness',
        title: 'Conciencia Social',
        description: 'Capacidad para entender las perspectivas de los demás y empatizar.',
        items: [
            { text: 'Demuestra empatía hacia los sentimientos de otros.', description: 'Es capaz de ponerse en el lugar de los demás.' },
            { text: 'Respeta las diferencias y la diversidad.', description: 'Trata a todos con respeto independientemente de sus diferencias.' },
            { text: 'Entiende las normas sociales y de comportamiento.', description: 'Reconoce y sigue las normas de convivencia.' }
        ]
    },
    {
        id: 'relationship-skills',
        title: 'Habilidades Relacionales',
        description: 'Capacidad para establecer y mantener relaciones saludables.',
        items: [
            { text: 'Se comunica claramente y escucha activamente.', description: 'Expresa sus ideas con claridad y presta atención a los demás.' },
            { text: 'Trabaja cooperativamente en equipo.', description: 'Colabora con otros para alcanzar metas comunes.' },
            { text: 'Resuelve conflictos de manera constructiva.', description: 'Busca soluciones pacíficas a los desacuerdos.' }
        ]
    },
    {
        id: 'responsible-decision',
        title: 'Toma de Decisiones Responsable',
        description: 'Capacidad para tomar decisiones constructivas y respetuosas.',
        items: [
            { text: 'Identifica problemas y analiza situaciones.', description: 'Reconoce cuando hay un problema y evalúa el contexto.' },
            { text: 'Evalúa las consecuencias de sus acciones.', description: 'Considera cómo sus actos afectan a sí mismo y a los demás.' },
            { text: 'Toma decisiones basadas en normas éticas y de seguridad.', description: 'Elige actuar de manera segura y ética.' }
        ]
    }
];

const levels = [
    { value: 1, label: 'Por desarrollar', color: '#ef4444', desc: 'La habilidad no se observa o se observa raramente. Requiere apoyo constante.' },
    { value: 2, label: 'En desarrollo', color: '#f59e0b', desc: 'La habilidad se observa ocasionalmente. Requiere recordatorios y apoyo frecuente.' },
    { value: 3, label: 'Competente', color: '#3b82f6', desc: 'La habilidad se observa frecuentemente de manera autónoma. Adecuado para el nivel.' },
    { value: 4, label: 'Destacado', color: '#10b981', desc: 'La habilidad se observa consistentemente y sirve de modelo para otros.' }
];

// State to store scores
const scores = {};

function renderRubric() {
    const container = document.getElementById('rubric-container');
    container.innerHTML = '';

    rubricData.forEach(category => {
        const categoryEl = document.createElement('div');
        categoryEl.className = 'rubric-category';

        let itemsHtml = '';
        category.items.forEach((itemObj, index) => {
            const itemId = `${category.id}-${index}`;
            // Initialize score
            if (!scores[category.id]) scores[category.id] = {};
            scores[category.id][index] = 0; // Default 0

            let optionsHtml = '';
            levels.forEach(level => {
                optionsHtml += `
                    <label class="rating-option tooltip-container">
                        <input type="radio" name="${itemId}" value="${level.value}" onchange="updateScore('${category.id}', ${index}, ${level.value})">
                        <span class="rating-label" style="--active-color: ${level.color}">${level.label}</span>
                        <span class="tooltip-text rating-tooltip">${level.desc}</span>
                    </label>
                `;
            });

            itemsHtml += `
                <div class="rubric-item">
                    <div class="item-info tooltip-container">
                        <p class="item-text">${itemObj.text} <span class="info-icon">ℹ️</span></p>
                        <span class="tooltip-text">${itemObj.description}</span>
                    </div>
                    <div class="rating-group">
                        ${optionsHtml}
                    </div>
                </div>
            `;
        });

        categoryEl.innerHTML = `
            <h3>${category.title}</h3>
            <p class="category-desc">${category.description}</p>
            <div class="items-container">
                ${itemsHtml}
            </div>
        `;
        container.appendChild(categoryEl);
    });
}

function updateScore(categoryId, itemIndex, value) {
    scores[categoryId][itemIndex] = parseInt(value);
    updateChart();
}

let skillsChart = null;

function initChart() {
    const ctx = document.getElementById('skillsChart').getContext('2d');

    skillsChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: rubricData.map(c => c.title),
            datasets: [{
                label: 'Nivel de Desarrollo',
                data: rubricData.map(() => 0), // Initial data
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                borderColor: 'rgba(56, 189, 248, 1)',
                pointBackgroundColor: 'rgba(15, 23, 42, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        color: '#e2e8f0'
                    },
                    grid: {
                        color: '#e2e8f0'
                    },
                    pointLabels: {
                        font: {
                            family: 'Outfit',
                            size: 12
                        },
                        color: '#64748b'
                    },
                    suggestedMin: 0,
                    suggestedMax: 4,
                    ticks: {
                        stepSize: 1,
                        display: false // Hide numbers on axis for cleaner look
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function updateChart() {
    if (!skillsChart) return;

    const averages = rubricData.map(category => {
        const categoryScores = Object.values(scores[category.id]);
        const sum = categoryScores.reduce((a, b) => a + b, 0);
        const avg = sum / categoryScores.length;
        return avg;
    });

    skillsChart.data.datasets[0].data = averages;
    skillsChart.update();
    updateInterpretation(averages);
    updateSuggestions();
}

// Activity Data
const activitiesByLevel = {
    'preescolar': [
        { title: 'El Monstruo de Colores', desc: 'Leer el cuento y pedir que dibujen cómo se sienten hoy usando un color.' },
        { title: 'La Tortuga', desc: 'Enseñar la técnica de la tortuga para calmarse: parar, respirar y pensar.' },
        { title: 'Rueda de Opciones', desc: 'Crear una rueda con opciones para resolver conflictos (pedir perdón, esperar, hablar).' }
    ],
    'basica1': [
        { title: 'Diario de Gratitud', desc: 'Escribir o dibujar 3 cosas por las que están agradecidos cada día.' },
        { title: 'Semáforo de Emociones', desc: 'Usar un semáforo para identificar intensidad emocional antes de actuar.' },
        { title: 'Juego de Roles', desc: 'Representar situaciones de conflicto y practicar diferentes soluciones.' }
    ],
    'basica2': [
        { title: 'Debate de Dilemas', desc: 'Discutir dilemas morales simples para practicar la toma de decisiones.' },
        { title: 'Mapa de Empatía', desc: 'Analizar un personaje o situación: ¿Qué piensa? ¿Qué siente? ¿Qué hace?' },
        { title: 'Metas SMART', desc: 'Establecer metas personales específicas y medibles para la semana.' }
    ],
    'media': [
        { title: 'Análisis FODA Personal', desc: 'Identificar Fortalezas, Oportunidades, Debilidades y Amenazas personales.' },
        { title: 'Mindfulness', desc: 'Prácticas breves de atención plena para manejo del estrés antes de exámenes.' },
        { title: 'Proyecto de Servicio', desc: 'Planificar una actividad de ayuda a la comunidad escolar.' }
    ]
};

function updateSuggestions() {
    const gradeSelect = document.getElementById('studentGrade');
    const container = document.getElementById('activities-container');
    const level = gradeSelect.value;

    if (!level || !activitiesByLevel[level]) {
        container.innerHTML = '<p class="placeholder-text">Seleccione un grado para ver sugerencias específicas.</p>';
        return;
    }

    const activities = activitiesByLevel[level];
    let html = '<div class="activities-grid">';

    activities.forEach(act => {
        html += `
            <div class="activity-card">
                <h4>${act.title}</h4>
                <p>${act.desc}</p>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Update suggestions when grade changes
document.getElementById('studentGrade').addEventListener('change', updateSuggestions);

function updateInterpretation(averages) {
    const container = document.getElementById('chart-interpretation');
    if (!container) return;

    // Check if any data is present
    if (averages.every(val => val === 0)) {
        container.innerHTML = '<p class="placeholder-text">Complete la rúbrica para ver el análisis.</p>';
        return;
    }

    let html = '<h3>Análisis de Resultados</h3><div class="interpretation-grid">';

    rubricData.forEach((category, index) => {
        const score = averages[index];
        let text = '';
        let colorClass = '';

        if (score === 0) {
            text = 'Pendiente de evaluación.';
            colorClass = 'text-gray';
        } else if (score <= 1.5) {
            text = 'Se requiere un plan de apoyo intensivo para fortalecer estas habilidades básicas.';
            colorClass = 'text-red';
        } else if (score <= 2.5) {
            text = 'Hay progreso, pero se necesita práctica continua y refuerzo en situaciones cotidianas.';
            colorClass = 'text-orange';
        } else if (score <= 3.5) {
            text = 'El estudiante demuestra un buen dominio, aplicando estas habilidades de manera autónoma.';
            colorClass = 'text-blue';
        } else {
            text = 'Excelente dominio. El estudiante es un referente positivo para sus compañeros en esta área.';
            colorClass = 'text-green';
        }

        html += `
            <div class="interpretation-item">
                <h4>${category.title} (${score.toFixed(1)})</h4>
                <p class="${colorClass}">${text}</p>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}
