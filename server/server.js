import express from 'express'
import cors from 'cors'
import { pool } from './db.js'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/exam-papers', async (req, res) => {
  try {
    const search = String(req.query.search || '').trim()
    const category = String(req.query.category || '').trim()
    const result = await pool.query(
      `SELECT * FROM exam_papers
       WHERE ($1 = '' OR title ILIKE '%' || $1 || '%' OR subject ILIKE '%' || $1 || '%' OR category ILIKE '%' || $1 || '%')
         AND ($2 = '' OR category = $2)
       ORDER BY year DESC, created_at DESC`,
      [search, category],
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to load exam papers' })
  }
})

app.post('/api/exam-papers', async (req, res) => {
  const { id, category, drive_url, subject, title, year } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO exam_papers (id, category, drive_url, subject, title, year)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [id, category, drive_url, subject, title, Number(year)],
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(400).json({ error: error.code === '23505' ? 'ID already exists' : 'Failed to create exam paper' })
  }
})

app.put('/api/exam-papers/:id', async (req, res) => {
  const { category, drive_url, subject, title, year } = req.body
  try {
    const result = await pool.query(
      `UPDATE exam_papers
       SET category = $1, drive_url = $2, subject = $3, title = $4, year = $5
       WHERE id = $6 RETURNING *`,
      [category, drive_url, subject, title, Number(year), req.params.id],
    )
    if (!result.rowCount) return res.status(404).json({ error: 'Exam paper not found' })
    res.json(result.rows[0])
  } catch (_error) {
    res.status(400).json({ error: 'Failed to update exam paper' })
  }
})

app.delete('/api/exam-papers/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM exam_papers WHERE id = $1', [req.params.id])
    if (!result.rowCount) return res.status(404).json({ error: 'Exam paper not found' })
    res.status(204).end()
  } catch (_error) {
    res.status(500).json({ error: 'Failed to delete exam paper' })
  }
})

export default app

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`)
  })
}
