

const TEXTS = {
    //LOGIN_TITLES: ['Login', '登錄']
    OTHER_ID_LABEL: 'Other Id',
    DRIVERS_LICENSE_EMPLOYEE: "Driver's License Number",
    SUCCESS_MESSAGE_EMPLOYEE: 'Successfully Updated',
    SUCCESS_SAVED: 'Successfully Saved',
}



const CREATED_EMPLOYEE_PATH = 'cypress/fixtures/created-employee.json'

const SELECTORS = {
    PIM: 'a[href="/web/index.php/pim/viewPimModule"]',
    NEW_EMPLOYEE_BTN: '.orangehrm-header-container button[type="button"]',
    FIRST_NAME: 'input[name="firstName"]',
    LAST_NAME: 'input[name="lastName"]',
    SUBMIT_BTN: 'button[type="submit"]',
    EMPLOYEE_SEARCH_INPUT: 'input[placeholder="Type for hints..."]', //alterar nome
    EMPLOYEE_ID: '.oxd-input-group',
    SEARCH_EMPLOYEE_BTN: '.oxd-form-actions button[type="submit"]',
    RESULT_ROWS: '.oxd-table-body .oxd-table-row',
    RESULT_CELLS: '[role="cell"]',
    EDIT_EMPLOYEE_BTN: 'i.bi-pencil-fill',
    DELETE_EMPLOYEE_BTN: 'i.bi-trash',
    MIDDLE_NAME_EMPLOYEE: 'input[name="middleName"]',
    INPUT_GROUP_EMPLOYEE: '.oxd-input-group',
    JOB_TAB: 'a[href*="/pim/viewJobDetails/empNumber/"]',
    EMERGENCY_CONTACTS_TAB: 'a[href*="/pim/viewEmergencyContacts/empNumber/"]',

}

class EmployeePage {
    selectNewEmployee() {
        cy.get(SELECTORS.PIM).click()
        cy.get(SELECTORS.NEW_EMPLOYEE_BTN).click()
    }

    selectPIM() {
        cy.get(SELECTORS.PIM).click()

    }

    selectNewEmployeeMenu() {
        cy.get('.oxd-topbar-body-nav').contains('Employee List').click()
        cy.location('pathname', { timeout: 20000 }).should('include', '/pim/viewEmployeeList')
        cy.contains('button', 'Search').should('be.visible')
    }

    fillEmployeeDetails(employee) {
        cy.get(SELECTORS.FIRST_NAME).clear().type(employee.firstName)
        cy.get(SELECTORS.LAST_NAME).clear().type(employee.lastName)

        if (employee.id) {
            cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Employee Id')
                .find('input')
                .clear()
                .type(employee.id)
        }
    }

    createNewEmployee() {
        cy.get(SELECTORS.SUBMIT_BTN).click()
    }

    assertEmployeeSaved() {
        cy.location('pathname', { timeout: 20000 }).should(
            'include',
            '/pim/viewPersonalDetails'
        )
        cy.get(SELECTORS.FIRST_NAME).should('be.visible')
    }

    createEmployee(employee) {
        this.selectNewEmployee()
        this.fillEmployeeDetails(employee)
        this.createNewEmployee()
        this.assertEmployeeSaved()
    }

    captureEmployeeId(employee) {
        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Employee Id')
            .find('input')
            .should('be.visible')
            .invoke('val')
            .should('match', /\S/)
            .then((id) => {
                employee.id = String(id).trim()
            })
    }

    saveCreatedEmployee(employee, filePath = CREATED_EMPLOYEE_PATH) {
        cy.then(() => {
            const record = {
                firstName: employee.firstName,
                lastName: employee.lastName,
                id: employee.id,
            }

            if (employee.mobile) {
                record.mobile = employee.mobile
            }

            expect(record.firstName, 'first name').to.be.a('string').and.not.be.empty
            expect(record.lastName, 'last name').to.be.a('string').and.not.be.empty
            expect(record.id, 'employee id gerado pela plataforma').to.be.a('string').and.not.be.empty

            cy.writeFile(filePath, record)
        })
    }

    loadCreatedEmployee(employee, filePath = CREATED_EMPLOYEE_PATH) {
        cy.readFile(filePath).then((record) => {
            employee.firstName = record.firstName
            employee.lastName = record.lastName
            employee.id = String(record.id).trim()

            if (record.mobile) {
                employee.mobile = record.mobile
            }
        })
    }

    addEmergencyContact(contact) {
        cy.get(SELECTORS.EMERGENCY_CONTACTS_TAB).click()
        cy.contains('h6', 'Assigned Emergency Contacts').should('be.visible')
        cy.contains('button', 'Add').click()

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Name')
            .find('input')
            .clear()
            .type(contact.emergencyContactName)
        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Relationship')
            .find('input')
            .clear()
            .type(contact.relationship)
        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Mobile')
            .find('input')
            .clear()
            .type(contact.mobile)

        cy.contains('button', 'Save').click()
        cy.contains('.oxd-toast', 'Successfully Saved').should('be.visible')
        cy.contains('.oxd-table-body', contact.mobile).should('be.visible')
    }

    searchNewEmployee(employee) {
        
        cy.then(() => {
            cy.contains('.oxd-input-group', 'Employee Name')
                .find('input')
                .clear()
                .type(employee.firstName)
            cy.contains('.oxd-input-group', 'Employee Id')
                .find('input')
                .clear()
                .type(employee.id)
        })

        cy.get(SELECTORS.SEARCH_EMPLOYEE_BTN).click()
        cy.get('.oxd-table-loader', { timeout: 15000 }).should('not.exist')
    }

