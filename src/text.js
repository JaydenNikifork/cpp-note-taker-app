import { COLORS, ALPHANUMERIC_TEXT_KEYS, PUNCTUATION_TEXT_KEYS } from './constants.js';
import ListNode from './list.js';
import Draw from './draw.js';

export default class Text {
    constructor() {
        this.head = new ListNode(document.getElementById('text-head'), null, null);
        this.noteName = document.getElementById('note-name');
        this.noteName.addEventListener('input',(e) => {
            const codeNames = Array.prototype.slice.call(document.getElementsByClassName('file-name-readonly'));
            
            codeNames.forEach(codeName => {
                codeName.innerText = e.target.innerText + '-';
            });
        });
    }
}

/**
 * @param {ListNode || HTMLElement} node
 * @returns {string} the inner text of node.
 */
export function readInnerText(node) {
    return node instanceof ListNode ?
            node.data.innerText :
            node instanceof HTMLElement ?
            node.innerText :
            (() => { throw new Error(`Type error: node must be of type ListNode or HTMLElement (node: ${node}).`); })();
}

/**
 * @param {ListNode || HTMLElement} node
 * @returns {string} the inner HTML of node.
 */
export function readInnerHTML(node) {
    return node instanceof ListNode ?
            node.data.innerHTML :
            node instanceof HTMLElement ?
            node.innerHTML :
            (() => { throw new Error(`Type error: node must be of type ListNode or HTMLElement (node: ${node}).`); })();
}
    
/**
 * @param {ListNode || HTMLElement} node
 * @returns {string[]} an array of characters of the same categorization as the node.
 */
export function getCharArray(node) {
    const innerText = node instanceof ListNode ?
                node.data.innerText :
                node instanceof HTMLElement ?
                node.innerText :
                (() => { throw new Error(`Type error: node must be of type ListNode or HTMLElement (node: ${node}).`); })();

    return ALPHANUMERIC_TEXT_KEYS.includes(innerText) ? 
           ALPHANUMERIC_TEXT_KEYS :
           PUNCTUATION_TEXT_KEYS.includes(innerText) ?
           PUNCTUATION_TEXT_KEYS :
           innerText == ' ' ?
           [' '] :
           innerText == ' \n' ?
           [' \n'] :
           [];
}

/**
 * @param {ListNode || HTMLElement} node1
 * @param {ListNode || HTMLElement} node2
 * @returns {boolean} true if node1 and node2 are the same, false if not.
 */
export function equal(node1, node2) {
    const ID1 = node1 instanceof ListNode ?
                node1.data.id :
                node1 instanceof HTMLElement ?
                node1.id :
                (() => { throw new Error(`Type error: node1 must be of type ListNode or HTMLElement (node1: ${node1}).`); })();

    const ID2 = node2 instanceof ListNode ?
                node2.data.id :
                node2 instanceof HTMLElement ?
                node2.id :
                (() => { throw new Error(`Type error: node2 must be of type ListNode or HTMLElement (node2: ${node2}).`); })();

    return ID1 == ID2;
}

/**
 * Highlights the HTML element of elem.
 * @param {ListNode || HTMLElement} elem
 */
export function highlight(elem) {
    elem = elem instanceof ListNode ? elem.data :
           elem instanceof HTMLElement ? elem :
           (() => { throw new Error(`Type error: elem must be of type ListNode or HTMLElement (elem: ${elem}).`)})();

    elem.style.backgroundColor = COLORS.text;
    elem.style.color = COLORS.background;
}

/**
 * Unhighlights the HTML element of elem.
 * @param {ListNode || HTMLElement} elem
 */
export function unhighlight(elem) {
    elem = elem instanceof ListNode ? elem.data :
           elem instanceof HTMLElement ? elem :
           (() => { throw new Error(`Type error: elem must be of type ListNode or HTMLElement (elem: ${elem}).`)})();

    elem.style.backgroundColor = COLORS.background;
    elem.style.color = COLORS.text;
}

/**
 * Selects the HTML element of elem.
 * @param {ListNode || HTMLElement} elem
 */
export function selectTextElem(elem) {
    elem = elem instanceof ListNode ? elem.data :
           elem instanceof HTMLElement ? elem :
           (() => { throw new Error(`Type error: elem must be of type ListNode or HTMLElement (elem: ${elem}).`)})();

    elem.selected = true;
    highlight(elem);
}

