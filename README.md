# LMS

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
1. Super Admin / HR Admin
   - Add/edit/delete users and all platform data
   - Add/edit/delete trainings and assessments
   - Can monitor all walk-ins, tasks, and employees across all stores
   - Can create and manage Clusters and Stores

2. Cluster Admin
   - Has access only to stores (branches) assigned to their cluster
   - Can view and manage walk-ins, tasks, and employees for their assigned stores
   - Cannot create new clusters or stores

3. Store Admin
   - Has access to a single assigned store
   - Can view and manage walk-ins, tasks, and employees only for their specific store
   - Cannot create new clusters or stores

4. Trainer
   - Create/edit training videos
   - Add questions to each video
   - View assigned users

5. User (Learner)
   - Watch training videos
   - Answer attached questions
   - View personal progress


## API Endpoints Documentation

The Brynex LMS features a comprehensively documented backend. Swagger UI is available at `http://localhost:8000/api-docs` when running the backend. Below is a detailed breakdown of all available endpoints and their specific use cases:

### 1. Authentication & Admin Management
- `POST /api/admin/admin/login`: Authenticates an admin user and returns a JWT.
- `POST /api/admin/admin/createadmin`: Creates a new admin account (Requires Super Admin).
- `POST /api/admin/admin/verifyToken`: Verifies if the current admin JWT is valid.
- `GET /api/admin/get/current/admin`: Fetches the logged-in admin's profile data.
- `POST /api/admin/update/admin/detaile`: Updates the logged-in admin's profile.
- `POST /api/admin/create-user`: Creates a standard learner account directly.
- `POST /api/users/user-login`: Authenticates a standard user/employee via mobile app.
- `POST /api/users/update-password`: Allows an employee to update their password.

### 2. Role-Based Access Control (RBAC) & Permissions
- `GET /api/admin/accessible-stores`: Returns a list of stores accessible to the logged-in admin based on their cluster/store scope.
- `GET /api/admin/accessible-employees`: Returns a list of employees managed by the logged-in admin based on store scope.
- `POST /api/admin/permission`: Set overarching admin permissions.
- `POST /api/admin/permission/controller`: Update specific route/feature permissions for roles.
- `GET /api/admin/get/permission/controller`: Fetch all currently active role permissions.
- `POST /api/admin/subroles`: Define specific sub-roles beneath standard roles.
- `GET /api/admin/getSubrole`: Fetch available sub-roles.
- `POST /api/admin/cluster/create`: Group multiple branches/stores into a cluster (Super Admin).
- `GET /api/admin/cluster`: Fetch all clusters.

### 3. Employee & Store Management
- `POST /api/employee/`: Register a new employee manually.
- `GET /api/employee/`: Fetch basic employee directory.
- `GET /api/employee/management/with-training-details`: Fetch employees alongside their LMS training metrics (RBAC filtered).
- `GET /api/employee/app-users`: Fetch employees who have logged into the mobile app.
- `POST /api/employee/auto-sync`: Syncs employee details from external HR systems into LMS.
- `GET /api/employee/:id`: Fetch specific employee profile.
- `GET /api/admin/get/AllBranchDetailes`: Fetch all physical store branches and details.
- `POST /api/admin/UpdateOneBranch`: Update specifics of a store branch.

### 4. Training, Modules & Assessments
- `POST /api/modules`: Create a new standalone training module (video + content).
- `GET /api/modules/:id?`: Fetch one or all modules.
- `POST /api/assessments`: Create a new assessment with MCQs or descriptive questions.
- `GET /api/assessments/:id?`: Fetch one or all assessments.
- `POST /api/trainings`: Create a training package containing modules and an assessment.
- `GET /api/trainings/:id?`: Fetch specific training or all generic trainings.
- `POST /api/mandatorytrainings`: Assign a training globally as mandatory for specific roles.
- `GET /api/get/allusertraining`: Fetch all optionally assigned trainings for users.
- `GET /api/get/mandatory/allusertraining`: Fetch all globally assigned mandatory trainings.
- `GET /api/training/details/:id`: Fetch training details alongside calculated deadline information.

### 5. Dashboards, Progress & Analytics
- `GET /api/get/progress`: Calculates and returns training progress for a user or admin scope.
- `GET /api/admin/get/HomeProgressData`: Returns training and assessment completion percentages across branches.
- `GET /api/admin/get/storemanagerData`: Provides aggregated analytics for store managers.
- `GET /api/admin/get/storemanagerduedata`: Aggregates upcoming deadlines for store managers.
- `GET /api/admin/get/bestThreeUser`: Retrieves the top three best-performing users.
- `GET /api/admin/get/searchdata`: Global search endpoint for dashboard.

### 6. Tasks
* **GET /api/task/assignees**: Returns the list of assignable targets (roles, groups, and individuals) dynamically scoped to the logged-in user's role.
  * **Headers:** `Authorization: Bearer <JWT_TOKEN>`
  * **Response Format:**
    ```json
    {
      "success": true,
      "data": [
        { "value": "all_employees", "label": "All Employees", "type": "group" },
        { "value": "651a2b3c4d5e6f7a8b9c0d1e", "label": "John Doe - Staff - Edapally Store", "type": "employee" },
        { "value": "651a2b3c4d5e6f7a8b9c0d2f", "label": "Jane Smith - Store Admin - Edapally Store", "type": "admin", "role": "store_admin" }
      ]
    }
    ```
