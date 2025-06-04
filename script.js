// Global Variables
let currentStep = 0;
let currentQuestion = 0;
let quizData = [];
let userAnswers = [];
let coinFlips = { heads: 0, tails: 0 };
let diceRolls = [0, 0, 0, 0, 0, 0];
let cards = [];

// MathJax Configuration
window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']]
    },
    svg: {
        fontCache: 'global'
    }
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
    setupEventListeners();
    drawHeroCanvas();
    updateProgressBar();
    animateOnScroll();
});

// Initialize Website
function initializeWebsite() {
    // Hide loading screen after 2 seconds
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 2000);
    
    // Initialize card deck
    initializeCardDeck();
    
    // Set default values for sliders
    updateSliderValues();
    
    // Initialize parabola graph
    updateParabola();
    
    // Load quiz data
    loadQuizData();
}

// Setup Event Listeners
function setupEventListeners() {
    // Navbar
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);
    
    // Scroll events
    window.addEventListener('scroll', handleScroll);
    
    // Slider events for parabola
    document.getElementById('coeff-a').addEventListener('input', updateParabola);
    document.getElementById('coeff-b').addEventListener('input', updateParabola);
    document.getElementById('coeff-c').addEventListener('input', updateParabola);
    
    // Trajectory controls
    document.getElementById('initial-velocity').addEventListener('input', updateTrajectoryControls);
    document.getElementById('launch-angle').addEventListener('input', updateTrajectoryControls);
    
    // Sample size for distribution
    document.getElementById('sampleSize').addEventListener('input', updateSampleSize);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const quizModal = document.getElementById('quizModal');
        const gameModal = document.getElementById('gameModal');
        
        if (event.target === quizModal) {
            closeQuiz();
        }
        if (event.target === gameModal) {
            closeGame();
        }
    });
}

// Theme Toggle
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    if (currentTheme === 'dark') {
        body.removeAttribute('data-theme');
        icon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        icon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('theme-toggle').querySelector('i').className = 'fas fa-sun';
    }
}

// Handle Scroll Events
function handleScroll() {
    updateProgressBar();
    updateNavbar();
    showBackToTop();
    animateOnScroll();
}

// Update Progress Bar
function updateProgressBar() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    document.getElementById('progressBar').style.width = scrollPercent + '%';
}

// Update Navbar on Scroll
function updateNavbar() {
    const navbar = document.getElementById('navbar');
    const scrollTop = window.pageYOffset;
    
    if (scrollTop > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.backdropFilter = 'blur(20px)';
        navbar.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
        navbar.style.boxShadow = 'none';
    }
    
    // Update active nav link
    const sections = document.querySelectorAll('.chapter-section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLinks[index + 1]) {
                navLinks[index + 1].classList.add('active');
            }
        }
    });
}

// Show/Hide Back to Top Button
function showBackToTop() {
    const backToTop = document.getElementById('backToTop');
    const scrollTop = window.pageYOffset;
    
    if (scrollTop > 300) {
        backToTop.classList.add('show');
    } else {
        backToTop.classList.remove('show');
    }
}

// Scroll to Top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Scroll to Section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    const navHeight = document.getElementById('navbar').offsetHeight;
    
    window.scrollTo({
        top: section.offsetTop - navHeight,
        behavior: 'smooth'
    });
}

// Animate on Scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible) {
            element.classList.add('animated');
        }
    });
}

// Draw Hero Canvas
function drawHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 500;
    canvas.height = 400;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw coordinate system
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // Draw grid
    for (let i = 0; i <= canvas.width; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    
    for (let i = 0; i <= canvas.height; i += 25) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    // Draw animated parabola
    animateHeroParabola(ctx);
}

// Animate Hero Parabola
function animateHeroParabola(ctx) {
    let frame = 0;
    
    function animate() {
        // Clear previous parabola
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Redraw grid and axes
        drawHeroCanvas();
        
        // Calculate parabola parameters
        const a = 0.01 + 0.005 * Math.sin(frame * 0.02);
        const h = ctx.canvas.width / 2;
        const k = ctx.canvas.height * 0.8;
        
        // Draw parabola
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let x = 0; x <= ctx.canvas.width; x += 2) {
            const y = a * Math.pow(x - h, 2) + k;
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Draw vertex point
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(h, k, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        frame++;
        if (frame < 1000) {
            requestAnimationFrame(animate);
        }
    }
    
    animate();
}

// SPLDV Functions
function solveSPLDV() {
    const a1 = parseFloat(document.getElementById('a1').value) || 0;
    const b1 = parseFloat(document.getElementById('b1').value) || 0;
    const c1 = parseFloat(document.getElementById('c1').value) || 0;
    const a2 = parseFloat(document.getElementById('a2').value) || 0;
    const b2 = parseFloat(document.getElementById('b2').value) || 0;
    const c2 = parseFloat(document.getElementById('c2').value) || 0;
    
    const resultDiv = document.getElementById('spldvResult');
    
    // Check for valid input
    if (a1 === 0 && b1 === 0) {
        resultDiv.innerHTML = '<p style="color: red;">Persamaan 1 tidak valid!</p>';
        return;
    }
    
    if (a2 === 0 && b2 === 0) {
        resultDiv.innerHTML = '<p style="color: red;">Persamaan 2 tidak valid!</p>';
        return;
    }
    
    // Calculate determinant
    const det = a1 * b2 - a2 * b1;
    
    if (det === 0) {
        // Check if the system has no solution or infinite solutions
        if (
