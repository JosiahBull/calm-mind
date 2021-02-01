const { app, BrowserWindow, Menu, Tray, MenuItem, ipcMain } = require('electron');
const Store = require('./store.js');
const fs = require('fs');
// Enable live reload for Electron too
require('electron-reload')(__dirname, {
    // Note that the path to electron may vary according to the main file
    electron: require(`${__dirname}/node_modules/electron`)
});

//Global Vars
const self_care_questions = [
    "brush my teeth?",
    "stretch today?",
    "exercise in the last 2 days?",
    "make my bed?",
    "open my blinds/curtains?",
    "eat at least 2 meals?",
    "get out of bed on time?",
    "get enough sleep?",
    "connect with friends?",
    "have enough water today?",
    "shower today?",
    "tidy up my space?",
    "try to minamlise my caffiene intake?",
    "go outside?",
    "connect with family?"
];
const provoking_questions = [
    "What am I grateful for today?",
    "Where have I been today, both physically and mentally?",
    "What progress have I made on my long term goals today?",
    "What was the best thing that happened to me today, and why?",
    "What was the best thing that I did for someone else today?",
    "What has been most on my mind today?",
    "What is the worst thing that happened to me today?",
    "Did I have a negative influence on anyone today? Should I talk to them?",
    "Have I failed to apologize for my actions today?",
    "Did I not put my foot down when I should have today? If so, when?",
    "What is one example of me standing up for my principals today?",
    "If I could remake one decision today, what would it be and why?"
];


//Helper Functions
function shuffle_array(array) { //Copied from https://stackoverflow.com/a/12646864
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

//Note that updating the tray like this is very hacky, and the engine in electron is not designed to do this. If this is changed in the future this should be rewritten to support live updates in a better way.
function update_tray() { 
    if (tray) tray.destroy();
    tray = new Tray('./icon-linux.png')
    tray.setToolTip('Diary Prompter')
    tray.on('click', () => create_quick_entry_window());
    tray.setContextMenu(Menu.buildFromTemplate([
        new MenuItem({label: 'Preferences'}),
        new MenuItem({
            label: `${(store.get('tracking') ? 'Enable' : 'Disable')} Program Tracking`,
            click: () => {
                store.set('tracking', !store.get('tracking'));
                update_tray();
            }
        }),
        new MenuItem({
            label: `${(store.get('reminders') ? 'Enable' : 'Disable')} Hourly Reminders`,
            click: () => {
                store.set('reminders', !store.get('reminders'));
                update_tray();
            }
        }),
        new MenuItem({
            label: 'Add Quick Entry',
            click: () => create_quick_entry_window()
        }),
        new MenuItem({
            label: 'Add Full Entry',
            click: () => create_diary_entry_window()
        }),
        new MenuItem({
            label: 'Quit',
            click: () => {
                app.isQutting = true;
                app.quit();
            }
        })
    ]));
}

//Create Classes
let tray;
const store = new Store({
    config_name: 'user-preferences',
    defaults: {
        tracking: true,
        reminders: true,
        self_care_questions_base: self_care_questions,
        remaining_self_care_questions: shuffle_array(self_care_questions),
        provoking_questions_base: provoking_questions,
        remaining_provoking_questions: shuffle_array(provoking_questions),
        windows: {
            diary_entry: {
                height: 600,
                width: 800
            },
            quick_entry: {
                height: 400,
                width: 325
            },
            options: {
                height: 600,
                width: 800
            }
        },
    }
});

//Window Creation Functions
function create_diary_entry_window(){
    const window = new BrowserWindow({
        width: store.get('windows.diary_entry.width'),
        height: store.get('windows.diary_entry.height'),
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        }
    });
    // window.setMenu(null);
    window.loadFile('./windows/diary_entry/index.html');
    window.on('close', () => {
        let size = window.getSize();
        store.set('windows.diary_entry.width', size[0]);
        store.set('window.diary_entry.height', size[1]);
    });
}

function create_quick_entry_window() {
    let window = new BrowserWindow({
        width: store.get('windows.quick_entry.width'),
        height: store.get('windows.quick_entry.height'),
        minWidth: 300,
        minHeight: 200,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
        transparent: true, 
        frame: false
    });
    window.setMenu(null);
    window.loadFile('./windows/quick_entry/index.html');
    window.on('close', () => {
        let size = window.getSize();
        store.set('windows.quick_entry.width', size[0]);
        store.set('window.quick_entry.height', size[1]);
    });
}

function create_options_window() {
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: true
        }
    })
    window.loadFile('./windows/options/index.html');
}

//Event Handlers
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
    update_tray();
})

//IPC Communication between processes
//Close window button backend
ipcMain.on('close-window', (event, args) => {

});

//Create confirmation dialog box for window.
ipcMain.on('create-confirmation', (event, args) => {

});

//Save quick entry
ipcMain.on('save_quick_entry', (event, args) => {
    console.log(args);
});

//Save full entry
ipcMain.on('save_entry', (event, args) => {
    console.log(args);
}); 

//Get self care questions
ipcMain.on('questions', (event, opts) => {
    const max_num = 1000;
    let result = [];
    let { type, number } = opts;
    let current_randomized_list, get_list, store_list;
    switch (type) {
        case 'provoking': {
            current_randomized_list = store.get('remaining_provoking_questions');
            get_list = () => store.get('provoking_questions_base');
            store_list = () => store.set('remaining_provoking_questions', current_randomized_list);
            break;
        }
        case 'self_care': {
            current_randomized_list = store.get('remaining_self_care_questions');
            get_list = () => store.get('self_care_questions_base');
            store_list = () => store.set('remaining_self_care_questions', current_randomized_list);
            break;
        }
        default: {
            throw new Error('Unknown question type requested, fatal error occured.');
        }
    }
    
    let counter = 0;
    while(result.length !== number) {
        if (current_randomized_list.length > 0) result.push(current_randomized_list.pop());
        else current_randomized_list = shuffle_array(get_list()).filter(item => !result.includes(item));
        if (counter++ > max_num) throw new Error('Infinite loop detected, fatal error occured.');
    }

    event.returnValue = result;

    store_list(); //Replace list with removed items.
});