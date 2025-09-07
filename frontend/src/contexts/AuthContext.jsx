import { createContext } from 'react'

const AuthContext = createContext({
	currentUser: null,
	login: () => {},
	logout: () => {}
})

export default AuthContext

