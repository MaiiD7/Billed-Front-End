/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"
import { ROUTES_PATH } from "../constants/routes.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form should be displayed", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    })

    test("Then the file in form should be handled", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const store = mockStore;

      const newBillMock = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage
      });

      // const blob = new Blob();
      const file1 = new File(['content'], 'values.json', {
        type: 'application/JSON',
      });
      const file2 = new File(['content'], 'image.jpg', {
        type: 'image/jpg',
      });

      const handleFile = jest.fn(newBillMock.handleChangeFile)
      const input = document.querySelector(`input[data-testid="file"]`)
      input.addEventListener("change", handleFile)
      
      fireEvent.change(input, {target: {files : [file1]}})
      expect(handleFile).toHaveBeenCalled();
      expect(document.getElementById('extensionMsg').classList.contains('hidden')).toBeFalsy();

      fireEvent.change(input, {target: {files : [file2]}})
      expect(handleFile).toHaveBeenCalled();
      expect(document.getElementById('extensionMsg').classList.contains('hidden')).toBeTruthy();
    })

    test("Then submit should be handled", () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })

      const onNavigate = (pathname) => {
        document.body.innerHTML = pathname;
      };

      const store = mockStore;

      const newBillMock = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage
      });

      const handleSubmit = jest.fn(newBillMock.handleSubmit)
      const updateB = jest.fn(newBillMock.updateBill)
      const formNewBill = document.querySelector(`form[data-testid="form-new-bill"]`)
      formNewBill.addEventListener("submit", handleSubmit)
      
      fireEvent.submit(formNewBill)
      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})


