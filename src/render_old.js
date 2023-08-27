import ListNode from "./list.js";

const test = document.getElementById("test");
const modifierKeys = ['Shift', 'Control', 'Alt'];
const textKeys = [
    'q', 'Q',
    'w', 'W',
    'e', 'E',
    'r', 'R',
    't', 'T',
    'y', 'Y',
    'u', 'U',
    'i', 'I',
    'o', 'O',
    'p', 'P',
    '[', '{',
    ']', '}',
    '\\', '|',
    'a', 'A',
    's', 'S',
    'd', 'D',
    'f', 'F',
    'g', 'G',
    'h', 'H',
    'j', 'J',
    'k', 'K',
    'l', 'L',
    ';', ':',
    '\'', '"',
    'z', 'Z',
    'x', 'X',
    'c', 'C',
    'v', 'V',
    'b', 'B',
    'n', 'N',
    'm', 'M',
    '`', '~',
    '1', '!',
    '2', '@',
    '3', '#',
    '4', '$',
    '5', '%',
    '6', '^',
    '7', '&',
    '8', '*',
    '9', '(',
    '0', ')',
    '-', '_',
    '=', '+',
    ',', '<',
    '.', '>',
    '/', '?',
    ' ',
    'Enter',
    'Tab'
];
const alphaNumericTextKeys = [
    'q', 'Q',
    'w', 'W',
    'e', 'E',
    'r', 'R',
    't', 'T',
    'y', 'Y',
    'u', 'U',
    'i', 'I',
    'o', 'O',
    'p', 'P',
    'a', 'A',
    's', 'S',
    'd', 'D',
    'f', 'F',
    'g', 'G',
    'h', 'H',
    'j', 'J',
    'k', 'K',
    'l', 'L',
    'z', 'Z',
    'x', 'X',
    'c', 'C',
    'v', 'V',
    'b', 'B',
    'n', 'N',
    'm', 'M',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '0',
];
const punctuationTextKeys = [
    '[', '{',
    ']', '}',
    '\\', '|',
    ';', ':',
    '\'', '"',
    '`', '~',
    '!',
    '@',
    '#',
    '$',
    '%',
    '^',
    '&',
    '*',
    '(',
    ')',
    '-', '_',
    '=', '+',
    ',', '<',
    '.', '>',
    '/', '?',
];
const COLORS = {
    BACKGROUND: getComputedStyle(document.documentElement).getPropertyValue('--background'),
    TEXT: 'white',
}
let index = 0;
let horiCurPos = null;

const textHead = new ListNode(document.getElementById('text-head'), null, null);
let cur = textHead;

const curElem = document.getElementById('cur');
updateCurElem();

let selectStart = null;
let selectEnd = null;

document.addEventListener("keydown", (e) => {
    const key = e.key;
    if (key == 'Backspace') {
        if (e.ctrlKey) {
            handleCtrlBackspace();
        } else {
            handleBackspace();
        }
    } else if (key == 'Delete') {
        if (e.ctrlKey) {
            handleCtrlDelete();
        } else {
            handleDelete();
        }
    } else if (key == 'ArrowLeft') {
        handleLeftArrow(e);
    } else if (key == 'ArrowRight') {
        handleRightArrow(e);
    } else if (key == 'ArrowUp') {
        cursorToUp(e);
    } else if (key == 'ArrowDown') {
        cursorToDown(e);
    } else if (textKeys.includes(key)) {
        handleInputs(e);
    }
})

function updateCurElem() {
    const curRect = cur.data.getBoundingClientRect();

    curElem.style.top = `${curRect.top}px`;
    curElem.style.left = `${curRect.left - 2}px`;
    curElem.style.height = `${curRect.height}px`;
    curElem.style.animationName = 'none';
    curElem.offsetHeight;
    curElem.style.animationName = 'cursor-blink';
}

function unhighlight(elem) {
    if (elem instanceof ListNode) {
        elem.data.style.background = COLORS.BACKGROUND;
        elem.data.style.color = COLORS.TEXT;
    } else if (elem instanceof HTMLElement) {
        elem.style.background = COLORS.BACKGROUND;
        elem.style.color = COLORS.TEXT;
    }
}

function highlight(elem) {
    if (elem instanceof ListNode) {
        elem.data.style.backgroundColor = COLORS.TEXT;
        elem.data.style.color = COLORS.BACKGROUND;
    } else if (elem instanceof HTMLElement) {
        elem.style.backgroundColor = COLORS.TEXT;
        elem.style.color = COLORS.BACKGROUND;
    }
}

