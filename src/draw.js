import ListNode from './list.js';

class Draw {
    constructor(parentElement, nextElem) {
        this.elem = document.getElementById('default-draw').cloneNode(true);
        this.elem.id = 'draw';
        this.elem.style.display = 'block';
        this.toolbar = this.elem.firstElementChild;
        this.colorPicker = Array.prototype.slice.call(this.toolbar.getElementsByClassName('color-picker'))[0];
        this.colorPicker.value = getComputedStyle(document.documentElement).getPropertyValue('--primary');
        this.sizeSlider = Array.prototype.slice.call(this.toolbar.getElementsByClassName('size-slider'))[0];
        this.eraserSizeSlider = Array.prototype.slice.call(this.toolbar.getElementsByClassName('eraser-size-slider'))[0];
        this.canvas = this.elem.firstElementChild.nextElementSibling;
        this.radius = this.sizeSlider.value;
        this.canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${this.radius * 2}" height="${this.radius * 2}" viewBox="0 0 128 128" xml:space="preserve"><g transform="matrix(8.6215624988 0 0 8.6215625 63.9999999913 64)" id="d6NZmursgDDw-HroAf7jq"  ><path style="stroke: rgb(0, 0, 0); stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(218,129,145); fill-opacity: 0; fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke"  transform=" translate(0, 0)" d="M 0 -7.18294 C 3.96498 -7.18294 7.18294 -3.96498 7.18294 0 C 7.18294 3.96498 3.96498 7.18294 0 7.18294 C -3.96498 7.18294 -7.18294 3.96498 -7.18294 0 C -7.18294 -3.96498 -3.96498 -7.18294 0 -7.18294 z" stroke-linecap="round" /></g></svg>') ${this.radius} ${this.radius},auto`
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = '4000';
        this.ctx = this.canvas.getContext('2d');
        this.history = new ListNode(this.copyImage(), null, null);
        this.color = this.colorPicker.value;
        this.eraserRadius = this.eraserSizeSlider.value;
        this.initDraw();
        this.ctx.fillStyle = this.colorPicker.value;
        this.prevPos = null;
        parentElement.insertBefore(this.elem, nextElem);
        
    }

