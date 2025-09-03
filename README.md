# Smart Route Finder

A full-stack application built with Node.js backend and React frontend for intelligent route planning and navigation.

##  Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 20.19.0 or higher)
- **npm** (comes with Node.js)
- **MongoDB** account and database URL

##  Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/nakul177/smart-route-finder-app.git
cd smart-route-finder-app
```

### 2. Environment Configuration
Create a `.env` file in the `backend` folder:

```bash
# Navigate to backend folder
cd backend

# Create .env file
touch .env
```

Add the following to your `backend/.env` file:
```env
MONGO_URI=your_mongodb_connection_string_here
```

**Example:**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-route-finder?retryWrites=true&w=majority
```

### 3. Install Dependencies
Run this command from the root directory:
```bash
npm run install-all
```

This command will:
- Install backend dependencies
- Install frontend dependencies
- Install root-level dependencies

### 4. Start the Application
```bash
npm run dev
```

This will start both the backend and frontend servers concurrently.

##  Project Structure

```
smart-route-finder/
├── backend/                 # Node.js backend
│   ├── .env                # Environment variables
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend
│   └── package.json        # Frontend dependencies
└── package.json           # Root package.json with scripts
```

## 🛠 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run install-backend` | Install only backend dependencies |
| `npm run install-frontend` | Install only frontend dependencies |
| `npm run install-all` | Install all dependencies (backend, frontend, and root) |
| `npm run start-backend` | Start only the backend server |
| `npm run start-frontend` | Start only the frontend server |
| `npm run dev` | Start both backend and frontend servers |

## 🔧 Setup Verification

After running `npm run dev`, verify that:

 **Backend Server**: Check console for database connection message  
 **Frontend Server**: React app should open in your browser  
 **Database Connection**: Confirm MongoDB connection is established

##  Default Ports

- **Backend**: Usually runs on `http://localhost:5000` 
- **Frontend**: Usually runs on `http://localhost:5173`

##  Troubleshooting

### Database Connection Issues
1. Verify your MongoDB URI is correct in `backend/.env`
2. Ensure your IP address is whitelisted in MongoDB Atlas
3. Check that your database user has proper permissions

### Port Conflicts
If you encounter port conflicts, check if other applications are using the default ports and stop them or configure different ports.

### Installation Issues
```bash
# Clear npm cache if you encounter installation problems
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm run install-all
```

## Environment Variables

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | ✅ Yes |
