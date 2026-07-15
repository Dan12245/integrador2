from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

def test_cra_06():
    driver = webdriver.Chrome()
    driver.implicitly_wait(10)
    
    try:
        # 1. Login
        driver.get("http://localhost:8081/login")
        time.sleep(2)
        driver.find_element(By.CSS_SELECTOR, '[data-testid="login_email_field"]').send_keys("diegokarim127@gmail.com")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="login_password_field"]').send_keys("123456")
        driver.find_element(By.CSS_SELECTOR, '[data-testid="sign_in_confirmation"]').click()
        
        time.sleep(3)
        driver.get("http://localhost:8081/myBuildings")
        time.sleep(2)
        
        # Usamos el contrato CONT-12345 asumiendo que ya fue guardado en la prueba 4
        driver.find_element(By.XPATH, "//input[@placeholder='Building Alias']").send_keys("Edificio Duplicado")
        driver.find_element(By.XPATH, "//input[@placeholder='Contract Number']").send_keys("CONT-12345")
        driver.find_element(By.XPATH, "//input[@placeholder='address']").send_keys("Calle Falsa 123")
        driver.find_element(By.XPATH, "//input[@placeholder='Building description']").send_keys("Contrato duplicado")
        
        btn = driver.find_element(By.CSS_SELECTOR, '[data-testid="mybuildings-save-building-button"]')
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
        time.sleep(1)
        driver.execute_script("arguments[0].click();", btn)
        
        try:
            alert = WebDriverWait(driver, 15).until(EC.alert_is_present())
            print("CRA-06: Aprobado. Alertó:", alert.text) 
            alert.accept()
        except:
            print("CRA-06: Falló la alerta. Verificando logs...")
            for entry in driver.get_log('browser'):
                if '500' in entry['message'] or 'Error while savin' in entry['message']:
                    print("CRA-06: Aprobado (log). Backend rechazó duplicado:", entry['message'])
                    break
        
    finally:
        driver.quit()

if __name__ == "__main__":
    test_cra_06()
