const create1 = document.getElementById('Create1');
const pickColor = document.getElementById('PickColor');
const deleteRect = document.getElementById('DeleteRect');
const clearCanvas = document.getElementById('ClearCanvas');
const saveCanvas = document.getElementById('SaveCanvas');
const loadCanvas = document.getElementById('LoadCanvas');
const addShape = document.getElementById('AddShape');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let currentColor = 'blue';
let rectangles = [];
let selectedRect = null;
let isDragging = false;
let offsetX, offsetY;

function drawRectangles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rectangles.forEach(rect => {
        ctx.fillStyle = rect.color;
        if (rect.type === 'circle') {
            ctx.beginPath();
            ctx.arc(rect.x, rect.y, rect.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        } else if (rect.type === 'arrow') {
            ctx.beginPath();
            ctx.moveTo(rect.x, rect.y);
            ctx.lineTo(rect.x + rect.width, rect.y);
            ctx.lineTo(rect.x + rect.width - 10, rect.y - 10);
            ctx.moveTo(rect.x + rect.width, rect.y);
            ctx.lineTo(rect.x + rect.width - 10, rect.y + 10);
            ctx.stroke();
            ctx.closePath();
        } else if (rect.type === 'tiltedRectangle') {
            ctx.save();
            ctx.translate(rect.x + rect.width / 2, rect.y + rect.height / 2);
            ctx.rotate(Math.PI / 6);
            ctx.fillRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
            ctx.restore();
        } else if (rect.type === 'oval') {
            ctx.save();
            ctx.translate(rect.x, rect.y);
            ctx.scale(1, 0.5);
            ctx.beginPath();
            ctx.arc(0, 0, rect.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else if (rect.type === 'parallelogram') {
            ctx.beginPath();
            ctx.moveTo(rect.x, rect.y);
            ctx.lineTo(rect.x + rect.width, rect.y);
            ctx.lineTo(rect.x + rect.width - 20, rect.y + rect.height);
            ctx.lineTo(rect.x - 20, rect.y + rect.height);
            ctx.closePath();
            ctx.fill();
        } else if (rect.type === 'kite') {
            ctx.beginPath();
            ctx.moveTo(rect.x, rect.y);
            ctx.lineTo(rect.x + rect.width / 2, rect.y - rect.height);
            ctx.lineTo(rect.x + rect.width, rect.y);
            ctx.lineTo(rect.x + rect.width / 2, rect.y + rect.height);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        }
        if (rect === selectedRect) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 5;
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        }
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rect.text, rect.x + rect.width / 2, rect.y + rect.height / 2);
    });
}

create1.addEventListener('click', () => {
    const rect = { x: 50, y: 50, width: 200, height: 100, color: currentColor, text: '' };
    rectangles.push(rect);
    selectedRect = rect;
    drawRectangles();
});

// Color Picker Modal
const colorModal = document.getElementById('colorModal');
const colorPicker = document.getElementById('colorPicker');
const span = document.getElementsByClassName('close')[0];

pickColor.addEventListener('click', () => {
    colorModal.style.display = 'block';
});

span.onclick = function() {
    colorModal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == colorModal) {
        colorModal.style.display = 'none';
    }
}

colorPicker.addEventListener('input', () => {
    if (selectedRect) {
        selectedRect.color = colorPicker.value;
        drawRectangles();
    }
});

deleteRect.addEventListener('click', () => {
    if (selectedRect) {
        rectangles = rectangles.filter(rect => rect !== selectedRect);
        selectedRect = null;
        drawRectangles();
    }
});

clearCanvas.addEventListener('click', () => {
    rectangles = [];
    selectedRect = null;
    drawRectangles();
});

saveCanvas.addEventListener('click', () => {
    const data = JSON.stringify(rectangles);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas.json';
    a.click();
    URL.revokeObjectURL(url);
});

loadCanvas.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            rectangles = JSON.parse(event.target.result);
            selectedRect = null;
            drawRectangles();
        };
        reader.readAsText(file);
    });

    input.click();
    document.body.removeChild(input);
});

// Shape Picker Modal
const shapeModal = document.getElementById('shapeModal');
const shapeButtons = document.querySelectorAll('#shapeModal button');

addShape.addEventListener('click', () => {
    shapeModal.style.display = 'block';
});

shapeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const shape = button.id.replace('shape', '').toLowerCase();
        let newShape;
        if (shape === 'circle') {
            newShape = { x: 150, y: 150, radius: 50, color: currentColor, text: '', type: 'circle' };
        } else if (shape === 'onearrow') {
            newShape = { x: 50, y: 50, width: 100, height: 10, color: currentColor, text: '', type: 'arrow' };
        } else if (shape === 'twoarrow') {
            newShape = { x: 50, y: 50, width: 100, height: 10, color: currentColor, text: '', type: 'arrow' };
        } else if (shape === 'rectangle') {
            newShape = { x: 50, y: 50, width: 200, height: 100, color: currentColor, text: '', type: 'rectangle' };
        } else if (shape === 'tiltedrectangle') {
            newShape = { x: 50, y: 50, width: 200, height: 100, color: currentColor, text: '', type: 'tiltedRectangle' };
        } else if (shape === 'oval') {
            newShape = { x: 150, y: 150, radius: 50, color: currentColor, text: '', type: 'oval' };
        } else if (shape === 'parallelogram') {
            newShape = { x: 50, y: 50, width: 200, height: 100, color: currentColor, text: '', type: 'parallelogram' };
        } else if (shape === 'kite') {
            newShape = { x: 50, y: 50, width: 100, height: 100, color: currentColor, text: '', type: 'kite' };
        }
        rectangles.push(newShape);
        selectedRect = newShape;
        drawRectangles();
        shapeModal.style.display = 'none';
    });
});

canvas.addEventListener('mousedown', (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    selectedRect = rectangles.find(rect => {
        if (rect.type === 'circle') {
            const dx = mouseX - rect.x;
            const dy = mouseY - rect.y;
            return dx * dx + dy * dy <= rect.radius * rect.radius;
        } else {
            return mouseX >= rect.x && mouseX <= rect.x + rect.width && mouseY >= rect.y && mouseY <= rect.y + rect.height;
        }
    });
    if (selectedRect) {
        isDragging = true;
        offsetX = mouseX - selectedRect.x;
        offsetY = mouseY - selectedRect.y;
        rectangles = rectangles.filter(rect => rect !== selectedRect);
        rectangles.push(selectedRect); // Move selected rectangle to the top
        drawRectangles();
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && selectedRect) {
        selectedRect.x = e.offsetX - offsetX;
        selectedRect.y = e.offsetY - offsetY;
        drawRectangles();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('dblclick', (e) => {
    if (selectedRect) {
        const input = prompt('Enter text:', selectedRect.text);
        if (input !== null) {
            selectedRect.text = input;
            if (selectedRect.type !== 'circle') {
                selectedRect.width = Math.max(200, input.length * 10);
            }
            drawRectangles();
        }
    }
});