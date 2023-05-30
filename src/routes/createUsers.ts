import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { knex } from '../database'
import { hash } from 'bcryptjs'

export async function createUsers(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    })

    const { name, email, password } = createUserBodySchema.parse(request.body)

    const checkUserAlreadyExists = await knex('users')
      .where({
        email,
      })
      .first()

    if (checkUserAlreadyExists) {
      return response.status(409).send({
        error: 'User already exists with this email address',
      })
    }

    const passwordHash = await hash(password, 8)

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password: passwordHash,
    })

    return response.status(201).send()
  })
}
