# Knit Row Counter

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-View%20Here-brightgreen?style=for-the-badge&logo=github)](https://seary342.github.io/knit-row-counter/)

A modern, responsive web application designed to help knitters and crocheters easily track their progress on multiple projects. Never lose your place in a pattern again!

## Live Demo

You can access the live application here:

**[https://seary342.github.io/knit-row-counter/](https://seary342.github.io/knit-row-counter/)**

## Features

- **Multi-Project Management**: Keep track of all your works-in-progress in one place.
- **Simple Row & Stitch Counting**: Easily increment or decrement counters for each project.
- **Dark & Light Modes**: A sleek Material-UI interface that respects your system's theme preference.
- **Responsive Design**: Looks and works great on phones, tablets, and desktops.

## Technology Stack

This project is built with a modern web development stack:

- **Framework**: [React](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [Material-UI (MUI)](https://mui.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Testing**: [Vitest](https://vitest.dev/)

## Development

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or another package manager like [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/).

### Installation & Setup

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/seary342/knit-row-counter.git
    cd knit-row-counter
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    ```

3.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

### Available Scripts

- `npm run dev`: Starts the development server with hot-reloading.
- `npm run build`: Compiles and bundles the app for production into the `docs/` directory.
- `npm run preview`: Serves the production build locally to preview it.
- `npm run test`: Runs the unit and component tests using Vitest.

## Deployment

This project is automatically deployed to GitHub Pages. The `npm run build` command generates the production-ready files in the `docs/` directory, which is the source for the GitHub Pages site. The use of `vite-plugin-singlefile` ensures the entire application is bundled into a single HTML file for maximum portability and offline performance.
