# Document Verification System - Frontend

A modern React frontend for the Document Verification System built with ASP.NET Web API 8.0 backend.

## 🚀 Features

- **Document Upload**: Upload EC (PDF), Aadhaar (PNG), and PAN (PNG) documents
- **Data Extraction**: Extract data from uploaded documents using AI/OCR
- **User Management**: User registration, login, and profile management
- **Admin Dashboard**: Admin panel for managing documents and users
- **Real-time Updates**: Live status updates and notifications
- **Responsive Design**: Modern UI with Tailwind CSS

## 🛠️ Tech Stack

- **React 18** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Icons** for icons

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on https://localhost:7001

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your API URL:
   ```
   VITE_API_URL=https://localhost:7001/api
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### API Configuration
The app connects to your ASP.NET Web API backend. Make sure your backend is running on the configured port.

### Environment Variables
- `VITE_API_URL`: Your backend API URL (default: https://localhost:7001/api)

## 📱 Usage

### For Users
1. **Register/Login**: Create an account or login
2. **Upload Documents**: Upload EC (PDF), Aadhaar (PNG), and PAN (PNG) documents
3. **Extract Data**: Click "Extract Data" to process documents
4. **View Results**: See extracted data and verification status

### For Admins
1. **Admin Login**: Use admin credentials to login
2. **View Documents**: See all uploaded documents from users
3. **Extract Data**: Process documents for any user
4. **Manage Users**: View and manage user accounts

## 🎨 UI Components

- **Modern Design**: Clean, professional interface
- **Responsive**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Automatic theme switching
- **Animations**: Smooth transitions and loading states
- **Notifications**: Toast notifications for user feedback

## 🔐 Security Features

- JWT token authentication
- Secure API communication
- Input validation
- File type restrictions
- CORS configuration

## 📁 Project Structure

```
src/
├── Components/
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard components
│   ├── Common/         # Reusable components
│   └── Layout/         # Layout components
├── Services/           # API services
├── Routes/             # Route definitions
└── config/             # Configuration files
```

## 🚀 Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting service

3. **Update environment variables** for production

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- ESLint configuration included
- Prettier formatting
- TypeScript support (optional)

## 📞 Support

For issues or questions:
1. Check the backend API is running
2. Verify environment variables
3. Check browser console for errors
4. Ensure CORS is configured on backend

## 🎯 Backend Integration

This frontend integrates with the following backend endpoints:

- `POST /api/Auth/register` - User registration
- `POST /api/Auth/login` - User login
- `POST /api/Auth/admin-login` - Admin login
- `POST /api/UserDashboard/upload-documents` - Upload documents
- `POST /api/UserDashboard/extract/{uploadId}` - Extract data (user)
- `GET /api/AdminDashboard/uploaded-documents` - Get all documents (admin)
- `POST /api/AdminDashboard/extract/{uploadId}` - Extract data (admin)

## 🔄 Updates

The frontend automatically handles:
- Token refresh
- Error handling
- Loading states
- Real-time updates
- File validation

---

**Built with ❤️ for Document Verification System**