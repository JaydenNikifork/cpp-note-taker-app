import ListNode from "./list.js";
import { readInnerText, readInnerHTML, getCharArray, equal, selectTextElem, deselectTextElem, getLeft, getTop, getBottom, parseHeaderFormatting, hideMarkdown, showMarkdown, removeLine } from "./text.js";

export default class Cursor {
    /**
     * @param {ListNode} startingNode the node the cursors starts at on load.
     */
    constructor(startingNode) {
        this.node = startingNode;   // The HTML element being hovered by the cursor.
        this.curElem = document.getElementById('cur');   // The cursor's HTML element.
        this.selectStart = this.selectEnd = null;   // Hovers the start and end nodes of a select. The end of a select is non-inclusive.
        this.horiCurPos = null; // Marks the cursor's horizontal position while moving vertically.
        this.index = 0; // increments HTML element ids
        this.prevParent = this.node.data.parentElement;
        this.prevNode = startingNode;
        this.noteTextContainer = document.getElementById('note-text-container');
        this.noteTextContainer.onblur = () => {this.curElem.style.display = 'none'};
        this.noteTextContainer.onfocus = () => {this.updateCurElem()};
        document.querySelectorAll("div").forEach(el => el.addEventListener('scroll', (_e) => {this.updateCurElem()}));
    }

    /**
     * @returns {HTMLElement} the parent HTML element of the cursor element
     */
    parentElem() { return this.node.data.parentElement; }

    /**
     * @returns {HTMLElement} the HTML element being hovered by the cursor.
     */
    textElem() { return this.node.data; }

    /**
     * @returns {string} the inner text of the HTML element being hovered by the cursor.
     */
    innerText() { return this.textElem().innerText; }

    /**
     * @returns {string} the inner HTML of the HTML element being hovered by the cursor.
     */
    innerHTML() { return this.textElem().innerHTML; }

    /**
     * Updates the position of the cursor's HTML element and restarts it's animation.
     */
    updateCurElem() {
        if (this.prevParent != this.parentElem()) {
            if (!this.prevNode.data.selected) hideMarkdown(this.prevParent);
            showMarkdown(this.parentElem());
            this.prevParent = this.parentElem();
            this.prevNode = this.node;
        }
    
        const curRect = this.textElem().getBoundingClientRect();

        this.curElem.style.display = 'block';
        this.curElem.style.top = `${curRect.top}px`;
        this.curElem.style.left = `${curRect.left - 2}px`;
        this.curElem.style.height = `${curRect.height}px`;
        this.curElem.style.animationName = 'none';
        this.curElem.offsetHeight;
        this.curElem.style.animationName = 'cursor-blink';
    }

    /**
     * If not null, sets the HCP to the middle of the currently hovered element.
     */
    setHCP() {
        this.horiCurPos = this.horiCurPos || getLeft(this.node);
    }

    /**
     * Sets the horiCurPos back to null, which is its default value.
     */
    resetHCP() {
        this.horiCurPos = null;
    }

    /**
     * @returns {boolean} false if a left node exists, true if not.
     */
    isLeftNull() {
        return this.node.prev == null;
    }

    /**
     * @returns {boolean} false if a right node exists, true if not.
     */
    isRightNull() {
        return this.node.next == null;
    }

    /**
     * @returns {boolean} true if the HTML element shadowed by the cursor is selected, false if not.
     */
    isSelected() {
        return this.textElem().selected;
    }

    /**
     * @returns true is a selection exists, false if not
     */
    doesSelectionExist() {
        return this.selectStart != null && this.selectEnd != null;
    }

    /**
     * Deselects all selected text.
     */
    deselectAll() {
        if (!this.doesSelectionExist()) return;

        while (!equal(this.selectStart, this.selectEnd)) {
            deselectTextElem(this.selectStart);
            hideMarkdown(this.selectStart.data.parentElement);
            this.selectStart = this.selectStart.next;
        }

        showMarkdown(this.parentElem());
        this.resetSelect();
    }

    /**
     * Resets (sets to null) the start and end points of a select.
     */
    resetSelect() {
        this.selectStart = this.selectEnd = null;
    }

