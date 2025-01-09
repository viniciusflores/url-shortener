import express from 'express'
import crypto from 'node:crypto'

const app = express()

app.use(express.json())

let mydb = []

app.get('/:hash', (req, res) => {
  const { hash } = req.params

  const data = mydb.find((item) => item.hashed_url === hash)

  if (!data) {
    return res.status(404).send('Not Found')
  }

  res.redirect(data.original_url)
})

app.post('/', (req, res) => {

  const { original_url } = req.body
  let hashed_url

  const data = mydb.find((item) => item.original_url === original_url)

  if (data) {
    hashed_url = data.hashed_url
  } else {
    do {
      hashed_url = crypto.randomBytes(1).toString("base64");
      mydb.push({ original_url, hashed_url })
    } while (mydb.indexOf(hashed_url) !== -1)
  }
  console.log('mydb: %O', mydb);
  console.log('__');

  return res.json({ original_url, hashed_url })
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})

