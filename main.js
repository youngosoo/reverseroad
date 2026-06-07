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
const copySourceBtn = document.getElementById('copy-source-btn');
const downloadAppBtn = document.getElementById('download-app-btn');

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

window.hideToast = hideToast; // Make it global for inline onclick

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
    
    const sliceSize = Math.min(file.size, 256 * 1024); // read first 256KB
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
        
        // Verify RIFF & WAVE Identifiers
        const isRIFF = view.getUint32(0, false) === 0x52494646; // "RIFF"
        const isWAVE = view.getUint32(8, false) === 0x57415645; // "WAVE"
        
        if (!isRIFF || !isWAVE) {
            throw new Error("유효한 표준 WAV 형식이 아닙니다. 파일 구조 헤더를 읽지 못했습니다.");
        }

        let pos = 12;
        let fmtChunk = null;
        let dataChunk = null;

        // Scan for 'fmt ' and 'data' subchunks
        while (pos < view.byteLength - 8) {
            const id = String.fromCharCode(
                view.getUint8(pos),
                view.getUint8(pos+1),
                view.getUint8(pos+2),
                view.getUint8(pos+3)
            );
            const size = view.getUint32(pos + 4, true); // Little-endian

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
            if (size % 2 !== 0) pos++; // Word boundaries alignment padding
        }

        if (!fmtChunk) {
            throw new Error("포맷 데이터 청크('fmt ')를 찾을 수 없습니다.");
        }

        if (!dataChunk) {
            const calculatedDataOffset = fmtChunk.offset + fmtChunk.size + 8;
            dataChunk = {
                offset: calculatedDataOffset,
                size: selectedFile.size - calculatedDataOffset
            };
        }

        if (dataChunk.size <= 0 || (dataChunk.offset + dataChunk.size) > selectedFile.size) {
            dataChunk.size = selectedFile.size - dataChunk.offset;
        }

        originalWavHeader = {
            fmt: fmtChunk,
            data: dataChunk
        };

        // Display info in UI
        const formatLabel = fmtChunk.audioFormat === 1 ? "Uncompressed PCM" : (fmtChunk.audioFormat === 3 ? "IEEE Float" : "Compressed/Extended");
        techFormat.innerText = formatLabel;
        techChannels.innerText = fmtChunk.numChannels === 1 ? "Mono (1ch)" : (fmtChunk.numChannels === 2 ? "Stereo (2ch)" : `${fmtChunk.numChannels}ch`);
        techSamplerate.innerText = `${fmtChunk.sampleRate.toLocaleString()} Hz`;
        techBits.innerText = `${fmtChunk.bitsPerSample}-bit`;
        
        const durationSeconds = dataChunk.size / fmtChunk.byteRate;
        techDuration.innerText = formatSeconds(durationSeconds);

        hideToast();
    } catch (error) {
        showToast("WAV 메타 분석 실패", error.message || "파일 헤더가 손상되었거나 인코딩이 비표준입니다.", "error");
        console.error(error);
    }
}

// Action Trigger for MP3 Conversion
convertBtn.addEventListener('click', () => {
    if (!selectedFile || !originalWavHeader) return;
    startMp3Conversion();
});

// Direct full WAV to MP3 Conversion pipeline
async function startMp3Conversion() {
    processingCard.classList.remove('hidden');
    resultCard.classList.add('hidden');
    resultAudioPlayer.src = '';
    
    // Adjust buttons status
    convertBtn.disabled = true;
    convertBtn.classList.add('opacity-50', 'cursor-not-allowed');
    clearFileBtn.classList.add('opacity-50', 'pointer-events-none');

    // Lazy initialize Web Audio API Context
    if (!audioCtxInstance) {
        audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)();
    }

    try {
        processingBar.style.width = '5%';
        processingPercent.innerText = '5%';
        processingMsg.innerText = "WAV 미디어 데이터를 해석하는 중...";

        // Read full file ArrayBuffer
        const originalBuffer = await selectedFile.arrayBuffer();

        processingBar.style.width = '15%';
        processingPercent.innerText = '15%';
        processingMsg.innerText = "음질 PCM 소스 디코딩 프로세스 진입...";

        // Decode audio data to AudioBuffer
        const decodedAudio = await audioCtxInstance.decodeAudioData(originalBuffer);

        processingBar.style.width = '30%';
        processingPercent.innerText = '30%';
        processingMsg.innerText = "MP3 인코더 최적화 설정 구축...";

        const bitrate = parseInt(bitrateSelect.value);
        
        // Asynchronous, UI-friendly chunked LameJS encoding
        convertedMp3Blob = await encodeMP3Async(decodedAudio, bitrate, (percent) => {
            const mappedProgress = Math.round(30 + (percent * 0.7)); // scale progress from 30% to 100%
            processingBar.style.width = `${mappedProgress}%`;
            processingPercent.innerText = `${mappedProgress}%`;
            processingMsg.innerText = `MP3 압축 인코딩 데이터 프레임 전송 진행률: ${percent}%`;
        });

        // Display results on finish
        finishConversion();

    } catch (err) {
        console.error("Conversion failed:", err);
        showToast("변환 에러 발생", "브라우저 메모리 한계 혹은 손상된 WAV 오디오 주소 사유로 인하여 오류가 생성되었습니다.", "error");
        resetProcessingUI();
    }
}

