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
- `GET /api/admin/admin/list`: Retrieves a combined list of all administrators and ordinary users mapped to the admin structure.
- `PUT /api/admin/admin/update/:id`: Updates an admin or employee user profile by ID, supporting role transitions (e.g. promoting or demoting).
- `DELETE /api/admin/admin/delete/:id`: Deletes a user or admin account from the database.
- `POST /api/auth/flutter-login`: Authentication endpoint for Flutter mobile clients with external credential verification fallback and local auto-provisioning.
- `POST /api/usercreate/createUser`: Backward-compatible alias to register a new user in the system.
- `POST /api/usercreate/userLogin`: Backward-compatible alias to authenticate a user.

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
- `GET /api/usercreate/getBranch/public`: Public endpoint to fetch all active branches in the system.
- `POST /api/employee_range`: Intercepts and proxies requests to external HR employee directory.
- `POST /api/employee_range/filtered`: Fetches employees from the external range API, filtered by the logged-in admin's store bounds.
- `POST /api/employee_detail`: Fetches single employee details by proxying range API.
- `POST /api/verify_employee`: Proxies credential verification to the external verification API.

### 4. Training, Modules & Assessments
- `POST /api/modules`: Create a new standalone training module (video + content).
- `PUT /api/modules/:id`: Updates an existing standalone training module.
- `GET /api/modules/:id?`: Fetch one or all modules.
- `POST /api/assessments`: Create a new assessment with MCQs or descriptive questions.
- `GET /api/assessments/:id?`: Fetch one or all assessments.
- `POST /api/trainings`: Create a training package containing modules and an assessment.
- `PUT /api/trainings/:id`: Updates an existing training program.
- `GET /api/trainings/:id?`: Fetch specific training or all generic trainings.
- `POST /api/mandatorytrainings`: Assign a training globally as mandatory for specific roles.
- `GET /api/get/allusertraining`: Fetch all optionally assigned trainings for users.
- `GET /api/get/mandatory/allusertraining`: Fetch all globally assigned mandatory trainings.
- `GET /api/get/full/allusertraining`: Get all user trainings (full list alias, lowercase).
- `GET /api/training/details/:id`: Fetch training details alongside calculated deadline information.
- `GET /api/user/get/Training/details/simple/:id`: Retrieves basic training details (modules, videos, video progress).
- `GET /api/user/user/training-progress/:userId`: Retrieves all mandatory training progress records for a user.
- `POST /api/user/assign-missing-mandatory-trainings`: Assigns missing mandatory trainings to users by designation.
- `POST /api/user/assign-missing-mandatory-trainings-all`: Assigns missing mandatory trainings to all users.
- `GET /api/user/assessment/user/get/message/:email`: Retrieves notifications sent to a user by email.
- `POST /api/video_progress`: Tracks video watch progress and auto-completes if watch percentage is 90% or higher.

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
* **POST /api/task/save**: Creates a new task. If assigned to a generic group (like `all_employees`), the backend auto-expands it and creates a separate task record per user. Fully supports creators from both the `Admin` (managers) and `User` (employees) collections (e.g., allowing standard employees to create precautionary tasks).
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
* **GET /api/task/:id**: Retrieves task details for a single task by its Mongo ID or human-readable `taskCode`. Includes the `workMap` history array.
* **PUT /api/task/:id/status**: Updates the status of an existing task.
  * **Headers:** `Authorization: Bearer <JWT_TOKEN>`
  * **Supported Statuses:** `PENDING`, `IN PROGRESS`, `COMPLETED`, `OVERDUE`, `ON HOLD`, `UNDER REVIEW`, `REASSIGNED`, `EXTENSION REQUESTED` (accepts case-insensitive values; `reassign` is normalized to `REASSIGNED`).
  * **Request Body:**
    *For review submission:*
    ```json
    {
      "status": "UNDER REVIEW",
      "fileAttachment": {
        "name": "photo.jpg",
        "base64": "data:image/jpeg;base64,..."
      }
    }
    ```
    *For extension request:*
    ```json
    {
      "status": "EXTENSION REQUESTED",
      "requestedExtensionDate": "2026-06-15"
    }
    ```
    *Or for reassignment via status update:*
    ```json
    {
      "status": "REASSIGNED",
      "assignedTo": "651a2b3c4d5e6f7a8b9c0d1e",
      "assignedToLabel": "John Doe - Staff - Edapally Store"
    }
    ```
  * **Permissions:**
    - Only the original task creator (assigner) can mark a task as `COMPLETED`.
    - Only the current assignee or an administrator (Super Admin, HR Admin, Cluster Admin, Store Admin) can update the status to `REASSIGNED` / `reassign`.
    - Other status updates are restricted to the assignee, admin, or store-level users.
  * **Response:**
    ```json
    {
      "success": true,
      "message": "Task status updated successfully",
      "data": {
        "id": "TSK-001",
        "title": "Ceiling Cracked",
        "status": "COMPLETED",
        "workMap": [
          {
            "assignedTo": "651a2b3c4d5e6f7a8b9c0d1e",
            "assignedToLabel": "John Doe - Staff - Edapally Store",
            "assignedBy": "Admin Jack",
            "assignedAt": "2026-05-31T12:00:00.000Z",
            "action": "ASSIGNED"
          },
          {
            "assignedTo": "651a2b3c4d5e6f7a8b9c0d1e",
            "assignedToLabel": "John Doe - Staff - Edapally Store",
            "assignedBy": "Admin Jack",
            "assignedAt": "2026-05-31T13:00:00.000Z",
            "action": "COMPLETED"
          }
        ]
      }
    }
    ```
