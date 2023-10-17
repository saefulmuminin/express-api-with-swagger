/**
 * @swagger
 * /users:
 *   get:
 *     summary: Mengambil daftar pengguna dengan paginasi
 *     description: >
 *       Mengambil daftar pengguna dengan paginasi, dengan jumlah maksimal 10 pengguna per halaman.
 *       Parameter "page" adalah nomor halaman yang diinginkan (default adalah 1).
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Nomor halaman yang diinginkan.
 *     responses:
 *       200:
 *         description: Daftar pengguna berhasil diambil dengan paginasi.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 username: user1
 *               - id: 2
 *                 username: user2
 *       500:
 *         description: Terjadi kesalahan saat mengambil daftar pengguna.
 *   post:
 *     summary: Mendaftarkan pengguna baru
 *     description: Mendaftarkan pengguna baru dengan informasi email dan password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               email: user3@example.com
 *               password: password123
 *     responses:
 *       201:
 *         description: Registrasi pengguna baru berhasil.
 *       400:
 *         description: Permintaan tidak valid atau data yang kurang lengkap.
 *       500:
 *         description: Terjadi kesalahan saat mendaftarkan pengguna baru.

 * @swagger
 * /movies:
 *   get:
 *     summary: Mengambil daftar film dengan paginasi
 *     description: >
 *       Mengambil daftar film dengan paginasi, dengan jumlah maksimal 10 film per halaman.
 *       Parameter "page" adalah nomor halaman yang diinginkan (default adalah 1).
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Nomor halaman yang diinginkan.
 *     responses:
 *       200:
 *         description: Daftar film berhasil diambil dengan paginasi.
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 title: Film 1
 *               - id: 2
 *                 title: Film 2
 *       500:
 *         description: Terjadi kesalahan saat mengambil daftar film.
 *   post:
 *     summary: Menambahkan film baru
 *     description: Menambahkan film baru dengan informasi judul dan deskripsi.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *             example:
 *               title: Film Baru
 *               description: Deskripsi Film Baru
 *     responses:
 *       201:
 *         description: Film baru berhasil ditambahkan.
 *       400:
 *         description: Permintaan tidak valid atau data yang kurang lengkap.
 *       500:
 *         description: Terjadi kesalahan saat menambahkan film baru.
 *   put:
 *     summary: Memperbarui film
 *     description: Memperbarui film yang ada dengan informasi judul dan deskripsi.
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: ID film yang akan diperbarui.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *             example:
 *               title: Film Diperbarui
 *               description: Deskripsi Film Diperbarui
 *     responses:
 *       200:
 *         description: Film berhasil diperbarui.
 *       400:
 *         description: Permintaan tidak valid atau data yang kurang lengkap.
 *       500:
 *         description: Terjadi kesalahan saat memperbarui film.
 *   delete:
 *     summary: Menghapus film
 *     description: Menghapus film berdasarkan ID.
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: integer
 *         description: ID film yang akan dihapus.
 *     responses:
 *       204:
 *         description: Film berhasil dihapus.
 *       404:
 *         description: Film tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan saat menghapus film.
 */

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware.js");
// login users
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Harap isi semua field." });
  }

  // Lakukan otentikasi (perhatikan: ini hanya contoh)
  pool.query(
    "SELECT * FROM users WHERE email = $1 AND password = $2",
    [email, password],
    (error, result) => {
      if (error) {
        return res.status(500).json({ message: "Gagal melakukan otentikasi." });
      }
      if (result.rows.length === 0) {
        return res.status(401).json({
          message: "Gagal melakukan otentikasi. Periksa email dan password.",
        });
      }

      // Buat token JWT
      const token = jwt.sign({ email }, process.env.JWT_SECRET);

      // Kembalikan token sebagai respons
      return res.status(200).json({ token });
    }
  );
});

// Registrasi User
router.post("/register", (req, res) => {
  const { email, password, gender, role } = req.body;

  if (!email || !password || !gender || !role) {
    return res.status(400).json({
      message: "Harap isi semua field ini email, password, gender, role.",
    });
  }

  pool.query(
    "INSERT INTO users (email, password, gender, role) VALUES ($1, $2, $3, $4) RETURNING id",
    [email, password, gender, role],
    (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Gagal mendaftar.", error: error.message });
      }

      // Periksa apakah ada hasil yang dikembalikan
      if (result.rows.length === 0) {
        return res.status(500).json({
          message: "Gagal mendaftar. Tidak ada ID yang dikembalikan.",
        });
      }

      // Ambil ID dari hasil query
      const insertedUserId = result.rows[0].id;

      return res.status(201).json({
        message: "Registrasi berhasil.",
        userId: insertedUserId,
      });
    }
  );
});

// Contoh endpoint lain (GET, PUT, DELETE)

