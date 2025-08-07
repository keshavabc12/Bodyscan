# Deployment Guide for Render.com

## Environment Variables Required

Set these environment variables in your Render dashboard:

### Required Variables:
- `MONGO_URI`: Your MongoDB connection string
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
- `JWT_SECRET`: A secure random string for JWT signing

### Optional Variables:
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (set to "production")
- `CORS_ORIGINS`: Comma-separated list of allowed origins
- `FRONTEND_URL`: Your frontend URL
- `CLIENT_BUILD_PATH`: Path to client build (default: ../client/build)

## Build Command
Use this build command in Render:
```
npm run render-build
```

## Start Command
Use this start command in Render:
```
npm start
```

## Node.js Version
Use Node.js version 18.x or higher.

## Important Notes:
1. Make sure your MongoDB database is accessible from Render
2. Ensure your Cloudinary account is active and credentials are correct
3. The build process will install dependencies for both server and client
4. The client build will be created and served by the server in production mode 