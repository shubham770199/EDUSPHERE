# 🎓 EduSphere - Cloud-Based Education Management System

A modern, secure, and scalable education management platform built with React, TypeScript, and JWT authentication. EduSphere provides role-based access control for students, teachers, and administrators with a beautiful, responsive UI.

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based Authentication** - Secure token-based authentication system
- **Role-based Access Control** - Separate dashboards for students, teachers, and admins
- **Protected Routes** - Route protection based on authentication status and user roles
- **Secure Password Handling** - Bcrypt password hashing
- **Demo Credentials** - Pre-loaded demo users for testing

### 🎨 Modern UI/UX
- **Responsive Design** - Works seamlessly across desktop, tablet, and mobile
- **shadcn/ui Components** - Beautiful, accessible UI components
- **Dark/Light Mode Support** - Theme toggling capability
- **Gradient Backgrounds** - Modern gradient designs throughout the app
- **Interactive Notifications** - Real-time notification system with badges
- **User Profile Management** - Dropdown profile with user information

### 📊 Dashboard Features
- **Student Dashboard** - View grades, assignments, schedule, and achievements
- **Teacher Dashboard** - Manage classes, assignments, and student performance
- **Admin Dashboard** - System oversight, user management, and analytics
- **Real-time Stats** - Live performance metrics and statistics
- **Quick Actions** - Easy access to commonly used features

### 🛡️ Security Features
- **JWT Token Validation** - Automatic token verification and refresh
- **Role Verification** - Server-side role checking for all protected routes
- **Secure Logout** - Complete session cleanup on logout
- **Demo Mode** - Safe testing environment with sample data

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RamShrivastava3681/edu-sphere.git
   cd edu-sphere
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   Navigate to http://localhost:8080
   ```

## 🔑 Getting Started

To use the application, you'll need to register an account for each role you want to test:

1. Visit the application at `http://localhost:8080`
2. Click "Get Started" to register a new account
3. Select your role (Student, Teacher, or Admin)
4. Fill in your details and create an account
5. Login with your newly created credentials

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── ProtectedRoute.tsx
│   ├── UserProfile.tsx
│   └── NotificationCenter.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Main application pages
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── StudentDashboard.tsx
│   ├── TeacherDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── Unauthorized.tsx
├── services/           # API and authentication services
│   └── auth.ts
└── types/              # TypeScript type definitions
    └── auth.ts
```

## 🔧 Technologies Used

- **Frontend Framework**: React 18 with TypeScript
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Routing**: React Router Dom v6
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Context API
- **Notifications**: Sonner
- **Icons**: Lucide React
- **Build Tool**: Vite

## 🎯 User Roles & Permissions

### 👨‍🎓 Student Role
- **Dashboard Access**: Personal academic dashboard
- **Features**:
  - View attendance records
  - Check grades and assignments
  - Access class schedules
  - Track achievements and badges
  - Submit assignments
  - View notifications

### 👩‍🏫 Teacher Role
- **Dashboard Access**: Class management dashboard
- **Features**:
  - Manage multiple classes
  - Create and grade assignments
  - Track student attendance
  - View class performance analytics
  - Upload study materials
  - Send notifications to students

### 👨‍💼 Admin Role
- **Dashboard Access**: System administration panel
- **Features**:
  - User management (add/remove users)
  - System analytics and reporting
  - Course management
  - System settings configuration
  - Monitor platform usage
  - Manage notifications

## 🛡️ Security Implementation

### JWT Authentication Flow
1. **Login**: User submits credentials → Server validates → JWT token issued
2. **Storage**: Token stored securely in localStorage
3. **Authorization**: Token included in API requests
4. **Validation**: Server validates token for each protected route
5. **Logout**: Token removed from storage and blacklisted

### Route Protection
- **Public Routes**: Landing, Login, Register
- **Protected Routes**: All dashboards require authentication
- **Role-based Routes**: Dashboards restricted by user role
- **Unauthorized Access**: Redirect to appropriate error page

## 🎨 UI/UX Features

### Design System
- **Color Palette**: Modern, accessible color scheme
- **Typography**: Clean, readable font hierarchy
- **Spacing**: Consistent spacing system
- **Shadows**: Subtle depth with card shadows
- **Animations**: Smooth transitions and hover effects

### Responsive Design
- **Mobile First**: Designed for mobile, enhanced for desktop
- **Breakpoints**: Optimized for all screen sizes
- **Touch Friendly**: Large touch targets for mobile users
- **Accessible**: WCAG 2.1 compliant components

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Radix UI** for accessible primitives
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the icon set

---

**Built with ❤️ for the education community**