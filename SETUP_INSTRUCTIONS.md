# 🚀 Setup Instructions for Different Laptops/Environments

## 📋 Prerequisites

Before running the application, ensure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **.NET 8.0 SDK** - [Download here](https://dotnet.microsoft.com/download/dotnet/8.0)
- **SQL Server LocalDB** or **SQL Server** - [Download here](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- **Git** - [Download here](https://git-scm.com/)

## 🔧 Step 1: Clone from GitHub

```bash
# Clone the repository
git clone https://github.com/yourusername/contact-management-app.git

# Navigate to the project directory
cd contact-management-app
```

## 🖥️ Step 2: Backend Setup (ASP.NET Core Web API)

### Option A: Using Visual Studio
1. Open `webApitest/webApitest.csproj` in Visual Studio
2. Right-click on the project → "Restore NuGet Packages"
3. Press F5 to run

### Option B: Using Command Line
```bash
# Navigate to backend directory
cd webApitest

# Restore packages
dotnet restore

# Update connection string if needed (see Database Setup below)
# Run the application
dotnet run
```

**Backend will be available at:**
- `https://localhost:7000` (HTTPS)
- `http://localhost:5000` (HTTP)
- Swagger UI: `https://localhost:7000/swagger`

## 🎨 Step 3: Frontend Setup (React)

```bash
# Navigate to frontend directory
cd react-contacts-app

# Install dependencies
npm install

# Start the development server
npm start
```

**Frontend will be available at:**
- `http://localhost:3000`

## 🗄️ Step 4: Database Setup

### Option A: SQL Server LocalDB (Default - Recommended)
The application uses SQL Server LocalDB by default. No additional setup required.

### Option B: SQL Server
If you want to use SQL Server instead:

1. **Update Connection String** in `webApitest/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=ContactManagementDB;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

2. **Create Database** (Optional - EF will create it automatically):
```sql
CREATE DATABASE ContactManagementDB;
```

## 🌐 Step 5: Configure API URLs for Different Environments

### For Development (Same Machine)
No changes needed - the app is configured to work on the same machine.

### For Different Machines/Networks

1. **Update API Configuration** in `react-contacts-app/src/config/api.js`:

```javascript
const API_CONFIG = {
  development: {
    baseURL: 'https://YOUR_BACKEND_IP:7000/api',  // Change this
    timeout: 10000
  },
  
  production: {
    baseURL: 'https://your-api-domain.com/api',   // Change this
    timeout: 10000
  }
};
```

2. **Update CORS** in `webApitest/Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000", 
            "https://localhost:3000",
            "http://YOUR_FRONTEND_IP:3000",  // Add your frontend IP
            "https://YOUR_FRONTEND_IP:3000"  // Add your frontend IP
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});
```

## 🔧 Step 6: Environment-Specific Configurations

### Development Environment
- Backend: `https://localhost:7000`
- Frontend: `http://localhost:3000`
- Database: SQL Server LocalDB

### Production Environment
- Backend: `https://your-api-domain.com`
- Frontend: `https://your-frontend-domain.com`
- Database: SQL Server (Production)

### Different Network Setup
- Backend: `https://192.168.1.100:7000` (Your backend machine IP)
- Frontend: `http://192.168.1.101:3000` (Your frontend machine IP)

## 🚀 Quick Start Commands

### Backend
```bash
cd webApitest
dotnet restore
dotnet run
```

### Frontend
```bash
cd react-contacts-app
npm install
npm start
```

## 🔍 Troubleshooting

### Common Issues:

1. **CORS Error**: Update CORS policy in `Program.cs`
2. **Database Connection**: Check connection string in `appsettings.json`
3. **Port Conflicts**: Change ports in `launchSettings.json` (backend) or `package.json` (frontend)
4. **API Not Found**: Check API URL in `react-contacts-app/src/config/api.js`

### Port Configuration:

**Backend Ports** (in `webApitest/Properties/launchSettings.json`):
```json
{
  "profiles": {
    "webApitest": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "launchUrl": "swagger",
      "applicationUrl": "https://localhost:7000;http://localhost:5000",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

**Frontend Port** (in `react-contacts-app/package.json`):
```json
{
  "scripts": {
    "start": "PORT=3000 react-scripts start"
  }
}
```

## 📱 Testing the Application

1. **Open Frontend**: `http://localhost:3000`
2. **Register a User**: Fill the registration form
3. **Login as User**: Use your registered credentials
4. **Admin Login**: Use `admin` / `admin123`
5. **Test API**: Visit `https://localhost:7000/swagger`

## 🔐 Default Credentials

- **Admin Username**: `admin`
- **Admin Password**: `admin123`

## 📝 Notes

- The application automatically creates the database on first run
- Admin user is seeded automatically
- JWT tokens expire after 24 hours
- All API endpoints are documented in Swagger UI
- The application is responsive and works on mobile devices