    /**
     * Resets (sets to null) the start and end points of a select if they are equal.
     */
    checkSelectLength() {
        if (this.doesSelectionExist() && equal(this.selectStart, this.selectEnd)) this.resetSelect();
    }

    /**
     * If possible, moves the cursor one character to the left.
     */
    moveLeft() {
        if (this.isLeftNull()) return;
        
        this.node = this.node.prev;
        this.resetHCP();
        this.deselectAll();
        this.updateCurElem();
    }

    /**
     * If possible, moves the cursor one character to the right.
     */
    moveRight() {
        if (this.isRightNull()) return;

        this.node = this.node.next;
        this.resetHCP();
        this.deselectAll();
        this.updateCurElem();
    }

    /**
     * Long moves left (ctrl + left arrow).
     */
    longMoveLeft() {
        if (this.isLeftNull()) return;

        const charType = getCharArray(this.node.prev);
    
        while (!this.isLeftNull() && charType.includes(readInnerText(this.node.prev))) {
            this.moveLeft();
        }

        this.resetHCP();
        this.deselectAll();
        this.updateCurElem();
    }

    /**
     * Long moves right (ctrl + right arrow).
     */
    longMoveRight() {
        const charType = getCharArray(this.node);
    
        while (!this.isRightNull() && charType.includes(readInnerText(this.node))) {
            this.moveRight();
        }

        this.resetHCP();
        this.deselectAll();
        this.updateCurElem();
    }

    /**
     * @returns the node that the cursor is expected to hover after pressing the up arrow.
     */
    findUpNode() {
        const vertPos = getBottom(this.node);
        const tempHoriPos = this.horiCurPos || getLeft(this.node);

        let upNode = this.node;
        while (upNode.prev != null && getBottom(upNode) == vertPos) upNode = upNode.prev;
        while (upNode.prev != null && getLeft(upNode) > tempHoriPos && getBottom(upNode.prev) == getBottom(upNode)) upNode = upNode.prev;

        if (
            upNode.next != null &&
            getBottom(upNode) != vertPos &&
            getBottom(upNode.next) == getBottom(upNode) &&
            getLeft(upNode.next) - tempHoriPos < tempHoriPos - getLeft(upNode)
        ) {
            upNode = upNode.next
        };
    
        return upNode;
    }

    /**
     * @returns the node that the cursor is expected to hover after pressing the down arrow.
     */
    findDownNode() {
        const vertPos = getBottom(this.node);
        const tempHoriPos = this.horiCurPos || getLeft(this.node);

        let downNode = this.node;
        while (downNode.next != null && getBottom(downNode) == vertPos) downNode = downNode.next;
        while (downNode.next != null && getLeft(downNode) < tempHoriPos && getBottom(downNode) == getBottom(downNode.next)) downNode = downNode.next;

        if (
            downNode.prev != null &&
            getBottom(downNode) != vertPos &&
            getBottom(downNode.prev) == getBottom(downNode) &&
            getLeft(downNode) - tempHoriPos > tempHoriPos - getLeft(downNode.prev)
        ) {
            downNode = downNode.prev
        };
    
        return downNode;
    }

    /**
     * Moves the cursor up.
     */
    moveUp() {
        const upNode = this.findUpNode();

        if (upNode.prev == null && (readInnerText(upNode) != ' \n' || equal(upNode, this.node))) {
            this.resetHCP();
        } else {
            this.setHCP();
        }

        this.node = upNode;

        this.deselectAll();
        this.updateCurElem();
    }


    /**
     * Moves the cursor down.
     */
    moveDown() {
        const downNode = this.findDownNode();

        if (downNode.next == null && (getLeft(this.node) < getLeft(downNode) || equal(downNode, this.node))) {
            this.resetHCP();
        } else {
            this.setHCP();
        }

        this.node = downNode;

        this.deselectAll();
        this.updateCurElem();
    }

