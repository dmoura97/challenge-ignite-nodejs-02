import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { env } from '../env'

export async function auth(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const authBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { email, password } = authBodySchema.parse(request.body)

    const userAlreadyExists = await knex('users')
      .where({
        email,
      })
      .first()

    if (!userAlreadyExists) {
      return response.status(400).send({
        error: 'Email or password incorrect',
      })
    }

    const passwordMath = await compare(password, userAlreadyExists.password)

    if (!passwordMath) {
      return response.status(400).send({
        error: 'Email or password incorrect',
      })
    }

    const token = sign({}, env.SECRET_TOKEN, {
      subject: userAlreadyExists.id,
      expiresIn: '1d',
    })

    return {
      token,
    }
  })
}
