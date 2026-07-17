// ==================== GLOBAL STATE ====================

const editorState = {
    currentTab: 'editor',
    selectedClip: null,
    isPlaying: false,
    currentTime: 0,
    totalTime: 9,
    timelineZoom: 1,
    clips: [],
};

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    initializeEditor();
    setupEventListeners();
});

function initializeEditor() {
    // Initialize clips
    editorState.clips = [
        { id: 'clip-1', name: 'start.png', duration: 3, type: 'video' },
        { id: 'clip-2', name: 'AFTER POSTER.png', duration: 3, type: 'video' },
        { id: 'clip-3', name: 'scary_house.png', duration: 3, type: 'video' },
        { id: 'clip-4', name: 'intro-music.mp3', duration: 9, type: 'audio' },
    ];
    
    updateTimeDisplay();
    console.log('🎬 Haunt-Pulse Editor Initialized');
}

function setupEventListeners() {
    // Drag and drop for clips
    document.querySelectorAll('.clip').forEach(clip => {
        clip.addEventListener('dragstart', handleClipDragStart);
        clip.addEventListener('dragend', handleClipDragEnd);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Window resize
    window.addEventListener('resize', handleWindowResize);
}

// ==================== TAB NAVIGATION ====================

function showTab(tabName) {
    editorState.currentTab = tabName;
    console.log(`📂 Switched to ${tabName} tab`);
    
    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.style.opacity = '0.6';
    });
    event.target.style.opacity = '1';
}

// ==================== PREVIEW CONTROLS ====================

function togglePreviewPlay() {
    const previewImg = document.getElementById('preview-img');
    const previewVideo = document.getElementById('preview-video');
    
    if (editorState.isPlaying) {
        previewVideo.pause();
        editorState.isPlaying = false;
    } else {
        // Cycle through preview images
        const images = ['start.png', 'AFTER POSTER.png', 'scary_house.png'];
        const currentIndex = images.indexOf(previewImg.src.split('/').pop());
        const nextIndex = (currentIndex + 1) % images.length;
        
        previewImg.src = images[nextIndex];
        console.log(`🎞️ Preview: ${images[nextIndex]}`);
    }
}

function resetPreview() {
    const previewImg = document.getElementById('preview-img');
    previewImg.src = 'start.png';
    editorState.isPlaying = false;
    console.log('🔄 Preview reset');
}

function toggleFullscreen() {
    const videoDisplay = document.querySelector('.video-display');
    if (videoDisplay.requestFullscreen) {
        videoDisplay.requestFullscreen();
    }
}

// ==================== TIMELINE CONTROLS ====================

function playTimeline() {
    editorState.isPlaying = true;
    console.log('▶️ Timeline playing');
    animateTimelinePlayhead();
}

function pauseTimeline() {
    editorState.isPlaying = false;
    console.log('⏸ Timeline paused');
}

function stopTimeline() {
    editorState.isPlaying = false;
    editorState.currentTime = 0;
    updateTimeDisplay();
    movePlayhead(0);
    console.log('⏹ Timeline stopped');
}

function animateTimelinePlayhead() {
    if (!editorState.isPlaying) return;
    
    editorState.currentTime += 0.03;
    if (editorState.currentTime >= editorState.totalTime) {
        stopTimeline();
        return;
    }
    
    updateTimeDisplay();
    const percentagePosition = (editorState.currentTime / editorState.totalTime) * 100;
    movePlayhead(percentagePosition);
    
    requestAnimationFrame(animateTimelinePlayhead);
}

function movePlayhead(percentage) {
    const playhead = document.querySelector('.timeline-playhead');
    const timelineContent = document.querySelector('.timeline-content');
    const scrollWidth = timelineContent.scrollWidth;
    playhead.style.left = (scrollWidth * percentage / 100) + 'px';
}

function updateTimeDisplay() {
    const currentMinutes = Math.floor(editorState.currentTime / 60);
    const currentSeconds = Math.floor(editorState.currentTime % 60);
    const totalMinutes = Math.floor(editorState.totalTime / 60);
    const totalSeconds = Math.floor(editorState.totalTime % 60);
    
    document.getElementById('current-time').textContent = 
        `${String(currentMinutes).padStart(2, '0')}:${String(currentSeconds).padStart(2, '0')}`;
    document.getElementById('total-time').textContent = 
        `${String(totalMinutes).padStart(2, '0')}:${String(totalSeconds).padStart(2, '0')}`;
}

function zoomTimelineIn() {
    editorState.timelineZoom = Math.min(editorState.timelineZoom + 0.2, 3);
    updateTimelineZoom();
    console.log(`🔍 Zoom in: ${(editorState.timelineZoom * 100).toFixed(0)}%`);
}

function zoomTimelineOut() {
    editorState.timelineZoom = Math.max(editorState.timelineZoom - 0.2, 0.5);
    updateTimelineZoom();
    console.log(`🔍 Zoom out: ${(editorState.timelineZoom * 100).toFixed(0)}%`);
}

function fitTimeline() {
    editorState.timelineZoom = 1;
    updateTimelineZoom();
    console.log('📏 Timeline fitted to view');
}

function updateTimelineZoom() {
    const timelineTracks = document.querySelector('.timeline-tracks');
    timelineTracks.style.transform = `scaleX(${editorState.timelineZoom})`;
    timelineTracks.style.transformOrigin = '0 0';
}

// ==================== CLIP MANAGEMENT ====================

function selectClip(clipElement) {
    // Remove previous selection
    document.querySelectorAll('.clip').forEach(clip => {
        clip.classList.remove('selected');
    });
    
    // Add selection to current clip
    clipElement.classList.add('selected');
    editorState.selectedClip = clipElement;
    
    // Update properties panel
    updatePropertiesPanel(clipElement);
    console.log(`✂️ Clip selected: ${clipElement.textContent}`);
}

