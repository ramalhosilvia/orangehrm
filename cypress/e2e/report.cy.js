import { employeePage as EmployeePage } from '../pages/EmployeePage'
import { loginPage as LoginPage } from '../pages/LoginPage'
import { reportPage as ReportPage } from '../pages/ReportPage'
import { generateEmployee } from '../support/utils/data-generators'

const REPORT_EMPLOYEE_PATH = 'cypress/fixtures/report-employee.json'

describe('Report', () => {
    const username = Cypress.env('username')
    const password = Cypress.env('password')
    const employeeIdentity = generateEmployee()

    const employee = {
        firstName: employeeIdentity.firstName,
        lastName: employeeIdentity.lastName,
        emergencyContactName: 'Alex Contact',
        relationship: 'Spouse',
        mobile: `119${Date.now().toString().slice(-8)}`,
    }

    const report = {
        name: `Mobile ${Date.now().toString(36)}`,
        employee,
    }

    const login = () => {
        LoginPage.visit()
        LoginPage.loginSuccessfully(username, password)
    }

    it('should create an employee with an emergency mobile number', () => {
        login()

        EmployeePage.selectNewEmployee()
        EmployeePage.fillEmployeeDetails(employee)
        EmployeePage.createNewEmployee()
        EmployeePage.assertEmployeeSaved()
        EmployeePage.captureEmployeeId(employee)
        EmployeePage.saveCreatedEmployee(employee, REPORT_EMPLOYEE_PATH)
        EmployeePage.addEmergencyContact(employee)
    })

    it('should create a report and display the employee’s emergency mobile number in the report', () => {
        login()
        EmployeePage.loadCreatedEmployee(employee, REPORT_EMPLOYEE_PATH)

        ReportPage.createEmergencyMobileReport(report)
        ReportPage.assertReportMobile(employee.mobile)
    })

    it('should delete the report', () => {
        login()
        ReportPage.deleteReport(report.name)
        ReportPage.assertReportDeleted(report.name)
    })

    it('should delete the employee created for the report', () => {
        login()
        EmployeePage.loadCreatedEmployee(employee, REPORT_EMPLOYEE_PATH)

        EmployeePage.selectPIM()
        EmployeePage.searchNewEmployee(employee)
        EmployeePage.employeeSearchResult(employee)
        EmployeePage.deleteEmployee(employee)
        EmployeePage.searchNewEmployee(employee)
        EmployeePage.assertEmployeeDeleted()
    })
})