function handleLeftArrow(e) {
    if (cur.prev == null) return;

    if (e.shiftKey && e.ctrlKey) {
        handleCtrlSelectLeft();
    } else if (e.shiftKey) {
        handleSelectLeft();
    } else if (e.ctrlKey) {
        handleCtrlLeftArrow();
    } else {
        if (doesSelectedExist()) {
            cur = selectStart;
        } else {
            cur = cur.prev;
        }
        handleDeselect();
    }
    horiCurPos = null;
    updateCurElem();
}

function handleRightArrow(e) {
    if (cur.next == null) return;

    if (e.shiftKey && e.ctrlKey) {
        handleCtrlSelectRight();
    } else if (e.shiftKey) {
        handleSelectRight();
    } else if (e.ctrlKey) {
        handleCtrlRightArrow();
    } else {
        if (doesSelectedExist()) {
            cur = selectEnd;
        } else {
            cur = cur.next;
        }
        handleDeselect();
    }
    horiCurPos = null;
    updateCurElem();
}

function handleCtrlLeftArrow() {
    if (cur.prev == null) return;

    const charType = getCurCharTypeArray(cur.prev);

    cur = cur.prev;

    while (cur.prev != null && charType.includes(readCurChar(cur.prev))) {
        cur = cur.prev;
    }
}

function handleCtrlRightArrow() {
    if (cur.next == null) return;

    const charType = getCurCharTypeArray(cur);

    cur = cur.next;

    while (cur.next != null && charType.includes(readCurChar(cur))) {
        cur = cur.next;
    }
}

function handleSelectLeft() {
    if (cur.prev == null) return;

    selectEnd = selectEnd || cur;
    cur = cur.prev;
    if (isSelected(cur)) {
        cur.data.selected = false;
        selectEnd = cur;
        unhighlight(cur);
    } else {
        cur.data.selected = true;
        selectStart = cur;
        highlight(cur);
    }
    updateCurElem();
}

function handleSelectRight() {
    if (cur.next == null) return;

    selectStart = selectStart || cur;
    if (isSelected(cur)) {
        unhighlight(cur);
        cur.data.selected = false;
        cur = cur.next;
        selectStart = cur;
    } else {
        highlight(cur);
        cur.data.selected = true;
        cur = cur.next;
        selectEnd = cur;
    }
    updateCurElem();

    if (selectStart.data.id == selectEnd.data.id) selectStart = selectEnd = null;
}

function handleCtrlSelectLeft() {
    if (cur.prev == null) return;

    const charType = getCurCharTypeArray(cur.prev);

    handleSelectLeft();

    while (cur.prev != null && charType.includes(readCurChar(cur.prev))) {
        handleSelectLeft();
    }
}

function handleCtrlSelectRight() {
    if (cur.next == null) return;

    const charType = getCurCharTypeArray(cur);

    handleSelectRight();

    while (cur.next != null && charType.includes(readCurChar(cur))) {
        handleSelectRight();
    }
}

function handleBackspace() {
    if (doesSelectedExist()) {
        handleClearSelected();
    } else if (cur.prev != null) {
        cur.prev.data.remove();
        if (cur.prev.prev != null) cur.prev.prev.next = cur;
        cur.prev = cur.prev.prev;
        horiCurPos = null;
    }
    updateCurElem();
}

function handleDelete() {
    if (doesSelectedExist()) {
        handleClearSelected();
    } else if (cur.next) {
        cur.data.remove();
        if (cur.prev != null) cur.prev.next = cur.next;
        cur.next.prev = cur.prev;
        cur = cur.next;
        horiCurPos = null;
    }
    updateCurElem();
}

function handleCtrlBackspace() {
    if (doesSelectedExist()) {
        handleClearSelected();
    } else if (cur.prev != null) {
        const charType = getCurCharTypeArray(cur.prev);

        handleBackspace();
    
        while (cur.prev != null && charType.includes(readCurChar(cur.prev))) {
            handleBackspace();
        }
    }
}

function handleCtrlDelete() {
    if (doesSelectedExist()) {
        handleClearSelected();
    } else if (cur.next != null) {
        const charType = getCurCharTypeArray(cur);

        handleDelete();
    
        while (cur.next != null && charType.includes(readCurChar(cur))) {
            handleDelete();
        }
    }
}

function handleEnter() {
    handleTextInput('&nbsp;<br>');
}

function handleSpace() {
    handleTextInput('&nbsp;');
}

function handleTab() {
    handleTextInput('&emsp;');
}

