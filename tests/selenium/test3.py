# CASO 3: Intento de inicio de sesión con cuenta no registrada
from selenium import webdriver
from selenium.webdriver.common.by import By
import time


def initializeDriver():
    driver = webdriver.Chrome()
    return driver


def login(driver: webdriver.Chrome):
    # Entrar a pagina de login
    time.sleep(1)
    getStartedBtn = driver.find_element(By.CSS_SELECTOR, '[data-testid="get_started"]')
    getStartedBtn.click()
    time.sleep(2)

    # Input de Email
    inputEmail = driver.find_element(
        By.CSS_SELECTOR, '[data-testid="login_email_field"]'
    )
    inputEmail.send_keys("fake@cra.com")
    time.sleep(2)

    # Input de Password
    inputPassword = driver.find_element(
        By.CSS_SELECTOR, '[data-testid="login_password_field"]'
    )
    inputPassword.send_keys("Password123!")

    # Input de Confirmacion
    signInBtn = driver.find_element(
        By.CSS_SELECTOR, '[data-testid="sign_in_confirmation"]'
    )
    signInBtn.click()
    time.sleep(2)


def main():
    driver = initializeDriver()
    driver.get("http://localhost:8081/")
    login(driver)
    time.sleep(2)
    if driver.current_url == "http://localhost:8081/home":
        print("Login exitoso, vuelva pronto")
    else:
        print("Login fallido")

    time.sleep(3)


if __name__ == "__main__":
    main()
