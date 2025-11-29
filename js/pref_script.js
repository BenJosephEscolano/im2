lucide.createIcons();

// ---- PREFERENCES PAGE LOGIC ----
let activeTimeMode = 'start'; // 'start' or 'end'
let startTimeVal = 9;
let endTimeVal = 6;

function toggleDay(btn) {
    if (btn.classList.contains('bg-gray-200')) {
        btn.classList.remove('bg-gray-200', 'text-gray-500');
        btn.classList.add('bg-[#FACC15]', 'text-gray-900', 'shadow-sm');
    } else {
        btn.classList.add('bg-gray-200', 'text-gray-500');
        btn.classList.remove('bg-[#FACC15]', 'text-gray-900', 'shadow-sm');
    }
}

function toggleAccordion(id) {
    const el = document.getElementById(id);
    const icon = document.getElementById('icon-' + id);
    if (el.classList.contains('hidden')) {
        el.classList.remove('hidden');
        icon.classList.add('rotate-180');
    } else {
        el.classList.add('hidden');
        icon.classList.remove('rotate-180');
    }
}

function generateClockNumbers() {
    const clockFace = document.getElementById('clock-face');
    const radius = 80;
    const center = 100;

    for (let i = 1; i <= 12; i++) {
        const angleRad = i * 30 * Math.PI / 180;
        const x = center + radius * Math.sin(angleRad);
        const y = center - radius * Math.cos(angleRad);

        const el = document.createElement('div');
        el.className = 'clock-number';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.innerText = i;
        el.onclick = () => setClockTime(i);

        clockFace.appendChild(el);
    }

    // Initial render positions
    updateClockHands();
}

function selectTimeMode(mode) {
    activeTimeMode = mode;

    // Visual Update for Inputs
    document.getElementById('group-start').classList.toggle('active', mode === 'start');
    document.getElementById('group-end').classList.toggle('active', mode === 'end');
}

function setClockTime(hour) {
    // Update value based on active mode
    if (activeTimeMode === 'start') {
        startTimeVal = hour;
    } else {
        endTimeVal = hour;
    }

    updateClockHands();
    updateInputFields();
}

function updateClockHands() {
    // Start Hand
    let startDeg = (startTimeVal * 30) - 90; // -90 offset because 0deg is 3 o'clock
    document.getElementById('clock-hand-start').style.transform = `rotate(${startDeg}deg)`;

    // End Hand
    let endDeg = (endTimeVal * 30) - 90;
    document.getElementById('clock-hand-end').style.transform = `rotate(${endDeg}deg)`;
}

function updateInputFields() {
    const startInput = document.getElementById('pref-start-time');
    const endInput = document.getElementById('pref-end-time');

    // Simple heuristic for AM/PM for this demo
    const formatTime = (h) => {
        const suffix = (h >= 9 && h != 12) ? 'A.M.' : 'P.M.';
        return `${h}:00 ${suffix}`;
    }

    startInput.value = formatTime(startTimeVal);
    endInput.value = formatTime(endTimeVal);
}

function finishOnboarding() {
    const prefView = document.getElementById('preferences-view');
    const dashView = document.getElementById('dashboard-view');

    prefView.style.opacity = '0';
    prefView.style.pointerEvents = 'none';

    dashView.style.opacity = '1';
    dashView.style.pointerEvents = 'auto';

    setTimeout(() => {
        prefView.style.display = 'none';
    }, 500);
}

function openPreferences() {
    const prefView = document.getElementById('preferences-view');
    const dashView = document.getElementById('dashboard-view');

    prefView.style.display = 'flex';
    setTimeout(() => {
        prefView.style.opacity = '1';
        prefView.style.pointerEvents = 'auto';
        dashView.style.opacity = '0.5';
        dashView.style.pointerEvents = 'none';
    }, 10);
}


// ---- DASHBOARD DATA & LOGIC ----

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