    employeeSearchResult(employee) {
        cy.get(`${SELECTORS.RESULT_ROWS} ${SELECTORS.RESULT_CELLS}`, { timeout: 15000 })
            .should(($cells) => {
                expect($cells.eq(1).text().trim(), 'Employee ID')
                    .to.equal(employee.id)

                const firstAndMiddle = $cells.eq(2).text().trim()
                expect(firstAndMiddle, 'First (& Middle) Name')
                    .to.match(new RegExp(`^${employee.firstName}(?:\\s|$)`))

                expect($cells.eq(3).text().trim(), 'Last name')
                    .to.equal(employee.lastName)
            })
    }

    openEmployeeInformation() {
        cy.get(SELECTORS.EDIT_EMPLOYEE_BTN).click();
    }

    editEmployeeInformation(employee) {
        //Insere nome do meio
        cy.get(SELECTORS.MIDDLE_NAME_EMPLOYEE).type('John');

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, TEXTS.OTHER_ID_LABEL)
            .find('input')
            .clear()
            .type('1234')


        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, "Driver's License Number")
            .find('input')
            .clear()
            .type(employee.driversLicenseNumber)

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'License Expiry Date')
            .find('input')
            .clear()
            .type(employee.licenseExpiryDate)
            .blur()
            .should('have.value', employee.licenseExpiryDate)

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Nationality')
            .find('.oxd-select-text')
            .click()

        cy.get('[role="listbox"]')
            .contains('[role="option"]', /^\s*Dutch\s*$/)
            .click()
      
        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Nationality')
            .find('.oxd-select-text-input')
            .should('have.text', employee.nationality)

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Marital Status')
            .find('.oxd-select-text')
            .click()
      
        cy.get('[role="listbox"]')
            .contains('[role="option"]', /^\s*Single\s*$/)
            .click()
       
        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Marital Status')
            .find('.oxd-select-text-input')
            .should('have.text', employee.maritalStatus)


        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Date of Birth')
            .find('input')
            .clear()
            .type(employee.dateOfBirth)
            .should('have.value', employee.dateOfBirth)

        cy.contains('.oxd-radio-wrapper label', employee.gender)
            .click()

        cy.contains('.oxd-radio-wrapper label', employee.gender)
            .find('input[type="radio"]')
            .should('be.checked')

    }
    
    saveEmployeeInformation(fieldLabel) {
        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, fieldLabel)
            .closest('form')
            .find('button[type="submit"]')
            .should('have.length', 1)
            .click()
       
        cy.contains('Successfully Updated')
            .should('be.visible')
    }

    
    editJobInformationsEmployee(employee) {
      
        cy.get(SELECTORS.JOB_TAB).click()  

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Joined Date')
            .find('input')
            .clear()
            .type(employee.joinedDate)
            .blur()

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Job Title')
            .find('.oxd-select-text')
            .click()

        cy.get('[role="listbox"]')
            .contains('[role="option"]', employee.jobTitle)
            .click()

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Job Title')
            .find('.oxd-select-text-input')
            .should('have.text', employee.jobTitle)

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Job Category')
            .find('.oxd-select-text')
            .click()

        cy.get('[role="listbox"]')
            .contains('[role="option"]', employee.jobCategory)
            .click()

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Job Category')
            .find('.oxd-select-text-input')
            .should('have.text', employee.jobCategory)

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Sub Unit')
            .find('.oxd-select-text')
            .click()

        cy.get('[role="listbox"]')
            .contains('[role="option"]', employee.subUnit)
            .click()
    
        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Sub Unit')
            .find('.oxd-select-text-input')
            .should('have.text', employee.subUnit)


        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Location')
            .find('.oxd-select-text')
            .click()

        cy.get('[role="listbox"]')
            .contains('[role="option"]', employee.location)
            .click()

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Location')
            .find('.oxd-select-text-input')
            .should('have.text', employee.location)

        cy.contains('.user-form-header', 'Include Employment Contract Details')
            .find('input[type="checkbox"]')
            .check({ force: true })
            .should('be.checked')

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Contract Start Date')
            .find('input')
            .clear()
            .type(employee.contractStartDate)
            .blur()

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Contract Start Date')
            .find('input')
            .should('have.value', employee.contractStartDate)

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Contract End Date')
            .find('input')
            .clear()
            .type(employee.contractEndDate)
            .blur()

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Contract End Date')
            .find('input')
            .should('have.value', employee.contractEndDate)

        const contractFileName = employee.contractFile.split('/').pop()

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Contract Details')
            .find('input[type="file"]')
            .selectFile(employee.contractFile, { force: true })

        cy.contains(SELECTORS.INPUT_GROUP_EMPLOYEE, 'Contract Details')
            .find('.oxd-file-input-div')
            .should('contain.text', contractFileName)

    }

    deleteEmployee(employee) {
        cy.then(() => {
            cy.contains(`${SELECTORS.RESULT_ROWS} ${SELECTORS.RESULT_CELLS}`, employee.id)
                .parents('.oxd-table-row')
                .find(SELECTORS.DELETE_EMPLOYEE_BTN)
                .click()
        })

        cy.contains('button', 'Yes, Delete').click()
        cy.contains('Successfully Deleted').should('be.visible')
    }

    assertEmployeeDeleted() {
        cy.contains('No Records Found', { timeout: 15000 }).should('be.visible')
    }
}


export const employeePage = new EmployeePage()
export default employeePage