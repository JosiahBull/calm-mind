const { app, BrowserWindow, Menu, Tray, MenuItem, ipcMain } = require('electron');
const Store = require('./store.js');
// Enable live reload for Electron too
require('electron-reload')(__dirname, {
    // Note that the path to electron may vary according to the main file
    electron: require(`${__dirname}/node_modules/electron`)
});

let tray;
const store = new Store({
    config_name: 'user-preferences',
    defaults: {
        tracking: true,
        reminders: true,
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
        }
    }
});

function create_diary_entry_window(){
    const window = new BrowserWindow({
        width: store.get('windows.diary_entry.width'),
        height: store.get('windows.diary_entry.height'),
        webPreferences: {
            contextIsolation: true
        }
    });
    window.loadFile('./windows/diary_entry/index.html');
}

function create_quick_entry_window() {
    console.log(store.get('windows.quick_entry.width'));
    let window = new BrowserWindow({
        width: store.get('windows.quick_entry.width'),
        height: store.get('windows.quick_entry.height'),
        minWidth: 300,
        minHeight: 200,
        webPreferences: {
            contextIsolation: true
        },
        transparent: true, 
        frame: false
    });
    window.setMenu(null);
    window.loadFile('./windows/quick_entry/index.html');
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
ipcMain.on('save-quick-entry', (event, args) => {

});

//Save full entry
ipcMain.on('save-full-entry', (event, args) => {

}); 