# PreGame^2

This is the code for the project in [Interface Programming with a User Perspective](https://www.uu.se/en/study/course?query=1MD031) at Uppsala university. Our project is a game called *PreGame<sup>2*, which you can play together with your friends and family.

## File Dependencies

This outlines the dependencies and relationships between the files in the project.

### Frontend Components

#### 1. **`src/components/BarsComponent.vue`**
- **Purpose**: Displays data as a series of vertical bars, typically used for visualizing poll results.
- **Dependencies**:
  - Receives `labels` (array of labels for each bar) and `data` (an object mapping labels to values) as props.
- **Used In**: `ResultView.vue` as a child component to display poll results graphically.

---

#### 2. **`src/components/QuestionComponent.vue`**
- **Purpose**: Displays a single question and its answer options as buttons.
- **Dependencies**:
  - Accepts a `question` prop (object with `q` for question text and `a` for an array of answer options).
  - Emits an `answer` event when an answer is selected.
- **Used In**: `PollView.vue` as a child component to display a poll question and handle user responses.

---

#### 3. **`src/components/ReorderQuestion.vue`**
- **Purpose**: Allows users to reorder items (e.g., poll options) interactively using drag-and-drop.
- **Dependencies**:
  - Contains its own local data (`question` and `currentlyMoving`) but is generally standalone.
- **Used In**: Could be included in a view to handle special polls requiring reordering logic.

---

#### 4. **`src/components/ResponsiveNav.vue`**
- **Purpose**: Implements a responsive navigation bar with dynamic content slots.
- **Dependencies**:
  - Accepts `hideNav` as a prop to control its visibility.
  - Relies on slots for rendering navigation links or buttons dynamically.
- **Used In**: `StartView.vue` as part of the main navigation structure.

---

#### 5. **`src/views/ResultView.vue`**
- **Purpose**: Displays poll results, including the current question and its answers.
- **Dependencies**:
  - Uses `BarsComponent.vue` to visualize submitted answers.
  - Relies on props for `question` and `submittedAnswers` to render the view.
- **Used In**: Router view when the user navigates to the results page.

---

#### 6. **`src/views/StartView.vue`**
- **Purpose**: Acts as the entry point of the application, showing navigation options and allowing users to join or create polls.
- **Dependencies**:
  - Uses `ResponsiveNav.vue` for navigation.
  - Communicates with the server to retrieve UI labels and poll details.
- **Used In**: Router view for the application’s root route (`/`).

---

### **Router Configuration**

#### 1. **`src/router/index.js`**
- **Purpose**: Defines the routes for the application and sets up Vue Router for navigation.
- **Dependencies**:
  - **`StartView.vue`**: Mapped to the root route (`/`).
  - **`PollView.vue`**: Lazy-loaded for viewing a poll.
  - **`LobbyView.vue`**: Lazy-loaded for accessing a lobby.
  - **`CreateView.vue`**: Lazy-loaded for creating a poll.
  - **`ResultView.vue`**: Lazy-loaded for displaying poll results.
- **Key Features**:
  - Uses `createWebHistory` for HTML5 history mode, removing hash (`#`) from URLs.
  - Lazy-loads components for improved performance.

---

### **Backend Files**

#### 1. **`server/Data.js`**
- **Purpose**: Manages all server-side data, including polls, questions, answers, and participants.
- **Dependencies**:
  - Reads label files dynamically based on the requested language (`getUILabels` method).
  - Interacts with other server-side files (e.g., `sockets.js`) to handle poll creation, question updates, and user submissions.
- **Used In**: `index.js` to provide centralized data management for WebSocket events.

---

#### 2. **`server/sockets.js`**
- **Purpose**: Handles WebSocket events and interactions between clients and the server.
- **Dependencies**:
  - Relies on the `Data.js` file for managing poll data and processing requests.
  - Uses the `io` and `socket` objects to manage WebSocket connections and broadcast updates.
- **Used In**: `index.js` to define WebSocket event listeners.

---

#### 3. **`server/index.js`**
- **Purpose**: Initializes the HTTP and WebSocket servers, handles cross-origin resource sharing (CORS), and connects the server-side functionality.
- **Dependencies**:
  - Imports and initializes `Data.js` to manage server-side data.
  - Loads `sockets.js` to define WebSocket event listeners.
  - Uses `socket.io` for real-time communication and `http` to create the server.
- **Used As**: The main entry point for running the backend server.

---

### **General Dependencies**

- **Frontend**:
  - Vue Router: Used for routing between views (e.g., `StartView.vue`, `PollView.vue`, `ResultView.vue`).
  - WebSocket: Used to communicate with the backend for real-time updates.
  - CSS/SCSS: Used to style components (`main.css` and scoped styles in each component).

- **Backend**:
  - `fs` Module: Used in `Data.js` to load language label files dynamically.
  - Socket.io: Used for WebSocket communication between the server and clients.

---

### **Component Flow**

1. **`StartView.vue`**: The user enters the application and can navigate to create or join a poll.
2. **`PollView.vue`**: Displays the current poll question using `QuestionComponent.vue`. Handles user responses.
3. **`ResultView.vue`**: Shows poll results using `BarsComponent.vue` for visualization.
4. **Backend (`index.js`, `Data.js`, `sockets.js`)**: Manages the poll data, processes responses, and broadcasts updates to connected clients.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

Note that this command starts two servers – a Vite server and a simple data and socket communication server.

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
