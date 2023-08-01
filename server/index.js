const express = require("express");
const app = express();
const port = 5000; // Choose any port you like
var cors = require("cors");

app.use(cors());
const { Pool } = require("pg");
const pool = new Pool({
  user: "your name",
  host: "localhost",
  database: "todos",
  password: "enter your password",
  port: 5432, // Default PostgreSQL port
});

app.use(express.json());

// Define routes for CRUD operations

app.get("/api/todos", async (req, res) => {
  try {
    const query = "SELECT * FROM todos ORDER BY id";
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Маршрут для получения данных с базы данных
app.get("/api/todos/:id", (req, res) => {
  const id = req.params.id;

  // Запрос к базе данных для получения данных по заданному id
  pool.query("SELECT * FROM todos WHERE id = $1", [id], (err, result) => {
    if (err) {
      console.error("Error executing query", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.json(result.rows);
    }
  });
});

app.post("/api/todos", async (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === "") {
    res.status(400).json({ error: "Title cannot be empty" });
    return;
  }

  try {
    const query =
      "INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *";
    const result = await pool.query(query, [title, false]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error adding todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const query = "UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *";
    const result = await pool.query(query, [completed, id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = "DELETE FROM todos WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Todo not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