    initDraw() {
        this.canvas.addEventListener('mousedown', (e) => {
            if (e.buttons == 0) {
                this.prevPos = null;
                this.canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${this.radius * 2}" height="${this.radius * 2}" viewBox="0 0 128 128" xml:space="preserve"><g transform="matrix(8.6215624988 0 0 8.6215625 63.9999999913 64)" id="d6NZmursgDDw-HroAf7jq"  ><path style="stroke: rgb(0, 0, 0); stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(218,129,145); fill-opacity: 0; fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke"  transform=" translate(0, 0)" d="M 0 -7.18294 C 3.96498 -7.18294 7.18294 -3.96498 7.18294 0 C 7.18294 3.96498 3.96498 7.18294 0 7.18294 C -3.96498 7.18294 -7.18294 3.96498 -7.18294 0 C -7.18294 -3.96498 -3.96498 -7.18294 0 -7.18294 z" stroke-linecap="round" /></g></svg>') ${this.radius} ${this.radius},auto`
            }
            else if (e.buttons == 1) {
                this.ctx.fillStyle = this.color;
                this.ctx.strokeStyle = this.color;
                this.ctx.lineWidth = this.radius * 2;

                this.prevPos = { x: e.offsetX, y: e.offsetY };
    
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(e.offsetX, e.offsetY, this.radius, 0, 2 * Math.PI, false);
                this.ctx.fill();
                this.canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${this.radius * 2}" height="${this.radius * 2}" viewBox="0 0 128 128" xml:space="preserve"><g transform="matrix(8.6215624988 0 0 8.6215625 63.9999999913 64)" id="d6NZmursgDDw-HroAf7jq"  ><path style="stroke: rgb(0, 0, 0); stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(218,129,145); fill-opacity: 0; fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke"  transform=" translate(0, 0)" d="M 0 -7.18294 C 3.96498 -7.18294 7.18294 -3.96498 7.18294 0 C 7.18294 3.96498 3.96498 7.18294 0 7.18294 C -3.96498 7.18294 -7.18294 3.96498 -7.18294 0 C -7.18294 -3.96498 -3.96498 -7.18294 0 -7.18294 z" stroke-linecap="round" /></g></svg>') ${this.radius} ${this.radius},auto`
            }
            else if (e.buttons == 2) {
                this.ctx.lineWidth = this.eraserRadius * 2;

                this.prevPos = { x: e.offsetX, y: e.offsetY };

                this.ctx.beginPath();
                this.ctx.arc(e.offsetX, e.offsetY, this.eraserRadius, 0, 2 * Math.PI, false);
                this.ctx.save();
                this.ctx.clip();
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.restore();
                this.canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${this.eraserRadius * 2}" height="${this.eraserRadius * 2}" viewBox="0 0 128 128" xml:space="preserve"><g transform="matrix(8.6215624988 0 0 8.6215625 63.9999999913 64)" id="d6NZmursgDDw-HroAf7jq"  ><path style="stroke: rgb(0, 0, 0); stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(218,129,145); fill-opacity: 0; fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke"  transform=" translate(0, 0)" d="M 0 -7.18294 C 3.96498 -7.18294 7.18294 -3.96498 7.18294 0 C 7.18294 3.96498 3.96498 7.18294 0 7.18294 C -3.96498 7.18294 -7.18294 3.96498 -7.18294 0 C -7.18294 -3.96498 -3.96498 -7.18294 0 -7.18294 z" stroke-linecap="round" /></g></svg>') ${this.eraserRadius} ${this.eraserRadius},auto`
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (e.buttons == 0) {
                this.prevPos = null;
                this.canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${this.radius * 2}" height="${this.radius * 2}" viewBox="0 0 128 128" xml:space="preserve"><g transform="matrix(8.6215624988 0 0 8.6215625 63.9999999913 64)" id="d6NZmursgDDw-HroAf7jq"  ><path style="stroke: rgb(0, 0, 0); stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(218,129,145); fill-opacity: 0; fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke"  transform=" translate(0, 0)" d="M 0 -7.18294 C 3.96498 -7.18294 7.18294 -3.96498 7.18294 0 C 7.18294 3.96498 3.96498 7.18294 0 7.18294 C -3.96498 7.18294 -7.18294 3.96498 -7.18294 0 C -7.18294 -3.96498 -3.96498 -7.18294 0 -7.18294 z" stroke-linecap="round" /></g></svg>') ${this.radius} ${this.radius},auto`
            }
            else if (e.buttons == 1) {
                this.ctx.fillStyle = this.color;
                this.ctx.strokeStyle = this.color;
                this.ctx.lineWidth = this.radius * 2;

                if (this.prevPos) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.prevPos.x, this.prevPos.y);
                    this.ctx.lineTo(e.offsetX, e.offsetY);
                    this.ctx.stroke();
                }
                this.prevPos = { x: e.offsetX, y: e.offsetY };
    
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(e.offsetX, e.offsetY, this.radius, 0, 2 * Math.PI, false);
                this.ctx.fill();
                this.canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${this.radius * 2}" height="${this.radius * 2}" viewBox="0 0 128 128" xml:space="preserve"><g transform="matrix(8.6215624988 0 0 8.6215625 63.9999999913 64)" id="d6NZmursgDDw-HroAf7jq"  ><path style="stroke: rgb(0, 0, 0); stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(218,129,145); fill-opacity: 0; fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke"  transform=" translate(0, 0)" d="M 0 -7.18294 C 3.96498 -7.18294 7.18294 -3.96498 7.18294 0 C 7.18294 3.96498 3.96498 7.18294 0 7.18294 C -3.96498 7.18294 -7.18294 3.96498 -7.18294 0 C -7.18294 -3.96498 -3.96498 -7.18294 0 -7.18294 z" stroke-linecap="round" /></g></svg>') ${this.radius} ${this.radius},auto`
            }
            else if (e.buttons == 2) {
                this.ctx.lineWidth = this.eraserRadius * 2;

                if (this.prevPos) {
                    this.clearLine(e);
                }
                this.prevPos = { x: e.offsetX, y: e.offsetY };

                this.ctx.beginPath();
                this.ctx.arc(e.offsetX, e.offsetY, this.eraserRadius, 0, 2 * Math.PI, false);
                this.ctx.save();
                this.ctx.clip();
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.restore();
                this.canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${this.eraserRadius * 2}" height="${this.eraserRadius * 2}" viewBox="0 0 128 128" xml:space="preserve"><g transform="matrix(8.6215624988 0 0 8.6215625 63.9999999913 64)" id="d6NZmursgDDw-HroAf7jq"  ><path style="stroke: rgb(0, 0, 0); stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(218,129,145); fill-opacity: 0; fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke"  transform=" translate(0, 0)" d="M 0 -7.18294 C 3.96498 -7.18294 7.18294 -3.96498 7.18294 0 C 7.18294 3.96498 3.96498 7.18294 0 7.18294 C -3.96498 7.18294 -7.18294 3.96498 -7.18294 0 C -7.18294 -3.96498 -3.96498 -7.18294 0 -7.18294 z" stroke-linecap="round" /></g></svg>') ${this.eraserRadius} ${this.eraserRadius},auto`
            }
        });