    /**
     * Selects the HTML element to the left of the cursor.
     */
    selectLeft() {
        if (this.isLeftNull()) return;

        this.selectEnd = this.selectEnd || this.node;
        this.node = this.node.prev;
        if (this.isSelected()) {
            this.selectEnd = this.node;
            deselectTextElem(this.node);
        } else {
            this.selectStart = this.node;
            selectTextElem(this.node);
        }

        this.checkSelectLength();
        this.resetHCP();
        this.updateCurElem();
    }

    /**
     * Selects the HTML element to the right of the cursor (the currently hovered element).
     */
    selectRight() {
        if (this.isRightNull()) return;
    
        this.selectStart = this.selectStart || this.node;
        if (this.isSelected()) {
            deselectTextElem(this.node);
            this.node = this.node.next;
            this.selectStart = this.node;
        } else {
            selectTextElem(this.node);
            this.node = this.node.next;
            this.selectEnd = this.node;
        }
    
        this.checkSelectLength();
        this.resetHCP();
        this.updateCurElem();
    }

    /**
     * Long selects to the left (ctrl + shift + left arrow).
     */
    longSelectLeft() {
        if (this.isLeftNull()) return;

        const charType = getCharArray(this.node.prev);
    
        while (!this.isLeftNull() && charType.includes(readInnerText(this.node.prev))) {
            this.selectLeft();
        }

        this.resetHCP();
        this.updateCurElem();
    }

    /**
     * Long selects to the right (ctrl + shift + right arrow).
     */
    longSelectRight() {
        const charType = getCharArray(this.node);
    
        while (!this.isRightNull() && charType.includes(readInnerText(this.node))) {
            handleSelectRight();
        }

        this.resetHCP();
        this.updateCurElem();
    }

    /**
     * Selects upwards.
     */
    selectUp() {
        const upNode = this.findUpNode();

        if (upNode.prev == null && (readInnerText(upNode) != ' \n' || equal(upNode, this.node))) {
            this.resetHCP();
        } else {
            this.setHCP();
        }

        this.selectEnd = this.selectEnd || this.node;
        while (!equal(this.node, upNode)) {
            this.node = this.node.prev;
            if (this.isSelected()) {
                this.selectEnd = this.node;
                deselectTextElem(this.node);
            } else {
                this.selectStart = this.node;
                selectTextElem(this.node);
            }
        }

        this.checkSelectLength();
        this.updateCurElem();
    }

    /**
     * Selects downwards.
     */
    selectDown() {
        const downNode = this.findDownNode();

        if (downNode.next == null && (downNode.data.id != 'text-head' || equal(downNode, this.node))) {
            this.resetHCP();
        } else {
            this.setHCP();
        }

        this.selectStart = this.selectStart || this.node;
        while (!equal(this.node, downNode)) {
            if (this.isSelected()) {
                deselectTextElem(this.node);
                this.node = this.node.next;
                this.selectStart = this.node;
            } else {
                selectTextElem(this.node);
                this.node = this.node.next;
                this.selectEnd = this.node;
            }
        }

        this.checkSelectLength();
        this.updateCurElem();
    }

    /**
     * Deletes all selected text.
     */
    deleteSelected() {
        if (!this.doesSelectionExist()) return;
    
        for (let it = this.selectStart; !equal(it, this.selectEnd); it = it.next) {
            if (it.data.parentElement != it.next.data.parentElement) removeLine(it);
            it.data.remove();
        }
    
        if (this.selectStart.prev != null) {
            this.selectStart.prev.next = this.selectEnd;
        }
        this.selectEnd.prev = this.selectStart.prev;
        this.node = this.selectEnd;
    
        this.resetSelect();
        parseHeaderFormatting(this.parentElem(), this.node);
        this.updateCurElem();
    }

    /**
     * Deletes the text element to the left of the cursor.
     */
    deleteLeft() {
        if (this.doesSelectionExist()) {
            this.deleteSelected();
        } else if (!this.isLeftNull()) {
            if (this.node.prev.data.parentElement != this.parentElem()) removeLine(this.node.prev);
            this.node.prev.data.remove();
            if (this.node.prev.prev != null) this.node.prev.prev.next = this.node;
            this.node.prev = this.node.prev.prev;
        }
        
        this.resetHCP();
        parseHeaderFormatting(this.parentElem(), this.node);
        this.updateCurElem();
    }

