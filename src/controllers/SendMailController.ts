import { Request, Response } from 'express'
import { getCustomRepository } from 'typeorm'
import { SurveyUser } from '../models/SurveyUser'
import { SurveysRepository } from '../repositories/SurveysRepository'
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository'
import { UsersRepository } from '../repositories/UsersRepository'
import SendMailService from '../services/SendMailService'
import { resolve } from 'path'
import { AppErrors } from '../errors/AppErrors'

class SendMailController {
		async execute(request: Request, response: Response) {
			const { email, survey_id } = request.body
			
			const usersRepository = getCustomRepository(UsersRepository)
			const surveysRespository = getCustomRepository(SurveysRepository)
			const surveysUsersRepository = getCustomRepository(SurveysUsersRepository)

			const user = await usersRepository.findOne({email})

			if(!user) {
				throw new AppErrors('User does not exists')
			}
			
			const survey = await surveysRespository.findOne({id: survey_id})

			if(!survey) {
				throw new AppErrors('Survey does not exists')
			}

			const surveyUserAlreadyExists = await surveysUsersRepository.findOne({ 
				where: {user_id: user.id, value: null},
				relations: ['user', 'survey']
			})
			
			const variables = {
				name: user.name,
				title: survey.title,
				description: survey.description,
				id: '',
				link: process.env.URL_MAIL
			}
			
			const npsPath = resolve(__dirname, '..', 'views', 'emails', 'npsMail.hbs')

			 if(surveyUserAlreadyExists){
				 variables.id = surveyUserAlreadyExists.id
				 await SendMailService.execute(email, survey.title, variables, npsPath)
				 return response.json(surveyUserAlreadyExists)
			 }

			//Salvar as informacoes na tabela surveyUser
			const surveyUser = surveysUsersRepository.create({
				user_id: user.id,
				survey_id
			})

			
			await surveysUsersRepository.save(surveyUser)
			// Enviar e-mail para o usuário
			
			variables.id = surveyUser.id

			await SendMailService.execute(email, survey.title, variables, npsPath)

			return response.json(surveyUser)
		}
}

export { SendMailController }