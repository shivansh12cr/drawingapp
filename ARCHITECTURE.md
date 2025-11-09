project:
  title: "Real-Time Collaborative Drawing Application"
  description: >
    A real-time web-based drawing tool that allows multiple users to draw simultaneously on a shared canvas.
    The application demonstrates client-server synchronization using WebSockets (Socket.IO),
    implemented with Node.js, Express, and Vanilla JavaScript. The frontend is hosted on Vercel,
    and the backend is hosted on Render.

  authors:
      name: "Shivansh Gupta"
      role: "Developer / Student"
  technologies_used:
    frontend: "HTML, CSS, JavaScript (Canvas API)"
    backend: "Node.js, Express.js, Socket.IO"
    communication: "WebSocket via Socket.IO"
    hosting:
      frontend: "Vercel"
      backend: "Render"

  urls:
    frontend: "https://drawingapp-mu.vercel.app/"
    backend: "https://drawingapp-e3p5.onrender.com"
    repository: "https://github.com/shivansh12cr/drawingapp"



features:
  - Real-time drawing synchronization between multiple users
  - Drawing tools: Brush, Line, Circle, Eraser, Clear Canvas
  - Undo and Redo functionality
  - Adjustable brush width
  - Lightweight, simple interface



system_architecture:
  overview: >
    The application follows a client-server model.
    Each client connects to the server through a persistent WebSocket connection (Socket.IO).
    Drawing events are emitted by one client and broadcast by the server to all connected clients
    to maintain real-time synchronization.

  data_flow: 
    User draws on canvas
          
    Canvas captures mouse/touch coordinates
        
    Client emits 'draw' event to the server
          
    Server receives and broadcasts to all connected clients
          
    Each client updates its local canvas view

  websocket_protocol:
    - event: draw
      direction: "Client → Server → Clients"
      payload: "{ tool, startX, startY, x, y, size }"
      description: "Broadcasts drawing coordinates and tool data"
    - event: undo
      direction: "Client ↔ Server"
      payload: "None"
      description: "Undo last drawing action for all users"
    - event: redo
      direction: "Client ↔ Server"
      payload: "None"
      description: "Redo last undone drawing action for all users"
    - event: clear
      direction: "Client ↔ Server"
      payload: "None"
      description: "Clears the entire canvas for all users"
    - event: connect
      direction: "Server → Client"
      payload: "socket.id"
      description: "Identifies a new connection"
    - event: disconnect
      direction: "Server → Client"
      payload: "socket.id"
      description: "Handles user disconnection"



undo_redo_system:
  concept: "Each client maintains its own undo and redo stacks."
  stacks:
    undoStack: "Stores previous ImageData states"
    redoStack: "Stores undone ImageData states"
  logic:
    - "Before each draw action: call saveState() to push current canvas data into undoStack"
    - "Undo: pop state from undoStack, push to redoStack, and restore canvas"
    - "Redo: pop state from redoStack, push to undoStack, and reapply to canvas"
    - "Clear: save current canvas before clearing so it can be undone"
  synchronization: "Undo/Redo and Clear actions are also broadcast using Socket.IO to keep all clients synchronized."



performance_optimizations:
  - optimization: "Use of { willReadFrequently: true } with getContext()"
    reason: "Optimizes frequent getImageData calls used by undo/redo"
  - optimization: "Local undo/redo stack per client"
    reason: "Reduces heavy network data transfer"
  - optimization: "Minimal JSON payloads for draw events"
    reason: "Improves WebSocket efficiency and responsiveness"
  - optimization: "Native Canvas API operations"
    reason: "Ensures smooth rendering and better browser performance"



conflict_resolution:
  drawing_conflicts: >
    When multiple users draw simultaneously, each event is processed independently and broadcast in order of arrival.
    The visual result is a merged combination of all drawing actions rendered sequentially.
  global_actions: >
    Undo, redo, and clear actions are synchronized across all clients.
    The server broadcasts these events immediately to maintain consistency.



deployment_architecture:
  frontend:
    platform: "Vercel"
    role: "Serves static files (HTML, CSS, JavaScript)"
  backend:
    platform: "Render"
    role: "Hosts Node.js + Socket.IO server"
  communication:
    protocol: "WebSocket (via Socket.IO)"
    transport: "HTTPS"
  port_binding: "process.env.PORT (auto-managed by Render)"
  cors_policy: "Allows both Vercel and local testing origins"














conclusion: >
  The project successfully demonstrates a real-time collaborative drawing system using web technologies.
  It provides live synchronization through WebSockets, efficient local undo/redo management,
  and smooth performance with minimal resource overhead.
  The implementation focuses on clarity, modularity, and maintainability,
  making it a strong foundation for future real-time collaborative applications.
