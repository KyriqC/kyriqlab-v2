const express = require('express')
const requireAdminKey = require('../middleware/requireAdminKey')

const router = express.Router()

// Verifies the provided x-admin-key header
router.get('/verify', requireAdminKey, (req, res) => {
  res.json({ ok: true })
})

module.exports = router
