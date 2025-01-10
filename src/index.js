import express from 'express'
import { PrismaClient } from '@prisma/client'
import crypto from 'node:crypto'

const app = express()

const prisma = new PrismaClient()

app.use(express.json())

app.get('/:hash', async (req, res) => {
  const { hash } = req.params

  const data = await prisma.urlShortener.findFirst({
    where: {
      hashed_url: hash
    }
  })

  if (!data) {
    return res.status(404).send('Not Found')
  }

  res.redirect(data.original_url)
})

app.post('/', async (req, res) => {
  const { original_url } = req.body

  const data = await prisma.urlShortener.findFirst({
    where: {
      original_url
    }
  })

  if (data) {
    return res.json({ data })
  } else {
    let availableHash
    let hashed_url

    do {
      hashed_url = crypto.randomBytes(1).toString("base64")
      availableHash = await prisma.urlShortener.findUnique({
        where: {
          hashed_url
        }
      })
    } while (availableHash)

    const urlShortener = await prisma.urlShortener.create({
      data: {
        original_url,
        hashed_url
      }
    })
    return res.json({ hashed_url })
  }
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})