/**
 * Deselects the HTML element of elem.
 * @param {ListNode || HTMLElement} elem
 */
export function deselectTextElem(elem) {
    elem = elem instanceof ListNode ? elem.data :
           elem instanceof HTMLElement ? elem :
           (() => { throw new Error(`Type error: elem must be of type ListNode or HTMLElement (elem: ${elem}).`)})();

    elem.selected = false;
    unhighlight(elem);
}


/**
 * Gets the horizontal center coordinate of elem relative to the viewport.
 * @param {ListNode || HTMLElement} elem
 */
export function getLeft(elem) {
    elem = elem instanceof ListNode ? elem.data :
           elem instanceof HTMLElement ? elem :
           (() => { throw new Error(`Type error: elem must be of type ListNode or HTMLElement (elem: ${elem}).`)})();

    return Math.round(elem.getBoundingClientRect().left);
}


/**
 * Gets the top coordinate of elem relative to the viewport.
 * @param {ListNode || HTMLElement} elem
 */
export function getTop(elem) {
    elem = elem instanceof ListNode ? elem.data :
           elem instanceof HTMLElement ? elem :
           (() => { throw new Error(`Type error: elem must be of type ListNode or HTMLElement (elem: ${elem}).`)})();

    return Math.round(elem.getBoundingClientRect().top);
}


/**
 * Gets the bottom coordinate of elem relative to the viewport.
 * @param {ListNode || HTMLElement} elem
 */
export function getBottom(elem) {
    elem = elem instanceof ListNode ? elem.data :
           elem instanceof HTMLElement ? elem :
           (() => { throw new Error(`Type error: elem must be of type ListNode or HTMLElement (elem: ${elem}).`)})();

    return Math.round(elem.getBoundingClientRect().bottom);
}

/**
 * Ends parent element at node and inserts the rest of the child text elements into a new parent div adjacent to the parent element.
 * @param {ListNode} node 
 */
export function newLine(node) {
    const parentElem = node.data.parentElement;
    const doc = parentElem.parentElement;
    const nextParentElem = document.createElement('p');
    const nextFirstChild = nextParentElem.firstElementChild;

    nextParentElem.style.overflowWrap = 'break-word';
    nextParentElem.style.whiteSpace = 'pre';
    doc.insertBefore(nextParentElem, parentElem.nextElementSibling);

    let index = 0;
    while (!equal(parentElem.childNodes[index], node)) index++;

    while (parentElem.childNodes.length > index) {
        nextParentElem.insertBefore(parentElem.childNodes[index], nextFirstChild);
    }
}

export function removeLine(node) {
    const parentElem = node.data.parentElement;
    const nextParentElem = parentElem.nextElementSibling;

    if (nextParentElem.tagName == 'DIV') return;

    while (nextParentElem.childNodes.length > 0) {
        parentElem.insertBefore(nextParentElem.childNodes[0], null);
    }

    nextParentElem.remove();
}