// GET data users
router.get("/users", authMiddleware, (req, res) => {
  // Mengambil data pengguna dari basis data
  pool.query("SELECT * FROM users", (error, result) => {
    if (error) {
      return res
        .status(500)
        .json({ message: "Gagal mengambil data pengguna." });
    }
    return res.status(200).json(result.rows);
  });
});

// GET data movies
router.get("/movies", authMiddleware, (req, res) => {
  // Mengambil data pengguna dari basis data
  pool.query("SELECT * FROM movies", (error, result) => {
    if (error) {
      return res
        .status(500)
        .json({ message: "Gagal mengambil data pengguna." });
    }
    return res.status(200).json(result.rows);
  });
});

// PUT data users
// PUT data users berdasarkan ID
router.put("/users/:id", authMiddleware, adminMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const { email, password, gender, role } = req.body;

  if (!email || !password || !gender || !role) {
    return res.status(400).json({ message: "Harap isi semua field." });
  }

  // Lakukan pembaruan data users
  pool.query(
    "UPDATE users SET email = $1, password = $2, gender = $3, role = $4 WHERE id = $5",
    [email, password, gender, role, id],
    (error) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Gagal memperbarui data pengguna." });
      }
      return res
        .status(200)
        .json({ message: "Data pengguna (users) diperbarui." });
    }
  );
});

// PUT data movies
// PUT data movies berdasarkan ID
router.put("/movies/:id", authMiddleware, adminMiddleware, (req, res) => {
  const id = parseInt(req.params.id);
  const { title, genres, year } = req.body;

  if (!title || !genres || !year) {
    return res.status(400).json({ message: "Harap isi semua field." });
  }

  // Lakukan pembaruan data film
  pool.query(
    "UPDATE movies SET title = $1, genres = $2, year = $3 WHERE id = $4",
    [title, genres, year, id],
    (error) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Gagal memperbarui data film." });
      }
      return res
        .status(200)
        .json({ message: "Data film (movies) diperbarui." });
    }
  );
});

// DELETE data users berdasarkan ID
// DELETE data users berdasarkan ID
router.delete("/users/:id", authMiddleware, adminMiddleware, (req, res) => {
  const id = parseInt(req.params.id);

  // Periksa apakah pengguna dengan ID yang diberikan ada dalam database
  pool.query("SELECT * FROM users WHERE id = $1", [id], (error, result) => {
    if (error) {
      return res.status(500).json({ message: "Gagal menghapus pengguna." });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    // Jika pengguna ditemukan, hapus pengguna dengan ID tersebut
    pool.query("DELETE FROM users WHERE id = $1", [id], (error) => {
      if (error) {
        return res.status(500).json({ message: "Gagal menghapus pengguna." });
      }

      return res.status(204).send(); // Respon tanpa konten (No Content) untuk mengindikasikan penghapusan pengguna berhasil.
    });
  });
});

// DELETE data movies berdasarkan ID
// DELETE data movies berdasarkan ID
router.delete("/movies/:id", authMiddleware, adminMiddleware, (req, res) => {
  const id = parseInt(req.params.id);

  // Periksa apakah film dengan ID yang diberikan ada dalam database
  pool.query("SELECT * FROM movies WHERE id = $1", [id], (error, result) => {
    if (error) {
      return res.status(500).json({ message: "Gagal menghapus film." });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Film tidak ditemukan." });
    }

    // Jika film ditemukan, hapus film dengan ID tersebut
    pool.query("DELETE FROM movies WHERE id = $1", [id], (error) => {
      if (error) {
        return res.status(500).json({ message: "Gagal menghapus film." });
      }

      return res.status(204).send(); // Respon tanpa konten (No Content) untuk mengindikasikan penghapusan film berhasil.
    });
  });
});

// Import modul-modul yang diperlukan

// Rute untuk mendapatkan pengguna dengan paginasi
router.get("/users", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Halaman default adalah 1
  const limit = 10; // Batasan jumlah item per halaman

  // Menghitung offset (indeks data pertama untuk halaman yang diberikan)
  const offset = (page - 1) * limit;

  // Lakukan query database untuk mengambil data pengguna dengan paginasi
  pool.query(
    "SELECT * FROM users LIMIT $1 OFFSET $2",
    [limit, offset],
    (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Gagal mengambil data pengguna." });
      }
      return res.status(200).json(result.rows);
    }
  );
});

// Rute untuk mendapatkan film dengan paginasi
router.get("/movies", (req, res) => {
  const page = parseInt(req.query.page) || 1; // Halaman default adalah 1
  const limit = 10; // Batasan jumlah item per halaman

  // Menghitung offset (indeks data pertama untuk halaman yang diberikan)
  const offset = (page - 1) * limit;

  // Lakukan query database untuk mengambil data film dengan paginasi
  pool.query(
    "SELECT * FROM movies LIMIT $1 OFFSET $2",
    [limit, offset],
    (error, result) => {
      if (error) {
        return res.status(500).json({ message: "Gagal mengambil data film." });
      }
      return res.status(200).json(result.rows);
    }
  );
});

module.exports = router;
