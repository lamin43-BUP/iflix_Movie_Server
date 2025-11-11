// server.js
const express = require('express');
const mysql = require('mysql2');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const app = express();
const sessions = {};

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'iflixuser',
  password: 'iflixpass',
  database: 'iflix'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ MySQL connected.');
});
const dbPromise = db.promise();

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// 🔐 Protect access to protected folder
app.use('/protected', (req, res, next) => {
  const sid = req.cookies.sessionId;
  if (!sid || !sessions[sid]) {
    return res.redirect('/');
  }
  express.static(path.join(__dirname, 'protected'))(req, res, next);
});

// Multer upload setup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB

// Default route (login page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  db.query('SELECT * FROM users WHERE email = ? AND password_hash = ?', [email, hash], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const user = results[0];
    const sid = crypto.randomBytes(16).toString('hex');
    sessions[sid] = { userId: user.user_id };
    res.cookie('sessionId', sid, { httpOnly: true });
    res.status(200).json({ success: true, redirect: '/protected/index.html' });
  });
});

// Admin login
app.post('/admin/login', (req, res) => {
  const { email, password } = req.body;
  const username = email;
  db.query('SELECT * FROM admins WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
    const admin = results[0];
    const sid = crypto.randomBytes(16).toString('hex');
    sessions[sid] = { adminId: admin.admin_id };
    res.cookie('sessionId', sid, { httpOnly: true });
    res.status(200).json({ success: true, redirect: '/protected/admin-dashboard.html' });
  });
});

// Signup route
app.post('/signup', (req, res) => {
  const { name, email, phone, movie_preference, subscription_plan, password, age, gender } = req.body;
  db.query('SELECT user_id FROM users WHERE email=?', [email], (err, results) => {
    if (err) return res.status(500).send('❌ Database error');
    if (results.length > 0) return res.redirect('/sign-up.html');

    const hash = crypto.createHash('sha256').update(password).digest('hex');
    db.query(
      'INSERT INTO users (name, email, phone, movie_preference, subscription_plan, password_hash, age, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, phone, movie_preference, subscription_plan, hash, age || null, gender || null],
      err2 => {
        if (err2) return res.status(500).send('❌ Signup failed');
        res.redirect('/login.html');
      }
    );
  });
});

// Watch Later
app.post('/watch-later', (req, res) => {
  const { movieId, userId } = req.body;
  if (!movieId || !userId) return res.status(400).json({ success: false });

  db.query('SELECT * FROM watch_later WHERE user_id=? AND movie_id=?', [userId, movieId], (err, rows) => {
    if (err) return res.status(500).json({ success: false });
    if (rows.length > 0) return res.status(200).json({ success: false, message: 'DUPLICATE' });

    db.query('INSERT INTO watch_later (user_id, movie_id) VALUES (?, ?)', [userId, movieId], err2 => {
      if (err2) return res.status(500).json({ success: false });
      res.status(200).json({ success: true });
    });
  });
});

// Submit rating
app.post('/submit-rating', (req, res) => {
  const { movieId, userId, rating } = req.body;
  db.query(
    'INSERT INTO ratings (movie_id, rating) VALUES (?, ?) ON DUPLICATE KEY UPDATE rating = ?',
    [movieId, rating, rating],
    err => {
      if (err) return res.status(500).json({ success: false });
      res.status(200).json({ success: true });
    }
  );
});

