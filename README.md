# StockFlow - Inventory & Sales Management System

StockFlow is a comprehensive, web-based application designed to streamline business operations. It integrates Inventory Management, Sales, Customer Relationship Management (CRM), Human Resource Management (HRM), and more into a single, cohesive platform. Built with performance and usability in mind, StockFlow offers a modern, responsive interface and a robust backend.

## 🚀 Features

StockFlow is packed with modules to manage every aspect of your business:

*   **📊 Dashboard:** Real-time overview of sales, stock levels, and key performance indicators.
*   **📦 Inventory Management:**
    *   Track products, categories, and stock movements.
    *   Manage multiple locations/warehouses.
    *   Low stock alerts and automated tracking.
*   **💰 Sales Management:**
    *   Point of Sale (POS) interface.
    *   Quotation builder.
    *   Sales history and reporting.
*   **👥 Customer Relationship Management (CRM):**
    *   Manage customer profiles and leads.
    *   Track interactions and meetings.
    *   Sales pipeline management (Kanban board).
*   **👔 Human Resource Management (HRM):**
    *   Employee database and profiles.
    *   Leave management and attendance tracking.
    *   Payroll processing.
    *   Asset and vehicle management.
*   **💬 Messaging & Notifications:**
    *   Internal messaging system with broadcast capabilities.
    *   Real-time notifications for important events.
*   **⚙️ Role-Based Access Control:**
    *   Granular permission settings for different roles (Admin, Manager, Sales, HR, etc.).
    *   Dynamic menu generation based on user permissions.
*   **📈 Reports:** Detailed reports for sales, inventory, and HR metrics.

## 🛠️ Tech Stack

*   **Backend:** Node.js, Express.js
*   **Database:** SQLite (Lightweight, zero-configuration)
*   **Frontend:** HTML5, Vanilla CSS3, Vanilla JavaScript (ES6+ Modules)
*   **Security:** Helmet, Rate Limiting, BCrypt for password hashing
*   **Other Tools:** Morgan (Logging), Multer (File Uploads)

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:

*   [Node.js](https://nodejs.org/) (v14.0.0 or higher)
*   npm (Node Package Manager)

## 💿 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/stockflow.git
    cd stockflow
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory (optional, defaults are provided in `server.js`):
    ```env
    PORT=3000
    NODE_ENV=development
    SESSION_SECRET=your_secret_key_here
    ```

4.  **Initialize the Application:**
    The application automatically creates necessary directories (`data`, `logs`, `sessions`) and initializes the SQLite database on the first run.

## ▶️ Usage

1.  **Start the server:**
    ```bash
    # Production mode
    npm start

    # Development mode (with nodemon)
    npm run dev
    ```

2.  **Access the application:**
    Open your browser and navigate to:
    `http://localhost:3000`

3.  **Default Login Credentials:**
    *   **Username:** `admin`
    *   **Password:** `admin123`

    *Note: Please change the default password immediately after logging in for the first time.*

## 📂 Project Structure

```
StockFlow/
├── config/             # Database and session configuration
├── middleware/         # Express middleware (Auth, Error handling)
├── public/             # Static assets (HTML, CSS, JS)
│   ├── css/            # Stylesheets
│   ├── js/             # Frontend logic (Modules)
│   └── ...
├── routes/             # API Routes
├── services/           # Business logic services
├── utils/              # Utility functions (Logger, etc.)
├── server.js           # Application entry point
└── package.json        # Project dependencies and scripts
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Built with ❤️ by [itqatarfoam-hub]*