* **PUT /api/task/:id/reassign**: Reassigns an existing task to another employee or administrator, updating the assigned target, and logging a new entry to the workflow history `workMap` timeline.
  * **Headers:** `Authorization: Bearer <JWT_TOKEN>`
  * **Request Body:**
    ```json
    {
      "assignedTo": "651a2b3c4d5e6f7a8b9c0d1e",
      "assignedToLabel": "John Doe - Staff - Edapally Store"
    }
    ```
  * **Permissions:**
    - Restricted exclusively to the current assignee and all administrators.
  * **Response:**
    ```json
    {
      "success": true,
      "message": "Task reassigned successfully",
      "data": {
        "id": "TSK-001",
        "title": "Ceiling Cracked",
        "status": "REASSIGNED",
        "workMap": [
          {
            "assignedTo": "651a2b3c4d5e6f7a8b9c0d2f",
            "assignedToLabel": "Jane Smith - Store Admin - Edapally Store",
            "assignedBy": "Admin Jack",
            "assignedAt": "2026-05-31T12:00:00.000Z",
            "action": "ASSIGNED"
          },
          {
            "assignedTo": "651a2b3c4d5e6f7a8b9c0d1e",
            "assignedToLabel": "John Doe - Staff - Edapally Store",
            "assignedBy": "Jane Smith",
            "assignedAt": "2026-05-31T13:00:00.000Z",
            "action": "REASSIGNED"
          }
        ]
      }
    }
    ```
* **PUT /api/task/:id/resolve-extension**: Resolves a pending task extension request (Approve or Reject).
  * **Headers:** `Authorization: Bearer <JWT_TOKEN>`
  * **Request Body:**
    ```json
    {
      "action": "APPROVE"
    }
    ```
    *or*
    ```json
    {
      "action": "REJECT"
    }
    ```
  * **Permissions:**
    - Restricted to the original task creator (assigner).
  * **Actions:**
    - **APPROVE:** Updates the task's `endDate` to the requested extension date and reverts the task status back to its previous status (e.g. `IN PROGRESS`).
    - **REJECT:** Reverts the status back to the previous status without modifying the end date.




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

### Database-Backed Notifications & Flutter Inbox API (June 2026)
We implemented a robust database-backed notification/inbox system supporting task and training lifecycles.
- **Flutter API Endpoint:** `/api/user/assessment/user/get/message/:email`
  - Retrieves all notifications targeted at a user or admin based on their email address.
  - Supports both standard `User` employee accounts and `Admin` manager/administrator accounts.
  - Performs dynamic, query-safe `$or` matches on:
    - User ObjectId targeting (`user` field)
    - Designation or role targeting (`Role` field)
    - Branch location code targeting (`branch` field)
  - Returns notifications sorted by `createdAt` in descending order (latest-first).
- **Task Notifications:**
  - **Assignment:** Triggers a notification to the assignee when a new task is created/assigned.
  - **Review Submission:** Triggers a notification to the task creator (admin) when an assignee submits a task for review.
  - **Reassignment:** Triggers a notification to the new assignee when a task is reassigned by status update or reassign endpoint.