let appData = {
    tasks: [
        { id: 1, title: "Task #2", date: new Date(currentYear, currentMonth, 4), color: "bg-blue-100 text-blue-600", completed: false },
        { id: 2, title: "Meeting", date: new Date(currentYear, currentMonth, 4), color: "bg-purple-100 text-purple-600", completed: false },
        { id: 3, title: "Task #3", date: new Date(currentYear, currentMonth, 5), color: "bg-orange-100 text-orange-600", completed: false },
        { id: 4, title: "Review", date: new Date(currentYear, currentMonth, 12), color: "bg-red-100 text-red-600", completed: false },
        { id: 5, title: "Quotes", date: new Date(currentYear, currentMonth, 17), color: "bg-blue-50 text-blue-400", completed: false },
        { id: 6, title: "Lab", date: new Date(currentYear, currentMonth, 22), color: "bg-green-100 text-green-600", completed: false },
        { id: 7, title: "Task #1", date: new Date(currentYear, currentMonth, 29), color: "bg-orange-100 text-orange-600", completed: false }
    ]
};

const reportsSidebar = document.getElementById('reports-sidebar');
const tasksSidebar = document.getElementById('tasks-sidebar');
const showSidebarBtn = document.getElementById('show-sidebar-btn');
const navReports = document.getElementById('nav-reports');
const navTasks = document.getElementById('nav-tasks');

function switchView(viewName) {
    const activeClass = "bg-gray-100 text-gray-900";
    const inactiveClass = "text-gray-600 hover:bg-gray-50";
    const setNavState = (el, active) => {
        if(!el) return;
        if(active) {
            el.className = `w-full flex items-center gap-3 px-4 py-3 rounded-lg group ${activeClass}`;
            el.querySelector('i').className = "w-5 h-5 text-gray-900";
        } else {
            el.className = `w-full flex items-center gap-3 px-4 py-3 rounded-lg group ${inactiveClass}`;
            el.querySelector('i').className = "w-5 h-5 text-gray-400 group-hover:text-gray-900";
        }
    }

    if (viewName === 'reports') {
        reportsSidebar.classList.remove('sidebar-hidden');
        tasksSidebar.classList.add('sidebar-hidden');
        showSidebarBtn.classList.add('hidden');
        setNavState(navReports, true);
        setNavState(navTasks, false);
    } else if (viewName === 'tasks') {
        reportsSidebar.classList.add('sidebar-hidden');
        tasksSidebar.classList.remove('sidebar-hidden');
        showSidebarBtn.classList.add('hidden');
        setNavState(navReports, false);
        setNavState(navTasks, true);
        renderTaskList();
    }
}

function closeSidebars() {
    reportsSidebar.classList.add('sidebar-hidden');
    tasksSidebar.classList.add('sidebar-hidden');
    showSidebarBtn.classList.remove('hidden');
}

let draftTaskId = null;

function openTaskModal() {
    const overlay = document.getElementById('modal-overlay');
    const titleInput = document.getElementById('modal-task-title');
    const dateInput = document.getElementById('modal-task-date');

    draftTaskId = Date.now();
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    dateInput.value = todayStr;
    titleInput.value = '';

    appData.tasks.push({
        id: draftTaskId,
        title: "New Task",
        date: today,
        color: "bg-gray-800 text-white",
        completed: false,
        isDraft: true
    });

    overlay.classList.remove('hidden');
    titleInput.focus();
    generateCalendar();
}

function updateDraftTask() {
    if (!draftTaskId) return;
    const titleInput = document.getElementById('modal-task-title');
    const dateInput = document.getElementById('modal-task-date');
    const taskIndex = appData.tasks.findIndex(t => t.id === draftTaskId);
    if (taskIndex === -1) return;

    const dateVal = dateInput.value;
    let newDate = new Date();
    if (dateVal) {
        const dateParts = dateVal.split('-');
        newDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    }

    appData.tasks[taskIndex].title = titleInput.value || "New Task";
    appData.tasks[taskIndex].date = newDate;
    generateCalendar();
}

function cancelTaskModal() {
    if (draftTaskId) appData.tasks = appData.tasks.filter(t => t.id !== draftTaskId);
    document.getElementById('modal-overlay').classList.add('hidden');
    generateCalendar();
    draftTaskId = null;
}

