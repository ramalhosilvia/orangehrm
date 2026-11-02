import { employeePage as EmployeePage } from '../pages/EmployeePage'
import { loginPage as LoginPage } from '../pages/LoginPage'
import { generateEmployee, generateFutureDate } from '../support/utils/data-generators'


describe('Employee', () => {
    const username = Cypress.env('username')
    const password = Cypress.env('password')

    const today = new Date()
    const year = today.getFullYear()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const employeeIdentity = generateEmployee()

    const employeeInfos = {
        firstName: employeeIdentity.firstName,
        lastName: employeeIdentity.lastName,
        driversLicenseNumber: '123456789',
        licenseExpiryDate: generateFutureDate(30, 90),
        nationality: 'Dutch',
        maritalStatus: 'Single',
        dateOfBirth: '2002-01-05',
        gender: 'Male',
        joinedDate: `${year}-${day}-${month}`,
        jobTitle: 'IT Manager',
        jobCategory: 'Technicians',
        subUnit: 'Engineering',
        location: 'Canadian Regional HQ',
        employmentStatus: 'Part-Time Contract',
        contractStartDate: `${year}-${day}-${month}`,
        contractEndDate: generateFutureDate(30, 30),
        contractFile: 'cypress/fixtures/contract.pdf'

    }

    const login = () => {
        LoginPage.visit()
        LoginPage.loginSuccessfully(username, password)
    }

    it('should create an employee', () => {
        login()

        EmployeePage.selectNewEmployee();
        EmployeePage.fillEmployeeDetails(employeeInfos);
        EmployeePage.createNewEmployee();
        EmployeePage.assertEmployeeSaved();
        EmployeePage.captureEmployeeId(employeeInfos);
        EmployeePage.saveCreatedEmployee(employeeInfos);
        EmployeePage.selectNewEmployeeMenu();
        EmployeePage.searchNewEmployee(employeeInfos);
        EmployeePage.employeeSearchResult(employeeInfos)
    })

    it('should save updates to the employee’s personal and job details', () => {
        login()
        EmployeePage.loadCreatedEmployee(employeeInfos)
        EmployeePage.selectPIM()
        EmployeePage.searchNewEmployee(employeeInfos);      
        EmployeePage.employeeSearchResult(employeeInfos);        
        EmployeePage.openEmployeeInformation();        
        EmployeePage.editEmployeeInformation(employeeInfos)        
        EmployeePage.saveEmployeeInformation('Date of Birth')        
        EmployeePage.editJobInformationsEmployee(employeeInfos)        
        EmployeePage.saveEmployeeInformation('Joined Date')

    })

    it('should delete the created employee', () => {
        login()
        EmployeePage.loadCreatedEmployee(employeeInfos)
        EmployeePage.selectPIM()
        EmployeePage.searchNewEmployee(employeeInfos)
        EmployeePage.employeeSearchResult(employeeInfos)
        EmployeePage.deleteEmployee(employeeInfos)
        EmployeePage.searchNewEmployee(employeeInfos)
        EmployeePage.assertEmployeeDeleted()
    })

})