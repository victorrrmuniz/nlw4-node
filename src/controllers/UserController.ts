
import { Request, Response } from 'express'
import { getCustomRepository } from 'typeorm'
import { UsersRepository } from '../repositories/UsersRepository'
import * as yup from 'yup'
import { AppErrors } from '../errors/AppErrors'

class UserController {

	async create(request: Request, response: Response) {
		const { name, email } = request.body

		const schema = yup.object().shape({
			name: yup.string().required(),
			email: yup.string().email().required()
		})

		// if(!(await schema.isValid(request.body))) {
		// 	return response.status(400).json({
		// 		erro: 'Validation Failed!'
		// 	})
		// }

		try{
			await schema.validate(request.body, { abortEarly: false })
		} catch(err) {
			throw new AppErrors(err)
		}

		const usersRepository = getCustomRepository(UsersRepository)

		const userAlreadyExists = await usersRepository.findOne({
			email
		})

		if(userAlreadyExists){
			throw new AppErrors('User already exists')
		}

		const user = usersRepository.create({
			name, email
		})

		await usersRepository.save(user)

		return response.status(201).send(user)
	}
}

export { UserController }
