import fastify from 'fastify'
import { mealsRoutes } from './routes/meals'
import { createUsers } from './routes/createUsers'
import { auth } from './routes/auth'

export const app = fastify()

app.register(mealsRoutes, {
  prefix: 'meals',
})

app.register(createUsers, {
  prefix: 'users',
})

app.register(auth, {
  prefix: 'authenticate',
})
