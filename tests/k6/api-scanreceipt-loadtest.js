import http from "k6/http";
import { check, sleep } from "k6";
import encoding from "k6/encoding";

// Load image file during the initiation stage (relative path to script)
const receiptImageBin = open("../../apps/mobile/src/assets/images/RECIBO COMPLETO.jpg", "b");

// Convert to base64 once at init stage to prevent high CPU overhead during request loops
const imageBase64 = encoding.b64encode(receiptImageBin);

// Test configuration
export const options = {
    stages: [
        { duration: "10s", target: 1 }, // Begin with 1 VU
        { duration: "20s", target: 5 }, // Ramp to 5 VUs
        { duration: "10s", target: 0 }, // Ramp down
    ],
    thresholds: {
        http_req_duration: ["p(95)<3000"], // 95% of OCR requests complete within 3 seconds (3000ms)
        http_req_failed: ["rate<0.05"], // Error rate must be less than 5%
    },
};

const BASE_URL = "https://api.diegokarim127.workers.dev";

export default function () {
    const payload = JSON.stringify({
        imageBase64: imageBase64,
    });

    const params = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const res = http.post(`${BASE_URL}/scan-receipt`, payload, params);

    check(res, {
        "status is 200": (r) => r.status === 200,
        "receipt processed successfully": (r) => {
            try {
                return r.json().success === true;
            } catch (e) {
                return false;
            }
        },
    });

    sleep(1);
}
