/**
 * CardioLens AI - Modular Frontend Logic
 * Senior Frontend Developer: Antigravity
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Universal Logics (Run on every page)
    initTheme();
    initMobileMenu();
    initScrollReveal();

    // 2. Page-Specific Initializations
    const path = window.location.pathname;
    const page = path.split("/").pop();

    if (page === "" || page === "index.html") {
        initVitalsSimulation();
        initHomeCharts();
    } else if (page === "analysis.html") {
        initAnalysisCharts();
    } else if (page === "prediction.html") {
        initPredictionForm();
    }
});

// --- Theme Logic ---
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = themeToggle.querySelector('i');

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(currentTheme);
        localStorage.setItem('theme', currentTheme);
    });

    function applyTheme(theme) {
        body.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            body.classList.replace('light-theme', 'dark-theme');
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            body.classList.replace('dark-theme', 'light-theme');
            icon.classList.replace('fa-sun', 'fa-moon');
        }
        updateChartsTheme(theme);
    }
}

// --- Mobile Menu ---
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// --- Scroll Reveal ---
function initScrollReveal() {
    const observerOptions = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-up, .animate-fade').forEach(el => observer.observe(el));
}

// --- ECG Simulation (Home Specific) ---
function initVitalsSimulation() {
    const sysEl = document.getElementById('sys-val');
    const diaEl = document.getElementById('dia-val');
    const pulseEl = document.getElementById('pulse-val');

    if (!sysEl) return;

    setInterval(() => {
        const sys = 115 + Math.floor(Math.random() * 10);
        const dia = 75 + Math.floor(Math.random() * 10);
        const pulse = 70 + Math.floor(Math.random() * 5);
        if (sysEl) sysEl.textContent = sys;
        if (diaEl) diaEl.textContent = dia;
        if (pulseEl) pulseEl.textContent = pulse;
    }, 3000);
}

// --- Charts Management ---
let activeCharts = {};

function initHomeCharts() {
    const canvas = document.getElementById('ecgChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const isDark = document.body.getAttribute('data-theme') === 'dark';

    const ecgData = Array(50).fill(0);
    activeCharts.ecg = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(50).fill(''),
            datasets: [{
                data: ecgData,
                borderColor: '#4e7a61',
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { display: false, min: -10, max: 10 },
                x: { display: false }
            },
            animation: { duration: 0 }
        }
    });

    let tick = 0;
    setInterval(() => {
        tick++;
        let val = Math.sin(tick * 0.5) * 1.5;
        if (tick % 15 === 0) val = 8;
        if (tick % 15 === 1) val = -4;
        ecgData.push(val);
        ecgData.shift();
        activeCharts.ecg.update();
    }, 100);
}

function initAnalysisCharts() {
    const confCanvas = document.getElementById('confusionMatrixChart');
    if (!confCanvas) return;

    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#fdfbf7' : '#1a2f23';

    // Confusion Matrix (Heatmap Simulator)
    activeCharts.confusion = new Chart(confCanvas.getContext('2d'), {
        type: 'bar', // Using Bar to simulate Heatmap cells
        data: {
            labels: ['Predicted Low', 'Predicted High'],
            datasets: [
                {
                    label: 'Actual Low',
                    data: [480, 20],
                    backgroundColor: ['#4e7a61', '#e9967a'],
                    borderRadius: 8
                },
                {
                    label: 'Actual High',
                    data: [35, 490],
                    backgroundColor: ['#e9967a', '#2d5a43'],
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: textColor } }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: textColor } },
                x: { ticks: { color: textColor } }
            }
        }
    });

    // Feature Stability
    const stabilityCanvas = document.getElementById('featureStabilityChart');
    activeCharts.stability = new Chart(stabilityCanvas.getContext('2d'), {
        type: 'radar',
        data: {
            labels: ['Age', 'Sys. BP', 'Dia. BP', 'CHOL', 'Smoking', 'BMI', 'Active', 'Gluc'],
            datasets: [{
                label: 'Global Sensitivity',
                data: [75, 98, 85, 82, 65, 70, 55, 60],
                backgroundColor: 'rgba(78, 122, 97, 0.2)',
                borderColor: '#4e7a61',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(0,0,0,0.1)' },
                    grid: { color: 'rgba(0,0,0,0.1)' },
                    ticks: { display: false },
                    pointLabels: { color: textColor, font: { size: 12 } }
                }
            }
        }
    });
}

function updateChartsTheme(theme) {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#94a3b8' : '#1a2f23';

    Object.values(activeCharts).forEach(chart => {
        if (chart.options.scales) {
            if (chart.options.scales.x) chart.options.scales.x.ticks.color = textColor;
            if (chart.options.scales.y) chart.options.scales.y.ticks.color = textColor;
            if (chart.options.scales.r) chart.options.scales.r.pointLabels.color = textColor;
        }
        if (chart.options.plugins && chart.options.plugins.legend) {
            chart.options.plugins.legend.labels.color = textColor;
        }
        chart.update();
    });
}

// --- Prediction Form (Premium Side-by-Side Version) ---
function initPredictionForm() {
    const form = document.getElementById('predictionForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button');
        const originalText = submitBtn.innerHTML;

        // UI States
        const initialState = document.getElementById('initial-state');
        const processingState = document.getElementById('processing-state');
        const resultState = document.getElementById('prediction-result');

        // Transition to Processing
        if (initialState) initialState.classList.add('hidden');
        if (resultState) resultState.classList.add('hidden');
        if (processingState) processingState.classList.remove('hidden');

        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || `Server returned ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                // Short delay for "analytical" feel
                setTimeout(() => {
                    if (processingState) processingState.classList.add('hidden');
                    displayAdvancedResult(result);
                }, 1200);
            } else {
                alert("Model Error: " + (result.error || "Unknown failure"));
                if (processingState) processingState.classList.add('hidden');
                if (initialState) initialState.classList.remove('hidden');
            }

        } catch (err) {
            console.error("Inference Error:", err);
            if (processingState) processingState.classList.add('hidden');
            if (initialState) initialState.classList.remove('hidden');

            const isNetworkError = err.message.includes('fetch') || err.name === 'TypeError';
            if (isNetworkError) {
                alert(`Connection Error!\n\nPlease ensure the Python server (app.py) is running on port 5000.`);
            } else {
                alert("Processing Error: " + err.message);
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    });
}

function displayAdvancedResult(res) {
    const resultDiv = document.getElementById('prediction-result');
    const riskLabel = document.getElementById('risk-label');
    const probText = document.getElementById('probability-text');
    const gaugeFill = document.getElementById('gauge-fill');

    if (!resultDiv) return;

    // 1. Map Risk Level & Color
    riskLabel.textContent = res.level;
    riskLabel.style.color = res.color;

    // 2. Set Confidence Text
    probText.textContent = `${res.probability}%`;

    // 3. Animate Gauge
    if (gaugeFill) {
        gaugeFill.style.width = '0%';
        setTimeout(() => {
            gaugeFill.style.width = `${res.probability}%`;
            gaugeFill.style.backgroundColor = res.color;
        }, 100);
    }

    // 4. Show Result
    resultDiv.classList.remove('hidden');
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
