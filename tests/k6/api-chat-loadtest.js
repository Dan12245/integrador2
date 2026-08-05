import http from "k6/http";
import { check, sleep } from "k6";

// Test configuration
export const options = {
    stages: [
        { duration: "10s", target: 2 }, // Begin with 1 VU
        { duration: "20s", target: 10 }, // Ramp to 5 VUs
        { duration: "10s", target: 0 }, // Ramp down
    ],
    thresholds: {
        http_req_duration: ["p(95)<3000"], // AI streaming response target (under 3 seconds)
        http_req_failed: ["rate<0.05"], // Error rate must be under 5%
    },
};

const BASE_URL = "https://api.diegokarim127.workers.dev";

export default function () {
    const payload = JSON.stringify({
        messages: [
            {
                role: "user",
                content: "How can I reduce my water consumption?",
            },
        ],
    });

    const params = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const res = http.post(`${BASE_URL}/chat`, payload, params);

    check(res, {
        "status is 200": (r) => r.status === 200,
        "chat response has content": (r) => r.body && r.body.length > 0,
    });

    sleep(1);
}
