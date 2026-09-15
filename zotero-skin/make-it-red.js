MakeItRed = {
	id: null,
	version: null,
	rootURI: null,
	initialized: false,
	addedElementIDs: [],
	
	init({ id, version, rootURI }) {
		if (this.initialized) return;
		this.id = id;
		this.version = version;
		this.rootURI = rootURI;
		this.initialized = true;
	},
	
	log(msg) {
		Zotero.debug("Make It Red: " + msg);
	},
	
	addToWindow(window) {
		let doc = window.document;
		
		// Add a stylesheet to the main Zotero pane
		let link1 = doc.createElement('link');
		link1.id = 'make-it-red-stylesheet';
		link1.type = 'text/css';
		link1.rel = 'stylesheet';
		link1.href = this.rootURI + 'style.css';
		doc.documentElement.appendChild(link1);
		this.storeAddedElement(link1);
		
		// Use Fluent for localization
		window.MozXULElement.insertFTLIfNeeded("make-it-red.ftl");
		
		// Add menu option
		let menuitem = doc.createXULElement('menuitem');
		menuitem.id = 'make-it-green-instead';
		menuitem.setAttribute('type', 'checkbox');
		menuitem.setAttribute('data-l10n-id', 'make-it-red-green-instead');
		// MozMenuItem#checked is available in Zotero 7
		menuitem.addEventListener('command', () => {
			MakeItRed.toggleGreen(window, menuitem.checked);
		});
		doc.getElementById('menu_viewPopup').appendChild(menuitem);
		this.storeAddedElement(menuitem);

		// Hide some items we don't want to show in the main menu
		[
		'menu_addByIdentifier',
		'menu_newCollection',
		'column-picker-submenu',
		'menu_groupAdd',
		'menu_feedAddFromOPML',
		'menu_feedAddFromURL',
		'menu_feedAddMenu',
		'menu_importFromClipboard',
		'show-tabs-menu',
		'view-menuitem-recursive-collections',
		'menu_rtfScan',
		'installConnector',
		//'developer-menu',
		'troubleshooting',
		'feedbackPage',
		'reportErrors',
		//'debug-output-menu',
		'menuitem-restart-in-troubleshooting-mode'].forEach(id => {
			let el = doc.getElementById(id);
			if (el) el.hidden = true;
		});

		// Hide some items we don't want to show in the "New Item" submenu

		let newItemMenu = doc.getElementById('menu_newItem');
		if (newItemMenu) {
			let popup = newItemMenu.querySelector('menupopup');
			if (popup) {
				let itemsToHide = [
				"Book",
				"Book Section",
				"Document",
				"Journal Article",
				"Newspaper Article",
				"Audio Recording",
				"Case",
				"E-mail",
				"Encyclopedia Article",
				"Film",
				"Forum Post",
				"Hearing",
				"Instant Message",
				"Interview",
				"Magazine Article",
				"Manuscript",
				"Map",
				"Patent",
				"Podcast",
				"Preprint",
				"Radio Broadcast",
				"Report",
				"Software",
				"Standard",
				"Statute",
				"Thesis",
				"TV Broadcast",
				"Video Recording",
				"Conference Paper",
				"Dataset"
			];
				popup.addEventListener('popupshowing', function() {
					itemsToHide.forEach(label => {
						let item = this.querySelector(`[label="${label}"]`);
						if (item) item.hidden = true;
					});
					// Rename some items we do want to show
					let renameBill = this.querySelector('[label="Bill"]');
    				if (renameBill) renameBill.setAttribute('label', 'Product');
					let renamePresentation = this.querySelector('[label="Presentation"]');
    				if (renamePresentation) renamePresentation.setAttribute('label', 'Event');
					let renameLetter = this.querySelector('[label="Letter"]');
    				if (renameLetter) renameLetter.setAttribute('label', 'Contact info');
					let renameArtist = this.querySelector('[label="Dictionary Entry"]');
    				if (renameArtist) renameArtist.setAttribute('label', 'Artist');
					
				});
			
			}
		};

		// Hide some items in the info box on the right when an item is selected. We have to use alet targetText = "Dictionary Title";
		
		// Plain old polling – hides the field every half second
		// Fields hidden for every item type
		const HIDE_FOR_ALL = [
			'Volume', '# of Volumes', 'Edition', 'Publisher', 'Pages', 'ISBN',
			'Citation Key', 'Accessed', 'Archive', 'Loc. in Archive',
			'Short Title', 'Language', 'Library Catalog', 'License',
			'Dictionary Title', 'Series', 'Series Number', 'Call Number',
			'Rights', 'Rights URI', 'URL', 'Meeting Name', 'Session Title',
			'Website Type', 'ISSN', 'Sponsor', 'Code Volume', 'Section',
			'Code Pages', 'Legislative Body', 'Session', 'History'
		];

		// Fields hidden only for specific item types
		const HIDE_FOR_TYPE = {
			letter:           ['Author', 'Title', 'Date', 'Event Place', 'DOI'],
			dictionaryEntry:  ['Title', 'DOI'],
			presentation:     ['Type', 'DOI'],
			bill:             ['DOI', 'Extra', 'Date']
		};
		// Hide some items in the toolbar
		[
			"zotero-tb-add",
			"zotero-tb-note-add",
			"zotero-tb-lookup",
			"zotero-tb-attachment-add"
		].forEach(id => {
			let el = doc.getElementById(id);
			if (el) el.style.display = "none";
		});
		// Hide some items in the  context menu
		setInterval(() => {
			let pane = Zotero.getActiveZoteroPane();
			if (!pane) return;

			let items = pane.getSelectedItems();
			if (!items.length) return;

			let typeName = Zotero.ItemTypes.getName(items[0].itemTypeID);
			let typeSpecific = HIDE_FOR_TYPE[typeName] || [];

			const RENAME = {
				dictionaryEntry: { 'Author': 'Full Name' }
			};
			let renamesForType = RENAME[typeName] || {};

			let rows = window.document.querySelectorAll('#zotero-editpane-info-box .meta-row');
			for (let row of rows) {
				let text = row.textContent.trim();
				if (HIDE_FOR_ALL.includes(text) || typeSpecific.includes(text)) {
					row.hidden = true;
					continue;
				}
				if (renamesForType[text]) {
					    let label = row.querySelector('.meta-label');
    if (label) label.innerHTML = label.innerHTML.replace(text, renamesForType[text]);
				}
			}
		}, 250);

	},
	
	addToAllWindows() {
		var windows = Zotero.getMainWindows();	
		for (let win of windows) {
			if (!win.ZoteroPane) continue;
			this.addToWindow(win);
		}
	},
	
	storeAddedElement(elem) {
		if (!elem.id) {
			throw new Error("Element must have an id");
		}
		this.addedElementIDs.push(elem.id);
	},
	
	removeFromWindow(window) {
		var doc = window.document;
		// Remove all elements added to DOM
		for (let id of this.addedElementIDs) {
			doc.getElementById(id)?.remove();
		}
		doc.querySelector('[href="make-it-red.ftl"]').remove();
	},
	
	removeFromAllWindows() {
		var windows = Zotero.getMainWindows();
		for (let win of windows) {
			if (!win.ZoteroPane) continue;
			this.removeFromWindow(win);
		}
	},
	
	toggleGreen(window, enabled) {
		window.document.documentElement
			.toggleAttribute('data-green-instead', enabled);
	},
	
	async main() {
		// Global properties are included automatically in Zotero 7
		var host = new URL('https://foo.com/path').host;
		this.log(`Host is ${host}`);
		
		// Retrieve a global pref
		this.log(`Intensity is ${Zotero.Prefs.get('extensions.make-it-red.intensity', true)}`);
	},
};
