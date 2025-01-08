const create1 = document.getElementById('Create1');
const pickColor = document.getElementById('PickColor');
const deleteRect = document.getElementById('DeleteRect');
const clearCanvas = document.getElementById('ClearCanvas');
const saveCanvas = document.getElementById('SaveCanvas');
const loadCanvas = document.getElementById('LoadCanvas');
const addShape = document.getElementById('AddShape');
const rotateShape = document.getElementById('RotateShape');
const pinShape = document.getElementById('PinShape');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let currentColor = 'blue';
let rectangles = [];
let selectedRect = null;
let isDragging = false;
let isResizing = false;
let isRotating = false;
let offsetX, offsetY;
let initialAngle = 0;

function drawRectangles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rectangles.forEach(rect => {
        ctx.fillStyle = rect.color;
        ctx.strokeStyle = rect.borderColor || 'black';
        ctx.lineWidth = 2;
        ctx.save();
        ctx.translate(rect.x, rect.y);
        ctx.rotate(rect.angle || 0);
        if (rect.type === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, rect.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        } else if (rect.type === 'onearrow' || rect.type === 'twoarrow') {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(rect.width, 0);
            ctx.stroke();
            if (rect.type === 'onearrow' || rect.type === 'twoarrow') {
                ctx.lineTo(rect.width - 10, -10);
                ctx.moveTo(rect.width, 0);
                ctx.lineTo(rect.width - 10, 10);
            }
            if (rect.type === 'twoarrow') {
                ctx.moveTo(0, 0);
                ctx.lineTo(10, -10);
                ctx.moveTo(0, 0);
                ctx.lineTo(10, 10);
            }
            ctx.stroke();
            ctx.closePath();
        } else if (rect.type === 'tiltedRectangle') {
            ctx.save();
            ctx.translate(rect.width / 2, rect.height / 2);
            ctx.rotate(Math.PI / 6);
            ctx.fillRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height);
            ctx.restore();
        } else if (rect.type === 'oval') {
            ctx.save();
            ctx.scale(1, 0.5);
            ctx.beginPath();
            ctx.arc(0, 0, rect.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        } else if (rect.type === 'parallelogram') {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(rect.width, 0);
            ctx.lineTo(rect.width - 20, rect.height);
            ctx.lineTo(-20, rect.height);
            ctx.closePath();
            ctx.fill();
        } else if (rect.type === 'kite') {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(rect.width / 2, -rect.height);
            ctx.lineTo(rect.width, 0);
            ctx.lineTo(rect.width / 2, rect.height);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillRect(0, 0, rect.width, rect.height);
        }
        if (rect === selectedRect) {
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 5;
            if (rect.type === 'circle' || rect.type === 'oval') {
                ctx.beginPath();
                ctx.arc(0, 0, rect.radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.closePath();
            } else if (rect.type === 'onearrow' || rect.type === 'twoarrow') {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(rect.width, 0);
                ctx.stroke();
                ctx.closePath();
            } else {
                ctx.strokeRect(0, 0, rect.width, rect.height);
            }
        }
        ctx.restore();
        ctx.save();
        ctx.translate(rect.x, rect.y);
        ctx.rotate(rect.angle || 0);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (rect.type === 'circle' || rect.type === 'oval') {
            ctx.fillText(rect.text, 0, 0);
        } else {
            ctx.fillText(rect.text, rect.width / 2, rect.height / 2);
        }
        if (rect.pinned) {
            ctx.fillText('📌', rect.width / 2, -10);
        }
        ctx.restore();
    });
}

create1.addEventListener('click', () => {
    const rect = { x: 50, y: 50, width: 200, height: 100, color: 'lightblue', borderColor: '#000080', text: '', angle: 0 };
    rectangles.push(rect);
    selectedRect = rect;
    drawRectangles();
});

pickColor.addEventListener('click', () => {
    colorPicker.click();
});