function saveTaskModal() {
    const taskIndex = appData.tasks.findIndex(t => t.id === draftTaskId);
    if (taskIndex !== -1) {
        if (!document.getElementById('modal-task-title').value) appData.tasks[taskIndex].title = "Untitled Task";
        delete appData.tasks[taskIndex].isDraft;
        appData.tasks[taskIndex].color = "bg-gray-200 text-gray-700";
    }
    document.getElementById('modal-overlay').classList.add('hidden');
    renderTaskList();
    generateCalendar();
    draftTaskId = null;
}

function renderTaskList() {
    const container = document.getElementById('task-list-container');
    container.innerHTML = '';
    const visibleTasks = appData.tasks.filter(t => !t.isDraft);
    visibleTasks.forEach(task => {
        const dateStr = task.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const div = document.createElement('div');
        div.className = "flex items-center gap-3 p-2 hover:bg-gray-50 rounded group cursor-pointer";
        div.innerHTML = `
            <div class="relative flex items-center"><input type="checkbox" ${task.completed ? 'checked' : ''} class="peer w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"></div>
            <div class="flex-1 min-w-0"><p class="text-sm font-medium text-gray-700 truncate ${task.completed ? 'line-through text-gray-400' : ''}">${task.title}</p><p class="text-xs text-gray-400">${dateStr}</p></div>
            <div class="opacity-0 group-hover:opacity-100 flex gap-1"><button class="text-gray-400 hover:text-blue-600 p-1"><i data-lucide="edit-2" class="w-3 h-3"></i></button></div>
        `;
        container.appendChild(div);
    });
    lucide.createIcons();
}

const calendarGrid = document.getElementById('calendar-grid');
const monthTitle = document.getElementById('calendar-title-month');
const yearTitle = document.getElementById('calendar-title-year');
const reportDateHeader = document.getElementById('report-date-header');
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function generateCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    monthTitle.textContent = months[month];
    yearTitle.textContent = year;
    reportDateHeader.textContent = `${months[month].substring(0, 3)} ${today}, ${year}`;

    const firstDayOfMonth = new Date(year, month, 1);
    let startDay = firstDayOfMonth.getDay();
    let daysToBacktrack = startDay === 0 ? 6 : startDay - 1;
    let currentDate = new Date(year, month, 1 - daysToBacktrack);

    const weeksToRender = 6;
    const totalWorkDays = weeksToRender * 5;

    let htmlContent = '';
    let cellsRendered = 0;
    let iterations = 0;

    while (cellsRendered < totalWorkDays && iterations < 100) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const isToday = currentDate.getDate() === today && currentDate.getMonth() === month && currentDate.getFullYear() === year;
            const dateNum = currentDate.getDate();
            const isCurrentMonth = currentDate.getMonth() === month;
            const cellYear = currentDate.getFullYear();
            const cellMonth = currentDate.getMonth();

            const textClass = isCurrentMonth ? 'text-gray-900' : 'text-gray-400';
            const fontClass = isToday ? 'font-bold' : 'font-medium';
            const cellClass = isToday ? 'today-highlight' : 'bg-white';

            const tasksForDay = appData.tasks.filter(t => t.date.getDate() === dateNum && t.date.getMonth() === cellMonth && t.date.getFullYear() === cellYear);
            let taskHtml = '';
            tasksForDay.slice(0, 3).forEach((task, index) => {
                taskHtml += `<div class="text-[10px] px-2 py-1 rounded font-medium ${task.color} mt-1 truncate" title="${task.title}">${task.title}</div>`;
            });
            if (tasksForDay.length > 3) taskHtml += `<div class="text-[9px] text-gray-400 mt-1 pl-1">+${tasksForDay.length - 3} more</div>`;

            htmlContent += `
                <div class="calendar-cell ${cellClass} group cursor-pointer relative">
                    <span class="${textClass} ${fontClass} text-sm mb-1 group-hover:text-blue-600">${dateNum}</span>
                    <div class="w-full mt-auto">${taskHtml}</div>
                </div>
            `;
            cellsRendered++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
        iterations++;
    }
    calendarGrid.innerHTML = htmlContent;
}

// Initialize
generateClockNumbers(); // Call the clock generation logic
generateCalendar();
renderTaskList();