# Library Management System

## Student Details
- **Student Name:** Aditya Raj
- **Roll Number:** 250032100096
- **Branch and Section:** CSE-11
- **Project Title:** Library Management System

## Technologies Used
- Node.js
- Express.js
- JavaScript (In-memory storage)

## Installation and Run Instructions
1. Clone the repository or navigate to the project directory:
   ```bash
   cd "mt-1 web dev"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. The server runs at `http://localhost:3000`.

## Implemented API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/books` | Add a new book (validates fields, prevents duplicate IDs) |
| GET | `/api/books` | Retrieve all books (handles empty collection) |
| GET | `/api/books/:id` | Retrieve a specific book by ID |
| PUT | `/api/books/:id` | Update permitted book details (ID cannot be modified) |
| DELETE | `/api/books/:id` | Delete a book (blocked if any copy is currently issued) |
| GET | `/api/books/search?title=java` | Search books by title (case-insensitive query) |
| POST | `/api/books/:id/issue` | Issue a book copy (decrements available) |
| POST | `/api/books/:id/return` | Return a book copy (increments available up to quantity) |

## Sample Request Body for POST `/api/books`
```json
{
  "id": 101,
  "title": "Java Programming",
  "author": "Herbert Schildt",
  "category": "Programming",
  "quantity": 5,
  "available": 5
}
```
