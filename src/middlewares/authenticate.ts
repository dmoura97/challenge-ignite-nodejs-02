import { FastifyReply, FastifyRequest } from 'fastify'
import { verify } from 'jsonwebtoken'
import { env } from '../env'

export async function authenticate(
  request: FastifyRequest,
  response: FastifyReply,
  done: () => void,
) {
  const authToken = request.headers.authorization

  if (!authToken) {
    return response.status(401).send({
      error: 'Unauthorized',
    })
  }

  const [, token] = authToken.split(' ')

  try {
    const { sub } = verify(token, env.SECRET_TOKEN)
    request.id = sub
  } catch (error) {
    return response.status(401).send({
      error: 'Token invalid',
    })
  }
}
