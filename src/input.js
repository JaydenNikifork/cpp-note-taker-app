import { TEXT_KEYS, MODIFIER_KEYS, ALPHANUMERIC_TEXT_KEYS, PUNCTUATION_TEXT_KEYS } from "./constants.js";
import { newLine } from "./text.js";

export default class InputHandler {
    constructor(cur, sideNav) {
        this.cur = cur;
        this.sideNav = sideNav;
        document.addEventListener('keydown', (e) => {this.handleKeydown(e)});
    }

    handleKeydown(e) {
        if (e.target.tagName == 'TEXTAREA' || e.target.className == 'term-edit' || e.target.className == 'file-name-edit' || e.target.id == 'note-name' || e.target.className == 'draw') {
            if (e.keyCode === 9) {
                const textarea = e.target;
                
                e.preventDefault()
            
                textarea.setRangeText(
                '   ',
                textarea.selectionStart,
                textarea.selectionStart,
                'end'
                )
            }
            this.cur.curElem.style.display = 'none';
            return;
        }
        e.preventDefault();
        if (e.key == 'Backspace') {
            if (e.ctrlKey) {
                this.cur.longDeleteLeft();
            } else {
                this.cur.deleteLeft();
            }
        } else if (e.key == 'Delete') {
            if (e.ctrlKey) {
                this.cur.longDeleteRight();
            } else {
                this.cur.deleteRight();
            }
        } else if (e.key == 'ArrowLeft') {
            this.handleLeftArrow(e);
        } else if (e.key == 'ArrowRight') {
            this.handleRightArrow(e);
        } else if (e.key == 'ArrowUp') {
            this.handleUpArrow(e);
        } else if (e.key == 'ArrowDown') {
            this.handleDownArrow(e);
        } else if (e.key == 'Enter') {
            this.handleTextInput(e);
            newLine(this.cur.node);
            this.cur.updateCurElem();
        } else if (e.key == 'n' && e.ctrlKey) {
            this.cur.newFile();
        } else if (e.key == 's' && e.ctrlKey) {
            this.cur.saveFile().then(() => {
                this.sideNav.initNoteTabs();
            });
        } else if (e.key == 'o' && e.ctrlKey) {
            var f = document.createElement('input');
            f.style.display='none';
            f.type='file';
            f.name='file';
            document.body.appendChild(f);
            f.click();
            f.addEventListener('change', (e) => {
                let file = e.target.files[0];
                let reader = new FileReader();
                reader.onload = (e) => {
                    let contents = e.target.result;
                    this.cur.loadFile(file.replace('.html', ''), contents);
                }
                reader.readAsText(file);
            })

        } else if (TEXT_KEYS.includes(e.key)) {
            this.handleTextInput(e);
        }
    }

    handleLeftArrow(e) {
        if (e.ctrlKey && e.shiftKey) {
            this.cur.longSelectLeft();
        } else if (e.ctrlKey) {
            this.cur.longMoveLeft();
        } else if (e.shiftKey) {
            this.cur.selectLeft();
        } else {
            this.cur.moveLeft();
        }
    }

    handleRightArrow(e) {
        if (e.ctrlKey && e.shiftKey) {
            this.cur.longSelectRight();
        } else if (e.ctrlKey) {
            this.cur.longMoveRight();
        } else if (e.shiftKey) {
            this.cur.selectRight();
        } else {
            this.cur.moveRight();
        }
    }

    handleUpArrow(e) {
        if (e.shiftKey) {
            this.cur.selectUp();
        } else {
            this.cur.moveUp();
        }
    }

    handleDownArrow(e) {
        if (e.shiftKey) {
            this.cur.selectDown();
        } else {
            this.cur.moveDown();
        }
    }

    handleTextInput(e) {
        if (e.ctrlKey) {
            if (['c', 'C'].includes(e.key)) {
                this.cur.copy();
            } else if (['x', 'X'].includes(e.key)) {
                this.cur.cut();
            } else if (['v', 'V'].includes(e.key)) {
                this.cur.paste();
            }
        } else {
            if (e.key == 'Enter') {
                this.cur.insertChar(' \n');
            } else if (e.key == 'Tab') {
                this.cur.insertChar('\t');
            } else { 
                this.cur.insertChar(e.key);
            }
        }
    }
}