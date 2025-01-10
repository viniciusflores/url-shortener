import express from 'express'
import { PrismaClient } from '@prisma/client'
import crypto from 'node:crypto'
import dotenv from 'dotenv'

dotenv.config()

const { APP_PORT, HASH_STRONG_NUMBER } = process.env

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
      hashed_url = crypto.randomBytes(Number(HASH_STRONG_NUMBER)).toString("base64")
      availableHash = await prisma.urlShortener.findUnique({
        where: {
          hashed_url
        }
      })
    } while (availableHash)

    await prisma.urlShortener.create({
      data: {
        original_url,
        hashed_url
      }
    })
    return res.json({ hashed_url })
  }
})

app.listen(APP_PORT, () => {
  console.log(`Server is running on http://localhost:${APP_PORT} 🚀`)
})

