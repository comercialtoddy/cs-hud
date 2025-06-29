const { app, BrowserWindow } = require('electron')

app.on('ready', () => {
	const browserWindow = new BrowserWindow({
		alwaysOnTop: true,
		transparent: true,
		frame: false,
		fullscreen: true,
		titleBarStyle: 'hidden',
		show: false, // Não mostrar até carregar
		backgroundColor: '#00000000', // Fundo transparente
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			backgroundThrottling: false // Manter ativo em background
		}
	})

	// Remover menu completamente
	browserWindow.setMenuBarVisibility(false)
	browserWindow.setIgnoreMouseEvents(true)
	
	// Carregar e mostrar apenas quando pronto
	browserWindow.loadURL(`http://${process.env.HOST || 'localhost'}:${process.env.PORT || 31982}/hud?transparent`)
	
	browserWindow.once('ready-to-show', () => {
		browserWindow.show()
	})
	
	browserWindow.on('closed', () => app.quit())
})

app.on('window-all-closed', () => {
	app.quit()
})
