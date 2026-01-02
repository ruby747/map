// 간단한 Express + SQLite API (옵션2)
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('places.db');

db.prepare(`CREATE TABLE IF NOT EXISTS places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT,
  rating INTEGER,
  review TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  createdAt INTEGER
)`).run();

app.use(cors());
app.use(express.json());

app.get('/places', (req,res)=>{
  const rows = db.prepare('SELECT * FROM places ORDER BY createdAt DESC').all();
  res.json(rows);
});

app.post('/places', (req,res)=>{
  const {title, category, rating, review, lat, lng} = req.body || {};
  if(!title || lat===undefined || lng===undefined){
    return res.status(400).json({error:'title, lat, lng are required'});
  }
  const createdAt = Date.now();
  const info = db.prepare(`INSERT INTO places (title, category, rating, review, lat, lng, createdAt)
    VALUES (?,?,?,?,?,?,?)`).run(
      title,
      category || '',
      Number(rating) || 0,
      review || '',
      Number(lat),
      Number(lng),
      createdAt
    );
  res.json({id: info.lastInsertRowid, createdAt});
});

app.delete('/places/:id', (req,res)=>{
  const id = Number(req.params.id);
  db.prepare('DELETE FROM places WHERE id=?').run(id);
  res.json({ok:true});
});

app.get('/health', (_,res)=> res.json({ok:true}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`Places API running at http://localhost:${PORT}`));
