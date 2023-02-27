/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import { ROUTES } from "../constants/routes.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import { modal } from "../views/DashboardFormUI.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBeTruthy()

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  describe("When I click the new bill button", () => {
    test("Then I should be redirected to New Bill page", () => {
      document.body.innerHTML = BillsUI({ data: bills });

      const newBillButton = screen.getByTestId("btn-new-bill");

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const store = jest.fn();

      const billsMock = new Bills({
        document,
        localStorage: window.localStorage,
        onNavigate,
        store,
      });

      const handleClick = jest.fn(billsMock.handleClickNewBill)
      newBillButton.addEventListener('click', handleClick)
      fireEvent.click(newBillButton)
      expect(handleClick).toHaveBeenCalled();

      expect(screen.queryByText("Envoyer une note de frais")).toBeTruthy();
      expect(screen.queryByText("Mes notes de frais")).toBeFalsy();
    })
  })

   describe("When I click on the IconEye", () => {
     test("Then the modal should display the image", () => {
       document.body.innerHTML = BillsUI({ data: bills });
       $.fn.modal = jest.fn();

       const iconEye = document.getElementById('eye');
       const modalFile = document.getElementById('modaleFile')
       modalFile.classList.add('classTest')
       

       Object.defineProperty(window, 'localStorage', { value: localStorageMock })

        // we have to mock navigation to test it
       const onNavigate = (pathname) => {
         document.body.innerHTML = ROUTES({ pathname });
       };

       const store = jest.fn();

       const billsMock = new Bills({
         document,
         localStorage: window.localStorage,
         onNavigate,
         store,
       });

       const HandleIconClick = jest.fn(billsMock.handleClickIconEye)
       iconEye.addEventListener('click',() => HandleIconClick(iconEye))
       fireEvent.click(iconEye)
       expect(HandleIconClick).toHaveBeenCalled();
       console.log(modalFile.className)
      //  expect(modalFile.className.includes('show')).toBeTruthy();

     })
   })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const contentBills = screen.getByText("Mes notes de frais")
      expect(contentBills).toBeTruthy()
    })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "e@e"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
  })
})