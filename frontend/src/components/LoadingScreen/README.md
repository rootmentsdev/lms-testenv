# Loading Screen Components

This directory contains all the loading screen components used throughout the LMS application to provide better user experience during data fetching and component loading.

## Components

### LoadingScreen.jsx
A full-screen loading overlay that appears when the dashboard is initially loading. Features:
- Animated spinner with dual rotating rings
- Loading message with bouncing dots
- Progress bar animation
- Backdrop blur effect
- Customizable message prop

### Spinner.jsx
A reusable spinner component for inline loading states. Features:
- Multiple sizes: small, medium, large, xlarge
- Multiple colors: primary, secondary, white, gray
- Accessible with screen reader support

## Skeleton Components

Located in `../Skeleton/` directory:

### HomeSkeleton.jsx
Enhanced skeleton for dashboard metric cards with:
- Shimmer animation effect
- Icon and text placeholders
- Gradient background animation

### HomeBarSkeleton.jsx
Skeleton for the HomeBar chart component with:
- Chart area simulation
- Legend placeholders
- Realistic loading appearance

### TopEmployeeSkeleton.jsx
Skeleton for the TopEmployeeAndBranch component with:
- Employee list simulation
- Avatar placeholders
- Progress indicators

### QuickSkeleton.jsx
Skeleton for the Quick actions component with:
- Action item placeholders
- Icon simulations
- Hover state styling

### NotificationSkeleton.jsx
Skeleton for the Notification component with:
- Notification item placeholders
- Status indicators
- Realistic layout simulation

## Usage

### Full Screen Loading
```jsx
import LoadingScreen from '../components/LoadingScreen/LoadingScreen';

{loading && <LoadingScreen message="Loading Dashboard..." />}
```

### Inline Spinner
```jsx
import Spinner from '../components/LoadingScreen/Spinner';

<Spinner size="medium" color="primary" />
```

### Skeleton Components
```jsx
import HomeSkeleton from '../components/Skeleton/HomeSkeleton';

{loading ? <HomeSkeleton /> : <ActualComponent />}
```

## Animation Classes

Custom CSS animations are defined in `src/index.css`:

- `.shimmer` - Shimmer effect for skeleton components
- `.fade-in` - Fade in animation for loaded content

## Loading States

The dashboard uses multiple loading states:

1. **initialLoading** - Full screen overlay during initial data fetch
2. **loading** - Main dashboard data loading state
3. **componentsLoading** - Individual component loading states

This creates a layered loading experience that feels responsive and professional.
