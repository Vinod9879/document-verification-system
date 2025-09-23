# 📄 Document Verification System

A comprehensive document verification system with React frontend and .NET Core backend, featuring automated document processing, risk assessment, and admin management.

## 🏗️ Project Structure

```
document-verification-system/
├── react-contacts-app/          # React Frontend
│   ├── src/
│   │   ├── Components/         # React Components
│   │   │   ├── Auth/          # Authentication Components
│   │   │   ├── Dashboard/     # Dashboard Components
│   │   │   ├── Common/       # Reusable Components
│   │   │   └── Layout/       # Layout Components
│   │   ├── Services/         # API Services
│   │   ├── Routes/           # App Routes
│   │   └── config/          # Configuration
│   └── package.json
├── webApitest/                 # .NET Core Backend
│   ├── Controllers/          # API Controllers
│   ├── Models/               # Data Models
│   ├── Services/             # Business Logic
│   ├── Data/                 # Database Context
│   └── DTOs/                 # Data Transfer Objects
├── DocumentVerificationDLL/    # DLL for Document Processing
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- .NET 8 SDK
- Node.js 16+ and npm
- SQL Server
- Visual Studio Code (recommended)

### 📥 Download from GitHub
```bash
# Clone the repository
git clone https://github.com/Vinod9879/document-verification-system.git
cd document-verification-system
```

### 🔧 Backend Setup
```bash
# Navigate to backend folder
cd webApitest

# Install dependencies
dotnet restore

# Run the backend
dotnet run --urls "https://localhost:5194"
```

### ⚛️ Frontend Setup
```bash
# Open new terminal/command prompt
cd react-contacts-app

# Install dependencies
npm install

# Run the frontend
npm start
```

### 🌐 Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: https://localhost:5194
- **Admin Login**: admin@contactmanager.com / admin123

### 📋 Complete Setup Commands
```bash
# 1. Clone repository
git clone https://github.com/Vinod9879/document-verification-system.git
cd document-verification-system

# 2. Backend (Terminal 1)
cd webApitest
dotnet restore
dotnet run --urls "https://localhost:5194"

# 3. Frontend (Terminal 2)
cd react-contacts-app
npm install
npm start
```

## 🔧 Technologies Used

### Frontend
- **React.js** - UI Framework
- **Bootstrap** - CSS Framework
- **Axios** - HTTP Client
- **React Router** - Navigation

### Backend
- **.NET Core 8** - Web API Framework
- **Entity Framework Core** - ORM
- **SQL Server** - Database
- **JWT** - Authentication
- **Swagger** - API Documentation

### Document Processing
- **Custom DLL** - Document Verification
- **PDF Processing** - Document Extraction
- **Risk Assessment** - Automated Scoring

## 📋 Features

### 🔐 Authentication
- User Registration & Login
- Admin Authentication
- JWT Token-based Security
- Role-based Access Control

### 📄 Document Management
- Upload EC, Aadhaar, and PAN documents
- Automated data extraction
- Document verification and comparison
- Risk score calculation

### 👨‍💼 Admin Dashboard
- User Management (View, Edit, Delete)
- Document Monitoring
- Analytics and Reports
- Activity Logging
- Verification Status Tracking

### 👤 User Dashboard
- Document Upload Interface
- Verification Results Display
- Status Tracking
- Download Documents

## 🗄️ Database Schema

### Tables
- **Users** - User accounts and profiles
- **UserUploadedDocuments** - Document uploads and verification data
- **OriginalDocuments** - Original document storage
- **UserActivityLogs** - Activity tracking and audit logs

## 🔑 Admin Access

- **Email**: admin@contactmanager.com
- **Password**: admin123

## 📊 API Endpoints

### Authentication
- `POST /api/Auth/login` - User login
- `POST /api/Auth/register` - User registration
- `POST /api/Auth/admin-login` - Admin login

### User Dashboard
- `GET /api/UserDashboard/document-status` - Get document status
- `POST /api/UserDashboard/upload` - Upload documents
- `GET /api/UserDashboard/verification-results` - Get verification results

### Admin Dashboard
- `GET /api/AdminDashboard/users` - Get all users
- `PUT /api/AdminDashboard/users/{id}` - Update user
- `DELETE /api/AdminDashboard/users/{id}` - Delete user
- `GET /api/AdminDashboard/documents` - Get all documents
- `GET /api/AdminDashboard/analytics` - Get analytics

## 🛠️ Installation Guide

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/document-verification-system.git
cd document-verification-system
```

### 2. Backend Setup
```bash
cd webApitest
dotnet restore
dotnet ef database update
dotnet run --urls "https://localhost:5194"
```

### 3. Frontend Setup
```bash
cd react-contacts-app
npm install
npm start
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: https://localhost:5194
- **Swagger UI**: https://localhost:5194/swagger

## 🔄 Development Workflow

### Adding New Features
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test
3. Commit changes: `git commit -m "Add new feature"`
4. Push branch: `git push origin feature/new-feature`
5. Create Pull Request on GitHub

### Database Migrations
```bash
# Add migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update
```

## 📈 Performance & Security

### Security Features
- JWT Authentication
- Role-based Authorization
- Input Validation
- SQL Injection Protection
- CORS Configuration

### Performance Optimizations
- Entity Framework Query Optimization
- Pagination for Large Datasets
- Async/Await Pattern
- Efficient Database Indexing

## 🐛 Troubleshooting

### Common Issues

#### Backend Won't Start
- Check if port 5194 is available
- Verify .NET 8 SDK is installed
- Check database connection string

#### Frontend Won't Start
- Check if port 3000 is available
- Verify Node.js version (16+)
- Run `npm install` to install dependencies

#### Database Issues
- Check SQL Server is running
- Verify connection string in appsettings.json
- Run migrations: `dotnet ef database update`

## 📞 Support

For technical support or questions:
- Create an issue on GitHub
- Contact the development team
- Check the troubleshooting section

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 Changelog

### Version 1.0.0
- Initial release
- Complete document verification system
- React frontend with .NET backend
- Admin and user dashboards
- Document upload and verification
- Risk assessment and scoring

---

**Made with ❤️ by the Development Team**