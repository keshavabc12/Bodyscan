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
5. The frontend will automatically use the correct API URL in production (same origin)
6. Bootstrap CDN is now allowed in the Content Security Policy

## Troubleshooting:
- If you see CSP errors, make sure the helmet configuration is properly set
- If API calls fail, check that the environment variables are correctly set
- The frontend will automatically detect production vs development environment
- Bootstrap is now bundled locally instead of using CDN to avoid CSP issues
- Check browser console for API base URL debugging information

## Recent Fixes:
1. **Bootstrap CDN Issue**: Removed CDN links from index.html and bundled Bootstrap locally
2. **CSP Configuration**: Temporarily disabled CSP to resolve deployment issues
3. **API Configuration**: Added debugging to help troubleshoot API URL issues
4. **CORS Configuration**: Added Render.com domains to allowed origins

## Next Steps After Deployment:
1. **Test the API**: Visit `/test` route to check API configuration and health
2. **Check Admin Users**: The test will show if admin users exist in the database
3. **Create Admin User**: If no admin users exist, run `npm run setup-admin` in the server directory
4. **Monitor Logs**: Check server logs for detailed login debugging information
5. **Re-enable CSP**: Once everything is working, re-enable CSP with proper configuration

## Default Admin Credentials (if created via setup-admin):
- Username: `admin`
- Password: `admin123`
- ⚠️ **IMPORTANT**: Change this password in production!

## Debugging Endpoints:
- `/api/health` - Server health and environment check
- `/api/test` - Basic API functionality test
- `/api/admin/check` - Check if admin users exist
- `/test` - Frontend test page with all API checks 