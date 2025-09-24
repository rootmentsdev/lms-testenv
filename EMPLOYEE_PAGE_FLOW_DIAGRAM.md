# Employee Page Data Loading - Detailed Flow Diagram

## 🔄 Complete Employee Page Flow

```mermaid
flowchart TD
    A[User Accesses Employee Page] --> B[Check Authentication]
    B -->|Valid Token| C[Initialize Component State]
    B -->|Invalid Token| Z[Redirect to Login]
    
    C --> D[Set Loading State]
    D --> E[Call fetchEmployees Function]
    
    E --> F[GET /api/employee/management/with-training-details]
    F --> G[Backend: Verify JWT Token]
    G -->|Invalid| H[Return 401 Unauthorized]
    G -->|Valid| I[Get Admin Permissions]
    
    I --> J[Check Admin Location Codes]
    J -->|Global Admin| K[Access All Employees]
    J -->|Location Admin| L[Filter by Location Codes]
    
    K --> M[Fetch External Employee Data]
    L --> M
    
    M --> N{External API Call}
    N -->|Success| O[Process External Data]
    N -->|Retry 1| P[Wait & Retry]
    N -->|Retry 2| Q[Wait & Retry]
    N -->|All Failed| R[Continue with Local Data Only]
    
    P --> N
    Q --> N
    
    O --> S[Query Local Database]
    R --> S
    
    S --> T[Get Local Users]
    T --> U[Get Training Progress Data]
    U --> V[Create Employee Data Map]
    
    V --> W[Process Each Employee]
    W --> X{Employee Exists Locally?}
    X -->|No| Y[Create New User]
    X -->|Yes| AA[Update Existing User]
    
    Y --> BB[Auto-Assign Mandatory Trainings]
    AA --> CC[Check Missing Trainings]
    BB --> DD[Calculate Statistics]
    CC --> DD
    
    DD --> EE[Combine All Data]
    EE --> FF[Apply Permission Filters]
    FF --> GG[Sort by Employee ID]
    GG --> HH[Return JSON Response]
    
    HH --> II[Frontend: Process Response]
    II --> JJ[Update Component State]
    JJ --> KK[Render Employee Table]
    
    KK --> LL[Display Employee Data]
    LL --> MM[Enable Filters & Search]
    MM --> NN[Enable Export & Actions]
    
    H --> OO[Show Error Message]
    
    style A fill:#e1f5fe
    style C fill:#e8f5e8
    style M fill:#fff3e0
    style Y fill:#fce4ec
    style BB fill:#f3e5f5
    style LL fill:#e0f2f1
```

## 📊 Data Processing Pipeline

```mermaid
graph LR
    subgraph "External API Data"
        A1[Employee List from Rootments API]
        A2[emp_code, name, role_name, store_name, etc.]
    end
    
    subgraph "Local Database Data"
        B1[User Collection]
        B2[TrainingProgress Collection]
        B3[Training Assignments]
    end
    
    subgraph "Data Processing Engine"
        C1[Merge External + Local]
        C2[Calculate Training Stats]
        C3[Calculate Assessment Stats]
        C4[Apply Permissions]
        C5[Create Missing Users]
        C6[Assign Mandatory Trainings]
    end
    
    subgraph "Final Output"
        D1[Complete Employee List]
        D2[Training Completion %]
        D3[Assessment Completion %]
        D4[Overdue Counts]
    end
    
    A1 --> C1
    B1 --> C1
    B2 --> C2
    B3 --> C3
    C1 --> C4
    C1 --> C5
    C5 --> C6
    C2 --> D2
    C3 --> D3
    C4 --> D1
    C6 --> D4
```

## 🏗️ Frontend Component Architecture

```mermaid
graph TD
    A[EmployeeData.jsx] --> B[State Management]
    A --> C[API Integration]
    A --> D[UI Components]
    
    B --> B1[data - Employee List]
    B --> B2[filteredData - Filtered Results]
    B --> B3[filterRole - Role Filter]
    B --> B4[filterBranch - Branch Filter]
    B --> B5[error - Error Messages]
    B --> B6[isRefreshing - Loading State]
    
    C --> C1[fetchEmployees Function]
    C --> C2[handleAutoSync Function]
    C --> C3[exportToCSV Function]
    
    D --> D1[Header Component]
    D --> D2[SideNav Component]
    D --> D3[Filter Dropdowns]
    D --> D4[Employee Table]
    D --> D5[Action Buttons]
    D --> D6[Pagination]
    
    C1 --> E[API Call with JWT]
    E --> F[Process Response]
    F --> G[Update State]
    G --> H[Re-render Components]
```

