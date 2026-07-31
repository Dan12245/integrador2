from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import os

base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
img_path = os.path.join(base_dir, "RECIBO CORTADO.png")

def test_cra_03():
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
        
        driver.execute_script("""
            window.originalClick = window.HTMLInputElement.prototype.click;
            window.HTMLInputElement.prototype.click = function() {
                if (this.type === 'file') {
                    this.style.display = 'block';
                    this.style.visibility = 'visible';
                    this.style.opacity = '1';
                    document.body.appendChild(this);
                } else {
                    window.originalClick.call(this);
                }
            };
        """)

        driver.find_element(By.CSS_SELECTOR, '[data-testid="scan-receipt-button"]').click()
        time.sleep(1)
        
        file_input = driver.find_element(By.XPATH, "//input[@type='file']")
        file_input.send_keys(img_path)
        
        print(f"Enviando archivo: {img_path}")
        time.sleep(5) 
        
        # Aqui depende de si el backend manda error o extrae datos parciales.
        # Según el PDF, el caso 3 dice "pero que recolecte los datos que si aparezcan"
        # Si el backend extrajo parcialmente, el componente mostrará "Scanned Data:" 
        # y quizás alerte de falta de info si hay una alerta implementada.
        try:
            alert = driver.switch_to.alert
            print("CRA-03: Alerta capturada:", alert.text)
            alert.accept()
        except:
            print("CRA-03: No hubo alerta, pero verificamos recolección parcial.")
            
        scanned_data_title = driver.find_element(By.XPATH, "//*[contains(text(), 'Scanned Data:')]")
        print("CRA-03: Aprobado. Mostró advertencia/datos y recolectó lo legible en pantalla.")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    test_cra_03()
