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

// Toast Helper
function showToast(title, desc, type = 'info') {
    const toast = document.getElementById('status-toast');
    const iconBg = document.getElementById('toast-icon-bg');
    const icon = document.getElementById('toast-icon');
    const tTitle = document.getElementById('toast-title');
    const tDesc = document.getElementById('toast-desc');

    tTitle.innerText = title;
    tDesc.innerText = desc;

    if (type === 'error') {
        iconBg.className = "p-2 rounded-lg bg-rose-500 text-white animate-pulse";
        icon.className = "fa-solid fa-circle-exclamation";
    } else if (type === 'success') {
        iconBg.className = "p-2 rounded-lg bg-emerald-500 text-white";
        icon.className = "fa-solid fa-circle-check";
    } else {
        iconBg.className = "p-2 rounded-lg bg-indigo-500 text-white";
        icon.className = "fa-solid fa-info";
    }

    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
}

function hideToast() {
    document.getElementById('status-toast').classList.add('hidden');
}

window.hideToast = hideToast;

// Helper: Format byte sizes nicely
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Helper: Convert seconds to HH:MM:SS
function formatSeconds(seconds) {
    const secNum = parseInt(seconds, 10);
    let hours   = Math.floor(secNum / 3600);
    let minutes = Math.floor((secNum - (hours * 3600)) / 60);
    let secs = secNum - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (secs < 10) {secs = "0"+secs;}
    return hours + ':' + minutes + ':' + secs;
}

// Drag & Drop event bindings
dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-indigo-500', 'bg-indigo-950/20');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-indigo-500', 'bg-indigo-950/20');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-indigo-500', 'bg-indigo-950/20');
    if (e.dataTransfer.files.length > 0) {
        handleFileSelection(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
    }
});

// Handle uploaded file and read WAV metadata
function handleFileSelection(file) {
    if (!file.name.toLowerCase().endsWith('.wav')) {
        showToast("올바르지 않은 파일 형식", "확장자가 .wav인 웨이브 파일만 업로드가 가능합니다.", "error");
        return;
    }

    selectedFile = file;
    convertedMp3Blob = null;
    resultCard.classList.add('hidden');
    resultAudioPlayer.src = '';
    
    // UI elements update
    infoFilename.innerText = file.name;
    infoFilesize.innerText = formatBytes(file.size);
    fileInfoCard.classList.remove('hidden');
    guideCard.classList.add('hidden');
    
    // Enable processing button
    convertBtn.disabled = false;
    convertBtn.className = "w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30";

    // Parse WAV Header with a slice
    const reader = new FileReader();
    reader.onload = function(e) {
        const buffer = e.target.result;
        parseWavHeader(buffer);
    };
    
    const sliceSize = Math.min(file.size, 256 * 1024);
    reader.readAsArrayBuffer(file.slice(0, sliceSize));
}

// Clean file data
clearFileBtn.addEventListener('click', () => {
    selectedFile = null;
    originalWavHeader = null;
    convertedMp3Blob = null;
    fileInput.value = '';
    
    fileInfoCard.classList.add('hidden');
    processingCard.classList.add('hidden');
    resultCard.classList.add('hidden');
    resultAudioPlayer.src = '';
    guideCard.classList.remove('hidden');
    
    convertBtn.disabled = true;
    convertBtn.className = "w-full bg-slate-800 text-slate-400 font-semibold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-not-allowed";
});

