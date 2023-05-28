import React, { useContext, useEffect } from 'react'
import classes from './Nav.module.scss'
import { NavLink } from 'react-router-dom'
import { NotesContext } from '../../context/NoteContext'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AddIcon from '@mui/icons-material/Add'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import Groups2Icon from '@mui/icons-material/Groups2'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { Backdrop } from '../ui/Backdrop'
import PermIdentityIcon from '@mui/icons-material/PermIdentity'
import Diversity1Icon from '@mui/icons-material/Diversity1'
import LogoutIcon from '@mui/icons-material/Logout'
import { NavigationLink } from './NavLink'
import Typography from '@mui/material/Typography'
import { AuthContext } from '../../context/AuthContext'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Logo from '../../img/Logo.png'
import { useToggle } from '../../hooks/useToggle'

const getTheme = () => {
	const theme = localStorage.getItem('theme')
	return {
		localTheme: theme ? JSON.parse(theme) : null,
	}
}

export const Nav = () => {
	const [hiddenNav, setHiddenNav] = useToggle()
	const { notes, trashNotes, favouriteNotes } = useContext(NotesContext)
	const { isLoggedIn, logout } = useContext(AuthContext)
	const { localTheme: themeState } = getTheme()
	const [theme, setTheme] = useToggle(themeState)

	useEffect(() => {
		localStorage.setItem('theme', JSON.stringify(theme))

		theme ? document.body.classList.add('light-mode') : document.body.classList.remove('light-mode')
	}, [theme])

	return (
		<>
			<nav onDoubleClick={setHiddenNav} className={`${classes.nav} ${!hiddenNav ? classes.hiddenNav : ''}`}>
				<button onClick={setHiddenNav} className={`${classes.hideButton} ${!hiddenNav ? classes.toggledArrow : ''}`}>
					<ArrowForwardIcon className={`${!hiddenNav ? classes.toggledArrow : ''}`} />
				</button>
				<div className={classes.navWrapper}>
					<NavLink to='/' className={classes.logo}>
						{!hiddenNav ? (
							<img src={Logo} alt='incourtMike' style={{ width: '70%', height: 'auto'}} />
						) : (
							<div className={classes.fullLogo}>
							<img src={Logo} alt='incourtMike' style={{ width: '40%', height: 'auto' }} />
							<h2>Inkwell</h2>
							</div>
						)}
					</NavLink>

					<div className={classes.links}>
						<NavigationLink
							hiddenNav={!hiddenNav}
							title='Create new'
							href='/create'
							icon={<AddIcon className={classes.icon} />}
							tooltipTitle={<Typography fontSize={11}>Create</Typography>}
						/>

						<NavigationLink
							hiddenNav={!hiddenNav}
							title='Notes'
							href='/notes'
							elementsLength={notes.length}
							icon={<FormatListBulletedIcon className={classes.icon} />}
							tooltipTitle={<Typography fontSize={11}>Notes</Typography>}
						/>

						<NavigationLink
							hiddenNav={!hiddenNav}
							title='Trash'
							href='/trash'
							elementsLength={trashNotes.length}
							icon={<DeleteOutlineIcon className={classes.icon} />}
							tooltipTitle={<Typography fontSize={11}>Trash</Typography>}
						/>

						<NavigationLink
							hiddenNav={!hiddenNav}
							title='Favourite'
							href='/favourite'
							elementsLength={favouriteNotes.length}
							icon={<FavoriteBorderIcon className={classes.icon} />}
							tooltipTitle={<Typography fontSize={11}>Favourite</Typography>}
						/>
						{isLoggedIn ? (
							<NavigationLink
								title='Account'
								hiddenNav={!hiddenNav}
								href='/user'
								icon={<PermIdentityIcon className={classes.icon} />}
								tooltipTitle={<Typography fontSize={11}>Account</Typography>}
							/>
						) : (
							<NavigationLink
								title='Login'
								hiddenNav={!hiddenNav}
								href='/login'
								icon={<PermIdentityIcon className={classes.icon} />}
								tooltipTitle={<Typography fontSize={11}>Login</Typography>}>
								{!isLoggedIn && <span className={classes.loginMark}>Login!</span>}
							</NavigationLink>
						)}

						{isLoggedIn && (
							<>
								<NavigationLink
									title='Users'
									hiddenNav={!hiddenNav}
									href='/users'
									icon={<Groups2Icon className={classes.icon} />}
									tooltipTitle={<Typography fontSize={11}>Users</Typography>}></NavigationLink>

								<NavigationLink
									title='Friends'
									hiddenNav={!hiddenNav}
									href='/friends'
									icon={<Diversity1Icon className={classes.icon} />}
									tooltipTitle={<Typography fontSize={11}>Friends</Typography>}></NavigationLink>

								<NavigationLink
									onClick={logout}
									hiddenNav={!hiddenNav}
									title='Logout'
									href='/login'
									icon={<LogoutIcon className={classes.icon} />}
									tooltipTitle={<Typography fontSize={11}>Logout</Typography>}
								/>
							</>
						)}

						<FormControlLabel
							control={<Switch onClick={setTheme} checked={!theme} />}
							label={
								<Typography
									className={!hiddenNav ? classes.hiddenLinkTitle : ''}
									sx={{ color: 'var(--grey-color)', paddingLeft: '0.1rem' }}
									fontSize={17.68}>
									{theme ? 'Light mode' : 'Dark mode'}
								</Typography>
							}
						/>
					</div>
				</div>
			</nav>
			{hiddenNav && <Backdrop onHideNav={setHiddenNav} />}
		</>
	)
}
