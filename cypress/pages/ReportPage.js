const URLS = {
    REPORTS: '/web/index.php/pim/viewDefinedPredefinedReports',
}

const TEXTS = {
    SUCCESS_SAVED: 'Successfully Saved',
    INCLUDE_CURRENT: 'Current Employees Only',
    FIELD_GROUP: 'Emergency Contacts',
    FIELD: 'Mobile',
}

const SELECTORS = {
    INPUT_GROUP: '.oxd-input-group',
    SELECT_TEXT: '.oxd-select-text',
    SELECT_OPTION: '[role="listbox"] [role="option"]',
    AUTOCOMPLETE_OPTION: '.oxd-autocomplete-dropdown .oxd-autocomplete-option',
    RESULT_ROWS: '.oxd-table-body .oxd-table-row',
    RESULT_CELLS: '[role="cell"]',
    TOAST: '.oxd-toast',
    SEARCH_BUTTON: '.oxd-form-actions button[type="submit"]',
}

class ReportPage {
    visit() {
        cy.visit(URLS.REPORTS, {
            timeout: 100000,
            failOnStatusCode: false,
        })
        cy.location('pathname').should('include', '/pim/viewDefinedPredefinedReports')
        cy.contains('button', 'Add').should('be.visible')
    }

    groupByLabel(label) {
        return cy.get(SELECTORS.INPUT_GROUP).filter((_, el) => {
            const text = el.querySelector('.oxd-label')?.innerText || ''
            return text.replace(/\*/g, '').trim() === label
        })
    }

    selectDropdown(label, optionText) {
        this.groupByLabel(label).find(SELECTORS.SELECT_TEXT).click()

        cy.get(SELECTORS.SELECT_OPTION, { timeout: 15000 })
            .contains(new RegExp(`^\\s*${optionText}\\s*$`))
            .click()

        this.groupByLabel(label)
            .find('.oxd-select-text-input')
            .should('have.text', optionText)
    }

    clickPlus(index) {
        cy.get('form i.bi-plus').eq(index).closest('button').click()
    }

    addEmployeeNameCriterion(employee) {
        this.selectDropdown('Selection Criteria', 'Employee Name')
        this.clickPlus(0)

        const fullName = `${employee.firstName} ${employee.lastName}`

        cy.intercept('GET', '**/api/v2/pim/employees*').as('reportEmployeeSearch')

        this.groupByLabel('Employee Name')
            .find('input')
            .clear()
            .type(fullName, { delay: 40 })

        cy.wait('@reportEmployeeSearch', { timeout: 20000 })

        cy.contains(SELECTORS.AUTOCOMPLETE_OPTION, employee.lastName, { timeout: 15000 })
            .should('be.visible')
            .and('contain.text', employee.firstName)
            .click()

        this.groupByLabel('Employee Name')
            .find('input')
            .should('include.value', employee.firstName)
            .and('include.value', employee.lastName)
    }

    addDisplayField(group, field) {
        this.selectDropdown('Select Display Field Group', group)
        this.selectDropdown('Select Display Field', field)
        this.clickPlus(1)

        cy.contains('Include Header', { timeout: 10000 })
            .closest('.oxd-form-row')
            .should('be.visible')
            .and('contain.text', group)
            .and('contain.text', field)
    }

    fillReport(report) {
        this.groupByLabel('Report Name')
            .find('input')
            .clear()
            .type(report.name)

        this.addEmployeeNameCriterion(report.employee)
        this.selectDropdown('Include', TEXTS.INCLUDE_CURRENT)
        this.addDisplayField(TEXTS.FIELD_GROUP, TEXTS.FIELD)
    }

    saveReport() {
        cy.get('button[type="submit"]').click()
        cy.contains(SELECTORS.TOAST, TEXTS.SUCCESS_SAVED, { timeout: 20000 }).should('be.visible')
        cy.location('pathname', { timeout: 20000 }).should(
            'match',
            /\/pim\/(viewDefinedPredefinedReports|displayPredefinedReport)/
        )
    }

    clickAddReport() {
        cy.contains('button', 'Add').click()
        cy.contains('h6', 'Add Report').should('be.visible')
    }

    createEmergencyMobileReport(report) {
        this.visit()
        this.clickAddReport()
        this.fillReport(report)
        this.saveReport()
    }

    searchReportByName(name) {
        this.visit()
        this.groupByLabel('Report Name')
            .find('input')
            .clear()
            .type(name)

        cy.get(SELECTORS.SEARCH_BUTTON).click()
        cy.get('.oxd-table-loader', { timeout: 15000 }).should('not.exist')
    }

    searchReport(name) {
        this.searchReportByName(name)
        cy.contains(SELECTORS.RESULT_ROWS, name, { timeout: 15000 }).should('be.visible')
    }

    deleteReport(name) {
        this.searchReport(name)
        cy.contains(SELECTORS.RESULT_ROWS, name)
            .find('i.bi-trash')
            .click()

        cy.contains('button', 'Yes, Delete').click()
        cy.contains('Successfully Deleted').should('be.visible')
    }

    assertReportDeleted(name) {
        this.visit()
        cy.contains(/Records Found/, { timeout: 15000 }).should('be.visible')
        cy.get('.oxd-table-card').should('not.contain', name)
    }

    runReport(name) {
        cy.contains(SELECTORS.RESULT_ROWS, name, { timeout: 15000 })
            .find('i[class*="file-text"], i.bi-play-fill, i.bi-caret-right-fill')
            .first()
            .click()
    }

    assertReportMobile(mobile) {
        cy.contains(/Record Found/, { timeout: 20000 })
            .should('be.visible')
            .invoke('text')
            .should('match', /\([1-9]\d*\) Record/)
        cy.location('pathname').should('include', '/pim/displayPredefinedReport')

        const previousShadowDom = Cypress.config('includeShadowDom')
        Cypress.config('includeShadowDom', true)

        cy.get('.rgHeaderCell', { timeout: 20000 }).should(($headers) => {
            const headers = [...$headers].map((header) => header.innerText.trim())
            expect(headers, 'coluna Mobile').to.include('Mobile')
        })

        cy.get('.rgHeaderCell').then(($headers) => {
            const headers = [...$headers].map((header) => header.innerText.trim())
            const index = headers.indexOf('Mobile')

            cy.get('.rgCell').then(($cells) => {
                const cellText = $cells.get(index)?.innerText || ''
                const lines = cellText.split('\n').map((line) => line.trim()).filter(Boolean)
                expect(lines[0], `celula: ${JSON.stringify(cellText)}`).to.equal(mobile)
                Cypress.config('includeShadowDom', previousShadowDom)
            })
        })
    }
}

export const reportPage = new ReportPage()
export default reportPage
