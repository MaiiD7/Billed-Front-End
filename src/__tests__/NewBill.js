/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import router from "../app/Router"

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    let newBillMock = '';
    beforeEach(() => {
      const html = NewBillUI()
      document.body.innerHTML = html

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const store = mockStore;

      newBillMock = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage
      });
    })
    test("Then the form should be displayed", () => {
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    })

    test("Then the file in form should be handled", () => {

      const handleFile = jest.fn(newBillMock.handleChangeFile)
      const input = document.querySelector(`input[data-testid="file"]`)
      input.addEventListener("change", handleFile)

      const file1 = new File(['content'], 'values.json', {
        type: 'application/JSON',
      });
      const file2 = new File(['content'], 'image.jpg', {
        type: 'image/jpg',
      });
      
      fireEvent.change(input, {target: {files : [file1]}})
      expect(handleFile).toHaveBeenCalled();
      expect(document.getElementById('extensionMsg').classList.contains('hidden')).toBeFalsy();

      fireEvent.change(input, {target: {files : [file2]}})
      expect(handleFile).toHaveBeenCalled();
      expect(document.getElementById('extensionMsg').classList.contains('hidden')).toBeTruthy();

    })

    test("Then submit should be handled", () => {
      
      const handleSubmit = jest.fn(newBillMock.handleSubmit)
      const updateB = jest.fn(newBillMock.updateBill)
      const formNewBill = document.querySelector(`form[data-testid="form-new-bill"]`)
      formNewBill.addEventListener("submit", handleSubmit)
      
      fireEvent.submit(formNewBill)
      expect(handleSubmit).toHaveBeenCalled();
      expect(screen.queryByText("Mes notes de frais")).toBeTruthy()
    })

    // test d'intégration POST
    describe("When I submit a new bill", () => {
      test("Then a bill should be created", async () => {
        const bill = {};
        const mockedPromise = await mockStore.bills().create(bill);

        expect(mockedPromise.fileUrl === 'https://localhost:3456/images/test.jpg').toBeTruthy();
        expect(mockedPromise.key === '1234').toBeTruthy();
      })

      test("Then user is redirected to Bills if bill is updated and sent succesfully", () => {
        const bill ={}

        const updateBillMock = jest.fn(newBillMock.updateBill)
        const formNewBill = document.querySelector(`form[data-testid="form-new-bill"]`)
        formNewBill.addEventListener("submit", updateBillMock(bill))
        fireEvent.submit(formNewBill)

        expect(screen.queryByText("Mes notes de frais")).toBeTruthy();
        expect(screen.queryByText("Envoyer une note de frais")).toBeFalsy();
      })
      describe("When an error occurs on API", () => {
        test("fails with 404 message error", async () => {

          const error = new Error('Error 404')
          document.body.innerHTML = BillsUI({ data: bills, error })
          expect(screen.queryByText('Error: Error 404')).toBeTruthy()
        })
    
        test("fails with 500 message error", async () => {
    
          const error = new Error('Error 500')
          document.body.innerHTML = BillsUI({ data: bills, error })
          expect(screen.queryByText('Error: Error 500')).toBeTruthy()
        })
      })
    })
  })
})