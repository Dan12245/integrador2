from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import os

# Ruta a la imagen en la raíz del proyecto
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
img_path = os.path.join(base_dir, "RECIBO COMPLETO.jpg")

def test_cra_01():
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
        
        # Interceptar la creación del input file por parte de Expo para que no abra el OS dialog
        driver.execute_script("""
            window.originalClick = window.HTMLInputElement.prototype.click;
            window.HTMLInputElement.prototype.click = function() {
                if (this.type === 'file') {
                    // Hacer visible el input para que Selenium pueda interactuar
                    this.style.display = 'block';
                    this.style.visibility = 'visible';
                    this.style.opacity = '1';
                    this.style.width = '100px';
                    this.style.height = '100px';
                    document.body.appendChild(this);
                } else {
                    window.originalClick.call(this);
                }
            };
        """)

        # 3. Click en scanner receipt (Esto disparará la creación del input file sin abrir el OS dialog)
        driver.find_element(By.CSS_SELECTOR, '[data-testid="scan-receipt-button"]').click()
        time.sleep(1)
        
        # 4. Enviar archivo al input interceptado
        file_input = driver.find_element(By.XPATH, "//input[@type='file']")
        file_input.send_keys(img_path)
        
        print(f"Enviando archivo: {img_path}")
        time.sleep(5) # Esperar a que procese el backend OCR
        
        # 5. Obtener resultados validados (el texto "Scanned Data:" debería aparecer)
        scanned_data_title = driver.find_element(By.XPATH, "//*[contains(text(), 'Scanned Data:')]")
        print("CRA-01: Aprobado. Se obtuvo la info del recibo en pantalla.")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    test_cra_01()
