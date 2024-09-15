# Team To-Do List App

This is a cross-platform mobile app developed for the RayTech Developer Evaluation Project. The app allows teams to manage to-do lists with role-based permissions for users.

## Features
- **Task Management**: Users can create, edit, delete, and mark tasks as complete.
- **User Roles and Permissions**: 
  - Admins can add, edit, delete tasks, and assign tasks to team members.
  - Members can only mark tasks as complete.
- **Basic Authentication**: Users can sign up and log in using email and password via Firebase authentication.

## Technologies Used
- **React Native (Expo)**: Used to build the cross-platform mobile app.
- **Firebase Realtime Database**: For storing tasks and managing user data.
- **Firebase Authentication**: For user login and signup functionality.
- **AsyncStorage**: To store user data locally (e.g., role and user ID).

## Setup and Installation
To run this app locally, follow these steps:

### Prerequisites
- Node.js
- Expo CLI (installed globally)
- Firebase Project (You need to create a Firebase project and configure it)

### Steps to Run the App
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/team-todo-app.git
   cd team-todo-app
   npx expo start
