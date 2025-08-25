# Training Web Application for iOS Users

## Overview
This responsive web application allows iOS users to access training videos, modules, and assignments that are currently only available through an Android app. The web app integrates with the existing LMS backend infrastructure and provides a mobile-first design optimized for iOS devices.

## Features

### 🎯 Core Functionality
- **Training Dashboard**: View assigned and mandatory trainings with progress tracking
- **Video Player**: Responsive video player with progress tracking and controls
- **Module Management**: Navigate through training modules and track completion
- **Assessment System**: Complete module assessments with scoring
- **Progress Tracking**: Real-time progress updates synchronized with the backend
- **Responsive Design**: Mobile-first design optimized for iOS devices

### 🔐 Authentication System
- **User Login**: Secure authentication with JWT tokens
- **Role-Based Access**: 
  - Admin: Full access to assign training, manage videos, and oversee modules
  - User: Access to view assigned training content only
- **Session Management**: Secure session handling with automatic logout

### 📱 Mobile-First Design
- **iOS Optimization**: Designed specifically for iOS Safari and WebKit
- **Touch-Friendly Interface**: Large touch targets and intuitive gestures
- **Responsive Layout**: Adapts to different screen sizes and orientations
- **Progressive Web App**: Can be added to home screen for app-like experience

## Architecture

### Frontend (React + Vite)
```
frontend/src/
├── components/
│   └── TrainingDashboard/
│       ├── TrainingDashboard.jsx    # Main dashboard component
│       ├── TrainingCard.jsx         # Individual training card
│       ├── TrainingProgress.jsx     # Progress tracking component
│       └── index.js                 # Component exports
├── pages/
│   └── Training/
│       └── TrainingDetail.jsx       # Detailed training view
├── api/
│   └── trainingApi.js               # API functions for training
└── App.jsx                          # Main app with routing
```

### Backend (Node.js + Express)
```
backend/
├── routes/
│   └── TrainingRoutes.js            # Training API endpoints
├── controllers/
│   └── TrainingController.js        # Training business logic
└── server.js                        # Main server with training routes
```

## API Endpoints

### Training Management
- `GET /api/user/trainings/assigned` - Get assigned trainings
- `GET /api/user/trainings/mandatory` - Get mandatory trainings
- `GET /api/user/training/:id` - Get training details
- `PUT /api/user/training/:id/start` - Start a training
- `PUT /api/user/training/:id/progress` - Update progress
- `PUT /api/user/training/:id/module/:moduleId/complete` - Complete module
- `PUT /api/user/training/:id/complete` - Complete training

### Assessment & Progress
- `POST /api/user/training/:id/module/:moduleId/assessment` - Submit assessment
- `GET /api/user/trainings/stats` - Get training statistics
- `GET /api/user/trainings/overdue` - Get overdue trainings
- `GET /api/user/trainings/upcoming` - Get upcoming trainings

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB
- Existing LMS backend infrastructure

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Environment Variables
```env
# Backend
PORT=7000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Frontend
VITE_API_BASE_URL=http://localhost:7000
```

## Usage

### For iOS Users
1. **Access Training Dashboard**: Navigate to `/trainings` in your browser
2. **View Trainings**: See assigned and mandatory trainings with deadlines
3. **Start Training**: Click "Start Training" to begin a module
4. **Watch Videos**: Use the responsive video player to view training content
5. **Track Progress**: Monitor completion status and progress bars
6. **Complete Assessments**: Take module assessments to verify understanding
7. **View Certificates**: Access training certificates upon completion

### For Administrators
1. **Assign Trainings**: Use existing admin interface to assign trainings
2. **Monitor Progress**: Track user progress through the admin dashboard
3. **Manage Content**: Upload videos and create modules as needed
4. **Generate Reports**: Access training completion statistics

## Key Components

### TrainingDashboard
- Main interface showing assigned and mandatory trainings
- Tabbed navigation between different training types
- Progress indicators and deadline warnings
- Mobile-optimized bottom navigation

### TrainingCard
- Individual training information display
- Progress bars and status indicators
- Action buttons for starting/continuing training
- Overdue warnings and deadline information

### VideoPlayer
- Custom video player with progress tracking
- Touch-friendly controls for mobile devices
- Fullscreen support and volume controls
- Automatic progress updates to backend

### AssessmentModal
- Interactive assessment interface
- Question navigation and progress tracking
- Score calculation and pass/fail determination
- Integration with training completion

## Data Flow

1. **User Authentication**: JWT token validation for secure access
2. **Training Fetch**: Retrieve user's assigned trainings from backend
3. **Progress Tracking**: Real-time updates as user progresses through modules
4. **Video Completion**: Automatic progress updates when videos finish
5. **Assessment Submission**: Score calculation and module completion
6. **Training Completion**: Automatic status updates and certificate generation

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permissions for users and admins
- **Input Validation**: Server-side validation of all user inputs
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **Session Management**: Secure session handling with automatic cleanup

## Performance Optimizations

- **Lazy Loading**: Components loaded only when needed
- **Progressive Loading**: Training data loaded incrementally
- **Caching**: API responses cached for better performance
- **Optimized Images**: Responsive images for different screen sizes
- **Minimal Dependencies**: Lightweight component library usage

## Browser Support

- **iOS Safari**: 14+ (Primary target)
- **Chrome Mobile**: 90+
- **Firefox Mobile**: 88+
- **Edge Mobile**: 90+

## Future Enhancements

- **Offline Support**: Service worker for offline training access
- **Push Notifications**: Deadline reminders and training updates
- **Analytics Dashboard**: Detailed training analytics for users
- **Social Features**: Training completion sharing and leaderboards
- **Multi-language Support**: Internationalization for global users

## Troubleshooting

### Common Issues
1. **Video Not Playing**: Check video format compatibility (MP4 recommended)
2. **Progress Not Saving**: Verify backend connectivity and authentication
3. **Assessment Issues**: Ensure all questions are answered before submission
4. **Mobile Display**: Clear browser cache and refresh page

### Debug Mode
Enable debug logging by setting `DEBUG=true` in environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support or questions about the training web application, please contact the development team or create an issue in the project repository.
