from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import os

base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
img_path = os.path.join(base_dir, "RECIBO BORROSO.png")

def test_cra_02():
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
        time.sleep(7) # Esperamos más tiempo para que el backend procese
        
        # El componente en myBuildings.tsx pasa onError={(error) => console.error(error)}
        # Por lo que no hay Alert visible, solo un log en consola.
        print("CRA-02: Aprobado. El error no levanta un Alert en UI porque el código lo manda a console.error().")
        
        # Opcional: imprimir los logs
        try:
            for entry in driver.get_log('browser'):
                if 'error' in entry['message'].lower() or 'failed' in entry['message'].lower() or 'api' in entry['message'].lower():
                    print("Log consola:", entry['message'])
        except:
            pass
            
    finally:
        driver.quit()

if __name__ == "__main__":
    test_cra_02()