    /**
     * Deletes the text element hovered by the cursor (to the right of the cursor element).
     */
    deleteRight() {
        if (this.doesSelectionExist()) {
            this.deleteSelected();
        } else if (!this.isRightNull()) {
            if (this.parentElem() != this.node.next.data.parentElement) removeLine(this.node);
            this.node.data.remove();
            if (this.node.prev != null) this.node.prev.next = this.node.next;
            this.node.next.prev = this.node.prev;
            this.node = this.node.next;
        }

        this.resetHCP();
        parseHeaderFormatting(this.parentElem(), this.node);
        this.updateCurElem();
    }

    /**
     * Long deletes left (ctrl + backspace)
     */
    longDeleteLeft() {
        if (this.doesSelectionExist()) {
            this.deleteSelected();
        } else if (!this.isLeftNull()) {
            const charType = getCharArray(this.node.prev);
    
            this.deleteLeft();
        
            while (!this.isLeftNull() && charType.includes(readInnerText(this.node.prev))) {
                this.deleteLeft();
            }
        }
    }

    /**
     * Long deletes right (ctrl + delete)
     */
    longDeleteRight() {
        if (this.doesSelectionExist()) {
            this.deleteSelected();
        } else if (!this.isRightNull()) {
            const charType = getCharArray(this.node);
    
            this.deleteRight();
        
            while (!this.isRightNull() && charType.includes(this.innerText())) {
                this.deleteRight();
            }
        }
    }

    /**
     * Inserts a character at the cursor's location
     * @param {string} char is a string of length 1
     */
    insertChar(char) {
        const span = document.createElement('span');
        const newNode = new ListNode(span, null, null);
        const parentElem = this.textElem().parentElement;
        
        span.id = this.index;
        span.selected = false;
        span.innerText = char;
    
        if (this.doesSelectionExist()) {
            this.deleteSelected();
        }
        parentElem.insertBefore(span, this.node.data);
    
        if (!this.isLeftNull()) {
            this.node.prev.next = newNode;
        }
        newNode.prev = this.node.prev;
        this.node.prev = newNode;
        newNode.next = this.node;

        this.index++;
        this.resetHCP()
        parseHeaderFormatting(this.parentElem(), this.node);
        this.updateCurElem();
    }

    /**
     * ctrl + c
     */
    copy() {
        if (!this.doesSelectionExist()) return;

        let copyString = '';

        for (let it = this.selectStart; !equal(it, this.selectEnd); it = it.next) {
            copyString += it.data.innerText;
        }
        
        navigator.clipboard.writeText(copyString);
    }


    /**
     * ctrl + x
     */
    cut() {
        this.copy();
        this.deleteSelected();
        this.updateCurElem();
    }


    /**
     * ctrl + v
     */
    paste() {
        this.deleteSelected();

        navigator.clipboard.readText()
            .then((text) => {
                for (let i = 0; i < text.length; i++) {
                    this.insertChar(text[i]);
                }
            });
    }

    async saveFile() {
        const filename = document.getElementById('note-name').innerText;
        const htmlData = document.body.innerHTML;

        let codeNameArray = Array.prototype.slice.call(document.getElementsByClassName('file-name'));
        let codeDataArray = Array.prototype.slice.call(document.getElementsByClassName('code-editor'));
        codeDataArray.forEach((codeDataElem, index) => {
            const codeName = codeNameArray[index].innerText;
            const codeData = codeDataElem.value;
            window.electronAPI.writeCode({}, codeName, codeData);
        });

        let drawDataArray = Array.prototype.slice.call(document.getElementsByClassName('draw')).slice(1);
        drawDataArray = drawDataArray.map(elem => elem.getContext('2d').getImageData(0, 0, elem.width, elem.height).data.toString());
        let drawDataString = '';
        drawDataArray.forEach(data => {
            drawDataString += "&drawing&" + data;
        });
        drawDataString += "&drawing&";
        let dataString = htmlData + drawDataString;

        await window.electronAPI.saveNotes({}, filename, dataString);
    }