## 🔍 Employee Details Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Backend API
    participant DB as MongoDB
    participant ExtAPI as External API
    
    U->>FE: Click Employee Details
    FE->>API: GET /api/admin/user/detailed/info/{empID}
    
    API->>DB: Find user by empID
    DB-->>API: User found/not found
    
    alt User exists in DB
        API->>DB: Get training progress
        API->>DB: Get assigned assessments
        DB-->>API: Complete user data
        API-->>FE: Return user details
    else User not in DB
        API->>ExtAPI: Fetch from external API
        ExtAPI-->>API: External employee data
        API->>DB: Create new user
        API->>DB: Assign mandatory trainings
        API-->>FE: Return created user details
    end
    
    FE->>FE: Display user details
    FE->>FE: Show training/assessment tables
```

## 📱 Responsive Design Flow

```mermaid
graph TD
    A[Page Load] --> B{Screen Size Check}
    B -->|Desktop| C[Full Table Layout]
    B -->|Tablet| D[Condensed Table]
    B -->|Mobile| E[Card Layout]
    
    C --> F[Show All Columns]
    D --> G[Hide Less Important Columns]
    E --> H[Stack Information Vertically]
    
    F --> I[Enable Hover Effects]
    G --> I
    H --> J[Enable Touch Gestures]
    
    I --> K[Standard Interactions]
    J --> K
    
    K --> L[Responsive Filters]
    L --> M[Adaptive Export Options]
```

## ⚡ Auto-Sync Process Detail

```mermaid
flowchart TD
    A[Auto-Sync Triggered] --> B{Trigger Type}
    B -->|Manual| C[User Clicks Sync Button]
    B -->|Scheduled| D[Cron Job Executes]
    
    C --> E[Show Loading Spinner]
    D --> F[Background Process]
    E --> G[Call Auto-Sync API]
    F --> G
    
    G --> H[Fetch All External Employees]
    H --> I[Process Each Employee]
    
    I --> J{Employee Exists?}
    J -->|No| K[Create New User]
    J -->|Yes| L[Update Existing User]
    
    K --> M[Assign Mandatory Trainings]
    L --> N[Check Missing Trainings]
    M --> O[Increment Created Count]
    N --> P[Increment Updated Count]
    
    O --> Q[Continue to Next Employee]
    P --> Q
    Q --> R{More Employees?}
    R -->|Yes| I
    R -->|No| S[Return Sync Results]
    
    S --> T[Update Frontend State]
    T --> U[Refresh Employee List]
    U --> V[Show Success Message]
    
    style A fill:#e1f5fe
    style K fill:#e8f5e8
    style M fill:#fff3e0
    style V fill:#e0f2f1
```

## 🎯 Performance Optimization Points

```mermaid
graph LR
    A[Performance Optimizations] --> B[Data Loading]
    A --> C[UI Rendering]
    A --> D[Network Requests]
    
    B --> B1[Lazy Loading]
    B --> B2[Data Caching]
    B --> B3[Pagination]
    
    C --> C1[Virtual Scrolling]
    C --> C2[Memoization]
    C --> C3[Component Splitting]
    
    D --> D1[Request Batching]
    D --> D2[Retry Logic]
    D --> D3[Timeout Handling]
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
```

## 🔧 Error Handling Flow

```mermaid
flowchart TD
    A[API Call] --> B{Response Status}
    B -->|200| C[Success - Process Data]
    B -->|401| D[Unauthorized - Redirect Login]
    B -->|404| E[Not Found - Show Message]
    B -->|500| F[Server Error - Retry Logic]
    B -->|Network Error| G[Connection Issue]
    
    C --> H[Update UI with Data]
    D --> I[Clear Token & Redirect]
    E --> J[Show "No Data" Message]
    F --> K{Retry Count < 3}
    G --> L[Show Offline Message]
    
    K -->|Yes| M[Wait & Retry]
    K -->|No| N[Show Error Message]
    M --> A
    
    H --> O[Enable User Interactions]
    I --> P[Login Page]
    J --> O
    N --> O
    L --> O
    
    style A fill:#e1f5fe
    style D fill:#ffebee
    style F fill:#fff3e0
    style O fill:#e8f5e8
```

## 📊 Data Flow Summary

### **Key Data Sources:**
1. **External API**: Employee master data from Rootments API
2. **Local Database**: Training progress, assignments, user modifications
3. **Real-time Calculations**: Completion percentages, overdue counts

### **Processing Steps:**
1. **Authentication**: Verify user permissions and location access
2. **Data Fetching**: Parallel fetch from external API and local database
3. **Data Merging**: Combine external and local data sources
4. **User Creation**: Auto-create missing users from external data
5. **Training Assignment**: Auto-assign mandatory trainings to new users
6. **Statistics Calculation**: Calculate completion percentages and overdue counts
7. **Permission Filtering**: Apply location-based access controls
8. **Response Formatting**: Format data for frontend consumption

### **Frontend Processing:**
1. **State Management**: Update component state with fetched data
2. **UI Rendering**: Render employee table with all data
3. **Filter/Search**: Enable real-time filtering and searching
4. **Export**: Generate CSV exports with current filter state
5. **Actions**: Enable employee detail navigation and bulk operations

This comprehensive flow ensures efficient data loading, real-time updates, and optimal user experience across all devices and user roles.
