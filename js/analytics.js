// ---- DATA STATE ----
// Initialize with the data from the mock
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

// Initialize Lucide Icons
lucide.createIcons();

// ---- VIEW CONTROLLER ----
const reportsSidebar = document.getElementById('reports-sidebar');
const tasksSidebar = document.getElementById('tasks-sidebar');
const showSidebarBtn = document.getElementById('show-sidebar-btn');
const navReports = document.getElementById('nav-reports');
const navTasks = document.getElementById('nav-tasks');

function switchView(viewName) {
    // Reset Nav Styles
    const activeClass = "bg-gray-100 text-gray-900";
    const inactiveClass = "text-gray-600 hover:bg-gray-50";

    // Helper to set class
    const setNavState = (el, active) => {
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
        renderTaskList(); // Ensure list is fresh
    } else {
        // Calendar only / Close sidebars (Optional logic)
    }
}

function closeSidebars() {
    reportsSidebar.classList.add('sidebar-hidden');
    tasksSidebar.classList.add('sidebar-hidden');
    showSidebarBtn.classList.remove('hidden');
}

// ---- MODAL & REAL-TIME PREVIEW LOGIC ----

let draftTaskId = null; // Track the ID of the task currently being edited/created

function openTaskModal() {
    const overlay = document.getElementById('modal-overlay');
    const titleInput = document.getElementById('modal-task-title');
    const dateInput = document.getElementById('modal-task-date');

    // 1. Create a Draft Task ID
    draftTaskId = Date.now();

    // 2. Set Default Values (Today)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    dateInput.value = todayStr;
    titleInput.value = '';

    // 3. Insert Draft Task into State (Empty title for now)
    appData.tasks.push({
        id: draftTaskId,
        title: "New Task", // Default placeholder for grid
        date: today,
        color: "bg-gray-800 text-white", // Distinguishable color for draft
        completed: false,
        isDraft: true // Flag to identify it
    });

    // 4. Show Modal
    overlay.classList.remove('hidden');
    titleInput.focus();

    // 5. Render to show the "New Task" immediately on the grid
    generateCalendar();
}

function updateDraftTask() {
    if (!draftTaskId) return;

    const titleInput = document.getElementById('modal-task-title');
    const dateInput = document.getElementById('modal-task-date');

    // Find the draft task
    const taskIndex = appData.tasks.findIndex(t => t.id === draftTaskId);
    if (taskIndex === -1) return;

    // Parse Date
    const dateVal = dateInput.value;
    let newDate = new Date();
    if (dateVal) {
        const dateParts = dateVal.split('-');
        newDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    }

    // Update State
    appData.tasks[taskIndex].title = titleInput.value || "New Task"; // Fallback text
    appData.tasks[taskIndex].date = newDate;

    // Re-render Calendar to show changes in REAL TIME
    generateCalendar();
}

function cancelTaskModal() {
    // Remove the draft task from state
    if (draftTaskId) {
        appData.tasks = appData.tasks.filter(t => t.id !== draftTaskId);
    }

    closeModal();
    generateCalendar(); // Re-render to remove the ghost task
    draftTaskId = null;
}

function saveTaskModal() {
    // Find draft and make it permanent (remove isDraft flag)
    const taskIndex = appData.tasks.findIndex(t => t.id === draftTaskId);
    if (taskIndex !== -1) {
        // If title is empty, maybe give default?
        if (!document.getElementById('modal-task-title').value) {
            appData.tasks[taskIndex].title = "Untitled Task";
        }
        delete appData.tasks[taskIndex].isDraft;
        // Change color to regular color
        appData.tasks[taskIndex].color = "bg-gray-200 text-gray-700";
    }

    closeModal();
    renderTaskList(); // Update the sidebar list
    generateCalendar();
    draftTaskId = null;
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}


// ---- TASK MANAGEMENT ----