// API: Get users
app.get('/api/users', (req, res) => {
  db.query('SELECT name, movie_preference FROM users', (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});

// Reviews
app.get('/api/reviews', (req, res) => {
  db.query('SELECT user_name, content FROM reviews ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});
app.post('/api/reviews', (req, res) => {
  const { user_name, content } = req.body;
  if (!user_name || !content) return res.status(400).json({ error: 'Missing data' });

  db.query('INSERT INTO reviews (user_name, content) VALUES (?, ?)', [user_name, content], err => {
    if (err) return res.status(500).json({ error: 'Insert failed' });
    res.status(200).json({ success: true });
  });
});

// Discussions
app.get('/api/discussions', (req, res) => {
  db.query('SELECT user_name, content FROM discussions ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});
app.post('/api/discussions', (req, res) => {
  const { user_name, content } = req.body;
  if (!user_name || !content) return res.status(400).json({ error: 'Missing data' });

  db.query('INSERT INTO discussions (user_name, content) VALUES (?, ?)', [user_name, content], err => {
    if (err) return res.status(500).json({ error: 'Insert failed' });
    res.status(200).json({ success: true });
  });
});

// Profile GET 
app.get('/api/profile', async (req, res) => {
  const sid = req.cookies.sessionId;
  const session = sessions[sid];
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const userId = session.userId;

  try {
    // Get user info
    const [userResult] = await dbPromise.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (userResult.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = userResult[0];

    // Get all subscriptions
    const [subs] = await dbPromise.query(
      `SELECT plan, price, DATE(start_date) AS start_date, DATE(end_date) AS end_date
       FROM subscriptions
       WHERE user_id = ?
       ORDER BY start_date DESC`,
      [userId]
    );

    const currentSub = subs.length > 0 ? subs[0] : null; 
    const pastSubs = subs.slice(1); 

    res.json({
      name: user.name,
      user_id: user.user_id,
      email: user.email,
      phone: user.phone,
      age: user.age,
      gender: user.gender,
      movie_preference: user.movie_preference,
      bio: user.bio,
      profile_pic: user.profile_pic ? user.profile_pic : '/public/img/default-profile.jpg',
      current_subscription: currentSub,
      past_subs: pastSubs
    });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});



// Profile UPDATE
app.post('/api/profile/update', upload.single('profile_picture'), (req, res) => {
  const sid = req.cookies.sessionId;
  const session = sessions[sid];
  if (!session) return res.status(401).json({ success: false });

  const userId = session.userId;
  const { name, phone, movie_preference, gender, age, bio } = req.body;
  const profile_pic = req.file ? `/uploads/${req.file.filename}` : null;

  // Check if file uploaded — if yes, include it in update
  const query = profile_pic
    ? 'UPDATE users SET name=?, phone=?, movie_preference=?, gender=?, age=?, bio=?, profile_pic=? WHERE user_id=?'
    : 'UPDATE users SET name=?, phone=?, movie_preference=?, gender=?, age=?, bio=? WHERE user_id=?';

  const params = profile_pic
    ? [name, phone, movie_preference, gender, age || null, bio || null, profile_pic, userId]
    : [name, phone, movie_preference, gender, age || null, bio || null, userId];

  db.query(query, params, err => {
    if (err) {
      console.error('Error updating profile:', err);
      return res.status(500).json({ success: false });
    }
    res.status(200).json({ success: true });
  });
});


// Admin: Get & delete users
app.get('/admin/users', (req, res) => {
  db.query('SELECT user_id, name, email, phone, movie_preference, subscription_plan, age, gender FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(results);
  });
});
app.delete('/admin/users/:id', (req, res) => {
  db.query('DELETE FROM users WHERE user_id = ?', [req.params.id], err => {
    if (err) return res.status(500).json({ error: 'Failed to delete user' });
    res.json({ success: true });
  });
});

// Admin: Add movie
const movieUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.random().toString(36).substring(2) + path.extname(file.originalname))
  }),
  limits: { fileSize: 200 * 1024 * 1024 }
});

app.post('/admin/add-movie', movieUpload.fields([
  { name: 'video_file', maxCount: 1 },
  { name: 'thumbnail_file', maxCount: 1 }
]), (req, res) => {
  const b = req.body;
  const vf = req.files.video_file?.[0];
  const tf = req.files.thumbnail_file?.[0];
  if (!vf || !tf) return res.status(400).json({ success: false, error: 'Files missing' });

  db.query(
    `INSERT INTO new_movies (name, genre, rating, duration, overview, trailer_link, video_path, thumbnail_path, video_filename, thumbnail_filename)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      b.name, b.genre, b.rating || null, b.duration, b.overview, b.trailer_link || null,
      `/uploads/${vf.filename}`, `/uploads/${tf.filename}`,
      vf.filename, tf.filename
    ],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: 'DB insert failed' });
      res.json({ success: true, id: result.insertId });
    }
  );
});

// Fetch newly added movies
app.get('/api/newly-added-movies', (req, res) => {
  db.query(
    'SELECT new_movie_id AS id, name, overview, thumbnail_path FROM new_movies ORDER BY created_at DESC LIMIT 10',
    (err, results) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json(results);
    }
  );
});




// Get individual movie by ID
app.get('/api/movie/:id', (req, res) => {
  const movieId = req.params.id;
  db.query('SELECT * FROM new_movies WHERE new_movie_id = ?', [movieId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json(null);
    }
    res.json(results[0]);
  });
});


//Admin delete movies
// Get all movies
app.get('/admin/get-all-movies', async (req, res) => {
  try {
    console.log("Fetching new_movies...");
    const [newMovies] = await dbPromise.query(
      'SELECT new_movie_id AS id, name, genre, "new_movies" AS source FROM new_movies'
    );
    console.log("Fetching movies...");
    const [movies] = await dbPromise.query(
      'SELECT movie_id AS id, name, genre, "movies" AS source FROM movies'
    );

    const allMovies = [...newMovies, ...movies];
    console.log("All movies fetched successfully.");
    res.json({ success: true, data: allMovies });
  } catch (err) {
    console.error('❌ Error fetching movie data:', err);
    res.status(500).json({ success: false, message: 'Error fetching movie data' });
  }
});



// Delete movie
app.delete('/admin/delete-movie', async (req, res) => {
  const { id, table } = req.body;
  if (!['movies', 'new_movies'].includes(table)) {
    return res.status(400).json({ success: false, message: 'Invalid table' });
  }

  const column = table === 'movies' ? 'movie_id' : 'new_movie_id';
  try {
    const [result] = await db.promise().query(`DELETE FROM \`${table}\` WHERE \`${column}\` = ?`, [id]);
    if (result.affectedRows > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Movie not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error deleting movie' });
  }
});


//watch_later
app.get('/api/watch-later/:userId', (req, res) => {
  const userId = req.params.userId;
  const sql = `
    SELECT m.name, m.thumbnail_path, m.video_path, m.popular_category, m.trend_category, m.genre
    FROM movies m
    JOIN watch_later w ON m.movie_id = w.movie_id
    WHERE w.user_id = ?
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Watch Later fetch error:", err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

//filter movie
app.get('/api/movies/genre/:genre', (req, res) => {
  const genre = req.params.genre;
  const query = 'SELECT * FROM movies WHERE genre = ?';
  db.query(query, [genre], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});


app.get('/api/movies/filter', (req, res) => {
  const { filterType, filterValue } = req.query;
  const allowedFilters = ['genre', 'popular_category', 'trend_category'];

  if (!allowedFilters.includes(filterType)) {
    return res.status(400).json({ error: 'Invalid filter type' });
  }

  db.query(
    `SELECT * FROM movies WHERE ?? = ?`,
    [filterType, filterValue],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    }
  );
});


// admin overview graph
// For user age distribution
app.get('/api/admin/user-age-stats', (req, res) => {
  const sql = `
    SELECT
      CASE 
        WHEN age BETWEEN 15 AND 20 THEN '15-20'
        WHEN age BETWEEN 21 AND 25 THEN '20-25'
        WHEN age BETWEEN 26 AND 30 THEN '25-30'
        WHEN age BETWEEN 31 AND 35 THEN '30-35'
        WHEN age BETWEEN 36 AND 40 THEN '35-40'
        ELSE '40+'
      END AS age_range,
      COUNT(*) AS count
    FROM users
    GROUP BY age_range
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    const data = {};
    results.forEach(row => data[row.age_range] = row.count);
    res.json(data);
  });
});

// For movie genre distribution
app.get('/api/admin/movie-genre-stats', (req, res) => {
  const sql = `SELECT genre, COUNT(*) AS count FROM movies GROUP BY genre`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    const data = {};
    results.forEach(row => data[row.genre] = row.count);
    res.json(data);
  });
});



