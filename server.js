const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
let books = [{ id: 101, title: 'Java Programming', author: 'Herbert Schildt', category: 'Programming', quantity: 5, available: 5 }];

app.use(express.json());

const findBook = id => books.find(book => String(book.id) === id);
const notFound = res => res.status(404).json({ message: 'Book not found' });

app.get('/', (req, res) => res.json({ message: 'Library Management System API is running' }));

app.post('/api/books', (req, res) => {
  const { id, title, author, category, quantity, available } = req.body;
  if (!id || !title || !author || !category || quantity === undefined || quantity < 0)
    return res.status(400).json({ message: 'All fields are required and quantity must be non-negative' });
  if (books.some(book => String(book.id) === String(id)))
    return res.status(400).json({ message: 'Book ID already exists' });
  const total = Number(quantity), inStock = available === undefined ? total : Number(available);
  if (inStock < 0 || inStock > total)
    return res.status(400).json({ message: 'Available copies cannot be negative or exceed total quantity' });
  const book = { id: Number(id) || id, title, author, category, quantity: total, available: inStock };
  books.push(book);
  res.status(201).json({ message: 'Book added successfully', book });
});

app.get('/api/books/search', (req, res) => {
  if (!req.query.title) return res.status(400).json({ message: 'title query parameter is required' });
  const matches = books.filter(book => book.title.toLowerCase().includes(req.query.title.toLowerCase()));
  res.status(matches.length ? 200 : 404).json(matches.length ? matches : { message: 'No books match the search criteria' });
});

app.get('/api/books', (req, res) => res.json(books.length ? books : { message: 'Collection is empty', books: [] }));
app.get('/api/books/:id', (req, res) => findBook(req.params.id) ? res.json(findBook(req.params.id)) : notFound(res));

app.put('/api/books/:id', (req, res) => {
  const book = findBook(req.params.id);
  if (!book) return notFound(res);
  const { id, title, author, category, quantity, available } = req.body;
  if (id !== undefined && String(id) !== req.params.id) return res.status(400).json({ message: 'Book ID cannot be changed' });
  if (quantity !== undefined && quantity < 0) return res.status(400).json({ message: 'Quantity must be non-negative' });
  const total = quantity === undefined ? book.quantity : Number(quantity);
  if (available !== undefined && (available < 0 || available > total))
    return res.status(400).json({ message: 'Available cannot be negative or exceed quantity' });
  for (const field of ['title', 'author', 'category'])
    if (req.body[field] !== undefined) book[field] = req.body[field];
  book.quantity = total;
  if (available !== undefined) book.available = Number(available);
  res.json({ message: 'Book updated successfully', book });
});

app.delete('/api/books/:id', (req, res) => {
  const index = books.findIndex(book => String(book.id) === req.params.id);
  if (index < 0) return notFound(res);
  if (books[index].available < books[index].quantity)
    return res.status(400).json({ message: 'Cannot delete book: one or more copies are currently issued' });
  books.splice(index, 1);
  res.json({ message: 'Book deleted successfully' });
});

app.post('/api/books/:id/issue', (req, res) => changeStock(req, res, -1));
app.post('/api/books/:id/return', (req, res) => changeStock(req, res, 1));

function changeStock(req, res, change) {
  const book = findBook(req.params.id);
  if (!book) return notFound(res);
  if (book.available + change < 0 || book.available + change > book.quantity)
    return res.status(400).json({ message: change < 0 ? 'Cannot issue book: no copies available' : 'Cannot return book: all copies are already accounted for' });
  book.available += change;
  res.json({ message: change < 0 ? 'Book issued successfully' : 'Book returned successfully', book });
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));