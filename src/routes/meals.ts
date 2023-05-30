/* eslint-disable camelcase */
import { FastifyInstance } from 'fastify'
import { authenticate } from '../middlewares/authenticate'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { knex } from '../database'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [authenticate],
    },
    async (request) => {
      const userId = request.id

      const meals = await knex('meals').where('user_id', userId).select()

      return {
        meals,
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [authenticate],
    },
    async (request, response) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const userId = request.id

      const meal = await knex('meals')
        .where({
          id,
          user_id: userId,
        })
        .first()

      if (!meal) {
        return response.status(404).send({
          error: 'Meal not found!',
        })
      }

      return meal
    },
  )

  app.post(
    '/',
    {
      preHandler: [authenticate],
    },
    async (request, response) => {
      const mealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isDiet: z.boolean(),
      })

      const { name, description, isDiet } = mealBodySchema.parse(request.body)

      const userId = request.id

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        isDiet,
        user_id: userId,
      })

      return response.status(201).send()
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [authenticate],
    },
    async (request, response) => {
      const mealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = mealParamsSchema.parse(request.params)

      const mealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isDiet: z.boolean(),
        created_at: z.string(),
      })

      const { name, description, isDiet, created_at } = mealBodySchema.parse(
        request.body,
      )

      const userId = request.id

      await knex('meals')
        .where({
          id,
          user_id: userId,
        })
        .update({
          name,
          description,
          isDiet,
          created_at,
          updated_at: knex.fn.now(),
        })

      return response.status(201).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [authenticate],
    },
    async (request, response) => {
      const deleteParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = deleteParamsSchema.parse(request.params)

      const userId = request.id

      await knex('meals')
        .where({
          id,
          user_id: userId,
        })
        .delete()

      return response.status(200).send({
        menssage: 'Content deleted',
      })
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: [authenticate],
    },
    async (request, response) => {
      const userId = request.id

      const totalMeals = await knex('meals')
        .count('* as totalMeals')
        .where('user_id', userId)
        .first()

      const dietMeals = await knex('meals')
        .count('* as dietMeals')
        .where('user_id', userId)
        .andWhere('isDiet', true)
        .first()

      const nonDietMeals = await knex('meals')
        .count('* as nonDietMeals')
        .where('user_id', userId)
        .andWhere('isDiet', false)
        .first()

      const bestDietSequence = await knex('meals')
        .select(knex.raw('COUNT(*) as dietSequence, DATE(created_at) as date'))
        .where('user_id', userId)
        .andWhere('isDiet', true)
        .groupByRaw('DATE(created_at)')
        .orderBy('dietSequence', 'desc')
        .limit(1)
        .first()

      return response.status(200).send({
        totalMeals: totalMeals || 0,
        dietMeals: dietMeals || 0,
        nonDietMeals: nonDietMeals || 0,
        bestDietSequence: bestDietSequence || 0,
      })
    },
  )
}
