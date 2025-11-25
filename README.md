# DealerHub (Dealer Management System)

A modern and comprehensive B2B Dealer Management System built with Next.js 16, Prisma, and Tailwind CSS.

![Dashboard Preview](https://via.placeholder.com/800x400?text=DealerHub+Dashboard)

## 🚀 Features

### 👑 Admin Panel (ROOT)
*   **Dashboard:** Visualize total sales, collections, pending payments, and order statuses graphically.
*   **Store Management:** Create, edit, and delete stores.
*   **Product Management:** View and manage products across all stores.
*   **Order Management:** View all orders, update statuses, and inspect details.
*   **Customer Management:** List all customers.
*   **Admin Management:** Create and authorize new admin users.

### 🏪 Store Panel (STORE)
*   **Dashboard:** Store-specific sales statistics and summary reports.
*   **Product Management:** Track stock, manage prices, and add/edit products.
*   **Order Creation:** Fast order creation for customers (Cart system).
*   **Order Tracking:** Update order statuses (Preparing, Shipped, etc.).
*   **Customer Management:** Create and manage a customer database.
*   **Settings:** Customize sales contracts, default notes, and bank/IBAN information.
*   **Printing:** Print order details and contracts.

## 🛠 Tech Stack

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Database:** [SQLite](https://www.sqlite.org/) (with Prisma ORM)
*   **Authentication:** [NextAuth.js v5](https://authjs.dev/) (Beta)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
*   **Form Management:** React Hook Form & Zod

## 📦 Installation

Follow these steps to run the project locally:

1.  **Clone the Project:**
    ```bash
    git clone https://github.com/birhatmf/DealerHub.git
    cd bayi-app
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables:**
    Create a `.env` file and add the following values:
    ```env
    DATABASE_URL="file:./dev.db"
    AUTH_SECRET="your-secret-key-here" # Generate with `npx auth secret`
    ```

4.  **Prepare the Database:**
    ```bash
    npx prisma db push
    ```

5.  **Create Admin User:**
    ```bash
    npx tsx prisma/seed.ts
    ```
    *Default Admin:* `admin` / `admin123`

6.  **Start the Application:**
    ```bash
    npm run dev
    ```
    Go to `http://localhost:3000` in your browser.

## 🔑 Usage

### Default Login Credentials
*   **Username:** `admin`
*   **Password:** `admin123`

After logging in, you can create new stores from the Admin panel and set usernames/passwords for them.

## 📂 Project Structure

```
bayi-app/
├── app/
│   ├── (admin)/      # Admin panel pages
│   ├── (store)/      # Store panel pages
│   ├── actions/      # Server Actions (Database operations)
│   └── api/          # API routes (Auth, etc.)
├── components/       # Reusable UI components
├── lib/              # Utility functions and Prisma client
├── prisma/           # Database schema and seed files
└── public/           # Static files
```

## 📄 License

This project is licensed under the [MIT](LICENSE) license.
