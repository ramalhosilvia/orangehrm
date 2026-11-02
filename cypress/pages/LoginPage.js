const TEXTS = {
    LOGIN_TITLE: 'Login',
    INVALID_CREDENTIALS: 'Invalid credentials',
    ACCOUNT_DISABLED: 'Account disabled',
    REQUIRED: 'Required',
}

const URLS = {
    LOGIN_PATH: '/web/index.php/auth/login',
    DASHBOARD_PATH: '/web/index.php/dashboard/index',
}

const SELECTORS = {
    LOGIN_TITLE: '.orangehrm-login-title',
    USERNAME: 'input[name="username"]',
    PASSWORD: 'input[name="password"]',
    LOGIN_BUTTON: 'button[type="submit"]',
    ALERT_ERROR: '.oxd-alert-content-text',
    FIELD_ERROR: '.oxd-input-field-error-message',
    USER_DROPDOWN: '.oxd-userdropdown-tab',
    LOGOUT_LINK: 'a.oxd-userdropdown-link',
}

class LoginPage {
    clearSession() {
        cy.clearAllCookies()
        cy.clearAllLocalStorage()
        cy.clearAllSessionStorage()
    }

    visit() {
        this.clearSession()

        cy.visit('/', {
            timeout: 100000,
            failOnStatusCode: false,
        })

        cy.location('pathname').should('eq', URLS.LOGIN_PATH)
    }

    assertPageIsReady() {
        cy.get(SELECTORS.LOGIN_TITLE)
            .should('be.visible')
            .invoke('text')
            .invoke('trim')
            .should('equal', TEXTS.LOGIN_TITLE)
    }

    fillUsername(username) {
        if (username) {
            cy.get(SELECTORS.USERNAME).clear().type(username)
        } else {
            cy.get(SELECTORS.USERNAME).clear()
        }
    }

    fillPassword(password) {
        if (password) {
            cy.get(SELECTORS.PASSWORD).clear().type(password, { log: false })
        } else {
            cy.get(SELECTORS.PASSWORD).clear()
        }
    }

    clickLogin() {
        cy.get(SELECTORS.LOGIN_BUTTON).click()
    }

    loginSuccessfully(username, password) {
        this.fillUsername(username)
        this.fillPassword(password)
        this.clickLogin()
        this.assertLoggedIn()
    }

    loginWith(username, password) {
        this.fillUsername(username)
        this.fillPassword(password)
        this.clickLogin()
    }

    logout() {
        cy.get(SELECTORS.USER_DROPDOWN).click()
        cy.contains(SELECTORS.LOGOUT_LINK, 'Logout').click()
        cy.location('pathname').should('eq', URLS.LOGIN_PATH)
        this.assertPageIsReady()
        this.clearSession()
    }

    assertInvalidCredentials() {
        cy.get(SELECTORS.ALERT_ERROR)
            .should('be.visible')
            .and('contain.text', TEXTS.INVALID_CREDENTIALS)
    }

    assertAccountDisabled() {
        cy.get(SELECTORS.ALERT_ERROR)
            .should('be.visible')
            .invoke('text')
            .then((text) => {
                expect(
                    text.trim().toLowerCase(),
                    'mensagem de conta desabilitada'
                ).to.include('disabled')
            })
    }

    assertUsernameRequired() {
        cy.get(SELECTORS.USERNAME)
            .parents('.oxd-input-group')
            .find(SELECTORS.FIELD_ERROR)
            .should('be.visible')
            .and('have.text', TEXTS.REQUIRED)
    }

    assertPasswordRequired() {
        cy.get(SELECTORS.PASSWORD)
            .parents('.oxd-input-group')
            .find(SELECTORS.FIELD_ERROR)
            .should('be.visible')
            .and('have.text', TEXTS.REQUIRED)
    }

    assertStillOnLoginPage() {
        cy.location('pathname').should('eq', URLS.LOGIN_PATH)
        cy.get(SELECTORS.LOGIN_TITLE).should('be.visible')
    }

    assertLoggedIn() {
        cy.get(SELECTORS.USER_DROPDOWN, { timeout: 20000 }).should('be.visible')
        cy.location('pathname').should('not.include', '/auth/login')
    }

    assertOnDashboard() {
        cy.location('pathname', { timeout: 20000 }).should(
            'eq',
            URLS.DASHBOARD_PATH
        )
    }
}

export const loginPage = new LoginPage()
export default loginPage
