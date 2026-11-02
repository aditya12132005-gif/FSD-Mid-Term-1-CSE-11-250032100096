const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory array initialized with sample data
let books = [
  {
    id: 101,
    title: 'Java Programming',
    author: 'Herbert Schildt',
    category: 'Programming',
    quantity: 5,
    available: 5
  }
];

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Library Management System API is running' });
});

// Task 2: Add a New Book
app.post('/api/books', (req, res) => {
  const { id, title, author, category, quantity, available } = req.body;

  if (!id || !title || !author || !category || quantity === undefined || quantity < 0) {
    return res.status(400).json({ message: 'All fields are required and quantity must be non-negative' });
  }

  if (books.some(b => String(b.id) === String(id))) {
    return res.status(400).json({ message: 'Book ID already exists' });
  }

  const qty = Number(quantity);
  const avail = available !== undefined ? Number(available) : qty;

  if (avail < 0 || avail > qty) {
    return res.status(400).json({ message: 'Available copies cannot be negative or exceed total quantity' });
  }

  const newBook = { id: Number(id) || id, title, author, category, quantity: qty, available: avail };
  books.push(newBook);
  res.status(201).json({ message: 'Book added successfully', book: newBook });
});

// Task 6: Search Books by Title (placed before /:id)
app.get('/api/books/search', (req, res) => {
  const { title } = req.query;
  if (!title) return res.status(400).json({ message: 'title query parameter is required' });

  const matches = books.filter(b => b.title.toLowerCase().includes(title.toLowerCase()));
  if (matches.length === 0) return res.status(404).json({ message: 'No books match the search criteria' });

  res.status(200).json(matches);
});

// Task 3: Retrieve All Books (handles empty collection)
app.get('/api/books', (req, res) => {
  if (books.length === 0) {
    return res.status(200).json({ message: 'Collection is empty', books: [] });
  }
  res.status(200).json(books);
});

// Task 3: Retrieve Book by ID
app.get('/api/books/:id', (req, res) => {
  const book = books.find(b => String(b.id) === req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.status(200).json(book);
});

// Task 4: Update Book Details (ID cannot be changed)
app.put('/api/books/:id', (req, res) => {
  const book = books.find(b => String(b.id) === req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });

  if (req.body.id !== undefined && String(req.body.id) !== req.params.id) {
    return res.status(400).json({ message: 'Book ID cannot be changed' });
  }

  const { title, author, category, quantity, available } = req.body;
  if (title !== undefined) book.title = title;
  if (author !== undefined) book.author = author;
  if (category !== undefined) book.category = category;

  if (quantity !== undefined) {
    if (quantity < 0) return res.status(400).json({ message: 'Quantity must be non-negative' });
    book.quantity = Number(quantity);
  }

  if (available !== undefined) {
    if (available < 0 || available > book.quantity) {
      return res.status(400).json({ message: 'Available cannot be negative or exceed quantity' });
    }
    book.available = Number(available);
  }

  res.status(200).json({ message: 'Book updated successfully', book });
});

// Task 5: Delete a Book (cannot delete if copies are issued)
app.delete('/api/books/:id', (req, res) => {
  const index = books.findIndex(b => String(b.id) === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Book not found' });

  if (books[index].available < books[index].quantity) {
    return res.status(400).json({ message: 'Cannot delete book: one or more copies are currently issued' });
  }

  books.splice(index, 1);
  res.status(200).json({ message: 'Book deleted successfully' });
});

// Task 7: Issue a Book
app.post('/api/books/:id/issue', (req, res) => {
  const book = books.find(b => String(b.id) === req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });

  if (book.available <= 0) {
    return res.status(400).json({ message: 'Cannot issue book: no copies available' });
  }

  book.available -= 1;
  res.status(200).json({ message: 'Book issued successfully', book });
});

// Task 7: Return a Book
app.post('/api/books/:id/return', (req, res) => {
  const book = books.find(b => String(b.id) === req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });

  if (book.available >= book.quantity) {
    return res.status(400).json({ message: 'Cannot return book: all copies are already accounted for' });
  }

  book.available += 1;
  res.status(200).json({ message: 'Book returned successfully', book });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
