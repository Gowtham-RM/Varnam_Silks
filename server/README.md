# Backend Setup Instructions

## MongoDB Connection

1. **Update the .env file** with your MongoDB credentials:
   - Replace `<db_username>` with your MongoDB username
   - Replace `<db_password>` with your MongoDB password

2. **Start the backend server**:
   ```bash
   npm run server
   ```

3. **The server will run on**: `http://localhost:5000`

## Testing the Connection

Once the server starts, you should see:
- ✅ MongoDB connected successfully
- 🚀 Server running on port 5000

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

## Development

For auto-restart during development, install nodemon:
```bash
npm install --save-dev nodemon
```

Then use:
```bash
npm run server:dev
```

## Project Structure

```
server/
├── index.js           # Main server file
└── models/
    ├── Product.js     # Product schema
    ├── User.js        # User schema
    └── Order.js       # Order schema
```

## Next Steps

- Add API routes for products, users, and orders
- Implement authentication (JWT)
- Connect frontend to backend API
