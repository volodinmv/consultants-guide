// Этот основной блок ждет, пока весь HTML-документ будет загружен,
// прежде чем запускать код, который строит интерфейс и управляет им.
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');

    // --- БЛОК 1: ФУНКЦИИ-РЕНДЕРЕРЫ ---
    // Эти функции отвечают за создание HTML-кода для каждого экрана.
    // Они берут данные из data.js и превращают их в видимые элементы.

    // Создает главный экран с выбором модулей
    function renderHomeScreen() {
        let moduleButtonsHTML = appData.map(module => `
            <button class="module-button" data-action="open-module" data-module-id="${module.id}">
                ${module.title}
                <span class="module-subtitle">${module.subtitle}</span>
            </button>
        `).join('');

        appContainer.innerHTML = `
            <div id="home-screen" class="screen">
                <header class="home-header">
                    <div class="logo">🧠💡❤️</div>
                    <h1>Справочник психолога-консультанта</h1>
                    <!-- Подзаголовок удален по вашему запросу -->
                </header>
                <main class="module-list">${moduleButtonsHTML}</main>
            </div>
        `;
    }

    // Создает экран меню для конкретного модуля
    function renderModuleMenu(moduleId) {
        const module = appData.find(m => m.id === moduleId);
        if (!module) {
            renderHomeScreen(); // Безопасность: если модуль не найден, возвращаемся домой
            return;
        }

        let sectionButtonsHTML = module.sections.map(section => `
            <button class="menu-item-button" data-action="open-section" data-module-id="${moduleId}" data-section-id="${section.id}">
                ${section.title}
            </button>
        `).join('');

        appContainer.innerHTML = `
            <div id="module-menu-screen" class="screen">
                <header><h2>${module.title}</h2></header>
                <main class="menu-list">${sectionButtonsHTML}</main>
                <footer>
                    <button class="nav-button" data-action="go-home">🏠 Домой</button>
                </footer>
            </div>
        `;
    }

    // Создает экран с контентом для конкретного раздела
    function renderContentScreen(moduleId, sectionId) {
        const module = appData.find(m => m.id === moduleId);
        const section = module ? module.sections.find(s => s.id === sectionId) : null;
        if (!section) {
            renderHomeScreen(); // Безопасность: если секция не найдена, возвращаемся домой
            return;
        }

        appContainer.innerHTML = `
            <div id="content-screen" class="screen content-screen">
                <header><h2>${section.title}</h2></header>
                <main>${section.content}</main>
                <footer>
                    <button class="nav-button" data-action="open-module" data-module-id="${moduleId}">⬅️ Назад</button>
                    <button class="nav-button" data-action="go-home">🏠 Домой</button>
                </footer>
            </div>
        `;

        // После отрисовки контента, проверяем, не словарь ли это эмоций.
        // Если да, то "оживляем" его, добавляя обработчики событий.
        if (sectionId === 'emotions') {
            attachEmotionDictionaryLogic();
        }
    }

    // --- БЛОК 2: ЛОГИКА ДЛЯ ИНТЕРАКТИВНЫХ ЭЛЕМЕНТОВ ---

    // Эта функция находит кнопки и списки в словаре эмоций и заставляет их работать.
    function attachEmotionDictionaryLogic() {
        const emotionCategoryButtons = appContainer.querySelectorAll('.emotion-category-btn');
        const emotionLists = appContainer.querySelectorAll('.emotion-list');

        emotionCategoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetEmotionListId = button.dataset.emotionTarget;
                const targetEmotionList = appContainer.querySelector(`#${targetEmotionListId}`);

                if (targetEmotionList) {
                    emotionCategoryButtons.forEach(btn => btn.classList.remove('active'));
                    emotionLists.forEach(list => list.classList.remove('active'));
                    button.classList.add('active');
                    targetEmotionList.classList.add('active');
                }
            });
        });
    }

    // --- БЛОК 3: ГЛАВНЫЙ ОБРАБОТЧИК СОБЫТИЙ ---
    // Это "центральный пульт управления" навигацией. Он слушает все клики
    // внутри нашего приложения и решает, что делать дальше.

    appContainer.addEventListener('click', (event) => {
        const targetButton = event.target.closest('button');
        if (!targetButton) return; // Если клик был не по кнопке, ничего не делаем

        const action = targetButton.dataset.action;
        const moduleId = targetButton.dataset.moduleId;
        const sectionId = targetButton.dataset.sectionId;

        // В зависимости от "команды" в data-action, вызываем нужную функцию-рендер
        switch (action) {
            case 'go-home':
                renderHomeScreen();
                break;
            case 'open-module':
                renderModuleMenu(moduleId);
                break;
            case 'open-section':
                renderContentScreen(moduleId, sectionId);
                break;
        }
    });

    // --- БЛОК 4: ПЕРВЫЙ ЗАПУСК ПРИЛОЖЕНИЯ ---
    // Когда весь код загружен, мы вызываем эту функцию, чтобы показать самый первый, домашний экран.
    renderHomeScreen();
});


// --- БЛОК 5: РЕГИСТРАЦИЯ SERVICE WORKER (для PWA) ---
// Этот код отвечает за установку и работу приложения в офлайн-режиме.
// Он выполняется отдельно от основной логики приложения.

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js') // Убедитесь, что путь правильный
      .then((reg) => {
        console.log('Service worker зарегистрирован успешно.', reg);
      })
      .catch((err) => {
        console.error('Ошибка при регистрации Service worker:', err);
      });
  });
}