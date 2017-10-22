const {Menu, MenuItem, Tray, dialog, BrowserWindow} = require('electron');
const openAboutWindow = require('electron-about-window').default;
const path = require('path');

exports.menu = false;
exports.win = false;
exports.menuItems = false;
exports.tray = false;
exports.debug = false;

exports.MENU_ABOUT = 0;
exports.MENU_EDIT = 1;
exports.MENU_VIEW = 2;
exports.MENU_NAVIGATION = 3;
exports.MENU_FAVORITES = 4;
exports.MENU_WINDOW = 5;
exports.MENU_HELP = 6;

exports.startMenus = function(app, win, debug) {

    this.win = win;
    this.debug = debug;
    this.menuItems = []

    this.tray =  new Tray(path.join(__dirname, '../assets/ta_menubar.png'));
    this.tray.setToolTip('Trading View')

    this.menuItems[this.MENU_EDIT]={
        label: 'Edit',
        submenu: [
            {role: 'undo'},
            {role: 'redo'},
            {type: 'separator'},
            {role: 'cut'},
            {role: 'copy'},
            {role: 'paste'},
            {role: 'pasteandmatchstyle'},
            {role: 'delete'},
            {role: 'selectall'}
        ]
    };

    this.menuItems[this.MENU_VIEW]={
        label: 'View',
        submenu: [
            {role: 'reload'},
            {
                label: 'Ideas',
                click () {
                    win.webContents.send("message", ['go','https://www.tradingview.com/ideas/']);
                }
            },
            {role: 'togglefullscreen'}
        ]
    };

    this.menuItems[this.MENU_NAVIGATION]={
        label: 'Navigation',
        submenu: [
            {
                label: 'Markets',
                click () {
                    win.webContents.send("message", ['go','https://www.tradingview.com/markets/']);
                }
            },
            {
                label: 'Ideas',
                click () {
                    win.webContents.send("message", ['go','https://www.tradingview.com/ideas/']);
                }
            },
            {
                label: 'Scripts',
                click () {
                    win.webContents.send("message", ['go','https://www.tradingview.com/scripts/']);
                }
            }
        ]
    };

    this.menuItems[this.MENU_FAVORITES]={
        label: 'Charts',
        submenu: [
            {
                label: 'None',
                enabled: false
            }
        ]
    };

    this.menuItems[this.MENU_WINDOW]={
        role: 'window',
        submenu: [
            {role: 'minimize'},
            {role: 'close'}
        ]
    };

    this.menuItems[this.MENU_HELP]={
        role: 'help',
        submenu: [
            {
                label: 'How It Works',
                click () { require('electron').shell.openExternal('https://www.tradingview.com/how-it-works/') }
            },
            {
                label: 'Help & Wiki',
                click () { require('electron').shell.openExternal('https://www.tradingview.com/wiki/Main_Page') }
            },
            {
                label: 'FAQ',
                click () { require('electron').shell.openExternal('https://www.tradingview.com/wiki/FAQ') }
            },
            {
                label: 'Blog',
                click () { require('electron').shell.openExternal('https://blog.tradingview.com/en/') }
            }
        ]
    };

    if(debug) {
        this.menuItems[this.MENU_HELP].submenu.push({type: 'separator'});
        this.menuItems[this.MENU_HELP].submenu.push({
            label: 'Developer Tools',
            click () {
                win.webContents.openDevTools();
            }

        });
    }

    if (process.platform === 'darwin') {
        this.menuItems[this.MENU_ABOUT]={
            label: app.getName(),
            submenu: [
                {
                    label: 'About',
                    click: () => openAboutWindow({
                        icon_path: path.join(__dirname, '../assets/ta.png'),
                        bug_report_url: false,
                        license: false,
                        description: 'TradingView is a social network for traders and investors',
                        copyright: 'Non Official',
                        homepage: 'https://github.com/celso/tradingviewapp'
                    }),
                },
                {type: 'separator'},
                {
                    label: 'Settings',
                    submenu: [
                        {
                            label: 'My Account',
                            click () {
                                win.webContents.send("message", ['settings','myaccount']);
                            }
                        }
                    ]
                },
                {type: 'separator'},
                {role: 'services', submenu: []},
                {type: 'separator'},
                {role: 'hide'},
                {role: 'hideothers'},
                {role: 'unhide'},
                {type: 'separator'},
                {
                    label: 'Logout',
                    click () { win.webContents.send("message", ['menu','logout']); }
                },
                {
                    label: 'Quit',
                    accelerator: 'CommandOrControl+q',
                    click () {
                        app.quit();
                        app.exit();
                    }
                },
            ]
        };

        // Edit menu
        this.menuItems[this.MENU_EDIT].submenu.push(
            {type: 'separator'},
            {
                label: 'Speech',
                submenu: [
                    {role: 'startspeaking'},
                    {role: 'stopspeaking'}
                ]
            }
        )

        // Window menu
        this.menuItems[this.MENU_WINDOW].submenu = [
            {role: 'close'},
            {role: 'minimize'},
            {role: 'zoom'},
            {type: 'separator'},
            {role: 'front'}
        ]
    }

    this.menu = Menu.buildFromTemplate(this.menuItems)
    Menu.setApplicationMenu(this.menu);
}

exports.rebuildTrayItems = function(md) {

    var win = this.win;

    var items = [
        {label: 'Open app', click () { win.show(); }}
    ];

    this.tray.setContextMenu(
        Menu.buildFromTemplate(items)
    );

}

exports.addCharts = function(f) {

    this.menuItems[4].submenu = [];
    var win = this.win;
    var clickHandler = function(url) {
        return(function() { win.webContents.send("message", ['chart', url]) });
    }
    for(var i in f) {

        var click = clickHandler(f[i].url);
        this.menuItems[this.MENU_FAVORITES].submenu.push({
            label: f[i].name,
            type: 'checkbox',
            // checked: f[i].exch_name == curr_exchange && f[n].mkt_name == curr_market ? true : false,
            click: click
        });

    }
    this.menu = Menu.buildFromTemplate(this.menuItems)
    Menu.setApplicationMenu(this.menu);
}

exports.itemEnable = function(a,b,v) {
    this.menu.items[a].submenu.items[b].enabled = v;
}

exports.itemEnableAll = function(a,v) {
    for(var i in this.menu.items[a].submenu.items) {
        this.menu.items[a].submenu.items[i].enabled = v;
    }
}
