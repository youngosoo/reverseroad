// Theme Management
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

const savedTheme = localStorage.getItem('theme') || 'dark-theme';
body.className = `text-slate-100 min-h-screen flex flex-col justify-between ${savedTheme}`;

themeToggle.addEventListener('click', () => {
    if (body.classList.contains('dark-theme')) {
        body.classList.replace('dark-theme', 'light-theme');
        localStorage.setItem('theme', 'light-theme');
    } else {
        body.classList.replace('light-theme', 'dark-theme');
        localStorage.setItem('theme', 'dark-theme');
    }
});

// Global State
let selectedFile = null;
let originalWavHeader = null; 
let convertedMp3Blob = null;
let audioCtxInstance = null;

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const convertBtn = document.getElementById('convert-btn');
const clearFileBtn = document.getElementById('clear-file-btn');

const fileInfoCard = document.getElementById('file-info-card');
const processingCard = document.getElementById('processing-card');
const resultCard = document.getElementById('result-card');
const guideCard = document.getElementById('guide-card');

const infoFilename = document.getElementById('info-filename');
const infoFilesize = document.getElementById('info-filesize');
const techFormat = document.getElementById('tech-format');
const techChannels = document.getElementById('tech-channels');
const techSamplerate = document.getElementById('tech-samplerate');
const techBits = document.getElementById('tech-bits');
const techDuration = document.getElementById('tech-duration');

const processingBar = document.getElementById('processing-bar');
const processingPercent = document.getElementById('processing-percent');
const processingMsg = document.getElementById('processing-msg');

const resultFilename = document.getElementById('result-filename');
const savingBadge = document.getElementById('saving-badge');
const sizeBefore = document.getElementById('size-before');
const sizeAfter = document.getElementById('size-after');
const resultAudioPlayer = document.getElementById('result-audio-player');
const downloadMp3Btn = document.getElementById('download-mp3-btn');

const bitrateSelect = document.getElementById('bitrate-select');
const bitrateValue = document.getElementById('bitrate-value');

// Update Bitrate display text on change
bitrateSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    let desc = '';
    if (val === '128') desc = '128 kbps (일반 용량 최적화)';
    else if (val === '192') desc = '192 kbps (고품질 표준 추천)';
    else if (val === '256') desc = '256 kbps (초고음질 전송용)';
    else if (val === '320') desc = '320 kbps (스튜디오 원음급 품질)';
    bitrateValue.innerText = desc;
});