function handleTextInput(char) {
    const span = document.createElement('span');
    const newNode = new ListNode(span, null, null);
    
    span.id = index;
    span.selected = false;
    span.innerHTML = char;

    if (doesSelectedExist()) {
        test.insertBefore(span, selectStart.data);
        if (selectStart.prev != null) {
            selectStart.prev.next = newNode;
        }
        newNode.prev = selectStart.prev;
        newNode.next = selectEnd;
        selectEnd.prev = newNode;
        handleClearSelected();
    } else {
        test.insertBefore(span, cur.data);
    
        if (cur.prev != null) {
            cur.prev.next = newNode;
        }
        newNode.prev = cur.prev;
        cur.prev = newNode;
        newNode.next = cur;
    }
    updateCurElem();

    index++;
    horiCurPos = null;
}

function handleCtrlInput(char) {
    if (char == 'v') {
        if (doesSelectedExist()) handleClearSelected();
        navigator.clipboard.readText()
            .then((text) => {
                for (let i = 0; i < text.length; i++) {
                    handleTextInput(text[i]);
                }
            });
    } else if (char == 'c') {
        if (!doesSelectedExist()) return;
        let copyString = '';

        for (let it = selectStart; it.data.id != selectEnd.data.id; it = it.next) {
            copyString += it.data.innerHTML;
        }
        
        navigator.clipboard.writeText(copyString);
    }
}

function readCurChar(cur) {
    return cur.data.innerText;
}

function handleInputs(e) {
    const key = e.key;
    if (e.ctrlKey) {
        handleCtrlInput(key);
    } else if (key == 'Enter') {
        handleEnter();
    } else if (key == ' ') {
        handleSpace();
    } else if (key == 'Tab') {
        handleTab();
    } else { 
        handleTextInput(key);
    }
}

function cursorToUp(e) {
    const vertPos = Math.round(cur.data.getBoundingClientRect().top) - 1;
    let horiPos = horiCurPos || Math.round((cur.data.getBoundingClientRect().left + cur.data.getBoundingClientRect().right) / 2);
    horiCurPos = horiCurPos || horiPos;
    let newElem = document.elementFromPoint(horiPos, vertPos);

    while (newElem.tagName != 'SPAN') {
        horiPos -= 3;
        newElem = document.elementFromPoint(horiPos, vertPos);
        if (newElem == null || newElem.tagName == 'BODY') {
            let it = cur;
            for (; it.prev != null; it = it.prev);
            newElem = it.data;
            horiCurPos = null;
            break;
        };
    }

    if (e.shiftKey) {
        handleSelectUp(newElem);
    } else {
        while (cur.data.id != newElem.id) {
            cur = cur.prev;
        }
        handleDeselect();
    }
    updateCurElem();
}

function cursorToDown(e) {
    const vertPos = Math.round(cur.data.getBoundingClientRect().bottom) + 1;
    let horiPos = horiCurPos || Math.round((cur.data.getBoundingClientRect().left + cur.data.getBoundingClientRect().right) / 2);
    horiCurPos = horiCurPos || horiPos;
    let newElem = document.elementFromPoint(horiPos, vertPos);

    while (newElem.tagName != 'SPAN') {
        horiPos -= 3;
        newElem = document.elementFromPoint(horiPos, vertPos);
        if (newElem == null || newElem.tagName == 'BODY') {
            newElem = textHead.data;
            horiCurPos = null;
            break;
        };
    }

    if (e.shiftKey) {
        handleSelectDown(newElem);
    } else {
        while (cur.data.id != newElem.id) {
            cur = cur.next;
        }
        handleDeselect();
    }
    updateCurElem();
}

function handleSelectUp(newElem) {
    while (cur.data.id != newElem.id) {
        handleSelectLeft();
    }
}

function handleSelectDown(newElem) {
    while (cur.data.id != newElem.id) {
        handleSelectRight();
    }
}

function isSelected(cur) {
    return cur.data.selected;
}

function doesSelectedExist() {
    return selectStart != null && selectEnd != null;
}

function handleDeselect() {
    if (!doesSelectedExist()) return;

    for (let it = selectStart; it.data.id != selectEnd.data.id; it = it.next) {
        unhighlight(it);
        it.data.selected = false;
    }

    selectStart = selectEnd = null;
}

function handleClearSelected() {
    if (!doesSelectedExist()) return;

    for (let it = selectStart; it.data.id != selectEnd.data.id; it = it.next) {
        it.data.remove();
    }

    if (selectStart.prev != null) {
        selectStart.prev.next = selectEnd;
    }
    selectEnd.prev = selectStart.prev;
    cur = selectEnd;

    selectStart = selectEnd = null;
}

function getCurCharTypeArray(cur) {
    return alphaNumericTextKeys.includes(readCurChar(cur)) ? 
           alphaNumericTextKeys :
           punctuationTextKeys.includes(readCurChar(cur)) ?
           punctuationTextKeys :
           readCurChar(cur) == ' ' ?
           [' '] :
           [' \n'];
}