- **Training Notifications:**
  - **Assignment:** Triggers a notification to the employee when they are assigned a training package.
  - **Completion:** Triggers a notification to the employee when they successfully pass all modules in a training program.

### Task Extension Requests Workflow (June 2026)
We implemented a complete task extension requests system:
- **Status Change:** Added `EXTENSION REQUESTED` status to the status enum list.
- **Request form:** Added an "Extension" status button for assignees in the details modal which triggers a date selector input (YYYY-MM-DD format). Submitting this stores the date in `requestedExtensionDate` and logs `EXTENSION REQUESTED` with the requested date in the task workMap.
- **Creator inbox/tab:** Added an "Extension Requests" tab inside `TaskManagement.jsx` displaying tasks created by the logged-in user with status `EXTENSION REQUESTED`.
- **Approval/Rejection endpoint:** Created `/api/task/:id/resolve-extension` allowing the task creator to resolve requests. Approving updates `endDate` to the requested date and reverts status back to its previous status. Rejecting reverts status back to the previous status. Both actions are fully logged in the `workMap` workflow timeline.


## Auto Task Templates (June 2026)

Auto Task Templates allow admins to define recurring task schedules. When the schedule fires, **real Task documents** are created in the existing `Task` collection — identical to manually-created tasks in every way (same APIs, same web/Flutter task lists, same completion flow, same overdue logic, same notifications).

### How It Works
1. An admin fills the **Auto Task Schedule** form at `/task/auto-schedule` and submits it.
2. A persistent `AutoTaskTemplate` document is saved in the `autotasktemplates` MongoDB collection.
3. An **hourly cron job** (`autoTaskCron.js`) checks all active templates every hour.
4. For templates due on the current day (based on `repeatType` + `startDate`), it calls `autoTaskGenerationService.generateAutoTasks()`.
5. The service resolves all assignees, creates `Task` records, and sends notifications — exactly like manual task creation.
6. Duplicate prevention: tasks are never re-created for the same `autoTaskTemplateId + generatedForDate + assignedTo` combination.

### Recurrence Rules
| repeatType | Generates tasks on |
|---|---|
| `daily` | Every day from `startDate` onwards |
| `weekly` | Same weekday as `startDate` every week |
| `monthly` | Same day-of-month as `startDate` every month |
| `custom` | Treated as daily |

If `endDate` is set, no tasks are generated after that date. Inactive templates (`isActive: false`) are skipped.

### Assignment Modes
| assignMode | Behaviour |
|---|---|
| `all_employees` | All active employees accessible to the template creator |
| `store` | Employees at the selected store(s) |
| `role` | Admins/employees matching the selected roles |
| `individual` | Specific selected users |

### Auto Task API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auto-task/save` | Create a new Auto Task Template |
| `GET` | `/api/auto-task/list` | List templates (RBAC: super/hr admin see all; others see own) |
| `GET` | `/api/auto-task/:id` | Get template by ID |
| `PUT` | `/api/auto-task/:id` | Update a template |
| `PATCH` | `/api/auto-task/:id/toggle` | Activate / deactivate a template |
| `DELETE` | `/api/auto-task/:id` | Delete a template |
| `POST` | `/api/auto-task/:id/generate-now` | Manually trigger generation (for testing) |

All endpoints require a Bearer JWT token. Full Swagger documentation is available at `/api-docs` under the **Auto Tasks** tag.

### New Files
- `backend/model/AutoTaskTemplate.js` — Template schema
- `backend/services/autoTaskGenerationService.js` — Task generation logic
- `backend/cron/autoTaskCron.js` — Hourly cron job
- `backend/controllers/AutoTaskController.js` — CRUD controller
- `backend/routes/AutoTaskRoute.js` — Express routes + Swagger docs

### Modified Files
- `backend/model/Task.js` — Added `isAutoGenerated`, `autoTaskTemplateId`, `generatedForDate` (non-breaking, all optional)
- `backend/server.js` — Mounted `/api/auto-task` route and started `startAutoTaskCron()`
- `backend/swagger.js` — Added **Auto Tasks** Swagger tag
- `frontend/src/features/task/taskFetch.js` — Added `createAutoTask`, `fetchAutoTasks`, `toggleAutoTask`, `deleteAutoTask`, `generateAutoTaskNow` helpers
- `frontend/src/pages/Task/AutoTask.jsx` — Form now calls `POST /api/auto-task/save` to persist a template instead of creating individual tasks directly
