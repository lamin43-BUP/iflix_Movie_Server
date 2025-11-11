#  iFlix– A Responsive Movie Streaming Platform 

The goal of this project was to build a fully functional movie 
web application that offers users the ability to create and manage personal accounts, 
maintain a profile with preferences, and interact with movie-related features like saving 
favorites for future viewing. This platform simulates a real-world streaming service 
where users can browse content, and administrators can manage user-related data. The 
system ensures secure login and session handling, file uploads for profile images, and 
dynamic user interaction. It supports both user-facing pages (e.g., profile management, 
content interaction) and an admin dashboard for overseeing users and activity. By 
incorporating both client-side and server-side technologies, this project demonstrates how 
modern web applications work with persistent data, authentication, and dynamic user 
interfaces. The application emphasizes best practices in security, modular backend logic, 
and frontend responsiveness. It also focuses on offering seamless user experience with 
features like real-time profile updates, image previewing before upload, and informative 
dashboard elements.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Setup (run locally)](#quick-setup-run-locally)
- [Environment Variables (.env)](#environment-variables-env)
- [Database Setup](#database-setup)
- [Start the Server](#start-the-server)


---

## Features
- Dynamic Movie Listing 
- Detailed Movie Pages 
- Movie Filtering System  
- Search Movies & Websites  
- TV & Web Series  
- Responsive UI and Clean Design 

## User Features

These features provide registered users with a personalized experience, allowing them to manage preferences and interact with the platform securely.

- **User Profile Page**  
  Users can view and update their personal information, including name, email, gender, bio, age, and movie preferences. They can also upload a profile picture and view their current and past subscription plans.

- **Subscription Plans**  
  Users can subscribe to different plans: 1-month, 3-month, 6-month, 1-year, and 2-year plans. Active subscriptions appear under "Current Subscription," while expired or previous plans are listed under "Past Subscriptions."

- **Session-Based Security**  
  User sessions are managed using cookies and in-memory session tracking (`req.cookies.sessionId`). Unauthorized users attempting to access protected content are redirected to the login page.

- **Watch Later**  
  Logged-in users can save movies to a personal "Watch Later" list by clicking the respective button on movie pages.

- **Profile Picture Upload**  
  Users can upload and update their profile picture, which is displayed on their profile page.

- **User Reviews & Feedback**  
  The platform supports a review and chat system where logged-in users can post feedback on movies or series. Reviews are saved in the database and displayed dynamically, allowing real-time interaction and engagement.

## Admin Features (Administrative Control Panel)

Admins have access to comprehensive tools for managing content, subscriptions, users, and platform analytics.

- **Admin Dashboard**  
  The central hub displays management options through interactive cards such as Add Movie, View Users, View Subscriptions, Delete Movie, Charts, and more. Each card links to its respective admin page.

- **Add Movies**  
  Admins can add new movies by completing a form with details including the movie title, genre, description, poster, video file, and other relevant information.

- **Delete Movies**  
  Admins can remove existing movies from the server by selecting a movie from the list and deleting it.

- **View All Users**  
  Admins can view all registered users in a table format, including profile details. They can also delete users if necessary, enabling monitoring of user activity and growth.

- **Subscription Management**  
  Admins can view user subscriptions, including start and end dates. Data is fetched from the subscriptions table and presented in a structured table.

- **Admin Profile Management**  
  Admins can update their own credentials and contact information, similar to the features available to regular users.

- **Data Visualization**  
  Admins can view key metrics such as user count, subscriptions, and content preferences through interactive charts.

- **Protected Routes for Admin Access**  
  Only admins can access these routes, ensuring secure management of the platform.

---

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript, EJS (optional templating)  
- **Backend:** Node.js, Express.js  
- **Database:** MySQL (`mysql2` package)  
- **File Upload:** `multer` or `express-fileupload`  
- **Utilities / Libraries:** Cookie parsing, body parsing, Node.js built-in `crypto`, Chart.js, Font Awesome

---

## Project Structure (main files & folders)

iflix-project/<br>
├── protected/ # Protected pages (user/admin dashboards)<br>
├── public/ # Static assets (CSS, JS, images, movies)<br>
├── uploads/ # Uploaded profile pictures / media<br>
├── .env # Environment variables (not committed)<br>
├── db.js # Database connection<br>
├── server.js # Main server file<br>
├── package.json<br>
└── package-lock.json<br>

---

## Prerequisites
Make sure you have installed:
- Node.js (v14+ recommended)
- npm (comes with Node)
- MySQL server
- Git

---

## Quick Setup 
### 1. Clone the Project
* Install Git Bash if not already installed.  

* Open Git Bash in your local project directory and configure Git:

```bash
git config --global user.name <github_username>
git config --global user.email <github_email>
```

* Clone the repository:
```bash
git clone https://github.com/lamin43-BUP/iflix_Movie_Server.git
```


### 2. Navigate to the Project Directory
```bash
cd iflix_Movie_Server
```
Open the project in VS Code:
    ```bash
    code .
    ```

Open the terminal in VS Code: **Ctrl + J**


### 3. Install dependencies
```bash
    npm init -y
    npm install express mysql2 bcryptjs body-parser
```

### 4. Create .env file

### 5. Prepare the database
- Create a MySQL database (example name: iflix_db)
- Create necessary tables (users, movies, subscriptions, watch_later, reviews, etc.).

- If you have a database_schema.sql or similar file, import it: (run in MySQL client)
   ```bash
    CREATE DATABASE iflix_db;
    USE iflix_db;
  ```
- Now run your SQL schema import.
  
### 6. Run the server
   ```bash
    node server.js
  ```
Open in browser: 
```bash
    Visit http://localhost:3000 
```
<br>
<br>
<br>

## 🛠️ How to Develop 

### 1\. Commit and Push Changes

After making your changes, commit them to your current branch and push them to the remote repository:

  * Stage all modified files:
    ```bash
    git add .
    ```
  * Commit the changes with a descriptive message:
    ```bash
    git commit -m "Description of changes made"
    ```
  * Push your changes to the remote repository:
    ```bash
    git push origin <your_current_branch_name>
    ```

### 2\. Check CI

  * Go to GitHub **Actions**.
  * Click on the relevant pipeline run for your branch.
  * Ensure all automated tests pass before proceeding.

### 3\. Create a Pull Request

  * Once development is complete and tests pass, create a **Pull Request (PR)** from your branch to the main development branch (`main`).

### 4\. Review and Merge

  * Collaborators will **review** the code and provide feedback on the Pull Request.
  * If approved, **merge** your changes into the main branch.

