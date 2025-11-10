const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const socket = io("https://drawingapp-e3p5.onrender.com");




ctx.fillStyle = "lightblue";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const tools = document.querySelectorAll('input[name="tool"]');
function getSelectedTool() {
  let selected = document.querySelector('input[name="tool"]:checked');
  return selected ? selected.value : null;
}

let currentTool = getSelectedTool();
let drawing = false;
let startX = 0, startY = 0;
let snapshot = null; 
let start = false;
let undoStack = [];
let redoStack = [];
undoStack.push(ctx.getImageData(0,0,canvas.width,canvas.height));
let finalx = null;
let finaly = null;
const width1 = document.getElementById("lineWidth");
let lineWidth = parseInt(width1.value);

width1.addEventListener("input",()=>{
  lineWidth = parseInt(width1.value);
  socket.emit("draw", {lineWidth});
  ctx.lineWidth = lineWidth;
})


document.getElementById("undoBtn").addEventListener("click", undo);
document.getElementById("redoBtn").addEventListener("click", redo);
function saveState() {
  undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  redoStack = [];
}
function undo(emit = true) {
  if (undoStack.length > 0) {
    redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

    const prevState = undoStack.pop();
    ctx.putImageData(prevState, 0, 0);

    if (emit) socket.emit("undo");
  }
}

function redo(emit = true) {
  if (redoStack.length > 0) {
    undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

    const nextState = redoStack.pop();
    ctx.putImageData(nextState, 0, 0);

    if (emit) socket.emit("redo");
  }
}





tools.forEach(tool => {
  tool.addEventListener('change', () => {
    currentTool = getSelectedTool();
    console.log("Tool changed to:", currentTool);
    socket.emit("draw", { tool: currentTool});
    if(currentTool!=="eraser"){
        canvas.style.cursor = "crosshair";
    }
    if(currentTool==="clear"){
        canvas.style.cursor  = "default";
    }
  });
});

function takeSnapshot() {
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function restoreSnapshot() {
  if (snapshot) ctx.putImageData(snapshot, 0, 0);
}

canvas.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return; 
  if (currentTool===null) return;
  if (!drawing) {
    drawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
    lastX = startX;
    lastY = startY;
    takeSnapshot();
    start = true; 
    
  } else {
    drawing = false;
  }
  finalx =startX;
  finaly =startY;
  
  
});

canvas.addEventListener('mousemove', (e) => {
  if (currentTool !== "circle" || !drawing) return;

  const x = e.offsetX;
  const y = e.offsetY;

  const dx = x - startX;
  const dy = y - startY;
  const radius = Math.sqrt(dx * dx + dy * dy);

  restoreSnapshot();
  
  ctx.beginPath();
  ctx.arc(startX, startY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "black";
 
  ctx.stroke();
  
  finalx = x;
  finaly = y;

});

canvas.addEventListener('mousemove', (e) => {
    if (currentTool !== "line" || !drawing) return;

    const x = e.offsetX;
    const y = e.offsetY;
    const dx = x - startX;
    const dy = y - startY;
    
    restoreSnapshot();
    
    ctx.beginPath(); 
    ctx.moveTo(startX, startY); 
    ctx.lineTo(x,y);
    ctx.stroke(); 
    
    finalx = x;
    finaly = y;
});

canvas.addEventListener('mousemove', (e) => {
    if (currentTool !== "brush" || !drawing) return;

  const x = e.offsetX;
  const y = e.offsetY;

  ctx.lineCap = "round";  
  ctx.lineJoin = "round";  
  ctx.strokeStyle = "black"; 

  ctx.beginPath();
  ctx.moveTo(startX,  startY);
  ctx.lineTo(x, y);
  ctx.stroke();

  socket.emit("draw", { tool: "brush", startX, startY, x, y, drawing,lineWidth });

  startX = x;
  startY= y; 
});



canvas.addEventListener('mousemove', (e) => {
    if (currentTool !== "eraser") return;
    canvas.style.cursor = "url('eraser-cursor.png') 5 5,auto";
    
});

canvas.addEventListener('mousemove', (e) => {
    if (currentTool !== "eraser" || !drawing) return;
    const x = e.offsetX;
    const y = e.offsetY;
    const size = 20;
    
    ctx.clearRect(x - size / 2, y - size / 2, 2*size,2* size);
    ctx.fillRect(x - size / 2, y - size / 2, 2*size, 2*size);

    socket.emit("draw", { tool: "eraser", x, y, size ,drawing,lineWidth});
});

canvas.addEventListener('mousedown', (e) => {
    if (currentTool !== "clear" || !drawing) return;

    ctx.clearRect(0,0,canvas.width,canvas.height); 
    ctx.fillStyle = "lightblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear");
});

socket.on("draw", (data) => {
  const { tool} = data;
  const {lineWidth} = data;
  const{start} = data;
  
  const prev = ctx.lineWidth;
  ctx.lineWidth = lineWidth;
  if (tool === "circle") {
    const { startX, startY, x, y } = data;
    const dx = x - startX, dy = y - startY;
    const radius = Math.sqrt(dx * dx + dy * dy);
    
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.stroke();
    saveState();
  }

  if (tool === "line") {
    const { startX, startY, x, y } = data;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
    saveState();
  }
  if (tool === "eraser") {
    const { x, y, size } = data;
    ctx.clearRect(x - size / 2, y - size / 2, 2*size, 2*size);
    ctx.fillRect(x - size / 2, y - size / 2, 2*size, 2*size);
    saveState();
  }
  
  if (tool === "brush") {
    const { startX, startY, x, y } = data;
    ctx.lineCap = "round";  
    ctx.lineJoin = "round";  
    ctx.strokeStyle = "black"; 
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  const {okk} = data;
  if(okk){
    saveState();
  }
  ctx.lineWidth = prev;

  
});

socket.on("undo", () => {
  undo(false);
});

socket.on("redo", () => {
  redo(false);
});

socket.on("clear", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "lightblue";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
  start = false;
  saveState();
  
  if(currentTool==="brush"){
    const okk = true
    socket.emit("draw",{okk})
    return;
  }
  if(startX===finalx&&startY===finaly){
    return;
  }
  socket.emit("draw", { tool: currentTool, startX, startY,x: finalx, y: finaly, start,lineWidth});
});