colorPicker.addEventListener('input', () => {
    if (selectedRect) {
        selectedRect.color = colorPicker.value;
        currentColor = colorPicker.value;
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
            newShape = { x: 150, y: 150, radius: 50, color: currentColor, borderColor: '#000080', text: '', type: 'circle', angle: 0 };
        } else if (shape === 'onearrow') {
            newShape = { x: 50, y: 50, width: 100, height: 10, color: currentColor, borderColor: '#000080', text: '', type: 'onearrow', angle: 0 };
        } else if (shape === 'twoarrow') {
            newShape = { x: 50, y: 50, width: 100, height: 10, color: currentColor, borderColor: '#000080', text: '', type: 'twoarrow', angle: 0 };
        } else if (shape === 'rectangle') {
            newShape = { x: 50, y: 50, width: 200, height: 100, color: currentColor, borderColor: '#000080', text: '', type: 'rectangle', angle: 0 };
        } else if (shape === 'tiltedrectangle') {
            newShape = { x: 50, y: 50, width: 200, height: 100, color: currentColor, borderColor: '#000080', text: '', type: 'tiltedRectangle', angle: 0 };
        } else if (shape === 'oval') {
            newShape = { x: 150, y: 150, radius: 50, color: currentColor, borderColor: '#000080', text: '', type: 'oval', angle: 0 };
        } else if (shape === 'parallelogram') {
            newShape = { x: 50, y: 50, width: 200, height: 100, color: currentColor, borderColor: '#000080', text: '', type: 'parallelogram', angle: 0 };
        } else if (shape === 'kite') {
            newShape = { x: 50, y: 50, width: 100, height: 100, color: currentColor, borderColor: '#000080', text: '', type: 'kite', angle: 0 };
        }
        rectangles.push(newShape);
        selectedRect = newShape;
        drawRectangles();
        shapeModal.style.display = 'none';
    });
});

rotateShape.addEventListener('click', () => {
    if (selectedRect) {
        const angle = prompt('Enter rotation angle in degrees:', '45');
        if (angle !== null) {
            selectedRect.angle = (selectedRect.angle || 0) + (Math.PI / 180) * parseFloat(angle);
            drawRectangles();
        }
    }
});

pinShape.addEventListener('click', () => {
    if (selectedRect) {
        selectedRect.pinned = !selectedRect.pinned;
        drawRectangles();
    }
});

function snapToGrid(value, gridSize) {
    return Math.round(value / gridSize) * gridSize;
}

canvas.addEventListener('mousedown', (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    selectedRect = rectangles.find(rect => {
        const dx = mouseX - rect.x;
        const dy = mouseY - rect.y;
        if (rect.type === 'circle') {
            return dx * dx + dy * dy <= rect.radius * rect.radius;
        } else if (rect.type === 'onearrow' || rect.type === 'twoarrow') {
            return dx >= 0 && dx <= rect.width && Math.abs(dy) <= 10;
        } else if (rect.type === 'oval') {
            return dx * dx + (dy * 2) * (dy * 2) <= rect.radius * rect.radius;
        } else {
            return mouseX >= rect.x && mouseX <= rect.x + rect.width && mouseY >= rect.y && mouseY <= rect.y + rect.height;
        }
    });
    if (selectedRect) {
        const dx = mouseX - selectedRect.x;
        const dy = mouseY - selectedRect.y;
        if (dx >= selectedRect.width - 10 && dy >= selectedRect.height - 10) {
            isRotating = true;
            initialAngle = Math.atan2(dy, dx) - (selectedRect.angle || 0);
        } else if (selectedRect.type === 'onearrow' || selectedRect.type === 'twoarrow') {
            if (dx >= selectedRect.width - 10) {
                isResizing = true;
            } else {
                isDragging = true;
                offsetX = dx;
                offsetY = dy;
            }
        } else {
            isDragging = true;
            offsetX = dx;
            offsetY = dy;
        }
        rectangles = rectangles.filter(rect => rect !== selectedRect);
        rectangles.push(selectedRect); // Move selected rectangle to the top
        drawRectangles();
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && selectedRect && !selectedRect.pinned) {
        selectedRect.x = snapToGrid(e.offsetX - offsetX, 20);
        selectedRect.y = snapToGrid(e.offsetY - offsetY, 20);
        drawRectangles();
    } else if (isResizing && selectedRect) {
        selectedRect.width = snapToGrid(e.offsetX - selectedRect.x, 20);
        drawRectangles();
    } else if (isRotating && selectedRect) {
        const dx = e.offsetX - selectedRect.x;
        const dy = e.offsetY - selectedRect.y;
        selectedRect.angle = Math.atan2(dy, dx) - initialAngle;
        drawRectangles();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
    isRotating = false;
});

canvas.addEventListener('dblclick', (e) => {
    if (selectedRect) {
        const input = prompt('Enter text:', selectedRect.text);
        if (input !== null) {
            selectedRect.text = input;
            if (selectedRect.type === 'circle' || selectedRect.type === 'oval') {
                const textWidth = ctx.measureText(input).width;
                selectedRect.radius = Math.max(50, textWidth / 2);
            } else {
                selectedRect.width = Math.max(200, input.length * 10);
            }
            drawRectangles();
        }
    }
});