// user subscription
app.post('/api/subscribe', async (req, res) => {
  const { plan, price, start_date, end_date, email } = req.body;

  try {
    const [results] = await db.promise().query('SELECT user_id FROM users WHERE email = ?', [email]);
    
    if (!results.length) {
      console.log("User not found for email:", email);
      return res.json({ success: false, message: 'User not found' });
    }

    const user_id = results[0].user_id;

    await db.promise().query(
      `INSERT INTO subscriptions (user_id, plan, price, start_date, end_date)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, plan, price, start_date, end_date]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});


// // Admin route to view all users and their subscriptions
app.get('/api/admin/subscriptions', async (req, res) => {
  const sid = req.cookies.sessionId;
  const session = sessions[sid];
  if (!session || !session.adminId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [results] = await dbPromise.query(`
      SELECT u.user_id, u.name, u.email, s.plan, s.price,
        DATE(s.start_date) AS start_date,
        DATE(s.end_date) AS end_date
      FROM users u
      JOIN subscriptions s ON u.user_id = s.user_id
      ORDER BY s.start_date DESC
    `);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});



// Logout
app.get('/logout', (req, res) => {
  const sid = req.cookies.sessionId;
  if (sid) {
    delete sessions[sid];
    res.clearCookie('sessionId');
  }
  res.redirect('/');
});

// 404
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

// Server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
