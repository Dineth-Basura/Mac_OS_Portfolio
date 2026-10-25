#  macOS-Themed Interactive Portfolio

<div align="center">

  [![Live Demo](https://img.shields.io/badge/Live%20Demo-macportfolio--sepia.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://macportfolio-sepia.vercel.app/)
  [![GitHub License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
  [![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://macportfolio-sepia.vercel.app/)

  <p align="center">
    An interactive, browser-based macOS desktop simulator built to showcase projects, skills, certifications, and experience in Cybersecurity & Software Development.
  </p>

  **[Explore Live Demo »](https://macportfolio-sepia.vercel.app/)**

</div>

---

## ✨ Features

- ** macOS Desktop Experience**:
  - Realistic macOS menu bar, dock animations, and wallpaper.
  - Draggable, resizable, minimizable, and stackable windows.
  - Interactive widgets (Analog Clock, Calendar, Battery & Network status).
  - macOS Spotlight search (`Cmd/Ctrl + Space`).
  - Lock screen and boot animation with skip option.
  - Drag-and-drop icon and widget repositioning with local storage persistence.

- **🛠 Built-in Applications**:
  - **Finder & Projects**: Explore featured projects with categorized previews, tech stack tags, and repository links.
  - **Terminal**: Interactive command-line interface with custom commands and CTF challenges.
  - **Dinu AI & Contact**: Integrated contact form powered by Web3Forms and personal AI assistant powered by Google Gemini.
  - **Notes & Settings**: Interactive note-taking and theme customization.
  - **Camera & Photos**: Browser camera capture and photo viewer.

---

## 🚀 Live Demo

Check out the live website hosted on Vercel:  
🔗 **[https://macportfolio-sepia.vercel.app/](https://macportfolio-sepia.vercel.app/)**

---

## 🛠 Tech Stack

- **Frontend**: HTML5, Modern CSS3, JavaScript (ES6+), GSAP Animations
- **Backend / Serverless**: Node.js, Express (local dev), Vercel & Netlify Serverless Functions
- **AI Integration**: Google Gemini API (`gemini-3.8-flash`)
- **Forms & Email**: Web3Forms API
- **Deployment**: Vercel

---

## 📂 Featured Projects Showcase

| Project | Description | Tech Stack |
|---|---|---|
| **Meridian Transfer** | Six-stage Capture The Flag (CTF) security challenge platform | Security, CTF, Web |
| **TCP Client-Server System** | Network socket communication engine in C with a Python GUI client | C, Python, Sockets |
| **PlateX** | Automated license plate recognition & vehicle classification | Python, YOLO, PaddleOCR, Flask, OpenCV |
| **Password Strength & Security Toolkit**| Entropy-based password analysis and auditing tool | Python, Cryptography |
| **Online Book Store** | Full-stack e-commerce web platform | React, Express, MongoDB, Node.js |
| **Gym Management System** | Complete desktop enterprise management software | Java, Spring Boot, MySQL |

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/Dineth-Basura/Mac_OS_Portfolio.git
cd Mac_OS_Portfolio
```

### 2. Configure Environment Variables (Optional for AI Mode)
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
PORT=3000
```

### 3. Run Locally
To run the static site + local AI server (Node.js 22+ recommended):
```bash
node --env-file=.env server/dev.cjs
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: You can also open `index.html` directly in any web browser to explore the desktop UI and Contact form without running any server.

---

## 🌐 Deploying to Vercel

1. Import the repository into **[Vercel](https://vercel.com)**.
2. In **Build and Output Settings**:
   - **Build Command**: `node scripts/build-static.cjs`
   - **Output Directory**: `site`
3. (Optional) Add your `GEMINI_API_KEY` under **Environment Variables**.
4. Click **Deploy**.

---

## 👤 About the Author

**Dineth Basura**  
Cybersecurity Undergraduate at SLIIT, Sri Lanka (BSc Hons in IT specializing in Cyber Security).

- 🌐 **Portfolio**: [macportfolio-sepia.vercel.app](https://macportfolio-sepia.vercel.app/)
- 🐙 **GitHub**: [@Dineth-Basura](https://github.com/Dineth-Basura)
- 💼 **LinkedIn**: [Dineth Basura](https://www.linkedin.com/in/dineth-basura-00711035a)
- 📧 **Email**: [dinethbasura1@gmail.com](mailto:dinethbasura1@gmail.com)

---

## 📄 License

This project is licensed under the MIT License - feel free to use and adapt it for your own portfolio.