        this.canvas.addEventListener('mouseup', (_e) => {
            const newNode = new ListNode(this.copyImage(), this.history, null);
            this.history.next = newNode;
            this.history = newNode;
        });

        this.canvas.addEventListener('keydown', (e) => {
            if (e.key == 'z' && e.ctrlKey && this.history.prev != null) this.undo();
            else if ((e.key == 'Z' || e.key == 'y') && e.ctrlKey && this.history.next != null) this.redo();
        });

        this.colorPicker.onchange = (e) => {
            this.color = e.target.value;
        }

        this.sizeSlider.onchange = (e) => {
            this.radius = e.target.value;
            this.canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${this.radius * 2}" height="${this.radius * 2}" viewBox="0 0 128 128" xml:space="preserve"><g transform="matrix(8.6215624988 0 0 8.6215625 63.9999999913 64)" id="d6NZmursgDDw-HroAf7jq"  ><path style="stroke: rgb(0, 0, 0); stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(218,129,145); fill-opacity: 0; fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke"  transform=" translate(0, 0)" d="M 0 -7.18294 C 3.96498 -7.18294 7.18294 -3.96498 7.18294 0 C 7.18294 3.96498 3.96498 7.18294 0 7.18294 C -3.96498 7.18294 -7.18294 3.96498 -7.18294 0 C -7.18294 -3.96498 -3.96498 -7.18294 0 -7.18294 z" stroke-linecap="round" /></g></svg>') ${this.radius} ${this.radius},auto`
        }

        this.eraserSizeSlider.onchange = (e) => {
            this.eraserRadius = e.target.value;
        }
    }

    undo() {
        this.history = this.history.prev;
        this.ctx.putImageData(this.history.data, 0, 0);
    }

    redo() {
        this.history = this.history.next;
        this.ctx.putImageData(this.history.data, 0, 0);
    }

    offsetCoord(oldCoord, newCoord) {
        if (oldCoord == newCoord) return oldCoord;
        else return 0 * ((oldCoord - newCoord) / Math.abs(oldCoord - newCoord)) + oldCoord;
    }

    copyImage() {
        return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    clearLine(e) {
        const deltaX = e.offsetX - this.prevPos.x;
        const deltaY = e.offsetY - this.prevPos.y;
        const theta = Math.atan(deltaY / deltaX);
        const alpha = (Math.PI / 2) - theta;
        const x = Math.cos(alpha) * this.eraserRadius;
        const y = Math.sin(alpha) * this.eraserRadius;

        this.ctx.beginPath();
        this.ctx.moveTo(this.prevPos.x, this.prevPos.y);
        this.ctx.lineTo(this.prevPos.x + x, this.prevPos.y - y);
        this.ctx.lineTo(this.prevPos.x + x + deltaX, this.prevPos.y - y + deltaY);
        this.ctx.lineTo(this.prevPos.x - x + deltaX, this.prevPos.y + y + deltaY);
        this.ctx.lineTo(this.prevPos.x - x, this.prevPos.y + y);
        this.ctx.closePath();
        this.ctx.save();
        this.ctx.clip();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }
}

export default Draw;