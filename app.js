document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    let timerInterval = null;
    let timerSeconds = 0;

    // --- БЛОК 1: ФУНКЦИИ-РЕНДЕРЕРЫ (создают HTML для экранов) ---

    function renderHomeScreen() {
        let moduleButtonsHTML = appData.modules.map(module => `
            <button class="module-button" data-action="open-module" data-module-id="${module.id}">
                ${module.title}
                <span class="module-subtitle">${module.subtitle}</span>
            </button>
        `).join('');

        let globalToolsButtonsHTML = appData.globalTools.map(tool => `
            <button class="menu-item-button global-tool-button" data-action="open-global-tool" data-tool-id="${tool.id}">
                ${tool.title}
            </button>
        `).join('');

        appContainer.innerHTML = `
            <div id="home-screen" class="screen active">
                <header class="home-header">
                    <div class="logo">🧠💡❤️</div>
                    <h1>Справочник психолога-консультанта</h1>
                    <p class="app-subtitle">ШПК VIII</p>
                    <p class="author-credit">С любовью 🫶 volodinmv</p>
                </header>
                <main class="home-main">
                    <div class="module-list">${moduleButtonsHTML}</div>
                    <hr class="section-divider">
                    <div class="global-tools-list">${globalToolsButtonsHTML}</div>
                </main>
            </div>
        `;
    }

    function renderModuleMenu(moduleId) {
        const module = appData.modules.find(m => m.id === moduleId);
        if (!module) return renderHomeScreen();
        let sectionButtonsHTML = module.sections.map(section => `
            <button class="menu-item-button" data-action="open-section" data-module-id="${moduleId}" data-section-id="${section.id}">
                ${section.title}
            </button>
        `).join('');
        appContainer.innerHTML = `<div id="module-menu-screen" class="screen active"><header><h2>${module.title}</h2></header><main class="menu-list">${sectionButtonsHTML}</main><footer><button class="nav-button" data-action="go-home">🏠 Домой</button></footer></div>`;
    }

    function renderContentScreen(moduleId, sectionId) {
        const module = appData.modules.find(m => m.id === moduleId);
        const section = module ? module.sections.find(s => s.id === sectionId) : null;
        if (!section) return renderHomeScreen();
        appContainer.innerHTML = `<div id="content-screen" class="screen content-screen active"><header><h2>${section.title}</h2></header><main>${section.content}</main><footer><button class="nav-button" data-action="open-module" data-module-id="${moduleId}">⬅️ Назад</button><button class="nav-button" data-action="go-home">🏠 Домой</button></footer></div>`;
    }

    function renderEmotionScreen() {
        const tool = appData.globalTools.find(t => t.id === 'emotions');
        if (!tool) return renderHomeScreen();
        const categories = Object.keys(tool.data);
        const firstCategoryKey = categories[0];
        let categoryButtonsHTML = categories.map((catKey, index) => { const category = tool.data[catKey]; return `<button class="emotion-category-btn ${index === 0 ? 'active' : ''}" data-category="${catKey}">${category.label}</button>`; }).join('');
        appContainer.innerHTML = `<div id="emotions-screen" class="screen content-screen active"><header><h2>${tool.title}</h2></header><main><div class="emotion-tabs-container">${categoryButtonsHTML}</div><div id="emotion-content-container"></div></main><footer><button class="nav-button" data-action="go-home">🏠 Домой</button></footer></div>`;
        renderEmotionContent(firstCategoryKey);
        attachEmotionScreenLogic();
    }

    function renderEmotionContent(categoryKey) {
        const toolData = appData.globalTools.find(t => t.id === 'emotions').data;
        const categoryData = toolData[categoryKey];
        const contentContainer = document.getElementById('emotion-content-container');
        if (!categoryData || !contentContainer) return;
        let subTabsHTML = `<button class="emotion-sub-tab-btn active" data-sub-content="emotions">Эмоции</button>`;
        if (categoryData.states) subTabsHTML += `<button class="emotion-sub-tab-btn" data-sub-content="states">Мысли/Состояния</button>`;
        if (categoryData.fears) subTabsHTML += `<button class="emotion-sub-tab-btn" data-sub-content="fears">Виды страха</button>`;
        let contentPanesHTML = `<div class="emotion-list active" data-pane="emotions">${categoryData.emotions}</div>`;
        if (categoryData.states) contentPanesHTML += `<div class="emotion-list" data-pane="states">${categoryData.states}</div>`;
        if (categoryData.fears) contentPanesHTML += `<div class="emotion-list" data-pane="fears">${categoryData.fears}</div>`;
        contentContainer.innerHTML = `<div class="emotion-sub-tabs">${subTabsHTML}</div><div class="emotion-panes-container">${contentPanesHTML}</div>`;
    }

    function renderSessionConstructor() {
        const tool = appData.globalTools.find(t => t.id === 'sessionConstructor');
        if (!tool) return renderHomeScreen();
        let stageButtonsHTML = tool.data.map((stage, index) => `<button class="stage-button ${index === 0 ? 'active' : ''}" data-stage-id="${stage.id}">${index + 1}</button>`).join('');
        appContainer.innerHTML = `<div id="constructor-screen" class="screen content-screen active"><div class="constructor-header"><div class="timer"><span id="timer-display">00:00</span><div class="timer-controls"><button id="timer-start-pause">▶️ Старт</button><button id="timer-reset">🔄 Сброс</button></div></div><div id="current-stage-indicator" class="current-stage"></div><div id="current-stage-purpose" class="current-stage-purpose"></div></div><main class="constructor-main" id="constructor-main"></main><footer class="constructor-footer"><div class="stage-selector">${stageButtonsHTML}</div><button class="nav-button" id="reset-all-checkboxes">Сбросить отметки</button><button class="nav-button" data-action="go-home">🏠 Домой</button></footer></div>`;
        attachConstructorLogic();
    }

    // --- БЛОК 2: ЛОГИКА ДЛЯ ИНТЕРАКТИВНЫХ ЭЛЕМЕНТОВ ---

    function attachEmotionScreenLogic() {
        const mainTabs = appContainer.querySelectorAll('.emotion-category-btn');
        if (!mainTabs.length) return;
        mainTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                if (tab.classList.contains('active')) return;
                mainTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderEmotionContent(tab.dataset.category);
            });
        });
        const emotionContentContainer = document.getElementById('emotion-content-container');
        if (emotionContentContainer) {
            emotionContentContainer.addEventListener('click', (event) => {
                const subTab = event.target.closest('.emotion-sub-tab-btn');
                if (!subTab || subTab.classList.contains('active')) return;
                const subContentId = subTab.dataset.subContent;
                emotionContentContainer.querySelectorAll('.emotion-sub-tab-btn').forEach(btn => btn.classList.remove('active'));
                subTab.classList.add('active');
                emotionContentContainer.querySelectorAll('.emotion-list').forEach(pane => pane.classList.remove('active'));
                const targetPane = emotionContentContainer.querySelector(`.emotion-list[data-pane="${subContentId}"]`);
                if (targetPane) targetPane.classList.add('active');
            });
        }
    }

    function attachConstructorLogic() {
        const toolData = appData.globalTools.find(t => t.id === 'sessionConstructor').data;
        const mainContent = document.getElementById('constructor-main');
        const stageIndicator = document.getElementById('current-stage-indicator');
        const purposeIndicator = document.getElementById('current-stage-purpose');
        const stageButtons = document.querySelectorAll('.stage-button');

        function renderStageContent(stageId) {
            const stage = toolData.find(s => s.id === stageId);
            if (!stage || !stageIndicator || !mainContent || !purposeIndicator) return;

            stageIndicator.textContent = stage.title;
            purposeIndicator.innerHTML = stage.purpose;
            mainContent.innerHTML = stage.content;

            mainContent.scrollTop = 0; // Принудительно сбрасываем прокрутку контента

            const allCheckboxes = mainContent.querySelectorAll('input[type="checkbox"]');
            allCheckboxes.forEach(checkbox => {
                const key = checkbox.dataset.storageKey;
                if (localStorage.getItem(key) === 'true') {
                    checkbox.checked = true;
                    const container = checkbox.closest('.checklist-item');
                    if (container) container.classList.add('checked');
                }
            });
        }

        stageButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (button.classList.contains('active')) return;
                stageButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                renderStageContent(button.dataset.stageId);
            });
        });

        if (mainContent) {
            mainContent.addEventListener('change', event => {
                const checkbox = event.target;
                if (checkbox.type === 'checkbox') {
                    const key = checkbox.dataset.storageKey;
                    localStorage.setItem(key, checkbox.checked);
                    const container = checkbox.closest('.checklist-item');
                    if (container) container.classList.toggle('checked', checkbox.checked);
                }
            });
        }

        const timerDisplay = document.getElementById('timer-display');
        const startPauseBtn = document.getElementById('timer-start-pause');
        const resetBtn = document.getElementById('timer-reset');

        function updateTimerDisplay() {
            if (!timerDisplay) return;
            const minutes = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
            const seconds = (timerSeconds % 60).toString().padStart(2, '0');
            timerDisplay.textContent = `${minutes}:${seconds}`;
        }

        if (startPauseBtn) {
            startPauseBtn.addEventListener('click', () => {
                if (timerInterval) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    startPauseBtn.textContent = '▶️ Старт';
                } else {
                    startPauseBtn.textContent = '⏸️ Пауза';
                    timerInterval = setInterval(() => {
                        timerSeconds++;
                        updateTimerDisplay();
                    }, 1000);
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                clearInterval(timerInterval);
                timerInterval = null;
                timerSeconds = 0;
                updateTimerDisplay();
                if (startPauseBtn) startPauseBtn.textContent = '▶️ Старт';
            });
        }

        const resetCheckboxesBtn = document.getElementById('reset-all-checkboxes');
        if (resetCheckboxesBtn) {
            resetCheckboxesBtn.addEventListener('click', () => {
                toolData.forEach(stage => {
                    const stageContentDOM = new DOMParser().parseFromString(stage.content, 'text/html');
                    stageContentDOM.querySelectorAll('[data-storage-key]').forEach(el => {
                        localStorage.removeItem(el.dataset.storageKey);
                    });
                });
                const currentActiveButton = document.querySelector('.stage-button.active');
                if (currentActiveButton) renderStageContent(currentActiveButton.dataset.stageId);
            });
        }

        if (toolData.length > 0) {
            renderStageContent(toolData[0].id);
        }
    }

    // --- ГЛАВНЫЙ ОБРАБОТЧИК СОБЫТИЙ ---
    appContainer.addEventListener('click', (event) => {
        const targetButton = event.target.closest('button');
        if (!targetButton) return;
        const action = targetButton.dataset.action;
        if (!action) return;
        event.preventDefault();
        const moduleId = targetButton.dataset.moduleId;
        const sectionId = targetButton.dataset.sectionId;
        const toolId = targetButton.dataset.toolId;
        switch (action) {
            case 'go-home': renderHomeScreen(); break;
            case 'open-module': renderModuleMenu(moduleId); break;
            case 'open-section': renderContentScreen(moduleId, sectionId); break;
            case 'open-global-tool':
                if (toolId === 'emotions') renderEmotionScreen();
                if (toolId === 'sessionConstructor') renderSessionConstructor();
                break;
        }
    });

    // --- ПЕРВЫЙ ЗАПУСК ---
    renderHomeScreen();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(reg => console.log('SW registered.', reg)).catch(err => console.error('SW registration failed:', err));
  });
}