* **POST /api/task/save**: Creates a new task. If assigned to a generic group (like `all_employees`), the backend auto-expands it and creates a separate task record per user. Supports creators from both the `Admin` and `User` (employee) collections.
  * **Headers:** `Authorization: Bearer <JWT_TOKEN>`
  * **Request Body:**
    ```json
    {
      "title": "Ceiling Cracked",
      "category": "MAINTENANCE",
      "subCategory": "CLEANING",
      "assignedTo": "651a2b3c4d5e6f7a8b9c0d1e",
      "assignedToLabel": "John Doe - Staff - Edapally Store",
      "mode": "task",
      "startDate": "2026-05-20",
      "startTime": "10:00am",
      "endDate": "2026-05-20",
      "endTime": "10:00am",
      "description": "Repair it ASAP",
      "additionalInfo": "",
      "priority": "Urgent",
      "fileAttachment": {
        "name": "photo.jpg",
        "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
      }
    }
    ```
* **GET /api/task/list**: Retrieves tasks matching the query parameters, wrapped in role-based scope restrictions.
  * **Headers:** `Authorization: Bearer <JWT_TOKEN>`
  * **Query Parameters:**
    * `search`: String (optional search on title, category, description, etc.)
    * `category`: String (e.g. `MAINTENANCE`)
    * `priority`: String (e.g. `Urgent`)
    * `status`: String (e.g. `PENDING`, `COMPLETED`)
    * `storeId`: String (Branch Location Code, e.g. `Z-Edapally1`)
    * `employeeId`: String (Employee/User ID)
  * **Role-Based Rules:**
    * **Employees (`User` collection):** Returns tasks assigned directly to their `User` ID or their branch's location code.
    * **Admins (`Admin` collection):** Returns tasks belonging to stores/branches within their allowed boundary (e.g., store admin sees their store, cluster admin sees their cluster's stores, super/hr admin sees all stores).
* **GET /api/task/:id**: Retrieves task details for a single task by its Mongo ID or human-readable `taskCode`.


### 7. Walk-ins & Leads
- `GET /api/walkin/check/:contact`: Checks if a customer exists by contact phone number (Mobile App lookup).
- `POST /api/walkin/save`: Saves a new walk-in record (Mobile App lead generation).
- `GET /api/walkin/list`: Retrieves walk-ins. Supports `storeId` and `employeeId` query parameters. RBAC scoped.

### 8. Notifications & Reminders
- `GET /api/admin/home/notification`: Get recent notifications.
- `GET /api/admin/home/AllNotification`: Get all notifications.
- `POST /api/admin/notification/create`: Manually broadcast a notification.
- `POST /api/admin/escalation/level`: Set escalation policy for overdue items.
- `GET /api/admin/escalation/level/get`: Retrieve escalation policy.
- `GET /api/admin/overdue/Assessment`: Identify users with overdue assessments (RBAC filtered).
- `GET /api/admin/overdue/Training`: Identify users with overdue training (RBAC filtered).

## RBAC Architecture Note
The system implements a centralized Role-Based Access Control (RBAC) architecture using `getAccessibleStoreIds` and `isFullAccessAdmin` helpers located in `backend/lib/permissions.js`.

- **Web Admin Panel API endpoints** (Dashboards, Tasks, Walkins, Employees, Overdue items, and Training stats) dynamically filter data according to the current user's role (`super_admin`, `hr_admin`, `cluster_admin`, `store_admin`).
- Scoped DB queries automatically filter MongoDB collections based on these helper functions, ensuring secure segregation of data and resolving previously manual iteration loops.
- **Frontend dropdowns** automatically read `storeId` and `employeeId` from endpoints that respect RBAC logic (`/api/admin/accessible-stores`).  
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


## Recent Updates (May 2026)
### Mobile App Login Auto-Provisioning (`flutterLogin`)
The mobile app login system now securely authenticates users and auto-provisions them from the external HR system if they have a fresh or empty database.
- **External Data Fallback:** If the user is missing or lacks a password, the system verifies their password directly against `rootments.in/api/verify_employee`. 
- **Auto-Saving Users:** By utilizing the `verifyRes.data.data` as the primary source of truth, it ensures new users are successfully saved into the LMS MongoDB even if secondary APIs fail.
- **Lowercase Enforcement:** Forces all `empID`s to save in lowercase (e.g. `emp188`) regardless of how the user types them, ensuring there are no duplicate accounts.
- **Strict Store Code Mapping:** Maps literal external `store_name` strings (like `Z-Edapally1`) to exact integer Location Codes (`locCode`) via a 24-store mapping dictionary. This ensures that new users show up accurately scoped to Cluster Admins and Store Admins.
- **Global Visibility:** Registers the auto-synced user with `source: 'app'` so they correctly appear for Super Admins and HR Admins in the `getAllAppRegisteredEmployees` endpoints.

### Walk-In Role-Based Access & App Flow
The Walk-in system integrates both mobile app lead capture and web dashboard management:
- **Mobile App:** Submits leads via `/api/walkin/save`. Uses an optional auth middleware to identify the employee. If the user token is present, the backend securely overrides `store` and `staff` from the logged-in profile. If the status is "New Walkin", it ensures a fresh record is created rather than overwriting.
- **Web Dashboard:** Managed via `WalkinList.jsx`. 
  - Dynamic store and employee dropdowns are governed by the `api/admin/accessible-stores` and `api/admin/accessible-employees` endpoints.
  - Passes explicit `storeId` and `employeeId` during save. The backend heavily validates these against the logged-in Admin's scope using `validateStoreAccess` and `validateEmployeeAccess`.
- **Database & RBAC:** `getWalkins` dynamically wraps all DB queries with `buildWalkinFilter` to strictly segregate data for Cluster Admins and Store Admins, preventing manual ID overrides.