export function parseHeaderFormatting(parentElem, cur) {
    let childElem = parentElem.firstElementChild;

    const parseBulletPoint = () => {
        const newParentElem = document.createElement('P');
        
        while (parentElem.childNodes.length > 0) {
            newParentElem.insertBefore(parentElem.childNodes[0], null);
        }
    
        parentElem.parentElement.replaceChild(newParentElem, parentElem);
    }

    const parseHeader = () => {
        let headersize = 0;
    
        while (childElem.innerText == '#' && headersize < 6) {
            headersize++;
            childElem = childElem.nextSibling;
        }
    
        let tag = headersize == 0 || childElem.innerText != ' ' ? 'P' : `H${headersize}`;
        const newParentElem = document.createElement(tag);
        
        while (parentElem.childNodes.length > 0) {
            newParentElem.insertBefore(parentElem.childNodes[0], null);
        }
    
        parentElem.parentElement.replaceChild(newParentElem, parentElem);
    }

    const parseDraw = () => {
        const secondParentElem = document.createElement('p');

        let index = 5;
        while (parentElem.childNodes[index - 5].innerText != '<' ||
               parentElem.childNodes[index - 4].innerText != 'd' ||
               parentElem.childNodes[index - 3].innerText != 'r' ||
               parentElem.childNodes[index - 2].innerText != 'a' ||
               parentElem.childNodes[index - 1].innerText != 'w' ||
               parentElem.childNodes[index].innerText != '>') {
            index++;
        }
        index++;

        while (parentElem.childNodes.length > index) {
            secondParentElem.insertBefore(parentElem.childNodes[index], null);
        }

        for (let i = 1; i <= 5; i++) {
            parentElem.childNodes[index - i].remove();
        }

        let parentElemEnd = cur;
        for (let i = 0; i < 6; i++) {
            parentElemEnd = parentElemEnd.prev;
        }

        parentElem.parentElement.insertBefore(secondParentElem, parentElem.nextElementSibling);
        new Draw(parentElem.parentElement, secondParentElem);
        
        cur.prev = parentElemEnd
        parentElemEnd.next = cur;
        parentElemEnd.data.innerText = ' \n';
    }

    const parseCodeBlock = () => {
        if (parentElem.firstElementChild && parentElem.firstElementChild.tagName == 'TEXTAREA') return;
        const codeBlock = document.createElement('div');
        const textarea = document.createElement('textarea');
        const closeButton = document.createElement('button');
        const runButton = document.createElement('button');
        const terminal = document.createElement('div');
        const termReadOnly = document.createElement('span');
        const termEdit = document.createElement('span');
        const fileName = document.createElement('div');
        const headerContainer = document.createElement('div');
        const fileNameReadOnly1 = document.createElement('span');
        const fileNameEdit = document.createElement('span');
        const fileNameReadOnly2 = document.createElement('span');
        const loadButton = document.createElement('button');

        loadButton.innerText = 'Load File';
        loadButton.classList = 'load-file-button';
        headerContainer.className = 'code-block-header';
        fileNameReadOnly1.innerText = `${document.getElementById('note-name').innerText}-`;
        fileNameReadOnly1.contentEditable = false;
        fileNameReadOnly1.className = 'file-name-readonly';
        fileNameEdit.contentEditable = true;
        fileNameEdit.className = 'file-name-edit';
        fileNameEdit.spellcheck = false;
        fileNameEdit.innerText = '<filename>'
        fileNameReadOnly2.innerText = '.cpp';
        fileNameReadOnly2.contentEditable = false;
        fileName.insertBefore(fileNameReadOnly1, null);
        fileName.insertBefore(fileNameEdit, null);
        fileName.insertBefore(fileNameReadOnly2, null);
        fileName.className = 'file-name';

        codeBlock.className = 'code-block';
        terminal.className = 'terminal code-block-text';
        termReadOnly.contentEditable = false;
        termEdit.contentEditable = true;
        termEdit.className = 'term-edit';
        terminal.insertBefore(termReadOnly, null);
        terminal.insertBefore(termEdit, null);

        closeButton.className = 'close-button';
        closeButton.innerHTML = '&times;';
        closeButton.onclick = () => {
            codeBlock.remove();
        }

        textarea.spellcheck = false;
        textarea.className = 'code-editor code-block-text';
        terminal.spellcheck = false;

        runButton.className = 'run-code-button';
        runButton.innerText = 'Run Code'
        runButton.onclick = async (e) => {
            if (fileNameEdit.innerText == '<filename>') {
                termReadOnly.innerText = "Please name the file";
                termEdit.innerText = '';
                return;
            }

            const writeRes = await window.electronAPI.writeCode(e, fileName.innerText, textarea.value);
            
            const res = await window.electronAPI.runCode(e, fileName.innerText);
            
            termReadOnly.innerText = res;
            termEdit.innerText = '';
        }

        terminal.addEventListener('keydown', async (e) => {
            if (e.key != 'Enter') return;

            let text = termEdit.innerText;
            
            text = text.split('\n');
            
            text = text[text.length - 1];
            

            const res = await window.electronAPI.terminalInput(e, text);
            
            
            termReadOnly.innerText += termEdit.innerText;
            termReadOnly.innerText += res;
            termEdit.innerText = '';
        })

        headerContainer.insertBefore(fileName, null);
        headerContainer.insertBefore(closeButton, null);

        codeBlock.insertBefore(headerContainer, null);
        codeBlock.insertBefore(textarea, null);
        codeBlock.insertBefore(terminal, null);
        codeBlock.insertBefore(runButton, null);

        const secondParentElem = document.createElement('p');

        let index = 5;
        while (parentElem.childNodes[index - 5].innerText != '<' ||
               parentElem.childNodes[index - 4].innerText != 'c' ||
               parentElem.childNodes[index - 3].innerText != 'o' ||
               parentElem.childNodes[index - 2].innerText != 'd' ||
               parentElem.childNodes[index - 1].innerText != 'e' ||
               parentElem.childNodes[index].innerText != '>') {
            index++;
        }
        index++;

        while (parentElem.childNodes.length > index) {
            secondParentElem.insertBefore(parentElem.childNodes[index], null);
        }

        for (let i = 1; i <= 5; i++) {
            parentElem.childNodes[index - i].remove();
        }

        let parentElemEnd = cur;
        for (let i = 0; i < 6; i++) {
            parentElemEnd = parentElemEnd.prev;
        }

        parentElem.parentElement.insertBefore(secondParentElem, parentElem.nextElementSibling);
        parentElem.parentElement.insertBefore(codeBlock, secondParentElem);
        
        cur.prev = parentElemEnd
        parentElemEnd.next = cur;
        parentElemEnd.data.innerText = ' \n';
    }
    
    if (parentElem.innerText.match(/<code>/)) parseCodeBlock();
    else if (parentElem.innerText.match(/<draw>/)) parseDraw();
    parseHeader();
}