function renderTaskList() {
    const container = document.getElementById('task-list-container');
    container.innerHTML = '';

    // Filter out drafts from the list view (only show saved tasks in the list)
    const visibleTasks = appData.tasks.filter(t => !t.isDraft);

    visibleTasks.forEach(task => {
        const dateStr = task.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const div = document.createElement('div');
        div.className = "flex items-center gap-3 p-2 hover:bg-gray-50 rounded group cursor-pointer";
        div.innerHTML = `
                    <div class="relative flex items-center">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} class="peer w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500 cursor-pointer">
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-700 truncate ${task.completed ? 'line-through text-gray-400' : ''}">${task.title}</p>
                        <p class="text-xs text-gray-400">${dateStr}</p>
                    </div>
                    <div class="opacity-0 group-hover:opacity-100 flex gap-1">
                        <button class="text-gray-400 hover:text-blue-600 p-1"><i data-lucide="edit-2" class="w-3 h-3"></i></button>
                    </div>
                `;
        container.appendChild(div);
    });
    lucide.createIcons();
}


// ---- CALENDAR LOGIC ----

const calendarGrid = document.getElementById('calendar-grid');
const monthTitle = document.getElementById('calendar-title-month');
const yearTitle = document.getElementById('calendar-title-year');
const reportDateHeader = document.getElementById('report-date-header');

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function generateCalendar() {
    const now = new Date(); // In real app, this would be based on selected state
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    // Set Header
    monthTitle.textContent = months[month];
    yearTitle.textContent = year;

    // Set Report Date to Today
    reportDateHeader.textContent = `${months[month].substring(0, 3)} ${today}, ${year}`;

    // Logic to generate the "Month View" (Mon - Sun)

    const firstDayOfMonth = new Date(year, month, 1);

    let startDay = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)

    // Logic: Calculate how many days back to the previous Monday.
    // If startDay is 0 (Sunday), we need to go back 6 days to Monday.
    // If startDay is 1 (Monday), we go back 0 days.
    let daysToBacktrack = startDay === 0 ? 6 : startDay - 1;

    // Start date for the grid
    let currentDate = new Date(year, month, 1 - daysToBacktrack);

    // We will render 6 weeks to cover the month completely
    const weeksToRender = 6;
    const totalDays = weeksToRender * 7; // CHANGED: 7 days per week

    let htmlContent = '';
    let cellsRendered = 0;
    let iterations = 0;

    while (cellsRendered < totalDays && iterations < 100) {
        // CHANGED: Removed check that skipped weekends (if dayOfWeek >= 1 && dayOfWeek <= 5)

        const isToday = currentDate.getDate() === today && currentDate.getMonth() === month && currentDate.getFullYear() === year;
        const dateNum = currentDate.getDate();
        const isCurrentMonth = currentDate.getMonth() === month;
        const cellYear = currentDate.getFullYear();
        const cellMonth = currentDate.getMonth();

        // Style classes
        const textClass = isCurrentMonth ? 'text-gray-900' : 'text-gray-400';
        const fontClass = isToday ? 'font-bold' : 'font-medium';
        const cellClass = isToday ? 'today-highlight' : 'bg-white';

        // Find tasks for this specific date
        const tasksForDay = appData.tasks.filter(t => {
            return t.date.getDate() === dateNum &&
                t.date.getMonth() === cellMonth &&
                t.date.getFullYear() === cellYear;
        });

        let taskHtml = '';
        // Limit to 3 tasks visually to prevent overflow
        tasksForDay.slice(0, 3).forEach((task, index) => {
            // Just use mt-1 for simplicity in stacking
            taskHtml += `<div class="text-[10px] px-2 py-1 rounded font-medium ${task.color} mt-1 truncate" title="${task.title}">${task.title}</div>`;
        });

        if (tasksForDay.length > 3) {
            taskHtml += `<div class="text-[9px] text-gray-400 mt-1 pl-1">+${tasksForDay.length - 3} more</div>`
        }

        htmlContent += `
                    <div class="calendar-cell ${cellClass} group cursor-pointer relative">
                        <span class="${textClass} ${fontClass} text-sm mb-1 group-hover:text-blue-600">${dateNum}</span>
                        <div class="w-full mt-auto">
                            ${taskHtml}
                        </div>
                    </div>
                `;

        cellsRendered++;

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
        iterations++;
    }

    calendarGrid.innerHTML = htmlContent;
}

// Run on load
generateCalendar();
renderTaskList(); // Render initial list