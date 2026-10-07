# ShopKart Customer Authentication Service

Backend Engineering Lab 01.

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- bcrypt
- jsonwebtoken
- cookie-parser
- dotenv (used to load the required `.env` configuration)

## Project Structure

```text
shopkart/
├── controllers/
│   └── customer.controller.js
├── models/
│   └── customer.model.js
├── routes/
│   └── customer.routes.js
├── middlewares/
│   └── auth.middleware.js
├── utils/
│   └── generateToken.js
├── index.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Setup

1. Install Node.js.
2. Install MongoDB or create a MongoDB Atlas database.
3. Open a terminal in this project folder.
4. Run:

```bash
npm install
```

5. Copy `.env.example` to `.env`.
6. Put your MongoDB connection string and JWT secret in `.env`.
7. Start the server:

```bash
npm start
```

Server:

```text
http://localhost:5000
```

## APIs

### Register

`POST /customers/register`

```json
{
  "fullName": "John Doe",
  "email": "john@gmail.com",
  "password": "john123",
  "phone": "9876543210"
}
```

### Login

`POST /customers/login`

```json
{
  "email": "john@gmail.com",
  "password": "john123"
}
```

The JWT is stored in an HttpOnly cookie named `token`.

### My Profile

`GET /customers/me`

Must be called after login. The cookie is used for authentication.

### Logout

`POST /customers/logout`

Clears the authentication cookie.

### Bonus: Change Password

`PATCH /customers/change-password`

```json
{
  "oldPassword": "john123",
  "newPassword": "newjohn123"
}
```

## Postman Testing Order

1. Register
2. Login
3. Check that the `token` cookie exists
4. Call `/customers/me`
5. Logout
6. Call `/customers/me` again and verify it returns `401`

## Important

Never commit your `.env` file or your MongoDB credentials to GitHub.
