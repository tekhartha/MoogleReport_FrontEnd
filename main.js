const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');

// Global reference to window object
let win;
// New message window
let newMsgWin;
// Message center window
let msgWin;

// Main window of application
function createMainWindow() {
    win = new BrowserWindow({width:800, height:600, title: 'Moogle Mail', icon:__dirname+'/assets/icon.png'});
    
    // Load index.html
    win.loadURL(url.format({
        pathname: path.join(__dirname, '/src/html/register.html'),
        //pathname: path.resolve('/index.html'),
        protocol: 'file',
        slashes: true
    }));

    // Open devtools. Only for development
    win.webContents.openDevTools();

    // Close window
    win.on('closed', () => {
        //win = null;

        // Close entire application when main window is closed.
        // Prevents child windows from keeping the application hanging.
        app.quit();
    });

}

// Chat window for new message
function createNewChatWindow() {
    newMsgWin = new BrowserWindow({width:600, height:400, title: 'New chat'});
    
    // Load index.html
    newMsgWin.loadURL(url.format({
        pathname: path.join(__dirname, '/src/html/newChat.html'),
        protocol: 'file',
        slashes: true
    }));

    newMsgWin.on('closed', () => {
        win = null;
    });
} 

// Window to read messages
function createReadMessagesWindow() {
    msgWin = new BrowserWindow({width:600, height:400, title: 'Message Center'});
    
    // Load index.html
    msgWin.loadURL(url.format({
        pathname: path.join(__dirname, '/src/html/messageCenter.html'),
        protocol: 'file',
        slashes: true
    }));

    msgWin.on('closed', () => {
        win = null;
    });
}

// IPC functions
ipcMain.on('newChat', createNewChatWindow);
ipcMain.on('msgCenter', createReadMessagesWindow);

// Runs createWindow on launch
app.on('ready', createMainWindow);

// Quit when all windows closed
app.on('window-all-closed', () => {
    // Check if user is on mac
    //It is common for mac programs to stay open until user explicitly quits with Cmd-Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});