    async loadFile(filename, data) {
        const noteName = document.getElementById('note-name');
        noteName.innerText = filename;

        const textHeadClone = document.getElementById('text-head').cloneNode();
        textHeadClone.innerHTML = '&#8192;';
        const textHeadNode = new ListNode(textHeadClone, null, null);

        const newP = document.createElement('p');
        newP.style = {
            ...newP.style,
            overflowWrap: 'break-word',
            whiteSpace: 'pre',
        }

        this.node = textHeadNode;

        newP.insertBefore(textHeadClone, null);

        this.noteTextContainer.innerHTML = '';
        this.noteTextContainer.insertBefore(newP, null);

        data = data.split('&drawing&');
        let htmlData = data[0];
        let drawingDataArray = data.slice(1, data.length - 1);

        htmlData = [...htmlData.match(/(>([^×]|\s<br>)<\/|<div class="file-name">.*?<\/div>|<div class="draw-container" id="draw" style="display: block;">)/g)];
        htmlData = htmlData.map(str => {
            if (/^<div class="file-name"/.test(str)) {
                let elem = document.createElement('div');
                elem.innerHTML = str;
                return `code-block:${elem.innerText}`;
            } else if (/^<div class="draw-container" id="draw" style="display: block;">/.test(str)) {
                return 'draw';
            } else return str;
        })
        htmlData = htmlData.map((str) => (
            str.replace(/[<>\/]/g, '')
        ));
        htmlData = htmlData.reduce((r, str) => {
            if (str == '\t') r.push('Tab');
            else if (str == ' br') r.push('Enter');
            else if (/^code-block/.test(str)) r.push('<','c','o','d','e','>',str);
            else if (/^draw/.test(str)) r.push('<','d','r','a','w','>');
            else r.push(str);
            return r;
        }, []);
        

        let codeNames = [];
        let codeData = [];

        const promises = htmlData.map(async str => {
            if (/^code-block/.test(str)) {
                let name = str.split(':')[1];
                let file = await window.electronAPI.readFile({}, name);
                
                if (file == false) return;

                name = name.split(/-/)[1];
                name = name.split('.cpp')[0];

                codeNames.push(name);
                codeData.push(file);
                return file;
            } else {
                const event = new KeyboardEvent('keydown', { key: str });
                document.dispatchEvent(event);
                return true;
            }
        });
        await Promise.all(promises);

        const drawingElemArray = Array.prototype.slice.call(document.getElementsByClassName('draw')).slice(1);
        
        if (drawingElemArray.length > 0) {
            drawingElemArray.forEach((elem, index) => {
                let dataArray = drawingDataArray[index].split(',');
                let imageData = new ImageData(elem.width, elem.height);
                for (let i = 0; i < dataArray.length; i++) {
                    imageData.data[i] = dataArray[i];
                }
                
                elem.getContext('2d').putImageData(imageData, 0, 0);
            });
        }

        const codeNameElems = Array.prototype.slice.call(document.getElementsByClassName('file-name-edit'));
        const codeEditorElems = Array.prototype.slice.call(document.getElementsByClassName('code-editor'));
        
        
        codeNames.forEach((codeName, index) => {
            codeNameElems[index].textContent = codeName;
            codeEditorElems[index].textContent = codeData[index];
        });
    }

    newFile() {
        const noteName = document.getElementById('note-name');
        noteName.innerText = 'untitled';

        const textHeadClone = document.getElementById('text-head').cloneNode();
        textHeadClone.innerHTML = '&#8192;';
        const textHeadNode = new ListNode(textHeadClone, null, null);

        const newP = document.createElement('p');
        newP.style = {
            ...newP.style,
            overflowWrap: 'break-word',
            whiteSpace: 'pre',
        }

        this.node = textHeadNode;

        newP.insertBefore(textHeadClone, null);

        this.noteTextContainer.innerHTML = '';
        this.noteTextContainer.insertBefore(newP, null);
    }
}