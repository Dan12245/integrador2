import http from "k6/http";
import { check, sleep } from "k6";

// Test configuration: Ramp up to 50 virtual users (VUs) over 30 seconds
export const options = {
    stages: [
        { duration: "10s", target: 20 }, // Ramp up to 20 users
        { duration: "20s", target: 50 }, // Stay at 50 users
        { duration: "10s", target: 0 }, // Ramp down
    ],
    thresholds: {
        http_req_duration: ["p(95)<500"], // 95% of requests must complete below 500ms
        http_req_failed: ["rate<0.01"], // Error rate must be less than 1%
    },
};

// const BASE_URL = "http://localhost:8787"; // Local Hono server
const BASE_URL = "https://api.diegokarim127.workers.dev"; // API

export default function () {
    // Test root API endpoint
    const res = http.get(`${BASE_URL}/`);

    check(res, {
        "status is 200": (r) => r.status === 200,
        "api status success": (r) => r.json().status === "success",
    });

    sleep(1);
}
