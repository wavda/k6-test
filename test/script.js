import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export let options = {
  stages: [
    { duration: '5s', target: 5 }, // simulate ramp-up of traffic from 0 to 100 users over 1 minute
    { duration: '5s', target: 5 }, // stay at 100 users for 3 minutes
    { duration: '2s', target: 0 }, // ramp-down to 0 users over 1 minute
  ],
  thresholds: {
    http_req_duration: ['p(99)<500'], // 99% of requests must complete within 500ms
    http_req_failed: ['rate<0.01']
  },gi
};

export default function () {
  let res = http.get('https://test.k6.io');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}

export function handleSummary(data) {
  return {
    "report/summary.json": JSON.stringify(data),
    "report/result.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true })
  };
}
