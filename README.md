# Secrest App

Secrets App is a **secure** and **simple web application** where users can register, log in, and anonymously submit secrets. Users can also edit and delete their own secrets while viewing secrets submitted by others. The app provides a **fun** and **private** way to share thoughts **anonymously**, with a **clean** and **responsive** Bootstrap UI.

## Features:

🧑‍💻 **User Management:**

User Registration with email & password.

User Login with session-based authentication.

Logout functionality.

🔐 **Secret Sharing:**

Submit secrets anonymously after login.

View a list of all secrets shared by users.

Each user can edit and delete their own secrets.

Secrets are stored privately in the user’s document in MongoDB.

💬 **Flash Messaging:**

Flash messages for success/failure in login, registration, secret submission, edit, delete, and logout.

Auto-dismiss of flash messages after 5 seconds.

🖼️ **UI / UX:**

Responsive design using Bootstrap 5.

Styled components for secrets with hover effects.

Forms for register, login, submit, and edit.

Confirmation popup for deleting secrets.

## Typical Workflow:

User registers → User created with hashed password → redirected to login

User logs in → Session started → redirected to /secrets

User submits a secret → Added to their own secrets array

Secrets page → Displays all secrets from all users

Edit/Delete → Only owner of secret can edit/delete it

Logout → Session cleared → redirected to /login

## Technical Overview (Behind the Scenes):

💻 Backend
Node.js with Express.js.

MongoDB for data storage (secrets and users).

Mongoose ORM

Passport.js with passport-local-mongoose for user authentication.

Express-session for session management.

Connect-flash for flash messages.

📐 Frontend
EJS Templating Engine

Bootstrap 5 and CSS for styling.

🔒 Security
Passwords hashed & salted using Passport.js and passport-local-mongoose.

Secrets stored as array of strings inside each User document.

Protected routes using ensureAuthenticated middleware.

## Preview: 
https://secrets-app-vsec.onrender.com

## Contact:
If you'd like to see more of my work, connect with me through my portfolio:

Developer: Fatimah Ali
Website: fatimahdigitaledge.com
GitHub: github.com/fati-810

## License:
This project is for educational and portfolio purposes.
