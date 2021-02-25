
import { Request, Response } from 'express'
import { getCustomRepository } from 'typeorm'
import { SurveysRepository } from '../repositories/SurveysRepository'

class SurveysController {
	async create(request: Request, resposne: Response) {
		const { title, description } = request.body

		const surveyRepository = getCustomRepository(SurveysRepository)

		const survey = surveyRepository.create({
			title,
			description
		})

		await surveyRepository.save(survey)

		return resposne.status(201).json(survey)
	}

	async show(request: Request, response: Response) {
		const surveysRepository = getCustomRepository(SurveysRepository)

		const all = await surveysRepository.find()

		return response.json(all)
	}
}

export { SurveysController }