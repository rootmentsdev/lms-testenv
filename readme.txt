LMS - README
============

Project Name: LMS (Learning Management System)  
Version: 1.0.0  
Last Updated: April 29, 2025  

DESCRIPTION
-----------
The LMS (Learning Management System) is a web-based platform designed to facilitate online training through video-based learning, assessments, and user tracking. It supports role-based access, customizable training modules, and real-time progress monitoring. Admins can assign training, add users, and manage content, while users can learn and take assessments at their own pace.

FEATURES
--------
1. Add video trainings via YouTube or direct video URLs  
2. Attach multiple questions (MCQs, descriptive) to each video URL  
3. Create and manage assessments for training modules  
4. Track user progress on each module and overall completion status  
5. Update user details (name, email, password, role, etc.)  
6. Add and manage admin users  
7. Create three distinct user roles:  
   - Admin: Full control of platform  
   - Trainer: Can create training and assign assessments  
   - User: Takes training and submits assessments  
8. Assign specific training modules to selected users or groups  
9. Real-time reporting for each user's progress and scores  
10. Role-based access to dashboard and APIs

TECH STACK
----------
Frontend:
- React.js
- Tailwind CSS
- Axios

Backend:
- Node.js
- Express.js
- MongoDB
- JWT Authentication & Role-Based Access Control (RBAC)

Other Integrations:
- Cloudinary for image/video thumbnail support
- Cron jobs for notification reminders
- YouTube Data API (optional)

SETUP INSTRUCTIONS
------------------
1. Clone the repository:
   git clone https://github.com/yourusername/lms.git

2. Navigate to the project directory:
   cd lms

3. Install dependencies:
   Backend:
   cd backend  
   npm install

   Frontend:
   cd ../frontend  
   npm install

4. Set environment variables in `.env` files for both backend and frontend:

   (Backend)
   - MONGO_URI=  
   - JWT_SECRET=  
   - CLOUDINARY_API_KEY=  
   - CLOUDINARY_API_SECRET=  
   - CLOUDINARY_CLOUD_NAME=

   (Frontend)
   - VITE_API_URL=

5. Run the application:
   Backend:  
   npm run dev

   Frontend:  
   npm run dev

6. Visit the platform:
   http://localhost:3000

FOLDER STRUCTURE
----------------
/lms  
  ├── /backend  
  │     ├── controllers/  
  │     ├── models/  
  │     ├── routes/  
  │     ├── middlewares/  
  │     └── server.js  
  ├── /frontend  
  │     ├── components/  
  │     ├── pages/  
  │     └── main.jsx  
  └── README.txt  

USER ROLES & PERMISSIONS
------------------------
1. Admin
   - Add/edit/delete users
   - Add/edit/delete trainings and assessments
   - Assign training
   - View all progress

2. Trainer
   - Create/edit training videos
   - Add questions to each video
   - View assigned users

3. User
   - Watch training videos
   - Answer attached questions
   - View personal progress


 API Routes

POST   /admin/createadmin           - Create admin users  
POST   /admin/login                 - Admin login  
POST   /admin/verifyToken           - Verify admin token  
GET    /get/current/admin           - Get current admin  
POST   /update/admin/detaile        - Update admin details  
POST   /login                       - General login  
POST   /create-user                 - Create a user  
POST   /user-login                  - User login

POST   /admin/permission            - Set admin permissions  
POST   /permission/controller       - Update permissions  
GET    /get/permission/controller   - Get permissions  
POST   /subroles                    - Create subroles  
GET    /getSubrole                  - Get subroles

GET    /get/HomeProgressData        - Get home progress data  
GET    /get/progress                - Calculate user progress  
GET    /get/storemanagerData        - Store manager data  
GET    /get/storemanagerduedata     - Store manager due data


GET    /home/notification           - Get recent notifications  
GET    /home/AllNotification        - Get all notifications  
POST   /notification/create         - Create a notification  
POST   /escalation/level            - Set escalation levels  
GET    /escalation/level/get        - Get escalation levels  
GET    /overdue/Assessment          - Get overdue assessments  
GET    /overdue/Training            - Get overdue trainings  
GET    /overdue/Training/send/:empId - Send escalation message  
GET    /user/get/message/:email     - Get messages by email


POST   /trainings                   - Create training  
GET    /trainings/:id?              - Get training by ID  
POST   /mandatorytrainings         - Create mandatory training  
POST   /post/createAssessment       - Assign assessment  
GET    /get/Training/details/:id    - Training details  
GET    /getAll/training             - Get all trainings  
GET    /get/AllAssessment           - Get all assessments  
GET    /get/assessment/details/:id  - Assessment details  
POST   /assessments                 - Create assessments  
GET    /assessments/:id?            - Get assessments  
GET    /getAll/trainingprocess      - All training processes  
POST   /reassign/training           - Reassign training  
DELETE /delete/training/:id         - Delete training


GET    /user/detailed/info/:id      - Get detailed user info  
PUT    /user/update/:id             - Update user details  
GET    /getAllUser                  - Get all users  
GET    /user/get/assessment         - Get assigned assessments  
GET    /user/get/assessment/quesions - Get assessment questions  
POST   /user/update/assessment      - Update user assessment

POST   /modules                     - Create module  
GET    /modules/:id?                - Get modules  
GET    /get/update/branch/:id       - Get branch details  
PUT    /put/update/branch/:id       - Update branch details  
GET    /get/allusertraining         - Get all trainings w/ status  
GET    /get/mandatory/allusertraining - Get mandatory trainings  
GET    /get/Full/allusertraining    - Get full training completion

POST   /create/branch               - Create a branch  
GET    /getBranch                   - Get all branches  
POST   /create/designation          - Create designation  
GET    /getAll/designation          - Get all designations  
POST   /get/searching/userORbranch  - Search users/branches



Frontend:
npm run dev


Backend:
npm start


CONTACT
-------
Developer: Jishnu M  
Email: mjishnu990@gmail.com  
GitHub: https://github.com/jishnuMgit  
LinkedIn: https://www.linkedin.com/in/jishnu-m-11760b2b0/

LICENSE
-------
MIT License - Rootments

