const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

// Global reference to window object
let win;

function createWindow() {
    win = new BrowserWindow({width:800, height:600, icon:__dirname+'/assets/icon.png'});
    
    // Load index.html
    win.loadURL(url.format({
        pathname: path.join(__dirname, '/src/html/index.html'),
        //pathname: path.resolve('/index.html'),
        protocol: 'file',
        slashes: true
    }));

    // Open devtools. Only for development
    win.webContents.openDevTools();

    // Close window
    win.on('closed', () => {
        win = null;
    });

}

// Runs createWindow on launch
app.on('ready', createWindow);

// Quit when all windows closed
app.on('window-all-closed', () => {
    // Check if user is on mac
    //It is common for mac programs to stay open until user explicitly quits with Cmd-Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});