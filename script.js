const create1 = document.getElementById('Create1');
const pickColor = document.getElementById('PickColor');
const deleteRect = document.getElementById('DeleteRect');
const clearCanvas = document.getElementById('ClearCanvas');
const saveCanvas = document.getElementById('SaveCanvas');
const loadCanvas = document.getElementById('LoadCanvas');
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
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
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

pickColor.addEventListener('click', () => {
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.style.position = 'absolute';
    colorInput.style.left = '60px';
    colorInput.style.top = '120px';
    document.body.appendChild(colorInput);

    colorInput.addEventListener('input', () => {
        if (selectedRect) {
            selectedRect.color = colorInput.value;
            drawRectangles();
        }
    });
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

canvas.addEventListener('mousedown', (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    selectedRect = rectangles.find(rect => mouseX >= rect.x && mouseX <= rect.x + rect.width && mouseY >= rect.y && mouseY <= rect.y + rect.height);
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
            selectedRect.width = Math.max(200, input.length * 10);
            drawRectangles();
        }
    }
});