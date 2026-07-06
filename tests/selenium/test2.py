#caso de prueba numero 2

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
import time

#1. Inicializar webdriver
def inicializarDriver():
   # driver = webdriver.Chrome()
   driver = webdriver.Firefox()
   # driver = webdriver.ChromiumEdge()

   return driver

def login(driver):
   time.sleep(2)
   btnGetStarted = driver.find_element(By.CSS_SELECTOR, '[data-testid="get_started"]')
   btnGetStarted.click()
   time.sleep(1)

   inputUsername = driver.find_element(By.CSS_SELECTOR, '[data-testid="login_email_field"]')
   inputUsername.send_keys("fake@cra.com")

   time.sleep(2)
   inputPassword = driver.find_element(By.CSS_SELECTOR, '[data-testid="login_password_field"]')
   inputPassword.send_keys("Password123!")


   time.sleep(2)                                      
   
   btnLogin = driver.find_element(By.CSS_SELECTOR, '[data-testid="sign_in_confirmation"]')
   btnLogin.click()

   time.sleep(2)  

def main():
   driver = inicializarDriver()
   driver.get("http://localhost:8081/")
   login(driver)
   time.sleep(2)
   if driver.current_url == "http://localhost:8081/home":
      print("Login exitoso, vuelva pronto")
   else:
      print("Login fallido")
   
   time.sleep(3)

if __name__ == '__main__': 
   main()

 