export function hideMarkdown(parentElem) {
    while (parentElem.tagName == 'DIV') parentElem = parentElem.parentElement;

    if (!parentElem.firstElementChild || parentElem.firstElementChild.tagName == 'DIV') return;

    const hiddenElem = document.createElement('div');
    hiddenElem.style.display = 'none';

    const hideHeader = () => {
        let elemArray = [];
        let index = 0;
        while (parentElem.childNodes.length > index && parentElem.childNodes[index].innerText == '#') {
            elemArray.push(parentElem.childNodes[index]);
            index++;
        }
    
        if (index < 1 || parentElem.childNodes[index].innerText != ' ') return;
    
        elemArray.push(parentElem.childNodes[index]);
        index++;
    
        for (let i = 0; i < index; i++) {
            hiddenElem.insertBefore(elemArray[i], null);
        }
    
        parentElem.insertBefore(hiddenElem, parentElem.firstElementChild);
    }

    const hideBulletPoint = () => {
        let tabNum = 0;
        
        while (parentElem.firstElementChild.innerText != ' ') {
            if (parentElem.firstElementChild.innerText == '\t') tabNum++;
            hiddenElem.insertBefore(parentElem.firstElementChild, null);
        }
        hiddenElem.insertBefore(parentElem.firstElementChild, null);

        parentElem.insertBefore(hiddenElem, parentElem.firstElementChild);
        
        const newParentElem = document.createElement('LI');
        newParentElem.style.marginLeft = `${tabNum * 40 + 20}px`;
        
        while (parentElem.childNodes.length > 0) {
            newParentElem.insertBefore(parentElem.childNodes[0], null);
        }
    
        parentElem.parentElement.replaceChild(newParentElem, parentElem);
    }

    if (/^H[1-6]/.test(parentElem.tagName)) hideHeader();
    else if (/^\t*\- /.test(parentElem.innerText)) hideBulletPoint();
}

export function showMarkdown(parentElem) {
    while (parentElem.tagName == 'DIV') parentElem = parentElem.parentElement;

    const hiddenElem = parentElem.firstElementChild;

    if (hiddenElem.tagName != 'DIV') return;

    const showHeader = () => {
        while (hiddenElem.childNodes.length > 0) {
            parentElem.insertBefore(hiddenElem.childNodes[0], hiddenElem);
        }
    
        hiddenElem.remove();
    }

    const showBulletPoint = () => {
        while (hiddenElem.childNodes.length > 0) {
            parentElem.insertBefore(hiddenElem.childNodes[0], hiddenElem);
        }
    
        hiddenElem.remove();
        
        const newParentElem = document.createElement('P');
        
        while (parentElem.childNodes.length > 0) {
            newParentElem.insertBefore(parentElem.childNodes[0], null);
        }
    
        parentElem.parentElement.replaceChild(newParentElem, parentElem);
    }

    if (/H[1-6]/.test(parentElem.tagName)) showHeader();
    else if (parentElem.tagName == 'LI') showBulletPoint();
}