class SideNav {
    constructor (cur) {
        this.noteList = document.getElementById('note-list');
        this.defaultNoteTab = document.getElementById('note-tab');
        this.index = 0;
        this.cur = cur;

        this.initNoteTabs();
    }

    initNoteTabs() {
        while (this.noteList.childNodes.length > 1) {
            this.noteList.childNodes[this.noteList.childNodes.length - 1].remove();
        }
        window.electronAPI.getFiles().then((files) => {
            this.files = files.sort();
            for (const file of this.files) {
                const clone = this.defaultNoteTab.cloneNode();
                clone.style.display = 'flex';
                clone.innerText = file;
                clone.id = `note-tab-${this.index}`;
                clone.addEventListener('click', async (e) => {
                    const content = await window.electronAPI.readFile(e, `${file}.cnta`);
                    
                    this.cur.loadFile(file, content);
                });
                const closeButton = document.createElement('button');
                closeButton.className = 'close-button';
                closeButton.innerHTML = '&times;';
                closeButton.style.marginLeft = 'auto';
                closeButton.onclick = (e) => {
                    e.stopPropagation();
                    window.electronAPI.deleteFile(e, `${file}.cnta`);
                    this.initNoteTabs();
                }
                clone.insertBefore(closeButton, null);
                this.index++;
                this.noteList.insertBefore(clone, null);
            }
        });
    }
}

export default SideNav;