// WAV Header parser algorithm
function parseWavHeader(arrayBuffer) {
    try {
        const view = new DataView(arrayBuffer);
        const isRIFF = view.getUint32(0, false) === 0x52494646;
        const isWAVE = view.getUint32(8, false) === 0x57415645;
        
        if (!isRIFF || !isWAVE) {
            throw new Error("유효한 표준 WAV 형식이 아닙니다.");
        }

        let pos = 12;
        let fmtChunk = null;
        let dataChunk = null;

        while (pos < view.byteLength - 8) {
            const id = String.fromCharCode(
                view.getUint8(pos),
                view.getUint8(pos+1),
                view.getUint8(pos+2),
                view.getUint8(pos+3)
            );
            const size = view.getUint32(pos + 4, true);

            if (id === 'fmt ') {
                fmtChunk = {
                    offset: pos + 8,
                    size: size,
                    audioFormat: view.getUint16(pos + 8, true),
                    numChannels: view.getUint16(pos + 10, true),
                    sampleRate: view.getUint32(pos + 12, true),
                    byteRate: view.getUint32(pos + 16, true),
                    blockAlign: view.getUint16(pos + 20, true),
                    bitsPerSample: view.getUint16(pos + 22, true)
                };
            } else if (id === 'data') {
                dataChunk = {
                    offset: pos + 8,
                    size: size
                };
            }
            
            pos += 8 + size;
            if (size % 2 !== 0) pos++;
        }

        if (!fmtChunk) throw new Error("포맷 데이터 청크를 찾을 수 없습니다.");
        if (!dataChunk) {
            const calculatedDataOffset = fmtChunk.offset + fmtChunk.size + 8;
            dataChunk = {
                offset: calculatedDataOffset,
                size: selectedFile.size - calculatedDataOffset
            };
        }

        originalWavHeader = { fmt: fmtChunk, data: dataChunk };

        techFormat.innerText = fmtChunk.audioFormat === 1 ? "PCM" : "Other";
        techChannels.innerText = `${fmtChunk.numChannels}ch`;
        techSamplerate.innerText = `${fmtChunk.sampleRate} Hz`;
        techBits.innerText = `${fmtChunk.bitsPerSample}-bit`;
        techDuration.innerText = formatSeconds(dataChunk.size / fmtChunk.byteRate);

    } catch (error) {
        showToast("WAV 분석 실패", error.message, "error");
    }
}

convertBtn.addEventListener('click', startMp3Conversion);

async function startMp3Conversion() {
    processingCard.classList.remove('hidden');
    resultCard.classList.add('hidden');
    resultAudioPlayer.src = '';
    convertBtn.disabled = true;

    if (!audioCtxInstance) {
        audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)();
    }

    try {
        const originalBuffer = await selectedFile.arrayBuffer();
        const decodedAudio = await audioCtxInstance.decodeAudioData(originalBuffer);
        const bitrate = parseInt(bitrateSelect.value);
        
        convertedMp3Blob = await encodeMP3Async(decodedAudio, bitrate, (percent) => {
            processingBar.style.width = `${percent}%`;
            processingPercent.innerText = `${percent}%`;
        });

        finishConversion();
    } catch (err) {
        showToast("변환 실패", err.message, "error");
        resetProcessingUI();
    }
}

async function encodeMP3Async(audioBuffer, bitrate, onProgress) {
    const channels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitrate);
    const mp3Data = [];
    const leftFloat = audioBuffer.getChannelData(0);
    const rightFloat = channels > 1 ? audioBuffer.getChannelData(1) : null;
    const totalSamples = leftFloat.length;
    const stepBlockSize = 115200; 

    let offset = 0;
    while (offset < totalSamples) {
        const end = Math.min(offset + stepBlockSize, totalSamples);
        const leftPCM = floatTo16BitPCM(leftFloat.subarray(offset, end));
        let mp3buf;
        if (channels > 1 && rightFloat) {
            const rightPCM = floatTo16BitPCM(rightFloat.subarray(offset, end));
            mp3buf = mp3encoder.encodeBuffer(leftPCM, rightPCM);
        } else {
            mp3buf = mp3encoder.encodeBuffer(leftPCM);
        }
        if (mp3buf.length > 0) mp3Data.push(mp3buf);
        offset = end;
        if (onProgress) onProgress(Math.round((offset / totalSamples) * 100));
        await new Promise(resolve => setTimeout(resolve, 5));
    }
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) mp3Data.push(mp3buf);
    return new Blob(mp3Data, { type: 'audio/mp3' });
}

function floatTo16BitPCM(input) {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
}

function finishConversion() {
    processingCard.classList.add('hidden');
    const outName = `${selectedFile.name.split('.')[0]}.mp3`;
    resultFilename.innerText = outName;
    sizeBefore.innerText = formatBytes(selectedFile.size);
    sizeAfter.innerText = formatBytes(convertedMp3Blob.size);
    const blobUrl = URL.createObjectURL(convertedMp3Blob);
    resultAudioPlayer.src = blobUrl;
    downloadMp3Btn.href = blobUrl;
    downloadMp3Btn.download = outName;
    resultCard.classList.remove('hidden');
    resetProcessingUI();
    showToast("변환 완료", "MP3 파일이 준비되었습니다.", "success");
}

function resetProcessingUI() {
    convertBtn.disabled = false;
}
