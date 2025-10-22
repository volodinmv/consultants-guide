document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');

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

        appContainer.innerHTML = `
            <div id="module-menu-screen" class="screen active">
                <header><h2>${module.title}</h2></header>
                <main class="menu-list">${sectionButtonsHTML}</main>
                <footer><button class="nav-button" data-action="go-home">🏠 Домой</button></footer>
            </div>
        `;
    }

    function renderContentScreen(moduleId, sectionId) {
        const module = appData.modules.find(m => m.id === moduleId);
        const section = module ? module.sections.find(s => s.id === sectionId) : null;
        if (!section) return renderHomeScreen();

        appContainer.innerHTML = `
            <div id="content-screen" class="screen content-screen active">
                <header><h2>${section.title}</h2></header>
                <main>${section.content}</main>
                <footer>
                    <button class="nav-button" data-action="open-module" data-module-id="${moduleId}">⬅️ Назад</button>
                    <button class="nav-button" data-action="go-home">🏠 Домой</button>
                </footer>
            </div>
        `;
    }

    function renderEmotionScreen() {
        const tool = appData.globalTools.find(t => t.id === 'emotions');
        if (!tool) return renderHomeScreen();

        const categories = Object.keys(tool.data);
        const firstCategoryKey = categories[0];

        let categoryButtonsHTML = categories.map((catKey, index) => {
            const category = tool.data[catKey];
            return `<button class="emotion-category-btn ${index === 0 ? 'active' : ''}" data-category="${catKey}">${category.label}</button>`;
        }).join('');

        appContainer.innerHTML = `
            <div id="emotions-screen" class="screen content-screen active">
                <header><h2>${tool.title}</h2></header>
                <main>
                    <div class="emotion-tabs-container">${categoryButtonsHTML}</div>
                    <div id="emotion-content-container"></div>
                </main>
                <footer><button class="nav-button" data-action="go-home">🏠 Домой</button></footer>
            </div>
        `;

        renderEmotionContent(firstCategoryKey);
        attachEmotionScreenLogic();
    }

    function renderEmotionContent(categoryKey) {
        const toolData = appData.globalTools.find(t => t.id === 'emotions').data;
        const categoryData = toolData[categoryKey];
        const contentContainer = document.getElementById('emotion-content-container');
        if (!categoryData || !contentContainer) return;

        let subTabsHTML = `<button class="emotion-sub-tab-btn active" data-sub-content="emotions">Эмоции</button>`;
        if (categoryData.states) {
            subTabsHTML += `<button class="emotion-sub-tab-btn" data-sub-content="states">Мысли/Состояния</button>`;
        }
        if (categoryData.fears) {
            subTabsHTML += `<button class="emotion-sub-tab-btn" data-sub-content="fears">Виды страха</button>`;
        }

        let contentPanesHTML = `<div class="emotion-list active" data-pane="emotions">${categoryData.emotions}</div>`;
        if (categoryData.states) {
            contentPanesHTML += `<div class="emotion-list" data-pane="states">${categoryData.states}</div>`;
        }
        if (categoryData.fears) {
            contentPanesHTML += `<article class="extra-info emotion-list" data-pane="fears"><h4>10 основных видов страха</h4>${categoryData.fears}</article>`;
        }

        contentContainer.innerHTML = `<div class="emotion-sub-tabs">${subTabsHTML}</div><div class="emotion-panes-container">${contentPanesHTML}</div>`;
    }

    function attachEmotionScreenLogic() {
        const mainTabs = appContainer.querySelectorAll('.emotion-category-btn');

        mainTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                mainTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const categoryKey = tab.dataset.category;
                renderEmotionContent(categoryKey);
            });
        });

        // Используем делегирование событий для саб-табов, так как они перерисовываются
        const emotionContentContainer = document.getElementById('emotion-content-container');
        if (emotionContentContainer) {
            emotionContentContainer.addEventListener('click', (event) => {
                if (event.target.classList.contains('emotion-sub-tab-btn')) {
                    const subTab = event.target;
                    const subContentId = subTab.dataset.subContent;

                    emotionContentContainer.querySelectorAll('.emotion-sub-tab-btn').forEach(btn => btn.classList.remove('active'));
                    subTab.classList.add('active');

                    emotionContentContainer.querySelectorAll('.emotion-list').forEach(pane => pane.classList.remove('active'));
                    emotionContentContainer.querySelector(`.emotion-list[data-pane="${subContentId}"]`).classList.add('active');
                }
            });
        }
    }

    appContainer.addEventListener('click', (event) => {
        const targetButton = event.target.closest('button');
        if (!targetButton) return;

        const action = targetButton.dataset.action;
        if (!action) return;

        const moduleId = targetButton.dataset.moduleId;
        const sectionId = targetButton.dataset.sectionId;
        const toolId = targetButton.dataset.toolId;

        switch (action) {
            case 'go-home': renderHomeScreen(); break;
            case 'open-module': renderModuleMenu(moduleId); break;
            case 'open-section': renderContentScreen(moduleId, sectionId); break;
            case 'open-global-tool':
                if (toolId === 'emotions') renderEmotionScreen();
                break;
        }
    });

    renderHomeScreen();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(reg => console.log('SW registered.', reg)).catch(err => console.error('SW registration failed:', err));
  });
}
