import { loginPage as LoginPage } from '../pages/LoginPage'

const username = Cypress.env('username')
const password = Cypress.env('password')


describe('Login', () => {
  beforeEach(() => {
    LoginPage.visit()
    LoginPage.assertPageIsReady()
  })

  it('should allow login with valid credentials', () => {
    LoginPage.loginSuccessfully(username, password)
    LoginPage.assertOnDashboard()
  })

  describe('Failure scenarios', () => {
    it('should reject login when both username and password are invalid', () => {
      LoginPage.loginWith('usuario_invalido', 'senha_invalida')
      LoginPage.assertInvalidCredentials()
      LoginPage.assertStillOnLoginPage()
    })

    it('should reject login when the username is invalid and the password is valid', () => {
      LoginPage.loginWith('AdminInvalido', password)
      LoginPage.assertInvalidCredentials()
      LoginPage.assertStillOnLoginPage()
    })

    it('should reject login when the username is valid and the password is invalid', () => {
      LoginPage.loginWith(username, 'senha_errada_123')
      LoginPage.assertInvalidCredentials()
      LoginPage.assertStillOnLoginPage()
    })

    it('should display a required-field error when the username is empty', () => {
      LoginPage.loginWith('', password)
      LoginPage.assertUsernameRequired()
      LoginPage.assertStillOnLoginPage()
    })

    it('should display a required-field error when the password is empty', () => {
      LoginPage.loginWith(username, '')
      LoginPage.assertPasswordRequired()
      LoginPage.assertStillOnLoginPage()
    })

    it('should display required-field errors when both username and password are empty', () => {
      LoginPage.loginWith('', '')
      LoginPage.assertUsernameRequired()
      LoginPage.assertPasswordRequired()
      LoginPage.assertStillOnLoginPage()
    })


    it('should display required-field errors when both username and password contain only spaces', () => {
      LoginPage.loginWith('   ', '   ')
      LoginPage.assertUsernameRequired()
      LoginPage.assertPasswordRequired()
      LoginPage.assertStillOnLoginPage()
    })
  })
})