# Blog Management API

A RESTful API for managing blogs, user authentication, and interactions such as comments and likes. The API provides functionalities to register, login, create, update, view, delete blogs, and manage comments and likes.

## 💻 Tech Stack:
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens) ![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white) ![Nodemon](https://img.shields.io/badge/NODEMON-%23323330.svg?style=for-the-badge&logo=nodemon&logoColor=%BBDEAD) ![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white) ![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

## API Endpoints

### 1. Home
   - **URL:** `GET /`
   - **Description:** Displays the home page with a message detailing the project and the available routes in JSON format.

### 2. Register User
   - **URL:** `POST /register`
   - **Description:** Registers a new user in the database.
   - **Required Fields:**
     - `name`: The user's name.
     - `email_id`: The user's email address.
     - `password`: The user's password.
   - **Response:** Returns the ID of the newly registered user.
   
### 3. Login User
   - **URL:** `POST /login`
   - **Description:** Authenticates the user and provides a JWT token for authorization.
   - **Required Fields:**
     - `user_id`: The user ID.
     - `password`: The user’s password.
   - **Response:** Returns a JWT token for authorized requests.

### 4. Get All Blogs
   - **URL:** `GET /all-blogs`
   - **Description:** Retrieves a list of all blogs.
   - **Response:** Returns an array of all blog entries.

### 5. Get User’s Blogs
   - **URL:** `GET /my-blogs`
   - **Description:** Retrieves blogs associated with the logged-in user.
   - **Authorization:** Requires a valid JWT token.
   - **Response:** Returns an array of the user’s blogs.

### 6. Get Specific Blog
   - **URL:** `GET /my-blogs/:blog_id`
   - **Description:** Retrieves the details of a specific blog by its ID.
   - **Required Fields:** `blog_id`
   - **Response:** Returns the blog details.

### 7. Create Blog
   - **URL:** `POST /create-blog`
   - **Description:** Creates a new blog.
   - **Authorization:** Requires a valid JWT token.
   - **Required Fields:**
     - `user_id`: The user ID.
     - `blog_title`: The title of the blog.
     - `blog_content`: The content of the blog.
   - **Response:** Returns the ID of the created blog.

### 8. Update Blog
   - **URL:** `PUT /update-blog/:blog_id`
   - **Description:** Updates an existing blog.
   - **Authorization:** Requires a valid JWT token.
   - **Required Fields:** 
     - `blog_id`: The ID of the blog to be updated.
     - `blog_title`: The new title of the blog (optional).
     - `blog_content`: The new content of the blog (optional).
   - **Response:** Returns a success message on successful update.

### 9. Delete Blog
   - **URL:** `DELETE /delete-blog/:blog_id`
   - **Description:** Deletes an existing blog.
   - **Authorization:** Requires a valid JWT token.
   - **Required Fields:** `blog_id`
   - **Response:** Returns a success message on successful deletion.

### 10. View Blog
   - **URL:** `GET /view-blog/:blog_id`
   - **Description:** Retrieves the details of a specific blog by its ID.
   - **Required Fields:** `blog_id`
   - **Response:** Returns the blog details.

### 11. Add Comment to Blog
   - **URL:** `POST /view-blog/:blog_id/comment`
   - **Description:** Adds a comment to a specific blog.
   - **Authorization:** Requires a valid JWT token.
   - **Required Fields:**
     - `comment`: The comment text.
   - **Response:** Returns a success message on successful comment addition.

### 12. Get Comments for a Blog
   - **URL:** `GET /view-blog/:blog_id/get-comments`
   - **Description:** Retrieves all comments for a specific blog.
   - **Response:** Returns an array of comments.

### 13. Like Blog
   - **URL:** `GET /view-blog/:blog_id/like`
   - **Description:** Likes a specific blog.
   - **Authorization:** Requires a valid JWT token.
   - **Response:** Returns a success message if the blog is liked successfully.

### 14. Unlike Blog
   - **URL:** `GET /view-blog/:blog_id/unlike`
   - **Description:** Unlikes a specific blog.
   - **Authorization:** Requires a valid JWT token.
   - **Response:** Returns a success message if the blog is unliked successfully.

## Authentication

The API uses JWT (JSON Web Tokens) for user authentication.

- **Login:** Call the `POST /login` endpoint with the `user_id` and `password` to receive a JWT token.
- **Authorization:** Attach the token in the `Authorization` header as a Bearer token in requests requiring authentication (e.g., `/my-blogs`, `/create-blog`).

## Error Handling

- **400 Bad Request:** Missing required fields or incorrect input.
- **401 Unauthorized:** Invalid or missing JWT token.
- **403 Forbidden:** Insufficient permissions to perform an action.
- **404 Not Found:** Resource (e.g., blog or user) not found.
- **500 Internal Server Error:** Unexpected server error.

## Dependencies

- `express`: Web framework for building the REST API.
- `bcrypt`: Library to hash and compare passwords.
- `jsonwebtoken`: Library for JWT-based authentication.
- `dotenv`: Load environment variables from `.env` file.
- `knex`: SQL query builder for interacting with the database.

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/blog-management-api.git
   cd blog-management-api
