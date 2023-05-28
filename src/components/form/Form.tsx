import React, { useState, useContext, useId } from 'react'
import { useNavigate } from 'react-router-dom'
import classes from './Form.module.scss'
import { Note } from '../../types/NoteType'
import { EditHistory } from '../../types/EditHistoryType'
import { NotesContext } from '../../context/NoteContext'
import { getFullDate } from '../../constants/FullDate'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import formImg from '../../img/form.svg'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { useForm, SubmitHandler } from 'react-hook-form'
import { Heading } from '../ui/Heading'
import { UserData } from '../../types/UserDataType'

type Inputs = {
	readonly title: string
	readonly description: string
	readonly category: string
}

export const Form = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Inputs>()

	const [isFavourite, setIsFavourite] = useState(true)
	const [isPublish, setIsPublish] = useState(true)
	const [editHistory] = useState<EditHistory[]>([])
	const { addNote } = useContext(NotesContext)
	const navigate = useNavigate()
	const id = useId()
	const { fullDate } = getFullDate()
	const [userData, setUserData] = useState<UserData | null>(null)

	const onSubmitForm: SubmitHandler<Inputs> = (data) => {
		const NoteObj: Note = {
			id: id,
			author: userData?.nick,
			title: data.title,
			category: data.category,
			description: data.description,
			favourite: isFavourite,
			publish: isPublish,
			date: fullDate,
			descLength: data.description.length,
			editHistory: editHistory,
		}

		addNote(NoteObj)
		navigate('/notes')
	}

	return (
		<div className={classes.formWrapper}>
			<form className={classes.form} onSubmit={handleSubmit(onSubmitForm)}>
				<Heading paddingBottom={true} title='Create new note' />
				<div className={classes.formControl}>
					<label htmlFor='title'>Title</label>
					<input
						placeholder='Title'
						id='title'
						type='text'
						{...register('title', { required: true, minLength: 3, maxLength: 20 })}
					/>
					{errors.title && (
						<span className={classes.errorMessage}>
							<ErrorOutlineIcon />
							Title is required
						</span>
					)}
				</div>

				<div className={classes.formControl}>
					<label htmlFor='description'>Description</label>
					<textarea
						placeholder='Description'
						id='description'
						{...register('description', { required: true, minLength: 10 })}
					/>
					{errors.description && (
						<span className={classes.errorMessage}>
							<ErrorOutlineIcon /> Description is required
						</span>
					)}
				</div>

				<div className={classes.formControl}>
					<label htmlFor='category'>Category</label>
					<select {...register('category')} id='category'>
						<option value={'Coding'}>Coding</option>
						<option value={'Reminder'}>Reminder</option>
						<option value={'Hobby'}>Hobby</option>
						<option value={'Others'}>Others</option>
					</select>
				</div>

				<div className={classes.formControl}>
					<FormControlLabel
						control={
							<Checkbox
								defaultChecked
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsFavourite(e.target.checked)}
							/>
						}
						label={isFavourite ? 'Is favourite' : 'Not favourite'}
					/>
					
				</div>
				<div className={classes.formControl}>
					<FormControlLabel
						control={
							<Checkbox
								defaultChecked
								onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsPublish(e.target.checked)}
							/>
						}
						label={isPublish ? 'Public' : 'Private'}
					/>
					
				</div>
				<button type='submit'>Create new note</button>
			</form>

			<img src={formImg} alt='form' />
		</div>
	)
}