/**
 * Asynchronous and non-blocking LameJS MP3 Encoder implementation
 */
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
        
        const leftSub = leftFloat.subarray(offset, end);
        const leftPCM = floatTo16BitPCM(leftSub);

        let mp3buf;
        if (channels > 1 && rightFloat) {
            const rightSub = rightFloat.subarray(offset, end);
            const rightPCM = floatTo16BitPCM(rightSub);
            mp3buf = mp3encoder.encodeBuffer(leftPCM, rightPCM);
        } else {
            mp3buf = mp3encoder.encodeBuffer(leftPCM);
        }

        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }

        offset = end;

        if (onProgress) {
            onProgress(Math.round((offset / totalSamples) * 100));
        }

        await new Promise(resolve => setTimeout(resolve, 8));
    }

    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
    }

    return new Blob(mp3Data, { type: 'audio/mp3' });
}

// Float to standard Signed Int16 conversion helper
function floatTo16BitPCM(input) {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
}

// Finish conversion phase
function finishConversion() {
    processingBar.style.width = `100%`;
    processingPercent.innerText = `100%`;
    processingMsg.innerText = "MP3 파일 캡슐화 완료!";
    
    setTimeout(() => {
        processingCard.classList.add('hidden');
        
        const originalNameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
        const outName = `${originalNameWithoutExt}.mp3`;
        
        resultFilename.innerText = outName;
        sizeBefore.innerText = formatBytes(selectedFile.size);
        sizeAfter.innerText = formatBytes(convertedMp3Blob.size);

        const savings = Math.round(((selectedFile.size - convertedMp3Blob.size) / selectedFile.size) * 100);
        if (savings > 0) {
            savingBadge.innerText = `WAV 대비 -${savings}% 절감`;
            savingBadge.className = "bg-emerald-500 text-slate-950 font-extrabold text-[11px] px-2 py-1 rounded-lg";
        } else {
            savingBadge.innerText = `인코딩 정밀 필터 적용`;
            savingBadge.className = "bg-indigo-500 text-white font-bold text-[11px] px-2 py-1 rounded-lg";
        }

        const blobUrl = URL.createObjectURL(convertedMp3Blob);
        resultAudioPlayer.src = blobUrl;

        downloadMp3Btn.href = blobUrl;
        downloadMp3Btn.download = outName;

        resultCard.classList.remove('hidden');
        resetProcessingUI();
        
        showToast("MP3 변환 완료!", "고음질 단일 MP3 파일 생성이 완벽하게 종료되었습니다.", "success");
    }, 600);
}

function resetProcessingUI() {
    convertBtn.disabled = false;
    convertBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    clearFileBtn.classList.remove('opacity-50', 'pointer-events-none');
}

// Copy Entire App Source Code to Clipboard
copySourceBtn.addEventListener('click', () => {
    try {
        const fullHTML = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
        
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = fullHTML;
        tempTextArea.style.top = "0";
        tempTextArea.style.left = "0";
        tempTextArea.style.position = "fixed";
        tempTextArea.style.opacity = "0";
        document.body.appendChild(tempTextArea);
        
        tempTextArea.focus();
        tempTextArea.select();
        
        const isSuccessful = document.execCommand('copy');
        document.body.removeChild(tempTextArea);

        if (isSuccessful) {
            showToast(
                "클립보드 복사 성공!", 
                "코드가 복사되었습니다. 메모장을 열고 붙여넣은 뒤, 인코딩을 'UTF-8'로 설정하고 'wav_to_mp3_converter.html'로 저장하세요.", 
                "success"
            );
        } else {
            throw new Error("브라우저 복사 트리거 오류");
        }
    } catch (error) {
        console.error(error);
        showToast("복사 실패", "단축키 사용 또는 우측 프리뷰의 원본 코드를 전체 복사해 주세요.", "error");
    }
});

// Direct HTML Self-Download
downloadAppBtn.addEventListener('click', () => {
    try {
        const fullHTML = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
        const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        
        const tempLink = document.createElement('a');
        tempLink.href = blobUrl;
        tempLink.download = 'wav_to_mp3_converter.html';
        document.body.appendChild(tempLink);
        tempLink.click();
        
        document.body.removeChild(tempLink);
        URL.revokeObjectURL(blobUrl);

        showToast("앱 다운로드 완료", "'wav_to_mp3_converter.html' 파일이 로컬 다운로드 폴더에 안전하게 저장되었습니다.", "success");
    } catch (error) {
        console.error(error);
        showToast("다운로드 에러", "앱 파일을 내보내는 중 오류가 발생했습니다.", "error");
    }
});