function updatePropertiesPanel(clipElement) {
    const propertiesContent = document.getElementById('properties-content');
    const clipLabel = clipElement.querySelector('.clip-label').textContent;
    const clipDuration = clipElement.querySelector('.clip-duration').textContent;
    
    propertiesContent.innerHTML = `
        <div class="form-group">
            <label>Clip Name</label>
            <input type="text" value="${clipLabel}" class="input-field">
        </div>
        <div class="form-group">
            <label>Duration</label>
            <input type="text" value="${clipDuration}" class="input-field">
        </div>
        <div class="form-group">
            <label>Opacity</label>
            <input type="range" min="0" max="100" value="100" class="input-field" style="height: 6px; cursor: pointer;">
        </div>
        <div class="form-group">
            <label>Scale</label>
            <input type="range" min="50" max="150" value="100" class="input-field" style="height: 6px; cursor: pointer;">
        </div>
    `;
}

function handleClipDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
    console.log('🖱️ Dragging clip');
}

function handleClipDragEnd(e) {
    console.log('✅ Clip dropped');
}

// ==================== EFFECTS & TRANSITIONS ====================

function applyEffect(effectName) {
    if (!editorState.selectedClip) {
        alert('Please select a clip first');
        return;
    }
    
    console.log(`✨ Applied effect: ${effectName}`);
    
    // Visual feedback
    const effectBtn = event.target;
    effectBtn.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.6)';
    setTimeout(() => {
        effectBtn.style.boxShadow = '';
    }, 300);
    
    // Show notification
    showNotification(`${effectName.toUpperCase()} effect applied!`);
}

function addEffect() {
    applyEffect('glow');
}

function applyTransition(transitionName) {
    if (!editorState.selectedClip) {
        alert('Please select a clip first');
        return;
    }
    
    console.log(`🎬 Applied transition: ${transitionName}`);
    showNotification(`${transitionName.toUpperCase()} transition added!`);
}

function addTransition() {
    applyTransition('fade');
}

// ==================== MEDIA IMPORT ====================

function importMedia() {
    console.log('📁 Import media dialog opened');
    showNotification('Media import dialog - drag & drop or select files');
}

function selectAsset(assetElement) {
    document.querySelectorAll('.asset-item').forEach(item => {
        item.style.borderColor = 'var(--glass-border)';
    });
    
    assetElement.style.borderColor = 'var(--accent-red)';
    const assetName = assetElement.querySelector('span').textContent;
    console.log(`📎 Asset selected: ${assetName}`);
    showNotification(`Asset selected: ${assetName}`);
}

// ==================== EXPORT ====================

function exportProject() {
    openModal('export-modal');
}

function confirmExport() {
    console.log('📤 Exporting project...');
    showNotification('Export started - your project is being processed...');
    closeModal('export-modal');
    
    // Simulate export progress
    setTimeout(() => {
        showNotification('✅ Export complete! File ready for download.');
    }, 2000);
}

function exportPreset() {
    console.log('💾 Saving preset...');
    showNotification('Preset saved successfully!');
}

// ==================== MODAL MANAGEMENT ====================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        console.log(`🔓 Modal opened: ${modalId}`);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        console.log(`🔒 Modal closed: ${modalId}`);
    }
}

// Close modal on background click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        const modalId = e.target.id;
        closeModal(modalId);
    }
});

// ==================== KEYBOARD SHORTCUTS ====================

function handleKeyboardShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
            case 's':
                e.preventDefault();
                console.log('💾 Save shortcut (Ctrl+S)');
                break;
            case 'z':
                e.preventDefault();
                console.log('↩️ Undo shortcut (Ctrl+Z)');
                break;
            case 'y':
                e.preventDefault();
                console.log('↪️ Redo shortcut (Ctrl+Y)');
                break;
        }
    }
    
    // Space for play/pause
    if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        if (editorState.isPlaying) {
            pauseTimeline();
        } else {
            playTimeline();
        }
    }
}

// ==================== UTILITIES ====================

function showNotification(message) {
    console.log(`💬 ${message}`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, rgba(255, 0, 0, 0.2), rgba(200, 0, 0, 0.1));
        border: 1px solid var(--accent-red);
        color: var(--text-primary);
        padding: 12px 16px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 2000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 0 15px rgba(255, 0, 0, 0.3);
        font-family: 'Courier New', monospace;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function handleWindowResize() {
    console.log(`🖼️ Window resized: ${window.innerWidth}x${window.innerHeight}`);
}

// ==================== ANIMATIONS ====================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== CONSOLE GREETING ====================

console.log(`
%c🎬 HAUNT-PULSE VIDEO EDITOR v1.0.0 🎬
%c3D Horror Video Editor Interface
%cReady to create nightmares...

%cShortcuts:
%cSpace - Play/Pause
%cCtrl+S - Save
%cCtrl+Z - Undo
%cCtrl+Y - Redo
`, 
'font-size: 18px; color: #ff0000; font-weight: bold; text-shadow: 0 0 10px #ff0000;',
'font-size: 14px; color: #cc0000;',
'font-size: 12px; color: #999999;',
'font-size: 12px; color: #999999;',
'font-size: 11px; color: #ff6b6b;',
'font-size: 11px; color: #ff6b6b;',
'font-size: 11px; color: #ff6b6b;',
'font-size: 11px; color: #ff6b6b;'
);

// ==================== AUTO-INITIALIZE EDITOR EXPERIENCE ====================

// Show blinking eyes on preview after a delay
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('👀 Blinking eyes activated');
    }, 500);
});
